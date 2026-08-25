# 🛡️ 05. Python: Типизация, mypy strict и Ruff

## 🎯 Зачем типы DevOps-инструментам

Скрипты живут годами, их правят разные люди в спешке инцидента. Типы = документация + статические тесты до запуска. Ошибка «передал строку вместо int в конфиг деплоя» ловится mypy за секунды, а не падает на проде.

```python
def rollout(ns: str, name: str, replicas: int = 3, dry_run: bool = False) -> bool:
    """Прокатить деплой. Возвращает True, если применился."""
```

## 📝 Современная типизация: что реально используется

```python
from typing import Any, Literal, TypeVar, Protocol
from collections.abc import Callable, Iterable, Sequence   # НЕ typing.List/Dict (устарели)
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

## 🔍 Mypy strict: включаем без боли

```ini
[tool.mypy]
python_version = "3.12"
warn_unused_ignores = true
warn_redundant_casts = true
disallow_untyped_defs = true        # строгий режим
no_implicit_optional = true
check_untyped_defs = true

[[tool.mypy.overrides]]             # библиотеки без типов — точечно прощаем
module = ["kubernetes.*", "yaml.*"]
ignore_missing_imports = true
```

```bash
mypy src tests                       # полный прогон (~секунды на средний проект)
mypy --install-types                 # поставить недостающие type-stubs
mypy --cache-dir=.mypy_cache src     # кэш: повторные прогоны ×10 быстрее
```

Работа с легаси: включите strict на новом пакете (`per-module-options`) и расширяйте покрытие; `# type: ignore[error-code]` — только с кодом ошибки и комментарием-причиной.

## 🧹 Ruff: линтер+форматтер одним инструментом

Ruff заменил flake8+isort+black-конвейер: один бинарник на Rust, сотни правил, автофиксы.

```toml
[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = [
  "E", "F", "W",       # pyflakes/pycodestyle — база
  "I",                 # isort (порядок импортов)
  "B",                 # bugbear: реальные баги (mutable default!)
  "S",                 # bandit: безопасность
  "UP",                # устаревший синтаксис → современный
  "ASYNC",             # блокирующие вызовы в async
]
ignore = ["E501"]      # длину строк держит форматтер

[tool.ruff.format]
quote-style = "double"
```

```bash
ruff check --fix src tests      # линт + автофиксы
ruff format src tests           # форматирование (аналог black)
ruff check --statistics src     # топ проблем легаси-репо
```

Правила, которые чаще всего ловят настоящие баги:

| Правило | Что ловит |
|---|---|
| `B006` | mutable default аргумент (`def f(x=[])`) |
| `B904` | `raise ... from err` внутри except |
| `S105/S106` | хардкод паролей/токенов |
| `ASYNC101` | `time.sleep`/`open` в async-функции |
| `E722` | голый `except:` |
| `RET504` | бессмысленное присваивание перед return |

## 🚦 Полный quality-gate в CI

```yaml
quality:
  stage: test
  image: ghcr.io/astral-sh/uv:python3.12-bookworm-slim
  script:
    - uv sync --frozen
    - uv run ruff format --check .
    - uv run ruff check .
    - uv run mypy src tests
    - uv run pytest -q
  rules: [{ if: '$CI_PIPELINE_SOURCE == "merge_request_event"' }]
```

Локально тот же набор — pre-commit (см. [Git 06](../02-git/06-hooks-automation-pre-commit.md)): правки формата никогда больше не приходят ревьюеру.

## ❓ Пять вопросов для самопроверки

---


## ✅ Проверь себя

> Отвечай вслух до раскрытия ответа. Если «не помню» — вернись к разделу.


**В1. Чем `Literal["dev","prod"]` лучше типа `str` для параметра окружения?**
<details><summary>Ответ</summary>
Mypy проверит допустимость значения во всех местах вызова (опечатка "prodd" — ошибка компиляции), IDE даст автодополнение, а рефакторинг найдёт все точки использования. Строка допускает всё — ошибка всплывёт в рантайме.
</details>

**В2. Когда TypedDict, а когда Pydantic-модель?**
<details><summary>Ответ</summary>
TypedDict — статическое описание словаря для mypy внутри доверенного кода (нулевой runtime-cost). Pydantic — там, где данные приходят извне (API, YAML, env): рантайм-валидация, coercion типов, понятные ошибки. Часто вместе: Pydantic на входе → TypedDict/датаклассы внутри.
</details>

**В3. Как внедрить mypy strict в проект без типов, не утонув?**
<details><summary>Ответ</summary>
Инкрементально: базовый конфиг мягкий, strict включается per-module на новых пакетах; старые модули проходят через overrides с послаблениями и постепенно подтягиваются. Каждый новый файл — уже под strict. Автофиксы ruff убирают механическую часть.
</details>

**В4. Почему `def add_tag(tags=[])` — баг даже если работает?**
<details><summary>Ответ</summary>
Default-значение вычисляется ОДИН РАЗ при определении функции: все вызовы без аргумента получат один и тот же список и будут его мутировать. Правильно `tags: list[str] | None = None` + создание внутри. Это ловит правило B006.
</details>

**В5. Что даёт запуск `ruff format --check` в CI отдельным шагом?**
<details><summary>Ответ</summary>
Проверка без изменения файлов: MR с неотформатированным кодом краснеет, ревью не тратится на «поставь пробел». Единый стиль гарантируется независимо от локальных настроек разработчиков; автофикс — команда `ruff format` локально.
</details>

---

*Что дальше:* [06. CLI-приложения](06-python-cli-apps.md) · [03. Pytest](03-python-testing-pytest.md)
