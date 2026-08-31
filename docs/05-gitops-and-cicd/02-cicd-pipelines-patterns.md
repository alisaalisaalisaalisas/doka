# 🚀 02. Паттерны построения пайплайнов (GitLab CI / GitHub Actions)

## 📋 Стандартные стадии CI/CD пайплайна

```mermaid
graph LR
    Lint["1. Lint & Format"] --> Test["2. Unit & Integration Tests"]
    Test --> Sec["3. Security Scan (Trivy/SAST)"]
    Sec --> Build["4. Build & Push Image (Docker)"]
    Build --> GitOps["5. GitOps Update (Commit new tag to Infra repo)"]
```

---

## 🦊 Production-шаблон GitLab CI (`.gitlab-ci.yml`)

```yaml
stages:
  - test
  - security
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: ""
  IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA

default:
  interruptible: true # Автоматически отменять старые пайплайны при новом пуше в ветку

# 1. Линтинг и тесты
test:unit:
  stage: test
  image: golang:1.23-alpine
  script:
    - go test -v -race -coverprofile=coverage.txt ./...
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.txt

# 2. Сканирование безопасности через Trivy
security:trivy:
  stage: security
  image:
    name: aquasec/trivy:latest
    entrypoint: [""]
  script:
    - trivy fs --exit-code 1 --severity CRITICAL --no-progress .
  allow_failure: false

# 3. Сборка и отправка Docker-образа с Kaniko (без Docker-in-Docker root)
build:docker:
  stage: build
  image:
    name: gcr.io/kaniko-project/executor:debug
    entrypoint: [""]
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
  script:
    - /kaniko/executor
      --context "${CI_PROJECT_DIR}"
      --dockerfile "${CI_PROJECT_DIR}/Dockerfile"
      --destination "${IMAGE_TAG}"
      --destination "${CI_REGISTRY_IMAGE}:latest"
      --cache=true

# 4. Деплой через GitOps (Обновление тега в репозитории манифестов)
deploy:gitops:
  stage: deploy
  image: alpine/git:latest
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
  script:
    - git config --global user.email "ci-bot@company.com"
    - git config --global user.name "GitLab CI Bot"
    - git clone https://oauth2:${GITOPS_ACCESS_TOKEN}@gitlab.com/company/k8s-manifests.git
    - cd k8s-manifests/environments/production
    - sed -i "s|image:.*|image: ${IMAGE_TAG}|g" deployment.yaml
    - git commit -am "chore(release): update web-api to ${CI_COMMIT_SHORT_SHA}"
    - git push origin main
```

---

## 🐙 Production-шаблон GitHub Actions (`.github/workflows/ci-cd.yaml`)

```yaml
name: Production CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

permissions:
  contents: write
  id-token: write # Для безопасного OIDC доступа к Cloud провайдерам

jobs:
  # Проверка кода
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.23'
          cache: true

      - name: Run Tests
        run: go test -v -race ./...

  # Сборка и пуш в Docker Hub / GHCR
  build-and-push:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:${{ github.sha }}
            ghcr.io/${{ github.repository }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## 🔬 Deep Dive: паттерны, отделяющие CI от CD

```text
CI: build → test → scan → push image:sha123 → СОХРАНИТЬ артефакт
CD: отдельный процесс (GitOps operator) подхватывает новый sha → канареечный rollout
```

**Разделение важно:** CI-runner'ы не должны иметь kubeconfig прода. Компрометация раннера ≠ компрометация кластера.

### Канареечные стратегии

| Стратегия | Механизм | Инструменты |
| :--- | :--- | :--- |
| Blue-Green | два полных окружения, переключение LB | Argo Rollouts |
| Canary 5%→25%→100% | вес трафика по метрикам | Argo Rollouts + Prometheus analysis |
| Feature Flags | деплой ≠ релиз | Unleash, Flagsmith |

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate     # автоматический откат канарейки
spec:
  metrics:
    - name: error-rate
      interval: 1m
      failureLimit: 2
      provider:
        prometheus:
          address: http://prometheus.monitoring:9090
          query: |
            sum(rate(http_requests_total{app="api",code=~"5.."}[1m]))
            / sum(rate(http_requests_total{app="api"}[1m])) * 100
```

### Кэширование пайплайнов: что реально ускоряет

1. **Layer cache реестра** (`--cache-from/--cache-to type=registry`) вместо локального docker.
2. **Модульные кэши:** Go modules, pip wheels, npm — S3/GCS бэкенд.
3. **Тестовый шардинг:** `--shard 1/4` по времени выполнения тестов.
4. `interruptible: true` + автокancel старых пайплайнов ветки — не собирать очередь устаревших коммитов.

---

<!-- enriched:v1 -->

## 🧨 Типовые грабли Production (Pipelines — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `needs` DAG падает `job not found` | `needs: [test]` но `test` `when: manual` | `needs: { job: test, artifacts: true, optional: true }` |
| `cache: key: files: [package-lock.json]` miss на каждой ветке | Ключ `$CI_COMMIT_REF_SLUG` уникален | `key: files: [package-lock.json]` без ветки или `fallback_keys` |
| `Kaniko` `unauthorized` push в Harbor | `DOCKER_AUTH_CONFIG` не в `before_script` | `echo $DOCKER_AUTH_CONFIG > /kaniko/.docker/config.json` |
| `rules: -if: $CI_PIPELINE_SOURCE == "merge_request_event"` не триггерит | `workflow: rules` перекрывает `job: rules` | Проверить `workflow: { rules: [{ when: always }] }` внизу файла |

!!! warning «Идемпотентность — закон»
    Любой скрипт/плейбук/модуль должен быть безопасно перезапускаемым. Если второй прогон меняет состояние — это баг, который однажды уронит прод.

## 🧪 Hands-on Lab

```bash
gitlab-ci-local --list 2>/dev/null || act --list; echo '---'; \
docker buildx build --platform linux/amd64 --cache-from type=registry,ref=reg/app:cache -t app:test . --dry-run 2>&1 | tail -5
```

## ✅ Чек-лист зрелости темы

- [ ] Все изменения проходят через PR с обязательным review

    ??? tip "Как закрыть пункт"
        Branch protection запрещает push в main; изменения инфраструктуры/конфигов — только через MR с review. Проверка: история применений соответствует истории мержей, «горячие правки на сервере» отсутствуют как класс.

- [ ] Секреты никогда не хранятся в коде/стейте (Vault/SOPS/secret manager)

    ??? tip "Как закрыть пункт"
        Vault/ESO как источник; gitleaks в pre-commit и CI. Для стейтов — шифрование бэкенда и ограничение доступа IAM. Аудит: grep по репозиторию находит ссылки на переменные, но не значения.

- [ ] Есть dry-run/plan этап и он виден в MR

    ??? tip "Как закрыть пункт"
        plan/--check --diff выполняется CI на каждый MR и публикуется в комментарий — ревьюер видит изменения инфраструктуры до approve. Артефакт плана переиспользуется при apply.

- [ ] Откат воспроизводим одной командой (< 10 минут)

    ??? tip "Как закрыть пункт"
        git revert + pipeline = откат инфраструктуры; helm rollback/GitOps revert для релизов. Отработано учением с таймером: решение → восстановленный сервис. Если есть ручные шаги — они в runbook.

- [ ] Логи пайплайна содержат версии артефактов (image digest, commit SHA)

    ??? tip "Как закрыть пункт"
        Deploy-джоба печатает: SHA коммита, digest образа, версии инструментов. При инциденте вы точно знаете, какой код где исполнялся. Проверка: по логу можно восстановить состояние прода на любой момент.

---

## 🧭 Что дальше

| Шаг | Материал |
| :--- | :--- |
| 🔬 Закрепить | [Lab 04: пайплайн end-to-end](../16-guided-labs/04-lab-cicd-pipeline.md) |
| 🦊 Глубже | [GitLab CI deep dive](03-gitlab-ci-deep-dive.md) |

---

## ✅ Проверь себя

**В1. Классические стадии пайплайна и что НЕ должен делать build-stage?**
<details><summary>Ответ</summary>
build → test → scan → package/publish → deploy(dev) → e2e → promote(prod). Build НЕ деплоит в прод и не имеет секретов прода — только артефакты и метаданные (образ, SBOM, digest).
</details>

**В2. Что кэшируют в CI и что кэшировать нельзя?**
<details><summary>Ответ</summary>
Можно: зависимости (pip/go mod/npm), тулчейны, docker layers через registry-cache. Нельзя: секреты, токены, terraform state — через fork-раннеры они утекут в чужие MR.
</details>

**В3. Что такое ephemeral (preview) environments?**
<details><summary>Ответ</summary>
Окружение на MR: ветка деплоится в namespace preview-pr-N, ссылка приходит комментарием в MR, удаляется при мерже. Реализация — ArgoCD ApplicationSet generator:pull-request. Ревьюер смотрит живую версию.
</details>

**В4. Почему артефакт собирают один раз («build once, deploy many»)?**
<details><summary>Ответ</summary>
Одна версия проходит dev→stage→prod, различие только в конфиге. Пересборка на среду ломает трассируемость (что именно в проде?) и может внести отличия. Digest образа фиксируется в манифесте каждой среды.
</details>

**В5. Минимальная защита main-ветки?**
<details><summary>Ответ</summary>
Запрет прямого push; обязательный MR с approval (CODEOWNERS на критичные пути); green pipeline как условие мержа; выбранная модель истории (merge-only/linear); подписанные коммиты для regulated сред.
</details>
