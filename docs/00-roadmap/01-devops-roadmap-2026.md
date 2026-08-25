# 🗺️ Roadmap 2026: от нуля до DevOps инженера

> Этот файл — ваш **главный навигатор** по всему handbook'у. Проходите этапы последовательно, отмечайте чек-боксы, не перескакивайте.

## 🎯 Кем можно стать: разница ролей

| Роль | Фокус | Зарплатная вилка (RF, 2026) | Ключевые навыки |
| :--- | :--- | :--- | :--- |
| **DevOps Engineer** | Пайплайны, инфраструктура, релизы | 150-350k ₽ | Docker, K8s, CI/CD, IaC |
| **SRE** | Надежность, SLO, инциденты | 200-450k ₽ | Всё из DevOps + PromQL, post-mortem, on-call |
| **Platform Engineer** | Внутренняя платформа для разработчиков | 250-500k ₽ | GitOps, операторы, IDP, мульти-кластер |
| **Cloud Engineer** | Облачная инфраструктура | 180-400k ₽ | AWS/Azure/GCP, сети, безопасность |
| **SecOps / DevSecOps** | Безопасность пайплайнов и рантайма | 220-480k ₽ | Vault, Kyverno, сканеры, compliance |

---

## 📅 Этапы пути (при 10-15 ч/неделю)

### Этап 0: Фундамент (4-6 недель)

**Цель:** свободно жить в терминале Linux и понимать сеть.

- [ ] Linux: установка Ubuntu/Debian на VM, базовые команды, права, процессы
- [ ] Bash: написать скрипт бэкапа с логированием и обработкой ошибок
- [ ] Сеть: OSI наизусть, `ip`, `ss`, `dig`, `tcpdump` — диагностика «интернет не работает»
- [ ] Диагностика: сценарий «сервер тормозит» за 60 секунд (uptime → vmstat → iostat → pidstat)
- [ ] SSH: ключи, config с ProxyJump, туннели
- [ ] Git: ветки, merge vs rebase, разрешение конфликтов, PR-флоу

📚 Читать параллельно: [01-linux](../01-linux-and-networking/01-linux-core-and-systemd.md), [05. Диагностика производительности](../01-linux-and-networking/05-linux-performance-diagnostics.md), [02-git](../02-git/01-git-internals-and-workflows.md)
🧪 Лаба после этапа: [Lab 01 — Linux & Systemd](../16-guided-labs/01-lab-linux-systemd-namespaces.md)

✅ **Критерий выхода:** можете с нуля поднять сервер, задеплоить на него простое приложение вручную и объяснить каждый шаг.

---

### Этап 1: Контейнеры (3-4 недели)

**Цель:** думать образами, а не серверами.

- [ ] Docker: образы vs контейнеры, слои, volumes, сети
- [ ] Написать Dockerfile для Python/Go/Node приложения < 50MB
- [ ] Multi-stage сборка + distroless
- [ ] Docker Compose: app + db + cache одной командой
- [ ] Понимать: namespaces, cgroups, overlayfs (что под капотом)

📚 Читать: [03-docker полностью](../03-docker/01-docker-architecture-and-cli.md)
🧪 Лаба: [Lab 02 — Фабрика образов](../16-guided-labs/02-lab-docker-image-factory.md)

✅ **Критерий выхода:** берёте любой опенсорс-проект и контейнеризируете его за вечер по best practices.

---

### Этап 2: Kubernetes (6-8 недель) ⚠️ самое важное

**Цель:** уверенно эксплуатировать K8s — это 80% вакансий.

- [ ] Архитектура: apiserver, etcd, scheduler, kubelet, controller-manager
- [ ] Workloads: Deployment, StatefulSet, DaemonSet, Job/CronJob
- [ ] Сети: Service types, Ingress, NetworkPolicy, CNI
- [ ] Хранилище: PV/PVC/SC, CSI, StatefulSet + volumeClaimTemplates
- [ ] Helm: свой чарт с нуля + values для dev/prod
- [ ] Troubleshooting: все статусы подов на автомате
- [ ] RBAC, ResourceQuotas, requests/limits
- [ ] Автоскейлинг: HPA с behavior, VPA, KEDA, Cluster Autoscaler
- [ ] Эксплуатация: бэкап etcd, апгрейд на минор, drain/uncordon

📚 Читать: [04-kubernetes весь](../04-kubernetes/01-k8s-architecture-and-workloads.md), затем [08. Автоскейлинг](../04-kubernetes/08-k8s-autoscaling.md) и [09. Эксплуатация](../04-kubernetes/09-k8s-cluster-operations.md)
🧪 Лабы: [Lab 03 — Полное приложение в kind](../16-guided-labs/03-lab-kubernetes-kind-app.md), [Lab 09 — Автоскейлинг](../16-guided-labs/09-lab-autoscaling-kind.md)

✅ **Критерий выхода:** деплоите трёхзвенное приложение (frontend+api+db) с ingress, TLS, HPA и мониторингом; чините сломанный кластер по чек-листу из [17-break-fix](../17-break-fix/01-incident-simulations.md).

---

### Этап 3: IaC и CI/CD (4-5 недель)

**Цель:** инфраструктура и доставка только через код.

- [ ] Terraform: провайдеры, state, модули, remote backend S3+DynamoDB
- [ ] Terraform в CI: plan на MR, тесты модулей, контроль дрейфа
- [ ] Ansible: роли, vault, molecule-тесты, производительность (forks/pipelining)
- [ ] GitLab CI или GitHub Actions: полный пайплайн test→build→scan→deploy
- [ ] GitOps: ArgoCD или Flux, sync waves, rollback
- [ ] Секреты: Vault / SOPS — никаких паролей в git!

📚 Читать: [06-terraform](../06-terraform/01-terraform-fundamentals.md), [06.3 Тестирование и CI](../06-terraform/03-terraform-testing-ci-and-state-ops.md), [07-ansible](../07-ansible/01-ansible-architecture-and-playbooks.md), [05-cicd](../05-gitops-and-cicd/01-gitops-argocd-flux.md), [GitLab CI deep dive](../05-gitops-and-cicd/03-gitlab-ci-deep-dive.md), [GitOps multi-env](../05-gitops-and-cicd/04-gitops-multienv-and-promotion.md)
🧪 Лабы: [Lab 05 — Terraform+LocalStack](../16-guided-labs/05-lab-terraform-localstack.md), [Lab 04 — CI/CD](../16-guided-labs/04-lab-cicd-pipeline.md), [Lab 07 — ArgoCD](../16-guided-labs/07-lab-gitops-argocd.md), [Lab 08 — Ansible+Molecule](../16-guided-labs/08-lab-ansible-molecule.md)

✅ **Критерий выхода:** push в main → автотесты → образ в registry → ArgoCD выкатил в кластер. Откат одной командой за 2 минуты.

---

### Этап 4: Observability и данные (3-4 недели)

**Цель:** видеть всё и понимать, почему медленно/лежит.

- [ ] Prometheus: метрики, PromQL, экспортеры, service discovery
- [ ] Grafana: дашборды RED/USE, переменные, алерты
- [ ] Alertmanager: routing, inhibition, дедупликация
- [ ] Loki: логи с label'ами, LogQL
- [ ] Понятие SLI/SLO/error budget
- [ ] Основы: Kafka (зачем и когда), PostgreSQL HA, Redis

📚 Читать: [09-observability](../09-observability/01-prometheus-and-grafana.md), [11-data обзорно](../11-data-and-storage/01-ceph-storage-and-rook.md)
🧪 Лаба: [Lab 06 — Стек мониторинга](../16-guided-labs/06-lab-observability-stack.md)

✅ **Критерий выхода:** для своего пет-проекта есть дашборд с golden signals + алерт, который реально приходит в Telegram при поломке.

---

### Этап 5: Безопасность и продвинутый уровень (постоянно)

- [ ] Vault: KV v2, AppRole, динамические секреты БД
- [ ] Сканирование: Trivy в CI, SBOM (syft), подпись образов (cosign)
- [ ] Policy as Code: Kyverno/OPA
- [ ] Supply chain: admission по подписи, provenance (SLSA)
- [ ] Service Mesh: Istio ambient — mTLS без переписывания приложений
- [ ] eBPF: Cilium, Hubble observability
- [ ] DR: Velero бэкапы + проверенное восстановление + PITR для БД

📚 [10-security](../10-security-and-cloud/01-devsecops-and-secrets.md), [10.4 Supply Chain](../10-security-and-cloud/04-supply-chain-security.md), [12-mesh](../12-advanced-networking-and-mesh/01-istio-service-mesh.md), [13-dr](../13-disaster-recovery-and-tools/01-k8s-backups-velero.md), [13.2 PITR и DR-план](../13-disaster-recovery-and-tools/02-database-backups-and-dr-plan.md)

✅ **Критерий выхода:** прошли все сценарии из [17-break-fix](../17-break-fix/01-incident-simulations.md) и [партии №2](../17-break-fix/02-incident-simulations-part2.md) на время (<30 мин каждый).

---

## ⏱️ Два режима обучения

| Параметр | Спокойный (работая) | Интенсив (full-time) |
| :--- | :--- | :--- |
| Часов в неделю | 10-15 | 40+ |
| До первой вакансии Junior | ~6-8 месяцев | 3-4 месяца |
| Порядок | Теория вечером, лабы в выходные | Утром теория, днём практика |

!!! tip "Правило 70/30"
    70% времени — **руки в клавиатуре** (лабы, ломание, чинение), 30% — чтение/видео. Читали про Deployment? Сразу разверните и сломайте его.

---

## 📚 Ресурсы (проверенная подборка)

### Книги (в порядке приоритета)

| Книга | Когда читать |
| :--- | :--- |
| «The Phoenix Project» | Мотивация, до всего — читается как роман |
| **«Kubernetes Up & Running»** (Hightower) | Этап 2 |
| **Google SRE Book** (бесплатна онлайн) | Этап 4+, must read |
| «Designing Data-Intensive Applications» (Kleppmann) | Этап 4-5, про данные |
| «Terraform: Up & Running» (Brikman) | Этап 3 |
| «Site Reliability Engineering Workbook» | После SRE Book |
| «Linux Kernel Development» (Love) — выборочно | Глубина, этап 5 |

### Бесплатные курсы и ресурсы

- **KodeKloud Playground** — бесплатные k8s-лаборатории в браузере
- **MIT Missing Semester** — как пользоваться инструментами (shell, git, vim)
- **killercoda.com** — интерактивные сценарии K8s/Linux
- **iximiuz Labs** — контейнеры и сеть изнутри (есть free tier)
- **roadmap.sh/devops** — визуальная карта тем (дополняйте этим handbook'ом)
- Официальные доки: kubernetes.io/docs (лучший источник по K8s)

### YouTube / Подкасты

- TechWorld with Nana — база DevOps на пальцах
- KodeKloud — глубже по K8s/CKA
- CNCF YouTube — записи KubeCon
- RU: Southbridge (слак + ютуб), Slurm (Ozon), «Доклады HighLoad++»
- Подкасты: «Подкаст Ламповый DevOps», AB Testing (UK), Ship It!

### Сообщества (задавать вопросы!)

- Kubernetes Slack (#kubernetes-users), CNCF Slack
- Telegram: «DevOps chats», чаты Southbridge/Slurm
- Stack Overflow + Reddit r/devops

---

## 🎓 Сертификаты: когда и какие

| Сертификат | Когда сдавать | Цена | Комментарий |
| :--- | :--- | :--- | :--- |
| **CKA** | После этапа 2 | $445 | Самая ценная для входа, практический экзамен |
| CKAD | Опционально вместе с CKA | $445 | Для developer-уклона, проще CKA |
| **Terraform Associate** | После этапа 3 | $70.5 | Дешево и сердито, теория |
| CKS | Через 6+ мес работы с K8s | $445 | Безопасность, требует CKA |
| AWS SAA / AZ-104 | Если целитесь в облака | $150 | Регионозависимо |

⚠️ Сертификат ≠ знание. HR любит, техлид проверяет руками. CKA даёт структуру подготовки — вот её ценность.

---

## 🧭 Что делать прямо сейчас (первая неделя)

1. [ ] Установить VirtualBox/WSL2 + Ubuntu 24.04
2. [ ] Пройти [Lab 01](../16-guided-labs/01-lab-linux-systemd-namespaces.md)
3. [ ] Завести GitHub, создать репозиторий `devops-journey` — туда коммитить все конфиги из лаб (портфолио начинается сегодня!)
4. [ ] Написать первый README к нему: что изучаете, что сделали
5. [ ] Подписаться на 2 сообщества из списка выше
6. [ ] Забронировать в календаре 1ч ежедневно — регулярность важнее марафонов

!!! success "Манифест"
    Не бывает «выучил DevOps». Бывает «настроил, сломал, починил, задокументировал». Каждый день оставляйте за собой артефакт: репозиторий, статью, скриншот работающего кластера.

---

## ✅ Проверь себя

**В1. Как понять, что пора двигаться к следующему этапу роадмапа, а не залипать в текущем?**
<details><summary>Ответ</summary>
Критерии выхода этапа выполнены без подглядывания: можешь объяснить тему вслух и решить практическую задачу из раздела за целевое время. Залипание — признак перфекционизма: база закрывается практикой следующего этапа, а не бесконечным перечитыванием.
</details>

**В2. Почему практика важнее просмотра курсов на этом пути?**
<details><summary>Ответ</summary>
DevOps-навык — моторный: команды набираются руками. Правило 50/50: половина времени — теория, половина — терминал. Каждый блок теории обязан заканчиваться Hands-on Lab или задачей; курс без практики создаёт иллюзию знаний, которая рассыпается на собеседовании.
</details>

**В3. Что делать, если застрял на ошибке больше часа?**
<details><summary>Ответ</summary>
(1) Сформулировать вопрос письменно — часто ответ находится при формулировке; (2) поискать точный текст ошибки; (3) откатиться к последнему работающему состоянию и пройти заново шагами; (4) спросить (чат/форум) с минимальным воспроизводимым примером. Застревание >2 часов на дне — нормальный сигнал сменить подход, не силу воли.
</details>

**В4. Как измерять прогресс обучения, чтобы он не превращался в «прочитал много страниц»?**
<details><summary>Ответ</summary>
Артефактами: работающий homelab, репозиторий с проектами, закрытые чек-листы этапов, результаты тренажёра (>90% «знаю» по пройденным темам), решённые задачи раздела 15 с таймером. Страницы прочитаны ≠ навык; артефакты проверяемы работодателем и тобой самим.
</details>
