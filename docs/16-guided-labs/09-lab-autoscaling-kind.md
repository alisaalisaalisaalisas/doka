# 📈 Lab 09: Автоскейлинг в kind — HPA, нагрузочные тесты и KEDA

> **Время:** 60 минут | **Уровень:** Middle | **Нужно:** Docker, kind (см. [Lab 03](03-lab-kubernetes-kind-app.md))
> **Результат:** видите своими глазами, как HPA добавляет и убирает реплики по метрикам, почему без `behavior` получается пила, и как KEDA скейлит очередь с нуля.

## 🧪 Часть 1: Кластер + metrics-server (10 мин)

```bash
kind create cluster --name scaling --image kindest/node:v1.30.5

# metrics-server в kind требует --kubelet-insecure-tls (самоподписанные сертификаты)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl patch deployment metrics-server -n kube-system --type=json \
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
kubectl wait --for=condition=Available deploy/metrics-server -n kube-system --timeout=120s

# Проверка: метрики пошли
kubectl top nodes
```

---

## 🧪 Часть 2: Приложение с корректными requests (10 мин)

HPA считает `usage / request` — requests обязательны.

```yaml
# app.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: php-apache          # классическое демо-приложение, жжёт CPU по запросу
spec:
  replicas: 1
  selector: { matchLabels: { app: php-apache } }
  template:
    metadata: { labels: { app: php-apache } }
    spec:
      containers:
        - name: web
          image: registry.k8s.io/hpa-example
          ports: [{ containerPort: 80 }]
          resources:
            requests: { cpu: 200m }        # БЕЗ этого HPA не работает!
---
apiVersion: v1
kind: Service
metadata: { name: php-apache }
spec:
  selector: { app: php-apache }
  ports: [{ port: 80, targetPort: 80 }]
```

```bash
kubectl apply -f app.yaml && kubectl wait --for=condition=Available deploy/php-apache
```

---

## 🧪 Часть 3: HPA «в лоб» — наблюдаем пилу (10 мин)

```bash
kubectl autoscale deploy/php-apache --min=1 --max=10 --cpu-percent=50

# Второй терминал: живое наблюдение
watch -n2 'kubectl get hpa php-apache; kubectl get pods -l app=php-apache --no-headers | wc -l'
```

Нагрузка:

```bash
kubectl run loadgen --rm -it --image=busybox --restart=Never -- \
  sh -c 'while :; do wget -q -O- http://php-apache >/dev/null; done'
# Для многопоточной нагрузки запустите 3-4 таких loadgen'а с разными именами
```

Через 2–4 минуты реплики растут. Остановите генератор (`Ctrl+C`) и наблюдайте **главную проблему**: реплики падают почти так же быстро, как росли — холодные поды, дёрганый сервис. Это дефолтное поведение без `behavior`.

---

## 🧪 Часть 4: HPA с behavior — гасим пилу (15 мин)

```yaml
# hpa-behavior.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: php-apache }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: php-apache }
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource: { name: cpu, target: { type: Utilization, averageUtilization: 50 } }
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 180     # пик должен устояться 3 минуты
      policies:
        - { type: Pods, value: 1, periodSeconds: 30 }   # вниз не быстрее 1 пода/30с
    scaleUp:
      policies:
        - { type: Percent, value: 100, periodSeconds: 15 }   # вверх можно агрессивно
      selectPolicy: Max
```

```bash
kubectl apply -f hpa-behavior.yaml
# Повторите нагрузку из Части 3 и остановите её.
# Сравните графики: вниз теперь медленно и ступенчато.
kubectl describe hpa php-apache | grep -A8 Conditions   # события решений HPA
```

**Проверь себя:** чем отличается поведение scaleDown до и после behavior? Запишите число реплик через 1/3/5 минут после снятия нагрузки.

---

## 🧪 Часть 5: KEDA — скейл очереди с нуля (15 мин)

```bash
helm repo add kedacore https://kedacore.github.io/charts && helm repo update
helm install keda kedacore/keda -n keda --create-namespace
kubectl get pods -n keda     # оператор + metrics-api готовы
```

Redis + воркер-очередь:

```bash
kubectl run redis --image=redis:7 --port=6379
kubectl expose pod redis --port=6379
```

```yaml
# worker.yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: queue-worker }
spec:
  replicas: 0                      # стартуем с НУЛЯ!
  selector: { matchLabels: { app: queue-worker } }
  template:
    metadata: { labels: { app: queue-worker } }
    spec:
      containers:
        - name: worker
          image: busybox
          command: ["sh","-c","while :; do echo processing; sleep 5; done"]
---
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata: { name: queue-worker }
spec:
  scaleTargetRef: { name: queue-worker }
  minReplicaCount: 0               # scale-to-zero!
  maxReplicaCount: 5
  cooldownPeriod: 30
  triggers:
    - type: redis
      metadata:
        address: redis.default.svc.cluster.local:6379
        listName: jobs             # длина списка = желаемые реплики
        listLength: "2"
```

```bash
kubectl apply -f worker.yaml
sleep 20 && kubectl get deploy queue-worker     # 0 реплик — воркеров нет, денег не тратим!

# Кладём задачи в очередь → смотрим, как KEDA будит воркеров
kubectl run redis-cli --rm -it --image=redis:7 --restart=Never -- \
  sh -c 'for i in $(seq 1 10); do redis-cli -h redis RPUSH jobs job-$i; done'
watch -n2 kubectl get deploy queue-worker       # 0 → 5 (10 задач / listLength 2) → обратно к 0
```

**Проверь себя:** посмотрите `kubectl get hpa` — KEDA создал свой HPA под капотом; найдите его метрику `external`.

---

## 🧪 Часть 6: Разбор полётов (5 мин)

```bash
# Почему HPA не решится? Полный диагноз одной командой
kubectl describe hpa php-apache | tail -12

# История событий масштабирования
kubectl get events --field-selector reason=SuccessfulCreate,reason=SuccessfulDelete --sort-by=.lastTimestamp | head

# Уборка
kind delete cluster --name scaling
```

---

## ✅ Проверь себя

1. Почему без `resources.requests` HPA молчит? *(utilization = usage/request; нет знаменателя — нет расчёта)*
2. Что даёт stabilizationWindowSeconds и какой дефолт у scaleDown? *(берёт минимум рекомендаций за окно; дефолт 300с)*
3. Чем триггер KEDA отличается от метрики HPA Resource? *(внешние системы: lag очереди, cron, Prometheus-запрос — через external.metrics)*
4. Что произойдёт с очередью jobs при minReplicaCount: 0 и потоке задач? *(KEDA будит поды от 0 до listLength-ограниченного числа, обрабатывают, возвращаются к нулю)*
5. Как связаны этот Lab и реальный прод-инцидент «HPA упёрся в maxReplicas, а узлы кончились»? *(нужен Cluster Autoscaler/Karpenter + алерты на maxReplicas и Pending-поды — см. [04.8](../04-kubernetes/08-k8s-autoscaling.md))*

## 🎯 Куда дальше

- Включить VPA в режиме Off на своём kind и сравнить рекомендации с фактическими requests.
- Поменять триггер KEDA на kafka и повторить со Strimzi ([11.2](../11-data-and-storage/02-kafka-and-strimzi.md)).
- Прочитать про overprovisioning-поды и priorityClass — резерв ёмкости до прихода нагрузки.
