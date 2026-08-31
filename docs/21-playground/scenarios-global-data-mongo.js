/* Global Playground: MongoDB — 30 scenarios */
S("MongoDB","gc-mongo-1","RS: PRIMARY down, election 10s","Junior", `<h3>Контекст</h3><p>MongoDB: <b>RS: PRIMARY down, election 10s</b>. Работа с <code>project/rs-primary-down.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>RS: PRIMARY down, election 10s</b>. Файл <code>project/rs-primary-down.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/rs-primary-down.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/rs-primary-down.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/rs-primary-down.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"rs.status()\" | grep -A2 stateStr", "PRIMARY mongo-0\nSECONDARY mongo-1", "err"],
 ["^mongosh --eval \"rs.conf()\" | grep priority", "priority 1", "warn"],
 ["^mongosh --eval \"rs.stepDown()\"", "stepDown", "ok"],
 ["^mongosh --eval \"rs.isMaster()\" | grep ismaster", "ismaster true", "ok"]
],
[{re:"^mongosh --eval \"rs.status()\" | grep -A2 stateStr",l:"диагностика"},
 {re:"^mongosh --eval \"rs.stepDown()\"",l:"исправить"}],{file:"project/rs-primary-down.yaml",files:{"project/rs-primary-down.yaml":`# MongoDB: RS: PRIMARY down, election 10s\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/rs-primary-down.yaml":`# MongoDB: RS: PRIMARY down, election 10s — fixed\nstatus: ok\n`}},{hints:["Симптом: RS: PRIMARY down, election 10s в project/rs-primary-down.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/rs-primary-down.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/rs-primary-down.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-2","Sharding: balancer застрял, chunk migration stuck","Middle", `<h3>Контекст</h3><p>MongoDB: <b>Sharding: balancer застрял, chunk migration stuck</b>. Работа с <code>project/sharding-balanc.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Sharding: balancer застрял, chunk migration stuck</b>. Файл <code>project/sharding-balanc.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/sharding-balanc.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/sharding-balanc.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/sharding-balanc.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"sh.status()\" | grep -A5 balancer", "balancer: enabled but stuck", "err"],
 ["^mongosh --eval \"sh.getBalancerState()\"", "true", "warn"],
 ["^mongosh --eval \"sh.startBalancer()\"", "balancer started", "ok"],
 ["^mongosh --eval \"sh.isBalancerRunning()\"", "true", "ok"]
],
[{re:"^mongosh --eval \"sh.status()\" | grep -A5 balancer",l:"диагностика"},
 {re:"^mongosh --eval \"sh.startBalancer()\"",l:"исправить"}],{file:"project/sharding-balanc.yaml",files:{"project/sharding-balanc.yaml":`# MongoDB: Sharding: balancer застрял, chunk migration stuck\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/sharding-balanc.yaml":`# MongoDB: Sharding: balancer застрял, chunk migration stuck — fixed\nstatus: ok\n`}},{hints:["Симптом: Sharding: balancer застрял, chunk migration stuck в project/sharding-balanc.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/sharding-balanc.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/sharding-balanc.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-3","mongosh: connect ECONNREFUSED","Senior", `<h3>Контекст</h3><p>MongoDB: <b>mongosh: connect ECONNREFUSED</b>. Работа с <code>project/mongosh-connect.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>mongosh: connect ECONNREFUSED</b>. Файл <code>project/mongosh-connect.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/mongosh-connect.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/mongosh-connect.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/mongosh-connect.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"db.adminCommand({ping:1})\" | head -5", "ECONNREFUSED", "warn"],
 ["^mongosh --eval \"db.serverStatus().connections\" | grep current", "connections 40", "warn"],
 ["^mongosh --eval \"db.adminCommand({setParameter:1, logLevel:0})\"", "ok", "ok"],
 ["^mongosh --eval \"db.runCommand({ping:1})\"", "ok:1", "ok"]
],
[{re:"^mongosh --eval \"db.adminCommand({ping:1})\" | head -5",l:"диагностика"},
 {re:"^mongosh --eval \"db.adminCommand({setParameter:1, logLevel:0})\"",l:"исправить"}],{file:"project/mongosh-connect.yaml",files:{"project/mongosh-connect.yaml":`# MongoDB: mongosh: connect ECONNREFUSED\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/mongosh-connect.yaml":`# MongoDB: mongosh: connect ECONNREFUSED — fixed\nstatus: ok\n`}},{hints:["Симптом: mongosh: connect ECONNREFUSED в project/mongosh-connect.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/mongosh-connect.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/mongosh-connect.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-4","PBM: backup failed, pitr disabled","Junior", `<h3>Контекст</h3><p>MongoDB: <b>PBM: backup failed, pitr disabled</b>. Работа с <code>project/pbm-backup-fail.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>PBM: backup failed, pitr disabled</b>. Файл <code>project/pbm-backup-fail.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/pbm-backup-fail.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/pbm-backup-fail.yaml</code>. Активный файл открыт в редакторе. Начните с <code>pbm status | grep -A2 Running</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/pbm-backup-fail.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^pbm status | grep -A2 Running", "FAILED", "err"],
 ["^pbm config --list | grep pitr", "pitr.enabled false", "warn"],
 ["^pbm config --set pitr.enabled=true", "updated", "ok"],
 ["^pbm status | grep PBM", "PBM OK", "ok"]
],
[{re:"^pbm status | grep -A2 Running",l:"диагностика"},
 {re:"^pbm config --set pitr.enabled=true",l:"исправить"}],{file:"project/pbm-backup-fail.yaml",files:{"project/pbm-backup-fail.yaml":`# MongoDB: PBM: backup failed, pitr disabled\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/pbm-backup-fail.yaml":`# MongoDB: PBM: backup failed, pitr disabled — fixed\nstatus: ok\n`}},{hints:["Симптом: PBM: backup failed, pitr disabled в project/pbm-backup-fail.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/pbm-backup-fail.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/pbm-backup-fail.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-5","Index: COLLSCAN вместо IXSCAN","Middle", `<h3>Контекст</h3><p>MongoDB: <b>Index: COLLSCAN вместо IXSCAN</b>. Работа с <code>project/index-collscan-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Index: COLLSCAN вместо IXSCAN</b>. Файл <code>project/index-collscan-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/index-collscan-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/index-collscan-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/index-collscan-.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"db.users.find({email:'a@b.c'}).explain('executionStats')\" | grep -A2 COLLSCAN", "COLLSCAN", "warn"],
 ["^mongosh --eval \"db.users.getIndexes()\" | grep email", "no index", "warn"],
 ["^mongosh --eval \"db.users.createIndex({email:1})\"", "created", "ok"],
 ["^mongosh --eval \"db.users.find({email:'a@b.c'}).explain()\" | grep IXSCAN", "IXSCAN", "ok"]
],
[{re:"^mongosh --eval \"db.users.find({email:'a@b.c'}).explain('executionStats')\" | grep -A2 COLLSCAN",l:"диагностика"},
 {re:"^mongosh --eval \"db.users.createIndex({email:1})\"",l:"исправить"}],{file:"project/index-collscan-.yaml",files:{"project/index-collscan-.yaml":`# MongoDB: Index: COLLSCAN вместо IXSCAN\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/index-collscan-.yaml":`# MongoDB: Index: COLLSCAN вместо IXSCAN — fixed\nstatus: ok\n`}},{hints:["Симптом: Index: COLLSCAN вместо IXSCAN в project/index-collscan-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/index-collscan-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/index-collscan-.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-6","RS: secondary lag 60s","Senior", `<h3>Контекст</h3><p>MongoDB: <b>RS: secondary lag 60s</b>. Работа с <code>project/rs-secondary-la.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>RS: secondary lag 60s</b>. Файл <code>project/rs-secondary-la.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/rs-secondary-la.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/rs-secondary-la.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/rs-secondary-la.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"rs.status()\" | grep -A2 stateStr", "PRIMARY mongo-0\nSECONDARY mongo-1", "warn"],
 ["^mongosh --eval \"rs.conf()\" | grep priority", "priority 1", "warn"],
 ["^mongosh --eval \"rs.stepDown()\"", "stepDown", "ok"],
 ["^mongosh --eval \"rs.isMaster()\" | grep ismaster", "ismaster true", "ok"]
],
[{re:"^mongosh --eval \"rs.status()\" | grep -A2 stateStr",l:"диагностика"},
 {re:"^mongosh --eval \"rs.stepDown()\"",l:"исправить"}],{file:"project/rs-secondary-la.yaml",files:{"project/rs-secondary-la.yaml":`# MongoDB: RS: secondary lag 60s\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/rs-secondary-la.yaml":`# MongoDB: RS: secondary lag 60s — fixed\nstatus: ok\n`}},{hints:["Симптом: RS: secondary lag 60s в project/rs-secondary-la.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/rs-secondary-la.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/rs-secondary-la.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-7","Sharding: jumbo chunk 100MB","Junior", `<h3>Контекст</h3><p>MongoDB: <b>Sharding: jumbo chunk 100MB</b>. Работа с <code>project/sharding-jumbo-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Sharding: jumbo chunk 100MB</b>. Файл <code>project/sharding-jumbo-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/sharding-jumbo-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/sharding-jumbo-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/sharding-jumbo-.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"sh.status()\" | grep -A5 balancer", "balancer: enabled but stuck", "warn"],
 ["^mongosh --eval \"sh.getBalancerState()\"", "true", "warn"],
 ["^mongosh --eval \"sh.startBalancer()\"", "balancer started", "ok"],
 ["^mongosh --eval \"sh.isBalancerRunning()\"", "true", "ok"]
],
[{re:"^mongosh --eval \"sh.status()\" | grep -A5 balancer",l:"диагностика"},
 {re:"^mongosh --eval \"sh.startBalancer()\"",l:"исправить"}],{file:"project/sharding-jumbo-.yaml",files:{"project/sharding-jumbo-.yaml":`# MongoDB: Sharding: jumbo chunk 100MB\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/sharding-jumbo-.yaml":`# MongoDB: Sharding: jumbo chunk 100MB — fixed\nstatus: ok\n`}},{hints:["Симптом: Sharding: jumbo chunk 100MB в project/sharding-jumbo-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/sharding-jumbo-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/sharding-jumbo-.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-8","mongosh: auth failed SCRAM","Middle", `<h3>Контекст</h3><p>MongoDB: <b>mongosh: auth failed SCRAM</b>. Работа с <code>project/mongosh-auth-fa.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>mongosh: auth failed SCRAM</b>. Файл <code>project/mongosh-auth-fa.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/mongosh-auth-fa.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/mongosh-auth-fa.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/mongosh-auth-fa.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"db.adminCommand({ping:1})\" | head -5", "ECONNREFUSED", "err"],
 ["^mongosh --eval \"db.serverStatus().connections\" | grep current", "connections 40", "warn"],
 ["^mongosh --eval \"db.adminCommand({setParameter:1, logLevel:0})\"", "ok", "ok"],
 ["^mongosh --eval \"db.runCommand({ping:1})\"", "ok:1", "ok"]
],
[{re:"^mongosh --eval \"db.adminCommand({ping:1})\" | head -5",l:"диагностика"},
 {re:"^mongosh --eval \"db.adminCommand({setParameter:1, logLevel:0})\"",l:"исправить"}],{file:"project/mongosh-auth-fa.yaml",files:{"project/mongosh-auth-fa.yaml":`# MongoDB: mongosh: auth failed SCRAM\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/mongosh-auth-fa.yaml":`# MongoDB: mongosh: auth failed SCRAM — fixed\nstatus: ok\n`}},{hints:["Симптом: mongosh: auth failed SCRAM в project/mongosh-auth-fa.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/mongosh-auth-fa.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/mongosh-auth-fa.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-9","PBM: restore to time 13:59","Senior", `<h3>Контекст</h3><p>MongoDB: <b>PBM: restore to time 13:59</b>. Работа с <code>project/pbm-restore-to-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>PBM: restore to time 13:59</b>. Файл <code>project/pbm-restore-to-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/pbm-restore-to-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/pbm-restore-to-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>pbm status | grep -A2 Running</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/pbm-restore-to-.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^pbm status | grep -A2 Running", "FAILED", "warn"],
 ["^pbm config --list | grep pitr", "pitr.enabled false", "warn"],
 ["^pbm config --set pitr.enabled=true", "updated", "ok"],
 ["^pbm status | grep PBM", "PBM OK", "ok"]
],
[{re:"^pbm status | grep -A2 Running",l:"диагностика"},
 {re:"^pbm config --set pitr.enabled=true",l:"исправить"}],{file:"project/pbm-restore-to-.yaml",files:{"project/pbm-restore-to-.yaml":`# MongoDB: PBM: restore to time 13:59\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/pbm-restore-to-.yaml":`# MongoDB: PBM: restore to time 13:59 — fixed\nstatus: ok\n`}},{hints:["Симптом: PBM: restore to time 13:59 в project/pbm-restore-to-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/pbm-restore-to-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/pbm-restore-to-.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-10","Index: TTL not deleting","Junior", `<h3>Контекст</h3><p>MongoDB: <b>Index: TTL not deleting</b>. Работа с <code>project/index-ttl-not-d.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Index: TTL not deleting</b>. Файл <code>project/index-ttl-not-d.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/index-ttl-not-d.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/index-ttl-not-d.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/index-ttl-not-d.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"db.users.find({email:'a@b.c'}).explain('executionStats')\" | grep -A2 COLLSCAN", "COLLSCAN", "warn"],
 ["^mongosh --eval \"db.users.getIndexes()\" | grep email", "no index", "warn"],
 ["^mongosh --eval \"db.users.createIndex({email:1})\"", "created", "ok"],
 ["^mongosh --eval \"db.users.find({email:'a@b.c'}).explain()\" | grep IXSCAN", "IXSCAN", "ok"]
],
[{re:"^mongosh --eval \"db.users.find({email:'a@b.c'}).explain('executionStats')\" | grep -A2 COLLSCAN",l:"диагностика"},
 {re:"^mongosh --eval \"db.users.createIndex({email:1})\"",l:"исправить"}],{file:"project/index-ttl-not-d.yaml",files:{"project/index-ttl-not-d.yaml":`# MongoDB: Index: TTL not deleting\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/index-ttl-not-d.yaml":`# MongoDB: Index: TTL not deleting — fixed\nstatus: ok\n`}},{hints:["Симптом: Index: TTL not deleting в project/index-ttl-not-d.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/index-ttl-not-d.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/index-ttl-not-d.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-11","RS: oplog window 2h слишком мал","Middle", `<h3>Контекст</h3><p>MongoDB: <b>RS: oplog window 2h слишком мал</b>. Работа с <code>project/rs-oplog-window.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>RS: oplog window 2h слишком мал</b>. Файл <code>project/rs-oplog-window.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/rs-oplog-window.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/rs-oplog-window.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/rs-oplog-window.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"rs.status()\" | grep -A2 stateStr", "PRIMARY mongo-0\nSECONDARY mongo-1", "warn"],
 ["^mongosh --eval \"rs.conf()\" | grep priority", "priority 1", "warn"],
 ["^mongosh --eval \"rs.stepDown()\"", "stepDown", "ok"],
 ["^mongosh --eval \"rs.isMaster()\" | grep ismaster", "ismaster true", "ok"]
],
[{re:"^mongosh --eval \"rs.status()\" | grep -A2 stateStr",l:"диагностика"},
 {re:"^mongosh --eval \"rs.stepDown()\"",l:"исправить"}],{file:"project/rs-oplog-window.yaml",files:{"project/rs-oplog-window.yaml":`# MongoDB: RS: oplog window 2h слишком мал\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/rs-oplog-window.yaml":`# MongoDB: RS: oplog window 2h слишком мал — fixed\nstatus: ok\n`}},{hints:["Симптом: RS: oplog window 2h слишком мал в project/rs-oplog-window.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/rs-oplog-window.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/rs-oplog-window.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-12","Sharding: zone sharding not balanced","Senior", `<h3>Контекст</h3><p>MongoDB: <b>Sharding: zone sharding not balanced</b>. Работа с <code>project/sharding-zone-s.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Sharding: zone sharding not balanced</b>. Файл <code>project/sharding-zone-s.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/sharding-zone-s.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/sharding-zone-s.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/sharding-zone-s.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"sh.status()\" | grep -A5 balancer", "balancer: enabled but stuck", "warn"],
 ["^mongosh --eval \"sh.getBalancerState()\"", "true", "warn"],
 ["^mongosh --eval \"sh.startBalancer()\"", "balancer started", "ok"],
 ["^mongosh --eval \"sh.isBalancerRunning()\"", "true", "ok"]
],
[{re:"^mongosh --eval \"sh.status()\" | grep -A5 balancer",l:"диагностика"},
 {re:"^mongosh --eval \"sh.startBalancer()\"",l:"исправить"}],{file:"project/sharding-zone-s.yaml",files:{"project/sharding-zone-s.yaml":`# MongoDB: Sharding: zone sharding not balanced\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/sharding-zone-s.yaml":`# MongoDB: Sharding: zone sharding not balanced — fixed\nstatus: ok\n`}},{hints:["Симптом: Sharding: zone sharding not balanced в project/sharding-zone-s.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/sharding-zone-s.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/sharding-zone-s.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-13","mongosh: readConcern majority timeout","Junior", `<h3>Контекст</h3><p>MongoDB: <b>mongosh: readConcern majority timeout</b>. Работа с <code>project/mongosh-readcon.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>mongosh: readConcern majority timeout</b>. Файл <code>project/mongosh-readcon.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/mongosh-readcon.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/mongosh-readcon.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/mongosh-readcon.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"db.adminCommand({ping:1})\" | head -5", "ECONNREFUSED", "warn"],
 ["^mongosh --eval \"db.serverStatus().connections\" | grep current", "connections 40", "warn"],
 ["^mongosh --eval \"db.adminCommand({setParameter:1, logLevel:0})\"", "ok", "ok"],
 ["^mongosh --eval \"db.runCommand({ping:1})\"", "ok:1", "ok"]
],
[{re:"^mongosh --eval \"db.adminCommand({ping:1})\" | head -5",l:"диагностика"},
 {re:"^mongosh --eval \"db.adminCommand({setParameter:1, logLevel:0})\"",l:"исправить"}],{file:"project/mongosh-readcon.yaml",files:{"project/mongosh-readcon.yaml":`# MongoDB: mongosh: readConcern majority timeout\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/mongosh-readcon.yaml":`# MongoDB: mongosh: readConcern majority timeout — fixed\nstatus: ok\n`}},{hints:["Симптом: mongosh: readConcern majority timeout в project/mongosh-readcon.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/mongosh-readcon.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/mongosh-readcon.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-14","PBM: storage s3 bucket not reachable","Middle", `<h3>Контекст</h3><p>MongoDB: <b>PBM: storage s3 bucket not reachable</b>. Работа с <code>project/pbm-storage-s3-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>PBM: storage s3 bucket not reachable</b>. Файл <code>project/pbm-storage-s3-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/pbm-storage-s3-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/pbm-storage-s3-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>pbm status | grep -A2 Running</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/pbm-storage-s3-.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^pbm status | grep -A2 Running", "FAILED", "warn"],
 ["^pbm config --list | grep pitr", "pitr.enabled false", "warn"],
 ["^pbm config --set pitr.enabled=true", "updated", "ok"],
 ["^pbm status | grep PBM", "PBM OK", "ok"]
],
[{re:"^pbm status | grep -A2 Running",l:"диагностика"},
 {re:"^pbm config --set pitr.enabled=true",l:"исправить"}],{file:"project/pbm-storage-s3-.yaml",files:{"project/pbm-storage-s3-.yaml":`# MongoDB: PBM: storage s3 bucket not reachable\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/pbm-storage-s3-.yaml":`# MongoDB: PBM: storage s3 bucket not reachable — fixed\nstatus: ok\n`}},{hints:["Симптом: PBM: storage s3 bucket not reachable в project/pbm-storage-s3-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/pbm-storage-s3-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/pbm-storage-s3-.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-15","Index: compound index order wrong","Senior", `<h3>Контекст</h3><p>MongoDB: <b>Index: compound index order wrong</b>. Работа с <code>project/index-compound-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Index: compound index order wrong</b>. Файл <code>project/index-compound-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/index-compound-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/index-compound-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/index-compound-.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"db.users.find({email:'a@b.c'}).explain('executionStats')\" | grep -A2 COLLSCAN", "COLLSCAN", "warn"],
 ["^mongosh --eval \"db.users.getIndexes()\" | grep email", "no index", "warn"],
 ["^mongosh --eval \"db.users.createIndex({email:1})\"", "created", "ok"],
 ["^mongosh --eval \"db.users.find({email:'a@b.c'}).explain()\" | grep IXSCAN", "IXSCAN", "ok"]
],
[{re:"^mongosh --eval \"db.users.find({email:'a@b.c'}).explain('executionStats')\" | grep -A2 COLLSCAN",l:"диагностика"},
 {re:"^mongosh --eval \"db.users.createIndex({email:1})\"",l:"исправить"}],{file:"project/index-compound-.yaml",files:{"project/index-compound-.yaml":`# MongoDB: Index: compound index order wrong\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/index-compound-.yaml":`# MongoDB: Index: compound index order wrong — fixed\nstatus: ok\n`}},{hints:["Симптом: Index: compound index order wrong в project/index-compound-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/index-compound-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/index-compound-.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-16","RS: priority 0 no election","Junior", `<h3>Контекст</h3><p>MongoDB: <b>RS: priority 0 no election</b>. Работа с <code>project/rs-priority-0-n.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>RS: priority 0 no election</b>. Файл <code>project/rs-priority-0-n.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/rs-priority-0-n.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/rs-priority-0-n.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/rs-priority-0-n.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"rs.status()\" | grep -A2 stateStr", "PRIMARY mongo-0\nSECONDARY mongo-1", "warn"],
 ["^mongosh --eval \"rs.conf()\" | grep priority", "priority 1", "warn"],
 ["^mongosh --eval \"rs.stepDown()\"", "stepDown", "ok"],
 ["^mongosh --eval \"rs.isMaster()\" | grep ismaster", "ismaster true", "ok"]
],
[{re:"^mongosh --eval \"rs.status()\" | grep -A2 stateStr",l:"диагностика"},
 {re:"^mongosh --eval \"rs.stepDown()\"",l:"исправить"}],{file:"project/rs-priority-0-n.yaml",files:{"project/rs-priority-0-n.yaml":`# MongoDB: RS: priority 0 no election\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/rs-priority-0-n.yaml":`# MongoDB: RS: priority 0 no election — fixed\nstatus: ok\n`}},{hints:["Симптом: RS: priority 0 no election в project/rs-priority-0-n.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/rs-priority-0-n.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/rs-priority-0-n.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-17","Sharding: config server RS unhealthy","Middle", `<h3>Контекст</h3><p>MongoDB: <b>Sharding: config server RS unhealthy</b>. Работа с <code>project/sharding-config.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Sharding: config server RS unhealthy</b>. Файл <code>project/sharding-config.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/sharding-config.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/sharding-config.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/sharding-config.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"rs.status()\" | grep -A2 stateStr", "PRIMARY mongo-0\nSECONDARY mongo-1", "warn"],
 ["^mongosh --eval \"rs.conf()\" | grep priority", "priority 1", "warn"],
 ["^mongosh --eval \"rs.stepDown()\"", "stepDown", "ok"],
 ["^mongosh --eval \"rs.isMaster()\" | grep ismaster", "ismaster true", "ok"]
],
[{re:"^mongosh --eval \"rs.status()\" | grep -A2 stateStr",l:"диагностика"},
 {re:"^mongosh --eval \"rs.stepDown()\"",l:"исправить"}],{file:"project/sharding-config.yaml",files:{"project/sharding-config.yaml":`# MongoDB: Sharding: config server RS unhealthy\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/sharding-config.yaml":`# MongoDB: Sharding: config server RS unhealthy — fixed\nstatus: ok\n`}},{hints:["Симптом: Sharding: config server RS unhealthy в project/sharding-config.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/sharding-config.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/sharding-config.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-18","mongosh: mongod log slow query 800ms","Senior", `<h3>Контекст</h3><p>MongoDB: <b>mongosh: mongod log slow query 800ms</b>. Работа с <code>project/mongosh-mongod-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>mongosh: mongod log slow query 800ms</b>. Файл <code>project/mongosh-mongod-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/mongosh-mongod-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/mongosh-mongod-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/mongosh-mongod-.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"db.adminCommand({ping:1})\" | head -5", "ECONNREFUSED", "warn"],
 ["^mongosh --eval \"db.serverStatus().connections\" | grep current", "connections 40", "warn"],
 ["^mongosh --eval \"db.adminCommand({setParameter:1, logLevel:0})\"", "ok", "ok"],
 ["^mongosh --eval \"db.runCommand({ping:1})\"", "ok:1", "ok"]
],
[{re:"^mongosh --eval \"db.adminCommand({ping:1})\" | head -5",l:"диагностика"},
 {re:"^mongosh --eval \"db.adminCommand({setParameter:1, logLevel:0})\"",l:"исправить"}],{file:"project/mongosh-mongod-.yaml",files:{"project/mongosh-mongod-.yaml":`# MongoDB: mongosh: mongod log slow query 800ms\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/mongosh-mongod-.yaml":`# MongoDB: mongosh: mongod log slow query 800ms — fixed\nstatus: ok\n`}},{hints:["Симптом: mongosh: mongod log slow query 800ms в project/mongosh-mongod-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/mongosh-mongod-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/mongosh-mongod-.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-19","PBM: agent not running on secondary","Junior", `<h3>Контекст</h3><p>MongoDB: <b>PBM: agent not running on secondary</b>. Работа с <code>project/pbm-agent-not-r.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>PBM: agent not running on secondary</b>. Файл <code>project/pbm-agent-not-r.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/pbm-agent-not-r.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/pbm-agent-not-r.yaml</code>. Активный файл открыт в редакторе. Начните с <code>pbm status | grep -A2 Running</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/pbm-agent-not-r.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^pbm status | grep -A2 Running", "FAILED", "warn"],
 ["^pbm config --list | grep pitr", "pitr.enabled false", "warn"],
 ["^pbm config --set pitr.enabled=true", "updated", "ok"],
 ["^pbm status | grep PBM", "PBM OK", "ok"]
],
[{re:"^pbm status | grep -A2 Running",l:"диагностика"},
 {re:"^pbm config --set pitr.enabled=true",l:"исправить"}],{file:"project/pbm-agent-not-r.yaml",files:{"project/pbm-agent-not-r.yaml":`# MongoDB: PBM: agent not running on secondary\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/pbm-agent-not-r.yaml":`# MongoDB: PBM: agent not running on secondary — fixed\nstatus: ok\n`}},{hints:["Симптом: PBM: agent not running on secondary в project/pbm-agent-not-r.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/pbm-agent-not-r.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/pbm-agent-not-r.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-20","Index: sparse vs partial","Middle", `<h3>Контекст</h3><p>MongoDB: <b>Index: sparse vs partial</b>. Работа с <code>project/index-sparse-vs.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Index: sparse vs partial</b>. Файл <code>project/index-sparse-vs.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/index-sparse-vs.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/index-sparse-vs.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/index-sparse-vs.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"db.users.find({email:'a@b.c'}).explain('executionStats')\" | grep -A2 COLLSCAN", "COLLSCAN", "warn"],
 ["^mongosh --eval \"db.users.getIndexes()\" | grep email", "no index", "warn"],
 ["^mongosh --eval \"db.users.createIndex({email:1})\"", "created", "ok"],
 ["^mongosh --eval \"db.users.find({email:'a@b.c'}).explain()\" | grep IXSCAN", "IXSCAN", "ok"]
],
[{re:"^mongosh --eval \"db.users.find({email:'a@b.c'}).explain('executionStats')\" | grep -A2 COLLSCAN",l:"диагностика"},
 {re:"^mongosh --eval \"db.users.createIndex({email:1})\"",l:"исправить"}],{file:"project/index-sparse-vs.yaml",files:{"project/index-sparse-vs.yaml":`# MongoDB: Index: sparse vs partial\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/index-sparse-vs.yaml":`# MongoDB: Index: sparse vs partial — fixed\nstatus: ok\n`}},{hints:["Симптом: Index: sparse vs partial в project/index-sparse-vs.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/index-sparse-vs.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/index-sparse-vs.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-21","RS: arbiter not voting","Senior", `<h3>Контекст</h3><p>MongoDB: <b>RS: arbiter not voting</b>. Работа с <code>project/rs-arbiter-not-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>RS: arbiter not voting</b>. Файл <code>project/rs-arbiter-not-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/rs-arbiter-not-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/rs-arbiter-not-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/rs-arbiter-not-.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"rs.status()\" | grep -A2 stateStr", "PRIMARY mongo-0\nSECONDARY mongo-1", "warn"],
 ["^mongosh --eval \"rs.conf()\" | grep priority", "priority 1", "warn"],
 ["^mongosh --eval \"rs.stepDown()\"", "stepDown", "ok"],
 ["^mongosh --eval \"rs.isMaster()\" | grep ismaster", "ismaster true", "ok"]
],
[{re:"^mongosh --eval \"rs.status()\" | grep -A2 stateStr",l:"диагностика"},
 {re:"^mongosh --eval \"rs.stepDown()\"",l:"исправить"}],{file:"project/rs-arbiter-not-.yaml",files:{"project/rs-arbiter-not-.yaml":`# MongoDB: RS: arbiter not voting\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/rs-arbiter-not-.yaml":`# MongoDB: RS: arbiter not voting — fixed\nstatus: ok\n`}},{hints:["Симптом: RS: arbiter not voting в project/rs-arbiter-not-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/rs-arbiter-not-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/rs-arbiter-not-.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-22","Sharding: shard key monotonic hot spot","Junior", `<h3>Контекст</h3><p>MongoDB: <b>Sharding: shard key monotonic hot spot</b>. Работа с <code>project/sharding-shard-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Sharding: shard key monotonic hot spot</b>. Файл <code>project/sharding-shard-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/sharding-shard-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/sharding-shard-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/sharding-shard-.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"sh.status()\" | grep -A5 balancer", "balancer: enabled but stuck", "warn"],
 ["^mongosh --eval \"sh.getBalancerState()\"", "true", "warn"],
 ["^mongosh --eval \"sh.startBalancer()\"", "balancer started", "ok"],
 ["^mongosh --eval \"sh.isBalancerRunning()\"", "true", "ok"]
],
[{re:"^mongosh --eval \"sh.status()\" | grep -A5 balancer",l:"диагностика"},
 {re:"^mongosh --eval \"sh.startBalancer()\"",l:"исправить"}],{file:"project/sharding-shard-.yaml",files:{"project/sharding-shard-.yaml":`# MongoDB: Sharding: shard key monotonic hot spot\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/sharding-shard-.yaml":`# MongoDB: Sharding: shard key monotonic hot spot — fixed\nstatus: ok\n`}},{hints:["Симптом: Sharding: shard key monotonic hot spot в project/sharding-shard-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/sharding-shard-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/sharding-shard-.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-23","mongosh: rs.status health 0","Middle", `<h3>Контекст</h3><p>MongoDB: <b>mongosh: rs.status health 0</b>. Работа с <code>project/mongosh-rs-stat.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>mongosh: rs.status health 0</b>. Файл <code>project/mongosh-rs-stat.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/mongosh-rs-stat.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/mongosh-rs-stat.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/mongosh-rs-stat.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"db.adminCommand({ping:1})\" | head -5", "ECONNREFUSED", "warn"],
 ["^mongosh --eval \"db.serverStatus().connections\" | grep current", "connections 40", "warn"],
 ["^mongosh --eval \"db.adminCommand({setParameter:1, logLevel:0})\"", "ok", "ok"],
 ["^mongosh --eval \"db.runCommand({ping:1})\"", "ok:1", "ok"]
],
[{re:"^mongosh --eval \"db.adminCommand({ping:1})\" | head -5",l:"диагностика"},
 {re:"^mongosh --eval \"db.adminCommand({setParameter:1, logLevel:0})\"",l:"исправить"}],{file:"project/mongosh-rs-stat.yaml",files:{"project/mongosh-rs-stat.yaml":`# MongoDB: mongosh: rs.status health 0\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/mongosh-rs-stat.yaml":`# MongoDB: mongosh: rs.status health 0 — fixed\nstatus: ok\n`}},{hints:["Симптом: mongosh: rs.status health 0 в project/mongosh-rs-stat.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/mongosh-rs-stat.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/mongosh-rs-stat.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-24","PBM: point-in-time 5 min granularity","Senior", `<h3>Контекст</h3><p>MongoDB: <b>PBM: point-in-time 5 min granularity</b>. Работа с <code>project/pbm-point-in-ti.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>PBM: point-in-time 5 min granularity</b>. Файл <code>project/pbm-point-in-ti.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/pbm-point-in-ti.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/pbm-point-in-ti.yaml</code>. Активный файл открыт в редакторе. Начните с <code>pbm status | grep -A2 Running</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/pbm-point-in-ti.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^pbm status | grep -A2 Running", "FAILED", "warn"],
 ["^pbm config --list | grep pitr", "pitr.enabled false", "warn"],
 ["^pbm config --set pitr.enabled=true", "updated", "ok"],
 ["^pbm status | grep PBM", "PBM OK", "ok"]
],
[{re:"^pbm status | grep -A2 Running",l:"диагностика"},
 {re:"^pbm config --set pitr.enabled=true",l:"исправить"}],{file:"project/pbm-point-in-ti.yaml",files:{"project/pbm-point-in-ti.yaml":`# MongoDB: PBM: point-in-time 5 min granularity\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/pbm-point-in-ti.yaml":`# MongoDB: PBM: point-in-time 5 min granularity — fixed\nstatus: ok\n`}},{hints:["Симптом: PBM: point-in-time 5 min granularity в project/pbm-point-in-ti.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/pbm-point-in-ti.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/pbm-point-in-ti.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-25","Index: text index not used","Junior", `<h3>Контекст</h3><p>MongoDB: <b>Index: text index not used</b>. Работа с <code>project/index-text-inde.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Index: text index not used</b>. Файл <code>project/index-text-inde.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/index-text-inde.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/index-text-inde.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/index-text-inde.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"db.users.find({email:'a@b.c'}).explain('executionStats')\" | grep -A2 COLLSCAN", "COLLSCAN", "warn"],
 ["^mongosh --eval \"db.users.getIndexes()\" | grep email", "no index", "warn"],
 ["^mongosh --eval \"db.users.createIndex({email:1})\"", "created", "ok"],
 ["^mongosh --eval \"db.users.find({email:'a@b.c'}).explain()\" | grep IXSCAN", "IXSCAN", "ok"]
],
[{re:"^mongosh --eval \"db.users.find({email:'a@b.c'}).explain('executionStats')\" | grep -A2 COLLSCAN",l:"диагностика"},
 {re:"^mongosh --eval \"db.users.createIndex({email:1})\"",l:"исправить"}],{file:"project/index-text-inde.yaml",files:{"project/index-text-inde.yaml":`# MongoDB: Index: text index not used\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/index-text-inde.yaml":`# MongoDB: Index: text index not used — fixed\nstatus: ok\n`}},{hints:["Симптом: Index: text index not used в project/index-text-inde.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/index-text-inde.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/index-text-inde.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-26","RS: writeConcern w:2 timeout","Middle", `<h3>Контекст</h3><p>MongoDB: <b>RS: writeConcern w:2 timeout</b>. Работа с <code>project/rs-writeconcern.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>RS: writeConcern w:2 timeout</b>. Файл <code>project/rs-writeconcern.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/rs-writeconcern.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/rs-writeconcern.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/rs-writeconcern.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"rs.status()\" | grep -A2 stateStr", "PRIMARY mongo-0\nSECONDARY mongo-1", "warn"],
 ["^mongosh --eval \"rs.conf()\" | grep priority", "priority 1", "warn"],
 ["^mongosh --eval \"rs.stepDown()\"", "stepDown", "ok"],
 ["^mongosh --eval \"rs.isMaster()\" | grep ismaster", "ismaster true", "ok"]
],
[{re:"^mongosh --eval \"rs.status()\" | grep -A2 stateStr",l:"диагностика"},
 {re:"^mongosh --eval \"rs.stepDown()\"",l:"исправить"}],{file:"project/rs-writeconcern.yaml",files:{"project/rs-writeconcern.yaml":`# MongoDB: RS: writeConcern w:2 timeout\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/rs-writeconcern.yaml":`# MongoDB: RS: writeConcern w:2 timeout — fixed\nstatus: ok\n`}},{hints:["Симптом: RS: writeConcern w:2 timeout в project/rs-writeconcern.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/rs-writeconcern.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/rs-writeconcern.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-27","Sharding: movePrimary failed","Senior", `<h3>Контекст</h3><p>MongoDB: <b>Sharding: movePrimary failed</b>. Работа с <code>project/sharding-movepr.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Sharding: movePrimary failed</b>. Файл <code>project/sharding-movepr.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/sharding-movepr.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/sharding-movepr.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/sharding-movepr.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"sh.status()\" | grep -A5 balancer", "balancer: enabled but stuck", "err"],
 ["^mongosh --eval \"sh.getBalancerState()\"", "true", "warn"],
 ["^mongosh --eval \"sh.startBalancer()\"", "balancer started", "ok"],
 ["^mongosh --eval \"sh.isBalancerRunning()\"", "true", "ok"]
],
[{re:"^mongosh --eval \"sh.status()\" | grep -A5 balancer",l:"диагностика"},
 {re:"^mongosh --eval \"sh.startBalancer()\"",l:"исправить"}],{file:"project/sharding-movepr.yaml",files:{"project/sharding-movepr.yaml":`# MongoDB: Sharding: movePrimary failed\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/sharding-movepr.yaml":`# MongoDB: Sharding: movePrimary failed — fixed\nstatus: ok\n`}},{hints:["Симптом: Sharding: movePrimary failed в project/sharding-movepr.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/sharding-movepr.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/sharding-movepr.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-28","mongosh: db.stats scale","Junior", `<h3>Контекст</h3><p>MongoDB: <b>mongosh: db.stats scale</b>. Работа с <code>project/mongosh-db-stat.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>mongosh: db.stats scale</b>. Файл <code>project/mongosh-db-stat.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/mongosh-db-stat.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/mongosh-db-stat.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/mongosh-db-stat.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"db.adminCommand({ping:1})\" | head -5", "ECONNREFUSED", "warn"],
 ["^mongosh --eval \"db.serverStatus().connections\" | grep current", "connections 40", "warn"],
 ["^mongosh --eval \"db.adminCommand({setParameter:1, logLevel:0})\"", "ok", "ok"],
 ["^mongosh --eval \"db.runCommand({ping:1})\"", "ok:1", "ok"]
],
[{re:"^mongosh --eval \"db.adminCommand({ping:1})\" | head -5",l:"диагностика"},
 {re:"^mongosh --eval \"db.adminCommand({setParameter:1, logLevel:0})\"",l:"исправить"}],{file:"project/mongosh-db-stat.yaml",files:{"project/mongosh-db-stat.yaml":`# MongoDB: mongosh: db.stats scale\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/mongosh-db-stat.yaml":`# MongoDB: mongosh: db.stats scale — fixed\nstatus: ok\n`}},{hints:["Симптом: mongosh: db.stats scale в project/mongosh-db-stat.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/mongosh-db-stat.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/mongosh-db-stat.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-29","PBM: backup retention 30d","Middle", `<h3>Контекст</h3><p>MongoDB: <b>PBM: backup retention 30d</b>. Работа с <code>project/pbm-backup-rete.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>PBM: backup retention 30d</b>. Файл <code>project/pbm-backup-rete.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/pbm-backup-rete.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/pbm-backup-rete.yaml</code>. Активный файл открыт в редакторе. Начните с <code>pbm status | grep -A2 Running</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/pbm-backup-rete.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^pbm status | grep -A2 Running", "FAILED", "warn"],
 ["^pbm config --list | grep pitr", "pitr.enabled false", "warn"],
 ["^pbm config --set pitr.enabled=true", "updated", "ok"],
 ["^pbm status | grep PBM", "PBM OK", "ok"]
],
[{re:"^pbm status | grep -A2 Running",l:"диагностика"},
 {re:"^pbm config --set pitr.enabled=true",l:"исправить"}],{file:"project/pbm-backup-rete.yaml",files:{"project/pbm-backup-rete.yaml":`# MongoDB: PBM: backup retention 30d\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/pbm-backup-rete.yaml":`# MongoDB: PBM: backup retention 30d — fixed\nstatus: ok\n`}},{hints:["Симптом: PBM: backup retention 30d в project/pbm-backup-rete.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/pbm-backup-rete.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/pbm-backup-rete.yaml.","Порядок: диагностика → исправить"]});

S("MongoDB","gc-mongo-30","Index: hashed sharding key","Senior", `<h3>Контекст</h3><p>MongoDB: <b>Index: hashed sharding key</b>. Работа с <code>project/index-hashed-sh.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Index: hashed sharding key</b>. Файл <code>project/index-hashed-sh.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/index-hashed-sh.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/index-hashed-sh.yaml</code>. Активный файл открыт в редакторе. Начните с <code>mongosh --eval \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat project/index-hashed-sh.yaml<br>проверить код</pre>`,
"dev@mongo:~$",
[
 ["^mongosh --eval \"sh.status()\" | grep -A5 balancer", "balancer: enabled but stuck", "warn"],
 ["^mongosh --eval \"sh.getBalancerState()\"", "true", "warn"],
 ["^mongosh --eval \"sh.startBalancer()\"", "balancer started", "ok"],
 ["^mongosh --eval \"sh.isBalancerRunning()\"", "true", "ok"]
],
[{re:"^mongosh --eval \"sh.status()\" | grep -A5 balancer",l:"диагностика"},
 {re:"^mongosh --eval \"sh.startBalancer()\"",l:"исправить"}],{file:"project/index-hashed-sh.yaml",files:{"project/index-hashed-sh.yaml":`# MongoDB: Index: hashed sharding key\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/index-hashed-sh.yaml":`# MongoDB: Index: hashed sharding key — fixed\nstatus: ok\n`}},{hints:["Симптом: Index: hashed sharding key в project/index-hashed-sh.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/index-hashed-sh.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/index-hashed-sh.yaml.","Порядок: диагностика → исправить"]});

