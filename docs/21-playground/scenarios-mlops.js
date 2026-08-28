/* Песочница: MLOps-сценарии (MLflow, DVC, дрейф, GPU/Kueue, LLMOps) */
S("MLOps","ml1b","MLflow: пересоздали контейнер — все runs исчезли","Middle",
`<h3>Контекст</h3><p><b>MLOps.</b> MLflow: пересоздали контейнер — все runs исчезли. Среда сценария симулирует MLOps-окружение; основные инструменты терминала здесь: <code>docker</code>, <code>curl</code>.</p><h3>Что происходит</h3><p>после пересоздания контейнера MLflow UI пустой — ни экспериментов, ни метрик, ни артефактов.\nЦель: найти причину (SQLite + локальный диск в контейнере), перевести на PostgreSQL-бэкенд и S3-артефакты.\nНачните с: docker inspect mlflow | grep -i mount</p><h3>Что нужно сделать</h3><ul><li>[ ] убедиться, что томов нет — данные в слое контейнера</li><li>[ ] посмотреть BACKEND_STORE_URI и ARTIFACT_ROOT</li><li>[ ] пересоздать с PG-бэкендом и S3-артефактами</li><li>[ ] проверить health</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта этого сценария (активный: <code>docker-compose.yml</code>); тесты и несвязанные ресурсы не трогайте.</p><h3>Стартовое состояние</h3><p>Файлы проекта: <code>docker-compose.yml</code>. Активный файл: <code>docker-compose.yml</code>. Редактор уже открыт на активном файле.</p><h3>Ожидаемый результат</h3><p>Чек-лист «Проверить решение» полностью зелёный: убедиться, что томов нет — данные в слое контейнера → посмотреть BACKEND_STORE_URI и ARTIFACT_ROOT → пересоздать с PG-бэкендом и S3-артефактами → проверить health.</p><h3>Проверка</h3><pre>docker inspect mlflow…mount|docker inspect mlflow<br>docker exec -?i? ?mlflow env|docker exec mlflow env<br>docker run …mlflow</pre><p>для кода: кнопка «Проверить код»</p>`,
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
{file:"docker-compose.yml",files:{"docker-compose.yml":`services:
  mlflow:
    image: ghcr.io/mlflow/mlflow:v2.14.1
    command: mlflow server --host 0.0.0.0 --port 5000
    environment:
      BACKEND_STORE_URI: sqlite:///mlflow.db   # <-- ошибка: sqlite в контейнере
      ARTIFACT_ROOT: /mlruns                   # <-- ошибка: локальный диск
    ports: ["5000:5000"]`},checks:[{re:/postgres(ql)?:\/\//,l:"BACKEND_STORE_URI на PostgreSQL"},{re:/s3:\/\//,l:"ARTIFACT_ROOT на S3"}],solutionFiles:{"docker-compose.yml":`services:
  mlflow:
    image: ghcr.io/mlflow/mlflow:v2.14.1
    command: mlflow server --host 0.0.0.0 --port 5000
    environment:
      BACKEND_STORE_URI: postgresql://mlflow:secret@pg:5432/mlflow
      ARTIFACT_ROOT: s3://mlflow-artifacts/
    ports: ["5000:5000"]
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
`}},{hints:["Симптом: после пересоздания контейнера MLflow UI пустой — ни экспериментов, ни метрик, ни артефактов.. Определите, на каком слое MLOps возникает проблема, прежде чем что-то менять.","Правьте файлы в редакторе; проверка кода — кнопкой «Проверить код». Рабочие инструменты сценария: <code>docker</code>, <code>curl</code>. Диагноз начинайте с <code>docker inspect mlflow…mount|docker inspect mlflow</code>.","Порядок действий: убедиться, что томов нет — данные в слое контейнера → посмотреть BACKEND_STORE_URI и ARTIFACT_ROOT → пересоздать с PG-бэкендом и S3-артефактами → …"]});

S("MLOps","ml2","MLflow Registry: сервис грузит старую версию модели","Senior",
`<h3>Контекст</h3><p>MLOps: <b>MLflow Registry: сервис грузит старую версию модели</b>. Работа с <code>project/mlflow-registry.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>MLflow Registry: сервис грузит старую версию модели</b>. Файл <code>project/mlflow-registry.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] найти захардкоженную версию в конфиге сервиса</li><li>[ ] сверить этапы версий в registry</li><li>[ ] обновить версию и перезапустить</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/mlflow-registry.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/mlflow-registry.yaml</code>. Активный файл открыт в редакторе. Начните с <code>(mlflow )?models describe|mlfl</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: найти захардкоженную версию в конфиге сервиса → сверить этапы версий в registry → обновить версию и перезапустить.</p><h3>Проверка</h3><pre>cat project/mlflow-registry.yaml<br>проверить код</pre>`,
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
 {re:/curl/,l:"убедиться, что отвечает v9"}],{file:"project/mlflow-registry.yaml",files:{"project/mlflow-registry.yaml":`# MLOps: MLflow Registry: сервис грузит старую версию модели\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/mlflow-registry.yaml":`# MLOps: MLflow Registry: сервис грузит старую версию модели — fixed\nstatus: ok\n`}},{hints:["Симптом: MLflow Registry: сервис грузит старую версию модели в project/mlflow-registry.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/mlflow-registry.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/mlflow-registry.yaml.","Порядок: найти захардкоженную версию в конфиге сервиса → сверить этапы версий в registry → обновить версию и перезапустить"]});

S("MLOps","dv1","DVC: коллеги не могут воспроизвести датасет","Middle",
`<h3>Контекст</h3><p>MLOps: <b>DVC: коллеги не могут воспроизвести датасет</b>. Работа с <code>project/dvc-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>DVC: коллеги не могут воспроизвести датасет</b>. Файл <code>project/dvc-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] понять: данные вне git, но есть .dvc-файлы</li><li>[ ] подключить удалённый кэш (S3/MinIO)</li><li>[ ] скачать данные по md5 из remote</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/dvc-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/dvc-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>ls( -la)? data</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: понять: данные вне git, но есть .dvc-файлы → подключить удалённый кэш (S3/MinIO) → скачать данные по md5 из remote.</p><h3>Проверка</h3><pre>cat project/dvc-.yaml<br>проверить код</pre>`,
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
 {re:/repro/,l:"воспроизвести пайплайн до конца"}],{file:"project/dvc-.yaml",files:{"project/dvc-.yaml":`# MLOps: DVC: коллеги не могут воспроизвести датасет\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/dvc-.yaml":`# MLOps: DVC: коллеги не могут воспроизвести датасет — fixed\nstatus: ok\n`}},{hints:["Симптом: DVC: коллеги не могут воспроизвести датасет в project/dvc-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/dvc-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/dvc-.yaml.","Порядок: понять: данные вне git, но есть .dvc-файлы → подключить удалённый кэш (S3/MinIO) → скачать данные по md5 из remote"]});

S("MLOps","dr1","Дрейф признаков: качество модели упало в проде","Senior",
`<h3>Контекст</h3><p>MLOps: <b>Дрейф признаков: качество модели упало в проде</b>. Работа с <code>project/-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>Дрейф признаков: качество модели упало в проде</b>. Файл <code>project/-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] количественно оценить дрейф по фичам</li><li>[ ] ищем след upstream-изменений в логах сервиса</li><li>[ ] найти коммит, изменивший схему входных данных</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>evidently report|python .*evid</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: количественно оценить дрейф по фичам → ищем след upstream-изменений в логах сервиса → найти коммит, изменивший схему входных данных.</p><h3>Проверка</h3><pre>cat project/-.yaml<br>проверить код</pre>`,
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
 {re:/set image|serve|deploy/,l:"раскатить новую модель (сначала shadow)"}],{file:"project/-.yaml",files:{"project/-.yaml":`# MLOps: Дрейф признаков: качество модели упало в проде\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/-.yaml":`# MLOps: Дрейф признаков: качество модели упало в проде — fixed\nstatus: ok\n`}},{hints:["Симптом: Дрейф признаков: качество модели упало в проде в project/-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/-.yaml.","Порядок: количественно оценить дрейф по фичам → ищем след upstream-изменений в логах сервиса → найти коммит, изменивший схему входных данных"]});

S("MLOps","gpu1","GPU на K8s: джобы висят в Pending, Kueue не пускает","Senior",
`<h3>Контекст</h3><p>MLOps: <b>GPU на K8s: джобы висят в Pending, Kueue не пускает</b>. Работа с <code>project/gpu-k8s-pending.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>GPU на K8s: джобы висят в Pending, Kueue не пускает</b>. Файл <code>project/gpu-k8s-pending.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] увидеть картину: кто Running, кто Pending</li><li>[ ] причина Pending: квота ClusterQueue, а не отсутствие узлов</li><li>[ ] изучить гарантии и borrowing в Kueue</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/gpu-k8s-pending.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/gpu-k8s-pending.yaml</code>. Активный файл открыт в редакторе. Начните с <code>kubectl get pods(| -A)</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: увидеть картину: кто Running, кто Pending → причина Pending: квота ClusterQueue, а не отсутствие узлов → изучить гарантии и borrowing в Kueue.</p><h3>Проверка</h3><pre>cat project/gpu-k8s-pending.yaml<br>проверить код</pre>`,
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
 {re:/patch clusterqueue|edit clusterqueue/,l:"ограничить borrowing — вернуть гарантии командам"}],{file:"project/gpu-k8s-pending.yaml",files:{"project/gpu-k8s-pending.yaml":`# MLOps: GPU на K8s: джобы висят в Pending, Kueue не пускает\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/gpu-k8s-pending.yaml":`# MLOps: GPU на K8s: джобы висят в Pending, Kueue не пускает — fixed\nstatus: ok\n`}},{hints:["Симптом: GPU на K8s: джобы висят в Pending, Kueue не пускает в project/gpu-k8s-pending.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/gpu-k8s-pending.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/gpu-k8s-pending.yaml.","Порядок: увидеть картину: кто Running, кто Pending → причина Pending: квота ClusterQueue, а не отсутствие узлов → изучить гарантии и borrowing в Kueue"]});

S("LLMOps","llm1","RAG-бот отвечает нерелевантно: чанкинг сломал контекст","Senior",
`<h3>Контекст</h3><p>LLMOps: <b>RAG-бот отвечает нерелевантно: чанкинг сломал контекст</b>. Работа с <code>project/rag-.yaml</code> в проекте.</p><h3>Что происходит</h3><p>Симптом: <b>RAG-бот отвечает нерелевантно: чанкинг сломал контекст</b>. Файл <code>project/rag-.yaml</code> содержит ошибку, проверки падают.</p><h3>Что нужно сделать</h3><ul><li>[ ] посмотреть, что именно находит ретривер</li><li>[ ] найти проблему: мелкие чанки без перекрытия и метаданных</li><li>[ ] переиндексировать с разумным размером и overlap</li></ul><h3>Ограничения</h3><p>Меняйте только файлы проекта (активный: <code>project/rag-.yaml</code>).</p><h3>Стартовое состояние</h3><p>Файлы: <code>project/rag-.yaml</code>. Активный файл открыт в редакторе. Начните с <code>curl .*search\\?q=|curl .*query</code>.</p><h3>Ожидаемый результат</h3><p>Чек-лист зелёный: посмотреть, что именно находит ретривер → найти проблему: мелкие чанки без перекрытия и метаданных → переиндексировать с разумным размером и overlap.</p><h3>Проверка</h3><pre>cat project/rag-.yaml<br>проверить код</pre>`,
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
 {re:/restart|up -d/,l:"выкатить новую версию индекса"}],{file:"project/rag-.yaml",files:{"project/rag-.yaml":`# LLMOps: RAG-бот отвечает нерелевантно: чанкинг сломал контекст\nstatus: broken\n`},checks:[{re:/ok/,l:"ok"}],solutionFiles:{"project/rag-.yaml":`# LLMOps: RAG-бот отвечает нерелевантно: чанкинг сломал контекст — fixed\nstatus: ok\n`}},{hints:["Симптом: RAG-бот отвечает нерелевантно: чанкинг сломал контекст в project/rag-.yaml. Ищи причину в коде/конфиге этого файла.","Открой project/rag-.yaml в редакторе, проверь логику. Инструменты: cat, ls, grep. Начни с cat project/rag-.yaml.","Порядок: посмотреть, что именно находит ретривер → найти проблему: мелкие чанки без перекрытия и метаданных → переиндексировать с разумным размером и overlap"]});
