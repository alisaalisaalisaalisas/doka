# 🌐 20.7 Network Edge: CoreDNS, MetalLB, WireGuard/Tailscale, HAProxy/Envoy

> Уровень: Middle→Senior. Сетевая периферия, на которой спрашивают senior'ов: «DNS не резолвится», «Service в Pending», «как дать доступ без белого IP», «почему Envoy, а не Nginx».

**Оглавление:** [CoreDNS](#coredns-dns-кластера-и-его-болезни) · [MetalLB](#metallb-loadbalancer-на-bare-metal) · [WireGuard/Tailscale](#wireguardtailscale-оверлей-доступ) · [HAProxy/Envoy](#haproxyenvoy-l4l7-прокси) · [2.5 Проверь себя](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

## CoreDNS: DNS кластера и его болезни

### Теория

CoreDNS — дефолтный DNS в K8s. Каждый Pod получает `/etc/resolv.conf` с `nameserver` = ClusterIP сервиса `kube-dns` и опцией `ndots:5`.

```text
Pod → resolv.conf (ndots:5, search: svc.cluster.local, cluster.local) → kube-dns Service
  → CoreDNS pod'ы: plugin-цепочка: kubernetes (кластерные записи) → forward (внешние) → cache
```

**Плагины Corefile:** `kubernetes` (зона cluster.local из API), `forward` (upstream, например 8.8.8.8 или VPC-DNS), `cache` (кэш TTL), `hosts`, `rewrite`, `loadbalance`, `health/ready/metrics`.

**Проблема `ndots:5`:** запрос `api.company.io` (0 точек < 5) сначала ищется с суффиксами: `api.company.io.prod.svc.cluster.local.` → ... → только потом как абсолютное имя. Итог — до 4 лишних запросов на каждый внешний вызов. Решения: FQDN с точкой на конце, `dnsPolicy`/`dnsConfig`, NodeLocal DNSCache.

### Конфигурация

```corefile
# ConfigMap kube-system/coredns — Corefile
.:5353 {                      # серверный блок: зона:порт
    errors
    health :8081
    ready :8181
    kubernetes cluster.local in-addr.arpa ip6.arpa {
        pods insecure         # IP→имя подов (для диагностики)
        fallthrough in-addr.arpa ip6.arpa
        ttl 30
    }
    hosts {                   # статические записи
        10.96.0.10 kube-dns.corp.local
        fallthrough
    }
    prometheus :9153
    forward . /etc/resolv.conf {
        max_concurrent 1000   # защита от исчерпания горутин (CVE-2023-28411 класс)
    }
    cache 30
    loop                      # защита от DNS-петли
    reload                    # автоприменение изменений ConfigMap
}
```

**Частые ошибки:** убрали `loop` и получили петлю forward↔kubelet; `forward` в DNS, недоступный из подов (VPC-DNS без маршрута); `cache` без `deny` для отрицательных ответов → NXDOMAIN кэшируется дольше нужного.

### Troubleshooting

```bash
# 1. Живы ли CoreDNS?
kubectl -n kube-system get deploy coredns
# 2. Что говорит конкретный запрос ИЗ ПОДА (не с ноутбука!):
kubectl run dns1 --rm -it --image=busybox:1.36 --restart=Never -- \
  nslookup kubernetes.default.svc.cluster.local
kubectl run dns2 --rm -it --image=nicolaka/netshoot --restart=Never -- \
  dig +short api.company.io @10.96.0.10     # через кластерный DNS
# 3. Логи CoreDNS: SERVFAIL/timeout
kubectl -n kube-system logs deploy/coredns | grep -E "ERROR|SERVFAIL" | tail
# 4. Метрики: латентность и кэш
kubectl -n kube-system get --raw /api/v1/nodes/.../proxy:9153/metrics 2>/dev/null || \
  kubectl -n kube-system port-forward deploy/coredns 9153:9153 && curl -s localhost:9153/metrics \
  | grep -E 'coredns_dns_response_duration_seconds|coredns_cache_hits_total'
```

**Топ проблем:** 5-секундные таймауты при конкурентных DNS-запросах (conntrack race — лечится NodeLocal DNSCache и обновлением ядра); `i/o timeout` на forward (нет маршрута к upstream); SERVFAIL после правки Corefile (синтаксис — смотрите логи pod'а).

---

## MetalLB: LoadBalancer на bare-metal

### Теория

Облачные LB-контроллеры создают балансировщики за вас; на bare-metal `type: LoadBalancer` навсегда `<pending>`. MetalLB назначает IP из пула и **анонсирует** его:

- **Layer2 режим:** Speaker-DaemonSet отвечает на ARP/NDP «этот IP — я». Просто, но трафик идёт через одну ноду-лидера.
- **BGP режим:** ноды анонсируют /32-маршруты роутерам (ECMP) — настоящий мульти-нодовый балансинг.

### Конфигурация (v0.13+: CRD)

```yaml
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata: { name: prod-pool, namespace: metallb-system }
spec:
  addresses: ["192.168.88.240-192.168.88.250"]   # диапазон ВНЕ DHCP!
---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata: { name: l2, namespace: metallb-system }
spec:
  ipAddressPools: [prod-pool]
```

**Частые ошибки:** пул в DHCP-диапазоне (конфликты ARP); `strictARP: true` не выставлен в kube-proxy для layer2 (нужен, если CNI использует bridge-режим); Service с `loadBalancerIP` вне пула.

### Troubleshooting

```bash
kubectl -n metallb-system logs ds/speaker | grep -iE "announce|error" | tail
kubectl -n metallb-system get IPAddressPool,L2Advertisement
kubectl get svc ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress}'
#  <pending> → смотрите события Service и логи controller
arping -I eth0 192.168.88.240     # отвечает? MAC = нода-лидер layer2
```

---

## WireGuard/Tailscale: оверлей-доступ

### Теория

**WireGuard** — VPN на уровне интерфейса: криптографическая маршрутизация через `AllowedIPs`. Нет серверов/клиентов — есть пиры. UDP 51820.

**Tailscale** — WireGuard + координация (identity, NAT-traversal, MagicDNS, ACL). `headscale` — self-hosted координатор.

### Конфигурация

```ini
# /etc/wireguard/wg0.conf (сервер-«хаб»)
[Interface]
Address = 10.10.0.1/24
ListenPort = 51820
PrivateKey = <SERVER_PRIV>
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

[Peer]                          # ноутбук инженера
PublicKey = <LAPTOP_PUB>
AllowedIPs = 10.10.0.2/32

[Peer]                          # k8s-нода: роутим её подсеть подов
PublicKey = <NODE_PUB>
AllowedIPs = 10.10.0.3/32, 10.42.0.0/24
```

```bash
wg genkey | tee priv | wg pubkey > pub      # генерация пары ключей
wg-quick up wg0 && wg show                  # handshake, transfer, allowed ips
ping 10.10.0.3 && kubectl --server=https://10.10.0.3:6443 ...   # доступ к кластеру через туннель
```

**Tailscale-вариант:** `tailscale up --advertise-routes=10.42.0.0/24` (subnet-router на ноде), у других — `tailscale up --accept-routes`; MagicDNS даёт `kubectl` на `https://node-name:6443`.

**Частые ошибки:** `AllowedIPs` перекрываются между пирами (WireGuard берёт последний); нет `PersistentKeepalive = 25` за NAT → туннель «умирает»; MTU 1420 vs 1500 → большие пакеты теряются (TLS-хендшейк висит).

### Troubleshooting

```bash
wg show                       # latest handshake: >2 мин = туннель мёртв
wg show wg0 dump | awk '{print $NF}'   # transfer: rx/tx = 0 → ключи/файрвол
ping -M do -s 1372 10.10.0.3  # поиск MTU-потолка
tailscale ping <peer>         # путь: direct / relay ("derp") — relay = медленно
tailscale status | head
```

---

## HAProxy/Envoy: L4/L7 прокси

### Теория

| | **NGINX** | **HAProxy** | **Envoy** |
| :--- | :--- | :--- | :--- |
| Reload | fork новых воркеров (мгновенно, но с нюансами keepalive) | seamless (старые воркеры доигрывают) | hot-restart/xDS без даунтайма |
| Динамика | файлы | файлы + Runtime API (socket) | **xDS API** — конфиг из control-plane |
| Роль в K8s | ingress-nginx | standalone LB, k3s API-LB | data-plane Istio, Gateway API (Envoy Gateway) |
| Сила | простота, кэш, статика | точные тайминги, stick-tables, DDoS-защита | observability, mesh, gRPC/filters |

### Конфигурация

```text
# /etc/haproxy/haproxy.cfg — фрагмент прод-минимума
frontend fe_api
    bind :443 ssl crt /etc/haproxy/certs/site.pem alpn h2,http/1.1
    http-request set-header X-Forwarded-Proto https
    # ACL: /api/* → бэкенд api, остальное → web
    acl is_api path_beg /api/
    use_backend bk_api if is_api
    default_backend bk_web

backend bk_api
    balance leastconn
    option httpchk GET /healthz
    http-check expect status 200
    default-server inter 5s fall 3 rise 2
    server api1 10.0.1.11:8080 check
    server api2 10.0.1.12:8080 check backup

    timeout queue 30s
    timeout server  30s
    timeout connect 5s

listen stats
    bind :8404
    stats enable
    stats uri /stats
```

```bash
haproxy -c -f /etc/haproxy/haproxy.cfg      # ВАЛИДАЦИЯ до reload — всегда!
systemctl reload haproxy
echo "show info" | socat stdio /run/haproxy/admin.sock   # runtime API
echo "set server bk_api/api1 state maint" | socat stdio /run/haproxy/admin.sock  # дрейн ноды
```

**Envoy:** конфиг описывает `listeners → filter_chains → routes → clusters`; в Istio его генерирует istiod по xDS — руками не трогают, читают через `istioctl proxy-config`.

**Частые ошибки:** нет `timeout server` (дефолт бесконечность → исчерпание соединений); `option httpchk` без `expect` — health-check «200 любой» пропускает поломанные; Envoy: не выставлен `overprovisioning` для drain — резкий сброс соединений.

### Troubleshooting

```bash
# HAProxy: кто и куда ходит, что дропнуто — страница stats (8404/stats)
echo "show stat" | socat stdio /run/haproxy/admin.sock | head -5
#  столбцы: scur/smax (сессии), ereq (ошибки запросов), dresp (дропнутые ответы)
# Envoy (в поде istio-proxy): конфиг и кластеры
istioctl proxy-config routes <pod> -n prod | head
istioctl proxy-config clusters <pod> -n prod --fqdn api.prod.svc.cluster.local
curl localhost:15000/clusters | grep api   # health-флаги: healthy / outlier ejection
```

---

## 2.5 Проверь себя — 5 вопросов

**В1. Pod делает `curl api.company.io` и каждый запрос обрабатывается ~200мс дольше ожидаемого. Причём `dig api.company.io` с ноды быстрый. Что проверить первым?**

<details><summary>Ответ</summary>
ndots:5: запрос уходит с search-суффиксами (api.company.io.prod.svc.cluster.local и т.д.) — до 4 лишних upstream-запросов. Проверить tcpdump/dig из пода, лечить FQDN-точкой, dnsConfig ndots:2 или NodeLocal DNSCache.
</details>

**В2. Найдите ошибку: IPAddressPool MetalLB `addresses: ["192.168.1.100-192.168.1.150"]`, а DHCP-сервер раздаёт 192.168.1.1-192.168.1.200. Что произойдёт?**

<details><summary>Ответ</summary>
ARP-конфликты: MetalLB отвечает на ARP за IP, который DHCP может выдать другому устройству. Пул обязан быть вне DHCP-диапазона (или зарезервирован в DHCP).
</details>

**В3. WireGuard-туннель «отваливается» после простоя ноутбука в другой сети, восстанавливается только перезапуском. Причина?**

<details><summary>Ответ</summary>
NAT-маппинг истёк, а новых пакетов нет — нужен PersistentKeepalive = 25 у пира за NAT. Проверка: wg show, latest handshake давний при живом интерфейсе.
</details>

**В4. Чем принципиально reload HAProxy отличается от reload NGINX с точки зрения активных соединений?**

<details><summary>Ответ</summary>
HAProxy делает seamless reload: старые воркеры продолжают обслуживать существующие соединения до их завершения (плюс state-transfer). NGINX тоже форкает новые воркеры, но старые завершают только keepalive-соединения по таймаутам — поведение с long-lived соединениями (gRPC/WebSocket) требует явных настроек.
</details>

**В5. В Istio вы видите в Envoy-логах флаг UF (upstream flush / connection reset). Какие команды дадут картину по кластеру назначения?**

<details><summary>Ответ</summary>
istioctl proxy-config cluster <pod> --fqdn <svc> (health-флаги, outlier ejection) и curl localhost:15000/clusters | grep <svc> (cx_active/cx_connect_fail). Плюс outlier_detection в DestinationRule — не выбрасывает ли upstream раньше времени.
</details>

---

## 2.6 Практика — 3 задания

### Задание 1: Диагностика DNS (стартовое состояние: «интернет из подов не работает»)

**Условие:** поды не резолвят внешние имена; кластерные (`*.svc.cluster.local`) работают. Стенд: kind/k3s.

```bash
# Шаг 1: воспроизведение из пода (не с ноды!)
kubectl run t1 --rm -it --image=nicolaka/netshoot --restart=Never -- sh -c '
  dig +short kubernetes.default.svc.cluster.local;   # ожидание: 10.96.0.1 ✅
  dig +short example.com @10.96.0.10'                # ожидание: (пусто/timeout) ❌
# Вывод-диагноз: кластерная зона работает, forward — нет.

# Шаг 2: куда форвардит CoreDNS и что в логах
kubectl -n kube-system get cm coredns -o jsonpath='{.data.Corefile}' | grep -A2 forward
#   forward . /etc/resolv.conf   ← берёт resolv.conf ПОДА coredns
kubectl -n kube-system logs deploy/coredns | tail -5
#   Ожидание: "plugin/forward: no route to host" или timeout

# Шаг 3: проверка upstream из пода coredns
kubectl -n kube-system exec deploy/coredns -- cat /etc/resolv.conf
kubectl -n kube-system exec deploy/coredns -- wget -qO- -T2 http://1.1.1.1 || echo "нет исходящего"
# Вывод-диагноз: upstream недостижим (файрвол/маршрут) — чинить сеть, не DNS
```

**Проверь себя:** после открытия исходящего UDP/TCP 53 к upstream `dig example.com @10.96.0.10` из пода возвращает A-запись; в метриках `coredns_forward_requests_total` растут с кодом NOERROR.

**Разбор:** методика — изолировать слой: кластерная зона ✅ / forward ❌ → проблема между CoreDNS и upstream, а не в самом DNS-сервисе. 80% «DNS сломался» — это сеть до upstream или conntrack-гонка, а не CoreDNS.

### Задание 2: MetalLB layer2 в kind — Service получает внешний IP

**Условие:** kind-кластер с docker-сетью `172.18.0.0/16`; MetalLB раздаёт IP из этого диапазона, Service типа LoadBalancer становится доступен с хоста.

```bash
# Шаг 0: кластер с kind, сеть по умолчанию 172.18.0.0/16 (проверьте!)
docker network inspect kind --format '{{range .IPAM.Config}}{{.Subnet}}{{end}}'

# Шаг 1: установка MetalLB
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.14.9/config/manifests/metallb-native.yaml
kubectl -n metallb-system wait --for=condition=ready pod -l app=metallb --timeout=120s

# Шаг 2: пул ВНУТРИ docker-сети (для лабы) — файл metallb.yaml:
cat > metallb.yaml <<'EOF'
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata: { name: lab-pool, namespace: metallb-system }
spec: { addresses: ["172.18.255.200-172.18.255.250"] }
---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata: { name: l2, namespace: metallb-system }
spec: { ipAddressPools: [lab-pool] }
EOF
kubectl apply -f metallb.yaml

# Шаг 3: тестовый LoadBalancer
kubectl expose deploy nginx --image=nginx:1.27 --port=80 --type=LoadBalancer --name=lb-test
kubectl get svc lb-test
# Ожидание: EXTERNAL-IP = 172.18.255.200 (не <pending>!) ✅
curl -s http://172.18.255.200 | head -3     # отвечает с хоста
```

**Проверь себя:** `kubectl get svc lb-test -o jsonpath='{.status.loadBalancer.ingress[0].ip}'` непустой; `arping -I <docker-bridge> <IP>` отвечает MAC'ом kind-ноды (speaker анонсировал).

**Разбор:** layer2-режим работает на уровне L2-сегмента — в kind это docker-бридж, в проде — VLAN серверов. В проде диапазон берётся вне DHCP, а для мульти-нодового трафика — BGP-режим.

### Задание 3: HAProxy — health-check, дрейн ноды, seamless reload

**Условие (стартовое состояние):** файл `/etc/haproxy/haproxy.cfg` содержит frontend/backend из раздела конфигурации выше; два бэкенда `api1`, `api2`.

```bash
# Шаг 1: ВАЛИДАЦИЯ перед любым изменением (железное правило)
haproxy -c -f /etc/haproxy/haproxy.cfg
# Ожидание: "Configuration file is valid" ✅ (при ошибке — строка и причина)

# Шаг 2: вывести api1 из ротации БЕЗ разрыва соединений (drain)
echo "set server bk_api/api1 state maint" | socat stdio /run/haproxy/admin.sock
echo "show stat" | socat stdio /run/haproxy/admin.sock | grep bk_api
#   Ожидание: api1 → MAINT, весь трафик на api2 (scur у api1 = 0 постепенно)

# Шаг 3: вернуть и перезагрузить конфиг бесшовно
echo "set server bk_api/api1 state ready" | socat stdio /run/haproxy/admin.sock
haproxy -c -f /etc/haproxy/haproxy.cfg && systemctl reload haproxy
# Шаг 4: убедиться, что health-check вернул ноду
sleep 6; echo "show stat" | socat stdio /run/haproxy/admin.sock | grep bk_api
#   api1 → status UP, check status L7OK/200 ✅
```

**Проверь себя:** во время maint на api1 `curl` запросы проходят (все на api2, без 502); после ready — `show stat` показывает UP с L7OK.

**Разбор:** Runtime API (socket) — управление без reload: maint/ready/drain, веса, сессии. Reload — только для изменений конфиг-файла, и всегда после `haproxy -c`. Это же — ответ на собес-вопрос «как вывести ноду без даунтайма».

---

*Следующая подтема: [20.8 Хранилища: MinIO, etcd, Longhorn](08-storage-s3-etcd-longhorn.md)*
