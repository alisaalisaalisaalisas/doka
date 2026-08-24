# 🏗️ 02. Remote State, Модульность и Terragrunt

## 🔒 Безопасное хранение стейта (Remote State & Locking)

Стейт-файл (`terraform.tfstate`) хранит полное соответствие реальной инфраструктуры вашему коду и содержит конфиденциальные данные (пароли, ключи, приватные IP).

```mermaid
graph LR
    Dev1([DevOps 1]) -->|terraform apply| Lock["Блокировка стейта (State Lock: DynamoDB)"]
    Dev2([DevOps 2]) -->|terraform apply| Lock
    Lock --> S3[("Удаленное хранилище (Encrypted S3 Bucket)")]
```

### Конфигурация бэкенда в S3 + DynamoDB:
```hcl
terraform {
  backend "s3" {
    bucket         = "mycompany-terraform-states"
    key            = "production/vpc/terraform.tfstate"
    region         = "eu-central-1"
    encrypt        = true
    dynamodb_table = "terraform-state-locks" # Предотвращает одновременный apply
  }
}
```

### Команды работы со стейтом:
```bash
# Список всех ресурсов в текущем стейте
terraform state list

# Детальный просмотр параметров ресурса в стейте
terraform state show aws_instance.web_nodes["worker-1"]

# Переименование ресурса без его пересоздания
terraform state mv aws_instance.old_name aws_instance.new_name

# Удаление ресурса из-под управления Terraform (ресурс в облаке остается жить!)
terraform state rm aws_security_group.legacy_sg

# Снятие зависшей блокировки (если упал CI)
terraform force-unlock <LOCK-ID>
```

---

## 🏗️ Создание переиспользуемых модулей

Структура модуля `modules/vpc`:
```hcl
# modules/vpc/variables.tf
variable "cidr_block" {
  type        = string
  description = "IPv4 CIDR block for VPC"
}

# modules/vpc/main.tf
resource "aws_vpc" "this" {
  cidr_block           = var.cidr_block
  enable_dns_hostnames = true
  enable_dns_support   = true
}

# modules/vpc/outputs.tf
output "vpc_id" {
  value       = aws_vpc.this.id
  description = "ID созданной VPC"
}
```

Вызов модуля:
```hcl
module "production_vpc" {
  source     = "./modules/vpc"
  cidr_block = "10.100.0.0/16"
}
```

---

##  DRY инфраструктура с Terragrunt

Terragrunt — это обертка над Terraform, которая убирает дублирование конфигураций бэкенда и провайдеров (DRY: Don't Repeat Yourself).

### Пример `terragrunt.hcl` для модуля приложения с зависимостью:
```hcl
# Автоматически наследует S3 бэкенд и генерацию провайдера из корневого terragrunt.hcl
include "root" {
  path = find_in_parent_folders()
}

# Ссылка на исходный модуль
terraform {
  source = "git::git@github.com:company/tf-modules.git//app-cluster?ref=v1.2.0"
}

# Зависимость от модуля VPC (передает output vpc_id на вход текущему модулю)
dependency "vpc" {
  config_path = "../vpc"
  mock_outputs = {
    vpc_id = "vpc-mock-12345"
  }
}

# Входные переменные для модуля
inputs = {
  vpc_id        = dependency.vpc.outputs.vpc_id
  instance_type = "t3.xlarge"
  min_size      = 3
  max_size      = 10
}
```

---
## 🔬 Deep Dive: структура стейта и blast radius

| Антипаттерн | Последствие | Решение |
| :--- | :--- | :--- |
| Один стейт на всю компанию | любой apply трогает всё, 40+ минут plan | стейт на окружение+компонент |
| Стейт локально у инженера | потеря = пересоздание инфры | remote backend сразу же |
| Секреты в outputs | пароли в открытом виде в стейте | Vault / ephemeral ресурсы |
| `default` теги забыт | нет ownership ресурсов | `provider default_tags` |

### Terragrunt: иерархия каталогов как DRY-конфигурация

```text
infrastructure-live/
├── terragrunt.hcl            # корневой: генерация провайдера+backend
├── prod/
│   ├── env.hcl               # environment inputs
│   ├── vpc/
│   │   └── terragrunt.hcl
│   └── eks/
│       └── terragrunt.hcl    # dependency на ../vpc
└── staging/
    └── ...
```

```bash
terragrunt run-all plan --terragrunt-detect-root    # план по всем модулям параллельно
terragrunt run-all apply --queue-exclude-no-changes # применить только измененное
```

!!! danger «State surgery»
    `state mv/rm` выполняется мгновенно и без плана. Делайте backup: `terraform state pull > backup.tfstate` перед любыми операциями.

---

<!-- enriched:v1 -->

## 🧨 Типовые грабли Production

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| Пайплайн зеленый, прод сломан | Разница окружений / secrets не из Vault | Проверять конфиги через `conftest` + smoke-тесты после деплоя |
| `terraform apply` висит на lock | Умерший CI оставил lock | `force-unlock` после проверки активности |
| Ansible «работает» но ничего не меняет | `changed_when` не настроен | Явные `changed_when`/`failed_when` для команд |
| GitOps откатывает ручной фикс | Drift между Git и кластером | Править только в Git; `selfHeal` оставить включенным |

!!! warning «Идемпотентность — закон»
    Любой скрипт/плейбук/модуль должен быть безопасно перезапускаемым. Если второй прогон меняет состояние — это баг, который однажды уронит прод.

## 🧪 Hands-on Lab

```bash
terragrunt hclfmt --check 2>/dev/null || terraform fmt -check -recursive; \
terraform state list | head -20 && terraform output -json | jq 'keys'
```

## ✅ Чек-лист зрелости темы

- [ ] Все изменения проходят через PR с обязательным review
- [ ] Секреты никогда не хранятся в коде/стейте (Vault/SOPS/secret manager)
- [ ] Есть dry-run/plan этап и он виден в MR
- [ ] Откат воспроизводим одной командой (< 10 минут)
- [ ] Логи пайплайна содержат версии артефактов (image digest, commit SHA)
