# ☁️ 09. Python: Boto3 Deep Dive — Sessions, Paginators, Waiters, Moto

## 🧱 Архитектура SDK: Client vs Resource vs Session

```python
import boto3

session = boto3.Session(profile_name="prod", region_name="eu-central-1")

s3c = session.client("s3")            # НИЗКОУРОВНЕВЫЙ: 1:1 операции API, полный контроль
s3r = session.resource("s3")          # ВЫСОКОУРОВНЕВЫЙ: объекты .get(), .objects.filter()
```

| | client | resource |
|---|---|---|
| Соответствие API | точное (list_objects_v2) | удобное (bucket.objects.all()) |
| Пагинация | вручную/paginator | автоматом |
| Async | есть (aioboto3) | нет |
| Статус | рекомендуемый путь | maintenance mode |

Для инструментов берите **client**: предсказуемость, все параметры API, совместимость.

## 🎫 Credentials: правильная иерархия

Boto3 ищет креды по цепочке (первый найденный побеждает):

```text
1. Явные параметры boto3.Session(aws_access_key_id=...)      # ❌ только для тестов
2. Переменные AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY       # ✅ CI
3. ~/.aws/credentials (profiles)                              # ✅ локально
4. IAM Role контейнера/EC2 (metadata API)                     # ✅✅ прод — ключей нет вообще!
```

```bash
export AWS_PROFILE=staging              # переключение профиля без правки кода
aws sts get-caller-identity             # КТО я сейчас? — всегда проверять перед деструктивным скриптом
boto3.setup_default_session(region_name="eu-central-1")
```

!!! danger "Никогда"
    Не хардкодьте AccessKey и не пишите их в git. В проде — только роли (IRSA на EKS / Pod Identity / instance profile). Локально — SSO: `aws sso login --profile prod`.

## 🔄 Paginators: тысячи объектов без боли

`list_objects_v2` возвращает максимум 1000 ключей. Ручной цикл с ContinuationToken — источник багов:

```python
paginator = s3c.get_paginator("list_objects_v2")
pages = paginator.paginate(Bucket="logs", Prefix="2026/08/", PaginationConfig={"PageSize": 500})

for page in pages:
    for obj in page.get("Contents", []):
        yield obj["Key"], obj["Size"]

# Однострочник со всеми страницами:
all_keys = [o["Key"] for p in pages for o in p.get("Contents", [])]
```

То же для EC2 (`describe_instances`), IAM (`list_users`) — паттерн универсален: `client.get_paginator("<operation>")`.

## ⏳ Waiters: ждать состояния правильно

Скрипт «создай инстанс → подожди running → настрой» без waiter'а спит вслепую `sleep(30)`:

```python
ec2 = session.client("ec2")
resp = ec2.run_instances(ImageId="ami-...", MinCount=1, MaxCount=1,
                         InstanceType="t3.medium",
                         TagSpecifications=[{"ResourceType": "instance",
                                             "Tags": [{"Key": "team", "Value": "platform"}]}])
iid = resp["Instances"][0]["InstanceId"]

waiter = ec2.get_waiter("instance_running")           # опрос каждые N сек с backoff
waiter.wait(InstanceIds=[iid], WaiterConfig={"Delay": 5, "MaxAttempts": 40})

# Свой waiter для произвольного условия:
while True:
    state = asg.describe_auto_scaling_groups(AutoScalingGroupNames=["web"]) \
               ["AutoScalingGroups"][0]["Instances"]
    if len([i for i in state if i["HealthStatus"] == "Healthy"]) >= 3:
        break
    time.sleep(10)
```

## 🏗️ Идиоматичные паттерны DevOps-задач

```python
# Загрузка файла с multipart для больших объектов:
s3c.upload_file("dump.sql.gz", "backups", "pg/dump-2026-08-25.sql.gz",
                ExtraArgs={"ServerSideEncryption": "aws:kms", "StorageClass": "STANDARD_IA"},
                Callback=ProgressPercentage("dump.sql.gz"))   # прогресс-бар

# Presigned URL для выгрузки лога без публичного бакета:
url = s3c.generate_presigned_url(
    "get_object", Params={"Bucket": "logs", "Key": "k"},
    ExpiresIn=3600)

# Cost Explorer — отчёт расходов в Slack:
ce = session.client("ce")
usage = ce.get_cost_and_usage(TimePeriod={"Start": "2026-08-01", "End": "2026-09-01"},
                              Granularity="MONTHLY",
                              Metrics=["UnblendedCost"],
                              GroupBy=[{"Type": "DIMENSION", "Key": "SERVICE"}])
```

Ошибки — по коду, не по тексту:

```python
from botocore.exceptions import ClientError
try:
    s3c.head_object(Bucket="b", Key="k")
except ClientError as e:
    code = e.response["Error"]["Code"]
    if code == "404": create_default()
    elif code == "AccessDenied": log.error("проверьте роль IRSA"); raise
```

## 🧪 Тестирование с moto: AWS в памяти

```python
import moto, boto3, pytest

@pytest.fixture
def aws(monkeypatch):
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "testing")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "testing")
    monkeypatch.setenv("AWS_DEFAULT_REGION", "eu-central-1")
    with moto.mock_aws():
        yield boto3.client("s3", region_name="eu-central-1")

def test_backup_upload(aws):
    aws.create_bucket(Bucket="backups")
    upload_backup("backups", b"payload")
    obj = aws.get_object(Bucket="backups", Key="latest.bin")
    assert obj["Body"].read() == b"payload"

# Интеграционно-честнее: LocalStack в docker-compose (см. Lab 05).
```

Правило: unit-тесты — moto; e2e перед релизом — LocalStack/тестовый аккаунт.

## ❓ Пять вопросов для самопроверки

---


## ✅ Проверь себя

> Отвечай вслух до раскрытия ответа. Если «не помню» — вернись к разделу.


**В1. Почему в проде скрипт должен использовать IAM Role, а не ключи из ENV?**
<details><summary>Ответ</summary>
Роль выдаёт временные креды автоматически через metadata API: нет секрета в переменных окружения (утечка через crash-логи/`env`), нет ротации руками, доступ привязан к конкретному pod'у (IRSA). Ключи статичны и утекут рано или поздно.
</details>

**В2. Сколько объектов вернёт один вызов list_objects_v2 и как получить остальные?**
<details><summary>Ответ</summary>
До 1000 ключей. Остальные — через paginator (он прозрачно гоняет вызовы с ContinuationToken) либо resource-API `bucket.objects.filter()`. Ручное отслеживание IsTruncated/NextContinuationToken — рассадник off-by-one ошибок.
</details>

**В3. Зачем waiter вместо time.sleep после создания ресурса?**
<details><summary>Ответ</summary>
Sleep угадывает задержку: слишком короткий — упадёт «resource not found», длинный — минуты простоя пайплайна. Waiter опрашивает реальное состояние с настроенным интервалом/лимитом попыток и падает с внятной ошибкой по таймауту.
</details>

**В4. Как тестировать функцию, которая пишет в S3, не трогая AWS?**
<details><summary>Ответ</summary>
moto.mock_aws(): эмулятор перехватывает botocore на уровне запросов — функция честно использует boto3, а бакеты создаются в памяти теста. Плюс фикстура выставляет фейковые AWS_* переменные, чтобы не подхватились реальные креды.
</details>

**В5. Почему ошибки обрабатывают по Error.Code, а не парсингом строки сообщения?**
<details><summary>Ответ</summary>
Тексты сообщений меняются между версиями SDK и локализациями, коды — стабильный контракт API (ThrottlingException, NoSuchBucket, AccessDenied). Разбор строк ломается молча при апгрейде библиотеки.
</details>

---

*Что дальше:* [10. Профилирование и производительность](10-python-performance-profiling.md) · [04. Asyncio](04-python-asyncio-concurrency.md)
