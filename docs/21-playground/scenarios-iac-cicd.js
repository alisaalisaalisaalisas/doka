/* Песочница: Terraform, Ansible, CI/CD, GitOps, Python/Go */
S("Terraform","t1","init/validate: синтаксическая ошибка","Junior",
`<b>Задача:</b> найти ошибку в HCL.`,
"dev@lab:~/infra$",
[
["^terraform (init|validate)",`Error: Missing name for resource\n  on main.tf line 5: All resource blocks must have 2 labels`,"err"],
["^(sed -i|nano) main\\.tf",`resource блок исправлен`,"ok"],
["^terraform validate",`Success! The configuration is valid.`,"ok"]
],
[{re:/^terraform (init|validate)/,l:"validate и найти ошибку"},
 {re:"^(sed|nano)",l:"исправить"},
 {re:"^terraform validate",l:"повторная валидация"}]);

S("Terraform","t2","Дрейф: кто-то правил руками","Middle",
`<b>Задача:</b> обнаружить дрейф планом и устранить.`,
"dev@lab:~/infra$",
[
["^terraform plan",`~ local_file.inventory content: "# manual" -> "server: web"\nPlan: 0 to add, 1 to change`,"warn"],
["^terraform apply -auto-approve",`Apply complete! 0 added, 1 changed`,"ok"],
["^terraform plan",`No changes.`,"ok"]
],
[{re:/^terraform plan/,l:"plan до и после"},
 {re:"^terraform apply",l:"apply"}]);

S("Terraform","t3","Импорт существующего ресурса","Middle",
`<b>Задача:</b> взять под управление уже созданный S3-бакет.`,
"dev@lab:~/infra$",
[
["^terraform import aws_s3_bucket\\.logs my-logs",`Import successful!`,"ok"],
["^terraform plan",`No changes. (конфиг совпал с реальностью)`,"ok"]
],
[{re:/^terraform import/,l:"import"},
 {re:"^terraform plan",l:"проверить, что plan чист"}]);

S("Terraform","t4","State lock: apply завис","Middle",
`<b>Симптом:</b> Error acquiring the state lock.`,
"dev@lab:~/infra$",
[
["^terraform plan",`Error: Error acquiring the state lock\nLock ID: 7a8b9c`,"err"],
["^terraform force-unlock 7a8b9c",`State lock unlocked!`,"ok"],
["^terraform apply",`Apply complete!`,"ok"]
],
[{re:/^terraform force-unlock/,l:"снять зависший лок"},
 {re:"^terraform apply",l:"повторить apply"}]);

S("Terraform","t5","for_each: добавить подсеть без пересоздания","Senior",
`<b>Задача:</b> добавить третью AZ так, чтобы существующие подсети не пересоздались.`,
"dev@lab:~/infra$",
[
["^(sed -i|nano) .*azs",`azs = ["a","b","c"]`,"ok"],
["^terraform plan",`+ aws_subnet.this["c"]  (только добавление, без replace!)`,"ok"],
["^terraform apply -auto-approve",`Apply complete! 1 added`,"ok"]
],
[{re:/^terraform plan/,l:"plan: только +1, без replace"},
 {re:"^terraform apply",l:"apply"}]);

S("Ansible","a1","ansible: unreachable хост","Junior",
`<b>Симптом:</b> playbook падает UNREACHABLE.`,
"dev@lab:~$",
[
["^ansible all -m ping -i inventory",`web1 | UNREACHABLE! => Failed to connect: Connection refused`,"err"],
["^(ansible web1 -m ping -e ansible_port=2222|sed -i inventory)",`порт исправлен на 2222`,"ok"],
["^ansible all -m ping -i inventory",`web1 | SUCCESS`,"ok"]
],
[{re:/^ansible .*ping/,l:"ping до и после фикса"},
 {re:"(sed|ansible .* -e)",l:"исправить inventory/порт"}]);

S("Ansible","a2","Идемпотентность: задача всегда changed","Middle",
`<b>Симптом:</b> второй прогон роли снова changed.`,
"dev@lab:~$",
[
["^ansible-playbook site\\.py -C -D",`CHANGED: shell: echo config > /etc/app.conf`,"warn"],
["^(ansible.builtin.copy|sed -i s/shell/copy)",`задача переписана на copy/template`,"ok"],
["^ansible-playbook site\\.yml --check",`ok=3 changed=0`,"ok"]
],
[{re:/^ansible-playbook .*(-C|--check)/,l:"проверить в check-mode"},
 {re:"(copy|template)",l:"заменить shell на модуль"}]);

S("Ansible","a3","Vault: расшифровать переменные","Middle",
`<b>Задача:</b> запустить playbook с vault-файлом.`,
"dev@lab:~$",
[
["^ansible-playbook site\\.yml",`ERROR: vault password is required`,"err"],
["^ansible-playbook site\\.yml --ask-vault-pass",`Vault password: PLAY RECAP ok=5`,"ok"]
],
[{re:/--ask-vault-pass|vault-password-file/,l:"запустить с vault-паролем"}]);

S("GitLab CI","c1","Job stuck: no runners with tags","Junior",
`<b>Симптом:</b> job висит в created.`,
"dev@lab:~$",
[
["^gitlab-runner list",`k8s-runner  tags=[k8s]`,"warn"],
["^(sed -i .gitlab-ci\\.yml|gitlab-runner register .*--tag-list docker,k8s)",`теги согласованы`,"ok"],
["^gitlab-runner verify",`is valid, is alive`,"ok"]
],
[{re:/^gitlab-runner list/,l:"сравнить теги"},
 {re:"^gitlab-runner (verify|register)",l:"проверить/перерегистрировать"}]);

S("GitLab CI","c2","Kaniko: unauthorized в registry","Middle",
`<b>Симптом:</b> push падает 401.`,
"dev@lab:~$",
[
["^gitlab-runner logs.*\\| grep -i kaniko",`error pushing image: unauthorized`,"err"],
["^(echo .*config\\.json|cat \\/kaniko\\/\\.docker\\/config\\.json)",`auth для registry записан`,"ok"],
["^gitlab-runner logs.*\\| grep -i push",`Pushed sha256:...`,"ok"]
],
[{re:/config\.json|auth/,l:"настроить auth для kaniko"},
 {re:"push",l:"повторить push"}]);

S("GitHub Actions","gh1","Secret не найден в job","Junior",
`<b>Симптом:</b> step падает: DEPLOY_TOKEN not set.`,
"dev@lab:~$",
[
["^gh run view --log-failed \\| grep -i token",`Error: DEPLOY_TOKEN is empty`,"err"],
["^(gh secret set DEPLOY_TOKEN|gh run rerun)",`secret задан, job перезапущен`,"ok"],
["^gh run view",`✓ deploy succeeded`,"ok"]
],
[{re:/^gh secret set/,l:"добавить secret"},
 {re:"^gh run (rerun|view)",l:"перезапустить/проверить"}]);

S("GitHub Actions","gh2","Кэш Go не работает","Middle",
`<b>Симптом:</b> сборка каждый раз качает модули.`,
"dev@lab:~$",
[
["^gh run view --log \\| grep -i cache",`Cache not found for keys: go-`,"warn"],
["^(sed -i|cat >>) .github\\/workflows\\/ci\\.yaml",`actions/setup-go with cache:true добавлен`,"ok"],
["^gh run watch",`✓ build  Cache restored from key: go-...`,"ok"]
],
[{re:/cache/i,l:"настроить кэш"},
 {re:"^gh run (watch|view)",l:"проверить попадание в кэш"}]);

S("ArgoCD","ar1","OutOfSync: приложение отстало от Git","Middle",
`<b>Симптом:</b> ArgoCD показывает OutOfSync.`,
"dev@lab:~$",
[
["^argocd app get api",`Status: OutOfSync (manual edit: replicas=7 vs git=3)`,"warn"],
["^argocd app sync api",`Synced successfully`,"ok"],
["^argocd app get api",`Status: Synced, Healthy`,"ok"]
],
[{re:/^argocd app get/,l:"увидеть дрейф"},
 {re:"^argocd app sync",l:"синхронизировать"}]);

S("ArgoCD","ar2","Self-heal: ручной scale откатился","Middle",
`<b>Задача:</b> проверить, что selfHeal работает.`,
"dev@lab:~$",
[
["^kubectl scale deploy api --replicas=7",`deployment scaled`,"dim"],
["^sleep 30 && kubectl get deploy api",`replicas: 3 (selfHeal вернул как в Git)`,"ok"],
["^argocd app get api",`Synced`,"ok"]
],
[{re:/^kubectl scale/,l:"ручная правка мимо Git"},
 {re:"^argocd app get|kubectl get deploy",l:"убедиться, что selfHeal откатил"}]);

S("ArgoCD","ar3","Sync wave: миграция до приложения","Senior",
`<b>Задача:</b> убедиться, что job миграции выполнился ДО деплоя новой версии.`,
"dev@lab:~$",
[
["^argocd app sync api --strategy hook",`migrate Job (wave -1) → Completed; api → Synced`,"ok"],
["^argocd app history api \\| tail -1",`Revision 4: migrate completed before deploy`,"ok"]
],
[{re:/^argocd app sync/,l:"sync с hook/wave"},
 {re:"^argocd app history",l:"проверить порядок"}]);

S("Python","py1","boto3: NoCredentialsError","Middle",
`<b>Симптом:</b> скрипт падает NoCredentialsError.`,
"dev@lab:~$",
[
["^python upload\\.s3\\.py",`botocore.exceptions.NoCredentialsError: Unable to locate credentials`,"err"],
["^(export AWS_PROFILE=sandbox|aws configure list)",`профиль задан`,"ok"],
["^python upload\\.s3\\.py",`Uploaded to s3://bucket/file`,"ok"]
],
[{re:/^(export AWS|aws configure)/,l:"настроить креды"},
 {re:"^python",l:"повторить скрипт"}]);

S("Go","go1","go build: ошибка компиляции","Junior",
`<b>Задача:</b> найти и исправить ошибку.`,
"dev@lab:~$",
[
["^go build \\.\\/\\.\\.\\.",`src/main.go:12:2: undefined: cfg`,"err"],
["^(go vet \\.\\/\\.\\.\\.|sed -i src\\/main\\.go)",`импорт/переменная исправлены`,"ok"],
["^go build -o server \\.\\/src",`(успешно, бинарник собран)`,"ok"]
],
[{re:/^go (build|vet)/,l:"собрать/проверить"},
 {re:"^(sed|nano)",l:"исправить код"}]);

S("GitLab CI","c3","Пайплайн красный: тест падает только в CI","Middle",
`<b>Симптом:</b> локально тесты зелёные, в CI красные.`,
"dev@lab:~$",
[
["^gitlab-ci-local test",`FAIL: connection refused localhost:5432`,"err"],
["^(sed -i .gitlab-ci\\.yml|cat >> .gitlab-ci\\.yml)",`services: [postgres:16] добавлен + DB_HOST=postgres`,"ok"],
["^gitlab-ci-local test",`PASS`,"ok"]
],
[{re:/gitlab-ci-local|services/,l:"добавить service-контейнер (БД)"},
 {re:"PASS|✓",l:"тесты зелёные"}]);
