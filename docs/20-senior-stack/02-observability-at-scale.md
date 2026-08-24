# 📈 20.2 Observability at Scale: Thanos, VictoriaMetrics, Mimir + Tracing (OTel/Tempo/Jaeger)

> Уровень: Middle→Senior. Цель: спроектировать метрики на горизонты месяцев и мульти-кластер, и трассировку, которая не сжигает бюджет.

**Оглавление:** [2.1 Теория](#21-теория) · [2.2 Конфигурация](#22-конфигурация-и-синтаксис) · [2.3 Troubleshooting](#23-troubleshooting) · [2.4 Интеграция](#24-интеграция-со-стеком) · [2.5 Проверь себя](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

### 2.1 Теория

#### Проблема одиночного Prometheus

1. **Локальность:** каждый Prometheus видит только свой кластер/регион — нет глобального PromQL.
2. **Retention:** TSDB на диске — дни/недели, а бизнесу нужны графики за квартал/год.
3. **HA-парадокс:** два Prometheus на один target дают **разные значения** (разный scrape-тайминг) — какой верить?
4. **Нет долгосрочного дедуплицированного хранилища.**

#### Три решения долгосрочного хранения

| | **Thanos** | **VictoriaMetrics** | **Grafana Mimir** |
| :--- | :--- | :--- | :--- |
| Архитектура | блоки TSDB Prometheus → object storage (sidecar у каждого Prometheus) | свой TSDB-движок; `vmagent` remote-write → кластер vminsert/vmselect/vmstorage | remote-write, горизонтально-шардированный, object storage |
| Сжатие | как у Prometheus (~1-2 байта/сэмпл) | **~0.4-1 байт/сэмпл** (лучший в классе) | среднее |
| PromQL | 100% | PromQL + MetricsQL (расширения) | 100% |
| Эксплуатация | много компонентов (sidecar, query, store-gw, compactor, ruler) | single-binary «поставил и забыл» или кластер из 3 типов нод | сложная, но честный horizontal scale |
| Мульти-тенантность | слабая (лейблы) | встроенная (accountID в URL) | сильная (tenant header) |
| Выбор | уже есть Prometheus-оператор, нужен «апгрейд без переезда» | экономия на железе, простота, много данных | SaaS-подобная мульти-аренда, тысячи тенантов |

**Thanos-компоненты (надо знать наизусть):** `Sidecar` (у каждого Prometheus: выгружает 2-часовые блоки в S3, отдаёт StoreAPI), `Query` (федеративный PromQL + дедупликация по внешним лейблам), `Store Gateway` (читает старые блоки из S3, кэширует индексы), `Compactor` (дедупликация HA-пар, даунсэмпл 5m/1h, ретеншн; **единственный писатель в бакет**), `Ruler` (алерты/записи над глобальными данными), `Receive` (push-модель, если scrape невозможен).

#### Трассировка: OTel → Tempo/Jaeger

**OpenTelemetry** — стандарт: SDK в приложении → **OTLP-протокол** → **Collector** (агент DaemonSet / gateway Deployment) → бэкенд. Collector — конвейер `receivers → processors → exporters`.

**Сэмплирование — центральная тема senior-собеса:**
- **Head sampling** — решение «писать/не писать» в момент старта трейса (дёшево, но можно потерять важное).
- **Tail sampling** — решение после завершения трейса (в Collector): писать 100% ошибок, 100% медленных, 10% остальных. Дороже (держит трейсы в памяти), но осмысленно.

**Бэкенды:**

| | **Tempo** | **Jaeger** |
| :--- | :--- | :--- |
| Индексация | только TraceID (+ поиск по ресурсам v2) — дёшево на S3 | полнотекстовый индекс спанов (Cassandra/ES) — дорого |
| Стоимость | минимальная (объектное хранилище) | растёт с трафиком |
| Сильная сторона | корреляция в Grafana: метрики → exemplars → трейс → логи | зрелый UI, адаптивное сэмплирование |

**Exemplars** — точки на гистограмме latency, содержащие trace_id: клик по бару p99 в Grafana открывает конкретные трейсы.

---

### 2.2 Конфигурация и синтаксис

#### Thanos: ключевые куски (kube-prometheus-stack values)

```yaml
prometheus:
  prometheusSpec:
    externalLabels:            # ДЕДУПЛИКАЦИЯ HA-пар по этим лейблам
      cluster: eu-prod-1
    replicas: 2                # две реплики Prometheus (HA)
    thanos:
      sidecar:
        enabled: true
objectStorage:
  config:
    type: s3
    config:
      bucket: thanos-blocks
      endpoint: minio.monitoring.svc:9000
      access_key: ...          # из секрета, не в values!
      insecure: true
thanosQuery:
  replicaLabels: [prometheus_replica]   # какой лейбл выкидывать при дедупе
thanosCompactor:
  retentionResolutionRaw: 15d     # сырые данные
  retentionResolution5m: 90d      # даунсэмпл 5m
  retentionResolution1h: 2y       # годовой график — из 1h-блоков
```

#### VictoriaMetrics: single-node за 10 минут

```yaml
# helm install vm victoria-metrics/victoria-metrics-k8s-stack
victoria-metrics:
  server:
    retentionPeriod: "6"        # месяцев (в месяцах для single!)
    resources:
      requests: { cpu: "1", memory: 8Gi }
vmagent:
  spec:
    remoteWrite:
      - url: "http://vmsingle.monitoring.svc:8428/api/v1/write"
```

#### OTel Collector: tail sampling (главный конфиг трассировки)

```yaml
receivers:
  otlp:
    protocols: { grpc: { endpoint: 0.0.0.0:4317 }, http: { endpoint: 0.0.0.0:4318 } }
processors:
  k8sattributes:                 # обогащение: pod/namespace/deployment в атрибуты
    extract: { metadata: [k8s.pod.name, k8s.namespace.name, k8s.deployment.name] }
  tail_sampling:                 # ПОРЯДОК ВАЖЕН: до batch!
    decision_wait: 10s
    num_traces: 50000            # память ~ num_traces × средний размер
    policies:
      - name: errors-always
        type: status_code
        status_code: { status_codes: [ERROR] }
      - name: slow-traces
        type: latency
        latency: { threshold_ms: 1000 }      # всё, что > 1s
      - name: base-10pct
        type: probabilistic
        probabilistic: { sampling_percentage: 10 }
  batch: { timeout: 5s }
exporters:
  otlp/tempo:
    endpoint: tempo-distributor.observability.svc:4317
    tls: { insecure: true }
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, k8sattributes, tail_sampling, batch]
      exporters: [otlp/tempo]
```

**Частые ошибки конфигурации:**
1. `batch` **перед** `tail_sampling` → батч рвёт трейсы, сэмплирование по кускам — мусорные решения.
2. Нет `externalLabels.cluster` на Prometheus → дедупликация HA-пар в Thanos невозможна, Query показывает дубли.
3. Compactor запущен в двух экземплярах → повреждение блоков (он должен быть single-writer, HA — через `--wait` и блокировку).
4. `decision_wait` меньше, чем длительность типичных трейсов → «медленные» трейсы не попадают в latency-политику (решение принимается до завершения).
5. Tempo без лимитов на tenant → один сервис с высокой кардинальностью атрибутов кладёт ingestion.

---

### 2.3 Troubleshooting

```bash
# Thanos: целостность бакета и блоков
kubectl -n monitoring logs deploy/thanos-compactor --tail=50 | grep -iE "error|duplicate"
thanos tools bucket verify --objstore.config-file=/cfg/bucket.yaml --output-dir=/tmp

# Query видит дубли серий? Проверьте externalLabels и replicaLabels:
curl -s 'http://thanos-query:9090/api/v1/labels?match[]=up' | jq -r '.data[]' | sort

# Store Gateway OOM на старте → греет индексы старых блоков:
kubectl -n monitoring get pod -l app=thanos-store -o jsonpath='{..resources}'
# Лечится index-cache size / ограничением времени хранения через bucket web UI

# VictoriaMetrics: кардинальность — главный убийца
curl -s 'http://vmsingle:8428/api/v1/status/top_queries'      | jq .
curl -s 'http://vmsingle:8428/api/v1/series/count'            # всего серий
curl -s 'http://vmsingle:8428/api/v1/status/tsdb' | jq '.data.seriesCountByLabelName[:5]'

# Tracing: дошли ли трейсы до Tempo?
curl -s 'http://tempo-query-frontend:3100/api/search?limit=5' | jq '.traces | length'
# Пропали error-трейсы → смотрите счётчики tail_sampling:
curl -s localhost:8888/metrics | grep tail_sampling
#    tail_sampling_processor_dropped_traces / early_decisions
```

**Топ проблем:**

| Симптом | Причина | Действие |
| :--- | :--- | :--- |
| Grafana: серии задвоены (две линии) | нет дедупа: `replicaLabels` не совпадает с лейблом реплики | выставить `prometheus_replica` в Query |
| Compactor в CrashLoop `bucket already compacted` | второй compactor | один инстанс + `--wait` |
| Запрос за год таймаутит | нет даунсэмпла / query бьёт в raw-блоки | проверить compactor downsample + `query_range` step |
| VM ест память после миграции | кардинальные лейблы (pod_id, user_id) | `top_queries` + relabel drop |
| Трейсы есть, ошибок нет | tail_sampling: errors-политика ниже probabilistic или batch раньше | порядок процессоров, `decision_wait` |
| Exemplars не показываются | нет заголовка `exemplar` в ответе Prometheus / не включено в datasource | включить в Grafana datasource + histogram у приложения |

---

### 2.4 Интеграция со стеком

- **Grafana — центр:** datasource Prometheus/VM + Tempo + Loki; `trace-to-logs` (по trace_id из спана → Loki), `metrics-to-traces` через exemplars. Один клик: алерт → трейс → логи.
- **Alloy/Grafana Agent:** тот же OTLP-эндпоинт для метрик/логов/трейсов (единый коллектор).
- **Приложения:** автоинструментация (Java agent, Python `opentelemetry-instrument`), propagation `traceparent` через Istio (Envoy поддерживает W3C из коробки).
- **Alertmanager/Ruler:** Thanos Ruler оценивает правила глобально (SLO по всем кластерам), шлёт в тот же Alertmanager.

---

### 2.5 Проверь себя — 5 вопросов

**В1. Два Prometheus скрейпят одни таргеты (HA). Почему нельзя просто сложить их данные remote-write'ом в один бэкенд без настроек?**

<details><summary>Ответ</summary>
Значения одного и того же сэмпла у реплик различаются (тайминг scrape), получатся дубли-«зубья» на графиках. Нужны externalLabels (cluster/replica) и дедупликация на чтении (Thanos Query) или дедуп в компакторе.
</details>

**В2. Сценарий: Thanos Compactor упал с ошибкой «duplicate sample for timestamp» после добавления третьей реплики Prometheus. Что случилось?**

<details><summary>Ответ</summary>
Дедупликация рассчитана на 2 реплики (лейбл replica-0/1); третья реплика дала конфликт таймстемпов в одном блоке. Нужно либо чётное число реплик под схему дедупа, либо пересмотреть replicaLabels — и почистить повреждённые блоки через bucket verify/mark.
</details>

**В3. Найдите ошибку: `processors: [batch, tail_sampling, k8sattributes]` — что не так?**

<details><summary>Ответ</summary>
Порядок: tail_sampling должен быть до batch (иначе трейс разорван на батчи и решения принимаются по кускам), а k8sattributes — до tail_sampling, если политики используют атрибуты namespace/pod. Верный порядок: memory_limiter → k8sattributes → tail_sampling → batch.
</details>

**В4. Почему Tempo дешевле Jaeger при том же объёме трейсов?**

<details><summary>Ответ</summary>
Tempo не строит полнотекстовый индекс по спанам — хранит блоки в объектном хранилище и ищет по TraceID (плюс ограниченный поиск v2). Jaeger держит индекс в Cassandra/ES, стоимость которого растёт с каждым спаном.
</details>

**В5. `decision_wait: 10s` в tail_sampling, а у вас есть трейсы длиной 30s (batch-обработка). Что произойдёт?**

<details><summary>Ответ</summary>
Решение о сэмплировании будет принято на 10-й секунде, до завершения трейса: latency-политика не увидит реальную длительность, хвост спанов потеряется. decision_wait должен превышать p99 длительность трейсов (ценой памяти).
</details>

---

### 2.6 Практика — 3 задания

#### Задание 1: Мульти-кластер на Thanos + MinIO (quest)

**Условие:** два kind-кластера, единый Grafana с глобальным PromQL.

**Шаг 1** — MinIO в первом кластере:
```bash
helm install minio minio/minio -n monitoring --create-namespace \
  --set mode=standalone --set persistence.size=10Gi \
  --set resources.requests.memory=512Mi
kubectl -n monitoring get secret minio -o jsonpath='{.data.accesskey}' | base64 -d
```

**Шаг 2** — kube-prometheus-stack с sidecar (values из 2.2) в обоих кластерах; во втором `externalLabels: {cluster: eu-prod-2}` и endpoint MinIO первого (через NodePort/LoadBalancer).

**Шаг 3** — Thanos Query во втором кластере со storeAPI обоих sidecar'ов:
```bash
kubectl -n monitoring port-forward svc/thanos-query 9090:9090
# в UI: http://localhost:9090 → Graph →
#   sum(up) by (cluster)     → ДВЕ строки, по кластеру ✅
```

**Проверь себя:** `sum(up) by (cluster)` возвращает `eu-prod-1` и `eu-prod-2`; при остановке Prometheus-реплики в одном кластере график не рвётся (дедуп работает).

**Разбор:** ключи корректной федерации — уникальные `externalLabels.cluster` на каждый кластер, одинаковый `replicaLabels` в Query и Compactor, один бакет.

#### Задание 2: Tail sampling «100% ошибок + 10% остального»

**Условие:** сервис шлёт OTLP в Collector; бюджет хранения — только 10% трафика, но ошибки и трейсы >500ms — все.

**Шаг 1** — конфиг из раздела 2.2, измените latency-политику на `threshold_ms: 500`, probabilistic → 10.

**Шаг 2** — генерация трафика (podinfo умеет ошибки):
```bash
POD=$(kubectl get pod -l app=podinfo -o name | head -1)
kubectl exec $POD -- sh -c 'while true; do curl -s localhost:9898/ >/dev/null; curl -s localhost:9898/status/500 >/dev/null; done'
```

**Шаг 3** — проверка пропорций:
```bash
curl -s localhost:8888/metrics | grep -E 'tail_sampling.*(sampled|dropped)'
# accepted ~ N, sampled ≈ 0.1N + все ERROR
curl -s 'http://tempo:3100/api/search?tags=error=true&limit=20' | jq '.traces|length'   # > 0 ✅
```

**Проверь себя:** доля сэмплов в метриках ≈ 10% + ошибки; в Tempo поиск `error=true` находит трейсы.

**Разбор:** политики в tail_sampling — OR-логика: трейс пишется, если подошёл хоть один policy. probabilistic — последним, как «фон».

#### Задание 3: Миграция retention с 15d на 1y без потери алертов

**Условие:** Prometheus (kube-prometheus-stack) + Thanos sidecar уже есть; нужно годовое хранение и даунсэмплы.

**Шаг 1** — включите compactor с ретеншенами (values из 2.2) и **одной** репликой.

**Шаг 2** — уменьшите локальный retention Prometheus (диск не резиновый):
```yaml
prometheusSpec:
  retention: 3d                  # локально держим мало
  retentionSize: 45GiB
```

**Шаг 3** — проверьте цепочку:
```bash
kubectl -n monitoring logs deploy/thanos-compactor | grep -c "compaction done"
# в Grafana: query_range за 30d с step=1h → данные из 5m/1h блоков, latency запроса < 5s
```

**Проверь себя:** `thanos tools bucket ls --objstore.config-file=... | head` показывает блоки с `downsampling` в метаданных; дашборд за год строится < 10s.

**Разбор:** паттерн «горячее локально, холодное в S3»: Prometheus отвечает за свежие данные и алерты, Thanos — за историю. Ruler/правила остаются на локальном Prometheus, глобальные — в Thanos Ruler.

---

*Следующая подтема: [20.3 Секреты и runtime-безопасность](03-secrets-runtime-security.md)*
