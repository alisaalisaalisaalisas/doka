# 🏁 20.S Senior Stack, Часть 1 — сводная проверка

> Кросс-тематические вопросы и задачи по подтемам: [20.1 Policy as Code](01-policy-as-code.md) · [20.2 Observability at Scale](02-observability-at-scale.md) · [20.3 Секреты/Runtime](03-secrets-runtime-security.md) · [20.4 Тестирование инфры](04-infra-testing.md) · [20.5 Реестры и зависимости](05-registries-dependencies.md). Здесь только материал «на стыках» — внутри подтем свои 5 вопросов и 3 задания.

**Оглавление:** [3.1 Сводные вопросы](#31--40-сводных-вопросов) · [3.2 Сводные задачи](#32--10-сводных-практических-задач) · [Что изучить дальше](#-что-изучить-дальше) · [План Части 2-3](#план-части-2-3)

---

## 3.1 — 40 сводных вопросов

### Да/нет + почему (1-10)

**1. Можно ли доверять кластеру, в котором Kyverno работает с `failurePolicy: Ignore` и `validationFailureAction: Audit`, называть это «политиками в проде»?**

<details><summary>Ответ</summary>
Нет: Ignore = fail-open (webhook упал — проверки нет), Audit = не блокирует. Это режим наблюдения; продом считается Fail + Enforce после периода измерения нарушений.
</details>

**2. Верно ли, что Thanos заменяет Prometheus?**

<details><summary>Ответ</summary>
Нет: Thanos — надстройка над Prometheus (sidecar выгружает его TSDB-блоки). Скрейпинг и локальные алерты остаются на Prometheus; Thanos добавляет глобальный view и долгое хранение. Заменой является VictoriaMetrics+vmagent.
</details>

**3. Достаточно ли ESO для секретов, если в компании нет Vault?**

<details><summary>Ответ</summary>
ESO поддерживает много провайдеров (AWS SM, GCP SM, Azure KV, даже Kubernetes-секреты) — Vault не обязателен. Но если внешнего стора нет вообще, ESO не решает задачу — тогда Sealed Secrets/SOPS.
</details>

**4. Является ли зелёный k6-smoke в CI доказательством готовности к нагрузке?**

<details><summary>Ответ</summary>
Нет: smoke (1 VU, 30s) проверяет только живость и базовую латентность. Профиль нагрузки, узкие места и деградация под плато — это отдельный load-тест с ramp/plateau.
</details>

**5. Безопасно ли хранить robot-токен Harbor в переменной CI, если CI приватный?**

<details><summary>Ответ</summary>
Нежелательно: токены утекают через логи/fork-PR'ы/компрометацию runner'а, а expiry наступает «внезапно». Правильно — Vault/ESO с ротацией и pull-only токены для кластера.
</details>

**6. Гарантирует ли tail sampling, что ни одна ошибка не потеряется?**

<details><summary>Ответ</summary>
Почти: статус ERROR ловится политикой, но ошибки, не помеченные в span status (только в логах), и трейсы, оборванные рестартом коллектора, теряются. Плюс decision_wait короче длительности трейса = ложные решения.
</details>

**7. Можно ли использовать один и тот же ClusterIssuer Let's Encrypt для внутренних сертов mTLS?**

<details><summary>Ответ</summary>
Технически да, но неправильно: LE — публичный CA с rate-limit'ами и только домены из публичного DNS. Для внутренних mTLS — свой CA (Vault PKI/cert-manager CA issuer) в приватном trust-store.
</details>

**8. Достаточно ли Molecule для проверки роли на реальном проде?**

<details><summary>Ответ</summary>
Нет: Molecule гоняет роль в контейнере — системные сервисы, systemd-юниты, ядро и сеть прод-подобны лишь частично. Это уровень «роль синтаксически и логически верна»; прод-валидация — на staging или Terratest-подобные прогон на VM.
</details>

**9. Обязательно ли Harbor для GitOps-кластера?**

<details><summary>Ответ</summary>
Нет: можно работать с GHCR/ECR/GAR. Harbor нужен, когда требуется свой контроль (скан/подписи/репликация/air-gap) или мультиоблачная нейтральность.
</details>

**10. Верно ли, что background scan Kyverno блокирует нарушающие поды?**

<details><summary>Ответ</summary>
Нет: scan только фиксирует violations в policyreports. Блокирует только admission (Enforce). Scan — аудит существующего, admission — превенция нового.
</details>

### Открытые вопросы «как это работает между подтемами» (11-20)

**11. Опишите полный путь образа от коммита до запуска пода с учётом всех пяти подтем.**

<details><summary>Ответ</summary>
CI собирает и пушит в Harbor с digest-тегом (20.5) → Renovate/ArgoCD обновляют манифест в Git (20.5/GitOps) → ArgoCD синкает → Kyverno на admission проверяет registry-allowlist и cosign-подпись (20.1) → ESO кладёт robot-токен в imagePullSecrets (20.3) → kubelet тянет образ → Falco наблюдает рантайм (20.3) → метрики/трейсы уходят в Thanos/Tempo (20.2) → k6-smoke после деплоя подтверждает живость (20.4).
</details>

**12. Как связаны ESO и GitOps-принцип «Git — источник правды»?**

<details><summary>Ответ</summary>
В Git лежат декларации ExternalSecret (что откуда брать), а не значения. Источник значений — внешний стор; ESO делает кластер конвергентным к Git+Vault. Это разрешает конфликт «секреты нельзя в Git» и «всё должно быть в Git».
</details>

**13. Где в конвейере поставки место conftest (OPA в CI), а где Kyverno, и почему нужны оба?**

<details><summary>Ответ</summary>
Conftest — в MR: дешёвая обратная связь до мерджа, можно обойти. Kyverno — на admission: последний рубеж, обойти нельзя. Дублирование политик — сознательное (defense in depth), генерируются из одного источника.
</details>

**14. Чем метрики, логи и трейсы дополняют друг друга при разборе инцидента (пример последовательности)?**

<details><summary>Ответ</summary>
Метрики (Thanos) показывают ЧТО сломалось и когда (burn rate) → exemplar/трейс (Tempo) показывает ГДЕ в цепочке вызовов → логи (Loki) по trace_id показывают ПОЧЕМУ. Корреляция через trace_id/exemplars — ключ к MTTR.
</details>

**15. Как спроектировать ротацию секретов БД, чтобы приложение не упало?**

<details><summary>Ответ</summary>
Динамические креды Vault с TTL + ESO refreshInterval < TTL; приложение перечитывает секрет на SIGHUP/при новых соединениях; окно двойной валидности (старый+новый пароль) у БД; алерт на «секрет обновлён, но приложение не подхватило».
</details>

**16. Почему Terratest-тесты не гоняют на каждый PR, и что гоняют вместо них?**

<details><summary>Ответ</summary>
Они создают реальные платные ресурсы и идут десятки минут. На PR — static-анализ (validate/tflint/conftest) и plan-ревью; Terratest — nightly/scheduled + на релизные теги, с обязательным defer Destroy и отдельным тестовым аккаунтом.
</details>

**17. Как проверить, что политика Kyverno не сломает существующие деплои при включении?**

<details><summary>Ответ</summary>
Раскатка Audit → просмотр policyreports (сколько и кто нарушает) → исключения для легитимных кейсов → dry-run=server на ключевые манифесты → Enforce. Плюс failurePolicy и exclusion'ы системных namespace.
</details>

**18. Что даст связка Harbor + cosign + Kyverno verifyImages в терминах supply chain?**

<details><summary>Ответ</summary>
Запускаются только образы, подписанные доверенным ключом CI (keyless OIDC или KMS): подделка/подмена тега в registry не запустится. Harbor хранит подписи и скан, Kyverno — точка принуждения, CI — точка подписи.
</details>

**19. Как нагрузочный тест k6 связывается с observability-стеком?**

<details><summary>Ответ</summary>
k6 шлёт свои метрики в Prometheus/Mimir (remote write) → на дашборде рядом с системными метриками; thresholds теста = SLO приложения; во время теста смотрим p95 в Grafana + exemplars → трейсы узких мест.
</details>

**20. Опишите схему «два кластера + один Thanos» и роль externalLabels.**

<details><summary>Ответ</summary>
Каждый Prometheus: unique externalLabels.cluster, одинаковый replica-лейбл; sidecar'ы пишут блоки в общий бакет; Thanos Query читает все StoreAPI, дедуплицирует по replicaLabels; Compactor — один на бакет. externalLabels — единственный способ отличить кластеры и корректно дедуплицировать HA-пары.
</details>

### Сценарии «что будет, если...» (21-30)

**21. ...выключить Thanos Compactor на месяц (бакет продолжает наполняться)?**

<details><summary>Ответ</summary>
Данные не потеряются (sidecar пишет), но: нет даунсэмпла → запросы за длинные периоды будут медленными и дорогими; нет дедупа HA-пар в блоках; накопится очередь компакций, первый запуск будет долгим. Store Gateway начнёт OOM на индексах сырых блоков.
</details>

**22. ...установить Kyverno с политикой «обязателен label team» и забыть исключить kube-system?**

<details><summary>Ответ</summary>
Обновления системных компонентов (CNI, CoreDNS, metrics-server) начнут отклоняться: их манифесты не содержат label team. При failurePolicy Fail и недоступности Kyverno — вообще полный стоп изменений. Кластер деградирует при ближайшем апгрейде.
</details>

**23. ...в OTel Collector поставить `batch` первым процессором в traces-пайплайне?**

<details><summary>Ответ</summary>
Трейсы будут нарезаться на батчи до tail_sampling: решения принимаются по кускам трейсов, часть спанов одного трейса попадёт под разные решения — потеря целостности, «рваные» трейсы в Tempo.
</details>

**24. ...секрет в Vault обновили, а ExternalSecret не тронули?**

<details><summary>Ответ</summary>
Ничего не произойдёт мгновенно: ESO перечитает стор по refreshInterval (например, час) и обновит K8s Secret. Приложения, читающие секрет только при старте, подхватят новое значение после рестарта — нужен механизм reload (reloader/hot-reload).
</details>

**25. ...Falco-правило с `condition: open_read` без фильтра по процессу включить на кластере с 500 нод?**

<details><summary>Ответ</summary>
Шторм событий (каждое чтение файла — событие): CPU нод уйдёт в syscall-обработку, алерт-каналы захлебнутся, полезный сигнал утонет. Правила сужают по proc.name/fd.name/namespace, а шумные — в NOTICE с отдельным каналом.
</details>

**26. ...удалить Harbor-проект `shop`, из которого работают поды?**

<details><summary>Ответ</summary>
Запущенные поды продолжат работать (образы уже локально). Но: рестарты/новые ноды → ImagePullBackOff; retention/rollback по образам невозможен. Классика «работает, пока не тронешь» — поэтому образы релизов пинуются и хранятся отдельно.
</details>

**27. ...в k6-скрипте убрать `tags: {name: api}` с запросов, а threshold оставить на `http_req_duration{name:api}`?**

<details><summary>Ответ</summary>
Threshold не получит ни одной точки данных и, в зависимости от версии k6, тест либо упадёт с ошибкой «no data», либо threshold молча не проверится — гейт перестанет работать. Теги должны совпадать с теми, что в thresholds.
</details>

**28. ...Renovate обновил Helm chart с major-версией (breaking changes values)?**

<details><summary>Ответ</summary>
Если major не исключён из automerge — PR смержится автоматически, деплой упадёт (неизвестные fields в values). Поэтому major: automerge=false + release notes в PR + отдельный label; для критичных чартов — matchFileNames и ручной апгрейд.
</details>

**29. ...два Thanos Compactor'а запустить на один бакет с разными retention-настройками?**

<details><summary>Ответ</summary>
Гонка за блоки: повреждение/удаление блоков, ошибки `block already compacted`, потенциальная потеря данных. Compactor — single-writer; HA решается через --wait и leader-election, а не двумя активными инстансами.
</details>

**30. ...в Terratest забыть `defer terraform.Destroy`, а тест упал на середине apply?**

<details><summary>Ответ</summary>
Частично созданные ресурсы останутся в тестовом аккаунте (утечка денег и мусора). Повторный прогон может упасть на конфликте имён. Destroy в defer сразу после Options + периодический аудит «висящих» тестовых ресурсов.
</details>

### Ловушки собеседований (31-40)

**31. «У нас Prometheus с retention 30d — зачем нам Thanos/VM?» — в чём подвопрос?**

<details><summary>Ответ</summary>
Ловушка на понимание, что retention — не единственная причина: глобальный запрос по кластерам/регионам, HA-дедупликация, надёжное хранение (диск ≠ архив), даунсэмплинг для дешёвых годовых графиков. Ответ «нам не надо» валиден только если закрыты все четыре.
</details>

**32. «Kyverno проще — значит хуже для senior-команды?»**

<details><summary>Ответ</summary>
Ловушка на зрелость: простота — фича, а не недостаток. Выбор определяется сложностью политик и экосистемой: Kyverno закрывает 90% K8s-кейсов; Rego нужен для контекстных политик с внешними данными и вне K8s (Envoy, Terraform). Плохо — выбирать по хайпу, а не по кейсам.
</details>

**33. «Поставим Falco — и контейнеры будут в безопасности?»**

<details><summary>Ответ</summary>
Нет: Falco — детект, не превенция; он скажет, что уже взломали. Без базовой гигиены (nonroot, readOnlyRootFS, seccomp, подписи образов) это сигнализация в горящем доме. Senior должен назвать слои: превенция (admission) → детект (Falco) → ответ (Talon/SOAR).
</details>

**34. «Automerge в Renovate опасен?»**

<details><summary>Ответ</summary>
Опасен только без инфраструктуры: automerge безопасен, когда есть зелёные тесты как required checks, группировка patch/minor и исключённый major. Ручное ревью каждой patch-зависимости — не контроль, а утомление (alert fatigue ревьюеров).
</details>

**35. «Tail sampling 100% ошибок — и мы видим все проблемы пользователей?»**

<details><summary>Ответ</summary>
Ловушка: ошибки видны только если приложение корректно выставляет span status. HTTP 500 без `status=ERROR` в спане пройдёт мимо политики. Нужна дисциплина инструментации + проверка «ошибочных трейсов в Tempo == 5xx в метриках».
</details>

**36. «Molecule зелёный — роль готова для продакшена?»**

<details><summary>Ответ</summary>
Нет: контейнер ≠ прод (systemd, сеть, ядро, реальные пользователи). Molecule проверяет логику и идемпотентность; прод-готовность — это ещё staging-прогон, --check --diff на реальных хостах и canary-батчи.
</details>

**37. « Harbor отсканировал образ — можно деплоить?»**

<details><summary>Ответ</summary>
Ловушка: скан — это снимок CVE-базы на момент скана и список «найдено», а не «безопасно». Нужна политика: severity-порог, исключения с TTL и обоснованием, повторный скан перед деплоем, подпись проверенного дайджеста.
</details>

**38. «ESO упал — приложения потеряют секреты?»**

<details><summary>Ответ</summary>
Нет: секреты уже в кластере как обычные Secret'ы, ESO нужен только для обновлений (fail-closed только для новых/ротаций). Но новые ExternalSecret не синкнутся — это деградация, а не авария. Мониторить `SecretSynced=false`.
</details>

**39. «Cert-manager сам продлит серт — можно забыть о TLS?»**

<details><summary>Ответ</summary>
Почти: он продлевает при работающем admission, валидном ACME-аккаунте, доступном DNS/HTTP challenge и не-протухшем secret'е аккаунта. Нужен внешний мониторинг expiry (blackbox/uptime) — «мониторинг монитора», иначе узнаете от пользователей.
</details>

**40. «У нас есть unit-тесты Terraform (conftest) — интеграционные Terratest не нужны?»**

<details><summary>Ответ</summary>
Ловушка: static-тесты проверяют код, не эффект. Conftest не увидит, что bucket реально приватный, а versioning включился. Для критичных модулей интеграционный тест — единственное доказательство работоспособности; вопрос лишь в частоте прогона.
</details>

---

## 3.2 — 10 сводных практических задач

### Задача 1 (инцидент): «После установки Kyverno деплои зависают»

**Условие:** установили Kyverno с политиками; через день `kubectl apply` любых Deployment'ов висит ~10 секунд и падает `context deadline exceeded`. Поды Kyverno — CrashLoopBackOff (OOM).

**Quest диагностики:**

```bash
# Шаг 1: кто в цепочке admission? → смотрим webhook'и и failurePolicy
kubectl get validatingwebhookconfigurations,mutatingwebhookconfigurations
#   kyverno-resource-validating-webhook-cfg   failurePolicy=Fail   ← вот кандидат
# Шаг 2: жив ли обработчик?
kubectl -n kyverno get pods
#   kyverno-admission-0 ... STATUS: CrashLoopBackOff (Last State: OOMKilled)
# Шаг 3: подтверждение причины отклонения
kubectl apply -f deploy.yaml -v=8 2>&1 | grep -i webhook
#   "failed calling webhook ... context deadline exceeded"
```

**Решение:** срочно — `kubectl delete validatingwebhookconfiguration kyverno-resource-validating-webhook-cfg` (кластер разблокирован) → увеличить память Kyverno и лимит concurrent webhooks → вернуть webhook.

**Проверь себя:** `kubectl apply -f deploy.yaml` проходит; `kubectl -n kyverno top pod` — память < 80% limit.

**Разбор:** классика fail-closed: Fail + мёртвый webhook = стоп всех изменений. Аварийный рычаг дежурного — удаление webhook-конфигурации; системное — ресурсы контроллера и `webhooks.timeoutSeconds`/параллелизм.

---

### Задача 2 (инцидент): «Grafana показывает двойные линии после включения HA Prometheus»

**Условие:** добавили вторую реплику Prometheus + Thanos. На всех графиках — две «пилы» значений; алерты стали срабатывать дважды.

**Quest:**

```bash
# Шаг 1: какие лейблы у серий up?
curl -s 'http://thanos-query:9090/api/v1/series?match[]=up' | jq '.[0].metric'
#   {"cluster":"eu-1","instance":"...","prometheus":"prom-kps","replica":"prometheus-kps-0"} ← replica есть
# Шаг 2: настроена ли дедупликация?
kubectl -n monitoring get deploy thanos-query -o yaml | grep replicaLabels
#   (пусто) ← Query не выкидывает реплики
# Шаг 3: а externalLabels вообще проставлены?
kubectl -n monitoring get prometheus kps -o jsonpath='{.spec.externalLabels}'
#   {"cluster":"eu-1"}  replica добавляется оператором автоматически
```

**Решение:** `thanosQuery.replicaLabels: ["prometheus_replica"]` (helm) + рестарт Query; в Compactor — тот же `--deduplication.replica-label`.

**Проверь себя:** `sum(up)` — одна серия на инстанс; алерты не дублируются (`ALERTS{alertname="X"}` по одной).

**Разбор:** HA-Prometheus по определению даёт разные сэмплы; дедуп — обязанность слоя чтения (Query) и слоя хранения (Compactor), и лейбл реплики должен совпадать в обоих.

---

### Задача 3 (конфиг): Комплексная Kyverno-политика «production-ready pod»

**Требуется:** в namespace с лейблом `tier=production`: только registry.corp, тег ≠ latest, probes обязательны, resources обязательны, runAsNonRoot, и автогенерация для Deployment.

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata: { name: prod-pod-standards }
spec:
  validationFailureAction: Enforce
  background: true
  rules:
    - name: registry-and-tag
      match: { any: [{ resources: { kinds: [Pod], namespaceSelector:
                { matchLabels: { tier: production } } } }] }
      validate:
        message: "registry.corp/*, без latest"
        pattern:
          spec:
            containers:
              - image: "registry.corp/*:!latest*"
    - name: probes-and-resources
      match: { any: [{ resources: { kinds: [Pod], namespaceSelector:
                { matchLabels: { tier: production } } } }] }
      validate:
        message: "readiness+liveness+resources обязательны"
        pattern:
          spec:
            containers:
              - readinessProbe: "?*"
                livenessProbe: "?*"
                resources:
                  requests: { cpu: "?*", memory: "?*" }
                  limits: { memory: "?*" }
    - name: non-root
      match: { any: [{ resources: { kinds: [Pod], namespaceSelector:
                { matchLabels: { tier: production } } } }] }
      validate:
        pattern:
          spec:
            =(securityContext):
              =(runAsNonRoot): true
            containers:
              - =(securityContext):
                  =(runAsNonRoot): true
```

**Проверь себя:** `kubectl apply --dry-run=server` валидного пода — ok; пода с `image: nginx:latest` — отказ с сообщением политики; `kubectl get policyreports -n <ns>` после включения background.

**Разбор:** `=(field)` — опциональные поля в Kyverno-паттернах (проверяются только если заданы); namespaceSelector вместо перечисления; autogen (по умолчанию) распространит правила на шаблоны контроллеров.

---

### Задача 4 (конфиг): Gatekeeper-политика с параметрами

**Требуется:** ConstraintTemplate `K8sAllowedRepos` с параметром `repos: []string`; violation, если образ не начинается ни с одного из разрешённых префиксов; Constraint для `registry.corp` и `harbor.corp.io`, dryrun-режим.

```yaml
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata: { name: k8sallowedrepos }
spec:
  crd:
    spec:
      names: { kind: K8sAllowedRepos }
      validation:
        openAPIV3Schema:
          type: object
          properties:
            repos: { type: array, items: { type: string } }
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8sallowedrepos
        violation[{"msg": msg}] {
          c := input.review.object.spec.containers[_]
          allowed := {prefix | prefix := input.parameters.repos[_]}
          not startswith_any(c.image, allowed)
          msg := sprintf("образ %v вне allowlist", [c.image])
        }
        startswith_any(img, prefixes) {
          startswith(img, prefixes[_])
        }
---
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sAllowedRepos
metadata: { name: prod-repos }
spec:
  enforcementAction: dryrun
  match: { kinds: [{ apiGroups: [""], kinds: ["Pod"] }] }
  parameters: { repos: ["registry.corp/", "harbor.corp.io/"] }
```

**Проверь себя:** `kubectl get k8sallowedrepos prod-repos -o yaml | yq '.status.violations'` — список существующих нарушителей (dryrun не блокирует); под с `image: nginx` → в violations.

**Разбор:** set-comprehension + вспомогательное правило — идиоматичный Rego для «any-of»; параметры живут в Constraint, логика — в Template (переиспользование без копипасты).

---

### Задача 5 (конфиг): OTel-конфиг с корректным порядком и обогащением

**Требование:** принять OTLP, добавить k8s-метаданные, сэмплировать (ошибки+медленные всегда, 5% база), батчами по 5с, экспорт в Tempo; память коллектора ограничить.

```yaml
processors:
  memory_limiter: { check_interval: 1s, limit_percentage: 75, spike_limit_percentage: 20 }
  k8sattributes: { extract: { metadata: [k8s.pod.name, k8s.namespace.name] } }
  tail_sampling:
    decision_wait: 15s
    num_traces: 100000
    expected_new_traces_per_sec: 2000
    policies:
      - { name: err, type: status_code, status_code: { status_codes: [ERROR] } }
      - { name: slow, type: latency, latency: { threshold_ms: 800 } }
      - { name: base, type: probabilistic, probabilistic: { sampling_percentage: 5 } }
  batch: { timeout: 5s, send_batch_size: 512 }
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, k8sattributes, tail_sampling, batch]
      exporters: [otlp/tempo]
```

**Проверь себя:** `curl localhost:8888/metrics | grep -E 'otelcol_processor_(tail_sampling|memory_limiter)'` — счётчики живут, dropped_traces растёт только за счёт base-политики; в Tempo есть error-трейсы.

**Разбор:** memory_limiter первым (защита самого коллектора), k8sattributes до tail_sampling (атрибуты для политик/поиска), batch последним (целостность трейсов при отправке). `decision_wait` > p99 длительности трейсов.

---

### Задача 6 (конфиг): ESO-цепочка для приложения с двумя секретами и шаблоном

**Требование:** из Vault `prod/web` (ключи `DB_USER`, `DB_PASS`) и `prod/s3` (`AWS_KEY`, `AWS_SECRET`) собрать Secret `web-creds`, где s3-ключи переименованы в `access_key`/`secret_key`, и добавить аннотацию-версию.

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata: { name: web-creds, namespace: prod }
spec:
  refreshInterval: 30m
  secretStoreRef: { kind: ClusterSecretStore, name: vault }
  target:
    name: web-creds
    template:
      metadata:
        annotations: { vault.synced-at: "{{ .remoteVersions.prod/s3 }}" }
      data:
        DB_USER: "{{ .dbUser }}"
        DB_PASS: "{{ .dbPass }}"
        access_key: "{{ .awsKey }}"
        secret_key: "{{ .awsSecret }}"
  data:
    - { secretKey: dbUser, remoteRef: { key: prod/web, property: DB_USER } }
    - { secretKey: dbPass, remoteRef: { key: prod/web, property: DB_PASS } }
    - { secretKey: awsKey, remoteRef: { key: prod/s3, property: AWS_KEY } }
    - { secretKey: awsSecret, remoteRef: { key: prod/s3, property: AWS_SECRET } }
```

**Проверь себя:** `kubectl get secret web-creds -o jsonpath='{.data.access_key}' | base64 -d` — значение из `prod/s3`; смена в Vault + `force-sync`-аннотация → значение меняется.

**Разбор:** `template.data` переименовывает и комбинирует; `remoteVersions` — трассировка версий источников (удобно в алертах). Два источника в одном ExternalSecret — норма.

---

### Задача 7 (конфиг): cert-manager — wildcard + внутренний CA одновременно

**Требование:** публичный wildcard от LE (dns01) для ingress и внутренние серты от собственного CA для mTLS между сервисами.

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata: { name: internal-ca }
spec:
  ca:
    secretName: internal-root-ca      # self-signed корень, создан один раз
---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata: { name: public-wildcard, namespace: ingress }
spec: { secretName: wildcard-tls, dnsNames: ["*.prod.company.io"],
        issuerRef: { name: letsencrypt-prod, kind: ClusterIssuer } }
---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata: { name: api-mtls, namespace: prod }
spec:
  secretName: api-mtls-cert
  duration: 2160h
  dnsNames: ["api.prod.svc.cluster.local"]
  issuerRef: { name: internal-ca, kind: ClusterIssuer }
```

**Проверь себя:** два секрета с разными issuer'ами (`openssl x509 -noout -issuer`); внутренний серт валиден для клиентского trust-store с `internal-root-ca`.

**Разбор:** публичный ACME — для внешних доменов; внутренний CA — для service-to-service (не светим внутренние имена публично, нет rate-limit'ов). CA-injector распространит ca.crt в namespace'ы.

---

### Задача 8 (код): Terratest для модуля «VPC с тремя подсетями»

```go
func TestVPCModule(t *testing.T) {
    t.Parallel()
    opts := &terraform.Options{
        TerraformDir: "../modules/vpc",
        Vars: map[string]interface{}{
            "cidr":         "10.99.0.0/16",
            "az_count":     3,
            "environment":  "terratest",
        },
    }
    defer terraform.Destroy(t, opts)
    terraform.InitAndApply(t, opts)

    vpcID := terraform.Output(t, opts, "vpc_id")
    subnetIDs := terraform.OutputList(t, opts, "private_subnet_ids")

    assert.Len(t, subnetIDs, 3)
    // Реальная проверка через AWS API: подсети приватные = нет IGW-маршрута
    routes := aws.GetRouteTableForSubnet(t, "eu-central-1", subnetIDs[0])
    for _, r := range routes.Routes {
        assert.NotEqual(t, "igw-", awsGetGatewayType(r.GatewayId), "приватная подсеть с IGW-маршрутом!")
    }
    _ = vpcID
}
```

**Проверь себя:** `go test -run TestVPCModule -timeout 30m` зелёный; в AWS-консоли после прогона нет VPC с тегом `terratest`.

**Разбор:** проверяем не «что написано в коде», а «что получилось в облаке»; ассерт на отсутствие IGW-маршрута — типичный security-инвариант для приватных подсетей.

---

### Задача 9 (код): k6 — тест «ступени + SLO на теги + автостоп»

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    browse: {
      executor: 'ramping-vus',
      startVUs: 0, stages: [
        { duration: '2m', target: 30 },
        { duration: '5m', target: 30 },
        { duration: '1m', target: 0 },
      ],
      exec: 'browse',
    },
    checkout: {
      executor: 'constant-vus', vus: 5, duration: '8m', exec: 'checkout',
    },
  },
  thresholds: {
    'http_req_duration{name:api}': ['p(95)<600'],
    'http_req_duration{name:checkout}': ['p(95)<1000'],
    'http_req_failed': ['rate<0.01'],
  },
};

export function browse() {
  check(http.get('https://staging.shop.io/api/products', { tags: { name: 'api' } }),
    { '200': (r) => r.status === 200 });
  sleep(1);
}
export function checkout() {
  check(http.post('https://staging.shop.io/api/checkout', '{}',
    { tags: { name: 'checkout' }, headers: { 'Content-Type': 'application/json' } }),
    { '201': (r) => r.status === 201 });
  sleep(2);
}
```

**Проверь себя:** `k6 run load.js` — в конце `THRESHOLDS` блок: все ✓; при деградации checkout → exit 1.

**Разбор:** два сценария в одном прогоне имитируют реальный микс трафика; раздельные thresholds на теги — SLO для каждого пути; `exec` разделяет логику профилей.

---

### Задача 10 (инцидент): «Renovate открыл 60 PR, CI в очереди, прод под угрозой automerge»

**Условие:** онбордингли Renovate без лимитов; 60 PR'ов, patch/minor с automerge; CI-раннеры забиты; среди PR — major `postgres:16→17` в helm values, automerge не выключен. Ночью minor-PR смержился, тесты не поймали несовместимость chart'а, staging сломался.

**Quest разбора:**

```bash
# Шаг 1: остановить поток
#   GitHub: disable Renovate app / GitLab: приостановить schedule пайплайна renovate
# Шаг 2: инвентаризация открытых PR
gh pr list --label renovate --state open --json number,title | jq '.[].title' | sort | head
# Шаг 3: закрыть опасные major
gh pr list --label major-update --state open --json number -q '.[].number' | \
  xargs -I{} gh pr close {} --comment "major требует ручного окна"
# Шаг 4: вернуть контроль конфигом
#   prConcurrentLimit: 5, prHourlyLimit: 2, major: automerge=false (см. 20.5)
# Шаг 5: ретроспектива — почему automerge прошёл мимо тестов?
#   → required checks не были обязательными для веток renovate: починить branch protection
```

**Решение:** конфиг-фикс + branch protection + поэтапное переоткрытие PR'ов (по 5, по приоритету patch → minor).

**Проверь себя:** открытых renovate-PR ≤ 5; попытка смержить PR с красным CI — блокируется платформой.

**Разбор:** Renovate — это процесс, а не плагин: лимиты, разделение major, обязательные checks. Инцидент «automerge сломал staging» почти всегда = branch protection настроен не для всех веток.

---

## 🎓 Что изучить дальше

- **Часть 2 этого курса:** RabbitMQ/NATS, CoreDNS/MetalLB/WireGuard/HAProxy/Envoy, MinIO/etcd deep/Longhorn, Pulumi/Packer/Crossplane, CLI-арсенал (k9s/stern/kubectx/tmux), Jsonnet/Cue, Sentry.
- **Часть 3:** облака deep (AWS/GCP/Azure networking+IAM, Cloudflare Zero Trust), GitLab administration, Rancher/k3s в проде, KVM/Proxmox/VMware.
- **Смежное в handbook'е:** [Vault Deep Dive](../10-security-and-cloud/03-hashicorp-vault-deep-dive.md) (PKI для cert-manager), [Istio](../12-advanced-networking-and-mesh/01-istio-service-mesh.md) (Envoy + tracing propagation), [GitOps](../05-gitops-and-cicd/01-gitops-argocd-flux.md) (куда вписываются ESO/Renovate), [Labs 06-07](../16-guided-labs/06-lab-observability-stack.md) (практика с Prometheus/ArgoCD).
- **Книги/ресурсы:** Google SRE Workbook (глава alerting), OPA docs → Rego policy examples, VictoriaMetrics blog (картдинальность), OpenTelemetry docs (sampling).

## План Части 2-3

Скажите «делай часть 2» — и я продолжу по той же структуре 2.1–2.6 с аудит-таблицей по оставшимся технологиям (брокеры, сеть edge, хранилища, IaC next-gen, CLI, облака).
