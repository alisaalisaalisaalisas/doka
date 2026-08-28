#!/usr/bin/env python3
import pathlib, re
root = pathlib.Path(r"C:/Users/User/Desktop/papka/doka/docs")
pattern3 = re.compile(
    r"## 🧨 Типовые грабли Production\s*\n\s*\| Симптом \| Причина \| Быстрое решение \|\s*\n\|[^|]*\|[^|]*\|[^|]*\|\s*\n\| Пайплайн зеленый, прод сломан \| Разница окружений / secrets не из Vault \| Проверять конфиги через `conftest` \+ smoke-тесты после деплоя \|\s*\n\| `terraform apply` висит на lock \| Умерший CI оставил lock \| `force-unlock` после проверки активности \|\s*\n\| Ansible «работает» но ничего не меняет \| `changed_when` не настроен \| Явные `changed_when`/`failed_when` для команд \|\s*\n\| GitOps откатывает ручной фикс \| Drift между Git и кластером \| Править только в Git; `selfHeal` оставить включенным \|",
    re.S
)

replacements3 = {
    "06-terraform/01-terraform-fundamentals.md": """## 🧨 Типовые грабли Production (Terraform — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `terraform apply` висит `Acquiring state lock` | Умерший CI держит DynamoDB lock | `terraform force-unlock <ID>` после `aws dynamodb get-item` проверки что владелец мёртв |
| `Error: Inconsistent dependency lock file` | `hashicorp/aws v5.80` vs `~> 5.0` без `terraform init -upgrade` | `terraform init -upgrade` + коммит `terraform.lock.hcl` |
| `plan` показывает 10 ресурсов на `update in-place` | `ignore_changes` не указан | `lifecycle { ignore_changes = [tags] }` для дрейфующих полей |
| `drift` после ручной правки в консоли | Правка мимо Git | `terraform plan -detailed-exitcode`, `terraform apply -refresh-only` |""",
    "06-terraform/02-state-modules-and-terragrunt.md": """## 🧨 Типовые грабли Production (State/Terragrunt — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `Failed to load state: state snapshot was created by newer version` | Локальный tftest vs remote | `terraform state pull > backup`, `terraform init -reconfigure` |
| `Error: Duplicate resource` после `terragrunt run-all apply` | `dependency` без `mock_outputs` | `mock_outputs` в `terragrunt.hcl` для plan без apply |
| `state mv` сломал `for_each` | Ключ ресурса `aws_instance.web["a"]` vs `"b"` | `terraform state mv 'aws_instance.web["a"]' 'aws_instance.web["b"]'` с `moved` блоком |
| `S3 backend 403` | Нет `dynamodb:PutItem` на lock таблице | `aws iam simulate-principal-policy` + `s3:PutObject`/`dynamodb:*` |""",
    "06-terraform/03-terraform-testing-ci-and-state-ops.md": """## 🧨 Типовые грабли Production (Terraform testing — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `terraform test` падает `mock_provider not found` | Нет `mock_provider "aws"` в `*.tftest.hcl` | Добавить `mock_provider "aws" {}` + `override_data` |
| Terratest `defer terraform.Destroy` не вызван | Паника до `Destroy` | `defer` сразу после `InitAndApply`, `t.Cleanup` |
| `Atlantis apply` висит `Waiting for approval` | `apply_requirements: [approved]` без аппрува | `atlantis approve` в PR или убрать `approved` для sandbox |
| `import` создаёт `resource` с drift | `import { to = aws_s3_bucket.this.id = "..." }` без `plan -generate-config-out` | `terraform plan -generate-config-out=generated.tf` |""",
    "07-ansible/01-ansible-architecture-and-playbooks.md": """## 🧨 Типовые грабли Production (Ansible playbooks — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `changed=0` хотя файл изменился | `template` с `validate: nginx -t %s` падает → rollback | `ansible-playbook --check --diff`, `validate` путь верный? |
| `UNREACHABLE! => { "msg": "Failed to connect to the host via ssh" }` | `inventory` `ansible_host` не резолвится / `ProxyJump` | `ansible -i inventory all --list-hosts`, `ansible -m ping` + `ssh -J bastion user@host` |
| `serial: 25%` деплой 1 час на 8 хостах | Линейная стратегия vs `free` | `strategy: free` + `max_fail_percentage: 25` |
| `gather_facts` 30с на каждом хосте | `fact_caching` выключен | `fact_caching = jsonfile` + `gathering = smart` |""",
    "07-ansible/02-roles-vault-and-best-practices.md": """## 🧨 Типовые грабли Production (Ansible Vault/Roles — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `ERROR! Decryption failed` в CI | `ANSIBLE_VAULT_PASSWORD_FILE` не прокинут | `ansible-vault view --vault-password-file <(echo $VAULT_PASS)` |
| `role not found` после `ansible-galaxy install` | `collections_paths` не включает `~/.ansible/collections` | `ansible-galaxy collection list -p /usr/share/ansible/collections` |
| `changed_when: false` скрыл реальную ошибку | Команда упала но `changed_when` false → `failed_when` не сработал | `changed_when: result.rc == 0` + `failed_when: result.rc != 0` |
| `vault.yml` в Git без `!vault` | `ansible-vault encrypt_string` скопирован без `!vault |` | `grep -r '\\$ANSIBLE_VAULT'` — должен быть `!vault` tag |""",
    "05-gitops-and-cicd/01-gitops-argocd-flux.md": """## 🧨 Типовые грабли Production (GitOps — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `Application` `OutOfSync` `prune` удалил `Service` | `prune: true` + ресурс не в Git | `argocd app diff`, `syncPolicy.prune: false` для shared ресурсов |
| `FailedSync: comparison error: tls: unknown authority` | `repoURL` https с self-signed | `spec.source.repoURL` с `insecure: true` или CA bundle |
| `Sync failed: InvalidSpecError: serviceAccountName not found` | SA не существует до `Kustomization` | `dependsOn: [infra]` или `argocd.argoproj.io/sync-wave: "-1"` для SA |
| Drift не лечится `selfHeal: true` | `ignoreDifferences` перекрывает поле | `spec.ignoreDifferences[0].jsonPointers: /spec/replicas` только для HPA |""",
    "05-gitops-and-cicd/02-cicd-pipelines-patterns.md": """## 🧨 Типовые грабли Production (Pipelines — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `needs` DAG падает `job not found` | `needs: [test]` но `test` `when: manual` | `needs: { job: test, artifacts: true, optional: true }` |
| `cache: key: files: [package-lock.json]` miss на каждой ветке | Ключ `$CI_COMMIT_REF_SLUG` уникален | `key: files: [package-lock.json]` без ветки или `fallback_keys` |
| `Kaniko` `unauthorized` push в Harbor | `DOCKER_AUTH_CONFIG` не в `before_script` | `echo $DOCKER_AUTH_CONFIG > /kaniko/.docker/config.json` |
| `rules: -if: $CI_PIPELINE_SOURCE == "merge_request_event"` не триггерит | `workflow: rules` перекрывает `job: rules` | Проверить `workflow: { rules: [{ when: always }] }` внизу файла |""",
}

count=0
for rel, new in replacements3.items():
    p = root / rel
    if not p.exists():
        print(f"MISSING {rel}")
        continue
    t = p.read_text(encoding="utf-8")
    m = pattern3.search(t)
    if m:
        t2 = t[:m.start()] + new + t[m.end():]
        p.write_text(t2, encoding="utf-8")
        count+=1
        print(f"REPLACED3 {rel}")
    else:
        # try alternative: search without leading ##
        if "Пайплайн зеленый" in t:
            print(f"FOUND string but not pattern in {rel} — need manual")
            # debug snippet
            idx = t.find("Пайплайн зеленый")
            print(repr(t[idx-500:idx+900][:800]))
        else:
            print(f"NOT FOUND3 {rel}")

print(f"Total replaced3 {count}")
