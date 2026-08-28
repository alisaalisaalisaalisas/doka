#!/usr/bin/env python3
import pathlib
root = pathlib.Path(r"C:/Users/User/Desktop/papka/doka/docs/23-mlops")

supplements = {
    "02-mlflow-tracking.md": """
---

## 🔐 Дополнение: MLflow Auth, RBAC и Promotion

### Auth и artifact security

```bash
# MLflow 2.x auth (basic auth + permissions)
# docker-compose: MLFLOW_AUTH_CONFIG_PATH=/basic_auth.ini
cat > basic_auth.ini <<'INI'
[mlflow]
default_permission = READ
database_uri = sqlite:///basic_auth.db
admin_username = admin
admin_password = admin
INI

# Permissions: READ/EDIT/MANAGE per experiment
mlflow experiments create --experiment-name prod --permission EDIT --user alice
# artifact security: s3://mlflow-artifacts с SSE-KMS + bucket policy + versioning
aws s3api put-bucket-encryption --bucket mlflow-artifacts --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"aws:kms"}}]}'
```

### Model Registry: staging → production → rollback

```bash
# Promotion flow
mlflow models create --name shop-reco --description "reco model"
mlflow runs list --experiment-id 1 --max-results 5
mlflow model-versions create --name shop-reco --source s3://mlflow-artifacts/1/abc/artifacts/model --run-id abc
mlflow model-versions update --name shop-reco --version 1 --description "candidate"
mlflow model-versions transition-stage --name shop-reco --version 1 --stage Staging --archive-existing-versions
# Auto-rollback check: if production metric drops
mlflow model-versions transition-stage --name shop-reco --version 2 --stage Production
# Rollback: архивируем bad 2, возвращаем 1
mlflow model-versions transition-stage --name shop-reco --version 2 --stage Archived
mlflow model-versions transition-stage --name shop-reco --version 1 --stage Production
```

**Проверь себя:** нет `MLFLOW_TRACKING_USERNAME` в коде — `mlflow.set_tracking_uri(os.getenv("MLFLOW_TRACKING_URI"))` + `~/.netrc` или OIDC proxy.
""",
    "04-serving-monitoring.md": """
---

## 🚀 Дополнение: FastAPI → KServe InferenceService (canary + autoscale)

```yaml
apiVersion: serving.kserve.io/v1beta1
kind: InferenceService
metadata: { name: shop-model, namespace: prod }
spec:
  predictor:
    canaryTrafficPercent: 10   # 10% на новый revision, 90% stable
    minReplicas: 2
    maxReplicas: 10
    scaleTarget: 10            # concurrency per pod
    scaleMetric: concurrency
    readinessProbe: { httpGet: { path: /v2/health/ready, port: 8080 }, initialDelaySeconds: 5 }
    livenessProbe:  { httpGet: { path: /v2/health/live, port: 8080 }, periodSeconds: 10 }
    containers:
      - name: kserve-container
        image: localhost:5001/shop-model:v2
        ports: [{ containerPort: 8080, protocol: TCP }]
        resources: { requests: { cpu: "500m", memory: "1Gi" }, limits: { cpu: "2", memory: "2Gi" } }
        env: [{ name: MODEL_NAME, value: "shop-reco" }]
  transformer:  # опционально: pre/post-processing
    containers:
      - name: transformer
        image: localhost:5001/transformer:v1
  explainer:
    containers:
      - name: explainer
        image: seldonio/alibiexplainer:1.16  # SHAP/LIME
```

```bash
kubectl apply -f inference.yaml
kubectl get inferenceservice shop-model -n prod -o wide
kubectl get pods -n prod -l serving.kserve.io/inferenceservice=shop-model
# Autoscale: kserve HPA/KNative PodAutoscaler
kubectl get hpa -n prod | grep shop-model
# Метрики: prometheus scrape /metrics на predictor
curl -s http://shop-model-predictor.prod/metrics | grep -i queue
# Rollback: trafficPercent 0 или kubectl rollout undo
kubectl patch inferenceservice shop-model -n prod --type merge -p '{"spec":{"predictor":{"canaryTrafficPercent":0}}}'
```

""",
    "05-feature-store-feast.md": """
---

## 🗄️ Дополнение: Offline/Online stores, Materialization и BigQuery

### Point-in-time correctness

```python
# feature_store.yaml
project: shop
provider: gcp   # или local
online_store:
  type: redis
  connection_string: redis:6379
offline_store:
  type: bigquery  # вместо file — BigQuery/Snowflake/Redshift
  project_id: prod-bq
  dataset: feast
entity_key_serialization_version: 2

# feature_view.py
from feast import Entity, FeatureView, FileSource, BigQuerySource, Field
from feast.types import Float32, Int64
from datetime import timedelta

user = Entity(name="user", join_keys=["user_id"])
user_source = BigQuerySource(
  table="prod-bq.feast.user_features",
  timestamp_field="event_timestamp",
  created_timestamp_column="created",
)
user_view = FeatureView(
  name="user_features",
  entities=[user],
  ttl=timedelta(days=1),
  schema=[Field(name="avg_order", dtype=Float32), Field(name="orders_7d", dtype=Int64)],
  source=user_source,
  online=True,
)
```

```bash
feast materialize 2026-01-01T00:00:00 2026-08-28T00:00:00
feast materialize-incremental $(date -u +%Y-%m-%dT%H:%M:%S)
feast validate  # point-in-time join correctness check

# Online vs offline: same code
from feast import FeatureStore
store = FeatureStore(repo_path=".")
print(store.get_online_features(features=["user_features:avg_order"], entity_rows=[{"user_id": 42}]).to_dict())
print(store.get_historical_features(entity_df=orders_df, features=["user_features:avg_order"]).to_df().head())

# Freshness: check staleness
feast feature-view describe user_features | grep -A5 freshness
```
""",
    "06-gpu-k8s.md": """
---

## 🎮 Дополнение: NVIDIA Device Plugin, MIG и Kueue детально

```bash
# Device plugin: показывает nvidia.com/gpu
kubectl get nodes -o json | jq '.items[].status.allocatable | {gpu: ."nvidia.com/gpu", mig: ."nvidia.com/mig-1g.10gb"}'

# MIG на A100: 7 instances 1g.10gb
nvidia-smi mig -cgi 1g.10gb -C
kubectl label node gpu-node nvidia.com/mig-1g.10gb=7 --overwrite
# Под запрашивает MIG:
# resources: { limits: { nvidia.com/mig-1g.10gb: 1 } }

# Kueue queue с GPU номинальной квотой
kubectl apply -f - <<'YAML'
apiVersion: kueue.x-k8s.io/v1beta1
kind: ClusterQueue
metadata: { name: gpu-queue }
spec:
  namespaceSelector: {}
  resourceGroups:
    - coveredResources: ["cpu","memory","nvidia.com/gpu"]
      flavors: [{ name: default, resources: [{ name: "nvidia.com/gpu", nominalQuota: 8 }] }]
---
apiVersion: kueue.x-k8s.io/v1beta1
kind: LocalQueue
metadata: { name: user-queue, namespace: ml-team }
spec: { clusterQueue: gpu-queue }
YAML

# GPU utilization via dcgm exporter → Prometheus
kubectl -n gpu-operator-resources get pods | grep dcgm
kubectl -n monitoring port-forward svc/kps-prometheus 9090:9090 &
# PromQL: DCGM_FI_DEV_GPU_UTIL, DCGM_FI_DEV_FB_USED
```
""",
    "07-kubeflow-pipelines.md": """
---

## 🔧 Дополнение: Реальный pipeline compile → artifact → run → verify

```python
# pipeline.py
from kfp import dsl, compiler
from kfp.dsl import Input, Output, Artifact, Dataset, Model

@dsl.component(base_image="python:3.12", packages_to_install=["pandas","scikit-learn"])
def train_op(dataset: Input[Dataset], model: Output[Model], accuracy: Output[Artifact]):
    import pandas as pd, pickle
    from sklearn.ensemble import RandomForestClassifier
    df = pd.read_csv(dataset.path)
    clf = RandomForestClassifier().fit(df[["f1","f2"]], df["label"])
    with open(model.path, "wb") as f: pickle.dump(clf, f)
    with open(accuracy.path, "w") as f: f.write("0.92")
    model.metadata["accuracy"] = 0.92

@dsl.pipeline(name="shop-reco")
def shop_pipeline(replicas: int = 3):
    train = train_op(replicas=replicas)
    train.set_memory_limit("1Gi")
    train.set_cpu_limit("1")

compiler.Compiler().compile(shop_pipeline, "pipeline.yaml")
```

```bash
# Compile и проверка YAML артефактов
python pipeline.py && ls -lh pipeline.yaml && cat pipeline.yaml | grep -A3 artifacts

# Запустить в Kubeflow (порт-форвард)
kubectl -n kubeflow port-forward svc/ml-pipeline-ui 8080:80 &
# Upload pipeline.yaml → Create Run → observe DAG

# Верификация артефакта
kubectl -n kubeflow get pods -l pipeline/shop-reco | head
kubectl logs -n kubeflow $(kubectl get pods -n kubeflow -l app=train_op -o jsonpath='{.items[0].metadata.name}')
# Метрика accuracy: 0.92 должна быть в UI Artifacts
```
""",
    "08-llmops-rag.md": """
---

## 🔍 Дополнение: Qdrant/Milvus, Chunking, Retrieval и Evaluation

### Qdrant вместо pgvector

```bash
docker run -d -p 6333:6333 qdrant/qdrant
# Python
import qdrant_client
client = qdrant_client.QdrantClient("http://localhost:6333")
client.create_collection("docs", vectors_config={"size": 1536, "distance": "Cosine"})
client.upsert("docs", points=[{"id": 1, "vector": [0.1]*1536, "payload": {"text": "hello"}}])
hits = client.query_points("docs", query=[0.1]*1536, limit=5).points
```

### Chunking и reranking

```python
# chunk overlap 100 как в base, но с reranking
from langchain.text_splitter import RecursiveCharacterTextSplitter
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
chunks = splitter.split_text(open("doc.txt").read())

# Retrieval → Rerank (Cross-Encoder)
from sentence_transformers import CrossEncoder
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
scores = reranker.predict([(query, c) for c in chunks])
top = sorted(zip(chunks, scores), key=lambda x: x[1], reverse=True)[:3]

# Token budget
import tiktoken
enc = tiktoken.get_encoding("cl100k_base")
print(len(enc.encode(prompt)))  # budget check
```

### Evaluation: hallucination и Ragas

```python
from ragas.metrics import faithfulness, answer_relevancy
from ragas import evaluate
result = evaluate(dataset={"question": [q], "answer": [a], "contexts": [[c]]}, metrics=[faithfulness])
print(result["faithfulness"])  # >0.8 good
# Tracing: langfuse / opentelemetry
```
""",
}

for fname, text in supplements.items():
    p = root / fname
    if not p.exists():
        print(f"MISSING {fname}")
        continue
    t = p.read_text(encoding="utf-8")
    if text.strip()[:20] in t:
        print(f"SKIP {fname} already enriched")
        continue
    # append before last "## ✅" or at end if not found
    if "## ✅ Проверь себя" in t:
        t2 = t.replace("## ✅ Проверь себя", text + "\n\n## ✅ Проверь себя", 1)
    else:
        t2 = t + "\n" + text
    p.write_text(t2, encoding="utf-8")
    print(f"ENRICHED {fname}")
