import pathlib, yaml, re
path=pathlib.Path("mkdocs.yml")
text=path.read_text(encoding="utf-8")

# Define new files per section (same as generate_180.py)
sections = {
    "01-linux-and-networking": [
        "08-kernel-userspace-and-boot.md",
        "09-processes-threads-and-scheduling.md",
        "10-cgroups-v2-and-systemd-slices.md",
        "11-namespaces-and-containers.md",
        "12-signals-and-oom-killer.md",
        "13-memory-virtual-and-oom.md",
        "14-page-cache-and-sync.md",
        "15-ext4-internals-and-mkfs.md",
        "16-xfs-and-btrfs.md",
        "17-mount-fstab-and-automount.md",
        "18-lvm-and-raid.md",
        "19-overlayfs-and-tmpfs.md",
        "20-tcp-ip-stack-and-iptables.md",
        "21-tcp-diagnostics-and-bbr.md",
        "22-dns-and-coredns.md",
        "23-http-tls-and-mtls.md",
        "24-ssh-keys-and-agent.md",
        "25-ipv6-and-conntrack.md",
        "26-mtu-mss-and-fragmentation.md",
        "27-ebpf-and-tracing.md",
        "28-systemd-advanced.md",
        "29-logrotate-and-rsyslog-deep.md",
        "30-linux-hardening-and-limits.md",
    ],
    "02-git": [
        "11-objects-and-refs.md",
        "12-index-and-working-tree.md",
        "13-packfiles-and-gc.md",
        "14-git-cat-file-and-fsck.md",
        "15-branching-deep.md",
        "16-merge-vs-rebase.md",
        "17-interactive-rebase.md",
        "18-cherry-pick-and-revert.md",
        "19-reset-and-restore.md",
        "20-bisect-and-blame.md",
        "21-worktree-deep.md",
        "22-submodules-advanced.md",
        "23-git-lfs-deep.md",
        "24-hooks-advanced.md",
        "25-signed-commits-and-tags.md",
        "26-git-maintenance.md",
        "27-large-repo-optimization.md",
        "28-git-troubleshooting.md",
        "29-git-server-and-protocols.md",
        "30-git-workflows-advanced.md",
    ],
    "03-docker": [
        "05-containerd-and-runc.md",
        "06-oci-and-namespaces.md",
        "07-cgroups-capabilities-seccomp.md",
        "08-images-and-layers.md",
        "09-overlay2-and-storage-drivers.md",
        "10-registries-and-manifests.md",
        "11-dockerfile-deep.md",
        "12-multistage-and-cache.md",
        "13-buildkit-and-buildx.md",
        "14-distroless-and-slim.md",
        "15-image-security-and-secrets.md",
        "16-volumes-and-bind-mounts.md",
        "17-docker-networking-deep.md",
        "18-bridge-and-user-defined-networks.md",
        "19-docker-compose-deep.md",
        "20-rootless-and-podman.md",
        "21-healthchecks-and-limits.md",
        "22-logging-and-monitoring.md",
        "23-docker-troubleshooting.md",
        "24-production-hardening.md",
        "25-docker-api-and-events.md",
        "26-image-optimization.md",
        "27-registry-auth-and-mirrors.md",
        "28-compose-profiles-and-extends.md",
        "29-container-lifecycle.md",
        "30-docker-vs-podman-vs-crio.md",
    ],
    "04-kubernetes": [
        "13-api-server-and-etcd.md",
        "14-scheduler-and-controllers.md",
        "15-kubelet-and-cri.md",
        "16-pods-deep.md",
        "17-deployments-and-replicasets.md",
        "18-statefulsets-and-daemonsets.md",
        "19-jobs-and-cronjobs.md",
        "20-services-and-endpointslice.md",
        "21-dns-and-coredns-deep.md",
        "22-cni-and-networkpolicy.md",
        "23-ingress-and-gateway-api.md",
        "24-storage-and-csi.md",
        "25-rbac-deep.md",
        "26-pss-and-securitycontext.md",
        "27-hpa-vpa-and-keda.md",
        "28-cluster-autoscaling.md",
        "29-k8s-troubleshooting-deep.md",
        "30-k8s-security-hardening.md",
    ],
    "05-gitops-and-cicd": [
        "08-gitlab-runner-executors.md",
        "09-pipeline-artifacts-and-cache.md",
        "10-environments-and-deployments.md",
        "11-gitops-principles.md",
        "12-argocd-architecture.md",
        "13-argocd-applicationset.md",
        "14-argocd-projects-and-rbac.md",
        "15-argocd-sync-and-health.md",
        "16-argocd-notifications.md",
        "17-flux-architecture.md",
        "18-flux-helmrelease.md",
        "19-flux-image-automation.md",
        "20-flux-vs-argocd.md",
        "21-progressive-delivery-flux.md",
        "22-gitlab-ci-advanced.md",
        "23-runner-autoscaling.md",
        "24-secrets-and-variables.md",
        "25-pipeline-optimization.md",
        "26-environments-protection.md",
        "27-gitops-troubleshooting.md",
        "28-flux-lab.md",
        "29-argocd-lab.md",
        "30-cicd-security.md",
    ],
    "09-observability": [
        "11-promql-fundamentals.md",
        "12-promql-advanced.md",
        "13-recording-and-alerting-rules.md",
        "14-alertmanager-deep.md",
        "15-grafana-deep.md",
        "16-grafana-alerting-and-dashboards-as-code.md",
        "17-loki-deep.md",
        "18-logql-and-pipelines.md",
        "19-grafana-alloy-deep.md",
        "20-opentelemetry-deep.md",
        "21-tempo-and-jaeger.md",
        "22-elk-deep.md",
        "23-opensearch-deep.md",
        "24-thanos-deep.md",
        "25-victoriametrics-and-mimir.md",
        "26-sre-fundamentals.md",
        "27-incident-management.md",
        "28-observability-lab-prometheus.md",
        "29-observability-lab-loki.md",
        "30-observability-lab-tracing.md",
    ]
}

# Titles mapping (for nav display)
title_map = {
    "01-linux-and-networking": {
        "08-kernel-userspace-and-boot.md": "Ядро, userspace и загрузка",
        "09-processes-threads-and-scheduling.md": "Процессы, потоки и планировщик",
        "10-cgroups-v2-and-systemd-slices.md": "Cgroups v2 и systemd slices",
        "11-namespaces-and-containers.md": "Namespaces и контейнеры",
        "12-signals-and-oom-killer.md": "Сигналы и OOM Killer",
        "13-memory-virtual-and-oom.md": "Виртуальная память и swap",
        "14-page-cache-and-sync.md": "Page cache и sync",
        "15-ext4-internals-and-mkfs.md": "ext4 и mkfs",
        "16-xfs-and-btrfs.md": "XFS и Btrfs",
        "17-mount-fstab-and-automount.md": "Mount, fstab и automount",
        "18-lvm-and-raid.md": "LVM и RAID",
        "19-overlayfs-and-tmpfs.md": "OverlayFS и tmpfs",
        "20-tcp-ip-stack-and-iptables.md": "TCP/IP и iptables",
        "21-tcp-diagnostics-and-bbr.md": "Диагностика TCP и BBR",
        "22-dns-and-coredns.md": "DNS и CoreDNS",
        "23-http-tls-and-mtls.md": "HTTP, TLS и mTLS",
        "24-ssh-keys-and-agent.md": "SSH ключи и агент",
        "25-ipv6-and-conntrack.md": "IPv6 и conntrack",
        "26-mtu-mss-and-fragmentation.md": "MTU, MSS и фрагментация",
        "27-ebpf-and-tracing.md": "eBPF и трассировка",
        "28-systemd-advanced.md": "Systemd углублённо",
        "29-logrotate-and-rsyslog-deep.md": "Logrotate и rsyslog",
        "30-linux-hardening-and-limits.md": "Хардининг и лимиты",
    },
    "02-git": {
        "11-objects-and-refs.md": "Объекты и ссылки",
        "12-index-and-working-tree.md": "Индекс и рабочее дерево",
        "13-packfiles-and-gc.md": "Packfiles и GC",
        "14-git-cat-file-and-fsck.md": "cat-file и fsck",
        "15-branching-deep.md": "Ветвление глубоко",
        "16-merge-vs-rebase.md": "Merge vs Rebase",
        "17-interactive-rebase.md": "Интерактивный rebase",
        "18-cherry-pick-and-revert.md": "Cherry-pick и revert",
        "19-reset-and-restore.md": "Reset и restore",
        "20-bisect-and-blame.md": "Bisect и blame",
        "21-worktree-deep.md": "Worktree",
        "22-submodules-advanced.md": "Submodules продвинуто",
        "23-git-lfs-deep.md": "Git LFS глубоко",
        "24-hooks-advanced.md": "Хуки продвинуто",
        "25-signed-commits-and-tags.md": "Подписанные коммиты",
        "26-git-maintenance.md": "Git maintenance",
        "27-large-repo-optimization.md": "Оптимизация больших репо",
        "28-git-troubleshooting.md": "Troubleshooting",
        "29-git-server-and-protocols.md": "Сервер и протоколы",
        "30-git-workflows-advanced.md": "Продвинутые workflows",
    },
    "03-docker": {
        "05-containerd-and-runc.md": "containerd и runc",
        "06-oci-and-namespaces.md": "OCI и namespaces",
        "07-cgroups-capabilities-seccomp.md": "Cgroups, capabilities, seccomp",
        "08-images-and-layers.md": "Образы и слои",
        "09-overlay2-and-storage-drivers.md": "Overlay2 и драйверы",
        "10-registries-and-manifests.md": "Регистры и манифесты",
        "11-dockerfile-deep.md": "Dockerfile глубоко",
        "12-multistage-and-cache.md": "Мультистейдж и кеш",
        "13-buildkit-and-buildx.md": "BuildKit и buildx",
        "14-distroless-and-slim.md": "Distroless и slim",
        "15-image-security-and-secrets.md": "Безопасность образов",
        "16-volumes-and-bind-mounts.md": "Тома и bind mounts",
        "17-docker-networking-deep.md": "Сети Docker",
        "18-bridge-and-user-defined-networks.md": "Bridge сети",
        "19-docker-compose-deep.md": "Compose глубоко",
        "20-rootless-and-podman.md": "Rootless и Podman",
        "21-healthchecks-and-limits.md": "Healthchecks и лимиты",
        "22-logging-and-monitoring.md": "Логи и мониторинг",
        "23-docker-troubleshooting.md": "Troubleshooting",
        "24-production-hardening.md": "Хардининг production",
        "25-docker-api-and-events.md": "API и события",
        "26-image-optimization.md": "Оптимизация образов",
        "27-registry-auth-and-mirrors.md": "Аутентификация регистра",
        "28-compose-profiles-and-extends.md": "Profiles и extends",
        "29-container-lifecycle.md": "Жизненный цикл",
        "30-docker-vs-podman-vs-crio.md": "Docker vs Podman vs CRI-O",
    },
    "04-kubernetes": {
        "13-api-server-and-etcd.md": "API Server и etcd",
        "14-scheduler-and-controllers.md": "Scheduler и контроллеры",
        "15-kubelet-and-cri.md": "Kubelet и CRI",
        "16-pods-deep.md": "Pods глубоко",
        "17-deployments-and-replicasets.md": "Deployments и ReplicaSets",
        "18-statefulsets-and-daemonsets.md": "StatefulSets и DaemonSets",
        "19-jobs-and-cronjobs.md": "Jobs и CronJobs",
        "20-services-and-endpointslice.md": "Services и EndpointSlice",
        "21-dns-and-coredns-deep.md": "DNS и CoreDNS",
        "22-cni-and-networkpolicy.md": "CNI и NetworkPolicy",
        "23-ingress-and-gateway-api.md": "Ingress и Gateway API",
        "24-storage-and-csi.md": "Хранилище и CSI",
        "25-rbac-deep.md": "RBAC глубоко",
        "26-pss-and-securitycontext.md": "PSS и SecurityContext",
        "27-hpa-vpa-and-keda.md": "HPA, VPA и KEDA",
        "28-cluster-autoscaling.md": "Автоскейлинг кластера",
        "29-k8s-troubleshooting-deep.md": "Troubleshooting",
        "30-k8s-security-hardening.md": "Хардининг",
    },
    "05-gitops-and-cicd": {
        "08-gitlab-runner-executors.md": "Runner executors",
        "09-pipeline-artifacts-and-cache.md": "Артефакты и кеш",
        "10-environments-and-deployments.md": "Окружения",
        "11-gitops-principles.md": "Принципы GitOps",
        "12-argocd-architecture.md": "ArgoCD архитектура",
        "13-argocd-applicationset.md": "ApplicationSet",
        "14-argocd-projects-and-rbac.md": "Проекты и RBAC",
        "15-argocd-sync-and-health.md": "Sync и health",
        "16-argocd-notifications.md": "Уведомления",
        "17-flux-architecture.md": "Flux архитектура",
        "18-flux-helmrelease.md": "HelmRelease",
        "19-flux-image-automation.md": "Image automation",
        "20-flux-vs-argocd.md": "Flux vs ArgoCD",
        "21-progressive-delivery-flux.md": "Progressive delivery",
        "22-gitlab-ci-advanced.md": "GitLab CI продвинуто",
        "23-runner-autoscaling.md": "Autoscaling Runner",
        "24-secrets-and-variables.md": "Секреты и переменные",
        "25-pipeline-optimization.md": "Оптимизация пайплайна",
        "26-environments-protection.md": "Защита окружений",
        "27-gitops-troubleshooting.md": "Troubleshooting",
        "28-flux-lab.md": "Lab: Flux",
        "29-argocd-lab.md": "Lab: ArgoCD",
        "30-cicd-security.md": "Безопасность CI/CD",
    },
    "09-observability": {
        "11-promql-fundamentals.md": "PromQL основы",
        "12-promql-advanced.md": "PromQL продвинуто",
        "13-recording-and-alerting-rules.md": "Recording и alerting rules",
        "14-alertmanager-deep.md": "Alertmanager глубоко",
        "15-grafana-deep.md": "Grafana глубоко",
        "16-grafana-alerting-and-dashboards-as-code.md": "Grafana alerting as code",
        "17-loki-deep.md": "Loki глубоко",
        "18-logql-and-pipelines.md": "LogQL и пайплайны",
        "19-grafana-alloy-deep.md": "Grafana Alloy глубоко",
        "20-opentelemetry-deep.md": "OpenTelemetry глубоко",
        "21-tempo-and-jaeger.md": "Tempo и Jaeger",
        "22-elk-deep.md": "ELK глубоко",
        "23-opensearch-deep.md": "OpenSearch глубоко",
        "24-thanos-deep.md": "Thanos глубоко",
        "25-victoriametrics-and-mimir.md": "VictoriaMetrics и Mimir",
        "26-sre-fundamentals.md": "SRE основы",
        "27-incident-management.md": "Управление инцидентами",
        "28-observability-lab-prometheus.md": "Lab: Prometheus",
        "29-observability-lab-loki.md": "Lab: Loki + Alloy",
        "30-observability-lab-tracing.md": "Lab: Tracing",
    }
}

# Read current mkdocs.yml
lines = text.split("\n")
new_lines = []
in_section = None
section_map = {
    "1. Linux и Сети:": "01-linux-and-networking",
    "2. Git:": "02-git",
    "3. Docker:": "03-docker",
    "4. Kubernetes:": "04-kubernetes",
    "5. GitOps и CI/CD:": "05-gitops-and-cicd",
    "9. Observability:": "09-observability",
}

for i, line in enumerate(lines):
    new_lines.append(line)
    # Detect section header
    for header, folder in section_map.items():
        if header in line:
            # Insert new entries after existing entries for this section
            # Find where this section ends (next section or end)
            # We will insert after the last existing entry of this section
            # Collect existing entries for this section to avoid duplicates
            # Instead, we will append after current line's block
            # Find the block end: next line that starts with "  - " at same indent but different section
            # Simpler: insert immediately after this header's block by adding new lines
            # We need to find the end of this section's list
            j = i+1
            indent = "      - "  # 6 spaces + -
            # Count how many existing entries for this section
            # We'll insert after the last entry that belongs to this section
            # Look ahead until next section header
            k = i+1
            last_idx = i
            while k < len(lines):
                if lines[k].strip().startswith("- ") and "1. Linux" not in lines[k] and "2. Git:" not in lines[k] and "3. Docker:" not in lines[k] and "4. Kubernetes:" not in lines[k] and "5. GitOps" not in lines[k] and "6. Terraform:" not in lines[k] and "7. Ansible:" not in lines[k] and "8. Python" not in lines[k] and "9. Observability:" not in lines[k] and "10. Security" not in lines[k]:
                    # This is a sub-entry, check if it belongs to current section by looking at path
                    if folder in lines[k]:
                        last_idx = k
                    elif lines[k].strip().startswith("- ") and not lines[k].strip().startswith("- 1.") and not lines[k].strip().startswith("- 2.") and not lines[k].strip().startswith("- 3.") and not lines[k].strip().startswith("- 4.") and not lines[k].strip().startswith("- 5.") and not lines[k].strip().startswith("- 9."):
                        # Could be still part of section, but no folder match -> check indent
                        if lines[k].startswith("      - "):
                            last_idx = k
                    k+=1
                elif lines[k].strip().startswith("- ") and any(x in lines[k] for x in ["1. Linux", "2. Git:", "3. Docker:", "4. Kubernetes:", "5. GitOps", "6. Terraform:", "7. Ansible", "8. Python", "9. Observability", "10. Security"]):
                    break
                else:
                    k+=1
            # Now insert after last_idx, but we are iterating, so we will do it after loop
            # Instead, we will handle insertion in a second pass: build new nav separately
            break

# Instead of complex in-place, rebuild nav section for those 6
# Parse yaml to edit nav
import yaml
data=yaml.safe_load(text)
# Find nav
nav=data['nav']
# Map section title to folder
for entry in nav:
    if isinstance(entry, dict):
        for key, val in entry.items():
            if key=="1. Linux и Сети:":
                # val is list of dicts
                existing=[list(d.values())[0] for d in val]
                for fname in sections["01-linux-and-networking"]:
                    fpath=f"01-linux-and-networking/{fname}"
                    if fpath not in existing:
                        title=title_map["01-linux-and-networking"][fname]
                        val.append({title: fpath})
            elif key=="2. Git:":
                existing=[list(d.values())[0] for d in val]
                for fname in sections["02-git"]:
                    fpath=f"02-git/{fname}"
                    if fpath not in existing:
                        title=title_map["02-git"][fname]
                        val.append({title: fpath})
            elif key=="3. Docker:":
                existing=[list(d.values())[0] for d in val]
                for fname in sections["03-docker"]:
                    fpath=f"03-docker/{fname}"
                    if fpath not in existing:
                        title=title_map["03-docker"][fname]
                        val.append({title: fpath})
            elif key=="4. Kubernetes:":
                existing=[list(d.values())[0] for d in val]
                for fname in sections["04-kubernetes"]:
                    fpath=f"04-kubernetes/{fname}"
                    if fpath not in existing:
                        title=title_map["04-kubernetes"][fname]
                        val.append({title: fpath})
            elif key=="5. GitOps и CI/CD:":
                existing=[list(d.values())[0] for d in val]
                for fname in sections["05-gitops-and-cicd"]:
                    fpath=f"05-gitops-and-cicd/{fname}"
                    if fpath not in existing:
                        title=title_map["05-gitops-and-cicd"][fname]
                        val.append({title: fpath})
            elif key=="9. Observability:":
                existing=[list(d.values())[0] for d in val]
                for fname in sections["09-observability"]:
                    fpath=f"09-observability/{fname}"
                    if fpath not in existing:
                        title=title_map["09-observability"][fname]
                        val.append({title: fpath})

# Write back
import yaml as y
# Use yaml dump with sort_keys=False
out=y.dump(data, sort_keys=False, allow_unicode=True, width=200)
pathlib.Path("mkdocs.yml").write_text(out, encoding="utf-8")
print("updated mkdocs.yml")
# Verify
import subprocess, sys
print("done")
