# ☁️ 09. Python: Boto3 Deep Dive — Sessions, Paginators, Waiters, Moto

> Уровень: Senior. Цель: надёжный код, который не падает на 1001-м объекте, не течёт по памяти, переживает троттлинг и ретраит правильно. Boto3 sessions, pooling, timeout, retries, backoff, pagination, idempotency + moto.

## 🧱 Архитектура SDK: Client vs Resource vs Session

```python
import boto3

session = boto3.Session(profile_name="prod", region_name="eu-central-1")
# Или с явным ретраем:
from botocore.config import Config

cfg = Config(
    region_name="eu-central-1",
    retries={"max_attempts": 10, "mode": "adaptive"},
    connect_timeout=3, read_timeout=10,
    max_pool_connections=50,
)
session = boto3.Session()
s3c = session.client("s3", config=cfg)            # НИЗКОУРОВНЕВЫЙ: 1:1 операции API
s3r = session.resource("s3")                      # ВЫСОКОУРОВНЕВЫЙ: объекты .get()
```

| | client | resource |
|---|---|---|
| Соответствие API | точное (list_objects_v2) | удобное (bucket.objects.all()) |
| Пагинация | вручную/paginator | автоматом |
| Async | есть (aioboto3) | нет |
| Статус | рекомендуемый путь | maintenance mode |
| Типизация | типы через `boto3-stubs` | слабая |

Для инструментов берите **client**: предсказуемость, все параметры API, совместимость, `boto3-stubs` для mypy.

```python
# boto3-stubs — типы:
# pip install boto3-stubs[essential]
from mypy_boto3_s3 import S3Client

def list_keys(s3: S3Client, bucket: str) -> list[str]:
    paginator = s3.get_paginator("list_objects_v2")
    keys: list[str] = []
    for page in paginator.paginate(Bucket=bucket):
        for obj in page.get("Contents", []):
            keys.append(obj["Key"])
    return keys
```

### Session — изоляция конфигурации

```python
import boto3
from botocore.config import Config

# Разные сессии — разные креды/регионы/ретраи:
sess_eu = boto3.Session(profile_name="prod-eu", region_name="eu-central-1")
sess_us = boto3.Session(profile_name="prod-us", region_name="us-east-1")

# Session кэширует креды, но не клиенты — создавайте клиент на сессию:
s3_eu = sess_eu.client("s3")
s3_us = sess_us.client("s3")

# Thread-safety: Session и client НЕ потокобезопасны полностью — создавайте на поток:
import threading
local = threading.local()

def get_s3():
    if not hasattr(local, "s3"):
        local.s3 = boto3.Session().client("s3")
    return local.s3
```

## 🎫 Credentials: правильная иерархия

Boto3 ищет креды по цепочке (первый найденный побеждает):

```text
1. Явные параметры boto3.Session(aws_access_key_id=...)      # ❌ только для тестов
2. Переменные AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY       # ✅ CI
3. ~/.aws/credentials (profiles)                              # ✅ локально
4. IAM Role контейнера/EC2 (metadata API 169.254.169.254)     # ✅✅ прод — ключей нет вообще!
5. SSO cache (~/.aws/sso/cache)                               # ✅ локально prod
```

```bash
export AWS_PROFILE=staging              # переключение профиля без правки кода
aws sts get-caller-identity             # КТО я сейчас? — всегда проверять перед деструктивным скриптом
aws sso login --profile prod
boto3.setup_default_session(region_name="eu-central-1")
```

!!! danger "Никогда"
    Не хардкодьте AccessKey и не пишите их в git. В проде — только роли (IRSA на EKS / Pod Identity / instance profile). Локально — SSO: `aws sso login --profile prod`. Сканируйте `git log -p | grep AKIA`.

### IRSA / Pod Identity

```yaml
# ServiceAccount с ролью:
apiVersion: v1
kind: ServiceAccount
metadata: {name: devopsctl, namespace: prod, annotations: {eks.amazonaws.com/role-arn: arn:aws:iam::123:role/devopsctl}}
# Pod Identity — новый способ (2024+), без OIDC провайдера:
```

```python
# В коде — ничего не указывать, boto3 сам возьмёт роль из metadata:
import boto3
s3 = boto3.client("s3")  # в EKS pod — роль из SA
# Проверка:
import boto3
print(boto3.client("sts").get_caller_identity())
```

## 🔄 Paginators: тысячи объектов без боли

`list_objects_v2` возвращает максимум 1000 ключей. Ручной цикл с ContinuationToken — источник багов:

```python
import boto3

s3c = boto3.client("s3", region_name="eu-central-1")

paginator = s3c.get_paginator("list_objects_v2")
pages = paginator.paginate(Bucket="logs", Prefix="2026/08/", PaginationConfig={"PageSize": 500})

for page in pages:
    for obj in page.get("Contents", []):
        print(obj["Key"], obj["Size"])

# Однострочник со всеми страницами:
all_keys = [o["Key"] for p in pages for o in p.get("Contents", [])]

# EC2 — аналогично:
ec2 = boto3.client("ec2")
paginator = ec2.get_paginator("describe_instances")
for page in paginator.paginate(Filters=[{"Name": "tag:env", "Values": ["prod"]}]):
    for reservation in page["Reservations"]:
        for inst in reservation["Instances"]:
            print(inst["InstanceId"], inst["State"]["Name"])

# Правильно — не грузить всё в память:
def iter_keys(bucket: str, prefix: str):
    paginator = s3c.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix, PaginationConfig={"PageSize": 1000}):
        for obj in page.get("Contents", []):
            yield obj["Key"]
# Использование:
for key in iter_keys("logs", "2026/08/"):
    process(key)  # O(1) памяти

# Ручной (не делайте):
# token = None
# while True:
#     kwargs = {"Bucket": "logs", "Prefix": "2026/08/"}
#     if token: kwargs["ContinuationToken"] = token
#     resp = s3c.list_objects_v2(**kwargs)
#     for obj in resp.get("Contents", []): yield obj
#     if not resp.get("IsTruncated"): break
#     token = resp.get("NextContinuationToken")  # легко забыть IsTruncated vs NextToken
```

То же для `describe_instances`, `list_users`, `scan` DynamoDB — паттерн универсален: `client.get_paginator("<operation>")`.

## ⏳ Waiters: ждать состояния правильно

Скрипт «создай инстанс → подожди running → настрой» без waiter'а спит вслепую `sleep(30)`:

```python
import boto3

ec2 = boto3.client("ec2", region_name="eu-central-1")
resp = ec2.run_instances(ImageId="ami-0abcdef", MinCount=1, MaxCount=1,
                         InstanceType="t3.medium",
                         TagSpecifications=[{"ResourceType": "instance",
                                             "Tags": [{"Key": "team", "Value": "platform"}]}])
iid = resp["Instances"][0]["InstanceId"]

waiter = ec2.get_waiter("instance_running")
waiter.wait(InstanceIds=[iid], WaiterConfig={"Delay": 5, "MaxAttempts": 40})

# Дождаться termination:
waiter_term = ec2.get_waiter("instance_terminated")
waiter_term.wait(InstanceIds=[iid])

# Свой waiter для произвольного условия (ASG healthy):
import time

def wait_for_asg_healthy(asg_name: str, desired: int = 3, timeout: float = 300):
    asg = boto3.client("autoscaling")
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        state = asg.describe_auto_scaling_groups(AutoScalingGroupNames=[asg_name])["AutoScalingGroups"][0]["Instances"]
        healthy = len([i for i in state if i["HealthStatus"] == "Healthy" and i["LifecycleState"] == "InService"])
        if healthy >= desired:
            return True
        time.sleep(10)
    raise TimeoutError(f"ASG {asg_name} not healthy after {timeout}s")

# Waiter для RDS:
rds = boto3.client("rds")
rds.get_waiter("db_instance_available").wait(DBInstanceIdentifier="mydb", WaiterConfig={"Delay": 30, "MaxAttempts": 60})
```

**Доступные waiters:** `instance_running`, `instance_stopped`, `instance_terminated`, `bucket_exists`, `object_exists`, `db_instance_available`, `stack_create_complete` (CloudFormation).

## 🔁 Retries, backoff, timeout, pooling — production

### Config — центр управления

```python
from botocore.config import Config

cfg = Config(
    region_name="eu-central-1",
    # Retries — adaptive (рекомендуемый) vs standard vs legacy:
    retries={"max_attempts": 10, "mode": "adaptive"},
    # adaptive — учитывает троттлинг и concurrency, standard — только ретраи
    connect_timeout=2,   # TCP connect
    read_timeout=10,     # ожидание ответа
    max_pool_connections=50,  # пул HTTP-соединений (дефолт 10 — мало для многопотока!)
    tcp_keepalive=True,
    # signature_version, endpoint_url для LocalStack/minio
)
s3c = boto3.client("s3", config=cfg)
```

### Retryable vs non-retryable

| Ошибка | Код | Retry? | Действие |
|---|---|---|---|
| Throttling | `Throttling`, `ThrottlingException`, `RequestLimitExceeded` | да, с backoff | adaptive retry |
| 5xx | `InternalError`, `ServiceUnavailable` | да | backoff |
| 429 | `TooManyRequestsException` | да | jittered backoff |
| 4xx | `NoSuchBucket`, `AccessDenied`, `ValidationError` | нет | исправить запрос |
| Timeout | `ReadTimeoutError`, `ConnectTimeoutError` | да | увеличить timeout |

```python
import time
import random
from botocore.exceptions import ClientError, BotoCoreError

def is_retryable(e: Exception) -> bool:
    if isinstance(e, BotoCoreError) and not isinstance(e, ClientError):
        return True  # сетевые
    if isinstance(e, ClientError):
        code = e.response["Error"]["Code"]
        return code in ("Throttling", "ThrottlingException", "RequestLimitExceeded",
                        "InternalError", "ServiceUnavailable", "TooManyRequestsException",
                        "ProvisionedThroughputExceededException", "SlowDown")
    return False

def call_with_backoff(fn, *args, max_attempts=5, base=1.0, **kwargs):
    for attempt in range(max_attempts):
        try:
            return fn(*args, **kwargs)
        except Exception as e:
            if not is_retryable(e) or attempt == max_attempts - 1:
                raise
            delay = base * (2 ** attempt) + random.uniform(0, 1)  # exponential + jitter
            print(f"retry {attempt+1}/{max_attempts} after {delay:.1f}s: {e}")
            time.sleep(delay)
```

### Таймауты — обязательно

```python
# Без таймаута — повесит CLI навсегда при network partition:
# s3c.list_buckets()  # ждёт вечно!
# С таймаутом:
cfg = Config(connect_timeout=2, read_timeout=5)
s3c = boto3.client("s3", config=cfg)
# Для долгих операций (upload большого файла) — увеличить read_timeout:
cfg_long = Config(connect_timeout=5, read_timeout=300)
```

### Пул соединений — для многопотока

```python
from concurrent.futures import ThreadPoolExecutor
import boto3
from botocore.config import Config

cfg = Config(max_pool_connections=50)
s3 = boto3.Session().client("s3", config=cfg)

def upload_one(key: str):
    s3.upload_file(f"/tmp/{key}", "my-bucket", key)

with ThreadPoolExecutor(max_workers=20) as ex:
    ex.map(upload_one, [f"file-{i}" for i in range(100)])
# Если max_pool_connections=10 и workers=20 — 10 потоков ждут сокет, медленнее!
```

## 🆔 Идемпотентность

```python
import boto3

ec2 = boto3.client("ec2")

# ClientToken — идемпотентный create (повтор с тем же токеном не создаст второй ресурс):
import uuid
token = str(uuid.uuid4())
resp = ec2.run_instances(
    ImageId="ami-0abc", MinCount=1, MaxCount=1, InstanceType="t3.micro",
    ClientToken=token
)
# Повтор с тем же token вернёт тот же InstanceId (в течение ~24ч)

# S3 — put_object идемпотентен по ключу (перезапишет):
s3c.put_object(Bucket="my-bucket", Key="config.json", Body=b'{"v":1}')

# DynamoDB — condition expression:
dynamodb = boto3.client("dynamodb")
try:
    dynamodb.put_item(
        TableName="deploys",
        Item={"id": {"S": "web-1.42"}, "status": {"S": "pending"}},
        ConditionExpression="attribute_not_exists(id)"
    )
except dynamodb.exceptions.ConditionalCheckFailedException:
    print("already exists")

# SQS — deduplication для FIFO:
sqs = boto3.client("sqs")
sqs.send_message(QueueUrl="https://sqs.eu-central-1.amazonaws.com/123/my.fifo",
                 MessageBody="deploy web:1.42",
                 MessageGroupId="deploys",
                 MessageDeduplicationId="web-1.42-2026-08-28")
```

## 🏗️ Идиоматичные паттерны DevOps-задач

```python
import boto3

s3c = boto3.client("s3", region_name="eu-central-1")

# Загрузка файла с multipart для больших объектов:
s3c.upload_file("dump.sql.gz", "backups", "pg/dump-2026-08-25.sql.gz",
                ExtraArgs={"ServerSideEncryption": "aws:kms", "SSEKMSKeyId": "alias/prod",
                           "StorageClass": "STANDARD_IA"},
                Callback=ProgressPercentage("dump.sql.gz"))

# Presigned URL для выгрузки лога без публичного бакета:
url = s3c.generate_presigned_url(
    "get_object", Params={"Bucket": "logs", "Key": "app.log"},
    ExpiresIn=3600)

# Cost Explorer — отчёт расходов в Slack:
ce = boto3.client("ce", region_name="us-east-1")  # CE только в us-east-1!
usage = ce.get_cost_and_usage(TimePeriod={"Start": "2026-08-01", "End": "2026-09-01"},
                              Granularity="MONTHLY",
                              Metrics=["UnblendedCost"],
                              GroupBy=[{"Type": "DIMENSION", "Key": "SERVICE"}])

# STS — проверить кто я:
sts = boto3.client("sts")
print(sts.get_caller_identity())
# AssumeRole:
creds = sts.assume_role(RoleArn="arn:aws:iam::123:role/deploy", RoleSessionName="devopsctl")["Credentials"]
sess = boto3.Session(
    aws_access_key_id=creds["AccessKeyId"],
    aws_secret_access_key=creds["SecretAccessKey"],
    aws_session_token=creds["SessionToken"]
)
```

Ошибки — по коду, не по тексту:

```python
from botocore.exceptions import ClientError
try:
    s3c.head_object(Bucket="b", Key="k")
except ClientError as e:
    code = e.response["Error"]["Code"]
    if code == "404" or code == "NoSuchKey":
        print("not found — create default")
    elif code == "AccessDenied":
        print("проверьте роль IRSA")
        raise
    elif is_retryable(e):
        print("retry")
    else:
        raise
```

---

## 📁 Файлы, ОС, система — для AWS-инструментов

```python
import pathlib
import shutil
import tempfile
import os
import stat

# Скачать большой S3 объект — не в память, а в файл:
with tempfile.NamedTemporaryFile(delete=False, suffix=".gz") as tmp:
    s3c.download_file("my-bucket", "large/dump.sql.gz", tmp.name)
    print(f"downloaded to {tmp.name} size={pathlib.Path(tmp.name).stat().st_size}")

# Потоковая загрузка без временного файла — через streaming:
resp = s3c.get_object(Bucket="my-bucket", Key="large.log")
with open("/tmp/out.log", "wb") as f:
    shutil.copyfileobj(resp["Body"], f)  # Body — StreamingBody

# Права — скачать Secret в файл с 0600:
p = pathlib.Path("/tmp/secret.json")
p.write_bytes(resp["Body"].read())
p.chmod(0o600)

# Disk — проверить место перед download:
total, used, free = shutil.disk_usage("/tmp")
obj_size = s3c.head_object(Bucket="b", Key="k")["ContentLength"]
if free < obj_size * 2:
    raise SystemExit("not enough disk for download")

# Subprocess — вызов AWS CLI из Python (если нужен фич которого нет в boto3):
import subprocess
result = subprocess.run(
    ["aws", "s3", "cp", "s3://my-bucket/key", "/tmp/key", "--only-show-errors"],
    capture_output=True, text=True, timeout=120, check=False
)
if result.returncode != 0:
    raise RuntimeError(result.stderr)

# File locking — не качать один и тот же артефакт параллельно:
from filelock import FileLock
with FileLock("/tmp/s3-download.lock", timeout=0):
    s3c.download_file("b", "k", "/tmp/k")

# Signals — прервать долгую выгрузку:
import signal
shutdown = False
def handler(sig, frame):
    global shutdown
    shutdown = True
signal.signal(signal.SIGTERM, handler)
for key in iter_keys("logs", "2026/"):
    if shutdown:
        break
    s3c.download_file("logs", key, f"/tmp/{key.replace('/','_')}")
```

---

## 🌐 Networking глубоко — boto3 под капотом

```python
import socket
import ssl

# Boto3 использует urllib3 + пул соединений. Под капотом — TCP+TLS:
# - DNS резолв endpoint'а (s3.eu-central-1.amazonaws.com)
# - TLS handshake (verify=True — проверка сертификата)
# - HTTP/1.1 keep-alive (max_pool_connections)

# Проверка доступности endpoint'а до boto3 (быстрая диагностика):
def is_aws_reachable(region: str = "eu-central-1", timeout: float = 2) -> bool:
    host = f"s3.{region}.amazonaws.com"
    try:
        with socket.create_connection((host, 443), timeout=timeout):
            return True
    except OSError:
        return False

# TLS — не отключать:
from botocore.config import Config
cfg = Config()  # verify_ssl True по умолчанию
# cfg = Config(verify_ssl=False)  # никогда в проде!

# Endpoint override — для LocalStack / minio / VPC endpoint:
s3_local = boto3.client("s3", endpoint_url="http://localhost:4566", region_name="eu-central-1",
                        aws_access_key_id="test", aws_secret_access_key="test")
# или minio:
# s3_minio = boto3.client("s3", endpoint_url="http://minio.prod.svc:9000", region_name="us-east-1")

# Unix socket — не для AWS, но для local metadata (IMDSv2):
# Boto3 сам ходит в 169.254.169.254 для роли — защита:
# - hop limit 1 (только с хоста)
# - IMDSv2 требует PUT /latest/api/token
```

---

## 🚨 Exceptions глубоко

```python
from botocore.exceptions import ClientError, BotoCoreError, NoCredentialsError, EndpointConnectionError

# Иерархия:
# BotoCoreError
#  ├── NoCredentialsError — нет кредов
#  ├── EndpointConnectionError — сеть
#  ├── ReadTimeoutError, ConnectTimeoutError
#  └── ClientError — 4xx/5xx от AWS (есть response dict)
#       └── response["Error"]["Code"] — стабильный код

class AwsError(Exception):
    pass

class RetryableAwsError(AwsError):
    pass

class FatalAwsError(AwsError):
    pass

def classify_aws_error(e: Exception) -> AwsError:
    if isinstance(e, NoCredentialsError):
        return FatalAwsError(f"no credentials: {e}")
    if isinstance(e, EndpointConnectionError):
        return RetryableAwsError(f"endpoint unreachable: {e}")
    if isinstance(e, ClientError):
        code = e.response["Error"]["Code"]
        if code in ("Throttling", "RequestLimitExceeded", "ServiceUnavailable", "InternalError", "SlowDown"):
            return RetryableAwsError(f"retryable {code}: {e}")
        return FatalAwsError(f"fatal {code}: {e}")
    return FatalAwsError(str(e))

# Chaining:
try:
    s3c.head_object(Bucket="b", Key="k")
except ClientError as e:
    raise FatalAwsError(f"s3 head failed: {e}") from e

# ExceptionGroup — батч операций:
errors = []
for key in keys:
    try:
        s3c.delete_object(Bucket="b", Key=key)
    except Exception as e:
        errors.append(e)
if errors:
    raise ExceptionGroup("s3 batch failures", errors)

# except*:
try:
    raise ExceptionGroup("eg", [RetryableAwsError("throttle"), FatalAwsError("not found")])
except* RetryableAwsError as eg:
    print(f"retry {len(eg.exceptions)}")
except* FatalAwsError as eg:
    print(f"fatal {len(eg.exceptions)}")
```

---

## 📝 Logging глубоко

```python
import logging
import sys
import contextvars
from pythonjsonlogger import jsonlogger

# Boto3 очень шумный на DEBUG — приглушить:
logging.getLogger("botocore").setLevel(logging.WARNING)
logging.getLogger("boto3").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)

# JSON логи с correlation:
cid = contextvars.ContextVar("cid", default="-")
handler = logging.StreamHandler(sys.stderr)
handler.setFormatter(jsonlogger.JsonFormatter("%(asctime)s %(levelname)s %(name)s %(message)s %(correlation)s"))
handler.addFilter(lambda r: setattr(r, "correlation", cid.get()) or True)
logging.getLogger().handlers = [handler]
logging.getLogger().setLevel(logging.INFO)

# Не логгировать секреты:
class MaskFilter(logging.Filter):
    def filter(self, record):
        msg = record.getMessage()
        if "aws_secret" in msg.lower() or "AKIA" in msg:
            record.msg = "***MASKED***"
            record.args = ()
        return True

# Boto3 — включить debug только для одного вызова:
# boto3.set_stream_logger("boto3.resources", logging.DEBUG)  # только при отладке!

# Loki — логи уже в stderr JSON, Promtail собирает с labels {app="devopsctl", region="eu-central-1"}
```

---

## 🔒 Security

```python
# Секреты — не в коде, не в git:
# ENV, K8s Secret, AWS Secrets Manager, Vault
import boto3
secrets = boto3.client("secretsmanager", region_name="eu-central-1")
secret = secrets.get_secret_value(SecretId="prod/db/password")["SecretString"]

# Command injection — если строите CLI вызов:
import shlex, subprocess
key = "my key; rm -rf /"
# subprocess.run(f"aws s3 cp s3://b/{key} /tmp/x", shell=True)  # RCE!
subprocess.run(["aws", "s3", "cp", f"s3://b/{key}", "/tmp/x"])

# Path traversal — если ключ из пользователя:
import pathlib
def safe_key(user: str) -> str:
    if ".." in user or user.startswith("/") or "//" in user:
        raise ValueError("bad key")
    return user

# SSRF — если URL для presigned из пользователя:
import ipaddress, socket, urllib.parse
def block_private_url(url: str):
    host = urllib.parse.urlparse(url).hostname
    ip = ipaddress.ip_address(socket.gethostbyname(host))
    if ip.is_private or ip.is_loopback:
        raise ValueError("private URL blocked")

# TLS — не отключать:
# s3 = boto3.client("s3", verify=True)  # дефолт
# s3 = boto3.client("s3", verify=False)  # никогда!

# Unsafe YAML/pickle — если парсите S3 объекты:
import yaml
# yaml.safe_load(obj["Body"].read())  # не yaml.load!
# pickle.loads(obj["Body"].read())  # никогда от пользователя!

# Dependency scan:
# pip-audit --desc
# trivy fs --severity HIGH,CRITICAL .
```

---

## 📊 Data processing — S3 как data lake

```python
import gzip
import csv
import json
import io

# Потоковый CSV из S3 — не грузить 1GB в память:
resp = s3c.get_object(Bucket="data", Key="events.csv.gz")
# resp["Body"] — StreamingBody
with gzip.GzipFile(fileobj=resp["Body"], mode="rb") as gz:
    reader = csv.DictReader(io.TextIOWrapper(gz, encoding="utf-8"))
    for row in reader:
        process(row)

# JSONL gzipped:
import gzip, json
resp = s3c.get_object(Bucket="data", Key="events.jsonl.gz")
with gzip.GzipFile(fileobj=resp["Body"]) as gz:
    for line in io.TextIOWrapper(gz, encoding="utf-8"):
        obj = json.loads(line)
        process(obj)

# Пагинация + обработка:
def process_all(prefix: str):
    paginator = s3c.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket="data", Prefix=prefix, PaginationConfig={"PageSize": 1000}):
        for obj in page.get("Contents", []):
            yield obj["Key"]

# Tar — скачать чарт/артефакт:
import tarfile, tempfile, pathlib
with tempfile.NamedTemporaryFile(suffix=".tar.gz", delete=False) as tmp:
    s3c.download_file("artifacts", "chart.tar.gz", tmp.name)
    with tarfile.open(tmp.name, "r:gz") as tar:
        for m in tar.getmembers():
            if m.name.startswith("/") or ".." in m.name:
                continue
            print(m.name)
```

---

## 🗄️ Databases — DynamoDB / RDS через boto3 vs psycopg

```python
# DynamoDB — через boto3:
dynamodb = boto3.client("dynamodb", region_name="eu-central-1")
dynamodb.put_item(TableName="deploys", Item={"pk": {"S": "web#1.42"}, "status": {"S": "ok"}})
# Пагинация scan/query:
paginator = dynamodb.get_paginator("query")
for page in paginator.paginate(TableName="deploys", KeyConditionExpression="pk = :pk",
                               ExpressionAttributeValues={":pk": {"S": "web#1.42"}}):
    for item in page["Items"]:
        print(item)

# RDS — через psycopg (не через boto3, кроме RDS Data API):
import psycopg_pool
pool = psycopg_pool.ConnectionPool(
    "host=mydb.abc.eu-central-1.rds.amazonaws.com dbname=app user=app password=secret connect_timeout=5",
    min_size=2, max_size=10
)
with pool.connection() as conn:
    with conn.transaction():
        conn.execute("INSERT INTO deploys(image) VALUES (%s)", ("web:1.42",))
# Таймауты, пул, prepared statements — см. 06/08
```

---

## 🔭 Observability

```python
from prometheus_client import Counter, Histogram
import time
import logging

S3_CALLS = Counter("aws_s3_calls_total", "s3 calls", ["op", "code"])
S3_LATENCY = Histogram("aws_s3_latency_seconds", "latency", ["op"])

def s3_call(op: str, fn, *args, **kwargs):
    start = time.perf_counter()
    try:
        result = fn(*args, **kwargs)
        S3_CALLS.labels(op, "ok").inc()
        return result
    except Exception as e:
        code = getattr(e, "response", {}).get("Error", {}).get("Code", type(e).__name__)
        S3_CALLS.labels(op, code).inc()
        raise
    finally:
        S3_LATENCY.labels(op).observe(time.perf_counter() - start)

# Использование:
s3_call("head_object", s3c.head_object, Bucket="b", Key="k")

# Health — для /readyz:
def aws_health() -> bool:
    try:
        boto3.client("sts", region_name="eu-central-1", config=Config(connect_timeout=1, read_timeout=1)).get_caller_identity()
        return True
    except Exception:
        return False

# Трассировка — boto3 поддерживает opentelemetry instrumentation:
# pip install opentelemetry-instrumentation-botocore
# from opentelemetry.instrumentation.botocore import BotocoreInstrumentor
# BotocoreInstrumentor().instrument()
```

---

## 🔄 CI/CD

```yaml
stages: [lint, test, security, build, publish]

lint:
  stage: lint
  image: ghcr.io/astral-sh/uv:python3.12-bookworm-slim
  script:
    - uv sync --frozen
    - uv run ruff format --check .
    - uv run ruff check .
    - uv run mypy src --strict
    - uv run pyright --stats

unit:
  stage: test
  script:
    - uv run pytest tests/unit -q --cov=src --cov-fail-under=80 -n auto
    # moto для AWS, respx для HTTP

integration:
  stage: test
  image: docker:24
  services: [docker:24-dind]
  script:
    - docker compose up -d localstack
    - uv run pytest tests/integration -q --timeout=60  # против LocalStack
    - docker compose down

security:
  stage: security
  script:
    - uv run pip-audit --desc
    - trivy fs --severity HIGH,CRITICAL --exit-code 1 .
    - uv run bandit -r src

build:
  stage: build
  script:
    - uv build
    - cyclonedx-py environment -o sbom.json
  artifacts: {paths: [dist/, sbom.json]}

container:
  stage: build
  image: docker:24
  services: [docker:24-dind]
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - trivy image --exit-code 1 $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - cosign sign --yes $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

publish:
  stage: publish
  script:
    - uv publish --trusted-publishing always
  rules: [{if: '$CI_COMMIT_TAG'}]
```

```dockerfile
FROM python:3.12-slim
RUN pip install --no-cache-dir boto3 botocore
COPY app.py /
USER 65534
CMD ["python", "app.py"]
```

---

## 🧪 Тестирование с moto: AWS в памяти

```python
import boto3
import moto
import pytest


@pytest.fixture
def aws(monkeypatch):
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "testing")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "testing")
    monkeypatch.setenv("AWS_DEFAULT_REGION", "eu-central-1")
    monkeypatch.setenv("AWS_EC2_METADATA_DISABLED", "true")
    with moto.mock_aws():
        yield boto3.client("s3", region_name="eu-central-1")


def test_backup_upload(aws):
    aws.create_bucket(Bucket="backups")
    upload_backup("backups", b"payload")

    obj = aws.get_object(Bucket="backups", Key="latest.bin")
    assert obj["Body"].read() == b"payload"


def upload_backup(bucket: str, data: bytes):
    boto3.client("s3", region_name="eu-central-1").put_object(Bucket=bucket, Key="latest.bin", Body=data)


# EC2 + paginator:
def test_ec2_paginator(aws_ec2):
    ec2 = aws_ec2
    for i in range(5):
        ec2.run_instances(ImageId="ami-123", MinCount=1, MaxCount=1, InstanceType="t3.micro")
    paginator = ec2.get_paginator("describe_instances")
    count = sum(len(r["Instances"]) for p in paginator.paginate() for r in p["Reservations"])
    assert count == 5


# Waiter — не работает в moto, мокайте:
from unittest.mock import patch

def test_waiter_mocked():
    with patch("botocore.waiter.Waiter.wait") as mock_wait:
        my_func_that_waits()
        mock_wait.assert_called_once()

# Интеграционно-честнее: LocalStack в docker-compose
# services:
#   localstack:
#     image: localstack/localstack:3
#     environment: [SERVICES=s3,ec2,sts]
#     ports: ["4566:4566"]
```

Правило: unit-тесты — moto; e2e перед релизом — LocalStack/тестовый аккаунт.

---

## 💥 Failure modes — boto3

| Симптом | Код | Причина | Диагностика | Лечение |
|---|---|---|---|---|
| `NoCredentialsError` | — | нет кредов | `aws sts get-caller-identity` | IRSA / `aws sso login` |
| `Throttling` | 429 | много запросов | CloudTrail | backoff, уменьшить concurrency |
| `SlowDown` (S3) | 503 | >3500 rps на префикс | S3 metrics | рандомизировать префикс, backoff |
| `NoSuchBucket` | 404 | bucket нет | `head_bucket` | создать, проверить регион |
| `AccessDenied` | 403 | RBAC | `sts get-caller-identity` | IAM policy, bucket policy |
| `ReadTimeout` | — | сеть, медленный S3 | timeout | увеличить `read_timeout` |
| `EndpointConnectionError` | — | нет сети/VPC endpoint | `is_aws_reachable` | VPC endpoint, NAT |
| `1000 keys max` | — | забыли paginator | `KeyCount==1000` | `get_paginator` |
| `Oversized page` | — | грузят всё в RAM | OOM | генератор `yield`, `PageSize` |
| `ExpiredToken` | 403 | STS токен истёк | `ExpiredTokenException` | обновить, `assume_role` |

---

## 🧪 Лаборатория

### Lab 1 — paginator + streaming download

```python
import boto3, moto

with moto.mock_aws():
    s3 = boto3.client("s3", region_name="eu-central-1")
    s3.create_bucket(Bucket="lab")
    for i in range(1500):
        s3.put_object(Bucket="lab", Key=f"file-{i:04d}.txt", Body=b"x")
    # Без paginator вернёт 1000:
    r = s3.list_objects_v2(Bucket="lab")
    assert r["KeyCount"] == 1000
    # С paginator — все:
    paginator = s3.get_paginator("list_objects_v2")
    keys = [o["Key"] for p in paginator.paginate(Bucket="lab") for o in p.get("Contents", [])]
    assert len(keys) == 1500
    print(f"paginator ok: {len(keys)}")
```

### Lab 2 — retries с jitter

```python
import time, random
from botocore.exceptions import ClientError

def is_retryable(e):
    if isinstance(e, ClientError):
        return e.response["Error"]["Code"] in ("Throttling","ServiceUnavailable","InternalError")
    return False

def with_retry(fn, max_attempts=5):
    for attempt in range(max_attempts):
        try:
            return fn()
        except Exception as e:
            if not is_retryable(e) or attempt == max_attempts-1:
                raise
            delay = (2 ** attempt) + random.uniform(0,1)
            print(f"retry {attempt+1} delay {delay:.1f}")
            time.sleep(delay)

# Тест с moto — симулировать троттлинг через mock:
from unittest.mock import patch, MagicMock
mock = MagicMock(side_effect=[ClientError({"Error":{"Code":"Throttling","Message":"throttle"}},"x"), {"ok": True}])
with_retry(lambda: mock())
assert mock.call_count == 2
```

### Lab 3 — LocalStack e2e

```yaml
# docker-compose.yml
services:
  localstack:
    image: localstack/localstack:3
    ports: ["4566:4566"]
    environment: [SERVICES=s3]
```

```bash
docker compose up -d
AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test aws --endpoint-url http://localhost:4566 s3 mb s3://test
python -c "import boto3; print(boto3.client('s3', endpoint_url='http://localhost:4566', region_name='eu-central-1', aws_access_key_id='test', aws_secret_access_key='test').list_buckets())"
docker compose down
```

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

**В6. Чем `Config(max_pool_connections=10)` опасен при `ThreadPoolExecutor(max_workers=50)`?**
<details><summary>Ответ</summary>
Пул соединений — лимит одновременных HTTP-сокетов. 50 потоков на 10 сокетов → 40 ждут, throughput падает в 5×, таймауты. Ставьте `max_pool_connections >= max_workers` (50) + `tcp_keepalive=True`.
</details>

**В7. Зачем `ClientToken` при `run_instances` и как обеспечить идемпотентность без него?**
<details><summary>Ответ</summary>
ClientToken делает create идемпотентным: повтор с тем же токеном (UUID) в течение 24ч вернёт тот же InstanceId, не создаст дубликат (важно при ретраях). Без него — `describe_instances` по тегу + `create` только если нет, или DynamoDB conditional write.
</details>

**В8. Как отличить retryable Throttling от fatal AccessDenied и почему нельзя ретраить второй?**
<details><summary>Ответ</summary>
Throttling (429/ThrottlingException) — временная перегрузка, backoff поможет. AccessDenied (403) — нет прав, ретрай не поможет, только исправит IAM. Классифицировать по `e.response["Error"]["Code"]`, ретраить только `Throttling/ServiceUnavailable/InternalError`.
</details>

**В9. Почему `s3.get_object(Bucket, Key)["Body"].read()` на 2GB объекте уронит pod и как правильно?**
<details><summary>Ответ</summary>
`read()` грузит весь объект в память → OOMKilled. Правильно — потоком: `shutil.copyfileobj(resp["Body"], open("/tmp/out","wb"))` или `download_file` или `StreamingBody.iter_chunks()`. Для CSV — `gzip.GzipFile(fileobj=Body)` + `csv.DictReader`.
</details>

**В10. Чем moto отличается от LocalStack и когда что брать?**
<details><summary>Ответ</summary>
moto — in-memory мок в процессе pytest (быстро, без Docker, но не 100% покрытие API, waiters не работают). LocalStack — эмулятор AWS в Docker (медленнее, но ближе к реальности: endpoint_url, presigned URLs, IAM). Unit — moto, интеграция/e2e — LocalStack + `endpoint_url="http://localhost:4566"`.
</details>

---

*Что дальше:* [10. Профилирование и производительность](10-python-performance-profiling.md) · [04. Asyncio](04-python-asyncio-concurrency.md)
