/* Песочница: Linux, Bash, jq, Git, Сети */
S("Linux и Bash","l1","Systemd: сервис failed — найти причину и поднять","Junior",
`<b>Симптом:</b> сервис <code>demo</code> failed. Цель: причина → фикс → автостарт.`,
"root@lab:~#",
[
["^systemctl status demo\\b",`× demo.service - Demo App\n   Active: failed (Result: exit-code)\n  Process: 1234 ExecStart=/opt/demo/app (code=exited, status=203/EXEC)`,"err"],
["^journalctl -u demo",`systemd[1]: Failed at step EXEC spawning /opt/demo/app: No such file or directory`,"err"],
["^ls -l \\/opt\\/demo",`-rw-r--r-- 1 app app 1.2M app.py   <-- нет бита исполнения, и юнит зовёт app`],
["^chmod \\+x \\/opt\\/demo\\/app\\.py","", "dim"],
["^sed -i .*ExecStart.*app\\.py.*\\/etc\\/systemd\\/system\\/demo\\.service","ExecStart исправлен на /opt/demo/app.py","ok"],
["^systemctl (daemon-reload && )?restart demo\\b","", "ok"],
["^systemctl (enable --now |enable )demo\\b",`Created symlink /etc/systemd/system/multi-user.target.wants/demo.service`,"ok"],
["^systemctl is-active demo",`active`,"ok"]
],
[{re:/^systemctl status demo/,l:"посмотреть статус юнита"},
 {re:"^journalctl -u demo",l:"прочитать лог юнита"},
 {re:"^systemctl restart demo",l:"перезапустить после фикса"},
 {re:"^systemctl enable",l:"добавить в автостарт"}]);

S("Linux и Bash","l2","Systemd: OOM от MemoryMax","Middle",
`<b>Симптом:</b> сервис периодически умирает. Подозрение: cgroup-лимит памяти.`,
"root@lab:~#",
[
["^systemctl status demo\\b",`   Active: activating (auto-restart)\n   Memory: 294.0M (max: 300.0M)   <-- у предела`,"warn"],
["^journalctl -u demo -k",`kernel: Memory cgroup out of memory: Killed process 1234 (app.py)`,"err"],
["^mkdir -p \\/etc\\/systemd\\/system\\/demo\\.service\\.d",``, "dim"],
["^cat > \\/etc\\/systemd\\/system\\/demo\\.service\\.d\\/override\\.conf",`override записан`],
["^systemctl daemon-reload","","dim"],
["^systemctl restart demo","","ok"],
["^systemctl show demo -p MemoryMax",`MemoryMax=536870912   <-- 512M`,"ok"]
],
[{re:/journalctl -u demo -k/,l:"найти OOM в логах ядра"},
 {re:"override\\.conf",l:"создать drop-in override"},
 {re:"daemon-reload",l:"daemon-reload"},
 {re:"systemctl restart demo",l:"перезапустить"}]);

S("Linux и Bash","l3","Диск заполнен логами — 100%","Middle",
`<b>Алерт:</b> DiskUsage >95%. Приложение пишет гигантский лог.`,
"root@lab:~#",
[
["^df -h \\/$",`/dev/sda1        40G   38G   448M  99% /`,"err"],
["^du -sh \\/var\\/log\\/\\* \\| sort -h \\| tail -3",`2.1G\t/var/log/journal\n18G\t/var/log/myapp\n...`,"warn"],
["^truncate -s 0 \\/var\\/log\\/myapp\\/app\\.log","", "dim"],
["^df -h \\/$",`/dev/sda1        40G   21G    19G  53% /`,"ok"],
["^(logrotate -f \\/etc\\/logrotate\\.d\\/myapp|cat > \\/etc\\/logrotate\\.d\\/myapp)",`logrotate настроен`,"ok"]
],
[{re:/^df -h/,l:"подтвердить заполнение"},
 {re:"^du -sh",l:"найти виновника"},
 {re:"^truncate",l:"освободить место (truncate, не rm!)"}
]);

S("Linux и Bash","l4","CPU 100% — найти процесс и понять, что он делает","Middle",
`<b>Симптом:</b> нагрузка CPU. Цель: найти процесс и посмотреть его syscalls.`,
"root@lab:~#",
[
["^top -bn1 \\| head",`%Cpu(s): 96.0 us\n  PID USER      %CPU COMMAND\n 4321 app       94.0 node /opt/api/server.js`,"warn"],
["^ps -eo pid,ppid,%cpu,cmd --sort=-%cpu \\| head -3",` 4321  1    94.0 node /opt/api/server.js`],
["^strace -cp 4321",`% time  seconds  calls  syscall\n 41.00  0.120000   900  futex\n 30.00  0.090000   400  read`,"ok"],
["^cat \\/proc\\/4321\\/status \\| grep Threads",`Threads: 512   <-- слишком много горутин/тредов`,"warn"]
],
[{re:/^(top|ps) /,l:"найти процесс"},
 {re:"^strace",l:"посмотреть syscalls"},
 {re:"\\/proc\\/4321\\/status",l:"проверить threads"}]);

S("Linux и Bash","l5","Слишком много открытых файлов (Too many open files)","Middle",
`<b>Симптом:</b> приложение падает с <code>EMFILE: too many open files</code>.`,
"root@lab:~#",
[
["^cat \\/proc\\/$(pidof node)\\/limits \\| grep open",`Max open files  1024  1024  <-- мало`,"err"],
["^lsof -p $(pidof node) \\| wc -l",`1020`,"warn"],
["^cat > \\/etc\\/systemd\\/system\\/nodeapp\\.service\\.d\\/limits\\.conf",`LimitNOFILE=65535 записан`,"ok"],
["^systemctl daemon-reload && systemctl restart nodeapp","","ok"],
["^cat \\/proc\\/$(pidof node)\\/limits \\| grep open",`Max open files  65535  65535`,"ok"]
],
[{re:/\/limits \| grep/,l:"проверить лимит процесса"},
 {re:"lsof",l:"посчитать открытые fd"},
 {re:"limits\\.conf",l:"поднять лимит через drop-in"}]);

S("Сети","n1","Порт «не слушается» — сервис не принимает подключения","Middle",
`<b>Симптом:</b> <code>curl localhost:8080</code> — connection refused.`,
"root@lab:~#",
[
["^ss -tulnp \\| grep 8080",`(пусто) — никто не слушает 8080`,"err"],
["^systemctl status myapp \\| head -5",`Active: active (running)`,"warn"],
["^journalctl -u myapp -n 5",`myapp: listening on 127.0.0.1:8080   <-- только localhost!`,"warn"],
["^sed -i s/127\\.0\\.0\\.1:8080/0\\.0\\.0\\.0:8080" ,`конфиг исправлен`,"ok"],
["^systemctl restart myapp","","dim"],
["^ss -tulnp \\| grep 8080",`LISTEN 0 511 0.0.0.0:8080 users:(("myapp",pid=555))`,"ok"]
],
[{re:/^ss -tulnp/,l:"проверить слушателя"},
 {re:"journalctl -u myapp",l:"на какой адрес биндится"},
 {re:"^ss -tulnp \\| grep 8080$",l:"убедиться, что слушает 0.0.0.0"}]);

S("Сети","n2","DNS не резолвит внутреннее имя","Middle",
`<b>Симптом:</b> <code>ping db.corp.local</code> — name resolution failed.`,
"root@lab:~#",
[
["^dig db\\.corp\\.local",`;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN`,"err"],
["^cat \\/etc\\/resolv\\.conf",`nameserver 10.0.0.53\nsearch corp.local`],
["^dig db\\.corp\\.local @10\\.0\\.0\\.53",`status: NXDOMAIN`,"err"],
["^dig db\\.corp\\.local @10.0.0.2",`db.corp.local.  300  IN  A 10.0.0.40   <-- второй DNS знает!`,"ok"],
["^(sed -i s/10\\.0\\.0\\.53/10.0.0.2/ \\/etc\\/resolv\\.conf|echo nameserver 10.0.0.2 > \\/etc\\/resolv\\.conf)",`resolv.conf обновлён`,"ok"],
["^dig db\\.corp\\.local \\+short",`10.0.0.40`,"ok"]
],
[{re:/^dig/,l:"проверить резолв"},
 {re:"resolv\\.conf",l:"проверить/исправить resolv.conf"}]);

S("Сети","n3","tcpdump: кто стучится на 443 без handshake","Senior",
`<b>Задача:</b> поймать SYN без SYN-ACK (полуоткрытые сканы/потери).`,
"root@lab:~#",
[
["^tcpdump -i any -nn .*(tcp-syn|port 443)",`14:02:11 IP 10.1.1.5.4432 > 10.0.0.10.443: Flags [S]\n14:02:11 IP 10.0.0.10.443 > 10.1.1.5.4432: Flags [S.]   <-- SYN-ACK есть\n14:02:14 IP 203.0.113.9.5512 > 10.0.0.10.443: Flags [S]\n14:02:17 IP 203.0.113.9.5512 > 10.0.0.10.443: Flags [S]   <-- повтор, ответа нет`,"warn"],
["^ss -tn state syn-recv",`Recv-Q Send-Q Local Address:Port\n0      0      10.0.0.10:443   peers: 203.0.113.9`,"warn"]
],
[{re:/^tcpdump/,l:"захватить пакеты"},
 {re:"^ss -tn",l:"посмотреть syn-recv очередь"}]);

S("Сети","n4","curl: где тормозит — DNS, connect или TTFB","Middle",
`<b>Задача:</b> разложить латентность запроса по фазам.`,
"root@lab:~#",
[
["^curl .*-w.*time_namelookup",`DNS: 0.400s\nConnect: 0.402s\nTLS: 0.810s\nTTFB: 2.900s\nTotal: 2.905s   <-- TTFB 2с: медленный бэкенд, не сеть`,"warn"],
["^curl -s .*\\/healthz",`ok`,"ok"]
],
[{re:/^curl .*-w/,l:"замер с -w таймингами"},
 {re:"healthz",l:"проверить healthz напрямую"}]);

S("Bash","b1","Скрипт молча проходит дальше при ошибке","Middle",
`<b>Задача:</b> сделать скрипт fail-fast: set -euo pipefail + проверка.`,
"ubuntu@lab:~$",
[
["^bash -n deploy\\.sh",``, "dim"],
["^bash -x deploy\\.sh",`+ curl -sfL https://example.com/pkg.tgz\n+ tar xz\ngzip: stdin: not in gzip format   <-- curl отдал 404-страницу, tar подавился`,"err"],
["^(sed -i 1a.*set -euo pipefail|head -1 deploy\\.sh)",`#!/usr/bin/env bash\nset -euo pipefail`,"ok"],
["^bash deploy\\.sh",`curl: (22) The requested URL returned error: 404   <-- скрипт упал сразу, а не прошёл мимо`,"err"]
],
[{re:/^bash -x/,l:"трассировка выполнения"},
 {re:"set -euo pipefail",l:"включить strict mode"}]);

S("Bash","b2","Цикл по серверам: проверить порт на всех","Junior",
`<b>Задача:</b> одной командой проверить 3 хоста на порт 5432.`,
"ubuntu@lab:~$",
[
["^(for h in|nc -zv).*(10\\.0\\.0\\.(11|12|13)|5432)",`10.0.0.11 5432: open\n10.0.0.12 5432: open\n10.0.0.13 5432: Connection refused   <-- вот проблема`,"warn"]
],
[{re:/^(for|nc|nmap)/,l:"проверить порты по списку хостов"}]);

S("Bash","b3","cron не сработал — почему","Middle",
`<b>Симптом:</b> ночной джоб не выполнился.`,
"root@lab:~#",
[
["^grep CRON \\/var\\/log\\/syslog \\| tail -3",`CRON[9001]: (root) CMD (/opt/jobs/nightly.sh)`,"dim"],
["^journalctl -u cron --since yesterday \\| tail",`nightly.sh: Permission denied`,"err"],
["^ls -l \\/opt\\/jobs\\/nightly\\.sh",`-rw-r--r-- 1 root root nightly.sh   <-- нет x`,"err"],
["^chmod \\+x \\/opt\\/jobs\\/nightly\\.sh","", "ok"],
["^systemctl restart cron","","dim"]
],
[{re:/grep CRON|journalctl -u cron/,l:"найти след запуска"},
 {re:"chmod \\+x",l:"исправить права"}]);

S("jq","j1","jq: извлечь имена и образы из манифеста","Junior",
`<b>Дано:</b> <code>deploy.json</code>. Задача: вывести <code>имя=образ</code>.`,
"ubuntu@lab:~$",
[
["^jq -r .*deploy\\.json$",`api=registry.corp/api:2.4.0\nweb=nginx:1.27`,"ok"]
],
[{re:/^jq -r/,l:"jq с raw-выводом"}]);

S("jq","j2","jq: посчитать поды по namespace","Middle",
`<b>Дано:</b> <code>pods.json</code>. Задача: количество подов в каждом namespace.`,
"ubuntu@lab:~$",
[
["^jq .*group_by.*namespace",`3\tprod\n2\tbatch`,"ok"],
["^jq .*select.*prod",`api-1, api-2, cache-1`,"ok"]
],
[{re:/group_by/,l:"group_by по namespace"},
 {re:"select",l:"select по условию"}]);

S("Git","g1","Отменить последний коммит (не запушен)","Junior",
`<b>Ситуация:</b> закоммитил мусор, ещё не push. Убрать коммит, файлы оставить.`,
"dev@lab:~/app (main)$",
[
["^git log --oneline -3",`a1b2c3 мусорный коммит\n9f8e7d feat: api\n...`],
["^git reset --soft HEAD~1",``, "ok"],
["^git status -s",`M src/api.go   <-- изменения вернулись в staging`,"ok"],
["^git push",`Everything up-to-date (история не переписана) `,"ok"]
],
[{re:/^git log/,l:"посмотреть историю"},
 {re:"^git reset --soft",l:"reset --soft (файлы сохранить)"},
 {re:"^git status",l:"убедиться, что изменения на месте"}]);

S("Git","g2","Разрешить merge-конфликт","Middle",
`<b>Ситуация:</b> <code>git pull</code> → конфликт в <code>config.yaml</code>.`,
"dev@lab:~/app (main)$",
[
["^git status",`Unmerged paths: both modified: config.yaml`,"err"],
["^git diff",`<<<<<<< HEAD\nreplicas: 3\n=======\nreplicas: 5\n>>>>>>> feature`,"warn"],
["^(sed -i|git checkout --theirs config\\.yaml|nano config\\.yaml)",`конфликт разрешён: replicas: 5`,"ok"],
["^git add config\\.yaml && git commit",`[main 4d5e6f] Merge branch`,"ok"]
],
[{re:/^git status/,l:"увидеть конфликт"},
 {re:"^(git diff|sed|nano|checkout --theirs)",l:"разрешить конфликт"},
 {re:"^git (add|commit)",l:"закоммитить разрешение"}]);

S("Git","g3","Найти коммит, сломавший тест (bisect)","Senior",
`<b>Ситуация:</b> тест падает, не знаем с какого коммита.`,
"dev@lab:~/app (main)$",
[
["^git bisect start HEAD v1\\.0\\.0",`Bisecting: 6 revisions left`,"dim"],
["^git bisect run pytest -x",`... a1b2c3 is the first bad commit`,"err"],
["^git bisect reset","", "ok"]
],
[{re:/^git bisect start/,l:"начать бисекцию"},
 {re:"^git bisect run",l:"автопрогон теста"},
 {re:"^git bisect reset",l:"выйти из bisect"}]);

S("Git","g4","Секрет утек в коммит — вычистить историю","Senior",
`<b>Ситуация:</b> <code>secrets.env</code> закоммичен 3 коммита назад. Ключ уже РОТИРОВАН. Вычистить историю.`,
"dev@lab:~/app (main)$",
[
["^git log --oneline --all -- secrets\\.env",`c3d4e5 feat: add config\n...`,"warn"],
["^(git filter-repo --invert-paths --path secrets\\.env|git filter-branch .*secrets\\.env)",`Rewrite c3d4e5 (3/3): Refs rewritten`,"ok"],
["^git push --force-with-lease",`+ main...main (forced update)`,"warn"],
["^git log --all --oneline -- secrets\\.env",`(пусто) — из истории удалён`,"ok"]
],
[{re:/^git log .*secrets/,l:"найти коммиты с секретом"},
 {re:"^git filter-(repo|branch)",l:"переписать историю"},
 {re:"^git push --force",l:"force-push (с --with-lease!)"}]);

S("Сети","n5","SSH через bastion в одну строку","Junior",
`<b>Задача:</b> настроить ProxyJump до приватного хоста.`,
"dev@lab:~$",
[
["^cat >> ~\\/\\.ssh\\/config",`Host priv1\n  HostName 10.0.10.15\n  ProxyJump bastion`,"ok"],
["^ssh -J bastion 10\\.0\\.10\\.15",`Welcome to Ubuntu 24.04 (priv1)`,"ok"]
],
[{re:/ProxyJump|ssh -J/,l:"настроить/использовать ProxyJump"}]);
