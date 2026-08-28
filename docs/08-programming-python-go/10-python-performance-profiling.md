# 🚀 10. Python: Профилирование и Производительность

> Уровень: Senior. Цель: находить 80% времени в 20% кода, не гадать, а измерять; ловить утечки до OOMKill; выбирать правильный профайлер под задачу. timeit/cProfile/pstats/py-spy/scalene/line_profiler/perf, CPU/memory/wall time, tracemalloc, leak diagnosis.

## 🔬 Методология: сначала измерь

Оптимизация без профиля = лотерея. Правило: **нашёл 80% времени в одной функции — оптимизируй её, остальное не трогай**.

```bash
# Три уровня инструментария:
cProfile      # встроенный, детальный, замедляет код (~2×), точный по вызовам
py-spy        # сэмплирующий, работает на ЖИВОМ процессе, без правки кода, flamegraph
line_profiler # построчный профиль конкретной функции (@profile)
scalene       # CPU + memory + GPU + строки, современный
perf          # Linux perf для C-расширений
```

```python
# Быстрый прогон из скрипта:
import cProfile
import pstats

profiler = cProfile.Profile()
profiler.enable()
main()
profiler.disable()
stats = pstats.Stats(profiler).sort_stats("cumulative")
stats.print_stats(15)
# или:
# stats.dump_stats("profile.prof")
# python -m pstats profile.prof
```

```text
   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
     1200    4.811    0.004    5.912    0.005 parser.py:42(parse_line)   ← tottime: своё время
   480000    0.933    0.000    1.101    0.000 re.py:186(search)          ← cumtime: с вызовами внутрь
```

**Читаем:** `tottime` — сколько функция работала сама; `cumtime` — вместе со всеми вызовами. Оптимизируйте по `tottime` у листьев и по `ncalls` (внезапные миллионы вызовов = лишняя работа в цикле). `percall` — среднее.

### Виды времени — не путайте!

| Метрика | Что меряет | Инструмент | Когда важно |
|---|---|---|---|
| **CPU time** | время на CPU (без ожидания I/O) | cProfile tottime, `time.process_time()` | CPU-bound (парсинг, хэши) |
| **Wall time** | реальное время (CPU + ожидание) | `time.perf_counter()`, `timeit` | I/O-bound (сеть, диск, `sleep`) |
| **Memory** | RSS, аллокации | tracemalloc, scalene, memray | утечки, большие файлы |
| **Sys time** | kernel | `time` утилита | syscalls, fork |

```python
import time

start_cpu = time.process_time()
start_wall = time.perf_counter()
# ... работа ...
cpu = time.process_time() - start_cpu    # CPU
wall = time.perf_counter() - start_wall  # wall
print(f"cpu={cpu:.2f}s wall={wall:.2f}s ratio={cpu/wall:.1%}")
# ratio ~100% -> CPU-bound, ~5% -> I/O-bound (ждёт)
```

### timeit — честный микробенчмарк

```python
import timeit

# Неправильно — меряете I/O + кэш:
# %timeit parse_log("127.0.0.1 ...")

# Правильно — изолируйте:
setup = "from parser import parse_log; line='127.0.0.1 - \"GET / HTTP/1.1\" 200'"
print(timeit.timeit('parse_log(line)', setup=setup, number=100000))
# или:
print(timeit.repeat('parse_log(line)', setup=setup, repeat=5, number=10000))
# repeat 5 — доверительный интервал, выбирать минимум (без шума системы)

# CLI:
# python -m timeit -s "import re; pat=re.compile(r'\d+')" "pat.search('abc 123')"
```

## 🕵️ py-spy: профилирование боевого процесса

```bash
pip install py-spy

py-spy top --pid 1234                    # live-топ функций прямо сейчас
py-spy record -o profile.svg --pid 1234 --duration 60    # flamegraph за минуту
py-spy dump --pid 1234                   # мгновенные стеки всех потоков (диагностика зависаний!)
py-spy record -- python script.py        # запуск под профилем
py-spy record --native -p 1234           # включая C-расширения (numpy, regex)
# Требует CAP_SYS_PTRACE или --cap-add SYS_PTRACE в Docker
```

Flamegraph читается снизу вверх: ширина плашки ∝ доле CPU. Плоский широкий «хребет» = горячая функция. Ищите `re.search`, `json.loads`, `hashlib` на вершине.

### cProfile — глубоко

```python
import cProfile
import pstats
import io

pr = cProfile.Profile()
pr.enable()
# ... код ...
pr.disable()
s = io.StringIO()
ps = pstats.Stats(pr, stream=s).strip_dirs().sort_stats("tottime")
ps.print_stats(20)
print(s.getvalue())
# Сортировки:
# tottime — своё время, cumulative — с детьми, calls — по вызовам, time — wall

# Запуск через CLI:
# python -m cProfile -o out.prof script.py
# python -m cProfile -s tottime script.py
# snakeviz out.prof  # визуализация в браузере
# pip install snakeviz && snakeviz out.prof

# Ограничения cProfile:
# - замедляет ~2× (инструментирует каждый вызов)
# - не видит C-расширения (numpy) — используйте py-spy --native
# - не меряет память — tracemalloc/scalene
```

### line_profiler — построчно

```bash
pip install line_profiler
```

```python
# app.py
@profile
def hot(data):
    s = 0
    for x in data:  # какая строка жрёт?
        s += x * x
    return s

# kernprof -l -v app.py
# Строки:
# Line # Hits Time Per Hit % Time Line Contents
# 5 1000000 120000 0.1 80% s += x*x  <- сюда оптимизировать
```

### scalene — CPU + memory + GPU

```bash
pip install scalene
scalene --html --outfile profile.html script.py
scalene --memory script.py  # покажет где растёт память построчно
# Вывод: CPU% | Memory | Time | строка
```

### perf — для C

```bash
perf record -F 99 -g -- python script.py
perf report
# или py-spy --native — проще
```

## 🧠 Память: tracemalloc и утечки

```python
import tracemalloc

tracemalloc.start(25)  # 25 фреймов стека

process_logs("huge.log")

snapshot = tracemalloc.take_snapshot()
top = snapshot.statistics("lineno")
for stat in top[:10]:
    print(stat)
# /app/parser.py:42: size=512 MiB, count=1000000, average=512 B

# Сравнение снимков — найти утечку:
snap1 = tracemalloc.take_snapshot()
process_batch()
snap2 = tracemalloc.take_snapshot()
for stat in snap2.compare_to(snap1, "lineno")[:10]:
    print(stat)
# Покажет где память выросла между снимками

# Лимиты:
tracemalloc.start()
# ... code ...
current, peak = tracemalloc.get_traced_memory()
print(f"current {current//1024}KB peak {peak//1024}KB")
tracemalloc.stop()

# Не ловит C-аллокации (numpy, regex) — для них memray:
# pip install memray
# memray run --native script.py
# memray flamegraph memray-*.bin
```

Типовые утечки DevOps-скриптов:

| Причина | Симптом | Диагностика | Лечение |
|---|---|---|---|
| Список-аккумулятор всех строк лога | RSS растёт линейно | tracemalloc `lineno` покажет `append` | стримить генератором, не `f.readlines()` |
| Кэш без ограничения | память только растёт, OOM через часы | `len(cache)` растёт | `functools.lru_cache(maxsize=1024)` или TTL |
| Замыкание держит большой объект | объект не собирается GC | `gc.get_referrers` | `del`/None, weakref |
| C-расширение | tracemalloc молчит | memray / `psutil` RSS растёт | `numpy` → chunk'и |
| Глобальный `list`/`dict` | память не падает после обработки | `compare_to` | чистить, `clear()` |
| `tracemalloc` не включен | не видно | — | `PYTHONTRACEMALLOC=1` |

```python
# Утечка — кэш без лимита:
cache = {}
def get_pod(name):
    if name not in cache:
        cache[name] = fetch_pod(name)  # растёт вечно!
    return cache[name]
# Фикс:
from functools import lru_cache
@lru_cache(maxsize=1024)
def get_pod_cached(name):
    return fetch_pod(name)
# или TTL:
from cachetools import TTLCache
cache2 = TTLCache(maxsize=1024, ttl=300)

# Утечка — readlines:
# data = open("50GB.log").readlines()  # OOM!
# Фикс:
for line in open("50GB.log", encoding="utf-8", errors="replace"):
    process(line)  # O(1) памяти
```

---

## 📁 Файлы, ОС, система — профилирование I/O

```python
import os
import pathlib
import shutil
import resource
import time

# Диск — является ли I/O узким местом?
# time cat 1GB.log > /dev/null  — меряем throughput
# iostat -x 1, pidstat -d 1

# FD — утечка дескрипторов:
soft, hard = resource.getrlimit(resource.RLIMIT_NOFILE) if hasattr(resource, "getrlimit") else (1024, 4096)
print(f"FD limit {soft}")
# watch 'ls /proc/$(pidof python)/fd | wc -l'

# Профилирование файлового I/O — cProfile покажет open/read, но не wall wait:
# Используйте py-spy или time.perf_counter вокруг I/O:
start = time.perf_counter()
with open("large.log", encoding="utf-8") as f:
    for line in f:
        pass
print(f"read wall {time.perf_counter()-start:.2f}s")

# Subprocess — мерять внешний процесс:
import subprocess
start = time.perf_counter()
result = subprocess.run(["kubectl", "get", "pods", "-A"], capture_output=True, text=True, timeout=10)
print(f"kubectl wall {time.perf_counter()-start:.2f}s len={len(result.stdout)}")

# File locking — не блокирует ли?
import fcntl, pathlib
lock = open("/tmp/prof.lock", "w")
start = time.perf_counter()
fcntl.flock(lock, fcntl.LOCK_EX)
print(f"lock wait {time.perf_counter()-start:.2f}s")
fcntl.flock(lock, fcntl.LOCK_UN)
```

### Process discovery — найти горячий процесс

```python
import pathlib
# Найти все python процессы и их RSS:
for pid in pathlib.Path("/proc").glob("[0-9]*") if pathlib.Path("/proc").exists() else []:
    try:
        cmd = (pid / "cmdline").read_bytes().replace(b"\x00", b" ").decode(errors="replace")
        if "python" in cmd:
            rss = (pid / "status").read_text().split("VmRSS:")[1].split("\n")[0].strip() if "VmRSS" in (pid / "status").read_text() else "?"
            print(f"{pid.name} {rss} {cmd[:80]}")
    except Exception:
        continue
```

---

## 🌐 Networking — профилирование сетевых вызовов

```python
import time
import socket

# Wall vs CPU — сеть ждёт:
start_cpu = time.process_time()
start_wall = time.perf_counter()
import httpx
httpx.get("https://api.prod.local/healthz", timeout=5)
print(f"cpu {time.process_time()-start_cpu:.3f}s wall {time.perf_counter()-start_wall:.3f}s")
# cpu 0.005s wall 0.200s -> I/O-bound, профайлер CPU покажет 0, но latency большая

# Профилировать DNS:
start = time.perf_counter()
socket.gethostbyname("api.prod.local")
print(f"dns {time.perf_counter()-start:.4f}s")
# Медленный DNS — добавьте кэш (dnspython) или /etc/hosts

# Профилировать TLS handshake:
import ssl
start = time.perf_counter()
ctx = ssl.create_default_context()
with ctx.wrap_socket(socket.socket(), server_hostname="api.prod.local") as s:
    s.settimeout(5)
    try:
        s.connect(("api.prod.local", 443))
        print(f"tls connect {time.perf_counter()-start:.3f}s")
    except OSError as e:
        print(f"connect failed: {e}")

# Порт-чекер — мерять latency:
def measure_port(host: str, port: int, n: int = 10):
    import statistics
    times = []
    for _ in range(n):
        start = time.perf_counter()
        try:
            with socket.create_connection((host, port), timeout=2):
                times.append(time.perf_counter() - start)
        except OSError:
            times.append(float("inf"))
    print(f"port {host}:{port} p50={statistics.median(times):.3f}s min={min(times):.3f}s")

# Health checker — с метриками:
import httpx, time, statistics
async def bench_health(url: str, n: int = 100):
    import asyncio
    times = []
    async with httpx.AsyncClient(timeout=5) as client:
        for _ in range(n):
            start = time.perf_counter()
            await client.get(url)
            times.append(time.perf_counter() - start)
    print(f"health {url} p50={statistics.median(times):.3f} p95={sorted(times)[int(n*0.95)]:.3f}")
```

---

## 🚨 Exceptions — профилирование не должно падать

```python
# Профайлер не должен ломать прод если нет данных:
try:
    import tracemalloc
    tracemalloc.start()
except Exception:
    pass

# ExceptionGroup — собрать ошибки батча профилирования:
errors = []
for target in ["web", "api"]:
    try:
        profile_target(target)
    except Exception as e:
        errors.append(e)
if errors:
    raise ExceptionGroup("profile failures", errors)

# Retryable vs non-retryable — для сетевых профайлеров:
# py-spy на живой процесс может упасть если PID исчез — retry с delay
```

---

## 📝 Logging — профилирование логов

```python
import logging
import sys

# Логи могут быть узким местом (синхронный I/O):
# cProfile покажет logging.handlers — если % времени большой, переключите на async handler
# или увеличьте уровень (INFO -> WARNING)

# JSON логи — дороже чем text, но нужны для Loki:
from pythonjsonlogger import jsonlogger
handler = logging.StreamHandler(sys.stderr)
handler.setFormatter(jsonlogger.JsonFormatter("%(asctime)s %(levelname)s %(message)s"))
# Бенчмарк:
import timeit
print(timeit.timeit('logger.info("msg %s", 42)', setup='import logging; logger=logging.getLogger("t")', number=100000))
# Если логи в горячем цикле — вынесите за цикл или используйте `if logger.isEnabledFor(logging.DEBUG):`

# Корреляция — не влияет на производительность, но важна:
import contextvars
cid = contextvars.ContextVar("cid", default="-")
# set в middleware, читается в фильтре — O(1)
```

---

## 🔒 Security — профилировщик не должен слить секреты

```python
# py-spy dump — покажет стеки с аргументами, может содержать токены!
# Не публикуйте flamegraph с прод-аргументами, маскируйте:
# -- не логгировать секреты в hot путях

# pip-audit, trivy — профилировщики сами зависимости:
# scalene, py-spy — проверьте их SBOM

# TLS verify — профайлер сети не должен отключать verify:
# httpx.get(url, verify=True)  # не False
```

---

## 📊 Data processing — профилирование ETL

```python
import csv
import json
import gzip
import time

# Профилировать потоковую обработку:
start = time.perf_counter()
count = 0
with gzip.open("events.jsonl.gz", "rt", encoding="utf-8") as f:
    for line in f:
        obj = json.loads(line)
        count += 1
print(f"processed {count} in {time.perf_counter()-start:.2f}s -> {count/(time.perf_counter()-start):.0f} rps")

# CSV — DictReader vs reader:
import timeit
setup = "import csv, io; data='a,b\\n1,2\\n'*1000"
print("DictReader", timeit.timeit("list(csv.DictReader(io.StringIO(data)))", setup=setup, number=1000))
print("reader", timeit.timeit("list(csv.reader(io.StringIO(data)))", setup=setup, number=1000))
# reader быстрее, но DictReader удобнее — выбирайте по профилю

# Память — не грузить всё:
# data = json.load(open("1GB.json"))  # OOM
# for item in ijson.items(open("1GB.json","rb"), "item"):  # O(1)
```

---

## 🗄️ Databases — профилирование запросов

```python
import time
import psycopg

# Время запроса vs время Python:
start = time.perf_counter()
cur.execute("SELECT * FROM deploys WHERE service=%s", ("web",))
rows = cur.fetchall()
print(f"query wall {time.perf_counter()-start:.3f}s rows={len(rows)}")
# Если wall большой, а cProfile показывает 0 — узкое место БД, смотрите EXPLAIN ANALYZE

# EXPLAIN:
# cur.execute("EXPLAIN ANALYZE SELECT * FROM deploys WHERE service='web'")
# print(cur.fetchall())

# Пул — не создавать connection на каждый запрос (дорого):
# pool = psycopg_pool.ConnectionPool(...)
# with pool.connection() as conn:  # reuse

# Таймауты — statement_timeout:
# conn.execute("SET statement_timeout='5s'")

# Подготовленные запросы — быстрее для повторов:
# cur.execute("PREPARE myplan AS SELECT * FROM deploys WHERE service=$1")
# cur.execute("EXECUTE myplan('web')")
```

---

## 🔭 Observability — профилирование наблюдаемости

```python
from prometheus_client import Histogram
import time

# Гистограмма latency — сама наблюдаемость:
LAT = Histogram("app_latency_seconds", "latency")
with LAT.time():
    do_work()

# Профилировать метрики — не собирайте слишком много labels (кардинальность):
# REQUESTS.labels(method, path, code) — правильно (path = route, не url с id)
# REQUESTS.labels(user_id) — неправильно, взорвёт Prometheus
```

---

## ⚡ Частые ускорители (по убыванию пользы)

### 1. Алгоритм и структура данных

```python
# O(n²) → O(n): поиск в списке внутри цикла
seen = set(existing_ids)
if uid not in seen:
    print("new")

# Группировка одним проходом:
from collections import defaultdict

by_ns = defaultdict(list)
for pod in ["a","b","a"]:
    by_ns[pod].append(pod)
print(by_ns)

# Правильный контейнер:
# list — порядок, set — membership, dict — lookup, deque — queue
```

### 2. Не делай работу дважды

```python
import functools
import re

@functools.lru_cache(maxsize=2048)
def parse_manifest(path: str) -> dict:
    return {"path": path}

LOG_RE = re.compile(r'(?P<ip>\S+) .+ "(?P<verb>\w+) (?P<path>\S+)"')
for line in ["127.0.0.1 ..."]:
    m = LOG_RE.match(line)

# Компиляция вне цикла — ×3-5 быстрее
```

### 3. Правильный I/O: батчи и стриминг

```python
# ❌ 1000 HTTP-вызовов по одному
# ✅ батч-эндпоинт или параллельные запросы (ThreadPoolExecutor/asyncio)

# Стриминг больших файлов:
with open("access.log", encoding="utf-8") as f:
    for line in f:
        print(line.strip())

# SQL: executemany вместо N execute; COPY для массовой загрузки.
import psycopg
# cur.executemany("INSERT INTO t VALUES (%s)", [(1,),(2,)])
# cur.copy("COPY t FROM STDIN", open("data.csv"))
```

### 4. Библиотеки вместо рукописного Python

`json` → `orjson` (×5), `csv` модуль → `pyarrow` для гигабайт, чистые циклы над числами → `numpy` (векторизация).

```python
import json
import time

data = {"a": 1, "b": [1]*1000}
start = time.perf_counter()
for _ in range(10000):
    json.dumps(data)
print(f"json {time.perf_counter()-start:.2f}s")

try:
    import orjson
    start = time.perf_counter()
    for _ in range(10000):
        orjson.dumps(data)
    print(f"orjson {time.perf_counter()-start:.2f}s")
except ImportError:
    print("orjson not installed")
```

---

## 📏 Бенчмаркинг честный

```bash
hyperfine 'python parse_old.py access.log' 'python parse_new.py access.log' \
    --warmup 2 --min-runs 10
# Benchmark 1: mean 12.441 s ± 0.183 s
# Benchmark 2: mean  2.117 s ± 0.041 s    ← ×5.88 быстрее
```

⚠️ Микробенчмарки `%timeit` в REPL обманывают на I/O-bound задачах: меряйте целевой сценарий целиком. Используйте `hyperfine` для CLI, `pytest-benchmark` для функций.

```python
# pytest-benchmark:
def test_parse(benchmark):
    result = benchmark(parse_log, "127.0.0.1 - \"GET / HTTP/1.1\" 200")
    assert result == ("GET", 200)
# pytest --benchmark-only
```

---

## 🔄 CI/CD — профилирование в пайплайне

```yaml
stages: [lint, test, security, bench, build]

lint:
  stage: lint
  script:
    - uv run ruff format --check .
    - uv run ruff check .
    - uv run mypy src --strict

test:
  stage: test
  script:
    - uv run pytest -q --cov=src --cov-fail-under=80 -n auto

bench:
  stage: bench
  script:
    - uv run pytest --benchmark-only --benchmark-json bench.json
    - hyperfine --warmup 2 'python old.py' 'python new.py' --export-json hyper.json
    # сравнение с main — regression check:
    - python scripts/compare_bench.py bench.json hyper.json --threshold 10%  # fail if +10%
  artifacts: {paths: [bench.json, hyper.json]}

security:
  stage: security
  script:
    - uv run pip-audit --desc
    - trivy fs --severity HIGH,CRITICAL --exit-code 1 .

build:
  stage: build
  script:
    - uv build
    - cyclonedx-py environment -o sbom.json
  artifacts: {paths: [dist/, sbom.json]}
```

### Профилирование утечек в CI — nightly

```yaml
memcheck:
  stage: test
  script:
    - python -X tracemalloc -m pytest tests/test_leak.py -v
    - memray run --native -o mem.bin tests/test_leak.py
    - memray summary mem.bin
  rules: [{if: '$CI_PIPELINE_SOURCE == "schedule"'}]
```

---

## 💥 Failure modes — производительность

| Симптом | Причина | Диагностика | Лечение |
|---|---|---|---|
| OOMKilled в K8s | утечка, `readlines` | `kubectl top pod`, tracemalloc | streaming, `maxsize` |
| Flamegraph плоский | CPU в C-расширении | `py-spy --native` | векторизовать, chunk'и |
| cProfile показывает 0, но wall большой | I/O-bound | `wall vs cpu` ratio | `asyncio`, `ThreadPool` |
| `tottime` много, `cumtime` мало | горячая leaf-функция | `pstats` tottime | оптимизировать leaf |
| `ncalls` миллионы | лишняя работа в цикле | `pstats` calls | вынести из цикла, кэш |
| `tracemalloc` молчит, RSS растёт | C-аллокация | `memray` | `memray --native` |
| hyperfine шум ±20% | thermal throttling, шум соседей | `--warmup` | фиксировать CPU freq, `taskset` |

---

## 🧪 Лаборатория

### Lab 1 — cProfile vs py-spy vs line_profiler

```python
# lab_profile.py
import time
import re

PAT = re.compile(r'(?P<ip>\S+) .+ "(?P<verb>\w+) (?P<path>\S+)"')

def parse(line: str):
    m = PAT.search(line)
    if not m:
        return None
    return m["verb"], m["path"]

def main():
    lines = ['127.0.0.1 - "GET /api HTTP/1.1" 200'] * 100000
    for line in lines:
        parse(line)

if __name__ == "__main__":
    main()
```

```bash
python -m cProfile -s tottime lab_profile.py  # cProfile
py-spy record -o flame.svg -- python lab_profile.py  # py-spy
kernprof -l -v lab_profile.py  # line_profiler (добавьте @profile к parse)
scalene lab_profile.py  # scalene
hyperfine 'python lab_profile.py' --warmup 2
```

### Lab 2 — tracemalloc leak

```python
# lab_leak.py
import tracemalloc
tracemalloc.start(25)

cache = []  # утечка

def process(n):
    # Имитация утечки — копим строки:
    for i in range(n):
        cache.append("x" * 1024)  # 1KB * n

snap1 = tracemalloc.take_snapshot()
process(10000)
snap2 = tracemalloc.take_snapshot()
for stat in snap2.compare_to(snap1, "lineno")[:5]:
    print(stat)
current, peak = tracemalloc.get_traced_memory()
print(f"current {current//1024}KB peak {peak//1024}KB")
# Фикс: cache.clear() или lru_cache(maxsize=...)
```

### Lab 3 — wall vs cpu + streaming

```python
# lab_io.py
import time, gzip, json, pathlib

# Создать тестовый файл:
path = pathlib.Path("/tmp/test.jsonl.gz")
with gzip.open(path, "wt", encoding="utf-8") as f:
    for i in range(10000):
        f.write(json.dumps({"id": i, "value": "x"*100}) + "\n")

# Wall vs CPU — чтение:
start_cpu = time.process_time()
start_wall = time.perf_counter()
count = 0
with gzip.open(path, "rt", encoding="utf-8") as f:
    for line in f:
        json.loads(line)
        count += 1
print(f"streaming count={count} cpu={time.process_time()-start_cpu:.2f}s wall={time.perf_counter()-start_wall:.2f}s ratio={ (time.process_time()-start_cpu)/(time.perf_counter()-start_wall):.1%}")
# Попробуйте json.load(gzip.open(...).read()) — OOM на большом!

# Бенчмарк orjson vs json:
import timeit, json
data = {"a": 1, "b": [1]*100}
print("json", timeit.timeit("json.dumps(data)", setup="import json; data={'a':1,'b':[1]*100}", number=10000))
try:
    import orjson
    print("orjson", timeit.timeit("orjson.dumps(data)", setup="import orjson; data={'a':1,'b':[1]*100}", number=10000))
except ImportError:
    print("orjson not installed — pip install orjson")
```

---

## ✅ Проверь себя

> Отвечай вслух до раскрытия ответа. Если «не помню» — вернись к разделу.

**В1. Чем py-spy принципиально отличается от cProfile?**
<details><summary>Ответ</summary>
cProfile инструментирует код (замедление ~2×, нужен запуск под ним); py-spy сэмплирует стек живого процесса извне через ptrace — нулевые изменения кода, можно профилировать прод-процесс (с нужными правами) и ловить зависания через dump.
</details>

**В2. В отчёте cProfile функция A: tottime 5s, ncalls 1. Функция B: tottime 0.01s, ncalls 500000. Что оптимизировать?**
<details><summary>Ответ</summary>
Сначала посмотреть, зачем B вызывается полмиллиона раз — вероятно, её вынесут из внутреннего цикла или закэшируют (это уберёт и overhead вызовов). Если B неизбежна — оптимизировать её тело. ncalls часто указывает на структурную проблему дороже самой функции.
</details>

**В3. Скрипт обрабатывает 50-ГБ лог и падает по OOM. Первое изменение?**
<details><summary>Ответ</summary>
Убрать загрузку всего файла в память (`readlines()`/`read().split()`): читать построчно (`for line in f`) или чанками, агрегируя статистику инкрементально (Counter/defaultdict), вместо хранения всех записей. tracemalloc подтвердит место роста.
</details>

**В4. Почему `re.match(...)` внутри горячего цикла медленнее заранее скомпилированного паттерна?**
<details><summary>Ответ</summary>
Каждый вызов ищет паттерн во внутреннем кэше компиляции (hash lookup + возможная компиляция при eviction) и создаёт служебные объекты. Предкомпилированный `RE = re.compile(...)` делает один lookup атрибута; выигрыш ×2–5 плюс возможность использовать методы объекта напрямую.
</details>

**В5. Как доказать коллеге, что ваша оптимизация реально помогает?**
<details><summary>Ответ</summary>
Бенчмарк до/после на реалистичных данных с hyperfine (--warmup, ≥10 запусков, доверительные интервалы) + неизменность результата (тесты/golden-output diff). «Стало субъективно быстрее» не считается — числа и корректность фиксируются артефактами MR.
</details>

**В6. Чем wall time отличается от CPU time и почему `time.process_time()` покажет 0.01s а `perf_counter()` 2s на сетевом скрипте?**
<details><summary>Ответ</summary>
CPU — время на ядре, wall — реальное (включая ожидание сети/диска). Сетевой скрипт ждёт `recv` 99% времени — CPU почти 0, wall большой. Профилировать wall для I/O (hyperfine, perf_counter), CPU для вычислений (cProfile).
</details>

**В7. Что покажет `tracemalloc` `compare_to` и почему `tracemalloc` не увидит утечку numpy?**
<details><summary>Ответ</summary>
`compare_to` — дельту аллокаций между двумя snapshot'ами, покажет где память выросла (утечка). Numpy аллоцирует в C (malloc), не через Python-аллокатор — tracemalloc его не видит, нужен `memray --native` или `psutil` RSS.
</details>

**В8. Почему `python -m cProfile -o out.prof script.py && snakeviz out.prof` может не показать горячую функцию `numpy.dot`?**
<details><summary>Ответ</summary>
cProfile инструментирует Python-вызовы, но не C-расширения — `numpy.dot` выполнится как один вызов с малым tottime, хотя внутри C жрёт секунды. Используйте `py-spy --native` или `perf` или `scalene --native` для C-стеков.
</details>

**В9. Как отличить утечку `lru_cache(maxsize=None)` от обычной и как её поймать в CI?**
<details><summary>Ответ</summary>
`maxsize=None` — безлимитный кэш растёт вечно, `maxsize=1024` — LRU eviction. Поймать: nightly job с `tracemalloc` `compare_to` + `memray`, алерт если `len(cache)` или `RSS` растёт между итерациями, `pytest` с `tracemalloc` и `assert peak < limit`.
</details>

**В10. Зачем `hyperfine --warmup 2 --min-runs 10` и почему `timeit` в REPL обманывает на I/O?**
<details><summary>Ответ</summary>
Warmup прогревает кэш/диск/FS, 10 запусков дают доверительный интервал (шум системы). `timeit` меряет CPU-bound микрокусок в кэше, не I/O-bound сценарий целиком (сеть/диск кэшируются, результаты нерепрезентативны). Меряйте end-to-end `hyperfine "python script.py large.log"`.
</details>

---

## ✅ Итоги раздела Python (02–10)

Покрыто: окружения/упаковка (uv, wheel), pytest (fixtures/mocks/hypothesis), asyncio/GIL, типизация mypy+ruff, CLI (typer), K8s-операторы (kopf), FastAPI-платформенные API, boto3 deep + moto, профилирование (cProfile/py-spy/tracemalloc).

*Дальше:* Go-раздел начинается со страницы [02-go-fundamentals-deep](02-go-fundamentals-deep.md)
