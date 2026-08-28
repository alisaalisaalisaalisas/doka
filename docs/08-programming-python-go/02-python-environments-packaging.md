# 🐍 02. Python: Окружения, Зависимости и Упаковка

> Уровень: production. Цель: воспроизводимые сборки, быстрые установки, безопасный supply chain, минимальные образы. Изолировать → зафиксировать → собрать → доставить.

## 🧱 Проблема окружений и её решения

```mermaid
flowchart LR
    A["Системный python<br/>/usr/bin/python3"] --> B["venv / virtualenv<br/>изоляция пакетов"]
    B --> C["pyproject.toml + lockfile<br/>воспроизводимость"]
    C --> D["Docker / uv sync<br/>идентичность локально и в CI"]
```

| Инструмент | Скорость | Lockfile | Статус | Когда выбирать |
|---|---|---|---|---|
| **pip + venv** | базовая | ❌ (requirements.txt вручную) | встроен везде | скрипты, обучение, минимальный CI |
| **Poetry** | средняя | ✅ poetry.lock | зрелый, удобный CLI | монорепозитории с Poetry-историей |
| **Pipenv** | медленная | ✅ | теряет популярность | избегать в новом коде |
| **uv** ⚡ | в 10–100× быстрее pip | ✅ uv.lock | новый стандарт (Rust) | **дефолт для новых проектов** |
| **conda/mamba** | средняя | ✅ env.yml | ML/science, не-Python зависимости | CUDA, GDAL, системные либы |
| **pip-tools** | базовая | ✅ requirements.lock (хэши) | лёгкий, без нового CLI | когда нельзя мигрировать на uv |

```bash
# --- uv: современный минимум ---
uv init mytool && cd mytool
uv add httpx typer                 # добавить зависимости
uv run pytest                      # запуск в окружении проекта (авто-sync)
uv lock --upgrade                  # обновить lockfile
uv python install 3.12             # даже сам интерпретатор ставит uv

# --- классика, которую встретите на каждом шагу ---
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pip freeze > requirements.txt      # ⚠️ это lockfile только для приложения, не библиотеки
```

!!! tip "Разделение requirements"
    Библиотека объявляет *минимальные* требования (loose pins); приложение фиксирует *точные* версии (lock). Перепутать = получить невоспроизводимые сборки или нерешаемые конфликты.

### Что такое изоляция на самом деле

**Что:** `venv` — копия (symlink) интерпретатора + изолированный `site-packages` + `pyvenv.cfg`. Переменная `VIRTUAL_ENV` и модификация `PATH`/`sys.prefix` заставляют `pip`/`python` видеть только окружение.

**Internals:**

```bash
python -m venv .venv
cat .venv/pyvenv.cfg
# home = /usr/bin
# include-system-site-packages = false
# version = 3.12.1

ls -R .venv
# bin/python -> /usr/bin/python3.12 (symlink)
# bin/activate (shell-функция, меняет PATH и PS1)
# lib/python3.12/site-packages/  — сюда ставит pip внутри venv

# Проверка изоляции:
.venv/bin/python -c "import sys; print(sys.prefix, sys.base_prefix)"
# /.../.venv /usr  — разные => внутри venv

# Без активации — можно вызывать напрямую:
.venv/bin/python -m pip list
.venv/bin/python -m pytest
```

**Failure — системный pip:**

```bash
# ❌ Установка в системный python ломает apt/dnf зависимости:
sudo pip install requests  # никогда!

# ✅ pipx для глобальных инструментов (black, ruff, ansible):
pipx install ruff
# или uv tool install ruff
```

**Performance:** `uv venv` создаёт окружение в ~10ms против ~800ms у `python -m venv` (на Rust, без копирования лишнего).

### PEP 582 vs venv — почему не «просто папка»

Альтернатива `__pypackages__` (PEP 582, `pdm`) кладёт пакеты в `./__pypackages__/lib` и патчит `sys.path` при старте. Плюс — не нужна активация, минус — нестандарт, ломает инструменты ожидающие `sys.prefix`. В проде придерживайтесь `venv`/`uv`.

---

## 📦 pyproject.toml: единый стандарт

`setup.py` устарел; всё описывается декларативно:

```toml
[project]
name = "devops-toolkit"
version = "1.4.0"
description = "CLI для деплоев и наблюдения"
readme = "README.md"
requires-python = ">=3.11"
license = {text = "MIT"}
authors = [{name="Platform Team", email="platform@example.com"}]
dependencies = [
    "httpx>=0.27,<0.29",
    "typer[all]>=0.12",
    "kubernetes~=30.0",
    "pydantic>=2.5",
]
[project.optional-dependencies]
dev = ["pytest", "mypy", "ruff", "respx"]     # extras: pip install '.[dev]'
test = ["pytest-cov", "moto[s3]"]
[project.scripts]
dtk = "devops_toolkit.cli:app"       # консольная команда после pip install
[project.urls]
Repository = "https://github.com/org/devops-toolkit"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/devops_toolkit"]

[tool.ruff]                          # конфиги инструментов живут тут же
line-length = 100
target-version = "py312"
[tool.pytest.ini_options]
addopts = "-q --cov=devops_toolkit --cov-report=term-missing"
testpaths = ["tests"]

[tool.mypy]
python_version = "3.12"
warn_unused_ignores = true

[tool.coverage.run]
branch = true
omit = ["*/tests/*"]
```

```bash
pipx install build && python -m build       # собрать wheel + sdist в dist/
twine upload dist/*                          # публикация в PyPI (или приватный Nexus)
pip install dist/devops_toolkit-1.4.0-py3-none-any.whl   # установка из wheel
# или uv:
uv build && uv publish
```

**Wheel vs sdist — глубоко:**

| Аспект | wheel (`.whl`) | sdist (`.tar.gz`) |
|---|---|---|
| Что внутри | уже собранные файлы + `dist-info` | исходники + `pyproject.toml` |
| Нужен компилятор | нет | да (если есть расширения) |
| Скорость установки | миллисекунды | секунды (сборка) |
| Безопасность | не исполняет код при установке | `setup.py` мог исполнять код |
| Когда публиковать | всегда (для pure-Python `py3-none-any`) | дополнительно для архива/аудита |

```bash
# Проверить содержимое wheel без установки:
unzip -l dist/devops_toolkit-1.4.0-py3-none-any.whl | head
# devops_toolkit/__init__.py
# devops_toolkit/cli.py
# devops_toolkit-1.4.0.dist-info/METADATA

# Проверить метаданные:
pip index versions devops-toolkit  # что в PyPI
```

**Failure — setup.py в 2026:** `python setup.py install` игнорирует `pyproject.toml`, не ставит `build-system` зависимости, ломает изоляцию. Всегда `pip install .` или `python -m build`.

### src-layout vs flat-layout

```text
# ✅ src-layout (рекомендован):
devops-toolkit/
├── src/devops_toolkit/
│   └── __init__.py
└── tests/

# ❌ flat-layout:
devops-toolkit/
├── devops_toolkit/
│   └── __init__.py
└── tests/
```

`src-layout` не даёт тестам случайно импортировать из `./devops_toolkit` вместо установленного пакета — ловит ошибки упаковки до CI. `flat-layout` позволяет `import devops_toolkit` без установки, маскируя отсутствующий `pyproject.toml`.

---

## 🧬 Управление версиями зависимостей

```text
~=30.0    → >=30.0, <31        «совместимая» версия (PEP 440)
>=0.27,<0.29                   диапазон для библиотек
==1.4.2                        точный пин (приложения)
!=2.0.*                        исключение битой версии
>2, <3                        открытый диапазон (опасен)
```

**PEP 440 — полный гид спецов:**

```text
1.4.2           релиз
1.4.2a1         альфа
1.4.2b1         бета
1.4.2rc1        релиз-кандидат
1.4.2.post1     пост-релиз (фикс упаковки)
1.4.2.dev1      dev-сборка
1.4.2+local     локальный идентификатор (не публикуется в PyPI)
```

```python
# Проверка версии в коде:
from importlib.metadata import version, PackageNotFoundError
try:
    print(version("httpx"))  # 0.27.2
except PackageNotFoundError:
    print("httpx не установлен")

# Сравнение версий программно:
from packaging.version import Version
assert Version("1.10") > Version("1.9")  # строковое сравнение сломалось бы!
```

**Стратегии пининга:**

| Контекст | Стратегия | Пример |
|---|---|---|
| Библиотека | loose `>=` + `<` мажора | `httpx>=0.27,<0.29` |
| Приложение (deploy) | точный lockfile | `httpx==0.27.2` в `uv.lock` |
| Критичный CVE | `!=` исключение | `urllib3!=2.2.0` |
| Совместимый апгрейд | `~=` | `kubernetes~=30.0` → `<31` |

Конфликт зависимостей — диагностика и выход:

```bash
pip install --dry-run package          # проверить разрешимость без установки
pipdeptree -p kubernetes               # дерево зависимостей пакета
uv pip compile requirements.in -o requirements.lock --generate-hashes   # хэшированный lock (supply chain)
uv pip check                           # проверить конфликты в текущем окружении

# Разрешение конфликта:
# 1. pipdeptree показывает кто тянет старую версию
# 2. pip install --dry-run "package>=new" — проверить совместимость
# 3. Обновить верхний уровень, не пинить транзитивные вручную
```

Приватные индексы (Nexus/Artifactory):

```bash
pip install --index-url https://nexus.local/repository/pypi/simple/ \
            --extra-index-url https://pypi.org/simple my-private-lib
# PIP_INDEX_URL / UV_INDEX_URL в переменных CI
# Аутентификация:
# PIP_INDEX_URL=https://user:token@nexus.local/...  (в CI secrets)
# или keyring / netrc
```

```toml
# uv — приватные индексы декларативно:
[[tool.uv.index]]
name = "nexus"
url = "https://nexus.local/repository/pypi/simple/"
explicit = true  # только для указанных пакетов

[[tool.uv.source]]
# альтернативный синтаксис для git-зависимостей:
```

**Supply chain — хэшированный lock:**

```bash
# requirements.in:
# httpx>=0.27
# typer>=0.12

uv pip compile requirements.in -o requirements.lock --generate-hashes
cat requirements.lock
# httpx==0.27.2 \
#     --hash=sha256:abcd... \
#     --hash=sha256:efgh...

# Установка с проверкой хэшей — защита от подмены артефакта:
pip install --require-hashes -r requirements.lock
```

**Failure — без хэшей:** атака typosquatting / компрометация PyPI — pip молча поставит подменённый пакет. Хэшированный lock + `--require-hashes` в CI — must have для продовых образов.

---

## 🏗️ Структура production-проекта

```text
devops-toolkit/
├── pyproject.toml           # метаданные, зависимости, конфиги инструментов
├── uv.lock                  # lockfile — коммитить!
├── README.md
├── src/
│   └── devops_toolkit/
│       ├── __init__.py
│       ├── cli.py
│       ├── core/
│       │   ├── __init__.py
│       │   ├── k8s.py
│       │   └── config.py    # pydantic-модели
│       └── __main__.py      # python -m devops_toolkit
├── tests/
│   ├── test_cli.py
│   └── test_k8s.py
├── .pre-commit-config.yaml
├── .python-version          # для pyenv/uv (3.12)
└── Dockerfile               # multi-stage: builder → runtime
```

```dockerfile
FROM python:3.12-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY src/ ./src/
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
CMD ["python", "-m", "devops_toolkit"]
```

Ключевые детали: `--frozen` (не обновлять lock), `--no-install-project` в билдере (кэш слоёв зависимостей), `PYTHONUNBUFFERED` (логи сразу в stdout), `PYTHONDONTWRITEBYTECODE` (нет записи `.pyc` на read-only FS).

### Docker — глубоко: кэш слоёв и безопасность

```dockerfile
# Оптимизированный Dockerfile с кэшем и non-root:
FROM python:3.12-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app
# Сначала только манифесты — слой кэшируется пока зависимости не менялись:
COPY pyproject.toml uv.lock README.md ./
RUN uv sync --frozen --no-dev --no-install-project
# Затем код — меняется чаще, но зависимости уже закэшированы:
COPY src/ ./src/
RUN uv sync --frozen --no-dev

FROM python:3.12-slim AS runtime
RUN useradd -m app && apt-get update && apt-get install -y --no-install-recommends tini && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app/src ./src
USER app
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 PIP_NO_CACHE_DIR=1
ENTRYPOINT ["tini", "--"]
CMD ["python", "-m", "devops_toolkit"]

# Почему tini: правильно ретранслирует SIGTERM, иначе PID 1 не ловит сигналы
```

**Таблица — что где хранить:**

| Файл | Коммитить | Содержит | Где используется |
|---|---|---|---|
| `pyproject.toml` | ✅ | loose-диапазоны | разработка, публикация |
| `uv.lock` / `poetry.lock` | ✅ (приложение) | точные версии + хэши | CI, Docker, прод |
| `requirements.lock` (pip-tools) | ✅ | точные версии + хэши | CI если без uv |
| `.venv/` | ❌ | установленные пакеты | локально, в Docker-слое |
| `dist/` | ❌ | собранные артефакты | CI-артефакт |

---

## 🔐 Supply chain и приватные реестры

```bash
# pip.conf / .pypirc для публикации:
# ~/.pypirc
[distutils]
index-servers = nexus

[nexus]
repository = https://nexus.local/repository/pypi-hosted/
username = __token__
password = pypi-...

# Проверка уязвимостей зависимостей:
pip-audit --require-hashes -r requirements.lock
# или
uv pip audit  # (если доступно)

# Лицензии:
pip-licenses --format=json | jq '.[] | select(.License | contains("GPL"))'
```

**Failure — утечка токена:** `pip install` логирует URL с токеном при `—verbose`. Используйте `keyring` или `UV_INDEX_URL` из секретов CI, не из `pyproject.toml`.

---

## 🧪 Воспроизводимость: lock vs freeze

```bash
# ❌ pip freeze — снимает ВСЁ окружение (включая транзитивные и системные):
pip freeze > requirements.txt
# httpx==0.27.2
# anyio==4.4.0   ← транзитивная, не объявляли, но зафиксировали
# sniffio==1.3.1 ← тоже транзитивная

# ✅ pip-tools / uv — компилирует из верхнего уровня:
echo "httpx>=0.27,<0.29" > requirements.in
uv pip compile requirements.in -o requirements.lock --generate-hashes
# В lock — только разрешённые версии с хэшами, из .in — только прямые зависимости

# Проверка дрейфа:
uv lock --check  # упадёт если pyproject.toml и uv.lock рассинхронизированы
```

**CI-проверка:**

```yaml
# .gitlab-ci.yml
check-lock:
  script:
    - uv lock --check  # не дать смержить MR с ручным правкой без обновления lock
```

---

## ⚡ uv — детальный разбор

```bash
# Установка:
curl -LsSf https://astral.sh/uv/install.sh | sh
# или pipx install uv

# Управление Python:
uv python list
uv python install 3.12 3.11
uv python pin 3.12  # записывает .python-version

# Проект:
uv init --app mytool --python 3.12
uv add "httpx>=0.27" "typer[all]>=0.12"
uv add --dev pytest ruff mypy
uv remove httpx
uv sync --frozen          # установка из lock
uv sync --extra dev       # с extras
uv run python -m devops_toolkit  # запуск без активации venv

# Скорость — сравнение на реальном проекте (httpx + k8s + pydantic):
# pip install: ~45s
# uv sync:     ~0.8s
```

**Когда НЕ uv:** если корпоративный Nexus требует `pip --trusted-host` с кастомными CA — проверьте поддержку в `uv` (есть `UV_NATIVE_TLS`). Для `conda`-зависимостей (CUDA) — `uv` не заменяет `mamba`.

---

## 🧰 pre-commit — quality gate до коммита

```yaml
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
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

# Установка:
# pip install pre-commit && pre-commit install
# pre-commit run --all-files  # прогнать на всём репо
```

---

## 🔬 Глубокий разбор: резолюция зависимостей и производительность

### Как pip резолвит граф (и почему медленно)

**Что:** pip использует backtracking-резолвер (с 20.3). Для каждого пакета перебирает версии пока не найдёт совместимый набор. Сложность экспоненциальная от числа конфликтов.

```python
# Пример конфликта:
# pyproject.toml: httpx>=0.27,<0.29 → требует httpcore>=1.0
# pyproject.toml: httpx требует anyio>=4
# kubernetes 30.0 → требует urllib3<2.1
# httpx 0.27 → требует urllib3>=2  → конфликт!

# pipdeptree — визуализация:
# httpx==0.27.2
#   ├── anyio [required: >=4.0]
#   ├── httpcore [required: >=1.0]
#   └── idna [required: >=2.8]
# kubernetes==30.1.0
#   └── urllib3 [required: >=1.24.2,<2.1.0]
```

**Почему uv в 10-100× быстрее:**

| Оптимизация | pip | uv |
|---|---|---|
| Язык | Python | Rust |
| Параллельность | последовательно | параллельно (загрузка метаданных) |
| Кэш | http-кэш pip | глобальный кэш + lazy |
| Резолвер | backtracking Python | PubGrub (Dart) на Rust |

```bash
# Бенчмарк на том же pyproject (httpx + kubernetes + pydantic + typer):
# pip install --dry-run: 12.3s
# uv pip compile:       0.4s

# PubGrub — объясняет ПОЧЕМУ конфликт, а не просто «could not find version»:
# uv pip compile:
#   × No solution found when resolving dependencies:
#   ╰─▶ Because kubernetes==30.1.0 depends on urllib3<2.1.0 and httpx==0.27.2 depends on urllib3>=2, we can conclude that kubernetes==30.1.0 and httpx==0.27.2 are incompatible.
```

### Бинарные кэши и зеркала

```bash
# pip кэш:
pip cache dir                    # ~/.cache/pip
pip cache purge
pip install --no-cache-dir pkg   # без кэша (CI с эфемерными раннерами — кэш бесполезен)

# uv кэш — глобальный, дедуплицированный:
uv cache dir                     # ~/.cache/uv
uv cache clean

# Зеркала в корпоративной сети — ускорение + изоляция от PyPI:
# pip.conf:
# [global]
# index-url = https://nexus.local/repository/pypi/simple/
# trusted-host = nexus.local

# uv — через env:
# UV_INDEX_URL=https://nexus.local/repository/pypi/simple/
# UV_EXTRA_INDEX_URL=https://pypi.org/simple/
```

### Проверка размера и CVE образа

```bash
# Размер слоёв:
docker history devops-toolkit:latest
# IMAGE          CREATED        SIZE
# builder        2 min ago      450MB  (с тулчейном)
# runtime        1 min ago      120MB  (только .venv)

dive devops-toolkit:latest  # интерактивная проверка слоёв

# CVE-сканирование:
trivy image devops-toolkit:latest
grype devops-toolkit:latest
pip-audit --desc  # проверка зависимостей

# Минимизация:
# - python:3.12-slim вместо 3.12 (120MB vs 350MB)
# - python:3.12-alpine — ещё меньше, но musl ломает numpy/pandas (берите slim!)
# - distroless — минимум, но нет shell для дебага
```

### Когда `pip install -e .` ломается

```bash
# -e (editable) — ссылка на src/, изменения сразу видны без переустановки.
# Ловушки:
pip install -e . --no-build-isolation  # ❌ использует системные build-зависимости, игнор pyproject build-system
pip install -e .                       # ✅ изолированная сборка (PEP 517)

# Проверка что editable работает:
pip show -f devops-toolkit | grep Location
# Location: /app/src  → editable (ссылка)
# Location: /app/.venv/lib/.../site-packages → обычный install (копия)

# Если импорты не видны после -e — проверьте:
# 1. packages = ["src/devops_toolkit"] в [tool.hatch.build...]
# 2. pip list | grep devops-toolkit
# 3. python -c "import devops_toolkit; print(devops_toolkit.__file__)"
```

---

## ❓ Десять вопросов для самопроверки

---

## ✅ Проверь себя

> Отвечай вслух до раскрытия ответа. Если «не помню» — вернись к разделу.


**В1. Чем wheel отличается от sdist и что публиковать в CI?**
<details><summary>Ответ</summary>
Wheel — собранный дистрибутив, устанавливается без выполнения кода сборки и без компилятора; sdist — архив исходников, из которого wheel собирается на месте. Для pure-Python публикуйте wheel (универсальный py3-none-any) — установка мгновенная и безопаснее (не исполняет setup.py). В идеале оба.
</details>

**В2. Почему `pip freeze > requirements.txt` — плохой lockfile для библиотеки?**
<details><summary>Ответ</summary>
Он фиксирует ВСЕ транзитивные зависимости текущей машины (включая системные), лишая пользователей возможности разрешения конфликтов. Библиотека должна объявлять loose-диапазоны в pyproject.toml; точные lock'и — дело приложений (poetry.lock/uv.lock). Плюс freeze не даёт хэшей для supply chain.
</details>

**В3. Что делает `uv sync --frozen` и почему это важно в Docker?**
<details><summary>Ответ</summary>
Устанавливает окружение строго по uv.lock без его обновления. Без --frozen любая новая версия зависимости могла бы попасть в сборку между коммитом и билдом — воспроизводимость ломается. В Dockerfile --frozen гарантирует что образ из CI идентичен локальному.
</details>

**В4. Как в одном проекте держать dev-зависимости отдельно от runtime?**
<details><summary>Ответ</summary>
Optional-dependencies/extras: `[project.optional-dependencies] dev = [...]`, установка `pip install -e '.[dev]'` или `uv sync --extra dev`. В продовой сборке ставится только базовый набор (`--no-dev` у uv) — меньше поверхность атаки, размер образа и время установки.
</details>

**В5. Зачем multi-stage Dockerfile с отдельным этапом builder?**
<details><summary>Ответ</summary>
Компиляторы, заголовочные файлы и uv остаются в билдере; в рантайм копируется только готовый `.venv`. Итог: образ меньше в разы (200MB vs 600MB), нет тулчейна = меньше CVE, кэш слоёв зависимостей работает пока lock не изменился. Плюс non-root USER и tini для сигналов.
</details>

**В6. Чем `pip freeze` отличается от `uv pip compile --generate-hashes` с точки зрения supply chain?**
<details><summary>Ответ</summary>
`pip freeze` фиксирует версии без хэшей — pip при установке не проверяет целостность артефакта (подмена на PyPI пройдёт). `uv pip compile --generate-hashes` записывает ` --hash=sha256:...` для каждого пакета; `pip install --require-hashes` сверяет хэш скачанного wheel с lock — атака подменой/typosquatting будет отвергнута.
</details>

**В7. Почему `src-layout` предпочтительнее `flat-layout` и какую ошибку он ловит?**
<details><summary>Ответ</summary>
В flat-layout `import devops_toolkit` работает из корня репо без установки (./devops_toolkit в sys.path). Тесты проходят локально, но падает после `pip install` если `pyproject.toml` не упаковал пакет. src-layout требует установки (`pip install -e .` или `uv sync`) — ошибка упаковки ловится сразу. Плюс изоляция тестов от исходников.
</details>

**В8. Что сломается если в Dockerfile скопировать `src/` ДО `uv sync`?**
<details><summary>Ответ</summary>
Инвалидируется кэш слоя зависимостей: любое изменение кода пересоберёт слой `uv sync` и переустановит все пакеты, хотя зависимости не менялись. Правильно: сначала `COPY pyproject.toml uv.lock` → `RUN uv sync --no-install-project`, затем `COPY src/` → `RUN uv sync`. Экономия минут на каждой сборке.
</details>

**В9. Как диагностировать конфликт `kubernetes 30.0 requires urllib3<2.1` vs `httpx requires urllib3>=2`?**
<details><summary>Ответ</summary>
1) `pipdeptree -p urllib3` — кто тянет конфликтующую версию; 2) `uv pip compile --dry-run` покажет нерешаемый граф; 3) решение — обновить kubernetes до версии с поддержкой urllib3>=2, или пинить совместимый диапазон, или изолировать клиентов в разные сервисы. Никогда не пинить транзитивные вручную без понимания графа.
</details>

**В10. Почему `sudo pip install` — антипаттерн и чем заменить для глобальных инструментов?**
<details><summary>Ответ</summary>
`sudo pip` пишет в системный site-packages, ломая зависимости apt/dnf (система ожидает конкретную версию pip/setuptools) и требует root. Для глобальных CLI используйте `pipx install ruff` или `uv tool install ruff` — каждый инструмент в своём изолированном venv + symlink в ~/.local/bin, без загрязнения системы.
</details>

---

## 🧪 Лаборатория: воспроизводимая сборка с нуля

**Цель:** собрать проект с `uv`, проверить lock, собрать Docker-образ.

```bash
# 1. Инициализация
uv init demo --python 3.12 && cd demo
uv add httpx typer pydantic
uv add --dev pytest ruff

# 2. Проверьте что lock создан и хэши есть:
cat uv.lock | head -20
uv lock --check  # должен пройти

# 3. Симулируйте дрейф — вручную поменяйте версию в pyproject.toml:
# httpx>=0.27,<0.29 → httpx>=0.28,<0.29
uv lock --check  # упадёт — рассинхрон!
uv lock          # пересоберите
uv sync --frozen # установка

# 4. Соберите wheel:
uv build
ls dist/  # .whl + .tar.gz
unzip -l dist/*.whl | head

# 5. Docker — проверьте кэш:
# Измените README.md → docker build должен использовать кэш слоя uv sync
# Измените pyproject.toml → кэш инвалидируется, переустановка
```

**Failure injection:**
- Удалите `uv.lock` и запустите `uv sync --frozen` — получите ошибку «lockfile not found, run uv lock».
- Добавьте `httpx==0.27.2 --hash=sha256:wrong` в lock и `pip install --require-hashes` — установка отвергнет пакет (защита supply chain).

## 🧪 Лаборатория 2: сломайте и почините кэш Docker

```bash
# 1. Соберите образ с правильным порядком:
docker build -t demo:1 .
docker images demo:1 --format "{{.Size}}"  # ~120MB

# 2. Сломайте порядок — скопируйте src до зависимостей:
# Dockerfile.bad:
#   COPY src/ ./src/
#   COPY pyproject.toml uv.lock ./
#   RUN uv sync --frozen
# Добавьте комментарий в src/core/k8s.py → пересборка переустановит ВСЕ пакеты!
# docker build — 45с vs 3с с правильным порядком.

# 3. Проверьте non-root:
docker run --rm demo:1 whoami  # app, не root!
docker run --rm demo:1 pip list  # нет pip в runtime? проверьте PATH

# 4. CVE-сканирование:
trivy image --severity HIGH,CRITICAL demo:1
# Если нашли CVE в python:3.12-slim — обновите base: 3.12.5 → 3.12.7
```

## 📊 Сравнение инструментов — таблица решений

| Критерий | pip + venv | uv | Poetry | conda/mamba |
|---|---|---|---|---|
| Скорость установки | 30-60с | 1-3с | 20-40с | 30-60с |
| Lock с хэшами | руками | авто | авто | env.yml без хэшей |
| Python-менеджмент | pyenv отдельно | `uv python install` | нет | встроен |
| Docker-слой | ручной | `uv sync --frozen` | `poetry install --no-root` | тяжёлый |
| Корпоративный Nexus | `pip.conf` | `UV_INDEX_URL` | `poetry source` | `conda config` |
| Когда выбирать | скрипт 50 строк | **дефолт** | легаси Poetry-репо | ML/GPU |

### FAQ: частые ошибки новичков

| Ошибка | Симптом | Фикс |
|---|---|---|
| Забыли `uv lock` после правки `pyproject.toml` | `uv sync --frozen` ставит старую версию | `uv lock && uv sync` |
| `pip install .` без `src-layout` | `import devops_toolkit` работает без установки | перейти на `src-layout` |
| `PIP_INDEX_URL` с токеном в git | токен утёк в историю | `UV_INDEX_URL` из CI secrets, `.gitignore` для `.pypirc` |
| `python -m venv` в Docker без `--frozen` | образ каждый раз разный | всегда `--frozen` |
| `conda` + `pip` вперемешку | сломанный `site-packages` | один менеджер на окружение |

### Чеклист production-релиза

```bash
# Перед публикацией в Nexus/PyPI:
uv build                    # wheel + sdist в dist/
twine check dist/*          # валидация метаданных
pip install dist/*.whl --no-index --find-links dist/  # тест установки из wheel без сети
python -c "import devops_toolkit; print(devops_toolkit.__version__)"  # smoke

# Версионирование — semver + git tag:
# pyproject.toml version = "1.4.0" → git tag v1.4.0 → CI публикует
# Автоматически: hatch-vcs / setuptools-scm берёт версию из git tag (0.5.0+12.gabc123)

# Хеши для supply chain — публикуйте вместе с релизом:
sha256sum dist/* > dist/SHA256SUMS
gpg --detach-sign dist/*.whl  # подпись (опционально)

# Smoke-тест установленного пакета:
python -m devops_toolkit --help
dtk --version  # консольная команда из [project.scripts]
```

### ENV vs CLI vs файл — каскад конфигурации

```python
# config.py — каскад: defaults < файл < ENV < CLI (победитель — CLI)
import os
from pathlib import Path
import yaml
from pydantic import BaseModel

class Config(BaseModel):
    api_url: str = "https://api.prod.local"
    replicas: int = 3

def load_config(cli_replicas: int | None = None) -> Config:
    cfg = Config()  # defaults
    if Path("config.yaml").exists():
        cfg = Config(**{**cfg.model_dump(), **yaml.safe_load(Path("config.yaml").read_text())})
    if env_val := os.getenv("REPLICAS"):
        cfg.replicas = int(env_val)  # ENV перекрывает файл
    if cli_replicas is not None:
        cfg.replicas = cli_replicas  # CLI перекрывает всё
    return cfg

# Тест каскада:
# config.yaml: replicas: 5
# REPLICAS=10 python app.py          → 10 (ENV победил файл)
# REPLICAS=10 python app.py --replicas 7 → 7 (CLI победил ENV)
```

### Дополнительный чек — audit зависимостей

```bash
pip-audit --strict --require-hashes -r requirements.lock
pip-licenses --with-license-file --format=json | jq
# Запретить GPL в проде:
# pip-licenses | grep -i GPL && echo "FAIL: GPL found" && exit 1
```

---

*Что дальше:* [03. Тестирование pytest](03-python-testing-pytest.md) · [01. Python для DevOps](01-python-for-devops.md)
