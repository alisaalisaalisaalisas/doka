# ⌨️ 06. Python: CLI-Приложения Инженерного Уровня

> Уровень: Senior. Цель: инструмент `devopsctl`, который не стыдно отдать в `cron` и в руки дежурному в 3 ночи: типизированный, идемпотентный, наблюдаемый, безопасный, тестируемый. Typer vs Click vs argparse, subcommands, каскад конфигурации, сигналы, JSON-вывод, упаковка.

## 🏗️ Выбор фреймворка

| Библиотека | Стиль | Зависимости | Когда брать |
|---|---|---|---|
| **argparse** | stdlib, многословный | 0 | скрипт без зависимостей, должен работать на голом Python |
| **click** | декораторы, группы | click | зрелый стандарт, экосистема плагинов, сложная вложенность |
| **typer** | type-hints поверх click ⚡ | typer+click | новый код: меньше boilerplate, типы из сигнатуры, автодокументация |
| **argcomplete** | дополнение | — | shell completion для argparse |

**Правило DevOps:** если инструмент — часть платформы (devopsctl), берите **Typer** (быстрее разработка, типы ловят баги до проде). Если скрипт одноразовый в базовом образе без pip — `argparse`.

### 06.1 argparse — bare metal

```python
import argparse
import pathlib
import sys

parser = argparse.ArgumentParser(prog="devopsctl", description="DevOps toolkit")
sub = parser.add_subparsers(dest="cmd", required=True)

p_roll = sub.add_parser("rollout", help="прокатить образ")
p_roll.add_argument("name", help="имя сервиса")
p_roll.add_argument("--image", "-i", required=True)
p_roll.add_argument("--replicas", "-r", type=int, default=3, choices=range(1, 51))
p_roll.add_argument("--dry-run", action="store_true")
p_roll.add_argument("--config", type=pathlib.Path, default=pathlib.Path("dtk.yaml"))

args = parser.parse_args()
if args.cmd == "rollout":
    print(args)
```

Плюсы: ноль зависимостей, контроль каждой детали. Минусы: валидация, help, completion — руками; 3× больше кода чем у Typer.

### 06.2 Click — декораторы и группы

```python
import click

@click.group()
@click.option("--verbose", "-v", count=True, help="уровень логирования")
@click.pass_context
def cli(ctx, verbose):
    ctx.ensure_object(dict)
    ctx.obj["verbose"] = verbose

@cli.command()
@click.argument("name")
@click.option("--image", "-i", required=True)
@click.option("--replicas", "-r", type=click.IntRange(1, 50), default=3)
@click.option("--dry-run", is_flag=True)
@click.pass_context
def rollout(ctx, name, image, replicas, dry_run):
    click.secho(f"rollout {name} -> {image} x{replicas}", fg="yellow" if dry_run else "green")

if __name__ == "__main__":
    cli()
```

Click хранит контекст в `ctx.obj`, поддерживает `click.testing.CliRunner`, chain-команды, плагины через entry points.

### 06.3 Typer — сигнатура функции = интерфейс CLI (рекомендуемый)

```python
import pathlib

import httpx
import typer
from typing_extensions import Annotated

app = typer.Typer(help="DevOps Toolkit — управление деплоями", no_args_is_help=True, add_completion=True)


@app.command()
def rollout(
    name: Annotated[str, typer.Argument(help="Имя сервиса")],
    image: Annotated[str, typer.Option("--image", "-i", help="Новый образ")],
    replicas: Annotated[int, typer.Option("--replicas", "-r", min=1, max=50)] = 3,
    env: Annotated[str, typer.Option(case_sensitive=False)] = "prod",
    dry_run: Annotated[bool, typer.Option("--dry-run")] = False,
    config: Annotated[pathlib.Path, typer.Option(exists=True, dir_okay=False)] = pathlib.Path("dtk.yaml"),
):
    """Прокатить новый образ на окружение."""
    cfg = load_config(config)
    if dry_run:
        typer.secho(f"DRY-RUN {name}: {image} -> {env}", fg=typer.colors.YELLOW)
        raise typer.Exit(code=0)
    result = do_rollout(name, image, replicas, env)
    typer.echo(f"✓ {result}")


@app.command()
def status(name: str):
    """Статус деплойментов."""
    for line in fetch_status(name):
        typer.echo(line)


if __name__ == "__main__":
    app()
```

```bash
dtk rollout web --image web:1.42 --replicas 5
dtk rollout --help          # автогенерация справки из docstring/типов
dtk --install-completion bash
```

**Почему Typer:** аннотация `Annotated[int, typer.Option(min=1,max=50)]` даёт и парсинг, и валидацию, и help, и автодополнение из одной строки. Ошибки типов ловит mypy.

## 🏛️ Архитектура devopsctl: проект инженерного уровня

```
devopsctl/
├── pyproject.toml          # uv / hatch, ruff, mypy, pytest
├── src/devopsctl/
│   ├── __init__.py
│   ├── cli.py              # Typer app + группы
│   ├── config.py           # каскад defaults < file < ENV < CLI
│   ├── rollout.py          # бизнес-логика (чистая, тестируемая)
│   ├── k8s.py              # адаптер к K8s API
│   ├── output.py           # JSON/table/YAML рендеры
│   ├── signals.py          # обработка SIGINT/SIGTERM
│   └── logging_conf.py     # JSON-логи, корреляция
├── tests/
│   ├── test_cli.py         # CliRunner
│   ├── test_rollout.py     # моки k8s
│   └── e2e/test_bin.py     # subprocess против собранного wheel
└── Dockerfile
```

`cli.py` тонкий: парсит аргументы → валидирует → вызывает чистую функцию из `rollout.py`. Бизнес-логика не знает про Typer — тестируется без CLI.

### Subcommands и вложенные группы

```python
import typer

app = typer.Typer()
k8s_app = typer.Typer(help="K8s операции")
db_app = typer.Typer(help="БД операции")
app.add_typer(k8s_app, name="k8s")
app.add_typer(db_app, name="db")


@k8s_app.command("rollout")
def k8s_rollout(name: str, image: str):
    print(f"rollout {name} {image}")


@k8s_app.command("logs")
def k8s_logs(name: str, follow: bool = False, tail: int = 100):
    print(f"logs {name} follow={follow} tail={tail}")


@db_app.command("migrate")
def db_migrate(dry_run: bool = False):
    print(f"migrate dry_run={dry_run}")

# Использование: devopsctl k8s rollout web --image web:1.42
#                devopsctl db migrate --dry-run
```

Контекст между командами — `typer.Context`:

```python
import pathlib

import typer

app = typer.Typer()


@app.callback()
def main(ctx: typer.Context, config: pathlib.Path = pathlib.Path("dtk.yaml"), verbose: int = 0):
    ctx.obj = {"config": load_config(config), "verbose": verbose}


@app.command()
def status(ctx: typer.Context):
    cfg = ctx.obj["config"]
    print(cfg)
```

---

## ⚙️ Конфигурация: каскад defaults < файл < ENV < CLI

Критично для DevOps: один бинарь работает локально, в CI и в проде без пересборки.

```python
import os
import pathlib
import tomllib

import yaml
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppConfig(BaseSettings):
    api_url: str = Field(default="http://localhost:8080")
    replicas: int = Field(default=3, ge=1, le=50)
    env: str = Field(default="dev")
    log_level: str = Field(default="INFO")
    model_config = SettingsConfigDict(env_prefix="DEVOPSECTL_", env_file=".env")


def load_config(path: pathlib.Path | None) -> AppConfig:
    cfg = AppConfig()
    if path and path.exists():
        if path.suffix == ".toml":
            data = tomllib.loads(path.read_text(encoding="utf-8"))
            inner = data.get("tool", {}).get("devopsctl", data)
            cfg = AppConfig.model_validate({**cfg.model_dump(), **inner})
        elif path.suffix in (".yaml", ".yml"):
            data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
            cfg = AppConfig.model_validate({**cfg.model_dump(), **data})
    return cfg
```

```toml
# ~/.config/devopsctl/config.toml  или ./dtk.toml
[tool.devopsctl]
api_url = "https://api.prod.local"
replicas = 5
env = "prod"
```

```bash
export DEVOPSECTL_API_URL=https://api.staging.local
export DEVOPSECTL_REPLICAS=10
devopsctl k8s rollout web --image web:1.42 --replicas 7  # CLI побеждает всё
```

**Приоритет:** `defaults (код) < config file < ENV < CLI flags`. Секреты только через ENV/Secret (не в файле, не в git).

### pydantic-settings vs руками

| Подход | Плюсы | Минусы |
|---|---|---|
| `pydantic-settings` | валидация, типы, env_file, nested | зависимость |
| `tomli + os.getenv` руками | ноль зависимостей | валидацию пишете сами |
| `dynaconf` | каскад из коробки | магия, сложнее типизировать |

---

## 🚦 Коды выхода и обработка ошибок

CLI вызывается из пайплайнов — **код выхода это API**:

| Код | Смысл | Пример |
|---|---|---|
| 0 | успех | всё применено |
| 1 | общая ошибка приложения | API недоступен |
| 2 | ошибка использования (argparse/click сами) | нет --image |
| 10 | timeout / недоступность | K8s API не ответил |
| 20 | partial failure | 3 из 5 сервисов обновлены |
| 30 | validation error | неверный image тег |
| 64 | неправильное использование (sysexits.h) | — |
| 130 | прервано SIGINT | Ctrl+C |

```python
import httpx
import typer


class ToolkitError(Exception):
    exit_code = 1


class PartialFailure(ToolkitError):
    exit_code = 20


class TimeoutError(ToolkitError):
    exit_code = 10


def main() -> None:
    try:
        app()
    except ToolkitError as e:
        typer.secho(f"error: {e}", fg="red", err=True)
        raise SystemExit(e.exit_code) from e
    except httpx.HTTPStatusError as e:
        typer.secho(f"API error {e.response.status_code}: {e.response.text[:200]}", fg="red", err=True)
        raise SystemExit(1) from e


# Частичный успех массовой операции:
successes = ["web"]
failures = ["api"]
if failures and successes:
    typer.secho(f"partial: {len(successes)} ok, {len(failures)} failed", fg="yellow", err=True)
    raise SystemExit(20)
```

**Failure mode:** пайплайн `set -e` убьёт job на любом не-0. Для partial нужен `allow_failure` или обработка кода в `after_script`.

---

## 📋 Logging vs stdout: разделение потоков

**Правило:** данные — в stdout (их пайпят в jq), диагностика — в stderr.

```python
import logging
import sys

import typer


def setup_logging(verbose: int, json_logs: bool = False) -> None:
    level = logging.WARNING - verbose * 10
    level = max(logging.DEBUG, level)
    handler = logging.StreamHandler(sys.stderr)
    if json_logs:
        handler.setFormatter(JsonFormatter())
    else:
        handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)


log = logging.getLogger("devopsctl.rollout")
log.info("scaling %s to %d", "web", 3)

# Машиночитаемый вывод для автоматизаций:
# devopsctl status web --output json | jq '.[].ready'
```

### JSON-вывод vs table

```python
import json
import sys

from rich.console import Console
from rich.table import Table


def output_result(data, fmt: str = "json"):
    if fmt == "json":
        json.dump(data, sys.stdout, ensure_ascii=False, indent=2)
        sys.stdout.write("\n")
    elif fmt == "table":
        console = Console(file=sys.stdout)
        t = Table(show_header=True)
        for k in data[0].keys():
            t.add_column(k)
        for row in data:
            t.add_row(*[str(row[k]) for k in row])
        console.print(t)
    elif fmt == "yaml":
        import yaml

        yaml.safe_dump(data, sys.stdout, allow_unicode=True)
```

```bash
devopsctl k8s status --output json | jq '.[] | select(.ready==false)'
devopsctl k8s status --output table --no-color | tee report.txt
NO_COLOR=1 devopsctl status  # уважение стандарта no-color.org
```

---

## 📁 Файлы, ОС, система — глубоко

### pathlib vs os.path

```python
import grp
import os
import pathlib
import pwd
import resource
import shutil
import stat
import tempfile

p = pathlib.Path("/etc/devopsctl/config.toml")
print(p.exists(), p.is_file(), p.parent, p.name, p.suffix)
print(p.read_text(encoding="utf-8") if p.exists() else "no file")
p2 = pathlib.Path("/tmp/demo.txt")
p2.write_text("key=val\n", encoding="utf-8")
p2.chmod(0o600)
tmp = p2.with_suffix(".tmp")
tmp.write_text("new content", encoding="utf-8")
tmp.replace(p2)

print(os.path.join("a", "b"))
print(pathlib.Path("a") / "b")

shutil.copy2("src.yaml", "dst.yaml") if pathlib.Path("src.yaml").exists() else None
print(shutil.which("kubectl"))

with tempfile.NamedTemporaryFile(mode="w", suffix=".yaml", delete=False, encoding="utf-8") as tf:
    tf.write("temp data")
    temp_name = tf.name
pathlib.Path(temp_name).unlink(missing_ok=True)

with tempfile.TemporaryDirectory() as td:
    work = pathlib.Path(td) / "clone"
    work.mkdir()
    print(work)

print(list(pathlib.Path(".").glob("**/*.yaml")))
st = pathlib.Path("secret.key").stat() if pathlib.Path("secret.key").exists() else None
if st:
    print(oct(stat.S_IMODE(st.st_mode)))

soft, hard = resource.getrlimit(resource.RLIMIT_NOFILE) if hasattr(resource, "getrlimit") else (0, 0)
print(f"FD limit {soft}/{hard}")

import getpass

print(getpass.getuser())
```

### Практика: process discovery, диск, права

```python
import os
import pathlib
import shutil
import sys

total, used, free = shutil.disk_usage("/var/backups" if pathlib.Path("/var/backups").exists() else "/")
if free < 10 * 1024**3:
    print("WARN: low disk", file=sys.stderr)

if os.geteuid() == 0 if hasattr(os, "geteuid") else False:
    print("WARN: running as root", file=sys.stderr)

# Process discovery без psutil — через /proc (Linux):
for pid in pathlib.Path("/proc").glob("[0-9]*") if pathlib.Path("/proc").exists() else []:
    try:
        cmd = (pid / "cmdline").read_bytes().replace(b"\x00", b" ").decode(errors="replace")
        if "devopsctl" in cmd:
            print(pid.name, cmd)
    except PermissionError:
        continue

# С psutil:
try:
    import psutil

    for proc in psutil.process_iter(["pid", "name", "cmdline"]):
        if "devopsctl" in " ".join(proc.info["cmdline"] or []):
            print(proc.info)
except ImportError:
    pass
```

### File locking — защита от двойного запуска

```python
import pathlib
import sys

try:
    import fcntl

    lock_path = pathlib.Path("/tmp/devopsctl.lock")
    lock_file = open(lock_path, "w", encoding="utf-8")
    try:
        fcntl.flock(lock_file, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        print("another instance running", file=sys.stderr)
        raise SystemExit(1) from None
    try:
        do_rollout()
    finally:
        fcntl.flock(lock_file, fcntl.LOCK_UN)
        lock_file.close()
except ImportError:
    pass

# Кроссплатформенно:
from filelock import FileLock

with FileLock("/tmp/devopsctl.lock", timeout=0):
    do_rollout()
```

### Сигналы — graceful shutdown в CLI

```python
import signal
import sys

shutdown = False


def handle_sigterm(signum, frame):
    global shutdown
    print(f"got signal {signum}, draining...", file=sys.stderr)
    shutdown = True


signal.signal(signal.SIGTERM, handle_sigterm)
signal.signal(signal.SIGINT, handle_sigterm)

work_queue = ["web", "api"]
for item in work_queue:
    if shutdown:
        print("interrupted, saving checkpoint", file=sys.stderr)
        raise SystemExit(130)
    print(f"process {item}")

# Typer — перехват:
import typer

app2 = typer.Typer()


@app2.command()
def deploy(name: str):
    def handler(sig, frame):
        typer.secho("cancelled by user", fg="yellow", err=True)
        raise SystemExit(130)

    signal.signal(signal.SIGINT, handler)
    signal.signal(signal.SIGTERM, handler)
    print(f"deploy {name}")
```

### Subprocess — запуск внешних команд безопасно

```python
import os
import shlex
import signal
import subprocess

# Правильно — список аргументов, без shell:
result = subprocess.run(
    ["kubectl", "rollout", "status", "deploy/web", "-n", "prod", "--timeout=60s"],
    capture_output=True,
    text=True,
    timeout=70,
    check=False,
)
print(result.stdout)
if result.returncode != 0:
    print(result.stderr)

# Popen для стриминга, таймаута, групп процессов:
proc = subprocess.Popen(
    ["kubectl", "logs", "-f", "deploy/web", "-n", "prod"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
    bufsize=1,
)
try:
    stdout, stderr = proc.communicate(timeout=30)
except subprocess.TimeoutExpired:
    proc.kill()
    stdout, stderr = proc.communicate()
    print("killed after timeout")

# Process groups — убить всё дерево:
proc2 = subprocess.Popen(["sleep", "10"], preexec_fn=os.setsid if hasattr(os, "setsid") else None)
if hasattr(os, "killpg"):
    try:
        os.killpg(os.getpgid(proc2.pid), signal.SIGTERM)
    except ProcessLookupError:
        pass

# Опасно — shell=True с интерполяцией = инъекция:
user_input = "web; rm -rf /"
# subprocess.run(f"kubectl get deploy {user_input}", shell=True)  # RCE!
# Безопасно:
subprocess.run(["kubectl", "get", "deploy", user_input])

# Deadlock — не читайте stdout/stderr по очереди если буфер может переполниться:
# communicate() или читать оба потока параллельно

# Буферизация:
# bufsize=1 line buffered (только text=True), bufsize=0 unbuffered
```

---

## 🌐 Networking глубоко (для CLI)

CLI часто — обёртка над HTTP/K8s API, health-чеки, port-forward.

### Сокеты: TCP/UDP/DNS/Unix

```python
import socket
import ssl

# DNS:
print(socket.gethostbyname("localhost"))
print(socket.getaddrinfo("localhost", 443, type=socket.SOCK_STREAM))


def is_port_open(host: str, port: int, timeout: float = 2.0) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


# TCP клиент с TLS:
ctx = ssl.create_default_context()
with ctx.wrap_socket(socket.socket(), server_hostname="localhost") as s:
    try:
        s.settimeout(2)
        s.connect(("127.0.0.1", 443))
        s.sendall(b"GET /healthz HTTP/1.0\r\nHost: localhost\r\n\r\n")
        print(s.recv(4096)[:200])
    except OSError as e:
        print(f"TLS connect failed (expected if no server): {e}")

# UDP:
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.sendto(b"ping", ("127.0.0.1", 8125))
sock.close()

# Unix socket — Docker, local daemon:
sock2 = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
try:
    sock2.connect("/var/run/docker.sock")
    sock2.sendall(b"GET /version HTTP/1.0\r\n\r\n")
    print(sock2.recv(4096).decode(errors="replace")[:200])
except OSError as e:
    print(f"unix socket not available: {e}")
finally:
    sock2.close()

# Порт-чекер для CI — ждать пока сервис поднимется:
import time


def wait_for_port(host: str, port: int, timeout: float = 30):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if is_port_open(host, port, timeout=1):
            return True
        time.sleep(0.5)
    raise TimeoutError(f"{host}:{port} not open after {timeout}s")
```

### Health checker — production grade

```python
import time

import httpx


def health_check(url: str, timeout: float = 3, retries: int = 5, backoff: float = 1.5) -> bool:
    for attempt in range(retries):
        try:
            r = httpx.get(url, timeout=timeout, follow_redirects=False)
            if r.status_code == 200:
                return True
            if 500 <= r.status_code < 600:
                pass
            else:
                return False
        except (httpx.ConnectError, httpx.TimeoutException):
            pass
        except httpx.HTTPStatusError:
            return False
        if attempt < retries - 1:
            time.sleep(backoff**attempt)
    return False


# Использование в CLI:
import typer

app_h = typer.Typer()


@app_h.command()
def wait_ready(url: str, timeout: int = 60):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if health_check(url):
            typer.echo("ready")
            return
        time.sleep(2)
    typer.secho("not ready after timeout", fg="red", err=True)
    raise typer.Exit(1)
```

---

## 🚨 Exceptions глубоко

### Иерархия

```python
# BaseException
#  ├── SystemExit, KeyboardInterrupt, GeneratorExit  (не ловить blanket except!)
#  └── Exception
#       ├── ValueError, TypeError, RuntimeError
#       ├── OSError (IOError, FileNotFoundError, PermissionError, TimeoutError)
#       └── httpx.HTTPError
#            ├── ConnectError, TimeoutException (retryable)
#            └── HTTPStatusError (4xx non-retryable, 5xx retryable)
```

### Кастомная иерархия для CLI

```python
import httpx


class DevopsctlError(Exception):
    exit_code = 1


class ConfigError(DevopsctlError):
    exit_code = 2


class ApiError(DevopsctlError):
    def __init__(self, msg, status_code=None):
        super().__init__(msg)
        self.status_code = status_code


class RetryableError(ApiError):
    pass


class NonRetryableError(ApiError):
    pass


def classify_http_error(e: httpx.HTTPStatusError) -> ApiError:
    if e.response.status_code in (429, 502, 503, 504) or e.response.status_code >= 500:
        return RetryableError(str(e), e.response.status_code)
    return NonRetryableError(str(e), e.response.status_code)
```

### Chaining и raise from

```python
import pathlib

import yaml

path = pathlib.Path("dtk.yaml")
try:
    cfg = yaml.safe_load(path.read_text(encoding="utf-8")) if path.exists() else {}
except yaml.YAMLError as e:
    raise ConfigError(f"bad config {path}: {e}") from e

try:
    risky()
except ValueError:
    raise DevopsctlError("friendly message") from None
```

### ExceptionGroup / except* (3.11+)

```python
errors = []
for name in ["web", "api", "worker"]:
    try:
        rollout(name)
    except Exception as e:
        errors.append(e)

if errors:
    raise ExceptionGroup("rollout failures", errors)

# Обработка группами:
try:
    raise ExceptionGroup("eg", [RetryableError("timeout"), NonRetryableError("bad image"), ValueError("bug")])
except* RetryableError as eg:
    print(f"retryable: {eg.exceptions}")
except* NonRetryableError as eg:
    print(f"fatal: {eg.exceptions}")
    raise SystemExit(1) from None
```

### Трансляция low→domain→API

```python
import httpx


def do_rollout(name: str, image: str):
    try:
        k8s_patch(name, image)
    except FileNotFoundError as e:
        raise ConfigError(f"kubeconfig not found: {e}") from e
    except httpx.TimeoutException as e:
        raise RetryableError(f"k8s timeout: {e}") from e
    except httpx.HTTPStatusError as e:
        raise classify_http_error(e) from e
    except OSError as e:
        raise DevopsctlError(f"os error: {e}") from e
```

---

## 📝 Logging глубоко

### Иерархия, уровни, handlers, formatters, filters

```python
import contextvars
import json
import logging
import sys
import uuid

from pythonjsonlogger import jsonlogger

def setup_logging2(level: str = "INFO", json_format: bool = False):
    root = logging.getLogger()
    root.setLevel(getattr(logging, level.upper()))
    h = logging.StreamHandler(sys.stderr)
    if json_format:
        h.setFormatter(jsonlogger.JsonFormatter("%(asctime)s %(levelname)s %(name)s %(message)s"))
    else:
        h.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s [%(correlation)s] %(message)s"))

    class CorrelationFilter(logging.Filter):
        def filter(self, record):
            record.correlation = getattr(logging, "correlation_id", "-")
            return True

    h.addFilter(CorrelationFilter())
    root.handlers = [h]
    logging.getLogger("httpx").propagate = False


cid_var = contextvars.ContextVar("cid", default="-")
```

### Чувствительные данные — маскирование

```python
import logging
import re


class SensitiveFilter(logging.Filter):
    PATTERNS = [re.compile(r"(token|password|secret)\s*[:=]\s*\S+", re.I)]

    def filter(self, record):
        msg = record.getMessage()
        for pat in self.PATTERNS:
            msg = pat.sub(r"\1=***", msg)
        record.msg = msg
        record.args = ()
        return True
```

### Ротация в контейнере

В контейнере не ротируйте файлы — пишите в stdout/stderr, ротация — на стороне рантайма (Docker json-file `max-size`, Kubernetes `containerLogMaxSize`, journald). Если нужен файл:

```python
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler

handler = RotatingFileHandler("/var/log/devopsctl.log", maxBytes=10 * 1024 * 1024, backupCount=5)
handler2 = TimedRotatingFileHandler("/var/log/devopsctl.log", when="midnight", backupCount=7)
```

---

## 🔒 Security

| Угроза | Пример | Защита |
|---|---|---|
| Command injection | `user="; rm -rf /"` → `shell=True` | список аргументов, `shlex.quote`, никогда `shell=True` с интерполяцией |
| Path traversal | `name="../../etc/passwd"` | `Path.resolve()` + проверка prefix |
| SSRF | `--url http://169.254.169.254/latest/meta-data/` | allowlist доменов/IP, блок private ranges |
| Unsafe YAML | `yaml.load(f)` → RCE | только `yaml.safe_load` |
| Unsafe pickle | `pickle.loads(user_data)` | `json`, `yaml.safe_load`, никогда pickle |
| TLS verification | `verify=False` | `verify=True` по умолчанию, CA bundle |
| Secrets leak | логи, `ps aux` | ENV/Secret, маскирование, `getpass`, `0600` |
| Dependency vuln | старая `urllib3` | `pip-audit`, `trivy`, `dependabot`, SBOM |

```python
import ipaddress
import pathlib
import shlex
import socket
import subprocess
import urllib.parse

import yaml


def safe_path(base: pathlib.Path, user: str) -> pathlib.Path:
    p = (base / user).resolve()
    if not str(p).startswith(str(base.resolve())):
        raise ValueError(f"path traversal: {user}")
    return p


def is_private_url(url: str) -> bool:
    host = urllib.parse.urlparse(url).hostname
    if not host:
        return True
    try:
        ip = ipaddress.ip_address(socket.gethostbyname(host))
        return ip.is_private or ip.is_loopback or ip.is_link_local
    except Exception:
        return True


user_input = "web"
subprocess.run(["kubectl", "get", user_input])

# yaml safe:
# yaml.safe_load(f)

# TLS:
import httpx

httpx.get("https://api.prod.local", verify=True)

# Secrets:
import getpass
import os

token = os.environ.get("DEVOPSECTL_TOKEN", "")
```

---

## 📊 Data processing (JSON/YAML/CSV/TOML, streaming, gzip/tar)

```python
import csv
import gzip
import io
import json
import pathlib
import tarfile

import yaml

# JSONL — по строке:
with open("events.jsonl", encoding="utf-8") as f:
    for line in f:
        obj = json.loads(line)
        pass

# YAML — safe:
with open("values.yaml", encoding="utf-8") as f:
    data = yaml.safe_load(f)
yaml.safe_dump(data, open("out.yaml", "w", encoding="utf-8"), allow_unicode=True, sort_keys=False)

# TOML:
import tomllib

with open("pyproject.toml", "rb") as f:
    data2 = tomllib.load(f)

# CSV — правильно с newline="":
with open("hosts.csv", newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row.get("host"))

with open("out.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["host", "ip"])
    w.writeheader()
    w.writerow({"host": "web-1", "ip": "10.0.0.1"})

# Потоковая обработка больших файлов — генераторы:
def iter_log(path: pathlib.Path):
    with open(path, encoding="utf-8", errors="replace") as f:
        for line in f:
            yield line.strip()

# gzip — прозрачно:
with gzip.open("access.log.gz", "rt", encoding="utf-8") as f:
    for line in f:
        pass

# tar — безопасно (path traversal!):
with tarfile.open("backup.tar.gz", "r:gz") as tar:
    for member in tar.getmembers():
        if member.name.startswith("/") or ".." in member.name:
            continue
        # tar.extract(member, path="/tmp/restore")
        pass

# Составной пайплайн: gzip -> json streaming:
def iter_gz_jsonl(path: str):
    with gzip.open(path, "rt", encoding="utf-8") as f:
        for line in f:
            yield json.loads(line)
```

---

## 🗄️ Databases (psycopg/SQLAlchemy, pool, транзакции)

CLI часто пишет в audit-БД, читает инвентарь.

```python
import time

import psycopg
import psycopg_pool

pool = psycopg_pool.ConnectionPool(
    "host=db.prod.local dbname=devops user=app password=secret connect_timeout=5",
    min_size=2,
    max_size=10,
    timeout=5,
    max_idle=300,
    max_lifetime=3600,
)

# Транзакция — commit/rollback:
with pool.connection() as conn:
    with conn.transaction():
        conn.execute("INSERT INTO deploys(service, image) VALUES (%s,%s)", ("web", "web:1.42"))
        conn.execute("UPDATE services SET last_deploy=now() WHERE name=%s", ("web",))

# Prepared statements — защита от SQL injection:
# cur = conn.execute("SELECT * FROM deploys WHERE service=%s AND env=%s", (service, env))

conn2 = pool.connection()
try:
    conn2.execute("SET statement_timeout = '5s'")
finally:
    conn2.close()

# retry для сериализуемых транзакций:
for attempt in range(3):
    try:
        with pool.connection() as conn:
            with conn.transaction():
                conn.execute("UPDATE counters SET n=n+1 WHERE id=1")
        break
    except psycopg.errors.SerializationFailure:
        if attempt == 2:
            raise
        time.sleep(0.1 * (2**attempt))

# SQLAlchemy 2.0 — ORM + Core:
from sqlalchemy import create_engine, text

engine = create_engine(
    "postgresql+psycopg://app:secret@db.prod.local/devops",
    pool_size=5,
    max_overflow=10,
    pool_timeout=5,
    pool_pre_ping=True,
    connect_args={"connect_timeout": 5, "options": "-c statement_timeout=5000"},
)
with engine.begin() as conn:
    conn.execute(text("INSERT INTO deploys(service,image) VALUES (:s,:i)"), {"s": "web", "i": "web:1.42"})

# Health check для CLI:
def db_health(pool) -> bool:
    try:
        with pool.connection() as conn:
            conn.execute("SELECT 1").fetchone()
        return True
    except Exception:
        return False
```

---

## 🔭 Observability

```python
from prometheus_client import CollectorRegistry, Counter, Gauge, Histogram, write_to_textfile

registry = CollectorRegistry()
DEPLOYS = Counter("devopsctl_deploys_total", "deploy attempts", ["service", "env", "status"], registry=registry)
LATENCY = Histogram("devopsctl_latency_seconds", "deploy duration", registry=registry)

with LATENCY.time():
    try:
        do_rollout()
        DEPLOYS.labels("web", "prod", "success").inc()
    except Exception:
        DEPLOYS.labels("web", "prod", "error").inc()
        raise

write_to_textfile("/var/lib/node_exporter/devopsctl.prom", registry)

# Health endpoints — если CLI имеет daemon режим (watch):
from fastapi import FastAPI

health_app = FastAPI()


@health_app.get("/healthz")
def healthz():
    return {"status": "ok"}


@health_app.get("/readyz")
def readyz():
    if not db_health(pool):
        return {"status": "not ready"}, 503
    return {"status": "ready"}
```

### Трассировка

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter

trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer("devopsctl")

with tracer.start_as_current_span("rollout") as span:
    span.set_attribute("service", "web")
    span.set_attribute("image", "web:1.42")
    do_rollout()
```

---

## 🔄 CI/CD — полный пайплайн

```yaml
# .gitlab-ci.yml
stages: [lint, test, security, build, publish]
variables:
  PIP_CACHE_DIR: "$CI_PROJECT_DIR/.cache/pip"

lint:
  stage: lint
  image: ghcr.io/astral-sh/uv:python3.12-bookworm-slim
  script:
    - uv sync --frozen
    - uv run ruff format --check .
    - uv run ruff check .
    - uv run mypy src --strict
    - uv run pyright --stats
  rules: [{if: '$CI_PIPELINE_SOURCE == "merge_request_event"'}]

unit:
  stage: test
  image: ghcr.io/astral-sh/uv:python3.12-bookworm-slim
  script:
    - uv run pytest tests/unit -q --cov=src --cov-report=term-missing --cov-fail-under=80 -n auto
  coverage: '/TOTAL.*\s+(\d+%)$/'
  artifacts: {reports: {coverage_report: {coverage_format: cobertura, path: coverage.xml}}}

integration:
  stage: test
  image: ghcr.io/astral-sh/uv:python3.12-bookworm-slim
  services: [postgres:16-alpine]
  script:
    - uv run pytest tests/integration -q --timeout=30
    - uv run pytest tests/e2e -q

security:
  stage: security
  script:
    - uv run pip-audit --desc
    - uv run bandit -r src -f json -o bandit.json
    - trivy fs --severity HIGH,CRITICAL --exit-code 1 .
  allow_failure: false

build:
  stage: build
  script:
    - uv build
    - uv run cyclonedx-py environment --output sbom.json
  artifacts: {paths: [dist/, sbom.json]}

container:
  stage: build
  image: docker:24
  services: [docker:24-dind]
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - trivy image --severity HIGH,CRITICAL --exit-code 1 $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
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
RUN pip install --no-cache-dir devopsctl
USER 65534:65534
ENTRYPOINT ["devopsctl"]
CMD ["--help"]
```

---

## 💥 Failure modes — типичные аварии CLI

| Симптом | Причина | Диагностика | Лечение |
|---|---|---|---|
| `OSError: too many open files` | утечка FD, mass open без close | `lsof -p $(pidof devopsctl)` | `with open`, `try/finally`, `ulimit -n` |
| `shell injection` | `shell=True` + f-string | `bandit -r` → B602 | список args |
| `yaml RCE` | `yaml.load` | `ruff S506` | `safe_load` |
| `завис на subprocess` | deadlock pipe | `py-spy dump` | `communicate(timeout)`, `Popen` с threads |
| `UnicodeDecodeError` на логах | cp1251 файл читают как utf-8 | `errors="replace"` | `encoding="utf-8", errors="replace"` |
| `partial failure 20` | 3/5 деплоев упали | код выхода 20 в CI | ретрай только retryable, идемпотентность |
| `profile leak` | `FLOCK` не снят | `flock -n` | `try/finally` + `FileLock` |
| `SSRF to metadata` | `--url http://169.254.169.254` | allowlist | `ip_address.is_private` |
| `disk full` | логи без ротации | `shutil.disk_usage` | `RotatingFileHandler` или stdout |
| `lost logs` | логи в stdout смешались с данными | `jq` падает | логи только в stderr |

---

## 🧪 Тестирование CLI

```python
from typer.testing import CliRunner

runner = CliRunner()


def test_rollout_dry_run(tmp_path, mocker):
    do = mocker.patch("devopsctl.cli.do_rollout")
    cfg = tmp_path / "dtk.yaml"
    cfg.write_text("api: https://x\n", encoding="utf-8")
    result = runner.invoke(app, ["rollout", "web", "--image", "web:1", "--dry-run", "--config", str(cfg)])
    assert result.exit_code == 0
    assert "DRY-RUN" in result.output
    do.assert_not_called()


# E2E как реальный бинарник (после pip install .):
import subprocess


def test_e2e_status():
    r = subprocess.run(
        ["devopsctl", "status", "web", "--output", "json"], capture_output=True, text=True, timeout=10
    )
    assert r.returncode == 0
    assert '"web"' in r.stdout


def test_cli_timeout():
    r = subprocess.run(["devopsctl", "k8s", "wait-ready", "--timeout", "1"], capture_output=True, timeout=5)
    assert r.returncode == 1
```

---

## 🎨 UX-детали, отличающие инструмент от скрипта

```bash
--version            # importlib.metadata.version("devops-toolkit")
--dry-run / --yes    # безопасный просмотр И явное подтверждение деструктивных действий
NO_COLOR / --no-color # уважение терминала без поддержки цвета; TTY-детект через sys.stdout.isatty()
progress             # rich.Progress для длинных операций
completion           # dtk --install-completion bash/zsh/fish — из коробки у typer
config               # каскад: defaults < файл (~/.config/dtk/config.toml) < ENV < CLI-флаги
--output json|table|yaml  # машиночитаемость
--timeout            # осмысленный дефолт (30s), не бесконечность
--concurrency        # лимит параллелизма для массовых операций
```

Пагинация больших выводов, идемпотентность повторного запуска, `--timeout` с осмысленным дефолтом — то, что вспоминают после первого инцидента.

---

## 🧪 Лаборатория: собери devopsctl с нуля

### Lab 1 — каркас с Typer + config + JSON output

```bash
uv init devopsctl && cd devopsctl
uv add typer httpx pydantic pydantic-settings pyyaml rich
uv add --dev pytest pytest-mock ruff mypy
mkdir -p src/devopsctl tests
```

```python
import json
import pathlib
import sys

import typer
from typing_extensions import Annotated

app = typer.Typer(no_args_is_help=True)


@app.command()
def rollout(name: str, image: str, dry_run: bool = False, output: str = "text"):
    plan = {"name": name, "image": image, "dry_run": dry_run}
    if output == "json":
        json.dump(plan, sys.stdout, ensure_ascii=False)
    else:
        typer.echo(f"plan: {plan}")
    if not dry_run:
        typer.echo("applying...", err=True)


@app.command()
def status(name: str, output: str = "json"):
    data = [{"name": name, "ready": True, "replicas": 3}]
    if output == "json":
        json.dump(data, sys.stdout)
    else:
        typer.echo(str(data))


if __name__ == "__main__":
    app()
```

Запуск: `uv run devopsctl rollout web --image web:1.42 --dry-run --output json | jq .`

### Lab 2 — file locking + signals + subprocess

```python
import pathlib
import subprocess
import sys

from filelock import FileLock


def test_single_instance(tmp_path):
    lock = tmp_path / "test.lock"
    with FileLock(str(lock)):
        r = subprocess.run(
            [sys.executable, "-c", f"from filelock import FileLock; FileLock('{lock}', timeout=0).__enter__()"],
            capture_output=True,
        )
        assert r.returncode != 0
```

### Lab 3 — health checker и port checker

```python
import socket
import time

import httpx


def wait_for_port(host, port, timeout=10):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            with socket.create_connection((host, port), timeout=1):
                return True
        except OSError:
            time.sleep(0.2)
    raise TimeoutError(f"{host}:{port} not ready")


def wait_for_http(url, timeout=30):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            if httpx.get(url, timeout=2).status_code == 200:
                return True
        except Exception:
            pass
        time.sleep(1)
    raise TimeoutError(f"{url} not ready")
```

Проверка: запустите `python -m http.server 8888 &` и `python -c "from devopsctl.health import wait_for_http; wait_for_http('http://127.0.0.1:8888')"`.

---

## ✅ Проверь себя

> Отвечай вслух до раскрытия ответа. Если «не помню» — вернись к разделу.

**В1. Почему логи пишутся в stderr, а не stdout?**
<details><summary>Ответ</summary>
stdout предназначен для данных результата, которые пайплятся (`devopsctl status | jq`). Логи в stdout сломают парсер потребителя. stderr идёт отдельно: виден человеку в терминале, не попадает в pipe.
</details>

**В2. Зачем CLI собственные коды выходов сверх 0/1?**
<details><summary>Ответ</summary>
Пайплайн принимает решения по коду: 20 (partial success) может означать «продолжить с алертом», а 10 (timeout) — ретрай. Один код «ошибка» лишает автоматизацию различения сценариев.
</details>

**В3. Как тестировать команду, не выполняя реальные действия?**
<details><summary>Ответ</summary>
Двухслойно: unit — CliRunner + мок бизнес-функций (проверяем разбор аргументов и коды выхода); e2e — subprocess против установленного бинарника с `--dry-run` или локальным fake-API. Деструктивные пути всегда сначала под `--dry-run`.
</details>

**В4. Что даёт каскад конфигурации defaults→файл→ENV→CLI?**
<details><summary>Ответ</summary>
Одинаковое поведение локально и в CI: секреты/URL через ENV (не светятся в истории shell), командные дефолты в файле, точечная правка флагом. Приоритет CLI сверху делает переопределение предсказуемым.
</details>

**В5. Почему `--dry-run` должен быть у любой мутации, даже если есть `--yes`?**
<details><summary>Ответ</summary>
`--yes` отвечает на вопрос «не спросить ли пользователя», но не «что именно произойдёт». Dry-run показывает план изменений (diff манифестов, список затронутых ресурсов) — единственный способ проверить автоматизацию до боевого прогона.
</details>

**В6. Чем опасен `subprocess.run(f"kubectl get {user}", shell=True)` и как правильно?**
<details><summary>Ответ</summary>
Интерполяция в shell — инъекция: `user="web; rm -rf /"` выполнит вторую команду. Правильно — список аргументов `["kubectl","get",user]` без `shell=True`; если shell неизбежен — `shlex.quote(user)`. Ловит ruff B602 / bandit S602.
</details>

**В7. Как защитить CLI от path traversal через аргумент `--config ../../etc/passwd`?**
<details><summary>Ответ</summary>
Резолвить и проверять префикс: `p=(base/user).resolve(); if not str(p).startswith(str(base.resolve())): raise`. Плюс валидировать имя `Path(user).name` без `/`, запретить `..`, использовать `safe_path()` helper. Особенно важно если CLI пишет по этому пути.
</details>

**В8. Почему `yaml.load(f)` в конфиге — RCE, а `yaml.safe_load` — нет?**
<details><summary>Ответ</summary>
`yaml.load` с дефолтным Loader'ом может инстанцировать произвольные Python-объекты (`!!python/object`), выполнив код. `safe_load` парсит только базовые типы (str/int/list/dict). Правило: только `safe_load`/`safe_dump` для внешних файлов.
</details>

**В9. Как реализовать file locking чтобы два `devopsctl rollout` не гоняли одновременно?**
<details><summary>Ответ</summary>
`fcntl.flock(file, LOCK_EX|LOCK_NB)` на POSIX или `filelock.FileLock` кроссплатформенно; при `BlockingIOError` — второй экземпляр выходит с кодом 1. Обязательно `try/finally: flock(LOCK_UN)` или контекстный менеджер, иначе deadlock после падения.
</details>

**В10. Зачем `httpx.get(url, verify=True)` и что сломает `verify=False` в CLI, который ходит в K8s API?**
<details><summary>Ответ</summary>
`verify=True` проверяет TLS-сертификат (дефолт). `verify=False` отключает проверку — MITM может подсунуть фальшивый API, украсть токен, подсунуть вредный манифест. В проде всегда `verify=True` + CA bundle; `verify=False` только локально с `kind` и под флагом `--insecure` с варнингом.
</details>

---

*Что дальше:* [07. Kubernetes-операторы на Python](07-python-kubernetes-kopf-operators.md) · [05. Типизация](05-python-typing-mypy-ruff.md)
