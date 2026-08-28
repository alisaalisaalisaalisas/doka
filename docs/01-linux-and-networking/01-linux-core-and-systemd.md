# 🐧 01. Ядро Linux, Процессы, Память и Systemd

## 🧠 Архитектура ОС и уровни абстракции

Linux разделен на два основных пространства памяти:
- **Kernel Space (Пространство ядра):** Неограниченный доступ к памяти и аппаратному обеспечению (Ring 0). Здесь работают планировщик процессов, стек TCP/IP, драйверы устройств.
- **User Space (Пользовательское пространство):** Изолированная среда выполнения пользовательских программ (Ring 3). Взаимодействие с ядром происходит исключительно через **Системные вызовы (System Calls / Syscalls)**.

```mermaid
graph TD
    UserApp["Пользовательские приложения (Nginx, Docker, Python)"] -->|Syscalls: read, write, clone, socket| GLIBC["C Library (glibc/musl)"]
    GLIBC --> Kernel["Ядро Linux (Kernel Space)"]
    subgraph KernelSpace["Kernel Space Subsystems"]
        Kernel --> Scheduler["Scheduler (CFS/EEVDF)"]
        Kernel --> VFS["Virtual File System (VFS)"]
        Kernel --> Net["Network Stack"]
        Kernel --> MM["Memory Management (Paging, OOM)"]
    end
    KernelSpace --> Hardware["Hardware (CPU, RAM, Disk, NIC)"]
```

---

## ⚙️ Управление процессами и жизненный цикл

### 1. Состояния процессов (Process States)
- `R (Running/Runnable)` — выполняется или готов к выполнению.
- `S (Interruptible Sleep)` — ждет события (сигнала, таймера, ввода/вывода).
- `D (Uninterruptible Sleep)` — ожидает ответа от диска/сети. Процесс нельзя убить даже `kill -9` до завершения I/O.
- `Z (Zombie)` — завершил работу, но родительский процесс еще не прочитал код возврата через `wait()`.
- `T (Stopped/Traced)` — остановлен сигналом (`SIGSTOP`, `Ctrl+Z`) или отладчиком (`gdb`/`strace`).

### 2. POSIX-сигналы (Критически важно для контейнеров и graceful shutdown)
| Сигнал | Код | Поведение | Обработка приложением |
| :--- | :--- | :--- | :--- |
| `SIGHUP` | 1 | Перезагрузка конфигурации | Перехватывается (Reload) |
| `SIGINT` | 2 | Прерывание с клавиатуры (`Ctrl+C`) | Перехватывается |
| `SIGQUIT` | 3 | Завершение с генерацией Core Dump | Перехватывается |
| `SIGKILL` | 9 | Мгновенное принудительное уничтожение ядра | **Не перехватывается и не блокируется** |
| `SIGTERM` | 15 | Запрос на штатное завершение (Default) | Перехватывается (Graceful Shutdown) |
| `SIGCHLD` | 17 | Уведомление родителю о завершении потомка | Перехватывается |

### 3. Cheat Sheet: Диагностика процессов
```bash
# Дерево процессов с PID и аргументами
ps auxf

# Топ процессов по потреблению памяти
ps aux --sort=-%mem | head -n 10

# Топ процессов по CPU
ps aux --sort=-%cpu | head -n 10

# Поиск зависших процессов в состоянии D (Uninterruptible Sleep)
ps -eo state,pid,cmd | grep "^D"

# Трассировка системных вызовов работающего процесса
strace -p <PID> -f -e trace=network,file -s 256

# Трассировка с замером времени выполнения каждого системного вызова
strace -c -p <PID>
```

---

## 💾 Память: Архитектура, Swap и OOM-Killer

### 1. Как распределяется память
- **Virtual Memory:** Выделенное процессу виртуальное адресное пространство.
- **Resident Set Size (RSS):** Физическая оперативная память, занятая процессом в данный момент (без учета выгруженного в Swap).
- **Page Cache / Buffers:** Неиспользуемая процессами RAM, которую ядро отдает под кэширование файлов с диска для ускорения чтения. При нехватке памяти ядро автоматически сбрасывает кэш.

### 2. OOM-Killer (Out of Memory Killer)
Когда в системе заканчивается физическая RAM и Swap, ядро активирует механизм OOM-Killer. Он вычисляет `oom_score` для каждого процесса:
$$\text{oom\_score} = \text{Badness Function}(\% \text{RAM}, \text{RunTime}, \text{oom\_score\_adj})$$

```bash
# Просмотр OOM Score конкретного процесса
cat /proc/<PID>/oom_score

# Логи срабатывания OOM Killer
dmesg -T | grep -i -E "oom|out of memory|killed process"
journalctl -k | grep -i "killed process"
```

---

## 🎛️ Systemd: Архитектура юнитов и управление сервисами

### 1. Шаблон Production-ready Systemd Unit
Создаем сервис: `/etc/systemd/system/myapp.service`

```ini
[Unit]
Description=Production Go Web Application
Documentation=https://wiki.company.internal/apps/myapp
After=network.target network-online.target
Wants=network-online.target

[Service]
Type=simple
User=appuser
Group=appuser
WorkingDirectory=/opt/myapp
EnvironmentFile=/etc/myapp/app.env
ExecStart=/opt/myapp/bin/server --config=/etc/myapp/config.yaml
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=5s

# Защита и лимиты безопасности (Security Hardening)
LimitNOFILE=65535
LimitNPROC=4096
PrivateTmp=true
ProtectSystem=full
ProtectHome=true
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
```

### 2. Управление сервисами (systemctl & journalctl)
```bash
# Перечитать файлы юнитов после изменения
sudo systemctl daemon-reload

# Включить автозапуск и сразу стартовать
sudo systemctl enable --now myapp.service

# Просмотр логов сервиса в реальном времени с форматированием
journalctl -u myapp.service -f -o cat

# Логи за последние 30 минут с фильтром по уровню ошибок
journalctl -u myapp.service --since "30 min ago" -p err..emerg

# Проверка времени загрузки системы (анализ узких мест)
systemd-analyze blame
systemd-analyze critical-chain
```

---

## 📦 Namespaces и Cgroups: Основа контейнеризации

Контейнеры в Linux — это не виртуальные машины, а обычные процессы, изолированные с помощью двух механизмов ядра:

```mermaid
graph LR
    subgraph Host["Linux Kernel Features"]
        NS["Namespaces (Что видит процесс)"]
        CG["Cgroups v1/v2 (Сколько ресурсов может использовать)"]
    end
    NS -->|Изоляция: PID, NET, MNT, IPC, UTS, USER| Container["Изолированный контейнер"]
    CG -->|Лимиты: CPU quota, Memory max, I/O bandwidth, PIDs max| Container
```

| Механизм | Тип | Назначение |
| :--- | :--- | :--- |
| **Namespaces** | `pid` | Изоляция дерева процессов (внутри контейнера процесс видит себя как PID 1). |
| | `net` | Собственные сетевые интерфейсы, IP-адреса, таблицы маршрутизации и iptables. |
| | `mnt` | Собственная корневая файловая система (mount points). |
| | `ipc` | Изоляция межпроцессного взаимодействия (Shared Memory, Semaphores). |
| | `uts` | Собственный Hostname и доменное имя. |
| | `user` | Маппинг UID/GID (root внутри контейнера = non-root на хосте). |
| **Cgroups (v2)** | `cpu.max` | Ограничение квантов процессорного времени (CPU Quota / Throttling). |
| | `memory.max` | Жесткий лимит оперативной памяти (Hard Limit). |
| | `pids.max` | Защита от fork-бомб (ограничение количества процессов/тредов). |

---

## 🔬 Deep Dive: что происходит при `kill -9` и почему это опасно

1. Ядро отправляет сигнал `SIGKILL`, который **невозможно перехватить** — обработчиков не существует.
2. Процесс не выполняет очистку: временные файлы остаются, PID-файлы протухают, TCP-сокеты обрываются без `FIN`.
3. Для СУБД это риск потери транзакций (WAL не зафлашен), для очередей — дубликаты сообщений.
4. Поэтому все production-юниты должны ловить `SIGTERM` и делать graceful shutdown c таймаутом < `TimeoutStopSec`.

### Тайминг graceful shutdown в systemd

| Параметр | Дефолт | Рекомендация |
| :--- | :--- | :--- |
| `TimeoutStopSec` | 90s | = вашему максимальному времени завершения запросов |
| `KillMode` | control-group | оставлять (убивает всю группу процессов) |
| `Restart` | no | `on-failure` + `StartLimitBurst` для защиты от шторма рестартов |

## 🔥 cgroups v2 vs v1: что изменилось на практике

| Аспект | v1 | v2 |
| :--- | :--- | :--- |
| Иерархия | несколько параллельных деревьев | единое дерево `/sys/fs/cgroup` |
| Memory pressure | только OOM kill | `memory.pressure` (PSI) — предиктивные алерты |
| Делегирование | root-only | безопасная делегация юзерским юнитам |
| K8s поддержка | legacy | обязательна для `QoS` корректных эвикций |

```bash
# PSI: как давно процессы ждут память/CPU/IO (ядро ≥ 4.20)
cat /proc/pressure/memory /proc/pressure/cpu /proc/pressure/io

# Куда реально ушла память процесса (RSS map)
pmap -x $(pidof myapp) | sort -k3 -n | tail
```

---

<!-- enriched:v1 -->

## 🧨 Типовые грабли Production (systemd — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `Failed at step EXEC spawning ... No such file` | `ExecStart` без `+x` или опечатка пути | `journalctl -u myapp -n 20`, `ls -l /opt/myapp/bin/server`, `chmod +x`, `daemon-reload` |
| `activating (auto-restart)` цикл, `status=9/KILL` | `MemoryMax=10M` → OOM внутри cgroup | `journalctl -u myapp -p warning`, `systemctl show myapp -p MemoryMax,NRestarts`, поднять `MemoryMax=200M` |
| Изменение unit не применяется | Забыли `daemon-reload` | `systemctl daemon-reload && systemctl restart myapp` |
| `TasksMax` / `Too many open files` | Лимит `TasksMax=64` / `LimitNOFILE=1024` исчерпан | `systemctl show myapp -p TasksMax,LimitNOFILE`, `ls /proc/$PID/task | wc -l`, `LimitNOFILE=65535` |

!!! warning "Правило пяти почему"
    Каждый инцидент заканчивается не фиксом, а **post-mortem** с 5×Why и action items в бэклоге. Иначе грабли возвращаются через квартал — но уже в пятницу вечером.

## 🧪 Hands-on Lab (25 минут): диагностика юнита как в дежурстве

!!! abstract "Формат"
    **Стенд:** любая Linux VM или WSL2. **Легенда:** сервис `myapp` падает, вы дежурный. Каждый шаг = команда → ожидаемый вывод → что делать дальше.

### Шаг 1. Воспроизведите «сломанный» сервис

```bash
sudo tee /etc/systemd/system/myapp.service <<'EOF'
[Unit]
Description=Demo app for lab
[Service]
ExecStart=/usr/bin/sleep 100000
Restart=on-failure
# Ошибки специально: нет After=network.target, лимит памяти 10М
MemoryMax=10M
EOF
sudo systemctl daemon-reload && sudo systemctl start myapp.service
sleep 3 && systemctl status myapp --no-pager | head -8
```

**Ожидаемый вывод:** `Active: activating (auto-restart)` и счётчик рестартов — сервис циклически умирает.

### Шаг 2. Соберите доказательства (три команды дежурного)

```bash
systemctl status myapp --no-pager -l          # состояние + последние строки лога
journalctl -u myapp.service -n 20 --no-pager  # полный журнал юнита
systemd-analyze critical-chain myapp.service  # где теряется время при старте
```

**Ожидаемый вывод:** `journalctl` покажет `Main process exited, code=killed, status=9/KILL` — процесс убит по OOM от нашего `MemoryMax=10M`.

??? question "Почему status=9, а не exit code приложения?"
    Сигнал 9 (SIGKILL) отправил kernel OOM-killer внутри cgroup юнита: `MemoryMax` — жёсткий лимит cgroup v2. Отличать «приложение упало само» (exit≠0) от «убил ядро/лимит» — первый шаг любого разбора.

### Шаг 3. Исправьте и проверьте идемпотентность

```bash
sudo systemctl edit myapp.service      # добавьте:
# [Service]
# MemoryMax=200M

sudo systemctl restart myapp.service && systemctl is-active myapp   # active
systemctl show myapp -p MemoryMax,NRestarts                          # 209715200 / 0
```

**Критерий успеха:** NRestarts не растёт после рестарта; `journalctl -u myapp -f` тихий.

### Шаг 4. Проверь себя (ответы вслух до раскрытия)

1. Чем `Restart=on-failure` отличается от `always`, когда вы сами делаете `systemctl stop`?
2. Где увидите причину смерти процесса быстрее: `/var/log/syslog` или journalctl? Почему?
3. Что покажет `critical-chain`, если юнит ждёт сеть, которой нет?

<details><summary>Ответы</summary>

1. `stop` вручную не триггерит on-failure рестарт (это не failure); always перезапустил бы даже после stop.
2. journalctl: структурированные метаданные юнита (`_SYSTEMD_UNIT`), не зависит от rsyslog-конфигурации.
3. Цепочку ожидания с пометкой на зависимость network.target и суммарную задержку.
</details>

## ✅ Чек-лист зрелости темы

- [ ] Конфигурации версионируются в Git, ручные правки на проде запрещены

    ??? tip "Как закрыть пункт"
        Все unit-файлы и drop-in'ы живут в etc-репозитории (или Ansible-роли), деплой через pipeline. Проверка зрелости: `git log` показывает историю изменения конфига сервиса, а не `stat` файла на сервере.

- [ ] Есть мониторинг именно этой подсистемы (не только CPU/RAM)

    ??? tip "Как закрыть пункт"
        Для systemd: экспортёр systemd-collector или node_exporter с `--collector.systemd`; алерты на unit failed, рестарты >N за час. Для подсистем ядра (OOM, fd) — правила из [09.1](../09-observability/01-prometheus-and-grafana.md).

- [ ] Задокументирован runbook на типовые отказы (кто/что/как)

    ??? tip "Как закрыть пункт"
        Шаблон runbook — в [13.2](../13-disaster-recovery-and-tools/02-database-backups-and-dr-plan.md). Минимум для юнита: симптомы → 3 команды диагностики → фикс → критерий успеха. Хранится рядом с кодом сервиса, ссылка из алерта.

- [ ] Проведено хотя бы одно учение Chaos/GameDay по теме

    ??? tip "Как закрыть пункт"
        Возьмите дрель из `tools/chaos-lab.sh` (в корне репозитория) (`oom_kill_test`, `disk_fill`), запустите на стенде, прогоните свой runbook по шагам. Время до восстановления запишите в шапку runbook'а.

- [ ] Лимиты ресурсов и квоты осознаны, а не «дефолт из туториала»

    ??? tip "Как закрыть пункт"
        Для каждого юнита известно: MemoryMax/CPUQuota выбраны по данным недели работы (не копипаста), LimitNOFILE соответствует реальному числу соединений. Проверка: `systemctl show <unit> -p MemoryMax,CPUQuotaPerSecSec,LimitNOFILE` + сравнение с фактическим потреблением за месяц.

---

## 🧭 Что дальше

| Шаг | Материал |
| :--- | :--- |
| 🔬 Закрепить | [Lab 01: namespaces и cgroups](../16-guided-labs/01-lab-linux-systemd-namespaces.md) |
| 💪 Практика | [Задачи по Bash и системе](../15-hands-on-practice/01-100-devops-practical-tasks-part1.md) |
| 🎤 Проверить себя | [Вопросы собесов: Linux](../14-interview-prep/03-100-devops-interview-questions-bank-part1.md) |
