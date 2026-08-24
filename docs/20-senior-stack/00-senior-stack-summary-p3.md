# 🏁 20.S3 Senior Stack, Часть 3 — сводная проверка

> Кросс-тематический материал по Части 3: [20.12 Облака](12-clouds.md) · [20.13 GitLab admin](13-gitlab-administration.md) · [20.14 Rancher/k3s](14-rancher-and-k3s.md) · [20.15 Виртуализация](15-virtualization.md) · [20.16 MySQL HA](16-mysql-ha.md). Части 1-2: [сводка 1](00-senior-stack-summary.md) · [сводка 2](00-senior-stack-summary-p2.md).

**Оглавление:** [3.1 Сводные вопросы](#31--40-сводных-вопросов) · [3.2 Сводные задачи](#32--10-сводных-практических-задач) · [Что изучить дальше](#-что-изучить-дальше)

---

## 3.1 — 40 сводных вопросов

### Да/нет + почему (1-10)

**1. Можно ли считать GCP VPC «региональной», как AWS VPC?**

<details><summary>Ответ</summary>
Нет: GCP VPC — глобальный ресурс, подсети региональные, маршруты между регионами работают автоматически. AWS VPC региональна; связность регионов — через peering/TGW.
</details>

**2. Достаточно ли IRSA для доступа пода в S3, если OIDC-провайдер кластера не создан?**

<details><summary>Ответ</summary>
Нет: IRSA работает через обмен OIDC-токена SA на креды роли в STS; без OIDC-провайдера AWS не доверяет токенам кластера — поды получат NoCredentialProviders.
</details>

**3. Безопасно ли восстанавливать GitLab из бэкапа на новую версию?**

<details><summary>Ответ</summary>
Нет: restore поддерживает только ту же версию (и тот же тип БД), что была при бэкапе. Сначала восстановить на старой версии, затем апгрейд по официальному пути.
</details>

**4. Является ли Rancher обязательным компонентом для работы k3s-кластера?**

<details><summary>Ответ</summary>
Нет: k3s полностью самостоятелен. Rancher — management-слой (провижининг, RBAC, fleet); его падение не влияет на workload downstream-кластеров.
</details>

**5. Гарантирует ли semi-sync репликация MySQL отсутствие потери данных при failover?**

<details><summary>Ответ</summary>
Почти, но не гарантированно: при таймауте ack (rpl_semi_sync_source_timeout) primary деградирует в async и продолжает коммитить. Нужен мониторинг статуса semi-sync.
</details>

**6. Верно ли, что LXC-контейнер в Proxmox — это то же самое, что Docker-контейнер?**

<details><summary>Ответ</summary>
Нет: LXC — системный контейнер (полная init-система, общее ядро хоста, как «лёгкая VM»), Docker — процессный с immutable-образами. Разные сценарии: LXC — сервисы уровня ОС, Docker — приложения.
</details>

**7. Можно ли использовать `Seconds_Behind_Source` как SLI для репликации MySQL?**

<details><summary>Ответ</summary>
Не стоит: метрика врёт при простое источника (показывает 0) и зависит от часов. SLI — heartbeat-таблица или сравнение GTID-множеств.
</details>

**8. Достаточно ли `--tls-san` только на первом сервере k3s?**

<details><summary>Ответ</summary>
Нет: SAN должен быть в сертификате apiserver, к которому подключаются клиенты; при HA за LB — имя LB должно быть в SAN на всех серверах, иначе клиенты будут получать x509-ошибки после failover apiserver'а.
</details>

**9. Является ли NAT Gateway AWS точкой отказа egress для AZ, в которой он размещён?**

<details><summary>Ответ</summary>
Да: NAT GW зонален. Если маршрут всех приватных подсетей ведёт к одному NAT GW, падение его AZ ломает egress этих подсетей. Правильно — NAT в каждой AZ + маршруты по зонам.
</details>

**10. Достаточно ли `gitlab-backup create` для полного восстановления GitLab?**

<details><summary>Ответ</summary>
Нет: секреты (/etc/gitlab/gitlab-secrets.json) и конфиг вне бэкапа; без secrets — нерабочие CI-переменные/токены. Плюс restore только на ту же версию.
</details>

### Открытые вопросы «между подтемами» (11-20)

**11. Опишите путь «Terraform → Packer → Proxmox → k3s» для создания ноды кластера.**

<details><summary>Ответ</summary>
Packer собирает шаблон VM (qcow2 с cloud-init, docker/k3s-пакеты) → Terraform (provider proxmox) клонирует шаблон с параметрами (IP, ресурсы, ssh-ключи) → cloud-init настраивает ОС → Ansible/k3s install скрипт поднимает ноду → нода регистрируется в кластере токеном. Всё версионируется в Git.
</details>

**12. Как связаны Cloudflare Tunnel и Zero Trust Access в схеме «внутренний сервис без VPN»?**

<details><summary>Ответ</summary>
Tunnel даёт транспорт: cloudflared держит исходящее соединение к edge, домен указывает на туннель — открытых портов нет. Access добавляет identity-слой: перед приложением CF проверяет SSO-identity и membership в группе. Вместе: приватный сервис, доступный только сотрудникам, без VPN и открытых портов.
</details>

**13. Почему в AWS «поды получают IP из VPC» (VPC CNI) — это и плюс, и минус?**

<details><summary>Ответ</summary>
Плюс: поды — первоклассные жители сети (прямая достижимость, SG на под). Минус: IP-планирование подсетей становится критичным (max-pods, префиксы), риск исчерпания IP, стоимость NAT для исходящего. Требует дизайна сети заранее.
</details>

**14. Сравните восстановление etcd (k3s), etcd (kubeadm) и GitLab — общий паттерн.**

<details><summary>Ответ</summary>
Везде: снапшот/бэкап заранее + репетиция + остановка пишущих компонентов + восстановление данных + проверка целостности. Разница в деталях: k3s — cluster-reset с restore-path; kubeadm — etcdctl snapshot restore с --name/cluster; GitLab — restore + обязательные secrets. Общий враг — «первый раз на живом инциденте».
</details>

**15. Где в стеке MySQL HA место Orchestrator, ProxySQL и приложения?**

<details><summary>Ответ</summary>
Приложение → ProxySQL (единый endpoint: write в hostgroup 10, read в 20) → MySQL-узлы. Orchestrатор наблюдает топологию, при смерти primary выбирает преемника и через хук двигает узлы в hostgroups ProxySQL. Приложение не меняет подключение.
</details>

**16. Как проверить, что Cloudflare действительно проксирует трафик (а не только DNS)?**

<details><summary>Ответ</summary>
Заголовок cf-ray в ответе, IP-адреса ответа — из диапазонов CF (не origin), скрытие origin (direct-запрос к origin IP не отдаёт сайт), в CF-дашборде растут requests. Серое облако = только DNS: cf-ray отсутствует.
</details>

**17. Что произойдёт с fleet-бандлами при недоступности Git в Rancher?**

<details><summary>Ответ</summary>
Уже развёрнутые bundle'ы продолжают работать (desired state применён); новые синки и дрейф-коррекция приостановятся со статусом ошибки в fleet. Кластеры не ломаются — GitOps деградирует до «последнего применённого состояния».
</details>

**18. Почему для k3s edge-кластеров часто отключают traefik и servicelb, и что ставят взамен?**

<details><summary>Ответ</summary>
Встроенные компоненты минимальны: traefik ограничен в прод-фичах (middleware/наблюдаемость), klipper-LB не умеет ARP-анонс во внешнюю сеть как MetalLB. Взамен — ingress-nginx/traefik-прод + MetalLB (20.7), единый стек с остальными кластерами.
</details>

**19. Как связаны Packer-шаблоны и безопасность нод K8s?**

<details><summary>Ответ</summary>
Шаблон = базовый hardened-образ (минимальные пакеты, CIS-настройки, containerd, ключи) — все ноды рождаются одинаковыми и соответствующими политике. Патчи = новый образ + перекат нод, а не ручные правки живых. Immutable-инфра на уровне хостов.
</details>

**20. Опишите роль DNS на каждом слое: Cloudflare → VPC-DNS → CoreDNS → под.**

<details><summary>Ответ</summary>
Cloudflare: публичные имена (edge, proxy). VPC-DNS (Route53/Cloud DNS): приватные зоны — имена VM/LB внутри сети. CoreDNS: cluster.local (сервисы/поды) + forward внешнего. Под: resolv.conf → CoreDNS → forward → VPC-DNS → публичный. Каждый слой кэширует и имеет свою зону ответственности; петли между ними — классика инцидентов.
</details>

### Сценарии «что будет, если...» (21-30)

**21. ...удалить NAT Gateway AWS, не обновив route table приватных подсетей?**

<details><summary>Ответ</summary>
Маршрут 0.0.0.0/0 → nat-xxx станет «blackhole»: приватные подсети потеряют весь egress (образы, apt, внешние API) при живом IGW-интернете у публичных. Классический тихий отказ — алерт на egress-доступность обязателен.
</details>

**22. ...GitLab-раннеру с executor=kubernetes дать ServiceAccount с правами cluster-admin?**

<details><summary>Ответ</summary>
Любой job (и любой, кто может править .gitlab-ci.yml) получает cluster-admin: escape из namespace, чтение секретов кластера. Раннеру — минимальный RBAC в своём namespace; деплой — через GitOps/агента, а не kubectl из job'а.
</details>

**23. ...в k3s-кластере из 3 серверов одновременно перезагрузить два?**

<details><summary>Ответ</summary>
etcd теряет кворум: оставшийся сервер перейдёт в read-only (записи отклоняются). После старта второго кворум вернётся. Если «перезагрузка» затянется и третий тоже умрёт — восстановление из снапшота. Планировать maintenance по одному.
</details>

**24. ...ProxySQL-правило `^SELECT → hostgroup 20` применить без исключения для `SELECT ... FOR UPDATE`?**

<details><summary>Ответ</summary>
Транзакции с блокирующим чтением уйдут на реплику: FOR UPDATE на read-only узле — ошибка (или блокировка не сработает) → битые бизнес-транзакции. Правило FOR UPDATE → writer-hostgroup обязательно и раньше общего SELECT-правила.
</details>

**25. ...Cloudflare Access-политику для админки сменить с «email in team» на «everyone»?**

<details><summary>Ответ</summary>
Админка станет доступна любому, прошедшему любой SSO (включая личные Google-аккаунты). Это не «открыть в интернет», но близко: identity-барьер формальный. Политики Access ревьюить как код (terraform provider) с обязательным review.
</details>

**26. ...Packer-сборка начнёт падать из-за изменения URL ISO у вендора?**

<details><summary>Ответ</summary>
Конвейер образов встанет — и это хорошо: сломанный пайплайн лучше молча устаревшего образа. Чинить: обновить iso_url/checksum в Git (версионируется), прогнать сборку, перекатить ноды. Локальное зеркало ISO снимает зависимость от вендора.
</details>

**27. ...в Proxmox-кластере из 3 нод потерять кворум (2 ноды offline) и попытаться запустить VM?**

<details><summary>Ответ</summary>
Proxmox заблокирует изменения (read-only cluster config) — запуск отклонён, чтобы избежать split-brain. Аварийно: pvecm expected 1 (осознав риск) или восстановить ноду/QDevice. HA-ресурсы не переедут без кворума.
</details>

**28. ...Orchestrator выполнит failover, но хук обновления ProxySQL упадёт?**

<details><summary>Ответ</summary>
Топология MySQL переключилась, а роутинг — нет: записи продолжат идти в мёртвый primary (503/таймауты), новые primary простаивает. Хуки должны быть идемпотентны, с ретраями и алертом на расхождение «Orchestrator toplogy ≠ ProxySQL runtime servers».
</details>

**29. ...в EKS исчерпать IP-адреса подсети (VPC CNI)?**

<details><summary>Ответ</summary>
Новые поды не стартуют (не могут получить IP): PodScheduled/ContainerCreating с ошибкой assign pod IP. Лечение: префикс-делегирование (/28), доп. подсети, переход на другой CNI. Профилактика: мониторинг доступных IP подсетей как SLI.
</details>

**30. ...запустить `gitlab-backup restore` на GitLab более новой версии?**

<details><summary>Ответ</summary>
Restore отклонится (несовместимость версии/схемы БД). Правильно: поднять GitLab той же версии, восстановить, затем апгрейд по официальному пути. Отсюда правило: бэкап-документация фиксирует версию GitLab на момент бэкапа.
</details>

### Ловушки собеседований (31-40)

**31. «У нас всё в одном AZ — зачем нам NAT в каждой зоне?»**

<details><summary>Ответ</summary>
Ловушка на понимание зонности: NAT GW зонален; его смерть = потеря egress всей AZ (обновления, образы, API). Экономия $32/мес против простоя деплоя. Плюс cross-AZ трафик до NAT другой зоны — платный.
</details>

**32. «k3s — это toy, для прода нужен kubeadm». Разберите.**

<details><summary>Ответ</summary>
k3s — CNCF-сертифицированный K8s; «toy» — использование без понимания ограничений (edge-сценарии, SQLite, встроенные компоненты). RKE2/kubeadm выбирают для CIS-hardened enterprise. Вопрос не «toy или нет», а соответствие профилю нагрузки и зрелости команды.
</details>

**33. «Мы включили semi-sync — данные не потеряем никогда». Найдите дыру.**

<details><summary>Ответ</summary>
Дыра — деградация: по таймауту semi-sync отключается и primary коммитит async (доступность важнее RPO по умолчанию). «Никогда» требует мониторинга Rpl_semi_sync_source_status и алерта на переход в async, либо жёсткой политики остановки записи.
</details>

**34. «Cloudflare скрывает наш origin — мы защищены от DDoS на 100%». Где утечка?**

<details><summary>Ответ</summary>
Origin-IP утекает через: старые DNS-записи/сертификаты (censys/shodan сканят по сертам), исходящую почту с сервера, subdomain'ы без прокси, history DNS. Нужен firewall на origin (только CF-IP + origin cert) — иначе атакующий обойдёт CF напрямую.
</details>

**35. «Orchestrator сам всё починит — runbook не нужен». Что не починит автоматика?**

<details><summary>Ответ</summary>
Orchestrator чинит топологию репликации, но не: расхождение данных (нужен checksum/sync), прокси-роутинг без хуков, приложения с закешированными подключениями, потерю semi-sync-гарантий. Runbook описывает проверку консистентности и коммуникацию, а не только failover.
</details>

**36. «VMware дороже — значит Proxmox везде». Что теряете?**

<details><summary>Ответ</summary>
Зрелость enterprise-фич: живая миграция с shared-nothing, DRS-автобалансировка, экосистема бэкапов (Veeam), поддержка вендора для комплаенса. Для SMB/homelab Proxmox честно хватает; для регуляторных сред и огромных ферм — считайте TCO с рисками, а не только лицензию.
</details>

**37. «IRSA — это просто IAM-роль на ноде». В чём принципиальная ошибка?**

<details><summary>Ответ</summary>
IRSA — привязка роли к ServiceAccount через OIDC: разные SA в одном поде-ноде получают разные права; креды краткоживущие и scoped. Роль на ноде (instance profile) = все поды ноды делят одни права — это антипаттерн, который IRSA и призван убрать.
</details>

**38. «Runner в K8s — это просто kubectl apply в job». Почему это архитектурная ошибка?**

<details><summary>Ответ</summary>
CI-система получает kubeconfig кластера = компрометация CI = компрометация кластера. Правильно: pull-based (GitOps-агент/ArgoCD) — CI только коммитит в Git; либо отдельный «deploy»-кластер с минимальным RBAC и OIDC-привязкой.
</details>

**39. «MySQL репликация лагает — добавим ещё реплик». Почему не поможет?**

<details><summary>Ответ</summary>
Каждая реплика применяет binlog своим (одним) SQL-thread'ом — лаг индивидуален и зависит от тяжести транзакций и I/O реплики. Новые реплики лишь добавят источников нагрузки на primary. Лечить: parallel replication, ROW-формат, разбиение тяжёлых транзакций, железо реплик.
</details>

**40. «Cloud-init — это про первый запуск, потом Ansible». Зачем тогда он в шаблонах, если Ansible всё равно гоняем?**

<details><summary>Ответ</summary>
Cloud-init делает VM доступной для Ansible: hostname, сеть/IP, SSH-ключи, пользователь. Без него нет точки входа для конфигурации (bootstrap-проблема). Разделение: cloud-init = bootstrap (один раз), Ansible = конфигурация (повторяемо).
</details>

---

## 3.2 — 10 сводных практических задач

### Задача 1 (инцидент): «После failover MySQL приложение получает read-only ошибки»

**Условие:** Orchestrator переключил primary (replica1 → promoted). Приложение через ProxySQL получает `Error 1290: The MySQL server is running with the --read-only option`. Старый primary вернулся в строй как реплика.

**Стартовое состояние:** ProxySQL hostgroups: 10 = старый primary (мёртв в момент failover), 20 = реплики; хук Orchestrator не сработал (ошибка в скрипте).

```bash
# Шаг 1: что видит ProxySQL прямо сейчас?
mysql -u admin -p -h proxysql -P 6032 \
  -e "SELECT hostgroup_id,hostname,status FROM runtime_mysql_servers"
# Ожидание-диагноз: hostgroup 10 всё ещё указывает на МЁРТВЫЙ primary (OFFLINE_SOFT/HARD),
#   promoted replica1 осталась в hostgroup 20 → записи некуда идти

# Шаг 2: проверить реальную топологию у Orchestrator
orchestrator-client -c topology -i replica1.corp
#   replica1.corp [0s,2s,0s] ← новый primary, под ним старый-primary (переподключился)

# Шаг 3: ручная коррекция hostgroups (быстрый фикс)
mysql -u admin -p -h proxysql -P 6032 <<'EOF'
DELETE FROM mysql_servers WHERE hostgroup_id IN (10,20);
INSERT INTO mysql_servers VALUES (10,'replica1.corp',3306,1,'ENABLED',100,10);
INSERT INTO mysql_servers VALUES (20,'primary.corp',3306,1,'ENABLED',100,10);
INSERT INTO mysql_servers VALUES (20,'replica2.corp',3306,1,'ENABLED',100,10);
LOAD MYSQL SERVERS TO RUNTIME; SAVE MYSQL SERVERS TO DISK;
EOF

# Шаг 4: проверить флаг read_only у нового primary (ProxySQL-механизм)
mysql -h replica1.corp -e "SELECT @@read_only"     # 0 ✅
mysql -h primary.corp  -e "SELECT @@read_only"     # 1 ✅ (стал репликой)

# Шаг 5: чинить хук (root cause) и тестировать failover на стенде
#   PostMasterFailoverProcesses → скрипт с ретраями и логом; прогнать:
orchestrator-client -c graceful-master-takeover -i replica1.corp
mysql -u admin -p -h proxysql -P 6032 -e "SELECT hostgroup_id,hostname FROM runtime_mysql_servers"
#   hostgroup 10 = новый promoted ✅ автоматом
```

**Проверь себя:** приложение пишет успешно (без 1290); `runtime_mysql_servers` отражает топологию Orchestrator; повторный тестовый failover проходит без ручных действий.

**Разбор:** failover-менеджер и прокси — два независимых компонента; их связка (хук) — самое хрупкое место. Идемпотентный хук + сверка «topology vs runtime» как мониторинг = закрытие класса инцидентов.

---

### Задача 2 (инцидент): «k3s-кластер не принимает изменения после ребута двух нод»

**Условие:** кластер 3 сервера; после аварии питания перезагрузились все; два из них стартовали, третий — нет (диск). `kubectl apply` висит/отклоняется.

**Стартовое состояние:** systemd k3s на нодах 1-2 активен, на ноде 3 — нет; journalctl ноды 1: «etcd: lost quorum» или «waiting for etcd to be ready».

```bash
# Шаг 1: подтвердить потерю кворума
k3s kubectl get nodes          # висит / NotReady
journalctl -u k3s | grep -i "quorum\|etcd" | tail -5
#   "etcd cluster is unavailable or misconfigured" ✅

# Шаг 2: поднять третий сервер (диск умер — чистая установка)
#   на новой VM/ноде с тем же hostname и IP:
curl -sfL https://get.k3s.io | sh -s - server \
  --server https://10.0.0.11:6443 --token k3s-drill
#   Если etcd помнит старого члена — может понадобиться:
k3s kubectl -n kube-system delete pod etcd-node3 2>/dev/null || true
#   и удаление мёртвого члена из etcd (на живом сервере):
k3s etcd-snapshot ls | head -3   # снапшоты на месте ✅

# Шаг 3: кворум восстановлен?
journalctl -u k3s | grep -i "elected\|leader" | tail -3
k3s kubectl get --raw=/readyz    # ok ✅

# Шаг 4: тест записи
kubectl create ns post-incident && kubectl get ns post-incident   # создан ✅
```

**Проверь себя:** `kubectl get nodes` — 3 сервера Ready; `kubectl apply` работает; `k3s etcd-snapshot ls` показывает свежие автоснапшоты (расписание живо).

**Разбор:** потеря кворума = read-only кластер, не «сломанный». Восстановление — вернуть член (или добавить новый с чистой установкой), а не cluster-reset (тот нужен только при потере данных всех членов). Порядок старта нод после аварии питания: сначала большинство серверов, потом агенты.

---

### Задача 3 (конфиг): Terraform — приватная сеть AWS с NAT по зонам

**Требование:** VPC, 2 публичные + 2 приватные подсети (2 AZ), IGW, NAT GW в каждой AZ, маршруты; теги.

```hcl
# network.tf
variable "azs" { type = list(string), default = ["eu-central-1a", "eu-central-1b"] }

resource "aws_vpc" "main" { cidr_block = "10.40.0.0/16"
  enable_dns_hostnames = true, enable_dns_support = true
  tags = { Name = "shop-${terraform.workspace}", ManagedBy = "terraform" } }

resource "aws_internet_gateway" "igw" { vpc_id = aws_vpc.main.id }

resource "aws_subnet" "public" {
  count = length(var.azs)
  vpc_id = aws_vpc.main.id
  cidr_block = cidrsubnet(aws_vpc.main.cidr_block, 4, count.index)
  availability_zone = var.azs[count.index]
  map_public_ip_on_launch = true
  tags = { Tier = "public", AZ = var.azs[count.index] }
}

resource "aws_subnet" "private" {
  count = length(var.azs)
  vpc_id = aws_vpc.main.id
  cidr_block = cidrsubnet(aws_vpc.main.cidr_block, 4, count.index + 8)
  availability_zone = var.azs[count.index]
  tags = { Tier = "private", AZ = var.azs[count.index] }
}

resource "aws_nat_gateway" "nat" {
  count = length(var.azs)              # NAT В КАЖДОЙ AZ — отказоустойчивый egress!
  allocation_id = aws_eip.nat[count.index].id
  subnet_id = aws_subnet.public[count.index].id
  depends_on = [aws_internet_gateway.igw]
}
resource "aws_eip" "nat" { count = length(var.azs), domain = "vpc" }

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route { cidr_block = "0.0.0.0/0", gateway_id = aws_internet_gateway.igw.id }
}
resource "aws_route_table_association" "public" {
  count = length(var.azs)
  subnet_id = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}
resource "aws_route_table" "private" {
  count = length(var.azs)              # СВОЯ таблица на AZ — маршрут к «своему» NAT
  vpc_id = aws_vpc.main.id
  route { cidr_block = "0.0.0.0/0", nat_gateway_id = aws_nat_gateway.nat[count.index].id }
}
resource "aws_route_table_association" "private" {
  count = length(var.azs)
  subnet_id = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}
```

**Проверь себя:** `terraform plan` — без сюрпризов; после apply: `aws ec2 describe-route-tables --filters Name=tag:Tier,Values=private` — у каждой приватной подсети маршрут к NAT своей AZ; убейте один NAT (тест в sandbox) — egress второй AZ жив.

**Разбор:** одна NAT-таблица на все приватные подсети = зональный SPOF. `cidrsubnet()` — арифметика CIDR без ручных чисел; workspace — изоляция окружений.

---

### Задача 4 (конфиг): Cloudflare Tunnel через Terraform + Access-политика

**Требование:** туннель для argocd.company.io, доступ только команде devops (email-домен), конфигурация как код.

```hcl
# cloudflare.tf
resource "cloudflare_tunnel" "argocd" {
  account_id = var.cf_account_id
  name       = "argocd"
  secret     = random_password.tunnel_secret.result
}
resource "random_password" "tunnel_secret" { length = 64 }

resource "cloudflare_tunnel_config" "argocd" {
  tunnel_id = cloudflare_tunnel.argocd.id
  config {
    ingress {
      hostname = "argocd.company.io"
      service  = "http://argocd-server.argocd:80"     # сервис в кластере (cloudflared в K8s)
    }
    ingress { service = "http_status:404" }
  }
}
resource "cloudflare_record" "argocd" {
  zone_id = var.cf_zone_id
  name    = "argocd"
  type    = "CNAME"
  value   = "${cloudflare_tunnel.argocd.id}.cfargotunnel.com"
  proxied = true
}

# Zero Trust Access: только devops-команда
resource "cloudflare_access_application" "argocd" {
  zone_id = var.cf_zone_id
  name    = "ArgoCD"
  domain  = "argocd.company.io"
  decision = "allow"
  include { email_domain = ["company.io"] }
}
resource "cloudflare_access_policy" "devops" {
  application_id = cloudflare_access_application.argocd.id
  name = "devops-team", decision = "allow", precedence = 1
  include { email_domain = ["company.io"] }
  require { groups = [var.devops_group_id] }   # группа в IdP
}
```

**Проверь себя:** `curl -sI https://argocd.company.io` → 302 на cloudflareaccess.com (Access работает); логин под @company.io → ArgoCD открывается; личный gmail → отказ. В кластере НЕТ LoadBalancer/открытых портов для argocd.

**Разбор:** вся периферия (DNS, туннель, identity) — код: ревью политик Access как PR. cloudflared может жить DaemonSet'ом в кластере — тогда ingress-сервисы вообще не публикуются через LB.

---

### Задача 5 (код): GitLab CI — динамический child-pipeline для матрицы окружений

**Требование:** job генерирует child-pipeline: деплой в dev→staging→prod с ручным гейтом перед prod.

```yaml
# .gitlab-ci.yml
generate-pipeline:
  stage: build
  image: alpine:3.21
  script:
    - |
      cat > generated.yml <<'EOF'
      stages: [deploy]
      .deploy:
        stage: deploy
        image: alpine/k8s:1.31
        script:
          - kubectl -n shop-$ENV set image deploy/api api=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
          - kubectl -n shop-$ENV rollout status deploy/api --timeout=180s
      deploy:dev:
        extends: .deploy
        environment: { name: dev }
        variables: { ENV: dev }
      deploy:staging:
        extends: .deploy
        needs: [deploy:dev]
        environment: { name: staging }
        variables: { ENV: staging }
      deploy:prod:
        extends: .deploy
        needs: [deploy:staging]
        environment: { name: production }     # protected env = ручной approve
        variables: { ENV: prod }
      EOF
  artifacts:
    paths: [generated.yml]

trigger-deployments:
  stage: deploy
  needs: [generate-pipeline]
  trigger:
    include: [generated.yml]
    strategy: depend
```

**Проверь себя:** в пайплайне появился child-pipeline с 3 job'ами; dev→staging идут автоматически, prod ждёт кнопку (environment protected); при падении rollout staging — prod не стартует (needs).

**Разбор:** dynamic child pipeline — генерация CI самим CI: матрицы окружений без копипасты. `environment: protected` + protected branches = гейт без сторонних инструментов. `strategy: depend` связывает статус родителя.

---

### Задача 6 (код): Proxmox + Terraform — k3s-нода как код

**Требование:** provider proxmox клонирует шаблон (из 20.15) и создаёт VM с cloud-init параметрами.

```hcl
terraform {
  required_providers { proxmox = { source = "bpg/proxmox", version = "~> 0.60" } }
}
provider "proxmox" {
  endpoint = var.pve_endpoint            # https://pve-1:8006
  api_token = var.pve_token              # user@pam!terraform=uuid
  insecure = false
}

resource "proxmox_virtual_environment_vm" "k3s_node" {
  count = 3
  name = "k3s-server-${count.index + 1}"
  node_name = var.pve_nodes[count.index]
  clone { vm_id = 9000, full = true }    # шаблон из 20.15

  cpu { cores = 4 }
  memory { dedicated = 8192 }
  disk { datastore_id = "local-lvm", interface = "scsi0", size = 40, ssd = true }
  network_device { bridge = "vmbr0", model = "virtio" }

  operating_system { type = "l26" }
  initialization {
    datastore_id = "local-lvm"
    dns { domain = "corp.io", servers = ["10.0.0.1"] }
    ip_config {
      ipv4 { address = "10.0.0.1${count.index + 1}/24", gateway = "10.0.0.1" }
    }
    user_account { username = "ubuntu", keys = [trimspace(file("~/.ssh/id_ed25519.pub"))] }
  }
  agent { enabled = true }
}

output "node_ips" { value = proxmox_virtual_environment_vm.k3s_node[*].ipv4_addresses[0][0] }
```

```bash
terraform init && terraform apply
# Ожидание: 3 VM созданы, output node_ips = ["10.0.0.11","10.0.0.12","10.0.0.13"]
# Затем Ansible/k3s-install на эти IP (см. 20.14 Задание 1)
```

**Проверь себя:** `terraform destroy && terraform apply` воспроизводит ноды идентично; в UI Proxmox VM названы k3s-server-N; ssh по ключу работает без пароля.

**Разбор:** VM = код: пересоздание ноды после сбоя — `terraform apply -replace=...`. Шаблон (Packer/ручной) отделён от параметризации (Terraform) — как образ и конфиг в облаках.

---

### Задача 7 (код): MySQL — скрипт проверки консистентности топологии

**Требование:** bash-скрипт: сверяет топологию Orchestrator с hostgroups ProxySQL; расхождение = exit 1 (алерт).

```bash
#!/usr/bin/env bash
# topology-drift-check.sh
set -euo pipefail
OCTL="orchestrator-client"
PXCMD="mysql -u admin -p$PROXYSQL_PASS -h proxysql -P 6032 -N -e"

# 1) Кто primary по Orchestrator
ORCH_MASTER=$($OCTL -c api --path /api/cluster/master -i cluster.corp | jq -r '.Key.Hostname')
echo "orchestrator master: $ORCH_MASTER"

# 2) Кто writer в ProxySQL (hostgroup 10)
PX_WRITER=$($PXCMD "SELECT hostname FROM runtime_mysql_servers WHERE hostgroup_id=10 LIMIT 1")
echo "proxysql writer: $PX_WRITER"

# 3) Сверка
if [ "$ORCH_MASTER" != "$PX_WRITER" ]; then
  echo "DRIFT! orchestrator=$ORCH_MASTER proxysql=$PX_WRITER" >&2
  # Самолечение (опционально, с осторожностью):
  # $PXCMD "DELETE FROM mysql_servers WHERE hostgroup_id=10;
  #         INSERT INTO mysql_servers VALUES (10,'$ORCH_MASTER',3306,1,'ENABLED',100,10);
  #         LOAD MYSQL SERVERS TO RUNTIME;"
  exit 1
fi

# 4) Реплики: все ли узлы топологии присутствуют в reader-hostgroup
for h in $($OCTL -c api --path /api/cluster/replicas -i cluster.corp | jq -r '.[].Key.Hostname'); do
  $PXCMD "SELECT hostname FROM runtime_mysql_servers WHERE hostgroup_id=20 AND hostname='$h'" \
    | grep -q "$h" || { echo "DRIFT: replica $h нет в hostgroup 20" >&2; exit 1; }
done
echo "TOPOLOGY IN SYNC"
```

```bash
chmod +x topology-drift-check.sh && ./topology-drift-check.sh
# Ожидание: TOPOLOGY IN SYNC; после тестового failover без хука — DRIFT! exit 1 → алерт
```

**Проверь себя:** сломайте хук (переименуйте скрипт), сделайте takeover — проверка ловит дрейф за один прогон; после починки хука — IN SYNC.

**Разбор:** инцидент из Задачи 1 превращается в мониторинг: сверка двух источников правды (Orchestrator vs ProxySQL) по расписанию. Exit-код — готовый интегрейшн с Alertmanager/Pushgateway.

---

### Задача 8 (код): Ansible — роль «k3s-server» с идемпотентностью

**Требование:** роль устанавливает k3s-сервер с config.yaml, проверяет готовность; второй прогон — changed=0.

```yaml
# roles/k3s_server/tasks/main.yml
---
- name: Ensure config dir
  ansible.builtin.file:
    path: /etc/rancher/k3s
    state: directory
    mode: "0750"

- name: Deploy k3s config
  ansible.builtin.template:
    src: config.yaml.j2
    dest: /etc/rancher/k3s/config.yaml
    mode: "0600"
  notify: restart k3s

- name: Install k3s (only if binary missing)          # install-скрипт НЕ идемпотентен!
  ansible.builtin.command:
    cmd: curl -sfL https://get.k3s.io | sh -s - server
    creates: /usr/local/bin/k3s                        # creates = идемпотентность

- name: Enable and start
  ansible.builtin.systemd_service:
    name: k3s
    enabled: true
    state: started

- name: Wait for node ready
  ansible.builtin.command: k3s kubectl get node -o json
  register: nodes
  until: (nodes.stdout | from_json).items[0].status.conditions
         | selectattr('type','equalto','Ready') | map(attribute='status') | first == "True"
  retries: 30
  delay: 10
  changed_when: false
```

```yaml
# roles/k3s_server/handlers/main.yml
- name: restart k3s
  ansible.builtin.systemd_service: { name: k3s, state: restarted }
```

```bash
ansible-playbook -i inventory k3s.yml && ansible-playbook -i inventory k3s.yml
# Второй прогон: PLAY RECAP ... changed=0 ✅ (idempotence)
```

**Проверь себя:** второй прогон `changed=0`; изменение config.yaml.j2 → только restart k3s (handler), не переустановка.

**Разбор:** `creates:` превращает curl|sh в идемпотентный шаг; notify/handler — рестарт только при реальном изменении конфига. Это Molecule-тестируемая роль (20.4).

---

### Задача 9 (код): jq — инвентаризация мульти-облака

**Требование:** скрипт собирает VM из AWS и GCP в единую таблицу: cloud,name,private_ip,zone.

```bash
#!/usr/bin/env bash
# multi-cloud-inventory.sh
set -euo pipefail

aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" \
  --query 'Reservations[].Instances[].[InstanceId,PrivateIpAddress,Placement.AvailabilityZone,Tags[?Key==`Name`]|[0].Value]' \
  --output json | jq -r '.[] | select(.[0] != null) |
    {cloud:"aws", id:.[0], ip:.[1], zone:.[2], name:(.[3] // "unnamed")} |

@json' > /tmp/aws.jsonl

gcloud compute instances list --format="json(name,networkInterfaces[0].networkIP,zone)" \
  | jq -r '.[] | {cloud:"gcp", id:.name, ip:."networkInterfaces[0].networkIP",
    zone:(.zone|split("/")|last), name:.name} | @json' > /tmp/gcp.jsonl

cat /tmp/aws.jsonl /tmp/gcp.jsonl | jq -s \
  'sort_by(.cloud, .zone) |
   (["cloud","name","ip","zone"], (.[] | [.cloud,.name,.ip,.zone]))[] |
   @csv' | sed 's/"//g' | column -t -s,
```

```bash
./multi-cloud-inventory.sh
# Ожидание (пример):
# cloud  name          ip          zone
# aws    k3s-server-1  10.40.1.20  eu-central-1a
# gcp    gke-node-x    10.10.0.5   eu-central1-a
```

**Проверь себя:** скрипт не падает при пустом выводе одного из облаков (`jq -s` с пустым файлом — ок); CSV корректно экранирован (имена с запятыми).

**Разбор:** нормализация JSONL из двух CLI в общую схему → единая таблица. Это основа для динамического inventory Ansible и аудита «что где живёт» без CMDB.

---

### Задача 10 (инцидент): «MetalLB Service в Pending после замены коммутатора»

**Условие:** bare-metal кластер, MetalLB layer2. После замены топ-коммутатора Service `ingress-nginx-controller` получил новый EXTERNAL-IP из пула, но снаружи недоступен; изнутри кластера — работает. Старый IP перестал отвечать.

**Quest:**

```bash
# Шаг 1: что MetalLB назначил и анонсирует?
kubectl -n metallb-system logs ds/speaker --since=30m | grep -iE "announce|arp" | tail
#   "announcing IP 192.168.88.201 on eth0" — новый IP анонсируется ✅
kubectl get svc -n ingress-nginx ingress-nginx-controller \
  -o jsonpath='{.status.loadBalancer.ingress}'
#   192.168.88.201 (был .200)

# Шаг 2: отвечает ли новый IP снаружи кластера?
#   (с ноутбука в той же L2):
arping -c3 192.168.88.201
#   Received 1 response ... MAC 00:1c:14:xx  ← отвечает MAC ноды-лидера ✅ ARP работает
curl -m3 -sI http://192.168.88.201 | head -1
#   (пусто/timeout) ← ARP есть, TCP нет?!

# Шаг 3: где рвётся? Трассировка с ноды-лидера:
sudo tcpdump -i eth0 -nn 'host 192.168.88.201 and tcp port 80' -c 10
#   SYN приходит, SYN-ACK уходит — а клиент не получает → асимметрия маршрутизации!
# Диагноз: новый коммутатор настроен с другим native VLAN / ACL между портами —
#   SYN-ACK уходит в другой аплинк с stateless ACL и дропается.

# Шаг 4: обход и фикс
#   Обход (пока чинят сеть): закрепить старый IP за Service
kubectl -n ingress-nginx patch svc ingress-nginx-controller \
  -p '{"spec":{"loadBalancerIP":"192.168.88.200"}}'
#   + убедиться, что .200 снова анонсируется (speaker logs) и доступен.
#   Фикс сети: symmetric routing / вернуть native VLAN на аплинках.
```

**Проверь себя:** `curl -m3 -I http://<IP>` отвечает 200 снаружи; `kubectl get svc` — EXTERNAL-IP стабильный; speaker-логи без ошибок анонса.

**Разбор:** «MetalLB сломался» почти всегда = L2/L3-сеть вокруг: ARP-конфликты, VLAN-асимметрия, ACL. Методика: анонс (логи speaker) → ARP (arping) → TCP (tcpdump на ноде-лидере). Закрепление loadBalancerIP — легитимный обход, но IP должен жить в пуле и быть зарезервирован вне DHCP.

---

## 🎓 Что изучить дальше

- **Глубже по Части 3:** AWS networking pro (Transit GW, PrivateLink), GKE Autopilot в бою, Entra ID + AKS RBAC; GitLab HA (Praefect, Geo); Rancher Continuous Delivery прод-паттерны; Ceph как хранилище Proxmox; Vitess/шардирование MySQL.
- **Смежное в handbook'е:** [Части 1-2 Senior Stack](00-senior-stack-summary.md), [PostgreSQL HA](../11-data-and-storage/04-postgresql-ha-and-patroni.md) (сравнить с MySQL-стеком), [Home Lab](../19-career/01-home-lab-setup.md) (Proxmox+Tunnel вместе), [Labs](../16-guided-labs/01-lab-linux-systemd-namespaces.md).
- **Ресурсы:** official upgrade path GitLab, Rancher docs (Fleet), Orchestrator docs (failover-хуки), AWS Well-Architected (Reliability Pillar), MySQL 8.4 Reference Manual (Replication).
