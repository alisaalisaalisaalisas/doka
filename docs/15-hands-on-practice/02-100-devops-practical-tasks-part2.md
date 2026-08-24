# 🧪 100 Практических задач для DevOps: Часть 2 (Задачи 51–100)

---

## 🏗️ Раздел 5: Terraform & Infrastructure as Code (Задачи 51–60)

### Задача 51: Динамическое создание подсетей через `cidrsubnet()`
**Условие:** Разбить VPC `10.0.0.0/16` на 3 публичные подсети по разным Availability Zones.  
**Решение:**
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

### Задача 52: Создание S3 бэкенда с шифрованием и блокировкой в DynamoDB
**Условие:** Написать конфигурацию удаленного стейта с шифрованием на стороне сервера.  
**Решение:**
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

### Задача 53: Использование `lifecycle.ignore_changes` для автоскейлинга
**Условие:** Запретить Terraform сбрасывать количество инстансов в Auto Scaling Group, управляемое внешним HPA/KEDA.  
**Решение:**
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

### Задача 54: Создание локальных вычисляемых переменных (`locals`)
**Условие:** Сформировать стандартизированную карту обязательных тегов для всех ресурсов.  
**Решение:**
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

### Задача 55: Импорт существующей группы безопасности AWS через блок `import`
**Условие:** Импортировать существующий Security Group `sg-0123456789abcdef0` в Terraform 1.5+.  
**Решение:**
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

### Задача 56: Создание Terragrunt конфигурации с зависимостью
**Условие:** Написать `terragrunt.hcl` для модуля базы данных, передающий `vpc_id` из родительского модуля VPC.  
**Решение:**
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

### Задача 57: Использование функции `templatefile()` для User Data
**Условие:** Сгенерировать скрипт инициализации EC2 с подстановкой переменных окружения.  
**Решение:**
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

### Задача 58: Валидация входных переменных через `validation` блок
**Условие:** Разрешить ввод переменной `environment` только со значениями `dev`, `stage` или `prod`.  
**Решение:**
```hcl
variable "environment" {
  type = string
  validation {
    condition     = contains(["dev", "stage", "prod"], var.environment)
    error_message = "Environment must be one of: dev, stage, prod."
  }
}
```

### Задача 59: Переименование ресурса в стейте без его пересоздания
**Условие:** Переименовать ресурс `aws_instance.old_server` в `aws_instance.new_server`.  
**Решение:**
```bash
terraform state mv aws_instance.old_server aws_instance.new_server
```

### Задача 60: Использование провайдера Vault для получения пароля БД
**Условие:** Извлечь секрет из Vault и передать в ресурс базы данных.  
**Решение:**
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

## 📜 Раздел 6: Ansible Автоматизация (Задачи 61–70)

### Задача 61: Установка пакетов с валидацией чек-суммы
**Условие:** Скачать бинарник Prometheus Node Exporter и проверить его SHA256 хэш.  
**Решение:**
```yaml
- name: Download Node Exporter
  ansible.builtin.get_url:
    url: "https://github.com/prometheus/node_exporter/releases/download/v1.7.0/node_exporter-1.7.0.linux-amd64.tar.gz"
    dest: "/tmp/node_exporter.tar.gz"
    checksum: "sha256:1234567890abcdef..."
    mode: '0644'
```

### Задача 62: Использование Jinja2 фильтра `default` и циклов
**Условие:** Сгенерировать конфигурационный файл с перебором upstream серверов и весов по умолчанию.  
**Решение:**
```jinja2
upstream backend_pool {
{% for host in groups['webservers'] %}
    server {{ hostvars[host]['ansible_host'] }}:8080 weight={{ hostvars[host]['weight'] | default(1) }};
{% endfor %}
}
```

### Задача 63: Создание системного пользователя без пароля и оболочки
**Условие:** Создать системного пользователя `prometheus` с UID 2001 и домашней директорией.  
**Решение:**
```yaml
- name: Create Prometheus system user
  ansible.builtin.user:
    name: prometheus
    uid: 2001
    shell: /sbin/nologin
    system: true
    create_home: false
```

### Задача 64: Безопасное обновление конфигурации через `validate`
**Условие:** Скопировать конфигурацию Nginx с обязательной проверкой синтаксиса `nginx -t` перед применением.  
**Решение:**
```yaml
- name: Deploy Nginx configuration
  ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
    validate: 'nginx -t -c %s'
  notify: Reload Nginx
```

### Задача 65: Настройка таймаута выполнения команды через `async` и `poll`
**Условие:** Запустить долгий бэкап в фоне с максимальным таймаутом 1 час и проверкой статуса каждые 30 секунд.  
**Решение:**
```yaml
- name: Run heavy database backup
  ansible.builtin.command: /opt/scripts/backup_db.sh
  async: 3600
  poll: 30
```

### Задача 66: Редактирование файла через `lineinfile` с регулярными выражениями
**Условие:** Гарантировать отключение парольной аутентификации в `/etc/ssh/sshd_config`.  
**Решение:**
```yaml
- name: Disable SSH password authentication
  ansible.builtin.lineinfile:
    path: /etc/ssh/sshd_config
    regexp: '^#?PasswordAuthentication'
    line: 'PasswordAuthentication no'
    validate: '/usr/sbin/sshd -t -f %s'
  notify: Restart SSHD
```

### Задача 67: Выполнение таска только при наличии определенного факта
**Условие:** Устанавливать пакет `iptables-persistent` только на семействе ОС Debian/Ubuntu.  
**Решение:**
```yaml
- name: Install iptables-persistent on Debian family
  ansible.builtin.apt:
    name: iptables-persistent
    state: present
  when: ansible_os_family == "Debian"
```

### Задача 68: Настройка системных параметров `sysctl`
**Условие:** Включить IP Forwarding и увеличить размер очереди сокетов.  
**Решение:**
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

### Задача 69: Выполнение плейбука только на серверах, требующих перезагрузки
**Условие:** Проверить наличие файла `/var/run/reboot-required` на хостах Ubuntu и перезагрузить их.  
**Решение:**
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

### Задача 70: Использование `delegate_to` для регистрации хоста в мониторинге
**Условие:** После настройки сервера отправить REST API запрос в Zabbix с хоста управления.  
**Решение:**
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

## 🚀 Раздел 7: CI/CD & GitOps Пайплайны (Задачи 71–80)

### Задача 71: GitLab CI пайплайн с кэшированием Go модулей
**Условие:** Настроить кэш зависимостей `go mod` по хэшу файла `go.sum`.  
**Решение:**
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

### Задача 72: GitHub Actions шаг аутентификации в AWS через OIDC
**Условие:** Настроить получение временных учетных данных AWS без использования статических ключей.  
**Решение:**
```yaml
- name: Configure AWS Credentials via OIDC
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsDeploymentRole
    aws-region: eu-central-1
```

### Задача 73: Сканирование Docker-образа в CI через Trivy с блокировкой релиза
**Условие:** Прерывать пайплайн, если в образе найдены уязвимости уровня `CRITICAL`.  
**Решение:**
```yaml
- name: Scan Image with Trivy
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'registry.company.com/app:${{ github.sha }}'
    format: 'table'
    exit-code: '1'
    severity: 'CRITICAL'
```

### Задача 74: Автоматическое обновление тега в GitOps репозитории манифестов
**Условие:** Bash-скрипт в CI, который клонирует репозиторий манифестов, меняет тег в `values.yaml` и коммитит обратно.  
**Решение:**
```bash
git clone https://oauth2:${GITOPS_TOKEN}@gitlab.com/org/k8s-infra.git
cd k8s-infra/environments/prod
yq eval '.image.tag = "${CI_COMMIT_SHORT_SHA}"' -i values.yaml
git commit -am "chore(release): deploy ${CI_COMMIT_SHORT_SHA}"
git push origin main
```

### Задача 75: Настройка матрицы сборки (Matrix Build) в GitHub Actions
**Условие:** Параллельно протестировать код на Node.js версий 18, 20 и 22.  
**Решение:**
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

### Задача 76: Настройка ArgoCD Sync Policy с авто-удалением устаревших ресурсов
**Условие:** Написать манифест ArgoCD Application с автоматической синхронизацией и удалением ресурсов (`prune`).  
**Решение:**
```yaml
spec:
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

### Задача 77: GitLab CI Dynamic Environments (Review Apps)
**Условие:** Автоматически разворачивать временное окружение для каждого Pull Request и удалять его при закрытии PR.  
**Решение:**
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

### Задача 78: Настройка Kaniko сборщика образов в Kubernetes без привилегий
**Условие:** Запустить сборку Dockerfile внутри K8s пода без демона Docker.  
**Решение:**
```yaml
- name: kaniko
  image: gcr.io/kaniko-project/executor:debug
  args:
    - "--context=dir:///workspace"
    - "--dockerfile=Dockerfile"
    - "--destination=registry.company.com/app:v1.0.0"
```

### Задача 79: GitHub Actions вычисление семантической версии на основе коммитов
**Условие:** Автоматически поднять Patch/Minor версию по спецификации Conventional Commits.  
**Решение:**
```yaml
- name: Semantic Release
  uses: cycjimmy/semantic-release-action@v4
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Задача 80: Настройка параллельного выполнения тестов в GitLab CI
**Условие:** Разбить выполнение 1000 юнит-тестов на 4 параллельных воркера.  
**Решение:**
```yaml
test:
  parallel: 4
  script:
    - pytest --splits 4 --group $CI_NODE_INDEX
```

---

## 📊 Раздел 8: Observability, Prometheus, Grafana, Loki (Задачи 81–90)

### Задача 81: PromQL расчет 99-го процентиля времени ответа
**Условие:** Написать запрос вычисления p99 latency HTTP запросов за 5 минут.  
**Решение:**
```promql
histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))
```

### Задача 82: PromQL алерт на высокий процент 5xx ошибок (>1%)
**Условие:** Сформировать условие срабатывания алерта при превышении порога в 1% ошибок от общего трафика.  
**Решение:**
```promql
(sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))) * 100 > 1.0
```

### Задача 83: Настройка Alertmanager маршрута в Telegram по лейблу `severity: critical`
**Условие:** Написать блок конфигурации `alertmanager.yaml` для отправки критических алертов в Telegram.  
**Решение:**
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

### Задача 84: LogQL парсинг JSON-логов и фильтрация по статусу
**Условие:** Найти в Grafana Loki все логи платежного сервиса, где `status_code >= 500`.  
**Решение:**
```logql
{app="payment-service", env="prod"} | json | status_code >= 500 | line_format "{{.timestamp}} [{{.status_code}}] {{.error_message}}"
```

### Задача 85: Настройка Vector для маскирования номеров кредитных карт в логах
**Условие:** Написать VRL (Vector Remap Language) скрипт для замены номеров карт на `[REDACTED]`.  
**Решение:**
```yaml
transforms:
  mask_card:
    type: remap
    inputs: ["raw_logs"]
    source: |
      .message = replace(.message, r'\b(?:\d[ -]*?){13,16}\b', "[REDACTED]")
```

### Задача 86: Настройка Prometheus ServiceMonitor для кастомного приложения
**Условие:** Создать манифест Prometheus Operator `ServiceMonitor` для сбора метрик с порта `9090` каждые 15 секунд.  
**Решение:**
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

### Задача 87: PromQL расчет оставшегося времени до переполнения диска
**Условие:** Спрогнозировать переполнение диска менее чем за 4 часа с помощью функции `predict_linear`.  
**Решение:**
```promql
predict_linear(node_filesystem_free_bytes[1h], 4 * 3600) < 0
```

### Задача 88: Настройка OpenTelemetry Collector для экспорта трейсов в Jaeger
**Условие:** Написать блок экспортера OTel Collector для отправки gRPC трейсов.  
**Решение:**
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

### Задача 89: Настройка дашборда Grafana с переменной Namespace
**Условие:** Запрос для выпадающего списка всех активных неймспейсов в Grafana.  
**Решение:**
```sql
label_values(kube_pod_info, namespace)
```

### Задача 90: Zabbix Low-Level Discovery (LLD) JSON для обнаружения дисков
**Условие:** Сформировать валидный JSON для авто-создания метрик кастомных разделов.  
**Решение:**
```json
{
  "data": [
    {"{#FSNAME}": "/data", "{#FSTYPE}": "xfs"},
    {"{#FSNAME}": "/var/log", "{#FSTYPE}": "ext4"}
  ]
}
```

---

## 🔒 Раздел 9: Databases, Kafka, Vault & Security (Задачи 91–100)

### Задача 91: Генерация динамического пользователя БД через HashiCorp Vault
**Условие:** Настроить Vault роль для создания пользователя PostgreSQL со сроком жизни 1 час.  
**Решение:**
```bash
vault write database/roles/app-readonly \
    db_name=my-postgres \
    creation_statements="CREATE USER \"{{name}}\" WITH ENCRYPTED PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="24h"
```

### Задача 92: Сброс Offset в топике Kafka на 100 сообщений назад
**Условие:** Выполнить смещение консьюмер-группы `order-processing` для топика `orders`.  
**Решение:**
```bash
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --group order-processing \
  --topic orders \
  --reset-offsets --shift-by -100 \
  --execute
```

### Задача 93: Поиск долгих блокировок в PostgreSQL
**Условие:** Найти SQL запрос, блокирующий другие транзакции.  
**Решение:**
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

### Задача 94: Настройка Istio PeerAuthentication в режиме `STRICT mTLS`
**Условие:** Запретить любой нешифрованный plain-text трафик в namespace `production`.  
**Решение:**
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

### Задача 95: Очистка старых данных в ClickHouse по TTL
**Условие:** Настроить таблицу с автоматическим удалением логов старше 30 дней.  
**Решение:**
```sql
ALTER TABLE app_logs MODIFY TTL event_time + INTERVAL 30 DAY;
```

### Задача 96: Настройка External Secrets Operator (ESO) для синхронизации из Vault
**Условие:** Создать K8s Secret из ключа Vault `secret/data/production/api`.  
**Решение:**
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

### Задача 97: Анализ самых больших ключей в Redis
**Условие:** Найти топ ключей в памяти Redis без блокировки сервера.  
**Решение:**
```bash
redis-cli -h redis.prod.internal -p 6379 -a "Pass" --bigkeys
```

### Задача 98: Шифрование файла манифеста через Mozilla SOPS с использованием Age
**Условие:** Зашифровать файл `secret.yaml` публичным ключом `age1234...`.  
**Решение:**
```bash
sops --encrypt --age age1234567890abcdef... secret.yaml > secret.enc.yaml
```

### Задача 99: Настройка политики Kyverno для запрета запуска privileged контейнеров
**Условие:** Отклонять деплой подов с параметром `privileged: true`.  
**Решение:**
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

### Задача 100: Создание полного Disaster Recovery бэкапа неймспейса через Velero
**Условие:** Снять снапшот всех подов, PV дисков и манифестов неймспейса `production` с ожиданием завершения.  
**Решение:**
```bash
velero backup create prod-full-backup --include-namespaces production --snapshot-volumes --wait
```


---

<!-- enriched:v1 -->

## 🧭 Как работать с задачами

- **Порядок:** сначала попробуйте решить сами в песочнице (`kind` / `k3d` / `docker`), только потом читайте решение.
- **Прогресс:** ведите трекер — задача, дата, время до решения, что загуглили. Повторите проваленные через неделю.
- **Уровень сложности:** помечайте для себя [Junior | Middle | Senior] и собирайте «профиль» слабых мест.

!!! tip "Практика > теория"
    Задача считается закрытой, если вы воспроизвели решение с нуля на чистой машине за отведенное время и можете объяснить каждый шаг.
