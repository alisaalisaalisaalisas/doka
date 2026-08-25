# 🌐 02. Веб-серверы (Nginx/Traefik), SSL/TLS и Облачная инфраструктура

## ⚡ Production Конфигурация Nginx (Reverse Proxy & Security)

Шаблон оптимизированного `/etc/nginx/conf.d/app.conf`:

```nginx
# Ограничение частоты запросов (Rate Limiting) для защиты от DDoS и брутфорса
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=20r/s;

upstream backend_cluster {
    server 10.0.1.10:8080 max_fails=3 fail_timeout=10s;
    server 10.0.1.11:8080 max_fails=3 fail_timeout=10s;
    keepalive 32; # Пул постоянных TCP соединений к бэкенду
}

# Редирект HTTP -> HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name api.company.com;
    return 301 https://$host$request_uri;
}

# HTTPS Сервер
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.company.com;

    # SSL / TLS Настройки (Mozilla Modern Guidelines)
    ssl_certificate /etc/letsencrypt/live/api.company.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.company.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    # Заголовки безопасности (Security Headers)
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Сжатие Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    location / {
        limit_req zone=api_limit burst=10 nodelay;

        proxy_pass http://backend_cluster;
        proxy_http_version 1.1;
        proxy_set_header Connection ""; # Необходимо для keepalive
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Таймауты
        proxy_connect_timeout 5s;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}
```

---

## 🔐 Автоматизация SSL-сертификатов: cert-manager в K8s

`cert-manager` автоматически получает и продлевает бесплатные сертификаты от **Let's Encrypt**:

```mermaid
graph LR
    Ingress["Ingress (TLS Secret Request)"] --> CertMgr["cert-manager Controller"]
    CertMgr -->|ACME Challenge (HTTP-01 / DNS-01)| LetsEncrypt["Let's Encrypt CA"]
    LetsEncrypt -->|Выпуск сертификата X.509| CertMgr
    CertMgr -->|Сохранение| Secret[("k8s Secret (tls.crt / tls.key)")]
```

### 1. Манифест `ClusterIssuer` (Let's Encrypt Production)
```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: security@company.com
    privateKeySecretRef:
      name: letsencrypt-prod-account-key
    solvers:
      - http01:
          ingress:
            class: nginx
```

### 2. Подключение к Ingress
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  namespace: production
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.company.com
      secretName: api-company-tls-cert
  rules:
    - host: api.company.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: backend-api
                port:
                  number: 8080
```

---

## 🔬 Deep Dive: TLS termination vs passthrough и cert-manager

| Архитектура | Где расшифровка | Когда выбирать |
| :--- | :--- | :--- |
| TLS termination | LB/Ingress | нужен доступ к HTTP заголовкам, WAF, кэширование |
| TLS passthrough | само приложение (mTLS) | соответствие требованиям, end-to-end шифрование |
| Re-encryption | LB→backend тоже TLS | zero-trust между зонами |

### cert-manager: автоматические сертификаты ACME

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: api-tls
spec:
  secretName: api-tls
  dnsNames: [api.company.com]
  issuerRef: { name: letsencrypt-prod, kind: ClusterIssuer }
  privateKey: { rotationPolicy: Always }
---
# DNS-01 challenge для wildcard (*.company.com)
solvers:
- dns01:
    route53: { region: eu-central-1 }
```

### Nginx: безопасность заголовками

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; frame-ancestors 'none'" always;
add_header X-Content-Type-Options nosniff always;
server_tokens off;

# Rate limiting против брутфорса
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
location /login { limit_req zone=login burst=3 nodelay; proxy_pass http://backend; }
```

```bash
# Оценка конфигурации TLS извне
testssl.sh --quiet api.company.com | grep -E 'Grade|Vulnerable'
nmap --script ssl-enum-ciphers -p 443 api.company.com | head -30
```

---

<!-- enriched:v1 -->

## 🧨 Типовые грабли Production

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| Алерты не приходят / приходят пачкой | `group_wait`/`repeat_interval` настроены вслепую | Разобрать routing tree на бумаге, тест через `amtool` |
| Дашборд врет относительно реальности | Стейтмент без фильтра по job/instance | Проверить label matching, добавить legend format |
| Рост кардинальности метрик убивает Prometheus | user_id/path в labels | Ограничить cardinality, relabel drop |
| Логи «исчезают» | retention/индекс ротация | Проверить ILM/compactor настройки и объем hot-хранилища |

!!! warning «Сначала SLI, потом дашборды»
    Дашборд без определенного SLO — это арт. Определите SLI (какие запросы считаем хорошими), цель (99.9%), error budget — и только затем рисуйте панели.

## 🧪 Hands-on Lab

```bash
nginx -t && nginx -T 2>/dev/null | grep -E 'ssl_protocols|add_header' | sort -u && \
openssl s_client -connect api.company.com:443 -servername api.company.com </dev/null 2>/dev/null | openssl x509 -noout -dates -subject
```

## ✅ Чек-лист зрелости темы

- [ ] Есть golden signals на каждый сервис (latency/traffic/errors/saturation)

    ??? tip "Как закрыть пункт"
        Четыре сигнала видны на дашборде сервиса: RPS, error ratio, latency p99 (histogram), saturation (очереди/пулы). Собраны provisioning'ом как код ([09.8](../09-observability/08-grafana-dashboards-as-code.md)), а не руками в UI.

- [ ] Алерты actionable: каждый требует действия, а не просто информирует

    ??? tip "Как закрыть пункт"
        Тест правила: «что я сделаю, увидев?» Нет действия → это дашборд-метрика, убрать из пейджера. Пороги — burn-rate относительно SLO ([09.6](../09-observability/06-alertmanager-and-dashboards-mastery.md)). Аудит: % алертов с реальными действиями за месяц.

- [ ] Настроены inhibition rules: падение ноды глушит её дочерние алерты

    ??? tip "Как закрыть пункт"
        equal: [node] связывает NodeDown с сервисными правилами этого узла — один инцидент = один алерт вместо двадцати. Проверка учением: выключить узел, убедиться в единственной нотификации.

- [ ] Runbook ссылка внутри каждого алерта

    ??? tip "Как закрыть пункт"
        annotation runbook_url обязателен (lint правил), ведёт на конкретные команды диагностики, не на главную вики. Шаблон runbook — [13.2](../13-disaster-recovery-and-tools/02-database-backups-and-dr-plan.md).

- [ ] Проведен учение: симулировали инцидент, проверили доставку нотификаций

    ??? tip "Как закрыть пункт"
        Раз в квартал: дрель хаоса → проверить путь правило→AM→канал, замерить MTTA. Заодно проверить silence/amtool и эскалации. Итог учения фиксируется.

---

## 🧭 Что дальше

| Шаг | Материал |
| :--- | :--- |
| 🛠️ Шаблоны | [Nginx hardening](../18-templates/03-observability-and-web.md) |
| 🎤 Проверить себя | [Вопросы: облака, TLS](../14-interview-prep/04-100-devops-interview-questions-bank-part2.md) |

---

## ✅ Проверь себя

**В1. Базовый hardening Nginx: пять обязательных настроек?**
<details><summary>Ответ</summary>
server_tokens off (не палить версию); ограничение body size (client_max_body_size); таймауты вниз (slowloris); TLS 1.2+ с современными cipher'ами + HSTS; отдельный пользователь nginx, no-root master worker; rate limiting зоной limit_req на login/API.
</details>

**В2. Чем Traefik принципиально отличается от Nginx в контейнерах?**
<details><summary>Ответ</summary>
Динамическая конфигурация через провайдеров: слушает Docker/K8s API и сам подхватывает сервисы (labels/IngressRoute) — без reload. Встроенный ACME/Let's Encrypt автопродление, dashboard. Nginx сильнее в статической тонкой настройке и привычке админов.
</details>

**В3. Что проверять при выборе региона/зоны облака кроме цены?**
<details><summary>Ответ</summary>
Латентность до пользователей; соответствие регуляторике (152-ФЗ — локализация ПДн в РФ); набор managed-сервисов (Kafka/ML/backup); SLA и history outage; зоны устойчивости внутри региона (минимум 3); egress-тарифы (часто дороже compute).
</details>

**В4. WAF перед веб-приложением: что даёт и чего не заменяет?**
<details><summary>Ответ</summary>
Отсекает топовые web-атаки (OWASP: SQLi/XSS, боты, credential stuffing rate-limits). Не заменяет: безопасную разработку, авторизацию, патчи приложения. Правило: WAF — слой, не серебряная пуля; false positives мониторить в log-only режиме перед блокировкой.
</details>
