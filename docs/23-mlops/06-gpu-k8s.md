# 🎮 23.6 GPU на Kubernetes: device plugin, MIG, Kueue

> Цель: давать ML-команде GPU как ресурс K8s — с очередями, тайм-слайсингом и без «занял и ушёл».

**Оглавление:** [2.1 Теория](#21-теория) · [2.2 Конфигурация](#22-конфигурация) · [2.3 Troubleshooting](#23-troubleshooting) · [2.5 Вопросы](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

### 2.1 Теория

**Цепочка доступа к GPU:**

```text
Драйвер NVIDIA на ноде → nvidia device plugin (DaemonSet) → K8s видит ресурс nvidia.com/gpu
→ Pod запрашивает resources.limits."nvidia.com/gpu": 1 → плагин выдаёт устройство в контейнер
```

**Стратегии разделения GPU:**

| Стратегия | Механизм | Когда |
| :--- | :--- | :--- |
| Целый GPU | `nvidia.com/gpu: 1` | большие модели, изоляция |
| **Time-slicing** | плагин: реплики одного GPU (`replicas: 4`) — карусель по времени | много мелких инференсов; НЕТ изоляции памяти |
| **MIG** (A100/H100) | аппаратное разбиение GPU на изолированные слайсы | прод-инференс с гарантиями |
| MPS | общий контекст CUDA | тонкая настройка, редко |

**Проблема «занял и ушёл»:** GPU-под без нагрузки держит ресурс. Решение — **Kueue**: очередь задач; job'ы ждут квоты (Cohort/LocalQueue), стартуют при наличии, preemptируются по приоритету.

**Ключевые термины:** `device plugin` (DaemonSet, публикует GPU как extended resource), `MIG device` (аппаратный слайс), `LocalQueue/ClusterQueue` (Kueue: очередь и квота), `preemption` (вытеснение низкого приоритета).

---

### 2.2 Конфигурация

```bash
# 1. Драйвер + toolkit на нодах (nvidia-smi работает!)
# 2. Device plugin (или через gpu-operator — рекомендовано):
helm install gpu-operator nvidia/gpu-operator -n gpu-operator --create-namespace

# 3. Проверка ресурса:
kubectl describe node gpu-node-1 | grep nvidia
#   nvidia.com/gpu: 8

# Time-slicing (ConfigMap плагина):
kubectl -n gpu-operator edit cm nvidia-plugin
#   version: v1
#   sharing:
#     timeSlicing:
#       replicas: 4          # 1 GPU → 4 «виртуальных»
kubectl -n gpu-operator rollout restart ds gpu-feature-discovery,ds nvidia-device-plugin-daemonset
kubectl describe node ... | grep nvidia   # nvidia.com/gpu: 32 (8×4)
```

```yaml
# Pod с GPU
resources:
  limits: { nvidia.com/gpu: 1 }
# ⚠️ limits только в limits (GPU — extended resource, requests=limits автоматически)
```

```yaml
# Kueue: квота команды
apiVersion: kueue.x-k8s.io/v1beta1
kind: ClusterQueue
metadata: { name: ml-gpu }
spec:
  namespaceSelector: {}
  resourceGroups:
  - flavors:
    - name: gpu-flavor
      resources: [{ name: nvidia.com/gpu, nominalQuota: 8 }]
---
apiVersion: kueue.x-k8s.io/v1beta1
kind: LocalQueue
metadata: { name: team-a, namespace: ml }
spec: { clusterQueue: ml-gpu }
---
# Job с очередью: стартует, когда есть GPU
apiVersion: batch/v1
kind: Job
metadata: { name: train, namespace: ml, labels: { kueue.x-k8s.io/queue-name: team-a } }
...
```

**Частые ошибки:** нет драйвера/toolkit на ноде → плагин не публикует GPU; под просит GPU в `requests` без `limits` (нельзя — extended resource только в limits); time-slicing для обучения (нужна изоляция — только инференс); Kueue установлен, но у Job нет label очереди → job стартует мимо очереди.

---

### 2.3 Troubleshooting

```bash
nvidia-smi                                    # на ноде: драйвер жив?
kubectl -n gpu-operator logs ds/nvidia-device-plugin-daemonset --tail=10
kubectl get node gpu-node-1 -o json | jq '.status.allocatable' | grep nvidia

# Под в Pending: почему?
kubectl describe pod train | tail -5
#   "Insufficient nvidia.com/gpu" → нет свободных/не установлен плагин

# Кто реально жрёт GPU на ноде:
nvidia-smi                                    # таблица процессов
kubectl get pods -A -o json | jq -r '.items[] | select(.spec.containers[].resources.limits."nvidia.com/gpu" != null) | .metadata.namespace + "/" + .metadata.name'

# Kueue: почему job ждёт?
kubectl -n ml get localqueue team-a -o jsonpath='{.status}'
kubectl -n ml describe job train | grep -i kueue
```

| Симптом | Причина | Действие |
| :--- | :--- | :--- |
| `Insufficient nvidia.com/gpu` | плагин не стоит/драйвера нет | gpu-operator, проверить nvidia-smi |
| CUDA error: no device в поде | GPU не проброшен / образ без CUDA runtime | limits в манифесте, правильный базовый образ |
| Time-slicing: OOM/CUDA errors в подах | нет изоляции памяти между репликами | MIG для прод-инференса |
| GPU простаивает, job'ы в очереди | очередь без квоты / label не тот | LocalQueue/ClusterQueue, label queue-name |
| После drain ноды GPU-поды висят | extended resource не «возвращается» | плагин перезапускается DaemonSet'ом — проверить |

---

### 2.5 Проверь себя — 5 вопросов

**В1. Почему GPU нельзя запросить только в `requests` без `limits`?**

<details><summary>Ответ</summary>
Extended resources (nvidia.com/gpu) в K8s обязаны иметь requests == limits — устройство либо выделено целиком, либо нет; частичное резервирование невозможно.
</details>

**В2. Найдите ошибку: включили time-slicing replicas=4 и запустили на одном слайсе обучение с большим батчем.**

<details><summary>Ответ</summary>
Time-slicing не изолирует память GPU: процессы конкурируют за VRAM — OOM/CUDA errors, а карусель по времени убивает throughput обучения. Time-slicing — для мелкого инференса; обучение — целый GPU или MIG.
</details>

**В3. Какую проблему Kueue решает, которую не решает HPA?**

<details><summary>Ответ</summary>
HPA масштабирует работающие поды по нагрузке; GPU-job'ы не могут «ужаться». Kueue ставит их в очередь с квотами и приоритетами: job стартует, когда GPU физически освободились, и вытесняется более приоритетным.
</details>

**В4. Сценарий: под с GPU в Pending, describe: «Insufficient nvidia.com/gpu», но nvidia-smi на ноде показывает 8 GPU. Что проверить?**

<details><summary>Ответ</summary>
Device plugin DaemonSet жив и публикует ресурс (kubectl describe node → allocatable nvidia.com/gpu). Если allocatable 0/отсутствует — плагин не запущен/ошибка конфигурации (например, после включения time-slicing не перезапущен).
</details>

**В5. Чем MIG принципиально лучше time-slicing и чем хуже?**

<details><summary>Ответ</summary>
MIG — аппаратное разбиение: изоляция памяти и ошибок, предсказуемая производительность (прод-инференс). Минусы: только A100/H100-класс, фиксированные профили слайсов, потеря гибкости; time-slicing — на любом GPU и гибче, но без изоляции.
</details>

---

### 2.6 Практика — 3 задания

#### Задание 1: GPU-под на kind невозможен — эмулируем extended resource

**Условие:** понять механику extended resources на кластере без GPU — через mock-плагин.

```bash
kind create cluster --name gpu-lab
# Публикуем фейковый ресурс "example.com/fakegpu": 2 на ноде
kubectl patch node kind-control-plane --subresource=status --type=merge \
  -p '{"status":{"capacity":{"example.com/fakegpu":"2"}}}'
kubectl describe node kind-control-plane | grep fakegpu
#   example.com/fakegpu: 2 ✅

# Под с запросом
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata: { name: gpu-sim }
spec:
  containers:
  - name: c
    image: busybox
    command: ["sleep", "3600"]
    resources:
      limits: { example.com/fakegpu: 1 }
EOF
kubectl get pod gpu-sim     # Running ✅

# Второй под с 2 GPU → Pending (всего 2, один занят)
kubectl describe pod <pending> | tail -3   # Insufficient example.com/fakegpu
```

**Проверь себя:** первый под Running, второй Pending с Insufficient; удалите первый — второй стартует.

**Разбор:** extended resource работает одинаково для GPU и мока: device plugin лишь публикует число, а планировщик делает остальное. Понимание этого = умение дебажить любой GPU-кластер.

#### Задание 2: Kueue — очередь для batch-job

```bash
helm install kueue oci://registry.k8s.io/kueue/charts/kueue -n kueue-system --create-namespace
kubectl apply -f - <<'EOF'
apiVersion: kueue.x-k8s.io/v1beta1
kind: ClusterQueue
metadata: { name: cq }
spec:
  namespaceSelector: {}
  resourceGroups:
  - flavors:
    - name: default-flavor
      resources: [{ name: cpu, nominalQuota: 2 }]   # квота 2 CPU
EOF
kubectl apply -f - <<'EOF'
apiVersion: kueue.x-k8s.io/v1beta1
kind: LocalQueue
metadata: { name: lq, namespace: default }
spec: { clusterQueue: cq }
EOF

# Два job'а по 2 CPU каждый: второй должен ждать
kubectl apply -f - <<'EOF'
apiVersion: batch/v1
kind: Job
metadata: { name: j1, labels: { kueue.x-k8s.io/queue-name: lq } }
spec: { template: { spec: { restartPolicy: Never, containers: [ { name: c, image: busybox, command: ["sleep","60"], resources: { requests: { cpu: "2" } } } ] } } }
---
apiVersion: batch/v1
kind: Job
metadata: { name: j2, labels: { kueue.x-k8s.io/queue-name: lq } }
spec: { template: { spec: { restartPolicy: Never, containers: [ { name: c, image: busybox, command: ["sleep","60"], resources: { requests: { cpu: "2" } } } ] } } }
EOF

kubectl get jobs            # j1 Running; j2 Pending (queued) ✅
kubectl -n default get localqueue lq -o jsonpath='{.status}'
kubectl delete job j1 && sleep 10 && kubectl get jobs   # j2 стартовал после освобождения ✅
```

**Проверь себя:** j2 стартовал только после удаления j1; LocalQueue status показывает used workload.

**Разбор:** Kueue — планировщик по квотам для batch: job'ы не конкурируют хаотично, а стоят в очереди. Для GPU то же самое с nvidia.com/gpu в квоте.

#### Задание 3: Аудит «кто держит GPU»

**Условие:** скрипт выводит все поды с GPU-запросами и их ноды.

```bash
kubectl get pods -A -o json | jq -r '
  .items[]
  | . as $p
  | select(any(.spec.containers[]; .resources.limits."nvidia.com/gpu" != null))
  | [$p.metadata.namespace, $p.metadata.name,
     $p.spec.nodeName,
     ([ $p.spec.containers[].resources.limits."nvidia.com/gpu" ] | join(","))]
  | @tsv' | column -t
# Ожидание: namespace  pod  node  gpu_count — полный реестр GPU-потребителей
```

**Проверь себя:** скрипт находит ваш тестовый GPU-под; на пустом кластере — пусто без ошибок.

**Разбор:** jq с `any()` по контейнерам — типовой аудит-запрос. В проде это дашборд «GPU-утилизация vs владелец» (метрики DCGM exporter + labels пода) — основа для показа ML-командам счёта за GPU.

---

*Далее: [23.7 Kubeflow Pipelines deep dive](07-kubeflow-pipelines.md)*
