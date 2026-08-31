# 🛡️ 05. Python: Типизация, mypy strict и Ruff

> Уровень: Senior. Цель: типы как статические тесты — ловить баги до рантайма, документировать API, автоматизировать рефакторинг. От `Any` к `Never`.

## 🎯 Зачем типы DevOps-инструментам

Скрипты живут годами, их правят разные люди в спешке инцидента. Типы = документация + статические тесты до запуска. Ошибка «передал строку вместо int в конфиг деплоя» ловится mypy за секунды, а не падает на проде в 3 ночи.

```python
def rollout(ns: str, name: str, replicas: int = 3, dry_run: bool = False) -> bool:
    """Прокатить деплой. Возвращает True, если применился."""
    ...

# Без типов — что за ns? str? int? Можно ли None? Что вернёт?
# С типами — IDE подскажет, mypy поймает rollout(123, None)
```

**Цена отсутствия типов — реальный инцидент:**

```python
# deploy.py без типов:
def scale(replicas):  # replicas — str из ENV? int из YAML? кто знает
    for i in range(replicas):  # если replicas="3" → TypeError в проде!
        ...

scale(os.getenv("REPLICAS", 3))  # os.getenv всегда str | None!
```

```mermaid
flowchart LR
    A["Код без типов<br/>ошибка в проде"] --> B["Аннотации<br/>документация"]
    B --> C["mypy/pyright<br/>ошибка до коммита"]
    C --> D["pydantic<br/>ошибка на границе рантайма"]
    D --> E["Надёжный деплой"]
```

---

## 📝 Современная типизация: что реально используется

```python
from typing import Any, Literal, TypeVar, Protocol
from collections.abc import Callable, Iterable, Sequence   # НЕ typing.List/Dict (устарели с 3.9)
from pathlib import Path

# 1. Контейнеры и опциональность
def find_pods(labels: dict[str, str], ns: list[str] | None = None) -> Sequence[str]:
    ...

# 2. Literal — конечные варианты вместо строк-магии
Env = Literal["dev", "stage", "prod"]
def deploy(image: str, env: Env) -> None: ...       # mypy поймает deploy(img, "prodd")

# 3. TypedDict — структура словаря (ответы API, конфиги)
from typing import TypedDict
class PodInfo(TypedDict, total=False):
    name: str
    ready: bool
    restarts: int

# 4. Protocol — структурная типизация (duck typing со статической проверкой)
class Notifier(Protocol):
    def send(self, title: str, body: str) -> None: ...

def alert(n: Notifier) -> None: n.send("OOM", "pod/crashed")
# Подойдёт ЛЮБОЙ класс с методом .send этой сигнатуры — без наследования!

# 5. TypeVar для generic-функций
T = TypeVar("T")
def first(items: Iterable[T]) -> T | None: ...
```

### Система типов — полная карта

| Концепт | Что | Когда | Пример |
|---|---|---|---|
| `str \| None` | Union (3.10+) | опциональный параметр | `def f(x: str \| None)` |
| `Optional[X]` | `X \| None` (устаревает) | то же, старый синтаксис | `Optional[str]` |
| `Literal["a","b"]` | точные значения | env, статусы | `Literal["dev","prod"]` |
| `Final` | константа, не переназначать | константы модуля | `TIMEOUT: Final = 30` |
| `TypedDict` | структура dict | JSON API, конфиги | `class Pod(TypedDict): name: str` |
| `Protocol` | duck typing | плагины, notifier | `class Closer(Protocol): def close(): ...` |
| `TypeVar` | generic | `first[T]` | `T = TypeVar("T")` |
| `overload` | перегрузки | разный return по входу | `@overload def get(x: int) -> int` |
| `Self` (3.11+) | тип self | chain-методы | `def copy(self) -> Self` |
| `Annotated` | метаданные для типа | `Field`, валидация | `Annotated[int, Field(ge=1)]` |
| `Never` / `NoReturn` | никогда не вернёт | `sys.exit`, `raise` | `def fail() -> Never: raise ...` |
| `TypeGuard` | сужение типа | `is_str(x)` → `x is str` | `def is_str(x) -> TypeGuard[str]` |
| `TypeIs` (3.13+) | строгое сужение | аналог TypeGuard строже | `def is_str(x) -> TypeIs[str]` |

```python
# Полный пример — все фичи вместе:
from typing import Literal, TypedDict, Protocol, TypeVar, overload, Final, Annotated, Never, TypeGuard
from typing import Self  # или typing_extensions для <3.11
from collections.abc import Sequence

# Final — константа:
TIMEOUT: Final = 30
# TIMEOUT = 60  # mypy error: Cannot assign to final name

# Literal — исчерпывающий набор:
Env = Literal["dev", "stage", "prod"]
def promote(image: str, env: Env) -> None: ...
promote("api:1", "prod")  # ✅
# promote("api:1", "test")  # ❌ mypy: Argument has incompatible type

# TypedDict — с required/optional ключами:
from typing import Required, NotRequired  # 3.11+
class PodInfo(TypedDict):
    name: Required[str]
    namespace: NotRequired[str]
    ready: bool

p: PodInfo = {"name": "api", "ready": True}  # namespace опционален
# p["name"] — str (mypy знает)
# p.get("namespace") — str | None

# Или total=False — все поля опциональны:
class PartialPod(TypedDict, total=False):
    name: str
    ready: bool

# Protocol — структурная типизация:
class SupportsClose(Protocol):
    def close(self) -> None: ...

def cleanup(r: SupportsClose) -> None:
    r.close()
# Подойдёт любой объект с .close(), без наследования:
class MyResource:
    def close(self) -> None: print("closed")
cleanup(MyResource())  # ✅

# TypeVar + Generic:
from typing import TypeVar
T = TypeVar("T")
def first(items: Sequence[T]) -> T | None:
    return items[0] if items else None
reveal = first([1, 2, 3])  # mypy знает: int | None
# Bounded TypeVar:
from typing import TypeVar
AnyStr = TypeVar("AnyStr", str, bytes)  # только str или bytes
def concat(a: AnyStr, b: AnyStr) -> AnyStr: return a + b  # type: ignore

# overload — разный return по перегрузке:
from typing import overload
@overload
def get_pod(name: str) -> dict[str, str]: ...
@overload
def get_pod(name: None) -> None: ...
def get_pod(name: str | None) -> dict[str, str] | None:
    if name is None:
        return None
    return {"name": name}

# Self — для chain/fluent API:
from typing import Self
class Builder:
    def with_replicas(self, n: int) -> Self:
        self.replicas = n
        return self
    def build(self) -> dict[str, int]:
        return {"replicas": self.replicas}

# Annotated — метаданные (pydantic, FastAPI):
from typing import Annotated
from annotated_types import Ge, Le
Replicas = Annotated[int, Ge(1), Le(50)]
def scale(n: Replicas) -> None: ...  # mypy + pydantic понимают ограничения

# Never — функция не возвращает (всегда бросает/выходит):
from typing import Never
import sys
def fatal(msg: str) -> Never:
    print(f"FATAL: {msg}", file=sys.stderr)
    sys.exit(1)
    # или raise RuntimeError(msg) — тоже Never

# TypeGuard — сужение типа в if:
from typing import TypeGuard
def is_str_list(val: list[object]) -> TypeGuard[list[str]]:
    return all(isinstance(x, str) for x in val)

def process(val: list[object]) -> None:
    if is_str_list(val):
        reveal_type(val)  # mypy: list[str] — сузил!
        print(", ".join(val))  # безопасно
    else:
        print("mixed")

# TypeIs (3.13+, строже TypeGuard):
from typing import TypeIs
def is_two_element(x: tuple[object, ...]) -> TypeIs[tuple[str, int]]:
    return len(x) == 2 and isinstance(x[0], str) and isinstance(x[1], int)
```

**Union vs Optional — современный синтаксис:**

```python
# Python 3.10+ — X | Y вместо Union[X, Y]:
def find(name: str | None = None) -> dict[str, str] | None: ...

# Старый (до 3.10):
from typing import Union, Optional, Dict, List
def find_old(name: Optional[str] = None) -> Union[Dict[str, str], None]: ...

# Встроенные коллекции вместо typing (3.9+):
# list[str] вместо List[str]
# dict[str, int] вместо Dict[str, int]
# tuple[int, ...] вместо Tuple[int, ...]
# collections.abc: Sequence, Mapping, Iterable — для параметров (ковариантны)

from collections.abc import Sequence, Mapping
def handle(items: Sequence[str]) -> None:  # принимает list, tuple
    ...
# list[str] — инвариантен, Sequence[str] — ковариантен (принимает подтипы)
```

---

## 🔍 Mypy strict: включаем без боли

```ini
# pyproject.toml — секция mypy
[tool.mypy]
python_version = "3.12"
warn_unused_ignores = true
warn_redundant_casts = true
warn_return_any = true
warn_unreachable = true
disallow_untyped_defs = true        # строгий: каждая функция типизирована
disallow_untyped_decorators = true
disallow_any_generics = true
no_implicit_optional = true         # def f(x: str = None) → ошибка, нужно str | None
check_untyped_defs = true
strict_optional = true
show_error_codes = true

[[tool.mypy.overrides]]             # библиотеки без типов — точечно прощаем
module = ["kubernetes.*", "yaml.*"]
ignore_missing_imports = true

[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false       # тесты можно мягче
```

```bash
mypy src tests                       # полный прогон (~секунды на средний проект)
mypy --install-types                 # поставить недостающие type-stubs (types-PyYAML, types-requests)
mypy --cache-dir=.mypy_cache src     # кэш: повторные прогоны ×10 быстрее
mypy --show-error-codes src          # коды ошибок для # type: ignore[code]

# Альтернатива — pyright (быстрее, строже, от Microsoft, используется в VS Code Pylance):
# pyproject.toml:
[tool.pyright]
typeCheckingMode = "strict"
pythonVersion = "3.12"
```

Работа с легаси: включите strict на новом пакете (`per-module-options`) и расширяйте покрытие; `# type: ignore[error-code]` — только с кодом ошибки и комментарием-причиной.

### Mypy vs pyright — сравнение

| Аспект | mypy | pyright |
|---|---|---|
| Скорость | средняя | быстрее (написан на TS, инкрементальный) |
| Строгость | настраиваемая, зрелые плагины (pydantic, sqlalchemy) | очень строгая, лучше inference |
| IDE | mypy dmypy daemon | Pylance (VS Code) — мгновенная обратная связь |
| Конфиг | `tool.mypy` | `tool.pyright` |
| Когда | дефолт, больше документации | если нужна максимальная строгость / скорость |

**Постепенное внедрение — стратегия:**

```toml
# Начать мягко, ужесточать по модулям:
[tool.mypy]
python_version = "3.12"
warn_unused_ignores = true
# disallow_untyped_defs = false  # пока false

[[tool.mypy.overrides]]
module = "devops_toolkit.core.*"
disallow_untyped_defs = true  # новый core — уже strict

[[tool.mypy.overrides]]
module = "devops_toolkit.legacy.*"
ignore_errors = true  # легаси — пока игнорируем, мигрируем постепенно
```

**Типичные ошибки mypy и фиксы:**

```python
# 1. Any просочился:
from typing import Any
def parse(data: Any) -> dict[str, str]:  # Any заразителен — mypy не проверит внутри
    return data  # ❌

# Фикс — unknown → валидировать:
def parse(data: object) -> dict[str, str]:
    if not isinstance(data, dict):
        raise TypeError
    return data  # mypy сузит после isinstance

# 2. None не проверен:
def greet(name: str | None) -> str:
    return name.upper()  # ❌ mypy: Item "None" has no attribute "upper"
def greet_fixed(name: str | None) -> str:
    if name is None:
        return "hello"
    return name.upper()  # ✅ mypy знает что name is str

# 3. Инвариантность list:
def add(items: list[str]) -> None: ...
my_list: list[str] = []
add(my_list)  # ✅
# def handle(seq: list[object]) -> None: ...
# handle(my_list)  # ❌ list инвариантен! Нужен Sequence[object] (ковариантен)

# 4. # type: ignore без кода — скрывает всё:
x = some_untyped()  # type: ignore  # ❌ скроет любую ошибку на строке
x = some_untyped()  # type: ignore[no-untyped-call]  # ✅ точечно
```

---

## 🧹 Ruff: линтер+форматтер одним инструментом

Ruff заменил flake8+isort+black-конвейер: один бинарник на Rust, сотни правил, автофиксы. В 10-100× быстрее flake8.

```toml
[tool.ruff]
line-length = 100
target-version = "py312"
exclude = [".venv", ".git", "__pypackages__"]

[tool.ruff.lint]
select = [
  "E", "F", "W",       # pyflakes/pycodestyle — база
  "I",                 # isort (порядок импортов)
  "B",                 # bugbear: реальные баги (mutable default!)
  "C4",                # comprehensions
  "SIM",               # simplify
  "S",                 # bandit: безопасность (хардкод паролей!)
  "UP",                # устаревший синтаксис → современный (UP035: typing.List → list)
  "ASYNC",             # блокирующие вызовы в async (ASYNC100: blocking sleep)
  "RET",               # return
  "ARG",               # unused argument
  "PL",                # pylint
]
ignore = ["E501"]      # длину строк держит форматтер
unfixable = ["S"]      # безопасность — не автофиксить без ревью

[tool.ruff.lint.pydocstyle]
convention = "google"

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
magic-trailing-comma = true
docstring-code-format = true

[tool.ruff.lint.isort]
known-first-party = ["devops_toolkit"]
```

```bash
ruff check --fix src tests      # линт + автофиксы (безопасные)
ruff check --fix --unsafe-fixes src  # + небезопасные (меняют логику — ревью!)
ruff format src tests           # форматирование (аналог black, но быстрее)
ruff check --statistics src     # топ проблем легаси-репо (с чего начать)
ruff rule B006                  # справка по правилу
```

Правила, которые чаще всего ловят настоящие баги:

| Правило | Что ловит | Автофикс | Пример |
|---|---|---|---|
| `B006` | mutable default | нет | `def f(x=[])` |
| `B904` | `raise ... from err` внутри except | да | `raise E from e` |
| `S105/S106` | хардкод паролей/токенов | нет | `password = "secret"` |
| `S602` | `shell=True` с подстановкой | нет | `subprocess.run(..., shell=True)` |
| `ASYNC101` | `time.sleep` в async | нет | `await sleep` |
| `ASYNC109` | `open` в async | нет | `await aiofiles.open` |
| `E722` | голый `except:` | да | `except Exception:` |
| `RET504` | бессмысленное `x = f(); return x` | да | `return f()` |
| `UP035` | `typing.List` → `list` | да | `list[str]` |
| `UP006` | `typing.Dict` → `dict` | да | `dict[str, int]` |
| `I001` | неотсортированные импорты | да | isort |
| `F821` | неопределённая переменная | нет | `print(x)` без `x` |
| `SIM102` | вложенные `if` → `and` | да | `if a: if b:` → `if a and b:` |

### Ruff vs black vs isort — миграция

```bash
# Было (3 инструмента, 3 конфига, медленно):
# .flake8, .isort.cfg, pyproject.toml[tool.black]
# flake8 src && isort --check src && black --check src

# Стало (1 инструмент, 1 конфиг, быстро):
# pyproject.toml[tool.ruff] + [tool.ruff.format]
ruff check src tests
ruff format --check src tests  # в CI — проверка без изменения
```

**Миграция black → ruff format:** `ruff format` совместим с black на 99% (те же строки, те же кавычки). Замените `black` на `ruff format` в pre-commit и CI — конфиг `tool.ruff.format` почти идентичен `tool.black`.

---

## 🔒 Типизация на границах: pydantic vs dataclass vs TypedDict

```python
from pydantic import BaseModel, Field, field_validator, ConfigDict
from dataclasses import dataclass
from typing import TypedDict

# TypedDict — только для mypy, ноль рантайма:
class PodTD(TypedDict):
    name: str
    ready: bool

# dataclass — рантайм-объект, но без валидации:
@dataclass
class PodDC:
    name: str
    ready: bool

# pydantic — рантайм-валидация + парсинг + JSON Schema:
class PodModel(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")  # не приводить типы, запретить лишние поля
    name: str = Field(min_length=1)
    ready: bool = False
    replicas: int = Field(ge=1, le=50, default=1)

    @field_validator("name")
    @classmethod
    def name_must_be_dns(cls, v: str) -> str:
        if not v.islower():
            raise ValueError("name must be lowercase DNS")
        return v

# Использование:
raw = '{"name": "api", "ready": true, "replicas": 0}'
try:
    pod = PodModel.model_validate_json(raw)
except Exception as e:
    print(e)  # ValidationError: replicas must be >= 1

# JSON Schema для документации/API:
print(PodModel.model_json_schema())

# Когда что:
# TypedDict — внутри доверенного кода,Dict из API уже провалидирован
# dataclass — внутренние объекты, нужна мутабельность/наследование
# BaseModel — границы системы (YAML, JSON, ENV, API ответы)
```

| Критерий | TypedDict | dataclass | pydantic BaseModel |
|---|---|---|---|
| Рантайм-валидация | нет | нет (только `__post_init__` вручную) | да, с coercion и ошибками |
| Производительность | 0 overhead | быстро | медленнее (но v2 на Rust — быстро) |
| JSON Schema | нет | нет | `model_json_schema()` |
| Extra поля | mypy ловит | игнор | `extra="forbid"` ловит |
| Когда | внутри | внутри | на границе |

Pydantic v2 — типизация на границах (внешние данные):

```python
from pydantic import BaseModel, Field, field_validator

class DeployConfig(BaseModel):
    image: str = Field(pattern=r"^[\w./-]+:[\w.-]+$")   # тег обязателен
    replicas: int = Field(ge=1, le=50, default=3)
    env: dict[str, str] = {}

    @field_validator("image")
    @classmethod
    def no_latest(cls, v: str) -> str:
        if v.endswith(":latest"): raise ValueError("latest запрещён политикой")
        return v

cfg = DeployConfig.model_validate_json(raw_yaml_converted)  # ValidationError с деталями
```

---

## 🚦 Полный quality-gate в CI

```yaml
# .gitlab-ci.yml / .github/workflows/ci.yml
quality:
  stage: test
  image: ghcr.io/astral-sh/uv:python3.12-bookworm-slim
  before_script:
    - uv sync --frozen
  script:
    - uv run ruff format --check .          # 1. формат (быстро, без изменения)
    - uv run ruff check .                   # 2. линт (баги, безопасность, стиль)
    - uv run mypy src tests                 # 3. типы (strict)
    - uv run pytest -q --cov=src --cov-fail-under=80  # 4. тесты
  rules: [{ if: '$CI_PIPELINE_SOURCE == "merge_request_event"' }]

# Локально тот же набор — pre-commit:
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.8.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.11.0
    hooks:
      - id: mypy
        additional_dependencies: [pydantic, types-PyYAML]
```
Локально тот же набор — pre-commit (см. Git 06): правки формата никогда больше не приходят ревьюеру.

### Безопасность типов — `Any` как техдолг

```python
# Any — «выключить проверку типов» для выражения. Заразен: Any + str = Any
from typing import Any

def untyped(data: Any) -> Any:  # ❌ mypy ничего не проверит внутри
    return data["key"].upper()  # не поймает если data — int

# Альтернативы Any по строгости:
# object — «не знаю что, но проверю через isinstance»
# Unknown — нет такого, но есть Any vs object:
#   object — безопасный верх (требует isinstance перед использованием)
#   Any — небезопасный (разрешает всё)

def safe(data: object) -> str:
    if isinstance(data, dict) and "key" in data:
        val = data["key"]
        if isinstance(val, str):
            return val.upper()
    raise TypeError

# cast — «я знаю лучше mypy» (без рантайма, только для mypy):
from typing import cast
val = cast(str, maybe_str)  # mypy поверит что это str, рантайм — без проверки!

# reveal_type — отладка типов:
reveal_type(val)  # mypy выведет: Revealed type is "builtins.str"
```

---

## ❓ Десять вопросов для самопроверки

---

## ✅ Проверь себя

> Отвечай вслух до раскрытия ответа. Если «не помню» — вернись к разделу.


**В1. Чем `Literal["dev","prod"]` лучше типа `str` для параметра окружения?**
<details><summary>Ответ</summary>
Mypy проверит допустимость значения во всех местах вызова (опечатка "prodd" — ошибка компиляции), IDE даст автодополнение, а рефакторинг найдёт все точки использования. Строка допускает всё — ошибка всплывёт в рантайме на проде. Literal — исчерпывающий enum без overhead.
</details>

**В2. Когда TypedDict, а когда Pydantic-модель?**
<details><summary>Ответ</summary>
TypedDict — статическое описание словаря для mypy внутри доверенного кода (нулевой runtime-cost, только проверка mypy). Pydantic — там, где данные приходят извне (API, YAML, env): рантайм-валидация, coercion типов, понятные ошибки, JSON Schema. Часто вместе: Pydantic на входе → TypedDict/датаклассы внутри.
</details>

**В3. Как внедрить mypy strict в проект без типов, не утонув?**
<details><summary>Ответ</summary>
Инкрементально: базовый конфиг мягкий (`disallow_untyped_defs = false`), strict включается per-module через `[[tool.mypy.overrides]]` на новых пакетах (`devops_toolkit.core.*`). Старые модули через overrides с `ignore_errors = true` и постепенно подтягиваются. Каждый новый файл — уже под strict. Автофиксы ruff (UP) убирают механическую часть.
</details>

**В4. Почему `def add_tag(tags=[])` — баг даже если работает?**
<details><summary>Ответ</summary>
Default-значение вычисляется ОДИН РАЗ при определении функции: все вызовы без аргумента получат один и тот же список и будут его мутировать (разделяемое состояние). Правильно `tags: list[str] | None = None` + создание внутри. Это ловит правило B006 (ruff) и mypy с правильной аннотацией.
</details>

**В5. Что даёт запуск `ruff format --check` в CI отдельным шагом?**
<details><summary>Ответ</summary>
Проверка без изменения файлов: MR с неотформатированным кодом краснеет, ревью не тратится на «поставь пробел». Единый стиль гарантируется независимо от локальных настроек разработчиков; автофикс — команда `ruff format` локально. Быстрее black, один бинарник.
</details>

**В6. Чем `Sequence[str]` лучше `list[str]` для параметра функции, принимающей список имён?**
<details><summary>Ответ</summary>
`list[str]` инвариантен — `list[str]` нельзя передать где ожидается `list[object]`. `Sequence[str]` ковариантен и принимает `list`, `tuple`, `range` — шире. Плюс Sequence сигнализирует «функция не мутирует вход», что важно для контрактов. Мутирующим функциям — `MutableSequence`.
</details>

**В7. Что делает `TypeGuard` и чем он отличается от `bool` в функции-предикате?**
<details><summary>Ответ</summary>
`def is_str(x: object) -> TypeGuard[str]` говорит mypy: если вернула True, то x — str ВНУТРИ if-ветки (сужение типа). С `-> bool` mypy не сузит тип, и `x.upper()` после `if is_str(x):` останется ошибкой. TypeGuard — мост между рантайм-проверкой и статическим анализом.
</details>

**В8. Почему `cast(str, x)` опасен и когда его можно использовать?**
<details><summary>Ответ</summary>
`cast` — чисто для mypy, рантайм-проверки нет: `cast(str, 123)` не упадёт, но mypy поверит что это str и пропустит баг. Использовать только когда вы знаете больше mypy (например, JSON-поле гарантированно str по контракту API, но mypy видит `Any`). Альтернатива — `isinstance` + `assert` (есть рантайм-проверка).
</details>

**В9. Что поймает `ruff` правило `S602` и `ASYNC101`, и почему это баги прод-уровня?**
<details><summary>Ответ</summary>
S602 — `subprocess` с `shell=True` и интерполяцией (инъекция: `f"kubectl delete {user}"` → `; rm -rf /`). ASYNC101 — блокирующий `time.sleep`/`requests.get` внутри `async def` (замораживает весь event loop, все 10k соединений встают). Оба — не стиль, а реальные инциденты.
</details>

**В10. Чем `pyright --typeCheckingMode strict` отличается от `mypy --strict` и когда выбрать pyright?**
<details><summary>Ответ</summary>
Оба — строгие, но pyright быстрее (инкрементальный, на TS) и строже в inference (лучше выводит типы без аннотаций), идеален для VS Code Pylance (мгновенная обратная связь). mypy — зрелее, больше плагинов (pydantic, sqlalchemy), дефолт в CI. Выбор: pyright для скорости/IDE, mypy для экосистемы плагинов; можно оба в CI.
</details>

---

## 🔬 Продвинутые кейсы: generics, overload, variance, Annotated

### Overload — точные типы для полиморфных функций

```python
from typing import overload, Literal

@overload
def get_config(env: Literal["prod"]) -> dict[str, str]: ...
@overload
def get_config(env: Literal["dev"]) -> dict[str, int]: ...
@overload
def get_config(env: str) -> dict[str, object]: ...
def get_config(env: str) -> dict[str, object]:
    if env == "prod":
        return {"url": "https://prod.local"}
    elif env == "dev":
        return {"port": 8080}
    return {}

# mypy сузит return по значению аргумента:
prod_cfg = get_config("prod")  # dict[str, str]
dev_cfg = get_config("dev")    # dict[str, int]
```

### Variance — почему `list[Cat]` нельзя туда где `list[Animal]`

```python
from collections.abc import Sequence, MutableSequence

class Animal: ...
class Cat(Animal): ...

def read_animals(seq: Sequence[Animal]) -> None:  # ковариантна — можно передать Sequence[Cat]
    for a in seq: print(a)

def write_animals(seq: MutableSequence[Animal]) -> None:  # инвариантна — нельзя!
    seq.append(Animal())

cats: list[Cat] = [Cat()]
read_animals(cats)   # ✅ Sequence ковариантна
# write_animals(cats)  # ❌ ошибка — если разрешить, можно добавить Animal в список котов!

# Правило:
# - Чтение → Sequence/Mapping (ковариантны)
# - Запись → MutableSequence/MutableMapping (инвариантны)
# - Возврат → Sequence (ковариантна)
```

### Annotated + TypeAdapter — валидация без модели

```python
from typing import Annotated
from annotated_types import Ge, Le, MinLen, Predicate
from pydantic import TypeAdapter, ValidationError

Port = Annotated[int, Ge(1), Le(65535)]
NonEmptyStr = Annotated[str, MinLen(1)]
ImageRef = Annotated[str, Predicate(lambda s: ":" in s)]

PortAdapter = TypeAdapter(Port)
PortAdapter.validate_python(8080)   # ✅ 8080
try:
    PortAdapter.validate_python(99999)  # ❌ ValidationError
except ValidationError as e:
    print(e)

# В FastAPI/kopf это даёт автоматическую валидацию query-параметров:
# @app.get("/deploy")
# def scale(replicas: Annotated[int, Ge(1), Le(50)]): ...
```

### ParamSpec + Concatenate — типизированные декораторы

```python
from typing import ParamSpec, TypeVar, Callable, Concatenate
import functools

P = ParamSpec("P")
R = TypeVar("R")

def with_retry(func: Callable[P, R]) -> Callable[P, R]:
    @functools.wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        for attempt in range(3):
            try:
                return func(*args, **kwargs)
            except Exception:
                if attempt == 2: raise
        raise RuntimeError
    return wrapper

@with_retry
def fetch(url: str, timeout: int = 5) -> str:
    return f"data from {url}"

# mypy знает: fetch(url: str, timeout: int = 5) -> str — сигнатура сохранена!
reveal_type(fetch)  # def (url: str, timeout: int = 5) -> str
```

### Dataclass vs pydantic vs attrs — когда что

```python
from dataclasses import dataclass
from pydantic import BaseModel

# Нужно быстро, внутри — dataclass:
@dataclass(slots=True)
class Pod:
    name: str
    ready: bool

# Граница системы, JSON/YAML — pydantic:
class PodModel(BaseModel):
    name: str
    ready: bool

# Смешанный кейс — dataclass с валидацией через __post_init__:
@dataclass
class ValidatedPod:
    name: str
    ready: bool
    def __post_init__(self):
        if not self.name:
            raise ValueError("name empty")
```

---

## 🧪 Лаборатория: типизируй деплой-скрипт и настрой quality gate

**Шаг 1 — скрипт без типов:**

```python
# deploy_untyped.py — типизируйте!
def deploy(image, replicas=3, env="prod"):
    if env not in ("dev", "stage", "prod"):
        raise ValueError
    return {"image": image, "replicas": replicas}

deploy("api:latest", replicas="3")  # баг — str вместо int, но без типов не поймать
```

**Шаг 2 — типизированная версия:**

```python
# deploy_typed.py
from typing import Literal, TypedDict, Final, Never
from pydantic import BaseModel, Field, field_validator

Env = Literal["dev", "stage", "prod"]
DEFAULT_REPLICAS: Final = 3

class DeployResult(TypedDict):
    image: str
    replicas: int

def deploy(image: str, replicas: int = DEFAULT_REPLICAS, env: Env = "prod") -> DeployResult:
    return {"image": image, "replicas": replicas}

# Граница — pydantic:
class DeployRequest(BaseModel):
    image: str = Field(pattern=r"^[\w./-]+:[\w.-]+$")
    replicas: int = Field(ge=1, le=50, default=3)
    env: Env = "prod"

    @field_validator("image")
    @classmethod
    def no_latest(cls, v: str) -> str:
        if v.endswith(":latest"):
            raise ValueError("latest запрещён")
        return v

def deploy_validated(raw: dict[str, object]) -> DeployResult:
    req = DeployRequest.model_validate(raw)
    return deploy(req.image, req.replicas, req.env)

def fatal(msg: str) -> Never:
    raise SystemExit(msg)
```

**Шаг 3 — mypy должен поймать баг:**

```bash
mypy --strict deploy_typed.py
# deploy_typed.py:xx: error: Argument "replicas" has incompatible type "str"; expected "int"  [arg-type]

# deploy("api:latest", replicas="3")  — теперь ошибка до запуска!
```

**Шаг 4 — ruff:**

```bash
ruff check deploy_typed.py  # должен быть чист
ruff format --check deploy_typed.py
```

**Проверь себя:** `mypy --strict` зелёный на `deploy_typed.py`, красный на `deploy_untyped.py` с `replicas="3"`; `ruff check` без `S602`/`B006`.

---

*Что дальше:* [06. CLI-приложения](06-python-cli-apps.md) · [03. Pytest](03-python-testing-pytest.md)
