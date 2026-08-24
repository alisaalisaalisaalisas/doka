# 🏛️ 20.5 Реестры и зависимости: Harbor, Nexus/Artifactory, Renovate

> Уровень: Middle→Senior. Цель: приватный supply-chain под контролем — образы, пакеты, автоматическое обновление зависимостей без хаоса PR'ов.

**Оглавление:** [2.1 Теория](#21-теория) · [2.2 Конфигурация](#22-конфигурация-и-синтаксис) · [2.3 Troubleshooting](#23-troubleshooting) · [2.4 Интеграция](#24-интеграция-со-стеком) · [2.5 Проверь себя](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

### 2.1 Теория

#### Зачем приватный реестр (а не Docker Hub напрямую)

1. **Rate limits и надёжность:** Docker Hub режет анонимные pull'ы; прод не должен зависеть от чужого SaaS.
2. **Безопасность:** сканирование (Trivy), подписи (cosign/notary), retention-политики, аудит «кто что запушил».
3. **Скорость:** pull из своей сети в разы быстрее; P2P-предразогрев нод.
4. **Air-gap:** pull-through proxy — единственный канал к внешним образам.

#### Harbor vs Nexus/Artifactory

| | **Harbor** | **Sonatype Nexus** | **JFrog Artifactory** |
| :--- | :--- | :--- | :--- |
| Специализация | контейнеры (CNCF), Helm charts | универсальный: maven/npm/pypi/helm/docker | универсальный, enterprise-фичи |
| Сканирование | встроенный Trivy | через плагины/вне | встроенное Xray (платно) |
| Репликация | pull/push между Harbor'ами | proxy-репозитории | мульти-регион, топология |
| Квоты/retention | per-project квоты + retention rules | cleanup-таски | rich policies |
| Когда выбирать | K8s-центричная компания | «один реестр для всего» на бюджете | enterprise, compliance, mono-repos |

**Типы репозиториев Nexus:** `hosted` (своё), `proxy` (кэш внешнего), `group` (агрегат hosted+proxy под одним URL). Docker в Nexus живёт на **отдельных портах** (connector) для hosted/group — частая ловушка.

**Robot accounts (Harbor):** сервисные учётки с expiry, scope на проект, имя `robot$project+name`. Для CI — только push в конкретный проект, для кластера — pull-only.

#### Renovate vs Dependabot

| | **Renovate** | **Dependabot** |
| :--- | :--- | :--- |
| Платформы | GitHub, GitLab, Bitbucket, self-hosted | только GitHub |
| Гибкость | presets, packageRules, группировки, automerge-логика | базовые настройки |
| Экосистемы | 90+ (включая docker-compose, helm, terraform, gitlabci-образы!) | ~20 основных |
| Стратегии версий | `pin/extend/widen/replace/bump` | ограничено |
| Выбор | дефолт для серьёзных проектов | быстро включить и забыть |

**Ключевая идея Renovate:** обновления — это **непрерывный процесс**, а не разовый апгрейд: мелкие частые PR'ы с automerge лучше редких «обновили всё сразу».

---

### 2.2 Конфигурация и синтаксис

#### Harbor (helm): production-минимум

```yaml
# values-harbor.yaml
expose:
  type: clusterIP
  tls:
    enabled: true
    certSource: secret
    secret: { secretName: harbor-tls }     # серт из cert-manager (см. 20.3)
externalURL: https://harbor.corp.io
persistence:
  enabled: true
  imageChartStorage:
    type: s3                                # блобы в S3, не на PVC
    s3: { region: eu-central-1, bucket: harbor-blobs, secretkeyRef: ... }
trivy: { enabled: true, skipUpdate: false } # сканер + свежая CVE-база
database: { type: external }                # внешний PG для прод-Harbor
metrics: { enabled: true }                  # /metrics для Prometheus
```

```bash
# CI: push через robot account
echo "$HARBOR_ROBOT_TOKEN" | docker login harbor.corp.io \
  -u 'robot$shop+ci' --password-stdin
docker tag app:$SHA harbor.corp.io/shop/app:$SHA
docker push harbor.corp.io/shop/app:$SHA
```

#### Retention + replication (Harbor UI → проект → Policy)

```text
Retention (проект shop):
  - always keep: digests, помеченные тегами v* (релизы)
  - keep last 10: нетегированные (untagged) — для rollback кэша
  - keep last 30 days: все остальные теги
Replication (pull-through):
  endpoint: docker.io (type: docker-hub) → rule: ** → режим Pull-based
  project: dockerhub-proxy   # образы тянем как harbor.corp.io/dockerhub-proxy/library/nginx:1.27
  schedule: on-demand / daily, override: on
```

#### Nexus: docker-репозитории (кратко)

```text
Repositories:
  docker-hosted  (HTTP connector :8083)  ← CI пушит сюда
  docker-proxy   (HTTP connector :8084)  ← кэш docker.io
  docker-group   (HTTP connector :8082)  ← читают кластер и девы (hosted+proxy)
Blob store: отдельный filestore на большом диске; Cleanup policies → Task "Delete unused".
```

#### Renovate: `renovate.json` с production-логикой

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended", ":semanticCommitsDisabled"],
  "timezone": "Europe/Berlin",
  "schedule": ["after 6am and before 10am every weekday"],
  "prConcurrentLimit": 5,
  "prHourlyLimit": 2,
  "vulnerabilityAlerts": { "labels": ["security"], "schedule": ["at any time"] },
  "packageRules": [
    {
      "description": "patch+minor одной пачкой, automerge",
      "matchUpdateTypes": ["patch", "minor"],
      "groupName": "non-breaking deps",
      "automerge": true,
      "platformAutomerge": true,
      "automergeType": "pr"
    },
    {
      "description": "major — отдельный PR с release notes, без automerge",
      "matchUpdateTypes": ["major"],
      "automerge": false,
      "labels": ["major-update"]
    },
    {
      "description": "docker-образы в манифестах — только digest-обновления патчей",
      "matchManagers": ["dockerfile", "kubernetes"],
      "pinDigests": true
    }
  ]
}
```

**Частые ошибки конфигурации:**
1. Harbor: `expose.tls.enabled: true` + самоподписанный серт → ноды кластера не доверяют → `x509: certificate signed by unknown authority` при pull. Нужен CA в `/etc/containerd/certs.d/` или нормальный серт.
2. Nexus: `docker login` на group-порт с учёткой без прав на **hosted** → 401/403 на push (push всегда на hosted-порт).
3. Renovate: `automerge: true` без зелёных required checks → PR'ы копятся (automerge ждёт статусы); без `platformAutomerge` — медленнее.
4. Renovate: нет `prConcurrentLimit` → «шторм из 40 PR» после онбординга, ревью парализовано.
5. Harbor: robot account с default expiry 30 дней → CI падает через месяц. Ставьте expiry явно и ротируйте через Vault/ESO (см. 20.3).

---

### 2.3 Troubleshooting

```bash
# === Harbor ===
# ImagePullBackOff в кластере — что говорит kubelet?
kubectl describe pod web | grep -A3 "Failed to pull"
#  "unauthorized: authentication required" → robot протух/нет прав на проект
#  "x509: certificate..."            → доверие к CA registry на нодах
#  "manifest unknown"                → тег удалила retention-политика (смотрите retention runs)

# Логин и манифест руками с ноды:
docker login harbor.corp.io -u 'robot$shop+ci' -p "$TOKEN"
docker manifest inspect harbor.corp.io/shop/app:1.4.2 | jq '.manifests[].digest'

# Состояние заданий Harbor (репликация, сканы, garbage collect):
kubectl -n harbor logs deploy/harbor-jobservice | grep -iE "replication|error" | tail
curl -sk -H "Authorization: Basic $B64" https://harbor.corp.io/api/v2.0/health | jq .

# === Nexus ===
curl -su admin:"$PASS" 'http://nexus:8081/service/rest/v1/repositories' | jq '.[].name'
#  docker login nexus:8082 → 401? Проверьте anonymous + активную учётку и ПРАВИЛЬНЫЙ порт

# === Renovate ===
# PR'ы не создаются: посмотрите debug-лог self-hosted рана
renovate --token "$TOKEN" --log-level=debug 2>&1 | grep -iE "branch|pr " | head
#  "rate limit exceeded" → prHourlyLimit/GitHub API limits
#  "config warning" → опечатка в packageRules (matchManagers и т.п.)
```

**Топ проблем:**

| Симптом | Причина | Действие |
| :--- | :--- | :--- |
| Внезапный ImagePullBackOff у всех подов проекта | robot account истёк (expiry) | продлить/перевыпустить, секрет в ESO с ротацией |
| Тег образа «пропал» из registry | retention удалил нетегированные/старые | пиновать релизы тегами `v*` (always keep) |
| `x509: certificate signed by unknown authority` | self-signed Harbor без доверия нод | CA в trust-store нод / containerd `hosts.toml` |
| Nexus: pull ок, push 401 | пушите на group-порт | push только на hosted-connector |
| Renovate: automerge включён, PR'ы висят | required checks не зелёные / нет `platformAutomerge` | настроить branch protection + флаг |
| Renovate: обновил major и сломал прод | нет отдельной политики major | packageRules: major без automerge + label |

---

### 2.4 Интеграция со стеком

- **CI/CD:** пайплайн пушит digest-тег в Harbor; ArgoCD Image Updater / Renovate обновляют манифесты; Kyverno `verifyImages` (20.1) пускает только подписанные (cosign) образы из allowlist-registry.
- **K8s:** `imagePullSecrets` с robot-токеном; для Harbor с кастомным CA — CA в нодах или `insecureRegistry` в containerd (не рекомендуется в проде).
- **Observability:** Harbor `/metrics` → Prometheus (queue репликаций, результат сканов); алерт «Trivy DB не обновлялась > 3 дней».
- **ESO (20.3):** robot-токены Harbor живут в Vault, ESO кладёт их в `imagePullSecrets` — ротация без рук.

---

### 2.5 Проверь себя — 5 вопросов

**В1. Сценарий: в пятницу вечером все поды проекта начали получать `unauthorized` при pull. Что произошло и как сделать, чтобы не повторилось?**

<details><summary>Ответ</summary>
Истёк robot account Harbor (default expiry 30 дней, создан месяц назад). Лечение — перевыпустить токен; профилактика — хранить токен в Vault с ESO-ротацией за N дней до expiry и алерт на `robot expiration`.
</details>

**В2. Найдите ошибку: в CI настроен push в Nexus `docker login nexus.corp:8082` (group-порт) — пуш падает 401/403, хотя логин успешен.**

<details><summary>Ответ</summary>
Group-репозиторий в Nexus — только для чтения; push принимают hosted-репозитории на своём connector-порту. Логин на 8082 проходит, но пуш надо делать на порт hosted (например 8083).
</details>

**В3. Почему Renovate с `automerge: true` оставляет PR'ы несмердженными неделями?**

<details><summary>Ответ</summary>
Automerge срабатывает только при зелёных required status checks и отсутствии конфликтов; без platformAutomerge Renovate делает это циклом опроса (медленно). Проверить branch protection и включить platformAutomerge.
</details>

**В4. Зачем Harbor-проекту retention-правило «always keep теги v*», если есть квоты?**

<details><summary>Ответ</summary>
Квота остановит push при переполнении (деплой встанет), retention молча удаляет старое — и без always-keep может удалить образ, на который указывают прод-манифесты/rollback. Пиновать релизные теги — страховка от удаления работающего релиза.
</details>

**В5. Чем pull-through репликация Harbor принципиально лучше прямого `imagePullSecrets` на docker.io для кластера из 50 нод?**

<details><summary>Ответ</summary>
Один канал наружу с кэшем: rate-limit'ы Docker Hub не задеваются повторными pull'ами (кэш отдаёт локально), единая точка контроля (скан/подписи/аудит), быстрее по сети. Pull-secret на нодах лишь аутентифицирует, но не решает ни лимиты, ни безопасность.
</details>

---

### 2.6 Практика — 3 задания

#### Задание 1: Harbor в kind + pull-through от Docker Hub

**Условие:** поднять Harbor локально, завернуть `nginx` через proxy-проект, запустить под с образом из Harbor.

**Шаг 1** — установка:
```bash
helm install harbor harbor/harbor -n harbor --create-namespace \
  --set expose.type=nodePort --set expose.tls.enabled=false \
  --set externalURL=http://127.0.0.1:30002 \
  --set harborAdminPassword=Harbor12345 --set persistence.enabled=false
kubectl -n harbor wait --for=condition=ready pod -l app=harbor --timeout=600s
# UI: http://127.0.0.1:30002 (admin / Harbor12345)  [только для лабы!]
```

**Шаг 2** — в UI: `Registries → New Endpoint` (docker.io) → `Replication → New Rule` (mode: Pull-based, source `library/nginx`, destination project `dockerhub-proxy`, trigger: on demand) → `Replicate`.

**Шаг 3** — потребление из кластера:
```bash
kubectl run nginx-proxy --image=127.0.0.1:30002/dockerhub-proxy/library/nginx:1.27
kubectl get pod nginx-proxy    # Running; в Harbor → project dockerhub-proxy → Repositories: nginx ✅
```

**Проверь себя:** повторный `kubectl delete/run` тянет образ из кэша мгновенно; в UI у репозитория nginx появился тег 1.27 с результатом Trivy-скана.

**Разбор:** pull-based репликация = «ленивое зеркало»: образ появляется в Harbor при первом запросе. В проде то же самое, но с TLS и robot-аккаунтами вместо admin.

#### Задание 2: Robot account для CI + imagePullSecret через ESO

**Условие:** CI пушит в проект `shop`, кластер только читает; токены не должны лежать в переменных CI вечно.

**Шаг 1** — в Harbor: проект `shop → Robot Accounts → New`: имя `ci`, permissions: push+pull, **expiry 90 дней**; второй `cluster-pull`: pull-only, expiry 365.

**Шаг 2** — push из CI:
```bash
docker login harbor.corp.io -u 'robot$shop+ci' -p "$HARBOR_TOKEN"
docker push harbor.corp.io/shop/app:$CI_COMMIT_SHA
```

**Шаг 3** — pull-секрет для кластера через ExternalSecret (Vault → Secret `regcred`):
```bash
kubectl create secret docker-registry regcred -n shop \
  --docker-server=harbor.corp.io \
  --docker-username='robot$shop+cluster-pull' \
  --docker-password="$TOKEN" --dry-run=client -o yaml | kubectl apply -f -
kubectl patch sa default -n shop -p '{"imagePullSecrets":[{"name":"regcred"}]}'
```

**Проверь себя:** `kubectl run test --image=harbor.corp.io/shop/app:$SHA` → Running; попытка push под cluster-pull токеном → `denied` (pull-only работает).

**Разбор:** разделение push/pull-привилегий — базовая гигиена supply chain; expiry + ESO (20.3) закрывают сценарий «пятничного» протухания токена из В1.

#### Задание 3: Renovate с защитой от шторма

**Условие:** онбординг Renovate на репо с 30 зависимостями так, чтобы: patch/minor — пачкой с automerge; major — отдельные PR; docker-образы — с pin digest; не более 5 PR одновременно.

**Шаг 1** — `renovate.json` из раздела 2.2 (скопируйте целиком).

**Шаг 2** — dry-run локально (self-hosted образ):
```bash
docker run -v $PWD:/repo -e RENOVATE_TOKEN=$GH_TOKEN \
  renovate/renovate:latest --platform=local --dry-run=full 2>&1 | grep -E "branch|PR" | head -20
# Ожидание: список веток dependency-* с типами update (patch/minor/major)
```

**Шаг 3** — включите на репо, проверьте первую волну:
```bash
gh pr list --label "renovate" --limit 10
# ≤ 5 открытых; patch/minor в одной ветке non-breaking deps; major — отдельные с label major-update
```

**Проверь себя:** сломайте тест в репо → automerge-PR Renovate не смержится (checks красные) и останется открытым с комментарием о неудачном CI.

**Разбор:** `prConcurrentLimit` — главный предохранитель онбординга; `platformAutomerge` использует нативный GitHub/GitLab automerge (быстрее); `pinDigests` для docker даёт воспроизводимость и осмысленные digest-обновления.

---

*Далее: [Сводный блок Части 1 — 40 вопросов и 10 задач](00-senior-stack-summary.md)*
