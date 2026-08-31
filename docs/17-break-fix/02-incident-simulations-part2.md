# 🚑 Инцидент-симуляции: Партия №2 (6 сценариев)

> Продолжение [первой партии](01-incident-simulations.md). Сценарии по новым темам handbook'а: автоскейлинг, эксплуатация кластера, DR/бэкапы БД, supply chain, производительность Linux.
> Формат тот же: симптомы → диагностируйте сами → подсказки → решение → «как предотвратить?».

## 📋 Правила игры

1. Засекайте время. MTTR — ваша метрика.
2. Никакого гугла до раскрытия подсказок.
3. После починки всегда отвечайте: **как это предотвратить?**

---

## 🔥 Сценарий 11: HPA показывает `<unknown>` и не скейлит

**Симптом:** вечерний пик трафика, latency растёт, но `kubectl get hpa` — колонка TARGETS: `unknown/70%`, реплик по-прежнему 3.

```bash
# Воспроизведение в kind
kind create cluster --name bf11
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
# НЕ патчим --kubelet-insecure-tls — имитируем сломанный metrics-server

kubectl create deployment shop-api --image=registry.k8s.io/hpa-example --replicas=3
kubectl set resources deploy/shop-api --requests=cpu=200m
kubectl autoscale deploy/shop-api --min=3 --max=10 --cpu-percent=70
sleep 30 && kubectl get hpa
```

⏱️ **SLA: 10 минут**

<details><summary>💡 Подсказка 1</summary>

HPA берёт метрики через AP-сервис `metrics.k8s.io`. Кто его обслуживает?
</details>

<details><summary>💡 Подсказка 2</summary>

```bash
kubectl describe hpa shop-api | tail -8   # события скажут сами
kubectl get apiservice v1beta1.metrics.k8s.io -o jsonpath='{.status.conditions}'
```
</details>

<details><summary>✅ Решение</summary>

```bash
kubectl -n kube-system logs deploy/metrics-server | tail    # x509: certificate signed by unknown authority
# В kind/self-hosted kubelet использует самоподписанные сертификаты:
kubectl patch deployment metrics-server -n kube-system --type=json \
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
kubectl wait --for=condition=Available deploy/metrics-server -n kube-system --timeout=120s
kubectl top nodes        # метрики появились
kubectl get hpa          # TARGETS: <число>/70%

**Как предотвратить:** мониторить сам AP-сервис (`apiservices_v1beta1_metric_k8s_io_available == 0` → алерт) и включать metrics-server в обязательный bootstrap-набор кластера.
```
</details>

---

## 🔥 Сценарий 12: drain узла завис перед апгрейдом

**Симптом:** окно обслуживания, вы выполняете `kubectl drain node-w3`, команда висит 20 минут с сообщением об эвикции одного пода. Апгрейд стоит.

```bash
# Имитация: PDB запрещает эвикцию
kubectl run web --image=nginx --replicas=2 --port=80
kubectl expose pod web --name=web-svc --port=80
cat <<EOF | kubectl apply -f -
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: { name: web-pdb }
spec:
  minAvailable: 2            # ← ошибка: требует ОБА пода живыми всегда
  selector: { matchLabels: { run: web } }
EOF
kubectl cordon $(kubectl get nodes -o name | tail -1)
kubectl drain $(kubectl get nodes -o name | tail -1) --ignore-daemonsets --timeout=15s || true
```

⏱️ **SLA: 10 минут**

<details><summary>💡 Подсказка 1</summary>

drain уважает PDB — это защита от добровольных нарушений отказоустойчивости, а не баг. Что говорит `kubectl describe pdb`?
</details>

<details><summary>💡 Подсказка 2</summary>

`minAvailable: 2` при двух репликах означает «никогда нельзя выселять ни один». Какое значение корректно для rolling-обслуживания?
</details>

<details><summary>✅ Решение</summary>

```bash
kubectl describe pdb web-pdb | grep -E 'Allowed|Disruptions'
# Allowed disruptions: 0 — вот причина блокировки

# Корректный PDB: разрешаем потерять одну реплику
kubectl patch pdb web-pdb --type merge -p '{"spec":{"minAvailable":1}}'
kubectl drain $(kubectl get nodes -o name | tail -1) --ignore-daemonsets --delete-emptydir-data
kubectl uncordon $(kubectl get nodes -o name | tail -1)

**Как предотвратить:** PDB обязателен на каждом сервисе, НО проверять его осмысленность: `minAvailable: N` при N==репликам = вечная блокировка drain. Правило код-ревью манифестов + джоба `kubectl get pdb -A | awk '$4=="0"'` → алерт «PDB без допустимых нарушений».
```
</details>

---

## 🔥 Сценарий 13: WAL-архив пуст — PITR невозможен

**Симптом:** разработчик уронил таблицу в PostgreSQL (`DROP TABLE orders`) в 14:30. Вы готовы восстановить из базового бэкапа утра + WAL... и обнаруживаете каталог WAL-архива пустым уже две недели.

```bash
# Диагностика на живом кластере (не ломая прод!)
psql -c "SELECT archived_count, failed_count,
                last_archived_time, last_archived_wal,
                last_failed_time, last_failed_wal
         FROM pg_stat_archiver;"
ls -la /backup/wal/ 2>/dev/null || echo "каталог пуст!"
grep archive_command /var/lib/postgresql/*/main/postgresql.conf
```

⏱️ **SLA: 20 минут (на диагностику; само восстановление — отдельное учение)**

<details><summary>💡 Подсказка 1</summary>

`failed_count` растёт? Посмотрите `last_failed_wal` — сегмент, который не смог заархивироваться. Что говорит сам postgresql.log про archive_command?
</details>

<details><summary>💡 Подсказка 2</summary>

Частые причины: переполненный бакет/диск приёмника, неверные права, сеть. Команда `archive_command` выполняется молча — её фейл виден только в pg_stat_archiver и логе.
</details>

<details><summary>✅ Решение</summary>

```sql
-- Типовой диагноз: last_failed_wal стоит на месте, failed_count >> archived_count
SELECT pg_wal_replay_pause();  -- НЕ ДЕЛАТЬ ЭТОГО НА ПРОДЕ БЕЗ ОСОЗНАННОСТИ — просто пример инструментов
```

Реальные шаги:

```bash
# 1. Найти причину падения archive_command (пример: диск приёмника полон)
df -h /backup && du -sh /backup/*
# 2. Починить приёмник / расширить квоту
# 3. Убедиться, что накопившиеся WAL доехали:
psql -c "SELECT pg_switch_wal();"   # форс-свитч
watch 'psql -c "SELECT failed_count FROM pg_stat_architer;"'  # опечатка намеренно: archiver!
# 4. После починки — немедленный свежий base backup (старый уже бесполезен без WAL)
wal-g backup-push /var/lib/postgresql/16/main
```

**Как предотвратить:** алерт на SQL-запрос `failed_count > 0 или now()-last_archived_time > interval '10 minutes'`; ежесуточный тест `wal-g wal-fetch` случайного сегмента; restore-тест раз в месяц.
</details>

---

## 🔥 Сценарий 14: Kyverno заблокировал деплой релиза

**Симптом:** пятница, хотфикс. Пайплайн зелёный, но поды не создаются: `kubectl get events` — `pods "api-7d9f" is forbidden: image signature verification failed`.

```bash
# Воспроизведение: политика verifyImages в Enforce, образ подписан старым identity
kubectl create ns prod
cat <<EOF | kubectl apply -f -
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata: { name: verify-sign }
spec:
  validationFailureAction: Enforce
  rules:
    - name: check
      match: { any: [{ resources: { kinds: [Pod], namespaces: ["prod"] } }] }
      verifyImages:
        - imageReferences: ["*"]
          attestors:
            - entries:
                - keys:
                    publicKeys: |-
                      -----BEGIN PUBLIC KEY-----
                      MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEdemo-key-not-real
                      -----END PUBLIC KEY-----
EOF
kubectl -n prod run api --image=nginx:latest     # ← упадёт с запретом
kubectl -n prod get events --sort-by=.lastTimestamp | tail -3
```

⏱️ **SLA: 15 минут**

<details><summary>💡 Подсказка 1</summary>

Это работает КАК ЗАДУМАНО: admission отклонил неподписанный образ. Вопрос не «как отключить политику», а «почему легитимный образ не проходит».
</details>

<details><summary>💡 Подсказка 2</summary>

Кто подписывает образы в CI и совпадает ли identity/ключ подписи с теми, что ждёт политика? Сравните `cosign verify ...` локально с конфигом attestors.
</details>

<details><summary>✅ Решение</summary>

```bash
# 1. Локальная проверка покажет реальную причину:
cosign verify registry.company.local/api:v1.7.3 \
  --key cosign.pub || echo "подпись не сходится"

# 2а. Если CI переехал на новый identity — обновить политику (правильно):
kubectl patch clusterpolicy verify-sign --type merge -p '{"spec":{"rules":[{"name":"check","match":{"any":[{"resources":{"kinds":["Pod"],"namespaces":["prod"]}}}],"verifyImages":[{"imageReferences":["registry.company.local/*"],"attestors":[{"entries":[{"keyless":{"issuer":"https://gitlab.new-domain.local","subject":"https://gitlab.new-domain.local/project/*"}}]}]}]}]}}'

# 2б. Если горит прод и нужно прямо сейчас — break-glass по процедуре:
kubectl annotate clusterpolicy verify-sign kyverno.io/break-glass="INC-2026-0825" \
  && kubectl scale ... # осознанное исключение с алертом в канал безопасности

**Как предотвратить:** смену signing-identity проводить синхронно с политикой в одном MR; break-glass аннотация должна алертить в #security автоматически; тестовый namespace со включённой политикой в staging — ловим за день до прода.
```
</details>

---

## 🔥 Сценарий 15: «Сервер тормозит» — load 40 при 8 ядрах

**Симптом:** алерт LoadAverage > 20. Заходите по SSH: `uptime` — load 40, ядер 8. Но `top` показывает CPU ~5% idle 85%. Пользователи жалуются на медленные ответы API, лежащего на этом хосте.

```bash
# Воспроизводим IO-шторм безопасно (в VM/контейнере!)
docker run --rm -d --name io-storm debian bash -c '
  dd if=/dev/zero of=/tmp/big bs=1M count=20000 oflag=direct status=progress'
# На хосте (или в той же VM):
uptime && nproc
top -bn1 | head -5                       # %wa высокий?
iostat -xz 1 3                           # await и util
ps -eo state,pid,cmd | awk '$1=="D"'     # процессы в непрерываемом сне
```

⏱️ **SLA: 15 минут**

<details><summary>💡 Подсказка 1</summary>

Высокий load при свободном CPU = очередь не на процессоре. Колонка `%wa` в top и D-стат процессов укажут направление.
</details>

<details><summary>💡 Подсказка 2</summary>

`iostat -xz`: смотрите `await` (мс ожидания запроса) и `%util`. Затем найдите виновника: `iotop -oPa`.
</details>

<details><summary>✅ Решение</summary>

```bash
iostat -xz 1
# Device  await  aqu-sz  %util
# vda     850ms  12.5    99.9    ← диск захлёбнулся

pidstat -d 1 3 | sort -k5 -rn | head      # кто пишет/читает больше всех
# Виновник: dd (или ваш реальный процесс — бэкап, компиляция, логи)

# Быстрая помощь: понизить приоритет IO процесса вместо убийства
IONICE=$(pgrep -f 'dd if=/dev/zero')
ionice -c3 -p $IONICE                     # только idle-time дискового времени

**Как предотвратить:** алерты на disk await > 100ms и load > 2×ядер; тяжёлые пакетные задачи — с ionice -c3 и nice; sar-история для ответа «что было вчера в 03:00».
```
</details>

---

## 🔥 Сценарий 16: etcd-снапшот есть, а восстановиться не можем

**Симптом:** инцидент с control plane. У вас есть `/backup/etcd-snapshot.db`. Вы запускаете `etcdctl snapshot restore` на первом CP-узле — команда падает: `expected member ID but got ...` / кластер не собирается. Времени мало, apiserver лежит.

```bash
# Безопасная тренировка восстановления — на одноразовом контейнере
docker run --rm -it --name etcd-lab gcr.io/etcd-development/etcd:v3.5.14 sh
# внутри:
etcdctl snapshot save /tmp/snap.db --endpoints= 2>/dev/null || (
  etcd --data-dir=/tmp/orig & sleep 2
  ETCDCTL_API=3 etcdctl --endpoints=127.0.0.1:2379 put foo bar
  ETCDCTL_API=3 etcdctl --endpoints=127.0.0.1:2379 snapshot save /tmp/snap.db
  kill %1 )
etcdctl snapshot status /tmp/snap.db --write-table=table
# Теперь пробуем ВОССТАНОВИТЬ правильно (см. решение)
```

⏱️ **SLA: 20 минут**

<details><summary>💡 Подсказка 1</summary>

Restore создаёт НОВЫЙ etcd-кластер: нужны правильные --data-dir, --name и initial-cluster параметры, соответствующие узлу, на котором восстанавливаете.
</details>

<details><summary>💡 Подсказка 2</summary>

Перед restore: остановить etcd (в kubeadm — убрать манифест статического пода), сохранить старый data-dir, восстановить в чистый каталог, вернуть манифест.
</details>

<details><summary>✅ Решение</summary>

```bash
# Полная последовательность для kubeadm single-CP:
mv /etc/kubernetes/manifests/etcd.yaml /tmp/
mv /var/lib/etcd /var/lib/etcd.broken-$(date +%s)

ETCDCTL_API=3 etcdctl snapshot restore /backup/etcd-snapshot.db \
  --data-dir=/var/lib/etcd-restored \
  --name=$(hostname) \
  --initial-cluster=$(hostname)=https://$(hostname -i | awk '{print $1}'):2380 \
  --initial-advertise-peer-urls=https://$(hostname -i | awk '{print $1}'):2380

mv /var/lib/etcd-restored /var/lib/etcd
mv /tmp/etcd.yaml /etc/kubernetes/manifests/
watch crictl pods | grep etcd              # static pod перезапустится сам
kubectl get cs                              # apiserver отвечает

**Как предотвратить:** ежеквартальное учение по restore НА СТЕНДЕ по актуальному runbook; снапшоты шифруются и вывозятся с узла; в runbook зафиксированы точные команды с именами ваших узлов.
```
</details>

---

## 🏁 Финальная самопроверка партии

| # | Навык | Связанная тема |
| :--- | :--- | :--- |
| 11 | Диагностика цепочки метрик HPA | [04.8 Автоскейлинг](../04-kubernetes/08-k8s-autoscaling.md) |
| 12 | PDB и обслуживание узлов | [04.9 Эксплуатация](../04-kubernetes/09-k8s-cluster-operations.md) |
| 13 | WAL-архив и PITR | [13.2 Бэкапы БД](../13-disaster-recovery-and-tools/02-database-backups-and-dr-plan.md) |
| 14 | Подписи образов и admission | [10.4 Supply Chain](../10-security-and-cloud/04-supply-chain-security.md) |
| 15 | IO-диагностика Linux | [01.5 Производительность](../01-linux-and-networking/05-linux-performance-diagnostics.md) |
| 16 | Восстановление etcd | [04.9 Эксплуатация](../04-kubernetes/09-k8s-cluster-operations.md) |
