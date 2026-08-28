/* Global Playground: Networking / Advanced Networking-Mesh — 30 scenarios */
S("Сети","gnet-1","Порт 8080 не слушается — бинд на 127.0.0.1","Junior", `<h3>Контекст</h3><p>Сети: <b>Порт 8080 не слушается — бинд на 127.0.0.1</b>. Работа с <code>project/-8080-127-0-0-1.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Порт 8080 не слушается — бинд на 127.0.0.1</b>. Файл <code>project/-8080-127-0-0-1.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти слушателя и адрес</li><li>[ ] найти конфиг</li><li>[ ] исправить бинд</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-8080-127-0-0-1.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-8080-127-0-0-1.yaml</code>. Активный файл открыт в редакторе. Начните с <code>ss -tlnp \\\\| grep 8080</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти слушателя и адрес → найти конфиг → исправить бинд.</p><h3>Проверка</h3><pre>cat project/-8080-127-0-0-1.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^ss -tlnp \\| grep 8080",`LISTEN 0 128 127.0.0.1:8080`,"err"],
 ["^cat /etc/app/config.yaml \\| grep listen",`listen: 127.0.0.1:8080`,"warn"],
 ["^sed -i s/127\\.0\\.0\\.1/0\\.0\\.0\\.0/ /etc/app/config.yaml",``, "ok"],
 ["^systemctl restart app && ss -tlnp \\| grep 8080",`LISTEN 0 128 0.0.0.0:8080`,"ok"]
],
[{re:"^ss -tlnp",l:"найти слушателя и адрес"},
 {re:"^cat /etc/app/config.yaml",l:"найти конфиг"},
 {re:"^sed -i",l:"исправить бинд"},
 {re:"^systemctl restart app",l:"перезапустить и проверить"}],{file:"project/-8080-127-0-0-1.yaml",files:{"project/-8080-127-0-0-1.yaml":`# Сети: Порт 8080 не слушается — бинд на 127.0.0.1\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-8080-127-0-0-1.yaml":`# Сети: Порт 8080 не слушается — бинд на 127.0.0.1 — fixed\nstatus: ok\n`}},{hints:["Симптом: Порт 8080 не слушается — бинд на 127.0.0.1 в project/-8080-127-0-0-1.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-8080-127-0-0-1.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-8080-127-0-0-1.yaml.","Порядок: найти слушателя и адрес → найти конфиг → исправить бинд"]});

S("Сети","gnet-2","iptables DROP режет 5432 для бэкенда","Middle", `<h3>Контекст</h3><p>Сети: <b>iptables DROP режет 5432 для бэкенда</b>. Работа с <code>project/iptables-drop-5.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>iptables DROP режет 5432 для бэкенда</b>. Файл <code>project/iptables-drop-5.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать цепочки</li><li>[ ] удалить DROP</li><li>[ ] добавить ACCEPT</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/iptables-drop-5.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/iptables-drop-5.yaml</code>. Активный файл открыт в редакторе. Начните с <code>iptables -L -n --line-numbers </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать цепочки → удалить DROP → добавить ACCEPT.</p><h3>Проверка</h3><pre>cat project/iptables-drop-5.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^iptables -L -n --line-numbers \\| grep 5432",`3 DROP tcp -- 10.0.1.0/24 0.0.0.0/0 tcp dpt:5432`,"err"],
 ["^iptables -L -n \\| head -20",`Chain INPUT DROP ...`,"warn"],
 ["^iptables -D INPUT 3",``, "ok"],
 ["^iptables -I INPUT -p tcp --dport 5432 -j ACCEPT",``, "ok"],
 ["^nc -zv 10.0.0.12 5432",`Connection to 10.0.0.12 5432 succeeded`,"ok"]
],
[{re:"^iptables -L",l:"показать цепочки"},
 {re:"^iptables -D INPUT 3",l:"удалить DROP"},
 {re:"^iptables -I INPUT",l:"добавить ACCEPT"},
 {re:"^nc -zv",l:"проверить порт"}],{file:"project/iptables-drop-5.yaml",files:{"project/iptables-drop-5.yaml":`# Сети: iptables DROP режет 5432 для бэкенда\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/iptables-drop-5.yaml":`# Сети: iptables DROP режет 5432 для бэкенда — fixed\nstatus: ok\n`}},{hints:["Симптом: iptables DROP режет 5432 для бэкенда в project/iptables-drop-5.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/iptables-drop-5.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/iptables-drop-5.yaml.","Порядок: показать цепочки → удалить DROP → добавить ACCEPT"]});

S("Сети","gnet-3","nftables: мигрировать правило с iptables","Middle", `<h3>Контекст</h3><p>Сети: <b>nftables: мигрировать правило с iptables</b>. Работа с <code>project/nftables-iptabl.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>nftables: мигрировать правило с iptables</b>. Файл <code>project/nftables-iptabl.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать nft ruleset</li><li>[ ] посмотреть старое правило</li><li>[ ] добавить правило nft</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/nftables-iptabl.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/nftables-iptabl.yaml</code>. Активный файл открыт в редакторе. Начните с <code>nft list ruleset</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать nft ruleset → посмотреть старое правило → добавить правило nft.</p><h3>Проверка</h3><pre>cat project/nftables-iptabl.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^nft list ruleset",`table ip filter { }`,"dim"],
 ["^iptables -S \\| grep 8080",` -A INPUT -p tcp -m tcp --dport 8080 -j ACCEPT`,"warn"],
 ["^nft add rule ip filter INPUT tcp dport 8080 accept",``, "ok"],
 ["^nft list ruleset \\| grep 8080",`tcp dport 8080 accept`,"ok"],
 ["^ss -tlnp \\| grep 8080",`LISTEN 0.0.0.0:8080`,"ok"]
],
[{re:"^nft list ruleset",l:"показать nft ruleset"},
 {re:"^iptables -S",l:"посмотреть старое правило"},
 {re:"^nft add rule",l:"добавить правило nft"}],{file:"project/nftables-iptabl.yaml",files:{"project/nftables-iptabl.yaml":`# Сети: nftables: мигрировать правило с iptables\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/nftables-iptabl.yaml":`# Сети: nftables: мигрировать правило с iptables — fixed\nstatus: ok\n`}},{hints:["Симптом: nftables: мигрировать правило с iptables в project/nftables-iptabl.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/nftables-iptabl.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/nftables-iptabl.yaml.","Порядок: показать nft ruleset → посмотреть старое правило → добавить правило nft"]});

S("Сети","gnet-4","DNS: resolv.conf указывает на мёртвый 10.0.0.53","Middle", `<h3>Контекст</h3><p>Сети: <b>DNS: resolv.conf указывает на мёртвый 10.0.0.53</b>. Работа с <code>project/dns-resolv-conf.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>DNS: resolv.conf указывает на мёртвый 10.0.0.53</b>. Файл <code>project/dns-resolv-conf.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить resolv.conf</li><li>[ ] проверить оба DNS</li><li>[ ] переключить nameserver</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/dns-resolv-conf.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/dns-resolv-conf.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cat /etc/resolv.conf</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить resolv.conf → проверить оба DNS → переключить nameserver.</p><h3>Проверка</h3><pre>cat project/dns-resolv-conf.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^cat /etc/resolv.conf",`nameserver 10.0.0.53\nsearch corp.local`,"warn"],
 ["^dig db\\.corp\\.local \\+short",`(пусто)`,"err"],
 ["^dig db\\.corp\\.local @10\\.0\\.0\\.2 \\+short",`10.0.0.40`,"ok"],
 ["^sed -i s/10\\.0\\.0\\.53/10\\.0\\.0\\.2/ /etc/resolv.conf",``, "ok"],
 ["^dig db\\.corp\\.local \\+short",`10.0.0.40`,"ok"]
],
[{re:"^cat /etc/resolv.conf",l:"проверить resolv.conf"},
 {re:"^dig db",l:"проверить оба DNS"},
 {re:"^sed -i",l:"переключить nameserver"}],{file:"project/dns-resolv-conf.yaml",files:{"project/dns-resolv-conf.yaml":`# Сети: DNS: resolv.conf указывает на мёртвый 10.0.0.53\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/dns-resolv-conf.yaml":`# Сети: DNS: resolv.conf указывает на мёртвый 10.0.0.53 — fixed\nstatus: ok\n`}},{hints:["Симптом: DNS: resolv.conf указывает на мёртвый 10.0.0.53 в project/dns-resolv-conf.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/dns-resolv-conf.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/dns-resolv-conf.yaml.","Порядок: проверить resolv.conf → проверить оба DNS → переключить nameserver"]});

S("Сети","gnet-5","dig +trace: где обрывается делегирование","Senior", `<h3>Контекст</h3><p>Сети: <b>dig +trace: где обрывается делегирование</b>. Работа с <code>project/dig-trace-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>dig +trace: где обрывается делегирование</b>. Файл <code>project/dig-trace-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] трассировка делегирования</li><li>[ ] опрос конкретных NS</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/dig-trace-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/dig-trace-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>dig api\\\\.corp\\\\.local \\\\+trac</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: трассировка делегирования → опрос конкретных NS.</p><h3>Проверка</h3><pre>cat project/dig-trace-.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^dig api\\.corp\\.local \\+trace \\| tail -20",`corp.local. 300 IN NS ns1.corp.local.\n;; Received 0 bytes from 10.0.0.53`,"err"],
 ["^dig @10\\.0\\.0\\.53 api\\.corp\\.local",`status: SERVFAIL`,"err"],
 ["^dig @10\\.0\\.0\\.2 api\\.corp\\.local \\+short",`10.0.0.55`,"ok"],
 ["^cat /etc/resolv.conf",`nameserver 10.0.0.2`,"ok"]
],
[{re:"^dig.*\\+trace",l:"трассировка делегирования"},
 {re:"^dig @10",l:"опрос конкретных NS"}],{file:"project/dig-trace-.yaml",files:{"project/dig-trace-.yaml":`# Сети: dig +trace: где обрывается делегирование\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/dig-trace-.yaml":`# Сети: dig +trace: где обрывается делегирование — fixed\nstatus: ok\n`}},{hints:["Симптом: dig +trace: где обрывается делегирование в project/dig-trace-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/dig-trace-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/dig-trace-.yaml.","Порядок: трассировка делегирования → опрос конкретных NS"]});

S("Сети","gnet-6","tcpdump: SYN без SYN-ACK — полуоткрытый скан","Senior", `<h3>Контекст</h3><p>Сети: <b>tcpdump: SYN без SYN-ACK — полуоткрытый скан</b>. Работа с <code>project/tcpdump-syn-syn.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>tcpdump: SYN без SYN-ACK — полуоткрытый скан</b>. Файл <code>project/tcpdump-syn-syn.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] захватить SYN</li><li>[ ] проверить SYN-RECV очередь</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/tcpdump-syn-syn.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/tcpdump-syn-syn.yaml</code>. Активный файл открыт в редакторе. Начните с <code>tcpdump -i any -nn port 443 2></code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: захватить SYN → проверить SYN-RECV очередь.</p><h3>Проверка</h3><pre>cat project/tcpdump-syn-syn.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^tcpdump -i any -nn port 443 2>&1 \\| head -20",`14:02:11 IP 203.0.113.9.51234 > 10.0.0.10.443: Flags \\[S\\]`,"warn"],
 ["^ss -tn state syn-recv \\| head -10",`Recv-Q Send-Q Local:Port Peer:Port\n0 0 10.0.0.10:443 203.0.113.9:51234`,"warn"],
 ["^iptables -L -n \\| grep 443",`ACCEPT tcp -- 0.0.0.0/0 0.0.0.0/0 tcp dpt:443`,"ok"]
],
[{re:"^tcpdump -i any",l:"захватить SYN"},
 {re:"^ss -tn state syn-recv",l:"проверить SYN-RECV очередь"}],{file:"project/tcpdump-syn-syn.yaml",files:{"project/tcpdump-syn-syn.yaml":`# Сети: tcpdump: SYN без SYN-ACK — полуоткрытый скан\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/tcpdump-syn-syn.yaml":`# Сети: tcpdump: SYN без SYN-ACK — полуоткрытый скан — fixed\nstatus: ok\n`}},{hints:["Симптом: tcpdump: SYN без SYN-ACK — полуоткрытый скан в project/tcpdump-syn-syn.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/tcpdump-syn-syn.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/tcpdump-syn-syn.yaml.","Порядок: захватить SYN → проверить SYN-RECV очередь"]});

S("Сети","gnet-7","curl -w: разложить время DNS/connect/TTFB","Middle", `<h3>Контекст</h3><p>Сети: <b>curl -w: разложить время DNS/connect/TTFB</b>. Работа с <code>project/curl-w-dns-conn.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>curl -w: разложить время DNS/connect/TTFB</b>. Файл <code>project/curl-w-dns-conn.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] замер фаз -w</li><li>[ ] проверить DNS</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/curl-w-dns-conn.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/curl-w-dns-conn.yaml</code>. Активный файл открыт в редакторе. Начните с <code>curl -w \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: замер фаз -w → проверить DNS.</p><h3>Проверка</h3><pre>cat project/curl-w-dns-conn.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^curl -w \"@curl-format.txt\" -o /dev/null -s https://api.corp.local/healthz",`time_namelookup: 0.412\ntime_connect: 0.415\ntime_starttransfer: 2.912\ntime_total: 2.915`,"warn"],
 ["^curl -s https://api.corp.local/healthz \\| head -5",`{\"status\":\"ok\"}`,"ok"],
 ["^dig api\\.corp\\.local \\+short",`10.0.0.55`,"dim"]
],
[{re:"^curl -w",l:"замер фаз -w"},
 {re:"^dig",l:"проверить DNS"}],{file:"project/curl-w-dns-conn.yaml",files:{"project/curl-w-dns-conn.yaml":`# Сети: curl -w: разложить время DNS/connect/TTFB\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/curl-w-dns-conn.yaml":`# Сети: curl -w: разложить время DNS/connect/TTFB — fixed\nstatus: ok\n`}},{hints:["Симптом: curl -w: разложить время DNS/connect/TTFB в project/curl-w-dns-conn.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/curl-w-dns-conn.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/curl-w-dns-conn.yaml.","Порядок: замер фаз -w → проверить DNS"]});

S("Сети","gnet-8","MTU 9000 vs 1500 — чёрная дыра VXLAN","Senior", `<h3>Контекст</h3><p>Сети: <b>MTU 9000 vs 1500 — чёрная дыра VXLAN</b>. Работа с <code>project/mtu-9000-vs-150.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>MTU 9000 vs 1500 — чёрная дыра VXLAN</b>. Файл <code>project/mtu-9000-vs-150.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить MTU</li><li>[ ] проверить PMTU</li><li>[ ] исправить MTU</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/mtu-9000-vs-150.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/mtu-9000-vs-150.yaml</code>. Активный файл открыт в редакторе. Начните с <code>ip link show eth0 \\\\| grep mtu</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить MTU → проверить PMTU → исправить MTU.</p><h3>Проверка</h3><pre>cat project/mtu-9000-vs-150.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^ip link show eth0 \\| grep mtu",`2: eth0: <BROADCAST> mtu 9000`,"warn"],
 ["^ping -M do -s 8000 10.0.0.12",`Frag needed and DF set`,"err"],
 ["^ip link set eth0 mtu 1500",``, "ok"],
 ["^ping -M do -s 1400 10.0.0.12",`1400 bytes from 10.0.0.12: icmp_seq=1`,"ok"],
 ["^ip link show eth0 \\| grep mtu",`mtu 1500`,"ok"]
],
[{re:"^ip link show eth0",l:"проверить MTU"},
 {re:"^ping -M do",l:"проверить PMTU"},
 {re:"^ip link set eth0 mtu 1500",l:"исправить MTU"}],{file:"project/mtu-9000-vs-150.yaml",files:{"project/mtu-9000-vs-150.yaml":`# Сети: MTU 9000 vs 1500 — чёрная дыра VXLAN\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/mtu-9000-vs-150.yaml":`# Сети: MTU 9000 vs 1500 — чёрная дыра VXLAN — fixed\nstatus: ok\n`}},{hints:["Симптом: MTU 9000 vs 1500 — чёрная дыра VXLAN в project/mtu-9000-vs-150.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/mtu-9000-vs-150.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/mtu-9000-vs-150.yaml.","Порядок: проверить MTU → проверить PMTU → исправить MTU"]});

S("Сети","gnet-9","Нет маршрута в 10.0.2.0/24 — ip route","Middle", `<h3>Контекст</h3><p>Сети: <b>Нет маршрута в 10.0.2.0/24 — ip route</b>. Работа с <code>project/-10-0-2-0-24-ip.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Нет маршрута в 10.0.2.0/24 — ip route</b>. Файл <code>project/-10-0-2-0-24-ip.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] посмотреть таблицу</li><li>[ ] добавить маршрут</li><li>[ ] проверить связность</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-10-0-2-0-24-ip.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-10-0-2-0-24-ip.yaml</code>. Активный файл открыт в редакторе. Начните с <code>ip route show \\\\| grep 10\\\\.0\\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: посмотреть таблицу → добавить маршрут → проверить связность.</p><h3>Проверка</h3><pre>cat project/-10-0-2-0-24-ip.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^ip route show \\| grep 10\\.0\\.2",`(пусто)`,"err"],
 ["^ip route show",`default via 10.0.0.1 dev eth0\n10.0.0.0/24 dev eth0`,"warn"],
 ["^ip route add 10\\.0\\.2\\.0/24 via 10\\.0\\.0\\.254 dev eth0",``, "ok"],
 ["^ping -c2 10\\.0\\.2\\.15",`2 packets transmitted, 2 received`,"ok"]
],
[{re:"^ip route show",l:"посмотреть таблицу"},
 {re:"^ip route add 10",l:"добавить маршрут"},
 {re:"^ping -c2",l:"проверить связность"}],{file:"project/-10-0-2-0-24-ip.yaml",files:{"project/-10-0-2-0-24-ip.yaml":`# Сети: Нет маршрута в 10.0.2.0/24 — ip route\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-10-0-2-0-24-ip.yaml":`# Сети: Нет маршрута в 10.0.2.0/24 — ip route — fixed\nstatus: ok\n`}},{hints:["Симптом: Нет маршрута в 10.0.2.0/24 — ip route в project/-10-0-2-0-24-ip.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-10-0-2-0-24-ip.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-10-0-2-0-24-ip.yaml.","Порядок: посмотреть таблицу → добавить маршрут → проверить связность"]});

S("Сети","gnet-10","ARP: duplicate IP — кто занял 10.0.0.55","Middle", `<h3>Контекст</h3><p>Сети: <b>ARP: duplicate IP — кто занял 10.0.0.55</b>. Работа с <code>project/arp-duplicate-i.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>ARP: duplicate IP — кто занял 10.0.0.55</b>. Файл <code>project/arp-duplicate-i.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] таблица ARP</li><li>[ ] обнаружить DUP</li><li>[ ] проверить соседа</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/arp-duplicate-i.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/arp-duplicate-i.yaml</code>. Активный файл открыт в редакторе. Начните с <code>arp -n \\\\| grep 10\\\\.0\\\\.0\\\\.5</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: таблица ARP → обнаружить DUP → проверить соседа.</p><h3>Проверка</h3><pre>cat project/arp-duplicate-i.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^arp -n \\| grep 10\\.0\\.0\\.55",`10.0.0.55 ether aa:bb:cc:dd:ee:01 C eth0`,"dim"],
 ["^arping -c3 -I eth0 10\\.0\\.0\\.55",`Reply from 10.0.0.55 [aa:bb:cc:dd:ee:01]\nReply from 10.0.0.55 [aa:bb:cc:dd:ee:02] DUP!`,"err"],
 ["^ip neigh show 10\\.0\\.0\\.55",`10.0.0.55 dev eth0 lladdr aa:bb:cc:dd:ee:02 REACHABLE`,"warn"]
],
[{re:"^arp -n",l:"таблица ARP"},
 {re:"^arping -c3",l:"обнаружить DUP"},
 {re:"^ip neigh show",l:"проверить соседа"}],{file:"project/arp-duplicate-i.yaml",files:{"project/arp-duplicate-i.yaml":`# Сети: ARP: duplicate IP — кто занял 10.0.0.55\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/arp-duplicate-i.yaml":`# Сети: ARP: duplicate IP — кто занял 10.0.0.55 — fixed\nstatus: ok\n`}},{hints:["Симптом: ARP: duplicate IP — кто занял 10.0.0.55 в project/arp-duplicate-i.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/arp-duplicate-i.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/arp-duplicate-i.yaml.","Порядок: таблица ARP → обнаружить DUP → проверить соседа"]});

S("Сети","gnet-11","conntrack таблица переполнена — dmesg nf_conntrack","Senior", `<h3>Контекст</h3><p>Сети: <b>conntrack таблица переполнена — dmesg nf_conntrack</b>. Работа с <code>project/conntrack-dmesg.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>conntrack таблица переполнена — dmesg nf_conntrack</b>. Файл <code>project/conntrack-dmesg.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти сообщение ядра</li><li>[ ] проверить счётчик и максимум</li><li>[ ] поднять лимит</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/conntrack-dmesg.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/conntrack-dmesg.yaml</code>. Активный файл открыт в редакторе. Начните с <code>dmesg \\\\| grep -i conntrack \\\\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти сообщение ядра → проверить счётчик и максимум → поднять лимит.</p><h3>Проверка</h3><pre>cat project/conntrack-dmesg.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^dmesg \\| grep -i conntrack \\| tail -5",`nf_conntrack: table full, dropping packet`,"err"],
 ["^cat /proc/sys/net/netfilter/nf_conntrack_count",`65536`,"err"],
 ["^cat /proc/sys/net/netfilter/nf_conntrack_max",`65536`,"err"],
 ["^sysctl -w net.netfilter.nf_conntrack_max=131072",`net.netfilter.nf_conntrack_max = 131072`,"ok"],
 ["^conntrack -L \\| wc -l",`65123`,"warn"]
],
[{re:"^dmesg.*conntrack",l:"найти сообщение ядра"},
 {re:"^cat /proc/sys/net/netfilter/nf_conntrack",l:"проверить счётчик и максимум"},
 {re:"^sysctl -w net.netfilter.nf_conntrack_max",l:"поднять лимит"}],{file:"project/conntrack-dmesg.yaml",files:{"project/conntrack-dmesg.yaml":`# Сети: conntrack таблица переполнена — dmesg nf_conntrack\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/conntrack-dmesg.yaml":`# Сети: conntrack таблица переполнена — dmesg nf_conntrack — fixed\nstatus: ok\n`}},{hints:["Симптом: conntrack таблица переполнена — dmesg nf_conntrack в project/conntrack-dmesg.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/conntrack-dmesg.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/conntrack-dmesg.yaml.","Порядок: найти сообщение ядра → проверить счётчик и максимум → поднять лимит"]});

S("Сети","gnet-12","WireGuard: handshake 2 hours ago — туннель молчит","Middle", `<h3>Контекст</h3><p>Сети: <b>WireGuard: handshake 2 hours ago — туннель молчит</b>. Работа с <code>project/wireguard-hands.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>WireGuard: handshake 2 hours ago — туннель молчит</b>. Файл <code>project/wireguard-hands.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить handshake</li><li>[ ] переподнять туннель</li><li>[ ] проверить связность</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/wireguard-hands.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/wireguard-hands.yaml</code>. Активный файл открыт в редакторе. Начните с <code>wg show</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить handshake → переподнять туннель → проверить связность.</p><h3>Проверка</h3><pre>cat project/wireguard-hands.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^wg show",`interface: wg0\n  latest handshake: 2 hours ago\n  transfer: 0 B received`,"err"],
 ["^wg show wg0 \\| grep endpoint",`endpoint: 203.0.113.7:51820`,"dim"],
 ["^systemctl status wg-quick@wg0 \\| grep Active",`active \\(exited\\)`,"warn"],
 ["^wg-quick down wg0 && wg-quick up wg0",``, "ok"],
 ["^wg show",`latest handshake: 8 seconds ago`,"ok"],
 ["^ping -c2 10\\.10\\.0\\.3",`2 packets transmitted, 2 received`,"ok"]
],
[{re:"^wg show",l:"проверить handshake"},
 {re:"^wg-quick down wg0",l:"переподнять туннель"},
 {re:"^ping -c2 10",l:"проверить связность"}],{file:"project/wireguard-hands.yaml",files:{"project/wireguard-hands.yaml":`# Сети: WireGuard: handshake 2 hours ago — туннель молчит\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/wireguard-hands.yaml":`# Сети: WireGuard: handshake 2 hours ago — туннель молчит — fixed\nstatus: ok\n`}},{hints:["Симптом: WireGuard: handshake 2 hours ago — туннель молчит в project/wireguard-hands.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/wireguard-hands.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/wireguard-hands.yaml.","Порядок: проверить handshake → переподнять туннель → проверить связность"]});

S("Сети","gnet-13","Cilium: Hubble показывает Policy denied","Senior", `<h3>Контекст</h3><p>Сети: <b>Cilium: Hubble показывает Policy denied</b>. Работа с <code>project/cilium-hubble-p.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Cilium: Hubble показывает Policy denied</b>. Файл <code>project/cilium-hubble-p.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] увидеть дроп и причину</li><li>[ ] найти default-deny</li><li>[ ] разрешить web→api</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/cilium-hubble-p.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/cilium-hubble-p.yaml</code>. Активный файл открыт в редакторе. Начните с <code>hubble observe --verdict DROPP</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: увидеть дроп и причину → найти default-deny → разрешить web→api.</p><h3>Проверка</h3><pre>cat project/cilium-hubble-p.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^hubble observe --verdict DROPPED --since 5m 2>&1 \\| head -20",`DROP web -> api:8080 Policy denied`,"err"],
 ["^kubectl get networkpolicy -A \\| grep default",`prod default-deny-all`,"warn"],
 ["^kubectl get ciliumnetworkpolicy -A 2>&1 \\| head -10",`prod allow-web-to-api`,"dim"],
 ["^kubectl apply -f allow-web-to-api.yaml",`ciliumnetworkpolicy.cilium.io/allow-web-to-api created`,"ok"],
 ["^hubble observe --verdict DROPPED --since 1m",`(пусто)`,"ok"]
],
[{re:"^hubble observe",l:"увидеть дроп и причину"},
 {re:"^kubectl get networkpolicy",l:"найти default-deny"},
 {re:"^kubectl apply -f allow",l:"разрешить web→api"}],{file:"project/cilium-hubble-p.yaml",files:{"project/cilium-hubble-p.yaml":`# Сети: Cilium: Hubble показывает Policy denied\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/cilium-hubble-p.yaml":`# Сети: Cilium: Hubble показывает Policy denied — fixed\nstatus: ok\n`}},{hints:["Симптом: Cilium: Hubble показывает Policy denied в project/cilium-hubble-p.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/cilium-hubble-p.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/cilium-hubble-p.yaml.","Порядок: увидеть дроп и причину → найти default-deny → разрешить web→api"]});

S("Сети","gnet-14","CoreDNS: forward уходит в таймаут","Middle", `<h3>Контекст</h3><p>Сети: <b>CoreDNS: forward уходит в таймаут</b>. Работа с <code>project/coredns-forward.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>CoreDNS: forward уходит в таймаут</b>. Файл <code>project/coredns-forward.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить через kube-dns</li><li>[ ] найти битый upstream</li><li>[ ] перезапустить CoreDNS</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/coredns-forward.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/coredns-forward.yaml</code>. Активный файл открыт в редакторе. Начните с <code>dig example\\\\.com @10\\\\.96\\\\.0</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить через kube-dns → найти битый upstream → перезапустить CoreDNS.</p><h3>Проверка</h3><pre>cat project/coredns-forward.yaml<br>проверить код</pre>`,
"root@node:~#",
[
 ["^dig example\\.com @10\\.96\\.0\\.10 \\+short",`(timeout)`,"err"],
 ["^kubectl -n kube-system get cm coredns -o jsonpath=\"{.data.Corefile}\" \\| grep forward",`forward . 10.0.0.53`,"warn"],
 ["^kubectl -n kube-system edit cm coredns",`forward . /etc/resolv.conf 8.8.8.8`,"ok"],
 ["^kubectl rollout restart deploy coredns -n kube-system",``, "dim"],
 ["^dig example\\.com @10\\.96\\.0\\.10 \\+short",`93.184.216.34`,"ok"]
],
[{re:"^dig example\\.com @10",l:"проверить через kube-dns"},
 {re:"forward",l:"найти битый upstream"},
 {re:"^kubectl rollout restart deploy coredns",l:"перезапустить CoreDNS"}],{file:"project/coredns-forward.yaml",files:{"project/coredns-forward.yaml":`# Сети: CoreDNS: forward уходит в таймаут\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/coredns-forward.yaml":`# Сети: CoreDNS: forward уходит в таймаут — fixed\nstatus: ok\n`}},{hints:["Симптом: CoreDNS: forward уходит в таймаут в project/coredns-forward.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/coredns-forward.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/coredns-forward.yaml.","Порядок: проверить через kube-dns → найти битый upstream → перезапустить CoreDNS"]});

S("Сети","gnet-15","ndots:5 делает 5 лишних DNS запросов","Senior", `<h3>Контекст</h3><p>Сети: <b>ndots:5 делает 5 лишних DNS запросов</b>. Работа с <code>project/ndots-5-5-dns-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>ndots:5 делает 5 лишних DNS запросов</b>. Файл <code>project/ndots-5-5-dns-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить ndots в подике</li><li>[ ] пропатчить dnsConfig</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/ndots-5-5-dns-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/ndots-5-5-dns-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl run t --rm -it --image</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить ndots в подике → пропатчить dnsConfig.</p><h3>Проверка</h3><pre>cat project/ndots-5-5-dns-.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^kubectl run t --rm -it --image=busybox -- cat /etc/resolv.conf \\| grep ndots",`options ndots:5`,"warn"],
 ["^kubectl -n prod get deploy api -o jsonpath=\"{.spec.template.spec.dnsConfig}\"",`(пусто)`,"dim"],
 ["^kubectl patch deploy api -n prod -p '{\"spec\":{\"template\":{\"spec\":{\"dnsConfig\":{\"options\":\\[{\"name\":\"ndots\",\"value\":\"2\"}\\]}}}}}'",``, "ok"],
 ["^kubectl -n prod exec deploy/api -- cat /etc/resolv.conf \\| grep ndots",`options ndots:2`,"ok"]
],
[{re:"ndots",l:"проверить ndots в подике"},
 {re:"^kubectl patch deploy api",l:"пропатчить dnsConfig"}],{file:"project/ndots-5-5-dns-.yaml",files:{"project/ndots-5-5-dns-.yaml":`# Сети: ndots:5 делает 5 лишних DNS запросов\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/ndots-5-5-dns-.yaml":`# Сети: ndots:5 делает 5 лишних DNS запросов — fixed\nstatus: ok\n`}},{hints:["Симптом: ndots:5 делает 5 лишних DNS запросов в project/ndots-5-5-dns-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/ndots-5-5-dns-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/ndots-5-5-dns-.yaml.","Порядок: проверить ndots в подике → пропатчить dnsConfig"]});

S("Сети","gnet-16","MetalLB: EXTERNAL-IP pending — нет пула","Middle", `<h3>Контекст</h3><p>Сети: <b>MetalLB: EXTERNAL-IP pending — нет пула</b>. Работа с <code>project/metallb-externa.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>MetalLB: EXTERNAL-IP pending — нет пула</b>. Файл <code>project/metallb-externa.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] увидеть pending</li><li>[ ] лог speaker</li><li>[ ] создать пул</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/metallb-externa.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/metallb-externa.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get svc -n ingress-ngi</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: увидеть pending → лог speaker → создать пул.</p><h3>Проверка</h3><pre>cat project/metallb-externa.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^kubectl get svc -n ingress-nginx ingress-nginx -o wide",`ingress-nginx LoadBalancer <pending>`,"err"],
 ["^kubectl -n metallb-system logs ds/speaker --tail=20 2>&1 \\| grep -i pool",`no available IP in pool`,"err"],
 ["^kubectl apply -f - <<'EOF'\napiVersion: metallb.io/v1beta1\nkind: IPAddressPool\nmetadata:\n  name: lab\n  namespace: metallb-system\nspec:\n  addresses: [192.168.88.200-192.168.88.220]",`ipaddresspool created`,"ok"],
 ["^kubectl apply -f - <<'EOF'\napiVersion: metallb.io/v1beta1\nkind: L2Advertisement\nmetadata:\n  name: lab\n  namespace: metallb-system",`l2advertisement created`,"ok"],
 ["^kubectl get svc -n ingress-nginx ingress-nginx -o jsonpath=\"{.status.loadBalancer.ingress[0].ip}\"",`192.168.88.201`,"ok"]
],
[{re:"^kubectl get svc -n ingress-nginx",l:"увидеть pending"},
 {re:"logs ds/speaker",l:"лог speaker"},
 {re:"IPAddressPool",l:"создать пул"},
 {re:"L2Advertisement",l:"создать анонс"}],{file:"project/metallb-externa.yaml",files:{"project/metallb-externa.yaml":`# Сети: MetalLB: EXTERNAL-IP pending — нет пула\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/metallb-externa.yaml":`# Сети: MetalLB: EXTERNAL-IP pending — нет пула — fixed\nstatus: ok\n`}},{hints:["Симптом: MetalLB: EXTERNAL-IP pending — нет пула в project/metallb-externa.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/metallb-externa.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/metallb-externa.yaml.","Порядок: увидеть pending → лог speaker → создать пул"]});

S("Сети","gnet-17","HAProxy: drain ноды без даунтайма через admin.sock","Middle", `<h3>Контекст</h3><p>Сети: <b>HAProxy: drain ноды без даунтайма через admin.sock</b>. Работа с <code>project/haproxy-drain-a.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>HAProxy: drain ноды без даунтайма через admin.sock</b>. Файл <code>project/haproxy-drain-a.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить состояние</li><li>[ ] вывести в maint</li><li>[ ] вернуть</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/haproxy-drain-a.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/haproxy-drain-a.yaml</code>. Активный файл открыт в редакторе. Начните с <code>echo \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить состояние → вывести в maint → вернуть.</p><h3>Проверка</h3><pre>cat project/haproxy-drain-a.yaml<br>проверить код</pre>`,
"root@lb:~#",
[
 ["^echo \"show stat\" \\| socat stdio /run/haproxy/admin.sock \\| grep bk_api",`bk_api api1 0 0 UP\nbk_api api2 0 0 UP`,"ok"],
 ["^echo \"set server bk_api/api1 state maint\" \\| socat stdio /run/haproxy/admin.sock",``, "ok"],
 ["^echo \"show stat\" \\| socat stdio /run/haproxy/admin.sock \\| grep api1",`api1 MAINT`,"ok"],
 ["^echo \"set server bk_api/api1 state ready\" \\| socat stdio /run/haproxy/admin.sock",``, "ok"],
 ["^echo \"show stat\" \\| socat stdio /run/haproxy/admin.sock \\| grep api1",`api1 UP`,"ok"]
],
[{re:"show stat",l:"проверить состояние"},
 {re:"state maint",l:"вывести в maint"},
 {re:"state ready",l:"вернуть"}],{file:"project/haproxy-drain-a.yaml",files:{"project/haproxy-drain-a.yaml":`# Сети: HAProxy: drain ноды без даунтайма через admin.sock\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/haproxy-drain-a.yaml":`# Сети: HAProxy: drain ноды без даунтайма через admin.sock — fixed\nstatus: ok\n`}},{hints:["Симптом: HAProxy: drain ноды без даунтайма через admin.sock в project/haproxy-drain-a.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/haproxy-drain-a.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/haproxy-drain-a.yaml.","Порядок: проверить состояние → вывести в maint → вернуть"]});

S("Сети","gnet-18","Envoy outlier ejection выкидывает живой upstream","Senior", `<h3>Контекст</h3><p>Сети: <b>Envoy outlier ejection выкидывает живой upstream</b>. Работа с <code>project/envoy-outlier-e.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Envoy outlier ejection выкидывает живой upstream</b>. Файл <code>project/envoy-outlier-e.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти outlierDetection</li><li>[ ] проверить ejection</li><li>[ ] смягчить порог</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/envoy-outlier-e.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/envoy-outlier-e.yaml</code>. Активный файл открыт в редакторе. Начните с <code>istioctl proxy-config cluster </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти outlierDetection → проверить ejection → смягчить порог.</p><h3>Проверка</h3><pre>cat project/envoy-outlier-e.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^istioctl proxy-config cluster deploy/api --fqdn api.prod.svc.cluster.local -o json \\| grep -i outlier",`outlierDetection`,"warn"],
 ["^kubectl exec deploy/api -c istio-proxy -- curl -s localhost:15000/clusters \\| grep api",`ejections_active: 1`,"err"],
 ["^kubectl patch destinationrule api -n prod -p '{\"spec\":{\"trafficPolicy\":{\"outlierDetection\":{\"consecutive5xxErrors\":5}}}}'",``, "ok"],
 ["^kubectl exec deploy/api -c istio-proxy -- curl -s localhost:15000/clusters \\| grep ejections_active",`ejections_active: 0`,"ok"]
],
[{re:"proxy-config cluster",l:"найти outlierDetection"},
 {re:"localhost:15000/clusters",l:"проверить ejection"},
 {re:"patch destinationrule",l:"смягчить порог"}],{file:"project/envoy-outlier-e.yaml",files:{"project/envoy-outlier-e.yaml":`# Сети: Envoy outlier ejection выкидывает живой upstream\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/envoy-outlier-e.yaml":`# Сети: Envoy outlier ejection выкидывает живой upstream — fixed\nstatus: ok\n`}},{hints:["Симптом: Envoy outlier ejection выкидывает живой upstream в project/envoy-outlier-e.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/envoy-outlier-e.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/envoy-outlier-e.yaml.","Порядок: найти outlierDetection → проверить ejection → смягчить порог"]});

S("Сети","gnet-19","BGP: сосед down, hold timer expired","Senior", `<h3>Контекст</h3><p>Сети: <b>BGP: сосед down, hold timer expired</b>. Работа с <code>project/bgp-down-hold-t.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>BGP: сосед down, hold timer expired</b>. Файл <code>project/bgp-down-hold-t.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] статус BGP</li><li>[ ] детали сессии</li><li>[ ] поднять</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/bgp-down-hold-t.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/bgp-down-hold-t.yaml</code>. Активный файл открыт в редакторе. Начните с <code>birdc show protocols \\\\| grep </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: статус BGP → детали сессии → поднять.</p><h3>Проверка</h3><pre>cat project/bgp-down-hold-t.yaml<br>проверить код</pre>`,
"root@router:~#",
[
 ["^birdc show protocols \\| grep bgp",`bgp1 BGP Down hold timer expired`,"err"],
 ["^birdc show protocol bgp1",`BGP state: Idle, hold timer 90, keepalive 30`,"warn"],
 ["^cat /etc/bird/bird.conf \\| grep -A3 bgp1",`neighbor 10.0.0.254 as 65001`,"dim"],
 ["^birdc enable bgp1",``, "ok"],
 ["^birdc show protocols \\| grep bgp",`bgp1 BGP Established`,"ok"]
],
[{re:"^birdc show protocols",l:"статус BGP"},
 {re:"^birdc show protocol bgp1",l:"детали сессии"},
 {re:"^birdc enable bgp1",l:"поднять"}],{file:"project/bgp-down-hold-t.yaml",files:{"project/bgp-down-hold-t.yaml":`# Сети: BGP: сосед down, hold timer expired\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/bgp-down-hold-t.yaml":`# Сети: BGP: сосед down, hold timer expired — fixed\nstatus: ok\n`}},{hints:["Симптом: BGP: сосед down, hold timer expired в project/bgp-down-hold-t.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/bgp-down-hold-t.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/bgp-down-hold-t.yaml.","Порядок: статус BGP → детали сессии → поднять"]});

S("Сети","gnet-20","VLAN trunk: native VLAN mismatch — пакеты без тега дропаются","Senior", `<h3>Контекст</h3><p>Сети: <b>VLAN trunk: native VLAN mismatch — пакеты без тега дропаются</b>. Работа с <code>project/vlan-trunk-nati.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>VLAN trunk: native VLAN mismatch — пакеты без тега дропаются</b>. Файл <code>project/vlan-trunk-nati.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти mismatch</li><li>[ ] посмотреть VLAN</li><li>[ ] исправить native</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/vlan-trunk-nati.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/vlan-trunk-nati.yaml</code>. Активный файл открыт в редакторе. Начните с <code>show interfaces trunk \\\\| grep</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти mismatch → посмотреть VLAN → исправить native.</p><h3>Проверка</h3><pre>cat project/vlan-trunk-nati.yaml<br>проверить код</pre>`,
"root@switch:~#",
[
 ["^show interfaces trunk \\| grep native",`port 1 native vlan 1, peer native vlan 10`,"err"],
 ["^show vlan brief",`VLAN 1 default active\nVLAN 10 prod active`,"warn"],
 ["^configure terminal\ninterface eth1\nswitchport trunk native vlan 10",`patched`,"ok"],
 ["^show interfaces trunk \\| grep native",`native vlan 10 both sides`,"ok"]
],
[{re:"show interfaces trunk",l:"найти mismatch"},
 {re:"show vlan brief",l:"посмотреть VLAN"},
 {re:"switchport trunk native vlan 10",l:"исправить native"}],{file:"project/vlan-trunk-nati.yaml",files:{"project/vlan-trunk-nati.yaml":`# Сети: VLAN trunk: native VLAN mismatch — пакеты без тега дропаются\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/vlan-trunk-nati.yaml":`# Сети: VLAN trunk: native VLAN mismatch — пакеты без тега дропаются — fixed\nstatus: ok\n`}},{hints:["Симптом: VLAN trunk: native VLAN mismatch — пакеты без тега дропаются в project/vlan-trunk-nati.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/vlan-trunk-nati.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/vlan-trunk-nati.yaml.","Порядок: найти mismatch → посмотреть VLAN → исправить native"]});

S("Сети","gnet-21","VXLAN: VNI mismatch между нодами","Senior", `<h3>Контекст</h3><p>Сети: <b>VXLAN: VNI mismatch между нодами</b>. Работа с <code>project/vxlan-vni-misma.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>VXLAN: VNI mismatch между нодами</b>. Файл <code>project/vxlan-vni-misma.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] сверить VNI</li><li>[ ] исправить VNI</li><li>[ ] проверить FDB</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/vxlan-vni-misma.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/vxlan-vni-misma.yaml</code>. Активный файл открыт в редакторе. Начните с <code>ip -d link show vxlan0 \\\\| gre</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: сверить VNI → исправить VNI → проверить FDB.</p><h3>Проверка</h3><pre>cat project/vxlan-vni-misma.yaml<br>проверить код</pre>`,
"root@node:~#",
[
 ["^ip -d link show vxlan0 \\| grep vxlan",`vxlan id 41 group 239.0.0.1 dev eth0`,"warn"],
 ["^ip -d link show vxlan0",`vxlan id 42 on node2 vs 41 on node1`,"err"],
 ["^ip link set vxlan0 type vxlan id 42",``, "ok"],
 ["^bridge fdb show dev vxlan0 \\| head -5",`aa:bb:cc:dd:ee:02 dev vxlan0 dst 10.0.0.12`,"ok"]
],
[{re:"^ip -d link show vxlan0",l:"сверить VNI"},
 {re:"^ip link set vxlan0 type vxlan id 42",l:"исправить VNI"},
 {re:"^bridge fdb show",l:"проверить FDB"}],{file:"project/vxlan-vni-misma.yaml",files:{"project/vxlan-vni-misma.yaml":`# Сети: VXLAN: VNI mismatch между нодами\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/vxlan-vni-misma.yaml":`# Сети: VXLAN: VNI mismatch между нодами — fixed\nstatus: ok\n`}},{hints:["Симптом: VXLAN: VNI mismatch между нодами в project/vxlan-vni-misma.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/vxlan-vni-misma.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/vxlan-vni-misma.yaml.","Порядок: сверить VNI → исправить VNI → проверить FDB"]});

S("Сети","gnet-22","NetworkPolicy: default-deny режет web→api","Middle", `<h3>Контекст</h3><p>Сети: <b>NetworkPolicy: default-deny режет web→api</b>. Работа с <code>project/networkpolicy-d.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>NetworkPolicy: default-deny режет web→api</b>. Файл <code>project/networkpolicy-d.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти default-deny</li><li>[ ] проверить связность</li><li>[ ] добавить allow правило</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/networkpolicy-d.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/networkpolicy-d.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get networkpolicy -n p</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти default-deny → проверить связность → добавить allow правило.</p><h3>Проверка</h3><pre>cat project/networkpolicy-d.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^kubectl get networkpolicy -n prod",`default-deny-all`,"warn"],
 ["^kubectl -n prod exec deploy/web -- nc -zv api 8080",`nc: timeout`,"err"],
 ["^kubectl apply -f - <<'EOF'\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: allow-web-to-api\n  namespace: prod\nspec:\n  podSelector:\n    matchLabels:\n      app: api\n  ingress:\n  - from:\n    - podSelector:\n        matchLabels:\n          app: web",`networkpolicy created`,"ok"],
 ["^kubectl -n prod exec deploy/web -- nc -zv api 8080",`open`,"ok"]
],
[{re:"^kubectl get networkpolicy",l:"найти default-deny"},
 {re:"^kubectl -n prod exec deploy/web -- nc",l:"проверить связность"},
 {re:"^kubectl apply -f",l:"добавить allow правило"}],{file:"project/networkpolicy-d.yaml",files:{"project/networkpolicy-d.yaml":`# Сети: NetworkPolicy: default-deny режет web→api\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/networkpolicy-d.yaml":`# Сети: NetworkPolicy: default-deny режет web→api — fixed\nstatus: ok\n`}},{hints:["Симптом: NetworkPolicy: default-deny режет web→api в project/networkpolicy-d.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/networkpolicy-d.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/networkpolicy-d.yaml.","Порядок: найти default-deny → проверить связность → добавить allow правило"]});

S("Сети","gnet-23","Headless Service не резолвит поды","Middle", `<h3>Контекст</h3><p>Сети: <b>Headless Service не резолвит поды</b>. Работа с <code>project/headless-servic.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Headless Service не резолвит поды</b>. Файл <code>project/headless-servic.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить headless</li><li>[ ] проверить DNS</li><li>[ ] включить publishNotReady</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/headless-servic.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/headless-servic.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl -n prod get svc api-he</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить headless → проверить DNS → включить publishNotReady.</p><h3>Проверка</h3><pre>cat project/headless-servic.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^kubectl -n prod get svc api-headless -o yaml \\| grep clusterIP",`clusterIP: None`,"ok"],
 ["^dig api-headless\\.prod\\.svc\\.cluster\\.local \\+short",`(пусто)`,"err"],
 ["^kubectl -n prod get endpoints api-headless -o wide",`ENDPOINTS <none> — ready=false`,"err"],
 ["^kubectl patch svc api-headless -n prod -p '{\"spec\":{\"publishNotReadyAddresses\":true}}'",``, "ok"],
 ["^dig api-headless\\.prod\\.svc\\.cluster\\.local \\+short",`10.244.1.5\n10.244.2.7`,"ok"]
],
[{re:"^kubectl -n prod get svc api-headless",l:"проверить headless"},
 {re:"^dig api-headless",l:"проверить DNS"},
 {re:"publishNotReadyAddresses",l:"включить publishNotReady"}],{file:"project/headless-servic.yaml",files:{"project/headless-servic.yaml":`# Сети: Headless Service не резолвит поды\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/headless-servic.yaml":`# Сети: Headless Service не резолвит поды — fixed\nstatus: ok\n`}},{hints:["Симптом: Headless Service не резолвит поды в project/headless-servic.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/headless-servic.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/headless-servic.yaml.","Порядок: проверить headless → проверить DNS → включить publishNotReady"]});

S("Сети","gnet-24","kube-proxy: iptables vs IPVS — нет балансировки","Senior", `<h3>Контекст</h3><p>Сети: <b>kube-proxy: iptables vs IPVS — нет балансировки</b>. Работа с <code>project/kube-proxy-ipta.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>kube-proxy: iptables vs IPVS — нет балансировки</b>. Файл <code>project/kube-proxy-ipta.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить mode</li><li>[ ] увидеть iptables нагрузку</li><li>[ ] переключить на ipvs</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/kube-proxy-ipta.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/kube-proxy-ipta.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl -n kube-system get cm </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить mode → увидеть iptables нагрузку → переключить на ipvs.</p><h3>Проверка</h3><pre>cat project/kube-proxy-ipta.yaml<br>проверить код</pre>`,
"root@node:~#",
[
 ["^kubectl -n kube-system get cm kube-proxy -o yaml \\| grep mode",`mode: \"iptables\"`,"warn"],
 ["^iptables -L KUBE-SVC-XXXX -n --line-numbers \\| head -20",`Chain KUBE-SVC-XXXX 3 rules`,"dim"],
 ["^kubectl -n kube-system edit cm kube-proxy",`mode: \"ipvs\"`,"ok"],
 ["^kubectl -n kube-system rollout restart ds kube-proxy",``, "ok"],
 ["^ipvsadm -Ln \\| head -20",`TCP 10.96.0.1:443 rr\n -> 10.0.0.11:6443`,"ok"]
],
[{re:"kube-proxy.*mode",l:"проверить mode"},
 {re:"^iptables -L KUBE-SVC",l:"увидеть iptables нагрузку"},
 {re:"^kubectl -n kube-system edit cm kube-proxy",l:"переключить на ipvs"},
 {re:"^ipvsadm -Ln",l:"проверить IPVS"}],{file:"project/kube-proxy-ipta.yaml",files:{"project/kube-proxy-ipta.yaml":`# Сети: kube-proxy: iptables vs IPVS — нет балансировки\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/kube-proxy-ipta.yaml":`# Сети: kube-proxy: iptables vs IPVS — нет балансировки — fixed\nstatus: ok\n`}},{hints:["Симптом: kube-proxy: iptables vs IPVS — нет балансировки в project/kube-proxy-ipta.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/kube-proxy-ipta.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/kube-proxy-ipta.yaml.","Порядок: проверить mode → увидеть iptables нагрузку → переключить на ipvs"]});

S("Сети","gnet-25","TLS SNI mismatch — сертификат для другого домена","Middle", `<h3>Контекст</h3><p>Сети: <b>TLS SNI mismatch — сертификат для другого домена</b>. Работа с <code>project/tls-sni-mismatc.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>TLS SNI mismatch — сертификат для другого домена</b>. Файл <code>project/tls-sni-mismatc.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить SNI</li><li>[ ] сверить сертификат</li><li>[ ] найти неверный dnsName</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/tls-sni-mismatc.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/tls-sni-mismatc.yaml</code>. Активный файл открыт в редакторе. Начните с <code>curl -vk https://api\\\\.corp\\\\.</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить SNI → сверить сертификат → найти неверный dnsName.</p><h3>Проверка</h3><pre>cat project/tls-sni-mismatc.yaml<br>проверить код</pre>`,
"ubuntu@lab:~$",
[
 ["^curl -vk https://api\\.corp\\.local 2>&1 \\| grep -i \"subject:\"",`subject: CN=grafana.corp.local`,"err"],
 ["^openssl s_client -connect api\\.corp\\.local:443 -servername api\\.corp\\.local 2>&1 \\| grep -i subject",`subject=CN = grafana.corp.local`,"err"],
 ["^kubectl get certificate -n prod api -o yaml \\| grep dnsNames",`dnsNames: [grafana.corp.local]`,"err"],
 ["^kubectl patch certificate api -n prod -p '{\"spec\":{\"dnsNames\":\\[\"api.corp.local\"\\]}}'",``, "ok"],
 ["^curl -k https://api\\.corp\\.local/healthz",`{\"status\":\"ok\"}`,"ok"]
],
[{re:"^curl -vk",l:"проверить SNI"},
 {re:"^openssl s_client",l:"сверить сертификат"},
 {re:"^kubectl get certificate",l:"найти неверный dnsName"}],{file:"project/tls-sni-mismatc.yaml",files:{"project/tls-sni-mismatc.yaml":`# Сети: TLS SNI mismatch — сертификат для другого домена\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/tls-sni-mismatc.yaml":`# Сети: TLS SNI mismatch — сертификат для другого домена — fixed\nstatus: ok\n`}},{hints:["Симптом: TLS SNI mismatch — сертификат для другого домена в project/tls-sni-mismatc.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/tls-sni-mismatc.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/tls-sni-mismatc.yaml.","Порядок: проверить SNI → сверить сертификат → найти неверный dnsName"]});

S("Сети","gnet-26","mtr: где теряются пакеты к БД","Middle", `<h3>Контекст</h3><p>Сети: <b>mtr: где теряются пакеты к БД</b>. Работа с <code>project/mtr-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>mtr: где теряются пакеты к БД</b>. Файл <code>project/mtr-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] запустить mtr</li><li>[ ] подтвердить хоп</li><li>[ ] проверить дропы NIC</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/mtr-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/mtr-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mtr --report -c 20 10\\\\.0\\\\.0\\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: запустить mtr → подтвердить хоп → проверить дропы NIC.</p><h3>Проверка</h3><pre>cat project/mtr-.yaml<br>проверить код</pre>`,
"root@lab:~#",
[
 ["^mtr --report -c 20 10\\.0\\.0\\.40",`HOST Loss%  Snt  Avg\n 1. 10.0.0.1 0.0% 20 0.4\n 2. 10.0.0.254 45.0% 20 12.3  <-- потери\n 3. 10.0.0.40 45.0% 20 12.5`,"err"],
 ["^ping -c20 10\\.0\\.0\\.254 \\| tail -3",`20 packets transmitted, 11 received, 45% loss`,"err"],
 ["^ethtool -S eth0 \\| grep -i drop",`rx_dropped: 123441`,"warn"]
],
[{re:"^mtr --report",l:"запустить mtr"},
 {re:"^ping -c20 10",l:"подтвердить хоп"},
 {re:"^ethtool -S eth0",l:"проверить дропы NIC"}],{file:"project/mtr-.yaml",files:{"project/mtr-.yaml":`# Сети: mtr: где теряются пакеты к БД\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/mtr-.yaml":`# Сети: mtr: где теряются пакеты к БД — fixed\nstatus: ok\n`}},{hints:["Симптом: mtr: где теряются пакеты к БД в project/mtr-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/mtr-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/mtr-.yaml.","Порядок: запустить mtr → подтвердить хоп → проверить дропы NIC"]});

S("Сети","gnet-27","SNAT не работает — нет masquerade для pod сети","Senior", `<h3>Контекст</h3><p>Сети: <b>SNAT не работает — нет masquerade для pod сети</b>. Работа с <code>project/snat-masquerade.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>SNAT не работает — нет masquerade для pod сети</b>. Файл <code>project/snat-masquerade.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить MASQUERADE</li><li>[ ] проверить egress из пода</li><li>[ ] добавить MASQUERADE</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/snat-masquerade.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/snat-masquerade.yaml</code>. Активный файл открыт в редакторе. Начните с <code>iptables -t nat -L POSTROUTING</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить MASQUERADE → проверить egress из пода → добавить MASQUERADE.</p><h3>Проверка</h3><pre>cat project/snat-masquerade.yaml<br>проверить код</pre>`,
"root@node:~#",
[
 ["^iptables -t nat -L POSTROUTING -n -v \\| grep 10\\.244",`(пусто)`,"err"],
 ["^kubectl -n prod exec deploy/api -- ping -c2 8\\.8\\.8\\.8",`100% loss`,"err"],
 ["^iptables -t nat -A POSTROUTING -s 10\\.244\\.0\\.0/16 -o eth0 -j MASQUERADE",``, "ok"],
 ["^kubectl -n prod exec deploy/api -- ping -c2 8\\.8\\.8\\.8",`2 packets transmitted, 2 received`,"ok"]
],
[{re:"^iptables -t nat -L POSTROUTING",l:"проверить MASQUERADE"},
 {re:"^kubectl -n prod exec deploy/api -- ping",l:"проверить egress из пода"},
 {re:"^iptables -t nat -A POSTROUTING",l:"добавить MASQUERADE"}],{file:"project/snat-masquerade.yaml",files:{"project/snat-masquerade.yaml":`# Сети: SNAT не работает — нет masquerade для pod сети\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/snat-masquerade.yaml":`# Сети: SNAT не работает — нет masquerade для pod сети — fixed\nstatus: ok\n`}},{hints:["Симптом: SNAT не работает — нет masquerade для pod сети в project/snat-masquerade.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/snat-masquerade.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/snat-masquerade.yaml.","Порядок: проверить MASQUERADE → проверить egress из пода → добавить MASQUERADE"]});

S("Сети","gnet-28","SSH ProxyJump: прямой доступ к 10.0.10.15 закрыт","Junior", `<h3>Контекст</h3><p>Сети: <b>SSH ProxyJump: прямой доступ к 10.0.10.15 закрыт</b>. Работа с <code>project/ssh-proxyjump-1.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>SSH ProxyJump: прямой доступ к 10.0.10.15 закрыт</b>. Файл <code>project/ssh-proxyjump-1.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить прямой доступ</li><li>[ ] настроить ProxyJump</li><li>[ ] проверить через alias</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/ssh-proxyjump-1.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/ssh-proxyjump-1.yaml</code>. Активный файл открыт в редакторе. Начните с <code>ssh 10\\\\.0\\\\.10\\\\.15 echo ok</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить прямой доступ → настроить ProxyJump → проверить через alias.</p><h3>Проверка</h3><pre>cat project/ssh-proxyjump-1.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
 ["^ssh 10\\.0\\.10\\.15 echo ok",`ssh: connect to host 10.0.10.15 port 22: Connection timed out`,"err"],
 ["^cat >> ~/.ssh/config <<'EOF'\nHost priv\n  HostName 10.0.10.15\n  ProxyJump bastion.corp.local",``, "ok"],
 ["^cat ~/.ssh/config \\| grep -A2 Host",`Host priv\n  HostName 10.0.10.15`,"ok"],
 ["^ssh priv echo ok",`ok`,"ok"],
 ["^ssh -J bastion\\.corp\\.local 10\\.0\\.10\\.15 echo ok",`ok`,"ok"]
],
[{re:"^ssh 10",l:"проверить прямой доступ"},
 {re:"ProxyJump",l:"настроить ProxyJump"},
 {re:"^ssh priv",l:"проверить через alias"}],{file:"project/ssh-proxyjump-1.yaml",files:{"project/ssh-proxyjump-1.yaml":`# Сети: SSH ProxyJump: прямой доступ к 10.0.10.15 закрыт\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/ssh-proxyjump-1.yaml":`# Сети: SSH ProxyJump: прямой доступ к 10.0.10.15 закрыт — fixed\nstatus: ok\n`}},{hints:["Симптом: SSH ProxyJump: прямой доступ к 10.0.10.15 закрыт в project/ssh-proxyjump-1.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/ssh-proxyjump-1.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/ssh-proxyjump-1.yaml.","Порядок: проверить прямой доступ → настроить ProxyJump → проверить через alias"]});

S("Сети","gnet-29","ip_forward=0 ломает pod сеть","Middle", `<h3>Контекст</h3><p>Сети: <b>ip_forward=0 ломает pod сеть</b>. Работа с <code>project/ip-forward-0-po.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>ip_forward=0 ломает pod сеть</b>. Файл <code>project/ip-forward-0-po.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить ip_forward</li><li>[ ] включить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/ip-forward-0-po.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/ip-forward-0-po.yaml</code>. Активный файл открыт в редакторе. Начните с <code>sysctl net\\\\.ipv4\\\\.ip_forward</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить ip_forward → включить.</p><h3>Проверка</h3><pre>cat project/ip-forward-0-po.yaml<br>проверить код</pre>`,
"root@node:~#",
[
 ["^sysctl net\\.ipv4\\.ip_forward",`net.ipv4.ip_forward = 0`,"err"],
 ["^iptables -t nat -L -n \\| head -10",`Chain PREROUTING ...`,"dim"],
 ["^sysctl -w net\\.ipv4\\.ip_forward=1",`net.ipv4.ip_forward = 1`,"ok"],
 ["^echo \"net.ipv4.ip_forward=1\" >> /etc/sysctl.conf",``, "ok"],
 ["^kubectl get pods -o wide \\| grep Running",`api-xxx 1/1 Running`,"ok"]
],
[{re:"^sysctl net\\.ipv4\\.ip_forward",l:"проверить ip_forward"},
 {re:"^sysctl -w net\\.ipv4\\.ip_forward=1",l:"включить"}],{file:"project/ip-forward-0-po.yaml",files:{"project/ip-forward-0-po.yaml":`# Сети: ip_forward=0 ломает pod сеть\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/ip-forward-0-po.yaml":`# Сети: ip_forward=0 ломает pod сеть — fixed\nstatus: ok\n`}},{hints:["Симптом: ip_forward=0 ломает pod сеть в project/ip-forward-0-po.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/ip-forward-0-po.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/ip-forward-0-po.yaml.","Порядок: проверить ip_forward → включить"]});

S("Сети","gnet-30","CNI: flannel/cilium не стартует — нет /opt/cni/bin","Middle", `<h3>Контекст</h3><p>Сети: <b>CNI: flannel/cilium не стартует — нет /opt/cni/bin</b>. Работа с <code>project/cni-flannel-cil.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>CNI: flannel/cilium не стартует — нет /opt/cni/bin</b>. Файл <code>project/cni-flannel-cil.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] лог CNI</li><li>[ ] проверить бинарники</li><li>[ ] восстановить плагины</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/cni-flannel-cil.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/cni-flannel-cil.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl -n kube-system logs ds</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: лог CNI → проверить бинарники → восстановить плагины.</p><h3>Проверка</h3><pre>cat project/cni-flannel-cil.yaml<br>проверить код</pre>`,
"root@node:~#",
[
 ["^kubectl -n kube-system logs ds/cilium --tail=10 2>&1 \\| grep -i cni",`failed to find plugin \"cilium-cni\" in path \\[/opt/cni/bin\\]`,"err"],
 ["^ls /opt/cni/bin/ 2>&1 \\| head -20",`ls: cannot access '/opt/cni/bin': No such file`,"err"],
 ["^mkdir -p /opt/cni/bin && tar -xzf /tmp/cni-plugins.tgz -C /opt/cni/bin",``, "ok"],
 ["^ls /opt/cni/bin \\| head -10",`bridge\ncilium-cni\nflannel`,"ok"],
 ["^systemctl restart kubelet && kubectl -n kube-system get pods \\| grep cilium",`cilium-xxx 1/1 Running`,"ok"]
],
[{re:"^kubectl -n kube-system logs ds/cilium",l:"лог CNI"},
 {re:"^ls /opt/cni/bin",l:"проверить бинарники"},
 {re:"^mkdir -p /opt/cni/bin",l:"восстановить плагины"},
 {re:"^systemctl restart kubelet",l:"перезапустить kubelet"}],{file:"project/cni-flannel-cil.yaml",files:{"project/cni-flannel-cil.yaml":`# Сети: CNI: flannel/cilium не стартует — нет /opt/cni/bin\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/cni-flannel-cil.yaml":`# Сети: CNI: flannel/cilium не стартует — нет /opt/cni/bin — fixed\nstatus: ok\n`}},{hints:["Симптом: CNI: flannel/cilium не стартует — нет /opt/cni/bin в project/cni-flannel-cil.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/cni-flannel-cil.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/cni-flannel-cil.yaml.","Порядок: лог CNI → проверить бинарники → восстановить плагины"]});
