# ⚖️ 11. Python vs Go: выбор для DevOps / SRE / Platform

> Не «что лучше», а «что когда». Python — клей для API и быстрой автоматизации. Go — статичный бинарник для агентов, контроллеров, CLI, экспортеров.

## 📊 Матрица задач

| Задача | Python | Go | Почему |
|---|---|---|---|
| Quick automation (скрипт 50 строк) | **+++** | ++ | REPL, богатая stdlib, меньше церемонии |
| CLI с subcommands, конфигами, JSON | ++ | **+++** | Cobra, статический бинарник, cross-compile 10s |
| Long-running agent (DaemonSet) | ++ | **+++** | Go — <20MB RSS, нет GC-пауз GIL, один бинарник |
| API client (GitLab/K8s/Prometheus) | **+++** | **+++** | Оба сильны: `httpx+moto` vs `net/http+client-go` |
| Kubernetes controller / operator | + | **+++** | `controller-runtime` — Go-нативен; Python `kopf` — для простых |
| Data processing (JSON/YAML/CSV 20GB) | **+++** | ++ | `ijson` streaming vs Go `encoding/json` + `json.RawMessage` |
| CPU-bound (хеши, парсинг) | ++ | **+++** | GIL ограничивает threads, free-threaded ещё в preview |
| Glue scripting (jq/sed → Python) | **+++** | + | `os.pipe` + `subprocess` vs `os/exec` ceremony |
| Static binary (scratch) | - | **+++** | `CGO_ENABLED=0 go build -trimpath -ldflags="-s -w"` → scratch |
| Fast startup (initContainer) | ++ (200ms) | **+++** (5ms) | CPython import, Go — native |

## 🔬 Trade-offs детально

### Старт, память, доставка

```bash
# Python: нужен интерпретатор + venv + зависимости 80MB
FROM python:3.12-slim
COPY requirements.txt . && pip install -r requirements.txt
COPY app.py .
CMD ["python","app.py"]  # 80MB + startup 0.2s

# Go: scratch 7MB
FROM golang:1.22 AS build
COPY . . && CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /app
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /app /app
CMD ["/app"]  # 7MB, startup 0.005s, сигналы PID 1 корректно
```

### Ошибки и API

| Аспект | Python | Go |
|---|---|---|
| Модель | Исключения `try/except` + `raise` (дорого, но гибко) | `if err != nil` (явно, но verboseness) |
| Контекст | `raise from` цепочка, `ExceptionGroup`, `add_note` | `%w` + `errors.Is/As`, `errors.Join` |
| Transient | `tenacity` retry | ручной `retryWithBackoff` + `IsRetryable(err)` |

### Concurrency

| Паттерн | Python | Go |
|---|---|---|
| I/O high fan-out (1000 HTTP) | `asyncio` + `httpx.AsyncClient` `Semaphore(100)` | `goroutine` + `errgroup.SetLimit(100)` + `net/http` |
| CPU-bound | `ProcessPoolExecutor` (pickle!) | `goroutine` без GIL, `GOMAXPROCS` |
| Backpressure | `asyncio.Queue(maxsize)` | `chan` buffered + `select` |

## 🧪 Когда что выбирать — реальные сценарии

**Сценарий 1: одноразовый `cleanup-old-images.py` (100 строк, вызывает Docker API, чистит ECR)**
→ **Python**: `boto3` + `argparse` за 30 мин, деплой как `uv run`. Go — оверхед.

**Сценарий 2: `node-exporter` подобный агент на каждом узле, 24/7, `DaemonSet`, scrape каждые 10с, 50MB лимит**
→ **Go**: `gopsutil` + `prometheus/client_golang` + `pprof`, один бинарник. Python — memory bloat, GIL.

**Сценарий 3: `kube-diagnose` — листит поды, watch events, диагностирует `Pending/CrashLoop`**
→ **Оба** валидны: Python `kubernetes` + `kopf` для быстрой диагностики, Go `client-go` + `informer` для performance/HA. Команда выбирает язык по навыку.

---

## ✅ Проверь себя

**В1. Почему Python `cpu-bound` медленнее Go, хотя PyPy/JIT есть?**

<details><summary>Ответ</summary>

GIL блокирует параллельные Python байткоды на одном ядре; JIT (PyPy) ускоряет но не убирает GIL. Go — true parallel на N ядрах без GIL. free-threaded Python 3.13 убирает GIL но ещё теряет 10-20% single-thread.

</details>

**В2. Когда Python всё равно выигрывает для long-running?**

<details><summary>Ответ</summary>

Когда время доминирует в `boto3`/`httpx`/`psycopg` I/O, а не в Python CPU: GIL отпускается в C-расширениях (`hashlib`, `json`, `lxml`). Тогда `asyncio` + `ThreadPool` дают ту же latency что Go, но код короче.

</details>

**В3. Почему Go бинарь лучше для scratch образа?**

<details><summary>Ответ</summary>

`CGO_ENABLED=0` static, нет динамических `libpython`, `scratch` + `nonroot` 7MB vs python 80MB, нет `site-packages` CVE, старт 5ms, сигналы PID 1 через `tini` не нужен.

</details>

**В4. Как избежать `typed nil != nil` в Go?**

<details><summary>Ответ</summary>

`var x interface{} = (*MyType)(nil); x != nil` т.к. интерфейс = `(type, data)` пара. Проверка: `if x == nil` ложно. Фикс: `return nil` а не `return (*MyType)(nil)` когда функция возвращает `error`/`interface`, или `if x == nil || reflect.ValueOf(x).IsNil()`.

</details>

**В5. Python vs Go для K8s оператора — критерий?**

<details><summary>Ответ</summary>

Go `controller-runtime` — нативен, performance, e2e тесты `envtest`, 100+ операторов пишут на Go. Python `kopf` — годится для простых (создать CR + reconcile 50 строк), но HA, leader election, webhooks — Go. Команда с Python-скиллом → `kopf` прототип за день, продакшн → Go.

</details>
