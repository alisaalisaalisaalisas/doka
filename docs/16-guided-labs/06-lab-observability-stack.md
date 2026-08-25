# 📊 Lab 06: Стек мониторинга — Prometheus, Grafana, Loki, алерты

> **Время:** 2 часа | **Уровень:** Middle | **Нужно:** kind-кластер (см. Lab 03), helm
> **Результат:** полный observability стек + дашборд + алерт, пришедший вам в Telegram.

```bash
curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
kind create cluster --name obs
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts && helm repo update
```
---

!!! tip "Интерактивная версия"
    Эту лабу можно прогнать в симуляторе прямо на сайте — с автопроверкой шагов: [Песочница → сценарий «Lab 06»](../21-playground/playground.html?scenario=lab06). Реальные руки — по шагам ниже.

## 🧪 Часть 1: kube-prometheus-stack (25 мин)

```bash
helm install kps prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace \
  -f - <<'EOF'
grafana:
  adminPassword: admin123
  service: { type: NodePort }        # доступ снаружи для лабы
  sidecar: { dashboards: { enabled: true } }
prometheus:
  prometheusSpec:
    retention: 2d
    resources: { requests: { cpu: 100m, memory: 512Mi } }
alertmanager:
  alertmanagerSpec: { retention: 24h }
EOF

kubectl -n monitoring rollout status deploy/kps-grafana --timeout=180s

# Порт-форвард Grafana (или используйте NodePort)
kubectl -n monitoring port-forward svc/kps-grafana 3000:80 &
# http://localhost:3000  логин admin / admin123

# Уже есть готовые дашборды: Kubernetes/Compute Resources/Namespace...
```

---

## 🧪 Часть 2: Демо-приложение с метриками (15 мин)

[podinfo](https://github.com/stefanprodan/podinfo) — идеальное демо: метрики, health, хаос-эндпоинты.

```bash
helm repo add podinfo https://stefanprodan.github.io/podinfo
helm install demo podinfo/podinfo -n default \
  --set replicaCount=2 --set metrics.enabled=true

# Podinfo уже аннотирован для scrape:
kubectl get pod -l app.kubernetes.io/name=podinfo -o jsonpath='{.items[0].metadata.annotations}' | jq

# Проверяем в Prometheus:
kubectl -n monitoring port-forward svc/kps-kube-prometheus-stack-prometheus 9090:9090 &
# Откройте http://localhost:9090/targets — цель podinfo UP ✅
```

---

## 🧪 Часть 3: PromQL руками (20 мин)

Выполняйте в Prometheus UI (Graph):

```promql
# RPS приложения
sum(rate(http_requests_total{job="podinfo"}[1m])) by (status)

# p99 латентность
histogram_quantile(0.99,
  sum(rate(http_requests_duration_seconds_bucket[5m])) by (le))

# Память подов vs лимит (в процентах)
max(container_memory_working_set_bytes{namespace="default"}
  / on(pod) kube_pod_container_resource_limits{resource="memory"} * 100) by (pod)

# Перезапуски за час
increase(kube_pod_container_status_restarts_total[1h]) > 0
```

Нагрузите приложение и посмотрите графики:

```bash
POD=$(kubectl get pod -l app.kubernetes.io/name=podinfo -o name | head -1)
kubectl exec $POD -- /app/podinfo load-test --duration=30s --qps=50 2>/dev/null || \
  for i in $(seq 1 200); do curl -s $(kubectl get pod $POD -o jsonpath='{.status.podIP}'):9898/delay/1 >/dev/null; done
```

---

## 🧪 Часть 4: Свой алерт → Alertmanager → Telegram (30 мин)

```bash
cat > alerts.yaml <<'EOF'
groups:
  - name: demo
    rules:
      - alert: PodInfoHighErrorRate
        expr: |
          sum(rate(http_requests_total{job="podinfo", status=~"5.."}[2m]))
            / clamp_min(sum(rate(http_requests_total{job="podinfo"}[2m])), 0.001) > 0.05
        for: 1m
        labels: { severity: warning }
        annotations:
          summary: "Podinfo отдаёт >5% ошибок"
          description: "Ошибка rate={{ $value | humanizePercentage }}. Runbook: см. docs!"
EOF

kubectl create secret generic additional-alert-rules \
  -n monitoring --from-file=alerts.yaml
helm upgrade kps prometheus-community/kube-prometheus-stack -n monitoring \
  --reuse-values \
  --set 'prometheus.prometheusSpec.additionalScrapeConfigs[0].enabled=false' \
  --set 'prometheus.additionalPrometheusRulesMap.alerts.secretName=additional-alert-rules' 2>/dev/null || \
kubectl apply -f - <<'EOF'
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: demo-alerts
  namespace: monitoring
  labels: { release: kps }     # label обязателен для discovery!
spec:
  groups:
    - name: demo
      rules:
        - alert: PodInfoHighErrorRate
          expr: sum(rate(http_requests_total{job=~".*podinfo.*", code=~"5.."}[2m])) > 0
          for: 1m
          labels: { severity: warning }
          annotations:
            summary: "5xx на podinfo: {{ $value }} rps"
EOF

# Генерируем ошибки:
POD_IP=$(kubectl get pod -l app.kubernetes.io/name=podinfo -o jsonpath='{.items[0].status.podIP}')
while true; do curl -s http://$POD_IP:9898/status/500 >/dev/null; sleep 0.3; done &
# Через ~2 минуты: http://localhost:9090/alerts — алерт FIRING 🔥
# Alertmanager UI: kubectl -n monitoring port-forward svc/kps-alertmanager 9093:9093 &
```

**Доставим в Telegram:**

```bash
# Создайте бота у @BotFather, узнайте chat_id у @userinfobot
helm upgrade kps prometheus-community/kube-prometheus-stack -n monitoring --reuse-values \
  --set alertmanager.config.global.telegram_api_url=https://api.telegram.org \
  --set alertmanager.config.route.group_by='[alertname]' \
  2>/dev/null || cat > am-tg.yaml <<EOF
alertmanagerConfig:
  global:
    resolve_timeout: 5m
  route:
    receiver: telegram
    group_wait: 10s
  receivers:
    - name: telegram
      telegram_configs:
        - bot_token: "<ВАШ_ТОКЕН>"
          chat_id: <ВАШ_CHAT_ID>
          send_resolved: true
EOF
kill %1 %2   # остановить генератор ошибок и порт-форварды
```

---

## 🧪 Часть 5: Логи — Loki + Promtail/Alloy (20 мин)

```bash
helm install loki grafana/loki-distributed -n monitoring --reuse-values 2>/dev/null || \
helm install loki grafana/loki -n monitoring \
  --set singleBinary.replicas=1 --set deploymentMode=SingleBinary

helm install alloy grafana/alloy -n monitoring \
  --set controller.type=daemonset \
  --set alloy.loki.source.kubernetes.enabled=true \
  --set alloy.loki.write.endpoint=http://loki.monitoring.svc:3100

# В Grafana: Connections -> Data sources -> Add Loki -> http://loki.monitoring.svc:3100

# LogQL: ошибки из всех подов за 15 минут
# {namespace="default"} |= "error" | json
```

---

## 🧹 Cleanup

```bash
helm uninstall kps loki alloy demo -n monitoring 2>/dev/null; kubectl delete ns monitoring
kind delete cluster --name obs
pkill -f "port-forward" 2>/dev/null
```

## ✅ Чек-лист

- [ ] Написал 4 PromQL запроса без копипасты и понял каждый
- [ ] Алерт прошёл путь: правило → Prometheus → AM → Telegram
- [ ] Знаю зачем label `release` на PrometheusRule
- [ ] Могу найти логи пода в Grafana через Loki

**Что дальше:** [Lab 07 — GitOps ArgoCD](07-lab-gitops-argocd.md)
