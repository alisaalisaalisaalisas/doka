# 🌐 Инцидент-симуляции: Партия №3 — Сетевые (6 сценариев)

> «Интернет медленный» и «иногда не работает» — половина реальных дежурств. Здесь — сетевые инциденты, где виноват не код. Теория-арсенал: [01.5 Диагностика производительности](../01-linux-and-networking/05-linux-performance-diagnostics.md), протоколы: [01.4 OSI/TLS](../01-linux-and-networking/04-osi-model-and-network-protocols.md).

## 📋 Правила игры

1. Засекайте время. MTTR — ваша метрика.
2. Только `dig`, `ss`, `mtr`, `tcpdump`, `curl` — без гугла до подсказок.
3. После починки ответьте: **как это предотвратить?**

---

## 🔥 Сценарий 17: DNS резолвится 5 секунд вместо мс

**Симптом:** приложение в Kubernetes стало медленным, но только при первом запросе к каждому внешнему хосту. `curl` к API показывает `time_namelookup = 4.9s`, остальное быстро.

```bash
# Воспроизведение паттерна (в любом Linux):
cat /etc/resolv.conf
# search shop.svc.cluster.local svc.cluster.local cluster.local
# options ndots:5          ← вот подозреваемый

time dig api.external-gateway.com +short        # прямой запрос — быстрый
time curl -so /dev/null -w 'dns=%{time_namelookup}\n' https://api.external-gateway.com/
```

⏱️ **SLA: 15 минут**

<details><summary>💡 Подсказка 1</summary>

В FQDN `api.external-gateway.com` три точки → по умолчанию нужно минимум `ndots:5`. Что сделает resolver с именем, у которого точек меньше?
</details>

<details><summary>💡 Подсказка 2</summary>

Сначала будут проверены все search-домены: `api.external-gateway.com.shop.svc.cluster.local`, `...svc.cluster.local`, `...cluster.local` — каждый таймаут/ответ NXDOMAIN, и только потом абсолютный запрос. Посчитайте: сколько запросов на один lookup?
</details>

<details><summary>✅ Решение</summary>

```bash
# Диагноз подтверждаем tcpdump'ом: видим 4+ запроса вместо одного
tcpdump -i any port 53 & curl -so /dev/null https://api.external-gateway.com/

# Чиним (вариант для приложения): absolute-имя с завершающей точкой
#   в конфиге приложения: "https://api.external-gateway.com."   ← трейлинг-точка!

# Или глобально в pod'е через dnsConfig:
kubectl patch deploy shop-api --type merge -p '
spec:
  template:
    spec:
      dnsConfig:
        options:
          - { name: ndots, value: "2" }   # точки < 2 → имя считается абсолютным сразу'

**Как предотвратить:** для внешних зависимостей всегда trailing dot или отдельный dnsConfig; алерт на p99 time_namelookup из curl-timing в health-check'ах.
```
</details>

---

## 🔥 Сценарий 18: Большие файлы не передаются, мелкие — да

**Симптом:** после переезда сервиса за VPN/туннель: JSON-ответы приходят, а загрузки файлов >1KB виснут и отваливаются по таймауту. Ping проходит, TCP соединение устанавливается.

```bash
# Воспроизведение локально (понижаем MTU на интерфейсе):
sudo ip link set dev eth0 mtu 1300        # имитация туннеля с малым MTU
curl -o /dev/null http://speedtest.tele2.net/1KB.zip    # ок
timeout 10 curl -o /dev/null http://speedtest.tele2.net/1MB.zip || echo "← висит!"

# Диагностика:
ip link show eth0 | grep mtu
ping -M do -s 1272 speedtest.tele2.net    # probe: 1272+28=1300 — проходит ли?
tracepath speedtest.tele2.net             # покажет PMTU по пути!
```

⏱️ **SLA: 20 минут**

<details><summary>💡 Подсказка 1</summary>

Мелкие пакеты ходят, большие — нет: классика PMTUD. ICMP «fragmentation needed» (type 3 code 4) не доходит от промежуточного узла — кто-то режет ICMP.
</details>

<details><summary>💡 Подсказка 2</summary>

Проверить чёрные дыры: `nstat -az | grep -i fragfail`; tcpdump увидит ретрансмиты одинаковых полных сегментов: `tcpdump -nn host TARGET and greater 1200`.
</details>

<details><summary>✅ Решение</summary>

```bash
# Быстрый фикс: снизить MSS на исходящем пути (TCP clamping)
sudo ip route add TARGET_IP/32 via DEFAULT_GW advmss 1240
# или на шлюзе/firewall: iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN \
#   -j TCPMSS --clamp-mss-to-pmtu

# Правильный фикс: найти узел, глушащий ICMP type3/code4, и разрешить его
tracepath speedtest.tele2.net     # где PMTU перестаёт расти — тот хоп и режет

# Вернуть MTU обратно после теста:
sudo ip link set dev eth0 mtu 1500

**Как предотвратить:** мониторинг PMTU до критичных пиров (ping -M do разного размера); в VPN-дизайне закладывать overhead (WireGuard 60B, IPsec ~73B) заранее; MSS-clamping на всех туннельных шлюзах — дефолт, а не фикс.
```
</details>

---

## 🔥 Сценарий 19: Соединения обрываются после ~200 одновременных

**Симптом:** под нагрузкой сервис начинает отбивать новые соединения. В логах ядра растёт счётчик, `dmesg` шумит. При этом CPU и память свободны.

```bash
# Воспроизводим исчерпание conntrack/nf_conntrack table full:
sudo sysctl -w net.netfilter.nf_conntrack_max=100   # искусственно занизим
for i in $(seq 1 300); do (nc -z -w2 localhost 80 &) ; done 2>/dev/null
dmesg -T | tail -3
# nf_conntrack: table full, dropping packet

# Диагностика текущего состояния:
sysctl net.netfilter.nf_conntrack_count net.netfilter.nf_conntrack_max
conntrack -S | head            # статистика по CPU
ss -s                          # сколько сокетов в каких состояниях
```

⏱️ **SLA: 15 минут**

<details><summary>💡 Подсказка 1</summary>

Каждое соединение, проходящее через iptables/NAT (а в K8s — всегда!), занимает запись в таблице conntrack. Таблица кончилась → ядро молча дропает новые пакеты.
</details>

<details><summary>💡 Подсказка 2</summary>

Считайте: `count/max` — если >70%, скоро падение. Кто жрёт записи? TIME_WAIT-сокеты от сканера/мониторинга тоже попадают в conntrack.
</details>

<details><summary>✅ Решение</summary>

```bash
# Немедленно:
sudo sysctl -w net.netfilter.nf_conntrack_max=262144
sudo sysctl -w net.netfilter.nf_conntrack_tcp_timeout_time_wait=30

# Постоянно: /etc/sysctl.d/99-conntrack.conf
#   net.netfilter.nf_conntrack_max = 262144
#   net.netfilter.nf_conntrack_tcp_timeout_established = 7440

# Память под таблицу: ~320 байт × max ≈ 84 МБ — проверить свободную RAM
sysctl vm.lowmem_reserve_ratio

**Как предотвратить:** алерт на conntrack_count/max > 70%; тюнинг timeouts под профиль трафика; для LB-хостов считать ожидаемое число записей при capacity planning.
```
</details>

---

## 🔥 Сценарий 20: TLS-рукопожатие занимает секунды

**Симптом:** первый HTTPS-запрос к внутреннему сервису медленный (1–2 сек только handshake), повторные — быстрые. Клиенты жалуются на «рывками».

```bash
# Замер фаз — наш главный инструмент:
curl -svso /dev/null -w 'dns=%{time_namelookup} conn=%{time_connect} tls=%{time_appconnect} total=%{time_total}\n' \
  https://internal-api.company.local/health

openssl s_client -connect internal-api.company.local:443 -servername internal-api.company.local </dev/null 2>/dev/null | openssl x509 -noout -text | grep -E 'CRL|OCSP|Issuer'
```

⏱️ **SLA: 15 минут**

<details><summary>💡 Подсказка 1</summary>

`tls=%{time_appconnect}` >> `conn=%{time_connect}` — проблема именно в TLS-фазе, не в сети. Что может делать клиент между ClientHello и Finished? Проверять отзыв сертификата!
</details>

<details><summary>💡 Подсказка 2</summary>

Посмотрите на Issuer вашего сертификата и попробуйте достучаться до OCSP/CRL URL из сертификата: `openssl x509 ... -text | grep -A2 'Authority Information Access'` → curl до этих URL.
</details>

<details><summary>✅ Решение</summary>

```bash
# Частый диагноз: корпоративный CA выдал сертификат с CRL на недоступный из DMZ URL,
# клиент ждёт таймаута CRL-check на каждое новое соединение.

# Проверка гипотезы:
curl -v $(openssl s_client -connect host:443 </dev/null 2>/dev/null \
  | openssl x509 -noout -text | awk -F'URI:' '/CRL Distribution/{print $2}')
# ← connection timed out

# Фиксы:
# 1) Открыть доступ к OCSP/CRL из сегмента (правильно)
# 2) На стороне сервера: включить stapling — сервер сам прикладывает OCSP-ответ
#    nginx: ssl_stapling on; ssl_stapling_verify on;
# 3) Для внутренних PKI: короткоживущие сертификаты без CRL (Vault PKI, см. Lab 10)

**Как предотвратить:** синтетический мониторинг полного curl-timing (dns/conn/tls/ttfb) до топ-10 внутренних API; при выпуске сертификатов проверять доступность CRL/OCSP из всех сегментов.
```
</details>

---

## 🔥 Сценарий 21: Один сервис душит сеть всего узла

**Симптом:** на многосервисном хосте один бэкап-джоб ночью забивает канал, остальные сервисы видят рост latency. Fair queuing не настроен, всё делит трафик поровну... кроме UDP от бэкапа, который съедает всё.

```bash
# Воспроизводим UDP-flood локально:
sudo tc qdisc add dev lo root netem delay 50ms     # имитация деградации
iperf3 -s &
iperf3 -c 127.0.0.1 -u -b 1G -t 60 &               # UDP-поток

# Наблюдение очередей интерфейса:
tc -s qdisc show dev eth0
tc -s class show dev eth0
```

⏱️ **SLA: 20 минут**

<details><summary>💡 Подсказка 1</summary>

Нужно разделение трафика по классам: интерактивному (API) — гарантия, bulk (бэкап) — остаток. Это задача traffic control: qdisc + classes + filters.
</details>

<details><summary>💡 Подсказка 2</summary>

Иерархия HTB: root qdisc → классы с rate/ceil → фильтры по портам/DSCP. Бэкап помечаем в iptables DSCP=CS1 («scavenger»).
</details>

<details><summary>✅ Решение</summary>

```bash
# Иерархический токен-бакет: API гарантируется 800M, бэкап — максимум 200M
sudo tc qdisc add dev eth0 root handle 1: htb default 30
sudo tc class add dev eth0 parent 1: classid 1:10 htb rate 800mbit ceil 1gbit
sudo tc class add dev eth0 parent 1: classid 1:20 htb rate 200mbit ceil 200mbit

# Маркируем бэкап-трафик:
sudo iptables -t mangle -A OUTPUT -p udp --dport 5001 -j MARK --set-mark 20
sudo tc filter add dev eth0 protocol ip parent 1: prio 1 u32 \
  match mark 20 0xff flowid 1:20
tc -s class show dev eth0    # наблюдаем распределение бит

# Постоянство: /etc/network/if-up.d/qos-скрипт или systemd unit

**Как предотвратить:** бэкапы/репликации — с rate-limit на уровне самого инструмента (rsync --bwlimit, restic --limit-upload); QoS-политика как код в etc-репозитории.
```
</details>

---

## 🔥 Сценарий 22: K8s-поды теряют связь после ребута узла

**Симптом:** после планового ребута worker-узла часть подов не имеет сети: ping до ClusterIP таймаутится, но NodePort работает. CNI — Calico/Cilium. Рестарт подов чинит, но это прод.

```bash
# Диагностика на проблемном узле (kind/docker имитация):
docker exec -it bf22-node bash
# внутри узла:
ip a show cni0                 # есть ли bridge? IP правильный?
bridge link                    # все ли veth в forwarding state?
iptables-save | grep -c cali   # правила CNI восстановились?
journalctl -u kubelet --since "10 min ago" | grep -iE 'cni|network' | tail
crictl ps | head               # pause-контейнеры живы?
```

⏱️ **SLA: 25 минут**

<details><summary>💡 Подсказка 1</summary>

NodePort работает → узел жив и kube-proxy правил цел. ClusterIP нет → сломан путь pod-to-pod/pod-to-service. Смотрите на CNI-компоненты узла: bridge, veth, правила iptables.
</details>

<details><summary>💡 Подсказка 2</summary>

Частая причина: CNI-агент узла (calico-node/cilium) не поднялся после ребута или iptables-правила не восстановились из-за порядка старта. `systemctl status calico-node` / посмотреть DaemonSet под этого узла.
</details>

<details><summary>✅ Решение</summary>

```bash
# 1. Статус CNI-агента узла:
kubectl get pods -n kube-system -o wide | grep -E 'calico|cilium' 
kubectl -n kube-system logs -l k8s-app=calico-node --field-selector spec.nodeName=NODE --tail=30

# 2. Типовой фикс без рестарта подов — пересоздать CNI-окружение узла:
systemctl restart kubelet       # kubelet перезапустит pause/sandbox контейнеры
# или точечно: crictl stopp <sandbox-id> && crictl rmp <sandbox-id>

# 3. Если iptables пустые — реconcile CNI:
calicoctl node status           # BGP-пиры восстановились?

# 4. Проверка восстановления:
kubectl exec -it test-pod -- curl -s service-name/health

**Как предотвратить:** порядок старта (CNI раньше workload'ов через priorityClass kube-system); тестовый reboot-тур узлов в staging после смены версии CNI; алерты на calico_node_bgp_sessions / cilium_agent_heartbeat.
```
</details>

---

## 🏁 Финальная самопроверка партии

| # | Навык | Инструмент-ключ |
| :--- | :--- | :--- |
| 17 | DNS search-path и ndots | dig, tcpdump, resolv.conf |
| 18 | PMTUD black hole | tracepath, ping -M do, MSS clamp |
| 19 | Conntrack исчерпание | sysctl, conntrack -S, ss |
| 20 | Медленный TLS handshake | curl -w timing, openssl, stapling |
| 21 | QoS разделение трафика | tc htb, iptables mark |
| 22 | CNI после ребута узла | journalctl kubelet, CNI-агент логи |

> Все шесть сценариев используют команды из арсенала [01.5](../01-linux-and-networking/05-linux-performance-diagnostics.md) — держите её открытой рядом.
