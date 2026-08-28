# 🌐 08. Python: FastAPI для Платформенных Сервисов

> Уровень: Senior. Цель: платформенный API, который держит 1k RPS, не теряет webhook'и, корректно шатдаунится, наблюдаем и безопасен. FastAPI + Pydantic v2 + async, health/ready/metrics, graceful shutdown, KServe supplement.

## 🎯 Где FastAPI в DevOps-мире

Не пользовательские веб-приложения, а: webhook-приёмники (GitLab/Grafana/Alertmanager), внутренние API платформы (обёртки над K8s/Vault), health/metrics-эндпоинты операторов, callback-сервисы CI, KServe inference supplement.

```mermaid
flowchart LR
    G["GitLab webhook<br/>merge request"] --> F["FastAPI /webhooks/merge"]
    A["Alertmanager"] --> F2["FastAPI /webhooks/alert"]
    F --> Q["фоновая обработка<br/>BackgroundTasks / очередь"]
    F2 --> T["Telegram/Slack notify"]
    K["K8s probes"] --> H["/healthz /readyz /metrics"]
```

**Почему FastAPI:** Pydantic-валидация до вашей логики (422 до кода), `async def` + `httpx.AsyncClient` для 10k соединений, автодокументация `/docs`, типизация для mypy.

## ⚙️ Минимальный сервис с типизацией и валидацией

```python
import hashlib
import hmac
import os

import uvicorn
from fastapi import BackgroundTasks, FastAPI, Header, HTTPException, Request, status
from pydantic import BaseModel, Field

app = FastAPI(title="Deploy Trigger API", version="1.0.0")


class MergeEvent(BaseModel):
    object_kind: str
    project: dict
    object_attributes: dict = Field(..., alias="object_attributes")
    model_config = {"populate_by_name": True}


@app.post("/webhooks/gitlab", status_code=status.HTTP_202_ACCEPTED)
async def gitlab_webhook(
    request: Request,
    event: MergeEvent,
    background: BackgroundTasks,
    x_gitlab_token: str = Header(alias="X-Gitlab-Token"),
):
    verify_token(x_gitlab_token)
    if event.object_kind != "merge_request":
        return {"ignored": event.object_kind}
    background.add_task(process_merge, event.model_dump())
    return {"queued": True}


def verify_token(token: str) -> None:
    expected = os.environ.get("GITLAB_WEBHOOK_TOKEN", "")
    if not hmac.compare_digest(token, expected):
        raise HTTPException(status_code=401, detail="bad token")


def process_merge(evt: dict) -> None:
    print(f"process {evt}")


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.get("/readyz")
async def readyz():
    # readiness проверяет зависимости:
    if not await db_is_ready():
        raise HTTPException(status_code=503, detail="db not ready")
    return {"status": "ready"}


async def db_is_ready() -> bool:
    return True


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
```

Ключевое: **async-обработчики + Pydantic-валидация тела** = невалидный payload отбивается 422 до вашей логики; `alias` принимает snake/camel без ручных преобразований.

### Pydantic v2 — границы системы

```python
from pydantic import BaseModel, Field, field_validator, ConfigDict

class DeployRequest(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid", str_strip_whitespace=True)
    image: str = Field(pattern=r"^[\w./-]+:[\w.-]+$", description="image:tag, latest запрещён")
    replicas: int = Field(ge=1, le=50, default=3)
    env: str = Field(default="prod", pattern=r"^(dev|stage|prod)$")
    dry_run: bool = False

    @field_validator("image")
    @classmethod
    def no_latest(cls, v: str) -> str:
        if v.endswith(":latest"):
            raise ValueError("latest запрещён политикой, укажите semver тег")
        return v

# Использование — валидация на входе:
# @app.post("/deploy")
# def deploy(req: DeployRequest): ...
# Невалидный JSON -> 422 с деталями, без вашего кода
```

## 🔐 Аутентификация webhook'ов

```python
import hashlib
import hmac
import os
import time

from fastapi import Header, HTTPException


def verify_token(token: str) -> None:
    expected = os.environ.get("GITLAB_WEBHOOK_TOKEN", "")
    if not hmac.compare_digest(token, expected):
        raise HTTPException(status_code=401, detail="bad token")
        # compare_digest — constant-time, против timing-атак. НЕ == !


def verify_signature(body: bytes, sig_header: str) -> None:
    # Подпись GitHub-style: X-Hub-Signature-256 = sha256 HMAC тела секретом
    secret = os.environ.get("SECRET", "").encode()
    expected = "sha256=" + hmac.new(secret, body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, sig_header):
        raise HTTPException(status_code=401, detail="invalid signature")


# Защита от replay — проверка timestamp:
def verify_timestamp(ts_header: str, tolerance: int = 300) -> None:
    try:
        ts = int(ts_header)
    except ValueError:
        raise HTTPException(status_code=400, detail="bad timestamp") from None
    if abs(time.time() - ts) > tolerance:
        raise HTTPException(status_code=401, detail="stale request")
```

Плюс защита от replay: проверка заголовка `X-Gitlab-Event-UUID`/timestamp на свежесть, хранение UUID в Redis с TTL.

```python
from fastapi import Depends, Header, HTTPException


def require_api_key(x_api_key: str = Header(...)):
    if not hmac.compare_digest(x_api_key, os.environ["API_KEY"]):
        raise HTTPException(status_code=401, detail="bad api key")
    return x_api_key


@app.post("/deploy", dependencies=[Depends(require_api_key)])
async def deploy(req: DeployRequest):
    return {"ok": True}
```

## 🧵 Фоновые задачи vs очередь

| Механизм | Гарантии | Потеря при рестарте | Когда |
|---|---|---|---|
| `BackgroundTasks` | in-process, теряются при рестарте | да | быстрые действия, потеря некритична |
| ARQ/Dramatiq/Celery + Redis/RabbitMQ | персистентность, ретраи, DLQ | нет | обязательная доставка (деплой, биллинг) |
| Kafka | лог событий, реплей | нет | аудит/интеграции, event sourcing |
| `asyncio.create_task` | in-process | да | fire-and-forget внутри запроса |

Webhook-обработчики должны отвечать **быстро** (<5 сек, иначе отправитель отменит соединение): принять → ACK 202 → обработать асинхронно.

```python
from fastapi import BackgroundTasks

def send_slack(msg: str):
    import httpx
    httpx.post(os.environ["SLACK_WEBHOOK"], json={"text": msg}, timeout=5)

@app.post("/webhooks/alert")
async def alert_webhook(payload: dict, background: BackgroundTasks):
    background.add_task(send_slack, f"alert: {payload.get('labels')}")
    return {"queued": True}

# Для критичных — очередь:
import arq

async def deploy_task(ctx, image: str, env: str):
    await do_deploy(image, env)

class WorkerSettings:
    functions = [deploy_task]
    redis_settings = arq.connections.RedisSettings(host="redis.prod.svc")

@app.post("/deploy")
async def deploy(req: DeployRequest, request: Request):
    redis = request.app.state.redis
    await redis.enqueue_job("deploy_task", req.image, req.env)
    return {"queued": True}
```

**Graceful shutdown:** uvicorn сам дождётся завершения in-flight запросов (`--timeout-graceful-shutdown 30`); фоновые задачи — только через внешнюю очередь, иначе рестарт их убивает. `BackgroundTasks` не дождутся завершения при SIGTERM если `timeout-graceful-shutdown` истёк.

## 📊 Observability из коробки

```python
import time

from fastapi import Request
from prometheus_client import Counter, Histogram, make_asgi_app

REQUESTS = Counter("api_requests_total", "HTTP requests", ["method", "path", "code"])
LATENCY = Histogram("api_latency_seconds", "Latency", ["path"])
INFLIGHT = Histogram("api_inflight", "inflight", ["path"])


@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    # Используйте route.path, не url.path — иначе кардинальность взорвётся!
    route = request.scope.get("route")
    path = route.path if route and hasattr(route, "path") else request.url.path
    REQUESTS.labels(request.method, path, str(response.status_code)).inc()
    LATENCY.labels(path).observe(time.perf_counter() - start)
    return response


app.mount("/metrics", make_asgi_app())

# Структурированные JSON-логи (для Loki/ELK): structlog или python-json-logger
import logging
from pythonjsonlogger import jsonlogger

handler = logging.StreamHandler()
handler.setFormatter(jsonlogger.JsonFormatter("%(asctime)s %(levelname)s %(name)s %(message)s %(correlation)s"))
logging.getLogger().handlers = [handler]
```

### Health probes — правильно

```python
from fastapi import FastAPI, HTTPException

app2 = FastAPI()

# Liveness — жив ли процесс (дешёвая, без зависимостей):
@app2.get("/healthz")
async def healthz():
    return {"status": "ok"}

# Readiness — готов ли принимать трафик (проверяет зависимости):
@app2.get("/readyz")
async def readyz():
    checks = {
        "db": await db_is_ready(),
        "redis": await redis_is_ready(),
        "k8s": await k8s_is_ready(),
    }
    if not all(checks.values()):
        raise HTTPException(status_code=503, detail={"checks": checks})
    return {"status": "ready", "checks": checks}

# Отдельный startup probe — для медленного старта (миграции):
@app2.get("/startupz")
async def startupz():
    if not app2.state.started:
        raise HTTPException(status_code=503, detail="starting")
    return {"status": "started"}
```

**Kubernetes:**

```yaml
livenessProbe: {httpGet: {path: /healthz, port: 8080}, initialDelaySeconds: 5, periodSeconds: 10}
readinessProbe: {httpGet: {path: /readyz, port: 8080}, initialDelaySeconds: 5, periodSeconds: 5}
startupProbe: {httpGet: {path: /startupz, port: 8080}, failureThreshold: 30, periodSeconds: 5}
# liveness падает -> kubelet рестартит pod
# readiness падает -> endpoint удаляется, трафик не идёт, но pod не рестартит
```

### Graceful shutdown — детально

```python
import asyncio
import signal
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup:
    pool = await create_db_pool()
    app.state.pool = pool
    app.state.redis = await create_redis()
    print("startup done")
    yield
    # shutdown — дождаться завершения:
    print("shutdown: draining...")
    await pool.close()
    await app.state.redis.close()
    # дать BackgroundTasks 5 сек:
    await asyncio.sleep(5)
    print("shutdown done")

app3 = FastAPI(lifespan=lifespan)

# Uvicorn:
# uvicorn app:app --host 0.0.0.0 --port 8080 --workers 2 --proxy-headers --timeout-graceful-shutdown 30
# --workers >1 — несколько процессов, каждый со своим loop (GIL обходится)
# --proxy-headers — доверять X-Forwarded-For за Ingress
```

**KServe supplement:** FastAPI как обёртка над моделью — `/v1/models/{name}:predict` принимает JSON, валидирует Pydantic, батчит, метрики latency, `/healthz` для Knative.

---

## 📁 Файлы, ОС, система — для сервиса

```python
import pathlib
import shutil
import tempfile
import signal
import resource
import os

# Временный файл для загрузки артефакта (не грузить в память!):
from fastapi import UploadFile

@app.post("/artifacts")
async def upload_artifact(file: UploadFile):
    # Потоково на диск:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".tar.gz") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    # Обработка:
    try:
        process_artifact(pathlib.Path(tmp_path))
    finally:
        pathlib.Path(tmp_path).unlink(missing_ok=True)
    return {"ok": True}

# Disk check — перед приёмом большого файла:
total, used, free = shutil.disk_usage("/tmp")
if free < 1024**3:
    raise HTTPException(status_code=507, detail="low disk")

# FD лимиты — для 1k RPS:
soft, hard = resource.getrlimit(resource.RLIMIT_NOFILE) if hasattr(resource, "getrlimit") else (1024, 4096)
print(f"FD {soft}/{hard}")

# Signals — uvicorn обрабатывает SIGTERM сам, но для lifespan:
# см. lifespan выше

# Subprocess — вызов helm/kubectl из сервиса (с таймаутом и группами):
import subprocess
def helm_upgrade(release: str, chart: str):
    result = subprocess.run(
        ["helm", "upgrade", "--install", release, chart, "--atomic", "--timeout", "5m"],
        capture_output=True, text=True, timeout=360, check=False
    )
    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=result.stderr[:500])
    return result.stdout
```

### File locking — для миграций

```python
from filelock import FileLock
import pathlib

@app.on_event("startup")
async def run_migrations():
    # Только один воркер должен мигрировать:
    with FileLock("/tmp/migrate.lock", timeout=0):
        import subprocess
        subprocess.run(["alembic", "upgrade", "head"], check=True, timeout=60)
```

---

## 🌐 Networking глубоко — сервис

```python
import socket
import ssl
import ipaddress

# TCP health — проверить БД перед ready:
def is_db_reachable(host: str, port: int, timeout: float = 2) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False

# Unix socket — для sidecar (Envoy, local cache):
sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
try:
    sock.connect("/var/run/app.sock")
    sock.sendall(b"GET /cache HTTP/1.0\r\n\r\n")
    data = sock.recv(4096)
except OSError:
    pass
finally:
    sock.close()

# TLS — не отключать verify в проде:
import httpx
# verify=True — дефолт, проверяет сертификат K8s API, Vault
client = httpx.AsyncClient(verify=True, timeout=5)
# Для mTLS — клиентский сертификат:
# client = httpx.AsyncClient(cert=("/cert/tls.crt", "/cert/tls.key"), verify="/cert/ca.crt")

# DNS — кэш и таймауты:
# httpx по умолчанию резолвит каждый раз; для высокой нагрузки — кастом transport с кэшем
# или используйте K8s Service DNS (coredns) — он быстрый

# Rate limiting — защита от перегрузки:
from slowapi import Limiter
from slowapi.util import get_remote_address
limiter = Limiter(key_func=get_remote_address)

@app.get("/api/heavy")
@limiter.limit("10/minute")
async def heavy(request: Request):
    return {"ok": True}
```

### Port checker / health checker для K8s

```python
import httpx
import time

async def wait_for_dependency(url: str, timeout: float = 30):
    deadline = time.monotonic() + timeout
    async with httpx.AsyncClient(timeout=2) as client:
        while time.monotonic() < deadline:
            try:
                r = await client.get(url)
                if r.status_code == 200:
                    return True
            except (httpx.ConnectError, httpx.TimeoutException):
                pass
            await asyncio.sleep(1)
    raise TimeoutError(f"{url} not ready")
```

---

## 🚨 Exceptions глубоко

```python
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

# Иерархия для сервиса:
class AppError(Exception):
    status_code = 500
    def __init__(self, detail: str):
        self.detail = detail

class NotFoundError(AppError):
    status_code = 404

class ConflictError(AppError):
    status_code = 409

class RetryableError(AppError):
    status_code = 503

# Глобальные хендлеры — low->domain->API:
@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail, "type": exc.__class__.__name__})

@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

# Chaining:
async def fetch_row():
    try:
        row = await db.fetch_one("SELECT ...")
        return row
    except psycopg.OperationalError as e:
        raise RetryableError("db unavailable") from e

# ExceptionGroup — для батч-операций:
async def deploy_all():
    errors = []
    for svc in ["web", "api"]:
        try:
            await deploy(svc)
        except Exception as e:
            errors.append(e)
    if errors:
        raise ExceptionGroup("deploy failures", errors)

@app.post("/deploy/batch")
async def deploy_batch(services: list[str]):
    results = []
    for svc in services:
        try:
            await deploy(svc)
            results.append({"service": svc, "status": "ok"})
        except AppError as e:
            results.append({"service": svc, "status": "error", "detail": e.detail})
    # 207 Multi-Status для частичного успеха:
    if any(r["status"] == "error" for r in results):
        return JSONResponse(status_code=207, content={"results": results})
    return {"results": results}
```

### except* (3.11+)

```python
try:
    raise ExceptionGroup("eg", [RetryableError("timeout"), NotFoundError("missing")])
except* RetryableError as eg:
    # ретрай
    print(f"retryable: {eg.exceptions}")
except* NotFoundError as eg:
    print(f"not found: {eg.exceptions}")
```

---

## 📝 Logging глубоко

```python
import logging
import sys
import uuid
import contextvars
from pythonjsonlogger import jsonlogger

correlation_id = contextvars.ContextVar("correlation_id", default="-")

@app.middleware("http")
async def add_correlation(request: Request, call_next):
    cid = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
    correlation_id.set(cid)
    response = await call_next(request)
    response.headers["X-Request-ID"] = cid
    return response

class CorrelationFilter(logging.Filter):
    def filter(self, record):
        record.correlation = correlation_id.get()
        return True

handler = logging.StreamHandler(sys.stderr)
handler.setFormatter(jsonlogger.JsonFormatter(
    "%(asctime)s %(levelname)s %(name)s %(message)s %(correlation)s %(pathname)s %(lineno)d"
))
handler.addFilter(CorrelationFilter())
logging.getLogger().handlers = [handler]
logging.getLogger().setLevel(logging.INFO)
logging.getLogger("uvicorn.access").handlers = [handler]

# Маскирование:
class MaskFilter(logging.Filter):
    def filter(self, record):
        msg = record.getMessage()
        for word in ["password", "token", "secret", "authorization"]:
            if word in msg.lower():
                msg = msg.replace(word, "***")
        record.msg = msg
        record.args = ()
        return True

# Использование:
logger = logging.getLogger("api.deploy")
logger.info("deploy image=%s env=%s cid=%s", "web:1.42", "prod", correlation_id.get())
# Не логгировать тело webhook'а целиком если там секреты!
```

**Контейнер:** логи в stderr JSON → Fluent Bit/DaemonSet → Loki/ELK. Ротация — на ноде (`containerLogMaxSize`), не в приложении. Уровни: `DEBUG` только в dev, `INFO` в проде, `WARNING` для деградаций.

---

## 🔒 Security

```python
# Секреты — из Vault / K8s Secret volume, не из кода:
import pathlib
db_pass = pathlib.Path("/var/run/secrets/db/password").read_text().strip() if pathlib.Path("/var/run/secrets/db/password").exists() else os.environ.get("DB_PASS", "")

# Command injection — если сервис вызывает subprocess:
import shlex, subprocess
user_branch = "main; rm -rf /"
# subprocess.run(f"git checkout {user_branch}", shell=True)  # RCE!
subprocess.run(["git", "checkout", user_branch])  # безопасно — аргумент

# Path traversal — если отдаёте файлы:
from pathlib import Path
def safe_file(base: Path, user: str) -> Path:
    p = (base / user).resolve()
    if not str(p).startswith(str(base.resolve())):
        raise HTTPException(status_code=400, detail="invalid path")
    return p

# SSRF — если фетчите URL из запроса:
import ipaddress, socket, urllib.parse
def block_private(url: str):
    host = urllib.parse.urlparse(url).hostname
    ip = ipaddress.ip_address(socket.gethostbyname(host))
    if ip.is_private or ip.is_loopback or ip.is_link_local:
        raise HTTPException(status_code=400, detail="private URL blocked")

# Unsafe YAML/pickle:
import yaml
# yaml.safe_load(request.body)  # не yaml.load!
# pickle.loads(user_data)  # никогда!

# TLS:
import httpx
client = httpx.AsyncClient(verify=True)  # не verify=False

# Dependency scan:
# pip-audit --desc
# trivy fs --severity HIGH,CRITICAL .
# dependabot / renovate

# Rate limiting + CORS:
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware, allow_origins=["https://app.company.com"], allow_methods=["GET","POST"])
```

---

## 📊 Data processing — стриминг

```python
import csv
import gzip
import json
import io
from fastapi import UploadFile
from fastapi.responses import StreamingResponse

# Потоковый ответ — большой CSV:
def iter_csv_rows():
    yield "host,ip\n"
    for i in range(100000):
        yield f"web-{i},10.0.0.{i%255}\n"

@app.get("/export")
async def export_csv():
    return StreamingResponse(iter_csv_rows(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=hosts.csv"})

# Загрузка большого файла — не в память:
@app.post("/upload")
async def upload(file: UploadFile):
    with gzip.open("/tmp/upload.gz", "wb") as gz:
        while chunk := await file.read(1024*1024):
            gz.write(chunk)
    return {"size": file.size}

# JSON streaming:
import ijson
@app.post("/ingest")
async def ingest(file: UploadFile):
    # ijson парсит потоком
    count = 0
    for item in ijson.items(file.file, "item"):
        count += 1
    return {"count": count}

# TOML/YAML:
import yaml, tomllib
with open("config.yaml", encoding="utf-8") as f:
    cfg = yaml.safe_load(f)
```

---

## 🗄️ Databases — psycopg / SQLAlchemy для сервиса

```python
import psycopg_pool
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

# psycopg async pool:
pool = psycopg_pool.AsyncConnectionPool(
    "host=db.prod.svc dbname=app user=app password=secret connect_timeout=5",
    min_size=2, max_size=10, timeout=5
)

# SQLAlchemy async:
engine = create_async_engine(
    "postgresql+asyncpg://app:secret@db.prod.svc/app",
    pool_size=10, max_overflow=5, pool_timeout=5, pool_pre_ping=True
)
AsyncSession = async_sessionmaker(engine, expire_on_commit=False)

@app.get("/users/{uid}")
async def get_user(uid: int):
    async with AsyncSession() as session:
        result = await session.execute(text("SELECT * FROM users WHERE id=:id"), {"id": uid})
        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="not found")
        return dict(row._mapping)

# Транзакции + retries + timeout:
async def create_deploy(image: str):
    for attempt in range(3):
        try:
            async with AsyncSession() as session:
                async with session.begin():
                    await session.execute(text("SET LOCAL statement_timeout='5s'"))
                    await session.execute(text("INSERT INTO deploys(image) VALUES (:img)"), {"img": image})
                await session.commit()
            break
        except Exception as e:
            if "serialization" in str(e).lower() and attempt < 2:
                import asyncio; await asyncio.sleep(0.1 * 2**attempt)
                continue
            raise

# Миграции:
# alembic revision --autogenerate -m "add deploys"
# alembic upgrade head — в initContainer или startup lifespan с FileLock
```

---

## 🔭 Observability — полная

```python
from prometheus_client import Counter, Histogram
from opentelemetry import trace

REQUESTS = Counter("http_requests_total", "requests", ["method","path","code"])
LATENCY = Histogram("http_latency_seconds", "latency", ["path"])
tracer = trace.get_tracer("api")

@app.middleware("http")
async def tracing_middleware(request: Request, call_next):
    with tracer.start_as_current_span(f"{request.method} {request.url.path}") as span:
        span.set_attribute("http.method", request.method)
        response = await call_next(request)
        span.set_attribute("http.status_code", response.status_code)
        return response

# /metrics — уже смонтирован
# /healthz /readyz — см. выше
# Логи — JSON с correlation
# Трейсы — OTLP -> Jaeger/Tempo
```

---

## 🔄 CI/CD

```yaml
stages: [lint, test, security, build, publish]

lint:
  stage: lint
  image: ghcr.io/astral-sh/uv:python3.12-bookworm-slim
  script:
    - uv sync --frozen
    - uv run ruff format --check .
    - uv run ruff check .
    - uv run mypy src --strict
    - uv run pyright --stats

unit:
  stage: test
  script:
    - uv run pytest tests/unit -q --cov=src --cov-fail-under=80 -n auto
    # TestClient без сети

integration:
  stage: test
  services: [postgres:16-alpine, redis:7-alpine]
  script:
    - uv run pytest tests/integration -q --timeout=30
    # testcontainers для БД

security:
  stage: security
  script:
    - uv run pip-audit --desc
    - trivy fs --severity HIGH,CRITICAL --exit-code 1 .
    - uv run bandit -r src

build:
  stage: build
  script:
    - uv build
    - cyclonedx-py environment -o sbom.json
  artifacts: {paths: [dist/, sbom.json]}

container:
  stage: build
  image: docker:24
  services: [docker:24-dind]
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - trivy image --exit-code 1 $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - cosign sign --yes $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

publish:
  stage: publish
  script:
    - uv publish --trusted-publishing always
  rules: [{if: '$CI_COMMIT_TAG'}]
```

```dockerfile
FROM python:3.12-slim
RUN pip install --no-cache-dir fastapi uvicorn[standard] httpx prometheus-client
COPY app.py /
USER 65534:65534
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "2", "--proxy-headers", "--timeout-graceful-shutdown", "30"]
HEALTHCHECK CMD curl -f http://localhost:8080/healthz || exit 1
```

---

## 💥 Failure modes — сервис

| Симптом | Причина | Диагностика | Лечение |
|---|---|---|---|
| `422 Unprocessable` | Pydantic validation | логи `RequestValidationError` | поправить схему, проверить alias |
| `502 Bad Gateway` за Ingress | readiness падает | `kubectl describe pod` | readiness не должен зависеть от внешних 5xx |
| `BackgroundTasks lost` | рестарт pod | логи | очередь Redis вместо BackgroundTasks |
| `OSError: too many open files` | утечка соединений | `lsof` | `async with AsyncClient` |
| `Blocking call in loop` | `time.sleep` в async | `py-spy dump` | `await asyncio.sleep` |
| `CORS blocked` | неверный `allow_origins` | browser console | `CORSMiddleware` |
| `TLS verify failed` | `verify=False` забыли убрать | `httpx` error | `verify=True` + CA bundle |

---

## 🧪 Тесты и деплой

```python
from fastapi.testclient import TestClient

client = TestClient(app)


def test_webhook_rejects_bad_token(monkeypatch):
    monkeypatch.setenv("GITLAB_WEBHOOK_TOKEN", "real")
    r = client.post("/webhooks/gitlab", headers={"X-Gitlab-Token": "wrong"}, json={"object_kind": "push", "project": {}, "object_attributes": {}})
    assert r.status_code == 401


def test_webhook_queues_work(mocker, monkeypatch):
    monkeypatch.setenv("GITLAB_WEBHOOK_TOKEN", "real")
    mocker.patch("app.process_merge")
    r = client.post(
        "/webhooks/gitlab",
        headers={"X-Gitlab-Token": "real"},
        json={"object_kind": "merge_request", "project": {"id": 1}, "object_attributes": {"id": 1}},
    )
    assert r.status_code == 202
    assert r.json() == {"queued": True}


def test_healthz():
    r = client.get("/healthz")
    assert r.status_code == 200
```

```dockerfile
FROM python:3.12-slim
RUN pip install --no-cache-dir fastapi uvicorn[standard] httpx prometheus-client
COPY app.py /
USER 65534:65534
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "2", "--proxy-headers", "--timeout-graceful-shutdown", "30"]
```

За Ingress — rate-limit; за LB — healthcheck на `/healthz`; readiness отличать от liveness (readiness проверяет зависимости, liveness — только живость процесса).

---

## 🧪 Лаборатория

### Lab 1 — webhook с подписью и очередью

```bash
uv init fastapi-lab && cd fastapi-lab
uv add fastapi uvicorn[standard] httpx
uv add --dev pytest httpx
```

```python
# app.py
import hmac, os, hashlib
from fastapi import FastAPI, Header, HTTPException, Request

app = FastAPI()
SECRET = b"dev-secret"

@app.post("/hook")
async def hook(request: Request, x_sig: str = Header(alias="X-Sig")):
    body = await request.body()
    exp = "sha256=" + hmac.new(SECRET, body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(exp, x_sig):
        raise HTTPException(status_code=401, detail="bad sig")
    return {"ok": True}
```

Тест: `curl -X POST http://localhost:8000/hook -H "X-Sig: sha256=..." -d '{"a":1}'`.

### Lab 2 — health/ready/metrics + graceful shutdown

```python
# lab_health.py
from fastapi import FastAPI
from prometheus_client import Counter, make_asgi_app

app = FastAPI()
REQS = Counter("reqs_total", "total")

@app.get("/healthz")
async def hlz(): return {"status":"ok"}

@app.get("/readyz")
async def rdz():
    # имитация зависимости:
    import random
    if random.random() < 0.1:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="db down")
    return {"status":"ready"}

app.mount("/metrics", make_asgi_app())
# uvicorn lab_health:app --port 8080
# curl localhost:8080/healthz; curl localhost:8080/metrics | grep reqs
```

### Lab 3 — file upload streaming + CSV export

```python
from fastapi import FastAPI, UploadFile
from fastapi.responses import StreamingResponse
import shutil, tempfile, pathlib

app = FastAPI()

@app.post("/upload")
async def upload(file: UploadFile):
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        shutil.copyfileobj(file.file, tmp)
        path = tmp.name
    size = pathlib.Path(path).stat().st_size
    pathlib.Path(path).unlink()
    return {"size": size}

@app.get("/export")
async def export():
    def gen():
        yield "id,value\n"
        for i in range(1000):
            yield f"{i},{i*2}\n"
    return StreamingResponse(gen(), media_type="text/csv")
```

---

## ✅ Проверь себя

> Отвечай вслух до раскрытия ответа. Если «не помню» — вернись к разделу.

**В1. Почему webhook-эндпоинт обязан отвечать быстро и как это обеспечить?**
<details><summary>Ответ</summary>
Отправитель (GitLab/Alertmanager) держит таймаут ~10 сек и может считать доставку неудачной при медленной обработке, ретраями создавая дубликаты. Паттерн: валидировать+ACK 202 мгновенно, работу уносить в BackgroundTasks/очередь.
</details>

**В2. Чем `hmac.compare_digest` лучше обычного `==` для проверки токенов?**
<details><summary>Ответ</summary>
== сравнивает байты до первого расхождения — время ответа утечёт длину совпадающего префикса (timing attack), позволяя подобрать токен по символам. compare_digest выполняется за константное время независимо от позиции несовпадения.
</details>

**В3. Что произойдёт с BackgroundTasks при рестарте pod'а?**
<details><summary>Ответ</summary>
Они умрут вместе с процессом — гарантий нет. Для критичных операций (деплой, начисления) нужна внешняя очередь с персистентностью и ретраями (Redis/RabbitMQ); BackgroundTasks годятся для «best effort» вроде кэш-инвалидации.
</details>

**В4. Зачем middleware собирает метрики по route.path, а не по request.url.path?**
<details><summary>Ответ</summary>
URL содержит конкретные id (/deploys/web-123) — кардинальность меток взорвёт Prometheus. Route-паттерн (/deploys/{name}) даёт ограниченный набор серий. Правило метрик: никаких user-specific значений в labels.
</details>

**В5. Чем readiness отличается от liveness в контексте FastAPI-сервиса?**
<details><summary>Ответ</summary>
Liveness — «процесс жив» (дешёвая проверка, падение = рестарт). Readiness — «могу принимать трафик»: включает проверку зависимостей (БД, Redis). Если БД лежит, liveness оставляет под живым (не рестартует зря), а readiness выводит его из балансировки.
</details>

**В6. Что сломает `yaml.load` и почему в FastAPI нельзя парсить YAML из запроса через него?**
<details><summary>Ответ</summary>
`yaml.load` с дефолтным Loader'ом исполняет Python-объекты (`!!python/object`) — RCE. Внешний YAML только `safe_load`. В FastAPI — Pydantic + JSON, YAML только для конфигов на диске.
</details>

**В7. Как предотвратить SSRF если сервис фетчит URL из тела webhook'а?**
<details><summary>Ответ</summary>
Блокировать private IP ranges (`is_private/is_loopback`), allowlist доменов, `verify=True`, таймаут 3с, `follow_redirects=False` (редирект на 169.254.169.254). Валидировать до `httpx.get`.
</details>

**В8. Почему `subprocess.run(f"helm upgrade {user}", shell=True)` в сервисе — критично и как правильно?**
<details><summary>Ответ</summary>
Инъекция: `user="x; rm -rf /"` выполнит вторую команду. Правильно — список `["helm","upgrade",user]` без shell; если нужен shell — `shlex.quote`. Плюс таймаут и `capture_output`.
</details>

**В9. Чем `StreamingResponse` лучше `return FileResponse(open(...).read())` для 1GB файла?**
<details><summary>Ответ</summary>
`read()` грузит весь файл в память → OOM. `StreamingResponse` отдаёт чанками (генератор), O(1) памяти, не блокирует loop. Аналогично загрузка — `shutil.copyfileobj(file.file, tmp)` потоком.
</details>

**В10. Как реализовать graceful shutdown чтобы не потерять in-flight запросы?**
<details><summary>Ответ</summary>
`lifespan` контекстный менеджер для startup/shutdown, `uvicorn --timeout-graceful-shutdown 30` ждёт завершения запросов, `BackgroundTasks` заменить на очередь для критичных, `pool.close()` в shutdown. Тест: `kill -TERM` и проверить что 202 запросы дождались.
</details>

---

*Что дальше:* [09. Boto3 и AWS SDK deep](09-python-boto3-moto-deep.md) · [07. Kopf-операторы](07-python-kubernetes-kopf-operators.md)
