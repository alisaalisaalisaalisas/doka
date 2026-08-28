/* Global Playground: GCP — 35 scenarios */
S("GCP","gc-gcp-1","IAM: service account impersonation 403","Junior", `<h3>Контекст</h3><p>GCP: <b>IAM: service account impersonation 403</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>IAM: service account impersonation 403</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud iam service-accounts ge</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud iam service-accounts add-iam-policy-binding sa@proj.iam.gserviceaccount.com --member=user:alice@corp.io --role=roles/iam.workloadIdentityUser", "Updated successfully", "ok"],
 ["^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com --format value(state)", "READY", "ok"]
],
[{re:"^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com",l:"диагностика"},
 {re:"^gcloud iam service-accounts add-iam-policy-binding sa@proj.iam.gserviceaccount.com --member=user:alice@corp.io --role=roles/iam.workloadIdentityUser",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: IAM: service account impersonation 403\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: IAM: service account impersonation 403 — fixed\nstatus: ok\n`}},{hints:["Симптом: IAM: service account impersonation 403 в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-2","IAM: Workload Identity не связан","Middle", `<h3>Контекст</h3><p>GCP: <b>IAM: Workload Identity не связан</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>IAM: Workload Identity не связан</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud iam service-accounts ge</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud iam service-accounts add-iam-policy-binding sa@proj.iam.gserviceaccount.com --member=user:alice@corp.io --role=roles/iam.workloadIdentityUser", "Updated successfully", "ok"],
 ["^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com --format value(state)", "READY", "ok"]
],
[{re:"^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com",l:"диагностика"},
 {re:"^gcloud iam service-accounts add-iam-policy-binding sa@proj.iam.gserviceaccount.com --member=user:alice@corp.io --role=roles/iam.workloadIdentityUser",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: IAM: Workload Identity не связан\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: IAM: Workload Identity не связан — fixed\nstatus: ok\n`}},{hints:["Симптом: IAM: Workload Identity не связан в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-3","VPC firewall: правило блокирует 22","Senior", `<h3>Контекст</h3><p>GCP: <b>VPC firewall: правило блокирует 22</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>VPC firewall: правило блокирует 22</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud compute firewall-rules </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud compute firewall-rules list --filter name=allow-ssh", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud compute firewall-rules list --filter name=allow-ssh --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud compute firewall-rules update allow-ssh --allow tcp:22 --source-ranges 0.0.0.0/0", "Updated successfully", "ok"],
 ["^gcloud compute firewall-rules list --filter name=allow-ssh --format value(state)", "READY", "ok"]
],
[{re:"^gcloud compute firewall-rules list --filter name=allow-ssh",l:"диагностика"},
 {re:"^gcloud compute firewall-rules update allow-ssh --allow tcp:22 --source-ranges 0.0.0.0/0",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: VPC firewall: правило блокирует 22\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: VPC firewall: правило блокирует 22 — fixed\nstatus: ok\n`}},{hints:["Симптом: VPC firewall: правило блокирует 22 в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-4","VPC: subnet не в регионе GKE","Junior", `<h3>Контекст</h3><p>GCP: <b>VPC: subnet не в регионе GKE</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>VPC: subnet не в регионе GKE</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud compute firewall-rules </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud compute firewall-rules list --filter name=allow-ssh", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud compute firewall-rules list --filter name=allow-ssh --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud compute firewall-rules update allow-ssh --allow tcp:22 --source-ranges 0.0.0.0/0", "Updated successfully", "ok"],
 ["^gcloud compute firewall-rules list --filter name=allow-ssh --format value(state)", "READY", "ok"]
],
[{re:"^gcloud compute firewall-rules list --filter name=allow-ssh",l:"диагностика"},
 {re:"^gcloud compute firewall-rules update allow-ssh --allow tcp:22 --source-ranges 0.0.0.0/0",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: VPC: subnet не в регионе GKE\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: VPC: subnet не в регионе GKE — fixed\nstatus: ok\n`}},{hints:["Симптом: VPC: subnet не в регионе GKE в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-5","GKE: node pool NotReady","Middle", `<h3>Контекст</h3><p>GCP: <b>GKE: node pool NotReady</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>GKE: node pool NotReady</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud container clusters desc</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud container clusters describe prod-2 --zone europe-west1-b", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud container clusters describe prod-2 --zone europe-west1-b --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud container clusters update prod --workload-pool=proj.svc.id.goog --zone europe-west1-b", "Updated successfully", "ok"],
 ["^gcloud container clusters describe prod-2 --zone europe-west1-b --format value(state)", "READY", "ok"]
],
[{re:"^gcloud container clusters describe prod-2 --zone europe-west1-b",l:"диагностика"},
 {re:"^gcloud container clusters update prod --workload-pool=proj.svc.id.goog --zone europe-west1-b",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: GKE: node pool NotReady\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: GKE: node pool NotReady — fixed\nstatus: ok\n`}},{hints:["Симптом: GKE: node pool NotReady в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-6","GKE: Workload Identity аннотация отсутствует","Senior", `<h3>Контекст</h3><p>GCP: <b>GKE: Workload Identity аннотация отсутствует</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>GKE: Workload Identity аннотация отсутствует</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud container clusters desc</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud container clusters describe prod-0 --zone europe-west1-b", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud container clusters describe prod-0 --zone europe-west1-b --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud container clusters update prod --workload-pool=proj.svc.id.goog --zone europe-west1-b", "Updated successfully", "ok"],
 ["^gcloud container clusters describe prod-0 --zone europe-west1-b --format value(state)", "READY", "ok"]
],
[{re:"^gcloud container clusters describe prod-0 --zone europe-west1-b",l:"диагностика"},
 {re:"^gcloud container clusters update prod --workload-pool=proj.svc.id.goog --zone europe-west1-b",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: GKE: Workload Identity аннотация отсутствует\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: GKE: Workload Identity аннотация отсутствует — fixed\nstatus: ok\n`}},{hints:["Симптом: GKE: Workload Identity аннотация отсутствует в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-7","GCS: bucket IAM не uniform","Junior", `<h3>Контекст</h3><p>GCP: <b>GCS: bucket IAM не uniform</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>GCS: bucket IAM не uniform</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud iam service-accounts ge</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud iam service-accounts add-iam-policy-binding sa@proj.iam.gserviceaccount.com --member=user:alice@corp.io --role=roles/iam.workloadIdentityUser", "Updated successfully", "ok"],
 ["^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com --format value(state)", "READY", "ok"]
],
[{re:"^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com",l:"диагностика"},
 {re:"^gcloud iam service-accounts add-iam-policy-binding sa@proj.iam.gserviceaccount.com --member=user:alice@corp.io --role=roles/iam.workloadIdentityUser",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: GCS: bucket IAM не uniform\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: GCS: bucket IAM не uniform — fixed\nstatus: ok\n`}},{hints:["Симптом: GCS: bucket IAM не uniform в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-8","GCS: lifecycle не удаляет","Middle", `<h3>Контекст</h3><p>GCP: <b>GCS: lifecycle не удаляет</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>GCS: lifecycle не удаляет</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud storage ls gs://my-buck</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud storage ls gs://my-bucket-8", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud storage ls gs://my-bucket-8 --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud storage buckets update gs://my-bucket-8 --uniform-bucket-level-access", "Updated successfully", "ok"],
 ["^gcloud storage ls gs://my-bucket-8 --format value(state)", "READY", "ok"]
],
[{re:"^gcloud storage ls gs://my-bucket-8",l:"диагностика"},
 {re:"^gcloud storage buckets update gs://my-bucket-8 --uniform-bucket-level-access",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: GCS: lifecycle не удаляет\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: GCS: lifecycle не удаляет — fixed\nstatus: ok\n`}},{hints:["Симптом: GCS: lifecycle не удаляет в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-9","Logging: sink не экспортирует в BigQuery","Senior", `<h3>Контекст</h3><p>GCP: <b>Logging: sink не экспортирует в BigQuery</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Logging: sink не экспортирует в BigQuery</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud logging sinks describe </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud logging sinks describe my-sink-9", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud logging sinks describe my-sink-9 --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud logging sinks update my-sink-9 --log-filter='severity>=ERROR'", "Updated successfully", "ok"],
 ["^gcloud logging sinks describe my-sink-9 --format value(state)", "READY", "ok"]
],
[{re:"^gcloud logging sinks describe my-sink-9",l:"диагностика"},
 {re:"^gcloud logging sinks update my-sink-9 --log-filter='severity>=ERROR'",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: Logging: sink не экспортирует в BigQuery\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: Logging: sink не экспортирует в BigQuery — fixed\nstatus: ok\n`}},{hints:["Симптом: Logging: sink не экспортирует в BigQuery в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-10","Cloud NAT: не настроен, нет egress","Junior", `<h3>Контекст</h3><p>GCP: <b>Cloud NAT: не настроен, нет egress</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Cloud NAT: не настроен, нет egress</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud compute routers describ</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud compute routers describe nat-router --region europe-west1", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud compute routers describe nat-router --region europe-west1 --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud compute routers nats create nat-config --router nat-router --region europe-west1 --nat-all-subnet-ip-ranges --auto-allocate-nat-external-ips", "Updated successfully", "ok"],
 ["^gcloud compute routers describe nat-router --region europe-west1 --format value(state)", "READY", "ok"]
],
[{re:"^gcloud compute routers describe nat-router --region europe-west1",l:"диагностика"},
 {re:"^gcloud compute routers nats create nat-config --router nat-router --region europe-west1 --nat-all-subnet-ip-ranges --auto-allocate-nat-external-ips",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: Cloud NAT: не настроен, нет egress\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: Cloud NAT: не настроен, нет egress — fixed\nstatus: ok\n`}},{hints:["Симптом: Cloud NAT: не настроен, нет egress в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-11","VPC peering: маршрут отсутствует","Middle", `<h3>Контекст</h3><p>GCP: <b>VPC peering: маршрут отсутствует</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>VPC peering: маршрут отсутствует</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud compute firewall-rules </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud compute firewall-rules list --filter name=allow-ssh", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud compute firewall-rules list --filter name=allow-ssh --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud compute firewall-rules update allow-ssh --allow tcp:22 --source-ranges 0.0.0.0/0", "Updated successfully", "ok"],
 ["^gcloud compute firewall-rules list --filter name=allow-ssh --format value(state)", "READY", "ok"]
],
[{re:"^gcloud compute firewall-rules list --filter name=allow-ssh",l:"диагностика"},
 {re:"^gcloud compute firewall-rules update allow-ssh --allow tcp:22 --source-ranges 0.0.0.0/0",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: VPC peering: маршрут отсутствует\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: VPC peering: маршрут отсутствует — fixed\nstatus: ok\n`}},{hints:["Симптом: VPC peering: маршрут отсутствует в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-12","GKE: autopilot лимиты CPU","Senior", `<h3>Контекст</h3><p>GCP: <b>GKE: autopilot лимиты CPU</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>GKE: autopilot лимиты CPU</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud container clusters desc</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud container clusters describe prod-0 --zone europe-west1-b", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud container clusters describe prod-0 --zone europe-west1-b --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud container clusters update prod --workload-pool=proj.svc.id.goog --zone europe-west1-b", "Updated successfully", "ok"],
 ["^gcloud container clusters describe prod-0 --zone europe-west1-b --format value(state)", "READY", "ok"]
],
[{re:"^gcloud container clusters describe prod-0 --zone europe-west1-b",l:"диагностика"},
 {re:"^gcloud container clusters update prod --workload-pool=proj.svc.id.goog --zone europe-west1-b",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: GKE: autopilot лимиты CPU\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: GKE: autopilot лимиты CPU — fixed\nstatus: ok\n`}},{hints:["Симптом: GKE: autopilot лимиты CPU в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-13","GKE: PDB блокирует upgrade","Junior", `<h3>Контекст</h3><p>GCP: <b>GKE: PDB блокирует upgrade</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>GKE: PDB блокирует upgrade</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud container clusters desc</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud container clusters describe prod-1 --zone europe-west1-b", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud container clusters describe prod-1 --zone europe-west1-b --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud container clusters update prod --workload-pool=proj.svc.id.goog --zone europe-west1-b", "Updated successfully", "ok"],
 ["^gcloud container clusters describe prod-1 --zone europe-west1-b --format value(state)", "READY", "ok"]
],
[{re:"^gcloud container clusters describe prod-1 --zone europe-west1-b",l:"диагностика"},
 {re:"^gcloud container clusters update prod --workload-pool=proj.svc.id.goog --zone europe-west1-b",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: GKE: PDB блокирует upgrade\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: GKE: PDB блокирует upgrade — fixed\nstatus: ok\n`}},{hints:["Симптом: GKE: PDB блокирует upgrade в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-14","GCS: retention policy блокирует удаление","Middle", `<h3>Контекст</h3><p>GCP: <b>GCS: retention policy блокирует удаление</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>GCS: retention policy блокирует удаление</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud storage ls gs://my-buck</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud storage ls gs://my-bucket-14", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud storage ls gs://my-bucket-14 --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud storage buckets update gs://my-bucket-14 --uniform-bucket-level-access", "Updated successfully", "ok"],
 ["^gcloud storage ls gs://my-bucket-14 --format value(state)", "READY", "ok"]
],
[{re:"^gcloud storage ls gs://my-bucket-14",l:"диагностика"},
 {re:"^gcloud storage buckets update gs://my-bucket-14 --uniform-bucket-level-access",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: GCS: retention policy блокирует удаление\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: GCS: retention policy блокирует удаление — fixed\nstatus: ok\n`}},{hints:["Симптом: GCS: retention policy блокирует удаление в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-15","IAM: custom role без storage.objects.get","Senior", `<h3>Контекст</h3><p>GCP: <b>IAM: custom role без storage.objects.get</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>IAM: custom role без storage.objects.get</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud iam service-accounts ge</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud iam service-accounts add-iam-policy-binding sa@proj.iam.gserviceaccount.com --member=user:alice@corp.io --role=roles/iam.workloadIdentityUser", "Updated successfully", "ok"],
 ["^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com --format value(state)", "READY", "ok"]
],
[{re:"^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com",l:"диагностика"},
 {re:"^gcloud iam service-accounts add-iam-policy-binding sa@proj.iam.gserviceaccount.com --member=user:alice@corp.io --role=roles/iam.workloadIdentityUser",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: IAM: custom role без storage.objects.get\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: IAM: custom role без storage.objects.get — fixed\nstatus: ok\n`}},{hints:["Симптом: IAM: custom role без storage.objects.get в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-16","VPC: Shared VPC host проект","Junior", `<h3>Контекст</h3><p>GCP: <b>VPC: Shared VPC host проект</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>VPC: Shared VPC host проект</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud compute firewall-rules </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud compute firewall-rules list --filter name=allow-ssh", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud compute firewall-rules list --filter name=allow-ssh --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud compute firewall-rules update allow-ssh --allow tcp:22 --source-ranges 0.0.0.0/0", "Updated successfully", "ok"],
 ["^gcloud compute firewall-rules list --filter name=allow-ssh --format value(state)", "READY", "ok"]
],
[{re:"^gcloud compute firewall-rules list --filter name=allow-ssh",l:"диагностика"},
 {re:"^gcloud compute firewall-rules update allow-ssh --allow tcp:22 --source-ranges 0.0.0.0/0",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: VPC: Shared VPC host проект\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: VPC: Shared VPC host проект — fixed\nstatus: ok\n`}},{hints:["Симптом: VPC: Shared VPC host проект в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-17","GKE: workload identity federation","Middle", `<h3>Контекст</h3><p>GCP: <b>GKE: workload identity federation</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>GKE: workload identity federation</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud container clusters desc</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud container clusters describe prod-2 --zone europe-west1-b", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud container clusters describe prod-2 --zone europe-west1-b --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud container clusters update prod --workload-pool=proj.svc.id.goog --zone europe-west1-b", "Updated successfully", "ok"],
 ["^gcloud container clusters describe prod-2 --zone europe-west1-b --format value(state)", "READY", "ok"]
],
[{re:"^gcloud container clusters describe prod-2 --zone europe-west1-b",l:"диагностика"},
 {re:"^gcloud container clusters update prod --workload-pool=proj.svc.id.goog --zone europe-west1-b",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: GKE: workload identity federation\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: GKE: workload identity federation — fixed\nstatus: ok\n`}},{hints:["Симптом: GKE: workload identity federation в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-18","Monitoring: alert не срабатывает","Senior", `<h3>Контекст</h3><p>GCP: <b>Monitoring: alert не срабатывает</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Monitoring: alert не срабатывает</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud monitoring channels lis</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud monitoring channels list", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud monitoring channels list --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud monitoring channels create --display-name oncall --type email --channel-labels email_address=oncall@corp.io", "Updated successfully", "ok"],
 ["^gcloud monitoring channels list --format value(state)", "READY", "ok"]
],
[{re:"^gcloud monitoring channels list",l:"диагностика"},
 {re:"^gcloud monitoring channels create --display-name oncall --type email --channel-labels email_address=oncall@corp.io",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: Monitoring: alert не срабатывает\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: Monitoring: alert не срабатывает — fixed\nstatus: ok\n`}},{hints:["Симптом: Monitoring: alert не срабатывает в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-19","GCE: instance template не обновляется","Junior", `<h3>Контекст</h3><p>GCP: <b>GCE: instance template не обновляется</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>GCE: instance template не обновляется</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud compute instances descr</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud compute instances describe my-vm-19 --zone europe-west1-b", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud compute instances describe my-vm-19 --zone europe-west1-b --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud compute instances describe my-vm-19 --zone europe-west1-b --fix-19", "Updated successfully", "ok"],
 ["^gcloud compute instances describe my-vm-19 --zone europe-west1-b --format value(state)", "READY", "ok"]
],
[{re:"^gcloud compute instances describe my-vm-19 --zone europe-west1-b",l:"диагностика"},
 {re:"^gcloud compute instances describe my-vm-19 --zone europe-west1-b --fix-19",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: GCE: instance template не обновляется\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: GCE: instance template не обновляется — fixed\nstatus: ok\n`}},{hints:["Симптом: GCE: instance template не обновляется в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-20","IAM: org policy constraints/compute.requireOsLogin","Middle", `<h3>Контекст</h3><p>GCP: <b>IAM: org policy constraints/compute.requireOsLogin</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>IAM: org policy constraints/compute.requireOsLogin</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud iam service-accounts ge</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud iam service-accounts add-iam-policy-binding sa@proj.iam.gserviceaccount.com --member=user:alice@corp.io --role=roles/iam.workloadIdentityUser", "Updated successfully", "ok"],
 ["^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com --format value(state)", "READY", "ok"]
],
[{re:"^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com",l:"диагностика"},
 {re:"^gcloud iam service-accounts add-iam-policy-binding sa@proj.iam.gserviceaccount.com --member=user:alice@corp.io --role=roles/iam.workloadIdentityUser",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: IAM: org policy constraints/compute.requireOsLogin\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: IAM: org policy constraints/compute.requireOsLogin — fixed\nstatus: ok\n`}},{hints:["Симптом: IAM: org policy constraints/compute.requireOsLogin в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-21","GCS: versioning vs soft delete","Senior", `<h3>Контекст</h3><p>GCP: <b>GCS: versioning vs soft delete</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>GCS: versioning vs soft delete</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud storage ls gs://my-buck</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud storage ls gs://my-bucket-21", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud storage ls gs://my-bucket-21 --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud storage buckets update gs://my-bucket-21 --uniform-bucket-level-access", "Updated successfully", "ok"],
 ["^gcloud storage ls gs://my-bucket-21 --format value(state)", "READY", "ok"]
],
[{re:"^gcloud storage ls gs://my-bucket-21",l:"диагностика"},
 {re:"^gcloud storage buckets update gs://my-bucket-21 --uniform-bucket-level-access",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: GCS: versioning vs soft delete\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: GCS: versioning vs soft delete — fixed\nstatus: ok\n`}},{hints:["Симптом: GCS: versioning vs soft delete в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-22","VPC: firewall priority 1000 deny","Junior", `<h3>Контекст</h3><p>GCP: <b>VPC: firewall priority 1000 deny</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>VPC: firewall priority 1000 deny</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud compute firewall-rules </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud compute firewall-rules list --filter name=allow-ssh", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud compute firewall-rules list --filter name=allow-ssh --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud compute firewall-rules update allow-ssh --allow tcp:22 --source-ranges 0.0.0.0/0", "Updated successfully", "ok"],
 ["^gcloud compute firewall-rules list --filter name=allow-ssh --format value(state)", "READY", "ok"]
],
[{re:"^gcloud compute firewall-rules list --filter name=allow-ssh",l:"диагностика"},
 {re:"^gcloud compute firewall-rules update allow-ssh --allow tcp:22 --source-ranges 0.0.0.0/0",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: VPC: firewall priority 1000 deny\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: VPC: firewall priority 1000 deny — fixed\nstatus: ok\n`}},{hints:["Симптом: VPC: firewall priority 1000 deny в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-23","GKE: node auto-upgrade disabled","Middle", `<h3>Контекст</h3><p>GCP: <b>GKE: node auto-upgrade disabled</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>GKE: node auto-upgrade disabled</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud container clusters desc</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud container clusters describe prod-2 --zone europe-west1-b", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud container clusters describe prod-2 --zone europe-west1-b --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud container clusters update prod --workload-pool=proj.svc.id.goog --zone europe-west1-b", "Updated successfully", "ok"],
 ["^gcloud container clusters describe prod-2 --zone europe-west1-b --format value(state)", "READY", "ok"]
],
[{re:"^gcloud container clusters describe prod-2 --zone europe-west1-b",l:"диагностика"},
 {re:"^gcloud container clusters update prod --workload-pool=proj.svc.id.goog --zone europe-west1-b",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: GKE: node auto-upgrade disabled\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: GKE: node auto-upgrade disabled — fixed\nstatus: ok\n`}},{hints:["Симптом: GKE: node auto-upgrade disabled в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-24","Logging: exclusion filter скрывает ошибки","Senior", `<h3>Контекст</h3><p>GCP: <b>Logging: exclusion filter скрывает ошибки</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Logging: exclusion filter скрывает ошибки</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud logging sinks describe </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud logging sinks describe my-sink-24", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud logging sinks describe my-sink-24 --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud logging sinks update my-sink-24 --log-filter='severity>=ERROR'", "Updated successfully", "ok"],
 ["^gcloud logging sinks describe my-sink-24 --format value(state)", "READY", "ok"]
],
[{re:"^gcloud logging sinks describe my-sink-24",l:"диагностика"},
 {re:"^gcloud logging sinks update my-sink-24 --log-filter='severity>=ERROR'",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: Logging: exclusion filter скрывает ошибки\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: Logging: exclusion filter скрывает ошибки — fixed\nstatus: ok\n`}},{hints:["Симптом: Logging: exclusion filter скрывает ошибки в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-25","IAM: service account key expired","Junior", `<h3>Контекст</h3><p>GCP: <b>IAM: service account key expired</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>IAM: service account key expired</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud iam service-accounts ge</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud iam service-accounts add-iam-policy-binding sa@proj.iam.gserviceaccount.com --member=user:alice@corp.io --role=roles/iam.workloadIdentityUser", "Updated successfully", "ok"],
 ["^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com --format value(state)", "READY", "ok"]
],
[{re:"^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com",l:"диагностика"},
 {re:"^gcloud iam service-accounts add-iam-policy-binding sa@proj.iam.gserviceaccount.com --member=user:alice@corp.io --role=roles/iam.workloadIdentityUser",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: IAM: service account key expired\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: IAM: service account key expired — fixed\nstatus: ok\n`}},{hints:["Симптом: IAM: service account key expired в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-26","GCS: CORS не настроен","Middle", `<h3>Контекст</h3><p>GCP: <b>GCS: CORS не настроен</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>GCS: CORS не настроен</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud storage ls gs://my-buck</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud storage ls gs://my-bucket-26", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud storage ls gs://my-bucket-26 --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud storage buckets update gs://my-bucket-26 --uniform-bucket-level-access", "Updated successfully", "ok"],
 ["^gcloud storage ls gs://my-bucket-26 --format value(state)", "READY", "ok"]
],
[{re:"^gcloud storage ls gs://my-bucket-26",l:"диагностика"},
 {re:"^gcloud storage buckets update gs://my-bucket-26 --uniform-bucket-level-access",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: GCS: CORS не настроен\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: GCS: CORS не настроен — fixed\nstatus: ok\n`}},{hints:["Симптом: GCS: CORS не настроен в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-27","VPC: Private Google Access выключен","Senior", `<h3>Контекст</h3><p>GCP: <b>VPC: Private Google Access выключен</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>VPC: Private Google Access выключен</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud compute firewall-rules </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud compute firewall-rules list --filter name=allow-ssh", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud compute firewall-rules list --filter name=allow-ssh --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud compute firewall-rules update allow-ssh --allow tcp:22 --source-ranges 0.0.0.0/0", "Updated successfully", "ok"],
 ["^gcloud compute firewall-rules list --filter name=allow-ssh --format value(state)", "READY", "ok"]
],
[{re:"^gcloud compute firewall-rules list --filter name=allow-ssh",l:"диагностика"},
 {re:"^gcloud compute firewall-rules update allow-ssh --allow tcp:22 --source-ranges 0.0.0.0/0",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: VPC: Private Google Access выключен\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: VPC: Private Google Access выключен — fixed\nstatus: ok\n`}},{hints:["Симптом: VPC: Private Google Access выключен в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-28","GKE: binary authorization блокирует образ","Junior", `<h3>Контекст</h3><p>GCP: <b>GKE: binary authorization блокирует образ</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>GKE: binary authorization блокирует образ</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud container clusters desc</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud container clusters describe prod-1 --zone europe-west1-b", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud container clusters describe prod-1 --zone europe-west1-b --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud container clusters update prod --workload-pool=proj.svc.id.goog --zone europe-west1-b", "Updated successfully", "ok"],
 ["^gcloud container clusters describe prod-1 --zone europe-west1-b --format value(state)", "READY", "ok"]
],
[{re:"^gcloud container clusters describe prod-1 --zone europe-west1-b",l:"диагностика"},
 {re:"^gcloud container clusters update prod --workload-pool=proj.svc.id.goog --zone europe-west1-b",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: GKE: binary authorization блокирует образ\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: GKE: binary authorization блокирует образ — fixed\nstatus: ok\n`}},{hints:["Симптом: GKE: binary authorization блокирует образ в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-29","Monitoring: uptime check 500","Middle", `<h3>Контекст</h3><p>GCP: <b>Monitoring: uptime check 500</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Monitoring: uptime check 500</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud monitoring channels lis</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud monitoring channels list", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud monitoring channels list --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud monitoring channels create --display-name oncall --type email --channel-labels email_address=oncall@corp.io", "Updated successfully", "ok"],
 ["^gcloud monitoring channels list --format value(state)", "READY", "ok"]
],
[{re:"^gcloud monitoring channels list",l:"диагностика"},
 {re:"^gcloud monitoring channels create --display-name oncall --type email --channel-labels email_address=oncall@corp.io",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: Monitoring: uptime check 500\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: Monitoring: uptime check 500 — fixed\nstatus: ok\n`}},{hints:["Симптом: Monitoring: uptime check 500 в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-30","GCS: CMEK ключ недоступен","Senior", `<h3>Контекст</h3><p>GCP: <b>GCS: CMEK ключ недоступен</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>GCS: CMEK ключ недоступен</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud storage ls gs://my-buck</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud storage ls gs://my-bucket-30", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud storage ls gs://my-bucket-30 --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud storage buckets update gs://my-bucket-30 --uniform-bucket-level-access", "Updated successfully", "ok"],
 ["^gcloud storage ls gs://my-bucket-30 --format value(state)", "READY", "ok"]
],
[{re:"^gcloud storage ls gs://my-bucket-30",l:"диагностика"},
 {re:"^gcloud storage buckets update gs://my-bucket-30 --uniform-bucket-level-access",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: GCS: CMEK ключ недоступен\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: GCS: CMEK ключ недоступен — fixed\nstatus: ok\n`}},{hints:["Симптом: GCS: CMEK ключ недоступен в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-31","IAM: impersonation chain too long","Junior", `<h3>Контекст</h3><p>GCP: <b>IAM: impersonation chain too long</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>IAM: impersonation chain too long</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud iam service-accounts ge</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud iam service-accounts add-iam-policy-binding sa@proj.iam.gserviceaccount.com --member=user:alice@corp.io --role=roles/iam.workloadIdentityUser", "Updated successfully", "ok"],
 ["^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com --format value(state)", "READY", "ok"]
],
[{re:"^gcloud iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com",l:"диагностика"},
 {re:"^gcloud iam service-accounts add-iam-policy-binding sa@proj.iam.gserviceaccount.com --member=user:alice@corp.io --role=roles/iam.workloadIdentityUser",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: IAM: impersonation chain too long\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: IAM: impersonation chain too long — fixed\nstatus: ok\n`}},{hints:["Симптом: IAM: impersonation chain too long в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-32","VPC: Cloud DNS не резолвит","Middle", `<h3>Контекст</h3><p>GCP: <b>VPC: Cloud DNS не резолвит</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>VPC: Cloud DNS не резолвит</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud compute firewall-rules </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud compute firewall-rules list --filter name=allow-ssh", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud compute firewall-rules list --filter name=allow-ssh --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud compute firewall-rules update allow-ssh --allow tcp:22 --source-ranges 0.0.0.0/0", "Updated successfully", "ok"],
 ["^gcloud compute firewall-rules list --filter name=allow-ssh --format value(state)", "READY", "ok"]
],
[{re:"^gcloud compute firewall-rules list --filter name=allow-ssh",l:"диагностика"},
 {re:"^gcloud compute firewall-rules update allow-ssh --allow tcp:22 --source-ranges 0.0.0.0/0",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: VPC: Cloud DNS не резолвит\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: VPC: Cloud DNS не резолвит — fixed\nstatus: ok\n`}},{hints:["Симптом: VPC: Cloud DNS не резолвит в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-33","GKE: workload identity pool mismatch","Senior", `<h3>Контекст</h3><p>GCP: <b>GKE: workload identity pool mismatch</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>GKE: workload identity pool mismatch</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud container clusters desc</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud container clusters describe prod-0 --zone europe-west1-b", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud container clusters describe prod-0 --zone europe-west1-b --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud container clusters update prod --workload-pool=proj.svc.id.goog --zone europe-west1-b", "Updated successfully", "ok"],
 ["^gcloud container clusters describe prod-0 --zone europe-west1-b --format value(state)", "READY", "ok"]
],
[{re:"^gcloud container clusters describe prod-0 --zone europe-west1-b",l:"диагностика"},
 {re:"^gcloud container clusters update prod --workload-pool=proj.svc.id.goog --zone europe-west1-b",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: GKE: workload identity pool mismatch\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: GKE: workload identity pool mismatch — fixed\nstatus: ok\n`}},{hints:["Симптом: GKE: workload identity pool mismatch в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-34","GCS: soft delete retention 7d","Junior", `<h3>Контекст</h3><p>GCP: <b>GCS: soft delete retention 7d</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>GCS: soft delete retention 7d</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud storage ls gs://my-buck</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud storage ls gs://my-bucket-34", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud storage ls gs://my-bucket-34 --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud storage buckets update gs://my-bucket-34 --uniform-bucket-level-access", "Updated successfully", "ok"],
 ["^gcloud storage ls gs://my-bucket-34 --format value(state)", "READY", "ok"]
],
[{re:"^gcloud storage ls gs://my-bucket-34",l:"диагностика"},
 {re:"^gcloud storage buckets update gs://my-bucket-34 --uniform-bucket-level-access",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: GCS: soft delete retention 7d\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: GCS: soft delete retention 7d — fixed\nstatus: ok\n`}},{hints:["Симптом: GCS: soft delete retention 7d в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("GCP","gc-gcp-35","Logging: log bucket locked","Middle", `<h3>Контекст</h3><p>GCP: <b>Logging: log bucket locked</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Logging: log bucket locked</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>gcloud logging sinks describe </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@gcp:~$",
[
 ["^gcloud logging sinks describe my-sink-35", "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"],
 ["^gcloud logging sinks describe my-sink-35 --format json", "json output: status NotReady / missing", "warn"],
 ["^gcloud logging sinks update my-sink-35 --log-filter='severity>=ERROR'", "Updated successfully", "ok"],
 ["^gcloud logging sinks describe my-sink-35 --format value(state)", "READY", "ok"]
],
[{re:"^gcloud logging sinks describe my-sink-35",l:"диагностика"},
 {re:"^gcloud logging sinks update my-sink-35 --log-filter='severity>=ERROR'",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# GCP: Logging: log bucket locked\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# GCP: Logging: log bucket locked — fixed\nstatus: ok\n`}},{hints:["Симптом: Logging: log bucket locked в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

