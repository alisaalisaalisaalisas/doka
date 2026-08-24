# 🏁 20.S2 Senior Stack, Часть 2 — сводная проверка

> Кросс-тематический материал по подтемам Части 2: [20.6 RabbitMQ/NATS](06-message-brokers.md) · [20.7 CoreDNS/MetalLB/WireGuard/HAProxy/Envoy](07-network-edge.md) · [20.8 MinIO/etcd/Longhorn](08-storage-s3-etcd-longhorn.md) · [20.9 Pulumi/Packer/Crossplane](09-iac-nextgen.md) · [20.10 CLI-арсенал](10-cli-arsenal.md) · [20.11 Jsonnet/CUE/Sentry](11-config-languages-and-sentry.md). Часть 1 — [здесь](00-senior-stack-summary.md).

**Оглавление:** [3.1 Сводные вопросы](#31--40-сводных-вопросов) · [3.2 Сводные задачи](#32--10-сводных-практических-задач) · [Что изучить дальше](#-что-изучить-дальше)

---

## 3.1 — 40 сводных вопросов

### Да/нет + почему (1-10)

**1. Можно ли заменить Kafka на NATS JetStream везде, где есть Kafka?**

<details><summary>Ответ</summary>
Нет: Kafka силён в долгом хранении логов с партиционированной конкуренцией потребления и зрелой экосистемой (Connect, Streams). JetStream хорош для лёгкой персистентности, но партиционирование и throughput-профиль другие. Замена — архитектурное решение, а не drop-in.
</details>

**2. Верно ли, что WireGuard-пир с AllowedIPs = 0.0.0.0/0 превращает узел в полный VPN-выход (exit node)?**

<details><summary>Ответ</summary>
Да для исходящего трафика этого пира (весь трафик уйдёт в туннель), но чтобы узел реально маршрутизировал чужой трафик дальше, нужен ещё IP-forward + NAT/masquerade на нём. AllowedIPs — и шифрование, и таблица маршрутизации одновременно.
</details>

**3. Достаточно ли снапшотов Longhorn для disaster recovery?**

<details><summary>Ответ</summary>
Нет: снапшоты живут на тех же дисках/нодах. DR требует backup-target (S3) и регулярных backup-задач; снапшоты — для быстрых откатов на том же кластере.
</details>

**4. Гарантирует ли `pulumi up` идемпотентность, как `terraform apply`?**

<details><summary>Ответ</summary>
Да: та же модель desired-state и diff. Повторный up без изменений кода даёт «no changes». Разница — язык программы, а не семантика применения.
</details>

**5. Безопасно ли хранить sourcemaps в публичном CDN рядом с бандлом?**

<details><summary>Ответ</summary>
Нет: по ним восстанавливается исходный код фронтенда. Sourcemaps загружают в Sentry через API на этапе CI, а с CDN их удаляют/не публикуют.
</details>

**6. Является ли `etcdctl defrag` безопасной рутинной операцией на рабочем кластере?**

<details><summary>Ответ</summary>
Условно: каждый defrag кратко «стопорит» член; на всех членах сразу — недоступность записей. Рутинно — можно, но по одному члену, после compaction, вне пиков.
</details>

**7. Достаточно ли layer2-режима MetalLB для отказоустойчивого ingress?**

<details><summary>Ответ</summary>
Нет: в layer2 весь трафик Service идёт через одну ноду-лидера (при её смерти лидер переизберётся — будет пауза). Отказоустойчивое распределение — BGP-режим с ECMP.
</details>

**8. Верно ли, что RabbitMQ quorum queue гарантирует отсутствие дублей при redelivery?**

<details><summary>Ответ</summary>
Нет: at-least-once — при requeue/недоставленном ack сообщение придёт повторно. Идемпотентность обязан обеспечивать консьюмер (dedup по message id).
</details>

**9. Можно ли в Jsonnet вызвать внешний API во время рендера манифестов?**

<details><summary>Ответ</summary>
Нет: Jsonnet чистый и без I/O (только import файлов). Внешние данные передаются через TLA (top-level arguments), --ext-str/--ext-code или std.nativeX в self-hosted конфигурациях.
</details>

**10. Достаточно ли `stern -n prod api` для отладки пода с несколькими контейнерами?**

<details><summary>Ответ</summary>
Да, но вы увидите перемешанные логи всех контейнеров всех api-подов; для конкретного контейнера добавьте -c <container>. Часто это и нужно, но шум повышен.
</details>

### Открытые вопросы «между подтемами» (11-20)

**11. Опишите цепочку «коммит → golden image → VM → k8s-нода» с участием Packer и Terraform/Pulumi.**

<details><summary>Ответ</summary>
CI запускает packer build (builder qemu/ebs, provisioner ansible-роли) → manifest.json фиксирует ID образа → Terraform/Pulumi берёт его как input var и создаёт VM/ASG → kubeadm/k3s на образе поднимает ноду. Образ неизменяем; обновление = новый образ + перекат.
</details>

**12. Как связаны CoreDNS и внешний DNS-провайдер (например, CoreDNS как secondary)?**

<details><summary>Ответ</summary>
Внешний DNS (Route53/Cloudflare) публикует записи сервисов (external-dns), а CoreDNS отвечает за кластерную зону. Для гибрида CoreDNS умеет secondary (transfer из primary) или forward-зоны; kubernetes-плагин — авторитет только внутри cluster.local.
</details>

**13. Где в pipeline «Sentry ↔ Prometheus ↔ трейсинг» место каждой системы при разборе жалобы «у пользователей 500-е»?**

<details><summary>Ответ</summary>
Prometheus/Alertmanager: факт и масштаб (error-rate burn). Трейсинг (Tempo): какой сервис/эндпоинт в цепочке. Sentry: конкретный exception со стеком, release и breadcrumbs — root cause в коде. Порядок: метрики → трейс → Sentry.
</details>

**14. Почему Crossplane-claims считаются «PVC для облаков»?**

<details><summary>Ответ</summary>
Как PVC абстрагирует StorageClass, claim абстрагирует composition: разработчик пишет kind/name/size, платформенная команда решает, во что это разворачивается (класс, зона, шифрование). Смена composition не требует правки claims.
</details>

**15. Как проверить, что WireGuard-туннель до k8s-ноды готов для kubectl, не поднимая API?**

<details><summary>Ответ</summary>
wg show: latest handshake свежий (< 2 мин), transfer растёт; ping до AllowedIP-адреса ноды; nc -zv <node-ip> 6443. Только потом kubectl.
</details>

**16. Что общего у HAProxy runtime API и kubectl drain с точки зрения эксплуатации?**

<details><summary>Ответ</summary>
Оба — управляемый вывод узла из ротации без даунтайма: state maint (HAProxy) / cordon+evict (K8s), с последующим возвратом. Паттерн «drain → обновить → вернуть → проверить health» идентичен.
</details>

**17. Как MinIO, Thanos и Loki связаны в типичном observability-стенде?**

<details><summary>Ответ</summary>
MinIO — S3-бэкенд для всех: Thanos кладёт TSDB-блоки, Loki — чанки индексов, Tempo — трейсы, Velero — бэкапы. Один объектный стор с разделением по бакетам и политиками lifecycle.
</details>

**18. Зачем в k6-скрипте теги, если thresholds можно повесить на общий http_req_duration?**

<details><summary>Ответ</summary>
Общий threshold смешивает быстрые статические запросы и медленный API — гейт теряет смысл. Теги разделяют потоки (api/checkout), позволяют задать SLO на каждый путь и фильтровать в Grafana.
</details>

**19. Что произойдёт с NATS JetStream-стримом при потере кворума RAFT-группы?**

<details><summary>Ответ</summary>
Стрим становится недоступен для записи (и чтения новых), пока кворум не восстановится; данные на живых репликах целы. Отсюда: replicas=3 и PDB, мониторинг raft-групп.
</details>

**20. Почему `jq` в shell-скриптах без `-r` — источник инцидентов? Приведите механизм.**

<details><summary>Ответ</summary>
Без -r строки выводятся как JSON-литералы: "value" с кавычками и экранированием. Подстановка в команды даёт лишние кавычки/бэкслеши — имена ресурсов не совпадают, циклы по «именам» падают или (хуже) создают дубли.
</details>

### Сценарии «что будет, если...» (21-30)

**21. ...удалить ConfigMap coredns в kube-system?**

<details><summary>Ответ</summary>
Pod'ы CoreDNS перезапустятся с дефолтным Corefile (или не стартуют, если монтирование обязательное): кластерная зона перестанет резолвиться — все service-name вызовы упадут. ConfigMap восстанавливать срочно из Git; это эквивалент «положить DNS».
</details>

**22. ...в HAProxy-бэкенде все серверы fail health-check?**

<details><summary>Ответ</summary>
Backend уходит в NOSRV: клиенты получают 503 мгновенно. Смотреть: http-check путь/ожидание, сеть до бэкендов, сами апстримы. Правильная профилактика — backup-сервер и алерт на backend status.
</details>

**23. ...MinIO потерял больше половины дисков erasure-set?**

<details><summary>Ответ</summary>
Бакеты в этом set'е переходят в read-only или недоступны (зависит от числа потерь): запись невозможна без кворума дисков. Healing после замены; отсюда — распределённый режим минимум 4 диска на разных нодах и мониторинг drive health.
</details>

**24. ...Renovate-PR обновил helm chart major, automerge сработал, staging упал, а prod-окружение синкается ArgoCD автоматически?**

<details><summary>Ответ</summary>
Сломается и прод (тот же манифест). Профилактика: major без automerge, разные values/версии chart'а между окружениями, ArgoCD sync windows для прод-окна, ручной gate на prod-Application.
</details>

**25. ...в Jsonnet-библиотеке поменяли сигнатуру функции, а 30 окружений её импортируют?**

<details><summary>Ответ</summary>
Рендер всех окружений сломается на CI (ошибка компиляции) — это плюс: поймано до кластера. Минус: один PR меняет 30 рендеров; лечится версионированием библиотек (import с тегом/хэшем) и постепенной миграцией.
</details>

**26. ...Pulumi-стек деплоили двое одновременно?**

<details><summary>Ответ</summary>
Pulumi Cloud/S3-backend блокирует стейт на время операции (аналог state lock): второй получит ошибку блокировки. Без бэкенда с локингом — гонка и повреждение стейта; поэтому self-hosted бэкенд обязан поддерживать локи.
</details>

**27. ...в Longhorn удалить PVC с reclaimPolicy: Delete, а бэкап-target не настроен?**

<details><summary>Ответ</summary>
Данные уничтожены безвозвратно: реплики удалены, бэкапов в S3 нет. Отсюда правило: Retain для критичных классов + обязательный backup-target + алерт на «volume без свежего бэкапа».
</details>

**28. ...Falco (из Части 1) и HAProxy-статистика показывают всплеск exec'ов в контейнерах ingress-контроллера?**

<details><summary>Ответ</summary>
Вероятный компрометация/эксплуатация уязвимости ingress. Действия: изолировать ноду (cordon), сохранить события Falco (кто/что/откуда), проверить образы и секреты, ротация кредов. Связка детект(Ч.1)+сеть(Ч.2) даёт раннее оповещение.
</details>

**29. ...использовать root-креды MinIO в приложении вместо service account с политикой?**

<details><summary>Ответ</summary>
Приложение получает полный контроль над всеми бакетами: утечка кред = компрометация всех данных, включая бэкапы. Правильно: отдельный пользователь + policy на префикс (см. 20.8), креды через ESO.
</details>

**30. ...в tmux-сессии дежурного history-limit оставлен дефолтным (2000), а вы отлаживали час?**

<details><summary>Ответ</summary>
Начало вывода (первые минуты логов/стектрейсов) вытеснено из скроллбека — восстановить нечего. history-limit 100000+ и copy-mode с поиском — базовая гигиена дежурного окна.
</details>

### Ловушки собеседований (31-40)

**31. «RabbitMQ медленный — переведём всё на Kafka». Где ловушка?**

<details><summary>Ответ</summary>
Разные модели: Kafka — лог для стриминга/реплея; RabbitMQ — маршрутизация задач с per-message ack/TTL/DLX. «Медленный» обычно = неверный prefetch/очереди/подтверждения. Перевод на Kafka не решит task-семантику, а усложнит её.
</details>

**32. «CoreDNS тормозит — добавим реплик». Всегда ли поможет?**

<details><summary>Ответ</summary>
Нет: если узкое место — upstream (forward в медленный VPC-DNS) или ndots-шторм (лишние запросы), реплики лишь размажут проблему. Сначала метрики (forward latency, cache hit), потом NodeLocal DNSCache/кэширование, потом масштабирование.
</details>

**33. «MetalLB BGP-режим сложнее — оставим layer2». Что теряете?**

<details><summary>Ответ</summary>
Layer2 = single point трафика (одна нода-лидер на Service): ограничение bandwidth и failover-пауза. Для ingress на 10+ Гбит или строгих SLA нужен BGP/ECMP. Для маленьких стендов layer2 честно достаточно — важно уметь обосновать, а не «так проще».
</details>

**34. «Pulumi лучше Terraform, потому что настоящий язык». В чём подвоп­рос?**

<details><summary>Ответ</summary>
Настоящий язык даёт абстракции и тесты, но также возможность писать нечитаемую «программную» инфру и тащить зависимости рантайма в IaC. Вопрос зрелости команды: HCL дисциплинирует, TS/Python требует правил (без side-effects, детерминизм). Выбор — про команду, не про синтаксис.
</details>

**35. «etcd — просто key-value store, можно заменить на Redis». Разберите.**

<details><summary>Ответ</summary>
etcd даёт линейную согласованность через Raft, watch по ревизиям, lease/TTL и MVCC-историю — контракт, на котором построен весь K8s control plane. Redis — in-memory кэш с другой моделью согласованности и персистентности. Замена = переделка фундамента API server.
</details>

**36. «Sentry заменил мониторинг — алерты Prometheus отключили». Найдите две ошибки.**

<details><summary>Ответ</summary>
1) Sentry видит только обработанные SDK-исключения: недоступность, латентность, инфра-сбои он не покажет (нет SLO-сигнала). 2) Pager должен идти от симптомов (Prometheus/SLO); Sentry — сигнал разработчикам о новых исключениях, не дежурному.
</details>

**37. «CUE — просто ещё один YAML-шаблонизатор». В чём неточность?**

<details><summary>Ответ</summary>
CUE — не шаблонизатор, а язык схем и унификации: валидация существует отдельно от генерации, типы одновременно документация и проверки. Шаблонизаторы (Helm) подставляют строки; CUE доказывает корректность структуры.
</details>

**38. «jq — только для красоты вывода kubectl». Где реальная сила?**

<details><summary>Ответ</summary>
Автоматизация: массовые операции (обновить поле во всех манифестах), агрегации (группировки/суммы), сборка payload для API, парсинг ответов в CI. Плюс jq как «awk для JSON» в инцидентах — быстро посчитать по живым данным.
</details>

**39. «NATS без JetStream — toy». Справедливо ли?**

<details><summary>Ответ</summary>
Нет: Core NATS — самый быстрый транспорт для RPC/событий, где персистентность не нужна (телеметрия, service discovery, fan-out команд). Toy — использовать его для задач, требующих гарантий, без JetStream. Вопрос — соответствие семантики задаче.
</details>

**40. «Golden images через Packer — пережиток, всё же в контейнерах». Где ошибка?**

<details><summary>Ответ</summary>
Ноды K8s, CI-раннеры, базы вне кластера, гипервизоры — всё это VM с ОС. Immutable-инфра для нод (образ = ОС+containerd+CNI) ускоряет масштабирование и сужает дрейф. Контейнеры решают приложение, Packer — хост.
</details>

---

## 3.2 — 10 сводных практических задач

> Каждая задача: условие → стартовое состояние → шаги с командами и **ожидаемым выводом** → «Проверь себя» → разбор.

### Задача 1 (инцидент): «Половина подов не резолвит DNS после деплоя Corefile»

**Условие:** после правки Corefile ~50% подов получают `i/o timeout` на любые запросы; кластерные имена работают у всех.

**Стартовое состояние:** ConfigMap `kube-system/coredns` отредактирован; в блоке forward добавлен `policy sequential` и второй upstream `10.0.0.53` (внутренний DC-DNS), недоступный из кластера.

```bash
# Шаг 1: подтвердить масштаб и слой
kubectl run d1 --rm -it --image=nicolaka/netshoot --restart=Never -- \
  sh -c 'for i in 1 2 3 4 5; do dig +short +time=2 +tries=1 example.com @10.96.0.10; done'
# Ожидание: часть запросов отвечает, часть — timeout (sequential по недоступному upstream)

# Шаг 2: дифф Corefile против Git
kubectl -n kube-system get cm coredns -o jsonpath='{.data.Corefile}' | diff - git/coredns/Corefile
#   < forward . /etc/resolv.conf 10.0.0.53 { policy sequential }   ← расхождение

# Шаг 3: откат и проверка
kubectl -n kube-system apply -f git/coredns/coredns-cm.yaml
kubectl -n kube-system rollout restart deploy/coredns
kubectl -n kube-system rollout status deploy/coredns
kubectl run d2 --rm -it --image=nicolaka/netshoot --restart=Never -- dig +short example.com @10.96.0.10
# Ожидание: A-записи без таймаутов ✅
```

**Проверь себя:** 5/5 запросов успешны; в логах CoreDNS нет `no route to host`; метрика `coredns_forward_requests_total{rcode="NOERROR"}` растёт, `server_errors` стоит.

**Разбор:** sequential-политика ходит по upstream по порядку — недоступный первый upstream добавляет таймаут к половине запросов. Правило: изменения CoreDNS только через Git + preview, а диагностика DNS всегда из пода.

---

### Задача 2 (инцидент): «Velero-бэкапы пишутся, но восстановить нельзя» (MinIO)

**Условие:** алерт «Velero backup completed» приходит ежедневно; при тестовом restore — `error restoring PV: backup not found`. Разобраться до реального DR.

**Стартовое состояние:** MinIO с бакетом `velero`; lifecycle-политика на бакете: «удалять объекты старше 7 дней» (кто-то добавил «для экономии»); Velero-бэкапы старше 7 дней удалены MinIO, но Velero об этом не знает.

```bash
# Шаг 1: что реально в бакете?
mc alias set prod https://minio.corp $A $S
mc ls --recursive prod/velero | tail -5
# Ожидание: только последние 7 дней; Velero UI показывает «30 бэкапов» — расхождение!

# Шаг 2: найти lifecycle-политику
mc ilm rule ls prod/velero
#   Rule: expiry 7 days  ← виновник

# Шаг 3: исправить политику (бэкапы — святое; ретеншн управляет Velero)
mc ilm rule rm --id <rule-id> prod/velero
mc ilm rule add --expire-days 90 --noncurrent-expire-days 30 prod/velero
mc ilm rule ls prod/velero

# Шаг 4: сверить реальность с Velero и почистить его метаданные
velero backup describe $(velero backup get -o name | head -1)
velero backup delete <несуществующие-в-minio> --confirm
```

**Проверь себя:** `mc ls --recursive prod/velero | wc -l` соответствует `velero backup get`; тестовый restore последнего бэкапа проходит.

**Разбор:** «бэкап есть» ≠ «бэкап восстановим» — сверка двух источников правды (объектный стор vs каталог Velero) обязана быть мониторингом, а не разовой проверкой. Lifecycle на бэкап-бакетах настраивает только владелец процесса бэкапа.

---

### Задача 3 (конфиг): NATS JetStream — workqueue с DLQ

**Требование:** очередь задач `jobs.>`: воркеры забирают (pull), не-ack после 5 доставок → в DLQ; история 24ч.

```bash
nats --server=nats://localhost:4222 stream add JOBS \
  --subjects "jobs.>" --storage file --retention workqueue \
  --max-age 24h --replicas 3 --defaults
#   workqueue = сообщение удаляется после ack (классическая очередь задач)

nats --server=nats://localhost:4222 consumer add JOBS WORKERS \
  --pull --ack explicit --max-deliver 5 --ack-wait 30s \
  --deliver all --max-pending 100 --dlq --defaults
#   --dlq: после max-deliver сообщение уйдёт в DLQ-стрим

# Симуляция ядовитого сообщения
nats pub jobs.render.1 "poison"
nats consumer next JOBS WORKERS   # получили, НЕ ack'нули → redeliver через 30s
# ... повторить 5 раз → сообщение в DLQ:
nats consumer info JOBS WORKERS | grep -A2 "Redelivered"
nats stream info JOBS_DLQ 2>/dev/null || nats stream ls   # DLQ-стрим существует
```

**Проверь себя:** `nats consumer info JOBS WORKERS` — `Num Redelivered: 0`, `Num Pending: 0` после переноса в DLQ; в DLQ-стриме — ядовитое сообщение.

**Разбор:** retention workqueue + max-deliver + DLQ = полный цикл обработки задач без ручного вмешательства. Отличие от limits: workqueue удаляет сообщение после ack — не «лог событий», а именно очередь.

---

### Задача 4 (конфиг): MetalLB BGP-анонс на frr-роутер (лаба с контейнером)

**Требование:** MetalLB в BGP-режиме, пир с FRR-контейнером; Service IP анонсируется как /32.

```bash
# Шаг 1: FRR-контейнер как «роутер» (стартовое состояние)
docker run -d --name frr --network kind --privileged frrouting/frr:latest
docker exec frr sh -c 'cat > /etc/frr/frr.conf <<EOF
router bgp 64500
  bgp router-id 172.18.0.9
  neighbor 172.18.0.2 remote-as 64512
  address-family ipv4 unicast
    neighbor 172.18.0.2 route-reflector-client
EOF
sed -i "s/bgpd=no/bgpd=yes/" /etc/frr/daemons'
docker restart frr

# Шаг 2: MetalLB в BGP-режиме
kubectl apply -f - <<EOF
apiVersion: metallb.io/v1beta2
kind: BGPPeer
metadata: { name: frr, namespace: metallb-system }
spec:
  myASN: 64512
  peerASN: 64500
  peerAddress: 172.18.0.9
---
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata: { name: bgp-pool, namespace: metallb-system }
spec: { addresses: ["10.99.99.0/24"] }
---
apiVersion: metallb.io/v1beta1
kind: BGPAdvertisement
metadata: { name: adv, namespace: metallb-system }
spec: { ipAddressPools: [bgp-pool], aggregateLength: { ipv4: 32 } }
EOF

# Шаг 3: проверка анонса
kubectl expose deploy nginx --port=80 --type=LoadBalancer --name=bgp-test
docker exec frr vtysh -c "show bgp ipv4 unicast"
# Ожидание: сеть 10.99.99.x/32 в таблице BGP ✅
```

**Проверь себя:** в `show bgp` появились /32-маршруты пула; `docker exec frr ping 10.99.99.1` (LB-IP) отвечает через ECMP-путь.

**Разбор:** BGP-режим = ноды анонсируют /32 напрямую роутеру — трафик распределяется ECMP по всем нодам. `aggregateLength: 32` — не агрегировать (точные маршруты для балансировки).

---

### Задача 5 (код): jq-скрипт аудита «поды без requests» с выгрузкой в CSV

**Требование:** скрипт `audit.sh`: на вход JSON `kubectl get pods -A -o json`; на выходе CSV `namespace,pod,container,cpu_request,memory_request` только для контейнеров БЕЗ requests.

**Стартовое состояние:** `kubectl get pods -A -o json > pods.json`

```bash
# audit.sh
#!/usr/bin/env bash
set -euo pipefail
IN=${1:-pods.json}
echo "namespace,pod,container,cpu_request,memory_request"
jq -r '.items[] as $p |
  $p.spec.containers[] |
  select((.resources.requests.cpu // "") == "" or (.resources.requests.memory // "") == "") |
  [$p.metadata.namespace, $p.metadata.name, .name,
   .resources.requests.cpu // "MISSING", .resources.requests.memory // "MISSING"]
  | @csv' "$IN"
```

```bash
chmod +x audit.sh && ./audit.sh pods.json | tee missing-requests.csv
# Ожидание (пример вывода):
# "default","crasher","busybox","MISSING","MISSING"
wc -l missing-requests.csv   # нарушители посчитаны
```

**Проверь себя:** подать валидный под с requests — его нет в CSV; подать пустой JSON `{"items":[]}` — только заголовок, exit 0 (set -e не роняет).

**Разбор:** `//` — дефолты для отсутствующих полей; `@csv` — корректное экранирование (не конкатенация строк!); `set -euo pipefail` — скрипт падает громко, а не пишет мусор. Такой CSV — вход для Kyverno-политики из Части 1 (Audit-режим).

---

### Задача 6 (код): Pulumi — компонент-ресурс «web-service» (абстракция)

**Требование:** TypeScript-компонент, который из трёх параметров (name, image, replicas) создаёт Deployment+Service, и два стека (dev/prod) на нём.

```typescript
// components/web.ts
import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

export interface WebArgs { image: pulumi.Input<string>; replicas?: number; port?: number; }

export class WebService extends pulumi.ComponentResource {
  constructor(name: string, args: WebArgs, opts?: pulumi.ComponentResourceOptions) {
    super("shop:Web", name, {}, opts);
    const port = args.port ?? 8080;
    const labels = { app: name };

    new k8s.apps.v1.Deployment(name, {
      metadata: { name },
      spec: {
        replicas: args.replicas ?? 2,
        selector: { matchLabels: labels },
        template: {
          metadata: { labels },
          spec: { containers: [{ name, image: args.image, ports: [{ containerPort: port }] }] },
        },
      },
    }, { parent: this });

    new k8s.core.v1.Service(name, {
      metadata: { name },
      spec: { selector: labels, ports: [{ port: 80, targetPort: port }] },
    }, { parent: this });
    this.registerOutputs();
  }
}
```

```bash
pulumi up   # dev: replicas по умолчанию 2
pulumi config set replicas 5 --stack prod && pulumi up -s prod
# Ожидание preview: shop:Web:api → 2 дочерних ресурса (Deployment+Service)
pulumi destroy -s dev --yes && pulumi destroy -s prod --yes
```

**Проверь себя:** в preview ресурсы имеют `parent: shop:Web:api` (иерархия видна); изменение image обновляет только Deployment (Service untouched).

**Разбор:** ComponentResource — единица платформы: разработчик говорит «WebService(name, image)», платформа контролирует структуру. Это то, чего нет в HCL без мучений с модулями-обёртками.

---

### Задача 7 (код): Jsonnet — генерация N окружений циклом + валидация

**Требование:** один main.libsonnet генерирует Deployment для envs = [dev, staging, prod] с нарастающими replicas и запретом latest.

```jsonnet
// main.libsonnet
local envs = {
  dev:     { replicas: 1, tag: "1.0.0-dev" },
  staging: { replicas: 2, tag: "1.0.0-rc" },
  prod:    { replicas: 5, tag: "1.0.0" },
};

{
  [env]: {
    local c = {
      name: "api",
      image: std.join("", ["registry.corp/api:", e.tag]),
    } in {
      apiVersion: "apps/v1", kind: "Deployment",
      metadata: { name: "api-" + env },
      spec: {
        replicas: e.replicas,
        selector: { matchLabels: { app: "api", env: env } },
        template: {
          metadata: { labels: { app: "api", env: env } },
          spec: { containers: [c] },
        },
      },
    }
  }
  for env in std.objectFields(envs)
}
```

```bash
jsonnet -S main.libsonnet | yq -P 'select(.kind == "Deployment") | .metadata.name, .spec.replicas'
# Ожидание:
#   api-dev      1
#   api-staging  2
#   api-prod     5
# Ловушка: поменяйте тег dev на "latest" — добавьте проверку:
#   assert !std.startsWith(e.tag, "latest") : "latest запрещён";
jsonnet -S main.libsonnet   # Ожидание: RUNTIME ERROR: latest запрещён ❌ → CI красный
```

**Проверь себя:** три деплоймента с разными replicas; с тегом latest рендер падает с понятной ошибкой.

**Разбор:** comprehension по объекту окружений + `error` — валидация внутри генерации. Один источник правды на все окружения; отличие — только данные.

---

### Задача 8 (код): etcd-скрипт гигиены с блокировками

**Требование:** bash-скрипт: compact+defrag по одному члену с паузой, проверкой здоровья до/после, disarm алармов; dry-run режим.

```bash
#!/usr/bin/env bash
# etcd-hygiene.sh — запускать на control-plane, kubeadm
set -euo pipefail
DRY=${1:-}
ETCDCTL="etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key"

members=$($ETCDCTL member list -w json | jq -r '.members[].ID')
rev=$($ETCDCTL endpoint status -w json | jq -r '.[0].Status.header.revision')

echo "1) compact до revision=$rev"
[ "$DRY" = "dry-run" ] || $ETCDCTL compact "$rev"

for id in $members; do
  name=$($ETCDCTL member list -w json | jq -r --arg id "$id" '.members[] | select(.ID==($id|tonumber)) | .name')
  echo "2) defrag member=$name"
  [ "$DRY" = "dry-run" ] || $ETCDCTL defrag --member "$id"
  $ETCDCTL endpoint health --cluster || { echo "HEALTH FAIL после defrag $name"; exit 1; }
  sleep 10        # пауза между членами — кластер не замечает
done

echo "3) alarms:"
$ETCDCTL alarm list || true
[ "$DRY" = "dry-run" ] || $ETCDCTL alarm disarm >/dev/null
$ETCDCTL endpoint status -w table
```

```bash
./etcd-hygiene.sh dry-run    # сначала без изменений
./etcd-hygiene.sh            # боевой прогон (в maintenance-окно)
```

**Проверь себя:** `endpoint status -w table` — DB SIZE ≈ IN USE (дефраг сработал); `endpoint health --cluster` — все healthy на каждом шаге; dry-run не меняет состояние.

**Разбор:** defrag по одному + health-гейт после каждого члена + пауза — безопасный паттерн; compact перед defrag обязателен (иначе освобождать нечего). Dry-run — стандарт для любых скриптов на прод-хранилище.

---

### Задача 9 (код): k6 + jq — гейт деплоя с парсингом summary

**Требование:** CI-шаг: k6-тест, затем jq-парсинг summary.json: fail, если p95 > 800ms или check-rate < 99%.

```bash
# Шаг 0: k6 пишет summary в файл (в скрипте: handleSummary)
cat > summary-extract.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
p95=$(jq -r '.metrics.http_req_duration.percentiles["95"]' summary.json)
checks=$(jq -r '.metrics.checks.value * 100' summary.json)
echo "p95=${p95}ms checks=${checks}%"
awk -v p="$p95" -v c="$checks" 'BEGIN {
  if (p+0 > 800) { print "FAIL: p95 > 800ms"; exit 1 }
  if (c+0 < 99)  { print "FAIL: checks < 99%";  exit 1 }
  print "GATE OK"
}'
EOF

# k6-скрипт с handleSummary (фрагмент load.js):
# export function handleSummary(data) {
#   return { 'summary.json': JSON.stringify(data) };
# }

k6 run load.js && chmod +x summary-extract.sh && ./summary-extract.sh
# Ожидание: p95=412.3ms checks=100% / GATE OK
# При деградации: FAIL: p95 > 800ms → exit 1 → job красный → деплой стоит
```

**Проверь себя:** подложите summary.json с p95=900 — скрипт exit 1 с FAIL; с p95=500 и checks=100 — GATE OK.

**Разбор:** k6 thresholds уже умеют exit 1, но парсинг summary нужен, когда гейт сложнее (несколько условий, отчёт в MR). jq + awk — минимальный набор без Python в CI-образе.

---

### Задача 10 (инцидент): «Envoy выбрасывает upstream, а он живой» (outlier detection)

**Условие:** после включения Istio mTLS часть запросов к `api` получает 503 от ingress; сам `api` здоров (kubectl logs чистые, healthz 200). В Envoy-логах — UF флаги.

**Quest:**

```bash
# Шаг 1: состояние кластеров с точки зрения ingress-пода
istioctl proxy-config cluster <ingress-pod> -n istio-system \
  --fqdn api.prod.svc.cluster.local
#   HEALTH FLAGS: outlier ejection ✗ (выброшен!)

# Шаг 2: почему выброшен — события outlier
kubectl exec <ingress-pod> -n istio-system -c istio-proxy -- \
  curl -s localhost:15000/clusters | grep api.prod
#   cx_connect_fail: 47, ejections_active: 1

# Шаг 3: корень — DestinationRule с агрессивным outlierDetection
kubectl get destinationrule api -n prod -o yaml | yq '.spec.trafficPolicy.outlierDetection'
#   consecutiveErrors: 2, interval: 1s, baseEjectionTime: 15m   ← слишком агрессивно

# Шаг 4: что реально ломало соединения? (проверка mTLS-совместимости)
istioctl authn check <pod> -n prod          # или peer-authentication статусы
kubectl logs <ingress-pod> -n istio-system -c istio-proxy | grep -c "TLS handshake"
#   TLS handshake errors → у одного из подов api нет sidecar/старый прокси

# Решение: починить sidecar на отстающем поде + смягчить outlierDetection:
#   consecutive5xxErrors: 5, interval: 10s, baseEjectionTime: 30s, maxEjectionPercent: 50
```

**Проверь себя:** `curl -s localhost:15000/clusters | grep api.prod` — `ejections_active: 0`; 503 исчезли; в Envoy stats `upstream_rq_5xx` не растёт.

**Разбор:** Envoy выбрасывает «нездоровых» по своей статистике — если один инстанс не умеет mTLS, он генерирует handshake-файлы и выбрасывается, трафик идёт к оставшимся, нагрузка растёт, выбрасываются следующие (каскад). Outlier detection — тонкий инструмент: агрессивные дефолты при частичных сбоях усиливают аварию.

---

## 🎓 Что изучить дальше

- **Часть 3 курса:** AWS/GCP/Azure deep (VPC/IAM/EKS-GKE-AKS), Cloudflare (Zero Trust, Workers, Tunnel), GitLab administration (runner fleet, registry), Rancher/k3s в проде, KVM/Proxmox/VMware, MySQL HA.
- **Углубление по Части 2:** NATS superclusters + leaf nodes, Envoy Gateway API, Crossplane Compositions с Functions (pipeline-модель), CUE-модули для платформ, OpenFeature/флаги рядом со Sentry.
- **В handbook'е:** [Часть 1 Senior Stack](00-senior-stack-summary.md) (Kyverno/Thanos/ESO/Terratest/Harbor), [Kafka](../11-data-and-storage/02-kafka-and-strimzi.md), [Istio](../12-advanced-networking-and-mesh/01-istio-service-mesh.md), [Labs 01-07](../16-guided-labs/01-lab-linux-systemd-namespaces.md).
- **Книги:** «Designing Data-Intensive Applications» (брокеры/хранение), «BPF Performance Tools» (runtime-детект), OPA/CUE официальные docs, Google SRE Workbook (глава про load testing).
