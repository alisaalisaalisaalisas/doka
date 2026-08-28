/* Global Playground: Linux / Bash / Python / Go — 30 scenarios */
S("Linux — Systemd","glinux-1","Systemd unit падает с exit 203","Junior", `<h3>Контекст</h3><p>Linux — Systemd: <b>Systemd unit падает с exit 203</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Systemd unit падает с exit 203</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить статус</li><li>[ ] лог причины 203/EXEC</li><li>[ ] исправить ExecStart</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>systemctl status api\\\\b</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить статус → лог причины 203/EXEC → исправить ExecStart.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^systemctl status api\\b",`● api.service - API\n   Loaded: loaded (/etc/systemd/system/api.service)\n   Active: failed (Result: exit-code) status=203/EXEC`,"err"],
 ["^journalctl -u api --no-pager \\| head -20",`api[412]: Failed at step EXEC spawning /opt/api/bin: No such file or directory`,"err"],
 ["^ls -l /opt/api/",`total 4\n-rwxr-xr-x app\n`,"dim"],
 ["^sed -i s|/opt/api/bin|/opt/api/app| /etc/systemd/system/api.service",`patched`,"ok"],
 ["^systemctl daemon-reload && systemctl restart api",``, "ok"],
 ["^systemctl enable api",`Created symlink /etc/systemd/system/multi-user.target.wants/api.service`,"ok"],
 ["^systemctl is-active api",`active`,"ok"]
],
[{re:"^systemctl status api",l:"проверить статус"},
 {re:"^journalctl -u api",l:"лог причины 203/EXEC"},
 {re:"^sed -i",l:"исправить ExecStart"},
 {re:"^systemctl daemon-reload",l:"перезагрузить systemd"},
 {re:"^systemctl enable api",l:"включить автостарт"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: Systemd unit падает с exit 203 в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: проверить статус → лог причины 203/EXEC → исправить ExecStart"]});

S("Linux — Systemd","glinux-2","Systemd OOM: MemoryMax душит сервис","Middle", `<h3>Контекст</h3><p>Linux — Systemd: <b>Systemd OOM: MemoryMax душит сервис</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Systemd OOM: MemoryMax душит сервис</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти OOM в ядре</li><li>[ ] проверить лимит</li><li>[ ] создать drop-in</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>systemctl status api</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти OOM в ядре → проверить лимит → создать drop-in.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^systemctl status api",`Active: activating (auto-restart)\nMemory: 298M (max 300M)`,"warn"],
 ["^journalctl -k --grep -i oom \\| tail -5",`kernel: Memory cgroup out of memory: Killed process 1821 (api)`,"err"],
 ["^systemctl show api -p MemoryMax",`MemoryMax=314572800`,"warn"],
 ["^mkdir -p /etc/systemd/system/api.service.d",``, "dim"],
 ["^cat > /etc/systemd/system/api.service.d/override.conf <<'EOF'",`[Service]\nMemoryMax=512M`,"ok"],
 ["^systemctl daemon-reload && systemctl restart api",``, "ok"],
 ["^systemctl show api -p MemoryMax",`MemoryMax=536870912`,"ok"]
],
[{re:"^journalctl -k",l:"найти OOM в ядре"},
 {re:"^systemctl show api -p MemoryMax",l:"проверить лимит"},
 {re:"override\\.conf",l:"создать drop-in"},
 {re:"^systemctl daemon-reload",l:"применить"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: Systemd OOM: MemoryMax душит сервис в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: найти OOM в ядре → проверить лимит → создать drop-in"]});

S("Linux — Journald","glinux-3","journald теряет логи: RateLimit","Middle", `<h3>Контекст</h3><p>Linux — Journald: <b>journald теряет логи: RateLimit</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>journald теряет логи: RateLimit</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти подавление</li><li>[ ] проверить лимиты</li><li>[ ] поднять burst</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>journalctl --grep Suppressed \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти подавление → проверить лимиты → поднять burst.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^journalctl --grep Suppressed \\| tail",`systemd-journal: Suppressed 4120 messages from /opt/api/app`,"err"],
 ["^cat /etc/systemd/journald.conf \\| grep RateLimit",`RateLimitBurst=1000\nRateLimitIntervalSec=30s`,"warn"],
 ["^sed -i s/RateLimitBurst=1000/RateLimitBurst=5000/ /etc/systemd/journald.conf",`patched`,"ok"],
 ["^systemctl restart systemd-journald",``, "ok"],
 ["^journalctl --grep Suppressed \\| tail",`(пусто)`,"ok"]
],
[{re:"^journalctl --grep Suppressed",l:"найти подавление"},
 {re:"^cat /etc/systemd/journald.conf",l:"проверить лимиты"},
 {re:"^sed -i",l:"поднять burst"},
 {re:"^systemctl restart systemd-journald",l:"перезапустить"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: journald теряет логи: RateLimit в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: найти подавление → проверить лимиты → поднять burst"]});

S("Linux — Resources","glinux-4","Too many open files (EMFILE)","Middle", `<h3>Контекст</h3><p>Linux — Resources: <b>Too many open files (EMFILE)</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Too many open files (EMFILE)</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить лимит процесса</li><li>[ ] посчитать fd</li><li>[ ] создать drop-in с LimitNOFILE</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>cat /proc/1234/limits \\\\| grep</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить лимит процесса → посчитать fd → создать drop-in с LimitNOFILE.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^cat /proc/1234/limits \\| grep \"open files\"",`Max open files            1024                 4096`,"err"],
 ["^lsof -p 1234 \\| wc -l",`1021`,"warn"],
 ["^cat /etc/systemd/system/api.service.d/limits.conf",`cat: No such file`,"err"],
 ["^cat > /etc/systemd/system/api.service.d/limits.conf <<'EOF'",`[Service]\nLimitNOFILE=65535`,"ok"],
 ["^systemctl daemon-reload && systemctl restart api",``, "ok"],
 ["^cat /proc/1234/limits \\| grep \"open files\"",`Max open files            65535                65535`,"ok"]
],
[{re:"/proc/.*/limits",l:"проверить лимит процесса"},
 {re:"^lsof -p",l:"посчитать fd"},
 {re:"limits\\.conf",l:"создать drop-in с LimitNOFILE"},
 {re:"^systemctl daemon-reload",l:"применить"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: Too many open files (EMFILE) в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: проверить лимит процесса → посчитать fd → создать drop-in с LimitNOFILE"]});

S("Linux — Filesystem","glinux-5","Inode закончились — No space left","Middle", `<h3>Контекст</h3><p>Linux — Filesystem: <b>Inode закончились — No space left</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Inode закончились — No space left</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить inodes</li><li>[ ] найти каталог с миллионами файлов</li><li>[ ] очистить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>df -h /</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить inodes → найти каталог с миллионами файлов → очистить.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^df -h /",`Filesystem Size Used Avail Use% Mounted\n/dev/sda1 40G 18G 20G 47% /`,"ok"],
 ["^df -i /",`Filesystem Inodes IUsed IFree IUse% Mounted\n/dev/sda1 2M 2M 0 100% /`,"err"],
 ["^find /var/spool -xdev -type f \\| wc -l",`1823401`,"err"],
 ["^find /var/spool/mqueue -type f -delete",``, "ok"],
 ["^df -i /",`Filesystem Inodes IUsed IFree IUse% Mounted\n/dev/sda1 2M 410k 1.6M 21% /`,"ok"],
 ["^lsof \\+L1 \\| head",`(пусто) — удалённых файлов нет`,"ok"]
],
[{re:"^df -i",l:"проверить inodes"},
 {re:"^find /var/spool",l:"найти каталог с миллионами файлов"},
 {re:"^find /var/spool/mqueue -type f -delete",l:"очистить"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: Inode закончились — No space left в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: проверить inodes → найти каталог с миллионами файлов → очистить"]});

S("Linux — Filesystem","glinux-6","overlay2: первый write тормозит (CoW)","Middle", `<h3>Контекст</h3><p>Linux — Filesystem: <b>overlay2: первый write тормозит (CoW)</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>overlay2: первый write тормозит (CoW)</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать CoW-изменения</li><li>[ ] проверить lowerdir/upperdir</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>docker diff api</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать CoW-изменения → проверить lowerdir/upperdir.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^docker diff api",`C /app/config.yaml\nA /tmp/cache`,"ok"],
 ["^ls /var/lib/docker/overlay2/*/diff \\| head -5",`/var/lib/docker/overlay2/abc/diff/app/config.yaml`,"ok"],
 ["^cat /proc/mounts \\| grep overlay",`overlay on / type overlay (lowerdir=/var/lib/docker/overlay2/l/...,upperdir=/var/lib/docker/overlay2/abc/diff)`,"ok"],
 ["^docker inspect api --format.*MergedDir",`/var/lib/docker/overlay2/abc/merged`,"ok"]
],
[{re:"^docker diff",l:"показать CoW-изменения"},
 {re:"/proc/mounts.*overlay",l:"проверить lowerdir/upperdir"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: overlay2: первый write тормозит (CoW) в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: показать CoW-изменения → проверить lowerdir/upperdir"]});

S("Linux — Filesystem","glinux-7","fstab ломает загрузку","Junior", `<h3>Контекст</h3><p>Linux — Filesystem: <b>fstab ломает загрузку</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>fstab ломает загрузку</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать fstab</li><li>[ ] провалидировать</li><li>[ ] добавить nofail</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>cat /etc/fstab</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать fstab → провалидировать → добавить nofail.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^cat /etc/fstab",`UUID=abcd / ext4 defaults 0 1\n/dev/sdb1 /data ext4 defaults 0 0`,"warn"],
 ["^findmnt --verify",`FAIL: /data: source /dev/sdb1 does not exist`,"err"],
 ["^mount -a",`mount: /data: special device /dev/sdb1 does not exist`,"err"],
 ["^sed -i s/defaults/defaults,nofail,x-systemd.device-timeout=10/ /etc/fstab",`patched`,"ok"],
 ["^findmnt --verify",`0 errors, 0 warnings`,"ok"]
],
[{re:"^cat /etc/fstab",l:"показать fstab"},
 {re:"^findmnt --verify",l:"провалидировать"},
 {re:"^sed -i",l:"добавить nofail"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: fstab ломает загрузку в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: показать fstab → провалидировать → добавить nofail"]});

S("Linux — Systemd","glinux-8","Systemd timer не сработал","Middle", `<h3>Контекст</h3><p>Linux — Systemd: <b>Systemd timer не сработал</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Systemd timer не сработал</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить timer</li><li>[ ] лог сервиса</li><li>[ ] исправить права</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>systemctl list-timers --all \\\\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить timer → лог сервиса → исправить права.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^systemctl list-timers --all \\| grep backup",`backup.timer n/a n/a inactive dead`,"err"],
 ["^systemctl status backup.timer",`Active: inactive (dead)  Trigger: n/a`,"err"],
 ["^systemctl status backup.service",`Active: failed Result: exit-code`,"err"],
 ["^journalctl -u backup.service --no-pager \\| tail -10",`backup.sh: Permission denied`,"err"],
 ["^ls -l /opt/backup.sh",`-rw-r--r-- 1 root root /opt/backup.sh`,"err"],
 ["^chmod \\+x /opt/backup.sh && systemctl start backup.timer",``, "ok"],
 ["^systemctl list-timers \\| grep backup",`backup.timer active waiting`,"ok"]
],
[{re:"^systemctl list-timers",l:"проверить timer"},
 {re:"^journalctl -u backup.service",l:"лог сервиса"},
 {re:"^chmod \\+x",l:"исправить права"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: Systemd timer не сработал в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: проверить timer → лог сервиса → исправить права"]});

S("Linux — Logrotate","glinux-9","Лог 18GB съел диск","Middle", `<h3>Контекст</h3><p>Linux — Logrotate: <b>Лог 18GB съел диск</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Лог 18GB съел диск</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить диск</li><li>[ ] найти пожирателя</li><li>[ ] освободить truncate, не rm</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>df -h /</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить диск → найти пожирателя → освободить truncate, не rm.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^df -h /",`/dev/sda1 40G 39G 0 100% /`,"err"],
 ["^du -sh /var/log/* \\| sort -h \\| tail -5",`18G /var/log/app\n1.2G /var/log/journal`,"err"],
 ["^truncate -s 0 /var/log/app/app.log",``, "ok"],
 ["^df -h /",`/dev/sda1 40G 22G 17G 55% /`,"ok"],
 ["^cat > /etc/logrotate.d/app <<'EOF'",` /var/log/app/*.log {\n  daily rotate 7 compress\n  missingok notifempty\n}`,"ok"],
 ["^logrotate -d /etc/logrotate.d/app 2>&1 \\| head -20",`reading config file /etc/logrotate.d/app`,"ok"]
],
[{re:"^df -h",l:"проверить диск"},
 {re:"^du -sh /var/log",l:"найти пожирателя"},
 {re:"^truncate -s 0",l:"освободить truncate, не rm"},
 {re:"logrotate",l:"настроить ротацию"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: Лог 18GB съел диск в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: проверить диск → найти пожирателя → освободить truncate, не rm"]});

S("Linux — Permissions","glinux-10","Неверные права на ключ SSH 600","Junior", `<h3>Контекст</h3><p>Linux — Permissions: <b>Неверные права на ключ SSH 600</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Неверные права на ключ SSH 600</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить права</li><li>[ ] исправить</li><li>[ ] проверить ssh</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>ls -l ~/.ssh/id_rsa</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить права → исправить → проверить ssh.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^ls -l ~/.ssh/id_rsa",`-rw-r--r-- 1 ubuntu ubuntu 2600 id_rsa`,"err"],
 ["^ssh -i ~/.ssh/id_rsa bastion echo ok",`WARNING: UNPROTECTED PRIVATE KEY FILE!`,"err"],
 ["^chmod 600 ~/.ssh/id_rsa",``, "ok"],
 ["^ls -l ~/.ssh/id_rsa",`-rw------- 1 ubuntu ubuntu 2600 id_rsa`,"ok"],
 ["^ssh -i ~/.ssh/id_rsa bastion echo ok",`ok`,"ok"]
],
[{re:"^ls -l ~/.ssh/id_rsa",l:"проверить права"},
 {re:"^chmod 600",l:"исправить"},
 {re:"^ssh -i",l:"проверить ssh"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: Неверные права на ключ SSH 600 в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: проверить права → исправить → проверить ssh"]});

S("Linux — PAM","glinux-11","limits.conf не применяется для пользователя","Middle", `<h3>Контекст</h3><p>Linux — PAM: <b>limits.conf не применяется для пользователя</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>limits.conf не применяется для пользователя</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить pam</li><li>[ ] проверить limits.conf</li><li>[ ] раскомментировать pam_limits</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>grep pam_limits /etc/pam.d/com</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить pam → проверить limits.conf → раскомментировать pam_limits.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^grep pam_limits /etc/pam.d/common-session",`# session required pam_limits.so  <-- закомментировано!`,"err"],
 ["^cat /etc/security/limits.conf \\| grep nofile",`app soft nofile 65535\napp hard nofile 65535`,"ok"],
 ["^sed -i s/^#.*pam_limits.so/session required pam_limits.so/ /etc/pam.d/common-session",`patched`,"ok"],
 ["^su - app -c 'ulimit -n'",`65535`,"ok"]
],
[{re:"pam_limits",l:"проверить pam"},
 {re:"limits\\.conf",l:"проверить limits.conf"},
 {re:"^sed -i",l:"раскомментировать pam_limits"},
 {re:"^su - app -c",l:"проверить ulimit"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: limits.conf не применяется для пользователя в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: проверить pam → проверить limits.conf → раскомментировать pam_limits"]});

S("Linux — Cgroups","glinux-12","cgroup v2: лимит CPU и памяти для команды","Middle", `<h3>Контекст</h3><p>Linux — Cgroups: <b>cgroup v2: лимит CPU и памяти для команды</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>cgroup v2: лимит CPU и памяти для команды</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] выставить лимит памяти</li><li>[ ] выставить лимит cpu</li><li>[ ] поместить процесс в cgroup</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>mkdir -p /sys/fs/cgroup/lab</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: выставить лимит памяти → выставить лимит cpu → поместить процесс в cgroup.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^mkdir -p /sys/fs/cgroup/lab",``, "dim"],
 ["^echo 536870912 > /sys/fs/cgroup/lab/memory.max",``, "ok"],
 ["^echo 50000 > /sys/fs/cgroup/lab/cpu.max",`cpu.max 50000 100000 (0.5 core)`,"ok"],
 ["^echo \\$\\$ > /sys/fs/cgroup/lab/cgroup.procs",``, "dim"],
 ["^cat /sys/fs/cgroup/lab/memory.max",`536870912`,"ok"],
 ["^cat /sys/fs/cgroup/lab/cpu.max",`50000 100000`,"ok"]
],
[{re:"memory\\.max",l:"выставить лимит памяти"},
 {re:"cpu\\.max",l:"выставить лимит cpu"},
 {re:"cgroup\\.procs",l:"поместить процесс в cgroup"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: cgroup v2: лимит CPU и памяти для команды в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: выставить лимит памяти → выставить лимит cpu → поместить процесс в cgroup"]});

S("Linux — Namespaces","glinux-13","PID namespace: увидеть изоляцию","Junior", `<h3>Контекст</h3><p>Linux — Namespaces: <b>PID namespace: увидеть изоляцию</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>PID namespace: увидеть изоляцию</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] создать PID namespace</li><li>[ ] показать namespaces</li><li>[ ] сетевой namespace</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>unshare --pid --fork --mount-p</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: создать PID namespace → показать namespaces → сетевой namespace.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^unshare --pid --fork --mount-proc bash -c 'ps -o pid,cmd'",`PID CMD\n  1 bash\n 12 ps`,"ok"],
 ["^lsns -t pid \\| head -5",`NS TYPE NPROCS PID USER COMMAND\n4026532444 pid 2 1 root bash`,"ok"],
 ["^unshare --net --fork bash -c 'ip link'",`1: lo: <LOOPBACK>`,"ok"]
],
[{re:"^unshare --pid",l:"создать PID namespace"},
 {re:"^lsns -t pid",l:"показать namespaces"},
 {re:"^unshare --net",l:"сетевой namespace"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: PID namespace: увидеть изоляцию в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: создать PID namespace → показать namespaces → сетевой namespace"]});

S("Bash","glinux-14","set -euo pipefail: скрипт молча игнорирует ошибку","Middle", `<h3>Контекст</h3><p>Bash: <b>set -euo pipefail: скрипт молча игнорирует ошибку</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>set -euo pipefail: скрипт молча игнорирует ошибку</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] трассировка</li><li>[ ] включить strict mode</li><li>[ ] проверить заголовок</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>cat deploy.sh \\\\| head -5</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: трассировка → включить strict mode → проверить заголовок.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^cat deploy.sh \\| head -5",`#!/usr/bin/env bash\ncurl -sfL https://example.com/pkg.tgz | tar xz`,"warn"],
 ["^bash -x deploy.sh 2>&1 \\| tail -10",`+ curl -sfL https://example.com/pkg.tgz\n+ tar xz\ngzip: stdin: not in gzip format`,"err"],
 ["^sed -i 1a\\set\\ -euo\\ pipefail deploy.sh",`patched`,"ok"],
 ["^head -2 deploy.sh",`#!/usr/bin/env bash\nset -euo pipefail`,"ok"],
 ["^bash deploy.sh",`curl: (22) 404 Not Found`,"err"]
],
[{re:"^bash -x",l:"трассировка"},
 {re:"set -euo pipefail",l:"включить strict mode"},
 {re:"^head -2 deploy.sh",l:"проверить заголовок"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: set -euo pipefail: скрипт молча игнорирует ошибку в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: трассировка → включить strict mode → проверить заголовок"]});

S("Bash","glinux-15","Цикл по хостам: проверить 3 ноды на порт 5432","Junior", `<h3>Контекст</h3><p>Bash: <b>Цикл по хостам: проверить 3 ноды на порт 5432</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Цикл по хостам: проверить 3 ноды на порт 5432</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] цикл for + nc</li><li>[ ] проверить порт</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>for h in 10.0.0.11 10.0.0.12 1</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: цикл for + nc → проверить порт.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^for h in 10.0.0.11 10.0.0.12 10.0.0.13; do nc -zv \\$h 5432; done",`10.0.0.11 5432 open\n10.0.0.12 5432 open\n10.0.0.13 5432 refused`,"warn"],
 ["^parallel -j3 nc -zv ::: 5432 ::: 10.0.0.11 10.0.0.12 10.0.0.13 2>&1 \\| cat",`аналогично parallel`,"dim"]
],
[{re:"^for h in",l:"цикл for + nc"},
 {re:"5432",l:"проверить порт"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: Цикл по хостам: проверить 3 ноды на порт 5432 в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: цикл for + nc → проверить порт"]});

S("Bash","glinux-16","cron: почему не сработал ночной джоб","Middle", `<h3>Контекст</h3><p>Bash: <b>cron: почему не сработал ночной джоб</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>cron: почему не сработал ночной джоб</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти запуск</li><li>[ ] лог cron</li><li>[ ] права</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>grep CRON /var/log/syslog \\\\| </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти запуск → лог cron → права.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^grep CRON /var/log/syslog \\| tail -4",`CRON[901]: (root) CMD (/opt/jobs/nightly.sh)`,"dim"],
 ["^journalctl -u cron --since yesterday \\| grep nightly \\| tail -5",`nightly.sh: Permission denied`,"err"],
 ["^ls -l /opt/jobs/nightly.sh",`-rw-r--r-- 1 root root 412 nightly.sh`,"err"],
 ["^chmod \\+x /opt/jobs/nightly.sh",``, "ok"],
 ["^grep -q PATH /opt/jobs/nightly.sh || echo \"no PATH\"",`no PATH — в cron пустой PATH`,"warn"],
 ["^sed -i 1iPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin /opt/jobs/nightly.sh",`patched`,"ok"]
],
[{re:"grep CRON",l:"найти запуск"},
 {re:"^journalctl -u cron",l:"лог cron"},
 {re:"^chmod \\+x",l:"права"},
 {re:"PATH",l:"проверить PATH в скрипте"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: cron: почему не сработал ночной джоб в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: найти запуск → лог cron → права"]});

S("Bash","glinux-17","find + xargs: миллион файлов — Argument list too long","Senior", `<h3>Контекст</h3><p>Bash: <b>find + xargs: миллион файлов — Argument list too long</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>find + xargs: миллион файлов — Argument list too long</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] воспроизвести ошибку</li><li>[ ] правильное удаление через find</li><li>[ ] проверить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>ls /tmp/cache \\\\| wc -l</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: воспроизвести ошибку → правильное удаление через find → проверить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^ls /tmp/cache \\| wc -l",`1200034`,"err"],
 ["^rm /tmp/cache/\\*",`bash: /bin/rm: Argument list too long`,"err"],
 ["^find /tmp/cache -type f -print0 \\| xargs -0 rm -f",``, "ok"],
 ["^ls /tmp/cache \\| wc -l",`0`,"ok"],
 ["^find /tmp -type f -mtime \\+7 -delete",`удалены старые`,"ok"]
],
[{re:"Argument list too long",l:"воспроизвести ошибку"},
 {re:"^find /tmp/cache -type f -print0",l:"правильное удаление через find"},
 {re:"^ls /tmp/cache",l:"проверить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: find + xargs: миллион файлов — Argument list too long в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: воспроизвести ошибку → правильное удаление через find → проверить"]});

S("Bash","glinux-18","sed: заменить адрес бинда 127.0.0.1 → 0.0.0.0","Junior", `<h3>Контекст</h3><p>Bash: <b>sed: заменить адрес бинда 127.0.0.1 → 0.0.0.0</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>sed: заменить адрес бинда 127.0.0.1 → 0.0.0.0</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить bind</li><li>[ ] найти в конфиге</li><li>[ ] заменить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>ss -tlnp \\\\| grep 8080</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить bind → найти в конфиге → заменить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^ss -tlnp \\| grep 8080",`LISTEN 127.0.0.1:8080`,"err"],
 ["^grep -n 127\\.0\\.0\\.1 /etc/app/config.yaml",`listen: 127.0.0.1:8080`,"warn"],
 ["^sed -i s/127\\.0\\.0\\.1/0\\.0\\.0\\.0/ /etc/app/config.yaml",``, "ok"],
 ["^systemctl restart app && ss -tlnp \\| grep 8080",`LISTEN 0.0.0.0:8080`,"ok"]
],
[{re:"^ss -tlnp",l:"проверить bind"},
 {re:"^grep -n 127",l:"найти в конфиге"},
 {re:"^sed -i s/127",l:"заменить"},
 {re:"^systemctl restart app",l:"перезапустить и проверить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: sed: заменить адрес бинда 127.0.0.1 → 0.0.0.0 в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: проверить bind → найти в конфиге → заменить"]});

S("Bash","glinux-19","awk: топ 5xx ошибок из access.log","Middle", `<h3>Контекст</h3><p>Bash: <b>awk: топ 5xx ошибок из access.log</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>awk: топ 5xx ошибок из access.log</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] посчитать коды</li><li>[ ] отфильтровать 5xx и топ URL</li><li>[ ] проверить количество 500</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>awk '{print \\\\9}' /var/log/ngi</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: посчитать коды → отфильтровать 5xx и топ URL → проверить количество 500.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^awk '{print \\$9}' /var/log/nginx/access.log \\| sort \\| uniq -c \\| sort -rn \\| head",`  4123 200\n   892 500\n   341 502`,"warn"],
 ["^awk '\\$9 ~ /^5/ {print \\$7}' /var/log/nginx/access.log \\| sort \\| uniq -c \\| sort -rn \\| head -3",` 612 /api/orders\n 210 /api/pay`,"ok"],
 ["^grep -c ' 500 ' /var/log/nginx/access.log",`892`,"ok"]
],
[{re:"^awk.*print.*\\$9",l:"посчитать коды"},
 {re:"^awk.*\\$9 ~",l:"отфильтровать 5xx и топ URL"},
 {re:"^grep -c",l:"проверить количество 500"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: awk: топ 5xx ошибок из access.log в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: посчитать коды → отфильтровать 5xx и топ URL → проверить количество 500"]});

S("Bash","glinux-20","grep -R: найти хардкод секретов","Middle", `<h3>Контекст</h3><p>Bash: <b>grep -R: найти хардкод секретов</b>. Работа с <code>script.sh</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>grep -R: найти хардкод секретов</b>. Файл <code>script.sh</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] поиск секретов grep</li><li>[ ] скан git-secrets</li><li>[ ] очистить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>script.sh</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>script.sh</code>. Активный файл открыт в редакторе. Начните с <code>grep -R --include=\\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: поиск секретов grep → скан git-secrets → очистить.</p><h3>Проверка</h3><pre>cat script.sh<br>проверить код</pre>`,
"dev@lab:~/app$",
[
 ["^grep -R --include=\"\\*.py\" -n \"AKIA\\|ghp_\\|password\" .",`src/s3.py:12: AKIAIOSFODNN7EXAMPLE`,"err"],
 ["^grep -R -n \"BEGIN PRIVATE KEY\" .",`certs/dummy.key:1: -----BEGIN PRIVATE KEY-----`,"err"],
 ["^git secrets --scan 2>&1 \\| head -20",`src/s3.py:12: Found AWS key`,"ok"],
 ["^sed -i s/AKIA.*// src/s3.py",`patched`,"ok"]
],
[{re:"^grep -R",l:"поиск секретов grep"},
 {re:"git secrets",l:"скан git-secrets"},
 {re:"^sed -i",l:"очистить"}],{file:"script.sh",files:{"script.sh":`#!/bin/bash\nset +e\necho broken\n`},checks:[{re:/set\s+-e/,l:"set -e"}],solutionFiles:{"script.sh":`#!/bin/bash\nset -e\necho fixed\n`}},{hints:["Симптом: grep -R: найти хардкод секретов в script.sh. Ищи причину в коде/конфиге этого файла.","Открой script.sh в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat script.sh.","Порядок: поиск секретов grep → скан git-secrets → очистить"]});

S("Python","glinux-21","Python venv рассинхрон: pip freeze vs requirements","Middle", `<h3>Контекст</h3><p>Python: <b>Python venv рассинхрон: pip freeze vs requirements</b>. Работа с <code>main.py</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Python venv рассинхрон: pip freeze vs requirements</b>. Файл <code>main.py</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить зависимости</li><li>[ ] сверить установленное</li><li>[ ] доустановить и зафиксировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.py</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.py</code>, <code>tests/test_main.py</code>, <code>requirements.txt</code>. Активный файл открыт в редакторе. Начните с <code>cat requirements.txt</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить зависимости → сверить установленное → доустановить и зафиксировать.</p><h3>Проверка</h3><pre>cat main.py<br>проверить код</pre>`,
"dev@lab:~/app$",
[
 ["^cat requirements.txt",`flask==3.0.0`,"warn"],
 ["^pip freeze \\| grep requests",`(пусто)`,"err"],
 ["^pip freeze",`Flask==3.0.0`,"dim"],
 ["^pip install requests && pip freeze > requirements.txt",``, "ok"],
 ["^cat requirements.txt \\| grep requests",`requests==2.32.0`,"ok"],
 ["^python -c \"import requests; print(requests.__version__)\"",`2.32.0`,"ok"]
],
[{re:"^cat requirements.txt",l:"проверить зависимости"},
 {re:"^pip freeze",l:"сверить установленное"},
 {re:"^pip install requests",l:"доустановить и зафиксировать"}],{file:"main.py",files:{"main.py":`# Python venv рассинхрон: pip freeze vs requirements\n# broken - needs fix\nprint(\"broken\")\n`,"tests/test_main.py":`def test_ok():\n    assert True\n`,"requirements.txt":`pytest\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.py":`# Python venv рассинхрон: pip freeze vs requirements — fixed\nprint(\"ok\")\n`,"tests/test_main.py":`def test_ok():\n    assert True\n`,"requirements.txt":`pytest\n`}},{hints:["Симптом: Python venv рассинхрон: pip freeze vs requirements в main.py. Ищи причину в коде/конфиге этого файла.","Открой main.py в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.py.","Порядок: проверить зависимости → сверить установленное → доустановить и зафиксировать"]});

S("Python","glinux-22","Python boto3: NoCredentialsError","Middle", `<h3>Контекст</h3><p>Python: <b>Python boto3: NoCredentialsError</b>. Работа с <code>main.py</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Python boto3: NoCredentialsError</b>. Файл <code>main.py</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] воспроизвести ошибку</li><li>[ ] проверить конфиг</li><li>[ ] запустить с профилем</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.py</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.py</code>, <code>tests/test_main.py</code>, <code>requirements.txt</code>. Активный файл открыт в редакторе. Начните с <code>python upload_s3.py 2>&1 \\\\| h</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: воспроизвести ошибку → проверить конфиг → запустить с профилем.</p><h3>Проверка</h3><pre>cat main.py<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^python upload_s3.py 2>&1 \\| head -5",`botocore.exceptions.NoCredentialsError: Unable to locate credentials`,"err"],
 ["^aws configure list",`Name Value Type\nprofile <not set>`,"err"],
 ["^cat ~/.aws/credentials \\| head -5",`cat: No such file`,"err"],
 ["^aws configure set aws_access_key_id AKIAEXAMPLE --profile sandbox",``, "ok"],
 ["^aws configure set aws_secret_access_key secret --profile sandbox",``, "ok"],
 ["^AWS_PROFILE=sandbox python upload_s3.py",`Uploaded to s3://bucket/file (200)`,"ok"]
],
[{re:"^python upload_s3.py",l:"воспроизвести ошибку"},
 {re:"^aws configure list",l:"проверить конфиг"},
 {re:"AWS_PROFILE=sandbox",l:"запустить с профилем"}],{file:"main.py",files:{"main.py":`# Python boto3: NoCredentialsError\n# broken - needs fix\nprint(\"broken\")\n`,"tests/test_main.py":`def test_ok():\n    assert True\n`,"requirements.txt":`pytest\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.py":`# Python boto3: NoCredentialsError — fixed\nprint(\"ok\")\n`,"tests/test_main.py":`def test_ok():\n    assert True\n`,"requirements.txt":`pytest\n`}},{hints:["Симптом: Python boto3: NoCredentialsError в main.py. Ищи причину в коде/конфиге этого файла.","Открой main.py в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.py.","Порядок: воспроизвести ошибку → проверить конфиг → запустить с профилем"]});

S("Python","glinux-23","Python asyncio: event loop заблокирован синхронным вызовом","Senior", `<h3>Контекст</h3><p>Python: <b>Python asyncio: event loop заблокирован синхронным вызовом</b>. Работа с <code>main.py</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Python asyncio: event loop заблокирован синхронным вызовом</b>. Файл <code>main.py</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти блокировку</li><li>[ ] заменить на await asyncio.sleep</li><li>[ ] прогнать тесты</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.py</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.py</code>, <code>tests/test_main.py</code>, <code>requirements.txt</code>. Активный файл открыт в редакторе. Начните с <code>grep -n time\\\\.sleep app.py</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти блокировку → заменить на await asyncio.sleep → прогнать тесты.</p><h3>Проверка</h3><pre>cat main.py<br>проверить код</pre>`,
"dev@lab:~/app$",
[
 ["^grep -n time\\.sleep app.py",`42: time.sleep(2)  # blocking!`,"err"],
 ["^python -m asyncio -c \"import app; print(app.slow())\" 2>&1 \\| head",`blocked 2 sec`,"err"],
 ["^sed -i s/time\\.sleep/asyncio\\.sleep/ app.py",`patched (но нужен await!)`,"warn"],
 ["^grep -n \"await asyncio.sleep\" app.py",`42: await asyncio.sleep(2)`,"ok"],
 ["^pytest tests/test_async.py -q",`3 passed`,"ok"]
],
[{re:"^grep -n.*time\\.sleep",l:"найти блокировку"},
 {re:"asyncio\\.sleep",l:"заменить на await asyncio.sleep"},
 {re:"^pytest",l:"прогнать тесты"}],{file:"main.py",files:{"main.py":`# Python asyncio: event loop заблокирован синхронным вызовом\n# broken - needs fix\nprint(\"broken\")\n`,"tests/test_main.py":`def test_ok():\n    assert True\n`,"requirements.txt":`pytest\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.py":`# Python asyncio: event loop заблокирован синхронным вызовом — fixed\nprint(\"ok\")\n`,"tests/test_main.py":`def test_ok():\n    assert True\n`,"requirements.txt":`pytest\n`}},{hints:["Симптом: Python asyncio: event loop заблокирован синхронным вызовом в main.py. Ищи причину в коде/конфиге этого файла.","Открой main.py в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.py.","Порядок: найти блокировку → заменить на await asyncio.sleep → прогнать тесты"]});

S("Go","glinux-24","Go modules: go mod tidy ругается на missing sum","Middle", `<h3>Контекст</h3><p>Go: <b>Go modules: go mod tidy ругается на missing sum</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Go modules: go mod tidy ругается на missing sum</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] воспроизвести</li><li>[ ] скачать и пофиксить sum</li><li>[ ] проверить сборку</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go mod tidy 2>&1 \\\\| head -10</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: воспроизвести → скачать и пофиксить sum → проверить сборку.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@lab:~/app$",
[
 ["^go mod tidy 2>&1 \\| head -10",`go: finding module for package github.com/gin-gonic/gin\ngo: missing go.sum entry`,"err"],
 ["^cat go.mod \\| head -10",`module app\nrequire github.com/gin-gonic/gin v1.10.0`,"ok"],
 ["^go mod download && go mod tidy",``, "ok"],
 ["^go build ./... 2>&1 \\| head",``, "ok"],
 ["^cat go.sum \\| grep gin \\| head -2",`github.com/gin-gonic/gin v1.10.0 h1:...`,"ok"]
],
[{re:"^go mod tidy",l:"воспроизвести"},
 {re:"^go mod download",l:"скачать и пофиксить sum"},
 {re:"^go build",l:"проверить сборку"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: Go modules: go mod tidy ругается на missing sum в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: воспроизвести → скачать и пофиксить sum → проверить сборку"]});

S("Go","glinux-25","Go race: data race в хендлере","Senior", `<h3>Контекст</h3><p>Go: <b>Go race: data race в хендлере</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Go race: data race в хендлере</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] поймать гонку</li><li>[ ] найти несинхронизированный инкремент</li><li>[ ] исправить на atomic/mutex</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go test -race ./... 2>&1 \\\\| t</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: поймать гонку → найти несинхронизированный инкремент → исправить на atomic/mutex.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@lab:~/app$",
[
 ["^go test -race ./... 2>&1 \\| tail -20",`WARNING: DATA RACE\nRead at 0x00c000... by goroutine 7\nPrevious write at 0x00c000... by goroutine 12`,"err"],
 ["^grep -n counter handlers.go",`88: counter++`,"err"],
 ["^sed -n 80,100p handlers.go",`var counter int\nfunc inc() { counter++ }`,"warn"],
 ["^sed -i s/counter/atomic\\.AddInt64/ handlers.go",`patched atomic`,"ok"],
 ["^go test -race ./... 2>&1 \\| tail -5",`ok`,"ok"]
],
[{re:"^go test -race",l:"поймать гонку"},
 {re:"counter\\+\\+",l:"найти несинхронизированный инкремент"},
 {re:"atomic",l:"исправить на atomic/mutex"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: Go race: data race в хендлере в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: поймать гонку → найти несинхронизированный инкремент → исправить на atomic/mutex"]});

S("Go","glinux-26","Go build: static binary для distroless","Middle", `<h3>Контекст</h3><p>Go: <b>Go build: static binary для distroless</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Go build: static binary для distroless</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить динамику</li><li>[ ] пересобрать статически</li><li>[ ] собрать distroless образ</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go build -o /tmp/app ./cmd/app</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить динамику → пересобрать статически → собрать distroless образ.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@lab:~/app$",
[
 ["^go build -o /tmp/app ./cmd/app 2>&1 \\| head",`ok dynamic`,"dim"],
 ["^ldd /tmp/app",`libpthread.so.0 => /lib/...`,"warn"],
 ["^CGO_ENABLED=0 go build -ldflags=\"-s -w\" -o /tmp/app ./cmd/app",``, "ok"],
 ["^ldd /tmp/app",`not a dynamic executable`,"ok"],
 ["^docker build -t app:static . 2>&1 \\| tail -5",`=> exporting to image\n => naming to app:static`,"ok"]
],
[{re:"^ldd /tmp/app",l:"проверить динамику"},
 {re:"CGO_ENABLED=0",l:"пересобрать статически"},
 {re:"^docker build",l:"собрать distroless образ"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: Go build: static binary для distroless в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: проверить динамику → пересобрать статически → собрать distroless образ"]});

S("Linux — Signals","glinux-27","Приложение не ловит SIGTERM → 30с graceful shutdown","Middle", `<h3>Контекст</h3><p>Linux — Signals: <b>Приложение не ловит SIGTERM → 30с graceful shutdown</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Приложение не ловит SIGTERM → 30с graceful shutdown</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] логи SIGTERM</li><li>[ ] проверить игнор</li><li>[ ] добавить обработчик</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>kubectl logs api-xxx 2>&1 \\\\| </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: логи SIGTERM → проверить игнор → добавить обработчик.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^kubectl logs api-xxx 2>&1 \\| grep -i term",`(пусто) — сигнал не логируется`,"err"],
 ["^cat app.py \\| grep -n signal",`no signal handler`,"err"],
 ["^kill -TERM 1 && sleep 2; ps -p 1",`1 still running (игнор SIGTERM)`,"err"],
 ["^grep -n \"signal.signal.*SIGTERM\" app.py || echo no-handler",`no-handler`,"err"],
 ["^sed -i s/\"app.run()\"/\"signal.signal(signal.SIGTERM, handler); app.run()\"/ app.py",`patched`,"ok"]
],
[{re:"^kubectl logs",l:"логи SIGTERM"},
 {re:"^kill -TERM",l:"проверить игнор"},
 {re:"signal\\.signal",l:"добавить обработчик"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: Приложение не ловит SIGTERM → 30с graceful shutdown в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: логи SIGTERM → проверить игнор → добавить обработчик"]});

S("Linux — Tracing","glinux-28","strace: процесс висит на futex/read","Middle", `<h3>Контекст</h3><p>Linux — Tracing: <b>strace: процесс висит на futex/read</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>strace: процесс висит на futex/read</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти процесс</li><li>[ ] профиль syscall</li><li>[ ] стек ядра</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>ps -o pid,stat,cmd -p 1821</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти процесс → профиль syscall → стек ядра.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^ps -o pid,stat,cmd -p 1821",`1821 Sl python app.py`,"dim"],
 ["^strace -p 1821 -c 2>&1 \\| head -20",`% time seconds usecs/call calls syscall\n 60.00 0.12 400 futex`,"warn"],
 ["^strace -p 1821 -T 2>&1 \\| head -20",`futex(0x..., FUTEX_WAIT, 1, NULL <unfinished ...>`,"err"],
 ["^cat /proc/1821/stack",`[<0>] futex_wait_queue_me+0xc0`,"ok"]
],
[{re:"^ps -o pid",l:"найти процесс"},
 {re:"^strace -p 1821 -c",l:"профиль syscall"},
 {re:"^cat /proc/1821/stack",l:"стек ядра"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: strace: процесс висит на futex/read в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: найти процесс → профиль syscall → стек ядра"]});

S("Linux — Files","glinux-29","Удалённый файл держит место (deleted, lsof +L1)","Middle", `<h3>Контекст</h3><p>Linux — Files: <b>Удалённый файл держит место (deleted, lsof +L1)</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Удалённый файл держит место (deleted, lsof +L1)</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] подтвердить расхождение du vs df</li><li>[ ] найти deleted fd</li><li>[ ] освободить через /proc/fd</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>df -h /</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: подтвердить расхождение du vs df → найти deleted fd → освободить через /proc/fd.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^df -h /",`Filesystem Size Used Avail Use% Mounted\n/dev/sda1 40G 39G 200M 99% /`,"err"],
 ["^du -sh /* 2>/dev/null \\| sort -h \\| tail -5",`1.2G /var/log\n18G /var/lib`,"warn"],
 ["^lsof \\+L1 \\| head -10",`COMMAND PID USER FD TYPE SIZE NLINK NAME\npython 1821 app 3w REG 20G 0 /var/log/app/app.log (deleted)`,"err"],
 ["^ls -l /proc/1821/fd/3",`l-wx------ 1 app app 64 /var/log/app/app.log (deleted)`,"warn"],
 ["^truncate -s 0 /proc/1821/fd/3",``, "ok"],
 ["^df -h /",`Filesystem Size Used Avail Use% Mounted\n/dev/sda1 40G 19G 19G 50% /`,"ok"]
],
[{re:"^df -h",l:"подтвердить расхождение du vs df"},
 {re:"^lsof \\+L1",l:"найти deleted fd"},
 {re:"^truncate -s 0 /proc",l:"освободить через /proc/fd"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: Удалённый файл держит место (deleted, lsof +L1) в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: подтвердить расхождение du vs df → найти deleted fd → освободить через /proc/fd"]});

S("Linux — Sysctl","glinux-30","sysctl: somaxconn и swappiness","Middle", `<h3>Контекст</h3><p>Linux — Sysctl: <b>sysctl: somaxconn и swappiness</b>. Работа с <code>systemd/demo.service</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>sysctl: somaxconn и swappiness</b>. Файл <code>systemd/demo.service</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить somaxconn</li><li>[ ] применить sysctl.conf</li><li>[ ] проверить swappiness</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>systemd/demo.service</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>systemd/demo.service</code>, <code>app/main.py</code>. Активный файл открыт в редакторе. Начните с <code>sysctl net.core.somaxconn</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить somaxconn → применить sysctl.conf → проверить swappiness.</p><h3>Проверка</h3><pre>cat systemd/demo.service<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^sysctl net.core.somaxconn",`net.core.somaxconn = 128`,"warn"],
 ["^ss -ln \\| head -5",`State Recv-Q Send-Q Local Address:Port\nLISTEN 128 128 0.0.0.0:8080`,"warn"],
 ["^echo \"net.core.somaxconn=1024\" >> /etc/sysctl.conf && sysctl -p",``, "ok"],
 ["^sysctl net.core.somaxconn",`net.core.somaxconn = 1024`,"ok"],
 ["^sysctl vm.swappiness",`vm.swappiness = 60`,"warn"],
 ["^sysctl -w vm.swappiness=10",`vm.swappiness = 10`,"ok"]
],
[{re:"^sysctl net.core.somaxconn",l:"проверить somaxconn"},
 {re:"^sysctl -p",l:"применить sysctl.conf"},
 {re:"^sysctl vm.swappiness",l:"проверить swappiness"}],{file:"systemd/demo.service",files:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\n`,"app/main.py":`print(\"hi\")\n`},checks:[{re:/Restart/,l:"Restart"}],solutionFiles:{"systemd/demo.service":`[Unit]\nDescription=Demo\n[Service]\nExecStart=/usr/bin/python3 /opt/app/main.py\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`,"app/main.py":`print(\"hi\")\n`}},{hints:["Симптом: sysctl: somaxconn и swappiness в systemd/demo.service. Ищи причину в коде/конфиге этого файла.","Открой systemd/demo.service в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat systemd/demo.service.","Порядок: проверить somaxconn → применить sysctl.conf → проверить swappiness"]});
