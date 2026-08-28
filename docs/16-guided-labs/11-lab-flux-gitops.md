# 🧪 Lab 11: GitOps с FluxCD на kind (зеркало Lab 07)

> Тот же флоу что Lab 07 (ArgoCD), но на Flux: `kind → flux install → GitRepository → Kustomization → Deployment → Git change → reconciliation → verify → suspend/resume → health → prune`.

**Время:** 25–30 мин. **Стенд:** `kind`, `kubectl`, `flux` CLI, `git`, `helm` (опционально). **Облако не нужно** — для bootstrap GitHub есть fallback локального `flux install`.

---

## 0. Подготовка

```bash
kind create cluster --name flux-lab --config - <<'EOF'
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 30080
        hostPort: 30080
EOF
kubectl cluster-info --context kind-flux-lab
flux check --pre
flux install --components=source-controller,kustomize-controller,helm-controller,notification-controller
kubectl -n flux-system get pods -w
# Ожидаем все 4-6 pods Running
```

**GitHub bootstrap альтернатива (cloud):**
```bash
export GITHUB_TOKEN=ghp_...
flux bootstrap github --owner=$GITHUB_USER --repository=platform-config --branch=main --path=clusters/prod --personal
# Создаст в репо clusters/prod/flux-system/gotk-*.yaml и GitRepository/Kustomization
```

---

## 1. Создайте GitRepository и Kustomization

```bash
kubectl create ns shop

# Для локального демо используем публичный репо fluxcd как source (или свой fork)
flux create source git platform-config --url=https://github.com/fluxcd/flux2-kustomize-controllers --branch=main --interval=1m

# Подготовим локальный каталог с приложением (имитирует ваш Git)
mkdir -p /tmp/flux-lab/apps/shop
cat > /tmp/flux-lab/apps/shop/deployment.yaml <<'YAML'
apiVersion: apps/v1
kind: Deployment
metadata: { name: shop-api, namespace: shop }
spec:
  replicas: 2
  selector: { matchLabels: { app: shop-api } }
  template:
    metadata: { labels: { app: shop-api } }
    spec:
      containers:
        - name: api
          image: ghcr.io/stefanprodan/podinfo:6.5.0
          ports: [{ containerPort: 9898 }]
          readinessProbe: { httpGet: { path: /, port: 9898 }, initialDelaySeconds: 3 }
YAML
cat > /tmp/flux-lab/apps/shop/service.yaml <<'YAML'
apiVersion: v1
kind: Service
metadata: { name: shop-api, namespace: shop }
spec:
  selector: { app: shop-api }
  ports: [{ port: 80, targetPort: 9898 }]
YAML
cat > /tmp/flux-lab/apps/shop/kustomization.yaml <<'YAML'
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources: [deployment.yaml, service.yaml]
YAML

# Создайте Kustomization указывающую на пример из flux2 repo (samples)
flux create kustomization shop --source=GitRepository/platform-config --path="./config/samples/podinfo" --prune=true --interval=5m --target-namespace=shop --health-check="Deployment/podinfo.podinfo" --health-check="Deployment/podinfo.podinfo" --wait=true

# Проверка
flux get sources git -A
flux get kustomizations -A
kubectl -n flux-system describe kustomization shop | grep -A6 Conditions
```

**Ожидаемо:** `Kustomization/shop Ready True, Applied revision main@sha1:...`, `kubectl -n shop get deploy,pods` — podinfo Running.

---

## 2. Изменение в Git → reconciliation

```bash
# Эмулируем push: правим kustomization для вашего /tmp/flux-lab (если подключили Bucket)
# Для demo — патчим через flux и смотрим drift:
flux reconcile source git platform-config
flux reconcile kustomization shop --with-source
kubectl -n shop scale deploy/podinfo --replicas=5 --dry-run=client -o yaml | kubectl apply -f -
# Теперь кластер drift: 5 vs Git 2
sleep 60 && flux get kustomizations -A  # через interval вернётся к 2 (self-heal)
kubectl -n shop get deploy podinfo -o jsonpath='{.spec.replicas}'  # 2

# Ручной reconcile форсированно:
flux reconcile kustomization shop --with-source --verbose
```

---

## 3. HelmRelease через Flux

```bash
flux create source helm bitnami --url=https://charts.bitnami.com/bitnami --interval=10m
flux create helmrelease redis --source=HelmRepository/bitnami --chart=redis --chart-version="18.x" --target-namespace=redis-system --create-target-namespace=true --interval=5m --values='auth: {enabled: false}'

flux get helmreleases -A
flux get sources helm -A
helm -n redis-system list
kubectl -n redis-system get pods -l app.kubernetes.io/name=redis
```

---

## 4. Suspend / Resume и diff

```bash
flux suspend kustomization shop
kubectl -n shop scale deploy/podinfo --replicas=10
kubectl -n shop get deploy podinfo -o jsonpath='{.spec.replicas}'  # 10, Flux не трогает

flux resume kustomization shop
flux reconcile kustomization shop --with-source
kubectl -n shop get deploy podinfo -o jsonpath='{.spec.replicas}'  # 2 снова

# Preview
flux diff kustomization shop
```

---

## 5. Проверка здоровья и событий

```bash
flux events --for Kustomization/shop --tail
kubectl -n flux-system get events --field-selector reason=ReconciliationSucceeded | tail -20
flux get kustomizations --status-selector ready=false  # должны быть 0

# HealthChecks: добавьте зависимость
flux create kustomization infra --source=GitRepository/platform-config --path="./config/crd" --prune=true --interval=5m --wait=true
flux create kustomization apps2 --source=GitRepository/platform-config --path="./config/samples/podinfo" --prune=true --interval=5m --depends-on=infra --wait=true
flux get kustomizations -A
```

---

## 6. Cleanup

```bash
flux delete kustomization shop --silent
flux delete helmrelease redis -n redis-system --silent
flux delete source git platform-config --silent
flux delete source helm bitnami --silent
kind delete cluster --name flux-lab
rm -rf /tmp/flux-lab
```

**Критерии успеха:** `flux check` → 0 failed, `flux get kustomizations` `Ready True`, `helm -n redis-system list` содержит `redis`, `suspend/resume` восстановил drift.

---

## 🧭 Что дальше

- Теория: [Flux Deep Dive](../05-gitops-and-cicd/07-flux-deep-dive.md) — controllers, SOPS, image automation
- Практика: [ArgoCD Lab 07](07-lab-gitops-argocd.md) — сравните `flux reconcile` vs `argocd app sync`
- Troubleshooting: `flux events`, `flux diff`, `kubectl -n flux-system logs deploy/kustomize-controller`
