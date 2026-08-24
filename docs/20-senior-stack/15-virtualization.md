# 🖥️ 20.15 Виртуализация: KVM, Proxmox VE, VMware

> Уровень: Middle→Senior. Под Kubernetes-нодами и CI-раннерами всё равно лежит гипервизор. Senior обязан понимать слой ниже.

**Оглавление:** [2.1 Теория](#21-теория) · [2.2 Конфигурация](#22-конфигурация-и-синтаксис) · [2.3 Troubleshooting](#23-troubleshooting) · [2.4 Интеграция](#24-интеграция-со-стеком) · [2.5 Проверь себя](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

### 2.1 Теория

#### Стек виртуализации Linux

```text
Аппаратура (VT-x/AMD-V, IOMMU)
 └─ KVM (модуль ядра: планировщик VM, доступ к CPU/памяти)
     └─ QEMU (эмуляция устройств, процессы VM)
         └─ libvirt (API/демон управления: virsh, virt-manager)
             └─ Proxmox VE = Debian + KVM + LXC + веб-UI + кластер + бэкапы
```

- **KVM** превращает Linux в type-1 гипервизор; **QEMU** эмулирует железо; **libvirt** — стандартизованный слой управления (XML-домены).
- **Типы дисков:** `qcow2` (тонкие, снапшоты, чуть медленнее) vs `raw` (максимальная скорость, без снапшот-семантики на файле).
- **Виртуальные устройства:** `virtio-*` (paravirtualization — быстро, требует драйверов в госте) vs эмуляция (e1000, IDE — медленно, совместимо). Правило прод: **virtio всё** (net, disk, balloon).
- **LXC** (в Proxmox) — контейнеры ОС-уровня (не Docker): легче VM, но общее ядро; для сервисов, где не нужна изоляция ядра.

#### Сравнение платформ

| | **KVM/libvirt** | **Proxmox VE** | **VMware (ESXi+vCenter)** |
| :--- | :--- | :--- | :--- |
| Лицензия | свободно | AGPL, подписка опциональна | подписка (после Broadcom — дорого/сложно) |
| Управление | CLI/XML, свой UI | веб-UI из коробки, кластер, Ceph | vCenter: vMotion, DRS, HA |
| Бэкапы | руками/скрипты | vzdump, Proxmox Backup Server (дедуп) | VDP/сторонние (Veeam) |
| Живая миграция | virsh migrate (настроить руками) | в один клик в кластере | vMotion (эталон) |
| Типичное место | кастомные облака | SMB/enterprise on-prem, homelab | крупный enterprise (legacy) |

**Ключевые термины:** `overcommit` (RAM/CPU больше физического — с риском), `ballooning` (динамический возврат RAM гостя), `passthrough` (IOMMU: проброс GPU/NIC в VM), `cloud-init` (автоконфигурация гостя при первом старте), `corosync` (кворум-кластер Proxmox).

---

### 2.2 Конфигурация и синтаксис

#### KVM/libvirt: VM из командной строки

```bash
# Создание VM с cloud-init (Ubuntu cloud image)
virt-install \
  --name k3s-server-1 \
  --vcpus 4 --memory 8192 \
  --disk path=/var/lib/libvirt/images/k3s1.qcow2,size=50,format=qcow2,bus=virtio \
  --network network=default,model=virtio \
  --cloud-init user-data="#cloud-config
users:
  - name: ubuntu
    ssh_authorized_keys:
      - ssh-ed25519 AAAA... engineer
    sudo: ALL=(ALL) NOPASSWD:ALL" \
  --import \
  --os-variant ubuntu24.04 \
  --noautoconsole

virsh list --all
virsh console k3s-server-1          # консоль гостя (exit: Ctrl-])
virsh dominfo k3s-server-1
virsh snapshot-create-as k3s-server-1 pre-upgrade
virsh autostart k3s-server-1        # автозапуск при загрузке хоста
```

#### Proxmox: qm/pct + cloud-init + бэкап

```bash
# Шаблон из cloud-image (один раз)
qm create 9000 --name ubuntu-2404-template --memory 2048 --cores 2 --net0 virtio,bridge=vmbr0
qm importdisk 9000 noble-server-cloudimg-amd64.img local-lvm
qm set 9000 --scsihw virtio-scsi-pci --scsi0 local-lvm:vm-9000-disk-0
qm set 9000 --ide2 local-lvm:cloudinit --boot order=scsi0 --serial0 socket --vga serial0
qm template 9000

# Клонирование (секунды) + cloud-init
qm clone 9000 101 --name k3s-server-1
qm set 101 --memory 8192 --cores 4
qm set 101 --ciuser ubuntu --sshkeys ~/.ssh/id_ed25519.pub --ipconfig0 ip=10.0.0.11/24,gw=10.0.0.1
qm start 101

# Бэкап (vzdump) и восстановление
vzdump 101 --storage pbs --mode snapshot --compression zstd --notes-template '{{node}}-{{vmid}}'
qmrestore /mnt/pve/pbs/dump/vzdump-qemu-101-*.vma.zst 110 --storage local-lvm
```

#### VMware: esxcli/vim-cmd на хосте (без vCenter)

```bash
esxcli vm process list                     # работающие VM
vim-cmd vmsvc/power.getstate <vmid>
esxcli network vm list                     # сетевые связи VM↔порт-группы
esxcli storage vmfs extent list            # датасторы
# vMotion/DRS/HA — через vCenter; на хосте доступны только базовые операции
```

**Частые ошибки:** e1000 вместо virtio (10x медленнее сеть); thin-disk на переполненном датасторе (пауза VM при записи); нет `virsh autostart`/`onboot` — после ребута хоста кластер не поднялся; cloud-init не сработал (образ без cloud-init-датасета); Proxmox-кластер из 2 нод без QDevice — нет кворума.

---

### 2.3 Troubleshooting

```bash
# KVM/libvirt
virsh dominfo vm1 | grep -E "state|autostart"
virsh domblklist vm1                       # диски и их пути
journalctl -u libvirtd | tail
qemu-img info /var/lib/libvirt/images/vm1.qcow2   # размер, снапшоты, формат

# Proxmox: производительность VM
qm status 101 --verbose | grep -E "cpu|mem|maxmem,disk"
pvesh get /nodes/{node}/qemu/101/status/current
zpool status                               # если ZFS: деградация/scrub
pvecm status                               # кластер: кворум!
#   "Quorate: No" → половина нод недоступна → изменения заблокированы (защита)

# Диски: I/O throttle и латентность
iostat -x 5                                # await > 20ms на хосте = гости страдают
cat /sys/block/sda/queue/scheduler         # none/mq-deadline для SSD/NVMe

# VMware
esxcli hardware clock get; esxcli vm process list
dmesg | grep -i vmkwarning | tail          # на ESXi shell
```

**Топ проблем:**

| Симптом | Причина | Действие |
| :--- | :--- | :--- |
| Сеть в VM ~100Mbps | эмулированная e1000 | virtio-net + драйверы в госте |
| VM «замерла» при записи | датастор переполнен (thin) | расширить датастор/конвертировать в thick, алерты на 80% |
| Proxmox: UI «Task blocked», изменения не применяются | кластер не кворумный | поднять ноды/QDevice; pvecm expected 1 только для аварийки |
| KVM: VM не стартует после обновления | несовместимость CPU-фич/снапшоты | virsh start с логом; migrate на другой хост |
| Гость видит 1 CPU из 4 | vCPU-пиннинг/лимиты или hal-профиль | проверить topology, virtio-balloon |

---

### 2.4 Интеграция со стеком

- **Terraform/Pulumi:** провайдеры vsphere/proxmox — VM как код (см. [19-career homelab as code](../19-career/02-portfolio-projects.md)); Packer строит шаблоны для qemu/builder'ов (см. [20.9](09-iac-nextgen.md)).
- **Ansible:** динамический inventory из libvirt/Proxmox API; роли настраивают гостевую ОС после cloud-init.
- **Kubernetes:** k3s/RKE2-ноды как VM из шаблонов; Proxmox CSI/Cloudflare Tunnel для доступа (см. [20.7](07-network-edge.md)).
- **Мониторинг:** node_exporter на гипервизорах, proxmox exporter → Prometheus; алерты на датасторы/кворум.

---

### 2.5 Проверь себя — 5 вопросов

**В1. Сценарий: после ребута хоста Proxmox половина VM не поднялась, хотя «Autostart» включён. Первые две гипотезы?**

<details><summary>Ответ</summary>
1) Датастор/ZFS-пул не смонтировался (порядок старта) — VM не нашли диски. 2) Кластер не кворумный (quorate: No) — автостарт заблокирован политикой. Проверять pvecm status и zpool status до qm start.
</details>

**В2. Найдите ошибку: VM с сетевой картой e1000 показывает 90 Mbps в iperf3, хост имеет 10G NIC.**

<details><summary>Ответ</summary>
e1000 — эмулированная карта без paravirtualization, узкое место в эмуляции, а не в физической сети. Заменить на virtio-net (+драйверы в госте) — получит гигабиты и меньше CPU.
</details>

**В3. Почему Proxmox-кластер из 2 нод считается антипаттерном и что добавляет QDevice?**

<details><summary>Ответ</summary>
Кворум требует большинства: при потере связи обе ноды видят «меньшинство» — кластер блокируется (или split-brain-риск). QDevice (лёгкий демон на третьей машине, даже на NAS) даёт третий голос — кворум сохраняется при смерти одной ноды.
</details>

**В4. Чем qcow2 отличается от raw и когда выбирают каждый?**

<details><summary>Ответ</summary>
qcow2 — copy-on-write, тонкое выделение, встроенные снапшоты, но накладные расходы на маппинг. Raw — предсказуемая максимальная производительность (особенно на ZFS/LVM с прямыми блочными устройствами). qcow2 — гибкость/шаблоны; raw — БД и I/O-heavy нагрузки.
</details>

**В5. Что даёт `virsh autostart` и чем это отличается от автостарта внутри гостевой ОС (systemd)?**

<details><summary>Ответ</summary>
autostart — гипервизор запустит VM при загрузке хоста (порядок/задержки настраиваются в libvirt). systemd в госте стартует сервисы внутри уже запущенной VM. Это два разных слоя: без autostart гость вообще не включится, сколько бы unit'ов ни было включено внутри.
</details>

---

### 2.6 Практика — 3 задания

### Задание 1: KVM — VM с cloud-init за 3 минуты (на любом Linux-хосте)

**Условие:** поднять Ubuntu VM с SSH-ключом, без ручной установки ОС.

```bash
# Шаг 0: проверка виртуализации
egrep -c '(vmx|svm)' /proc/cpuinfo      # >0 ✅
sudo apt install -y qemu-kvm libvirt-daemon-system virtinst cloud-image-utils

# Шаг 1: скачать cloud image (кэшируется для будущих VM)
wget https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img -P /tmp/

# Шаг 2: cloud-init user-data (стартовое состояние — файл)
cat > user-data <<'EOF'
#cloud-config
hostname: kvm-lab
users:
  - name: ubuntu
    sudo: ALL=(ALL) NOPASSWD:ALL
    ssh_authorized_keys:
      - ssh-ed25519 AAAA...ВАШ_КЛЮЧ engineer
package_update: true
packages: [qemu-guest-agent]
EOF

# Шаг 3: запуск
sudo virt-install --name kvm-lab --memory 2048 --vcpus 2 \
  --disk /tmp/kvm-lab.qcow2,format=qcow2,bus=virtio,size=10 \
  --network network=default,model=virtio \
  --cloud-init user-data=user-data \
  --import --os-variant ubuntu24.04 --noautoconsole

# Шаг 4: найти IP и войти
virsh domifaddr kvm-lab          # IP из DHCP libvirt
ssh ubuntu@<IP> hostname         # kvm-lab ✅
```

**Проверь себя:** `virsh list` — running; SSH по ключу без пароля; `virsh domifaddr` показывает IP (cloud-init + qemu-guest-agent отработали).

**Разбор:** cloud image + cloud-init = IaC-подход к VM: тот же паттерн, что в Proxmox-шаблонах и в облаках. qemu-guest-agent в пакете — чтобы гипервизор видел IP/файлсистемы гостя.

### Задание 2: Proxmox — шаблон → клон → k3s-нода (полный цикл)

**Условие:** на Proxmox-хосте создать шаблон Ubuntu 24.04 и развернуть из него VM для k3s с фиксированным IP.

```bash
# Шаг 0: скачать образ на хост Proxmox (SSH)
wget https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img

# Шаг 1: шаблон (ID 9000) — команды из 2.2
qm create 9000 --name ubuntu-tmpl --memory 2048 --cores 2 --net0 virtio,bridge=vmbr0
qm importdisk 9000 noble-server-cloudimg-amd64.img local-lvm
qm set 9000 --scsihw virtio-scsi-pci --scsi0 local-lvm:vm-9000-disk-0,ssd=1
qm set 9000 --ide2 local-lvm:cloudinit --boot order=scsi0 --agent enabled=1
qm set 9000 --serial0 socket --vga serial0
qm template 9000

# Шаг 2: клон с параметрами
qm clone 9000 101 --name k3s-node-1 --full
qm set 101 --memory 8192 --cores 4
qm set 101 --ciuser ubuntu --sshkeys /root/.ssh/id_ed25519.pub
qm set 101 --ipconfig0 ip=192.168.88.61/24,gw=192.168.88.1
qm resize 101 scsi0 40G
qm start 101

# Шаг 3: проверка (с ноутбука)
ssh ubuntu@192.168.88.61 'curl -sfL https://get.k3s.io | sh -'
ssh ubuntu@192.168.88.61 'kubectl get nodes'   # k3s поднялся внутри клона ✅
```

**Проверь себя:** `qm config 101` показывает cloudinit-диск и ipconfig0; VM получила именно 192.168.88.61; k3s-нода Ready.

**Разбор:** шаблон+клон+cloud-init = воспроизводимые ноды за минуты. Этот же флоу автоматизируется terraform provider proxmox / ansible (homelab-as-code, 19.2).

### Задание 3: Диагностика деградировавшего Proxmox-кластера (сценарий)

**Условие (стартовое состояние):** кластер из 3 нод; нода pve-3 выключена (сгорел БП). UI показывает «Cluster not healthy», создание VM заблокировано.

```bash
# Шаг 1: статус кворума на живой ноде
pvecm status
#   Quorate: Yes ✅ (3 ноды, живы 2 → кворум есть; блокировка — из-за offline-ноды в ресурсах)

# Шаг 2: что именно деградировало
pvecm nodes            # pve-3: Offline
cat /etc/pve/.members  # или pvesh get /cluster/status

# Шаг 3: VM с умершей ноды — перезапустить на живых (HA или вручную)
qm list --all 2>/dev/null   # на pve-3 недоступен; если был HA — он переехал сам
# Вручную: конфиг VM живёт в /etc/pve/nodes/pve-3/qemu-server/101.conf
#   При НЕкворумной ноде — только через удаление ноды из кластера (опасно, данные!):
pvecm expected 1     # АВАРИЙНО: снизить ожидаемый кворум (только если понимаете риски)

# Шаг 4: вернуть кластер в норму — заменить ноду
pvecm delnode pve-3   # после подтверждения, что нода мертва навсегда
#   установить новую pve-3, присоединить: pvecm add <живая-нода>
```

**Проверь себя:** `pvecm status` → Quorate: Yes, Nodes: 3 (после замены); VM с умершей ноды запущены на живых; UI зелёный.

**Разбор:** порядок мышления: (1) кворум жив? (2) что потеряно (нода vs хранилище)? (3) HA сработал? (4) только потом аварийные expected 1/delnode. Спешка с `expected 1` на живом кластере = риск split-brain.

---

*Следующая подтема: [20.16 MySQL High Availability](16-mysql-ha.md)*
