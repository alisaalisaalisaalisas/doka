# 🤖 23.1 MLOps: введение и жизненный цикл ML

> Уровень: Middle→Senior DevOps. Цель: понимать, чем эксплуатация ML отличается от классических приложений, и выстроить воспроизводимый конвейер.

**Оглавление:** [2.1 Теория](#21-теория) · [2.2 Конфигурация](#22-конфигурация-и-синтаксис) · [2.3 Troubleshooting](#23-troubleshooting) · [2.4 Интеграция](#24-интеграция-со-стеком) · [2.5 Проверь себя](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

### 2.1 Теория

#### Чем MLOps отличается от DevOps

| | Классическое приложение | ML-система |
| :--- | :--- | :--- |
| Артефакты | код + конфиг | код + **данные** + **модель** + конфиг |
| Деградация | код не меняется → поведение стабильно | модель «стареет» без изменений кода (drift) |
| Тесты | unit/integration | + валидация **данных** и **качества модели** (метрики) |
| Деплой | релиз = событие | релиз = код + веса модели + порог метрик |
| Циклы | CI/CD | CI/**CT** (continuous training)/**CD** + непрерывный мониторинг |

**Уровни зрелости (Google):**
- **Level 0 — ручной:** Jupyter-ноутбук, train руками, модель передают «по почте». Нет CI, нет воспроизводимости.
- **Level 1 — ML pipeline автоматизация:** обучение — пайплайн, эксперименты трекаются, деплой автоматизирован, есть registry.
- **Level 2 — CI/CD pipeline:** полный цикл: изменения кода/данных → автотесты → автотренинг → валидация модели → деплой с канарейкой → мониторинг → автопереобучение.

**Жизненный цикл ML:**

```text
Данные → Валидация → Features → Train → Evaluate (порог метрик!)
    ↑                                                  ↓
    └────── Retrain (по расписанию/дрейфу) ←── Deploy ← Monitor
```

**Роли:** Data Scientist (эксперименты, метрики), ML Engineer (продакшн-код модели), **ML Platform / MLOps-инженер (вы)** — инфраструктура: трекинг, пайплайны, сервинг, мониторинг, GPU.

**Ключевые термины:** `artifact` (модель/датасет как версионированный файл), `experiment run` (один прогон обучения с параметрами и метриками), `model registry` (версионированный каталог моделей со стадиями), `data drift` (распределение входных данных изменилось), `concept drift` (связь X→Y изменилась), `feature skew` (фичи в обучении ≠ фичи в проде).

#### Сравнение инструментов (обзор раздела)

| Задача | Инструменты | Выбор по умолчанию |
| :--- | :--- | :--- |
| Трекинг экспериментов | MLflow, Weights&Biases | **MLflow** (self-hosted, OSS) |
| Версионирование данных | DVC, lakeFS | **DVC** |
| Оркестрация пайплайнов | Airflow, Kubeflow, Prefect | Airflow (есть уже) → Kubeflow при росте |
| Сервинг | FastAPI-обёртка, MLflow serve, KServe, Seldon | FastAPI → KServe при канарейках/автоскейле |
| Дрейф/качество | Evidently, Alibi Detect | **Evidently** (отчёты в CI) |
| Feature Store | Feast, Tecton | Feast (позже, Level 2) |

---

### 2.2 Конфигурация и синтаксис

#### Эталонная структура ML-репозитория

```text
ml-project/
├── data/
│   ├── raw/            # неизменяемые исходники (в DVC, не в git!)
│   └── processed/      # результат prepare-шага (в DVC)
├── src/
│   ├── prepare.py      # данные → processed
│   ├── train.py        # processed → model.pkl + метрики
│   └── predict.py      # инференс
├── models/             # артефакты обучения (в DVC или registry)
├── dvc.yaml            # пайплайн: prepare → train
├── params.yaml         # гиперпараметры (версионируются git'ом)
├── tests/              # тесты кода + валидация данных/модели
├── requirements.txt    # ПИННОВАННЫЕ версии (воспроизводимость!)
└── Dockerfile
```

```yaml
# params.yaml — гиперпараметры версионируются git'ом, а не в коде
train:
  n_estimators: 200
  max_depth: 8
  seed: 42
data:
  raw_path: data/raw/orders.csv
  test_size: 0.2
```

```python
# src/train.py — минимальные требования к воспроизводимости
import yaml, random, numpy as np, mlflow
from sklearn.ensemble import RandomForestClassifier

params = yaml.safe_load(open("params.yaml"))["train"]
random.seed(params["seed"]); np.random.seed(params["seed"])   # фиксируем случайность!

with mlflow.start_run():
    mlflow.log_params(params)
    # ... обучение ...
    mlflow.log_metric("roc_auc", 0.87)
    mlflow.sklearn.log_model(model, "model")
```

**Частые ошибки:** unpinned зависимости (`pip install scikit-learn` без версии — через полгода модель другая); seed не зафиксирован; данные в git; ноутбук как единственный артефакт обучения.

---

### 2.3 Troubleshooting

```bash
# «Модель работает иначе в проде» — чек-лист воспроизводимости
pip freeze | grep scikit-learn     # версия та же, что при обучении?
python -c "import hashlib;print(hashlib.md5(open('data/raw/x.csv','rb').read()).hexdigest())"
#   хэш данных совпадает с зафиксированным в experiment run?

# Ноутбук «у DS» — единственный источник модели?
git log --oneline src/ | head      # обучение вообще в git?
ls data/raw | head                 # данные версионируются (dvc)?
```

**Топ проблем:**

| Симптом | Причина | Действие |
| :--- | :--- | :--- |
| «У меня работало» | unpinned зависимости / другие данные | pin версий, DVC, логировать хэш данных в run |
| Метрика прыгает между прогонами | seed не зафиксирован (или GPU-недетерминизм) | seed везде + `CUBLAS_WORKSPACE_CONFIG` для CUDA |
| Никто не знает, какая модель в проде | нет registry | MLflow Registry + stage-деплой |
| Обучение нельзя повторить | ноутбук удалён/изменён | train.py в git, ноутбук — только исследования |

---

### 2.4 Интеграция со стеком

- **Git + CI:** код/параметры/тесты — в Git; пайплайн обучения запускается CI как обычный job (с GPU-раннером при необходимости).
- **DVC + MinIO:** данные/модели — в object storage (см. [20.8](../20-senior-stack/08-storage-s3-etcd-longhorn.md)), в Git — только указатели.
- **Registry → GitOps:** продакшн-модель = запись в registry (stage: Production) + тег образа в Git; деплой через ArgoCD как любое приложение.
- **Мониторинг:** метрики сервиса модели в Prometheus; drift-отчёты Evidently — артефакт CI/расписания.

---

### 2.5 Проверь себя — 5 вопросов

**В1. Чем continuous training (CT) принципиально отличается от CI/CD, и почему без него MLOps не MLOps?**

<details><summary>Ответ</summary>
CI/CD доставляет неизменяемый артефакт; в ML артефакт (модель) деградирует сам из-за дрейфа данных. CT — автоматическое переобучение по расписанию/триггеру с валидацией метрик перед заменой. Без CT модель гарантированно деградирует.
</details>

**В2. Сценарий: модель обучили в январе, в марте «то же самое» переобучили — метрика упала с 0.87 до 0.71. Код не менялся. Топ-3 гипотезы?**

<details><summary>Ответ</summary>
1) Изменились данные (drift/новая выгрузка). 2) Изменились зависимости (unpinned sklearn/xgboost). 3) Не зафиксирован seed/GPU-недетерминизм. Проверять по логам experiment run: хэш данных, versions, params.
</details>

**В3. Найдите ошибку: датасет 2GB закоммитили в Git «чтобы всё было воспроизводимо».**

<details><summary>Ответ</summary>
Git не для бинарных данных: репо разбухает, клоны медленные, диффы бессмысленны. Данные — в DVC (указатель .dvc в Git, содержимое в S3/MinIO).
</details>

**В4. В чём разница между data drift и concept drift, и какой мониторинг ловит каждый?**

<details><summary>Ответ</summary>
Data drift — изменилось распределение входов X (ловится сравнением распределений фич: PSI/KS-тест). Concept drift — изменилась связь X→Y при стабильных X (ловится только качеством: метрика на свежей разметке/прокси-метрики). Модель может «поехать» и без видимого data drift.
</details>

**В5. Зачем feature skew опаснее обычного бага, и где он возникает?**

<details><summary>Ответ</summary>
Skew — фичи считаются РАЗНЫМ кодом при обучении (batch, Python) и в проде (online, другой сервис/язык): модель получает не те значения, молча деградирует. Возникает на стыке train/serving; лечится единым кодом фич (feature store/общая библиотека) и логированием фич в проде.
</details>

---

### 2.6 Практика — 3 задания

#### Задание 1: Структура воспроизводимого ML-проекта

**Условие:** превратить «ноутбук + csv» в репозиторий по шаблону из 2.2.

**Шаг 1** — каркас (стартовое состояние: только train.ipynb и data.csv):
```bash
mkdir -p ml-project/{src,data/raw,models,tests} && cd ml-project
mv ../train.ipynb notebooks/ 2>/dev/null; cp ../data.csv data/raw/
pip freeze > requirements.txt        # зафиксировать окружение
```

**Шаг 2** — params.yaml (шаблон из 2.2) и train.py с фиксированным seed и mlflow-логированием.

**Шаг 3** — проверка воспроизводимости: два прогона дают одинаковые метрики:
```bash
python src/train.py && python src/train.py
# Ожидание: roc_auc идентичен в обоих прогонах (до 4-5 знака)
```

**Проверь себя:** `git status` показывает только код и params.yaml (data.csv — НЕ в git); два прогона train.py дают одинаковый roc_auc.

**Разбор:** воспроизводимость = pinned-версии + seed + данные по ссылке (DVC) + логирование хэша данных. Ноутбук остаётся для исследований, но продакшн-путь — train.py.

#### Задание 2: Хэш данных как артефакт доверия

**Условие:** в experiment run должно быть видно, на каких данных обучались.

```python
# src/prepare.py — дописать в конец
import hashlib, json
h = hashlib.sha256(open("data/raw/orders.csv","rb").read()).hexdigest()
json.dump({"data_sha256": h}, open("data/raw/.hash","w"))
# и в train.py: mlflow.log_param("data_sha256", h)
```

```bash
python src/prepare.py && python src/train.py
# В MLflow UI у run'а появился параметр data_sha256 ✅
# Данные подменили → хэш другой → «это другая модель» доказуемо
```

**Проверь себя:** измените одну строку в data/raw/orders.csv → после prepare+train параметр data_sha256 в MLflow изменился.

**Разбор:** хэш данных в параметрах run'а — минимальный lineage: связывает модель с точным набором данных. Следующий уровень — DVC (23.3).

#### Задание 3: Dockerfile для ML-обучения (детерминированный)

**Условие:** обучение должно запускаться одинаково локально и в CI.

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ src/ params.yaml data/raw/.hash ./
ENV PYTHONHASHSEED=0
CMD ["python", "src/train.py"]
```

```bash
docker build -t ml-train:1.0.0 . && docker run --rm ml-train:1.0.0
# Два прогона контейнера → одинаковый roc_auc
```

**Проверь себя:** `docker run --rm ml-train:1.0.0` дважды — метрики идентичны; образ тегируется версией (не latest).

**Разбор:** PYTHONHASHSEED + pinned requirements + фиксация кода в образе = детерминированный билд. CI запускает этот же образ — «у меня работало» исчезает как класс.

---

*Следующая страница: [23.2 Experiment Tracking: MLflow](02-mlflow-tracking.md)*
