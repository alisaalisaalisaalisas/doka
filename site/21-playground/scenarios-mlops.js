/* Песочница: MLOps-сценарии (MLflow, DVC, дрейф, GPU/Kueue, LLMOps) */
S("MLOps","ml1","MLflow: пересоздали контейнер — все runs исчезли","Middle",
`<b>Симптом:</b> после пересоздания контейнера MLflow UI пустой — ни экспериментов, ни метрик, ни артефактов.<br>
<b>Цель:</b> найти причину (SQLite + локальный диск в контейнере), перевести на PostgreSQL-бэкенд и S3-артефакты.<br>
<b>Начните с:</b> <code>docker inspect mlflow | grep -i mount</code>`,
"ubuntu@lab:~$",
[
[/^docker inspect mlflow.*mount|docker inspect mlflow$/,`        "Mounts": [
            "Type": "none",
            "Source": "/tmp/mlruns",      # <-- данные живут в /tmp внутри контейнера!
            "Destination": "/mlruns"`,"err"],
[/^docker exec -?i? ?mlflow env|docker exec mlflow env/,`BACKEND_STORE_URI=sqlite:///mlflow.db
ARTIFACT_ROOT=/mlruns                    # <-- всё локальное, ничего не персистентно`,"err"],
[/^docker run .*mlflow/,`Container mlflow-prod  started
  BACKEND_STORE_URI=postgresql://mlflow:***@pg:5432/mlflow
  ARTIFACT_ROOT=s3://mlflow-artifacts/   # MinIO/S3
  --host 0.0.0.0 --port 5000`,"ok"],
[/^curl .*(localhost|127\.0\.0\.1):5000\/health|^curl .*:5000\//,`OK`,"ok"]
],
[{re:/docker inspect/,l:"убедиться, что томов нет — данные в слое контейнера"},
 {re:/env/,l:"посмотреть BACKEND_STORE_URI и ARTIFACT_ROOT"},
 {re:/docker run/,l:"пересоздать с PG-бэкендом и S3-артефактами"},
 {re:/curl/,l:"проверить health"}],
{file:"docker-compose.yml",
 files:{"docker-compose.yml":`services:
  mlflow:
    image: ghcr.io/mlflow/mlflow:v2.14.1
    command: mlflow server --host 0.0.0.0 --port 5000
    environment:
      BACKEND_STORE_URI: sqlite:///mlflow.db   # <-- ошибка: sqlite в контейнере
      ARTIFACT_ROOT: /mlruns                   # <-- ошибка: локальный диск
    ports: ["5000:5000"]`}});

S("MLOps","ml2","MLflow Registry: сервис грузит старую версию модели","Senior",
`<b>Симптом:</b> модель зарегистрировали и перевели в Production через UI, но serving-сервис по-прежнему отдаёт предсказания старой версии.<br>
<b>Цель:</b> понять разницу «версия в Stage» vs «фиксация версии в деплое», настроить пиннинг по алиасу/этапу и перезапустить сервинг.<br>
<b>Начните с:</b> <code>mlflow models describe</code> и переменные окружения сервиса`,
"ubuntu@lab:~$",
[
[/^(mlflow )?models describe|mlflow models serve --help/,`serving service env:
MODEL_NAME=churn
MODEL_VERSION=7          # <-- захардкожена версия 7, а Production уже 9!`,"err"],
[/^mlflow experiments search|mlflow runs list|curl .*api\/2\.0\/mlflow/,`Registered Model 'churn':
  Version 7  → Production → run r3 (accuracy 0.84)
  Version 9  → Staging    → run r5 (accuracy 0.91)   # ← промоушен не докатился до сервиса`,"warn"],
[/^kubectl set env deploy\/model-server MODEL_VERSION=9|kubectl rollout restart deploy/,`deployment.apps/model-server env updated
deployment.apps/model-server restarted`,"ok"],
[/^kubectl rollout status deploy\/model-server/,`Waiting for deployment "model-server" rollout to finish...
successfully rolled out`,"ok"],
[/^curl .*predict|^curl -X POST .*invocations/,`{"prediction": [0,1,1], "model_version": "9"}`,"ok"]
],
[{re:/models describe|MODEL_VERSION/,l:"найти захардкоженную версию в конфиге сервиса"},
 {re:/experiments search|runs list|api/,l:"сверить этапы версий в registry"},
 {re:/set env|rollout restart/,l:"обновить версию и перезапустить"},
 {re:/rollout status/,l:"дождаться раскатки"},
 {re:/curl/,l:"убедиться, что отвечает v9"}]);

S("MLOps","dv1","DVC: коллеги не могут воспроизвести датасет","Middle",
`<b>Симптом:</b> после git pull у коллеги нет данных — каталог data/ пуст, пайплайн падает на первом шаге.<br>
<b>Цель:</b> объяснить роль dvc.yaml + .dvc-файлов, подключить удалённый кэш и восстановить данные.<br>
<b>Начните с:</b> <code>ls data*; cat .gitignore | head</code>`,
"ubuntu@lab:~$",
[
[/^ls( -la)? data/,`data/            # пусто! большие файлы не в git`,"err"],
[/^cat \.gitignore/,`data/
*.csv
.dvc/cache`,"dim"],
[/^cat data\/train\.csv\.dvc|ls \*\.dvc|cat \*\*\.dvc/,`outs:
  - path: data/train.csv
    md5: 8f7a...c31
    size: 214853120`,"ok"],
[/^(dvc )?remote add(-d)? .*(s3|minio)/,`Setting 'storage' as a remote.
# dvc remote add storage s3://ml-data-bucket/dvcstore`,"ok"],
[/^(dvc )?(fetch|pull)/,`Fetching data/train.csv from storage...
1 file fetched: data/train.csv (205 MB)`,"ok"],
[/^(dvc )?repro/,`Running stage 'prepare':
> python src/prepare.py
Running stage 'featurize':
> python src/featurize.py
Data and pipelines are up to date.`,"ok"]
],
[{re:/ls data|gitignore/,l:"понять: данные вне git, но есть .dvc-файлы"},
 {re:/remote add/,l:"подключить удалённый кэш (S3/MinIO)"},
 {re:/pull|fetch/,l:"скачать данные по md5 из remote"},
 {re:/repro/,l:"воспроизвести пайплайн до конца"}]);

S("MLOps","dr1","Дрейф признаков: качество модели упало в проде","Senior",
`<b>Симптом:</b> бизнес жалуется: конверсия рекомендаций упала на 30%. Метрики сервиса зелёные — значит, проблема в модели. Подозрение на дрейф входных распределений.<br>
<b>Цель:</b> проверить дрейф Evidently, отличить data drift от concept drift, принять решение о ретренировке.<br>
<b>Начните с:</b> <code>evidently report</code> по reference/current данным`,
"ubuntu@lab:~$",
[
[/^evidently report|python .*evidently/,`DATA DRIFT REPORT (reference: train_2026-05, current: prod_week):
  feature age_mean_income .... drift detected (KS=0.21, p<0.01)
  feature session_duration ... drift detected (KS=0.34, p<0.01)
  target_rate ............... 0.031 → 0.004  (-87%!)
  model accuracy ............ 0.91 → 0.62`,"err"],
[/^kubectl logs -l app=reco-service .*--tail|kubectl logs .*reco/,`INFO upstream schema changed: field "device_type" now enum v2
WARN 12% requests contain null in feature credit_score`,"warn"],
[/^git log .*features\/|git diff .*schema|git log -p src\/features/,`commit a41f2e (3 дня назад) "upstream: device_type enum v2"
→ фича-трансформация перестала матчиться, 12% нулей`,"err"],
[/^(dvc )?repro train|make retrain|python src\/train\.py/,`Retraining on refreshed window (90 days)...
accuracy 0.89 on holdout, drift cleared for 11/13 features`,"ok"],
[/^mlflow models (serve|deploy)|kubectl set image/,`model-server updated to churn:v2026.08.2
shadow traffic: OK, metrics parity confirmed`,"ok"]
],
[{re:/evidently/,l:"количественно оценить дрейф по фичам"},
 {re:/logs/,l:"ищем след upstream-изменений в логах сервиса"},
 {re:/git (log|diff)/,l:"найти коммит, изменивший схему входных данных"},
 {re:/repro|retrain/,l:"ретренировка на свежем окне"},
 {re:/set image|serve|deploy/,l:"раскатить новую модель (сначала shadow)"}]);

S("MLOps","gpu1","GPU на K8s: джобы висят в Pending, Kueue не пускает","Senior",
`<b>Симптом:</b> исследовательские джобы обучения стоят в Pending часами. `kubectl describe pod` говорит "Insufficient nvidia.com/gpu". Часть GPU-узлов при этом простаивает.<br>
<b>Цель:</b> разобраться с очередями Kueue (LocalQueue/ClusterQueue), приоритетами и квотами.<br>
<b>Начните с:</b> <code>kubectl get pods; kubectl describe pod &lt;job&gt;</code>`,
"ubuntu@lab:~$",
[
[/^kubectl get pods($| -A)/,`NAME              STATUS    AGE
train-resnet-a    Pending   45m     # research-команда
train-resnet-b    Pending   44m
finetune-llm      Running   2h      # платная команда съела всю квоту`,"err"],
[/^kubectl describe pod .*/,`Events:
  Warning  FailedScheduling  insufficient nvidia.com/gpu
  (ClusterQueue team-gpu quota: used=8/8 by finetune-llm cohort)`,"err"],
[/^kubectl get clusterqueue|kubectl get localqueue|kubectl get cq|kubectl get lq/,`ClusterQueue gpu-quota: nominal 8 GPUs, cohorts:
  team-paid:   guarantee 6, borrowable 2   ← забрали 8 (borrowing!)
  team-research: guarantee 2               ← свои 2 заняты чужим borrowing`,"warn"],
[/^kubectl patch clusterqueue|kubectl edit clusterqueue/,`clusterqueue.team-gpu patched
  (cohort.borrowingLimit: 0 — запрет заимствования сверх гарантий)`,"ok"],
[/^kubectl get pods/,`train-resnet-a   Running   scheduled after preemption
finetune-llm     Running   (reduced to guaranteed 6)`,"ok"]
],
[{re:/get pods/,l:"увидеть картину: кто Running, кто Pending"},
 {re:/describe pod/,l:"причина Pending: квота ClusterQueue, а не отсутствие узлов"},
 {re:/(clusterqueue|localqueue)/,l:"изучить гарантии и borrowing в Kueue"},
 {re:/patch clusterqueue|edit clusterqueue/,l:"ограничить borrowing — вернуть гарантии командам"}]);

S("LLMOps","llm1","RAG-бот отвечает нерелевантно: чанкинг сломал контекст","Senior",
`<b>Симптом:</b> RAG-ассистент по внутренней базе знаний стал выдавать обрывочные ответы со ссылками не туда. Ретривер находит чанки, но они без контекста.<br>
<b>Цель:</b> диагностировать пайплайн индексации (чанкинг/метаданные), переиндексировать, оценить качество Ragas'ом.<br>
<b>Начните с:</b> <code>curl :8000/search?q=...</code> — что реально находит ретривер`,
"ubuntu@lab:~$",
[
[/^curl .*search\?q=|curl .*query/,`{"hits":[
  {"score":0.81,"text":"...— см. таблицу ниже.","meta":{"doc":"hr_policy.pdf","chunk":47}},   # обрывок без заголовка раздела
  {"score":0.74,"text":"...в соответствии с п.4.2 предыдущей редакции...","meta":{"chunk":48}}]}`,"err"],
[/^grep -n chunk_size config\.yaml|cat config\.yaml/,`indexing:
  chunk_size: 200          # ← слишком мал: режет абзацы пополам
  overlap: 0               # ← нет перекрытия: теряются связные мысли
  metadata: []             # ← нет заголовков разделов в метаданных`,"err"],
[/^python scripts\/reindex\.py --chunk-size 800 --overlap 100/,`Reindexing 1,204 documents...
chunks: 18,442 → 6,131 (larger, context-aware)
embeddings: done (bge-m3), index rebuilt`,"ok"],
[/^ragas evaluate|python -m ragas/,`faithfulness:      0.72 → 0.93
answer_relevancy:  0.58 → 0.88
context_precision: 0.49 → 0.84`,"ok"],
[/^kubectl rollout restart deploy\/rag-bot|docker compose up -d rag/,`rag-bot redeployed with new index version idx-2026-08-25`,"ok"]
],
[{re:/curl .*search|query/,l:"посмотреть, что именно находит ретривер"},
 {re:/config\.yaml|chunk_size/,l:"найти проблему: мелкие чанки без перекрытия и метаданных"},
 {re:/reindex/,l:"переиндексировать с разумным размером и overlap"},
 {re:/ragas/,l:"измерить качество до/после объективной метрикой"},
 {re:/restart|up -d/,l:"выкатить новую версию индекса"}]);
