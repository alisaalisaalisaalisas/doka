# 🚦 21. Progressive Delivery: Flagger, FluxCD и Canary-релизы с Istio

## 🧬 Концепция Progressive Delivery

**Progressive Delivery** — это эволюция Continuous Delivery, объединяющая выкатку новых версий приложений с непрерывным анализом телеметрии (Prometheus / Datadog) и постепенным переключением пользовательского трафика (Canary, Blue/Green, A/B).

**Flagger** — это Kubernetes-оператор от создателей Flux, который автоматизирует процесс канареечных релизов, взаимодействуя с Service Mesh (Istio, Linkerd) или Ingress-контроллерами (Nginx, Contour, Envoy Gateway).

```mermaid
flowchart TD
    subgraph FluxSync["1. Flux Reconciliation"]
        GitCommit["Git Push: App v2"] --> FluxApply["Flux updates Deployment spec"]
    end

    subgraph FlaggerInit["2. Flagger Control Loop"]
        FluxApply --> FlaggerDetect["Flagger intercepts Deployment update"]
        FlaggerDetect --> ScaleCanary["Scales app-canary Pods"]
    end

    subgraph TrafficAnalysis["3. Canary Traffic Shifting & Metrics Loop"]
        ScaleCanary --> Weight5["Route 5% traffic to Canary"]
        Weight5 --> CheckMetrics{"Prometheus Check: Error Rate < 1% & Latency P99 < 200ms"}
        CheckMetrics -->|Success| Weight15["Route 15% -> 30% -> 50%"]
        Weight15 --> CheckMetrics
        CheckMetrics -->|Failure (3 retries)| Rollback["Auto Rollback: Route 0% to Canary, Alert SRE"]
    end

    subgraph Promotion["4. Final Promotion"]
        Weight15 -->|100% Analysis Succeeded| Promote["Copy v2 image to Primary Deployment"]
        Promote --> ScaleDown["Scale Canary Pods to 0"]
        ScaleDown --> Complete["Status: Succeeded"]
    end
```

---

## 📑 Production-манифест `Canary` (Flagger + Istio)

```yaml
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: payment-service
  namespace: payments
spec:
  # 1. Ссылка на целевой Deployment, управляемый Flux
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: payment-service

  # 2. Настройки сервисов (Flagger автоматически создаст payment-service-primary и payment-service-canary)
  service:
    port: 8080
    targetPort: 8080
    gateways:
      - mesh
      - istio-system/public-gateway
    hosts:
      - payment.company.com
    trafficPolicy:
      tls:
        mode: DISABLE

  # 3. Расписание и алгоритм канареечного анализа
  analysis:
    interval: 1m                      # Частота проверки метрик
    threshold: 5                      # Допустимое количество ошибок до инициализации отката
    maxWeight: 50                     # Максимальный процент трафика на канарейку до промоушена
    stepWeight: 10                    # Шаг инкремента трафика (10% -> 20% -> 30% -> 40% -> 50%)

    # Метрики для оценки здоровья
    metrics:
      - name: request-success-rate
        thresholdRange:
          min: 99                     # Не менее 99% успешных HTTP ответов (не 5xx)
        interval: 1m
      - name: request-duration
        thresholdRange:
          max: 500                    # Задержка P99 не более 500ms
        interval: 1m
        templateRef:
          name: istio-latency-p99
          namespace: flux-system

    # Вебхуки: Генерация синтетической нагрузки во время анализа
    webhooks:
      - name: load-test
        url: http://flagger-loadtester.flux-system/
        timeout: 5s
        metadata:
          cmd: "hey -z 1m -q 10 -c 2 http://payment-service-canary.payments:8080/healthz"

      - name: slack-alert
        type: post-rollout
        url: http://flagger-notifications.flux-system/slack
```

---

## 📊 Кастомный MetricTemplate для Prometheus

```yaml
apiVersion: flagger.app/v1beta1
kind: MetricTemplate
metadata:
  name: istio-latency-p99
  namespace: flux-system
spec:
  provider:
    type: prometheus
    address: http://prometheus-k8s.monitoring:9090
  query: |
    histogram_quantile(0.99,
      sum(
        rate(istio_request_duration_milliseconds_bucket{
          reporter="destination",
          destination_workload_namespace="{{ namespace }}",
          destination_workload=~"{{ target }}-canary"
        }[{{ interval }}])
      ) by (le)
    )
```

---

## 🛠️ CLI шпаргалка: Мониторинг Canary-релизов

```bash
# 1. Просмотр текущего веса трафика и статуса всех Canary ресурсов
kubectl get canaries -A -w

# 2. Инспекция фазы прогрессивной доставки
kubectl describe canary payment-service -n payments

# 3. Просмотр логов Flagger в процессе сдвига весов
kubectl logs -n flux-system -l app.kubernetes.io/name=flagger -f

# 4. Ручная приостановка канареечного анализа
kubectl annotate canary payment-service -n payments flagger.app/manual-gate=pause --overwrite
# Ручной аппрув для завершения промоушена
kubectl annotate canary payment-service -n payments flagger.app/manual-gate=approve --overwrite
```

---

## 🚨 Break-Fix: Разбор инцидентов Progressive Delivery

### Инцидент 1: Canary зависает на 0% трафика (`Halt: no traffic detected`)

**Симптом:**
Выкатка останавливается с ошибкой: `Canary failed: metric request-success-rate has no data`.

**Первопричина:**
На сервис не поступает реальный пользовательский трафик в dev/staging среде, поэтому Prometheus возвращает `NaN` / `Empty Result`, что Flagger трактует как сбой.

**Решение:**
1. Использовать `webhooks` типа `loadtester` для генерации синтетических запросов (см. манифест выше).
2. Настроить Prometheus query с обработкой пустых значений (`or on() vector(100)`):
```promql
sum(rate(istio_requests_total{response_code!~"5.*"}[1m])) / sum(rate(istio_requests_total[1m])) * 100 or on() vector(100)
```

---

### Инцидент 2: Flagger заблокировал обновление из-за рассинхронизации ревизий

**Симптом:**
`Deployment` обновлен, но Flagger не начинает канареечный процесс и пишет: `Waiting for primary deployment to be healthy`.

**Решение:**
1. Проверить состояние `payment-service-primary` (основного деплоймента):
```bash
kubectl rollout status deployment/payment-service-primary -n payments
```
2. Если первичный деплоймент поврежден, выполнить сброс статуса Canary CRD:
```bash
kubectl patch canary payment-service -n payments --type=merge -p '{"status":{"phase":"Initialized"}}'
```
