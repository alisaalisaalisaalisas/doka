# 🐍 01. Python для DevOps: полный языковой курс + практика

> Уровень: Junior→Senior. Цель: не «знать синтаксис», а свободно писать production-утилиты: CLI, работа с API/логами/процессами, тесты. Язык целиком — с граблями и идиомами.

**Оглавление:** [1. Основы](#1-основы-языка-типы-строки-срезы) · [2. Функции и декораторы](#2-функции-декораторы-генераторы) · [3. collections/itertools](#3-структуры-данных-collections-и-itertools) · [4. Исключения](#4-исключения-eafp-вместо-lbyl) · [5. pathlib/subprocess](#5-файлы-pathlib-subprocess) · [6. Типизация](#6-типизация-и-pydantic) · [7. dataclasses](#7-ооп-минимум-dataclasses) · [8. asyncio](#8-asyncio-когда-и-зачем) · [9. venv/pytest/линтеры](#9-инструменты-venv-pytest-линтеры) · [10. Грабли](#10-грабли-языка) · [11. Паттерны DevOps](#11-готовые-паттерны-devops) · [2.5 Вопросы](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

## 1. Основы языка: типы, строки, срезы

### Изменяемое vs неизменяемое — ключевое различие

```python
# Неизменяемые: int, float, str, bool, tuple, frozenset
# Изменяемые:   list, dict, set  (передаются по ссылке!)

a = [1, 2, 3]
b = a                    # b — ТА ЖЕ ссылка, не копия!
b.append(4)
print(a)                 # [1, 2, 3, 4] — изменилось и a

c = a.copy()             # поверхностная копия
c.append(5)
print(a)                 # [1, 2, 3, 4] — a не тронуто
```

### f-строки

```python
host, port, errors = "db01", 5432, 12
print(f"{host}:{port}")            # db01:5432
print(f"{errors:03d}")             # 012 (паддинг)
print(f"{0.9876:.1%}")             # 98.8%
print(f"{1234567:,}")              # 1,234,567
print(f"{host!r}")                 # 'db01' (repr)
print(f"{'left':<10}|{'right':>10}")  # выравнивание
print(f"{errors=}")                # errors=12 (debug-формат 3.8+)
```

### Срезы — для строк, списков, кортежей

```python
line = "2026-08-24T10:15:00Z ERROR api refused"
line[:10]        # '2026-08-24'
line[-3:]        # 'sed'
line[11:16]      # '10:15'
line[::-1]       # реверс
line[999:1005]   # '' — срез безопасен за границами
# line[999]      # IndexError — индексация нет!
```

### Распаковка и walrus

```python
first, *middle, last = [1, 2, 3, 4, 5]   # 1, [2,3,4], 5
a, b = b, a                              # swap
for k, v in {"a": 1}.items(): ...

if (n := len(line)) > 10:                # walrus 3.8+
    print(f"длинная: {n}")
```

---

## 2. Функции, декораторы, генераторы

### Аргументы и ЛОВУШКА mutable default

```python
def connect(host, port=5432, *args, timeout=5, **kwargs):
    # *args — лишние позиционные; после них — keyword-only
    ...

# ❌ КЛАССИЧЕСКАЯ ЛОВУШКА: default создаётся ОДИН РАЗ!
def add_host(host, hosts=[]):
    hosts.append(host)          # список живёт между вызовами!
add_host("a"); add_host("b")    # ['a', 'b'] — сюрприз

# ✅ Правильно:
def add_host(host, hosts=None):
    hosts = hosts if hosts is not None else []
    hosts.append(host)
    return hosts
```

### Декоратор retry

```python
import functools, time

def retry(times=3, delay=1):
    def decorator(func):
        @functools.wraps(func)               # сохранить имя/docstring
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == times:
                        raise
                    print(f"попытка {attempt}: {e}, retry {delay}с")
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(times=5, delay=2)
def fetch(url): ...
```

### Генераторы: O(1) памяти на гигабайтных логах

```python
def read_errors(path):
    with open(path) as f:
        for line in f:                # файл НЕ грузится в память
            if "ERROR" in line:
                yield line.rstrip()

n = sum(1 for _ in read_errors("app.log"))   # посчитали, не держа в RAM
```

### Контекстные менеджеры

```python
import contextlib

@contextlib.contextmanager
def temp_lock(path):
    f = open(path, "w")
    try:
        yield f
    finally:
        f.close()
        import os; os.remove(path)    # очистка ВСЕГДА, даже при исключении

with temp_lock("/tmp/lock") as f:
    f.write("locked")
```

---

## 3. Структуры данных: collections и itertools

```python
from collections import Counter, defaultdict, deque

Counter(["1.1.1.1","2.2.2.2","1.1.1.1"]).most_common(1)
# [('1.1.1.1', 2)]  — топ IP из лога за 3 строки

errors = defaultdict(list)             # без if key in dict
errors[host].append(msg)

tail = deque(maxlen=100)               # хвост лога: сам выкидывает старое

# dict comprehensions
merged = {**defaults, **overrides}     # overrides перекрывает
clean = {k: v for k, v in merged.items() if v is not None}

# itertools.groupby требует предварительной сортировки по ключу!
from itertools import groupby
for host, grp in groupby(sorted(logs, key=key_fn), key=key_fn):
    print(host, sum(1 for _ in grp))
```

---

## 4. Исключения: EAFP вместо LBYL

```python
# ✅ EAFP — pythonic: «делай и лови»
try:
    value = config["key"]
except KeyError:
    value = default
# или value = config.get("key", default)

# Свои исключения + цепочка (raise from сохраняет причину!)
class DeployError(Exception): ...

def deploy(app):
    try:
        push_image(app)
    except ConnectionError as e:
        raise DeployError(f"push {app} failed") from e

# Ловим конкретное; finally — всегда
try:
    risky()
except (TimeoutError, ConnectionError):
    retry()
finally:
    cleanup()
```

⚠️ Никогда голый `except:` — поймает даже Ctrl+C (KeyboardInterrupt).

---

## 5. Файлы, pathlib, subprocess

```python
from pathlib import Path
p = Path("/var/log/nginx") / "access.log"
p.exists(), p.suffix, p.stem, p.parent
p.read_text(); p.write_text("data")
for f in Path("/var/log").rglob("*.log"): print(f)   # рекурсивно
```

```python
import subprocess

def run(cmd: list[str]) -> str:
    r = subprocess.run(cmd, capture_output=True, text=True,
                       timeout=30, check=True)
    return r.stdout.strip()

run(["kubectl", "get", "pods", "-n", "prod", "-o", "name"])

# 💀 Инъекция: subprocess.run(f"kubectl delete pod {user}", shell=True)
# ✅ Безопасно: список аргументов — ввод остаётся ОДНИМ аргументом
subprocess.run(["kubectl", "delete", "pod", user_input])
```

---

## 6. Типизация и pydantic

```python
def deploy(app: str, replicas: int = 3, dry: bool = False) -> list[str]: ...
def find(name: str | None = None) -> dict | None: ...   # 3.10+

# pydantic — валидация конфига РАНТАЙМОМ
from pydantic import BaseModel, Field

class AppConfig(BaseModel):
    name: str
    replicas: int = Field(ge=1, le=50)
    image: str

AppConfig.model_validate_json('{"name":"api","replicas":0,"image":"x"}')
# ValidationError: replicas must be >= 1 — до деплоя, а не после!
```

---

## 7. ООП минимум: dataclasses

```python
from dataclasses import dataclass, field

@dataclass
class Server:
    name: str
    ip: str
    tags: dict[str, str] = field(default_factory=dict)  # против mutable trap
    role: str = "web"

    def is_prod(self) -> bool:
        return self.tags.get("env") == "prod"

# repr, __eq__ сгенерированы бесплатно
Server("web1", "10.0.0.1") == Server("web1", "10.0.0.1")   # True
```

---

## 8. asyncio: когда и зачем

```python
# I/O-bound + много соединений → async. CPU-bound → процессы!
import asyncio, aiohttp

async def check(session, url):
    try:
        async with session.get(url, timeout=5) as r:
            return url, r.status
    except Exception as e:
        return url, str(e)

async def main(urls):
    async with aiohttp.ClientSession() as s:
        for url, status in await asyncio.gather(*(check(s, u) for u in urls)):
            print(status, url)

asyncio.run(main(["http://a.local", "http://b.local"]))
# Последовательно 10с → параллельно 5с
```

⚠️ `requests`/`time.sleep` внутри async блокируют весь event loop — только aiohttp/asyncio.sleep.

---

## 9. Инструменты: venv, pytest, линтеры

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && pip freeze > requirements.lock

pytest -v -k deploy --maxfail=1
ruff check . && ruff format --check .      # линтер+форматтер
mypy src/                                   # статическая типизация
```

```python
# test_deploy.py
import pytest
from src.deploy import parse_replicas

@pytest.fixture
def cfg():
    return {"api": {"replicas": 3}}

@pytest.mark.parametrize("raw,expected", [("5", 5), ("3", 3)])
def test_parse(raw, expected):
    assert parse_replicas(raw) == expected

def test_invalid():
    with pytest.raises(ValueError):
        parse_replicas("abc")
```

---

## 10. Грабли языка

| Грабля | Пример | Правильно |
| :--- | :--- | :--- |
| Mutable default | `def f(x=[])` | `def f(x=None): x = x or []` |
| `is` vs `==` | `a is 25` — интернирование солжёт | `is` только для None/True/False |
| Изменение списка в цикле | `for x in lst: lst.remove(x)` | итерировать по копии `lst[:]` |
| Позднее связывание lambda | `[lambda: i for i in range(3)]` → все вернут 2 | `lambda i=i: i` |
| GIL | threads не ускоряют CPU-код | multiprocessing / async для I/O |
| Import при запуске файла | `ModuleNotFoundError` | `python -m pkg.tool` |

---

## 11. Готовые паттерны DevOps

### Парсер логов (генератор + Counter)

```python
#!/usr/bin/env python3
"""Топ-5 IP с 5xx за последний час."""
import re, sys
from collections import Counter
from datetime import datetime, timedelta, timezone

PAT = re.compile(r'(?P<ip>\S+) .* \[(?P<ts>[^\]]+)\] "(?:\S+ \S+ )?(?P<code>\d{3})')

def errors_last_hour(path):
    cutoff = datetime.now(timezone.utc) - timedelta(hours=1)
    with open(path) as f:
        for line in f:
            if (m := PAT.search(line)) and m["code"].startswith("5"):
                ts = datetime.strptime(m["ts"].split()[0],
                     "%d/%b/%Y:%H:%M:%S").replace(tzinfo=timezone.utc)
                if ts >= cutoff:
                    yield m["ip"]

if __name__ == "__main__":
    for ip, n in Counter(errors_last_hour(sys.argv[1])).most_common(5):
        print(f"{n:6d}  {ip}")
```

### CLI на typer с dry-run по умолчанию

```python
import typer
app = typer.Typer()

@app.command()
def cleanup(namespace: str, days: int = 7, dry_run: bool = True):
    """Удалить завершённые поды старше N дней."""
    for pod in find_finished(namespace, days):
        print(f"DRY-RUN: удалил бы {pod}" if dry_run else delete_pod(pod))

if __name__ == "__main__":
    app()
```

---

## 2.5 Проверь себя — 5 вопросов

**В1. Что вернут вызовы `f(1)`, `f(2)` для `def f(x, acc=[]): acc.append(x); return acc` и почему?**

<details><summary>Ответ</summary>
[1], затем [1, 2]: mutable default вычисляется ОДИН раз при def и живёт между вызовами. Правильно: acc=None + создание внутри.
</details>

**В2. Найдите ошибку: `subprocess.run(f"kubectl delete pod {user}", shell=True)` при user из веб-формы.**

<details><summary>Ответ</summary>
shell=True + интерполяция = инъекция: "x; rm -rf /" выполнится. Правильно: список аргументов без shell — ввод останется одним аргументом.
</details>

**В3. Чем генератор лучше списка при обработке лога на 10GB?**

<details><summary>Ответ</summary>
Генератор ленив: O(1) памяти (одна строка за раз); список загрузит весь файл в RAM и уронит процесс. Для стриминга — только генераторы.
</details>

**В4. Сценарий: внутри async-функции вызвали requests.get(). Что произойдёт с другими корутинами?**

<details><summary>Ответ</summary>
Синхронный вызов блокирует event loop: ВСЕ корутины встают на время запроса. Нужны aiohttp/httpx.AsyncClient или asyncio.to_thread.
</details>

**В5. Зачем `functools.wraps` в декораторе и что сломается без него?**

<details><summary>Ответ</summary>
wraps копирует __name__/__doc__ оригинала. Без него декорированная функция «называется» wrapper — ломаются логи, дебаггер, автодокументация и интроспекция.
</details>

---

## 2.6 Практика — 3 задания

### Задание 1: Парсер логов с тестами

**Условие:** скрипт `top_ips.py` (из раздела 11) + pytest-тесты.

**Шаг 1** — стартовое состояние: файл `top_ips.py` с функцией `errors_last_hour(path)`; тестовый лог `test.log` с 3 строками (2 ошибки, 1 ок).

**Шаг 2** — тест с фикстурой:
```python
# test_top_ips.py
from top_ips import errors_last_hour

def test_counts(tmp_path):                     # встроенная фикстура tmp_path!
    log = tmp_path / "app.log"
    log.write_text('1.1.1.1 - - [24/Aug/2026:10:00:00 +0000] "GET / 500"\n'
                   '1.1.1.1 - - [24/Aug/2026:10:01:00 +0000] "GET / 500"\n'
                   '2.2.2.2 - - [24/Aug/2026:10:02:00 +0000] "GET / 200"\n')
    assert list(errors_last_hour(str(log))) == ["1.1.1.1", "1.1.1.1"]
```

**Шаг 3** — `pytest -v` → 1 passed. Проверка в CLI: `python top_ips.py test.log`.

**Проверь себя:** `pytest` зелёный; `tmp_path` создал временный каталог — в репо нет мусора.

**Разбор:** фикстура tmp_path изолирует тест от файловой системы. Дата в тесте фиксирована (2026-08-24) — если парсер фильтрует «последний час», тест «протухнет»; для честного теста прокиньте cutoff параметром.

### Задание 2: Декоратор retry с exponential backoff

**Условие:** `@retry(times=4)` — задержки 1с, 2с, 4с (удвоение).

**Шаг 1** — реализация:
```python
def retry(times=3):
    def deco(fn):
        @functools.wraps(fn)
        def w(*a, **k):
            delay = 1
            for attempt in range(1, times + 1):
                try:
                    return fn(*a, **k)
                except Exception as e:
                    if attempt == times:
                        raise
                    print(f"retry {attempt} через {delay}с: {e}")
                    time.sleep(delay)
                    delay *= 2
        return w
    return deco
```

**Шаг 2** — тест с мок-счётчиком:
```python
calls = {"n": 0}
@retry(times=3)
def flaky():
    calls["n"] += 1
    if calls["n"] < 3: raise ConnectionError
    return "ok"
assert flaky() == "ok" and calls["n"] == 3
```

**Проверь себя:** третий вызов успешен; задержки в выводе: 1с, 2с (exponential).

**Разбор:** exponential backoff — стандарт против шторма ретраев. В проде добавьте jitter (random) — чтобы все клиенты не стучали одновременно.

### Задание 3: pydantic-валидация конфига деплоя

**Условие:** конфиг из YAML валидируется схемой до деплоя; невалидный — падает с понятной ошибкой.

**Шаг 1** — схема:
```python
from pydantic import BaseModel, Field
class Deploy(BaseModel):
    name: str
    image: str
    replicas: int = Field(ge=1, le=50)
    namespace: str = "default"
```

**Шаг 2** — валидация:
```python
import yaml
cfg = Deploy.model_validate(yaml.safe_load(open("deploy.yaml")))
print(cfg.replicas)   # типизированный доступ, IDE подсказывает
```

**Шаг 3** — сломайте replicas: 0 → ValidationError с указанием поля.

**Проверь себя:** валидный конфиг → объект с типами; replicas=0 → `ValidationError: replicas must be >= 1`.

**Разбор:** pydantic заменяет десятки ручных `if not isinstance` — схема = документация + валидация + автогенерация JSON Schema (`Deploy.model_json_schema()`).

---

*Следующая страница: [02. Go для DevOps](02-go-for-devops.md)*
