# 🧮 05. Production Readiness Review: Чек-лист Готовности Сервиса

> Единый артефакт «сервис можно в прод». Заполняется владельцем сервиса, ревьюится платформой/SRE перед первым запуском и после крупных изменений. Копируйте секцию под свой сервис и отмечайте.

**Сервис:** `__________` · **Владелец (команда):** `__________` · **Дата ревью:** `__________` · **Ревьюер:** `__________`

---

## 1. Приложение

- [ ] Контейнер собран по best practices (multi-stage, non-root, distroless/minimal base) — [03.2](../03-docker/02-dockerfile-best-practices.md)
- [ ] Образ подписан (cosign), SBOM прикреплён — [10.4](../10-security-and-cloud/04-supply-chain-security.md)
- [ ] Graceful shutdown: SIGTERM → drain соединений ≤30с, проверен
- [ ] Health-эндпоинты разделены: `/healthz` (liveness — жив ли процесс), `/readyz` (readiness — готов принимать трафик)
- [ ] Конфигурация через env/файлы из секретов, никаких кредов в коде и образе
- [ ] Логи структурированные JSON с request_id/trace_id — [09.2](../09-observability/02-logging-loki-and-tracing.md)

## 2. Kubernetes-манифесты

- [ ] requests заданы реалистично (по данным недели работы, не «на глаз»)
- [ ] limits осознаны; для JVM/Go-приложений учтены runtime-лимиты контейнера
- [ ] HPA настроен с behavior-политиками, min/max обоснованы — [04.8](../04-kubernetes/08-k8s-autoscaling.md)
- [ ] PodDisruptionBudget существует и допускает ≥1 нарушение (drain работает!) — [04.9](../04-kubernetes/09-k8s-cluster-operations.md)
- [ ] priorityClass назначен для критичных сервисов
- [ ] anti-affinity/topologySpread: реплики не на одном узле/AZ
- [ ] NetworkPolicy: вход только от легитимных источников — [18.1](01-containers-and-k8s.md)
- [ ] SecurityContext: runAsNonRoot, readOnlyRootFilesystem, capabilities dropped

## 3. Данные

- [ ] RPO/RTO строка заполнена в DR-матрице — [13.2](../13-disaster-recovery-and-tools/02-database-backups-and-dr-plan.md)
- [ ] Бэкапы БД: WAL/oplog-shipping работает, restore-тест за последние 90 дней
- [ ] Миграции схемы: обратимые или blue-green-совместимые (deploy не ломает предыдущую версию кода)
- [ ] PV: reclaimPolicy и класс хранения осознаны; критичные данные вне emptyDir

## 4. Наблюдаемость

- [ ] Метрики RED/USE экспортируются; golden signals видны на дашборде — [09.6](../09-observability/06-alertmanager-and-dashboards-mastery.md)
- [ ] Дашборд provisioned как код (не только в UI) — [09.8](../09-observability/08-grafana-dashboards-as-code.md)
- [ ] Алерты actionable: burn-rate/error-budget вместо «CPU>90%»; есть runbook-ссылка в каждом алерте
- [ ] Трейсы идут через OTLP, семплирование сохраняет ошибки — [09.7](../09-observability/07-alloy-pipelines-cookbook.md)
- [ ] SLO определён (availability/latency), error budget известен команде

## 5. Эксплуатация

- [ ] Runbook существует: топ-5 отказов с шагами диагностики и починки — шаблон [13.2](../13-disaster-recovery-and-tools/02-database-backups-and-dr-plan.md)
- [ ] Rollback одной командой проверен (<10 минут): GitOps revert / helm rollback
- [ ] Деплой безопасен: rolling с readiness-гейтами, канареечный путь описан — [05.1](../05-gitops-and-cicd/01-gitops-argocd-flux.md)
- [ ] Масштабирование протестировано: нагрузочный тест до пикового ×2 профиля
- [ ] Зависимости задокументированы (вверх/вниз по потоку), их отказоустойчивость оценена

## 6. Безопасность

- [ ] Секреты из Vault/ESO, ротация настроена — [10.3](../10-security-and-cloud/03-hashicorp-vault-deep-dive.md)
- [ ] mTLS/TLS между компонентами где применимо; ingress за TLS с автосертификатами (cert-manager)
- [ ] Сканирование образа в CI без HIGH/CRITICAL (или VEX-обоснование) — [20.4](../20-senior-stack/04-infra-testing.md)

## 7. Стоимость (FinOps)

- [ ] Ресурсы тегированы team/service для cost allocation — [20.19](../20-senior-stack/19-finops.md)
- [ ] Прогноз месячной стоимости известен владельцу; unit economics (₽/1000 запросов) посчитан

---

## Итог ревью

| Критерий | Статус |
| :--- | :--- |
| Все блоки 1–7 закрыты | ⬜ Go · ⬜ Go с условиями · ⬜ No-go |
| Условия Go (если есть) | |
| Дата следующего пересмотра | |

!!! tip "Правило PRR"
    Чек-лист — не бюрократия, а перенос знаний от платформы к команде. Каждый пункт ссылается на страницу handbook'а: не знаете как закрыть — там инструкция. PRR повторяется при смене архитектуры, а не при каждом деплое.
