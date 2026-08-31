# 🧪 100 Практических задач для DevOps: Часть 2 (Задачи 51–100)

---

## 🏗️ Раздел 5: Terraform & Infrastructure as Code (Задачи 51–60)

### Задача 51: Динамическое создание подсетей через `cidrsubnet()`
**Условие:** Разбить VPC `10.0.0.0/16` на 3 публичные подсети по разным Availability Zones.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>variable</code>, <code>azs</code>, <code>default</code>, <code>eu-west-1a</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(variable|azs|default|eu\-west\-1a)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```hcl
variable "azs" { default = ["eu-west-1a", "eu-west-1b", "eu-west-1c"] }

resource "aws_subnet" "public" {
  for_each          = toset(var.azs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet("10.0.0.0/16", 8, index(var.azs, each.key))
  availability_zone = each.key
  tags              = { Name = "public-${each.key}" }
}
```


</details>
### Задача 52: Создание S3 бэкенда с шифрованием и блокировкой в DynamoDB
**Условие:** Написать конфигурацию удаленного стейта с шифрованием на стороне сервера.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>terraform</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(terraform)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```hcl
terraform {
  backend "s3" {
    bucket         = "company-tf-states-prod"
    key            = "core/vpc/terraform.tfstate"
    region         = "eu-central-1"
    encrypt        = true
    dynamodb_table = "tf-state-locks"
  }
}
```


</details>
### Задача 53: Использование `lifecycle.ignore_changes` для автоскейлинга
**Условие:** Запретить Terraform сбрасывать количество инстансов в Auto Scaling Group, управляемое внешним HPA/KEDA.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>resource</code>, <code>aws_autoscaling_group</code>, <code>app_asg</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(resource|aws_autoscaling_group|app_asg)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```hcl
resource "aws_autoscaling_group" "app_asg" {
  desired_capacity = 3
  max_size         = 10
  min_size         = 1

  lifecycle {
    ignore_changes = [desired_capacity]
  }
}
```


</details>
### Задача 54: Создание локальных вычисляемых переменных (`locals`)
**Условие:** Сформировать стандартизированную карту обязательных тегов для всех ресурсов.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>locals</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(locals)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```hcl
locals {
  common_tags = {
    Environment = var.env
    Project     = "CoreBilling"
    ManagedBy   = "Terraform"
    CostCenter  = "FinTech-102"
  }
}
```


</details>
### Задача 55: Импорт существующей группы безопасности AWS через блок `import`
**Условие:** Импортировать существующий Security Group `sg-0123456789abcdef0` в Terraform 1.5+.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>import</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(import)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```hcl
import {
  to = aws_security_group.legacy_sg
  id = "sg-0123456789abcdef0"
}

resource "aws_security_group" "legacy_sg" {
  name        = "legacy-web-sg"
  description = "Imported SG"
}
```


</details>
### Задача 56: Создание Terragrunt конфигурации с зависимостью
**Условие:** Написать `terragrunt.hcl` для модуля базы данных, передающий `vpc_id` из родительского модуля VPC.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>include</code>, <code>root</code>, <code>find_in_parent_folders</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(include|root|find_in_parent_folders)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```hcl
include "root" { path = find_in_parent_folders() }

dependency "vpc" {
  config_path = "../vpc"
}

inputs = {
  vpc_id     = dependency.vpc.outputs.vpc_id
  db_subnets = dependency.vpc.outputs.database_subnets
}
```


</details>
### Задача 57: Использование функции `templatefile()` для User Data
**Условие:** Сгенерировать скрипт инициализации EC2 с подстановкой переменных окружения.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>resource</code>, <code>aws_instance</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(resource|aws_instance)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```hcl
resource "aws_instance" "web" {
  ami           = "ami-12345678"
  instance_type = "t3.micro"
  user_data     = templatefile("${path.module}/init.sh.tpl", {
    app_version = var.app_version
    db_endpoint = aws_db_instance.db.endpoint
  })
}
```


</details>
### Задача 58: Валидация входных переменных через `validation` блок
**Условие:** Разрешить ввод переменной `environment` только со значениями `dev`, `stage` или `prod`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>variable</code>, <code>environment</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(variable|environment)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```hcl
variable "environment" {
  type = string
  validation {
    condition     = contains(["dev", "stage", "prod"], var.environment)
    error_message = "Environment must be one of: dev, stage, prod."
  }
}
```


</details>
### Задача 59: Переименование ресурса в стейте без его пересоздания
**Условие:** Переименовать ресурс `aws_instance.old_server` в `aws_instance.new_server`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>terraform</code>, <code>state</code>, <code>aws_instance.old_server</code>, <code>aws_instance.new_server</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(terraform|state|aws_instance\.old_server|aws_instance\.new_server)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
terraform state mv aws_instance.old_server aws_instance.new_server
```


</details>
### Задача 60: Использование провайдера Vault для получения пароля БД
**Условие:** Извлечь секрет из Vault и передать в ресурс базы данных.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>vault_generic_secret</code>, <code>db_secret</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(vault_generic_secret|db_secret)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```hcl
data "vault_generic_secret" "db_secret" {
  path = "secret/database/credentials"
}

resource "aws_db_instance" "postgres" {
  password = data.vault_generic_secret.db_secret.data["password"]
  username = "dbadmin"
  # ...
}
```

---


</details>
## 📜 Раздел 6: Ansible Автоматизация (Задачи 61–70)

### Задача 61: Установка пакетов с валидацией чек-суммы
**Условие:** Скачать бинарник Prometheus Node Exporter и проверить его SHA256 хэш.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>Download</code>, <code>Node</code>, <code>Exporter</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(Download|Node|Exporter)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
- name: Download Node Exporter
  ansible.builtin.get_url:
    url: "https://github.com/prometheus/node_exporter/releases/download/v1.7.0/node_exporter-1.7.0.linux-amd64.tar.gz"
    dest: "/tmp/node_exporter.tar.gz"
    checksum: "sha256:1234567890abcdef..."
    mode: '0644'
```


</details>
### Задача 62: Использование Jinja2 фильтра `default` и циклов
**Условие:** Сгенерировать конфигурационный файл с перебором upstream серверов и весов по умолчанию.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>details</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(details)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```jinja2
upstream backend_pool {
{% for host in groups['webservers'] %}
    server {{ hostvars[host]['ansible_host'] }}:8080 weight={{ hostvars[host]['weight'] | default(1) }};
{% endfor %}
}
```


</details>
### Задача 63: Создание системного пользователя без пароля и оболочки
**Условие:** Создать системного пользователя `prometheus` с UID 2001 и домашней директорией.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>Create</code>, <code>Prometheus</code>, <code>system</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(Create|Prometheus|system)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
- name: Create Prometheus system user
  ansible.builtin.user:
    name: prometheus
    uid: 2001
    shell: /sbin/nologin
    system: true
    create_home: false
```


</details>
### Задача 64: Безопасное обновление конфигурации через `validate`
**Условие:** Скопировать конфигурацию Nginx с обязательной проверкой синтаксиса `nginx -t` перед применением.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>Deploy</code>, <code>Nginx</code>, <code>configuration</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(Deploy|Nginx|configuration)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
- name: Deploy Nginx configuration
  ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
    validate: 'nginx -t -c %s'
  notify: Reload Nginx
```


</details>
### Задача 65: Настройка таймаута выполнения команды через `async` и `poll`
**Условие:** Запустить долгий бэкап в фоне с максимальным таймаутом 1 час и проверкой статуса каждые 30 секунд.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>Run</code>, <code>heavy</code>, <code>database</code>, <code>backup</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(Run|heavy|database|backup)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
- name: Run heavy database backup
  ansible.builtin.command: /opt/scripts/backup_db.sh
  async: 3600
  poll: 30
```


</details>
### Задача 66: Редактирование файла через `lineinfile` с регулярными выражениями
**Условие:** Гарантировать отключение парольной аутентификации в `/etc/ssh/sshd_config`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>Disable</code>, <code>SSH</code>, <code>password</code>, <code>authentication</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(Disable|SSH|password|authentication)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
- name: Disable SSH password authentication
  ansible.builtin.lineinfile:
    path: /etc/ssh/sshd_config
    regexp: '^#?PasswordAuthentication'
    line: 'PasswordAuthentication no'
    validate: '/usr/sbin/sshd -t -f %s'
  notify: Restart SSHD
```


</details>
### Задача 67: Выполнение таска только при наличии определенного факта
**Условие:** Устанавливать пакет `iptables-persistent` только на семействе ОС Debian/Ubuntu.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>Install</code>, <code>iptables-persistent</code>, <code>Debian</code>, <code>family</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(Install|iptables\-persistent|Debian|family)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
- name: Install iptables-persistent on Debian family
  ansible.builtin.apt:
    name: iptables-persistent
    state: present
  when: ansible_os_family == "Debian"
```


</details>
### Задача 68: Настройка системных параметров `sysctl`
**Условие:** Включить IP Forwarding и увеличить размер очереди сокетов.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>Configure</code>, <code>kernel</code>, <code>sysctl</code>, <code>parameters</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(Configure|kernel|sysctl|parameters)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
- name: Configure kernel sysctl parameters
  ansible.posix.sysctl:
    name: "{{ item.key }}"
    value: "{{ item.value }}"
    state: present
    reload: true
  loop:
    - { key: "net.ipv4.ip_forward", value: "1" }
    - { key: "net.core.somaxconn", value: "65535" }
```


</details>
### Задача 69: Выполнение плейбука только на серверах, требующих перезагрузки
**Условие:** Проверить наличие файла `/var/run/reboot-required` на хостах Ubuntu и перезагрузить их.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>Check</code>, <code>reboot</code>, <code>required</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(Check|reboot|required)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
- name: Check if reboot is required
  ansible.builtin.stat:
    path: /var/run/reboot-required
  register: reboot_file

- name: Reboot server if required
  ansible.builtin.reboot:
    reboot_timeout: 300
  when: reboot_file.stat.exists
```


</details>
### Задача 70: Использование `delegate_to` для регистрации хоста в мониторинге
**Условие:** После настройки сервера отправить REST API запрос в Zabbix с хоста управления.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>Register</code>, <code>monitoring</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(Register|monitoring)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
- name: Register host in monitoring server
  ansible.builtin.uri:
    url: "http://zabbix.internal/api_jsonrpc.php"
    method: POST
    body_format: json
    body: '{"method": "host.create", "params": {"host": "{{ inventory_hostname }}"}}'
  delegate_to: localhost
```

---


</details>
## 🚀 Раздел 7: CI/CD & GitOps Пайплайны (Задачи 71–80)

### Задача 71: GitLab CI пайплайн с кэшированием Go модулей
**Условие:** Настроить кэш зависимостей `go mod` по хэшу файла `go.sum`.  
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
test:
  stage: test
  image: golang:1.23-alpine
  cache:
    key:
      files: [go.sum]
    paths:
      - /go/pkg/mod/
  script:
    - go test -v ./...
```


</details>
### Задача 72: GitHub Actions шаг аутентификации в AWS через OIDC
**Условие:** Настроить получение временных учетных данных AWS без использования статических ключей.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>Configure</code>, <code>AWS</code>, <code>Credentials</code>, <code>via</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(Configure|AWS|Credentials|via)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
- name: Configure AWS Credentials via OIDC
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsDeploymentRole
    aws-region: eu-central-1
```


</details>
### Задача 73: Сканирование Docker-образа в CI через Trivy с блокировкой релиза
**Условие:** Прерывать пайплайн, если в образе найдены уязвимости уровня `CRITICAL`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>Scan</code>, <code>with</code>, <code>Trivy</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(Scan|with|Trivy)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
- name: Scan Image with Trivy
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'registry.company.com/app:${{ github.sha }}'
    format: 'table'
    exit-code: '1'
    severity: 'CRITICAL'
```


</details>
### Задача 74: Автоматическое обновление тега в GitOps репозитории манифестов
**Условие:** Bash-скрипт в CI, который клонирует репозиторий манифестов, меняет тег в `values.yaml` и коммитит обратно.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>git</code>, <code>clone</code>, <code>oauth2</code>, <code>GITOPS_TOKEN</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(git|clone|oauth2|GITOPS_TOKEN)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
git clone https://oauth2:${GITOPS_TOKEN}@gitlab.com/org/k8s-infra.git
cd k8s-infra/environments/prod
yq eval '.image.tag = "${CI_COMMIT_SHORT_SHA}"' -i values.yaml
git commit -am "chore(release): deploy ${CI_COMMIT_SHORT_SHA}"
git push origin main
```


</details>
### Задача 75: Настройка матрицы сборки (Matrix Build) в GitHub Actions
**Условие:** Параллельно протестировать код на Node.js версий 18, 20 и 22.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>strategy</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(strategy)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
  - run: npm test
```


</details>
### Задача 76: Настройка ArgoCD Sync Policy с авто-удалением устаревших ресурсов
**Условие:** Написать манифест ArgoCD Application с автоматической синхронизацией и удалением ресурсов (`prune`).  
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
spec:
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```


</details>
### Задача 77: GitLab CI Dynamic Environments (Review Apps)
**Условие:** Автоматически разворачивать временное окружение для каждого Pull Request и удалять его при закрытии PR.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>deploy_review</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(deploy_review)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
deploy_review:
  stage: deploy
  script:
    - helm upgrade --install review-${CI_COMMIT_REF_SLUG} ./chart -n review --set host=${CI_COMMIT_REF_SLUG}.dev.com
  environment:
    name: review/${CI_COMMIT_REF_SLUG}
    url: https://${CI_COMMIT_REF_SLUG}.dev.com
    on_stop: stop_review

stop_review:
  stage: deploy
  rules: [{ when: manual }]
  environment:
    name: review/${CI_COMMIT_REF_SLUG}
    action: stop
  script:
    - helm uninstall review-${CI_COMMIT_REF_SLUG} -n review
```


</details>
### Задача 78: Настройка Kaniko сборщика образов в Kubernetes без привилегий
**Условие:** Запустить сборку Dockerfile внутри K8s пода без демона Docker.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>kaniko</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(kaniko)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
- name: kaniko
  image: gcr.io/kaniko-project/executor:debug
  args:
    - "--context=dir:///workspace"
    - "--dockerfile=Dockerfile"
    - "--destination=registry.company.com/app:v1.0.0"
```


</details>
### Задача 79: GitHub Actions вычисление семантической версии на основе коммитов
**Условие:** Автоматически поднять Patch/Minor версию по спецификации Conventional Commits.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>Semantic</code>, <code>Release</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(Semantic|Release)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
- name: Semantic Release
  uses: cycjimmy/semantic-release-action@v4
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```


</details>
### Задача 80: Настройка параллельного выполнения тестов в GitLab CI
**Условие:** Разбить выполнение 1000 юнит-тестов на 4 параллельных воркера.  
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
test:
  parallel: 4
  script:
    - pytest --splits 4 --group $CI_NODE_INDEX
```

---


</details>
## 📊 Раздел 8: Observability, Prometheus, Grafana, Loki (Задачи 81–90)

### Задача 81: PromQL расчет 99-го процентиля времени ответа
**Условие:** Написать запрос вычисления p99 latency HTTP запросов за 5 минут.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>histogram_quantile</code>, <code>sum</code>, <code>rate</code>, <code>http_request_duration_seconds_bucket</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(histogram_quantile|sum|rate|http_request_duration_seconds_bucket)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```promql
histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))
```


</details>
### Задача 82: PromQL алерт на высокий процент 5xx ошибок (>1%)
**Условие:** Сформировать условие срабатывания алерта при превышении порога в 1% ошибок от общего трафика.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>sum</code>, <code>rate</code>, <code>http_requests_total</code>, <code>status</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(sum|rate|http_requests_total|status)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```promql
(sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))) * 100 > 1.0
```


</details>
### Задача 83: Настройка Alertmanager маршрута в Telegram по лейблу `severity: critical`
**Условие:** Написать блок конфигурации `alertmanager.yaml` для отправки критических алертов в Telegram.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>route</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(route)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
route:
  routes:
    - match:
        severity: critical
      receiver: telegram-critical

receivers:
  - name: telegram-critical
    telegram_configs:
      - bot_token: "12345:TOKEN"
        chat_id: -100123456789
        send_resolved: true
```


</details>
### Задача 84: LogQL парсинг JSON-логов и фильтрация по статусу
**Условие:** Найти в Grafana Loki все логи платежного сервиса, где `status_code >= 500`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>payment-service</code>, <code>prod</code>, <code>status_code</code>, <code>line_format</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(payment\-service|prod|status_code|line_format)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```logql
{app="payment-service", env="prod"} | json | status_code >= 500 | line_format "{{.timestamp}} [{{.status_code}}] {{.error_message}}"
```


</details>
### Задача 85: Настройка Vector для маскирования номеров кредитных карт в логах
**Условие:** Написать VRL (Vector Remap Language) скрипт для замены номеров карт на `[REDACTED]`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>transforms</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(transforms)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
transforms:
  mask_card:
    type: remap
    inputs: ["raw_logs"]
    source: |
      .message = replace(.message, r'\b(?:\d[ -]*?){13,16}\b', "[REDACTED]")
```


</details>
### Задача 86: Настройка Prometheus ServiceMonitor для кастомного приложения
**Условие:** Создать манифест Prometheus Operator `ServiceMonitor` для сбора метрик с порта `9090` каждые 15 секунд.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>monitoring.coreos.com</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(monitoring\.coreos\.com)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: app-monitor
  namespace: production
spec:
  selector:
    matchLabels:
      app: my-app
  endpoints:
    - port: metrics
      interval: 15s
      path: /metrics
```


</details>
### Задача 87: PromQL расчет оставшегося времени до переполнения диска
**Условие:** Спрогнозировать переполнение диска менее чем за 4 часа с помощью функции `predict_linear`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>predict_linear</code>, <code>node_filesystem_free_bytes</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(predict_linear|node_filesystem_free_bytes)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```promql
predict_linear(node_filesystem_free_bytes[1h], 4 * 3600) < 0
```


</details>
### Задача 88: Настройка OpenTelemetry Collector для экспорта трейсов в Jaeger
**Условие:** Написать блок экспортера OTel Collector для отправки gRPC трейсов.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>exporters</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(exporters)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
exporters:
  otlp/jaeger:
    endpoint: "jaeger-collector.monitoring:4317"
    tls:
      insecure: true
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/jaeger]
```


</details>
### Задача 89: Настройка дашборда Grafana с переменной Namespace
**Условие:** Запрос для выпадающего списка всех активных неймспейсов в Grafana.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>label_values</code>, <code>kube_pod_info</code>, <code>namespace</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(label_values|kube_pod_info|namespace)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```sql
label_values(kube_pod_info, namespace)
```


</details>
### Задача 90: Zabbix Low-Level Discovery (LLD) JSON для обнаружения дисков
**Условие:** Сформировать валидный JSON для авто-создания метрик кастомных разделов.  
<details>
<summary>👁 <b>Показать решение</b></summary>

```json
{
  "data": [
    {"{#FSNAME}": "/data", "{#FSTYPE}": "xfs"},
    {"{#FSNAME}": "/var/log", "{#FSTYPE}": "ext4"}
  ]
}
```

---


</details>
## 🔒 Раздел 9: Databases, Kafka, Vault & Security (Задачи 91–100)

### Задача 91: Генерация динамического пользователя БД через HashiCorp Vault
**Условие:** Настроить Vault роль для создания пользователя PostgreSQL со сроком жизни 1 час.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>vault</code>, <code>write</code>, <code>database</code>, <code>roles</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(vault|write|database|roles)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
vault write database/roles/app-readonly \
    db_name=my-postgres \
    creation_statements="CREATE USER \"{{name}}\" WITH ENCRYPTED PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="24h"
```


</details>
### Задача 92: Сброс Offset в топике Kafka на 100 сообщений назад
**Условие:** Выполнить смещение консьюмер-группы `order-processing` для топика `orders`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>kafka-consumer-groups.sh</code>, <code>bootstrap-server</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(kafka\-consumer\-groups\.sh|bootstrap\-server)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --group order-processing \
  --topic orders \
  --reset-offsets --shift-by -100 \
  --execute
```


</details>
### Задача 93: Поиск долгих блокировок в PostgreSQL
**Условие:** Найти SQL запрос, блокирующий другие транзакции.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>SELECT</code>, <code>blocked_locks.pid</code>, <code>blocked_pid</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(SELECT|blocked_locks\.pid|blocked_pid)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```sql
SELECT blocked_locks.pid AS blocked_pid,
       blocking_locks.pid AS blocking_pid,
       blocked_activity.query AS blocked_statement,
       blocking_activity.query AS current_statement_in_blocking_process
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks 
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```


</details>
### Задача 94: Настройка Istio PeerAuthentication в режиме `STRICT mTLS`
**Условие:** Запретить любой нешифрованный plain-text трафик в namespace `production`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>security.istio.io</code>, <code>v1beta1</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(security\.istio\.io|v1beta1)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: production
spec:
  mtls:
    mode: STRICT
```


</details>
### Задача 95: Очистка старых данных в ClickHouse по TTL
**Условие:** Настроить таблицу с автоматическим удалением логов старше 30 дней.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>ALTER</code>, <code>TABLE</code>, <code>app_logs</code>, <code>MODIFY</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(ALTER|TABLE|app_logs|MODIFY)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```sql
ALTER TABLE app_logs MODIFY TTL event_time + INTERVAL 30 DAY;
```


</details>
### Задача 96: Настройка External Secrets Operator (ESO) для синхронизации из Vault
**Условие:** Создать K8s Secret из ключа Vault `secret/data/production/api`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>external-secrets.io</code>, <code>v1beta1</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(external\-secrets\.io|v1beta1)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: api-secret
spec:
  refreshInterval: "1h"
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: api-k8s-secret
  data:
    - secretKey: API_KEY
      remoteRef:
        key: secret/data/production/api
        property: api_key
```


</details>
### Задача 97: Анализ самых больших ключей в Redis
**Условие:** Найти топ ключей в памяти Redis без блокировки сервера.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>redis-cli</code>, <code>redis.prod.internal</code>, <code>Pass</code>, <code>bigkeys</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(redis\-cli|redis\.prod\.internal|Pass|bigkeys)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
redis-cli -h redis.prod.internal -p 6379 -a "Pass" --bigkeys
```


</details>
### Задача 98: Шифрование файла манифеста через Mozilla SOPS с использованием Age
**Условие:** Зашифровать файл `secret.yaml` публичным ключом `age1234...`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>sops</code>, <code>encrypt</code>, <code>age</code>, <code>age1234567890abcdef...</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(sops|encrypt|age|age1234567890abcdef\.\.\.)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
sops --encrypt --age age1234567890abcdef... secret.yaml > secret.enc.yaml
```


</details>
### Задача 99: Настройка политики Kyverno для запрета запуска privileged контейнеров
**Условие:** Отклонять деплой подов с параметром `privileged: true`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>kyverno.io</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(kyverno\.io)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: disallow-privileged-containers
spec:
  validationFailureAction: Enforce
  rules:
    - name: check-privileged
      match:
        any:
          - resources: { kinds: [Pod] }
      validate:
        message: "Privileged containers are strictly forbidden!"
        pattern:
          spec:
            containers:
              - =(securityContext):
                  =(privileged): "false"
```


</details>
### Задача 100: Создание полного Disaster Recovery бэкапа неймспейса через Velero
**Условие:** Снять снапшот всех подов, PV дисков и манифестов неймспейса `production` с ожиданием завершения.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>velero</code>, <code>backup</code>, <code>create</code>, <code>prod-full-backup</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(velero|backup|create|prod\-full\-backup)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
velero backup create prod-full-backup --include-namespaces production --snapshot-volumes --wait
```


---

<!-- enriched:v1 -->


</details>
## 🧭 Как работать с задачами

- **Порядок:** сначала попробуйте решить сами в песочнице (`kind` / `k3d` / `docker`), только потом читайте решение.
- **Прогресс:** ведите трекер — задача, дата, время до решения, что загуглили. Повторите проваленные через неделю.
- **Уровень сложности:** помечайте для себя [Junior | Middle | Senior] и собирайте «профиль» слабых мест.

!!! tip "Практика > теория"
    Задача считается закрытой, если вы воспроизвели решение с нуля на чистой машине за отведенное время и можете объяснить каждый шаг.


