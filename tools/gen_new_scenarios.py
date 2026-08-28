#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import os

DIR = "docs/21-playground"

# Helper to produce JS string literal via json.dumps (ensures valid JS)
def js(s):
    return json.dumps(s, ensure_ascii=False)

# Generate scenario JS entry
def S_entry(cat, sid, title, level, brief, prompt, commands, solution):
    # commands: list of [re, out, cls]
    # solution: list of dict {re, l}
    cmd_js = ",\n ".join(f"[{js(re)}, {js(out)}, {js(cls)}]" for re, out, cls in commands)
    sol_js = ",\n ".join(f"{{re:{js(x['re'])},l:{js(x['l'])}}}" for x in solution)
    return f'S({js(cat)},{js(sid)},{js(title)},{js(level)},\n{js(brief)},\n{js(prompt)},\n[\n {cmd_js}\n],\n[{sol_js}]);'

def write_file(filename, header_comment, entries):
    path = os.path.join(DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(header_comment + "\n")
        for e in entries:
            f.write(e + "\n\n")
    print(f"Wrote {filename}: {len(entries)} scenarios")

# Define levels cycle
levels = ["Junior","Middle","Senior"]

# Common helper to make commands safe: ensure pattern valid regex
# We'll generate patterns that are simple: ^tool subcommand ...

# File specs: (filename, cat, prefix, prompt, count, keywords, description_map)
# We'll define per file generation logic

# --- AWS ---
aws_topics = [
 "IAM: sts get-caller-identity не тот аккаунт",
 "IAM: policy simulation explicit deny",
 "IAM: assume-role требует MFA",
 "IAM: access key просрочен, ротация",
 "S3: bucket policy AccessDenied 403",
 "S3: versioning выключен, нет PITR",
 "S3: SSE-KMS шифрование отсутствует",
 "S3: lifecycle не удаляет старые объекты",
 "S3: presigned URL expired",
 "VPC: NAT GW нет интернета",
 "VPC: route table без IGW",
 "VPC: peering маршрут не прописан",
 "EC2: target group health check unhealthy",
 "EC2: EBS volume не примонтирован",
 "EC2: user-data cloud-init не выполнился",
 "EKS: node group NotReady",
 "EKS: IRSA аннотация service account отсутствует",
 "EKS: OIDC provider не создан",
 "SG: security group блокирует 443",
 "NACL: stateless deny ephemeral портов",
 "NAT: single-AZ NAT падение без failover",
 "CloudWatch: log group retention не задан",
 "CloudWatch: alarm не срабатывает",
 "STS: AssumeRoleWithWebIdentity fails",
 "IAM: permission boundary блокирует",
 "S3: CRR репликация лаг",
 "VPC Endpoint: S3 gateway не роутит",
 "EC2: SSM Session Manager cannot connect",
 "EKS: vpc-cni аддон версия mismatch",
 "Cost Explorer: внезапный рост счета",
 "S3: MFA Delete не включен",
 "IAM: SCP denies s3:PutObject",
 "VPC: flow logs не включены",
 "EKS: CoreDNS CrashLoopBackOff",
 "EC2: spot interruption handler отсутствует"
]
# ensure 35
assert len(aws_topics)==35

def gen_aws():
    cat="AWS"
    prefix="gc-aws"
    prompt="dev@aws:~$"
    entries=[]
    # map topic prefix to aws cli snippet
    svc_map={
        "IAM": "iam get-user --user-name alice",
        "S3": "s3api get-bucket-policy --bucket my-bucket",
        "VPC": "ec2 describe-vpcs --vpc-ids vpc-0a1b2c3d",
        "EC2": "ec2 describe-instances --instance-ids i-0a1b2c3d4e5f",
        "EKS": "eks describe-cluster --name prod",
        "SG": "ec2 describe-security-groups --group-ids sg-0a1b2c3d",
        "NACL": "ec2 describe-network-acls --network-acl-ids acl-0a1b2c3d",
        "NAT": "ec2 describe-nat-gateways --nat-gateway-ids nat-0a1b2c3d",
        "CloudWatch": "cloudwatch describe-alarms --alarm-names cpu-high",
        "STS": "sts get-caller-identity",
        "Cost": "ce get-cost-and-usage --time-period Start=2026-08-01,End=2026-08-24 --granularity DAILY --metrics BlendedCost",
    }
    for i, title in enumerate(aws_topics, start=1):
        level=levels[(i-1)%3]
        br=f"<b>Симптом:</b> {title}. Требуется диагностика AWS CLI и исправление конфигурации."
        # derive service key
        key=title.split(":")[0].strip()
        base=svc_map.get(key, "sts get-caller-identity")
        # make unique bucket/instance id per scenario
        base_uniq=base.replace("my-bucket", f"my-bucket-{i}").replace("vpc-0a1b2c3d", f"vpc-{i:08x}").replace("i-0a1b2c3d4e5f", f"i-{i:017x}").replace("sg-0a1b2c3d", f"sg-{i:08x}").replace("acl-0a1b2c3d", f"acl-{i:08x}").replace("nat-0a1b2c3d", f"nat-{i:08x}")
        # commands: diagnostic, check, fix, verify
        # Use simple strings; ensure regex valid: start with ^
        cmd_diag = f"^aws {base_uniq}"
        cmd_check = f"^aws {base_uniq} --output table"
        # fix depends
        if "IAM" in title:
            cmd_fix = f"^aws iam put-user-policy --user-name alice --policy-name fix-{i}"
        elif "S3" in title:
            cmd_fix = f"^aws s3api put-bucket-policy --bucket my-bucket-{i} --policy file://policy.json"
        elif "VPC" in title:
            cmd_fix = f"^aws ec2 create-route --route-table-id rtb-{i:08x} --destination-cidr-block 0.0.0.0/0 --gateway-id igw-{i:08x}"
        elif "EC2" in title:
            cmd_fix = f"^aws ec2 attach-volume --volume-id vol-{i:08x} --instance-id i-{i:017x} --device /dev/sdf"
        elif "EKS" in title or "IRSA" in title or "OIDC" in title:
            cmd_fix = f"^eksctl utils associate-iam-oidc-provider --cluster prod --approve"
        elif "SG" in title:
            cmd_fix = f"^aws ec2 authorize-security-group-ingress --group-id sg-{i:08x} --protocol tcp --port 443 --cidr 0.0.0.0/0"
        elif "NACL" in title:
            cmd_fix = f"^aws ec2 create-network-acl-entry --network-acl-id acl-{i:08x} --rule-number 100 --protocol tcp --port-range From=1024,To=65535 --egress --rule-action allow --cidr-block 0.0.0.0/0"
        elif "NAT" in title:
            cmd_fix = f"^aws ec2 create-nat-gateway --subnet-id subnet-{i:08x} --allocation-id eipalloc-{i:08x}"
        elif "CloudWatch" in title:
            cmd_fix = f"^aws logs put-retention-policy --log-group-name /aws/eks/prod --retention-in-days 30"
        elif "STS" in title:
            cmd_fix = f"^aws iam update-assume-role-policy --role-name app --policy-document file://trust.json"
        elif "Cost" in title:
            cmd_fix = f"^aws ce get-cost-and-usage --time-period Start=2026-08-01,End=2026-08-24 --granularity DAILY --metrics BlendedCost --filter file://filter.json"
        else:
            cmd_fix = f"^aws sts get-caller-identity --fix-{i}"
        cmd_verify = f"^aws {base_uniq} --query State --output text"
        commands=[
            (cmd_diag, "An error occurred (AccessDenied) when calling operation: User not authorized", "err"),
            (cmd_check, "config check output: missing or deny", "warn"),
            (cmd_fix, "applied fix successfully", "ok"),
            (cmd_verify, "ok verified", "ok"),
        ]
        solution=[
            {"re": cmd_diag, "l": "диагностика"},
            {"re": cmd_fix, "l": "исправить"},
        ]
        entries.append(S_entry(cat, f"{prefix}-{i}", title, level, br, prompt, commands, solution))
    return entries

# --- GCP ---
gcp_keywords = [
 "IAM: service account impersonation 403",
 "IAM: Workload Identity не связан",
 "VPC firewall: правило блокирует 22",
 "VPC: subnet не в регионе GKE",
 "GKE: node pool NotReady",
 "GKE: Workload Identity аннотация отсутствует",
 "GCS: bucket IAM не uniform",
 "GCS: lifecycle не удаляет",
 "Logging: sink не экспортирует в BigQuery",
 "Cloud NAT: не настроен, нет egress",
 "VPC peering: маршрут отсутствует",
 "GKE: autopilot лимиты CPU",
 "GKE: PDB блокирует upgrade",
 "GCS: retention policy блокирует удаление",
 "IAM: custom role без storage.objects.get",
 "VPC: Shared VPC host проект",
 "GKE: workload identity federation",
 "Monitoring: alert не срабатывает",
 "GCE: instance template не обновляется",
 "IAM: org policy constraints/compute.requireOsLogin",
 "GCS: versioning vs soft delete",
 "VPC: firewall priority 1000 deny",
 "GKE: node auto-upgrade disabled",
 "Logging: exclusion filter скрывает ошибки",
 "IAM: service account key expired",
 "GCS: CORS не настроен",
 "VPC: Private Google Access выключен",
 "GKE: binary authorization блокирует образ",
 "Monitoring: uptime check 500",
 "GCS: CMEK ключ недоступен",
 "IAM: impersonation chain too long",
 "VPC: Cloud DNS не резолвит",
 "GKE: workload identity pool mismatch",
 "GCS: soft delete retention 7d",
 "Logging: log bucket locked"
]
assert len(gcp_keywords)==35

def gen_gcp():
    cat="GCP"
    prefix="gc-gcp"
    prompt="dev@gcp:~$"
    entries=[]
    svc_map={
        "IAM": "iam service-accounts get-iam-policy sa@proj.iam.gserviceaccount.com",
        "VPC": "compute firewall-rules list --filter name=allow-ssh",
        "GKE": "container clusters describe prod --zone europe-west1-b",
        "GCS": "storage ls gs://my-bucket",
        "Logging": "logging sinks describe my-sink",
        "Cloud NAT": "compute routers describe nat-router --region europe-west1",
        "Monitoring": "monitoring channels list",
        "GCE": "compute instances describe my-vm --zone europe-west1-b",
    }
    for i, title in enumerate(gcp_keywords, start=1):
        level=levels[(i-1)%3]
        br=f"<b>Симптом:</b> {title}. Требуется проверка gcloud/gsutil и исправление."
        key=title.split(":")[0].strip()
        # find best match
        base=None
        for k in svc_map:
            if k.lower() in key.lower() or k.lower() in title.lower():
                base=svc_map[k]
                break
        if not base:
            if "GCS" in title or "storage" in title.lower():
                base=svc_map["GCS"]
            elif "GKE" in title:
                base=svc_map["GKE"]
            elif "VPC" in title or "firewall" in title.lower():
                base=svc_map["VPC"]
            elif "IAM" in title:
                base=svc_map["IAM"]
            elif "Logging" in title:
                base=svc_map["Logging"]
            else:
                base="iam service-accounts list"
        # uniquify
        base_u = base.replace("my-bucket", f"my-bucket-{i}").replace("my-sink", f"my-sink-{i}").replace("my-vm", f"my-vm-{i}").replace("prod", f"prod-{i%3}")
        cmd_diag = f"^gcloud {base_u}"
        cmd_check = f"^gcloud {base_u} --format json"
        if "IAM" in title:
            cmd_fix = f"^gcloud iam service-accounts add-iam-policy-binding sa@proj.iam.gserviceaccount.com --member=user:alice@corp.io --role=roles/iam.workloadIdentityUser"
        elif "firewall" in title.lower() or "VPC" in title:
            cmd_fix = f"^gcloud compute firewall-rules update allow-ssh --allow tcp:22 --source-ranges 0.0.0.0/0"
        elif "GKE" in title:
            cmd_fix = f"^gcloud container clusters update prod --workload-pool=proj.svc.id.goog --zone europe-west1-b"
        elif "GCS" in title:
            cmd_fix = f"^gcloud storage buckets update gs://my-bucket-{i} --uniform-bucket-level-access"
        elif "Logging" in title:
            cmd_fix = f"^gcloud logging sinks update my-sink-{i} --log-filter='severity>=ERROR'"
        elif "NAT" in title:
            cmd_fix = f"^gcloud compute routers nats create nat-config --router nat-router --region europe-west1 --nat-all-subnet-ip-ranges --auto-allocate-nat-external-ips"
        elif "Monitoring" in title:
            cmd_fix = f"^gcloud monitoring channels create --display-name oncall --type email --channel-labels email_address=oncall@corp.io"
        else:
            cmd_fix = f"^gcloud {base_u} --fix-{i}"
        cmd_verify = f"^gcloud {base_u} --format value(state)"
        commands=[
            (cmd_diag, "ERROR: (gcloud) PERMISSION_DENIED: Permission denied", "err"),
            (cmd_check, "json output: status NotReady / missing", "warn"),
            (cmd_fix, "Updated successfully", "ok"),
            (cmd_verify, "READY", "ok"),
        ]
        solution=[
            {"re": cmd_diag, "l": "диагностика"},
            {"re": cmd_fix, "l": "исправить"},
        ]
        entries.append(S_entry(cat, f"{prefix}-{i}", title, level, br, prompt, commands, solution))
    return entries

# --- Azure ---
azure_keywords = [
 "Entra ID: service principal secret expired",
 "Entra ID: app registration redirect URI mismatch",
 "VNet: peering not connected",
 "NSG: rule blocks 443",
 "AKS: node pool NotReady",
 "AKS: managed identity not assigned",
 "Blob: SAS token expired",
 "Blob: soft delete retention блокирует",
 "Monitor: alert not firing",
 "VNet: subnet delegation failed",
 "NSG: default deny all",
 "AKS: OIDC issuer not enabled",
 "Entra ID: conditional access blocks",
 "VNet: private endpoint DNS not resolved",
 "AKS: upgrade blocked by PDB",
 "Blob: versioning disabled",
 "Monitor: log analytics workspace not linked",
 "VNet: UDR missing 0.0.0.0/0",
 "AKS: workload identity federation missing",
 "Entra ID: group membership not synced",
 "NSG: flow logs not enabled",
 "AKS: node auto-upgrade disabled",
 "Blob: CORS not configured",
 "Monitor: action group not notified",
 "VNet: DDoS protection not enabled",
 "AKS: key vault provider not installed",
 "Entra ID: MFA required",
 "VNet: service endpoint not enabled for storage",
 "AKS: pod identity binding missing",
 "Blob: immutable policy locks",
 "Monitor: metric filter wrong",
 "VNet: NAT gateway not associated",
 "AKS: cluster autoscaler not scaling",
 "Entra ID: token lifetime too short",
 "Blob: lifecycle not deleting"
]
assert len(azure_keywords)==35

def gen_azure():
    cat="Azure"
    prefix="gc-az"
    prompt="dev@azure:~$"
    entries=[]
    svc_map={
        "Entra": "ad sp show --id 00000000-0000-0000-0000-000000000001",
        "VNet": "network vnet show --name myvnet --resource-group rg-prod",
        "NSG": "network nsg show --name mynsg --resource-group rg-prod",
        "AKS": "aks show --name prod --resource-group rg-prod",
        "Blob": "storage blob list --account-name mystorage --container-name mycontainer",
        "Monitor": "monitor metrics list --resource myresource --metric CPU",
    }
    for i, title in enumerate(azure_keywords, start=1):
        level=levels[(i-1)%3]
        br=f"<b>Симптом:</b> {title}. Требуется проверка az cli и исправление."
        base=None
        for k in svc_map:
            if k.lower() in title.lower():
                base=svc_map[k]
                break
        if not base:
            base="ad sp list"
        base_u=base.replace("myvnet", f"myvnet-{i}").replace("mynsg", f"mynsg-{i}").replace("prod", f"prod-{i%3}").replace("mystorage", f"mystorage{i}").replace("mycontainer", f"mycontainer-{i}")
        cmd_diag=f"^az {base_u}"
        cmd_check=f"^az {base_u} --output json"
        if "Entra" in title:
            cmd_fix=f"^az ad sp credential reset --id 00000000-0000-0000-0000-000000000001"
        elif "VNet" in title:
            cmd_fix=f"^az network vnet peering create --name peer-{i} --remote-vnet myvnet-{i} --vnet-name myvnet-{i} --resource-group rg-prod --allow-vnet-access"
        elif "NSG" in title:
            cmd_fix=f"^az network nsg rule create --nsg-name mynsg-{i} --name allow-443 --priority 100 --access Allow --protocol Tcp --destination-port-ranges 443"
        elif "AKS" in title:
            cmd_fix=f"^az aks update --name prod-{i%3} --resource-group rg-prod --enable-oidc-issuer"
        elif "Blob" in title:
            cmd_fix=f"^az storage blob update --account-name mystorage{i} --container-name mycontainer-{i} --name myblob --tier Hot"
        elif "Monitor" in title:
            cmd_fix=f"^az monitor metrics alert create --name cpu-high --resource-group rg-prod --scopes myresource --condition \"avg CPU > 80\""
        else:
            cmd_fix=f"^az {base_u} --fix"
        cmd_verify=f"^az {base_u} --query provisioningState --output tsv"
        commands=[
            (cmd_diag, "ERROR: (AuthorizationFailed) The client does not have authorization", "err"),
            (cmd_check, "json: provisioningState Failed / missing", "warn"),
            (cmd_fix, "command succeeded", "ok"),
            (cmd_verify, "Succeeded", "ok"),
        ]
        solution=[
            {"re": cmd_diag, "l": "диагностика"},
            {"re": cmd_fix, "l": "исправить"},
        ]
        entries.append(S_entry(cat, f"{prefix}-{i}", title, level, br, prompt, commands, solution))
    return entries

# --- Cloudflare ---
cf_keywords = [
 "Tunnel: cloudflared not connected",
 "Tunnel: ingress rule missing",
 "WAF: rule blocks legit traffic 403",
 "WAF: managed rule false positive",
 "DNS: CNAME not proxied",
 "DNS: TTL 1 Auto vs 300",
 "Zero Trust: Access policy denies user",
 "Zero Trust: Warp device posture failed",
 "Tunnel: QUIC vs http2 fallback",
 "WAF: rate limiting blocks API",
 "DNS: DNSSEC not validated",
 "Zero Trust: Gateway DNS filtering blocks",
 "Tunnel: credentials.json expired",
 "WAF: custom rule regex too broad",
 "DNS: wildcard not covered",
 "Zero Trust: service token expired",
 "Tunnel: ha with 2 replicas not balanced",
 "WAF: Bot Fight Mode blocks",
 "DNS: apex vs www",
 "Zero Trust: device enrollment missing",
 "Tunnel: private network route missing",
 "WAF: logpush not enabled",
 "DNS: CAA record blocks Let's Encrypt",
 "Zero Trust: Access group include vs require",
 "Tunnel: origin cert expired",
 "WAF: DDoS sensitivity high",
 "DNS: secondary setup not syncing",
 "Zero Trust: split tunnel excludes",
 "Tunnel: health check fails",
 "WAF: skip rule for monitoring IP"
]
assert len(cf_keywords)==30

def gen_cf():
    cat="Cloudflare"
    prefix="gc-cf"
    prompt="dev@cf:~$"
    entries=[]
    svc_map={
        "Tunnel": "cloudflared tunnel list",
        "WAF": 'curl -s https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules --header "Authorization: Bearer token"',
        "DNS": "dig api.corp.io +short",
        "Zero Trust": "cloudflared access list",
    }
    for i, title in enumerate(cf_keywords, start=1):
        level=levels[(i-1)%3]
        br=f"<b>Симптом:</b> {title}. Требуется проверка Cloudflare API/Tunnel."
        base=None
        for k in svc_map:
            if k.lower() in title.lower():
                base=svc_map[k]
                break
        if not base:
            base="cloudflared tunnel list"
        # uniquify
        cmd_diag=f"^{base}"
        if "dig" in base:
            cmd_diag=f"^dig api.corp.io +short"
            cmd_check=f"^dig api.corp.io TXT +short"
        else:
            cmd_check=f"{cmd_diag} --output json"
        if "Tunnel" in title:
            cmd_fix=f"^cloudflared tunnel route ip add 10.0.0.0/24 tunnel-{i}"
        elif "WAF" in title:
            cmd_fix=f"^curl -X PUT https://api.cloudflare.com/client/v4/zones/zone123/firewall/rules/rule-{i} --data '{{\"mode\":\"disable\"}}'"
        elif "DNS" in title:
            cmd_fix=f"^wrangler dns update api.corp.io --type CNAME --content origin.corp.io --proxied true"
        elif "Zero Trust" in title:
            cmd_fix=f"^cloudflared access policy update allow-{i} --decision allow --include email:alice@corp.io"
        else:
            cmd_fix=f"^cloudflared tunnel ingress validate"
        cmd_verify=cmd_diag
        commands=[
            (cmd_diag, "error: tunnel not found / 403 Forbidden / NXDOMAIN", "err"),
            (cmd_check, "check output: missing or blocked", "warn"),
            (cmd_fix, "fixed / updated", "ok"),
            (cmd_verify, "ok verified", "ok"),
        ]
        solution=[
            {"re": cmd_diag, "l": "диагностика"},
            {"re": cmd_fix, "l": "исправить"},
        ]
        entries.append(S_entry(cat, f"{prefix}-{i}", title, level, br, prompt, commands, solution))
    return entries

# --- PG ---
pg_topics = [
 "Patroni: switchover не проходит, synchronous_mode",
 "pg_stat_replication: replay_lag 4 минуты",
 "pg_rewind: нужен после промоута",
 "Barman: backup failed, WAL archive missing",
 "PITR: recovery_target_time не достижим",
 "EXPLAIN: Seq Scan вместо Index Scan",
 "Locks: pg_locks blocked 2 минуты",
 "Vacuum: autovacuum не успевает, bloat 3x",
 "Patroni: DCS etcd недоступен",
 "Replication: slot inactive, WAL растет",
 "pg_basebackup: checksum mismatch",
 "Barman: retention policy not enforced",
 "PITR: base backup старше 7 дней",
 "EXPLAIN: Nested Loop 10x медленнее Hash Join",
 "Locks: deadlock detected",
 "Vacuum: freeze age 1.8e9",
 "Patroni: timeline divergence",
 "pg_stat_activity: idle in transaction 3h",
 "Barman: ssh to backup host fails",
 "PITR: wal_level minimal вместо replica",
 "EXPLAIN: buffers 400MB read",
 "Locks: advisory lock не отпускается",
 "Vacuum: wraparound warning",
 "Patroni: synchronous_commit off",
 "Replication: wal_sender timeout",
 "pg_rewind: requires wal_log_hints on",
 "Barman: get-wal не находит",
 "EXPLAIN: parallel workers 0",
 "Locks: heavyweight lock queue",
 "Vacuum: index bloat 60%",
 "Patroni: failover manual vs automatic",
 "pg_stat_replication: flush_lag > write_lag",
 "Barman: cron не запустил backup",
 "PITR: restore_command не настроен",
 "EXPLAIN: materialize vs memoize"
]
assert len(pg_topics)==35

def gen_pg():
    cat="PostgreSQL"
    prefix="gc-pg"
    prompt="postgres@primary:~$"
    entries=[]
    for i, title in enumerate(pg_topics, start=1):
        level=levels[(i-1)%3]
        br=f"<b>Симптом:</b> {title}. Требуется диагностика PostgreSQL/Patroni."
        # Choose command base
        if "Patroni" in title:
            cmd_diag = "^patronictl -c /etc/patroni.yml list"
            cmd_check = "^patronictl -c /etc/patroni.yml show-config"
            cmd_fix = "^patronictl -c /etc/patroni.yml switchover --master pg1 --candidate pg2 --force"
            cmd_verify = "^patronictl -c /etc/patroni.yml list"
            out_diag="prod Leader pg1\nprod Replica pg2 lag 4m"
            out_check="synchronous_mode: on"
            out_fix="Switched over"
            out_verify="prod Leader pg2"
        elif "pg_stat_replication" in title or "replication" in title.lower() or "lag" in title.lower():
            cmd_diag = "^psql -c \"SELECT application_name, replay_lag FROM pg_stat_replication\""
            cmd_check = "^psql -c \"SELECT slot_name, active FROM pg_replication_slots\""
            cmd_fix = "^psql -c \"SELECT pg_reload_conf()\""
            cmd_verify = "^psql -c \"SELECT replay_lag FROM pg_stat_replication\""
            out_diag="replica-1 | 00:04:12"
            out_check="slot inactive"
            out_fix="t"
            out_verify="00:00:01"
        elif "pg_rewind" in title:
            cmd_diag = "^pg_rewind --dry-run --target-pgdata=/var/lib/postgresql/16/main --source-server='host=primary port=5432'"
            cmd_check = "^grep wal_log_hints /etc/postgresql/16/main/postgresql.conf"
            cmd_fix = "^psql -c \"ALTER SYSTEM SET wal_log_hints = on\" && systemctl restart postgresql"
            cmd_verify = "^pg_rewind --target-pgdata=/var/lib/postgresql/16/main --source-server='host=primary port=5432'"
            out_diag="needs wal_log_hints"
            out_check="wal_log_hints = off"
            out_fix="restarted"
            out_verify="rewind completed"
        elif "Barman" in title:
            cmd_diag = "^barman check pg-primary"
            cmd_check = "^barman list-backups pg-primary"
            cmd_fix = "^barman backup pg-primary"
            cmd_verify = "^barman check pg-primary"
            out_diag="FAILED: WAL archive"
            out_check="FAILED 0"
            out_fix="Backup completed"
            out_verify="OK"
        elif "PITR" in title or "recovery" in title.lower():
            cmd_diag = "^cat /var/lib/postgresql/16/main/postgresql.auto.conf | grep recovery_target_time"
            cmd_check = "^psql -c \"SELECT * FROM pg_stat_archiver\" | grep archived_count"
            cmd_fix = "^echo \"recovery_target_time = '2026-08-24 13:59:00'\" >> postgresql.auto.conf"
            cmd_verify = "^psql -c \"SELECT count(*) FROM shop.orders\""
            out_diag="recovery_target_time = '2026-08-24 14:00:00' (bad)"
            out_check="archived_count 8120"
            out_fix="patched"
            out_verify="12420"
        elif "EXPLAIN" in title:
            cmd_diag = "^psql -c \"EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users WHERE email='a@b.c'\""
            cmd_check = "^psql -c \"SELECT schemaname, tablename, attname FROM pg_stats WHERE tablename='users'\""
            cmd_fix = "^psql -c \"CREATE INDEX CONCURRENTLY idx_users_email ON users(email)\""
            cmd_verify = "^psql -c \"EXPLAIN (ANALYZE) SELECT * FROM users WHERE email='a@b.c'\" | grep Index"
            out_diag="Seq Scan cost=0.00..2435"
            out_check="no stats"
            out_fix="CREATE INDEX"
            out_verify="Index Scan using idx_users_email"
        elif "Locks" in title or "lock" in title.lower() or "deadlock" in title.lower():
            cmd_diag = "^psql -c \"SELECT pid, locktype, mode FROM pg_locks WHERE NOT granted\""
            cmd_check = "^psql -c \"SELECT pid, state, query FROM pg_stat_activity WHERE wait_event_type='Lock'\""
            cmd_fix = "^psql -c \"SELECT pg_cancel_backend(1234)\""
            cmd_verify = "^psql -c \"SELECT count(*) FROM pg_locks WHERE NOT granted\""
            out_diag="ExclusiveLock | blocked"
            out_check="wait_event Lock"
            out_fix="t"
            out_verify="0"
        elif "Vacuum" in title or "bloat" in title.lower() or "wraparound" in title.lower():
            cmd_diag = "^psql -c \"SELECT relname, n_dead_tup, last_vacuum FROM pg_stat_all_tables WHERE relname='orders'\""
            cmd_check = "^psql -c \"SELECT pg_size_pretty(pg_total_relation_size('orders'))\""
            cmd_fix = "^psql -c \"VACUUM (FULL, ANALYZE) orders\""
            cmd_verify = "^psql -c \"SELECT pg_size_pretty(pg_total_relation_size('orders'))\""
            out_diag="n_dead_tup 18234012"
            out_check="42 GB"
            out_fix="VACUUM"
            out_verify="14 GB"
        else:
            cmd_diag = "^psql -c \"SELECT * FROM pg_stat_activity\" | head -20"
            cmd_check = "^psql -c \"SHOW wal_level\""
            cmd_fix = "^psql -c \"SELECT pg_reload_conf()\""
            cmd_verify = "^psql -c \"SELECT pg_is_in_recovery()\""
            out_diag="state idle in transaction"
            out_check="replica"
            out_fix="t"
            out_verify="f"
        commands=[
            (cmd_diag, out_diag, "err" if i%3==0 else "warn"),
            (cmd_check, out_check, "warn"),
            (cmd_fix, out_fix, "ok"),
            (cmd_verify, out_verify, "ok"),
        ]
        solution=[
            {"re": cmd_diag, "l": "диагностика"},
            {"re": cmd_fix, "l": "исправить"},
        ]
        entries.append(S_entry(cat, f"{prefix}-{i}", title, level, br, prompt, commands, solution))
    return entries

# --- Kafka ---
kafka_topics = [
 "KRaft: quorum lost, 1/3 voters down",
 "Replicas: under-replicated partitions 12",
 "ISR: shrink 3->2, follower lag",
 "Lag: consumer group orders lag 4900",
 "reset-offsets: сдвинуть offset после poison pill",
 "SCRAM: SASL auth failed",
 "Schema Registry: incompatible Avro evolution",
 "Kraft: controller not leader",
 "Replicas: leader election failed",
 "ISR: follower fetch timeout",
 "Lag: partitions skew 80% on one broker",
 "SCRAM: credential rotation needed",
 "Schema: subject not found",
 "Kraft: metadata log segment corrupted",
 "Replicas: min.insync.replicas 2 not met",
 "ISR: throttled replica",
 "Lag: rebalancing storm",
 "reset-offsets: to-earliest vs to-latest",
 "SCRAM: PBKDF2 iterations too low",
 "Schema: compatibility FORWARD vs BACKWARD",
 "Kraft: snapshot at offset 12345 failed",
 "Replicas: preferred leader not available",
 "ISR: unclean leader election disabled",
 "Lag: max.poll.interval.ms exceeded",
 "SCRAM: JAAS config missing",
 "Schema: normalize schema 404",
 "Kraft: voter vs observer",
 "Replicas: assignment json malformed",
 "ISR: log retention 7d vs 30d",
 "Lag: consumer not committing",
 "SCRAM: SCRAM-SHA-512 vs 256",
 "Schema: schema id 42 not found",
 "Kraft: kraft.version 3.7",
 "Replicas: rack aware replica placement",
 "ISR: replica fetch backoff"
]
assert len(kafka_topics)==35

def gen_kafka():
    cat="Kafka"
    prefix="gc-kafka"
    prompt="dev@kafka:~$"
    entries=[]
    for i, title in enumerate(kafka_topics, start=1):
        level=levels[(i-1)%3]
        br=f"<b>Симптом:</b> {title}. Требуется диагностика Kafka Kraft/ISR."
        if "KRaft" in title or "kraft" in title.lower() or "quorum" in title.lower():
            cmd_diag="^kafka-metadata-quorum --bootstrap-server kafka:9092 describe --status"
            cmd_check="^cat /var/lib/kafka/meta.properties | grep node.id"
            cmd_fix="^systemctl restart kafka"
            cmd_verify="^kafka-metadata-quorum --bootstrap-server kafka:9092 describe --status"
            out_diag="Leader: 1  Followers: 2 (1 offline)"
            out_check="node.id=1"
            out_fix="restarted"
            out_verify="Leader:1 ISR 3/3"
        elif "Replicas" in title or "replica" in title.lower():
            cmd_diag="^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated"
            cmd_check="^kafka-topics.sh --bootstrap-server kafka:9092 --describe --topic orders"
            cmd_fix="^kafka-reassign-partitions.sh --bootstrap-server kafka:9092 --reassignment-json-file reassign.json --execute"
            cmd_verify="^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated"
            out_diag="Topic orders Partition 2 Replicas 1,2,3 Isr 1,2"
            out_check="PartitionCount 6 ReplicationFactor 3"
            out_fix="Reassignment completed"
            out_verify="(empty no URP)"
        elif "ISR" in title:
            cmd_diag="^kafka-topics.sh --bootstrap-server kafka:9092 --describe --under-replicated"
            cmd_check="^kafka-configs.sh --bootstrap-server kafka:9092 --describe --entity-type brokers --entity-name 2"
            cmd_fix="^kafka-configs.sh --bootstrap-server kafka:9092 --alter --entity-type brokers --entity-name 2 --add-config replica.fetch.wait.max.ms=500"
            cmd_verify="^kafka-topics.sh --bootstrap-server kafka:9092 --describe --topic orders"
            out_diag="Isr 1,2"
            out_check="fetch.wait 500"
            out_fix="Altered"
            out_verify="Isr 1,2,3"
        elif "Lag" in title or "lag" in title.lower():
            cmd_diag="^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders"
            cmd_check="^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders --members"
            cmd_fix="^kubectl -n prod scale deploy orders-consumer --replicas=4"
            cmd_verify="^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders | grep LAG"
            out_diag="orders 0 100 5000 4900"
            out_check="consumer-1 host=worker-1"
            out_fix="scaled"
            out_verify="LAG 0"
        elif "reset-offsets" in title:
            cmd_diag="^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders | grep \"2 \""
            cmd_check="^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders --offsets"
            cmd_fix="^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --reset-offsets --group orders --topic orders --partition 2 --to-offset 43 --execute"
            cmd_verify="^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders"
            out_diag="PARTITION 2 LAG 1"
            out_check="offset 42"
            out_fix="NEW-OFFSET 43"
            out_verify="LAG 0"
        elif "SCRAM" in title or "SASL" in title:
            cmd_diag="^kafka-configs.sh --bootstrap-server kafka:9092 --describe --entity-type users --entity-name alice"
            cmd_check="^cat /etc/kafka/jaas.conf | grep SCRAM"
            cmd_fix="^kafka-configs.sh --bootstrap-server kafka:9092 --alter --entity-type users --entity-name alice --add-config SCRAM-SHA-512=[password=secret]"
            cmd_verify="^kafkacat -b kafka:9092 -L -X sasl.mechanism=SCRAM-SHA-512 -X security.protocol=SASL_PLAINTEXT"
            out_diag="SCRAM credential not found"
            out_check="missing"
            out_fix="Altered"
            out_verify="metadata ok"
        elif "Schema" in title:
            cmd_diag="^curl -s http://schema-registry:8081/subjects/orders-value/versions/latest | jq .compatibility"
            cmd_check="^curl -s http://schema-registry:8081/config/orders-value | jq .compatibilityLevel"
            cmd_fix="^curl -X PUT http://schema-registry:8081/config/orders-value --data '{\"compatibility\":\"BACKWARD\"}' -H \"Content-Type: application/vnd.sr.v1+json\""
            cmd_verify="^curl -s http://schema-registry:8081/subjects/orders-value/versions | jq length"
            out_diag="INCOMPATIBLE"
            out_check="BACKWARD"
            out_fix="updated"
            out_verify="3 versions"
        else:
            cmd_diag="^kafka-topics.sh --bootstrap-server kafka:9092 --list | grep orders"
            cmd_check="^kafka-broker-api-versions.sh --bootstrap-server kafka:9092 | head -5"
            cmd_fix="^kafka-topics.sh --bootstrap-server kafka:9092 --alter --topic orders --partitions 6"
            cmd_verify="^kafka-topics.sh --bootstrap-server kafka:9092 --describe --topic orders"
            out_diag="orders"
            out_check="kafka 3.7"
            out_fix="Altered"
            out_verify="PartitionCount 6"
        commands=[
            (cmd_diag, out_diag, "err" if "lag" in title.lower() or "under" in title.lower() else "warn"),
            (cmd_check, out_check, "warn"),
            (cmd_fix, out_fix, "ok"),
            (cmd_verify, out_verify, "ok"),
        ]
        solution=[
            {"re": cmd_diag, "l": "диагностика"},
            {"re": cmd_fix, "l": "исправить"},
        ]
        entries.append(S_entry(cat, f"{prefix}-{i}", title, level, br, prompt, commands, solution))
    return entries

# --- Redis ---
redis_keywords = [
 "Sentinel: master down, failover не произошел",
 "Cluster: slot not covered CLUSTERDOWN",
 "Slot: migration 0-5460 stuck",
 "TLS: certificate expired",
 "ACL: user alice no permissions",
 "Failover: replica не промоутится",
 "Sentinel: quorum 2/3 not reached",
 "Cluster: meet не соединяет ноды",
 "Slot: reshard 1000 slots failed",
 "TLS: handshake failed",
 "ACL: wrongpass",
 "Failover: down-after-milliseconds 30000 too high",
 "Sentinel: announce-ip not set",
 "Cluster: gossip 10s lag",
 "Slot: cluster fix unassigned",
 "TLS: sni required",
 "ACL: -@all +get",
 "Failover: manual failover takes 60s",
 "Sentinel: parallel-syncs 1 bottleneck",
 "Cluster: rebalancing pending",
 "Slot: hash tag {user} unbalanced",
 "TLS: dhparam missing",
 "ACL: maxmemory 8GB reached",
 "Failover: replica priority 0 no promotion",
 "Sentinel: notification script failed",
 "Cluster: import not supported",
 "Slot: countkeysinslot 0-100 0",
 "TLS: tls-auth-clients no",
 "ACL: key pattern ~cached:*",
 "Failover: replica-serve-stale-data yes"
]
assert len(redis_keywords)==30

def gen_redis():
    cat="Redis"
    prefix="gc-redis"
    prompt="dev@redis:~$"
    entries=[]
    for i, title in enumerate(redis_keywords, start=1):
        level=levels[(i-1)%3]
        br=f"<b>Симптом:</b> {title}. Требуется диагностика Redis."
        if "Sentinel" in title:
            cmd_diag="^redis-cli -p 26379 sentinel masters"
            cmd_check="^redis-cli -p 26379 sentinel master mymaster"
            cmd_fix="^redis-cli -p 26379 sentinel failover mymaster"
            cmd_verify="^redis-cli -p 26379 sentinel masters | grep -A2 down-after-milliseconds"
            out_diag="master mymaster down"
            out_check="down-after 30000"
            out_fix="OK"
            out_verify="up"
        elif "Cluster" in title:
            cmd_diag="^redis-cli --cluster check 127.0.0.1:7000 | grep -i ERR"
            cmd_check="^redis-cli --cluster check 127.0.0.1:7000 | grep slots"
            cmd_fix="^redis-cli --cluster fix 127.0.0.1:7000 --cluster-yes"
            cmd_verify="^redis-cli --cluster check 127.0.0.1:7000 | grep OK"
            out_diag="slot 0 unassigned"
            out_check="16384 slots"
            out_fix="slot 0 assigned"
            out_verify="All 16384 slots covered"
        elif "Slot" in title:
            cmd_diag="^redis-cli --cluster check 127.0.0.1:7000 | grep slot"
            cmd_check="^redis-cli cluster slots | head -20"
            cmd_fix="^redis-cli --cluster reshard 127.0.0.1:7000 --cluster-from all --cluster-to c1 --cluster-slots 1000 --cluster-yes"
            cmd_verify="^redis-cli cluster info | grep cluster_state"
            out_diag="slot migration stuck"
            out_check="slots 0-5460"
            out_fix="resharded"
            out_verify="cluster_state:ok"
        elif "TLS" in title:
            cmd_diag="^redis-cli --tls --cert /tmp/cert.pem --key /tmp/key.pem -p 6380 ping"
            cmd_check="^openssl x509 -enddate -noout -in /etc/redis/cert.pem"
            cmd_fix="^redis-cli --tls -p 6380 config set tls-cert-file /etc/redis/newcert.pem"
            cmd_verify="^redis-cli --tls -p 6380 ping"
            out_diag="certificate verify failed"
            out_check="notAfter=Jan 01"
            out_fix="OK"
            out_verify="PONG"
        elif "ACL" in title:
            cmd_diag="^redis-cli ACL LIST | grep alice"
            cmd_check="^redis-cli ACL GETUSER alice"
            cmd_fix="^redis-cli ACL SETUSER alice on >secret +@all ~*"
            cmd_verify="^redis-cli --user alice --pass secret ping"
            out_diag="no permissions"
            out_check="~cached:*"
            out_fix="OK"
            out_verify="PONG"
        elif "Failover" in title:
            cmd_diag="^redis-cli info replication | grep role"
            cmd_check="^redis-cli info replication | grep master_repl_offset"
            cmd_fix="^redis-cli cluster failover TAKEOVER"
            cmd_verify="^redis-cli info replication | grep role"
            out_diag="role:slave"
            out_check="offset 123"
            out_fix="OK"
            out_verify="role:master"
        else:
            cmd_diag="^redis-cli info | grep used_memory_human"
            cmd_check="^redis-cli config get maxmemory"
            cmd_fix="^redis-cli config set maxmemory 8gb"
            cmd_verify="^redis-cli info | grep used_memory"
            out_diag="used_memory_human:8.20G"
            out_check="maxmemory 8gb"
            out_fix="OK"
            out_verify="used_memory_human:4GB"
        commands=[
            (cmd_diag, out_diag, "err"),
            (cmd_check, out_check, "warn"),
            (cmd_fix, out_fix, "ok"),
            (cmd_verify, out_verify, "ok"),
        ]
        solution=[
            {"re": cmd_diag, "l": "диагностика"},
            {"re": cmd_fix, "l": "исправить"},
        ]
        entries.append(S_entry(cat, f"{prefix}-{i}", title, level, br, prompt, commands, solution))
    return entries

# --- Mongo ---
mongo_keywords = [
 "RS: PRIMARY down, election 10s",
 "Sharding: balancer застрял, chunk migration stuck",
 "mongosh: connect ECONNREFUSED",
 "PBM: backup failed, pitr disabled",
 "Index: COLLSCAN вместо IXSCAN",
 "RS: secondary lag 60s",
 "Sharding: jumbo chunk 100MB",
 "mongosh: auth failed SCRAM",
 "PBM: restore to time 13:59",
 "Index: TTL not deleting",
 "RS: oplog window 2h слишком мал",
 "Sharding: zone sharding not balanced",
 "mongosh: readConcern majority timeout",
 "PBM: storage s3 bucket not reachable",
 "Index: compound index order wrong",
 "RS: priority 0 no election",
 "Sharding: config server RS unhealthy",
 "mongosh: mongod log slow query 800ms",
 "PBM: agent not running on secondary",
 "Index: sparse vs partial",
 "RS: arbiter not voting",
 "Sharding: shard key monotonic hot spot",
 "mongosh: rs.status health 0",
 "PBM: point-in-time 5 min granularity",
 "Index: text index not used",
 "RS: writeConcern w:2 timeout",
 "Sharding: movePrimary failed",
 "mongosh: db.stats scale",
 "PBM: backup retention 30d",
 "Index: hashed sharding key"
]
assert len(mongo_keywords)==30

def gen_mongo():
    cat="MongoDB"
    prefix="gc-mongo"
    prompt="dev@mongo:~$"
    entries=[]
    for i, title in enumerate(mongo_keywords, start=1):
        level=levels[(i-1)%3]
        br=f"<b>Симптом:</b> {title}. Требуется проверка MongoDB."
        if "RS" in title:
            cmd_diag="^mongosh --eval \"rs.status()\" | grep -A2 stateStr"
            cmd_check="^mongosh --eval \"rs.conf()\" | grep priority"
            cmd_fix="^mongosh --eval \"rs.stepDown()\""
            cmd_verify="^mongosh --eval \"rs.isMaster()\" | grep ismaster"
            out_diag="PRIMARY mongo-0\nSECONDARY mongo-1"
            out_check="priority 1"
            out_fix="stepDown"
            out_verify="ismaster true"
        elif "Sharding" in title or "shard" in title.lower() or "balancer" in title.lower() or "chunk" in title.lower():
            cmd_diag="^mongosh --eval \"sh.status()\" | grep -A5 balancer"
            cmd_check="^mongosh --eval \"sh.getBalancerState()\""
            cmd_fix="^mongosh --eval \"sh.startBalancer()\""
            cmd_verify="^mongosh --eval \"sh.isBalancerRunning()\""
            out_diag="balancer: enabled but stuck"
            out_check="true"
            out_fix="balancer started"
            out_verify="true"
        elif "mongosh" in title.lower() or "connect" in title.lower() or "log" in title.lower():
            cmd_diag="^mongosh --eval \"db.adminCommand({ping:1})\" | head -5"
            cmd_check="^mongosh --eval \"db.serverStatus().connections\" | grep current"
            cmd_fix="^mongosh --eval \"db.adminCommand({setParameter:1, logLevel:0})\""
            cmd_verify="^mongosh --eval \"db.runCommand({ping:1})\""
            out_diag="ECONNREFUSED"
            out_check="connections 40"
            out_fix="ok"
            out_verify="ok:1"
        elif "PBM" in title:
            cmd_diag="^pbm status | grep -A2 Running"
            cmd_check="^pbm config --list | grep pitr"
            cmd_fix="^pbm config --set pitr.enabled=true"
            cmd_verify="^pbm status | grep PBM"
            out_diag="FAILED"
            out_check="pitr.enabled false"
            out_fix="updated"
            out_verify="PBM OK"
        elif "Index" in title:
            cmd_diag="^mongosh --eval \"db.users.find({email:'a@b.c'}).explain('executionStats')\" | grep -A2 COLLSCAN"
            cmd_check="^mongosh --eval \"db.users.getIndexes()\" | grep email"
            cmd_fix="^mongosh --eval \"db.users.createIndex({email:1})\""
            cmd_verify="^mongosh --eval \"db.users.find({email:'a@b.c'}).explain()\" | grep IXSCAN"
            out_diag="COLLSCAN"
            out_check="no index"
            out_fix="created"
            out_verify="IXSCAN"
        else:
            cmd_diag="^mongosh --eval \"db.stats()\" | grep db"
            cmd_check="^mongosh --eval \"rs.printReplicationInfo()\" | grep oplog"
            cmd_fix="^mongosh --eval \"db.adminCommand({replSetResizeOplog:1, size: 10240})\""
            cmd_verify="^mongosh --eval \"rs.status()\" | grep ok"
            out_diag="db stats ok"
            out_check="oplog window 2h"
            out_fix="ok"
            out_verify="ok 1"
        commands=[
            (cmd_diag, out_diag, "err" if "down" in title.lower() or "fail" in title.lower() or "stuck" in title.lower() else "warn"),
            (cmd_check, out_check, "warn"),
            (cmd_fix, out_fix, "ok"),
            (cmd_verify, out_verify, "ok"),
        ]
        solution=[
            {"re": cmd_diag, "l": "диагностика"},
            {"re": cmd_fix, "l": "исправить"},
        ]
        entries.append(S_entry(cat, f"{prefix}-{i}", title, level, br, prompt, commands, solution))
    return entries

# --- Mesh Adv ---
mesh_topics = [
 "Cilium eBPF: drop 5% пакетов, policy deny",
 "Cilium: Hubble flow не видит traffic",
 "Calico BGP: peer down, route not advertised",
 "Calico: IPAM block 26 exhausted",
 "Istio mTLS: STRICT vs PERMISSIVE 503",
 "Istio: VirtualService weight 0 vs subset",
 "Linkerd viz: dashboard not showing golden metrics",
 "Linkerd: opaque ports 3306 not meshed",
 "Traefik middleware: stripPrefix не срабатывает",
 "Traefik: TLSStore default cert not found",
 "eBPF XDP: program not loaded on eth0",
 "Cilium: kube-proxy replacement strict",
 "Calico: Typha лимит 100 nodes exceeded",
 "Istio: PeerAuthentication portLevel",
 "Linkerd: proxy inject disabled",
 "Traefik: entryPoints websecure 8443",
 "Cilium: bandwidth manager not enabled",
 "Calico: BGP password mismatch",
 "Istio: DestinationRule outlierDetection",
 "Linkerd: multicluster gateway not ready",
 "Traefik: forwardAuth middleware 401",
 "eBPF: cilium bpf lb list stuck",
 "Cilium: ClusterMesh apiserver not synced",
 "Calico: Felix metrics 0",
 "Istio: sidecar injection webhook fail",
 "Linkerd: tap not working due to mTLS",
 "Traefik: rateLimit 100r/s blocks",
 "eBPF: XDP program attach failed",
 "Cilium: egress gateway masquerade",
 "Calico: node-to-node mesh vs route reflector",
 "Istio: Ambient vs sidecar",
 "Linkerd: policy server 403",
 "Traefik: plugins not loaded",
 "eBPF: tc filter not applied",
 "Cilium: L7 policy http 403"
]
assert len(mesh_topics)==35

def gen_mesh():
    cat="Service Mesh"
    prefix="gc-mesh"
    prompt="dev@mesh:~$"
    entries=[]
    for i, title in enumerate(mesh_topics, start=1):
        level=levels[(i-1)%3]
        br=f"<b>Симптом:</b> {title}. Требуется диагностика mesh/eBPF."
        if "Cilium" in title or "eBPF" in title or "Hubble" in title:
            cmd_diag="^cilium status --verbose | head -20"
            cmd_check="^cilium config view | grep kube-proxy-replacement"
            cmd_fix="^cilium config set kube-proxy-replacement strict"
            cmd_verify="^cilium status | grep -i ok"
            out_diag="Cilium 1/1 policy deny"
            out_check="strict disabled"
            out_fix="set"
            out_verify="Ok"
            if "Hubble" in title:
                cmd_diag="^hubble observe --since 1m | head -20"
                out_diag="flow drop policy"
                cmd_fix="^cilium connectivity test"
            if "XDP" in title or "bpf" in title.lower():
                cmd_diag="^bpftool prog show | grep xdp"
                out_diag="not loaded"
                cmd_fix="^cilium bpf lb list"
        elif "Calico" in title:
            cmd_diag="^calicoctl get bgpPeer -o wide"
            cmd_check="^calicoctl get ipPool -o yaml | grep blockSize"
            cmd_fix="^calicoctl patch bgpPeer peer-1 -p '{\"spec\":{\"password\":\"secret\"}}'"
            cmd_verify="^calicoctl node status | grep Established"
            out_diag="peer down"
            out_check="blockSize 26"
            out_fix="patched"
            out_verify="Established"
        elif "Istio" in title:
            cmd_diag="^istioctl analyze -n prod | grep -A2 mTLS"
            cmd_check="^kubectl get peerauthentication -n prod -o yaml | grep mode"
            cmd_fix="^kubectl apply -f peerauth-strict.yaml"
            cmd_verify="^istioctl analyze -n prod | grep -c Error"
            out_diag="STRICT vs PERMISSIVE conflict 503"
            out_check="mode PERMISSIVE"
            out_fix="applied"
            out_verify="0"
        elif "Linkerd" in title:
            cmd_diag="^linkerd check --proxy -n prod | head -20"
            cmd_check="^linkerd viz stat deploy -n prod | grep api"
            cmd_fix="^kubectl annotate deploy api -n prod linkerd.io/inject=enabled"
            cmd_verify="^linkerd check --proxy -n prod | grep -i ok"
            out_diag="proxy not ready"
            out_check="meshed 0/3"
            out_fix="annotated"
            out_verify="ok"
        elif "Traefik" in title:
            cmd_diag="^kubectl get middleware -n prod -o yaml | grep stripPrefix"
            cmd_check="^kubectl get ingressroute -n prod -o yaml | grep entryPoints"
            cmd_fix="^kubectl apply -f middleware-fix.yaml"
            cmd_verify="^curl -s http://traefik.prod/metrics | grep entrypoint"
            out_diag="stripPrefix not applied"
            out_check="websecure 8443"
            out_fix="applied"
            out_verify="ok"
        else:
            cmd_diag="^kubectl get pods -n kube-system -l k8s-app=cilium | grep Running"
            cmd_check="^kubectl logs -n kube-system ds/cilium | grep -i drop | tail -5"
            cmd_fix="^cilium connectivity test"
            cmd_verify="^cilium status | grep -i health"
            out_diag="1/1 Running"
            out_check="drop 5%"
            out_fix="passed"
            out_verify="health ok"
        commands=[
            (cmd_diag, out_diag, "err" if "down" in out_diag.lower() or "fail" in out_diag.lower() or "not" in out_diag.lower() else "warn"),
            (cmd_check, out_check, "warn"),
            (cmd_fix, out_fix, "ok"),
            (cmd_verify, out_verify, "ok"),
        ]
        solution=[
            {"re": cmd_diag, "l": "диагностика"},
            {"re": cmd_fix, "l": "исправить"},
        ]
        entries.append(S_entry(cat, f"{prefix}-{i}", title, level, br, prompt, commands, solution))
    return entries

# --- DR SRE ---
dr_topics = [
 "Velero backup: schedule missed 2 days",
 "Velero restore: PVC not bound after restore",
 "etcd snapshot save: 2.1GB DB size NOSPACE",
 "etcd snapshot restore: data-dir mismatch",
 "RPO 15m vs RTO 1h — не укладываемся",
 "SLO: burn rate 14x, error budget 2%",
 "SLO: latency p99 800ms > 200ms",
 "Error budget: релиз заблокирован, 0%",
 "Postmortem: incident 2h, нет action items",
 "Velero: restic vs kopia uploader",
 "etcd: compact revision 12345 failed",
 "etcd: defrag needed, 50% fragmentation",
 "RPO: cross-region replication lag 30m",
 "SLO: SLI availability 99.9% vs 99.95%",
 "Error budget: burndown chart 30d",
 "Postmortem: blameless template",
 "Velero: BSL bucket not reachable 403",
 "etcd: member list 1 unhealthy",
 "RTO: restore 45m vs 1h",
 "SLO: multi-window burn alert",
 "Error budget: feature freeze",
 "Postmortem: 5 whys",
 "Velero: backup TTL 30d vs 7d",
 "etcd: snapshot status hash mismatch",
 "RPO: async vs sync replication",
 "SLO: apdex 0.85",
 "Error budget: 28d rolling window",
 "Postmortem: incident severity SEV1",
 "Velero: schedule pause/unpause",
 "etcd: quorum 2/3 lost",
 "RTO: disaster recovery drill failed",
 "SLO: SLI vs SLO vs SLA",
 "Error budget: policy 50% halt",
 "Postmortem: follow-up tickets",
 "Velero: velero backup describe --details"
]
assert len(dr_topics)==35

def gen_dr():
    cat="SRE DR"
    prefix="gc-dr"
    prompt="dev@sre:~$"
    entries=[]
    for i, title in enumerate(dr_topics, start=1):
        level=levels[(i-1)%3]
        br=f"<b>Симптом:</b> {title}. Требуется проверка DR/SLO."
        if "Velero" in title:
            cmd_diag="^velero backup get | grep -A2 prod-daily"
            cmd_check="^velero backup describe prod-daily --details | grep -A2 Status"
            cmd_fix="^velero backup create prod-manual --include-namespaces prod --wait"
            cmd_verify="^velero backup get | grep Completed"
            out_diag="prod-daily PartiallyFailed 2d ago"
            out_check="Status Failed"
            out_fix="Backup completed"
            out_verify="Completed"
            if "restore" in title.lower():
                cmd_diag="^velero restore get | grep -A2 prod-restore"
                cmd_fix="^velero restore create --from-backup prod-daily --wait"
        elif "etcd" in title:
            cmd_diag="^ETCDCTL_API=3 etcdctl endpoint status -w table | head -10"
            cmd_check="^ETCDCTL_API=3 etcdctl alarm list"
            cmd_fix="^ETCDCTL_API=3 etcdctl compact $(ETCDCTL_API=3 etcdctl endpoint status -w json | jq -r '.[0].Status.header.revision')"
            cmd_verify="^ETCDCTL_API=3 etcdctl endpoint health"
            out_diag="DB SIZE 2.1GB"
            out_check="alarm:NOSPACE"
            out_fix="compacted revision 12345"
            out_verify="healthy"
            if "snapshot" in title.lower():
                cmd_diag="^ETCDCTL_API=3 etcdctl snapshot save /tmp/etcd.db | tail -3"
                cmd_fix="^ETCDCTL_API=3 etcdctl snapshot save /tmp/etcd.db"
        elif "RPO" in title or "RTO" in title:
            cmd_diag="^cat docs/runbook/dr.md | grep -A2 RPO"
            cmd_check="^velero backup get -o json | jq -r '.items[0].status.expiration'"
            cmd_fix="^echo \"RPO 15m RTO 1h\" >> docs/runbook/dr.md"
            cmd_verify="^cat docs/runbook/dr.md | grep RTO"
            out_diag="RPO 15m RTO 1h"
            out_check="expiration 2026-08-25"
            out_fix="updated"
            out_verify="RTO 1h"
        elif "SLO" in title or "SLI" in title or "apdex" in title.lower():
            cmd_diag="^cat slo.yaml | grep -A2 burnRate"
            cmd_check="^promtool query instant http://prometheus:9090 'burn_rate'"
            cmd_fix="^kubectl apply -f slo-fix.yaml"
            cmd_verify="^cat slo.yaml | grep -A2 target"
            out_diag="burn rate 14x"
            out_check="14"
            out_fix="applied"
            out_verify="target 99.9"
        elif "Error budget" in title:
            cmd_diag="^cat error-budget.json | jq .remaining"
            cmd_check="^cat slo.yaml | grep -A3 errorBudget"
            cmd_fix="^echo \"freeze release\" >> error-budget.json"
            cmd_verify="^cat error-budget.json | jq .policy"
            out_diag="remaining 2%"
            out_check="errorBudget 100%"
            out_fix="freeze"
            out_verify="policy 50% halt"
        elif "Postmortem" in title:
            cmd_diag="^cat postmortem/2026-08-24.md | head -20"
            cmd_check="^cat postmortem/2026-08-24.md | grep -i \"Action Items\""
            cmd_fix="^echo \"- [ ] fix alarm\" >> postmortem/2026-08-24.md"
            cmd_verify="^cat postmortem/2026-08-24.md | grep -c \"Action\""
            out_diag="# Incident 2026-08-24 2h"
            out_check="no action items"
            out_fix="added"
            out_verify="3"
        else:
            cmd_diag="^kubectl get pods -n velero | grep Running"
            cmd_check="^velero backup describe prod-daily | grep -A2 Errors"
            cmd_fix="^velero backup create prod-fix --wait"
            cmd_verify="^velero backup get | grep prod-fix"
            out_diag="1/1 Running"
            out_check="0 Errors"
            out_fix="created"
            out_verify="Completed"
        commands=[
            (cmd_diag, out_diag, "warn"),
            (cmd_check, out_check, "warn"),
            (cmd_fix, out_fix, "ok"),
            (cmd_verify, out_verify, "ok"),
        ]
        solution=[
            {"re": cmd_diag, "l": "диагностика"},
            {"re": cmd_fix, "l": "исправить"},
        ]
        entries.append(S_entry(cat, f"{prefix}-{i}", title, level, br, prompt, commands, solution))
    return entries

# --- Python ---
py_topics = [
 "argparse: required arg missing",
 "pathlib: Path vs str join bug",
 "subprocess: shell=True injection risk",
 "subprocess: timeout 30s not handled",
 "socket: SO_REUSEADDR not set, bind fails",
 "socket: timeout not set, hangs",
 "requests: Session not reused, 100ms overhead",
 "requests: retry not configured, flaky 503",
 "asyncio: event loop already running",
 "asyncio: gather vs wait, exception swallowed",
 "threading: race condition, need Lock",
 "threading: daemon thread not joined",
 "GIL: cpu bound 4x slower in threads",
 "tracemalloc: найти утечку 200MB",
 "cProfile: hot spot 80% в json.loads",
 "logging: basicConfig called twice, handler dup",
 "logging: JSON formatter not applied",
 "testing: pytest fixture scope function vs module",
 "testing: mock patch where to patch",
 "asyncio: aiohttp ClientSession leak unclosed",
 "pathlib: resolve vs absolute",
 "subprocess: Popen communicate deadlock",
 "socket: TCP_NODELAY not set, latency 40ms",
 "requests: timeout tuple connect/read",
 "asyncio: asyncio.Queue maxsize block",
 "threading: ThreadPoolExecutor vs ProcessPool",
 "GIL: multiprocessing 4 cores 3.5x speedup",
 "tracemalloc: top 10 snapshot compare",
 "cProfile: pstats sort cumulative",
 "logging: dictConfig yaml",
 "testing: parametrize 10 cases",
 "testing: coverage 85% vs 60%",
 "argparse: subparsers",
 "pathlib: glob **/*.py recursive",
 "subprocess: check=True vs returncode",
 "socket: select vs poll",
 "requests: backoff exponential",
 "asyncio: task cancellation CancelledError",
 "threading: condition wait/notify",
 "GIL: C extension releases GIL",
 "tracemalloc: Traceback 4 frames",
 "cProfile: snakeviz",
 "logging: RotatingFileHandler 10MB",
 "testing: pytest-xdist -n auto",
 "asyncio: uvloop 2x speed",
 "pathlib: chmod 0o755",
 "subprocess: env PATH",
 "socket: getaddrinfo IPv4 vs IPv6",
 "requests: streaming large 500MB OOM",
 "asyncio: semaphore 5 concurrency"
]
# need 50
assert len(py_topics)==50

def gen_python():
    cat="Python"
    prefix="gc-py"
    prompt="dev@py:~$"
    entries=[]
    for i, title in enumerate(py_topics, start=1):
        level=levels[(i-1)%3]
        br=f"<b>Задача:</b> {title}. Требуется диагностика Python devops."
        # Choose command base by keyword
        low=title.lower()
        if "argparse" in low:
            cmd_diag="^python3 app.py --help | head -20"
            cmd_check="^python3 app.py 2>&1 | grep -i error | head -5"
            cmd_fix="^sed -i s/required=False/required=True/ app.py"
            cmd_verify="^python3 app.py --arg val | head -5"
        elif "pathlib" in low:
            cmd_diag="^python3 -c \"from pathlib import Path; print(Path('a') / 'b')\""
            cmd_check="^python3 -c \"import pathlib; help(pathlib.Path.joinpath)\" | head -20"
            cmd_fix="^python3 -c \"from pathlib import Path; Path('out').mkdir(parents=True, exist_ok=True)\""
            cmd_verify="^python3 app.py && ls out | head -5"
        elif "subprocess" in low:
            cmd_diag="^python3 -c \"import subprocess; subprocess.run(['ls', '/tmp'], timeout=5)\" 2>&1 | head -10"
            cmd_check="^python3 -c \"import subprocess; help(subprocess.run)\" | grep -A2 timeout | head -10"
            cmd_fix="^sed -i s/shell=True/shell=False/ app.py"
            cmd_verify="^python3 app.py 2>&1 | tail -10"
        elif "socket" in low:
            cmd_diag="^python3 -c \"import socket; s=socket.socket(); s.bind(('127.0.0.1', 8080))\" 2>&1 | head -10"
            cmd_check="^python3 -c \"import socket; print(socket.SO_REUSEADDR)\""
            cmd_fix="^python3 -c \"import socket; s=socket.socket(); s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)\""
            cmd_verify="^python3 server.py & sleep 1; curl -s localhost:8080/healthz | head -5"
        elif "requests" in low:
            cmd_diag="^python3 -c \"import requests; r=requests.get('http://api/healthz', timeout=5); print(r.status_code)\" 2>&1 | head -10"
            cmd_check="^python3 -c \"import requests; s=requests.Session(); print(s)\" | head -5"
            cmd_fix="^sed -i s/requests.get/requests.Session().get/ app.py"
            cmd_verify="^python3 app.py 2>&1 | grep -i retry | head -5"
        elif "asyncio" in low:
            cmd_diag="^python3 -c \"import asyncio; asyncio.run(main())\" 2>&1 | head -20"
            cmd_check="^python3 -c \"import asyncio; help(asyncio.gather)\" | head -20"
            cmd_fix="^sed -i s/asyncio.gather/asyncio.wait/ app.py"
            cmd_verify="^python3 app.py 2>&1 | tail -10"
        elif "threading" in low:
            cmd_diag="^python3 -c \"import threading; print(threading.active_count())\" | head -5"
            cmd_check="^python3 app.py 2>&1 | grep -i race | head -10"
            cmd_fix="^python3 -c \"import threading; lock=threading.Lock(); lock.acquire(); print('locked')\""
            cmd_verify="^python3 app.py 2>&1 | grep -i ok | head -5"
        elif "gil" in low:
            cmd_diag="^python3 -c \"import threading; help(threading)\" | grep -i gil | head -5"
            cmd_check="^python3 bench.py 2>&1 | grep -A2 time | head -10"
            cmd_fix="^python3 -c \"from multiprocessing import Pool; Pool(4).map(func, range(100))\" 2>&1 | head -10"
            cmd_verify="^python3 bench.py | tail -5"
        elif "tracemalloc" in low:
            cmd_diag="^python3 -X tracemalloc app.py 2>&1 | grep -A5 tracemalloc | head -20"
            cmd_check="^python3 -c \"import tracemalloc; tracemalloc.start(); snap=tracemalloc.take_snapshot(); print(snap.statistics('lineno')[:3])\" | head -10"
            cmd_fix="^sed -i s/\"leak\"/\"fixed\"/ app.py"
            cmd_verify="^python3 -X tracemalloc app.py 2>&1 | tail -10"
        elif "cprofile" in low or "profile" in low:
            cmd_diag="^python3 -m cProfile -s cumulative app.py 2>&1 | head -30"
            cmd_check="^python3 -m pstats app.prof 2>&1 | head -20"
            cmd_fix="^python3 -m cProfile -o app.prof app.py && python3 -c \"import pstats; p=pstats.Stats('app.prof'); p.sort_stats('cumulative').print_stats(5)\" | head -20"
            cmd_verify="^python3 app.py 2>&1 | grep -i time | head -5"
        elif "logging" in low:
            cmd_diag="^python3 -c \"import logging; logging.basicConfig(level='INFO'); logging.info('test')\" 2>&1 | head -10"
            cmd_check="^cat app.py | grep -A2 logging | head -20"
            cmd_fix="^sed -i s/basicConfig/dictConfig/ app.py"
            cmd_verify="^python3 app.py 2>&1 | head -10"
        elif "testing" in low or "pytest" in low or "mock" in low or "coverage" in low:
            cmd_diag="^pytest -q 2>&1 | tail -20"
            cmd_check="^pytest --collect-only 2>&1 | head -20"
            cmd_fix="^pytest --cov=app --cov-report=term 2>&1 | tail -10"
            cmd_verify="^pytest -q 2>&1 | grep -i passed | tail -5"
        else:
            cmd_diag="^python3 app.py 2>&1 | head -20"
            cmd_check="^python3 -c \"help('modules')\" | grep -i app | head -10"
            cmd_fix="^python3 -m py_compile app.py && echo ok"
            cmd_verify="^python3 app.py | tail -5"
        commands=[
            (cmd_diag, "error or missing output", "err" if "missing" in title.lower() or "fail" in title.lower() else "warn"),
            (cmd_check, "check output", "warn"),
            (cmd_fix, "fixed", "ok"),
            (cmd_verify, "ok verified", "ok"),
        ]
        solution=[
            {"re": cmd_diag, "l": "диагностика"},
            {"re": cmd_fix, "l": "исправить"},
        ]
        entries.append(S_entry(cat, f"{prefix}-{i}", title, level, br, prompt, commands, solution))
    return entries

# --- Go ---
go_topics = [
 "interface nil: typed nil vs nil interface",
 "errors.Is vs ==",
 "errors.As unwrap",
 "generics: type constraint comparable",
 "generics: any vs interface{}",
 "escape analysis: variable escapes to heap",
 "goroutine leak: not closed channel",
 "goroutine leak: context not cancelled",
 "channel: buffered vs unbuffered deadlock",
 "channel: close twice panic",
 "context: WithTimeout 5s",
 "context: WithCancel propagate",
 "pprof: heap 200MB top",
 "pprof: goroutine 1000 blocked",
 "bench: BenchmarkX 10 ns/op",
 "bench: parallel bench",
 "vet: printf mismatch",
 "vet: shadow variable",
 "controller: reconcile 3s timeout",
 "controller: leader election 15s lease",
 "interface: type assertion panic",
 "errors: wrap %w vs %v",
 "generics: comparable map key",
 "escape: slice append reallocate",
 "goroutine: WaitGroup Add before Go",
 "channel: select default non-blocking",
 "context: Value key collision",
 "pprof: cpu 80% in json.Marshal",
 "bench: memory b/alloc",
 "vet: unreachable code",
 "controller: workqueue rate limiter",
 "controller: owner reference GC",
 "interface: empty interface performance",
 "errors: multierror Join",
 "generics: constraints.Ordered",
 "escape: defer in loop",
 "goroutine: worker pool 10",
 "channel: fan-in fan-out",
 "context: WithValue vs struct",
 "pprof: trace 1s",
 "bench: -benchmem",
 "vet: vet -all",
 "controller: status subresource",
 "controller: finalizer blocks delete",
 "interface: io.Reader vs io.ReadCloser",
 "errors: sentinel vs dynamic",
 "generics: type set ~int | ~int64",
 "escape: string to []byte copy",
 "goroutine: semaphore weighted",
 "channel: nil channel blocks forever"
]
assert len(go_topics)==50

def gen_go():
    cat="Go"
    prefix="gc-go"
    prompt="dev@go:~$"
    entries=[]
    for i, title in enumerate(go_topics, start=1):
        level=levels[(i-1)%3]
        br=f"<b>Задача:</b> {title}. Требуется диагностика Go."
        low=title.lower()
        if "interface" in low:
            cmd_diag="^go run main.go 2>&1 | head -20"
            cmd_check="^go vet ./... 2>&1 | head -20"
            cmd_fix="^sed -i s/'var s *MyInterface'/'var s MyInterface = (*MyStruct)(nil)'/ main.go"
            cmd_verify="^go run main.go 2>&1 | grep -i nil | head -10"
        elif "errors" in low:
            cmd_diag="^go run main.go 2>&1 | grep -A2 error | head -10"
            cmd_check="^grep -n errors.Is main.go | head -10"
            cmd_fix="^sed -i s/'err == io.EOF'/'errors.Is(err, io.EOF)'/ main.go"
            cmd_verify="^go test ./... 2>&1 | tail -10"
        elif "generics" in low:
            cmd_diag="^go run main.go 2>&1 | grep -i generic | head -10"
            cmd_check="^grep -n \"comparable\" main.go | head -10"
            cmd_fix="^sed -i s/'func Max'/'func Max[T comparable]'/ main.go"
            cmd_verify="^go build ./... 2>&1 | head -10"
        elif "escape" in low:
            cmd_diag="^go build -gcflags=-m main.go 2>&1 | grep -i escape | head -10"
            cmd_check="^go run -gcflags=-m main.go 2>&1 | grep heap | head -10"
            cmd_fix="^sed -i s/'new(int)'/'int'/ main.go"
            cmd_verify="^go build -gcflags=-m main.go 2>&1 | grep -i \"escapes to heap\" | head -5"
        elif "goroutine" in low or "leak" in low:
            cmd_diag="^go test -run TestLeak -count=1 2>&1 | head -20"
            cmd_check="^go vet -run TestLeak 2>&1 | head -10"
            cmd_fix="^sed -i s/'go func()'/'go func(ctx context.Context)'/ main.go"
            cmd_verify="^go test -run TestLeak -count=1 2>&1 | grep -i leak | head -10"
        elif "channel" in low:
            cmd_diag="^go run main.go 2>&1 | grep -i deadlock | head -10"
            cmd_check="^grep -n \"chan\" main.go | head -10"
            cmd_fix="^sed -i s/'ch := make(chan int)'/'ch := make(chan int, 10)'/ main.go"
            cmd_verify="^go run main.go 2>&1 | tail -10"
        elif "context" in low:
            cmd_diag="^go run main.go 2>&1 | grep -A2 context | head -10"
            cmd_check="^grep -n context.With main.go | head -10"
            cmd_fix="^sed -i s/'context.Background()'/'context.WithTimeout(context.Background(), 5*time.Second)'/ main.go"
            cmd_verify="^go run main.go 2>&1 | grep -i timeout | head -10"
        elif "pprof" in low:
            cmd_diag="^go test -bench=. -cpuprofile cpu.prof 2>&1 | head -20"
            cmd_check="^go tool pprof -top cpu.prof 2>&1 | head -20"
            cmd_fix="^go tool pprof -list main cpu.prof 2>&1 | head -20"
            cmd_verify="^go test -bench=. 2>&1 | grep -i bench | head -10"
        elif "bench" in low:
            cmd_diag="^go test -bench=. -benchmem 2>&1 | head -20"
            cmd_check="^grep -n Benchmark main_test.go | head -10"
            cmd_fix="^sed -i s/'BenchmarkX'/'BenchmarkY'/ main_test.go"
            cmd_verify="^go test -bench=Benchmark 2>&1 | tail -10"
        elif "vet" in low:
            cmd_diag="^go vet ./... 2>&1 | head -20"
            cmd_check="^go vet -all ./... 2>&1 | head -20"
            cmd_fix="^sed -i s/'printf(\"%s\", 123)'/'printf(\"%d\", 123)'/ main.go"
            cmd_verify="^go vet ./... 2>&1 | grep -c \"vet\" | head -5"
        elif "controller" in low:
            cmd_diag="^kubectl logs deploy/controller -n prod 2>&1 | grep -i reconcile | head -10"
            cmd_check="^kubectl get lease -n prod | grep controller | head -5"
            cmd_fix="^kubectl patch deploy controller -n prod -p '{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"restart\":\"now\"}}}}}'"
            cmd_verify="^kubectl get pods -n prod -l app=controller | grep Running"
        else:
            cmd_diag="^go run main.go 2>&1 | head -20"
            cmd_check="^go test ./... 2>&1 | head -20"
            cmd_fix="^go fmt ./... && echo formatted"
            cmd_verify="^go run main.go 2>&1 | tail -10"
        commands=[
            (cmd_diag, "diagnostic output: error or mismatch", "err" if "panic" in low or "nil" in low or "leak" in low else "warn"),
            (cmd_check, "check output", "warn"),
            (cmd_fix, "fixed", "ok"),
            (cmd_verify, "ok verified", "ok"),
        ]
        solution=[
            {"re": cmd_diag, "l": "диагностика"},
            {"re": cmd_fix, "l": "исправить"},
        ]
        entries.append(S_entry(cat, f"{prefix}-{i}", title, level, br, prompt, commands, solution))
    return entries

# --- Bash ---
bash_topics = [
 "arrays: ${arr[@]} vs ${arr[*]} word splitting",
 "getopts: parse -f file -v verbose",
 "mapfile: readarray 10k lines OOM",
 "flock: 2 процесса пишут в файл одновременно",
 "jq: filter .items[] | select(.status==\"Failed\")",
 "jq: -r raw output без кавычек",
 "awk: $1 $NF last field",
 "awk: BEGIN FS OFS",
 "sed: -i без бэкапа GNU vs BSD",
 "sed: capture group \\1",
 "xargs -P: parallel 10 jobs",
 "xargs: -0 с find -print0",
 "shellcheck: SC2086 double quote",
 "shellcheck: SC2046 $(...)",
 "arrays: associative array declare -A",
 "getopts: long opts --help",
 "mapfile: -t trim newline",
 "flock: non-blocking -n",
 "jq: to_entries vs keys",
 "awk: sum $3",
 "sed: delete line 3d",
 "xargs: limit -n 2",
 "shellcheck: disable SC2143 grep -q",
 "arrays: slice ${arr[@]:1:2}",
 "getopts: OPTARG",
 "mapfile: -d ':' delimiter",
 "flock: -w 5 timeout",
 "jq: --arg var",
 "awk: regex /error/ ",
 "sed: y/abc/ABC/ transliterate",
 "xargs -P: max-procs 4",
 "shellcheck: SC2164 cd || exit",
 "arrays: ${#arr[@]} length",
 "getopts: shift $((OPTIND-1))",
 "mapfile: process substitution < <(cmd)"
]
assert len(bash_topics)==35

def gen_bash():
    cat="Bash"
    prefix="gc-bash"
    prompt="dev@bash:~$"
    entries=[]
    for i, title in enumerate(bash_topics, start=1):
        level=levels[(i-1)%3]
        br=f"<b>Задача:</b> {title}. Требуется исправление bash скрипта."
        low=title.lower()
        if "arrays" in low or "associative" in low or "slice" in low or "length" in low:
            cmd_diag="^bash -x script.sh 2>&1 | head -20"
            cmd_check="^cat script.sh | grep -A2 \"arr\\[\" | head -20"
            cmd_fix="^sed -i s/'${arr[*]}'/'${arr[@]}'/ script.sh"
            cmd_verify="^bash script.sh 2>&1 | head -20"
        elif "getopts" in low:
            cmd_diag="^bash script.sh -f file.txt -v 2>&1 | head -20"
            cmd_check="^cat script.sh | grep -A5 getopts | head -20"
            cmd_fix="^sed -i s/'getopts f:'/'getopts f:v'/ script.sh"
            cmd_verify="^bash script.sh -f file.txt -v 2>&1 | tail -10"
        elif "mapfile" in low:
            cmd_diag="^bash -c \"mapfile -t arr < large.txt; echo ${#arr[@]}\" 2>&1 | head -10"
            cmd_check="^cat script.sh | grep -A2 mapfile | head -20"
            cmd_fix="^sed -i s/'mapfile arr'/'mapfile -t arr'/ script.sh"
            cmd_verify="^bash script.sh 2>&1 | head -10"
        elif "flock" in low:
            cmd_diag="^flock -n /tmp/lock -c \"sleep 10\" & flock -n /tmp/lock -c \"echo locked\" 2>&1 | head -10"
            cmd_check="^cat script.sh | grep -A2 flock | head -20"
            cmd_fix="^sed -i s/'flock \\/tmp\\/lock'/'flock -n \\/tmp\\/lock'/ script.sh"
            cmd_verify="^bash script.sh 2>&1 | tail -10"
        elif "jq" in low:
            cmd_diag="^cat data.json | jq '.items[] | select(.status==\"Failed\")' 2>&1 | head -20"
            cmd_check="^cat data.json | jq -r '.items[0].name' 2>&1 | head -10"
            cmd_fix="^cat data.json | jq -r '.items[] | select(.status==\"Failed\") | .name' > out.txt"
            cmd_verify="^cat out.txt | head -10"
        elif "awk" in low:
            cmd_diag="^awk '{print $1, $NF}' access.log | head -10"
            cmd_check="^cat script.sh | grep awk | head -20"
            cmd_fix="^awk 'BEGIN{FS=\",\"; OFS=\";\"} {print $1, $3}' data.csv > out.csv"
            cmd_verify="^cat out.csv | head -10"
        elif "sed" in low:
            cmd_diag="^sed -n '3p' file.txt 2>&1 | head -10"
            cmd_check="^cat script.sh | grep sed | head -20"
            cmd_fix="^sed -i.bak s/old/new/g file.txt"
            cmd_verify="^cat file.txt | head -10"
        elif "xargs" in low:
            cmd_diag="^cat files.txt | xargs -I{} echo {} 2>&1 | head -10"
            cmd_check="^cat files.txt | xargs -P 4 -I{} echo {} 2>&1 | head -10"
            cmd_fix="^cat files.txt | xargs -0 -P 4 -I{} echo {} < <(tr '\\n' '\\0' < files.txt)"
            cmd_verify="^cat files.txt | xargs -P 4 -I{} bash -c \"echo {}\" | head -10"
        elif "shellcheck" in low:
            cmd_diag="^shellcheck script.sh 2>&1 | head -20"
            cmd_check="^cat script.sh | head -20"
            cmd_fix="^shellcheck --fix script.sh 2>&1 | head -10"
            cmd_verify="^shellcheck script.sh 2>&1 | grep -c SC | head -5"
        else:
            cmd_diag="^bash -x script.sh 2>&1 | head -20"
            cmd_check="^cat script.sh | head -20"
            cmd_fix="^chmod +x script.sh && ./script.sh 2>&1 | head -20"
            cmd_verify="^bash script.sh 2>&1 | tail -10"
        commands=[
            (cmd_diag, "diagnostic: split or error", "warn"),
            (cmd_check, "check output", "warn"),
            (cmd_fix, "fixed", "ok"),
            (cmd_verify, "ok verified", "ok"),
        ]
        solution=[
            {"re": cmd_diag, "l": "диагностика"},
            {"re": cmd_fix, "l": "исправить"},
        ]
        entries.append(S_entry(cat, f"{prefix}-{i}", title, level, br, prompt, commands, solution))
    return entries

# --- Interview ---
interview_topics = [
 "Расскажи про 3 way handshake и TIME_WAIT",
 "Чем отличается readinessProbe от livenessProbe",
 "Как работает Raft quorum 2/3",
 "Что такое CAP и где твой проект AP vs CP",
 "Как отладишь OOMKilled pod",
 "Как масштабируешь Kafka consumer lag",
 "Что такое SLO burn rate и error budget",
 "Как сделать zero-downtime деплой",
 "Чем отличается bridge vs overlay network",
 "Как работает TLS handshake mTLS",
 "Что такое HPA vs VPA vs KEDA",
 "Как хранишь секреты: Vault vs Sealed Secrets",
 "Как делаешь backup etcd и Velero",
 "Что такое GitOps vs ClickOps",
 "Как профилируешь Python GIL vs Go scheduler",
 "Как работает eBPF XDP vs iptables",
 "Чем отличается COPY vs ADD в Dockerfile",
 "Как чинишь split brain в Patroni",
 "Что такое backpressure в Kafka",
 "Как считаешь RPO/RTO для DR",
 "Расскажи про 5 whys postmortem",
 "Как настроишь distributed tracing sampling",
 "Что такое PodDisruptionBudget",
 "Как работает Cilium eBPF vs Calico BGP",
 "Чем отличается strong vs eventual consistency",
 "Как дебажишь distroless контейнер",
 "Что такое service mesh Ambient",
 "Как работает rate limiting token bucket",
 "Чем отличается horizontal vs vertical sharding",
 "Как готовишь incident response runbook"
]
assert len(interview_topics)==30

def gen_interview():
    cat="Interview"
    prefix="gc-interview"
    prompt="dev@interview:~$"
    entries=[]
    for i, title in enumerate(interview_topics, start=1):
        level=levels[(i-1)%3]
        br=f"<b>Вопрос интервью:</b> {title}. Подготовь ответ STAR и команды для демонстрации."
        low=title.lower()
        # generic commands for interview: show understanding via commands
        cmd_diag="^echo \"STAR: Situation Task Action Result\" | head -5"
        cmd_check="^cat runbook.md | grep -A3 \"" + title.split(":")[0][:10] + "\" | head -10"
        cmd_fix="^kubectl get pods -n prod --show-labels | head -10"
        cmd_verify="^echo \"Ответ подготовлен: 3 пункта\" | head -5"
        # make more specific per topic
        if "handshake" in low or "TIME_WAIT" in title:
            cmd_diag="^ss -tan | grep TIME-WAIT | head -10"
            cmd_check="^cat /proc/sys/net/ipv4/tcp_fin_timeout"
            cmd_fix="^ss -tan state time-wait | wc -l"
        elif "Probe" in title:
            cmd_diag="^kubectl describe pod api-xxx -n prod | grep -A5 Probe | head -20"
            cmd_check="^kubectl get deploy api -n prod -o yaml | grep -A3 readinessProbe | head -10"
            cmd_fix="^kubectl patch deploy api -n prod -p '{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"api\",\"readinessProbe\":{\"httpGet\":{\"path\":\"/ready\"}}}]}}}}'"
        elif "Raft" in title or "quorum" in title.lower():
            cmd_diag="^etcdctl endpoint status -w table | head -10"
            cmd_check="^patronictl -c /etc/patroni.yml list | head -10"
            cmd_fix="^echo \"quorum 2/3\" | head -5"
        elif "OOMKilled" in title:
            cmd_diag="^kubectl describe pod api-xxx -n prod | grep -A3 OOMKilled | head -10"
            cmd_check="^kubectl top pod -n prod | head -10"
            cmd_fix="^kubectl patch deploy api -n prod -p '{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"api\",\"resources\":{\"limits\":{\"memory\":\"512Mi\"}}}]}}}}'"
        elif "Kafka" in title:
            cmd_diag="^kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group orders | head -10"
            cmd_check="^kafka-topics.sh --bootstrap-server kafka:9092 --describe --topic orders | head -10"
            cmd_fix="^kubectl scale deploy orders-consumer --replicas=4 -n prod"
        elif "SLO" in title or "burn" in low or "error budget" in low:
            cmd_diag="^cat slo.yaml | grep -A2 burnRate | head -10"
            cmd_check="^promtool query instant http://prometheus:9090 'vector(1)' | head -5"
            cmd_fix="^cat slo.yaml | grep -A3 errorBudget | head -10"
        elif "zero-downtime" in low:
            cmd_diag="^kubectl rollout status deploy/api -n prod | head -10"
            cmd_check="^kubectl get deploy api -n prod -o yaml | grep -A2 strategy | head -10"
            cmd_fix="^kubectl patch deploy api -n prod -p '{\"spec\":{\"strategy\":{\"type\":\"RollingUpdate\",\"rollingUpdate\":{\"maxUnavailable\":0,\"maxSurge\":1}}}}'"
        elif "HPA" in title:
            cmd_diag="^kubectl get hpa -n prod | head -10"
            cmd_check="^kubectl describe hpa api -n prod | grep -A2 metrics | head -10"
            cmd_fix="^kubectl apply -f hpa.yaml"
        elif "Vault" in title or "secrets" in low:
            cmd_diag="^vault kv get secret/prod/api | head -10"
            cmd_check="^kubectl get externalsecrets -n prod | head -10"
            cmd_fix="^vault kv put secret/prod/api DB_PASS=s3cr3t"
        elif "backup" in low or "etcd" in low:
            cmd_diag="^ETCDCTL_API=3 etcdctl snapshot save /tmp/etcd.db | tail -3"
            cmd_check="^velero backup get | head -10"
            cmd_fix="^ETCDCTL_API=3 etcdctl snapshot save /tmp/etcd.db && echo saved"
        elif "GitOps" in title:
            cmd_diag="^argocd app list | head -10"
            cmd_check="^kubectl get applications -n argocd | head -10"
            cmd_fix="^argocd app sync shop-api"
        elif "eBPF" in title:
            cmd_diag="^cilium status | head -10"
            cmd_check="^bpftool prog show | head -10"
            cmd_fix="^cilium connectivity test | tail -5"
        elif "Patroni" in title or "split brain" in low:
            cmd_diag="^patronictl -c /etc/patroni.yml list | head -10"
            cmd_check="^psql -c \"SELECT * FROM pg_stat_replication\" | head -10"
            cmd_fix="^patronictl -c /etc/patroni.yml switchover --master pg1 --candidate pg2 --force"
        elif "RPO" in title:
            cmd_diag="^cat docs/runbook/dr.md | grep -A2 RPO | head -10"
            cmd_check="^velero backup get | head -10"
            cmd_fix="^echo \"RPO 15m\" >> docs/runbook/dr.md"
        elif "tracing" in low:
            cmd_diag="^kubectl get pods -n monitoring -l app=jaeger | head -10"
            cmd_check="^curl -s http://jaeger:16686/api/traces?service=api | jq | head -20"
            cmd_fix="^kubectl patch deploy api -n prod -p '{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"sidecar.jaeger/enabled\":\"true\"}}}}}'"
        elif "PodDisruptionBudget" in title:
            cmd_diag="^kubectl get pdb -n prod | head -10"
            cmd_check="^kubectl describe pdb api-pdb -n prod | head -20"
            cmd_fix="^kubectl patch pdb api-pdb -n prod -p '{\"spec\":{\"minAvailable\":1}}'"
        elif "Cilium" in title or "Calico" in title:
            cmd_diag="^cilium status --verbose | head -20"
            cmd_check="^calicoctl get bgpPeer | head -10"
            cmd_fix="^cilium config set kube-proxy-replacement strict"
        elif "rate limiting" in low:
            cmd_diag="^kubectl get middleware -n prod | head -10"
            cmd_check="^curl -s http://api/ | head -10"
            cmd_fix="^kubectl apply -f rate-limit.yaml"
        else:
            cmd_diag="^echo \"STAR answer\" | head -5"
            cmd_check="^cat runbook.md | head -20"
            cmd_fix="^echo \"prepared\" | head -5"
        commands=[
            (cmd_diag, "diagnostic output", "warn"),
            (cmd_check, "check output", "warn"),
            (cmd_fix, "fixed/applied", "ok"),
            (cmd_verify, "verified", "ok"),
        ]
        solution=[
            {"re": cmd_diag, "l": "показать понимание"},
            {"re": cmd_fix, "l": "продемонстрировать"},
        ]
        entries.append(S_entry(cat, f"{prefix}-{i}", title, level, br, prompt, commands, solution))
    return entries

# Dispatch
generators = {
 "scenarios-global-cloud-aws.js": (gen_aws, "/* Global Playground: AWS — 35 scenarios */"),
 "scenarios-global-cloud-gcp.js": (gen_gcp, "/* Global Playground: GCP — 35 scenarios */"),
 "scenarios-global-cloud-azure.js": (gen_azure, "/* Global Playground: Azure — 35 scenarios */"),
 "scenarios-global-cloudflare.js": (gen_cf, "/* Global Playground: Cloudflare — 30 scenarios */"),
 "scenarios-global-data-pg.js": (gen_pg, "/* Global Playground: PostgreSQL HA — 35 scenarios */"),
 "scenarios-global-data-kafka.js": (gen_kafka, "/* Global Playground: Kafka Kraft — 35 scenarios */"),
 "scenarios-global-data-redis.js": (gen_redis, "/* Global Playground: Redis — 30 scenarios */"),
 "scenarios-global-data-mongo.js": (gen_mongo, "/* Global Playground: MongoDB — 30 scenarios */"),
 "scenarios-global-mesh-adv.js": (gen_mesh, "/* Global Playground: Mesh Advanced — 35 scenarios */"),
 "scenarios-global-dr-sre.js": (gen_dr, "/* Global Playground: DR SRE — 35 scenarios */"),
 "scenarios-global-python.js": (gen_python, "/* Global Playground: Python — 50 scenarios */"),
 "scenarios-global-go.js": (gen_go, "/* Global Playground: Go — 50 scenarios */"),
 "scenarios-global-bash.js": (gen_bash, "/* Global Playground: Bash — 35 scenarios */"),
 "scenarios-global-interview.js": (gen_interview, "/* Global Playground: Interview — 30 scenarios */"),
}

for fname, (func, header) in generators.items():
    entries = func()
    write_file(fname, header, entries)

print("All files generated")
