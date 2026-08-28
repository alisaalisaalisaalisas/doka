import pathlib
path=pathlib.Path("mkdocs.yml")
text=path.read_text(encoding="utf-8")

sections = {
    "01-linux-and-networking": [
        ("08-kernel-userspace-and-boot.md", "Ядро, userspace и загрузка"),
        ("09-processes-threads-and-scheduling.md", "Процессы, потоки и планировщик"),
        ("10-cgroups-v2-and-systemd-slices.md", "Cgroups v2 и systemd slices"),
        ("11-namespaces-and-containers.md", "Namespaces и контейнеры"),
        ("12-signals-and-oom-killer.md", "Сигналы и OOM Killer"),
        ("13-memory-virtual-and-oom.md", "Виртуальная память и swap"),
        ("14-page-cache-and-sync.md", "Page cache и sync"),
        ("15-ext4-internals-and-mkfs.md", "ext4 и mkfs"),
        ("16-xfs-and-btrfs.md", "XFS и Btrfs"),
        ("17-mount-fstab-and-automount.md", "Mount, fstab и automount"),
        ("18-lvm-and-raid.md", "LVM и RAID"),
        ("19-overlayfs-and-tmpfs.md", "OverlayFS и tmpfs"),
        ("20-tcp-ip-stack-and-iptables.md", "TCP/IP и iptables"),
        ("21-tcp-diagnostics-and-bbr.md", "Диагностика TCP и BBR"),
        ("22-dns-and-coredns.md", "DNS и CoreDNS"),
        ("23-http-tls-and-mtls.md", "HTTP, TLS и mTLS"),
        ("24-ssh-keys-and-agent.md", "SSH ключи и агент"),
        ("25-ipv6-and-conntrack.md", "IPv6 и conntrack"),
        ("26-mtu-mss-and-fragmentation.md", "MTU, MSS и фрагментация"),
        ("27-ebpf-and-tracing.md", "eBPF и трассировка"),
        ("28-systemd-advanced.md", "Systemd углублённо"),
        ("29-logrotate-and-rsyslog-deep.md", "Logrotate и rsyslog"),
        ("30-linux-hardening-and-limits.md", "Хардининг и лимиты"),
    ],
    "02-git": [
        ("11-objects-and-refs.md", "Объекты и ссылки"),
        ("12-index-and-working-tree.md", "Индекс и рабочее дерево"),
        ("13-packfiles-and-gc.md", "Packfiles и GC"),
        ("14-git-cat-file-and-fsck.md", "cat-file и fsck"),
        ("15-branching-deep.md", "Ветвление глубоко"),
        ("16-merge-vs-rebase.md", "Merge vs Rebase"),
        ("17-interactive-rebase.md", "Интерактивный rebase"),
        ("18-cherry-pick-and-revert.md", "Cherry-pick и revert"),
        ("19-reset-and-restore.md", "Reset и restore"),
        ("20-bisect-and-blame.md", "Bisect и blame"),
        ("21-worktree-deep.md", "Worktree"),
        ("22-submodules-advanced.md", "Submodules продвинуто"),
        ("23-git-lfs-deep.md", "Git LFS глубоко"),
        ("24-hooks-advanced.md", "Хуки продвинуто"),
        ("25-signed-commits-and-tags.md", "Подписанные коммиты"),
        ("26-git-maintenance.md", "Git maintenance"),
        ("27-large-repo-optimization.md", "Оптимизация больших репо"),
        ("28-git-troubleshooting.md", "Troubleshooting"),
        ("29-git-server-and-protocols.md", "Сервер и протоколы"),
        ("30-git-workflows-advanced.md", "Продвинутые workflows"),
    ],
    "03-docker": [
        ("05-containerd-and-runc.md", "containerd и runc"),
        ("06-oci-and-namespaces.md", "OCI и namespaces"),
        ("07-cgroups-capabilities-seccomp.md", "Cgroups, capabilities, seccomp"),
        ("08-images-and-layers.md", "Образы и слои"),
        ("09-overlay2-and-storage-drivers.md", "Overlay2 и драйверы"),
        ("10-registries-and-manifests.md", "Регистры и манифесты"),
        ("11-dockerfile-deep.md", "Dockerfile глубоко"),
        ("12-multistage-and-cache.md", "Мультистейдж и кеш"),
        ("13-buildkit-and-buildx.md", "BuildKit и buildx"),
        ("14-distroless-and-slim.md", "Distroless и slim"),
        ("15-image-security-and-secrets.md", "Безопасность образов"),
        ("16-volumes-and-bind-mounts.md", "Тома и bind mounts"),
        ("17-docker-networking-deep.md", "Сети Docker"),
        ("18-bridge-and-user-defined-networks.md", "Bridge сети"),
        ("19-docker-compose-deep.md", "Compose глубоко"),
        ("20-rootless-and-podman.md", "Rootless и Podman"),
        ("21-healthchecks-and-limits.md", "Healthchecks и лимиты"),
        ("22-logging-and-monitoring.md", "Логи и мониторинг"),
        ("23-docker-troubleshooting.md", "Troubleshooting"),
        ("24-production-hardening.md", "Хардининг production"),
        ("25-docker-api-and-events.md", "API и события"),
        ("26-image-optimization.md", "Оптимизация образов"),
        ("27-registry-auth-and-mirrors.md", "Аутентификация регистра"),
        ("28-compose-profiles-and-extends.md", "Profiles и extends"),
        ("29-container-lifecycle.md", "Жизненный цикл"),
        ("30-docker-vs-podman-vs-crio.md", "Docker vs Podman vs CRI-O"),
    ],
    "04-kubernetes": [
        ("13-api-server-and-etcd.md", "API Server и etcd"),
        ("14-scheduler-and-controllers.md", "Scheduler и контроллеры"),
        ("15-kubelet-and-cri.md", "Kubelet и CRI"),
        ("16-pods-deep.md", "Pods глубоко"),
        ("17-deployments-and-replicasets.md", "Deployments и ReplicaSets"),
        ("18-statefulsets-and-daemonsets.md", "StatefulSets и DaemonSets"),
        ("19-jobs-and-cronjobs.md", "Jobs и CronJobs"),
        ("20-services-and-endpointslice.md", "Services и EndpointSlice"),
        ("21-dns-and-coredns-deep.md", "DNS и CoreDNS"),
        ("22-cni-and-networkpolicy.md", "CNI и NetworkPolicy"),
        ("23-ingress-and-gateway-api.md", "Ingress и Gateway API"),
        ("24-storage-and-csi.md", "Хранилище и CSI"),
        ("25-rbac-deep.md", "RBAC глубоко"),
        ("26-pss-and-securitycontext.md", "PSS и SecurityContext"),
        ("27-hpa-vpa-and-keda.md", "HPA, VPA и KEDA"),
        ("28-cluster-autoscaling.md", "Автоскейлинг кластера"),
        ("29-k8s-troubleshooting-deep.md", "Troubleshooting"),
        ("30-k8s-security-hardening.md", "Хардининг"),
    ],
    "05-gitops-and-cicd": [
        ("08-gitlab-runner-executors.md", "Runner executors"),
        ("09-pipeline-artifacts-and-cache.md", "Артефакты и кеш"),
        ("10-environments-and-deployments.md", "Окружения"),
        ("11-gitops-principles.md", "Принципы GitOps"),
        ("12-argocd-architecture.md", "ArgoCD архитектура"),
        ("13-argocd-applicationset.md", "ApplicationSet"),
        ("14-argocd-projects-and-rbac.md", "Проекты и RBAC"),
        ("15-argocd-sync-and-health.md", "Sync и health"),
        ("16-argocd-notifications.md", "Уведомления"),
        ("17-flux-architecture.md", "Flux архитектура"),
        ("18-flux-helmrelease.md", "HelmRelease"),
        ("19-flux-image-automation.md", "Image automation"),
        ("20-flux-vs-argocd.md", "Flux vs ArgoCD"),
        ("21-progressive-delivery-flux.md", "Progressive delivery"),
        ("22-gitlab-ci-advanced.md", "GitLab CI продвинуто"),
        ("23-runner-autoscaling.md", "Autoscaling Runner"),
        ("24-secrets-and-variables.md", "Секреты и переменные"),
        ("25-pipeline-optimization.md", "Оптимизация пайплайна"),
        ("26-environments-protection.md", "Защита окружений"),
        ("27-gitops-troubleshooting.md", "Troubleshooting"),
        ("28-flux-lab.md", "Lab: Flux"),
        ("29-argocd-lab.md", "Lab: ArgoCD"),
        ("30-cicd-security.md", "Безопасность CI/CD"),
    ],
    "09-observability": [
        ("11-promql-fundamentals.md", "PromQL основы"),
        ("12-promql-advanced.md", "PromQL продвинуто"),
        ("13-recording-and-alerting-rules.md", "Recording и alerting rules"),
        ("14-alertmanager-deep.md", "Alertmanager глубоко"),
        ("15-grafana-deep.md", "Grafana глубоко"),
        ("16-grafana-alerting-and-dashboards-as-code.md", "Grafana alerting as code"),
        ("17-loki-deep.md", "Loki глубоко"),
        ("18-logql-and-pipelines.md", "LogQL и пайплайны"),
        ("19-grafana-alloy-deep.md", "Grafana Alloy глубоко"),
        ("20-opentelemetry-deep.md", "OpenTelemetry глубоко"),
        ("21-tempo-and-jaeger.md", "Tempo и Jaeger"),
        ("22-elk-deep.md", "ELK глубоко"),
        ("23-opensearch-deep.md", "OpenSearch глубоко"),
        ("24-thanos-deep.md", "Thanos глубоко"),
        ("25-victoriametrics-and-mimir.md", "VictoriaMetrics и Mimir"),
        ("26-sre-fundamentals.md", "SRE основы"),
        ("27-incident-management.md", "Управление инцидентами"),
        ("28-observability-lab-prometheus.md", "Lab: Prometheus"),
        ("29-observability-lab-loki.md", "Lab: Loki + Alloy"),
        ("30-observability-lab-tracing.md", "Lab: Tracing"),
    ]
}

# For each section, find the block and insert
for folder, files in sections.items():
    # Find the section header line: e.g., "  - 1. Linux и Сети:"
    header_marker = f"  - 1. Linux и Сети:" if folder=="01-linux-and-networking" else \
                    f"  - 2. Git:" if folder=="02-git" else \
                    f"  - 3. Docker:" if folder=="03-docker" else \
                    f"  - 4. Kubernetes:" if folder=="04-kubernetes" else \
                    f"  - 5. GitOps и CI/CD:" if folder=="05-gitops-and-cicd" else \
                    f"  - 9. Observability:" if folder=="09-observability" else None
    if not header_marker:
        continue
    idx = text.find(header_marker)
    if idx==-1:
        print(f"header not found for {folder}")
        continue
    # Find the end of this section's list: next section header
    next_headers = ["  - 1. Linux", "  - 2. Git:", "  - 3. Docker:", "  - 4. Kubernetes:", "  - 5. GitOps", "  - 6. Terraform:", "  - 7. Ansible:", "  - 8. Python", "  - 9. Observability:", "  - 10. Security", "  - 11. Базы", "  - 12. Продвинутые", "  - 13. Disaster", "  - 14. Собеседования", "  - 15. Практика", "  - 16. Guided", "  - 17. Break", "  - 18. Шаблоны", "  - 19. Карьера", "  - 20. Senior", "  - 21. Песочница", "  - 22. Тренажёр", "  - 23. MLOps"]
    # Find next header after current
    next_idx = len(text)
    for h in next_headers:
        if h==header_marker:
            continue
        pos=text.find(h, idx+len(header_marker))
        if pos!=-1 and pos < next_idx and pos > idx:
            next_idx=pos
    # Find the last entry for this folder before next_idx
    section_text=text[idx:next_idx]
    # Find where to insert: after the last occurrence of folder/
    last_pos=section_text.rfind(folder+"/")
    if last_pos==-1:
        print(f"no existing entries for {folder}")
        continue
    # Find end of that line
    line_end=section_text.find("\n", last_pos)
    if line_end==-1:
        line_end=len(section_text)
    insert_at=idx + line_end + 1
    # Build new entries
    new_entries=""
    for fname, title in files:
        fpath=f"{folder}/{fname}"
        # Check if already exists
        if fpath in text:
            continue
        new_entries+=f'      - {title}: {fpath}\n'
    if new_entries:
        text=text[:insert_at] + new_entries + text[insert_at:]
        print(f"inserted {len(new_entries.splitlines())} for {folder}")

path.write_text(text, encoding="utf-8")
print("done")
