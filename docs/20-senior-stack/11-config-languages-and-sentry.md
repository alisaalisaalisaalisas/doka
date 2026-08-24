# 🧩 20.11 Конфиг-языки (Jsonnet/CUE) и Sentry

> Уровень: Middle→Senior. Когда Helm-шаблоны превращаются в спагетти — Jsonnet/CUE; когда пользователи жалуются на 500-е раньше мониторинга — Sentry.

**Оглавление:** [Jsonnet](#jsonnet-данные-как-код) · [CUE](#cue-типы-как-ограничения) · [Sentry](#sentry-error-tracking-изнутри) · [2.5 Проверь себя](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

## Jsonnet: данные как код

### Теория

Jsonnet — язык генерации **JSON/YAML** с функциями, переменными и наследованием. Никакой логики в рантайме — чистая функция «параметры → манифесты». Инструменты: `jsonnet` CLI, **tanka** (K8s-деплой), **kubecfg**, Grafana-дашборды как код (grafonnet).

**Ключевая семантика:**
- `+` — merge объектов (глубокий!); `+:` — merge с сохранением наследования (`super`-friendly); `self`, `super`, `$` (корень).
- Всё — выражения; ленивые вычисления; ошибки — `error "msg"`.
- Функции — тоже поля объектов (библиотеки: `local lib = import "lib.libsonnet"`).

### Синтаксис

```jsonnet
// environments/prod.libsonnet
local base = import "../base.libsonnet";

base {
  name: "api",
  replicas: 5,
  image: "registry.corp/api:2.7.1",
  resources: { requests: { cpu: "500m", memory: "512Mi" } },
  env: base.env { LOG_LEVEL: "warn" },     // +: сохранил бы все поля base.env
}
```

```jsonnet
// base.libsonnet
{
  local container = {
    name: $.name,
    image: $.image,
    resources: $.resources,
    ports: [{ containerPort: 8080 }],
  },
  name: error "name required",
  replicas: 2,
  env: { LOG_LEVEL: "info" },
  deployment: {
    apiVersion: "apps/v1", kind: "Deployment",
    metadata: { name: $.name },
    spec: {
      replicas: $.replicas,
      selector: { matchLabels: { app: $.name } },
      template: {
        metadata: { labels: { app: $.name } },
        spec: { containers: [container] },
      },
    },
  },
}
```

```bash
jsonnet -S environments/prod.libsonnet | kubectl apply -f -   # -S = multiple docs
jsonnet -e 'local o = {a: 1}; o + {b: o.a + 1}'               # REPL-эксперименты
tk apply environments/prod                                     # tanka: preview+apply
```

**Частые ошибки:** `+` вместо `+:` при переопределении вложенных объектов (потеря полей base); `error` без валидации входа → непонятные стеки; циклический `self`-reference.

---

## CUE: типы как ограничения

### Теория

CUE объединяет схему и данные: значение одновременно **описывает и проверяет**. `cue vet` — валидатор без генерации; `cue export` — генерация. Унификация (`&`) — пересечение схем; обязательность — `!`.

### Синтаксис

```cue
// schema.cue — «типы»
#Deployment: {
  apiVersion: "apps/v1"
  kind:       "Deployment"
  metadata: name: !string
  spec: replicas: int & >0 | *3        // int >0, default 3
  spec: template: spec: containers: [...#Container]
}
#Container: {
  name:  !string
  image: =~"registry\\.corp/.*"        // regex-ограничение на registry!
  ports: [...{containerPort: int & >0}]
}

// prod.cue — данные, унифицируются со схемой
deployment: #Deployment & {
  metadata: name: "api"
  spec: template: spec: containers: [{ name: "api", image: "registry.corp/api:2.7.1" }]
}
```

```bash
cue vet schema.cue prod.cue                    # валидация: image вне registry.corp → ошибка
cue export schema.cue prod.cue --out yaml      # генерация YAML
cue def schema.cue -o schema.json              # экспорт схемы как JSON Schema (для IDE/CI)
```

**Jsonnet vs CUE:** Jsonnet — «генерация с функциями» (гибче в вычислениях); CUE — «схема+данные» (сильнее в валидации, политику можно выразить типами). Оба убирают главный болячку Helm — логику в строках-шаблонах.

---

## Sentry: error tracking изнутри

### Теория

Sentry агрегирует **исключения** из приложений: группировка по stacktrace (fingerprint), дедупликация, release-трекинг («эта ошибка появилась в v2.7.1»), breadcrumbs (что было до падения), алерты.

**Ключевые понятия:**
- **DSN** — адрес отправки событий (SDK).
- **Release** — версия приложения; `SENTRY_RELEASE` должен совпадать с тегом образа — иначе «в каком релизе баг» не работает.
- **Fingerprint** — ключ группировки; дефолт — стек, кастомный — для группировки по бизнес-логике.
- **Source maps** — для JS/TS без них стектрейсы нечитаемы (загружаются в Sentry на этапе CI).

**SDK (минимум):**

```python
import sentry_sdk
sentry_sdk.init(
    dsn=os.environ["SENTRY_DSN"],
    release=os.environ.get("APP_VERSION"),      # = тег образа!
    environment=os.environ.get("ENV", "dev"),
    traces_sample_rate=0.1,                     # performance (traces)
    before_send=scrub_secrets,                  # НЕ отправлять пароли/токены
)
```

**Частые ошибки:** DSN и release захардкожены; один environment на dev+prod; PII/секреты улетают в события (нужен scrubbing); sourcemaps не загружены → «Cannot read property of undefined at bundle.js:1:12345»; алерты Sentry не связаны с on-call (дублируют Prometheus).

---

## 2.5 Проверь себя — 5 вопросов

**В1. Найдите ошибку в Jsonnet: `base { env: { LOG_LEVEL: "warn", RETRIES: 3 } }` — а в base.env было 5 полей. Что произошло?**

<details><summary>Ответ</summary>
Оператор + заменил поле env целиком — остались только 2 новых поля, 5 базовых потеряны. Нужно base { env+: { LOG_LEVEL: "warn", RETRIES: 3 } } — глубокий merge с сохранением.
</details>

**В2. Чем CUE-подход «типы как ограничения» лучше ручных if-валидаций в Helm-шаблонах (`{{- if not (hasPrefix ...) }}fail{{ end }}`)?**

<details><summary>Ответ</summary>
Валидация декларативна, проверяется отдельно от генерации (cue vet на CI без рендера), даёт понятные ошибки со схемой, переиспользуется для IDE/документации. В Helm валидация размазана по шаблонам и срабатывает только при рендере с конкретными values.
</details>

**В3. Сценарий: Sentry показывает всплеск ошибок, но тег release у всех «undefined». Что сломано в конфигурации?**

<details><summary>Ответ</summary>
SDK не получает release: переменная APP_VERSION не проброшена в под/процесс. Release надо передавать из CI (тег образа) через env деплоймента — тогда работает «ошибка появилась в v2.7.1» и resolve-in-release.
</details>

**В4. Почему для JS-фронтенда sourcemaps критичны, и где они должны загружаться?**

<details><summary>Ответ</summary>
Прод-бандл минифицирован: без sourcemaps стектрейс указывает в bundle.js:1:12345 — нечитаемо. Sourcemaps загружаются в Sentry на этапе CI (не раздаются публично!), тогда Sentry мапит стектрейс в исходный TS/JS.
</details>

**В5. Команда получает алерты и из Sentry, и из Prometheus об одном инциденте. Как правильно разделить их зоны?**

<details><summary>Ответ</summary>
Prometheus — симптомы и SLO (latency, error-rate, доступность) — дежурному. Sentry — новые/всплески исключений конкретного релиза — команде разработки (в рабочий канал, не pager). Sentry не должен дублировать on-call по тем же порогам.
</details>

---

## 2.6 Практика — 3 задания

### Задание 1: Jsonnet — окружения без копипасты

**Условие (стартовое состояние):** файлы `base.libsonnet` и `environments/{dev,prod}.libsonnet` из раздела 2.2. Сделать так, чтобы prod отличался только replicas/image/env, а dev — всем дефолтом.

```bash
# Установка
go install github.com/google/go-jsonnet/cmd/jsonnet@latest   # или brew/apt

# Шаг 1: рендер dev
jsonnet -S environments/dev.libsonnet
# Ожидание: Deployment api, replicas=2, image из base, env LOG_LEVEL=info

# Шаг 2: рендер prod
jsonnet -S environments/prod.libsonnet | yq -P - | head -20
# Ожидание: replicas=5, LOG_LEVEL=warn, image 2.7.1

# Шаг 3: проверка merge-семантики — добавьте в prod:
#   env+: { EXTRA: "x" }  → в выводе все базовые env-поля + EXTRA ✅
#   затем замените на env: { EXTRA: "x" } → базовые поля ИСЧЕЗЛИ (ловушка +)
```

**Проверь себя:** `jsonnet -S environments/prod.libsonnet | yq -P 'select(.kind == "Deployment").spec.replicas'` → 5; после эксперимента Шага 3 вы своими глазами видели разницу `+` vs `+:`.

**Разбор:** главный источник багов в Jsonnet — потеря полей при `+`. Правило: для вложенных объектов всегда `+:`, если не хотите полной замены.

### Задание 2: CUE — валидация манифестов в CI

**Условие:** схема `#Container` с ограничением registry; сломанный манифест должен валить CI.

```bash
# Шаг 0: старт
mkdir cue-lab && cd cue-lab
go install cuelang.org/go/cmd/cue@latest

# Шаг 1: файлы schema.cue и prod.cue из раздела 2.2

# Шаг 2: валидация хорошего
cue vet schema.cue prod.cue && echo "OK"
# Ожидание: OK

# Шаг 3: ломаем — в prod.cue image: "docker.io/library/nginx:1.27"
cue vet schema.cue prod.cue
# Ожидание: prod.deployment.spec.template.spec.containers.0.image:
#   does not match =~"registry\\.corp/.*"  ❌ → exit 1 → CI красный
```

**Проверь себя:** `echo $?` после vet сломанного файла = 1; `cue export schema.cue prod.cue --out yaml` на валидном — рендерит YAML.

**Разбор:** валидация отделена от генерации: vet можно гонять на любом этапе (pre-commit, CI), ошибки читаемее, чем в шаблонах. Схема — единственный источник правил, переиспользуется для документации (`cue def -o json`).

### Задание 3: Sentry — release-трекинг end-to-end

**Условие:** Python-приложение в Docker; ошибки должны группироваться по релизу = тег образа; проверка скраббинга секретов.

```bash
# Шаг 1: приложение (стартовое состояние)
mkdir sentry-lab && cd sentry-lab
cat > app.py <<'EOF'
import os, sentry_sdk
sentry_sdk.init(
    dsn=os.environ["SENTRY_DSN"],
    release=os.environ.get("APP_VERSION", "unknown"),
    environment=os.environ.get("ENV", "dev"),
    before_send=lambda e, h: e if "password" not in str(e) else None,  # скраб
)
def divide(a, b): return a / b
divide(1, 0)     # ZeroDivisionError → в Sentry
EOF
pip install sentry-sdk

# Шаг 2: запуск с релизом = тег образа (как в CI)
export SENTRY_DSN=https://xxx@sentry.io/1 APP_VERSION=2.7.1 ENV=staging
python app.py 2>/dev/null; echo "exit=$?"   # exit=1, событие ушло

# Шаг 3: проверка в UI Sentry (sentry.io или self-hosted):
#   Issues → ZeroDivisionError, тег release=2.7.1, environment=staging ✅
# Шаг 4: тот же DSN, но APP_VERSION=2.7.2 → новая группа «first seen in 2.7.2»
```

**Проверь себя:** в UI у ишью указан release и environment; событие со словом `password` в сообщении НЕ попало (before_send отфильтровал).

**Разбор:** release из CI — ключ к «в каком релизе сломалось» и функции resolve in release. Скраббинг через `before_send` — минимум гигиены PII; в серьёзных проектах — denylist полей + server-side scrubbing.

---

*Далее: [Сводный блок Части 2 — 40 вопросов и 10 задач](00-senior-stack-summary-p2.md)*
