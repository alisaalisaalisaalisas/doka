# 🦙 23.8 LLMOps и RAG

> Цель: эксплуатация LLM-приложений — пайплайн RAG, оценка качества, бюджеты токенов, версионирование промптов.

**Оглавление:** [2.1 Теория](#21-теория) · [2.2 Конфигурация](#22-конфигурация) · [2.3 Troubleshooting](#23-troubleshooting) · [2.5 Вопросы](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

### 2.1 Теория

**LLMOps = MLOps + специфика LLM:** вместо обучения с нуля — дообучение/RAG поверх чужих моделей; вместо метрик точности — оценка генерации; вместо GPU-обучения — токен-бюджеты и латентность.

#### RAG (Retrieval-Augmented Generation)

```text
Документы → чанкинг → эмбеддинги → векторная БД (pgvector/Qdrant)
                                          ↓
Запрос → эмбеддинг запроса → top-k похожих чанков → промпт (контекст+вопрос) → LLM → ответ
```

RAG «приземляет» LLM на ваши данные и снижает галлюцинации — при правильном чанкинге и retrieval.

**Компоненты и выбор:**

| Компонент | Варианты | Дефолт |
| :--- | :--- | :--- |
| LLM | OpenAI/Anthropic API, self-hosted (vLLM + Llama/Qwen) | API для старта, vLLM для приватности |
| Векторная БД | **pgvector** (расширение Postgres!), Qdrant, Milvus | pgvector — если уже есть PG (11.4) |
| Эмбеддинги | OpenAI, open-source (bge, e5) | bge-m3 self-hosted |
| Оркестрация | LangChain, LlamaIndex, свой код | свой тонкий код + OpenAI SDK |
| Оценка | Ragas, LLM-as-judge, ручная выборка | Ragas + golden set |

**Ключевые термины:** `chunking` (нарезка документов, 300-1000 токенов с перекрытием), `embedding` (вектор семантики), `top-k retrieval` (k ближайших чанков), `prompt template` (версионируемый шаблон), `hallucination` (выдумка LLM), `token budget` (лимит стоимости/контекста).

**Что мониторить в LLMOps:** латентность (TTFT — time to first token), токены/стоимость запроса, качество (faithfulness, answer relevance — Ragas), доля отказов (refusals), дрейф входящих запросов.

---

### 2.2 Конфигурация

#### RAG на pgvector (PostgreSQL из 11.4!)

```sql
-- 1. Расширение и таблица чанков
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE chunks (
  id bigserial PRIMARY KEY,
  doc_id text NOT NULL,
  content text NOT NULL,
  embedding vector(1024)          -- размерность модели эмбеддингов
);
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);
```

```python
# ingest.py — чанкинг + эмбеддинги + вставка
import psycopg, requests

def chunk(text, size=800, overlap=100):
    step = size - overlap
    return [text[i:i+size] for i in range(0, len(text), step)]

def embed(texts):
    r = requests.post("http://embedder:8080/embed", json={"texts": texts})
    return r.json()["embeddings"]

docs = open("handbook.md").read()
chunks = chunk(docs)
vectors = embed(chunks)
with psycopg.connect("postgres://app@pg/shop") as conn:
    for c, v in zip(chunks, vectors):
        conn.execute("INSERT INTO chunks (doc_id, content, embedding) VALUES (%s,%s,%s)",
                     ("handbook", c, v))
    conn.commit()
```

```python
# ask.py — retrieval + генерация
def ask(question):
    qvec = embed([question])[0]
    with psycopg.connect("postgres://app@pg/shop") as conn:
        rows = conn.execute(
            "SELECT content FROM chunks ORDER BY embedding <=> %s LIMIT 4",
            (qvec,)).fetchall()
    context = "\n---\n".join(r[0] for r in rows)
    prompt = f"Отвечай ТОЛЬКО по контексту. Если нет ответа — скажи честно.\n\n{context}\n\nВопрос: {question}"
    return llm(prompt)      # OpenAI SDK или vLLM endpoint
```

#### vLLM: self-hosted LLM с OpenAI-совместимым API

```bash
docker run -d --gpus all -p 8000:8000 \
  vllm/vllm-openai:latest --model Qwen/Qwen2.5-7B-Instruct
# Клиент — обычный OpenAI SDK с base_url=http://vllm:8000/v1
```

#### Ragas: оценка качества RAG

```python
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision
from datasets import Dataset

ds = Dataset.from_dict({
    "question": ["как настроить MetalLB?"],
    "answer": [answer],
    "contexts": [[context]],
    "ground_truth": ["MetalLB настраивается через IPAddressPool..."],   # эталон
})
score = evaluate(ds, metrics=[faithfulness, answer_relevancy, context_precision])
```

**Частые ошибки:** чанки без перекрытия (разорванный контекст); retrieval без метаданных (не понять источник ответа); промпт в коде без версионирования; нет бюджета токенов → счёт за API в тысячи $; оценка «на глаз» вместо golden set.

---

### 2.3 Troubleshooting

```bash
# Латентность: разложить на retrieval / LLM
curl -s -w 'embed=%{time_starttransfer}s\n' -X POST embedder:8080/embed -d '{"texts":["x"]}' -o /dev/null
# Логи LLM: токены запроса/ответа
docker logs vllm | grep -iE "prompt_tokens|generated" | tail

# Retrieval: что реально нашлось? (логировать top-k с score!)
psql -c "SELECT content, embedding <=> $1 AS dist FROM chunks ORDER BY 2 LIMIT 4"

# Качество: Ragas на golden set в CI
python eval.py --golden golden.jsonl --threshold faithfulness=0.8
```

| Симптом | Причина | Действие |
| :--- | :--- | :--- |
| Ответы «не из документации» | retrieval не находит чанки (чанкинг/эмбеддинги) | смотреть top-k и score; улучшить чанкинг |
| Галлюцинации | промпт без ограничений / слабая модель | «отвечай только по контексту», Ragas faithfulness |
| Латентность 10с+ | большой контекст / медленная модель | меньше top-k, короче чанки, vLLM+GPU, streaming |
| Счёт за API взорвался | нет кэша/бюджета, длинные промпты | кэш эмбеддингов, лимиты, логировать токены |
| «Вчера отвечало лучше» | промпт/модель/данные изменились без версии | версионировать промпты и индекс, golden set в CI |

---

### 2.5 Проверь себя — 5 вопросов

**В1. Зачем в RAG нужен чанкинг с перекрытием (overlap) и что будет при overlap=0?**

<details><summary>Ответ</summary>
Перекрытие сохраняет контекст на границах чанков; при 0 смысловые куски рвутся посередине — retrieval отдаёт обрывки, ответы теряют контекст. Типично size 800 / overlap 100-200.
</details>

**В2. Найдите ошибку: RAG отвечает «не нашёл в документации» на вопрос, ответ на который точно есть.**

<details><summary>Ответ</summary>
Проблема в retrieval, не в LLM: проверить top-k и дистанции — эмбеддинги запроса/чанков из разных моделей, чанки слишком крупные/мелкие, или индекс не пересобран после обновления документов.
</details>

**В3. Почему pgvector — разумный дефолт для векторной БД, если уже есть PostgreSQL?**

<details><summary>Ответ</summary>
Один движок для реляционных данных и векторов: бэкапы/репликация/мониторинг уже есть (Patroni, 11.4), join'ы метаданных с векторным поиском в одном месте, HNSW-индекс достаточен до десятков миллионов векторов.
</details>

**В4. Что такое faithfulness в Ragas и чем он отличается от answer_relevancy?**

<details><summary>Ответ</summary>
Faithfulness — насколько ответ основан на выданном контексте (анти-галлюцинация). Answer relevancy — отвечает ли ответ на вопрос. Могут быть независимы: релевантный, но выдуманный ответ = низкий faithfulness.
</details>

**В5. Сценарий: стоимость API LLM выросла в 5 раз за неделю. Три места, где искать.**

<details><summary>Ответ</summary>
1) Логи токенов: выросли промпты (контекст раздулся — top-k/чанки). 2) Кэш: перестал попадать (изменились запросы). 3) Новый клиент/фича шлёт всё подряд без фильтрации. Бюджеты и алерты на токены/день обязательны.
</details>

---

### 2.6 Практика — 3 задания

#### Задание 1: Мини-RAG на pgvector за 30 минут

```bash
# Шаг 0: PG с расширением (образ с pgvector)
docker run -d --name pg -e POSTGRES_PASSWORD=p -p 5432:5432 pgvector/pgvector:pg16

# Шаг 1: схема (SQL из 2.2) через psql
# Шаг 2: ingest своего документа (embedder — любой локальный: bge через sentence-transformers)
pip install sentence-transformers psycopg
python ingest.py    # чанкинг + эмбеддинги + вставка
# Шаг 3: ask.py → ответ LLM с контекстом из top-4
python ask.py "как настроить MetalLB?"
# Ожидание: ответ со ссылкой на чанки handbook'а ✅
```

**Проверь себя:** `SELECT count(*) FROM chunks` > 0; ask возвращает ответ, ссылающийся на контекст; вопрос «о погоде» → честный отказ (промпт-ограничение работает).

**Разбор:** минимальный RAG = чанкинг + эмбеддинги + векторный поиск + промпт с ограничением. Всё остальное — оптимизации этого скелета.

#### Задание 2: Ragas-гейт качества в CI

```bash
# golden.jsonl: 20 вопросов с эталонными ответами от экспертов
python eval.py --golden golden.jsonl
# eval.py: прогон ask() на каждом вопросе → Ragas faithfulness/relevancy
# Гейт: faithfulness < 0.8 → exit 1
```

**Проверь себя:** сломайте retrieval (top-k=1) → гейт красный; почините → зелёный.

**Разбор:** качество LLM-приложения тестируется как код: golden set + метрики Ragas + порог в CI. Без этого любое изменение промпта/модели — лотерея.

#### Задание 3: Бюджет токенов и кэш

```python
# Декоратор: кэш эмбеддингов + лимит токенов в день
import json, hashlib, pathlib
CACHE = pathlib.Path("embed_cache.json")

def embed_cached(texts):
    cache = json.loads(CACHE.read_text()) if CACHE.exists() else {}
    key = hashlib.sha1("|".join(texts).encode()).hexdigest()
    if key not in cache:
        cache[key] = embed(texts)
        CACHE.write_text(json.dumps(cache))
    return cache[key]
```

**Проверь себя:** повторный ingest того же документа не вызывает embedder (кэш hit); в логах LLM — счётчик токенов за день с алертом при превышении бюджета.

**Разбор:** эмбеддинг детерминирован для одинакового текста → кэш легален и радикально режет стоимость. Токен-бюджет с алертом — обязательный «счётчик электроэнергии» LLMOps.

---

*Далее: [23.9 Model Governance](09-model-governance.md)*


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
