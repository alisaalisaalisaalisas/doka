# 🚑 Инцидент-симуляции: сломай и почини (10 сценариев)

> Формат дежурства: даны **симптомы**, как их видит пользователь/мониторинг. Сначала диагностируйте САМОСТОЯТЕЛЬНО, потом раскройте подсказки и решение. Цель — уложиться в SLA каждого сценария.
> Все сценарии выполняются на kind-кластере из Lab 03.

## 📋 Правила игры

1. Засекайте время. MTTR — ваша метрика.
2. Никакого гугла до раскрытия подсказок — только `kubectl`, логи, голова.
3. После починки всегда отвечайте: **как это предотвратить?**

---

## 🔥 Сценарий 1: Приложение падает сразу после старта

**Симптом:** после деплоя все поды в статусе, который начинается с "Crash..." Пользователи видят 503.

```bash
kubectl -n shop apply -f - <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata: { name: broken-1, namespace: shop }
spec:
  replicas: 1
  selector: { matchLabels: { app: broken-1 } }
  template:
    metadata: { labels: { app: broken-1 } }
    spec:
      containers:
        - name: web
          image: hashicorp/http-echo:1.0
          args: ["-listen=:5678", "-text=hi"]
          env:
            - { name: REQUIRED_DB_URL }     # переменная без value!
EOF
```

⏱️ **SLA: 10 минут**

<details><summary>💡 Подсказка 1</summary>

`kubectl get pods -n shop` → статус `CrashLoopBackOff`. Что говорит `kubectl describe`?
</details>

<details><summary>💡 Подсказка 2</summary>

События покажут `Back-off restarting failed container`. Логи предыдущей инкарнации: `kubectl logs --previous`.
</details>

<details><summary>✅ Решение</summary>

```bash
POD=$(kubectl -n shop get po -l app=broken-1 -o name | head -1)
kubectl -n shop logs $POD --previous | tail -5
# http-echo упадёт из-за отсутствующей переменной окружения (env без value = не установлен)

# Чиним: задаём значение
kubectl -n shop set env deploy/broken-1 REQUIRED_DB_URL=postgres://pg:5432/shop
kubectl -n shop rollout status deploy/broken-1
```
**Профилактика:** schema-валидация манифестов в CI (`kubeconform`), обязательные переменные проверять startupProbe'ом приложения с понятным сообщением об ошибке.
</details>

---

## 🔥 Сценарий 2: Под убивается по памяти

**Симптом:** алерт "container killed". Приложение медленное перед смертью.

```bash
kubectl -n shop apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata: { name: memhog, namespace: shop }
spec:
  restartPolicy: Never
  containers:
    - name: hog
      image: polinux/stress
      resources:
        limits: { memory: 100Mi }
      command: ["stress"]
      args: ["--vm","1","--vm-bytes","250M","--vm-hang","0"]
EOF
```

⏱️ **SLA: 10 минут**

<details><summary>✅ Решение</summary>

```bash
kubectl -n shop get pod memhog
# STATUS=Reason: OOMKilled, Exit Code: 137

kubectl -n shop describe pod memhog | grep -A4 "Last State"
# Last State: Terminated, Reason: OOMKilled — ядро убило за превышение memory.max

# Диагноз: лимит занижен относительно реальной потребности (или утечка в коде).
# Быстрый фикс: увеличить limit; правильный: профилировать память приложения.
kubectl delete pod memhog -n shop
```
**Профилактика:** VPA recommendation режим для подбора requests; алерт на `container_memory_working_set_bytes / limit > 85%`; нагрузочное тестирование перед релизом.
</details>

---

## 🔥 Сценарий 3: Образ не тянется

**Симптом:** новый деплой завис; поды крутятся в статусе с "ImagePull...".

```bash
kubectl -n shop apply -f - <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata: { name: broken-3, namespace: shop }
spec:
  replicas: 1
  selector: { matchLabels: { app: broken-3 } }
  template:
    metadata: { labels: { app: broken-3 } }
    spec:
      containers:
        - name: web
          image: myregistry.internal/private-app:v9.9.9   # такого нет
EOF
```

⏱️ **SLA: 10 минут**

<details><summary>✅ Решение</summary>

```bash
kubectl -n shop describe deploy/broken-3 | tail -8
# Events: Failed to pull image ... not found / unauthorized / manifest unknown

# Три класса причин:
# 1) Опечатка в имени/теге       -> проверить image строку
# 2) Приватный registry без секрета -> создать docker-registry secret + imagePullSecrets
# 3) Registry недоступен         -> curl https://myregistry.internal/v2/
kubectl -n shop create secret docker-registry regcred \
  --docker-server=myregistry.internal --docker-username=u --docker-password=p
kubectl -n shop patch deploy/broken-3 --type=json \
  -p='[{"op":"add","path":"/spec/template/spec/imagePullSecrets","value":[{"name":"regcred"}]}]'
```
**Профилактика:** digest-пины образов в проде, проверка существования тега пайплайном до деплоя.
</details>

---

## 🔥 Сценарий 4: Service не видит поды (503)

**Симптом:** сервис отвечает connection refused / 503, хотя поды Running.

```bash
kubectl -n shop apply -f - <<'EOF'
apiVersion: v1
kind: Service
metadata: { name: broken-svc, namespace: shop }
spec:
  selector: { app: WRONG-LABEL }   # селектор не совпадает!
  ports: [{ port: 80, targetPort: 5678 }]
---
apiVersion: apps/v1
kind: Deployment
metadata: { name: ok-deploy, namespace: shop }
spec:
  replicas: 2
  selector: { matchLabels: { app: ok-deploy } }
  template:
    metadata: { labels: { app: ok-deploy } }
    spec:
      containers:
        - name: web
          image: hashicorp/http-echo:1.0
          args: ["-text=ok", "-listen=:5678"]
EOF
```

⏱️ **SLA: 10 минут**

<details><summary>✅ Решение</summary>

```bash
kubectl -n shop get endpoints broken-svc
# ENDPOINTS: <none>  ← вот оно! selector не матчится ни с одним подом

kubectl -n shop get pods --show-labels | grep ok-deploy
kubectl -n shop patch svc broken-svc -p '{"spec":{"selector":{"app":"ok-deploy"}}}'
kubectl -n shop get endpoints broken-svc    # появились IP ✅
```
**Профилактика:** шаблонизировать label'ы Helm'ом (единый источник), smoke-тест «endpoints != none» в пайплайне после деплоя.
</details>

---

## 🔥 Сценарий 5: DNS внутри кластера сломался

**Симптом:** приложение не может достучаться до БД по имени сервиса; ошибки `no such host`.

```bash
# Симулируем деградацию CoreDNS: масштабируем до нуля реплик
kubectl -n kube-system scale deploy coredns --replicas=0

# Тест из пода:
kubectl run dnstest --rm -it --image=busybox:1.36 --restart=Never -- \
  nslookup kubernetes.default.svc.cluster.local
```

⏱️ **SLA: 15 минут** (это P1 — ломает ВСЁ)

<details><summary>✅ Решение</summary>

```bash
kubectl -n kube-system get deploy coredns           # READY 0/2 — вот причина
kubectl -n kube-system logs deploy/coredns --previous | tail   # почему упал? OOM? конфиг?
kubectl -n kube-system scale deploy coredns --replicas=2
kubectl run dnstest --rm -it --image=busybox:1.36 --restart=Never -- \
  nslookup kubernetes.default.svc.cluster.local    # Address found ✅
```
**Профилактика:** PDB для coredns, HPA на CoreDNS, NodeLocal DNSCache, мониторинг `coredns_dns_responses_total` и latency.
</details>

---

## 🔥 Сценарий 6: Диск ноды заполнился логами

**Симптом:** алерты DiskPressure, поды начали эвиктиться.

```bash
# Симуляция: создадим большой файл в контейнере kind-ноды
docker exec lab3-control-plane sh -c 'fallocate -l 15G /tmp/big.log || dd if=/dev/zero of=/tmp/big.log bs=1G count=12'
kubectl describe node lab3-control-plane | grep -A6 Conditions | head -10
```

⏱️ **SLA: 20 минут**

<details><summary>✅ Решение</summary>

```bash
kubectl describe node lab3-control-plane | grep -iE "DiskPressure|pressure"
df -h   # на ноде: что заняло место?
docker exec lab3-control-plane sh -c 'du -sh /var/log/* /var/lib/docker/containers/*/ 2>/dev/null | sort -h | tail'

docker exec lab3-control-plane rm /tmp/big.log
# Профилактическая чистка логов контейнеров:
docker exec lab3-control-plane sh -c 'truncate -s 0 /var/lib/docker/containers/*/*-json.log'
```
**Профилактика:** logrotate + max-size в logging driver, отдельные разделы для /var/lib/containerd и /var/log, алерт на 80% заполнения, evictionHard настройки kubelet.
</details>

---

## 🔥 Сценарий 7: Истёкший TLS-сертификат Ingress

**Симптом:** пользователи видят `ERR_CERT_DATE_INVALID`. Мониторинг молчал.

```bash
# Симулируем: секрет с просроченным сертом
openssl req -x509 -nodes -days -30 -newkey rsa:2048 \   # -days в прошлом!
  -keyout old.key -out old.crt -subj "/CN=shop.local" 2>/dev/null
kubectl -n shop create secret tls shop-tls-old --cert=old.crt --key=old.key
echo "секрет shop-tls-old создан — представьте, что ingress использует его"
```

⏱️ **SLA: 15 минут**

<details><summary>✅ Решение</summary>

```bash
# Диагностика снаружи:
echo | openssl s_client -connect shop.local:443 2>/dev/null | openssl x509 -noout -dates
# notAfter=... (в прошлом!)

# Быстрое восстановление: перевыпуск через cert-manager или вручную новый серт
kubectl -n shop create secret tls shop-tls-new --cert=new.crt --key=new.key
kubectl -n shop patch ing shop -p '{"spec":{"tls":[{"hosts":["shop.local"],"secretName":"shop-tls-new"}]}}'
curl -k https://shop.local/    # работает
```
**Профилактика:** cert-manager с автообновлением (renewBefore 30d), черный монитор UptimeRobot/Pingdom, алерт `cert_manager_certificate_expiration_timestamp_seconds < 14*24*3600`.
</details>

---

## 🔥 Сценарий 8: Consumer lag растёт лавинообразно (Kafka)

**Теоретическая симуляция** (без кластера Kafka — тренируем диагноз по метрикам).

**Дано:** Grafana показывает `kafka_consumergroup_lag`: 0 → 500k за 20 мин. Продюсеры в норме (rate стабильный). Консьюмеры живы (поды Running), но throughput ~0.

⏱️ **SLA: 20 минут**

<details><summary>💡 Ход мысли</summary>

Lag растёт + консьюмеры живы + input стабилен ⇒ консьюмеры **перестали обрабатывать**, а не упали. Классические причины:
1. Rebalance storm — консьюмер постоянно переподключается (медленная обработка > max.poll.interval).
2. Deadlock/блокировка на downstream (БД не отвечает → обработка висит).
3. Отравленное сообщение (poison pill) — бесконечный retry одной партиции.
</details>

<details><summary>✅ Решение</summary>

```bash
kafka-consumer-groups.sh --describe --group orders
# CURRENT-OFFSET vs LOG-END-OFFSET по партициям: lag на ВСЕХ или на одной?
# На всех = системная проблема (БД/downstream). На одной = poison pill.

# Rebalance storm видно в логах консьюмеров:
kubectl logs -l app=orders-consumer | grep -c "rebalance\|Rejoined"
# Если сотни за час: настроить static membership (group.instance.id) +
# max.poll.interval.ms > максимального времени обработки батча.

# Poison pill: пропустить сообщение (offset reset на +1) ИЗБИРАТЕЛЬНО и сохранить его в dead-letter topic.
```
**Профилактика:** DLQ политика, метрика rebalance count с алертом, таймауты обработки < poll interval, идемпотентность обработчиков.
</details>

---

## 🔥 Сценарий 9: Исчерпаны коннекты PostgreSQL

**Симптом:** приложение пишет `FATAL: sorry, too many clients already`. Часть запросов висит.

⏱️ **SLA: 15 минут**

<details><summary>✅ Решение</summary>

```sql
-- Кто занимает соединения прямо сейчас:
SELECT state, count(*), max(now()-state_change) AS oldest
FROM pg_stat_activity GROUP BY state ORDER BY 2 DESC;
-- Типичная картина: сотни 'idle in transaction' => утечка транзакций в коде!

-- Убить висящих старше часа:
SELECT pg_terminate_backend(pid) FROM pg_stat_activity
WHERE state='idle in transaction' AND now()-state_change > interval '1 hour';

-- Поднять лимит временно (нужен рестарт):
ALTER SYSTEM SET max_connections = 300; SELECT pg_reload_conf();
```

**Правильная стратегия:** pgbouncer transaction pooling между приложением и БД (см. [PostgreSQL HA](../11-data-and-storage/04-postgresql-ha-and-patroni.md)).
**Профилактика:** алерт `sum(pg_stat_activity_count)/max_connections > 0.8`, таймауты `idle_in_transaction_session_timeout=15min`.
</details>

---

## 🔥 Сценарий 10: Алерты молчат при аварии

**Симптом:** кластер лежал 40 минут, НИ ОДНОГО сообщения от Prometheus. Как так?

Проверьте цепочку доставки:

```bash
# 1. Жив ли сам Prometheus?
kubectl -n monitoring get pods | grep prometheus

# 2. Правила вообще загружены? (частая ошибка — неверный label release)
kubectl -n monitoring get prometheusrules -o yaml | grep -B2 -A8 alertname | head -30
curl -s localhost:9090/api/v1/rules | jq '.data.groups[].rules[] | select(.health!="ok")'

# 3. Alertmanager получает?
curl -s localhost:9093/api/v1/status | jq '.data.config.original' | head -40

# 4. Не в maintenance ли silence всё глушит?
amtool silence query
```

<details><summary>✅ Разбор типовых причин</summary>

| Причина | Симптом | Фикс |
| :--- | :--- | :--- |
| PrometheusRule без лейбла `release: kps` | правило не загружено оператором | добавить labelSelector-matching label |
| `for: 24h` в правиле | алерт ещё "pending" | адекватный for (1-5m) |
| Забытый Silence | AM показывает активный silence | `amtool silence expire <id>` |
| Невалидный bot_token/chat_id | в логах AM `telegram api error` | проверить креды, send test alert |
| Watchdog-алерт отсутствует | вы вообще не знаете, жив ли мониторинг | **обязательно**: always-firing watchdog + внешний deadman switch |
</details>

**Золотое правило:** настройте **watchdog** — алерт, который горит ВСЕГДА и отправляется во внешнюю систему (healthchecks.io/cron-monitoring). Внешняя система орет, когда сигнал ПРОПАЛ. Это защита от «monitoring is down while everything burns».

---

## 🏁 Итоговая таблица навыков

| # | Сценарий | Прокачивает | Целевое MTTR |
| :--- | :--- | :--- | :--- |
| 1 | CrashLoop | logs/describe/events | 10 мин |
| 2 | OOMKilled | ресурсы, exit codes | 10 мин |
| 3 | ImagePull | registry, secrets | 10 мин |
| 4 | Service 503 | selectors, endpoints | 10 мин |
| 5 | DNS down | CoreDNS, P1 мышление | 15 мин |
| 6 | Disk full | node pressure, cleanup | 20 мин |
| 7 | TLS expired | cert-manager, openssl | 15 мин |
| 8 | Kafka lag | распределенные системы | 20 мин |
| 9 | PG connections | БД диагностика | 15 мин |
| 10 | Silent alerts | observability самой обс | 15 мин |

!!! success "Выпускной экзамен"
    Попросите друга/коллегу случайно «сломать» ваш стенд (по любому сценарию выше). Почините без подсказок за целевой MTTR. Смогли? Вы готовы к реальному дежурству. 🎓
