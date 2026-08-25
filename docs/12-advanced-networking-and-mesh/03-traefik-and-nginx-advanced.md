# 🚦 03. Продвинутые Edge-роутеры: Traefik и Nginx Advanced

## 🧭 Traefik Proxy: Архитектура и CRD IngressRoute

**Traefik** — cloud-native обратный прокси, автоматически обнаруживающий сервисы через API Kubernetes или Docker без перезагрузок конфигурации.

```mermaid
graph LR
    User([Клиентский запрос]) --> Traefik["Traefik Entrypoint (:443)"]
    Traefik --> MW1["Middleware 1: RateLimit"]
    MW1 --> MW2["Middleware 2: StripPrefix /api"]
    MW2 --> Router["IngressRoute Rule (Host & Path)"]
    Router --> Service["K8s Service (Upstream Pods)"]
```

### 1. Манифест Traefik `Middleware` (Rate Limit + Security Headers)
```yaml
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: security-and-ratelimit
  namespace: production
spec:
  rateLimit:
    average: 50
    burst: 100
  headers:
    sslRedirect: true
    stsSeconds: 31536000
    browserXssFilter: true
    contentTypeNosniff: true
```

### 2. Манифест `IngressRoute` (HTTPS маршрутизация с цепочкой Middleware)
```yaml
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: api-ingress-route
  namespace: production
spec:
  entryPoints:
    - websecure
  routes:
    - match: Host(`api.company.com`) && PathPrefix(`/v1`)
      kind: Rule
      services:
        - name: backend-api
          port: 8080
      middlewares:
        - name: security-and-ratelimit
  tls:
    secretName: company-tls-cert
```

---

## ⚡ Nginx Advanced: L4 Stream и Высоконагруженный тюнинг

### 1. L4 Проксирование (TCP/UDP Stream с SNI Passthrough)
Проброс зашифрованного SSL трафика напрямую в бэкенд без расшифровки на Nginx:

```nginx
# /etc/nginx/nginx.conf
stream {
    # Считывание SNI доменного имени без терминации SSL
    ssl_preread on;

    upstream pg_primary {
        server 10.0.2.10:5432;
    }

    server {
        listen 5432;
        proxy_pass pg_primary;
        proxy_timeout 10m;
        proxy_connect_timeout 2s;
    }
}
```

### 2. Тюнинг ядра и Nginx для High-Load (100k+ RPS)
```nginx
user www-data;
worker_processes auto;
worker_rlimit_nofile 200000; # Лимит дескрипторов файлов процесса

events {
    worker_connections 65535;
    use epoll;
    multi_accept on;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;

    # Keepalive пулы
    keepalive_timeout 65;
    keepalive_requests 10000;

    # Отключение буферизации для низкой задержки
    proxy_buffering off;
    proxy_request_buffering off;
}
```

---

## 🔬 Deep Dive: Traefik Middleware цепочки и gRPC proxying

```yaml
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata: { name: security-chain }
spec:
  chain:
    middlewares: [rate-limit, ip-whitelist, compress, secure-headers]
---
kind: Middleware
metadata: { name: rate-limit }
spec:
  rateLimit: { average: 100, burst: 200, period: 1m }
---
kind: Middleware
metadata: { name: secure-headers }
spec:
  headers:
    stsSeconds: 31536000
    contentTypeNosniff: true
    browserXssFilter: true
    customResponseHeaders: { Server: "" }   # скрыть версию
```

gRPC поверх HTTP/2:

```yaml
# Traefik умеет h2c passthrough без TLS termination
entryPoints:
  grpc:
    address: ":9090"
    transport:
      respondingTimeouts: { readTimeout: 0 }   # стриминг без таймаута
```

### Nginx advanced: upstream keepalive и буферизация

```nginx
upstream backend {
    least_conn;
    server app-1:8080 max_fails=3 fail_timeout=10s;
    server app-2:8080 backup;
    keepalive 64;                    # держать соединения к апстримам открытыми!
}
location / {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Connection "";  # обязательно для keepalive
    proxy_buffering on;              # быстрый ответ клиенту, медленный бэкенд
    proxy_cache_valid 200 5m;
}
```

```bash
# Проверить, какой роутер съел запрос (Traefik debug)
curl -H 'X-Traefik-Debug: true' https://app.local/headers -v 2>&1 | grep -i traefik
# nginx: посмотреть активные соединения и воркер-процессы
curl -s localhost/nginx_status; ss -tn state established '( sport = :443 )' | wc -l
```


---

<!-- enriched:v1 -->

## 🧨 Типовые грабли Production

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| Кластер «деградирует» без видимых ошибок | Недореплицированные партиции/PG после отказа ноды | Проверить health/ISR/under-replicated до следующего сбоя |
| Латентность растет линейно с данными | Отсутствие партиционирования/индексов | Разбить по времени/ключу, пересмотреть схему |
| Бэкап есть, восстановления нет | Никогда не проверялся restore | Регулярный drill: restore в staging + checksum |
| После failover дубли/потеря данных | Настройки acks/consistency не осознаны | Зафиксировать гарантии записи в SLA сервиса |

!!! danger «Правило бэкапов»
    Бэкап — это не файл на S3, а **проверенный процесс восстановления** с известным RTO. Не проверенный бэкап = отсутствие бэкапа.

## 🧪 Hands-on Lab

```bash
kubectl get ingressroute,middleware -A | head && curl -s localhost:9000/api/http/routers 2>/dev/null | jq '.[0:3]' || nginx -T 2>/dev/null | grep -E 'upstream|proxy_pass' | head -10
```

## ✅ Чек-лист зрелости темы

- [ ] Репликация и кворумные настройки осознаны (не дефолт из quickstart)

    ??? tip "Как закрыть пункт"
        Число реплик и фактор синхронной записи выбраны от требования потери данных: RF≥3, write concern/majority или min.insync.replicas=2 для Kafka. Проверка: конфигурация задокументирована комментарием «почему столько», отказ одной реплики не останавливает запись (проверено в стенде).

- [ ] Мониторинг лагов репликации и очередей настроен с алертами

    ??? tip "Как закрыть пункт"
        Метрики: lag вторичек (pg_stat_replication/kafka consumer lag/redis offset), размер очередей, age of oldest message. Алерт при lag > порога N минут. Проверка: остановить реплику — алерт пришёл до того, как заметили люди.

- [ ] Есть проверенный runbook: отказ ноды / полный restore

    ??? tip "Как закрыть пункт"
        Два сценария по шаблону из [13.2]: замена одного узла (шаги + время) и полное восстановление из бэкапа. Runbook проверен руками за последние 90 дней — дата прогона в шапке документа.

- [ ] Ёмкостное планирование: известно, при каком объеме начнутся проблемы

    ??? tip "Как закрыть пункт"
        Знакомы три числа: текущий объём данных/RPS, скорость роста за квартал, предел текущей архитектуры (диск/IOPS/память индексов). Алерт на 70% предела; план масштабирования написан ДО его наступления.

- [ ] Проведено учение по отказу зоны/ноды без потери данных

    ??? tip "Как закрыть пункт"
        Сценарий: выключаем узел/AZ (docker stop / drain), наблюдаем выборы/переключение по часам, сверяем отсутствие потери подтверждённых записей. Результат учения (время, найденные грабли) фиксируется в runbook'е.

---

## 🧭 Что дальше

| Шаг | Материал |
| :--- | :--- |
| 🛠️ Шаблоны | [Nginx hardening шаблон](../18-templates/03-observability-and-web.md) |
| 🎤 Проверить себя | [Вопросы: edge](../14-interview-prep/04-100-devops-interview-questions-bank-part2.md) |

---

## ✅ Проверь себя

**В1. Ingress-контроллер: как трафик доходит до пода?**
<details><summary>Ответ</summary>
LB/NodePort → pod ingress-controller (envoy/nginx) → контроллер рендерит конфиг из Ingress-ресурсов (host/path → Service) → upstream к endpoint'ам пода напрямую (bypass ClusterIP в nginx через endpoints slice).
</details>

**В2. Traefik IngressRoute vs стандартный Ingress?**
<details><summary>Ответ</summary>
CRD IngressRoute даёт нативные фичи Traefik без аннотаций-костылей: приоритеты правил, middleware-цепочки (rate-limit, auth, headers, strip prefix), TCP/UDP роутинг. Стандартный Ingress — переносимость между контроллерами ценой аннотационного зоопарка.
</details>

**В3. Rate limiting на edge: где настроить и какие параметры?**
<details><summary>Ответ</summary>
Nginx: limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s + burst с nodelay. Traefik: middleware rateLimit (average/burst/sourceCriterion). Ключ группировки важнее цифр: IP за LB (real_ip_header!), API-key, header. Лимит на login-эндпоинт отдельно от основного трафика.
</details>

**В4. TLS termination vs passthrough — когда какое?**
<details><summary>Ответ</summary>
Termination: сертификат на edge, внутрь HTTP/mTLS — простота, WAF/роутинг по L7 видит трафик. Passthrough: TLS идёт до самого приложения (SNI-роутинг) — end-to-end шифрование, клиентские mTLS-сертификаты, соответствие требованиям «ключи не покидают приложение».
</details>
