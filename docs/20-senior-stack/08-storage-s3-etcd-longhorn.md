# 💾 20.8 Хранилища: MinIO (S3), etcd deep, Longhorn

> Уровень: Middle→Senior. Объектное хранилище, «сердце» Kubernetes и блочное хранилище для K8s — три кейса, где senior обязан знать внутренности.

**Оглавление:** [MinIO](#minio-объектное-хранилище-s3-совместимое) · [etcd deep](#etcd-deep-сердце-kubernetes) · [Longhorn](#longhorn-блочное-хранилище-для-k8s) · [2.5 Проверь себя](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

## MinIO: объектное хранилище (S3-совместимое)

### Теория

MinIO реализует **S3 API**: buckets, objects, versioning, lifecycle, IAM-подобные политики. Используется для: бэкапов (Velero, pgBackRest), артефактов, Thanos/Loki/Tempo-блоков, ML-датасетов.

**Erasure Coding:** данные+паритет размазываются по дискам (`minio server /data{1...16}`); кластер переживает потерю до N/2 дисков. Минимум для distributed — 4 диска. **Single-node single-drive** — только для лаб.

**Ключевые сущности:** `alias` (подключение в mc), `policy` (JSON-документ прав на бакет/префикс), `service account` (для приложений), `bucket versioning` (защита от ransomware: даже удаление = новая версия), `lifecycle` (переход в IA/удаление).

### Конфигурация и синтаксис

```bash
# mc — клиент (как aws cli, но удобнее)
mc alias set prod https://minio.corp.io $ACCESS $SECRET
mc mb prod/velero-backups && mc version enable prod/velero-backups
mc anonymous set none prod/velero-backups          # запретить анонимный доступ

# Политика: только на префикс (принцип наименьших прав)
mc admin policy create prod app-s3 <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:PutObject","s3:GetObject","s3:ListBucket"],
    "Resource": ["arn:aws:s3:::app-data","arn:aws:s3:::app-data/*"]
  }]
}
EOF
mc admin user add prod app-user && mc admin policy attach prod app-s3 --user app-user
```

**Частые ошибки:** бакет без versioning для бэкапов (одна шифровалка-вымогатель — и всё); доступ по root-кредам из приложений; lifecycle удаляет «старые» версии бэкапов раньше нужного; TLS выключен — креды в открытом виде.

### Troubleshooting

```bash
mc admin info prod                       # состояние дисков, uptime, трафик
mc admin heal prod/app-data --dry-run    # что собирается полечить
mc admin heal prod/app-data              # запуск healing (битые объекты с паритета)
mc ls --versions prod/velero-backups | head    # версии объектов
mc diff prod/app-data ./local-copy       # расхождение с локальной копией
kubectl -n minio logs pod/minio-0 | grep -iE "error|drive" | tail
```

**Топ проблем:** `disk not found` после замены диска (healing); `AccessDenied` у приложения (policy не покрывает ListBucket при префиксных операциях); медленные загрузки (один диск в пуле деградировал — I/O на parity-rebuild).

---

## etcd deep: сердце Kubernetes

### Теория

etcd — распределённое KV-хранилище на **Raft**: запись подтверждается кворумом `(N+1)/2`, поэтому кластер — 3 или 5 членов (2N+1). Всё состояние K8s живёт здесь; API server — единственный клиент (через gRPC).

**Внутренности, которые спрашивают:**
- **WAL (Write-Ahead Log)** — каждая мутация сначала fsync в лог. **Диск решает всё:** латентность fsync > 10ms → тормозит весь кластер.
- **MVCC** — ревизии (revision) каждого ключа; history растёт → нужна **compaction**.
- **Defrag** — compaction помечает место свободным, но не возвращает диску: `etcdctl defrag` возвращает его (вызывает кратковременный stall — делают по ноде с рестартами).
- **Alarms**: `NOSPACE` (db size > quota, по умолчанию 2GB) — кластер **запрещает записи**; `CORRUPT`.

**Ключевые метрики:** `etcd_disk_wal_fsync_duration_seconds` p99 (<10ms), `etcd_disk_backend_commit_duration_seconds` p99 (<25ms), `etcd_server_slow_apply_total`, `etcd_mvcc_db_total_size_in_use_in_bytes`.

### Конфигурация и синтаксис

```bash
# Подключение к etcd control-plane ноды (kubeadm)
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  endpoint status -w table
#   +------------------+---------+---------+-----------+ ... DB SIZE ... IS LEADER
#   | 127.0.0.1:2379   | 3.5.12  |  45 MB  |  12 MB    | ...  true

# Снапшот — РЕГУЛЯРНО (и проверять восстановление!)
etcdctl ... snapshot save /backup/etcd-$(date +%F).db
etcdctl ... snapshot status /backup/etcd-2026-08-24.db -w table

# Восстановление (на КАЖДОМ члене с --name/--initial-cluster своего нода):
etcdctl snapshot restore /backup/etcd-2026-08-24.db \
  --data-dir=/var/lib/etcd-restored \
  --name=master-1 --initial-cluster=master-1=https://10.0.0.11:2380 \
  --initial-advertise-peer-urls=https://10.0.0.11:2380
# затем: остановить kube-apiserver+etcd, подменить data-dir, стартовать

# Гигиена: компакция истории + дефраг (по нодам, по очереди!)
etcdctl ... compact $(etcdctl ... endpoint status -w json | jq -r '.[0].Status.header.revision')
etcdctl ... defrag --cluster
etcdctl ... alarm list && etcdctl ... alarm disarm     # снять NOSPACE после дефрага
```

**Частые ошибки:** defrag на живом кластере все члены сразу (сталл всего API); снапшоты есть, но restore никогда не репетировали; quota подняли вместо чистки (проблема вернётся); restore без `--name/--initial-cluster` на мультинодовом кластере.

### Troubleshooting

```bash
kubectl -n kube-system exec etcd-master-1 -- sh -c \
  "ETCDCTL_API=3 etcdctl ... endpoint health"
kubectl -n kube-system exec etcd-master-1 -- sh -c \
  "ETCDCTL_API=3 etcdctl ... endpoint status -w table"   # DB SIZE vs IN USE → нужен defrag
journalctl -u etcd | grep -iE "slow|apply request took too long" | tail
#  "apply request took too long" → медленный диск или тяжёлые запросы (большие LIST)
```

---

## Longhorn: блочное хранилище для K8s

### Теория

K8s-нативное распределённое блочное хранилище (Rancher/SUSE): каждый том — 2-3 **replica** на разных нодах, движок (engine) — процесс рядом с подом, UI, снапшоты, **backups в S3** (снапшот ≠ бэкап: снапшот живёт на тех же дисках!).

**RWX:** через `share-manager` (NFS-export поверх тома). **Rebuilding:** упавшая реплика восстанавливается с живых (трафик!); `replica-auto-rebalance`.

### Конфигурация и синтаксис

```yaml
# StorageClass с репликами и бэкапом
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata: { name: longhorn-3rep }
provisioner: driver.longhorn.io
parameters:
  numberOfReplicas: "3"
  staleReplicaTimeout: "20"
  dataLocality: "best-effort"      # копия данных рядом с подом = быстрее IO
reclaimPolicy: Retain
allowVolumeExpansion: true
---
# Рекуррентные задачи: снапшоты каждые 6ч, бэкап в S3 раз в сутки
apiVersion: longhorn.io/v1beta2
kind: RecurringJob
metadata: { name: daily-backup, namespace: longhorn-system }
spec:
  cron: "0 3 * * *"
  task: backup
  groups: [default]
  retain: 14
```

```bash
longhornctl --help 2>/dev/null || kubectl -n longhorn-system get volumes.longhorn.io
kubectl -n longhorn-system get volumes -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.state}{"\t"}{.status.robustness}{"\n"}{end}'
#  Robustness: degraded → реплика(и) отсутствуют; faulted → данных нет, восстановление из бэкапа
```

**Частые ошибки:** бэкап-таргет (S3) не настроен → «бэкапов нет» при смерти дисков; `dataLocality` на медленной сети; рестарт ноды с 2 из 3 реплик одного тома → robustness degraded; удаление PVC при `reclaimPolicy: Delete` уносит данные навсегда.

### Troubleshooting

```bash
kubectl -n longhorn-system logs deploy/longhorn-manager | grep -iE "error|replica" | tail
kubectl -n longhorn-system get engine -o wide        # движки томов, живые реплики
kubectl -n longhorn-system get backups.longhorn.io   # что реально в S3
# Зависший attach: кто держит том?
kubectl get volumeattachment | grep <pvc-volume>
```

---

## 2.5 Проверь себя — 5 вопросов

**В1. Сценарий: etcd-кластер из 3 членов, один умер физически. Что с кластером K8s?**

<details><summary>Ответ</summary>
Кворум 2 из 3 сохранён — кластер работает (read/write), но отказ ещё одного = потеря кворума и read-only API. Член нужно удалить из кластера (etcdctl member remove) и добавить новый, не дожидаясь второго сбоя.
</details>

**В2. Найдите ошибку: админ запустил `etcdctl defrag --cluster` в рабочее время на проде. Чем это грозит?**

<details><summary>Ответ</summary>
Defrag ставит кратковременный stall на члене; на всех членах одновременно — недоступность записей всего кластера. Дефраг делают по одному члену с интервалом, вне пиков, после compaction.
</details>

**В3. Чем снапшот Longhorn отличается от бэкапа, и почему «снапшоты есть — значит данные в безопасности» — ложь?**

<details><summary>Ответ</summary>
Снапшот — копия на том же наборе дисков/нод: смерть дисков/ноды убивает и снапшоты. Бэкап — в объектное хранилище (S3) вне кластера. Только бэкап спасает от потери нод/дисков и ransomware.
</details>

**В4. Приложение получает `AccessDenied` на `mc cp` в бакет, хотя политика даёт `s3:PutObject` и `s3:GetObject`. Чего не хватает?**

<details><summary>Ответ</summary>
`s3:ListBucket` на сам бакет (arn без /*): загрузки с проверкой существования и листинг префиксов требуют ListBucket на bucket-ARN, а объектные операции — на bucket/*. Нужны оба Resource.
</details>

**В5. Метрика `etcd_disk_wal_fsync_duration_seconds` p99 = 45ms. Что это значит для кластера K8s и что делать?**

<details><summary>Ответ</summary>
Каждая запись etcd ждёт fsync 45ms — все операции API server медленные, деплои «тормозят». Порог боли ~10ms. Лечение: быстрый локальный NVMe для etcd, убрать соседей по диску, проверить виртуализацию (thin-provisioned диски).
</details>

---

## 2.6 Практика — 3 задания

### Задание 1: MinIO + проверка версионирования против «удаления»

**Условие:** поднять MinIO в docker, включить versioning, убедиться, что «удалённый» объект восстанавливается.

```bash
# Шаг 1: старт
docker run -d --name minio -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=admin -e MINIO_ROOT_PASSWORD=admin12345 \
  minio/minio:latest server /data --console-address ":9001"

# Шаг 2: клиент и бакет
docker run --rm --network host -it minio/mc sh -c '
  mc alias set local http://localhost:9000 admin admin12345
  mc mb local/backups && mc version enable local/backups
  echo "v1-data" | mc pipe local/backups/db.sql
  mc ls local/backups
'
# Ожидание: db.sql (7 B) ✅

# Шаг 3: «ransomware» удаляет объект
docker run --rm --network host -it minio/mc sh -c '
  mc alias set local http://localhost:9000 admin admin12345
  mc rm local/backups/db.sql && mc ls local/backups; echo "пусто? нет:"
  mc ls --versions local/backups          # версия осталась!
  mc cp --version-id $(mc ls --versions local/backups | awk "{print \$5}" | head -1) \
    local/backups/db.sql /tmp/restored.sql && cat /tmp/restored.sql
'
# Ожидание: v1-data — объект восстановлен по version-id ✅
```

**Проверь себя:** `mc ls --versions` показывает delete-marker + предыдущую версию; восстановленный файл содержит `v1-data`.

**Разбор:** versioning превращает удаление в delete-marker — базовая защита бэкапов от шифровальщиков и «случайного rm». В проде: отдельные креды на бакет бэкапов, lifecycle на версии (например, хранить 30 версий), репликация на второй MinIO.

### Задание 2: etcd — снапшот и репетиция восстановления на kind/kubeadm-стенде

**Условие:** снять снапшот etcd, «уронить» кластер (удалить манифест критичного объекта), восстановить из снапшота.

```bash
# Шаг 0: переменные окружения (kubeadm-стенд, master-1)
export ETCDCTL_API=3
ETCD="etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key"

# Шаг 1: снапшот
$ETCD snapshot save /root/etcd-pre-test.db
$ETCD snapshot status /root/etcd-pre-test.db -w table
# Ожидание: HASH, REVISION, TOTAL KEYS > 0 ✅

# Шаг 2: создаем маркер и «теряем» его
kubectl create ns etcd-drill && $ETCD snapshot save /root/etcd-with-drill.db
kubectl delete ns etcd-drill

# Шаг 3: восстановление (на стенде с внешним etcd-юнитом)
systemctl stop kubelet && docker ps | grep k8s_etcd | awk '{print $1}' | xargs -r docker stop
$ETCD snapshot restore /root/etcd-with-drill.db --data-dir=/var/lib/etcd-restore
mv /var/lib/etcd /var/lib/etcd.broken && mv /var/lib/etcd-restore /var/lib/etcd
systemctl start kubelet && sleep 20
kubectl get ns etcd-drill     # Ожидание: namespace существует (восстановлен) ✅
```

**Проверь себя:** `kubectl get ns etcd-drill` возвращает объект; `kubectl get pods -A` — кластер жив, поды рестартовали с состоянием на момент снапшота.

**Разбор:** восстановление etcd = откат ВЕСЬ кластер K8s во времени (все объекты!). Репетиция обязательна: на живом кластере вы впервые узнаете про `--name/--initial-cluster`, остановку статических pod'ов и несовпадение data-dir. RTO без репетиции — часы, с репетицией — минуты.

### Задание 3: Longhorn — деградация тома и восстановление robustness

**Условие:** том с 3 репликами; выключить ноду с одной репликой, наблюдать degraded, вернуть в healthy.

```bash
# Шаг 0: стенд — k3s/kind с Longhorn, тестовый том
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: PersistentVolumeClaim
metadata: { name: lh-test }
spec:
  storageClassName: longhorn
  accessModes: [ReadWriteOnce]
  resources: { requests: { storage: 1Gi } }
---
apiVersion: v1
kind: Pod
metadata: { name: writer }
spec:
  containers: [{ name: w, image: busybox:1.36, command: ["sh","-c","while true; do date >> /data/log; sleep 5; done"], volumeMounts: [{ name: d, mountPath: /data }] }]
  volumes: [{ name: d, persistentVolumeClaim: { claimName: lh-test } }]
EOF

# Шаг 1: состояние тома
kubectl -n longhorn-system get volumes -o custom-columns='NAME:.metadata.name,STATE:.status.state,ROBUST:.status.robustness,REPLICAS:.status.replicaCount'
# Ожидание: attached, healthy, 3

# Шаг 2: «падение» реплики — масштабируем ноду/удаляем реплику через UI или:
kubectl -n longhorn-system delete pod -l longhorn.io/replica=<имя-реплики> --force
#   либо cordoned ноду с репликой: kubectl cordon <node>
sleep 60
kubectl -n longhorn-system get volumes -o custom-columns='NAME:.metadata.name,ROBUST:.status.robustness'
# Ожидание: degraded (реплика восстанавливается на другой ноде)

# Шаг 3: данные целы?
kubectl exec writer -- tail -3 /data/log    # записи продолжаются без пауз ✅
# Шаг 4: после rebuild
kubectl -n longhorn-system get volumes ...  # robustness: healthy снова
```

**Проверь себя:** в момент деградации под-писатель НЕ прервался (`tail /data/log` — непрерывные timestamp'ы); через несколько минут robustness = healthy; в UI Longhorn видна новая реплика на другой ноде.

**Разбор:** 3 реплики = переживаем отказ 1-2, но rebuild жрёт сеть и I/O. В проде: anti-affinity реплик по нодам (дефолт), алерт на `robustness != healthy`, бэкап-target настроен обязательно — degraded-кластер при смерти второй ноды теряет том.

---

*Следующая подтема: [20.9 IaC next-gen: Pulumi, Packer, Crossplane](09-iac-nextgen.md)*
