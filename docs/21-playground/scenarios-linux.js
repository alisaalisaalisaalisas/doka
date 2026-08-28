/* Песочница: Linux, Bash, jq, Git, Сети */
S("Linux и Bash","l1","Systemd: сервис failed — найти причину и поднять","Junior",
`<h3>Контекст</h3><p>Linux и Bash: <b>Systemd: сервис failed — найти причину и поднять</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Systemd: сервис failed — найти причину и поднять</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] посмотреть статус юнита</li><li>[ ] прочитать лог юнита</li><li>[ ] перезапустить после фикса</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>systemctl status demo\\\\b</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: посмотреть статус юнита → прочитать лог юнита → перезапустить после фикса.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
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
 {re:"^systemctl enable",l:"добавить в автостарт"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: Systemd: сервис failed — найти причину и поднять в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: посмотреть статус юнита → прочитать лог юнита → перезапустить после фикса"]});

S("Linux и Bash","l2","Systemd: OOM от MemoryMax","Middle",
`<h3>Контекст</h3><p>Linux и Bash: <b>Systemd: OOM от MemoryMax</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Systemd: OOM от MemoryMax</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти OOM в логах ядра</li><li>[ ] создать drop-in override</li><li>[ ] daemon-reload</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>systemctl status demo\\\\b</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти OOM в логах ядра → создать drop-in override → daemon-reload.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
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
 {re:"systemctl restart demo",l:"перезапустить"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: Systemd: OOM от MemoryMax в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: найти OOM в логах ядра → создать drop-in override → daemon-reload"]});

S("Linux и Bash","l3","Диск заполнен логами — 100%","Middle",
`<h3>Контекст</h3><p>Linux и Bash: <b>Диск заполнен логами — 100%</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Диск заполнен логами — 100%</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] подтвердить заполнение</li><li>[ ] найти виновника</li><li>[ ] освободить место (truncate, не rm!)</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>df -h \\\\/</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: подтвердить заполнение → найти виновника → освободить место (truncate, не rm!).</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
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
],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: Диск заполнен логами — 100% в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: подтвердить заполнение → найти виновника → освободить место (truncate, не rm!)"]});

S("Linux и Bash","l4","CPU 100% — найти процесс и понять, что он делает","Middle",
`<h3>Контекст</h3><p>Linux и Bash: <b>CPU 100% — найти процесс и понять, что он делает</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>CPU 100% — найти процесс и понять, что он делает</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти процесс</li><li>[ ] посмотреть syscalls</li><li>[ ] проверить threads</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>top -bn1 \\\\| head</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти процесс → посмотреть syscalls → проверить threads.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
"root@lab:~#",
[
["^top -bn1 \\| head",`%Cpu(s): 96.0 us\n  PID USER      %CPU COMMAND\n 4321 app       94.0 node /opt/api/server.js`,"warn"],
["^ps -eo pid,ppid,%cpu,cmd --sort=-%cpu \\| head -3",` 4321  1    94.0 node /opt/api/server.js`],
["^strace -cp 4321",`% time  seconds  calls  syscall\n 41.00  0.120000   900  futex\n 30.00  0.090000   400  read`,"ok"],
["^cat \\/proc\\/4321\\/status \\| grep Threads",`Threads: 512   <-- слишком много горутин/тредов`,"warn"]
],
[{re:/^(top|ps) /,l:"найти процесс"},
 {re:"^strace",l:"посмотреть syscalls"},
 {re:"\\/proc\\/4321\\/status",l:"проверить threads"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: CPU 100% — найти процесс и понять, что он делает в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: найти процесс → посмотреть syscalls → проверить threads"]});

S("Linux и Bash","l5","Слишком много открытых файлов (Too many open files)","Middle",
`<h3>Контекст</h3><p>Linux и Bash: <b>Слишком много открытых файлов (Too many open files)</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Слишком много открытых файлов (Too many open files)</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить лимит процесса</li><li>[ ] посчитать открытые fd</li><li>[ ] поднять лимит через drop-in</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>cat \\\\/proc\\\\/(pidof node)\\\\/l</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить лимит процесса → посчитать открытые fd → поднять лимит через drop-in.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
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
 {re:"limits\\.conf",l:"поднять лимит через drop-in"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: Слишком много открытых файлов (Too many open files) в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: проверить лимит процесса → посчитать открытые fd → поднять лимит через drop-in"]});

S("Сети","n1","Порт «не слушается» — сервис не принимает подключения","Middle",
`<h3>Контекст</h3><p>Сети: <b>Порт «не слушается» — сервис не принимает подключения</b>. Работа с <code>project/-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Порт «не слушается» — сервис не принимает подключения</b>. Файл <code>project/-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить слушателя</li><li>[ ] на какой адрес биндится</li><li>[ ] убедиться, что слушает 0.0.0.0</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>ss -tulnp \\\\| grep 8080</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить слушателя → на какой адрес биндится → убедиться, что слушает 0.0.0.0.</p><h3>Проверка</h3><pre>cat project/-.yaml<br>проверить код</pre>`,
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
 {re:"^ss -tulnp \\| grep 8080$",l:"убедиться, что слушает 0.0.0.0"}],{file:"project/-.yaml",files:{"project/-.yaml":`# Сети: Порт «не слушается» — сервис не принимает подключения\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-.yaml":`# Сети: Порт «не слушается» — сервис не принимает подключения — fixed\nstatus: ok\n`}},{hints:["Симптом: Порт «не слушается» — сервис не принимает подключения в project/-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-.yaml.","Порядок: проверить слушателя → на какой адрес биндится → убедиться, что слушает 0.0.0.0"]});

S("Сети","n2","DNS не резолвит внутреннее имя","Middle",
`<h3>Контекст</h3><p>Сети: <b>DNS не резолвит внутреннее имя</b>. Работа с <code>project/dns-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>DNS не резолвит внутреннее имя</b>. Файл <code>project/dns-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить резолв</li><li>[ ] проверить/исправить resolv.conf</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/dns-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/dns-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>dig db\\\\.corp\\\\.local</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить резолв → проверить/исправить resolv.conf.</p><h3>Проверка</h3><pre>cat project/dns-.yaml<br>проверить код</pre>`,
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
 {re:"resolv\\.conf",l:"проверить/исправить resolv.conf"}],{file:"project/dns-.yaml",files:{"project/dns-.yaml":`# Сети: DNS не резолвит внутреннее имя\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/dns-.yaml":`# Сети: DNS не резолвит внутреннее имя — fixed\nstatus: ok\n`}},{hints:["Симптом: DNS не резолвит внутреннее имя в project/dns-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/dns-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/dns-.yaml.","Порядок: проверить резолв → проверить/исправить resolv.conf"]});

S("Сети","n3","tcpdump: кто стучится на 443 без handshake","Senior",
`<h3>Контекст</h3><p>Сети: <b>tcpdump: кто стучится на 443 без handshake</b>. Работа с <code>project/tcpdump-443-han.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>tcpdump: кто стучится на 443 без handshake</b>. Файл <code>project/tcpdump-443-han.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] захватить пакеты</li><li>[ ] посмотреть syn-recv очередь</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/tcpdump-443-han.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/tcpdump-443-han.yaml</code>. Активный файл открыт в редакторе. Начните с <code>tcpdump -i any -nn .*(tcp-syn|</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: захватить пакеты → посмотреть syn-recv очередь.</p><h3>Проверка</h3><pre>cat project/tcpdump-443-han.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
["^tcpdump -i any -nn .*(tcp-syn|port 443)",`14:02:11 IP 10.1.1.5.4432 > 10.0.0.10.443: Flags [S]\n14:02:11 IP 10.0.0.10.443 > 10.1.1.5.4432: Flags [S.]   <-- SYN-ACK есть\n14:02:14 IP 203.0.113.9.5512 > 10.0.0.10.443: Flags [S]\n14:02:17 IP 203.0.113.9.5512 > 10.0.0.10.443: Flags [S]   <-- повтор, ответа нет`,"warn"],
["^ss -tn state syn-recv",`Recv-Q Send-Q Local Address:Port\n0      0      10.0.0.10:443   peers: 203.0.113.9`,"warn"]
],
[{re:/^tcpdump/,l:"захватить пакеты"},
 {re:"^ss -tn",l:"посмотреть syn-recv очередь"}],{file:"project/tcpdump-443-han.yaml",files:{"project/tcpdump-443-han.yaml":`# Сети: tcpdump: кто стучится на 443 без handshake\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/tcpdump-443-han.yaml":`# Сети: tcpdump: кто стучится на 443 без handshake — fixed\nstatus: ok\n`}},{hints:["Симптом: tcpdump: кто стучится на 443 без handshake в project/tcpdump-443-han.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/tcpdump-443-han.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/tcpdump-443-han.yaml.","Порядок: захватить пакеты → посмотреть syn-recv очередь"]});

S("Сети","n4","curl: где тормозит — DNS, connect или TTFB","Middle",
`<h3>Контекст</h3><p>Сети: <b>curl: где тормозит — DNS, connect или TTFB</b>. Работа с <code>project/curl-dns-connec.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>curl: где тормозит — DNS, connect или TTFB</b>. Файл <code>project/curl-dns-connec.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] замер с -w таймингами</li><li>[ ] проверить healthz напрямую</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/curl-dns-connec.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/curl-dns-connec.yaml</code>. Активный файл открыт в редакторе. Начните с <code>curl .*-w.*time_namelookup</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: замер с -w таймингами → проверить healthz напрямую.</p><h3>Проверка</h3><pre>cat project/curl-dns-connec.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
["^curl .*-w.*time_namelookup",`DNS: 0.400s\nConnect: 0.402s\nTLS: 0.810s\nTTFB: 2.900s\nTotal: 2.905s   <-- TTFB 2с: медленный бэкенд, не сеть`,"warn"],
["^curl -s .*\\/healthz",`ok`,"ok"]
],
[{re:/^curl .*-w/,l:"замер с -w таймингами"},
 {re:"healthz",l:"проверить healthz напрямую"}],{file:"project/curl-dns-connec.yaml",files:{"project/curl-dns-connec.yaml":`# Сети: curl: где тормозит — DNS, connect или TTFB\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/curl-dns-connec.yaml":`# Сети: curl: где тормозит — DNS, connect или TTFB — fixed\nstatus: ok\n`}},{hints:["Симптом: curl: где тормозит — DNS, connect или TTFB в project/curl-dns-connec.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/curl-dns-connec.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/curl-dns-connec.yaml.","Порядок: замер с -w таймингами → проверить healthz напрямую"]});

S("Bash","b1","Скрипт молча проходит дальше при ошибке","Middle",
`<h3>Контекст</h3><p>Bash: <b>Скрипт молча проходит дальше при ошибке</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Скрипт молча проходит дальше при ошибке</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] трассировка выполнения</li><li>[ ] включить strict mode</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>bash -n deploy\\\\.sh</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: трассировка выполнения → включить strict mode.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
["^bash -n deploy\\.sh",``, "dim"],
["^bash -x deploy\\.sh",`+ curl -sfL https://example.com/pkg.tgz\n+ tar xz\ngzip: stdin: not in gzip format   <-- curl отдал 404-страницу, tar подавился`,"err"],
["^(sed -i 1a.*set -euo pipefail|head -1 deploy\\.sh)",`#!/usr/bin/env bash\nset -euo pipefail`,"ok"],
["^bash deploy\\.sh",`curl: (22) The requested URL returned error: 404   <-- скрипт упал сразу, а не прошёл мимо`,"err"]
],
[{re:/^bash -x/,l:"трассировка выполнения"},
 {re:"set -euo pipefail",l:"включить strict mode"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: Скрипт молча проходит дальше при ошибке в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: трассировка выполнения → включить strict mode"]});

S("Bash","b2","Цикл по серверам: проверить порт на всех","Junior",
`<h3>Контекст</h3><p>Bash: <b>Цикл по серверам: проверить порт на всех</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Цикл по серверам: проверить порт на всех</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить порты по списку хостов</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>(for h in|nc -zv).*(10\\\\.0\\\\.0</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить порты по списку хостов.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
["^(for h in|nc -zv).*(10\\.0\\.0\\.(11|12|13)|5432)",`10.0.0.11 5432: open\n10.0.0.12 5432: open\n10.0.0.13 5432: Connection refused   <-- вот проблема`,"warn"]
],
[{re:/^(for|nc|nmap)/,l:"проверить порты по списку хостов"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: Цикл по серверам: проверить порт на всех в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: проверить порты по списку хостов"]});

S("Bash","b3","cron не сработал — почему","Middle",
`<h3>Контекст</h3><p>Bash: <b>cron не сработал — почему</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>cron не сработал — почему</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти след запуска</li><li>[ ] исправить права</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>grep CRON \\\\/var\\\\/log\\\\/syslo</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти след запуска → исправить права.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"root@lab:~#",
[
["^grep CRON \\/var\\/log\\/syslog \\| tail -3",`CRON[9001]: (root) CMD (/opt/jobs/nightly.sh)`,"dim"],
["^journalctl -u cron --since yesterday \\| tail",`nightly.sh: Permission denied`,"err"],
["^ls -l \\/opt\\/jobs\\/nightly\\.sh",`-rw-r--r-- 1 root root nightly.sh   <-- нет x`,"err"],
["^chmod \\+x \\/opt\\/jobs\\/nightly\\.sh","", "ok"],
["^systemctl restart cron","","dim"]
],
[{re:/grep CRON|journalctl -u cron/,l:"найти след запуска"},
 {re:"chmod \\+x",l:"исправить права"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: cron не сработал — почему в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: найти след запуска → исправить права"]});

S("jq","j1","jq: извлечь имена и образы из манифеста","Junior",
`<h3>Контекст</h3><p>jq: <b>jq: извлечь имена и образы из манифеста</b>. Работа с <code>project/jq-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>jq: извлечь имена и образы из манифеста</b>. Файл <code>project/jq-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] jq с raw-выводом</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/jq-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/jq-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>jq -r .*deploy\\\\.json</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: jq с raw-выводом.</p><h3>Проверка</h3><pre>cat project/jq-.yaml<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
["^jq -r .*deploy\\.json$",`api=registry.corp/api:2.4.0\nweb=nginx:1.27`,"ok"]
],
[{re:/^jq -r/,l:"jq с raw-выводом"}],{file:"project/jq-.yaml",files:{"project/jq-.yaml":`# jq: jq: извлечь имена и образы из манифеста\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/jq-.yaml":`# jq: jq: извлечь имена и образы из манифеста — fixed\nstatus: ok\n`}},{hints:["Симптом: jq: извлечь имена и образы из манифеста в project/jq-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/jq-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/jq-.yaml.","Порядок: jq с raw-выводом"]});

S("jq","j2","jq: посчитать поды по namespace","Middle",
`<h3>Контекст</h3><p>jq: <b>jq: посчитать поды по namespace</b>. Работа с <code>project/jq-namespace.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>jq: посчитать поды по namespace</b>. Файл <code>project/jq-namespace.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] group_by по namespace</li><li>[ ] select по условию</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/jq-namespace.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/jq-namespace.yaml</code>. Активный файл открыт в редакторе. Начните с <code>jq .*group_by.*namespace</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: group_by по namespace → select по условию.</p><h3>Проверка</h3><pre>cat project/jq-namespace.yaml<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
["^jq .*group_by.*namespace",`3\tprod\n2\tbatch`,"ok"],
["^jq .*select.*prod",`api-1, api-2, cache-1`,"ok"]
],
[{re:/group_by/,l:"group_by по namespace"},
 {re:"select",l:"select по условию"}],{file:"project/jq-namespace.yaml",files:{"project/jq-namespace.yaml":`# jq: jq: посчитать поды по namespace\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/jq-namespace.yaml":`# jq: jq: посчитать поды по namespace — fixed\nstatus: ok\n`}},{hints:["Симптом: jq: посчитать поды по namespace в project/jq-namespace.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/jq-namespace.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/jq-namespace.yaml.","Порядок: group_by по namespace → select по условию"]});

S("Git","g1","Отменить последний коммит (не запушен)","Junior",
`<h3>Контекст</h3><p>Git: <b>Отменить последний коммит (не запушен)</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Отменить последний коммит (не запушен)</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] посмотреть историю</li><li>[ ] reset --soft (файлы сохранить)</li><li>[ ] убедиться, что изменения на месте</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git log --oneline -3</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: посмотреть историю → reset --soft (файлы сохранить) → убедиться, что изменения на месте.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
["^git log --oneline -3",`a1b2c3 мусорный коммит\n9f8e7d feat: api\n...`],
["^git reset --soft HEAD~1",``, "ok"],
["^git status -s",`M src/api.go   <-- изменения вернулись в staging`,"ok"],
["^git push",`Everything up-to-date (история не переписана) `,"ok"]
],
[{re:/^git log/,l:"посмотреть историю"},
 {re:"^git reset --soft",l:"reset --soft (файлы сохранить)"},
 {re:"^git status",l:"убедиться, что изменения на месте"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Отменить последний коммит (не запушен) в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: посмотреть историю → reset --soft (файлы сохранить) → убедиться, что изменения на месте"]});

S("Git","g2","Разрешить merge-конфликт","Middle",
`<h3>Контекст</h3><p>Git: <b>Разрешить merge-конфликт</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Разрешить merge-конфликт</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] увидеть конфликт</li><li>[ ] разрешить конфликт</li><li>[ ] закоммитить разрешение</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git status</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: увидеть конфликт → разрешить конфликт → закоммитить разрешение.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
["^git status",`Unmerged paths: both modified: config.yaml`,"err"],
["^git diff",`<<<<<<< HEAD\nreplicas: 3\n=======\nreplicas: 5\n>>>>>>> feature`,"warn"],
["^(sed -i|git checkout --theirs config\\.yaml|nano config\\.yaml)",`конфликт разрешён: replicas: 5`,"ok"],
["^git add config\\.yaml && git commit",`[main 4d5e6f] Merge branch`,"ok"]
],
[{re:/^git status/,l:"увидеть конфликт"},
 {re:"^(git diff|sed|nano|checkout --theirs)",l:"разрешить конфликт"},
 {re:"^git (add|commit)",l:"закоммитить разрешение"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Разрешить merge-конфликт в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: увидеть конфликт → разрешить конфликт → закоммитить разрешение"]});

S("Git","g3","Найти коммит, сломавший тест (bisect)","Senior",
`<h3>Контекст</h3><p>Git: <b>Найти коммит, сломавший тест (bisect)</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Найти коммит, сломавший тест (bisect)</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] начать бисекцию</li><li>[ ] автопрогон теста</li><li>[ ] выйти из bisect</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git bisect start HEAD v1\\\\.0\\\\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: начать бисекцию → автопрогон теста → выйти из bisect.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
["^git bisect start HEAD v1\\.0\\.0",`Bisecting: 6 revisions left`,"dim"],
["^git bisect run pytest -x",`... a1b2c3 is the first bad commit`,"err"],
["^git bisect reset","", "ok"]
],
[{re:/^git bisect start/,l:"начать бисекцию"},
 {re:"^git bisect run",l:"автопрогон теста"},
 {re:"^git bisect reset",l:"выйти из bisect"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Найти коммит, сломавший тест (bisect) в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: начать бисекцию → автопрогон теста → выйти из bisect"]});

S("Git","g4","Секрет утек в коммит — вычистить историю","Senior",
`<h3>Контекст</h3><p>Git: <b>Секрет утек в коммит — вычистить историю</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Секрет утек в коммит — вычистить историю</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти коммиты с секретом</li><li>[ ] переписать историю</li><li>[ ] force-push (с --with-lease!)</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>git log --oneline --all -- sec</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти коммиты с секретом → переписать историю → force-push (с --with-lease!).</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~/app (main)$",
[
["^git log --oneline --all -- secrets\\.env",`c3d4e5 feat: add config\n...`,"warn"],
["^(git filter-repo --invert-paths --path secrets\\.env|git filter-branch .*secrets\\.env)",`Rewrite c3d4e5 (3/3): Refs rewritten`,"ok"],
["^git push --force-with-lease",`+ main...main (forced update)`,"warn"],
["^git log --all --oneline -- secrets\\.env",`(пусто) — из истории удалён`,"ok"]
],
[{re:/^git log .*secrets/,l:"найти коммиты с секретом"},
 {re:"^git filter-(repo|branch)",l:"переписать историю"},
 {re:"^git push --force",l:"force-push (с --with-lease!)"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Секрет утек в коммит — вычистить историю в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: найти коммиты с секретом → переписать историю → force-push (с --with-lease!)"]});

S("Сети","n5","SSH через bastion в одну строку","Junior",
`<h3>Контекст</h3><p>Сети: <b>SSH через bastion в одну строку</b>. Работа с <code>project/ssh-bastion-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>SSH через bastion в одну строку</b>. Файл <code>project/ssh-bastion-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] настроить/использовать ProxyJump</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/ssh-bastion-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/ssh-bastion-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cat >> ~\\\\/\\\\.ssh\\\\/config</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: настроить/использовать ProxyJump.</p><h3>Проверка</h3><pre>cat project/ssh-bastion-.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^cat >> ~\\/\\.ssh\\/config",`Host priv1\n  HostName 10.0.10.15\n  ProxyJump bastion`,"ok"],
["^ssh -J bastion 10\\.0\\.10\\.15",`Welcome to Ubuntu 24.04 (priv1)`,"ok"]
],
[{re:/ProxyJump|ssh -J/,l:"настроить/использовать ProxyJump"}],{file:"project/ssh-bastion-.yaml",files:{"project/ssh-bastion-.yaml":`# Сети: SSH через bastion в одну строку\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/ssh-bastion-.yaml":`# Сети: SSH через bastion в одну строку — fixed\nstatus: ok\n`}},{hints:["Симптом: SSH через bastion в одну строку в project/ssh-bastion-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/ssh-bastion-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/ssh-bastion-.yaml.","Порядок: настроить/использовать ProxyJump"]});
