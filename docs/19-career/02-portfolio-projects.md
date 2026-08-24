# 💼 Портфолио: 10 проектов, после которых вы не «без опыта»

> Каждое резюме с фразой «изучал Kubernetes» проигрывает резюме со ссылкой на работающий проект. Ниже — проекты от Junior до Senior с ТЗ и критериями приёмки. **Делайте их в своём GitHub — это и есть ваш опыт.**

## 🟢 Уровень 1: Junior (проекты 1-3, ~1-2 недели каждый)

### Проект 1: Полный цикл для веб-приложения

**ТЗ:** взять любое опенсорс приложение (или своё) и довести до «продакшн-вида».

| Компонент | Требование |
| :--- | :--- |
| Образ | multi-stage, nonroot, <50MB, health-check |
| CI | тесты + trivy + buildx + push GHCR на тег |
| K8s | Deployment+Service+Ingress, probes, resources |
| Документация | README с диаграммой архитектуры (mermaid!) |

✅ **Готово, когда:** `git clone && kind load` → работает за 5 минут у любого человека.

---

### Проект 2: Helm chart с библиотекой шаблонов

**ТЗ:** свой чарт «app-of-everything» с values для dev/staging/prod.

```yaml
# Пример структуры values-prod.yaml
replicaCount: 3
image: { repository: ghcr.io/me/app, tag: "" }   # tag из AppVersion
resources:
  requests: { cpu: 100m, memory: 128Mi }
ingress:
  enabled: true
  className: nginx
  tls: { enabled: true }
metrics:
  serviceMonitor: { enabled: true }
podDisruptionBudget: { minAvailable: 2 }
networkPolicy: { enabled: true }
```

✅ **Готово, когда:** `helm lint`, `helm template` проходят; ct (chart-testing) зелёный; README описывает все параметры таблицей.

---

### Проект 3: Ansible роль + Molecule

**ТЗ:** роль «hardened docker host»: установка Docker, настройка daemon.json, logrotate, fail2ban, users.

✅ **Готово, когда:** Molecule прогоняет create→converge→idempotence→verify против docker-контейнера; ansible-lint чистый.

## 🟡 Уровень 2: Middle (проекты 4-7)

### Проект 4: CLI-инструмент на Go/Cobra

**Идеи:** очиститель завершённых подов/джоб по TTL; аудит RBAC («кому что можно»); генератор NetworkPolicy из логов Hubble.

```bash
# Ожидаемый UX вашего инструмента:
kubeclean run --all-namespaces --older-than=24h --dry-run
DRY-RUN: would delete 47 completed pods across 6 namespaces
kubeclean run --all-namespaces --older-than=24h
Deleted 47 pods in 12s ✅
```

**Обязательны:** юнит-тесты (>70% coverage), goreleaser для бинарников под все платформы, GitHub Actions CI, релизы через git tag.

✅ **Готово, когда:** инструмент установлен brew/скриптом у друга-коллеги и он им пользуется.

---

### Проект 5: Свой Prometheus exporter

**ТЗ:** экспортер метрик чего-то, чего нет в списке готовых. Идеи: метрики роутера, счётчика электроэнергии, очереди задач, API-лимитов внешнего сервиса.

```python
# Скелет на Python (промышленно лучше Go, но Python быстрее стартовать)
from prometheus_client import start_http_server, Gauge
import requests, time

EXTERNAL_API_QUOTA = Gauge('external_api_quota_remaining', 'Remaining quota', ['api'])

def collect():
    resp = requests.get('https://api.example.com/quota').json()
    EXTERNAL_API_QUOTA.labels(api='example').set(resp['remaining'])

if __name__ == '__main__':
    start_http_server(9100)
    while True:
        collect(); time.sleep(60)
```

✅ **Готово, когда:** экспортер в Grafana дашборде, есть алерт на аномалию, опубликован как контейнер с ServiceMonitor.

---

### Проект 6: GitOps-платформа для пет-проектов

**ТЗ:** ArgoCD + ApplicationSet: кладёшь каталог в репо → приложение деплоится автоматически.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata: { name: my-apps }
spec:
  generators:
    - git: { repoURL: https://github.com/me/apps.git, directories: [{ path: apps/* }] }
  template:
    metadata: { name: '{{path.basename}}' }
    spec:
      project: default
      source: { repoURL: https://github.com/me/apps.git, path: '{{path}}' }
      destination: { server: https://kubernetes.default.svc, namespace: '{{path.basename}}' }
      syncPolicy: { automated: { prune: true, selfHeal: true } }
```

✅ **Готово, когда:** новый сервис = один каталог в Git без единого kubectl apply; есть preview-environment на каждый PR.

---

### Проект 7: Chaos engineering набор

**ТЗ:** сценарии хаоса для своего кластера + автоматическая проверка устойчивости.

```bash
# Пример эксперимента с LitmusChaos / chaos-mesh:
# - kill случайного pod каждые 5 минут
# - network delay 200ms между api и db
# - заполнить диск ноды на 90%
```

✅ **Готово, когда:** есть документ «результаты экспериментов»: что сломалось, что пережило, какие action items внедрены.

## 🔴 Уровень 3: Senior-уклон (проекты 8-10)

### Проект 8: Homelab as Code целиком (см. [Home Lab](01-home-lab-setup.md))

Proxmox VM через terraform provider, конфигурация Ansible, приложения ArgoCD. `terraform apply` поднимает вашу серверную с нуля.

### Проект 9: Мультирегиональная симуляция

Два kind-кластера = два региона. Frontend выбирает ближайший, данные реплицируются, GSLB через CoreDNS + health checks. Отключаете один кластер — трафик переезжает сам.

### Проект 10: Собственный оператор Kubernetes

kubebuilder + controller-runtime: CRD `BackupSchedule` который делает velero backup по расписанию и шлёт результат в Telegram. Это топовый пункт в резюме Platform Engineer'а.

---

## 📝 Как оформить проект в GitHub

```markdown
# Project Name

![CI](https://github.com/user/repo/actions/workflows/ci.yaml/badge.svg)
![Release](https://img.shields.io/github/v/tag/user/repo)

Одна строка: что делает и какую проблему решает.

## Архитектура
[mermaid диаграмма]

## Быстрый старт
git clone ... && make demo     # работает за <5 мин

## Что внутри
- Terraform модуль X (зачем)
- GitLab CI с канарейкой (почему так)

## Чему я научился / trade-offs
Честные абзацы о сложностях — это читают техлиды!
```

!!! warning "Антипаттерны портфолио"
    - Форки чужих репозиториев без изменений — пусто.
    - Туториальные todo-приложения без инфраструктуры.
    - README из одной строки. Пишите для будущего ревьюера на собеседовании.
