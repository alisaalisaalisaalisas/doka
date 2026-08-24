# 🏠 Home Lab: серверная в шкафу за любые деньги

> Домашняя лаборатория — главный ускоритель карьеры. На ней можно ломать всё, что угодно, без последствий. Вот три конфигурации по бюджету.

## 🎯 Вариант A: 0 ₽ — ноутбук, который уже есть

| Компонент | Инструмент |
| :--- | :--- |
| Linux-среда | WSL2 (Windows) / нативный Ubuntu |
| K8s кластер | kind (мультинодовый!) или minikube |
| Виртуалки | Multipass (быстрые Ubuntu VM) |
| «Облако» | LocalStack (AWS) / Azurite (Azure) |

```bash
# Мультинодовый kind = почти настоящий кластер
cat > multi.yaml <<'EOF'
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - { role: control-plane }
  - { role: worker }
  - { role: worker }
EOF
kind create cluster --config multi.yaml --name homelab
kubectl get nodes    # 3 ноды как на реальном проде!
```

**Ограничения:** нет настоящих отказов железа, RAM ограничена. Для этапов 0-3 roadmap'а хватает с запасом.

---

## 🖥️ Вариант B: ~25-40 тыс ₽ — Mini PC + Proxmox (рекомендую)

### Железо (б/у рынок)

| Компонент | Пример | Цена |
| :--- | :--- | :--- |
| Мини-ПК | Beelink/Minisforum (Ryzen 7, 32GB RAM, NVMe 1TB) | 25-35к ₽ |
| Альтернатива | Б/у Dell OptiPlex/Lenovo Tiny | 15-20к ₽ |
| ИБП (опционально) | APC Back-UPS 700VA | б/у ~3к |

### Proxmox VE: гипервизор как в датацентре

```bash
# Ставится с флешки за 10 минут. Дальше через веб-UI https://IP:8006

# Типовая раскладка VM для 32GB RAM:
# - k3s-server   (2 vCPU, 4GB)
# - k3s-agent-1  (4 vCPU, 8GB)
# - k3s-agent-2  (4 vCPU, 8GB)
# - vm-gitlab    (4 vCPU, 8GB)  — полный GitLab CE для практики CI
# - vm-monitoring(2 vCPU, 4GB)  — Prometheus вне K8s (учимся разной архитектуре)

# Создание VM из шаблона через CLI (автоматизация!):
qm create 100 --name k3s-server --memory 4096 --cores 2 --net0 virtio,bridge=vmbr0
qm importdisk 100 ubuntu-24.04-cloudimg.img local-lvm
qm set 100 --scsihw virtio-scsi-pci --scsi0 local-lvm:vm-100-disk-0
qm template 100          # превращаем в шаблон
qm clone 100 101 --name k3s-agent-1   # клонирование за секунды
```

### k3s: легковесный production-grade K8s

```bash
# На server VM:
curl -sfL https://get.k3s.io | sh -s - server --cluster-init
cat /var/lib/rancher/k3s/server/node-token   # токен для агентов

# На агентах:
curl -sfL https://get.k3s.io | K3S_URL=https://<SERVER_IP>:6443 \
  K3S_TOKEN=<ТОКЕН> sh -

kubectl get nodes    # настоящий мультинодовый кластер на своём железе!
```

---

## 🏢 Вариант C: Enterprise-ish (~80-150к ₽)

Когда базовый сетап освоен и хочется большего:

- **2× mini PC + NAS (Synology/TrueNAS)** — репликация, NFS для RWX-томов Ceph/Rook
- **Старый коммутатор с VLAN** — практика сетевой сегментации
- **Raspberry Pi 4** — всегда включенный monitoring/wireguard jump host
- **Прокси-сервер Cloudflare Tunnel** — доступ к лабе извне без белого IP

```yaml
# Пример: NFS StorageClass в K8s для RWX (как на реальном проде)
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata: { name: nas-nfs }
provisioner: nfs.csi.k8s.io
parameters:
  server: 192.168.1.50       # ваш NAS
  share: /volume1/k8s-volumes
mountOptions: [nfsvers=4.1, hard]
reclaimPolicy: Retain        # данные переживают удаление PVC
```

---

## 🧰 Что развернуть в homelab (по возрастанию сложности)

| # | Сервис | Чему учит |
| :--- | :--- | :--- |
| 1 | **Pi-hole / AdGuard** | DNS, Docker compose, обновления |
| 2 | **WireGuard** | VPN, ключи, маршрутизация |
| 3 | **Gitea** | свой Git-сервер, SSH, backup репозиториев |
| 4 | **Monitoring stack** | Prometheus+Grafana+Loki (см. Lab 06) на всё хозяйство |
| 5 | **ArgoCD** | GitOps всего lab-окружения! (Lab 07) |
| 6 | **Vault** | секреты для всех сервисов вместо .env файлов |
| 7 | **MinIO** | S3-совместимое хранилище, Velero бэкапы |
| 8 | **Kafka (Strimzi)** | брокер сообщений в K8s |
| 9 | **Ceph/Rook** | распределённое хранилище (нужно 3 ноды) |

!!! success "Финальная форма"
    Ваш homelab управляется Terraform (Proxmox provider), настраивается Ansible, приложения деплоятся ArgoCD из Gitea, мониторинг в Grafana, секреты в Vault, бэкапы в MinIO через Velero. Это буквально enterprise-архитектура у вас дома — готовый рассказ для собеседования уровня Middle+.

## 🛡️ Гигиена домашней лабы

- [ ] Всё описано кодом: сломал → `git revert` → восстановил за минуты
- [ ] Автобэкапы: Proxmox Backup Server или restic → внешний диск/NAS
- [ ] Не светить порты в интернет напрямую: только WireGuard/Tailscale/Cloudflare Tunnel
- [ ] Обновления безопасности раз в месяц (unattended-upgrades + ревью)
- [ ] Электросчётчик: mini PC жрёт ~10W ≈ 150₽/мес — дешевле любого VPS
