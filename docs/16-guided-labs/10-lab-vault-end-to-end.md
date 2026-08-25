# 🔐 Lab 10: Vault end-to-end — от KV до динамических кредов и ESO

> **Время:** 90 минут | **Уровень:** Middle→Senior | **Нужно:** Docker, kubectl (kind из [Lab 03](03-lab-kubernetes-kind-app.md))
> **Результат:** полный путь секрета в проде: KV v2 → AppRole для CI → динамические креды PostgreSQL → External Secrets Operator в кластере. Теория — в [10.3 Vault Deep Dive](../10-security-and-cloud/03-hashicorp-vault-deep-dive.md).

## 🧪 Часть 1: Сервер Vault в dev-режиме + первый секрет (10 мин)

```bash
# Dev-режим: всё в памяти, root-токен печатается в консоль. ТОЛЬКО для обучения!
docker run --rm -d --name vault -p 8200:8200 \
  -e VAULT_DEV_ROOT_TOKEN_ID=lab-root -e VAULT_ADDR=http://0.0.0.0:8200 hashicorp/vault:1.17

export VAULT_ADDR=http://127.0.0.1:8200
export VAULT_TOKEN=lab-root
vault status

# KV v2: включить движок и положить первый секрет
vault secrets enable -path=secret kv-v2
vault kv put secret/shop/api db_url="postgres://shop:changeme@pg:5432/shop" api_key="demo-key-123"
vault kv get secret/shop/api

# Версионирование — главная фишка KV v2
vault kv put secret/shop/api api_key="demo-key-456"   # новая версия
vault kv get -version=1 secret/shop/api               # старая жива!
vault kv rollback -version=1 secret/shop/api          # откат секрета одной командой
```

**Проверь себя:** чем KV v2 отличается от v1? *(версионирование, rollback, metadata, soft-delete)*

---

## 🧪 Часть 2: Политики — принцип наименьших привилегий (15 мин)

```hcl
# shop-api.hcl — приложение читает только свой путь, только чтение
path "secret/data/shop/api" {
  capabilities = ["read"]
}

# ci-writer.hcl — пайплайн пишет версии, но не может читать чужие пути
path "secret/data/shop/*" {
  capabilities = ["create", "update", "read"]
}
```

```bash
vault policy write shop-api shop-api.hcl
vault policy write ci-writer ci-writer.hcl
vault policy list

# Проверка изоляции: токен с политикой shop-api НЕ может писать
VAULT_TOKEN=$(vault token create -policy=shop-api -field=token)
VAULT_TOKEN=$VAULT_TOKEN vault kv put secret/shop/api hacked=true   # ← permission denied
VAULT_TOKEN=$VAULT_TOKEN vault kv get secret/shop/api                # ← а читать может
```

---

## 🧪 Часть 3: AppRole — как CI/приложения аутентифицируются (20 мин)

Токен в переменной окружения — плохо (утекает в логи). Правильно: **AppRole = role_id (не секрет) + secret_id (одноразовый пароль)**.

```bash
vault auth enable approle
vault write auth/approle/role/shop-api \
  token_policies=shop-api \
  token_ttl=30m \
  secret_id_num_uses=5 \          # каждый secret_id работает 5 раз максимум
  secret_id_ttl=10m

ROLE_ID=$(vault read -field=role_id auth/approle/role/shop-api/role-id)
SECRET_ID=$(vault write -f -field=secret_id auth/approle/role/shop-api/secret-id)

# Логин приложения: role_id + secret_id → рабочий токен
APP_TOKEN=$(vault write -field=token auth/approle/login \
  role_id=$ROLE_ID secret_id=$SECRET_ID)
VAULT_TOKEN=$APP_TOKEN vault kv get -field=api_key secret/shop/api   # работает!

# secret_id одноразовый: повторный логин с тем же — отказ
VAULT_TOKEN=$(vault write -field=token auth/approle/login role_id=$ROLE_ID secret_id=$SECRET_ID 2>&1) || echo "✓ повтор использован отклонён"
```

!!! tip "Как это выглядит в GitLab CI"
    Джоба получает `ROLE_ID` (не секрет) и короткоживущий `SECRET_ID` из защищённых переменных, логинится, забирает секреты и умирает вместе с токеном. Утечка runner'а не даёт постоянного доступа.

---

## 🧪 Часть 4: Динамические креды БД — пароль на час (25 мин)

Убийца главной боли: статические пароли БД в конфигах. Vault сам создаёт пользователя PostgreSQL по запросу и удаляет по TTL.

### Стенд: PostgreSQL

```bash
docker run --rm -d --name pg -p 5432:5432 \
  -e POSTGRES_PASSWORD=rootpass postgres:16
sleep 3 && docker exec pg psql -U postgres \
  -c "CREATE ROLE vaultadmin WITH LOGIN SUPERUSER PASSWORD 'vaultpass';"
```

### Подключение движка секретов БД

```bash
vault secrets enable database
vault write database/config/shop-pg \
  plugin_name=postgresql-database-plugin \
  connection_url="postgresql://{{username}}:{{password}}@host.docker.internal:5432/postgres?sslmode=disable" \
  allowed_roles="shop-db" \
  username=vaultadmin password=vaultpass

# Роль: шаблон SQL, который выполнится при каждой выдаче кредов
vault write database/roles/shop-db \
  db_name=shop-pg \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
  default_ttl=1h max_ttl=24h

# Магия: получаем временного пользователя БД
CREDS=$(vault read database/creds/shop-db)
echo "$CREDS"
# lease_id: database/creds/shop-db/xxxxx
# username: v-token-shop-db-1699...     ← создан только что
# password: A1a-xxxxxxx                 ← живёт 1 час

# Проверяем вживую:
PGPASSWORD=$(echo "$CREDS" | grep password | awk '{print $2}') \
  psql -h localhost -U $(echo "$CREDS" | grep username | awk '{print $2}') -c "\dt"

# Отзыв раньше срока (паник-кнопка при утечке):
vault lease revoke $(echo "$CREDS" | grep lease_id | awk '{print $2}')
# пользователь удалён из PostgreSQL автоматически!
```

**Проверь себя:** что произойдёт со всеми выданными пользователями, если TTL истечёт? *(Vault сам выполнит DROP ROLE по расписанию ревокации)*

---

## 🧪 Часть 5: ESO — секреты попадают в K8s без копирования (20 мин)

```bash
kubectl create namespace shop
helm repo add external-secrets https://charts.external-secrets.io && helm repo update
helm install eso external-secrets/external-secrets -n eso --create-namespace
```

```yaml
# secretstore.yaml — подключение к Vault от имени кластера
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata: { name: vault-shop, namespace: shop }
spec:
  provider:
    vault:
      server: http://host.docker.internal:8200
      path: secret
      version: v2
      auth:
        appRole:
          roleId: "<ROLE_ID из Части 3>"
          secretRef:
            name: vault-secret-id        # SecretStore возьмёт secret_id отсюда
            key: secret-id
---
apiVersion: v1
kind: Secret
metadata: { name: vault-secret-id, namespace: shop }
stringData: { secret-id: "<SECRET_ID>" }   # в проде — через ESO bootstrap/Vault Agent
```

```yaml
# externalsecret.yaml — декларация «какой путь Vault → какой Secret K8s»
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata: { name: shop-api-secrets, namespace: shop }
spec:
  refreshInterval: 5m              # синхронизация каждые 5 минут
  secretStoreRef: { name: vault-shop, kind: SecretStore }
  target:
    name: shop-api                 # имя создаваемого Secret
  data:
    - secretKey: DB_URL            # ключ внутри K8s Secret
      remoteRef: { key: shop/api, property: db_url }   # путь в Vault
```

```bash
kubectl apply -f secretstore.yaml -f externalsecret.yaml
kubectl get externalsecret -n shop         # SecretSynced: True
kubectl get secret shop-api -n shop -o jsonpath='{.data.DB_URL}' | base64 -d

# Проверим живой цикл: меняем в Vault → через refreshInterval приедет в кластер
vault kv put secret/shop/api db_url="postgres://shop:v2@pg:5432/shop"
sleep 310 && kubectl get secret shop-api -n shop -o jsonpath='{.data.DB_URL}' | base64 -d
```

---

## 🧪 Часть 6: Разбор и уборка (5 мин)

```bash
# Аудит: кто и когда обращался к секретам (в dev-режиме stdout контейнера)
docker logs vault 2>&1 | grep '"path":"secret/data/shop/api"' | tail -3

docker rm -f vault pg && helm uninstall eso && kind delete cluster
```

Схема того, что построили:

```mermaid
graph LR
    CI[GitLab CI] -->|"AppRole login"| V[Vault]
    DEV[Разработчик] -->|CLI/UI| V
    V -->|"KV v2: версионирование"| S[secret/shop/*]
    V -->|"database engine"| PG[(PostgreSQL:<br/>временные роли)]
    V -->|"ESO sync каждые 5 мин"| K8S[Secrets в кластере]
    APP[Приложение] -->|читает| K8S
```

---

## ✅ Проверь себя

1. Почему AppRole безопаснее статического токена в env? *(secret_id короткоживущий и одноразовый; role_id не секрет; утечка даёт доступ на TTL, а не навсегда)*
2. Что случится с приложением при `vault lease revoke` его динамических кредов БД? *(роль удалена — соединения оборвутся; поэтому приложение должно уметь перечитывать креды или использовать короткий TTL + retry)*
3. Зачем ESO, если можно положить Secret в git зашифрованным (SOPS)? *(два легитимных пути; ESO — когда источник правды Vault и нужна ротация без коммитов; SOPS — когда хочется всё в git)*
4. Как ограничить blast radius утечки SECRET_ID? *(TTL+num_uses на secret_id, отдельная политика на роль, алерт на anomalous login в audit log)*
5. Что покажет audit log после инцидента? *(кто, когда, какой путь — но НЕ значения секретов; это и есть ценность аудита)*

## 🎯 Куда дальше

- Замените dev-режим на production-стенд: init/unseal, auto-unseal через KMS ([10.3](../10-security-and-cloud/03-hashicorp-vault-deep-dive.md)).
- Подключите cert-manager к Vault PKI — выпуск TLS-сертификатов вместо Let's Encrypt.
- Прочитайте про OIDC-аутентификацию человека (SSO через GitLab) вместо токенов.
