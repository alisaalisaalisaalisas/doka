# 📦 02. Dockerfile Best Practices и Multi-Stage сборки

## 🎯 Главные правила создания эффективных и безопасных Dockerfile

1. **Многоэтапная сборка (Multi-Stage):** Компиляторы, заголовочные файлы и SDK остаются в сборочном образе (`builder`), а в production идет только бинарник/артефакт.
2. **Порядок инструкций и кэширование:** Размещайте редко изменяемые слои (установка системных пакетов, зависимостей) выше, а часто изменяемый исходный код — в самом конце.
3. **Безопасность (Non-root user):** Никогда не запускайте боевой процесс от `root` (UID 0).
4. **Формат команд:** Всегда используйте JSON-массив (`Exec form`), например `ENTRYPOINT ["./app"]`, чтобы сигналы `SIGTERM` попадали напрямую в процесс, а не в оболочку `/bin/sh`.

---

## 🏗️ Эталонные примеры Multi-Stage Dockerfile

### 1. Production Dockerfile для Go (Размер образа ~15-20 МБ)
```dockerfile
# -------------------------------------------------------------
# Этап 1: Сборка и компиляция бинарного файла
# -------------------------------------------------------------
FROM golang:1.23-alpine AS builder

WORKDIR /src

# Кэшируем загрузку модулей Go
COPY go.mod go.sum ./
RUN go mod download

# Копируем исходный код
COPY . .

# Собираем статический бинарник без CGO
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s" \
    -o /bin/server ./cmd/server

# -------------------------------------------------------------
# Этап 2: Финальный минимальный образ
# -------------------------------------------------------------
FROM gcr.io/distroless/static-debian12:nonroot

WORKDIR /app

# Копируем только скомпилированный бинарник
COPY --from=builder /bin/server /app/server

# Запуск от непривилегированного пользователя nonroot (UID 65532)
USER nonroot:nonroot

EXPOSE 8080

ENTRYPOINT ["/app/server"]
```

---

### 2. Production Dockerfile для Python (FastAPI / Poetry)
```dockerfile
# -------------------------------------------------------------
# Этап 1: Сборка виртуального окружения
# -------------------------------------------------------------
FROM python:3.12-slim AS builder

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on

# Установка системных зависимостей для сборки C-расширений
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Создание изолированного virtualenv
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# -------------------------------------------------------------
# Этап 2: Финальный образ для запуска
# -------------------------------------------------------------
FROM python:3.12-slim AS runner

WORKDIR /app

# Установка рантайм библиотек (без компиляторов)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Создание системного пользователя
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/false -m appuser

# Копирование виртуального окружения из этапа сборщика
COPY --from=builder --chown=appuser:appgroup /opt/venv /opt/venv
COPY --chown=appuser:appgroup . /app

ENV PATH="/opt/venv/bin:$PATH"
USER 10001:10001

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:8000/healthz || exit 1

ENTRYPOINT ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## ⚖️ CMD против ENTRYPOINT

| Инструкция | Назначение | Поведение при `docker run myimage arg1` |
| :--- | :--- | :--- |
| `ENTRYPOINT ["executable"]` | Задает исполняемый бинарник по умолчанию | Запустит `executable arg1` |
| `CMD ["param1", "param2"]` | Аргументы по умолчанию для `ENTRYPOINT` | Переопределяется аргументом `arg1` |

**Рекомендуемый паттерн:**
```dockerfile
ENTRYPOINT ["/app/server"]
CMD ["--config", "/app/config.yaml"]
```
*(При запуске `docker run img` выполнится `/app/server --config /app/config.yaml`, а при `docker run img --help` выполнится `/app/server --help`)*.

---

## 🔬 Deep Dive: BuildKit — кэш монтирования против порядка слоев

Классика: копировать сначала манифест зависимостей, потом код — тогда `npm ci` не перезапускается при каждом изменении исходников.

```dockerfile
# BuildKit cache mount: кэш между сборками вообще без слоев!
RUN --mount=type=cache,target=/root/.cache/go-build \
    go build -o /bin/app ./cmd/server

# SSH-форвардинг для приватных модулей (ключ НЕ попадает в слой!)
RUN --mount=type=ssh git clone git@github.com:org/private.git
```

### Чек-лист размера образа

| Прием | Экономия |
| :--- | :--- |
| `distroless`/`alpine` база | 700MB → 20MB |
| Multi-stage (компиляторы не едут в рантайм) | 300MB+ |
| `apt-get install --no-install-recommends && rm -rf /var/lib/apt/lists/*` | 50-200MB |
| `.dockerignore`: `.git`, `node_modules`, `tests` | минуты сборки |
| Статическая линковка (`CGO_ENABLED=0`) | glibc не нужен |

```bash
# Чем образ отличается от предыдущего слоя?
hadolint Dockerfile
dive nginx:local          # интерактивный разбор слоев и wasted space
```

!!! tip "Non-root по умолчанию"
    `USER 65532:65532` + `readOnlyRootFilesystem` в K8s. Контейнер, работающий от root — CVE-магнит (container escape исторически эксплуатирует именно root-контекст).

---

<!-- enriched:v1 -->

## 🧨 Типовые грабли Production

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| «Работало вчера» после обновления | Дрейф конфигурации вне Git | `git diff` по инфра-репозиторию + `drift detection` |
| Падение под нагрузкой без ошибок в логах | Исчерпание лимитов (`ulimit`, conntrack, fds) | `dmesg -T \| grep -i denied`, `conntrack -S` |
| Медленный деплой | Отсутствие кэша слоев/артефактов | Включить layer cache, артефакт-репозиторий |
| «Плавающие» 502 раз в сутки | Health-check гонки при rolling update | `preStop sleep` + корректный `readinessProbe` |

!!! warning "Правило пяти почему"
    Каждый инцидент заканчивается не фиксом, а **post-mortem** с 5×Why и action items в бэклоге. Иначе грабли возвращаются через квартал — но уже в пятницу вечером.

## 🧪 Hands-on Lab (15 минут)

```bash
# 1. Воспроизведите проблему из таблицы выше на стенде (kind/k3d/VirtualBox)
# 2. Соберите диагностику одной командой:
hadolint Dockerfile; docker build --progress=plain -t app:dev . 2>&1 | tail -30 && \
docker images app:dev --format '{{.Size}}' && dive app:dev --ci
# 3. Зафиксируйте вывод в post-mortem шаблон:
#    Что случилось / Когда заметили / Root cause / Fix / Prevention
```

## ✅ Чек-лист зрелости темы

- [ ] Конфигурации версионируются в Git, ручные правки на проде запрещены

    ??? tip "Как закрыть пункт"
        Все конфиги подсистемы живут в etc-repo/Ansible-роли и деплоятся пайплайном. Проверка зрелости: после пересоздания машины система настраивается из репозитория без ручных шагов; git log отвечает «кто и когда поменял».

- [ ] Есть мониторинг именно этой подсистемы (не только CPU/RAM)

    ??? tip "Как закрыть пункт"
        Специфичные метрики подсистемы экспортируются и имеют алерты (для systemd — failed units; для БД — connections/locks; для сети — retransmits/drops). CPU/RAM видят симптом, не причину — нужны метрики самой подсистемы.

- [ ] Задокументирован runbook на типовые отказы (кто/что/как)

    ??? tip "Как закрыть пункт"
        Шаблон из [13.2]: симптомы → команды диагностики → фикс → критерий успеха → предотвращение. Топ-3 отказа подсистемы покрыты. Прогонен хотя бы раз — дата в шапке.

- [ ] Проведено хотя бы одно учение Chaos/GameDay по теме

    ??? tip "Как закрыть пункт"
        Дрель из tools/chaos-lab.sh или Break-Fix по этой теме запущена на стенде, runbook прогнан по шагам, измерено время до восстановления. Итоги — в постмортем-журнал команды.

- [ ] Лимиты ресурсов и квоты осознаны, а не «дефолт из туториала»

    ??? tip "Как закрыть пункт"
        Каждый лимит имеет обоснование из данных (ulimit/fd по числу соединений, MemoryMax по месяцу наблюдений). Проверка: systemctl show / cgroup значения сопоставлены с фактическим потреблением за месяц, комментарий «почему» рядом со значением в коде.

---

## 🧭 Что дальше

| Шаг | Материал |
| :--- | :--- |
| 🔬 Закрепить | [Lab 02: scan → sign → registry](../16-guided-labs/02-lab-docker-image-factory.md) |
| 💪 Практика | [Эталонный Dockerfile в шаблонах](../18-templates/01-containers-and-k8s.md) |

---

## ✅ Проверь себя

**В1. Почему порядок инструкций Dockerfile критичен для скорости сборки?**
<details><summary>Ответ</summary>
Каждая инструкция — слой; изменение инвалидирует её и ВСЕ последующие. Редко меняющееся (зависимости) — выше отдельными слоями, часто меняющееся (код) — ниже. COPY package.json + install ДО копирования исходников даёт кэш зависимостей.
</details>

**В2. Что даёт multi-stage сборка?**
<details><summary>Ответ</summary>
Билдер (компиляторы, dev-зависимости, кэши) отделён от рантайма: копируются только артефакты (--from=build). Node: 1.2 ГБ → ~180 МБ; Go: → 10–15 МБ scratch/distroless. Меньше CVE, быстрее pull/deploy.
</details>

**В3. Зачем `npm ci` вместо `npm install` в образе?**
<details><summary>Ответ</summary>
ci строго следует lockfile (детерминизм), падает при расхождении package.json↔lock, быстрее (без резолвинга версий). install может тихо обновить зависимости — сборка перестанет воспроизводиться.
</details>

**В4. Что произойдёт без .dockerignore и почему node_modules обязателен в нём?**
<details><summary>Ответ</summary>
Весь каталог уходит в build context (медленный upload, инвалидация COPY). Локальный node_modules перезапишет зависимости, установленные в образе, при COPY . — классический баг «работает у меня». Игнорировать также .git, тесты, секреты.
</details>

**В5. Зачем USER nonroot и как проверить образ?**
<details><summary>Ответ</summary>
Компрометация приложения не должна давать root (escape проще, запись в volume возможна). Проверка: docker run --rm --user 65534:65534 img whoami — если падает на правах записи, выдать точечно chown/chmod нужным путям.
</details>
