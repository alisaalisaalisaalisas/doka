# 🧩 22. P2 Supplement: закрытие оставшихся пробелов

> Сборник targeted enrichments для P2: один файл чтобы закрыть 15 мелких пробелов без раздувания 20 новых страниц. После прочтения — способность `Understand → Use → Break → Diagnose → Fix → Verify` для каждого.

## 🔒 Snyk vs Grype: VEX и supply chain

```bash
# Snyk (SaaS, требует токен) — аналог Grype
npm install -g snyk && snyk auth $SNYK_TOKEN
snyk test --severity-threshold=high --json | jq .vulnerabilities[].id | head
snyk container test nginx:1.27 --severity-threshold=high

# Grype: VEX (vex.json) — подавление ложных срабатываний
# vex.json: attest что CVE-2023-12345 неприменим
cat > vex.json <<'JSON'
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "vulnerabilities": [{
    "id": "CVE-2023-12345",
    "analysis": {"state": "not_affected", "justification": "code_not_present", "detail": "package vendored but unused"}
  }]
}
JSON
grype nginx:1.27 --vex vex.json --fail-on high -o table
grype db check  # обновление БД при CI

# Выбор: Snyk — для dev (PR комментарии), Grype — для CI gate (offline DB). В проде — оба, но gate на Grype.
```

## 🔍 OpenSearch: когда ELK дорожает

```bash
# OpenSearch — форк Elastic 7.10, лицензия Apache 2.0
# Compose уже в 09-05, здесь — отличия
curl -s http://localhost:9200/ | jq .version.distribution  # opensearch
# ISM vs ILM: ISM policy на OpenSearch (см. 09-05 lab PUT _plugins/_ism/policies)
# Миграция: reindex remote + aliases:
curl -s -X POST http://opensearch:9200/_reindex -H 'Content-Type: application/json' -d '{"source":{"remote":{"host":"http://elasticsearch:9200"},"index":"logs-2026.08.27"},"dest":{"index":"logs-2026.08.27"}}' | jq
```

## 📦 OpenTofu divergence от Terraform

| Аспект | Terraform (HashiCorp BSL) | OpenTofu (Linux Foundation) |
|---|---|---|
| Registry | `registry.terraform.io` | `registry.opentofu.org` |
| Version | `required_version = ">= 1.6.0"` | та же, но `tofu` CLI |
| Providers | `hashicorp/aws` | зеркало, префикс `registry.opentofu.org/` |
| Encryption | `sensitive` + `pgp` | `encryption` блок `method "aes_gcm"` (нативно) |
| Loop | `count/for_each` | та же + `tofu test` |

```bash
# Миграция
tofu init  # читает .tf, state совместим
tofu plan
# state encryption (tofu 1.7+)
# terraform {
#   encryption {
#     key_provider "pbkdf2" "mykey" { passphrase = var.passphrase }
#     method "aes_gcm" "default" { keys = key_provider.pbkdf2.mykey }
#     state { method = method.aes_gcm.default }
#   }
# }
```

```hcl
# Terragrunt generate — не забывать
# root terragrunt.hcl
generate "backend" {
  path      = "backend.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
terraform {
  backend "s3" {
    bucket = "tf-state"
    key    = "${path_relative_to_include()}/terraform.tfstate"
    region = "eu-central1"
    dynamodb_table = "tf-lock"
    encrypt = true
  }
}
EOF
}
```

## 🔐 Ansible Vault multi-environment + современный Runner

```bash
# Multi-env vault: dev (password в 1pass) vs prod (файл на CI)
ansible-vault create group_vars/dev/vault.yml --vault-id dev@prompt
ansible-vault create group_vars/prod/vault.yml --vault-id prod@.vault_prod
ansible-vault rekey --vault-id prod@.vault_prod group_vars/prod/vault.yml

# runner: migrate docker+machine → docker autoscaler (fleeting)
# /etc/gitlab-runner/config.toml
# [[runners]]
#   executor = "docker-autoscaler"  # не docker+machine (deprecated)
#   [runners.docker_autoscaler]
#     plugin = "fleeting"
```

## 🐘 PostgreSQL: pg_rewind

```bash
# После failover старый primary отстаёт — rewind вместо полного basebackup
patronictl switchover --master pg-0 --candidate pg-1 --force
# На старом primary:
pg_rewind --target-pgdata=/var/lib/pgsql/data --source-server='host=pg-1 port=5432 user=postgres'
# Проверка: pg_controldata /var/lib/pgsql/data | grep "Database cluster state"
# CNPG делает автоматически, Patroni — руками если archive_command lag
```

## 🏔️ ClickHouse Keeper (replacement ZooKeeper)

```yaml
# Keeper 3 ноды (вместо ZooKeeper)
apiVersion: apps/v1
kind: StatefulSet
metadata: { name: keeper, namespace: clickhouse }
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: keeper
          image: clickhouse/clickhouse-keeper:24.8
          args: ["keeper", "--config", "/etc/clickhouse-keeper/keeper_config.xml"]
---
# ClickHouse: <keeper_server> вместо <zookeeper>
# <clickhouse><keeper_server><tcp_port>2181</tcp_port></keeper_server></clickhouse>
```

```bash
clickhouse-client --query "SELECT * FROM system.keeper WHERE path='/clickhouse/tables'"
# recovery: keeper snapshot + SYSTEM RESTART REPLICA
```

## 📨 Kafka: SASL/SCRAM + Schema Registry

```yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaUser
metadata: { name: alice, namespace: kafka }
spec:
  authentication: { type: scram-sha-512 }
  authorization: { type: simple, acls: [{ resource: { type: topic, name: orders }, operation: Read, host: "*" }] }
---
apiVersion: kafka.strimzi.io/v1beta2
kind: Kafka
metadata: { name: my-cluster, namespace: kafka }
spec:
  kafka:
    listeners:
      - name: tls
        port: 9093
        type: internal
        tls: true
        authentication: { type: scram-sha-512 }
```

```bash
# Schema Registry (Apicurio)
helm repo add apicurio https://apicurio.github.io/apicurio-registry
helm install registry apicurio/apicurio-registry --set app.ingress.enabled=true
curl -X POST http://registry:8080/apis/c/registry/v1/artifacts -H "Content-Type: application/json" -d '{"id":"orders","type":"AVRO","content":"{\"type\":\"record\",\"name\":\"Order\"}"}'
```

## 🔴 Redis: TLS/ACL и кластер создание

```ini
# redis.conf
tls-port 6379
port 0
tls-cert-file /tls/redis.crt
tls-key-file /tls/redis.key
tls-ca-cert-file /tls/ca.crt
user app on >MySecretPass ~orders:* +@all
maxmemory 2gb
maxmemory-policy allkeys-lru
```

```bash
redis-cli --tls -a MySecretPass --cert /tls/client.crt --key /tls/client.key ping
redis-cli --tls --cluster create 10.0.0.1:6379 10.0.0.2:6379 10.0.0.3:6379 --cluster-replicas 1
redis-cli --tls --cluster failover --cluster-master-id abc123  # manual
```

## 🍃 MongoDB: sharding lab (дополняет RS)

```yaml
# docker-compose.mongo-sharding.yaml (минимально 6 контейнеров)
# config servers, shard servers, mongos
version: "3.8"
services:
  configsvr:
    image: mongo:7
    command: mongod --configsvr --replSet configRS --port 27019
  shard1:
    image: mongo:7
    command: mongod --shardsvr --replSet shard1RS --port 27018
  mongos:
    image: mongo:7
    command: mongos --configdb configRS/configsvr:27019 --port 27017
    depends_on: [configsvr, shard1]
```

```bash
docker compose -f docker-compose.mongo-sharding.yaml up -d
mongosh --host localhost:27017 --eval 'sh.addShard("shard1RS/shard1:27018"); sh.enableSharding("shop"); sh.shardCollection("shop.orders", {customer_id: 1})'
mongosh --eval 'sh.status()'
```

## 🐙 Ceph/Rook: VolumeSnapshot и Longhorn vs Rook

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshotClass
metadata: { name: rook-ceph-block }
driver: rook-ceph.rbd.csi.ceph.com
deletionPolicy: Delete
---
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata: { name: pg-snap, namespace: prod }
spec:
  volumeSnapshotClassName: rook-ceph-block
  source: { persistentVolumeClaimName: pgdata-pg-0 }
```

```bash
kubectl get volumesnapshot -n prod pg-snap
kubectl get volumesnapshotcontent | grep pg-snap
# Longhorn BackupTarget S3 (уже в 20-08, здесь cross-ref)
helm upgrade longhorn longhorn/longhorn --set persistence.defaultClassReplicaCount=3 --set backupTarget=s3://backup@us-east-1/ --wait
```

## 🔥 Pyroscope: continuous profiling (Alloy → Pyroscope)

```river
// alloy.river — добавить к 09-03
pyroscope.ebpf "app" {
  forward_to = [pyroscope.write.default.receiver]
  targets    = discovery.kubernetes.pods.targets
}

pyroscope.write "default" {
  endpoint { url = "http://pyroscope.monitoring.svc:4040" }
}
```

```bash
# Проверка
curl http://pyroscope.monitoring.svc:4040/status | jq .ingester
# pprof для Go: уже в 08-10, связать с Pyroscope eBPF
go tool pprof http://app:6060/debug/pprof/heap
```

## 🛡️ NetworkPolicy chaos verification (закрывает P2)

```bash
# Проверка что default-deny реально работает (kindnet не умеет — нужен Cilium)
kubectl create ns netpol-test --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f - <<'YAML'
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny, namespace: netpol-test }
spec: { podSelector: {}, policyTypes: [Ingress, Egress] }
YAML
kubectl -n netpol-test create deploy a --image=nginxinc/nginx-unprivileged:1.27
kubectl -n netpol-test create deploy b --image=busybox:1.36 -- sleep 3600
kubectl -n netpol-test exec deploy/b -- wget -qO- http://a --timeout 2 && echo "ALLOW - policy broken" || echo "DENY - policy enforced ✓"
# Разрешить DNS + a
kubectl apply -f - <<'YAML'
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: allow-a, namespace: netpol-test }
spec:
  podSelector: { matchLabels: { app: a } }
  policyTypes: [Ingress]
  ingress:
    - from: [{ podSelector: { matchLabels: { app: b } } }]
      ports: [{ port: 80 }]
    - ports: [{ port: 53, protocol: UDP }, { port: 53, protocol: TCP }]  # DNS egress allow
YAML
kubectl -n netpol-test exec deploy/b -- wget -qO- http://a --timeout 2 && echo "ALLOW ✓"
kubectl delete ns netpol-test --ignore-not-found
```

---

## ✅ Чек-лист P2 зрелости

- [ ] Snyk + Grype с VEX `grype db check` в CI, `allowlist` через `vex.json`
- [ ] OpenSearch `reindex` + `ISM` vs `ILM` выбор задокументирован
- [ ] OpenTofu `tofu` + `encryption` + Terragrunt `generate` в `root.hcl`
- [ ] Ansible `--vault-id dev@prompt prod@file`, Runner `docker-autoscaler`
- [ ] DB: `pg_rewind` runbook, Kafka `SCRAM` + Apicurio, Redis `TLS` + `cluster create`, Mongo `shardCollection`, Ceph `VolumeSnapshot`
- [ ] `pyroscope.ebpf` в Alloy + `go pprof` связать
- [ ] NetworkPolicy `default-deny` + `DNS allow` + chaos `kindnet` vs `cilium install` проверен

<!-- enriched:v1 -->
