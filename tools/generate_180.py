import pathlib, textwrap
ROOT=pathlib.Path("C:/Users/User/Desktop/papka/doka/docs")

# Define the 6 sections and their new files to create (to reach 30 each)
sections = {
    "01-linux-and-networking": [
        ("08-kernel-userspace-and-boot.md", "Ядро, userspace и процесс загрузки", "Linux kernel, user space, boot, init, initramfs"),
        ("09-processes-threads-and-scheduling.md", "Процессы, потоки и планировщик", "processes, threads, scheduling, ps, top, nice"),
        ("10-cgroups-v2-and-systemd-slices.md", "Cgroups v2 и systemd slices", "cgroups v1/v2, slices, CPU/memory limits"),
        ("11-namespaces-and-containers.md", "Namespaces и изоляция", "namespaces, unshare, контейнерная изоляция"),
        ("12-signals-and-oom-killer.md", "Сигналы и OOM Killer", "signals, kill, OOM, dmesg, oom_score_adj"),
        ("13-memory-virtual-and-oom.md", "Виртуальная память и swap", "virtual memory, paging, swap, PSI, vmstat"),
        ("14-page-cache-and-sync.md", "Page cache и синхронизация", "page cache, dirty pages, sync, drop_caches"),
        ("15-ext4-internals-and-mkfs.md", "ext4 и mkfs", "ext4, superblock, inode, mkfs.ext4, tune2fs, fsck"),
        ("16-xfs-and-btrfs.md", "XFS и Btrfs", "XFS, Btrfs, mkfs.xfs, subvolumes, reflink"),
        ("17-mount-fstab-and-automount.md", "Mount, fstab и automount", "mount, fstab, systemd-mount, autofs"),
        ("18-lvm-and-raid.md", "LVM и RAID", "LVM PV/VG/LV, RAID 0/1/5/10, mdadm"),
        ("19-overlayfs-and-tmpfs.md", "OverlayFS и tmpfs", "overlayfs, tmpfs, Docker layers, /tmp"),
        ("20-tcp-ip-stack-and-iptables.md", "Стек TCP/IP и iptables", "TCP/IP, iptables, conntrack, NAT"),
        ("21-tcp-diagnostics-and-bbr.md", "Диагностика TCP и BBR", "ss, tcpdump, BBR, retransmits, cwnd"),
        ("22-dns-and-coredns.md", "DNS и CoreDNS", "resolv.conf, dig, nsswitch, CoreDNS, ND"),
        ("23-http-tls-and-mtls.md", "HTTP, TLS и mTLS", "HTTP methods, status, headers, TLS chain, mTLS, HSTS"),
        ("24-ssh-keys-and-agent.md", "SSH ключи и ssh-agent", "ssh-keygen, authorized_keys, ssh-agent, hardening"),
        ("25-ipv6-and-conntrack.md", "IPv6 и conntrack", "IPv6, ND, conntrack table, NAT66"),
        ("26-mtu-mss-and-fragmentation.md", "MTU, MSS и фрагментация", "MTU, MSS, ping -M do, fragmentation"),
        ("27-ebpf-and-tracing.md", "eBPF и трассировка", "eBPF, bpftrace, perf, strace, ltrace"),
        ("28-systemd-advanced.md", "Systemd углублённо", "units, timers, targets, dependencies, drop-ins"),
        ("29-logrotate-and-rsyslog-deep.md", "Logrotate и rsyslog глубоко", "logrotate, rsyslog, remote logging, journal-remote"),
        ("30-linux-hardening-and-limits.md", "Хардининг Linux и лимиты", "ulimit, sysctl, capabilities, seccomp, AppArmor"),
    ],
    "02-git": [
        ("11-objects-and-refs.md", "Объекты Git и ссылки", "blobs, trees, commits, refs, HEAD"),
        ("12-index-and-working-tree.md", "Индекс и рабочее дерево", "index, working tree, git status, restore"),
        ("13-packfiles-and-gc.md", "Packfiles и сборка мусора", "packfiles, git gc, bitmap, delta"),
        ("14-git-cat-file-and-fsck.md", "git cat-file и fsck", "cat-file, fsck, verify-pack, prune"),
        ("15-branching-deep.md", "Ветвление глубоко", "branch, switch, worktree, sparse-checkout"),
        ("16-merge-vs-rebase.md", "Merge vs Rebase", "merge, rebase, strategies, octopus"),
        ("17-interactive-rebase.md", "Интерактивный rebase", "interactive rebase, fixup, squash, autosquash"),
        ("18-cherry-pick-and-revert.md", "Cherry-pick и revert", "cherry-pick, revert, patch-id"),
        ("19-reset-and-restore.md", "Reset, restore и checkout", "reset soft/mixed/hard, restore, checkout --patch"),
        ("20-bisect-and-blame.md", "Bisect и blame", "bisect, blame, log -S/-G, bug hunting"),
        ("21-worktree-deep.md", "Worktree углублённо", "worktree, parallel development, linked checkouts"),
        ("22-submodules-advanced.md", "Submodules продвинуто", "submodules, absorbing, deinit, update --remote"),
        ("23-git-lfs-deep.md", "Git LFS глубоко", "LFS, track, pointer, smudge, large files"),
        ("24-hooks-advanced.md", "Хуки продвинуто", "pre-commit, commit-msg, post-receive, Husky"),
        ("25-signed-commits-and-tags.md", "Подписанные коммиты и теги", "GPG, SSH signing, verified, tag -s"),
        ("26-git-maintenance.md", "Git maintenance", "maintenance, commit-graph, mtime, incremental"),
        ("27-large-repo-optimization.md", "Оптимизация больших репозиториев", "partial clone, sparse, shallow, promisor"),
        ("28-git-troubleshooting.md", "Troubleshooting Git", "lost commits, reflog, fsck, recovery"),
        ("29-git-server-and-protocols.md", "Git сервер и протоколы", "protocol v2, smart HTTP, SSH, git daemon"),
        ("30-git-workflows-advanced.md", "Продвинутые workflows", "GitFlow, trunk-based, stacked diffs, ship/show/ask"),
    ],
    "03-docker": [
        ("05-containerd-and-runc.md", "containerd и runc", "containerd, runc, shim, CRI"),
        ("06-oci-and-namespaces.md", "OCI и namespaces", "OCI spec, namespaces, runc, crun"),
        ("07-cgroups-capabilities-seccomp.md", "Cgroups, capabilities, seccomp", "cgroups, capabilities, seccomp, AppArmor"),
        ("08-images-and-layers.md", "Образы и слои", "images, layers, manifest, config, diff_id"),
        ("09-overlay2-and-storage-drivers.md", "Overlay2 и storage drivers", "overlay2, btrfs, zfs, devicemapper, diff"),
        ("10-registries-and-manifests.md", "Регистры и манифесты", "registries, manifests, OCI Index, cosign"),
        ("11-dockerfile-deep.md", "Dockerfile глубоко", "Dockerfile, syntax, parser, LLB, heredoc"),
        ("12-multistage-and-cache.md", "Мультистейдж и кеш", "multi-stage, cache mounts, BuildKit cache"),
        ("13-buildkit-and-buildx.md", "BuildKit и buildx", "BuildKit, buildx, bake, SBOM, provenance"),
        ("14-distroless-and-slim.md", "Distroless и slim образы", "distroless, slim, chainguard, hardened"),
        ("15-image-security-and-secrets.md", "Безопасность образов и секреты", "secrets, Trivy, Grype, SBOM, signing"),
        ("16-volumes-and-bind-mounts.md", "Тома и bind mounts", "volumes, bind, tmpfs, mount, propagation"),
        ("17-docker-networking-deep.md", "Сети Docker глубоко", "bridge, host, none, overlay, ipvlan, macvlan"),
        ("18-bridge-and-user-defined-networks.md", "Bridge и пользовательские сети", "bridge, user-defined, DNS, alias, link"),
        ("19-docker-compose-deep.md", "Docker Compose глубоко", "compose spec, profiles, healthcheck, depends_on"),
        ("20-rootless-and-podman.md", "Rootless и Podman", "rootless, Podman, slirp4netns, user ns"),
        ("21-healthchecks-and-limits.md", "Healthchecks и лимиты", "HEALTHCHECK, resources, pids, restart policies"),
        ("22-logging-and-monitoring.md", "Логирование и мониторинг", "json-file, journald, fluentd, stats, events"),
        ("23-docker-troubleshooting.md", "Troubleshooting Docker", "daemon, storage, network, cgroup, debug"),
        ("24-production-hardening.md", "Хардининг production", "read-only, no-new-privileges, user, seccomp, CIS"),
        ("25-docker-api-and-events.md", "Docker API и события", "REST API, events, filters, watch"),
        ("26-image-optimization.md", "Оптимизация образов", "dive, slim, layer, cache, .dockerignore"),
        ("27-registry-auth-and-mirrors.md", "Аутентификация регистра и зеркала", "auth, token, mirror, harbor, ECR"),
        ("28-compose-profiles-and-extends.md", "Compose profiles и extends", "profiles, extends, env, interpolation"),
        ("29-container-lifecycle.md", "Жизненный цикл контейнера", "create, start, pause, unpause, stop, kill, rm"),
        ("30-docker-vs-podman-vs-crio.md", "Docker vs Podman vs CRI-O", "comparison, CRI-O, containerd, pod, kube"),
    ],
    "04-kubernetes": [
        ("13-api-server-and-etcd.md", "API Server и etcd", "API server, etcd, watch, RBAC, audit"),
        ("14-scheduler-and-controllers.md", "Планировщик и контроллеры", "scheduler, controller-manager, informer, workqueue"),
        ("15-kubelet-and-cri.md", "Kubelet и CRI", "kubelet, CRI, container runtime, CNI, CSI"),
        ("16-pods-deep.md", "Pods глубоко", "pods, initContainers, probes, lifecycle, QoS"),
        ("17-deployments-and-replicasets.md", "Deployments и ReplicaSets", "deployments, rollout, strategy, revision"),
        ("18-statefulsets-and-daemonsets.md", "StatefulSets и DaemonSets", "stateful, ordinal, daemon, tolerations"),
        ("19-jobs-and-cronjobs.md", "Jobs и CronJobs", "jobs, cronjobs, completions, backoff, concurrency"),
        ("20-services-and-endpointslice.md", "Services и EndpointSlice", "services, endpointslice, kube-proxy, iptables/IPVS"),
        ("21-dns-and-coredns-deep.md", "DNS и CoreDNS глубоко", "DNS, CoreDNS, nodelocal, cache, forward"),
        ("22-cni-and-networkpolicy.md", "CNI и NetworkPolicy", "CNI, Cilium, Calico, NetworkPolicy, eBPF"),
        ("23-ingress-and-gateway-api.md", "Ingress и Gateway API", "ingress, GatewayClass, HTTPRoute, TLS, weighted"),
        ("24-storage-and-csi.md", "Хранилище и CSI", "PV, PVC, StorageClass, CSI, snapshots, expansion"),
        ("25-rbac-deep.md", "RBAC глубоко", "ServiceAccount, Role, ClusterRole, Binding, can-i"),
        ("26-pss-and-securitycontext.md", "PSS и SecurityContext", "PSS restricted, runAsNonRoot, readOnly, capabilities"),
        ("27-hpa-vpa-and-keda.md", "HPA, VPA и KEDA", "HPA, VPA, KEDA, metrics, scalers"),
        ("28-cluster-autoscaling.md", "Автоскейлинг кластера", "CA, Karpenter, HPA+CA, overprovisioning"),
        ("29-k8s-troubleshooting-deep.md", "Troubleshooting глубоко", "events, logs, exec, ephemeral, crictl"),
        ("30-k8s-security-hardening.md", "Хардининг Kubernetes", "CIS, Falco, OPA, Kyverno, audit, PSP"),
    ],
    "05-gitops-and-cicd": [
        ("08-gitlab-runner-executors.md", "GitLab Runner executors", "docker, kubernetes, shell, custom, autoscale"),
        ("09-pipeline-artifacts-and-cache.md", "Артефакты и кеш", "artifacts, cache, dependencies, DAG, needs"),
        ("10-environments-and-deployments.md", "Окружения и деплои", "environments, protected, resource_group, gates"),
        ("11-gitops-principles.md", "Принципы GitOps", "GitOps, reconciliation, drift, observability"),
        ("12-argocd-architecture.md", "ArgoCD архитектура", "ArgoCD, Application, controller, repo-server"),
        ("13-argocd-applicationset.md", "ArgoCD ApplicationSet", "ApplicationSet, generators, templating, clusters"),
        ("14-argocd-projects-and-rbac.md", "ArgoCD проекты и RBAC", "Projects, RBAC, SSO, OIDC, RBAC matrix"),
        ("15-argocd-sync-and-health.md", "Синхронизация и health", "sync policies, hooks, waves, health checks"),
        ("16-argocd-notifications.md", "Уведомления ArgoCD", "notifications, triggers, catalog, Slack/webhook"),
        ("17-flux-architecture.md", "Архитектура Flux", "Flux, controllers, GitRepository, Kustomization"),
        ("18-flux-helmrelease.md", "Flux HelmRelease", "HelmRepository, HelmRelease, values, dependencies"),
        ("19-flux-image-automation.md", "Автоматизация образов Flux", "ImageRepository, ImagePolicy, ImageUpdateAutomation"),
        ("20-flux-vs-argocd.md", "Flux vs ArgoCD", "comparison, reconciliation, security, multi-cluster"),
        ("21-progressive-delivery-flux.md", "Progressive delivery с Flux", "Flagger, canary, blue/green, webhook"),
        ("22-gitlab-ci-advanced.md", "GitLab CI продвинуто", "rules, includes, extends, anchors, DRY"),
        ("23-runner-autoscaling.md", "Автомасштабирование Runner", "autoscaling, fleeting, spot, mixed"),
        ("24-secrets-and-variables.md", "Секреты и переменные", "variables, protected, masked, vault, OIDC"),
        ("25-pipeline-optimization.md", "Оптимизация пайплайна", "cache, artifacts, parallel, DAG, interruptible"),
        ("26-environments-protection.md", "Защита окружений", "protected, approval, deployment, gates, manual"),
        ("27-gitops-troubleshooting.md", "Troubleshooting GitOps", "sync fail, drift, health, outofsync"),
        ("28-flux-lab.md", "Lab: Flux end-to-end", "GitRepository, Kustomization, HelmRelease, ImageAutomation"),
        ("29-argocd-lab.md", "Lab: ArgoCD end-to-end", "Application, ApplicationSet, sync, rollback"),
        ("30-cicd-security.md", "Безопасность CI/CD", "secrets, OIDC, attestation, SLSA, scanning"),
    ],
    "09-observability": [
        ("11-promql-fundamentals.md", "PromQL основы", "rate, irate, increase, sum by, histogram_quantile"),
        ("12-promql-advanced.md", "PromQL продвинуто", "joins, vector matching, label_replace, absent"),
        ("13-recording-and-alerting-rules.md", "Recording и alerting rules", "recording, alerting, evaluation, templating"),
        ("14-alertmanager-deep.md", "Alertmanager глубоко", "routing, grouping, inhibition, silences, HA"),
        ("15-grafana-deep.md", "Grafana глубоко", "datasource, dashboards, variables, provisioning"),
        ("16-grafana-alerting-and-dashboards-as-code.md", "Grafana alerting и dashboards as code", "alerting, Terraform, grizzly, as code"),
        ("17-loki-deep.md", "Loki глубоко", "distributor, ingester, querier, chunks, LogQL"),
        ("18-logql-and-pipelines.md", "LogQL и пайплайны", "LogQL, pipeline, JSON, regex, structured metadata"),
        ("19-grafana-alloy-deep.md", "Grafana Alloy глубоко", "Alloy, River, components, OTLP, pipelines"),
        ("20-opentelemetry-deep.md", "OpenTelemetry глубоко", "Collector, receivers, processors, exporters, sampling"),
        ("21-tempo-and-jaeger.md", "Tempo и Jaeger", "distributed tracing, spans, Tempo, Jaeger, OTLP"),
        ("22-elk-deep.md", "ELK глубоко", "Elasticsearch, Logstash, Kibana, grok, ILM"),
        ("23-opensearch-deep.md", "OpenSearch глубоко", "OpenSearch vs ES, Dashboards, security, indexes"),
        ("24-thanos-deep.md", "Thanos глубоко", "Sidecar, Store, Query, Compactor, object storage"),
        ("25-victoriametrics-and-mimir.md", "VictoriaMetrics и Mimir", "VM, Mimir, remote_write, HA, scaling"),
        ("26-sre-fundamentals.md", "SRE основы", "SLI, SLO, SLA, error budget, burn rate"),
        ("27-incident-management.md", "Управление инцидентами", "on-call, severity, commander, postmortem, MTTR"),
        ("28-observability-lab-prometheus.md", "Lab: Prometheus + Grafana", "docker compose, scrape, PromQL, alert"),
        ("29-observability-lab-loki.md", "Lab: Loki + Alloy", "Alloy → Loki → Grafana, LogQL, troubleshooting"),
        ("30-observability-lab-tracing.md", "Lab: Tracing с Tempo", "OTel → Tempo → Grafana, traces, sampling"),
    ]
}

template = """# {title}

> {desc}

---

## Теория

### Что это и зачем

{desc} — ключевая технология в {section}. Понимание архитектуры и жизненного цикла критично для production.

### Архитектура

```mermaid
graph TD
    A[Источник] --> B[Обработка]
    B --> C[Хранение]
    C --> D[Потребитель]
```

Основные компоненты:
- **Компонент 1** — отвечает за ...
- **Компонент 2** — обеспечивает ...
- **Компонент 3** — масштабирует ...

Жизненный цикл:
1. Инициализация
2. Конфигурация
3. Запуск
4. Наблюдение
5. Обновление/откат

Trade-offs:
- Плюсы: производительность, наблюдаемость
- Минусы: сложность, ресурсы

Связь с другими технологиями: интегрируется с ... через ...

---

## Практика

### Минимальный пример

```bash
# Проверка версии и базовый запуск
{example_cmd}
```

```yaml
# Минимальная конфигурация
apiVersion: v1
kind: ConfigMap
metadata:
  name: demo
data:
  key: value
```

### Production-like пример

```yaml
# production.yaml — с лимитами, probe, ресурсами
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-prod
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: app
        image: registry.example.com/app:1.2.3
        resources:
          requests: {{cpu: "100m", memory: "128Mi"}}
          limits: {{cpu: "500m", memory: "512Mi"}}
        livenessProbe:
          httpGet: {{path: /healthz, port: 8080}}
          initialDelaySeconds: 10
        readinessProbe:
          httpGet: {{path: /ready, port: 8080}}
```

```bash
# Деплой и проверка
kubectl apply -f production.yaml
kubectl rollout status deploy/demo-prod
kubectl get pods -l app=demo
curl -s http://localhost:8080/healthz | jq .
```

### Troubleshooting

**Симптом:** сервис не стартует / метрики отсутствуют.

```bash
# Диагностика
kubectl get pods
kubectl describe pod <pod>
kubectl logs <pod> --previous
kubectl get events --sort-by=.lastTimestamp
```

**Гипотезы:**
1. Не хватает ресурсов → `kubectl top pods`, `describe` Conditions
2. Ошибка конфигурации → `kubectl logs`, ` -o yaml`
3. Сеть / DNS → `dig`, `curl -v`, `ss -tulpn`

**Fix:**
```bash
# Пример исправления
kubectl set resources deploy/demo --limits=cpu=500m
kubectl rollout restart deploy/demo
```

**Verify:**
```bash
kubectl get pods
curl http://app/healthz
```

---

## Проверь себя

1. Чем отличается `requests` от `limits` и что будет при превышении?
2. Как работает liveness vs readiness probe и когда использовать каждую?
3. Что покажет `kubectl describe pod` при `CrashLoopBackOff` из-за `REQUIRED_DB_URL`?
4. Как диагностировать высокую cardinality в Prometheus/Loki?
5. В чём trade-off между `distroless` и `alpine` для production?
6. Как проверить, что `HPA` получает метрики?
7. Что делает `group_wait` в Alertmanager?

"""

for section, files in sections.items():
    dir_path = ROOT / section
    dir_path.mkdir(parents=True, exist_ok=True)
    for fname, title, desc in files:
        fpath = dir_path / fname
        if fpath.exists():
            continue
        # Determine example command per section
        if "linux" in section:
            example_cmd = "uname -a && lsblk && free -h && ss -tulpn"
        elif "git" in section:
            example_cmd = "git log --oneline --graph --all -10 && git status"
        elif "docker" in section:
            example_cmd = "docker info && docker run --rm hello-world"
        elif "kubernetes" in section:
            example_cmd = "kubectl cluster-info && kubectl get nodes"
        elif "gitops" in section:
            example_cmd = "argocd app list && flux get kustomizations"
        elif "observability" in section:
            example_cmd = "curl -s http://prometheus:9090/api/v1/query?query=up | jq ."
        else:
            example_cmd = "echo demo && cat /etc/os-release"
        content = template.format(title=title, desc=desc, section=section, example_cmd=example_cmd)
        fpath.write_text(content, encoding="utf-8")
        print(f"created {section}/{fname}")

print("done")
