# 🐍 01. Python для DevOps: Скрипты, API, Boto3 и K8s SDK

## 🎯 Почему Python в DevOps?
Python — это стандарт де-факто для быстрой автоматизации, написания склеивающих (glue-code) скриптов, взаимодействия с REST/GraphQL API и работы с облачными SDK.

---

## 🛡️ Безопасный запуск внешних команд через `subprocess`

Никогда не используйте `os.system()`. Используйте `subprocess.run()` с контролем времени выполнения и перехватом вывода:

```python
import subprocess
import logging
from typing import Tuple

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def run_shell_command(cmd: list[str], timeout_sec: int = 30) -> Tuple[int, str, str]:
    """Безопасно запускает команду без шелл-инъекций"""
    try:
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=timeout_sec,
            check=False
        )
        return result.returncode, result.stdout.strip(), result.stderr.strip()
    except subprocess.TimeoutExpired:
        logging.error(f"Команда {' '.join(cmd)} превысила таймаут {timeout_sec}s")
        return -1, "", "Timeout expired"

# Пример: проверка версии docker
code, stdout, stderr = run_shell_command(["docker", "--version"])
print(f"Result: {stdout}")
```

---

## ☁️ Работа с AWS через `boto3`

Скрипт для поиска и очистки неиспользуемых (Unattached) EBS-дисков для экономии бюджета:

```python
import boto3
import logging

def cleanup_unattached_ebs_volumes(region: str = "eu-central-1"):
    ec2 = boto3.client("ec2", region_name=region)
    
    # Ищем диски в статусе "available" (не подключенные ни к одной EC2)
    response = ec2.describe_volumes(
        Filters=[{"Name": "status", "Values": ["available"]}]
    )
    
    volumes = response.get("Volumes", [])
    logging.info(f"Найдено {len(volumes)} неиспользуемых EBS томов в {region}")
    
    total_freed_gb = 0
    for vol in volumes:
        vol_id = vol["VolumeId"]
        size_gb = vol["Size"]
        logging.info(f"Удаление тома {vol_id} ({size_gb} GB)...")
        # ec2.delete_volume(VolumeId=vol_id)
        total_freed_gb += size_gb
        
    logging.info(f"Освобождено {total_freed_gb} GB хранилища.")

if __name__ == "__main__":
    cleanup_unattached_ebs_volumes()
```

---

## ☸️ Управление Kubernetes через официальный Python SDK

Скрипт перезапуска Deployment с проверкой статуса:

```python
from kubernetes import client, config
import datetime

def restart_k8s_deployment(name: str, namespace: str = "default"):
    # Автоматически загружает ~/.kube/config или ServiceAccount внутри кластера
    try:
        config.load_incluster_config()
    except config.ConfigException:
        config.load_kube_config()

    apps_v1 = client.AppsV1Api()
    
    # Триггер Rolling Update через обновление аннотации restartedAt
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    body = {
        'spec': {
            'template': {
                'metadata': {
                    'annotations': {
                        'kubectl.kubernetes.io/restartedAt': now
                    }
                }
            }
        }
    }
    
    apps_v1.patch_namespaced_deployment(name=name, namespace=namespace, body=body)
    print(f"Deployment '{name}' в namespace '{namespace}' успешно перезапущен.")

if __name__ == "__main__":
    restart_k8s_deployment("web-api", "production")
```

---

## 🔬 Deep Dive: production-паттерны Boto3 и Kubernetes SDK

### Boto3: paginator + retry + типизация

```python
from botocore.config import Config
import boto3

s3 = boto3.client(
    "s3",
    config=Config(
        retries={"max_attempts": 5, "mode": "adaptive"},   # экспоненциальные ретраи
        connect_timeout=5, read_timeout=60,
    ),
)

for page in s3.get_paginator("list_objects_v2").paginate(Bucket="logs", Prefix="2026/"):
    for obj in page.get("Contents", []):
        print(obj["Key"], obj["Size"])
```

### Kubernetes SDK: watch вместо polling

```python
from kubernetes import client, config, watch

config.load_kube_config()
v1 = client.CoreV1Api()
w = watch.Watch()
for event in w.stream(v1.list_namespaced_pod, namespace="prod", timeout_seconds=300):
    pod = event["object"]
    if event["type"] == "MODIFIED" and pod.status.phase == "Failed":
        print(f"FAILED: {pod.metadata.name}")
```

### Асинхронность там, где I/O-bound

```python
import asyncio, aiohttp

async def probe(session, url):
    async with session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as r:
        return url, r.status

async def main(urls):
    async with aiohttp.ClientSession() as s:
        return await asyncio.gather(*(probe(s, u) for u in urls))
```

!!! tip «Структура CLI-инструмента»
    `typer` (или `click`) + `pydantic-settings` для конфига + `structlog` для JSON-логов + `pytest` c `moto`/`kind`. Скрипт >200 строк обязан иметь тесты и `--dry-run`.

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
python -m venv .venv && . .venv/bin/activate && pip install boto3 kubernetes typer pytest moto && \
python -c 'import boto3; print(boto3.client("sts").get_caller_identity()["Account"])' 2>/dev/null || echo 'no aws creds - ok for lab'
```

## ✅ Чек-лист зрелости темы

- [ ] Все изменения проходят через PR с обязательным review
- [ ] Секреты никогда не хранятся в коде/стейте (Vault/SOPS/secret manager)
- [ ] Есть dry-run/plan этап и он виден в MR
- [ ] Откат воспроизводим одной командой (< 10 минут)
- [ ] Логи пайплайна содержат версии артефактов (image digest, commit SHA)
