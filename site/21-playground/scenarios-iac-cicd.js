/* Песочница: Terraform, Ansible, CI/CD, GitOps, Python/Go */
S("Terraform","t1","init/validate: синтаксическая ошибка","Junior",
`<h3>Контекст</h3><p>Terraform: <b>init/validate: синтаксическая ошибка</b>. Работа с <code>terraform/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>init/validate: синтаксическая ошибка</b>. Файл <code>terraform/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] validate и найти ошибку</li><li>[ ] исправить</li><li>[ ] повторная валидация</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>terraform/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>terraform/main.tf</code>, <code>terraform/variables.tf</code>. Активный файл открыт в редакторе. Начните с <code>terraform (init|validate)</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: validate и найти ошибку → исправить → повторная валидация.</p><h3>Проверка</h3><pre>cat terraform/main.tf<br>проверить код</pre>`,
"dev@lab:~/infra$",
[
["^terraform (init|validate)",`Error: Missing name for resource\n  on main.tf line 5: All resource blocks must have 2 labels`,"err"],
["^(sed -i|nano) main\\.tf",`resource блок исправлен`,"ok"],
["^terraform validate",`Success! The configuration is valid.`,"ok"]
],
[{re:/^terraform (init|validate)/,l:"validate и найти ошибку"},
 {re:"^(sed|nano)",l:"исправить"},
 {re:"^terraform validate",l:"повторная валидация"}],{file:"terraform/main.tf",files:{"terraform/main.tf":`resource \"null_resource\" \"x\" { triggers = { v=\"broken\" } }\n`,"terraform/variables.tf":`variable \"env\" {}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"terraform/main.tf":`resource \"null_resource\" \"x\" { triggers = { v=\"ok\" } }\n`,"terraform/variables.tf":`variable \"env\" {}\n`}},{hints:["Симптом: init/validate: синтаксическая ошибка в terraform/main.tf. Ищи причину в коде/конфиге этого файла.","Открой terraform/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat terraform/main.tf.","Порядок: validate и найти ошибку → исправить → повторная валидация"]});

S("Terraform","t2","Дрейф: кто-то правил руками","Middle",
`<h3>Контекст</h3><p>Terraform: <b>Дрейф: кто-то правил руками</b>. Работа с <code>terraform/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Дрейф: кто-то правил руками</b>. Файл <code>terraform/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] plan до и после</li><li>[ ] apply</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>terraform/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>terraform/main.tf</code>, <code>terraform/variables.tf</code>. Активный файл открыт в редакторе. Начните с <code>terraform plan</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: plan до и после → apply.</p><h3>Проверка</h3><pre>cat terraform/main.tf<br>проверить код</pre>`,
"dev@lab:~/infra$",
[
["^terraform plan",`~ local_file.inventory content: "# manual" -> "server: web"\nPlan: 0 to add, 1 to change`,"warn"],
["^terraform apply -auto-approve",`Apply complete! 0 added, 1 changed`,"ok"],
["^terraform plan",`No changes.`,"ok"]
],
[{re:/^terraform plan/,l:"plan до и после"},
 {re:"^terraform apply",l:"apply"}],{file:"terraform/main.tf",files:{"terraform/main.tf":`resource \"null_resource\" \"x\" { triggers = { v=\"broken\" } }\n`,"terraform/variables.tf":`variable \"env\" {}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"terraform/main.tf":`resource \"null_resource\" \"x\" { triggers = { v=\"ok\" } }\n`,"terraform/variables.tf":`variable \"env\" {}\n`}},{hints:["Симптом: Дрейф: кто-то правил руками в terraform/main.tf. Ищи причину в коде/конфиге этого файла.","Открой terraform/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat terraform/main.tf.","Порядок: plan до и после → apply"]});

S("Terraform","t3","Импорт существующего ресурса","Middle",
`<h3>Контекст</h3><p>Terraform: <b>Импорт существующего ресурса</b>. Работа с <code>terraform/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Импорт существующего ресурса</b>. Файл <code>terraform/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] import</li><li>[ ] проверить, что plan чист</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>terraform/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>terraform/main.tf</code>, <code>terraform/variables.tf</code>. Активный файл открыт в редакторе. Начните с <code>terraform import aws_s3_bucket</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: import → проверить, что plan чист.</p><h3>Проверка</h3><pre>cat terraform/main.tf<br>проверить код</pre>`,
"dev@lab:~/infra$",
[
["^terraform import aws_s3_bucket\\.logs my-logs",`Import successful!`,"ok"],
["^terraform plan",`No changes. (конфиг совпал с реальностью)`,"ok"]
],
[{re:/^terraform import/,l:"import"},
 {re:"^terraform plan",l:"проверить, что plan чист"}],{file:"terraform/main.tf",files:{"terraform/main.tf":`resource \"null_resource\" \"x\" { triggers = { v=\"broken\" } }\n`,"terraform/variables.tf":`variable \"env\" {}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"terraform/main.tf":`resource \"null_resource\" \"x\" { triggers = { v=\"ok\" } }\n`,"terraform/variables.tf":`variable \"env\" {}\n`}},{hints:["Симптом: Импорт существующего ресурса в terraform/main.tf. Ищи причину в коде/конфиге этого файла.","Открой terraform/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat terraform/main.tf.","Порядок: import → проверить, что plan чист"]});

S("Terraform","t4","State lock: apply завис","Middle",
`<h3>Контекст</h3><p>Terraform: <b>State lock: apply завис</b>. Работа с <code>terraform/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>State lock: apply завис</b>. Файл <code>terraform/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] снять зависший лок</li><li>[ ] повторить apply</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>terraform/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>terraform/main.tf</code>, <code>terraform/variables.tf</code>. Активный файл открыт в редакторе. Начните с <code>terraform plan</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: снять зависший лок → повторить apply.</p><h3>Проверка</h3><pre>cat terraform/main.tf<br>проверить код</pre>`,
"dev@lab:~/infra$",
[
["^terraform plan",`Error: Error acquiring the state lock\nLock ID: 7a8b9c`,"err"],
["^terraform force-unlock 7a8b9c",`State lock unlocked!`,"ok"],
["^terraform apply",`Apply complete!`,"ok"]
],
[{re:/^terraform force-unlock/,l:"снять зависший лок"},
 {re:"^terraform apply",l:"повторить apply"}],{file:"terraform/main.tf",files:{"terraform/main.tf":`resource \"null_resource\" \"x\" { triggers = { v=\"broken\" } }\n`,"terraform/variables.tf":`variable \"env\" {}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"terraform/main.tf":`resource \"null_resource\" \"x\" { triggers = { v=\"ok\" } }\n`,"terraform/variables.tf":`variable \"env\" {}\n`}},{hints:["Симптом: State lock: apply завис в terraform/main.tf. Ищи причину в коде/конфиге этого файла.","Открой terraform/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat terraform/main.tf.","Порядок: снять зависший лок → повторить apply"]});

S("Terraform","t5","for_each: добавить подсеть без пересоздания","Senior",
`<h3>Контекст</h3><p>Terraform: <b>for_each: добавить подсеть без пересоздания</b>. Работа с <code>terraform/main.tf</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>for_each: добавить подсеть без пересоздания</b>. Файл <code>terraform/main.tf</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] plan: только +1, без replace</li><li>[ ] apply</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>terraform/main.tf</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>terraform/main.tf</code>, <code>terraform/variables.tf</code>. Активный файл открыт в редакторе. Начните с <code>(sed -i|nano) .*azs</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: plan: только +1, без replace → apply.</p><h3>Проверка</h3><pre>cat terraform/main.tf<br>проверить код</pre>`,
"dev@lab:~/infra$",
[
["^(sed -i|nano) .*azs",`azs = ["a","b","c"]`,"ok"],
["^terraform plan",`+ aws_subnet.this["c"]  (только добавление, без replace!)`,"ok"],
["^terraform apply -auto-approve",`Apply complete! 1 added`,"ok"]
],
[{re:/^terraform plan/,l:"plan: только +1, без replace"},
 {re:"^terraform apply",l:"apply"}],{file:"terraform/main.tf",files:{"terraform/main.tf":`resource \"null_resource\" \"x\" { triggers = { v=\"broken\" } }\n`,"terraform/variables.tf":`variable \"env\" {}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"terraform/main.tf":`resource \"null_resource\" \"x\" { triggers = { v=\"ok\" } }\n`,"terraform/variables.tf":`variable \"env\" {}\n`}},{hints:["Симптом: for_each: добавить подсеть без пересоздания в terraform/main.tf. Ищи причину в коде/конфиге этого файла.","Открой terraform/main.tf в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat terraform/main.tf.","Порядок: plan: только +1, без replace → apply"]});

S("Ansible","a1","ansible: unreachable хост","Junior",
`<h3>Контекст</h3><p>Ansible: <b>ansible: unreachable хост</b>. Работа с <code>ansible/site.yml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>ansible: unreachable хост</b>. Файл <code>ansible/site.yml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] ping до и после фикса</li><li>[ ] исправить inventory/порт</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>ansible/site.yml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>ansible/site.yml</code>, <code>ansible/inventory.ini</code>. Активный файл открыт в редакторе. Начните с <code>ansible all -m ping -i invento</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: ping до и после фикса → исправить inventory/порт.</p><h3>Проверка</h3><pre>cat ansible/site.yml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^ansible all -m ping -i inventory",`web1 | UNREACHABLE! => Failed to connect: Connection refused`,"err"],
["^(ansible web1 -m ping -e ansible_port=2222|sed -i inventory)",`порт исправлен на 2222`,"ok"],
["^ansible all -m ping -i inventory",`web1 | SUCCESS`,"ok"]
],
[{re:/^ansible .*ping/,l:"ping до и после фикса"},
 {re:"(sed|ansible .* -e)",l:"исправить inventory/порт"}],{file:"ansible/site.yml",files:{"ansible/site.yml":`- hosts: web\n  tasks:\n    - command: echo broken\n`,"ansible/inventory.ini":`[web]\nweb1\n`},checks:[{re:/ansible\.builtin/,l:"ansible module"}],solutionFiles:{"ansible/site.yml":`- hosts: web\n  tasks:\n    - ansible.builtin.command:\n        cmd: echo fixed\n`,"ansible/inventory.ini":`[web]\nweb1\n`}},{hints:["Симптом: ansible: unreachable хост в ansible/site.yml. Ищи причину в коде/конфиге этого файла.","Открой ansible/site.yml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat ansible/site.yml.","Порядок: ping до и после фикса → исправить inventory/порт"]});

S("Ansible","a2","Идемпотентность: задача всегда changed","Middle",
`<h3>Контекст</h3><p>Ansible: <b>Идемпотентность: задача всегда changed</b>. Работа с <code>ansible/site.yml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Идемпотентность: задача всегда changed</b>. Файл <code>ansible/site.yml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] проверить в check-mode</li><li>[ ] заменить shell на модуль</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>ansible/site.yml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>ansible/site.yml</code>, <code>ansible/inventory.ini</code>. Активный файл открыт в редакторе. Начните с <code>ansible-playbook site\\\\.py -C </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: проверить в check-mode → заменить shell на модуль.</p><h3>Проверка</h3><pre>cat ansible/site.yml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^ansible-playbook site\\.py -C -D",`CHANGED: shell: echo config > /etc/app.conf`,"warn"],
["^(ansible.builtin.copy|sed -i s/shell/copy)",`задача переписана на copy/template`,"ok"],
["^ansible-playbook site\\.yml --check",`ok=3 changed=0`,"ok"]
],
[{re:/^ansible-playbook .*(-C|--check)/,l:"проверить в check-mode"},
 {re:"(copy|template)",l:"заменить shell на модуль"}],{file:"ansible/site.yml",files:{"ansible/site.yml":`- hosts: web\n  tasks:\n    - command: echo broken\n`,"ansible/inventory.ini":`[web]\nweb1\n`},checks:[{re:/ansible\.builtin/,l:"ansible module"}],solutionFiles:{"ansible/site.yml":`- hosts: web\n  tasks:\n    - ansible.builtin.command:\n        cmd: echo fixed\n`,"ansible/inventory.ini":`[web]\nweb1\n`}},{hints:["Симптом: Идемпотентность: задача всегда changed в ansible/site.yml. Ищи причину в коде/конфиге этого файла.","Открой ansible/site.yml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat ansible/site.yml.","Порядок: проверить в check-mode → заменить shell на модуль"]});

S("Ansible","a3","Vault: расшифровать переменные","Middle",
`<h3>Контекст</h3><p>Ansible: <b>Vault: расшифровать переменные</b>. Работа с <code>ansible/site.yml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Vault: расшифровать переменные</b>. Файл <code>ansible/site.yml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] запустить с vault-паролем</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>ansible/site.yml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>ansible/site.yml</code>, <code>ansible/inventory.ini</code>. Активный файл открыт в редакторе. Начните с <code>ansible-playbook site\\\\.yml</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: запустить с vault-паролем.</p><h3>Проверка</h3><pre>cat ansible/site.yml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^ansible-playbook site\\.yml",`ERROR: vault password is required`,"err"],
["^ansible-playbook site\\.yml --ask-vault-pass",`Vault password: PLAY RECAP ok=5`,"ok"]
],
[{re:/--ask-vault-pass|vault-password-file/,l:"запустить с vault-паролем"}],{file:"ansible/site.yml",files:{"ansible/site.yml":`- hosts: web\n  tasks:\n    - command: echo broken\n`,"ansible/inventory.ini":`[web]\nweb1\n`},checks:[{re:/ansible\.builtin/,l:"ansible module"}],solutionFiles:{"ansible/site.yml":`- hosts: web\n  tasks:\n    - ansible.builtin.command:\n        cmd: echo fixed\n`,"ansible/inventory.ini":`[web]\nweb1\n`}},{hints:["Симптом: Vault: расшифровать переменные в ansible/site.yml. Ищи причину в коде/конфиге этого файла.","Открой ansible/site.yml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat ansible/site.yml.","Порядок: запустить с vault-паролем"]});

S("GitLab CI","c1","Job stuck: no runners with tags","Junior",
`<h3>Контекст</h3><p>GitLab CI: <b>Job stuck: no runners with tags</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Job stuck: no runners with tags</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] сравнить теги</li><li>[ ] проверить/перерегистрировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>gitlab-runner list</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: сравнить теги → проверить/перерегистрировать.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~$",
[
["^gitlab-runner list",`k8s-runner  tags=[k8s]`,"warn"],
["^(sed -i .gitlab-ci\\.yml|gitlab-runner register .*--tag-list docker,k8s)",`теги согласованы`,"ok"],
["^gitlab-runner verify",`is valid, is alive`,"ok"]
],
[{re:/^gitlab-runner list/,l:"сравнить теги"},
 {re:"^gitlab-runner (verify|register)",l:"проверить/перерегистрировать"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Job stuck: no runners with tags в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: сравнить теги → проверить/перерегистрировать"]});

S("GitLab CI","c2","Kaniko: unauthorized в registry","Middle",
`<h3>Контекст</h3><p>GitLab CI: <b>Kaniko: unauthorized в registry</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Kaniko: unauthorized в registry</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] настроить auth для kaniko</li><li>[ ] повторить push</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>gitlab-runner logs.*\\\\| grep -</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: настроить auth для kaniko → повторить push.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~$",
[
["^gitlab-runner logs.*\\| grep -i kaniko",`error pushing image: unauthorized`,"err"],
["^(echo .*config\\.json|cat \\/kaniko\\/\\.docker\\/config\\.json)",`auth для registry записан`,"ok"],
["^gitlab-runner logs.*\\| grep -i push",`Pushed sha256:...`,"ok"]
],
[{re:/config\.json|auth/,l:"настроить auth для kaniko"},
 {re:"push",l:"повторить push"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Kaniko: unauthorized в registry в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: настроить auth для kaniko → повторить push"]});

S("GitHub Actions","gh1","Secret не найден в job","Junior",
`<h3>Контекст</h3><p>GitHub Actions: <b>Secret не найден в job</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Secret не найден в job</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] добавить secret</li><li>[ ] перезапустить/проверить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>gh run view --log-failed \\\\| g</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: добавить secret → перезапустить/проверить.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~$",
[
["^gh run view --log-failed \\| grep -i token",`Error: DEPLOY_TOKEN is empty`,"err"],
["^(gh secret set DEPLOY_TOKEN|gh run rerun)",`secret задан, job перезапущен`,"ok"],
["^gh run view",`✓ deploy succeeded`,"ok"]
],
[{re:/^gh secret set/,l:"добавить secret"},
 {re:"^gh run (rerun|view)",l:"перезапустить/проверить"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Secret не найден в job в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: добавить secret → перезапустить/проверить"]});

S("GitHub Actions","gh2","Кэш Go не работает","Middle",
`<h3>Контекст</h3><p>GitHub Actions: <b>Кэш Go не работает</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Кэш Go не работает</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] настроить кэш</li><li>[ ] проверить попадание в кэш</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>gh run view --log \\\\| grep -i </code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: настроить кэш → проверить попадание в кэш.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~$",
[
["^gh run view --log \\| grep -i cache",`Cache not found for keys: go-`,"warn"],
["^(sed -i|cat >>) .github\\/workflows\\/ci\\.yaml",`actions/setup-go with cache:true добавлен`,"ok"],
["^gh run watch",`✓ build  Cache restored from key: go-...`,"ok"]
],
[{re:/cache/i,l:"настроить кэш"},
 {re:"^gh run (watch|view)",l:"проверить попадание в кэш"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Кэш Go не работает в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: настроить кэш → проверить попадание в кэш"]});

S("ArgoCD","ar1","OutOfSync: приложение отстало от Git","Middle",
`<h3>Контекст</h3><p>ArgoCD: <b>OutOfSync: приложение отстало от Git</b>. Работа с <code>project/outofsync-git.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>OutOfSync: приложение отстало от Git</b>. Файл <code>project/outofsync-git.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] увидеть дрейф</li><li>[ ] синхронизировать</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/outofsync-git.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/outofsync-git.yaml</code>. Активный файл открыт в редакторе. Начните с <code>argocd app get api</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: увидеть дрейф → синхронизировать.</p><h3>Проверка</h3><pre>cat project/outofsync-git.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^argocd app get api",`Status: OutOfSync (manual edit: replicas=7 vs git=3)`,"warn"],
["^argocd app sync api",`Synced successfully`,"ok"],
["^argocd app get api",`Status: Synced, Healthy`,"ok"]
],
[{re:/^argocd app get/,l:"увидеть дрейф"},
 {re:"^argocd app sync",l:"синхронизировать"}],{file:"project/outofsync-git.yaml",files:{"project/outofsync-git.yaml":`# ArgoCD: OutOfSync: приложение отстало от Git\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/outofsync-git.yaml":`# ArgoCD: OutOfSync: приложение отстало от Git — fixed\nstatus: ok\n`}},{hints:["Симптом: OutOfSync: приложение отстало от Git в project/outofsync-git.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/outofsync-git.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/outofsync-git.yaml.","Порядок: увидеть дрейф → синхронизировать"]});

S("ArgoCD","ar2","Self-heal: ручной scale откатился","Middle",
`<h3>Контекст</h3><p>ArgoCD: <b>Self-heal: ручной scale откатился</b>. Работа с <code>project/self-heal-scale.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Self-heal: ручной scale откатился</b>. Файл <code>project/self-heal-scale.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] ручная правка мимо Git</li><li>[ ] убедиться, что selfHeal откатил</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/self-heal-scale.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/self-heal-scale.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl scale deploy api --rep</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: ручная правка мимо Git → убедиться, что selfHeal откатил.</p><h3>Проверка</h3><pre>cat project/self-heal-scale.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^kubectl scale deploy api --replicas=7",`deployment scaled`,"dim"],
["^sleep 30 && kubectl get deploy api",`replicas: 3 (selfHeal вернул как в Git)`,"ok"],
["^argocd app get api",`Synced`,"ok"]
],
[{re:/^kubectl scale/,l:"ручная правка мимо Git"},
 {re:"^argocd app get|kubectl get deploy",l:"убедиться, что selfHeal откатил"}],{file:"project/self-heal-scale.yaml",files:{"project/self-heal-scale.yaml":`# ArgoCD: Self-heal: ручной scale откатился\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/self-heal-scale.yaml":`# ArgoCD: Self-heal: ручной scale откатился — fixed\nstatus: ok\n`}},{hints:["Симптом: Self-heal: ручной scale откатился в project/self-heal-scale.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/self-heal-scale.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/self-heal-scale.yaml.","Порядок: ручная правка мимо Git → убедиться, что selfHeal откатил"]});

S("ArgoCD","ar3","Sync wave: миграция до приложения","Senior",
`<h3>Контекст</h3><p>ArgoCD: <b>Sync wave: миграция до приложения</b>. Работа с <code>project/sync-wave-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Sync wave: миграция до приложения</b>. Файл <code>project/sync-wave-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] sync с hook/wave</li><li>[ ] проверить порядок</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/sync-wave-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/sync-wave-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>argocd app sync api --strategy</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: sync с hook/wave → проверить порядок.</p><h3>Проверка</h3><pre>cat project/sync-wave-.yaml<br>проверить код</pre>`,
"dev@lab:~$",
[
["^argocd app sync api --strategy hook",`migrate Job (wave -1) → Completed; api → Synced`,"ok"],
["^argocd app history api \\| tail -1",`Revision 4: migrate completed before deploy`,"ok"]
],
[{re:/^argocd app sync/,l:"sync с hook/wave"},
 {re:"^argocd app history",l:"проверить порядок"}],{file:"project/sync-wave-.yaml",files:{"project/sync-wave-.yaml":`# ArgoCD: Sync wave: миграция до приложения\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/sync-wave-.yaml":`# ArgoCD: Sync wave: миграция до приложения — fixed\nstatus: ok\n`}},{hints:["Симптом: Sync wave: миграция до приложения в project/sync-wave-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/sync-wave-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/sync-wave-.yaml.","Порядок: sync с hook/wave → проверить порядок"]});

S("Python","py1","boto3: NoCredentialsError","Middle",
`<h3>Контекст</h3><p>Python: <b>boto3: NoCredentialsError</b>. Работа с <code>main.py</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>boto3: NoCredentialsError</b>. Файл <code>main.py</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] настроить креды</li><li>[ ] повторить скрипт</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.py</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.py</code>, <code>tests/test_main.py</code>, <code>requirements.txt</code>. Активный файл открыт в редакторе. Начните с <code>python upload\\\\.s3\\\\.py</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: настроить креды → повторить скрипт.</p><h3>Проверка</h3><pre>cat main.py<br>проверить код</pre>`,
"dev@lab:~$",
[
["^python upload\\.s3\\.py",`botocore.exceptions.NoCredentialsError: Unable to locate credentials`,"err"],
["^(export AWS_PROFILE=sandbox|aws configure list)",`профиль задан`,"ok"],
["^python upload\\.s3\\.py",`Uploaded to s3://bucket/file`,"ok"]
],
[{re:/^(export AWS|aws configure)/,l:"настроить креды"},
 {re:"^python",l:"повторить скрипт"}],{file:"main.py",files:{"main.py":`# boto3: NoCredentialsError\n# broken - needs fix\nprint(\"broken\")\n`,"tests/test_main.py":`def test_ok():\n    assert True\n`,"requirements.txt":`pytest\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.py":`# boto3: NoCredentialsError — fixed\nprint(\"ok\")\n`,"tests/test_main.py":`def test_ok():\n    assert True\n`,"requirements.txt":`pytest\n`}},{hints:["Симптом: boto3: NoCredentialsError в main.py. Ищи причину в коде/конфиге этого файла.","Открой main.py в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.py.","Порядок: настроить креды → повторить скрипт"]});

S("Go","go1","go build: ошибка компиляции","Junior",
`<h3>Контекст</h3><p>Go: <b>go build: ошибка компиляции</b>. Работа с <code>main.go</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>go build: ошибка компиляции</b>. Файл <code>main.go</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] собрать/проверить</li><li>[ ] исправить код</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>main.go</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>main.go</code>, <code>go.mod</code>, <code>main_test.go</code>. Активный файл открыт в редакторе. Начните с <code>go build \\\\.\\\\/\\\\.\\\\.\\\\.</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: собрать/проверить → исправить код.</p><h3>Проверка</h3><pre>cat main.go<br>проверить код</pre>`,
"dev@lab:~$",
[
["^go build \\.\\/\\.\\.\\.",`src/main.go:12:2: undefined: cfg`,"err"],
["^(go vet \\.\\/\\.\\.\\.|sed -i src\\/main\\.go)",`импорт/переменная исправлены`,"ok"],
["^go build -o server \\.\\/src",`(успешно, бинарник собран)`,"ok"]
],
[{re:/^go (build|vet)/,l:"собрать/проверить"},
 {re:"^(sed|nano)",l:"исправить код"}],{file:"main.go",files:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"broken\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`},checks:[{re:/ok/,l:"fixed"}],solutionFiles:{"main.go":`package main\nimport \"fmt\"\nfunc main(){fmt.Println(\"ok\")}\n`,"go.mod":`module app\ngo 1.23\n`,"main_test.go":`package main\nimport \"testing\"\nfunc TestOk(t *testing.T){}\n`}},{hints:["Симптом: go build: ошибка компиляции в main.go. Ищи причину в коде/конфиге этого файла.","Открой main.go в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat main.go.","Порядок: собрать/проверить → исправить код"]});

S("GitLab CI","c3","Пайплайн красный: тест падает только в CI","Middle",
`<h3>Контекст</h3><p>GitLab CI: <b>Пайплайн красный: тест падает только в CI</b>. Работа с <code>repo/file.txt</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Пайплайн красный: тест падает только в CI</b>. Файл <code>repo/file.txt</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] добавить service-контейнер (БД)</li><li>[ ] тесты зелёные</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>repo/file.txt</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>repo/file.txt</code>. Активный файл открыт в редакторе. Начните с <code>gitlab-ci-local test</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: добавить service-контейнер (БД) → тесты зелёные.</p><h3>Проверка</h3><pre>cat repo/file.txt<br>проверить код</pre>`,
"dev@lab:~$",
[
["^gitlab-ci-local test",`FAIL: connection refused localhost:5432`,"err"],
["^(sed -i .gitlab-ci\\.yml|cat >> .gitlab-ci\\.yml)",`services: [postgres:16] добавлен + DB_HOST=postgres`,"ok"],
["^gitlab-ci-local test",`PASS`,"ok"]
],
[{re:/gitlab-ci-local|services/,l:"добавить service-контейнер (БД)"},
 {re:"PASS|✓",l:"тесты зелёные"}],{file:"repo/file.txt",files:{"repo/file.txt":`<<<<<<< HEAD\nv1\n=======\nv2\n>>>>>>> feature\n`},checks:[{re:/v2/,l:"resolved"}],solutionFiles:{"repo/file.txt":`v2\n`}},{hints:["Симптом: Пайплайн красный: тест падает только в CI в repo/file.txt. Ищи причину в коде/конфиге этого файла.","Открой repo/file.txt в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat repo/file.txt.","Порядок: добавить service-контейнер (БД) → тесты зелёные"]});
