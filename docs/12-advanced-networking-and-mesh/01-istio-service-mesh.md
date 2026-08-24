# 🕸️ 01. Service Mesh: Istio, Envoy и Zero-Trust Безопасность

## 🎯 Зачем нужен Service Mesh?

При переходе на сотни микросервисов возникают задачи: шифрование межсервисного трафика (mTLS), распределенный трейсинг, канареечная маршрутизация и защита от каскадных сбоев (Circuit Breaking).

```mermaid
graph LR
    subgraph PodA["Pod: Frontend"]
        AppA["App Container"] <-->|localhost| EnvoyA["Envoy Sidecar Proxy"]
    end
    
    subgraph PodB["Pod: Payment"]
        EnvoyB["Envoy Sidecar Proxy"] <-->|localhost| AppB["App Container"]
    end
    
    EnvoyA -->|Автоматический Mutual TLS (mTLS) + Tracing Headers| EnvoyB
    
    ControlPlane["Istio Control Plane (istiod: XDS Configs & CA)"] -.-> EnvoyA
    ControlPlane -.-> EnvoyB
```

---

## 🔒 Автоматический mTLS (Strict Mode)

Включение обязательного двустороннего TLS-шифрования с проверкой X.509 сертификатов между всеми подами:

```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: production
spec:
  mtls:
    mode: STRICT # Запретить любой нешифрованный plain-text трафик
```

---

## 🚦 Продвинутая маршрутизация (VirtualService & DestinationRule)

### 1. `VirtualService`: Канареечное расщепление трафика (90% v1 / 10% v2)
```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: payment-routing
  namespace: production
spec:
  hosts:
    - payment-service
  http:
    - route:
        - destination:
            host: payment-service
            subset: v1
          weight: 90
        - destination:
            host: payment-service
            subset: v2
          weight: 10
```

### 2. `DestinationRule`: Версии (Subsets) и Circuit Breaker
```yaml
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: payment-destination
  namespace: production
spec:
  host: payment-service
  subsets:
    - name: v1
      labels:
        version: v1
    - name: v2
      labels:
        version: v2
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
    # Circuit Breaker: Выбивать проблемные инстансы пода при росте ошибок
    outlierDetection:
      consecutive5xxErrors: 3
      interval: 10s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
```

---

## 🛠️ Istio CLI & Траблшутинг

```bash
# 1. Анализ конфигураций на скрытые ошибки и конфликты
istioctl analyze -n production

# 2. Проверка статуса синхронизации XDS-конфигов с Envoy
istioctl proxy-status

# 3. Инспекция активных эндпоинтов и кластеров внутри конкретного Envoy прокси
istioctl proxy-config endpoints <pod-name>.production
istioctl proxy-config routes <pod-name>.production
istioctl proxy-config clusters <pod-name>.production

# 4. Просмотр логов Envoy прокси пода
kubectl logs <pod-name> -c istio-proxy -f
```

---

## 🔬 Deep Dive: ambient mode vs sidecar — куда движется Istio

| Критерий | Sidecar (классика) | Ambient (ztunnel+waypoint) |
| :--- | :--- | :--- |
| Ресурсы | ~100MB RAM на ПОД | ztunnel один НА НОДУ |
| Апгрейд mesh | рестарт всех подов | без касания приложений |
| L7 политика | везде | waypoint proxy только где нужен |
| Зрелость | production years | GA с 1.24, растущая |

```yaml
# Канареечный трафик между версиями API
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
spec:
  hosts: [api]
  http:
  - match: [{ headers: { x-beta: { exact: "true" } } }]
    route: [{ destination: { host: api, subset: v2 } }]
  - route:
    - destination: { host: api, subset: v1 }
      weight: 95
    - destination: { host: api, subset: v2 }
      weight: 5
---
# Circuit breaker: не добивать умирающий сервис
DestinationRule:
  trafficPolicy:
    connectionPool: { http: { http1MaxPendingRequests: 100, maxRequestsPerConnection: 10 } }
    outlierDetection: { consecutive5xxErrors: 5, interval: 10s, baseEjectionTime: 30s }
```

```bash
istioctl analyze namespace prod           # статический анализ конфигураций!
istioctl x describe pod api-7d4f...       # что применено к конкретному поду
kubectl exec deploy/api -- curl -s localhost:15000/clusters | grep api | head   # Envoy config dump
```

!!! warning «Мульти/mTLS»
    `PeerAuthentication STRICT` ломает клиенты без sidecar. Переходите через `PERMISSIVE` → мониторинг реального mTLS трафика → `STRICT`.


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
istioctl version && istioctl analyze -n prod 2>/dev/null | head -20; \
kubectl get vs,dr,gw,authorizationpolicies -A | head -20 && \
kubectl -n istio-system logs deploy/istiod --tail=20 2>/dev/null | grep -iE 'error|warn' | head -10
```

## ✅ Чек-лист зрелости темы

- [ ] Репликация и кворумные настройки осознаны (не дефолт из quickstart)
- [ ] Мониторинг лагов репликации и очередей настроен с алертами
- [ ] Есть проверенный runbook: отказ ноды / полный restore
- [ ] Ёмкостное планирование: известно, при каком объеме начнутся проблемы
- [ ] Проведено учение по отказу зоны/ноды без потери данных
