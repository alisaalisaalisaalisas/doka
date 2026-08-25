# 🔄 Lab 07: GitOps с ArgoCD — Git как единственный источник правды

> **Время:** 75 минут | **Уровень:** Middle | **Нужно:** kind, kubectl (Lab 03)
> **Результат:** ArgoCD синхронизирует приложение из Git; ручные правки откатываются автоматически.

!!! tip "Интерактивная версия"
    Эту лабу можно прогнать в симуляторе прямо на сайте — с автопроверкой шагов: [Песочница → сценарий «Lab 07»](../21-playground/playground.html?scenario=lab07). Реальные руки — по шагам ниже.

## 🧪 Часть 1: Установка ArgoCD в kind (15 мин)

```bash
kind create cluster --name gitops
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl -n argocd rollout status deploy/argocd-server --timeout=300s

# CLI
curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x argocd && sudo mv argocd /usr/local/bin/

# Доступ: порт-форвард + админ-пароль
kubectl -n argocd port-forward svc/argocd-server 8081:443 &
export ARGO_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d)
argocd login localhost:8081 --username admin --password $ARGO_PASSWORD --insecure
```

Откройте **https://localhost:8081** — UI ArgoCD.
---

## 🧪 Часть 2: GitOps-репозиторий (15 мин)

Создайте публичный репозиторий `gitops-demo` и положите туда:

```bash
mkdir gitops-demo && cd gitops-demo && git init
mkdir apps/demo

cat > apps/demo/deployment.yaml <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-app
  namespace: default
spec:
  replicas: 2
  selector: { matchLabels: { app: demo } }
  template:
    metadata: { labels: { app: demo } }
    spec:
      containers:
        - name: web
          image: hashicorp/http-echo:1.0
          args: ["-text=VERSION-1", "-listen=:5678"]
          ports: [{ containerPort: 5678 }]
          resources:
            requests: { cpu: 10m, memory: 32Mi }
---
apiVersion: v1
kind: Service
metadata: { name: demo-svc, namespace: default }
spec:
  selector: { app: demo }
  ports: [{ port: 80, targetPort: 5678 }]
EOF

gh repo create gitops-demo --public --source=. --push   # или вручную на GitHub
```

---

## 🧪 Часть 3: Application в ArgoCD (15 мин)

```bash
argocd app create demo \
  --repo https://github.com/<ВАШ_ЮЗЕР>/gitops-demo.git \
  --path apps/demo \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace default \
  --sync-policy automated \
  --self-heal --prune

argocd app wait demo --health
kubectl get deploy demo-app    # живой! Git → кластер без единого kubectl apply
```

**Три принципа GitOps на практике:**

| Принцип | Как проверим |
| :--- | :--- |
| Декларативность | всё состояние описано в YAML в Git |
| Версионирование + история | `git log` = история деплоев |
| Автоматический reconcile | сейчас увидим self-heal |

---

## 🧪 Часть 4: Self-heal и Drift (15 мин)

```bash
# 1. РУЧНАЯ ПРАВКА МИМО GIT ("злодей на проде")
kubectl scale deploy demo-app --replicas=5

watch -n2 'kubectl get deploy demo-app -o jsonpath="{.spec.replicas}"'
# Через ~30 сек вернётся к 2 — self-heal откатил злодея! ✅

# 2. Легитимное изменение через GIT
sed -i 's/VERSION-1/VERSION-2/' apps/demo/deployment.yaml
git commit -am "release v2" && git push
argocd app wait demo --health && \
kubectl get pods -l app=demo -o jsonpath='{range .items[*]}{.spec.containers[0].args[0]}{"\n"}{end}'
# VERSION-2 задеплоен автоматом. Rollback = git revert!
```

---

## 🧪 Часть 5: Sync waves — порядок деплоя (15 мин)

Реальный кейс: миграция БД должна выполниться ДО нового кода.

```bash
cat > apps/demo/02-migration-job.yaml <<'EOF'
apiVersion: batch/v1
kind: Job
metadata:
  name: migrate
  annotations:
    argocd.argoproj.io/sync-wave: "-1"     # раньше всего!
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: sleep-migrate
          image: busybox:1.36
          command: ["sh","-c","echo 'migrating schema...' && sleep 5 && echo done"]
EOF
git add -A && git commit -m "add pre-sync migration" && git push
argocd app sync demo --strategy hook
argocd app history demo | head -5
```

---

## 🎯 Домашнее задание

1. Добавьте `ApplicationSet` c git-generator'ом: каталог `apps/*` → отдельные Application.
2. Настройте notifications: алерт в Telegram при `SyncFailed`.
3. Сломайте манифест специально (`image: нет-такого-образа`) — посмотрите статус Degraded и как чинится revert'ом.

## 🧹 Cleanup

```bash
argocd app delete demo --yes; kubectl delete ns argocd --force --grace-period=0
kind delete cluster --name gitops; pkill -f "port-forward"
```

## ✅ Чек-лист

- [ ] Объясню три столпа GitOps и покажу их в своей лабе
- [ ] Сам видел, как self-heal откатывает ручные правки
- [ ] Знаю, что rollback в GitOps — это git revert, а не кнопка
- [ ] Понимаю sync waves для упорядочивания деплоя

🎉 **Вы прошли все лабы! Дальше:** [Break-Fix сценарии](../17-break-fix/01-incident-simulations.md) — ломаем всё намеренно.
