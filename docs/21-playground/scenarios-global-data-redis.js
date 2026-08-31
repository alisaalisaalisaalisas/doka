/* Global Playground: Redis — 30 scenarios */
S("Redis","gc-redis-1","Sentinel: master down, failover не произошел","Junior", `<h3>Контекст</h3><p>Redis: <b>Sentinel: master down, failover не произошел</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Sentinel: master down, failover не произошел</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli -p 26379 sentinel ma</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli -p 26379 sentinel masters", "master mymaster down", "err"],
 ["^redis-cli -p 26379 sentinel master mymaster", "down-after 30000", "warn"],
 ["^redis-cli -p 26379 sentinel failover mymaster", "OK", "ok"],
 ["^redis-cli -p 26379 sentinel masters | grep -A2 down-after-milliseconds", "up", "ok"]
],
[{re:"^redis-cli -p 26379 sentinel masters",l:"диагностика"},
 {re:"^redis-cli -p 26379 sentinel failover mymaster",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Sentinel: master down, failover не произошел\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Sentinel: master down, failover не произошел — fixed\nstatus: ok\n`}},{hints:["Симптом: Sentinel: master down, failover не произошел в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-2","Cluster: slot not covered CLUSTERDOWN","Middle", `<h3>Контекст</h3><p>Redis: <b>Cluster: slot not covered CLUSTERDOWN</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Cluster: slot not covered CLUSTERDOWN</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli --cluster check 127.</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli --cluster check 127.0.0.1:7000 | grep -i ERR", "slot 0 unassigned", "err"],
 ["^redis-cli --cluster check 127.0.0.1:7000 | grep slots", "16384 slots", "warn"],
 ["^redis-cli --cluster fix 127.0.0.1:7000 --cluster-yes", "slot 0 assigned", "ok"],
 ["^redis-cli --cluster check 127.0.0.1:7000 | grep OK", "All 16384 slots covered", "ok"]
],
[{re:"^redis-cli --cluster check 127.0.0.1:7000 | grep -i ERR",l:"диагностика"},
 {re:"^redis-cli --cluster fix 127.0.0.1:7000 --cluster-yes",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Cluster: slot not covered CLUSTERDOWN\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Cluster: slot not covered CLUSTERDOWN — fixed\nstatus: ok\n`}},{hints:["Симптом: Cluster: slot not covered CLUSTERDOWN в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-3","Slot: migration 0-5460 stuck","Senior", `<h3>Контекст</h3><p>Redis: <b>Slot: migration 0-5460 stuck</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Slot: migration 0-5460 stuck</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli --cluster check 127.</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli --cluster check 127.0.0.1:7000 | grep slot", "slot migration stuck", "err"],
 ["^redis-cli cluster slots | head -20", "slots 0-5460", "warn"],
 ["^redis-cli --cluster reshard 127.0.0.1:7000 --cluster-from all --cluster-to c1 --cluster-slots 1000 --cluster-yes", "resharded", "ok"],
 ["^redis-cli cluster info | grep cluster_state", "cluster_state:ok", "ok"]
],
[{re:"^redis-cli --cluster check 127.0.0.1:7000 | grep slot",l:"диагностика"},
 {re:"^redis-cli --cluster reshard 127.0.0.1:7000 --cluster-from all --cluster-to c1 --cluster-slots 1000 --cluster-yes",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Slot: migration 0-5460 stuck\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Slot: migration 0-5460 stuck — fixed\nstatus: ok\n`}},{hints:["Симптом: Slot: migration 0-5460 stuck в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-4","TLS: certificate expired","Junior", `<h3>Контекст</h3><p>Redis: <b>TLS: certificate expired</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>TLS: certificate expired</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli --tls --cert /tmp/ce</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli --tls --cert /tmp/cert.pem --key /tmp/key.pem -p 6380 ping", "certificate verify failed", "err"],
 ["^openssl x509 -enddate -noout -in /etc/redis/cert.pem", "notAfter=Jan 01", "warn"],
 ["^redis-cli --tls -p 6380 config set tls-cert-file /etc/redis/newcert.pem", "OK", "ok"],
 ["^redis-cli --tls -p 6380 ping", "PONG", "ok"]
],
[{re:"^redis-cli --tls --cert /tmp/cert.pem --key /tmp/key.pem -p 6380 ping",l:"диагностика"},
 {re:"^redis-cli --tls -p 6380 config set tls-cert-file /etc/redis/newcert.pem",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: TLS: certificate expired\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: TLS: certificate expired — fixed\nstatus: ok\n`}},{hints:["Симптом: TLS: certificate expired в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-5","ACL: user alice no permissions","Middle", `<h3>Контекст</h3><p>Redis: <b>ACL: user alice no permissions</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>ACL: user alice no permissions</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli ACL LIST | grep alic</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli ACL LIST | grep alice", "no permissions", "err"],
 ["^redis-cli ACL GETUSER alice", "~cached:*", "warn"],
 ["^redis-cli ACL SETUSER alice on >secret +@all ~*", "OK", "ok"],
 ["^redis-cli --user alice --pass secret ping", "PONG", "ok"]
],
[{re:"^redis-cli ACL LIST | grep alice",l:"диагностика"},
 {re:"^redis-cli ACL SETUSER alice on >secret +@all ~*",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: ACL: user alice no permissions\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: ACL: user alice no permissions — fixed\nstatus: ok\n`}},{hints:["Симптом: ACL: user alice no permissions в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-6","Failover: replica не промоутится","Senior", `<h3>Контекст</h3><p>Redis: <b>Failover: replica не промоутится</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Failover: replica не промоутится</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli info replication | g</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli info replication | grep role", "role:slave", "err"],
 ["^redis-cli info replication | grep master_repl_offset", "offset 123", "warn"],
 ["^redis-cli cluster failover TAKEOVER", "OK", "ok"],
 ["^redis-cli info replication | grep role", "role:master", "ok"]
],
[{re:"^redis-cli info replication | grep role",l:"диагностика"},
 {re:"^redis-cli cluster failover TAKEOVER",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Failover: replica не промоутится\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Failover: replica не промоутится — fixed\nstatus: ok\n`}},{hints:["Симптом: Failover: replica не промоутится в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-7","Sentinel: quorum 2/3 not reached","Junior", `<h3>Контекст</h3><p>Redis: <b>Sentinel: quorum 2/3 not reached</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Sentinel: quorum 2/3 not reached</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli -p 26379 sentinel ma</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli -p 26379 sentinel masters", "master mymaster down", "err"],
 ["^redis-cli -p 26379 sentinel master mymaster", "down-after 30000", "warn"],
 ["^redis-cli -p 26379 sentinel failover mymaster", "OK", "ok"],
 ["^redis-cli -p 26379 sentinel masters | grep -A2 down-after-milliseconds", "up", "ok"]
],
[{re:"^redis-cli -p 26379 sentinel masters",l:"диагностика"},
 {re:"^redis-cli -p 26379 sentinel failover mymaster",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Sentinel: quorum 2/3 not reached\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Sentinel: quorum 2/3 not reached — fixed\nstatus: ok\n`}},{hints:["Симптом: Sentinel: quorum 2/3 not reached в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-8","Cluster: meet не соединяет ноды","Middle", `<h3>Контекст</h3><p>Redis: <b>Cluster: meet не соединяет ноды</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Cluster: meet не соединяет ноды</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli --cluster check 127.</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli --cluster check 127.0.0.1:7000 | grep -i ERR", "slot 0 unassigned", "err"],
 ["^redis-cli --cluster check 127.0.0.1:7000 | grep slots", "16384 slots", "warn"],
 ["^redis-cli --cluster fix 127.0.0.1:7000 --cluster-yes", "slot 0 assigned", "ok"],
 ["^redis-cli --cluster check 127.0.0.1:7000 | grep OK", "All 16384 slots covered", "ok"]
],
[{re:"^redis-cli --cluster check 127.0.0.1:7000 | grep -i ERR",l:"диагностика"},
 {re:"^redis-cli --cluster fix 127.0.0.1:7000 --cluster-yes",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Cluster: meet не соединяет ноды\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Cluster: meet не соединяет ноды — fixed\nstatus: ok\n`}},{hints:["Симптом: Cluster: meet не соединяет ноды в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-9","Slot: reshard 1000 slots failed","Senior", `<h3>Контекст</h3><p>Redis: <b>Slot: reshard 1000 slots failed</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Slot: reshard 1000 slots failed</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli --cluster check 127.</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli --cluster check 127.0.0.1:7000 | grep slot", "slot migration stuck", "err"],
 ["^redis-cli cluster slots | head -20", "slots 0-5460", "warn"],
 ["^redis-cli --cluster reshard 127.0.0.1:7000 --cluster-from all --cluster-to c1 --cluster-slots 1000 --cluster-yes", "resharded", "ok"],
 ["^redis-cli cluster info | grep cluster_state", "cluster_state:ok", "ok"]
],
[{re:"^redis-cli --cluster check 127.0.0.1:7000 | grep slot",l:"диагностика"},
 {re:"^redis-cli --cluster reshard 127.0.0.1:7000 --cluster-from all --cluster-to c1 --cluster-slots 1000 --cluster-yes",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Slot: reshard 1000 slots failed\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Slot: reshard 1000 slots failed — fixed\nstatus: ok\n`}},{hints:["Симптом: Slot: reshard 1000 slots failed в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-10","TLS: handshake failed","Junior", `<h3>Контекст</h3><p>Redis: <b>TLS: handshake failed</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>TLS: handshake failed</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli --tls --cert /tmp/ce</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli --tls --cert /tmp/cert.pem --key /tmp/key.pem -p 6380 ping", "certificate verify failed", "err"],
 ["^openssl x509 -enddate -noout -in /etc/redis/cert.pem", "notAfter=Jan 01", "warn"],
 ["^redis-cli --tls -p 6380 config set tls-cert-file /etc/redis/newcert.pem", "OK", "ok"],
 ["^redis-cli --tls -p 6380 ping", "PONG", "ok"]
],
[{re:"^redis-cli --tls --cert /tmp/cert.pem --key /tmp/key.pem -p 6380 ping",l:"диагностика"},
 {re:"^redis-cli --tls -p 6380 config set tls-cert-file /etc/redis/newcert.pem",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: TLS: handshake failed\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: TLS: handshake failed — fixed\nstatus: ok\n`}},{hints:["Симптом: TLS: handshake failed в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-11","ACL: wrongpass","Middle", `<h3>Контекст</h3><p>Redis: <b>ACL: wrongpass</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>ACL: wrongpass</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli ACL LIST | grep alic</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli ACL LIST | grep alice", "no permissions", "err"],
 ["^redis-cli ACL GETUSER alice", "~cached:*", "warn"],
 ["^redis-cli ACL SETUSER alice on >secret +@all ~*", "OK", "ok"],
 ["^redis-cli --user alice --pass secret ping", "PONG", "ok"]
],
[{re:"^redis-cli ACL LIST | grep alice",l:"диагностика"},
 {re:"^redis-cli ACL SETUSER alice on >secret +@all ~*",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: ACL: wrongpass\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: ACL: wrongpass — fixed\nstatus: ok\n`}},{hints:["Симптом: ACL: wrongpass в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-12","Failover: down-after-milliseconds 30000 too high","Senior", `<h3>Контекст</h3><p>Redis: <b>Failover: down-after-milliseconds 30000 too high</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Failover: down-after-milliseconds 30000 too high</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli info replication | g</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli info replication | grep role", "role:slave", "err"],
 ["^redis-cli info replication | grep master_repl_offset", "offset 123", "warn"],
 ["^redis-cli cluster failover TAKEOVER", "OK", "ok"],
 ["^redis-cli info replication | grep role", "role:master", "ok"]
],
[{re:"^redis-cli info replication | grep role",l:"диагностика"},
 {re:"^redis-cli cluster failover TAKEOVER",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Failover: down-after-milliseconds 30000 too high\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Failover: down-after-milliseconds 30000 too high — fixed\nstatus: ok\n`}},{hints:["Симптом: Failover: down-after-milliseconds 30000 too high в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-13","Sentinel: announce-ip not set","Junior", `<h3>Контекст</h3><p>Redis: <b>Sentinel: announce-ip not set</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Sentinel: announce-ip not set</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli -p 26379 sentinel ma</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli -p 26379 sentinel masters", "master mymaster down", "err"],
 ["^redis-cli -p 26379 sentinel master mymaster", "down-after 30000", "warn"],
 ["^redis-cli -p 26379 sentinel failover mymaster", "OK", "ok"],
 ["^redis-cli -p 26379 sentinel masters | grep -A2 down-after-milliseconds", "up", "ok"]
],
[{re:"^redis-cli -p 26379 sentinel masters",l:"диагностика"},
 {re:"^redis-cli -p 26379 sentinel failover mymaster",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Sentinel: announce-ip not set\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Sentinel: announce-ip not set — fixed\nstatus: ok\n`}},{hints:["Симптом: Sentinel: announce-ip not set в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-14","Cluster: gossip 10s lag","Middle", `<h3>Контекст</h3><p>Redis: <b>Cluster: gossip 10s lag</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Cluster: gossip 10s lag</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli --cluster check 127.</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli --cluster check 127.0.0.1:7000 | grep -i ERR", "slot 0 unassigned", "err"],
 ["^redis-cli --cluster check 127.0.0.1:7000 | grep slots", "16384 slots", "warn"],
 ["^redis-cli --cluster fix 127.0.0.1:7000 --cluster-yes", "slot 0 assigned", "ok"],
 ["^redis-cli --cluster check 127.0.0.1:7000 | grep OK", "All 16384 slots covered", "ok"]
],
[{re:"^redis-cli --cluster check 127.0.0.1:7000 | grep -i ERR",l:"диагностика"},
 {re:"^redis-cli --cluster fix 127.0.0.1:7000 --cluster-yes",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Cluster: gossip 10s lag\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Cluster: gossip 10s lag — fixed\nstatus: ok\n`}},{hints:["Симптом: Cluster: gossip 10s lag в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-15","Slot: cluster fix unassigned","Senior", `<h3>Контекст</h3><p>Redis: <b>Slot: cluster fix unassigned</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Slot: cluster fix unassigned</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli --cluster check 127.</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli --cluster check 127.0.0.1:7000 | grep slot", "slot migration stuck", "err"],
 ["^redis-cli cluster slots | head -20", "slots 0-5460", "warn"],
 ["^redis-cli --cluster reshard 127.0.0.1:7000 --cluster-from all --cluster-to c1 --cluster-slots 1000 --cluster-yes", "resharded", "ok"],
 ["^redis-cli cluster info | grep cluster_state", "cluster_state:ok", "ok"]
],
[{re:"^redis-cli --cluster check 127.0.0.1:7000 | grep slot",l:"диагностика"},
 {re:"^redis-cli --cluster reshard 127.0.0.1:7000 --cluster-from all --cluster-to c1 --cluster-slots 1000 --cluster-yes",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Slot: cluster fix unassigned\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Slot: cluster fix unassigned — fixed\nstatus: ok\n`}},{hints:["Симптом: Slot: cluster fix unassigned в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-16","TLS: sni required","Junior", `<h3>Контекст</h3><p>Redis: <b>TLS: sni required</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>TLS: sni required</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli --tls --cert /tmp/ce</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli --tls --cert /tmp/cert.pem --key /tmp/key.pem -p 6380 ping", "certificate verify failed", "err"],
 ["^openssl x509 -enddate -noout -in /etc/redis/cert.pem", "notAfter=Jan 01", "warn"],
 ["^redis-cli --tls -p 6380 config set tls-cert-file /etc/redis/newcert.pem", "OK", "ok"],
 ["^redis-cli --tls -p 6380 ping", "PONG", "ok"]
],
[{re:"^redis-cli --tls --cert /tmp/cert.pem --key /tmp/key.pem -p 6380 ping",l:"диагностика"},
 {re:"^redis-cli --tls -p 6380 config set tls-cert-file /etc/redis/newcert.pem",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: TLS: sni required\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: TLS: sni required — fixed\nstatus: ok\n`}},{hints:["Симптом: TLS: sni required в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-17","ACL: -@all +get","Middle", `<h3>Контекст</h3><p>Redis: <b>ACL: -@all +get</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>ACL: -@all +get</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli ACL LIST | grep alic</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli ACL LIST | grep alice", "no permissions", "err"],
 ["^redis-cli ACL GETUSER alice", "~cached:*", "warn"],
 ["^redis-cli ACL SETUSER alice on >secret +@all ~*", "OK", "ok"],
 ["^redis-cli --user alice --pass secret ping", "PONG", "ok"]
],
[{re:"^redis-cli ACL LIST | grep alice",l:"диагностика"},
 {re:"^redis-cli ACL SETUSER alice on >secret +@all ~*",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: ACL: -@all +get\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: ACL: -@all +get — fixed\nstatus: ok\n`}},{hints:["Симптом: ACL: -@all +get в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-18","Failover: manual failover takes 60s","Senior", `<h3>Контекст</h3><p>Redis: <b>Failover: manual failover takes 60s</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Failover: manual failover takes 60s</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli info replication | g</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli info replication | grep role", "role:slave", "err"],
 ["^redis-cli info replication | grep master_repl_offset", "offset 123", "warn"],
 ["^redis-cli cluster failover TAKEOVER", "OK", "ok"],
 ["^redis-cli info replication | grep role", "role:master", "ok"]
],
[{re:"^redis-cli info replication | grep role",l:"диагностика"},
 {re:"^redis-cli cluster failover TAKEOVER",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Failover: manual failover takes 60s\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Failover: manual failover takes 60s — fixed\nstatus: ok\n`}},{hints:["Симптом: Failover: manual failover takes 60s в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-19","Sentinel: parallel-syncs 1 bottleneck","Junior", `<h3>Контекст</h3><p>Redis: <b>Sentinel: parallel-syncs 1 bottleneck</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Sentinel: parallel-syncs 1 bottleneck</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli -p 26379 sentinel ma</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli -p 26379 sentinel masters", "master mymaster down", "err"],
 ["^redis-cli -p 26379 sentinel master mymaster", "down-after 30000", "warn"],
 ["^redis-cli -p 26379 sentinel failover mymaster", "OK", "ok"],
 ["^redis-cli -p 26379 sentinel masters | grep -A2 down-after-milliseconds", "up", "ok"]
],
[{re:"^redis-cli -p 26379 sentinel masters",l:"диагностика"},
 {re:"^redis-cli -p 26379 sentinel failover mymaster",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Sentinel: parallel-syncs 1 bottleneck\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Sentinel: parallel-syncs 1 bottleneck — fixed\nstatus: ok\n`}},{hints:["Симптом: Sentinel: parallel-syncs 1 bottleneck в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-20","Cluster: rebalancing pending","Middle", `<h3>Контекст</h3><p>Redis: <b>Cluster: rebalancing pending</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Cluster: rebalancing pending</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli --cluster check 127.</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli --cluster check 127.0.0.1:7000 | grep -i ERR", "slot 0 unassigned", "err"],
 ["^redis-cli --cluster check 127.0.0.1:7000 | grep slots", "16384 slots", "warn"],
 ["^redis-cli --cluster fix 127.0.0.1:7000 --cluster-yes", "slot 0 assigned", "ok"],
 ["^redis-cli --cluster check 127.0.0.1:7000 | grep OK", "All 16384 slots covered", "ok"]
],
[{re:"^redis-cli --cluster check 127.0.0.1:7000 | grep -i ERR",l:"диагностика"},
 {re:"^redis-cli --cluster fix 127.0.0.1:7000 --cluster-yes",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Cluster: rebalancing pending\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Cluster: rebalancing pending — fixed\nstatus: ok\n`}},{hints:["Симптом: Cluster: rebalancing pending в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-21","Slot: hash tag {user} unbalanced","Senior", `<h3>Контекст</h3><p>Redis: <b>Slot: hash tag {user} unbalanced</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Slot: hash tag {user} unbalanced</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli --cluster check 127.</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli --cluster check 127.0.0.1:7000 | grep slot", "slot migration stuck", "err"],
 ["^redis-cli cluster slots | head -20", "slots 0-5460", "warn"],
 ["^redis-cli --cluster reshard 127.0.0.1:7000 --cluster-from all --cluster-to c1 --cluster-slots 1000 --cluster-yes", "resharded", "ok"],
 ["^redis-cli cluster info | grep cluster_state", "cluster_state:ok", "ok"]
],
[{re:"^redis-cli --cluster check 127.0.0.1:7000 | grep slot",l:"диагностика"},
 {re:"^redis-cli --cluster reshard 127.0.0.1:7000 --cluster-from all --cluster-to c1 --cluster-slots 1000 --cluster-yes",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Slot: hash tag {user} unbalanced\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Slot: hash tag {user} unbalanced — fixed\nstatus: ok\n`}},{hints:["Симптом: Slot: hash tag {user} unbalanced в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-22","TLS: dhparam missing","Junior", `<h3>Контекст</h3><p>Redis: <b>TLS: dhparam missing</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>TLS: dhparam missing</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli --tls --cert /tmp/ce</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli --tls --cert /tmp/cert.pem --key /tmp/key.pem -p 6380 ping", "certificate verify failed", "err"],
 ["^openssl x509 -enddate -noout -in /etc/redis/cert.pem", "notAfter=Jan 01", "warn"],
 ["^redis-cli --tls -p 6380 config set tls-cert-file /etc/redis/newcert.pem", "OK", "ok"],
 ["^redis-cli --tls -p 6380 ping", "PONG", "ok"]
],
[{re:"^redis-cli --tls --cert /tmp/cert.pem --key /tmp/key.pem -p 6380 ping",l:"диагностика"},
 {re:"^redis-cli --tls -p 6380 config set tls-cert-file /etc/redis/newcert.pem",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: TLS: dhparam missing\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: TLS: dhparam missing — fixed\nstatus: ok\n`}},{hints:["Симптом: TLS: dhparam missing в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-23","ACL: maxmemory 8GB reached","Middle", `<h3>Контекст</h3><p>Redis: <b>ACL: maxmemory 8GB reached</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>ACL: maxmemory 8GB reached</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli ACL LIST | grep alic</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli ACL LIST | grep alice", "no permissions", "err"],
 ["^redis-cli ACL GETUSER alice", "~cached:*", "warn"],
 ["^redis-cli ACL SETUSER alice on >secret +@all ~*", "OK", "ok"],
 ["^redis-cli --user alice --pass secret ping", "PONG", "ok"]
],
[{re:"^redis-cli ACL LIST | grep alice",l:"диагностика"},
 {re:"^redis-cli ACL SETUSER alice on >secret +@all ~*",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: ACL: maxmemory 8GB reached\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: ACL: maxmemory 8GB reached — fixed\nstatus: ok\n`}},{hints:["Симптом: ACL: maxmemory 8GB reached в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-24","Failover: replica priority 0 no promotion","Senior", `<h3>Контекст</h3><p>Redis: <b>Failover: replica priority 0 no promotion</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Failover: replica priority 0 no promotion</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli info replication | g</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli info replication | grep role", "role:slave", "err"],
 ["^redis-cli info replication | grep master_repl_offset", "offset 123", "warn"],
 ["^redis-cli cluster failover TAKEOVER", "OK", "ok"],
 ["^redis-cli info replication | grep role", "role:master", "ok"]
],
[{re:"^redis-cli info replication | grep role",l:"диагностика"},
 {re:"^redis-cli cluster failover TAKEOVER",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Failover: replica priority 0 no promotion\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Failover: replica priority 0 no promotion — fixed\nstatus: ok\n`}},{hints:["Симптом: Failover: replica priority 0 no promotion в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-25","Sentinel: notification script failed","Junior", `<h3>Контекст</h3><p>Redis: <b>Sentinel: notification script failed</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Sentinel: notification script failed</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli -p 26379 sentinel ma</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli -p 26379 sentinel masters", "master mymaster down", "err"],
 ["^redis-cli -p 26379 sentinel master mymaster", "down-after 30000", "warn"],
 ["^redis-cli -p 26379 sentinel failover mymaster", "OK", "ok"],
 ["^redis-cli -p 26379 sentinel masters | grep -A2 down-after-milliseconds", "up", "ok"]
],
[{re:"^redis-cli -p 26379 sentinel masters",l:"диагностика"},
 {re:"^redis-cli -p 26379 sentinel failover mymaster",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Sentinel: notification script failed\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Sentinel: notification script failed — fixed\nstatus: ok\n`}},{hints:["Симптом: Sentinel: notification script failed в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-26","Cluster: import not supported","Middle", `<h3>Контекст</h3><p>Redis: <b>Cluster: import not supported</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Cluster: import not supported</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli --cluster check 127.</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli --cluster check 127.0.0.1:7000 | grep -i ERR", "slot 0 unassigned", "err"],
 ["^redis-cli --cluster check 127.0.0.1:7000 | grep slots", "16384 slots", "warn"],
 ["^redis-cli --cluster fix 127.0.0.1:7000 --cluster-yes", "slot 0 assigned", "ok"],
 ["^redis-cli --cluster check 127.0.0.1:7000 | grep OK", "All 16384 slots covered", "ok"]
],
[{re:"^redis-cli --cluster check 127.0.0.1:7000 | grep -i ERR",l:"диагностика"},
 {re:"^redis-cli --cluster fix 127.0.0.1:7000 --cluster-yes",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Cluster: import not supported\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Cluster: import not supported — fixed\nstatus: ok\n`}},{hints:["Симптом: Cluster: import not supported в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-27","Slot: countkeysinslot 0-100 0","Senior", `<h3>Контекст</h3><p>Redis: <b>Slot: countkeysinslot 0-100 0</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Slot: countkeysinslot 0-100 0</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli --cluster check 127.</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli --cluster check 127.0.0.1:7000 | grep slot", "slot migration stuck", "err"],
 ["^redis-cli cluster slots | head -20", "slots 0-5460", "warn"],
 ["^redis-cli --cluster reshard 127.0.0.1:7000 --cluster-from all --cluster-to c1 --cluster-slots 1000 --cluster-yes", "resharded", "ok"],
 ["^redis-cli cluster info | grep cluster_state", "cluster_state:ok", "ok"]
],
[{re:"^redis-cli --cluster check 127.0.0.1:7000 | grep slot",l:"диагностика"},
 {re:"^redis-cli --cluster reshard 127.0.0.1:7000 --cluster-from all --cluster-to c1 --cluster-slots 1000 --cluster-yes",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Slot: countkeysinslot 0-100 0\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Slot: countkeysinslot 0-100 0 — fixed\nstatus: ok\n`}},{hints:["Симптом: Slot: countkeysinslot 0-100 0 в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-28","TLS: tls-auth-clients no","Junior", `<h3>Контекст</h3><p>Redis: <b>TLS: tls-auth-clients no</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>TLS: tls-auth-clients no</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli --tls --cert /tmp/ce</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli --tls --cert /tmp/cert.pem --key /tmp/key.pem -p 6380 ping", "certificate verify failed", "err"],
 ["^openssl x509 -enddate -noout -in /etc/redis/cert.pem", "notAfter=Jan 01", "warn"],
 ["^redis-cli --tls -p 6380 config set tls-cert-file /etc/redis/newcert.pem", "OK", "ok"],
 ["^redis-cli --tls -p 6380 ping", "PONG", "ok"]
],
[{re:"^redis-cli --tls --cert /tmp/cert.pem --key /tmp/key.pem -p 6380 ping",l:"диагностика"},
 {re:"^redis-cli --tls -p 6380 config set tls-cert-file /etc/redis/newcert.pem",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: TLS: tls-auth-clients no\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: TLS: tls-auth-clients no — fixed\nstatus: ok\n`}},{hints:["Симптом: TLS: tls-auth-clients no в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-29","ACL: key pattern ~cached:*","Middle", `<h3>Контекст</h3><p>Redis: <b>ACL: key pattern ~cached:*</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>ACL: key pattern ~cached:*</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli ACL LIST | grep alic</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli ACL LIST | grep alice", "no permissions", "err"],
 ["^redis-cli ACL GETUSER alice", "~cached:*", "warn"],
 ["^redis-cli ACL SETUSER alice on >secret +@all ~*", "OK", "ok"],
 ["^redis-cli --user alice --pass secret ping", "PONG", "ok"]
],
[{re:"^redis-cli ACL LIST | grep alice",l:"диагностика"},
 {re:"^redis-cli ACL SETUSER alice on >secret +@all ~*",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: ACL: key pattern ~cached:*\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: ACL: key pattern ~cached:* — fixed\nstatus: ok\n`}},{hints:["Симптом: ACL: key pattern ~cached:* в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

S("Redis","gc-redis-30","Failover: replica-serve-stale-data yes","Senior", `<h3>Контекст</h3><p>Redis: <b>Failover: replica-serve-stale-data yes</b>. Работа с <code>redis/redis.conf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Failover: replica-serve-stale-data yes</b>. Файл <code>redis/redis.conf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>redis/redis.conf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>redis/redis.conf</code>. Активный файл открыт в редакторе. Начните с <code>redis-cli info replication | g</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat redis/redis.conf<br>проверить код</pre>`,
"dev@redis:~$",
[
 ["^redis-cli info replication | grep role", "role:slave", "err"],
 ["^redis-cli info replication | grep master_repl_offset", "offset 123", "warn"],
 ["^redis-cli cluster failover TAKEOVER", "OK", "ok"],
 ["^redis-cli info replication | grep role", "role:master", "ok"]
],
[{re:"^redis-cli info replication | grep role",l:"диагностика"},
 {re:"^redis-cli cluster failover TAKEOVER",l:"исправить"}],{file:"redis/redis.conf",files:{"redis/redis.conf":`# Redis: Failover: replica-serve-stale-data yes\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"redis/redis.conf":`# Redis: Failover: replica-serve-stale-data yes — fixed\nstatus: ok\n`}},{hints:["Симптом: Failover: replica-serve-stale-data yes в redis/redis.conf. Ищи причину в коде/конфиге этого файла.","Открой redis/redis.conf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat redis/redis.conf.","Порядок: диагностика → исправить"]});

