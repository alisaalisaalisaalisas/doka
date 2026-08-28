/* Global Playground: Interview — 30 scenarios */
S("Interview","gc-interview-1","Расскажи про 3 way handshake и TIME_WAIT","Junior", `<h3>Контекст</h3><p>Interview: <b>Расскажи про 3 way handshake и TIME_WAIT</b>. Работа с <code>project/-3-way-handshak.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Расскажи про 3 way handshake и TIME_WAIT</b>. Файл <code>project/-3-way-handshak.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-3-way-handshak.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-3-way-handshak.yaml</code>. Активный файл открыт в редакторе. Начните с <code>ss -tan | grep TIME-WAIT | hea</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-3-way-handshak.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^ss -tan | grep TIME-WAIT | head -10", "diagnostic output", "warn"],
 ["^cat /proc/sys/net/ipv4/tcp_fin_timeout", "check output", "warn"],
 ["^ss -tan state time-wait | wc -l", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^ss -tan | grep TIME-WAIT | head -10",l:"показать понимание"},
 {re:"^ss -tan state time-wait | wc -l",l:"продемонстрировать"}],{file:"project/-3-way-handshak.yaml",files:{"project/-3-way-handshak.yaml":`# Interview: Расскажи про 3 way handshake и TIME_WAIT\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-3-way-handshak.yaml":`# Interview: Расскажи про 3 way handshake и TIME_WAIT — fixed\nstatus: ok\n`}},{hints:["Симптом: Расскажи про 3 way handshake и TIME_WAIT в project/-3-way-handshak.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-3-way-handshak.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-3-way-handshak.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-2","Чем отличается readinessProbe от livenessProbe","Middle", `<h3>Контекст</h3><p>Interview: <b>Чем отличается readinessProbe от livenessProbe</b>. Работа с <code>project/-readinessprobe.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Чем отличается readinessProbe от livenessProbe</b>. Файл <code>project/-readinessprobe.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-readinessprobe.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-readinessprobe.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl describe pod api-xxx -</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-readinessprobe.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^kubectl describe pod api-xxx -n prod | grep -A5 Probe | head -20", "diagnostic output", "warn"],
 ["^kubectl get deploy api -n prod -o yaml | grep -A3 readinessProbe | head -10", "check output", "warn"],
 ["^kubectl patch deploy api -n prod -p '{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"api\",\"readinessProbe\":{\"httpGet\":{\"path\":\"/ready\"}}}]}}}}'", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^kubectl describe pod api-xxx -n prod | grep -A5 Probe | head -20",l:"показать понимание"},
 {re:"^kubectl patch deploy api -n prod -p '{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"api\",\"readinessProbe\":{\"httpGet\":{\"path\":\"/ready\"}}}]}}}}'",l:"продемонстрировать"}],{file:"project/-readinessprobe.yaml",files:{"project/-readinessprobe.yaml":`# Interview: Чем отличается readinessProbe от livenessProbe\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-readinessprobe.yaml":`# Interview: Чем отличается readinessProbe от livenessProbe — fixed\nstatus: ok\n`}},{hints:["Симптом: Чем отличается readinessProbe от livenessProbe в project/-readinessprobe.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-readinessprobe.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-readinessprobe.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-3","Как работает Raft quorum 2/3","Senior", `<h3>Контекст</h3><p>Interview: <b>Как работает Raft quorum 2/3</b>. Работа с <code>project/-raft-quorum-2-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Как работает Raft quorum 2/3</b>. Файл <code>project/-raft-quorum-2-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-raft-quorum-2-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-raft-quorum-2-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>etcdctl endpoint status -w tab</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-raft-quorum-2-.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^etcdctl endpoint status -w table | head -10", "diagnostic output", "warn"],
 ["^patronictl -c /etc/patroni.yml list | head -10", "check output", "warn"],
 ["^echo \"quorum 2/3\" | head -5", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^etcdctl endpoint status -w table | head -10",l:"показать понимание"},
 {re:"^echo \"quorum 2/3\" | head -5",l:"продемонстрировать"}],{file:"project/-raft-quorum-2-.yaml",files:{"project/-raft-quorum-2-.yaml":`# Interview: Как работает Raft quorum 2/3\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-raft-quorum-2-.yaml":`# Interview: Как работает Raft quorum 2/3 — fixed\nstatus: ok\n`}},{hints:["Симптом: Как работает Raft quorum 2/3 в project/-raft-quorum-2-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-raft-quorum-2-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-raft-quorum-2-.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-4","Что такое CAP и где твой проект AP vs CP","Junior", `<h3>Контекст</h3><p>Interview: <b>Что такое CAP и где твой проект AP vs CP</b>. Работа с <code>project/-cap-ap-vs-cp.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Что такое CAP и где твой проект AP vs CP</b>. Файл <code>project/-cap-ap-vs-cp.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-cap-ap-vs-cp.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-cap-ap-vs-cp.yaml</code>. Активный файл открыт в редакторе. Начните с <code>echo \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-cap-ap-vs-cp.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^echo \"STAR answer\" | head -5", "diagnostic output", "warn"],
 ["^cat runbook.md | head -20", "check output", "warn"],
 ["^echo \"prepared\" | head -5", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^echo \"STAR answer\" | head -5",l:"показать понимание"},
 {re:"^echo \"prepared\" | head -5",l:"продемонстрировать"}],{file:"project/-cap-ap-vs-cp.yaml",files:{"project/-cap-ap-vs-cp.yaml":`# Interview: Что такое CAP и где твой проект AP vs CP\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-cap-ap-vs-cp.yaml":`# Interview: Что такое CAP и где твой проект AP vs CP — fixed\nstatus: ok\n`}},{hints:["Симптом: Что такое CAP и где твой проект AP vs CP в project/-cap-ap-vs-cp.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-cap-ap-vs-cp.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-cap-ap-vs-cp.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-5","Как отладишь OOMKilled pod","Middle", `<h3>Контекст</h3><p>Interview: <b>Как отладишь OOMKilled pod</b>. Работа с <code>project/-oomkilled-pod.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Как отладишь OOMKilled pod</b>. Файл <code>project/-oomkilled-pod.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-oomkilled-pod.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-oomkilled-pod.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl describe pod api-xxx -</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-oomkilled-pod.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^kubectl describe pod api-xxx -n prod | grep -A3 OOMKilled | head -10", "diagnostic output", "warn"],
 ["^kubectl top pod -n prod | head -10", "check output", "warn"],
 ["^kubectl patch deploy api -n prod -p '{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"api\",\"resources\":{\"limits\":{\"memory\":\"512Mi\"}}}]}}}}'", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^kubectl describe pod api-xxx -n prod | grep -A3 OOMKilled | head -10",l:"показать понимание"},
 {re:"^kubectl patch deploy api -n prod -p '{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"api\",\"resources\":{\"limits\":{\"memory\":\"512Mi\"}}}]}}}}'",l:"продемонстрировать"}],{file:"project/-oomkilled-pod.yaml",files:{"project/-oomkilled-pod.yaml":`# Interview: Как отладишь OOMKilled pod\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-oomkilled-pod.yaml":`# Interview: Как отладишь OOMKilled pod — fixed\nstatus: ok\n`}},{hints:["Симптом: Как отладишь OOMKilled pod в project/-oomkilled-pod.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-oomkilled-pod.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-oomkilled-pod.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-6","Как масштабируешь Kafka consumer lag","Senior", `<h3>Контекст</h3><p>Interview: <b>Как масштабируешь Kafka consumer lag</b>. Работа с <code>project/-kafka-consumer.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Как масштабируешь Kafka consumer lag</b>. Файл <code>project/-kafka-consumer.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-kafka-consumer.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-kafka-consumer.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-consumer-groups.sh --boo</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-kafka-consumer.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders | head -10", "diagnostic output", "warn"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --topic orders | head -10", "check output", "warn"],
 ["^kubectl scale deploy orders-consumer --replicas=4 -n prod", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders | head -10",l:"показать понимание"},
 {re:"^kubectl scale deploy orders-consumer --replicas=4 -n prod",l:"продемонстрировать"}],{file:"project/-kafka-consumer.yaml",files:{"project/-kafka-consumer.yaml":`# Interview: Как масштабируешь Kafka consumer lag\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-kafka-consumer.yaml":`# Interview: Как масштабируешь Kafka consumer lag — fixed\nstatus: ok\n`}},{hints:["Симптом: Как масштабируешь Kafka consumer lag в project/-kafka-consumer.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-kafka-consumer.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-kafka-consumer.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-7","Что такое SLO burn rate и error budget","Junior", `<h3>Контекст</h3><p>Interview: <b>Что такое SLO burn rate и error budget</b>. Работа с <code>project/-slo-burn-rate-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Что такое SLO burn rate и error budget</b>. Файл <code>project/-slo-burn-rate-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-slo-burn-rate-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-slo-burn-rate-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cat slo.yaml | grep -A2 burnRa</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-slo-burn-rate-.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^cat slo.yaml | grep -A2 burnRate | head -10", "diagnostic output", "warn"],
 ["^promtool query instant http://prometheus:9090 'vector(1)' | head -5", "check output", "warn"],
 ["^cat slo.yaml | grep -A3 errorBudget | head -10", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^cat slo.yaml | grep -A2 burnRate | head -10",l:"показать понимание"},
 {re:"^cat slo.yaml | grep -A3 errorBudget | head -10",l:"продемонстрировать"}],{file:"project/-slo-burn-rate-.yaml",files:{"project/-slo-burn-rate-.yaml":`# Interview: Что такое SLO burn rate и error budget\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-slo-burn-rate-.yaml":`# Interview: Что такое SLO burn rate и error budget — fixed\nstatus: ok\n`}},{hints:["Симптом: Что такое SLO burn rate и error budget в project/-slo-burn-rate-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-slo-burn-rate-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-slo-burn-rate-.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-8","Как сделать zero-downtime деплой","Middle", `<h3>Контекст</h3><p>Interview: <b>Как сделать zero-downtime деплой</b>. Работа с <code>project/-zero-downtime-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Как сделать zero-downtime деплой</b>. Файл <code>project/-zero-downtime-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-zero-downtime-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-zero-downtime-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl rollout status deploy/</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-zero-downtime-.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^kubectl rollout status deploy/api -n prod | head -10", "diagnostic output", "warn"],
 ["^kubectl get deploy api -n prod -o yaml | grep -A2 strategy | head -10", "check output", "warn"],
 ["^kubectl patch deploy api -n prod -p '{\"spec\":{\"strategy\":{\"type\":\"RollingUpdate\",\"rollingUpdate\":{\"maxUnavailable\":0,\"maxSurge\":1}}}}'", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^kubectl rollout status deploy/api -n prod | head -10",l:"показать понимание"},
 {re:"^kubectl patch deploy api -n prod -p '{\"spec\":{\"strategy\":{\"type\":\"RollingUpdate\",\"rollingUpdate\":{\"maxUnavailable\":0,\"maxSurge\":1}}}}'",l:"продемонстрировать"}],{file:"project/-zero-downtime-.yaml",files:{"project/-zero-downtime-.yaml":`# Interview: Как сделать zero-downtime деплой\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-zero-downtime-.yaml":`# Interview: Как сделать zero-downtime деплой — fixed\nstatus: ok\n`}},{hints:["Симптом: Как сделать zero-downtime деплой в project/-zero-downtime-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-zero-downtime-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-zero-downtime-.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-9","Чем отличается bridge vs overlay network","Senior", `<h3>Контекст</h3><p>Interview: <b>Чем отличается bridge vs overlay network</b>. Работа с <code>project/-bridge-vs-over.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Чем отличается bridge vs overlay network</b>. Файл <code>project/-bridge-vs-over.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-bridge-vs-over.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-bridge-vs-over.yaml</code>. Активный файл открыт в редакторе. Начните с <code>echo \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-bridge-vs-over.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^echo \"STAR answer\" | head -5", "diagnostic output", "warn"],
 ["^cat runbook.md | head -20", "check output", "warn"],
 ["^echo \"prepared\" | head -5", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^echo \"STAR answer\" | head -5",l:"показать понимание"},
 {re:"^echo \"prepared\" | head -5",l:"продемонстрировать"}],{file:"project/-bridge-vs-over.yaml",files:{"project/-bridge-vs-over.yaml":`# Interview: Чем отличается bridge vs overlay network\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-bridge-vs-over.yaml":`# Interview: Чем отличается bridge vs overlay network — fixed\nstatus: ok\n`}},{hints:["Симптом: Чем отличается bridge vs overlay network в project/-bridge-vs-over.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-bridge-vs-over.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-bridge-vs-over.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-10","Как работает TLS handshake mTLS","Junior", `<h3>Контекст</h3><p>Interview: <b>Как работает TLS handshake mTLS</b>. Работа с <code>project/-tls-handshake-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Как работает TLS handshake mTLS</b>. Файл <code>project/-tls-handshake-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-tls-handshake-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-tls-handshake-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>ss -tan | grep TIME-WAIT | hea</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-tls-handshake-.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^ss -tan | grep TIME-WAIT | head -10", "diagnostic output", "warn"],
 ["^cat /proc/sys/net/ipv4/tcp_fin_timeout", "check output", "warn"],
 ["^ss -tan state time-wait | wc -l", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^ss -tan | grep TIME-WAIT | head -10",l:"показать понимание"},
 {re:"^ss -tan state time-wait | wc -l",l:"продемонстрировать"}],{file:"project/-tls-handshake-.yaml",files:{"project/-tls-handshake-.yaml":`# Interview: Как работает TLS handshake mTLS\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-tls-handshake-.yaml":`# Interview: Как работает TLS handshake mTLS — fixed\nstatus: ok\n`}},{hints:["Симптом: Как работает TLS handshake mTLS в project/-tls-handshake-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-tls-handshake-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-tls-handshake-.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-11","Что такое HPA vs VPA vs KEDA","Middle", `<h3>Контекст</h3><p>Interview: <b>Что такое HPA vs VPA vs KEDA</b>. Работа с <code>project/-hpa-vs-vpa-vs-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Что такое HPA vs VPA vs KEDA</b>. Файл <code>project/-hpa-vs-vpa-vs-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-hpa-vs-vpa-vs-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-hpa-vs-vpa-vs-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get hpa -n prod | head</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-hpa-vs-vpa-vs-.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^kubectl get hpa -n prod | head -10", "diagnostic output", "warn"],
 ["^kubectl describe hpa api -n prod | grep -A2 metrics | head -10", "check output", "warn"],
 ["^kubectl apply -f hpa.yaml", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^kubectl get hpa -n prod | head -10",l:"показать понимание"},
 {re:"^kubectl apply -f hpa.yaml",l:"продемонстрировать"}],{file:"project/-hpa-vs-vpa-vs-.yaml",files:{"project/-hpa-vs-vpa-vs-.yaml":`# Interview: Что такое HPA vs VPA vs KEDA\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-hpa-vs-vpa-vs-.yaml":`# Interview: Что такое HPA vs VPA vs KEDA — fixed\nstatus: ok\n`}},{hints:["Симптом: Что такое HPA vs VPA vs KEDA в project/-hpa-vs-vpa-vs-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-hpa-vs-vpa-vs-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-hpa-vs-vpa-vs-.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-12","Как хранишь секреты: Vault vs Sealed Secrets","Senior", `<h3>Контекст</h3><p>Interview: <b>Как хранишь секреты: Vault vs Sealed Secrets</b>. Работа с <code>project/-vault-vs-seale.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Как хранишь секреты: Vault vs Sealed Secrets</b>. Файл <code>project/-vault-vs-seale.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-vault-vs-seale.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-vault-vs-seale.yaml</code>. Активный файл открыт в редакторе. Начните с <code>vault kv get secret/prod/api |</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-vault-vs-seale.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^vault kv get secret/prod/api | head -10", "diagnostic output", "warn"],
 ["^kubectl get externalsecrets -n prod | head -10", "check output", "warn"],
 ["^vault kv put secret/prod/api DB_PASS=s3cr3t", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^vault kv get secret/prod/api | head -10",l:"показать понимание"},
 {re:"^vault kv put secret/prod/api DB_PASS=s3cr3t",l:"продемонстрировать"}],{file:"project/-vault-vs-seale.yaml",files:{"project/-vault-vs-seale.yaml":`# Interview: Как хранишь секреты: Vault vs Sealed Secrets\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-vault-vs-seale.yaml":`# Interview: Как хранишь секреты: Vault vs Sealed Secrets — fixed\nstatus: ok\n`}},{hints:["Симптом: Как хранишь секреты: Vault vs Sealed Secrets в project/-vault-vs-seale.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-vault-vs-seale.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-vault-vs-seale.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-13","Как делаешь backup etcd и Velero","Junior", `<h3>Контекст</h3><p>Interview: <b>Как делаешь backup etcd и Velero</b>. Работа с <code>project/-backup-etcd-ve.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Как делаешь backup etcd и Velero</b>. Файл <code>project/-backup-etcd-ve.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-backup-etcd-ve.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-backup-etcd-ve.yaml</code>. Активный файл открыт в редакторе. Начните с <code>ETCDCTL_API=3 etcdctl snapshot</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-backup-etcd-ve.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^ETCDCTL_API=3 etcdctl snapshot save /tmp/etcd.db | tail -3", "diagnostic output", "warn"],
 ["^velero backup get | head -10", "check output", "warn"],
 ["^ETCDCTL_API=3 etcdctl snapshot save /tmp/etcd.db && echo saved", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^ETCDCTL_API=3 etcdctl snapshot save /tmp/etcd.db | tail -3",l:"показать понимание"},
 {re:"^ETCDCTL_API=3 etcdctl snapshot save /tmp/etcd.db && echo saved",l:"продемонстрировать"}],{file:"project/-backup-etcd-ve.yaml",files:{"project/-backup-etcd-ve.yaml":`# Interview: Как делаешь backup etcd и Velero\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-backup-etcd-ve.yaml":`# Interview: Как делаешь backup etcd и Velero — fixed\nstatus: ok\n`}},{hints:["Симптом: Как делаешь backup etcd и Velero в project/-backup-etcd-ve.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-backup-etcd-ve.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-backup-etcd-ve.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-14","Что такое GitOps vs ClickOps","Middle", `<h3>Контекст</h3><p>Interview: <b>Что такое GitOps vs ClickOps</b>. Работа с <code>project/-gitops-vs-clic.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Что такое GitOps vs ClickOps</b>. Файл <code>project/-gitops-vs-clic.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-gitops-vs-clic.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-gitops-vs-clic.yaml</code>. Активный файл открыт в редакторе. Начните с <code>argocd app list | head -10</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-gitops-vs-clic.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^argocd app list | head -10", "diagnostic output", "warn"],
 ["^kubectl get applications -n argocd | head -10", "check output", "warn"],
 ["^argocd app sync shop-api", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^argocd app list | head -10",l:"показать понимание"},
 {re:"^argocd app sync shop-api",l:"продемонстрировать"}],{file:"project/-gitops-vs-clic.yaml",files:{"project/-gitops-vs-clic.yaml":`# Interview: Что такое GitOps vs ClickOps\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-gitops-vs-clic.yaml":`# Interview: Что такое GitOps vs ClickOps — fixed\nstatus: ok\n`}},{hints:["Симптом: Что такое GitOps vs ClickOps в project/-gitops-vs-clic.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-gitops-vs-clic.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-gitops-vs-clic.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-15","Как профилируешь Python GIL vs Go scheduler","Senior", `<h3>Контекст</h3><p>Interview: <b>Как профилируешь Python GIL vs Go scheduler</b>. Работа с <code>project/-python-gil-vs-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Как профилируешь Python GIL vs Go scheduler</b>. Файл <code>project/-python-gil-vs-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-python-gil-vs-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-python-gil-vs-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>echo \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-python-gil-vs-.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^echo \"STAR answer\" | head -5", "diagnostic output", "warn"],
 ["^cat runbook.md | head -20", "check output", "warn"],
 ["^echo \"prepared\" | head -5", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^echo \"STAR answer\" | head -5",l:"показать понимание"},
 {re:"^echo \"prepared\" | head -5",l:"продемонстрировать"}],{file:"project/-python-gil-vs-.yaml",files:{"project/-python-gil-vs-.yaml":`# Interview: Как профилируешь Python GIL vs Go scheduler\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-python-gil-vs-.yaml":`# Interview: Как профилируешь Python GIL vs Go scheduler — fixed\nstatus: ok\n`}},{hints:["Симптом: Как профилируешь Python GIL vs Go scheduler в project/-python-gil-vs-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-python-gil-vs-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-python-gil-vs-.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-16","Как работает eBPF XDP vs iptables","Junior", `<h3>Контекст</h3><p>Interview: <b>Как работает eBPF XDP vs iptables</b>. Работа с <code>project/-ebpf-xdp-vs-ip.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Как работает eBPF XDP vs iptables</b>. Файл <code>project/-ebpf-xdp-vs-ip.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-ebpf-xdp-vs-ip.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-ebpf-xdp-vs-ip.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cilium status | head -10</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-ebpf-xdp-vs-ip.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^cilium status | head -10", "diagnostic output", "warn"],
 ["^bpftool prog show | head -10", "check output", "warn"],
 ["^cilium connectivity test | tail -5", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^cilium status | head -10",l:"показать понимание"},
 {re:"^cilium connectivity test | tail -5",l:"продемонстрировать"}],{file:"project/-ebpf-xdp-vs-ip.yaml",files:{"project/-ebpf-xdp-vs-ip.yaml":`# Interview: Как работает eBPF XDP vs iptables\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-ebpf-xdp-vs-ip.yaml":`# Interview: Как работает eBPF XDP vs iptables — fixed\nstatus: ok\n`}},{hints:["Симптом: Как работает eBPF XDP vs iptables в project/-ebpf-xdp-vs-ip.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-ebpf-xdp-vs-ip.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-ebpf-xdp-vs-ip.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-17","Чем отличается COPY vs ADD в Dockerfile","Middle", `<h3>Контекст</h3><p>Interview: <b>Чем отличается COPY vs ADD в Dockerfile</b>. Работа с <code>project/-copy-vs-add-do.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Чем отличается COPY vs ADD в Dockerfile</b>. Файл <code>project/-copy-vs-add-do.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-copy-vs-add-do.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-copy-vs-add-do.yaml</code>. Активный файл открыт в редакторе. Начните с <code>echo \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-copy-vs-add-do.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^echo \"STAR answer\" | head -5", "diagnostic output", "warn"],
 ["^cat runbook.md | head -20", "check output", "warn"],
 ["^echo \"prepared\" | head -5", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^echo \"STAR answer\" | head -5",l:"показать понимание"},
 {re:"^echo \"prepared\" | head -5",l:"продемонстрировать"}],{file:"project/-copy-vs-add-do.yaml",files:{"project/-copy-vs-add-do.yaml":`# Interview: Чем отличается COPY vs ADD в Dockerfile\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-copy-vs-add-do.yaml":`# Interview: Чем отличается COPY vs ADD в Dockerfile — fixed\nstatus: ok\n`}},{hints:["Симптом: Чем отличается COPY vs ADD в Dockerfile в project/-copy-vs-add-do.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-copy-vs-add-do.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-copy-vs-add-do.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-18","Как чинишь split brain в Patroni","Senior", `<h3>Контекст</h3><p>Interview: <b>Как чинишь split brain в Patroni</b>. Работа с <code>project/-split-brain-pa.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Как чинишь split brain в Patroni</b>. Файл <code>project/-split-brain-pa.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-split-brain-pa.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-split-brain-pa.yaml</code>. Активный файл открыт в редакторе. Начните с <code>patronictl -c /etc/patroni.yml</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-split-brain-pa.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^patronictl -c /etc/patroni.yml list | head -10", "diagnostic output", "warn"],
 ["^psql -c \"SELECT * FROM pg_stat_replication\" | head -10", "check output", "warn"],
 ["^patronictl -c /etc/patroni.yml switchover --master pg1 --candidate pg2 --force", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^patronictl -c /etc/patroni.yml list | head -10",l:"показать понимание"},
 {re:"^patronictl -c /etc/patroni.yml switchover --master pg1 --candidate pg2 --force",l:"продемонстрировать"}],{file:"project/-split-brain-pa.yaml",files:{"project/-split-brain-pa.yaml":`# Interview: Как чинишь split brain в Patroni\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-split-brain-pa.yaml":`# Interview: Как чинишь split brain в Patroni — fixed\nstatus: ok\n`}},{hints:["Симптом: Как чинишь split brain в Patroni в project/-split-brain-pa.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-split-brain-pa.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-split-brain-pa.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-19","Что такое backpressure в Kafka","Junior", `<h3>Контекст</h3><p>Interview: <b>Что такое backpressure в Kafka</b>. Работа с <code>project/-backpressure-k.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Что такое backpressure в Kafka</b>. Файл <code>project/-backpressure-k.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-backpressure-k.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-backpressure-k.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kafka-consumer-groups.sh --boo</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-backpressure-k.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders | head -10", "diagnostic output", "warn"],
 ["^kafka-topics.sh --bootstrap-server kafka:9092 --describe --topic orders | head -10", "check output", "warn"],
 ["^kubectl scale deploy orders-consumer --replicas=4 -n prod", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders | head -10",l:"показать понимание"},
 {re:"^kubectl scale deploy orders-consumer --replicas=4 -n prod",l:"продемонстрировать"}],{file:"project/-backpressure-k.yaml",files:{"project/-backpressure-k.yaml":`# Interview: Что такое backpressure в Kafka\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-backpressure-k.yaml":`# Interview: Что такое backpressure в Kafka — fixed\nstatus: ok\n`}},{hints:["Симптом: Что такое backpressure в Kafka в project/-backpressure-k.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-backpressure-k.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-backpressure-k.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-20","Как считаешь RPO/RTO для DR","Middle", `<h3>Контекст</h3><p>Interview: <b>Как считаешь RPO/RTO для DR</b>. Работа с <code>project/-rpo-rto-dr.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Как считаешь RPO/RTO для DR</b>. Файл <code>project/-rpo-rto-dr.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-rpo-rto-dr.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-rpo-rto-dr.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cat docs/runbook/dr.md | grep </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-rpo-rto-dr.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^cat docs/runbook/dr.md | grep -A2 RPO | head -10", "diagnostic output", "warn"],
 ["^velero backup get | head -10", "check output", "warn"],
 ["^echo \"RPO 15m\" >> docs/runbook/dr.md", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^cat docs/runbook/dr.md | grep -A2 RPO | head -10",l:"показать понимание"},
 {re:"^echo \"RPO 15m\" >> docs/runbook/dr.md",l:"продемонстрировать"}],{file:"project/-rpo-rto-dr.yaml",files:{"project/-rpo-rto-dr.yaml":`# Interview: Как считаешь RPO/RTO для DR\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-rpo-rto-dr.yaml":`# Interview: Как считаешь RPO/RTO для DR — fixed\nstatus: ok\n`}},{hints:["Симптом: Как считаешь RPO/RTO для DR в project/-rpo-rto-dr.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-rpo-rto-dr.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-rpo-rto-dr.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-21","Расскажи про 5 whys postmortem","Senior", `<h3>Контекст</h3><p>Interview: <b>Расскажи про 5 whys postmortem</b>. Работа с <code>project/-5-whys-postmor.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Расскажи про 5 whys postmortem</b>. Файл <code>project/-5-whys-postmor.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-5-whys-postmor.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-5-whys-postmor.yaml</code>. Активный файл открыт в редакторе. Начните с <code>echo \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-5-whys-postmor.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^echo \"STAR answer\" | head -5", "diagnostic output", "warn"],
 ["^cat runbook.md | head -20", "check output", "warn"],
 ["^echo \"prepared\" | head -5", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^echo \"STAR answer\" | head -5",l:"показать понимание"},
 {re:"^echo \"prepared\" | head -5",l:"продемонстрировать"}],{file:"project/-5-whys-postmor.yaml",files:{"project/-5-whys-postmor.yaml":`# Interview: Расскажи про 5 whys postmortem\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-5-whys-postmor.yaml":`# Interview: Расскажи про 5 whys postmortem — fixed\nstatus: ok\n`}},{hints:["Симптом: Расскажи про 5 whys postmortem в project/-5-whys-postmor.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-5-whys-postmor.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-5-whys-postmor.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-22","Как настроишь distributed tracing sampling","Junior", `<h3>Контекст</h3><p>Interview: <b>Как настроишь distributed tracing sampling</b>. Работа с <code>project/-distributed-tr.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Как настроишь distributed tracing sampling</b>. Файл <code>project/-distributed-tr.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-distributed-tr.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-distributed-tr.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get pods -n monitoring</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-distributed-tr.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^kubectl get pods -n monitoring -l app=jaeger | head -10", "diagnostic output", "warn"],
 ["^curl -s http://jaeger:16686/api/traces?service=api | jq | head -20", "check output", "warn"],
 ["^kubectl patch deploy api -n prod -p '{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"sidecar.jaeger/enabled\":\"true\"}}}}}'", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^kubectl get pods -n monitoring -l app=jaeger | head -10",l:"показать понимание"},
 {re:"^kubectl patch deploy api -n prod -p '{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"sidecar.jaeger/enabled\":\"true\"}}}}}'",l:"продемонстрировать"}],{file:"project/-distributed-tr.yaml",files:{"project/-distributed-tr.yaml":`# Interview: Как настроишь distributed tracing sampling\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-distributed-tr.yaml":`# Interview: Как настроишь distributed tracing sampling — fixed\nstatus: ok\n`}},{hints:["Симптом: Как настроишь distributed tracing sampling в project/-distributed-tr.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-distributed-tr.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-distributed-tr.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-23","Что такое PodDisruptionBudget","Middle", `<h3>Контекст</h3><p>Interview: <b>Что такое PodDisruptionBudget</b>. Работа с <code>project/-poddisruptionb.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Что такое PodDisruptionBudget</b>. Файл <code>project/-poddisruptionb.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-poddisruptionb.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-poddisruptionb.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get pdb -n prod | head</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-poddisruptionb.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^kubectl get pdb -n prod | head -10", "diagnostic output", "warn"],
 ["^kubectl describe pdb api-pdb -n prod | head -20", "check output", "warn"],
 ["^kubectl patch pdb api-pdb -n prod -p '{\"spec\":{\"minAvailable\":1}}'", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^kubectl get pdb -n prod | head -10",l:"показать понимание"},
 {re:"^kubectl patch pdb api-pdb -n prod -p '{\"spec\":{\"minAvailable\":1}}'",l:"продемонстрировать"}],{file:"project/-poddisruptionb.yaml",files:{"project/-poddisruptionb.yaml":`# Interview: Что такое PodDisruptionBudget\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-poddisruptionb.yaml":`# Interview: Что такое PodDisruptionBudget — fixed\nstatus: ok\n`}},{hints:["Симптом: Что такое PodDisruptionBudget в project/-poddisruptionb.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-poddisruptionb.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-poddisruptionb.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-24","Как работает Cilium eBPF vs Calico BGP","Senior", `<h3>Контекст</h3><p>Interview: <b>Как работает Cilium eBPF vs Calico BGP</b>. Работа с <code>project/-cilium-ebpf-vs.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Как работает Cilium eBPF vs Calico BGP</b>. Файл <code>project/-cilium-ebpf-vs.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-cilium-ebpf-vs.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-cilium-ebpf-vs.yaml</code>. Активный файл открыт в редакторе. Начните с <code>cilium status | head -10</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-cilium-ebpf-vs.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^cilium status | head -10", "diagnostic output", "warn"],
 ["^bpftool prog show | head -10", "check output", "warn"],
 ["^cilium connectivity test | tail -5", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^cilium status | head -10",l:"показать понимание"},
 {re:"^cilium connectivity test | tail -5",l:"продемонстрировать"}],{file:"project/-cilium-ebpf-vs.yaml",files:{"project/-cilium-ebpf-vs.yaml":`# Interview: Как работает Cilium eBPF vs Calico BGP\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-cilium-ebpf-vs.yaml":`# Interview: Как работает Cilium eBPF vs Calico BGP — fixed\nstatus: ok\n`}},{hints:["Симптом: Как работает Cilium eBPF vs Calico BGP в project/-cilium-ebpf-vs.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-cilium-ebpf-vs.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-cilium-ebpf-vs.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-25","Чем отличается strong vs eventual consistency","Junior", `<h3>Контекст</h3><p>Interview: <b>Чем отличается strong vs eventual consistency</b>. Работа с <code>project/-strong-vs-even.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Чем отличается strong vs eventual consistency</b>. Файл <code>project/-strong-vs-even.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-strong-vs-even.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-strong-vs-even.yaml</code>. Активный файл открыт в редакторе. Начните с <code>echo \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-strong-vs-even.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^echo \"STAR answer\" | head -5", "diagnostic output", "warn"],
 ["^cat runbook.md | head -20", "check output", "warn"],
 ["^echo \"prepared\" | head -5", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^echo \"STAR answer\" | head -5",l:"показать понимание"},
 {re:"^echo \"prepared\" | head -5",l:"продемонстрировать"}],{file:"project/-strong-vs-even.yaml",files:{"project/-strong-vs-even.yaml":`# Interview: Чем отличается strong vs eventual consistency\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-strong-vs-even.yaml":`# Interview: Чем отличается strong vs eventual consistency — fixed\nstatus: ok\n`}},{hints:["Симптом: Чем отличается strong vs eventual consistency в project/-strong-vs-even.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-strong-vs-even.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-strong-vs-even.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-26","Как дебажишь distroless контейнер","Middle", `<h3>Контекст</h3><p>Interview: <b>Как дебажишь distroless контейнер</b>. Работа с <code>project/-distroless-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Как дебажишь distroless контейнер</b>. Файл <code>project/-distroless-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-distroless-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-distroless-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>echo \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-distroless-.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^echo \"STAR answer\" | head -5", "diagnostic output", "warn"],
 ["^cat runbook.md | head -20", "check output", "warn"],
 ["^echo \"prepared\" | head -5", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^echo \"STAR answer\" | head -5",l:"показать понимание"},
 {re:"^echo \"prepared\" | head -5",l:"продемонстрировать"}],{file:"project/-distroless-.yaml",files:{"project/-distroless-.yaml":`# Interview: Как дебажишь distroless контейнер\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-distroless-.yaml":`# Interview: Как дебажишь distroless контейнер — fixed\nstatus: ok\n`}},{hints:["Симптом: Как дебажишь distroless контейнер в project/-distroless-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-distroless-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-distroless-.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-27","Что такое service mesh Ambient","Senior", `<h3>Контекст</h3><p>Interview: <b>Что такое service mesh Ambient</b>. Работа с <code>project/-service-mesh-a.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Что такое service mesh Ambient</b>. Файл <code>project/-service-mesh-a.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-service-mesh-a.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-service-mesh-a.yaml</code>. Активный файл открыт в редакторе. Начните с <code>echo \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-service-mesh-a.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^echo \"STAR answer\" | head -5", "diagnostic output", "warn"],
 ["^cat runbook.md | head -20", "check output", "warn"],
 ["^echo \"prepared\" | head -5", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^echo \"STAR answer\" | head -5",l:"показать понимание"},
 {re:"^echo \"prepared\" | head -5",l:"продемонстрировать"}],{file:"project/-service-mesh-a.yaml",files:{"project/-service-mesh-a.yaml":`# Interview: Что такое service mesh Ambient\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-service-mesh-a.yaml":`# Interview: Что такое service mesh Ambient — fixed\nstatus: ok\n`}},{hints:["Симптом: Что такое service mesh Ambient в project/-service-mesh-a.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-service-mesh-a.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-service-mesh-a.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-28","Как работает rate limiting token bucket","Junior", `<h3>Контекст</h3><p>Interview: <b>Как работает rate limiting token bucket</b>. Работа с <code>project/-rate-limiting-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Как работает rate limiting token bucket</b>. Файл <code>project/-rate-limiting-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-rate-limiting-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-rate-limiting-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get middleware -n prod</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-rate-limiting-.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^kubectl get middleware -n prod | head -10", "diagnostic output", "warn"],
 ["^curl -s http://api/ | head -10", "check output", "warn"],
 ["^kubectl apply -f rate-limit.yaml", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^kubectl get middleware -n prod | head -10",l:"показать понимание"},
 {re:"^kubectl apply -f rate-limit.yaml",l:"продемонстрировать"}],{file:"project/-rate-limiting-.yaml",files:{"project/-rate-limiting-.yaml":`# Interview: Как работает rate limiting token bucket\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-rate-limiting-.yaml":`# Interview: Как работает rate limiting token bucket — fixed\nstatus: ok\n`}},{hints:["Симптом: Как работает rate limiting token bucket в project/-rate-limiting-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-rate-limiting-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-rate-limiting-.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-29","Чем отличается horizontal vs vertical sharding","Middle", `<h3>Контекст</h3><p>Interview: <b>Чем отличается horizontal vs vertical sharding</b>. Работа с <code>project/-horizontal-vs-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Чем отличается horizontal vs vertical sharding</b>. Файл <code>project/-horizontal-vs-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-horizontal-vs-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-horizontal-vs-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>echo \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-horizontal-vs-.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^echo \"STAR answer\" | head -5", "diagnostic output", "warn"],
 ["^cat runbook.md | head -20", "check output", "warn"],
 ["^echo \"prepared\" | head -5", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^echo \"STAR answer\" | head -5",l:"показать понимание"},
 {re:"^echo \"prepared\" | head -5",l:"продемонстрировать"}],{file:"project/-horizontal-vs-.yaml",files:{"project/-horizontal-vs-.yaml":`# Interview: Чем отличается horizontal vs vertical sharding\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-horizontal-vs-.yaml":`# Interview: Чем отличается horizontal vs vertical sharding — fixed\nstatus: ok\n`}},{hints:["Симптом: Чем отличается horizontal vs vertical sharding в project/-horizontal-vs-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-horizontal-vs-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-horizontal-vs-.yaml.","Порядок: показать понимание → продемонстрировать"]});

S("Interview","gc-interview-30","Как готовишь incident response runbook","Senior", `<h3>Контекст</h3><p>Interview: <b>Как готовишь incident response runbook</b>. Работа с <code>project/-incident-respo.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Как готовишь incident response runbook</b>. Файл <code>project/-incident-respo.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] показать понимание</li><li>[ ] продемонстрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-incident-respo.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-incident-respo.yaml</code>. Активный файл открыт в редакторе. Начните с <code>echo \\</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: показать понимание → продемонстрировать.</p><h3>Проверка</h3><pre>cat project/-incident-respo.yaml<br>проверить код</pre>`,
"dev@interview:~$",
[
 ["^echo \"STAR answer\" | head -5", "diagnostic output", "warn"],
 ["^cat runbook.md | head -20", "check output", "warn"],
 ["^echo \"prepared\" | head -5", "fixed/applied", "ok"],
 ["^echo \"Ответ подготовлен: 3 пункта\" | head -5", "verified", "ok"]
],
[{re:"^echo \"STAR answer\" | head -5",l:"показать понимание"},
 {re:"^echo \"prepared\" | head -5",l:"продемонстрировать"}],{file:"project/-incident-respo.yaml",files:{"project/-incident-respo.yaml":`# Interview: Как готовишь incident response runbook\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-incident-respo.yaml":`# Interview: Как готовишь incident response runbook — fixed\nstatus: ok\n`}},{hints:["Симптом: Как готовишь incident response runbook в project/-incident-respo.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-incident-respo.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-incident-respo.yaml.","Порядок: показать понимание → продемонстрировать"]});

