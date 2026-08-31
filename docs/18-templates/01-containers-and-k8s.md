# 📦 Шаблоны: Kubernetes и контейнеры

> Копируйте в свои проекты как есть. Всё проверено на практике — это «скелет» продакшн-конфигураций.

## Dockerfile: Python (FastAPI) — production

```dockerfile
# syntax=docker/dockerfile:1.9
FROM python:3.12-slim AS builder
WORKDIR /build
RUN apt-get update && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --prefix=/install -r requirements.txt

FROM python:3.12-slim
RUN groupadd -g 10001 app && useradd -u 10001 -g app -s /usr/sbin/nologin app
WORKDIR /app
COPY --from=builder /install /usr/local
COPY src/ .
USER app
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD ["python", "-c", "import urllib.request as u; u.urlopen('http://localhost:8000/healthz', timeout=2)"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Dockerfile: Node.js (Next.js standalone)

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine
WORKDIR /app
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

## .dockerignore — универсальный (безопасный по умолчанию)

```text
*
!src/
!app/
!package.json
!package-lock.json
!requirements.txt
!go.mod
!go.sum
!Dockerfile
!.dockerignore
```

---

## K8s: Deployment + Service + HPA + PDB одним куском

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  labels: { app.kubernetes.io/name: api, app.kubernetes.io/part-of: shop }
spec:
  replicas: 3
  strategy:
    rollingUpdate: { maxSurge: 25%, maxUnavailable: 0 }   # нулевой даунтайм
  selector:
    matchLabels: { app.kubernetes.io/name: api }
  template:
    metadata:
      labels: { app.kubernetes.io/name: api }
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
    spec:
      terminationGracePeriodSeconds: 45
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone     # по зонам!
          whenUnsatisfiable: ScheduleAnyway
          labelSelector: { matchLabels: { app.kubernetes.io/name: api } }
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        seccompProfile: { type: RuntimeDefault }
      containers:
        - name: api
          image: registry.example.com/api@sha256:ЗАМЕНИТЕ_НА_DIGEST   # иммутабельно!
          ports: [{ containerPort: 8080 }]
          env:
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef: { name: api-secrets, key: db-password }
          resources:
            requests: { cpu: 250m, memory: 256Mi }
            limits: { memory: 512Mi }        # CPU limit НЕ ставим — нет троттлинга
          livenessProbe:
            httpGet: { path: /healthz, port: 8080 }
            periodSeconds: 10
            failureThreshold: 3
          readinessProbe:
            httpGet: { path: /readyz, port: 8080 }
            periodSeconds: 5
          startupProbe:                      # для медленно стартующих (JVM)
            httpGet: { path: /healthz, port: 8080 }
            failureThreshold: 30
            periodSeconds: 2
          lifecycle:
            preStop:                          # дожать балансировщик
              exec: { command: ["sh", "-c", "sleep 5"] }
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities: { drop: [ALL] }
---
apiVersion: v1
kind: Service
metadata: { name: api }
spec:
  selector: { app.kubernetes.io/name: api }
  ports: [{ port: 80, targetPort: 8080, name: http }]
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: api }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: api }
  minReplicas: 3
  maxReplicas: 12
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300         # не мигрируем туда-сюда
  metrics:
    - type: Resource
      resource: { name: cpu, target: { type: Utilization, averageUtilization: 70 } }
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: { name: api }
spec:
  minAvailable: 2
  selector: { matchLabels: { app.kubernetes.io/name: api } }
```

## NetworkPolicy: default-deny + явные разрешения

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny-all, namespace: prod }
spec: { podSelector: {}, policyTypes: [Ingress, Egress] }
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: api-policy, namespace: prod }
spec:
  podSelector: { matchLabels: { app.kubernetes.io/name: api } }
  policyTypes: [Ingress, Egress]
  ingress:
    - from:                                  # только ingress-controller
        - namespaceSelector: { matchLabels: { name: ingress-nginx } }
      ports: [{ port: 8080 }]
  egress:
    - to: [{ podSelector: { matchLabels: { app: postgres } } }]
      ports: [{ port: 5432 }]
    - to:                                    # DNS обязателен!
        - namespaceSelector: {}
      ports: [{ port: 53, protocol: UDP }, { port: 53, protocol: TCP }]
```

## CronJob с корректной политикой пересечений

```yaml
apiVersion: batch/v1
kind: CronJob
metadata: { name: nightly-backup, namespace: prod }
spec:
  schedule: "0 2 * * *"
  concurrencyPolicy: Forbid                  # не запускать параллельно
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 7
  startingDeadlineSeconds: 3600
  jobTemplate:
    spec:
      backoffLimit: 2
      activeDeadlineSeconds: 1800
      template:
        spec:
          restartPolicy: Never
          containers:
            - name: backup
              image: postgres:16-alpine
              command: ["sh","-c","pg_dump -h pg -U $PGUSER $PGDATABASE | gzip > /backup/db-$(date +%F).sql.gz"]
              env: [{ name: PGPASSWORD, valueFrom: { secretKeyRef: { name: pg-secrets, key: password } } }]
              volumeMounts: [{ name: backup-vol, mountPath: /backup }]
          volumes: [{ name: backup-vol, persistentVolumeClaim: { claimName: backups } }]
```

!!! tip "Как этим пользоваться"
    Не копируйте всё сразу. Берите блок за блоком, применяйте, проверяйте `kubectl explain` для незнакомых полей. Через месяц вы будете писать это наизусть.
