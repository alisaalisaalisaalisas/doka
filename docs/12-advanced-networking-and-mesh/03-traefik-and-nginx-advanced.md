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
- [ ] Мониторинг лагов репликации и очередей настроен с алертами
- [ ] Есть проверенный runbook: отказ ноды / полный restore
- [ ] Ёмкостное планирование: известно, при каком объеме начнутся проблемы
- [ ] Проведено учение по отказу зоны/ноды без потери данных
