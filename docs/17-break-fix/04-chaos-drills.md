# 🌪️ Chaos Drills: Управляемые Поломки для Самостоятельных Учений

> Один скрипт — вся таблица симптомов. Запускаете дрель, наблюдаете картину глазами мониторинга/терминала, ставите диагноз по арсеналу [01.5](../01-linux-and-networking/05-linux-performance-diagnostics.md) и [01.2](../01-linux-and-networking/02-networking-and-troubleshooting.md). Скрипт лежит в `tools/chaos-lab.sh` в корне репозитория.

## ⚙️ Установка и правила

```bash
git clone <ваш-репозиторий> doka && cd doka
chmod +x tools/chaos-lab.sh
sudo tools/chaos-lab.sh list        # список дрелей

⚠️ ТОЛЬКО на VM/контейнерах/staging! Каждая дрель снимается сама по таймауту,
   кроме disk_fill — для него есть `sudo tools/chaos-lab.sh cleanup`.
```

Формат учений (15 минут на дрель):

1. **Запустите** дрель в одном терминале.
2. **Не подглядывая** в таблицу ниже — поставьте диагноз во втором (`uptime`, `vmstat`, `iostat`, `ss`, `dmesg`).
3. Сверьтесь с таблицей ожидаемых симптомов.
4. Ответьте на вопрос **«какой алерт это поймал бы в проде?»**.

---

## 📊 Таблица: дрель → симптомы → диагноз → алерт

| Дрель | Что делает | Симптомы (что увидите) | Правильный диагноз | Какой алерт нужен |
| :--- | :--- | :--- | :--- | :--- |
| `cpu_burn` | Жжёт все ядра | load = nproc; `%us` ~100; всё медленно, но отвечает | CPU-saturation: `mpstat -P ALL 1` покажет все ядра заняты | load > 2×ядер 5 мин |
| `mem_pressure` | Аллоцирует 70% RAM | `free` available падает; page cache сжат; возможен swap-in | Память близка к исчерпанию: `vmstat 1` si/so ≠ 0 | MemAvailable < 10% |
| `oom_kill_test` | Гарантированный OOM | Процесс исчезает; exit code 137 | OOM-killer: `dmesg \| grep -i oom` покажет жертву и oom_score | OOM events в kernel log |
| `disk_fill` | Занимает 90% /tmp | Приложения падают на записи; БД отказывается писать | Disk full: `df -h`; deleted-files ловушка не здесь | Использование диска > 85% |
| `disk_slowdown` | Ограничивает IOPS через cgroup | Рост `await` в `iostat -xz`; процессы в D-стате | IO-saturation: await > 100ms, aqu-sz растёт | await > 100ms или util > 90% |
| `net_latency` | +200ms RTT (netem) | Все сетевые операции медленные; таймауты приложений | Латентность сети: `ping` покажет RTT сразу | p99 latency приложения ↑ |
| `net_packet_loss` | Теряет 30% пакетов | Ретрансмиты; «иногда работает»; TCP медленно | `nstat -az \| grep Retrans`; mtr покажет потери | TCP retransmit ratio > 1% |
| `dns_blackhole` | Дропает UDP 53 | Всё, что резолвит имя, висит; соединения по IP работают | DNS недоступен: `dig +time=2 +tries=1 example.com` | DNS query failures / namelookup time |
| `conntrack_exhaust` | conntrack_max=500 | Новые соединения дропаются ядром молча | Table full: `dmesg`, `sysctl net.netfilter.nf_conntrack_{count,max}` | conntrack count/max > 70% |
| `k8s_kill_pods` | Force-deletes случайные поды | CrashLoop-подобная картина; restarts растут; сервис мигает | Хаос vs баг: события показывают deletion, не ошибку приложения | Pod restarts spike / availability SLO burn |
| `k8s_peg_cpu` | CPU-hog deployment | Узлы под давлением; соседние поды throttled | CFS throttling: `container_cpu_cfs_throttled_seconds_total` | Throttling > 5% у критичных |

---

## 🧪 Пример полного учения

```bash
# Терминал 1 — поломка:
sudo tools/chaos-lab.sh dns_blackhole 120

# Терминал 2 — диагностика вслепую:
curl -so /dev/null -w 'dns=%{time_namelookup}\n' https://example.com
# dns=5.003210          ← вот оно
dig +short +time=2 +tries=1 google.com
# ;; connection timed out; no servers could be reached
ping -c1 1.1.1.1                       # ICMP идёт → сеть жива
ss -tnp | grep ':53'                   # соединений к DNS нет вообще
# Диагноз: DNS blackhole. В проде искали бы firewall/NAT/resolved.

# Вопрос самопроверки: какой алерт поймал бы это ДО пользователей?
# Ответ: синтетика curl-timing с порогом time_namelookup > 500ms.
```

## 🧪 K8s-учения поверх kind (связка с Lab 03/09)

```bash
kind create cluster --name chaos
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/metrics-server/master/manifests/releases/kube-components.yaml

K8S_NS=default tools/chaos-lab.sh k8s_peg_cpu 60 &
watch -n2 'kubectl top nodes; kubectl get pods'
# Наблюдайте: как ведёт себя HPA из Lab 09 при внешнем CPU-давлении?
# Это же упражнение объясняет, почему requests обязателен.
```

## 🎯 Чек-лист зрелости учений

- [ ] Каждая дрель отработана минимум дважды: «глупый» прогон и прогон с алертами включёнными
- [ ] Для каждой дрели записано время до постановки диагноза (цель: < 5 минут)
- [ ] Алерты, найденные в колонке «какой алерт нужен», реально заведены в мониторинг
- [ ] Учения идут по расписанию (ежемесячно), а не «когда вспомним»
- [ ] Скрипт никогда не запускался в проде; в CI есть guard (hostname check)

!!! warning "Ответственность"
    Скрипт намеренно грубый — он для обучения. Для хаос-инженерии в проде существуют управляемые инструменты (Chaos Mesh, Litmus) с blast radius, abort-кнопкой и экспериментами как CRD. Начните со стенда, потом читайте про них.
