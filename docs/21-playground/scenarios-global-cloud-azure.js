/* Global Playground: Azure — 35 scenarios */
S("Azure","gc-az-1","Entra ID: service principal secret expired","Junior", `<h3>Контекст</h3><p>Azure: <b>Entra ID: service principal secret expired</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Entra ID: service principal secret expired</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az ad sp show --id 00000000-00</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az ad sp show --id 00000000-0000-0000-0000-000000000001", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az ad sp show --id 00000000-0000-0000-0000-000000000001 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az ad sp credential reset --id 00000000-0000-0000-0000-000000000001", "command succeeded", "ok"],
 ["^az ad sp show --id 00000000-0000-0000-0000-000000000001 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az ad sp show --id 00000000-0000-0000-0000-000000000001",l:"диагностика"},
 {re:"^az ad sp credential reset --id 00000000-0000-0000-0000-000000000001",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: Entra ID: service principal secret expired\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: Entra ID: service principal secret expired — fixed\nstatus: ok\n`}},{hints:["Симптом: Entra ID: service principal secret expired в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-2","Entra ID: app registration redirect URI mismatch","Middle", `<h3>Контекст</h3><p>Azure: <b>Entra ID: app registration redirect URI mismatch</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Entra ID: app registration redirect URI mismatch</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az ad sp show --id 00000000-00</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az ad sp show --id 00000000-0000-0000-0000-000000000001", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az ad sp show --id 00000000-0000-0000-0000-000000000001 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az ad sp credential reset --id 00000000-0000-0000-0000-000000000001", "command succeeded", "ok"],
 ["^az ad sp show --id 00000000-0000-0000-0000-000000000001 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az ad sp show --id 00000000-0000-0000-0000-000000000001",l:"диагностика"},
 {re:"^az ad sp credential reset --id 00000000-0000-0000-0000-000000000001",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: Entra ID: app registration redirect URI mismatch\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: Entra ID: app registration redirect URI mismatch — fixed\nstatus: ok\n`}},{hints:["Симптом: Entra ID: app registration redirect URI mismatch в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-3","VNet: peering not connected","Senior", `<h3>Контекст</h3><p>Azure: <b>VNet: peering not connected</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>VNet: peering not connected</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az network vnet show --name my</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az network vnet show --name myvnet-3 --resource-group rg-prod-0", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az network vnet show --name myvnet-3 --resource-group rg-prod-0 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az network vnet peering create --name peer-3 --remote-vnet myvnet-3 --vnet-name myvnet-3 --resource-group rg-prod --allow-vnet-access", "command succeeded", "ok"],
 ["^az network vnet show --name myvnet-3 --resource-group rg-prod-0 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az network vnet show --name myvnet-3 --resource-group rg-prod-0",l:"диагностика"},
 {re:"^az network vnet peering create --name peer-3 --remote-vnet myvnet-3 --vnet-name myvnet-3 --resource-group rg-prod --allow-vnet-access",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: VNet: peering not connected\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: VNet: peering not connected — fixed\nstatus: ok\n`}},{hints:["Симптом: VNet: peering not connected в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-4","NSG: rule blocks 443","Junior", `<h3>Контекст</h3><p>Azure: <b>NSG: rule blocks 443</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>NSG: rule blocks 443</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az network nsg show --name myn</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az network nsg show --name mynsg-4 --resource-group rg-prod-1", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az network nsg show --name mynsg-4 --resource-group rg-prod-1 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az network nsg rule create --nsg-name mynsg-4 --name allow-443 --priority 100 --access Allow --protocol Tcp --destination-port-ranges 443", "command succeeded", "ok"],
 ["^az network nsg show --name mynsg-4 --resource-group rg-prod-1 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az network nsg show --name mynsg-4 --resource-group rg-prod-1",l:"диагностика"},
 {re:"^az network nsg rule create --nsg-name mynsg-4 --name allow-443 --priority 100 --access Allow --protocol Tcp --destination-port-ranges 443",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: NSG: rule blocks 443\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: NSG: rule blocks 443 — fixed\nstatus: ok\n`}},{hints:["Симптом: NSG: rule blocks 443 в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-5","AKS: node pool NotReady","Middle", `<h3>Контекст</h3><p>Azure: <b>AKS: node pool NotReady</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>AKS: node pool NotReady</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az aks show --name prod-2 --re</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az aks show --name prod-2 --resource-group rg-prod-2", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az aks show --name prod-2 --resource-group rg-prod-2 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az aks update --name prod-2 --resource-group rg-prod --enable-oidc-issuer", "command succeeded", "ok"],
 ["^az aks show --name prod-2 --resource-group rg-prod-2 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az aks show --name prod-2 --resource-group rg-prod-2",l:"диагностика"},
 {re:"^az aks update --name prod-2 --resource-group rg-prod --enable-oidc-issuer",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: AKS: node pool NotReady\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: AKS: node pool NotReady — fixed\nstatus: ok\n`}},{hints:["Симптом: AKS: node pool NotReady в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-6","AKS: managed identity not assigned","Senior", `<h3>Контекст</h3><p>Azure: <b>AKS: managed identity not assigned</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>AKS: managed identity not assigned</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az aks show --name prod-0 --re</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az aks show --name prod-0 --resource-group rg-prod-0", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az aks show --name prod-0 --resource-group rg-prod-0 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az aks update --name prod-0 --resource-group rg-prod --enable-oidc-issuer", "command succeeded", "ok"],
 ["^az aks show --name prod-0 --resource-group rg-prod-0 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az aks show --name prod-0 --resource-group rg-prod-0",l:"диагностика"},
 {re:"^az aks update --name prod-0 --resource-group rg-prod --enable-oidc-issuer",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: AKS: managed identity not assigned\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: AKS: managed identity not assigned — fixed\nstatus: ok\n`}},{hints:["Симптом: AKS: managed identity not assigned в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-7","Blob: SAS token expired","Junior", `<h3>Контекст</h3><p>Azure: <b>Blob: SAS token expired</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Blob: SAS token expired</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az storage blob list --account</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az storage blob list --account-name mystorage7 --container-name mycontainer-7", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az storage blob list --account-name mystorage7 --container-name mycontainer-7 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az storage blob update --account-name mystorage7 --container-name mycontainer-7 --name myblob --tier Hot", "command succeeded", "ok"],
 ["^az storage blob list --account-name mystorage7 --container-name mycontainer-7 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az storage blob list --account-name mystorage7 --container-name mycontainer-7",l:"диагностика"},
 {re:"^az storage blob update --account-name mystorage7 --container-name mycontainer-7 --name myblob --tier Hot",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: Blob: SAS token expired\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: Blob: SAS token expired — fixed\nstatus: ok\n`}},{hints:["Симптом: Blob: SAS token expired в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-8","Blob: soft delete retention блокирует","Middle", `<h3>Контекст</h3><p>Azure: <b>Blob: soft delete retention блокирует</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Blob: soft delete retention блокирует</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az storage blob list --account</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az storage blob list --account-name mystorage8 --container-name mycontainer-8", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az storage blob list --account-name mystorage8 --container-name mycontainer-8 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az storage blob update --account-name mystorage8 --container-name mycontainer-8 --name myblob --tier Hot", "command succeeded", "ok"],
 ["^az storage blob list --account-name mystorage8 --container-name mycontainer-8 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az storage blob list --account-name mystorage8 --container-name mycontainer-8",l:"диагностика"},
 {re:"^az storage blob update --account-name mystorage8 --container-name mycontainer-8 --name myblob --tier Hot",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: Blob: soft delete retention блокирует\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: Blob: soft delete retention блокирует — fixed\nstatus: ok\n`}},{hints:["Симптом: Blob: soft delete retention блокирует в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-9","Monitor: alert not firing","Senior", `<h3>Контекст</h3><p>Azure: <b>Monitor: alert not firing</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Monitor: alert not firing</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az monitor metrics list --reso</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az monitor metrics list --resource myresource --metric CPU", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az monitor metrics list --resource myresource --metric CPU --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az monitor metrics alert create --name cpu-high --resource-group rg-prod --scopes myresource --condition \"avg CPU > 80\"", "command succeeded", "ok"],
 ["^az monitor metrics list --resource myresource --metric CPU --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az monitor metrics list --resource myresource --metric CPU",l:"диагностика"},
 {re:"^az monitor metrics alert create --name cpu-high --resource-group rg-prod --scopes myresource --condition \"avg CPU > 80\"",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: Monitor: alert not firing\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: Monitor: alert not firing — fixed\nstatus: ok\n`}},{hints:["Симптом: Monitor: alert not firing в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-10","VNet: subnet delegation failed","Junior", `<h3>Контекст</h3><p>Azure: <b>VNet: subnet delegation failed</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>VNet: subnet delegation failed</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az network vnet show --name my</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az network vnet show --name myvnet-10 --resource-group rg-prod-1", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az network vnet show --name myvnet-10 --resource-group rg-prod-1 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az network vnet peering create --name peer-10 --remote-vnet myvnet-10 --vnet-name myvnet-10 --resource-group rg-prod --allow-vnet-access", "command succeeded", "ok"],
 ["^az network vnet show --name myvnet-10 --resource-group rg-prod-1 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az network vnet show --name myvnet-10 --resource-group rg-prod-1",l:"диагностика"},
 {re:"^az network vnet peering create --name peer-10 --remote-vnet myvnet-10 --vnet-name myvnet-10 --resource-group rg-prod --allow-vnet-access",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: VNet: subnet delegation failed\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: VNet: subnet delegation failed — fixed\nstatus: ok\n`}},{hints:["Симптом: VNet: subnet delegation failed в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-11","NSG: default deny all","Middle", `<h3>Контекст</h3><p>Azure: <b>NSG: default deny all</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>NSG: default deny all</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az network nsg show --name myn</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az network nsg show --name mynsg-11 --resource-group rg-prod-2", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az network nsg show --name mynsg-11 --resource-group rg-prod-2 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az network nsg rule create --nsg-name mynsg-11 --name allow-443 --priority 100 --access Allow --protocol Tcp --destination-port-ranges 443", "command succeeded", "ok"],
 ["^az network nsg show --name mynsg-11 --resource-group rg-prod-2 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az network nsg show --name mynsg-11 --resource-group rg-prod-2",l:"диагностика"},
 {re:"^az network nsg rule create --nsg-name mynsg-11 --name allow-443 --priority 100 --access Allow --protocol Tcp --destination-port-ranges 443",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: NSG: default deny all\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: NSG: default deny all — fixed\nstatus: ok\n`}},{hints:["Симптом: NSG: default deny all в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-12","AKS: OIDC issuer not enabled","Senior", `<h3>Контекст</h3><p>Azure: <b>AKS: OIDC issuer not enabled</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>AKS: OIDC issuer not enabled</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az aks show --name prod-0 --re</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az aks show --name prod-0 --resource-group rg-prod-0", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az aks show --name prod-0 --resource-group rg-prod-0 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az aks update --name prod-0 --resource-group rg-prod --enable-oidc-issuer", "command succeeded", "ok"],
 ["^az aks show --name prod-0 --resource-group rg-prod-0 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az aks show --name prod-0 --resource-group rg-prod-0",l:"диагностика"},
 {re:"^az aks update --name prod-0 --resource-group rg-prod --enable-oidc-issuer",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: AKS: OIDC issuer not enabled\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: AKS: OIDC issuer not enabled — fixed\nstatus: ok\n`}},{hints:["Симптом: AKS: OIDC issuer not enabled в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-13","Entra ID: conditional access blocks","Junior", `<h3>Контекст</h3><p>Azure: <b>Entra ID: conditional access blocks</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Entra ID: conditional access blocks</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az ad sp show --id 00000000-00</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az ad sp show --id 00000000-0000-0000-0000-000000000001", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az ad sp show --id 00000000-0000-0000-0000-000000000001 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az ad sp credential reset --id 00000000-0000-0000-0000-000000000001", "command succeeded", "ok"],
 ["^az ad sp show --id 00000000-0000-0000-0000-000000000001 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az ad sp show --id 00000000-0000-0000-0000-000000000001",l:"диагностика"},
 {re:"^az ad sp credential reset --id 00000000-0000-0000-0000-000000000001",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: Entra ID: conditional access blocks\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: Entra ID: conditional access blocks — fixed\nstatus: ok\n`}},{hints:["Симптом: Entra ID: conditional access blocks в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-14","VNet: private endpoint DNS not resolved","Middle", `<h3>Контекст</h3><p>Azure: <b>VNet: private endpoint DNS not resolved</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>VNet: private endpoint DNS not resolved</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az network vnet show --name my</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az network vnet show --name myvnet-14 --resource-group rg-prod-2", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az network vnet show --name myvnet-14 --resource-group rg-prod-2 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az network vnet peering create --name peer-14 --remote-vnet myvnet-14 --vnet-name myvnet-14 --resource-group rg-prod --allow-vnet-access", "command succeeded", "ok"],
 ["^az network vnet show --name myvnet-14 --resource-group rg-prod-2 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az network vnet show --name myvnet-14 --resource-group rg-prod-2",l:"диагностика"},
 {re:"^az network vnet peering create --name peer-14 --remote-vnet myvnet-14 --vnet-name myvnet-14 --resource-group rg-prod --allow-vnet-access",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: VNet: private endpoint DNS not resolved\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: VNet: private endpoint DNS not resolved — fixed\nstatus: ok\n`}},{hints:["Симптом: VNet: private endpoint DNS not resolved в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-15","AKS: upgrade blocked by PDB","Senior", `<h3>Контекст</h3><p>Azure: <b>AKS: upgrade blocked by PDB</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>AKS: upgrade blocked by PDB</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az aks show --name prod-0 --re</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az aks show --name prod-0 --resource-group rg-prod-0", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az aks show --name prod-0 --resource-group rg-prod-0 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az aks update --name prod-0 --resource-group rg-prod --enable-oidc-issuer", "command succeeded", "ok"],
 ["^az aks show --name prod-0 --resource-group rg-prod-0 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az aks show --name prod-0 --resource-group rg-prod-0",l:"диагностика"},
 {re:"^az aks update --name prod-0 --resource-group rg-prod --enable-oidc-issuer",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: AKS: upgrade blocked by PDB\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: AKS: upgrade blocked by PDB — fixed\nstatus: ok\n`}},{hints:["Симптом: AKS: upgrade blocked by PDB в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-16","Blob: versioning disabled","Junior", `<h3>Контекст</h3><p>Azure: <b>Blob: versioning disabled</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Blob: versioning disabled</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az storage blob list --account</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az storage blob list --account-name mystorage16 --container-name mycontainer-16", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az storage blob list --account-name mystorage16 --container-name mycontainer-16 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az storage blob update --account-name mystorage16 --container-name mycontainer-16 --name myblob --tier Hot", "command succeeded", "ok"],
 ["^az storage blob list --account-name mystorage16 --container-name mycontainer-16 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az storage blob list --account-name mystorage16 --container-name mycontainer-16",l:"диагностика"},
 {re:"^az storage blob update --account-name mystorage16 --container-name mycontainer-16 --name myblob --tier Hot",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: Blob: versioning disabled\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: Blob: versioning disabled — fixed\nstatus: ok\n`}},{hints:["Симптом: Blob: versioning disabled в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-17","Monitor: log analytics workspace not linked","Middle", `<h3>Контекст</h3><p>Azure: <b>Monitor: log analytics workspace not linked</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Monitor: log analytics workspace not linked</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az monitor metrics list --reso</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az monitor metrics list --resource myresource --metric CPU", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az monitor metrics list --resource myresource --metric CPU --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az monitor metrics alert create --name cpu-high --resource-group rg-prod --scopes myresource --condition \"avg CPU > 80\"", "command succeeded", "ok"],
 ["^az monitor metrics list --resource myresource --metric CPU --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az monitor metrics list --resource myresource --metric CPU",l:"диагностика"},
 {re:"^az monitor metrics alert create --name cpu-high --resource-group rg-prod --scopes myresource --condition \"avg CPU > 80\"",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: Monitor: log analytics workspace not linked\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: Monitor: log analytics workspace not linked — fixed\nstatus: ok\n`}},{hints:["Симптом: Monitor: log analytics workspace not linked в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-18","VNet: UDR missing 0.0.0.0/0","Senior", `<h3>Контекст</h3><p>Azure: <b>VNet: UDR missing 0.0.0.0/0</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>VNet: UDR missing 0.0.0.0/0</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az network vnet show --name my</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az network vnet show --name myvnet-18 --resource-group rg-prod-0", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az network vnet show --name myvnet-18 --resource-group rg-prod-0 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az network vnet peering create --name peer-18 --remote-vnet myvnet-18 --vnet-name myvnet-18 --resource-group rg-prod --allow-vnet-access", "command succeeded", "ok"],
 ["^az network vnet show --name myvnet-18 --resource-group rg-prod-0 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az network vnet show --name myvnet-18 --resource-group rg-prod-0",l:"диагностика"},
 {re:"^az network vnet peering create --name peer-18 --remote-vnet myvnet-18 --vnet-name myvnet-18 --resource-group rg-prod --allow-vnet-access",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: VNet: UDR missing 0.0.0.0/0\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: VNet: UDR missing 0.0.0.0/0 — fixed\nstatus: ok\n`}},{hints:["Симптом: VNet: UDR missing 0.0.0.0/0 в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-19","AKS: workload identity federation missing","Junior", `<h3>Контекст</h3><p>Azure: <b>AKS: workload identity federation missing</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>AKS: workload identity federation missing</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az aks show --name prod-1 --re</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az aks show --name prod-1 --resource-group rg-prod-1", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az aks show --name prod-1 --resource-group rg-prod-1 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az aks update --name prod-1 --resource-group rg-prod --enable-oidc-issuer", "command succeeded", "ok"],
 ["^az aks show --name prod-1 --resource-group rg-prod-1 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az aks show --name prod-1 --resource-group rg-prod-1",l:"диагностика"},
 {re:"^az aks update --name prod-1 --resource-group rg-prod --enable-oidc-issuer",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: AKS: workload identity federation missing\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: AKS: workload identity federation missing — fixed\nstatus: ok\n`}},{hints:["Симптом: AKS: workload identity federation missing в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-20","Entra ID: group membership not synced","Middle", `<h3>Контекст</h3><p>Azure: <b>Entra ID: group membership not synced</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Entra ID: group membership not synced</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az ad sp show --id 00000000-00</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az ad sp show --id 00000000-0000-0000-0000-000000000001", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az ad sp show --id 00000000-0000-0000-0000-000000000001 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az ad sp credential reset --id 00000000-0000-0000-0000-000000000001", "command succeeded", "ok"],
 ["^az ad sp show --id 00000000-0000-0000-0000-000000000001 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az ad sp show --id 00000000-0000-0000-0000-000000000001",l:"диагностика"},
 {re:"^az ad sp credential reset --id 00000000-0000-0000-0000-000000000001",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: Entra ID: group membership not synced\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: Entra ID: group membership not synced — fixed\nstatus: ok\n`}},{hints:["Симптом: Entra ID: group membership not synced в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-21","NSG: flow logs not enabled","Senior", `<h3>Контекст</h3><p>Azure: <b>NSG: flow logs not enabled</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>NSG: flow logs not enabled</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az network nsg show --name myn</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az network nsg show --name mynsg-21 --resource-group rg-prod-0", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az network nsg show --name mynsg-21 --resource-group rg-prod-0 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az network nsg rule create --nsg-name mynsg-21 --name allow-443 --priority 100 --access Allow --protocol Tcp --destination-port-ranges 443", "command succeeded", "ok"],
 ["^az network nsg show --name mynsg-21 --resource-group rg-prod-0 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az network nsg show --name mynsg-21 --resource-group rg-prod-0",l:"диагностика"},
 {re:"^az network nsg rule create --nsg-name mynsg-21 --name allow-443 --priority 100 --access Allow --protocol Tcp --destination-port-ranges 443",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: NSG: flow logs not enabled\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: NSG: flow logs not enabled — fixed\nstatus: ok\n`}},{hints:["Симптом: NSG: flow logs not enabled в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-22","AKS: node auto-upgrade disabled","Junior", `<h3>Контекст</h3><p>Azure: <b>AKS: node auto-upgrade disabled</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>AKS: node auto-upgrade disabled</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az aks show --name prod-1 --re</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az aks show --name prod-1 --resource-group rg-prod-1", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az aks show --name prod-1 --resource-group rg-prod-1 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az aks update --name prod-1 --resource-group rg-prod --enable-oidc-issuer", "command succeeded", "ok"],
 ["^az aks show --name prod-1 --resource-group rg-prod-1 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az aks show --name prod-1 --resource-group rg-prod-1",l:"диагностика"},
 {re:"^az aks update --name prod-1 --resource-group rg-prod --enable-oidc-issuer",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: AKS: node auto-upgrade disabled\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: AKS: node auto-upgrade disabled — fixed\nstatus: ok\n`}},{hints:["Симптом: AKS: node auto-upgrade disabled в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-23","Blob: CORS not configured","Middle", `<h3>Контекст</h3><p>Azure: <b>Blob: CORS not configured</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Blob: CORS not configured</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az storage blob list --account</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az storage blob list --account-name mystorage23 --container-name mycontainer-23", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az storage blob list --account-name mystorage23 --container-name mycontainer-23 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az storage blob update --account-name mystorage23 --container-name mycontainer-23 --name myblob --tier Hot", "command succeeded", "ok"],
 ["^az storage blob list --account-name mystorage23 --container-name mycontainer-23 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az storage blob list --account-name mystorage23 --container-name mycontainer-23",l:"диагностика"},
 {re:"^az storage blob update --account-name mystorage23 --container-name mycontainer-23 --name myblob --tier Hot",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: Blob: CORS not configured\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: Blob: CORS not configured — fixed\nstatus: ok\n`}},{hints:["Симптом: Blob: CORS not configured в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-24","Monitor: action group not notified","Senior", `<h3>Контекст</h3><p>Azure: <b>Monitor: action group not notified</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Monitor: action group not notified</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az monitor metrics list --reso</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az monitor metrics list --resource myresource --metric CPU", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az monitor metrics list --resource myresource --metric CPU --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az monitor metrics alert create --name cpu-high --resource-group rg-prod --scopes myresource --condition \"avg CPU > 80\"", "command succeeded", "ok"],
 ["^az monitor metrics list --resource myresource --metric CPU --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az monitor metrics list --resource myresource --metric CPU",l:"диагностика"},
 {re:"^az monitor metrics alert create --name cpu-high --resource-group rg-prod --scopes myresource --condition \"avg CPU > 80\"",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: Monitor: action group not notified\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: Monitor: action group not notified — fixed\nstatus: ok\n`}},{hints:["Симптом: Monitor: action group not notified в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-25","VNet: DDoS protection not enabled","Junior", `<h3>Контекст</h3><p>Azure: <b>VNet: DDoS protection not enabled</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>VNet: DDoS protection not enabled</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az network vnet show --name my</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az network vnet show --name myvnet-25 --resource-group rg-prod-1", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az network vnet show --name myvnet-25 --resource-group rg-prod-1 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az network vnet peering create --name peer-25 --remote-vnet myvnet-25 --vnet-name myvnet-25 --resource-group rg-prod --allow-vnet-access", "command succeeded", "ok"],
 ["^az network vnet show --name myvnet-25 --resource-group rg-prod-1 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az network vnet show --name myvnet-25 --resource-group rg-prod-1",l:"диагностика"},
 {re:"^az network vnet peering create --name peer-25 --remote-vnet myvnet-25 --vnet-name myvnet-25 --resource-group rg-prod --allow-vnet-access",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: VNet: DDoS protection not enabled\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: VNet: DDoS protection not enabled — fixed\nstatus: ok\n`}},{hints:["Симптом: VNet: DDoS protection not enabled в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-26","AKS: key vault provider not installed","Middle", `<h3>Контекст</h3><p>Azure: <b>AKS: key vault provider not installed</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>AKS: key vault provider not installed</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az aks show --name prod-2 --re</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az aks show --name prod-2 --resource-group rg-prod-2", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az aks show --name prod-2 --resource-group rg-prod-2 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az aks update --name prod-2 --resource-group rg-prod --enable-oidc-issuer", "command succeeded", "ok"],
 ["^az aks show --name prod-2 --resource-group rg-prod-2 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az aks show --name prod-2 --resource-group rg-prod-2",l:"диагностика"},
 {re:"^az aks update --name prod-2 --resource-group rg-prod --enable-oidc-issuer",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: AKS: key vault provider not installed\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: AKS: key vault provider not installed — fixed\nstatus: ok\n`}},{hints:["Симптом: AKS: key vault provider not installed в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-27","Entra ID: MFA required","Senior", `<h3>Контекст</h3><p>Azure: <b>Entra ID: MFA required</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Entra ID: MFA required</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az ad sp show --id 00000000-00</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az ad sp show --id 00000000-0000-0000-0000-000000000001", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az ad sp show --id 00000000-0000-0000-0000-000000000001 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az ad sp credential reset --id 00000000-0000-0000-0000-000000000001", "command succeeded", "ok"],
 ["^az ad sp show --id 00000000-0000-0000-0000-000000000001 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az ad sp show --id 00000000-0000-0000-0000-000000000001",l:"диагностика"},
 {re:"^az ad sp credential reset --id 00000000-0000-0000-0000-000000000001",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: Entra ID: MFA required\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: Entra ID: MFA required — fixed\nstatus: ok\n`}},{hints:["Симптом: Entra ID: MFA required в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-28","VNet: service endpoint not enabled for storage","Junior", `<h3>Контекст</h3><p>Azure: <b>VNet: service endpoint not enabled for storage</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>VNet: service endpoint not enabled for storage</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az network vnet show --name my</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az network vnet show --name myvnet-28 --resource-group rg-prod-1", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az network vnet show --name myvnet-28 --resource-group rg-prod-1 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az network vnet peering create --name peer-28 --remote-vnet myvnet-28 --vnet-name myvnet-28 --resource-group rg-prod --allow-vnet-access", "command succeeded", "ok"],
 ["^az network vnet show --name myvnet-28 --resource-group rg-prod-1 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az network vnet show --name myvnet-28 --resource-group rg-prod-1",l:"диагностика"},
 {re:"^az network vnet peering create --name peer-28 --remote-vnet myvnet-28 --vnet-name myvnet-28 --resource-group rg-prod --allow-vnet-access",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: VNet: service endpoint not enabled for storage\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: VNet: service endpoint not enabled for storage — fixed\nstatus: ok\n`}},{hints:["Симптом: VNet: service endpoint not enabled for storage в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-29","AKS: pod identity binding missing","Middle", `<h3>Контекст</h3><p>Azure: <b>AKS: pod identity binding missing</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>AKS: pod identity binding missing</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az aks show --name prod-2 --re</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az aks show --name prod-2 --resource-group rg-prod-2", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az aks show --name prod-2 --resource-group rg-prod-2 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az aks update --name prod-2 --resource-group rg-prod --enable-oidc-issuer", "command succeeded", "ok"],
 ["^az aks show --name prod-2 --resource-group rg-prod-2 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az aks show --name prod-2 --resource-group rg-prod-2",l:"диагностика"},
 {re:"^az aks update --name prod-2 --resource-group rg-prod --enable-oidc-issuer",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: AKS: pod identity binding missing\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: AKS: pod identity binding missing — fixed\nstatus: ok\n`}},{hints:["Симптом: AKS: pod identity binding missing в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-30","Blob: immutable policy locks","Senior", `<h3>Контекст</h3><p>Azure: <b>Blob: immutable policy locks</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Blob: immutable policy locks</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az storage blob list --account</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az storage blob list --account-name mystorage30 --container-name mycontainer-30", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az storage blob list --account-name mystorage30 --container-name mycontainer-30 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az storage blob update --account-name mystorage30 --container-name mycontainer-30 --name myblob --tier Hot", "command succeeded", "ok"],
 ["^az storage blob list --account-name mystorage30 --container-name mycontainer-30 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az storage blob list --account-name mystorage30 --container-name mycontainer-30",l:"диагностика"},
 {re:"^az storage blob update --account-name mystorage30 --container-name mycontainer-30 --name myblob --tier Hot",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: Blob: immutable policy locks\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: Blob: immutable policy locks — fixed\nstatus: ok\n`}},{hints:["Симптом: Blob: immutable policy locks в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-31","Monitor: metric filter wrong","Junior", `<h3>Контекст</h3><p>Azure: <b>Monitor: metric filter wrong</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Monitor: metric filter wrong</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az monitor metrics list --reso</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az monitor metrics list --resource myresource --metric CPU", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az monitor metrics list --resource myresource --metric CPU --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az monitor metrics alert create --name cpu-high --resource-group rg-prod --scopes myresource --condition \"avg CPU > 80\"", "command succeeded", "ok"],
 ["^az monitor metrics list --resource myresource --metric CPU --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az monitor metrics list --resource myresource --metric CPU",l:"диагностика"},
 {re:"^az monitor metrics alert create --name cpu-high --resource-group rg-prod --scopes myresource --condition \"avg CPU > 80\"",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: Monitor: metric filter wrong\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: Monitor: metric filter wrong — fixed\nstatus: ok\n`}},{hints:["Симптом: Monitor: metric filter wrong в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-32","VNet: NAT gateway not associated","Middle", `<h3>Контекст</h3><p>Azure: <b>VNet: NAT gateway not associated</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>VNet: NAT gateway not associated</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az network vnet show --name my</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az network vnet show --name myvnet-32 --resource-group rg-prod-2", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az network vnet show --name myvnet-32 --resource-group rg-prod-2 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az network vnet peering create --name peer-32 --remote-vnet myvnet-32 --vnet-name myvnet-32 --resource-group rg-prod --allow-vnet-access", "command succeeded", "ok"],
 ["^az network vnet show --name myvnet-32 --resource-group rg-prod-2 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az network vnet show --name myvnet-32 --resource-group rg-prod-2",l:"диагностика"},
 {re:"^az network vnet peering create --name peer-32 --remote-vnet myvnet-32 --vnet-name myvnet-32 --resource-group rg-prod --allow-vnet-access",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: VNet: NAT gateway not associated\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: VNet: NAT gateway not associated — fixed\nstatus: ok\n`}},{hints:["Симптом: VNet: NAT gateway not associated в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-33","AKS: cluster autoscaler not scaling","Senior", `<h3>Контекст</h3><p>Azure: <b>AKS: cluster autoscaler not scaling</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>AKS: cluster autoscaler not scaling</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az aks show --name prod-0 --re</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az aks show --name prod-0 --resource-group rg-prod-0", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az aks show --name prod-0 --resource-group rg-prod-0 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az aks update --name prod-0 --resource-group rg-prod --enable-oidc-issuer", "command succeeded", "ok"],
 ["^az aks show --name prod-0 --resource-group rg-prod-0 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az aks show --name prod-0 --resource-group rg-prod-0",l:"диагностика"},
 {re:"^az aks update --name prod-0 --resource-group rg-prod --enable-oidc-issuer",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: AKS: cluster autoscaler not scaling\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: AKS: cluster autoscaler not scaling — fixed\nstatus: ok\n`}},{hints:["Симптом: AKS: cluster autoscaler not scaling в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-34","Entra ID: token lifetime too short","Junior", `<h3>Контекст</h3><p>Azure: <b>Entra ID: token lifetime too short</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Entra ID: token lifetime too short</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az ad sp show --id 00000000-00</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az ad sp show --id 00000000-0000-0000-0000-000000000001", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az ad sp show --id 00000000-0000-0000-0000-000000000001 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az ad sp credential reset --id 00000000-0000-0000-0000-000000000001", "command succeeded", "ok"],
 ["^az ad sp show --id 00000000-0000-0000-0000-000000000001 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az ad sp show --id 00000000-0000-0000-0000-000000000001",l:"диагностика"},
 {re:"^az ad sp credential reset --id 00000000-0000-0000-0000-000000000001",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: Entra ID: token lifetime too short\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: Entra ID: token lifetime too short — fixed\nstatus: ok\n`}},{hints:["Симптом: Entra ID: token lifetime too short в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

S("Azure","gc-az-35","Blob: lifecycle not deleting","Middle", `<h3>Контекст</h3><p>Azure: <b>Blob: lifecycle not deleting</b>. Работа с <code>cloud/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Blob: lifecycle not deleting</b>. Файл <code>cloud/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] диагностика</li><li>[ ] исправить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>cloud/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>cloud/main.tf</code>. Активный файл открыт в редакторе. Начните с <code>az storage blob list --account</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: диагностика → исправить.</p><h3>Проверка</h3><pre>cat cloud/main.tf<br>проверить код</pre>`,
"dev@azure:~$",
[
 ["^az storage blob list --account-name mystorage35 --container-name mycontainer-35", "ERROR: (AuthorizationFailed) The client does not have authorization", "err"],
 ["^az storage blob list --account-name mystorage35 --container-name mycontainer-35 --output json", "json: provisioningState Failed / missing", "warn"],
 ["^az storage blob update --account-name mystorage35 --container-name mycontainer-35 --name myblob --tier Hot", "command succeeded", "ok"],
 ["^az storage blob list --account-name mystorage35 --container-name mycontainer-35 --query provisioningState --output tsv", "Succeeded", "ok"]
],
[{re:"^az storage blob list --account-name mystorage35 --container-name mycontainer-35",l:"диагностика"},
 {re:"^az storage blob update --account-name mystorage35 --container-name mycontainer-35 --name myblob --tier Hot",l:"исправить"}],{file:"cloud/main.tf",files:{"cloud/main.tf":`# Azure: Blob: lifecycle not deleting\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"cloud/main.tf":`# Azure: Blob: lifecycle not deleting — fixed\nstatus: ok\n`}},{hints:["Симптом: Blob: lifecycle not deleting в cloud/main.tf. Ищи причину в коде/конфиге этого файла.","Открой cloud/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat cloud/main.tf.","Порядок: диагностика → исправить"]});

