# 🔌 03. Docker Compose, Сети, Хранилища и Отладка

## 🌐 Сетевые драйверы Docker

| Драйвер | Область применения | Особенности |
| :--- | :--- | :--- |
| **`bridge`** (Default) | Одиночный хост / Compose | Изолированная приватная сеть хоста. Контейнеры общаются по именам сервисов через встроенный DNS (127.0.0.11). |
| **`host`** | Высокая производительность сети | Контейнер использует сетевой стек хоста напрямую (без NAT, без оверхеда, но без изоляции портов). |
| **`overlay`** | Docker Swarm / Multi-host | Распределенная сеть поверх нескольких физических хостов через VXLAN. |
| **`none`** | Максимальная безопасность | Отключение сетевого интерфейса (доступен только loopback). |

---

## 💾 Хранилище: Volumes vs Bind Mounts

```mermaid
graph TD
    subgraph HostFileSystem["Файловая система хоста"]
        DockerRoot["/var/lib/docker/volumes/ (Управляется Docker)"] --> NamedVol["Named Volume (БД, постоянные данные)"]
        HostDir["/home/user/project (Любой путь на хосте)"] --> BindMount["Bind Mount (Локальная разработка)"]
        RAM["RAM / Память хоста"] --> Tmpfs["tmpfs mount (Секреты, сессии, быстрый I/O)"]
    end
```

---

## 🛠️ Шаблон Production-Ready `docker-compose.yml`

Пример микросервисного стенда: Web API + PostgreSQL + Redis с правильными `healthcheck`, сетями и зависимостями:

```yaml
services:
  # -----------------------------------------------------------
  # База данных PostgreSQL
  # -----------------------------------------------------------
  postgres:
    image: postgres:16-alpine
    container_name: db_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: app_db
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - backend-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app_user -d app_db"]
      interval: 5s
      timeout: 3s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G

  # -----------------------------------------------------------
  # Кэш Redis
  # -----------------------------------------------------------
  redis:
    image: redis:7-alpine
    container_name: cache_redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass "SecretRedisPass"
    volumes:
      - redisdata:/data
    networks:
      - backend-net
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 3

  # -----------------------------------------------------------
  # Бэкенд API сервис
  # -----------------------------------------------------------
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: backend_api
    restart: unless-stopped
    environment:
      DATABASE_URL: postgres://app_user:secret@postgres:5432/app_db
      REDIS_URL: redis://:SecretRedisPass@redis:6379/0
    ports:
      - "8080:8080"
    networks:
      - frontend-net
      - backend-net
    depends_on:
      postgres:
        condition: service_healthy # Ждет успешного прохождения healthcheck базы данных
      redis:
        condition: service_healthy
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M

# Определение постоянных томов
volumes:
  pgdata:
    driver: local
  redisdata:
    driver: local

# Определение изолированных сетей
networks:
  frontend-net:
    driver: bridge
  backend-net:
    driver: bridge
    internal: true # Запрещает доступ из этой сети во внешний интернет

# Секреты (чтение из локальных файлов без передачи через ENV)
secrets:
  db_password:
    file: ./secrets/db_password.txt
```

---

## 🚨 Траблшутинг контейнеров Docker

```bash
# 1. Проверка причины падения контейнера (Exit Code)
docker inspect --format='{{.State.ExitCode}} : {{.State.Error}}' <container_id>

# 2. Анализ DNS внутри Docker сети
# Запуск временного контейнера с утилитами в сети приложения
docker run --rm -it --network backend-net nicolaka/netshoot nslookup postgres

# 3. Инспекция сетевых настроек и IP-адресов контейнеров в сети
docker network inspect backend-net
```

---

## 🔬 Deep Dive: сети Compose и порядок запуска

Compose создает сеть `<project>_default`; контейнеры находят друг друга **по имени сервиса** через встроенный DNS (127.0.0.11).

```yaml
services:
  app:
    depends_on:
      db:
        condition: service_healthy   # ждать реальной готовности, а не старта процесса
    networks: [backend]
  db:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      retries: 10
    networks: [backend]

networks:
  backend:
    driver: bridge
    internal: true     # сеть БЕЗ выхода в интернет — БД недоступна снаружи даже случайно
```

### Отладка связности

```bash
docker compose exec app sh -c 'getent hosts db'      # DNS работает?
docker compose exec app sh -c 'nc -zv db 5432'       # порт открыт?
docker network inspect project_default | jq '.[0].Containers'
```

!!! warning "Профили и переопределения"
    `profiles: [debug]` — тяжелый debug-сервис стартует только с `docker compose --profile debug up`. Прод-конфиг собирается через `-f base.yml -f prod.yml` (override merge), а не через sed.

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
docker compose ps && docker compose logs --tail=50 db && \
docker compose exec app sh -c 'getent hosts db; nc -zv db 5432' && \
docker network inspect $(basename $PWD)_default --format '{{json .Containers}}' | jq
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
| 💪 Практика | [Задачи по Compose и сетям](../15-hands-on-practice/01-100-devops-practical-tasks-part1.md) |
| ➡️ Дальше | [Kubernetes — оркестрация поверх контейнеров](../04-kubernetes/01-k8s-architecture-and-workloads.md) |
