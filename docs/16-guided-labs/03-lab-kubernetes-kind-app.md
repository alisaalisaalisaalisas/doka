# ☸️ Lab 03: Полноценное приложение в Kubernetes (kind)

> **Время:** 2 часа | **Уровень:** Middle | **Нужно:** Docker, kubectl, kind
> **Результат:** three-tier app (db + api + web) с ingress/TLS/HPA/PDB/NetworkPolicy в локальном кластере.

!!! tip "Интерактивная версия"
    Эту лабу можно прогнать в симуляторе прямо на сайте — с автопроверкой шагов: [Песочница → сценарий «Lab 03»](../21-playground/playground.html?scenario=lab03). Реальные руки — по шагам ниже.

## 📦 Подготовка инструментов

```bash
# kind (кластер в докере за 60 сек)
curl -Lo kind https://kind.sigs.k8s.io/dl/v0.24.0/kind-$(uname)-amd64
chmod +x kind && sudo mv kind /usr/local/bin/

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -sL dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl && sudo mv kubectl /usr/local/bin/
```
---

## 🧪 Часть 1: Кластер с ingress-портом наружу (10 мин)

```bash
cat > kind-config.yaml <<'EOF'
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 80     # ingress будет слушать сюда
        hostPort: 80
      - containerPort: 443
        hostPort: 443
EOF

kind create cluster --config kind-config.yaml --name lab3
kubectl cluster-info --context kind-lab3

# NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl -n ingress-nginx wait --for=condition=Ready pod -l app.kubernetes.io/component=controller --timeout=180s
```

---

## 🧪 Часть 2: Namespace + квоты + default-deny (10 мин)

```bash
mkdir -p manifests && cd manifests

# Квоты: чтобы приложение не сожрало ноутбук
cat > 00-namespace.yaml <<'EOF'
apiVersion: v1
kind: Namespace
metadata:
  name: shop
---
apiVersion: v1
kind: ResourceQuota
metadata: { name: shop-quota, namespace: shop }
spec:
  hard: { requests.cpu: "2", requests.memory: 4Gi, pods: "20" }
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny-all, namespace: shop }
spec:
  podSelector: {}
  policyTypes: [Ingress, Egress]
EOF
kubectl apply -f 00-namespace.yaml
# ⚠️ kind использует kindnetd без NetworkPolicy-поддержки — политика применится,
# но не будет enforcing. Для честного теста поставьте Cilium (см. ДЗ).
```

---

## 🧪 Часть 3: PostgreSQL через StatefulSet (20 мин)

```bash
cat > 01-postgres.yaml <<'EOF'
apiVersion: apps/v1
kind: StatefulSet
metadata: { name: pg, namespace: shop }
spec:
  serviceName: pg
  replicas: 1
  selector: { matchLabels: { app: pg } }
  template:
    metadata: { labels: { app: pg } }
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          env:
            - { name: POSTGRES_USER, value: shop }
            - { name: POSTGRES_PASSWORD, value: devonly123 }
            - { name: POSTGRES_DB, value: shop }
          ports: [{ containerPort: 5432 }]
          volumeMounts: [{ name: data, mountPath: /var/lib/postgresql/data }]
          readinessProbe:
            exec: { command: ["pg_isready", "-U", "shop"] }
            initialDelaySeconds: 5
          resources:
            requests: { cpu: 100m, memory: 256Mi }
            limits: { memory: 512Mi }
  volumeClaimTemplates:
    - metadata: { name: data }
      spec:
        accessModes: [ReadWriteOnce]
        resources: { requests: { storage: 1Gi } }
---
apiVersion: v1
kind: Service
metadata: { name: pg, namespace: shop }
spec:
  clusterIP: None          # headless — стабильные DNS имена для БД
  selector: { app: pg }
  ports: [{ port: 5432 }]
EOF

kubectl apply -f 01-postgres.yaml
kubectl -n shop rollout status statefulset/pg --timeout=120s
kubectl -n shop get pvc    # pg-data-pg-0 создался автоматически ✅
```

**Разрешаем api ходить в БД** (помните про default-deny):

```bash
cat > 02-netpol-api.yaml <<'EOF'
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: api-allow, namespace: shop }
spec:
  podSelector: { matchLabels: { app: pg } }
  policyTypes: [Ingress]
  ingress:
    - from: [{ podSelector: { matchLabels: { app: api } } }]
      ports: [{ port: 5432 }]
EOF
kubectl apply -f 02-netpol-api.yaml
```

---

## 🧪 Часть 4: API (Deployment) + HPA + PDB (20 мин)

```bash
cat > 03-api.yaml <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata: { name: api, namespace: shop }
spec:
  replicas: 2
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }
    spec:
      topologySpreadConstraints:       # реплики по разным нодам
        - maxSkew: 1
          topologyKey: kubernetes.io/hostname
          whenUnsatisfiable: ScheduleAnyway
          labelSelector: { matchLabels: { app: api } }
      containers:
        - name: api
          image: hashicorp/http-echo:1.0   # заглушка API для лабы
          args: ["-text=api-v1", "-listen=:8080"]
          ports: [{ containerPort: 8080 }]
          livenessProbe:
            httpGet: { path: /, port: 8080 }
            initialDelaySeconds: 3
          readinessProbe:
            httpGet: { path: /, port: 8080 }
          resources:
            requests: { cpu: 50m, memory: 64Mi }
            limits: { memory: 128Mi }
---
apiVersion: v1
kind: Service
metadata: { name: api, namespace: shop }
spec:
  selector: { app: api }
  ports: [{ port: 80, targetPort: 8080 }]
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: api, namespace: shop }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: api }
  minReplicas: 2
  maxReplicas: 6
  metrics:
    - type: Resource
      resource: { name: cpu, target: { type: Utilization, averageUtilization: 70 } }
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: { name: api, namespace: shop }
spec:
  minAvailable: 1
  selector: { matchLabels: { app: api } }
EOF

kubectl apply -f 03-api.yaml
kubectl -n shop rollout status deploy/api
```

> 💡 HPA требует metrics-server. В kind его нет по умолчанию:
```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl patch deployment metrics-server -n kube-system --type=json \
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
```

---

## 🧪 Часть 5: Ingress + TLS (15 мин)

```bash
# Самоподписанный серт (в проде — cert-manager + Let's Encrypt)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key -out tls.crt -subj "/CN=shop.local"

kubectl -n shop create secret tls shop-tls --cert=tls.crt --key=tls.key

cat > 04-ingress.yaml <<'EOF'
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shop
  namespace: shop
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls: [{ hosts: [shop.local], secretName: shop-tls }]
  rules:
    - host: shop.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend: { service: { name: api, port: { number: 80 } } }
EOF
kubectl apply -f 04-ingress.yaml

echo "127.0.0.1 shop.local" | sudo tee -a /etc/hosts
curl -k https://shop.local/     # api-v1 по HTTPS 🎉
```

---

## 🧪 Часть 6: Проверяем отказоустойчивость (15 мин)

```bash
# Rolling update без даунтайма
kubectl -n shop set image deploy/api api=hashicorp/http-echo:1.1
kubectl -n shop rollout status deploy/api
for i in $(seq 1 20); do curl -sk https://shop.local/ ; done | sort | uniq -c
# Видите оба текста? Трафик не прерывался!

# Убиваем под — PDB+Deployment поднимут новый
kubectl -n shop delete pod -l app=api --wait=false
kubectl -n shop get pods -w &   # наблюдаем пересоздание; Ctrl+C

# Ephemeral debug-контейнер в под без шелла
kubectl -n shop debug -it deploy/api --image=busybox:1.36 -- sh
/ # wget -qO- localhost:8080 ; exit
```

---

## 🧹 Cleanup

```bash
kubectl delete namespace shop
kind delete cluster --name lab3
sudo sed -i '/shop.local/d' /etc/hosts
```

## ✅ Чек-лист

- [ ] Могу объяснить, почему БД = StatefulSet, а api = Deployment
- [ ] Понимаю каждый YAML из лабы и могу написать с нуля
- [ ] Rolling update прошёл с нулем ошибок у клиента
- [ ] Знаю зачем HPA нужны metrics-server и requests

## 🎯 Домашнее задание

1. Поставьте Cilium как CNI (`cilium install`) — NetworkPolicy начнет реально работать.
2. Добавьте CronJob «бэкап БД» (`pg_dump` → PVC) каждую минуту для теста.
3. Замените самоподписанный серт на cert-manager + selfsigned-issuer.

**Что дальше:** [Lab 04 — CI/CD пайплайн](04-lab-cicd-pipeline.md)
