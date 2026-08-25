# 🔬 05. Диагностика Производительности Linux: Полный Арсенал Команд

> Рабочая шпаргалка «сервер тормозит»: все команды, которыми реально пользуются в проде — от `uptime` до `strace`. Каждая команда — копипаст с пояснением, что смотреть в выводе.

## ⚙️ Методология USE и порядок обхода

```mermaid
graph LR
    A["1. Обзор: uptime, dmesg"] --> B["2. Ресурс: CPU → RAM → Disk → Net"]
    B --> C["3. Узкий процесс: pidstat, strace"]
    C --> D["4. Причина: конфиг, лимиты, код"]
```

USE = для каждого ресурса: **U**tilization (насколько занят) → **S**aturation (очередь запросов) → **E**rrors (ошибки). Не прыгать сразу в `top` — сначала 60-секундный обзор:

```bash
uptime                      # load average за 1/5/15 мин
dmesg -T | tail -30         # свежие ошибки ядра (OOM, диск, NIC)
vmstat 1 5                  # системная картина целиком
```

Расшифровка load average: значение ≈ числу ядер — норма (`nproc` покажет сколько). Load выше ядер при пустом `%us` в top = ждут диски/сеть (смотрим колонку `wa`, процессы в D-стате).

---

## 🧠 CPU

### Осмотр

```bash
nproc                       # число ядер (базовая метрика для всех оценок)
lscpu                       # модель, частоты, NUMA-узлы, кэши
mpstat -P ALL 1             # утилизация ПО КАЖДОМУ ядру: us/sy/wa/id/st
ps aux --sort=-%cpu | head  # топ процессов по CPU
pidstat -u 1                # динамика CPU по PID за секунду
pidstat -u -p ALL -t 1      # то же по потокам (кто именно жрёт внутри)
```

Куда смотреть в `mpstat`:

| Колонка | Значение | Тревога |
| :--- | :--- | :--- |
| `%usr` | пользовательский код | высокое — профилировать приложение |
| `%sys` | ядро (syscall'ы) | >20–30% — много syscall/IO, смотреть strace |
| `%iowait` | простое в ожидании диска | высокое при низком load-CPU — узкое место НЕ процессор |
| `%steal` | забрал гипервизор | >5% на VM — noisy neighbor, менять хостинг |
| `%soft` | softirq (сеть!) | одно ядро в 100% soft при росте трафика — RPS/XPS настройка |

### Профилирование

```bash
perf top                    # живой профиль: какие функции жгут CPU прямо сейчас
perf stat -p $(pgrep -f shop-api) sleep 10   # IPC, cache-misses, контекст-свичи
perf record -F 99 -g -p $PID -- sleep 30 && perf report   # flamegraph-основа

# Контекст-свичи: добровольные (ждут IO) vs принудительные (перегруз CPU)
vmstat 1 | awk '{print $11, $12}'
cat /proc/$PID/status | grep ctxt
```

### Управление приоритетами и привязкой

```bash
nice -n 10 ./batch-job.sh              # запустить уступчиво
renice -n 5 -p 12345                   # понизить приоритет живого процесса
taskset -pc 0-3 12345                  # закрепить за конкретными ядрами (NUMA!)
ionice -c3 -p 12345                    # только idle-time IO (см. раздел Диск)
```

---

## 🧮 Память

```bash
free -h                     # available — вот что важно, НЕ free!
vmstat 1                    # si/so ≠ 0 стабильно = активный своп, памяти мало
cat /proc/meminfo | grep -E 'MemAvailable|Cached|Slab|SReclaimable'
slabtop -o | head           # утечки через структуры ядра (dentry/inode)
ps aux --sort=-%mem | head  # топ по RSS
smem -rk | head -15         # точный учёт с PSS (общие страницы делим)
pmap -x $PID | sort -k3 -n -r | head    # карта памяти процесса
```

Чтение `free -h`: строка `-/+ buffers/cache` исчезла в новых версиях; ориентир — **available**. Linux отдаёт память под page cache («buff/cache»), это нормально и освобождается само. Чистить вручную почти никогда не нужно:

```bash
sync && echo 3 > /proc/sys/vm/drop_caches    # только для бенчмарков, не лечение!
swapoff -a && swapon -a                       # выгнать всё из свопа (осторожно)
```

### OOM: кто убил и почему

```bash
dmesg -T | grep -iE 'oom|out of memory'
journalctl -k | grep -i oom
grep -ri oom /var/log/ 2>/dev/null | tail

# Почему выбрало именно этот процесс? oom_score учитывает RSS и oom_score_adj
cat /proc/$PID/oom_score /proc/$PID/oom_score_adj
systemctl show nginx.service | grep -i oom    # защита юнитов: OOMScoreAdjust=-500
```

### Лимиты и cgroup

```bash
ulimit -a                                   # лимиты текущего шелла
prlimit --pid $PID                          # ЛИМИТЫ ЖИВОГО ПРОЦЕССА
cat /proc/$PID/status | grep -E 'VmRSS|Threads'
ls /proc/$PID/task | wc -l                  # потоки vs лимит nproc

# Постоянные лимиты сервиса — через systemd, а не /etc/security/limits.conf
systemctl edit nginx.service
# [Service]
# LimitNOFILE=65536
# TasksMax=infinity
```

---

## 💿 Диски и IO

### Оценка нагрузки

```bash
df -hT                                      # места и типы ФС; inode: df -i !
du -sh /* 2>/dev/null | sort -h             # где место (углубляться рекурсивно)
ncdu /                                       # интерактивный анализ (ставится пакетом)
iostat -xz 1                                # ГЛАВНАЯ команда по IO
iotop -oPa                                  # кто пишет/читает прямо сейчас
```

Чтение `iostat -xz`:

| Метрика | Норма | Проблема |
| :--- | :--- | :--- |
| `%util` | <80% | упирается в устройство (для RAID/NVMe условнее) |
| `await` | <10ms SSD / <20ms HDD | выше — очередь на устройстве |
| `aqu-sz` | ~0–1 | глубина очереди; растёт вместе с await |
| `r/s, w/s` | — | IOPS-профиль для планирования ёмкости |

### Бенчмарк и здоровье

```bash
# Последовательная скорость чтения
hdparm -tT /dev/sda
dd if=/dev/zero of=/tmp/test bs=1M count=1024 oflag=direct status=progress && rm /tmp/test

# Fio: честный тест случайного IO как у БД (4k randread/randwrite)
fio --name=rr --filename=/tmp/fio.test --size=1G --rw=randread \
    --bs=4k --iodepth=32 --ioengine=libaio --direct=1 --numjobs=4 --time_based --runtime=30

smartctl -H /dev/sda                        # здоровье SMART: Reallocated_Sector_Count!
lsblk -o NAME,SIZE,TYPE,MOUNTPOINT,MODEL
findmnt -no OPTIONS /var/lib/postgresql     # noatime стоит?
```

### Классика: место кончилось, а du ничего не находит

```bash
# Удалённый файл держит живой процесс — место освободится только после рестарта
lsof +L1                                    # или: lsof | grep deleted
truncate -s 0 /proc/$(lsof -t /var/log/app.log | head -1)/fd/$(...)  # экстренно
# Правильно: echo > /var/log/huge.log (не rm!), потом ротация
journalctl --disk-usage && journalctl --vacuum-size=500M
```

---

## 🌐 Сеть

### Связность и маршрут

```bash
ping -c4 8.8.8.8                            # L3 связность (без DNS!)
ping -c4 ya.ru                              # + проверка резолвинга
mtr -rwc 50 api.partner.com                 # маршрут + потери по хопам (лучше traceroute)
traceroute -T -p 443 api.partner.com        # TCP-traceroute сквозь фильтры ICMP
tracepath ya.ru                             # без root, показывает PMTU
iperf3 -s                                   # на сервере
iperf3 -c server -P4 -t 10                  # пропускная способность (4 потока)
```

### Порты и сокеты

```bash
ss -tulpn                                   # ВСЕ слушающие порты + процессы
ss -tn state established '( dport = :5432 )'   # соединения к БД
ss -s                                       # итоги: сколько в каждом состоянии
nc -zv db.internal 5432                     # порт открыт? (TCP-проба без telnet)
nc -l 9999                                  # мини-сервер для проверки файрвола
curl -sv telnet://db.internal:5432          # то же через curl, если нет nc
```

Подсчёт соединений по состояниям (детект SYN-flood или исчерпания):

```bash
ss -ant | awk '{print $1}' | sort | uniq -c
# Много TIME_WAIT — это норма при high RPS; много CLOSE_WAIT — утечка сокетов в приложении
```

### DNS

```bash
dig example.com                             # полный ответ: статус, авторитеты, время
dig +short example.com                      # только ответ
dig @8.8.8.8 example.com A +norecurse       # спросить конкретный сервер
dig -x 10.0.0.5 +short                      # PTR
host example.com                            # короткая альтернатива
resolvectl status                           # кто реально резолвит (systemd-resolved)
resolvectl query example.com
time dig example.com | grep Query           # задержка DNS в мс
```

Диагностика «иногда не резолвится»: сравнить ответы двух серверов (`dig @1.1.1.1` против локального), проверить TTL и ndots в `/etc/resolv.conf` (медленный поиск суффиксов).

### HTTP и TLS

```bash
# Разложение latency по фазам — первая команда при «сайт тормозит»
curl -so /dev/null -w 'dns=%{time_namelookup} conn=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total}\n' https://api.example.com/health

curl -I https://example.com                 # заголовки, редиректы, кэш
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null | openssl x509 -noout -dates -subject
```

### Интерфейсы и счётчики

```bash
ip -br a                                    # адреса кратко
ip -br link                                 # up/down, ошибки
ip r                                        # таблица маршрутов, default via
ip neigh                                    # ARP-таблица (Incomplete = проблема L2)
ethtool eth0                                # скорость линка, duplex
ethtool -S eth0 | grep -iE 'drop|err'       # дропы на уровне NIC
nstat -az | grep -iE 'retrans|drop|fail'    # TCP-ретрансмиты и дропы
tc -s qdisc show dev eth0                   # очереди интерфейса, дропы qdisc
nmcli dev status                            # NetworkManager-обзор
tcpdump -i eth0 -nn host 10.0.0.5 and port 5432 -c 100   # захват (см. фильтры ниже)
```

Полезные фильтры tcpdump:

```bash
tcpdump -i any -nn port 53                                   # весь DNS-трафик
tcpdump -i eth0 -nn src net 10.0.0.0/24 and not port 22      # подсеть без SSH-шума
tcpdump -i eth0 -w /tmp/cap.pcap -c 10000                    # сохранить для Wireshark
tcpdump -i eth0 -nn 'tcp[tcpflags] & (tcp-rst|tcp-syn) != 0' # только SYN/RST
```

---

## 🕵️ Процессы, Syscall'ы и Открытые Ресурсы

### Поиск и сигналы

```bash
pgrep -af nginx                             # найти процесс по имени с аргументами
pkill -f 'python.*worker.py'                # убить по шаблону
kill -TERM 12345                            # мягко (дефолт)
kill -9 12345                               # жёстко (после TERM и паузы!)
kill -USR1 12345                            # кастомный сигнал (ротация логов, dump стека)
timeout 30 rsync -a src dst                 # команда с ограничением времени
watch -n2 'kubectl get pods -A'             # повтор команды каждые N сек
```

Порядок остановки всегда: TERM → подождать → KILL. KILL не даёт процессу сбросить буферы и снять lock'и — прямой путь к битым данным.

### strace: что процесс делает на самом деле

```bash
strace -p 12345                             # подключиться к живому
strace -f -p 12345 -e trace=openat,read,write    # с потоками, только файловые операции
strace -c -p 12345                          # статистика syscall'ов за период
strace -ttT -p 12345                        # с таймстампами и длительностью каждого вызова
strace -e trace=network -p 12345            # только сеть (connect/sendto)
strace -f -e trace=%process ./app           # fork/exec клонирование
```

Быстрая интерпретация:

- Процесс висит, CPU ноль → в strace видно последний syscall: `recvfrom(...` = ждёт сеть, `futex(...` = ждёт лок/потоки, `read(фд_диска` = медленный IO.
- Тысячи `openat()` подряд → нет кэша конфигов, смотреть приложение.
- `nanosleep` доминирует → процесс просто idle, ищите другого виновника.
- `ENOENT`, `EACCES` в выводе → отсутствующие файлы или права — причина падений.

### lsof/fuser: кто держит файлы и порты

```bash
lsof -p $PID                                # всё открытое процессом: файлы, сокеты, pipe
lsof /var/log/syslog                        # кто держит файл
lsof -i :8000                               # кто слушает/использует порт
fuser -v 8000/tcp                           # компактно о том же
fuser -km /mnt/share                        # убить всех, кто держит маунт (перед umount!)
umount /mnt/share                           # target is busy → искать через lsof/fuser
```

### Заглядывание в /proc

```bash
cat /proc/$PID/status | grep -E 'State|Threads|VmRSS'
cat /proc/$PID/limits                       # фактические лимиты (NoFile!)
ls -lh /proc/$PID/fd | wc -l                # открытые дескрипторы сейчас
cat /proc/$PID/io                           # фактический read/write байт процесса
cat /proc/$PID/cmdline | tr '\0' ' '        # чем реально запущен
ls -l /proc/$PID/cwd /proc/$PID/exe         # рабочий каталог и бинарник
cat /proc/$PID/environ | tr '\0' '\n'       # окружение (секреты не логировать!)
```

---

## 🎛️ Ядро и Тюнинг: sysctl, который трогают чаще всего

```bash
sysctl -a | grep -E 'somaxconn|file-max|swappiness|tw_reuse'

# Сетевой стек под высокие нагрузки
sysctl -w net.core.somaxconn=4096               # очередь accept() у слушающих сокетов
sysctl -w net.ipv4.tcp_max_syn_backlog=8192
sysctl -w net.ipv4.ip_local_port_range="10240 65535"   # исходящие порты (много upstream-коннектов)
sysctl -w net.ipv4.tcp_tw_reuse=1               # быстрый переиспользование TIME_WAIT (исходящие)

# Память
vm.swappiness=10                    # меньше свопа для БД-хостов
vm.dirty_ratio=20                   # баланс flush'ей для write-heavy

# Файловые дескрипторы глобально
fs.file-max=2097152
```

Постоянно — в `/etc/sysctl.d/99-tuning.conf` + `sysctl --system`. Изменение sysctl на живом нагруженном сервере — через канареечный узел: часть значений (например, `rmem`) влияет на поведение мгновенно.

---

## 🚨 Готовые сценарии диагностики

### «Сервер тормозит» — 60 секунд обзора

```bash
uptime && nproc                                     # load vs cores
dmesg -T | tail -20                                 # OOM/диски
vmstat 1 5                                          # r/b, wa, si/so
iostat -xz 1 3                                      # await/util
mpstat -P ALL 1 3 | tail -$(($(nproc)+1))           # распределение по ядрам
pidstat -u 1 3 | sort -k8 -rn | head                # главный потребитель
```

### «Высокий load, но CPU свободен»

Это D-стат (непрерываемый сон): процессы ждут диск/NFS/FUSE.

```bash
ps -eo state,pid,cmd | awk '$1=="D"'                # список застрявших
iostat -xz 1                                        # await подтвердит
cat /proc/$PID/stack 2>/dev/null                    # где именно в ядре висит
```

### «Приложение падает без причины»

```bash
journalctl -u myapp -n 100 --no-pager               # логи юнита
systemctl status myapp                              # код выхода (137 = SIGKILL = OOM?)
dmesg -T | grep -i oom                              # подтвержить OOM
ExitCode 137 → смотреть VmRSS vs MemoryMax в cgroup:
systemctl show myapp -p MemoryMax
cat /sys/fs/cgroup/system.slice/myapp.service/memory.max   # cgroup v2
```

### «Порт недоступен между машинами»

```bash
ss -tlnp | grep 5432            # 1) слушает ли вообще? (и на каком адресе! 127.0.0.1 vs 0.0.0.0)
nc -zv localhost 5432           # 2) локально работает?
nc -zv <server-ip> 5432         # 3) с другой машины?
firewall-cmd --list-all || ufw status verbose || iptables -L -n   # 4) файрвол
tcpdump -i any -nn port 5432 &  # 5) пакеты приходят, но молчат? — приложение
```

---

## 🔬 Deep Dive: почему top показывает 200% CPU у процесса, который «ничего не делает»

Три самых частых ложных следствия в диагностике:

1. **CPU 100%, а приложение медленное** — это spin-lock или GC. `perf top` покажет функции; если там `malloc/free` и `memcpy` — аллокационная буря, а не полезная работа. IPC < 1.0 при высоком %usr = кэш-промахи.
2. **Своп занят, но si/so нулевые** — страницы легли в своп давно и больше не нужны. Это не тормозит. Тормозит активный свопинг (si/so ≠ 0 постоянно).
3. **`%iowait` высокий, а диски быстрые** — iowait считается относительно простоя CPU: он растёт и когда нагрузка просто мала. Смотреть надо `await` и `aqu-sz`, а не wa.

И правило последней инстанции: если после часа анализа непонятно — собрать данные и уйти: `sar -A > /tmp/sar.txt`, `perf record -g -a sleep 60`, `sos report` (RHEL) / `supportconfig` (SUSE). Продолжать тыкать вслепую дороже, чем приложить артефакты к тикету.

---

## 🧨 Типовые грабли Production

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `Too many open files` в приложении | LimitNOFILE дефолт 1024 | systemd override `LimitNOFILE=65535`, проверить `/proc/PID/limits` |
| Диск full, du чистый | deleted-файлы держатся процессом | `lsof +L1`; truncate вместо rm; ротация |
| Load 50, CPU 5% | D-стат: медленный диск/NFS завис | `ps awk '$1=="D"'`, iostat await, стек `/proc/PID/stack` |
| Приложение умерло, exit 137 | OOM-killer или MemoryMax в cgroup | `dmesg \| grep oom`; поднять лимит или чинить утечку |
| Соединения к БД отваливаются по таймауту | Исчерпан local_port_range / somaxconn | sysctl выше; `ss -s` на TIME_WAIT/CLOSE_WAIT |
| «Иногда» медленный DNS | ndots/resolv.conf перебор суффиксов | `time dig`, resolvectl, фиксировать search-домены |
| TCP retransmits растут после релиза | MTU/проблемы сети, не приложения | `nstat az`, mtr, сверить MTU на пути |

## 🧪 Hands-on Lab

```bash
# Безопасный стенд для тренировки всего арсенала (docker)
docker run --rm -it --name perf-lab debian:12 bash -c '
  apt-get update -qq && apt-get install -y -qq procps sysstat lsof strace curl dnsutils netcat-openbsd iproute2 iputils-ping >/dev/null;
  bash'
# Внутри:
stress-ng --cpu 2 --timeout 30 &      # apt-get install stress-ng; наблюдать mpstat/top
strace -c -f sleep 5                   # статистика syscall'ов
ss -tulpn; nc -zv localhost 22         # сеть
iostat -x 1 3                          # IO

# На любом сервере: замерить свой «health-снимок» одной строкой
{ uptime; free -h; df -h /; ss -s; } > health-$(date +%F).txt
```

## ✅ Чек-лист зрелости темы

- [ ] sysstat (sar/iostat/mpstat) установлен и собирает историю на всех серверах
- [ ] Алерты: load > 2×ядер, disk util > 90%, OOM в dmesg, fd > 80% лимита
- [ ] Для каждого критичного сервиса заданы LimitNOFILE/MemoryMax осознанно
- [ ] Есть runbook «сервер тормозит» со сценарием 60-секундного обзора
- [ ] sysctl-тюнинг версионируется в Git (etc-репозиторий/ansible-роль)
- [ ] sar-история позволяет ответить на вопрос «что было вчера в 03:00»

---

## 🧭 Что дальше

| Шаг | Материал |
| :--- | :--- |
| 💪 Практика | [Инцидент «сервер тормозит»](../17-break-fix/02-incident-simulations-part2.md) |
| 🎤 Проверить себя | [Вопросы собесов: диагностика](../14-interview-prep/03-100-devops-interview-questions-bank-part1.md) |

---

## 🎤 Пять вопросов для повторения


**В1. Load average 40 при 8 ядрах, %usr низкий. О чём это говорит и куда смотреть дальше?**

<details><summary>Ответ</summary>

Процессы стоят в очереди не на CPU, а чаще всего в D-стате — ждут диск/NFS. Смотреть: ps -eo state,pid,cmd | awk '$1=="D"', затем iostat -xz (await, aqu-sz) и /proc/PID/stack для точки зависания в ядре.

</details>


**В2. Чем available отличается от free в выводе free -h и почему большой buff/cache не проблема?**

<details><summary>Ответ</summary>

free — совершенно неиспользуемая память; available — сколько можно выделить без свопа с учётом reclaimable page cache. Linux агрессивно отдаёт свободную память под кэш файлов и отдаёт её обратно по требованию, поэтому чистить drop_caches «для лечения» бессмысленно и вредно.

</details>


**В3. Процесс висит, потребляет ~0% CPU. Как strace помогает найти причину? Приведите примеры типовых картин.**

<details><summary>Ответ</summary>

strace -p PID показывает последний syscall, на котором процесс заблокирован: recvfrom — ждёт сетевой ответ, read на fd диска — медленный IO, futex — ждёт лок потоков, nanosleep — просто idle. Статистика strace -c за период выявляет аномально дорогие системные вызовы.

</details>


**В4. df показывает 100%, а du суммарно находит мало файлов. В чём классическая причина и команды решения?**

<details><summary>Ответ</summary>

Удалённые файлы, которые держат открытыми живые процессы: место освободится только после закрытия дескриптора. Найти: lsof +L1. Экстренно очистить через truncate/echo > файл (не rm!), правильно — ротация логов.

</details>


**В5. Что означает exit code 137 у упавшего сервиса и как подтвердить гипотезу?**

<details><summary>Ответ</summary>

128+9 = процесс убит сигналом SIGKILL, самый частый источник — OOM-killer или лимит MemoryMax в cgroup. Подтверждение: dmesg -T | grep -i oom, journalctl -u service, сравнить VmRSS процесса с memory.max его cgroup.

</details>
