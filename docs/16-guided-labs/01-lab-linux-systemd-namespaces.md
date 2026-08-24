# 🐧 Lab 01: Linux изнутри — systemd, namespaces, cgroups

> **Время:** 90 минут | **Уровень:** старт с нуля | **Нужно:** Ubuntu 24.04 (VM/VirtualBox/WSL2)
> **Результат:** свой hardened-сервис под systemd + эксперименты с лимитами и OOM.

## 📦 Подготовка стенда (10 мин)

```bash
sudo apt update && sudo apt install -y curl htop strace stress-ng jq tree lsof
# Проверка версии systemd и cgroups v2
systemctl --version | head -1
stat -fc %T /sys/fs/cgroup   # cgroup2fs = у вас v2 ✅
```

---

## 🧪 Часть 1: Приложение для опытов (10 мин)

```bash
mkdir -p /opt/demoapp && cat > /opt/demoapp/app.py <<'EOF'
#!/usr/bin/env python3
import http.server, socketserver, os, signal, sys, time

started = time.time()

class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/crash":
            os._exit(70)                      # симуляция падения
        if self.path == "/leak":
            globals()['blob'] = bytearray(200 * 1024 * 1024)  # +200MB RAM
            self.send_response(200); self.end_headers(); self.wfile.write(b"leaked\n"); return
        body = f"OK pid={os.getpid()} uptime={time.time()-started:.0f}s\n"
        self.send_response(200)
        self.end_headers()
        self.wfile.write(body.encode())
    def log_message(self, *a): pass

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("0.0.0.0", 8080), H) as s:
    s.serve_forever()
EOF
chmod +x /opt/demoapp/app.py
```

---

## 🧪 Часть 2: Systemd unit — от простого к production (20 мин)

```bash
# Вариант "как в туториалах" — так делать НЕЛЬЗЯ
cat > /etc/systemd/system/demo.service <<'EOF'
[Unit]
Description=Demo App v1
[Service]
ExecStart=/usr/bin/python3 /opt/demoapp/app.py
[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload && systemctl enable --now demo
curl localhost:8080/          # OK pid=...
```

Теперь **production-версия** с автоперезапуском, graceful shutdown и hardening:

```bash
cat > /etc/systemd/system/demo.service <<'EOF'
[Unit]
Description=Demo App (hardened)
After=network-online.target
Wants=network-online.target

[Service]
User=www-data
Group=www-data
ExecStart=/usr/bin/python3 /opt/demoapp/app.py
Restart=on-failure
RestartSec=3s
# Graceful shutdown: SIGTERM -> ждём -> только потом SIGKILL
TimeoutStopSec=15s
KillSignal=SIGTERM
# Ресурсы (cgroup v2 прямо из юнита!)
MemoryMax=300M
CPUQuota=50%
TasksMax=64
# Hardening sandbox
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/demoapp
RestrictSUIDSGID=true
CapabilityBoundingSet=
AmbientCapabilities=
LimitNOFILE=8192

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload && systemctl restart demo
systemd-analyze security demo     # посмотрите score! цель < 5.0 (unsafe 9.x)
```

---

## 🧪 Часть 3: Эксперименты с отказами (25 мин)

### A. Упавший сервис → автоперезапуск

```bash
curl localhost:8080/crash                 # убили процесс (exit 70)
sleep 4 && systemctl status demo | head -5
journalctl -u demo --since "2 min ago" --no-pager | tail -6
# Видите Restart цикл? Это и есть on-failure в действии
```

### B. Лимит памяти → OOM от cgroup (не системный!)

```bash
curl localhost:8080/leak                  # +200MB
curl localhost:8080/leak                  # ещё +200MB => за MemoryMax
sleep 1; journalctl -u demo -k --no-pager | grep -iE "oom|killed" | tail -3
systemctl status demo | grep -E "Memory|Active"   # сервис жив — рестартнул сам
```

### C. CPU quota → троттлинг

```bash
# Нагружаем: стрессор в той же cgroup сервиса не получится напрямую,
# поэтому глобальный тест квоты:
stress-ng --cpu 4 --timeout 10s &
systemd-cgtop -1 | head -8               # смотрите колонку CPU% по юнитам
```

---

## 🧪 Часть 4: Namespaces своими руками (15 мин)

```bash
# unshare = создать процесс в новых namespaces БЕЗ Docker!
sudo unshare --pid --fork --mount-proc chroot /bin/bash
ps aux        # внутри виден ТОЛЬКО свой процесс как PID 1! Это и есть контейнеризация
exit
```

```bash
# Смотрим namespaces любого процесса
PID=$(systemctl show -p MainPID --value demo)
ls -la /proc/$PID/ns/
readlink /proc/$PID/ns/pid /proc/$$/ns/pid   # разные = изолированы
```

---

## 🧪 Часть 5: strace — рентген программы (10 мин)

```bash
strace -c -p $(systemctl show -p MainPID --value demo) &
sleep 3; curl -s localhost:8080/ >/dev/null; sleep 2; kill %1
# Видите syscall'ы: accept4, recvfrom, sendto — вот как работает HTTP на уровне ОС
```

---

## 🧹 Cleanup

```bash
systemctl disable --now demo && rm /etc/systemd/system/demo.service && systemctl daemon-reload
rm -rf /opt/demoapp; pkill stress-ng 2>/dev/null
```

## ✅ Чек-лист

- [ ] Объясню разницу `Restart=on-failure` vs `always` vs `unless-stopped`
- [ ] Знаю, что `systemd-analyze security` показывает surface атаки
- [ ] Сам видел OOM kill от cgroup limit (не системный!)
- [ ] Могу запустить «контейнер» голым `unshare` без докера

**Что дальше:** [Lab 02 — Фабрика образов](02-lab-docker-image-factory.md)
