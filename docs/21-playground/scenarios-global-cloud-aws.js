/* Global Playground: AWS — 35 scenarios */
S("AWS","gc-aws-1","IAM: sts get-caller-identity не тот аккаунт","Junior", `<h3>Контекст</h3><p>AWS: <b>IAM: sts get-caller-identity не тот аккаунт</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>IAM: sts get-caller-identity не тот аккаунт</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws iam get-user --user-name a</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws iam get-user --user-name alice", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws iam get-user --user-name alice --output table", "config check output: missing or deny", "warn"],
 ["^aws iam put-user-policy --user-name alice --policy-name fix-1", "applied fix successfully", "ok"],
 ["^aws iam get-user --user-name alice --query State --output text", "ok verified", "ok"]
],
[{re:"^aws iam get-user --user-name alice",l:"диагностика"},
 {re:"^aws iam put-user-policy --user-name alice --policy-name fix-1",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: IAM: sts get-caller-identity не тот аккаунт\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: IAM: sts get-caller-identity не тот аккаунт — fixed\nstatus: ok\n`}},{hints:["Симптом: IAM: sts get-caller-identity не тот аккаунт в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-2","IAM: policy simulation explicit deny","Middle", `<h3>Контекст</h3><p>AWS: <b>IAM: policy simulation explicit deny</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>IAM: policy simulation explicit deny</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws iam get-user --user-name a</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws iam get-user --user-name alice", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws iam get-user --user-name alice --output table", "config check output: missing or deny", "warn"],
 ["^aws iam put-user-policy --user-name alice --policy-name fix-2", "applied fix successfully", "ok"],
 ["^aws iam get-user --user-name alice --query State --output text", "ok verified", "ok"]
],
[{re:"^aws iam get-user --user-name alice",l:"диагностика"},
 {re:"^aws iam put-user-policy --user-name alice --policy-name fix-2",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: IAM: policy simulation explicit deny\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: IAM: policy simulation explicit deny — fixed\nstatus: ok\n`}},{hints:["Симптом: IAM: policy simulation explicit deny в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-3","IAM: assume-role требует MFA","Senior", `<h3>Контекст</h3><p>AWS: <b>IAM: assume-role требует MFA</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>IAM: assume-role требует MFA</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws iam get-user --user-name a</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws iam get-user --user-name alice", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws iam get-user --user-name alice --output table", "config check output: missing or deny", "warn"],
 ["^aws iam put-user-policy --user-name alice --policy-name fix-3", "applied fix successfully", "ok"],
 ["^aws iam get-user --user-name alice --query State --output text", "ok verified", "ok"]
],
[{re:"^aws iam get-user --user-name alice",l:"диагностика"},
 {re:"^aws iam put-user-policy --user-name alice --policy-name fix-3",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: IAM: assume-role требует MFA\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: IAM: assume-role требует MFA — fixed\nstatus: ok\n`}},{hints:["Симптом: IAM: assume-role требует MFA в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-4","IAM: access key просрочен, ротация","Junior", `<h3>Контекст</h3><p>AWS: <b>IAM: access key просрочен, ротация</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>IAM: access key просрочен, ротация</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws iam get-user --user-name a</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws iam get-user --user-name alice", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws iam get-user --user-name alice --output table", "config check output: missing or deny", "warn"],
 ["^aws iam put-user-policy --user-name alice --policy-name fix-4", "applied fix successfully", "ok"],
 ["^aws iam get-user --user-name alice --query State --output text", "ok verified", "ok"]
],
[{re:"^aws iam get-user --user-name alice",l:"диагностика"},
 {re:"^aws iam put-user-policy --user-name alice --policy-name fix-4",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: IAM: access key просрочен, ротация\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: IAM: access key просрочен, ротация — fixed\nstatus: ok\n`}},{hints:["Симптом: IAM: access key просрочен, ротация в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-5","S3: bucket policy AccessDenied 403","Middle", `<h3>Контекст</h3><p>AWS: <b>S3: bucket policy AccessDenied 403</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>S3: bucket policy AccessDenied 403</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws s3api get-bucket-policy --</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws s3api get-bucket-policy --bucket my-bucket-5", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws s3api get-bucket-policy --bucket my-bucket-5 --output table", "config check output: missing or deny", "warn"],
 ["^aws s3api put-bucket-policy --bucket my-bucket-5 --policy file://policy.json", "applied fix successfully", "ok"],
 ["^aws s3api get-bucket-policy --bucket my-bucket-5 --query State --output text", "ok verified", "ok"]
],
[{re:"^aws s3api get-bucket-policy --bucket my-bucket-5",l:"диагностика"},
 {re:"^aws s3api put-bucket-policy --bucket my-bucket-5 --policy file://policy.json",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: S3: bucket policy AccessDenied 403\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: S3: bucket policy AccessDenied 403 — fixed\nstatus: ok\n`}},{hints:["Симптом: S3: bucket policy AccessDenied 403 в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-6","S3: versioning выключен, нет PITR","Senior", `<h3>Контекст</h3><p>AWS: <b>S3: versioning выключен, нет PITR</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>S3: versioning выключен, нет PITR</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws s3api get-bucket-policy --</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws s3api get-bucket-policy --bucket my-bucket-6", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws s3api get-bucket-policy --bucket my-bucket-6 --output table", "config check output: missing or deny", "warn"],
 ["^aws s3api put-bucket-policy --bucket my-bucket-6 --policy file://policy.json", "applied fix successfully", "ok"],
 ["^aws s3api get-bucket-policy --bucket my-bucket-6 --query State --output text", "ok verified", "ok"]
],
[{re:"^aws s3api get-bucket-policy --bucket my-bucket-6",l:"диагностика"},
 {re:"^aws s3api put-bucket-policy --bucket my-bucket-6 --policy file://policy.json",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: S3: versioning выключен, нет PITR\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: S3: versioning выключен, нет PITR — fixed\nstatus: ok\n`}},{hints:["Симптом: S3: versioning выключен, нет PITR в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-7","S3: SSE-KMS шифрование отсутствует","Junior", `<h3>Контекст</h3><p>AWS: <b>S3: SSE-KMS шифрование отсутствует</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>S3: SSE-KMS шифрование отсутствует</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws s3api get-bucket-policy --</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws s3api get-bucket-policy --bucket my-bucket-7", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws s3api get-bucket-policy --bucket my-bucket-7 --output table", "config check output: missing or deny", "warn"],
 ["^aws s3api put-bucket-policy --bucket my-bucket-7 --policy file://policy.json", "applied fix successfully", "ok"],
 ["^aws s3api get-bucket-policy --bucket my-bucket-7 --query State --output text", "ok verified", "ok"]
],
[{re:"^aws s3api get-bucket-policy --bucket my-bucket-7",l:"диагностика"},
 {re:"^aws s3api put-bucket-policy --bucket my-bucket-7 --policy file://policy.json",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: S3: SSE-KMS шифрование отсутствует\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: S3: SSE-KMS шифрование отсутствует — fixed\nstatus: ok\n`}},{hints:["Симптом: S3: SSE-KMS шифрование отсутствует в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-8","S3: lifecycle не удаляет старые объекты","Middle", `<h3>Контекст</h3><p>AWS: <b>S3: lifecycle не удаляет старые объекты</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>S3: lifecycle не удаляет старые объекты</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws s3api get-bucket-policy --</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws s3api get-bucket-policy --bucket my-bucket-8", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws s3api get-bucket-policy --bucket my-bucket-8 --output table", "config check output: missing or deny", "warn"],
 ["^aws s3api put-bucket-policy --bucket my-bucket-8 --policy file://policy.json", "applied fix successfully", "ok"],
 ["^aws s3api get-bucket-policy --bucket my-bucket-8 --query State --output text", "ok verified", "ok"]
],
[{re:"^aws s3api get-bucket-policy --bucket my-bucket-8",l:"диагностика"},
 {re:"^aws s3api put-bucket-policy --bucket my-bucket-8 --policy file://policy.json",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: S3: lifecycle не удаляет старые объекты\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: S3: lifecycle не удаляет старые объекты — fixed\nstatus: ok\n`}},{hints:["Симптом: S3: lifecycle не удаляет старые объекты в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-9","S3: presigned URL expired","Senior", `<h3>Контекст</h3><p>AWS: <b>S3: presigned URL expired</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>S3: presigned URL expired</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws s3api get-bucket-policy --</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws s3api get-bucket-policy --bucket my-bucket-9", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws s3api get-bucket-policy --bucket my-bucket-9 --output table", "config check output: missing or deny", "warn"],
 ["^aws s3api put-bucket-policy --bucket my-bucket-9 --policy file://policy.json", "applied fix successfully", "ok"],
 ["^aws s3api get-bucket-policy --bucket my-bucket-9 --query State --output text", "ok verified", "ok"]
],
[{re:"^aws s3api get-bucket-policy --bucket my-bucket-9",l:"диагностика"},
 {re:"^aws s3api put-bucket-policy --bucket my-bucket-9 --policy file://policy.json",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: S3: presigned URL expired\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: S3: presigned URL expired — fixed\nstatus: ok\n`}},{hints:["Симптом: S3: presigned URL expired в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-10","VPC: NAT GW нет интернета","Junior", `<h3>Контекст</h3><p>AWS: <b>VPC: NAT GW нет интернета</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>VPC: NAT GW нет интернета</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws ec2 describe-vpcs --vpc-id</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws ec2 describe-vpcs --vpc-ids vpc-0000000a", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws ec2 describe-vpcs --vpc-ids vpc-0000000a --output table", "config check output: missing or deny", "warn"],
 ["^aws ec2 create-route --route-table-id rtb-0000000a --destination-cidr-block 0.0.0.0/0 --gateway-id igw-0000000a", "applied fix successfully", "ok"],
 ["^aws ec2 describe-vpcs --vpc-ids vpc-0000000a --query State --output text", "ok verified", "ok"]
],
[{re:"^aws ec2 describe-vpcs --vpc-ids vpc-0000000a",l:"диагностика"},
 {re:"^aws ec2 create-route --route-table-id rtb-0000000a --destination-cidr-block 0.0.0.0/0 --gateway-id igw-0000000a",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: VPC: NAT GW нет интернета\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: VPC: NAT GW нет интернета — fixed\nstatus: ok\n`}},{hints:["Симптом: VPC: NAT GW нет интернета в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-11","VPC: route table без IGW","Middle", `<h3>Контекст</h3><p>AWS: <b>VPC: route table без IGW</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>VPC: route table без IGW</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws ec2 describe-vpcs --vpc-id</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws ec2 describe-vpcs --vpc-ids vpc-0000000b", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws ec2 describe-vpcs --vpc-ids vpc-0000000b --output table", "config check output: missing or deny", "warn"],
 ["^aws ec2 create-route --route-table-id rtb-0000000b --destination-cidr-block 0.0.0.0/0 --gateway-id igw-0000000b", "applied fix successfully", "ok"],
 ["^aws ec2 describe-vpcs --vpc-ids vpc-0000000b --query State --output text", "ok verified", "ok"]
],
[{re:"^aws ec2 describe-vpcs --vpc-ids vpc-0000000b",l:"диагностика"},
 {re:"^aws ec2 create-route --route-table-id rtb-0000000b --destination-cidr-block 0.0.0.0/0 --gateway-id igw-0000000b",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: VPC: route table без IGW\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: VPC: route table без IGW — fixed\nstatus: ok\n`}},{hints:["Симптом: VPC: route table без IGW в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-12","VPC: peering маршрут не прописан","Senior", `<h3>Контекст</h3><p>AWS: <b>VPC: peering маршрут не прописан</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>VPC: peering маршрут не прописан</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws ec2 describe-vpcs --vpc-id</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws ec2 describe-vpcs --vpc-ids vpc-0000000c", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws ec2 describe-vpcs --vpc-ids vpc-0000000c --output table", "config check output: missing or deny", "warn"],
 ["^aws ec2 create-route --route-table-id rtb-0000000c --destination-cidr-block 0.0.0.0/0 --gateway-id igw-0000000c", "applied fix successfully", "ok"],
 ["^aws ec2 describe-vpcs --vpc-ids vpc-0000000c --query State --output text", "ok verified", "ok"]
],
[{re:"^aws ec2 describe-vpcs --vpc-ids vpc-0000000c",l:"диагностика"},
 {re:"^aws ec2 create-route --route-table-id rtb-0000000c --destination-cidr-block 0.0.0.0/0 --gateway-id igw-0000000c",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: VPC: peering маршрут не прописан\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: VPC: peering маршрут не прописан — fixed\nstatus: ok\n`}},{hints:["Симптом: VPC: peering маршрут не прописан в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-13","EC2: target group health check unhealthy","Junior", `<h3>Контекст</h3><p>AWS: <b>EC2: target group health check unhealthy</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>EC2: target group health check unhealthy</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws ec2 describe-instances --i</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws ec2 describe-instances --instance-ids i-0000000000000000d", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws ec2 describe-instances --instance-ids i-0000000000000000d --output table", "config check output: missing or deny", "warn"],
 ["^aws ec2 attach-volume --volume-id vol-0000000d --instance-id i-0000000000000000d --device /dev/sdf", "applied fix successfully", "ok"],
 ["^aws ec2 describe-instances --instance-ids i-0000000000000000d --query State --output text", "ok verified", "ok"]
],
[{re:"^aws ec2 describe-instances --instance-ids i-0000000000000000d",l:"диагностика"},
 {re:"^aws ec2 attach-volume --volume-id vol-0000000d --instance-id i-0000000000000000d --device /dev/sdf",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: EC2: target group health check unhealthy\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: EC2: target group health check unhealthy — fixed\nstatus: ok\n`}},{hints:["Симптом: EC2: target group health check unhealthy в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-14","EC2: EBS volume не примонтирован","Middle", `<h3>Контекст</h3><p>AWS: <b>EC2: EBS volume не примонтирован</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>EC2: EBS volume не примонтирован</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws ec2 describe-instances --i</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws ec2 describe-instances --instance-ids i-0000000000000000e", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws ec2 describe-instances --instance-ids i-0000000000000000e --output table", "config check output: missing or deny", "warn"],
 ["^aws ec2 attach-volume --volume-id vol-0000000e --instance-id i-0000000000000000e --device /dev/sdf", "applied fix successfully", "ok"],
 ["^aws ec2 describe-instances --instance-ids i-0000000000000000e --query State --output text", "ok verified", "ok"]
],
[{re:"^aws ec2 describe-instances --instance-ids i-0000000000000000e",l:"диагностика"},
 {re:"^aws ec2 attach-volume --volume-id vol-0000000e --instance-id i-0000000000000000e --device /dev/sdf",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: EC2: EBS volume не примонтирован\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: EC2: EBS volume не примонтирован — fixed\nstatus: ok\n`}},{hints:["Симптом: EC2: EBS volume не примонтирован в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-15","EC2: user-data cloud-init не выполнился","Senior", `<h3>Контекст</h3><p>AWS: <b>EC2: user-data cloud-init не выполнился</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>EC2: user-data cloud-init не выполнился</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws ec2 describe-instances --i</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws ec2 describe-instances --instance-ids i-0000000000000000f", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws ec2 describe-instances --instance-ids i-0000000000000000f --output table", "config check output: missing or deny", "warn"],
 ["^aws ec2 attach-volume --volume-id vol-0000000f --instance-id i-0000000000000000f --device /dev/sdf", "applied fix successfully", "ok"],
 ["^aws ec2 describe-instances --instance-ids i-0000000000000000f --query State --output text", "ok verified", "ok"]
],
[{re:"^aws ec2 describe-instances --instance-ids i-0000000000000000f",l:"диагностика"},
 {re:"^aws ec2 attach-volume --volume-id vol-0000000f --instance-id i-0000000000000000f --device /dev/sdf",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: EC2: user-data cloud-init не выполнился\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: EC2: user-data cloud-init не выполнился — fixed\nstatus: ok\n`}},{hints:["Симптом: EC2: user-data cloud-init не выполнился в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-16","EKS: node group NotReady","Junior", `<h3>Контекст</h3><p>AWS: <b>EKS: node group NotReady</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>EKS: node group NotReady</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws eks describe-cluster --nam</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws eks describe-cluster --name prod", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws eks describe-cluster --name prod --output table", "config check output: missing or deny", "warn"],
 ["^eksctl utils associate-iam-oidc-provider --cluster prod --approve", "applied fix successfully", "ok"],
 ["^aws eks describe-cluster --name prod --query State --output text", "ok verified", "ok"]
],
[{re:"^aws eks describe-cluster --name prod",l:"диагностика"},
 {re:"^eksctl utils associate-iam-oidc-provider --cluster prod --approve",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: EKS: node group NotReady\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: EKS: node group NotReady — fixed\nstatus: ok\n`}},{hints:["Симптом: EKS: node group NotReady в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-17","EKS: IRSA аннотация service account отсутствует","Middle", `<h3>Контекст</h3><p>AWS: <b>EKS: IRSA аннотация service account отсутствует</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>EKS: IRSA аннотация service account отсутствует</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws eks describe-cluster --nam</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws eks describe-cluster --name prod", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws eks describe-cluster --name prod --output table", "config check output: missing or deny", "warn"],
 ["^eksctl utils associate-iam-oidc-provider --cluster prod --approve", "applied fix successfully", "ok"],
 ["^aws eks describe-cluster --name prod --query State --output text", "ok verified", "ok"]
],
[{re:"^aws eks describe-cluster --name prod",l:"диагностика"},
 {re:"^eksctl utils associate-iam-oidc-provider --cluster prod --approve",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: EKS: IRSA аннотация service account отсутствует\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: EKS: IRSA аннотация service account отсутствует — fixed\nstatus: ok\n`}},{hints:["Симптом: EKS: IRSA аннотация service account отсутствует в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-18","EKS: OIDC provider не создан","Senior", `<h3>Контекст</h3><p>AWS: <b>EKS: OIDC provider не создан</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>EKS: OIDC provider не создан</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws eks describe-cluster --nam</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws eks describe-cluster --name prod", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws eks describe-cluster --name prod --output table", "config check output: missing or deny", "warn"],
 ["^eksctl utils associate-iam-oidc-provider --cluster prod --approve", "applied fix successfully", "ok"],
 ["^aws eks describe-cluster --name prod --query State --output text", "ok verified", "ok"]
],
[{re:"^aws eks describe-cluster --name prod",l:"диагностика"},
 {re:"^eksctl utils associate-iam-oidc-provider --cluster prod --approve",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: EKS: OIDC provider не создан\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: EKS: OIDC provider не создан — fixed\nstatus: ok\n`}},{hints:["Симптом: EKS: OIDC provider не создан в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-19","SG: security group блокирует 443","Junior", `<h3>Контекст</h3><p>AWS: <b>SG: security group блокирует 443</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>SG: security group блокирует 443</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws ec2 describe-security-grou</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws ec2 describe-security-groups --group-ids sg-00000013", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws ec2 describe-security-groups --group-ids sg-00000013 --output table", "config check output: missing or deny", "warn"],
 ["^aws ec2 authorize-security-group-ingress --group-id sg-00000013 --protocol tcp --port 443 --cidr 0.0.0.0/0", "applied fix successfully", "ok"],
 ["^aws ec2 describe-security-groups --group-ids sg-00000013 --query State --output text", "ok verified", "ok"]
],
[{re:"^aws ec2 describe-security-groups --group-ids sg-00000013",l:"диагностика"},
 {re:"^aws ec2 authorize-security-group-ingress --group-id sg-00000013 --protocol tcp --port 443 --cidr 0.0.0.0/0",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: SG: security group блокирует 443\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: SG: security group блокирует 443 — fixed\nstatus: ok\n`}},{hints:["Симптом: SG: security group блокирует 443 в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-20","NACL: stateless deny ephemeral портов","Middle", `<h3>Контекст</h3><p>AWS: <b>NACL: stateless deny ephemeral портов</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>NACL: stateless deny ephemeral портов</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws ec2 describe-network-acls </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws ec2 describe-network-acls --network-acl-ids acl-00000014", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws ec2 describe-network-acls --network-acl-ids acl-00000014 --output table", "config check output: missing or deny", "warn"],
 ["^aws ec2 create-network-acl-entry --network-acl-id acl-00000014 --rule-number 100 --protocol tcp --port-range From=1024,To=65535 --egress --rule-action allow --cidr-block 0.0.0.0/0", "applied fix successfully", "ok"],
 ["^aws ec2 describe-network-acls --network-acl-ids acl-00000014 --query State --output text", "ok verified", "ok"]
],
[{re:"^aws ec2 describe-network-acls --network-acl-ids acl-00000014",l:"диагностика"},
 {re:"^aws ec2 create-network-acl-entry --network-acl-id acl-00000014 --rule-number 100 --protocol tcp --port-range From=1024,To=65535 --egress --rule-action allow --cidr-block 0.0.0.0/0",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: NACL: stateless deny ephemeral портов\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: NACL: stateless deny ephemeral портов — fixed\nstatus: ok\n`}},{hints:["Симптом: NACL: stateless deny ephemeral портов в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-21","NAT: single-AZ NAT падение без failover","Senior", `<h3>Контекст</h3><p>AWS: <b>NAT: single-AZ NAT падение без failover</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>NAT: single-AZ NAT падение без failover</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws ec2 describe-nat-gateways </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws ec2 describe-nat-gateways --nat-gateway-ids nat-00000015", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws ec2 describe-nat-gateways --nat-gateway-ids nat-00000015 --output table", "config check output: missing or deny", "warn"],
 ["^aws ec2 create-nat-gateway --subnet-id subnet-00000015 --allocation-id eipalloc-00000015", "applied fix successfully", "ok"],
 ["^aws ec2 describe-nat-gateways --nat-gateway-ids nat-00000015 --query State --output text", "ok verified", "ok"]
],
[{re:"^aws ec2 describe-nat-gateways --nat-gateway-ids nat-00000015",l:"диагностика"},
 {re:"^aws ec2 create-nat-gateway --subnet-id subnet-00000015 --allocation-id eipalloc-00000015",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: NAT: single-AZ NAT падение без failover\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: NAT: single-AZ NAT падение без failover — fixed\nstatus: ok\n`}},{hints:["Симптом: NAT: single-AZ NAT падение без failover в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-22","CloudWatch: log group retention не задан","Junior", `<h3>Контекст</h3><p>AWS: <b>CloudWatch: log group retention не задан</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>CloudWatch: log group retention не задан</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws cloudwatch describe-alarms</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws cloudwatch describe-alarms --alarm-names cpu-high", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws cloudwatch describe-alarms --alarm-names cpu-high --output table", "config check output: missing or deny", "warn"],
 ["^aws logs put-retention-policy --log-group-name /aws/eks/prod --retention-in-days 30", "applied fix successfully", "ok"],
 ["^aws cloudwatch describe-alarms --alarm-names cpu-high --query State --output text", "ok verified", "ok"]
],
[{re:"^aws cloudwatch describe-alarms --alarm-names cpu-high",l:"диагностика"},
 {re:"^aws logs put-retention-policy --log-group-name /aws/eks/prod --retention-in-days 30",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: CloudWatch: log group retention не задан\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: CloudWatch: log group retention не задан — fixed\nstatus: ok\n`}},{hints:["Симптом: CloudWatch: log group retention не задан в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-23","CloudWatch: alarm не срабатывает","Middle", `<h3>Контекст</h3><p>AWS: <b>CloudWatch: alarm не срабатывает</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>CloudWatch: alarm не срабатывает</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws cloudwatch describe-alarms</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws cloudwatch describe-alarms --alarm-names cpu-high", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws cloudwatch describe-alarms --alarm-names cpu-high --output table", "config check output: missing or deny", "warn"],
 ["^aws logs put-retention-policy --log-group-name /aws/eks/prod --retention-in-days 30", "applied fix successfully", "ok"],
 ["^aws cloudwatch describe-alarms --alarm-names cpu-high --query State --output text", "ok verified", "ok"]
],
[{re:"^aws cloudwatch describe-alarms --alarm-names cpu-high",l:"диагностика"},
 {re:"^aws logs put-retention-policy --log-group-name /aws/eks/prod --retention-in-days 30",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: CloudWatch: alarm не срабатывает\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: CloudWatch: alarm не срабатывает — fixed\nstatus: ok\n`}},{hints:["Симптом: CloudWatch: alarm не срабатывает в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-24","STS: AssumeRoleWithWebIdentity fails","Senior", `<h3>Контекст</h3><p>AWS: <b>STS: AssumeRoleWithWebIdentity fails</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>STS: AssumeRoleWithWebIdentity fails</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws sts get-caller-identity</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws sts get-caller-identity", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws sts get-caller-identity --output table", "config check output: missing or deny", "warn"],
 ["^aws iam update-assume-role-policy --role-name app --policy-document file://trust.json", "applied fix successfully", "ok"],
 ["^aws sts get-caller-identity --query State --output text", "ok verified", "ok"]
],
[{re:"^aws sts get-caller-identity",l:"диагностика"},
 {re:"^aws iam update-assume-role-policy --role-name app --policy-document file://trust.json",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: STS: AssumeRoleWithWebIdentity fails\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: STS: AssumeRoleWithWebIdentity fails — fixed\nstatus: ok\n`}},{hints:["Симптом: STS: AssumeRoleWithWebIdentity fails в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-25","IAM: permission boundary блокирует","Junior", `<h3>Контекст</h3><p>AWS: <b>IAM: permission boundary блокирует</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>IAM: permission boundary блокирует</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws iam get-user --user-name a</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws iam get-user --user-name alice", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws iam get-user --user-name alice --output table", "config check output: missing or deny", "warn"],
 ["^aws iam put-user-policy --user-name alice --policy-name fix-25", "applied fix successfully", "ok"],
 ["^aws iam get-user --user-name alice --query State --output text", "ok verified", "ok"]
],
[{re:"^aws iam get-user --user-name alice",l:"диагностика"},
 {re:"^aws iam put-user-policy --user-name alice --policy-name fix-25",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: IAM: permission boundary блокирует\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: IAM: permission boundary блокирует — fixed\nstatus: ok\n`}},{hints:["Симптом: IAM: permission boundary блокирует в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-26","S3: CRR репликация лаг","Middle", `<h3>Контекст</h3><p>AWS: <b>S3: CRR репликация лаг</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>S3: CRR репликация лаг</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws s3api get-bucket-policy --</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws s3api get-bucket-policy --bucket my-bucket-26", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws s3api get-bucket-policy --bucket my-bucket-26 --output table", "config check output: missing or deny", "warn"],
 ["^aws s3api put-bucket-policy --bucket my-bucket-26 --policy file://policy.json", "applied fix successfully", "ok"],
 ["^aws s3api get-bucket-policy --bucket my-bucket-26 --query State --output text", "ok verified", "ok"]
],
[{re:"^aws s3api get-bucket-policy --bucket my-bucket-26",l:"диагностика"},
 {re:"^aws s3api put-bucket-policy --bucket my-bucket-26 --policy file://policy.json",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: S3: CRR репликация лаг\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: S3: CRR репликация лаг — fixed\nstatus: ok\n`}},{hints:["Симптом: S3: CRR репликация лаг в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-27","VPC Endpoint: S3 gateway не роутит","Senior", `<h3>Контекст</h3><p>AWS: <b>VPC Endpoint: S3 gateway не роутит</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>VPC Endpoint: S3 gateway не роутит</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws sts get-caller-identity</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws sts get-caller-identity", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws sts get-caller-identity --output table", "config check output: missing or deny", "warn"],
 ["^aws s3api put-bucket-policy --bucket my-bucket-27 --policy file://policy.json", "applied fix successfully", "ok"],
 ["^aws sts get-caller-identity --query State --output text", "ok verified", "ok"]
],
[{re:"^aws sts get-caller-identity",l:"диагностика"},
 {re:"^aws s3api put-bucket-policy --bucket my-bucket-27 --policy file://policy.json",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: VPC Endpoint: S3 gateway не роутит\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: VPC Endpoint: S3 gateway не роутит — fixed\nstatus: ok\n`}},{hints:["Симптом: VPC Endpoint: S3 gateway не роутит в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-28","EC2: SSM Session Manager cannot connect","Junior", `<h3>Контекст</h3><p>AWS: <b>EC2: SSM Session Manager cannot connect</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>EC2: SSM Session Manager cannot connect</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws ec2 describe-instances --i</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws ec2 describe-instances --instance-ids i-0000000000000001c", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws ec2 describe-instances --instance-ids i-0000000000000001c --output table", "config check output: missing or deny", "warn"],
 ["^aws ec2 attach-volume --volume-id vol-0000001c --instance-id i-0000000000000001c --device /dev/sdf", "applied fix successfully", "ok"],
 ["^aws ec2 describe-instances --instance-ids i-0000000000000001c --query State --output text", "ok verified", "ok"]
],
[{re:"^aws ec2 describe-instances --instance-ids i-0000000000000001c",l:"диагностика"},
 {re:"^aws ec2 attach-volume --volume-id vol-0000001c --instance-id i-0000000000000001c --device /dev/sdf",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: EC2: SSM Session Manager cannot connect\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: EC2: SSM Session Manager cannot connect — fixed\nstatus: ok\n`}},{hints:["Симптом: EC2: SSM Session Manager cannot connect в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-29","EKS: vpc-cni аддон версия mismatch","Middle", `<h3>Контекст</h3><p>AWS: <b>EKS: vpc-cni аддон версия mismatch</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>EKS: vpc-cni аддон версия mismatch</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws eks describe-cluster --nam</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws eks describe-cluster --name prod", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws eks describe-cluster --name prod --output table", "config check output: missing or deny", "warn"],
 ["^eksctl utils associate-iam-oidc-provider --cluster prod --approve", "applied fix successfully", "ok"],
 ["^aws eks describe-cluster --name prod --query State --output text", "ok verified", "ok"]
],
[{re:"^aws eks describe-cluster --name prod",l:"диагностика"},
 {re:"^eksctl utils associate-iam-oidc-provider --cluster prod --approve",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: EKS: vpc-cni аддон версия mismatch\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: EKS: vpc-cni аддон версия mismatch — fixed\nstatus: ok\n`}},{hints:["Симптом: EKS: vpc-cni аддон версия mismatch в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-30","Cost Explorer: внезапный рост счета","Senior", `<h3>Контекст</h3><p>AWS: <b>Cost Explorer: внезапный рост счета</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Cost Explorer: внезапный рост счета</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws sts get-caller-identity</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws sts get-caller-identity", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws sts get-caller-identity --output table", "config check output: missing or deny", "warn"],
 ["^aws ce get-cost-and-usage --time-period Start=2026-08-01,End=2026-08-24 --granularity DAILY --metrics BlendedCost --filter file://filter.json", "applied fix successfully", "ok"],
 ["^aws sts get-caller-identity --query State --output text", "ok verified", "ok"]
],
[{re:"^aws sts get-caller-identity",l:"диагностика"},
 {re:"^aws ce get-cost-and-usage --time-period Start=2026-08-01,End=2026-08-24 --granularity DAILY --metrics BlendedCost --filter file://filter.json",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: Cost Explorer: внезапный рост счета\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: Cost Explorer: внезапный рост счета — fixed\nstatus: ok\n`}},{hints:["Симптом: Cost Explorer: внезапный рост счета в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-31","S3: MFA Delete не включен","Junior", `<h3>Контекст</h3><p>AWS: <b>S3: MFA Delete не включен</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>S3: MFA Delete не включен</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws s3api get-bucket-policy --</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws s3api get-bucket-policy --bucket my-bucket-31", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws s3api get-bucket-policy --bucket my-bucket-31 --output table", "config check output: missing or deny", "warn"],
 ["^aws s3api put-bucket-policy --bucket my-bucket-31 --policy file://policy.json", "applied fix successfully", "ok"],
 ["^aws s3api get-bucket-policy --bucket my-bucket-31 --query State --output text", "ok verified", "ok"]
],
[{re:"^aws s3api get-bucket-policy --bucket my-bucket-31",l:"диагностика"},
 {re:"^aws s3api put-bucket-policy --bucket my-bucket-31 --policy file://policy.json",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: S3: MFA Delete не включен\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: S3: MFA Delete не включен — fixed\nstatus: ok\n`}},{hints:["Симптом: S3: MFA Delete не включен в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-32","IAM: SCP denies s3:PutObject","Middle", `<h3>Контекст</h3><p>AWS: <b>IAM: SCP denies s3:PutObject</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>IAM: SCP denies s3:PutObject</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws iam get-user --user-name a</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws iam get-user --user-name alice", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws iam get-user --user-name alice --output table", "config check output: missing or deny", "warn"],
 ["^aws iam put-user-policy --user-name alice --policy-name fix-32", "applied fix successfully", "ok"],
 ["^aws iam get-user --user-name alice --query State --output text", "ok verified", "ok"]
],
[{re:"^aws iam get-user --user-name alice",l:"диагностика"},
 {re:"^aws iam put-user-policy --user-name alice --policy-name fix-32",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: IAM: SCP denies s3:PutObject\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: IAM: SCP denies s3:PutObject — fixed\nstatus: ok\n`}},{hints:["Симптом: IAM: SCP denies s3:PutObject в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-33","VPC: flow logs не включены","Senior", `<h3>Контекст</h3><p>AWS: <b>VPC: flow logs не включены</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>VPC: flow logs не включены</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws ec2 describe-vpcs --vpc-id</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws ec2 describe-vpcs --vpc-ids vpc-00000021", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws ec2 describe-vpcs --vpc-ids vpc-00000021 --output table", "config check output: missing or deny", "warn"],
 ["^aws ec2 create-route --route-table-id rtb-00000021 --destination-cidr-block 0.0.0.0/0 --gateway-id igw-00000021", "applied fix successfully", "ok"],
 ["^aws ec2 describe-vpcs --vpc-ids vpc-00000021 --query State --output text", "ok verified", "ok"]
],
[{re:"^aws ec2 describe-vpcs --vpc-ids vpc-00000021",l:"диагностика"},
 {re:"^aws ec2 create-route --route-table-id rtb-00000021 --destination-cidr-block 0.0.0.0/0 --gateway-id igw-00000021",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: VPC: flow logs не включены\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: VPC: flow logs не включены — fixed\nstatus: ok\n`}},{hints:["Симптом: VPC: flow logs не включены в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-34","EKS: CoreDNS CrashLoopBackOff","Junior", `<h3>Контекст</h3><p>AWS: <b>EKS: CoreDNS CrashLoopBackOff</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>EKS: CoreDNS CrashLoopBackOff</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws eks describe-cluster --nam</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws eks describe-cluster --name prod", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws eks describe-cluster --name prod --output table", "config check output: missing or deny", "warn"],
 ["^eksctl utils associate-iam-oidc-provider --cluster prod --approve", "applied fix successfully", "ok"],
 ["^aws eks describe-cluster --name prod --query State --output text", "ok verified", "ok"]
],
[{re:"^aws eks describe-cluster --name prod",l:"диагностика"},
 {re:"^eksctl utils associate-iam-oidc-provider --cluster prod --approve",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: EKS: CoreDNS CrashLoopBackOff\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: EKS: CoreDNS CrashLoopBackOff — fixed\nstatus: ok\n`}},{hints:["Симптом: EKS: CoreDNS CrashLoopBackOff в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("AWS","gc-aws-35","EC2: spot interruption handler отсутствует","Middle", `<h3>Контекст</h3><p>AWS: <b>EC2: spot interruption handler отсутствует</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>EC2: spot interruption handler отсутствует</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>aws ec2 describe-instances --i</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@aws:~$",
[
 ["^aws ec2 describe-instances --instance-ids i-00000000000000023", "An error occurred (AccessDenied) when calling operation: User not authorized", "err"],
 ["^aws ec2 describe-instances --instance-ids i-00000000000000023 --output table", "config check output: missing or deny", "warn"],
 ["^aws ec2 attach-volume --volume-id vol-00000023 --instance-id i-00000000000000023 --device /dev/sdf", "applied fix successfully", "ok"],
 ["^aws ec2 describe-instances --instance-ids i-00000000000000023 --query State --output text", "ok verified", "ok"]
],
[{re:"^aws ec2 describe-instances --instance-ids i-00000000000000023",l:"диагностика"},
 {re:"^aws ec2 attach-volume --volume-id vol-00000023 --instance-id i-00000000000000023 --device /dev/sdf",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# AWS: EC2: spot interruption handler отсутствует\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# AWS: EC2: spot interruption handler отсутствует — fixed\nstatus: ok\n`}},{hints:["Симптом: EC2: spot interruption handler отсутствует в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

