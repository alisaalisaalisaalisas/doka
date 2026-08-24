# 🏗️ Lab 05: Terraform с нуля — без облака и без затрат

> **Время:** 90 минут | **Уровень:** Junior→Middle | **Нужно:** Docker
> **Результат:** понимаете state, plan/apply, модули, remote backend и дрейф. Всё локально через LocalStack (эмуляция AWS).

## 🧪 Часть 1: Установка и «hello world» на local-провайдерах (15 мин)

```bash
# Terraform (или OpenTofu — синтаксис идентичен)
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform -y && terraform version

mkdir ~/labs/lab05 && cd ~/labs/lab05
```

```hcl
# main.tf — учимся на бесплатных провайдерах: файлы + случайности
terraform {
  required_version = ">= 1.9"
  required_providers {
    local  = { source = "hashicorp/local",  version = "~> 2.5" }
    random = { source = "hashicorp/random", version = "~> 3.6" }
  }
}

resource "random_pet" "server_name" {
  prefix = "web"
}

resource "local_file" "inventory" {
  filename = "${path.module}/generated/inventory.txt"
  content  = "server: ${random_pet.server_name.id}\ncreated_by_terraform=true\n"
}
```

```bash
terraform init        # скачивает провайдеры в .terraform/
terraform plan        # "+ 2 to add" — план БЕЗ изменений
terraform apply -auto-approve
cat generated/inventory.txt

# Меняем код → план покажет точный diff:
sed -i 's/prefix = "web"/prefix = "app"/' main.tf
terraform plan        # ~ random_pet будет replaced
```

---

## 🧪 Часть 2: LocalStack = AWS на ноутбуке (20 мин)

```bash
docker run -d --name localstack -p 4566:4566 localstack/localstack:latest

# Провайдер AWS смотрит в эмулятор
mkdir aws && cat > aws/main.tf <<'EOF'
provider "aws" {
  region                      = "eu-central-1"
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  endpoints {
    s3       = "http://localhost:4566"
    dynamodb = "http://localhost:4566"
    ec2      = "http://localhost:4566"
  }
}

resource "aws_s3_bucket" "logs" {
  bucket = "my-lab-bucket-${random_id.suffix.hex}"
}
resource "random_id" "suffix" { byte_length = 4 }

resource "aws_dynamodb_table" "locks" {
  name         = "tf-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute { name = "LockID", type = "S" }
}
EOF

cd aws && terraform init && terraform apply -auto-approve
aws --endpoint-url=http://localhost:4566 s3 ls   # бакет существует! ✅
```

---

## 🧪 Часть 3: Remote backend (state в S3) (15 мин)

```bash
# Переносим state из локального файла в S3 (как в реальном проде)
cat > backend.tf <<'EOF'
terraform {
  backend "s3" {
    bucket         = "СКОПИРУЙТЕ_ИМЯ_БАКЕТА_ВЫШЕ"
    key            = "lab05/terraform.tfstate"
    region         = "eu-central-1"
    dynamodb_table = "tf-locks"
    endpoints      = { s3 = "http://localhost:4566", dynamodb = "http://localhost:4566" }
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_requesting_account_id  = true
    access_key = "test"
    secret_key = "test"
  }
}
EOF

terraform init -migrate-state     # миграция! ответьте yes
ls terraform.tfstate*             # локального стейта больше нет ✅
```

**Проверяем блокировку:** запустите `terraform apply` в двух терминалах одновременно — второй получит `Error acquiring the state lock`. Это защита от гонок.

---

## 🧪 Часть 4: Модули и for_each (20 мин)

```bash
mkdir -p modules/webapp
cat > modules/webapp/main.tf <<'EOF'
variable "names"    { type = set(string) }
variable "content"  { type = string }

resource "local_file" "servers" {
  for_each = var.names
  filename = "${path.module}/../../generated/${each.key}.conf"
  content  = "${var.content} server=${each.key}\n"
}

output "all_files" { value = keys(local_file.servers) }
EOF

cat > modules-use.tf <<'EOF'
module "webapp" {
  source  = "./modules/webapp"
  names   = ["eu-1", "eu-2", "us-1"]
  content = "# managed by terraform"
}
EOF

terraform apply -auto-approve
tree ../generated/
# Добавление "us-2" в names создаст ТОЛЬКО один новый файл.
# С count[] при удалении первого элемента пересоздались бы ВСЕ после него!
```

---

## 🧪 Часть 5: Дрейф и импорт (20 мин)

```bash
# Симулируем ручное изменение мимо Terraform ("кто-то залез руками")
echo "# manual change by admin at 3am" >> ../generated/eu-1.conf

terraform plan
# План показывает: content будет перезаписан => ДРЕЙФ обнаружен ✅

# Импорт существующего ресурса под управление (TF >= 1.5)
touch ../generated/imported.conf
cat > import.tf <<'EOF'
import {
  to = local_file.imported
  id = "../../generated/imported.conf"
}
resource "local_file" "imported" {
  filename = "${path.module}/../generated/imported.conf"
  content  = "# now managed"
}
EOF
terraform apply -auto-approve   # план: 1 to import
```

---

## 🧹 Cleanup

```bash
cd aws && terraform destroy -auto-approve; cd ..
docker rm -f localstack
rm -rf ~/.local/share/terraform .terraform* terraform.tfstate*
```

## ✅ Чек-лист

- [ ] Объясню, что лежит в state и почему его нельзя коммитить
- [ ] Видел блокировку state своими глазами
- [ ] Понимаю `for_each` vs `count` и когда какой безопаснее
- [ ] Умею находить дрейф планом и импортировать ресурсы

**Что дальше:** [Lab 06 — Observability](06-lab-observability-stack.md)
