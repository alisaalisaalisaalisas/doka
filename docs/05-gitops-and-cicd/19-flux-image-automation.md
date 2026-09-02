# 🤖 19. Автоматизация обновления образов в Flux: ImageRepository, ImagePolicy и Git Commit Loop

## 🔄 Замкнутый цикл непрерывной доставки (Continuous Delivery Loop)

В классическом подходе разработчик вручную обновляет тег образа в Git манифестах или вызывает `sed` в CI скрипте. 

**Flux Image Automation Controllers** автоматизируют этот процесс без необходимости давать CI-раннерам права на запись в Git-репозиторий инфраструктуры:
1. CI пайплайн только собирает Docker-образ и пушит его в Registry.
2. `image-reflector-controller` сканирует Registry и находит новый тег по правилам **SemVer / Regex**.
3. `image-automation-controller` клонирует Git-репозиторий, находит маркеры `# {"$imagepolicy": ...}`, обновляет тег и делает коммит от имени бота.
4. `kustomize-controller` подхватывает новый коммит и выкатывает обновленный сервис в Kubernetes.

```mermaid
flowchart TD
    subgraph CI["CI Pipeline (GitLab / GitHub)"]
        Build["Build & Push Image: backend:v1.4.2"]
    end

    subgraph Registry["Container Registry (Harbor / ECR / GHCR)"]
        ImageStore[("Image Repository: company/backend")]
    end

    subgraph FluxControllers["Flux GOTK Controllers"]
        Reflector["image-reflector-controller (ImageRepository & ImagePolicy)"]
        Automator["image-automation-controller (ImageUpdateAutomation)"]
        SourceKust["source-controller + kustomize-controller"]
    end

    subgraph GitOpsRepo["GitOps Config Repository"]
        GitRepo[("Git Repo (Deployment YAML with Markers)")]
    end

    subgraph K8s["Kubernetes Production"]
        Pods["Running Pods (v1.4.2)"]
    end

    Build -->|1. Push Image| ImageStore
    Reflector -->|2. Scan Tags (Cron/Webhook)| ImageStore
    Reflector -->|3. Latest SemVer match: v1.4.2| Automator
    Automator -->|4. Git Commit & Push [Auto-Update]| GitRepo
    GitRepo -->|5. Sync Commit| SourceKust
    SourceKust -->|6. Rolling Update Deployment| Pods
```

---

## 📑 Production-манифесты автоматизации

### 1. Сканирование реестра: `ImageRepository`

```yaml
apiVersion: image.toolkit.fluxcd.io/v1beta2
kind: ImageRepository
metadata:
  name: payment-backend
  namespace: flux-system
spec:
  image: registry.company.com/payments/backend
  interval: 1m
  secretRef:
    name: registry-credentials
  certSecretRef:
    name: corporate-ca-certs        # Для приватных реестров с собственным CA
```

---

### 2. Фильтрация и выбор версии: `ImagePolicy`

Поддерживает **SemVer** (диапазоны, префиксы, pre-releases), сортировку по числовым значениям или алфавитные фильтры Regex.

```yaml
apiVersion: image.toolkit.fluxcd.io/v1beta2
kind: ImagePolicy
metadata:
  name: payment-backend-policy
  namespace: flux-system
spec:
  imageRepositoryRef:
    name: payment-backend
  policy:
    semver:
      range: '^2.4.x'                 # Автоматический апдейт всех патч-версий ветки 2.4 (2.4.0 -> 2.4.1 -> 2.4.9)
```

---

### 3. Автоматический коммит в Git: `ImageUpdateAutomation`

```yaml
apiVersion: image.toolkit.fluxcd.io/v1beta2
kind: ImageUpdateAutomation
metadata:
  name: fleet-image-automation
  namespace: flux-system
spec:
  interval: 1m
  sourceRef:
    kind: GitRepository
    name: fleet-infra
  git:
    checkout:
      ref:
        branch: main
    commit:
      author:
        name: "Flux Image Bot"
        email: "flux-bot@company.internal"
      messageTemplate: |
        chore(release): automated image update by Flux
        
        [ci skip]
        Updates:
        {{ range .Updated.Images }}
        - {{ . }}
        {{ end }}
      signingKey:
        secretRef:
          name: gpg-signing-key       # Подпись коммита ключом GPG
    push:
      branch: main
  update:
    path: ./clusters/production/apps
    strategy: Setters
```

---

### 4. Разметка манифестов: Использование маркерных комментариев (Setters)

В целевом файле `deployment.yaml` добавляется специальный маркер в виде комментария:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-backend
  namespace: default
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: backend
          # Контроллер автоматически заменяет строку тега по правилу ImagePolicy
          image: registry.company.com/payments/backend:v2.4.0 # {"$imagepolicy": "flux-system:payment-backend-policy"}
          ports:
            - containerPort: 8080
```

---

## 🛠️ CLI шпаргалка: Отладка обновления образов

```bash
# 1. Просмотр отсканированных тегов и выбранной политики
flux get image repository payment-backend
flux get image policy payment-backend-policy

# 2. Ручной принудительный запуск сканирования и коммита
flux reconcile image repository payment-backend
flux reconcile image update fleet-image-automation

# 3. Тестирование SemVer регулярного выражения без применения
flux get image policy payment-backend-policy -o yaml | grep "latestImage"

# 4. Просмотр логов автоматизации коммитов
flux logs --kind=ImageUpdateAutomation -f
```

---

## 🚨 Break-Fix: Разбор частых аварийных сценариев

### Инцидент 1: Конфликт Git Push (`non-fast-forward / reject updates`)

**Симптом:**
`ImageUpdateAutomation` выдает ошибку: `failed to push: updates were rejected because the remote contains work that you do not have locally`.

**Первопричина:**
Пока Flux готовил коммит, разработчик отправил свой коммит в ветку `main`.

**Решение:**
Flux v2 автоматически делает pull с rebase в следующей итерации (через `interval: 1m`). Если ошибка сохраняется, убедиться, что для ветки `main` в Git разрешен force-push с арендой (`--force-with-lease`), либо уменьшить интервал синхронизации.

---

### Инцидент 2: ImagePolicy выбрал нестабильный RC / Alpha тег

**Симптом:**
В прод неожиданно выкатился тег `v2.4.1-rc.0` или `v2.4.1-beta.2`.

**Решение:**
В SemVer диапазоне запретить pre-releases через флаг `filterTags`:
```yaml
spec:
  policy:
    semver:
      range: '>=2.4.0 <2.5.0'
  filterTags:
    pattern: '^v[0-9]+\.[0-9]+\.[0-9]+$' # Исключить любые суффиксы -rc, -beta
```
