# 🛡️ 20.1 Policy as Code: OPA/Rego и Kyverno

> Уровень: Middle→Senior. Цель: уметь проектировать admission-контроль, писать политики на Rego и YAML, отлаживать и не уронить кластер.

**Оглавление:** [2.1 Теория](#21-теория) · [2.2 Конфигурация](#22-конфигурация-и-синтаксис) · [2.3 Troubleshooting](#23-troubleshooting) · [2.4 Интеграция](#24-интеграция-со-стеком) · [2.5 Проверь себя](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

### 2.1 Теория

**Проблема:** RBAC отвечает на «кто может создавать поды», но не на «какой под можно создавать». Нужен контроль содержимого объектов: без `latest`, с лимитами, только из доверенного registry, с подписью.

**Механизм под капотом** — Admission Webhooks Kubernetes. Цепочка создания объекта:

```text
kubectl apply → API server: аутентификация → авторизация (RBAC)
  → MutatingAdmissionWebhook  (Kyverno mutate, Gatekeeper mutate)
  → схема объекта (validation)
  → ValidatingAdmissionWebhook (Kyverno validate, Gatekeeper)
  → etcd
```

Webhook — это HTTPS-эндпоинт, куда API server шлёт `AdmissionReview` (JSON объекта). Таймаут по умолчанию 10 секунд; `failurePolicy: Fail` означает — при недоступности webhook **создание объектов блокируется**.

**Два лагеря:**

| | **OPA / Gatekeeper** | **Kyverno** |
| :--- | :--- | :--- |
| Язык политик | Rego (Datalog-подобный) | YAML-паттерны |
| Порог входа | высокий (язык программирования) | низкий |
| Выразительность | любая логика, циклы, внешние данные | паттерны + JMESPath, ограниченная логика |
| Мутации | ограниченные | богатые (patches, overlays, generate) |
| Вне Kubernetes | OPA универсален: Envoy authz, Terraform (conftest), CI | только K8s |
| Тестирование | `gator verify`, `opa test` | `kyverno test` (файлы-кейсы) |
| Когда выбирать | сложные контекстные политики, мульти-платформенный policy engine | быстрая стандартизация K8s, self-service мутации, generate |

**Ключевые термины:** `ConstraintTemplate` (CRD, содержащий Rego) + `Constraint` (экземпляр с параметрами) у Gatekeeper; `ClusterPolicy`/`Policy` у Kyverno; `background scan` — периодическая проверка уже существующих ресурсов (admission ловит только новые); `enforcementAction: deny/dryrun/warn`.

!!! warning "Rego v0 vs v1"
    Rego v1 (2024) требует `if` в правилах и запрещает старый синтаксис. Gatekeeper/OPA разных версий поддерживают разное — **проверьте версию движка перед написанием политик** (`gatekeeper` ≥ 3.16 поддерживает v1-совместимый режим, `opa fmt --v0-v1` конвертирует).

---

### 2.2 Конфигурация и синтаксис

#### Kyverno: типовая production-политика

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-standards
  annotations:
    # Автогенерация правил для Deployment/StatefulSet/DaemonSet
    # (политики уровня Pod применяются и к шаблонам контроллеров)
    pod-policies.kyverno.io/autogen-controllers: Deployment,StatefulSet
spec:
  validationFailureAction: Enforce     # Audit = только репорты (для онбординга)
  background: true                     # скан существующих ресурсов
  rules:
    # 1) Обязательные лейблы
    - name: require-team-label
      match:
        any:
          - resources: { kinds: [Pod] }
      exclude:
        any:
          - resources:
              namespaces: [kube-system, kube-public, kyverno]   # ОБЯЗАТЕЛЬНО!
      validate:
        message: "Лейбл team обязателен: {{ request.object.metadata.labels | keys(@) }}"
        pattern:
          metadata:
            labels:
              team: "?*"

    # 2) Запрет latest + allowlist registry
    - name: validate-image
      match: { any: [{ resources: { kinds: [Pod] } }] }
      validate:
        message: "Только registry.corp, тег ≠ latest"
        pattern:
          spec:
            containers:
              - image: "registry.corp/*:!latest*"   # ! = негативный паттерн

    # 3) Мутация: подставить imagePullSecrets всем
    - name: add-pull-secret
      match: { any: [{ resources: { kinds: [Pod] } }] }
      mutate:
        patchStrategicMerge:
          spec:
            imagePullSecrets:
              - name: regcred        # добавится, если нет; не перезапишет существующие

    # 4) Отказ по условию (сложная логика через deny)
    - name: deny-privileged-in-prod
      match:
        any:
          - resources: { kinds: [Pod], namespaceSelector:
              { matchLabels: { tier: production } } }
      validate:
        deny:
          conditions:
            all:
              - key: "{{ request.object.spec.[]containers[].securityContext.privileged || `[]` }}"
                operator: AnyIn
                value: [true]
```

#### Gatekeeper: ConstraintTemplate + Constraint

```yaml
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequiredprobes
spec:
  crd:
    spec:
      names: { kind: K8sRequiredProbes }
      validation:
        openAPIV3Schema:
          type: object
          properties:
            probes: { type: array, items: { type: string } }
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequiredprobes

        violation[{"msg": msg}] {
          c := input.review.object.spec.containers[_]
          not has_probe(c)
          msg := sprintf("контейнер %v без probe", [c.name])
        }

        has_probe(c) {
          c.readinessProbe      # поле существует и не пустое
        }
---
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredProbes
metadata: { name: require-probes }
spec:
  enforcementAction: dryrun          # раскатка: dryrun → warn → deny
  match:
    kinds: [{ apiGroups: [""], kinds: ["Pod"] }]
    excludedNamespaces: [kube-system]
  parameters:
    probes: [readinessProbe, livenessProbe]
```

#### Тестирование политик ДО кластера

```bash
# Kyverno CLI: прогнать политику на манифесте
kyverno apply require-standards.yaml --resource test-pod.yaml

# Набор тест-кейсов (fail/success) в CI
kyverno test ./policy-tests/

# Gatekeeper без кластера: gator (unit-тесты в стиле go test)
gator verify ./policies/...
gator test -f pod.yaml constraints.yaml templates.yaml

# OPA standalone: eval любого JSON (не только K8s)
opa eval -d policy.rego -i input.json 'data.main.deny'
```

**Частые ошибки конфигурации:**

1. `failurePolicy: Ignore` в проде → при падении webhook'а **политики молча не работают** (fail-open). Для validating-политик — `Fail`; для самого Kyverno-контроллера вебхуки его собственных ресурсов исключают.
2. Нет исключений для `kube-system`/`kube-public`/system-компонентов → CNI/CoreDNS не могут обновиться, кластер ломается.
3. Политики на Pod без `autogen` → не применяются к Deployment (в кластер попадает шаблон Pod, а не Pod).
4. `validationFailureAction: Audit` навсегда → «у нас политики», а нарушений тысячи и никто не смотрит reports.
5. Тяжёлый Rego с внешними lookup на каждый запрос → латентность admission > 10s → таймауты создания объектов.

---

### 2.3 Troubleshooting

```bash
# === Kyverno ===
kubectl get clusterpolicies                       # статусы READY/AUTHORIZED
kubectl get policyreports -A                      # результаты background-скана
kubectl describe clusterpolicy require-standards  # почему правило не матчится

# Проверить, что webhook жив и какой failurePolicy
kubectl get validatingwebhookconfigurations \
  -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.webhooks[0].failurePolicy}{"\n"}{end}'

# Ручной dry-run: политика сработает? (объект в кластер НЕ пишется)
kubectl apply --dry-run=server -f test-pod.yaml

# === Gatekeeper ===
kubectl get constraints                           # violations в статусе
kubectl get k8srequiredprobes require-probes -o yaml | yq '.status.violations'
kubectl logs -n gatekeeper-system deploy/gatekeeper-controller-manager | grep -i reject
```

**Топ проблем:**

| Симптом | Причина | Действие |
| :--- | :--- | :--- |
| «Unable to connect to server» при **любом** apply | admission webhook мёртв при `failurePolicy: Fail` | аварийно: `kubectl delete validatingwebhookconfiguration <имя>` (или поднять контроллер) |
| Политика «есть», но не работает | Audit-режим / не матчится kinds / autogen | `--dry-run=server` + reports |
| Deployment не проходит, Pod проходит | нет autogen-аннотации | добавить аннотацию или kinds: [Deployment] |
| Латентность apply выросла | медленный Rego / мало реплик webhook | метрики webhook latency, масштабировать |
| Нарушений нет, хотя должны быть | background scan выключен | `background: true`, проверить `policyreports` |

---

### 2.4 Интеграция со стеком

- **CI (shift-left):** `conftest test manifests/ -p policy/` в GitLab CI — те же Rego-политики до кластера; Kyverno CLI в пайплайне аналогично.
- **GitOps (ArgoCD):** политики в том же репо; `argocd app diff` покажет, что отклонит admission; для Gatekeeper — `syncOptions: [ServerSideApply=true]` для больших CRD.
- **Supply chain:** `verifyImages` (Kyverno) / `policy.data.gatekeeper.sh` проверяют **cosign-подписи** образов на admission.
- **Мониторинг:** метрики Gatekeeper (`gatekeeper_violations`) и Kyverno (`kyverno_policy_results_total`) в Prometheus; алерт на рост violations после деплоя.

---

### 2.5 Проверь себя — 5 вопросов

**В1. Что произойдёт при полном отказе pod'ов Kyverno, если webhook `failurePolicy: Fail`?**

<details><summary>Ответ</summary>
Все операции create/update затронутых видов (обычно Pods и контроллеры) начнут отклоняться API server'ом с ошибкой webhook call failed. Существующие ресурсы продолжат работать, но новые задеплоить нельзя; аварийный фикс — удалить ValidatingWebhookConfiguration или восстановить Kyverno.
</details>

**В2. Найдите ошибку: политика Kyverno `match: kinds: [Pod]` должна запрещать `latest` в образах, но Deployment с `latest` проходит.**

<details><summary>Ответ</summary>
Admission видит Deployment, а не Pod — правило на kinds: [Pod] не матчится. Нужна аннотация autogen (по умолчанию включена для pod-policies) либо явный match на Deployment с проверкой spec.template.spec.containers.
</details>

**В3. Сценарий: включили Gatekeeper `enforcementAction: deny` сразу на весь кластер. Что сломается первым?**

<details><summary>Ответ</summary>
Системные компоненты: обновления CoreDNS/CNI/метрик-сервера в kube-system начнут отклоняться, если нет excludedNamespaces. Правильная раскатка — dryrun → warn → deny с исключениями системных namespace.
</details>

**В4. Чем background scan отличается от admission-проверки, и зачем нужны оба?**

<details><summary>Ответ</summary>
Admission ловит только create/update в момент запроса; background периодически проверяет уже существующие объекты (созданные до политики или мимо webhook'а) и пишет violations в reports. Вместе они дают и превенцию, и аудит текущего состояния.
</details>

**В5. Почему `failurePolicy: Ignore` считается опасным, но всё же используется? В каком случае он оправдан?**

<details><summary>Ответ</summary>
Ignore = fail-open: при недоступности webhook объекты создаются без проверки, т.е. контроль доступности важнее контроля политик. Оправдан для мутаций «удобства» (подстановка pull-secret), но не для security-валидации в проде.
</details>

---

### 2.6 Практика — 3 задания

#### Задание 1: Политика «гигиены» для production namespace

**Условие:** в namespace `prod` запрещены: тег `latest`, отсутствие requests/limits, запуск от root.

**Шаг 1** — создайте `policy-prod.yaml` с тремя правилами в одной ClusterPolicy (match по `namespaceSelector: matchLabels: {tier: production}`; повесьте лейбл `tier=production` на namespace).

**Шаг 2** — примените в режиме Audit: `kubectl apply -f policy-prod.yaml` и посмотрите нарушения:
```bash
kubectl get policyreports -n prod -o yaml | grep -A3 failures
```
Ожидание: в reports перечислены существующие поды-нарушители, но ничего не заблокировано.

**Шаг 3** — переключите на Enforce и проверьте отказ:
```bash
kubectl patch clusterpolicy prod-hygiene --type merge \
  -p '{"spec":{"validationFailureAction":"Enforce"}}'
kubectl -n prod run bad --image=nginx:latest   # → Error from server: forbidden ... policy
```

**Проверь себя:** `kubectl apply --dry-run=server` с валидным подом (`registry.corp/app:1.4`, с resources, `runAsNonRoot: true`) возвращает `created (server dry run)`.

**Разбор:** раскатка Audit→Enforce — стандарт: сначала измеряем blast radius репортами, потом включаем блокировку. `namespaceSelector` вместо `namespaces` не требует правки политики при добавлении новых prod-namespace'ей.

#### Задание 2: ConstraintTemplate «запрет hostPath» (Gatekeeper)

**Условие:** ни один под вне `kube-system` не должен монтировать `hostPath`.

**Шаг 1** — напишите `ConstraintTemplate` (пакет `k8snohostpath`), Rego-правило:

```rego
violation[{"msg": msg}] {
  volumes := input.review.object.spec.volumes[_]
  volumes.hostPath
  msg := sprintf("hostPath запрещён: %v", [volumes.name])
}
```

**Шаг 2** — создайте Constraint с `excludedNamespaces: [kube-system]`, `enforcementAction: deny`.

**Шаг 3** — проверка:
```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata: { name: evil, namespace: default }
spec:
  containers: [{ name: c, image: busybox, volumeMounts: [{ name: h, mountPath: /host }] }]
  volumes: [{ name: h, hostPath: { path: / } }]
EOF
# → admission webhook "..." denied the request: hostPath запрещён: h
```

**Проверь себя:** тот же под в `kube-system` создаётся; `kubectl get k8snohostpath -o yaml` содержит violation-запись для уже существующих нарушителей (background).

**Разбор:** `input.review.object` — это сам объект; обход `volumes[_]` — идиоматичный Datalog-цикл. Заметьте: правило ловит и `spec.volumes` пода; для контроллеров нужен match на Deployment + `spec.template.spec.volumes` (или autogen-эквивалент Gatekeeper — `match` на оба kinds с отдельными правилами).

#### Задание 3: Shift-left — conftest в CI

**Условие:** те же правила проверять в пайплайне до мерджа.

**Шаг 1** — `policy/deny_latest.rego`:

```rego
package main
deny[msg] {
  input.spec.containers[_].image == "nginx:latest"
  msg := "latest запрещён"
}
```
*(синтаксис v0; для Rego v1 — `deny contains msg if { ... }`)*

**Шаг 2** — шаг в `.gitlab-ci.yml`:
```yaml
policy:check:
  stage: test
  image: openpolicyagent/conftest:v0.56.0
  script: conftest test -p policy/ deploy/*.yaml
```

**Шаг 3** — сломайте манифест (`image: nginx:latest`) → job красный с сообщением политики.

**Проверь себя:** `conftest test deploy/ok.yaml -p policy/` → exit 0; `deploy/bad.yaml` → exit 1 + msg.

**Разбор:** shift-left дешевле admission: нарушение ловится в MR, а не в момент деплоя. Кластерные политики остаются как «последний рубеж» — CI можно обойти, admission нельзя.

---

*Следующая подтема: [20.2 Observability at Scale](02-observability-at-scale.md)*
