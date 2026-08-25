# 🚀 10. Python: Профилирование и Производительность

## 🔬 Методология: сначала измерь

Оптимизация без профиля = лотерея. Правило: **нашёл 80% времени в одной функции — оптимизируй её, остальное не трогай**.

```bash
# Три уровня инструментария:
cProfile      # встроенный, детальный, замедляет код (~2×)
py-spy        # сэмплирующий, работает на ЖИВОМ процессе, без правки кода
line_profiler # построчный профиль конкретной функции
```

```python
# Быстрый прогон из скрипта:
import cProfile, pstats
profiler = cProfile.Profile()
profiler.enable()
main()                       # подозреваемый код
profiler.disable()
stats = pstats.Stats(profiler).sort_stats("cumulative")
stats.print_stats(15)        # топ-15 по накопительному времени
```

```text
   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
     1200    4.811    0.004    5.912    0.005 parser.py:42(parse_line)   ← tottime: своё время
   480000    0.933    0.000    1.101    0.000 re.py:186(search)          ← cumtime: с вызовами внутрь
```

**Читаем:** `tottime` — сколько функция работала сама; `cumtime` — вместе со всеми вызовами. Оптимизируйте по `tottime` у листьев и по `ncalls` (внезапные миллионы вызовов = лишняя работа в цикле).

## 🕵️ py-spy: профилирование боевого процесса

```bash
pip install py-spy

py-spy top --pid 1234                    # live-топ функций прямо сейчас
py-spy record -o profile.svg --pid 1234 --duration 60    # flamegraph за минуту
py-spy dump --pid 1234                   # мгновенные стеки всех потоков (диагностика зависаний!)
py-spy record -- python script.py        # запуск под профилем
py-spy record --native -p 1234           # включая C-расширения (numpy, regex)
```

Flamegraph читается снизу вверх: ширина плашки ∝ доле CPU. Плоский широкий «хребет» = горячая функция.

## 🧠 Память: tracemalloc и утечки

```python
import tracemalloc
tracemalloc.start()

process_logs(huge_file)

snapshot = tracemalloc.take_snapshot()
top = snapshot.statistics("lineno")
for stat in top[:10]:
    print(stat)          # где именно родились мегабайты
```

Типовые утечки DevOps-скриптов:

| Причина | Симптом | Лечение |
|---|---|---|
| Список-аккумулятор всех строк лога | RSS растёт линейно | стримить генератором, а не `f.readlines()` |
| Кэш без ограничения | память только растёт | `functools.lru_cache(maxsize=1024)` |
| Замыкание держит большой объект | объект не собирается GC | явный `del`/None в конце итерации |
| C-расширение | tracemalloc молчит | memray / jemalloc |

## ⚡ Частые ускорители (по убыванию пользы)

### 1. Алгоритм и структура данных

```python
# O(n²) → O(n): поиск в списке внутри цикла
seen = set(existing_ids)              # set вместо list для in
if uid not in seen: ...

# Группировка одним проходом:
from collections import defaultdict
by_ns = defaultdict(list)
for pod in pods: by_ns[pod.namespace].append(pod)
```

### 2. Не делай работу дважды

```python
@lru_cache(maxsize=2048)
def parse_manifest(path: str) -> dict: ...       # конфиги читаются много раз

# Компилируй regex вне цикла:
LOG_RE = re.compile(r'(?P<ip>\S+) .+ "(?P<verb>\w+) (?P<path>\S+)')
for line in f: m = LOG_RE.match(line)            # ×3–5 быстрее re.match в цикле
```

### 3. Правильный I/O: батчи и стриминг

```python
# ❌ 1000 HTTP-вызовов по одному
# ✅ батч-эндпоинт или параллельные запросы (ThreadPoolExecutor/asyncio)

# Стриминг больших файлов:
with open("access.log") as f:                    # читает строку за раз, O(1) памяти
    for line in f: process(line)

# SQL: executemany вместо N execute; COPY для массовой загрузки.
```

### 4. Библиотеки вместо рукописного Python

`json` → `orjson` (×5), `csv` модуль → pandas/pyarrow для гигабайт, чистые циклы над числами → numpy (векторизация).

## 📏 Бенчмаркинг честный

```bash
hyperfine 'python parse_old.py access.log' 'python parse_new.py access.log' \
    --warmup 2 --min-runs 10
# Benchmark 1: mean 12.441 s ± 0.183 s
# Benchmark 2: mean  2.117 s ± 0.041 s    ← ×5.88 быстрее
```

⚠️ Микробенчмарки `%timeit` в REPL обманывают на I/O-bound задачах: меряйте целевой сценарий целиком.

## ❓ Пять вопросов для самопроверки

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

---

## ✅ Итоги раздела Python (02–10)

Покрыто: окружения/упаковка (uv, wheel), pytest (fixtures/mocks/hypothesis), asyncio/GIL, типизация mypy+ruff, CLI (typer), K8s-операторы (kopf), FastAPI-платформенные API, boto3 deep + moto, профилирование (cProfile/py-spy/tracemalloc).

*Дальше:* Go-раздел начинается со страницы [02-go-fundamentals-deep](02-go-fundamentals-deep.md).
