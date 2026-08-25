# 🔌 02. Продвинутые CNI: Cilium (eBPF) и Project Calico (BGP)

## ⚡ Сравнение CNI плагинов

| Критерий | Стандартные CNI (Flannel) | Project Calico | Cilium (eBPF) |
| :--- | :--- | :--- | :--- |
| **Движок данных (Data Plane)** | Linux Bridge / VXLAN | `iptables` / `IPVS` / eBPF | **Pure Linux Kernel eBPF** |
| **Маршрутизация** | Оверлейная сеть | Нативная без оверлея через **BGP** или VXLAN | Direct Routing / Geneve / VXLAN |
| **Замена kube-proxy** | Нет | Экспериментально | **Полная замена (No iptables overhead)** |
| **L7 Network Policies** | Нет | Через Envoy интеграцию | **Нативная поддержка (HTTP, DNS, gRPC)** |
| **Observability** | Базовая | Calico Cloud | **Hubble (Сетевая топология в реальном времени)** |

---

## 🐝 Cilium и революция eBPF

**eBPF (Extended Berkeley Packet Filter)** позволяет безопасно выполнять пользовательский байткод прямо в ядре Linux при наступлении сетевых событий без переключения контекста `User-Kernel space`.

```mermaid
graph TD
    Socket["Socket Layer"] -->|eBPF Socket Operations (Bypass TCP/IP Stack)| Socket2["Socket Layer (Local Pod)"]
    NIC["Сетевая карта (NIC Driver / XDP)"] -->|eBPF XDP Program: Instant Drop DDoS| Filter["DDoS Filter (<1 microsecond)"]
    Filter -->|Fast-Path Routing| PodNet["Pod Network"]
```

### 1. `CiliumNetworkPolicy` (Фильтрация на уровне L7 HTTP и DNS)
```yaml
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: secure-backend-policy
  namespace: production
spec:
  endpointSelector:
    matchLabels:
      app: backend-api
  ingress:
    - fromEndpoints:
        - matchLabels:
            app: frontend
      toPorts:
        - ports:
            - port: "8080"
              protocol: TCP
          # L7 фильтрация: разрешить ТОЛЬКО GET запросы к /api/v1/orders
          rules:
            http:
              - method: "GET"
                path: "/api/v1/orders"
  egress:
    # Разрешить DNS-резолвинг только доверенных доменов
    - toFQDNs:
        - matchName: "api.stripe.com"
      toPorts:
        - ports:
            - port: "443"
              protocol: TCP
```

---

## 🦅 Project Calico и BGP пиринг

Calico использует протокол **BGP (Border Gateway Protocol)**, превращая каждую ноду Kubernetes в маршрутизатор. Ноды анонсируют IP-адреса своих подов напрямую в физические ToR (Top of Rack) свитчи датацентра, исключая оверхед на инкапсуляцию VXLAN.

```yaml
# Настройка BGP пиринга с физическим сетевым коммутатором
apiVersion: projectcalico.org/v3
kind: BGPPeer
metadata:
  name: bgp-tor-switch-01
spec:
  peerIP: 192.168.1.1
  asNumber: 65001
```

---

## 🛠️ CLI утилиты и диагностика Hubble

```bash
# 1. Проверка статуса Cilium и eBPF карт
cilium status

# 2. Инспекция сетевых эндпоинтов на ноде
cilium endpoint list

# 3. Перехват сетевых дропов (Drop events) через eBPF в реальном времени
cilium monitor --type drop

# 4. Мониторинг межсервисного трафика и DNS запросов через Hubble
hubble observe --namespace production --protocol http --follow
```

---

## 🔬 Deep Dive: eBPF datapath — почему Cilium быстрее iptables

```text
Традиционно: eth0 → netfilter PREROUTING → conntrack → DNAT chain (линейный обход правил) → routing → veth
Cilium/eBPF: eth0 → bpf_prog@eth0 (одна точка, map lookup O(1)) → veth пода
```

### Hubble: observability сети «из коробки»

```bash
hubble observe --namespace prod --since 10m \
  --verdict DROPPED --protocol tcp | head -20

# Кто к кому ходит: автоматический service graph для NetworkPolicy
hubble observe flows -o json | cilium-dbg ... 
cilium hubble enable && cilium connectivity test    # smoke всей сети кластера
```

### Calico BGP: маршрутизация без инкапсуляции

```yaml
# BGP peering с ToR свитчем — поды маршрутизируются напрямую
apiVersion: projectcalico.org/v3
kind: BGPConfiguration
metadata: { name: default }
spec:
  asNumber: 64512
  serviceClusterIPs: [{ cidr: 10.96.0.0/12 }]
  serviceExternalIPs: [{ cidr: 203.0.113.0/24 }]
```

| Выбор | Условие |
| :--- | :--- |
| Cilium | K8s-native security, L7 policy, kernel ≥ 5.4, observability |
| Calico BGP | bare-metal датацентр, производительность без overlay, существующие BGP сети |
| Calico VXLAN/IPIP | облака без BGP (AWS VPC), простота |

⚠️ Cilium требует свежего ядра: на Ubuntu 20.04 (5.4) часть фич деградирует. Проверка: `cilium status --verbose | grep -A5 Kernel`.


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
kubectl -n kube-system get pods -o wide | grep -E 'cilium|calico' | head -5; \
kubectl -n kube-system exec ds/cilium -- cilium status --brief 2>/dev/null | head -15 || \
calicoctl node status 2>/dev/null | head -10 || echo 'check cni pods'
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
| 💻 Песочница | [Сценарии сетей K8s](../21-playground/index.md) |
| 🎤 Проверить себя | [Вопросы: CNI/eBPF](../14-interview-prep/04-100-devops-interview-questions-bank-part2.md) |
