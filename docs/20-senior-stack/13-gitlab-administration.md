# 🦊 20.13 GitLab administration: компоненты, runner fleet, бэкапы

> Уровень: Middle→Senior. Self-hosted GitLab — это не «страница с MR», а распределённая система из 8+ компонентов со своей эксплуатацией.

**Оглавление:** [2.1 Теория](#21-теория) · [2.2 Конфигурация](#22-конфигурация-и-синтаксис) · [2.3 Troubleshooting](#23-troubleshooting) · [2.4 Интеграция](#24-интеграция-со-стеком) · [2.5 Проверь себя](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

### 2.1 Теория

#### Архитектура Omnibus-инсталляции

```text
nginx ──> workhorse ──> puma (Rails: веб/API)
              │              │
              │         postgresql (метаданные)   redis (очереди/сессии)
              │              │
              └──────> gitaly (Git RPC → хранилища репо)   ← КРИТИЧНО: диски!
                       sidekiq (фоновые джобы: webhooks, CI, импорты)
                       registry (docker), prometheus, praefect (HA gitaly)
```

- **Gitaly** — единственный, кто трогает файлы репозиториев; латентность его дисков = латентность git-операций. SSD обязателен.
- **Sidekiq** — всё «фоновое»: если очередь растёт, веб остаётся живым, но хуки/CI-события запаздывают.
- **Workhorse** — reverse-proxy перед Rails: большие файлы/клоны отдаёт сам.
- **Omnibus** (пакет на VM) vs **Cloud Native Hybrid** (stateful в K8s через helm + rails на VM) vs полный Helm — выбор по масштабу; полный Helm сложнее в эксплуатации.

#### Runner fleet

| Понятие | Суть |
| :--- | :--- |
| Типы раннеров | shared (всем), group, specific (проект) |
| Executor | `docker` (контейнер на VM), `kubernetes` (pod per job), `shell` (на хосте — избегать), `docker-autoscaler` (эфемерные VM) |
| Tags | job запускается только на раннере с совпадающими тегами (если раннер tagged) |
| Protected | раннер только для protected-веток/тегов |
| Токены | authentication token (новый формат `glrt-`), регистрация per-project/group/instance |

**Kubernetes executor:** каждый job = pod (build + helper + service контейнеры). Кэш — S3/GCS/MinIO; артефакты — в GitLab (object storage). Docker-in-Docker — legacy; сборка образов через kaniko/buildah.

**Upgrade path:** GitLab требует последовательных остановок при мажорных апгрейдах (например, нельзя 15.11 → 16.8 напрямую; конкретные required stops — **проверяйте в официальной таблице upgrade path** для вашей версии). Сначала апгрейд Gitaly-совместимость, потом Rails.

---

### 2.2 Конфигурация и синтаксис

#### gitlab.rb — ключевые production-настройки

```ruby
# /etc/gitlab/gitlab.rb
external_url 'https://gitlab.corp.io'

# Хранение: LFS/артефакты/бэкапы — в object storage, не на локальном диске
gitlab_rails['object_store_enabled'] = true
gitlab_rails['backup_upload_connection'] = {
  'provider' => 'AWS',
  'aws_access_key_id' => '...',            # из Vault/ESO, не в gitlab.rb в plaintext
  'region' => 'eu-central-1',
  'aws_secret_access_key' => '...',
}
gitlab_rails['backup_upload_remote_directory'] = 'gitlab-backups'
gitlab_rails['backup_keep_time'] = 604800          # локальные бэкапы 7 дней

# Ограничения
nginx['client_max_body_size'] = '1g'
gitlab_rails['gitlab_shell_git_timeout'] = 10800

# Prometheus встроенный
prometheus_monitoring['enable'] = true
```

#### Runner: config.toml (kubernetes executor)

```toml
# /etc/gitlab-runner/config.toml
concurrent = 10                    # параллельные job'ы на этом раннере
check_interval = 3

[[runners]]
  name = "k8s-runner-eu1"
  url = "https://gitlab.corp.io"
  token = "glrt-..."               # authentication token (из Vault, не в git)
  executor = "kubernetes"
  [runners.kubernetes]
    namespace = "gitlab-runners"
    image = "alpine:3.21"
    cpu_limit = "2"
    memory_limit = "4Gi"
    service_account = "gitlab-runner"
    [runners.kubernetes.volumes.empty_dir]      # tmpfs для сборок
      name = "build-tmp"; mount_path = "/tmp"; medium = "Memory"
  [runners.cache]
    Type = "s3"
    Shared = true
    [runners.cache.s3]
      ServerAddress = "minio.corp.io"; BucketName = "gitlab-cache"
```

#### Регистрация и теги

```bash
gitlab-runner register \
  --url https://gitlab.corp.io \
  --token glrt-xxxxx \
  --executor kubernetes --description k8s-eu1 \
  --tag-list "docker,k8s,eu1" --run-untagged=false --protected=false
```

**Частые ошибки:** job «stuck» — теги в `.gitlab-ci.yml` не совпадают с тегами ни одного активного раннера; `concurrent=1` на общем раннере → очередь пайплайнов; кэш без Shared=true между разными раннерами → «кэш не работает»; docker socket в раннере = root-эквивалент на хосте.

---

### 2.3 Troubleshooting

```bash
# === Сервер ===
gitlab-ctl status                          # все компоненты: run/run/run...
gitlab-rake gitlab:check SANITIZE=true     # полная самодиагностика
gitlab-ctl tail sidekiq                    # логи фоновых задач
gitlab-ctl tail gitaly | grep -i "slow\|timeout"

# Очереди Sidekiq (рост = деградация фоновых задач):
gitlab-rails runner "Sidekiq::Queue.new.size; Sidekiq::RetrySet.new.size"

# === Бэкапы ===
gitlab-backup create STRATEGY=copy SKIP=artifacts,registry
#   КРИТИЧНО: /etc/gitlab/gitlab-secrets.json + gitlab.rb НЕ входят в backup!
#   Без secrets восстановление невозможно (шифрование CI-переменных, токенов).

# === Раннеры ===
gitlab-runner verify                       # жив ли, валиден ли токен
gitlab-runner list                         # конфиги всех зарегистрированных
journalctl -u gitlab-runner -f | grep -iE "error|job"
#  "job failed: preparation failed: pulling image" → registry недоступен из кластера раннеров
```

**Топ проблем:**

| Симптом | Причина | Действие |
| :--- | :--- | :--- |
| Job stuck: «no runners assigned» | теги job'а ≠ теги раннеров / раннер paused | Settings→CI→Runners; сверить tags |
| 500 на страницах проектов | БД/миграции/диск postgres | `gitlab-ctl tail puma`, место на диске БД |
| Клонирование медленное | Gitaly на медленном диске / большие репо (LFS!) | `gitlab-ctl tail gitaly`, включить LFS, SSD |
| Пайплайны висят в created | sidekiq queue забита / раннеров мало | очередь sidekiq, `concurrent`, добавить раннеров |
| Runner: 403 при регистрации | токен отозван/истёк | перерегистрировать, токен из Vault |
| Восстановление бэкапа падает на CI-переменных | нет gitlab-secrets.json | восстановить secrets из отдельного бэкапа |

---

### 2.4 Интеграция со стеком

- **Registry:** встроенный container registry (garbage collection по расписанию: `gitlab-ctl registry-garbage-collect`).
- **CI-паттерны:** kaniko вместо DinD, кэш Go/npm в MinIO (см. [20.5](05-registries-dependencies.md)), Renovate как проект/раннер.
- **K8s-агент (GitLab Agent for Kubernetes):** pull-based деплой из GitLab в кластер без открытия API кластера наружу.
- **Observability:** встроенный Prometheus → внешний Thanos; алерты на sidekiq queue depth, runner job queue time.

---

### 2.5 Проверь себя — 5 вопросов

**В1. Сценарий: полный бэкап GitLab есть, но после restore все CI-переменные и токены раннеров невалидны. Что потеряли?**

<details><summary>Ответ</summary>
/etc/gitlab/gitlab-secrets.json — он шифрует CI-переменные, токены, 2FA и не входит в gitlab-backup. Его бэкапируют отдельно вместе с gitlab.rb; без него данные расшифровать нельзя.
</details>

**В2. Найдите ошибку: в .gitlab-ci.yml у job'а `tags: ["docker"]`, раннер зарегистрирован с `--run-untagged=true` и тегами `k8s`. Job висит в created.**

<details><summary>Ответ</summary>
Раннер с тегами принимает только job'ы с совпадающими тегами; run-untagged влияет лишь на job'ы без тегов. Либо добавить тег docker раннеру, либо тег k8s в job, либо снять tagged-режим.
</details>

**В3. Почему docker socket в раннере считается критической уязвимостью, и чем заменить?**

<details><summary>Ответ</summary>
Socket = полный контроль Docker-демона хоста = root (mount /, привилегированные контейнеры). Замена: kaniko/buildah (сборка без DinD) или docker-autoscaler с эфемерными VM под job.
</details>

**В4. Клоны большого репозитория «тормозят», CPU сервера в норме. Куда смотреть?**

<details><summary>Ответ</summary>
Gitaly: латентность его дисков и метрики gitaly (RPC durations). Проверить, что репо не пестует гигантские бинарники (нужен LFS), диск SSD, нет соседей по I/O; в HA — praefect-распределение.
</details>

**В5. Почему нельзя апгрейдить GitLab «напрямую» через несколько мажорных версий?**

<details><summary>Ответ</summary>
Миграции БД последовательны и зависимы: промежуточные версии содержат required stops (миграции, меняющие формат). Прыжок через несколько мажоров ломает схему БД без пути отката. Следовать официальному upgrade path (проверять актуальную таблицу).
</details>

---

### 2.6 Практика — 3 задания

### Задание 1: GitLab CE в docker + первый runner (стенд)

**Условие:** поднять GitLab и runner локально, зарегистрировать, запустить пайплайн.

```bash
# Шаг 1: сервер (стартовое состояние: пустой docker)
docker run -d --name gitlab --hostname gitlab.local \
  -p 8443:443 -p 8880:80 -p 2222:22 \
  -v gitlab_config:/etc/gitlab -v gitlab_logs:/var/log/gitlab -v gitlab_data:/var/opt/gitlab \
  gitlab/gitlab-ce:latest
sleep 90 && docker exec gitlab gitlab-ctl status | head -8
# Ожидание: down: gitaly: ... up: puma, sidekiq, nginx... (все up через ~2-3 мин)

# Шаг 2: root-пароль
docker exec gitlab cat /etc/gitlab/initial_root_password

# Шаг 3: runner
docker run -d --name runner --network container:gitlab gitlab/gitlab-runner:latest
# В UI: Admin → CI/CD → Runners → New instance runner → скопировать токен glrt-...
docker exec -it runner gitlab-runner register \
  --url http://localhost:8880 --token glrt-XXX \
  --executor docker --docker-image alpine:3.21 \
  --docker-pull-policy if-not-present --description local

docker exec runner gitlab-runner verify
# Ожидание: Verifying runner... is valid ✅

# Шаг 4: пайплайн (в любом проекте .gitlab-ci.yml)
#   test: { image: alpine, script: ["echo hello", "uname -a"] }
#   → job зелёный на локальном раннере
```

**Проверь себя:** `gitlab-ctl status` — все компоненты up; в UI пайплайн зелёный; `docker exec gitlab gitlab-rake gitlab:check SANITIZE=true | tail -3` — «gitlab check finished».

**Разбор:** вы увидели все компоненты вживую (puma/sidekiq/gitaly) и полный цикл «runner register → job». Тот же флоу — в проде, только executor=kubernetes и токены из Vault.

### Задание 2: Kubernetes executor + kaniko + кэш в MinIO

**Условие:** раннер в kind-кластере; job собирает образ через kaniko (без DinD), кэш go-модулей — в MinIO из [20.8](08-storage-s3-etcd-longhorn.md).

```bash
# Шаг 1: раннер в кластере (helm)
helm repo add gitlab https://charts.gitlab.io
helm install runner gitlab/gitlab-runner -n gitlab-runners --create-namespace \
  --set rbac.create=true \
  --set runnerRegistrationToken=glrt-XXX \
  --set gitlabUrl=http://gitlab.local:8880 \
  --set runners.executor=kubernetes \
  --set runners.cache.s3.serverAddress=minio.default:9000 \
  --set runners.cache.s3.bucketName=gitlab-cache \
  --set runners.cache.s3.accessKey=admin --set runners.cache.s3.secretKey=admin12345

kubectl -n gitlab-runners get pods    # runner pod Running

# Шаг 2: job с kaniko (фрагмент .gitlab-ci.yml)
# build:
#   tags: [kubernetes]
#   image:
#     name: gcr.io/kaniko-project/executor:debug
#     entrypoint: [""]
#   script:
#     - echo "{\"auths\":{\"$CI_REGISTRY\":{\"auth\":\"$(echo -n u:p|base64)\"}}}" > /kaniko/.docker/config.json
#     - /kaniko/executor --context $CI_PROJECT_DIR --dockerfile Dockerfile
#         --destination $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA --cache=true

# Шаг 3: проверка кэша — второй прогон job'а:
kubectl -n gitlab-runners logs -l app=gitlab-runner | grep -i cache
#   "extracting archive" → "cache created" на первом; "cache hit" на втором ✅
```

**Проверь себя:** второй запуск job'а быстрее (кэш hit); в MinIO бакет gitlab-cache содержит архивы; в поде job'а НЕТ монтирования docker.sock.

**Разбор:** kaniko собирает образы в userspace без привилегий — замена DinD в K8s-раннерах. Кэш S3 делает сборки переносимыми между нодами (Shared=true).

### Задание 3: Бэкап + репетиция восстановления (как с etcd из 20.8)

**Условие:** снять бэкап, удалить проект, восстановить.

```bash
# Шаг 1: бэкап (в контейнере из Задания 1)
docker exec -t gitlab gitlab-backup create
docker exec gitlab ls -lh /var/opt/gitlab/backups/ | tail -2
# Ожидание: TIMESTAMP_gitlab_backup.tar (~сотни MB)

# Шаг 2: СОХРАНИТЬ secrets (отдельно! это и есть главная ловушка)
docker cp gitlab:/etc/gitlab/gitlab-secrets.json ./secrets.json
docker cp gitlab:/etc/gitlab/gitlab.rb ./gitlab.rb

# Шаг 3: «катастрофа» — удалить проект через UI (или API)

# Шаг 4: восстановление
docker exec -t gitlab gitlab-ctl stop puma && docker exec -t gitlab gitlab-ctl stop sidekiq
docker exec -t gitlab gitlab-backup restore BACKUP=<TIMESTAMP>
#   → подтверждение; затем вернуть secrets и gitlab.rb:
docker cp ./secrets.json gitlab:/etc/gitlab/gitlab-secrets.json
docker exec -t gitlab gitlab-ctl reconfigure && docker exec -t gitlab gitlab-ctl restart
docker exec -t gitlab gitlab-rake gitlab:check SANITIZE=true | tail -2

# Шаг 5: проект на месте ✅
```

**Проверь себя:** удалённый проект существует после restore; `gitlab:check` зелёный; попытка restore БЕЗ secrets.json дала бы нерабочие CI-переменные — вы это теперь знаете до прод-инцидента.

**Разбор:** бэкап GitLab = tar с БД+репо+артефактами, но secrets — вне его. Восстановление требует остановки puma/sidekiq (консистентность). Регулярность + отдельное хранение secrets + репетиция = готовность к DR.

---

*Следующая подтема: [20.14 Rancher и k3s](14-rancher-and-k3s.md)*
