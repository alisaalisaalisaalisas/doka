#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import pathlib, re

root = pathlib.Path(r"C:\Users\User\Desktop\papka\doka\docs")

# Generic 4-row pattern to detect
generic_pattern = re.compile(
    r"## 🧨 Типовые грабли Production\s*\n\s*\| Симптом.*?\| Быстрое решение \|\s*\n\|.*?\|.*?\n\| «Работало вчера».*?drift detection.*?\|.*?\n\| Падение под нагрузкой.*?conntrack.*?\|.*?\n\| Медленный деплой.*?layer cache.*?\|.*?\n\| «Плавающие» 502.*?readinessProbe.*?\|",
    re.S
)

# Tailored tables
replacements = {
    "01-linux-and-networking/01-linux-core-and-systemd.md": """## 🧨 Типовые грабли Production (systemd — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `Failed at step EXEC spawning ... No such file` | `ExecStart` без `+x` или опечатка пути | `journalctl -u myapp -n 20`, `ls -l /opt/myapp/bin/server`, `chmod +x`, `daemon-reload` |
| `activating (auto-restart)` цикл, `status=9/KILL` | `MemoryMax=10M` → OOM внутри cgroup | `journalctl -u myapp -p warning`, `systemctl show myapp -p MemoryMax,NRestarts`, поднять `MemoryMax=200M` |
| Изменение unit не применяется | Забыли `daemon-reload` | `systemctl daemon-reload && systemctl restart myapp` |
| `TasksMax` / `Too many open files` | Лимит `TasksMax=64` / `LimitNOFILE=1024` исчерпан | `systemctl show myapp -p TasksMax,LimitNOFILE`, `ls /proc/$PID/task | wc -l`, `LimitNOFILE=65535` |""",

    "01-linux-and-networking/02-networking-and-troubleshooting.md": """## 🧨 Типовые грабли Production (сеть — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `ss -s` 50k `TIME_WAIT`, коннекты отклоняются | Нет pooling, `local_port_range` исчерпан | `ss -ant | grep TIME_WAIT | wc -l`, `cat /proc/sys/net/ipv4/ip_local_port_range`, `keepalive` / `http-reuse` |
| DNS `NXDOMAIN` всплеск 4× нормы | `ndots:5` + `search` домены → 4 лишних запроса | `cat /etc/resolv.conf`, `tcpdump -i any port 53`, `dnsConfig: ndots: 2` в Pod |
| 10s `curl` зависает, `tracepath` обрывается на MTU | Black Hole PMTU: VXLAN/WireGuard 50B overhead, `DF` дроп | `tracepath ya.ru`, `ip link | grep mtu`, `iptables -t mangle -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --clamp-mss-to-pmtu` |
| `conntrack: table full, dropping packet` | `nf_conntrack_max` мал, `TIME_WAIT` таблица переполнена | `conntrack -C`, `dmesg | grep conntrack`, `sysctl net.netfilter.nf_conntrack_max=262144` |""",

    "01-linux-and-networking/03-bash-scripting-and-automation.md": """## 🧨 Типовые грабли Production (Bash — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `set -e` не ломает `if`/`while` при ошибке | `set -e` игнорируется в условии и `! cmd` | Проверять `$?` явно или `set -o pipefail; cmd || true` с комментарием |
| `for f in $(cat list)` ломается на пробелах | word splitting | `while IFS= read -r f; do ... done < list` или `mapfile -t arr < list` |
| Cron гонка: два `deploy.sh` одновременно | Нет `flock` | `flock -n 200 || exit 0` в начале скрипта + `200>/var/lock/deploy.lock` |
| `pipe` маскирует ошибку первой команды `cat file | grep` | Нет `pipefail` — ошибка `cat` потеряна | `set -euo pipefail`, `shellcheck` в CI |""",

    "01-linux-and-networking/04-osi-model-and-network-protocols.md": """## 🧨 Типовые грабли Production (HTTP/TLS/DNS — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `curl: (7) Failed to connect` 2с timeout | Firewall/DNS: `Host` не резолвится или порт закрыт | `dig +short`, `nc -zv host 443`, `iptables -L`, `tcpdump host` |
| `502 Bad Gateway` всплеск после деплоя | Под не `Ready`: `endpoints <none>` / `CrashLoop` | `kubectl get endpoints`, `kubectl logs --previous`, fix `readinessProbe` |
| `TLS handshake timeout` / `certificate has expired` | `notAfter` истёк или цепочка без CA | `openssl s_client -connect host:443 | openssl x509 -noout -dates`, `cert-manager renew` |
| `conntrack table full` молча режет новые SYN | `nf_conntrack_max` мал / `TIME_WAIT` шторм | `conntrack -C; conntrack -S`, увеличить `nf_conntrack_max`, pooling |""",

    "02-git/01-git-internals-and-workflows.md": """## 🧨 Типовые грабли Production (Git workflows — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `! [rejected] main → main (fetch first)` | Локальная ветка отстала | `git pull --rebase`, `git status` перед push |
| `CONFLICT add/add` на `common.conf` | Долго жили feature ветки без rebase | `git rebase main` часто, `git rerere` |
| `detached HEAD` после `checkout <sha>` | Checkout коммита, не ветки | `git switch -c hotfix <sha>` |
| `Large files rejected` на push | Большой бинарь без LFS | `git lfs track "*.psd"`, `git lfs migrate` |""",

    "02-git/02-git-cheatsheet-and-rebase.md": """## 🧨 Типовые грабли Production (Rebase — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `rebase` конфликты на каждом коммите | Долго не синхронизировались с `main` | `git pull --rebase origin main` ежедневно |
| Потеряны коммиты после `reset --hard` | Нет reflog проверки | `git reflog`, `git reset --hard HEAD@{1}` |
| `cherry-pick` дублирует правку | Уже зачеррипикано | `git cherry-pick --skip` или `git log --cherry-pick` |
| `interactive rebase` переписал историю `main` | Rebase публичной ветки | Не делать `push -f` в `main`; только feature, `git push --force-with-lease` |""",

    "03-docker/01-docker-architecture-and-cli.md": """## 🧨 Типовые грабли Production (Docker CLI — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `docker run` без `restart: unless-stopped` — не стартует после ребута | Нет политики рестарта | `--restart unless-stopped` или `restart:` в compose |
| `docker logs` пустые, `-d` без `json-file` driver | Неверный `log-driver` | `docker inspect --format '{{.HostConfig.LogConfig.Type}}'`, `json-file` + `max-size` |
| `no space left on device` на `docker build` | `/var/lib/docker` full, `overlay2` разросся | `docker system df`, `docker system prune -a --filter until=72h` |
| `docker exec -it` зависает | PID 1 не пробрасывает сигналы (`SIGTERM` игнорируется) | `tini`/`dumb-init` как `ENTRYPOINT`, `STOPSIGNAL` |""",

    "03-docker/02-dockerfile-best-practices.md": """## 🧨 Типовые грабли Production (Dockerfile — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| Образ 800М из `FROM golang:1.23` | Нет multi-stage, `COPY . .` тянет кэш | Multi-stage `builder AS` + `distroless`, `.dockerignore` |
| Слои не кэшируются, каждый build 10м | `ADD https://` или `COPY .` раньше `go mod download` | Порядок: `COPY go.*` + `RUN go mod download` → `COPY .` |
| `USER root` в проде | Нет `USER nonroot` | `FROM gcr.io/distroless/static-debian12:nonroot` + `USER nonroot:nonroot` |
| `HEALTHCHECK` молчит | Нет `HEALTHCHECK CMD curl -f http://localhost:8080/healthz` | Добавить `HEALTHCHECK --interval=10s --retries=3 CMD curl -f` |""",

    "03-docker/03-docker-compose-and-networking.md": """## 🧨 Типовые грабли Production (Compose/сеть — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `depends_on: condition: service_healthy` игнорируется без `healthcheck` | Нет `healthcheck` у dependency | Добавить `healthcheck: test: ["CMD", "pg_isready"]` + `condition: service_healthy` |
| `ports: "5432:5432"` конфликтует при scale | Порт биндится на хост, нельзя `compose up --scale db=2` | Убрать `ports` для внутренних сервисов, `expose: [5432]` |
| `getent hosts db` не резолвит | Сеть `internal: true` или разные `networks:` | `docker network inspect` + `getent hosts db` из `nicolaka/netshoot` |
| `docker compose exec` в non-running контейнер | Сервис упал, `restart: always` loop | `docker compose ps`, `docker compose logs db` |""",

    "03-docker/04-docker-deep-internals-and-engine.md": """## 🧨 Типовые грабли Production (Docker internals — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| Первый `write` в контейнер медленный | CoW копирование файла из `lower` в `upper` (`overlay2`) | `docker diff` покажет `C`, для БД — `volume`, не `overlay2` |
| `docker diff` показывает `C /etc/hosts` каждый раз | Пишут в `lower` файл, который потом whiteout удалят | Писать только в `volume`/`upper`, не трогать системные файлы |
| `CAP_SYS_ADMIN` нужен для `mount` внутри | Неверный `cap_add` | `cap_add: [SYS_ADMIN]` только где нужно или `--privileged` узко |
| `veth`/`iptables` правила не видны после `docker network create` | `iptables -C` vs `iptables -t nat -L` | `iptables -t nat -L DOCKER -n -v`, `ip link show type veth` |""",
}

count = 0
for rel, new_block in replacements.items():
    p = root / rel
    if not p.exists():
        print(f"MISSING {rel}")
        continue
    t = p.read_text(encoding="utf-8")
    m = generic_pattern.search(t)
    if m:
        t2 = t[:m.start()] + new_block + t[m.end():]
        p.write_text(t2, encoding="utf-8")
        count += 1
        print(f"REPLACED {rel}")
    else:
        print(f"NOT FOUND pattern in {rel}")

print(f"Total replaced {count}")
