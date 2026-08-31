#!/usr/bin/env bash
# ============================================================
# chaos-lab.sh — набор управляемых поломок для самостоятельных
# учений (break-fix drills) на тестовом стенде.
#
# ВНИМАНИЕ: запускать ТОЛЬКО на VM/контейнерах, не в проде!
# Использование: ./chaos-lab.sh <drill> [duration_seconds]
# Список дрелей: ./chaos-lab.sh list
# ============================================================
set -u

DUR="${2:-60}"   # длительность по умолчанию 60 секунд

die() { echo "ОШИБКА: $*" >&2; exit 1; }

require_root() {
  [[ $EUID -eq 0 ]] || die "дрели требуют root (sudo)"
}

# ---------- ДРЕЛИ: CPU ----------
cpu_burn() {
  echo "🔥 CPU-шторм: ${DUR}s, все ядра"
  local cores; cores=$(nproc)
  timeout "$DUR" bash -c "for i in \$(seq 1 $cores); do (while :; do :; done) & done; wait" 
}

# ---------- ДРЕЛИ: ПАМЯТЬ ----------
mem_pressure() {
  echo "🔥 Память: аллокация ~70% RAM на ${DUR}s (до OOM не доводит)"
  local total_mb; total_mb=$(free -m | awk '/Mem:/{print int($2*0.7)}')
  timeout "$DUR" python3 -c "
import time, sys
mb = $total_mb
buf = bytearray(mb * 1024 * 1024)
print(f'allocated {mb} MB')
time.sleep($DUR)" || true
}

oom_kill_test() {
  echo "🔥 Гарантированный OOM (смотрите dmesg | grep -i oom)"
  python3 -c "
b = []
try:
    while True: b.append(bytearray(256 * 1024 * 1024))
except MemoryError:
    print('MemoryError caught')
" &
sleep "$DUR"; kill %1 2>/dev/null
}

# ---------- ДРЕЛИ: ДИСК ----------
disk_fill() {
  echo "🔥 Заполнение диска файлом /tmp/chaos.fill до 95%"
  require_root
  local avail_kb; avail_kb=$(df --output=avail -k /tmp | tail -1)
  local fill_kb=$((avail_kb * 90 / 100))
  dd if=/dev/zero of=/tmp/chaos.fill bs=1K count=$fill_kb status=none
  echo "Диск заполнен. df -h / — проверьте. Удаление через 'cleanup'"
}

disk_slowdown() {
  echo "🔥 Имитация медленного диска через cgroup io.max (device см. lsblk)"
  require_root
  local dev_major_minor
  dev_major_minor=$(lsblk -no MAJ:MIN $(df --output=source / | tail -1) | head -1)
  echo "${dev_major_minor} rbps=1048576 wbps=1048576 riops=100 wiops=100" \
    > "/sys/fs/cgroup/$(cat /proc/self/cgroup | cut -d: -f3)/io.max" 2>/dev/null \
    || echo "⚠️  cgroup v2 io.max недоступен на этой системе — используйте ionice+dd"
}

# ---------- ДРЕЛИ: СЕТЬ ----------
net_latency() {
  echo "🔥 Задержка сети ${DUR}s (+200ms RTT на eth0)"
  require_root
  tc qdisc add dev eth0 root netem delay 200ms
  sleep "$DUR"
  tc qdisc del dev eth0 root
}

net_packet_loss() {
  echo "🔥 Потеря пакетов ${DUR}s (30% на eth0)"
  require_root
  tc qdisc add dev eth0 root netem loss 30%
  sleep "$DUR"
  tc qdisc del dev eth0 root
}

dns_blackhole() {
  echo "🔥 DNS blackhole ${DUR}s (drop UDP 53 наружу)"
  require_root
  iptables -A OUTPUT -p udp --dport 53 -j DROP
  iptables -A INPUT -p udp --sport 53 -j DROP
  sleep "$DUR"
  iptables -D OUTPUT -p udp --dport 53 -j DROP
  iptables -D INPUT -p udp --sport 53 -j DROP
}

conntrack_exhaust() {
  echo "🔥 Conntrack max=500 ${DUR}s (см. Break-Fix №19)"
  require_root
  local old; old=$(sysctl -n net.netfilter.nf_conntrack_max)
  sysctl -w net.netfilter.nf_conntrack_max=500 >/dev/null
  sleep "$DUR"
  sysctl -w net.netfilter.nf_conntrack_max="$old"
}

# ---------- KUBERNETES (если есть kubectl) ----------
k8s_kill_pods() {
  echo "🔥 Убиваем случайный под в namespace '${K8S_NS:-default}' каждые 20s (${DUR}s)"
  local end=$((SECONDS + DUR))
  while (( SECONDS < end )); do
    local pod
    pod=$(kubectl get pods -n "${K8S_NS:-default}" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null) || break
    [[ -n "$pod" ]] && kubectl delete pod "$pod" -n "${K8S_NS:-default}" --force --grace-period=0
    sleep 20
  done
}

k8s_peg_cpu() {
  echo "🔥 CPU-hog Deployment (2 реплики stress) на ${DUR}s"
  kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata: { name: chaos-cpu-hog }
spec:
  replicas: 2
  selector: { matchLabels: { app: chaos-hog } }
  template:
    metadata: { labels: { app: chaos-hog } }
    spec:
      containers:
        - name: hog
          image: polinux/stress
          command: ["stress", "--cpu", "2", "--timeout", "${DUR}s"]
EOF
  sleep "$DUR"
  kubectl delete deploy chaos-cpu-hog --ignore-not-found
}

# ---------- Очистка ----------
cleanup() {
  require_root
  rm -f /tmp/chaos.fill && echo "✓ /tmp/chaos.fill удалён"
  tc qdisc del dev eth0 root 2>/dev/null && echo "✓ tc очищен"
  echo "✓ cleanup завершён (sysctl/iptables правки снимаются по таймауту сами)"
}

usage() {
  cat <<EOF
Дрели хаоса для учебного стенда. Использование: sudo $0 <drill> [seconds]

CPU/MEM:      cpu_burn | mem_pressure | oom_kill_test
DISK:         disk_fill | disk_slowdown
NETWORK:      net_latency | net_packet_loss | dns_blackhole | conntrack_exhaust
KUBERNETES:   k8s_kill_pods | k8s_peg_cpu     (env K8S_NS=namespace)

Прочее:       list | cleanup
Примеры:
  sudo $0 cpu_burn 30
  sudo $0 net_latency 120
  K8S_NS=shop $0 k8s_kill_pods 60

⚠️  ТОЛЬКО НА ТЕСТОВЫХ СТЕНДАХ!
EOF
}

main() {
  case "${1:-list}" in
    cpu_burn|mem_pressure|oom_kill_test|disk_fill|disk_slowdown|net_latency|net_packet_loss|dns_blackhole|conntrack_exhaust|k8s_kill_pods|k8s_peg_cpu)
      "$1" ;;
    cleanup) cleanup ;;
    list|*) usage ;;
  esac
}

main "$@"
