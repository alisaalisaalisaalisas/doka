# 🤖 MLOps: план раздела

> Раздел «23. MLOps» — введение в эксплуатацию ML-систем для DevOps/SRE-инженеров. Формат страниц — тот же, что в Senior Stack: Теория → Конфигурация → Troubleshooting → Интеграция → 5 вопросов → 3 практики.

## Что уже сделано (Часть 1 — база)

| # | Страница | Покрывает | Статус |
| :--- | :--- | :--- | :--- |
| 23.1 | [Введение и жизненный цикл ML](01-intro-lifecycle.md) | Отличие MLOps от DevOps, уровни зрелости 0-2, роли, структура ML-репозитория, воспроизводимость | ✅ |
| 23.2 | [Experiment Tracking: MLflow](02-mlflow-tracking.md) | Tracking Server, runs/params/metrics/artifacts, Model Registry (staging→production), MinIO как artifact store | ✅ |
| 23.3 | [Данные и пайплайны: DVC, Airflow/Kubeflow](03-data-pipelines.md) | Версионирование данных (DVC), пайплайны подготовки, оркестрация обучения, data validation | ✅ |
| 23.4 | [Сервинг и мониторинг моделей](04-serving-monitoring.md) | Batch vs real-time, FastAPI-обёртка, MLflow serve, KServe, data/concept drift, Evidently | ✅ |

## Roadmap Части 2 (что добавлять дальше)

- [ ] **Feature Store**: Feast (online/offline консистентность, feature retrieval) — отдельная страница
- [ ] **GPU-инфраструктура на K8s**: device plugin, time-slicing, очередь задач (Kueue), тарификация
- [ ] **Kubeflow Pipelines deep dive**: компоненты-контейнеры, артефакты шагов, кэширование
- [ ] **LLMOps**: RAG-пайплайны, векторные БД (pgvector/Qdrant), оценка качества (Ragas), промпт-версионирование, токен-бюджеты
- [ ] **Model Governance**: lineage, audit, A/B и shadow-деплой, rollback моделей
- [ ] **Песочница**: 5-10 MLOps-сценариев (mlflow run/registry, dvc push, drift-отчёт) в playground

## Как это связано с остальным handbook'ом

- **Реестр артефактов и бакеты** — [MinIO](../20-senior-stack/08-storage-s3-etcd-longhorn.md) (20.8): artifact store для MLflow, DVC-remote, бэкапы датасетов
- **CI/CD** — [разд. 05](../05-gitops-and-cicd/01-gitops-argocd-flux.md): пайплайн обучения = обычный pipeline, деплой модели = GitOps
- **Мониторинг** — [разд. 09](../09-observability/01-prometheus-and-grafana.md): метрики сервиса модели, алерты на drift
- **Секреты** — [20.3](../20-senior-stack/03-secrets-runtime-security.md): креды S3/БД для MLflow через ESO
- **Kubernetes** — [разд. 04](../04-kubernetes/01-k8s-architecture-and-workloads.md): GPU-ноды, KServe, квоты

!!! tip "Кому этот раздел"
    DevOps/SRE, к которым приходит «нам надо задеплоить модель». Цель — говорить с DS на одном языке и строить платформу, а не писать модели.
