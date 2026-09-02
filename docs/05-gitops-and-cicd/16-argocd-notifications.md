# 📢 16. ArgoCD Notifications: Триггеры, Шаблоны и Интеграция с Telegram/Slack

## 🔔 Архитектура подсистемы уведомлений

`argocd-notifications-controller` непрерывно отслеживает поток событий ресурсов `Application`. При изменении статуса синхронизации или здоровья приложения контроллер оценивает набор условий (**Triggers**), форматирует сообщение с помощью шаблонизатора (**Templates**) и отправляет оповещение через настроенные каналы доставки (**Services/Destinations**).

```mermaid
flowchart TD
    subgraph EventStream["ArgoCD Event Stream"]
        AppStatus["Application Status Change (Degraded / SyncFailed / Deployed)"]
    end

    subgraph NotifController["argocd-notifications-controller"]
        TriggerEngine["1. Triggers Evaluation (app.status.health.status == 'Degraded')"]
        TemplateEngine["2. Template Renderer (Go template + App metadata)"]
        ServiceDispatcher["3. Notification Dispatcher"]
    end

    subgraph Targets["Каналы доставки"]
        Slack["Slack Channel (#prod-alerts)"]
        Telegram["Telegram Chat (@devops_sre_duty)"]
        Webhook["PagerDuty / Opsgenie Webhook API"]
        Email["SMTP Server (Email to Team)"]
    end

    EventStream --> TriggerEngine
    TriggerEngine -->|Condition Matched| TemplateEngine
    TemplateEngine --> ServiceDispatcher
    ServiceDispatcher --> Slack
    ServiceDispatcher --> Telegram
    ServiceDispatcher --> Webhook
    ServiceDispatcher --> Email
```

---

## ⚙️ Конфигурация: `argocd-notifications-cm`

Главный ConfigMap для настройки шаблонов, триггеров и сервисов уведомлений.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-notifications-cm
  namespace: argocd
data:
  # 1. Определение сервисов отправки (Services)
  service.telegram: |
    token: $telegram-token
    parseMode: HTML

  service.slack: |
    token: $slack-token
    apiURL: https://slack.com/api

  service.webhook.pagerduty: |
    url: https://events.pagerduty.com/v2/enqueue
    headers:
      - name: Content-Type
        value: application/json

  # 2. Определение триггеров (Triggers)
  trigger.on-sync-failed: |
    - description: Application sync failed
      send: [app-sync-failed]
      when: app.status.operationState != nil and app.status.operationState.phase in ['Failed', 'Error']

  trigger.on-health-degraded: |
    - description: Application health state is Degraded
      send: [app-health-degraded]
      when: app.status.health.status == 'Degraded'

  trigger.on-deployed: |
    - description: Application successfully synced and healthy
      send: [app-deployed]
      when: app.status.operationState != nil and app.status.operationState.phase == 'Succeeded' and app.status.health.status == 'Healthy'
      oncePer: app.status.operationState.syncResult.revision

  # 3. Шаблоны сообщений (Templates)
  template.app-health-degraded: |
    telegram:
      message: |
        🚨 <b>ArgoCD Alert: Application Degraded</b>
        <b>App:</b> <code>{{.app.metadata.name}}</code>
        <b>Project:</b> {{.app.spec.project}}
        <b>Cluster:</b> {{.app.spec.destination.server}}
        <b>Status:</b> ❌ Degraded
        <b>Message:</b> {{.app.status.health.message}}
        <a href="{{.context.argocdUrl}}/applications/{{.app.metadata.name}}">Open in ArgoCD</a>
    slack:
      attachments: |
        [{
          "title": "🚨 Application {{.app.metadata.name}} is Degraded",
          "title_link": "{{.context.argocdUrl}}/applications/{{.app.metadata.name}}",
          "color": "#E01E5A",
          "fields": [
            {"title": "Project", "value": "{{.app.spec.project}}", "short": true},
            {"title": "Sync Status", "value": "{{.app.status.sync.status}}", "short": true}
          ]
        }]

  template.app-deployed: |
    telegram:
      message: |
        🚀 <b>ArgoCD: Deploy Succeeded</b>
        <b>App:</b> <code>{{.app.metadata.name}}</code>
        <b>Commit:</b> <code>{{.app.status.sync.revision | trunc 7}}</code>
        <b>Author:</b> {{.app.status.operationState.syncResult.revision}}
```

---

## 🔒 Секреты для провайдеров: `argocd-notifications-secret`

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: argocd-notifications-secret
  namespace: argocd
type: Opaque
stringData:
  telegram-token: "123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
  slack-token: "xoxb-1234567890-1234567890123-xxxxxxxxxxxx"
```

---

## 🎯 Подписка на уведомления в манифесте `Application`

Подписка на триггеры оформляется через аннотации:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: billing-service
  namespace: argocd
  annotations:
    # Отправлять алерты о сбоях в Telegram чат команды SRE (-100123456789)
    notifications.argoproj.io/subscribe.on-health-degraded.telegram: "-100123456789"
    notifications.argoproj.io/subscribe.on-sync-failed.telegram: "-100123456789"

    # Отправлять успешные релизы в Slack канал #deploy-log
    notifications.argoproj.io/subscribe.on-deployed.slack: "deploy-log"
spec:
  project: default
  source:
    repoURL: https://github.com/company/billing.git
    targetRevision: main
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: billing
```

---

## 🛠️ CLI шпаргалка: Тестирование уведомлений

```bash
# 1. Проверка шаблона уведомления без реальной отправки
kubectl exec -it -n argocd deploy/argocd-notifications-controller -- \
  argocd-notifications template notify app-health-degraded billing-service

# 2. Тестовая отправка уведомления в Telegram через CLI
kubectl exec -it -n argocd deploy/argocd-notifications-controller -- \
  argocd-notifications template notify app-health-degraded billing-service \
  --recipient telegram:-100123456789

# 3. Просмотр логов контроллера уведомлений на наличие HTTP ошибок
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-notifications-controller -f
```

---

## 🚨 Break-Fix: Разбор частых проблем

### Проблема 1: Шторм уведомлений (Notification Storm) при перезагрузке кластера

**Симптом:**
Во время плановых работ или рестарта нод контроллер отправляет сотни повторяющихся сообщений в секунду, приводя к блокировке бота Telegram/Slack по Rate Limit (`HTTP 429 Too Many Requests`).

**Решение:**
1. Использовать поле `oncePer` в триггере (отправка только один раз на конкретную ревизию).
2. Задать глобальный Rate Limit и дедупликацию в `argocd-notifications-cm`:
```yaml
data:
  context: |
    argocdUrl: https://argocd.company.com
  throttle:
    on-health-degraded: 10m           # Не чаще одного алерта в 10 минут на одно приложение
```

---

### Проблема 2: Падение шаблонизатора (Panic / Null Pointer)

**Симптом:**
```text
Failed to notify: failed to execute template app-deployed: template: :3:42: nil pointer evaluating *v1alpha1.OperationState
```

**Решение:**
В шаблонах Go необходимо всегда проверять поля на `nil` перед обращением к вложенным свойствам:
```go
{{ if .app.status.operationState }}
  {{ if .app.status.operationState.syncResult }}
    Revision: {{ .app.status.operationState.syncResult.revision }}
  {{ end }}
{{ end }}
```
