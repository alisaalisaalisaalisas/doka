# 📊 Шаблоны: Observability, алерты, веб-серверы

## Prometheus rules: готовый набор для веб-сервиса

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: web-service-alerts
  labels: { release: kps }          # должен совпадать с ruleSelector оператора!
spec:
  groups:
    # ===== Availability (SLO 99.9% = бюджет 43 мин/мес) =====
    - name: slo-burn-rate
      rules:
        - alert: SLOBurnFast        # page немедленно
          expr: |
            (
              sum(rate(http_requests_total{job="api",code=~"5.."}[1h]))
                / sum(rate(http_requests_total{job="api"}[1h])) > 0.0144
            )
            and
            (
              sum(rate(http_requests_total{job="api",code=~"5.."}[5m]))
                / sum(rate(http_requests_total{job="api"}[5m])) > 0.0144
            )
          for: 2m
          labels: { severity: critical }
          annotations:
            summary: "Быстрое сгорание error budget (14.4x)"
            runbook_url: https://wiki.internal/runbooks/slo-burn

        - alert: SLOBurnSlow
          expr: |
            sum(rate(http_requests_total{job="api",code=~"5.."}[6h]))
              / sum(rate(http_requests_total{job="api"}[6h])) > 0.006
          for: 30m
          labels: { severity: warning }

    # ===== Golden signals =====
    - name: golden
      rules:
        - alert: HighLatencyP99
          expr: |
            histogram_quantile(0.99,
              sum(rate(http_request_duration_seconds_bucket{job="api"}[5m])) by (le)) > 1.5
          for: 10m
          labels: { severity: warning }

        - alert: PodCrashLooping
          expr: increase(kube_pod_container_status_restarts_total[30m]) > 3
          labels: { severity: critical }
          annotations: { summary: "{{ $labels.namespace }}/{{ $labels.pod }} рестартует" }

        - alert: MemoryNearLimit
          expr: |
            container_memory_working_set_bytes{container!=""}
              / on(namespace,pod,container)
            kube_pod_container_resource_limits{resource="memory"} > 0.9
          for: 10m
          labels: { severity: warning }

    # ===== Watchdog — всегда горит! =====
    - name: meta
      rules:
        - alert: AlwaysFiringWatchdog
          expr: vector(1)
          labels: { severity: none }
          annotations:
            summary: "Это watchdog. Если он ПРОПАЛ из внешнего монитора — Prometheus мертв"
```

## Alertmanager: полный production-конфиг

```yaml
global:
  resolve_timeout: 5m

route:
  receiver: telegram-warnings
  group_by: [alertname, namespace]
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 12h
  routes:
    - matchers: [severity="critical"]
      receiver: oncall-escalation
      continue: true                    # и в телегу тоже!
      group_wait: 0s                    # крит — сразу
    - matchers: [severity="none"]       # watchdog наружу, не людям
      receiver: deadman-switch

inhibit_rules:
  # Нода умерла => глушим её дочерние предупреждения
  - source_matchers: [alertname="NodeNotReady", severity="critical"]
    target_matchers: [severity=~"warning|info"]
    equal: [node]
  # Весь namespace down => глушим отдельные поды
  - source_matchers: [alertname="NamespaceUnavailable"]
    target_matchers: [severity="warning"]
    equal: [namespace]

receivers:
  - name: telegram-warnings
    telegram_configs:
      - bot_token_file: /etc/alertmanager/secrets/tg-token
        chat_id: -1001234567890
        send_resolved: true
        message: |
          {{ if eq .Status "firing" }}🔴{{ else }}🟢{{ end }}
          <b>{{ .CommonLabels.alertname }}</b>
          {{ .CommonAnnotations.summary }}
          <i>{{ range .Alerts }}{{ .Labels.instance }} {{ end }}</i>

  - name: oncall-escalation
    webhook_configs:
      - url: http://alerta-gateway:8080/webhook   # или Opsgenie/PagerDuty
        max_alerts: 0

  - name: deadman-switch
    webhook_configs:
      - url: https://healthchecks.io/ping/<uuid>   # внешний сервис орет при пропаже сигнала!
```

---

## Grafana Alloy: сбор метрик+логов одной декларацией

```river
// === Kubernetes discovery ===
discovery.kubernetes "pods" {
  role = "pod"
}

discovery.relabel "pods_metrics" {
  targets = discovery.kubernetes.pods.targets
  rule {
    source_labels = ["__meta_kubernetes_pod_annotation_prometheus_io_scrape"]
    action        = "keep"
    regex         = "true"
  }
  rule {
    source_labels = ["__meta_kubernetes_namespace"]
    target_label  = "namespace"
  }
}

prometheus.scrape "pods" {
  targets    = discovery.relabel.pods_metrics.output
  forward_to = [prometheus.remote_write.mimir.receiver]
}

prometheus.remote_write "mimir" {
  endpoint { url = "http://mimir.monitoring.svc/api/v1/push" }
}

// === Логи ===
loki.source.kubernetes "pods" {
  targets    = discovery.kubernetes.pods.targets
  forward_to = [loki.process.parse.receiver]
}

loki.process "parse" {
  stage.json {
    expressions = { level = "level", trace_id = "trace_id" }
  }
  stage.labels { values = { level = "" } }     // level в лейблы (низкая кардинальность ок)
  forward_to = [loki.write.loki.receiver]
}

loki.write "loki" {
  endpoint { url = "http://loki.monitoring.svc:3100/loki/api/v1/push" }
}
```

---

## Nginx: hardened reverse proxy

```nginx
# /etc/nginx/conf.d/app.conf
limit_req_zone $binary_remote_addr zone=api:20m rate=100r/s;
limit_conn_zone $binary_remote_addr zone=perip:10m;

upstream api_backend {
    least_conn;
    server api-1.internal:8080 max_fails=3 fail_timeout=15s;
    server api-2.internal:8080 backup;
    keepalive 128;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    # TLS
    ssl_certificate     /etc/ssl/certs/example.com.fullchain.pem;
    ssl_certificate_key /etc/ssl/private/example.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;           # TLS1.3 сам выбирает
    ssl_session_cache shared:SSL:50m;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Content-Type-Options nosniff always;
    server_tokens off;

    # Лимиты
    limit_req zone=api burst=200 nodelay;
    limit_conn perip 50;
    client_max_body_size 10m;

    location / {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_next_upstream error timeout http_502;   # retry на бэкап-сервер
    }

    location = /healthz {
        access_log off;                          # не мусорить логи health-check'ами
        return 200 "ok";
    }
}
```

## systemd unit для nginx-like сервиса: hardening чек-лист

```ini
[Service]
User=app
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
PrivateDevices=true
ProtectKernelTunables=true
ProtectControlGroups=true
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX
RestrictNamespaces=true
LockPersonality=true
MemoryDenyWriteExecute=true
SystemCallArchitectures=native
SystemCallFilter=@system-service
CapabilityBoundingSet=
IPAddressAllow=10.0.0.0/8
IPAddressDeny=any
```

!!! note "Проверка hardening"
    `systemd-analyze security <unit>` показывает оценку от 0 до 10. Цель для сетевого демона: **< 4.0**. Каждая строка выше снижает оценку.
