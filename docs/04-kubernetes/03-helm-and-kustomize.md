# 📦 03. Управление пакетами: Helm и Kustomize

## ⚓ Helm: Менеджер пакетов для Kubernetes

Helm шаблонизирует манифесты с помощью синтаксиса Go Templates и отслеживает историю релизов (релиз хранится в Secret внутри кластера).

### 1. Структура Helm-чарта
```text
my-app/
├── Chart.yaml          # Метаданные чарта (имя, версия, версия приложения)
├── values.yaml         # Дефолтные значения переменных
├── templates/          # Шаблоны манифестов K8s
│   ├── _helpers.tpl    # Именованные функции и шаблоны
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
└── .helmignore
```

### 2. Пример шаблона `deployment.yaml` и `_helpers.tpl`

Файл `templates/_helpers.tpl`:
```gotemplate
{{/*
Генерация полного имени приложения
*/}}
{{- define "my-app.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end }}
```

Файл `templates/deployment.yaml`:
```gotemplate
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "my-app.fullname" . }}
  labels:
    app.kubernetes.io/name: {{ .Chart.Name }}
    app.kubernetes.io/instance: {{ .Release.Name }}
spec:
  replicas: {{ .Values.replicaCount | default 2 }}
  selector:
    matchLabels:
      app: {{ include "my-app.fullname" . }}
  template:
    metadata:
      labels:
        app: {{ include "my-app.fullname" . }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          ports:
            - containerPort: {{ .Values.service.port }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
```

### 3. Production команды Helm
```bash
# Проверка шаблонизации без обращения к кластеру (dry-run)
helm template my-release ./my-app -f values-prod.yaml

# Безопасный деплой с автооткатом при ошибках (--atomic)
helm upgrade --install my-release ./my-app \
  --namespace production \
  --create-namespace \
  -f values-prod.yaml \
  --atomic \
  --timeout 5m

# История релизов и ручной откат
helm history my-release -n production
helm rollback my-release 2 -n production
```

---

## 🧩 Kustomize: Декларативная модификация без шаблонов

Kustomize не использует шаблоны, а накладывает патчи поверх базовых манифестов (`Base/Overlay`).

```text
k8s/
├── base/
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   └── service.yaml
└── overlays/
    ├── staging/
    │   ├── kustomization.yaml
    │   └── replica_patch.yaml
    └── production/
        ├── kustomization.yaml
        └── resource_patch.yaml
```

Файл `overlays/production/kustomization.yaml`:
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

# Наследуем базовые манифесты
resources:
  - ../../base

# Меняем namespace для всех ресурсов
namespace: production

# Добавляем префикс/суффикс ко всем именам
namePrefix: prod-

# Переопределяем образ
images:
  - name: my-app
    newName: registry.company.com/my-app
    newTag: v2.1.0

# Накладываем патч на количество реплик
patches:
  - target:
      kind: Deployment
      name: my-app
    patch: |-
      - op: replace
        path: /spec/replicas
        value: 10
```

Сборка и применение:
```bash
kubectl apply -k overlays/production/
```

---

## 🔬 Deep Dive: Helm hooks и lookup; Kustomize патчи

### Helm: миграции БД перед деплоем новой версии

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ .Release.Name }}-migrate
  annotations:
    helm.sh/hook: pre-upgrade,pre-install
    helm.sh/hook-weight: "0"        # порядок относительно других hooks
    helm.sh/hook-delete-policy: before-hook-creation,hook-succeeded
spec:
  backoffLimit: 3
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migrate
          image: {{ .Values.appImage }}
          command: ["./migrate", "up"]
```

```bash
# Значения из живого кластера прямо в шаблоне (аккуратно!)
{{ $existing := lookup "v1" "Secret" .Release.Namespace "api-key" }}

helm template ./chart -f values-prod.yaml | kubectl diff -f -   # dry-run по-настоящему
helm rollback api 42 --wait --timeout 5m
helm secrets diff upgrade ...   # SOPS-зашифрованные values
```

### Kustomize: стратегия патчей

```yaml
patches:
  - path: replica-count.yaml       # strategic merge — по field name
    target: { kind: Deployment, name: api }
  - path: sidecar-container.yaml   # добавить контейнер без переписывания всего
patchesJson6902:                    # точечные операции (RFC6902)
  - target: { group: apps, version: v1, kind: Deployment, name: api }
    patch: |-
      - op: replace
        path: /spec/template/spec/serviceAccountName
        value: api-sa
```

!!! warning "Выбор"
    Helm — пакетный менеджер с релизами и откатами; Kustomize — оверлеи без шаблонов и состояния. Комбинация «Helm как база + Kustomize пост-рендер» легитимна: `--post-renderer`.

---

<!-- enriched:v1 -->

## 🧨 Типовые грабли Production

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| Pod OOMKill'ed при старте | Java/Go резервируют память ≠ `requests` | Настроить `-XX:MaxRAMPercentage`, `GOMEMLIMIT` |
| Rolling update «мигает» 502 | Нет PDB + readiness гонки | `PodDisruptionBudget` + `preStop sleep 5` |
| DNS timeout раз в N минут | conntrack race / NodeLocal DNSCache | Включить `NodeLocal DNSCache`, обновить ядро |
| Эвикции при низкой утилизации | `requests` задраны «с запасом» | VPA в режиме recommendation, перерасчет |

!!! note "Requests vs Limits"
    `requests` — это планировщик (гарантия), `limits` — троттлинг/OOM (потолок). CPU без limit = Burstable и обычно **лучше** для latency-чувствительных сервисов (нет throttling).

## 🧪 Hands-on Lab (15 минут)

```bash
# 1. Разверните kind-кластер и воспроизведите сценарий из таблицы
kind create cluster --config - <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
EOF
helm list -A && helm get values api -n prod --all && \
helm lint chart/ && kubectl kustomize overlays/prod | kubectl diff -f - || true
```

## ✅ Чек-лист зрелости темы

- [ ] Все Deployment имеют `requests`/`limits`, liveness/readiness/startup пробы

    ??? tip "Как закрыть пункт"
        Requests по данным недели/VPA-рекомендаций; probes разделены по смыслу (liveness ≠ зависимость к БД); startup для медленного старта. Автопроверка: kube-score/Kyverno в CI блокирует деплой без проб.

- [ ] Настроен `PodDisruptionBudget` и `topologySpreadConstraints`

    ??? tip "Как закрыть пункт"
        PDB допускает ≥1 нарушение (minAvailable N-1, не N — иначе drain вечен). Spread по zones+nodes: реплики переживают отказ AZ. Тест: kubectl drain проходит без нарушения SLO ([04.9](09-k8s-cluster-operations.md)).

- [ ] Есть NetworkPolicy по умолчанию (default-deny) в каждом namespace

    ??? tip "Как закрыть пункт"
        Default-deny ingress+egress + явные allow (DNS первым делом!). Шаблон — [18.1](../18-templates/01-containers-and-k8s.md). Проверка: чужой под не достучался, легитимный клиент — достучался.

- [ ] RBAC минимально-привилегированный, ServiceAccount токены не монтируются лишний раз

    ??? tip "Как закрыть пункт"
        automountServiceAccountToken: false по умолчанию; роли перечисляют verbs/resources явно, без wildcards. Аудит: kubectl-who-can на критичные права; токены в подах только там, где реально нужен API.

- [ ] Проверяется совместимость манифестов с новой версией K8s (kubent/pluto)

    ??? tip "Как закрыть пункт"
        kubent/pluto в CI перед минорным апгрейдом; deprecated API — блокирующий warning. Список удалённых API целевой версии приложен к PR апгрейда ([04.9](09-k8s-cluster-operations.md)).

---

## 🧭 Что дальше

| Шаг | Материал |
| :--- | :--- |
| 🔬 Закрепить | [Lab 03: чарт приложения](../16-guided-labs/03-lab-kubernetes-kind-app.md) |
| 💪 Практика | [Шаблоны манифестов](../18-templates/01-containers-and-k8s.md) |

---

## ✅ Проверь себя

**В1. Порядок переопределения values в Helm (от слабого к сильному)?**
<details><summary>Ответ</summary>
Дефолты чарта (values.yaml) → values родителя → -f файлы по порядку → --set/--set-string. Для зависимостей: значения под ключом зависимости в родителе сильнее дефолтов дочернего чарта.
</details>

**В2. Что такое helm hooks и типичный пример?**
<details><summary>Ответ</summary>
Ресурсы с аннотацией helm.sh/hook выполняются вне основного порядка: pre-install/pre-upgrade/post-upgrade... Классика — Job pre-upgrade «миграция БД» перед обновлением Deployment; hook-delete-policy убирает джобу после успеха.
</details>

**В3. Kustomize: что кладём в base и overlays?**
<details><summary>Ответ</summary>
Base — общие манифесты + kustomization.yaml (resources). Overlay dev/prod патчит: images newTag, replicasCount, patches (strategic/json6902), configMapGenerator. kustomize build overlays/prod выдаёт итоговый YAML — diff между средами виден до apply.
</details>

**В4. helm upgrade --atomic против --wait?**
<details><summary>Ответ</summary>
--wait просто ждёт готовности ресурсов. --atomic = wait + автоматический rollback к предыдущему release при неудаче или таймауте. Для продовых пайплайнов — --atomic либо Argo Rollouts поверх GitOps.
</details>

**В5. Как безопасно посмотреть, что изменит helm upgrade?**
<details><summary>Ответ</summary>
helm diff upgrade (плагин) — манифест-diff против живого релиза; helm template | kubectl diff -f -; dry-run даёт рендер, но не сравнение с кластером. В CI diff обязателен перед apply.
</details>
