# 🐍 13. Python OOP Deep Dive: классы, MRO, дескрипторы, Protocol, DevOps-архитектура

> От `class` до `ResourceManager`: когда `inheritance` вредит, почему `__eq__` ломает `__hash__`, и как `Protocol` спасает DevOps-код.

---

## 🧱 Основы: что такое класс на самом деле

```python
class Service:
    kind: str = "generic"          # class attribute — один на всех
    def __init__(self, name: str):
        self.name = name           # instance attribute — у каждого свой dict
        self._state = "pending"    # _private по соглашению, __mangled — name mangling
    def start(self):               # method → descriptor, self подставляется
        self._state = "running"
```

| Сущность | Где живёт | Как создаётся |
|---|---|---|
| `type` | метакласс по умолчанию | `type("Svc", (object,), {"kind":"x"})` |
| `__new__` | выделяет `object` | `def __new__(cls, *a, **k): obj = super().__new__(cls)` |
| `__init__` | инициализирует уже созданный `self` | `def __init__(self, name): self.name=name` |
| `__call__` | делает экземпляр вызываемым | `def __call__(self, *a): ...` |

```python
# Как Python создаёт класс
class Meta(type):
    def __new__(m, n, b, d):
        d["created"] = __import__("datetime").datetime.utcnow()
        return super().__new__(m, n, b, d)

class Resource(metaclass=Meta):
    pass
print(Resource.created)  # метакласс добавил поле
```

---

## 🔬 `__new__` vs `__init__` — полный lifecycle объекта

```python
class Singleton:
    _instance = None
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance    # один и тот же объект
    def __init__(self, name: str):
        self.name = name        # вызывается каждый раз!

a = Singleton("first")
b = Singleton("second")
assert a is b                   # True — один объект
print(a.name)                   # "second" — __init__ перезаписал
```

**Порядок:** `cls.__call__` → `__new__(cls)` → `__init__(self)` → return `self`.

| Метод | Когда | Зачем |
|---|---|---|
| `__new__` | до создания объекта | singleton, immutable (`str`, `int`, `tuple` subclass), кеширование, ORM |
| `__init__` | после создания | инициализация полей, валидация |

```python
# Immutable subclass — нужен __new__
class PositiveInt(int):
    def __new__(cls, value):
        if value < 0:
            raise ValueError(f"must be positive: {value}")
        return super().__new__(cls, value)
    # __init__ не нужен — int уже immutable

print(PositiveInt(42))    # 42
# PositiveInt(-1)          # ValueError
```

**Правило:** в 99% случаев достаточно `__init__`. `__new__` — для singleton, immutable types, metaclass magic.

---

## 🎰 `__slots__` — оптимизация памяти

```python
class PodStatus:
    __slots__ = ("name", "phase", "ready")
    def __init__(self, name: str, phase: str, ready: bool):
        self.name = name
        self.phase = phase
        self.ready = ready

p = PodStatus("nginx", "Running", True)
# p.extra = 1  # AttributeError: 'PodStatus' object has no attribute 'extra'
# p.__dict__   # AttributeError: нет __dict__
```

| Без `__slots__` | С `__slots__` |
|---|---|
| ~300 bytes/instance (64-bit) | ~72 bytes/instance |
| `__dict__` создаётся | нет `__dict__` — нельзя добавить атрибуты |
| Гибко | Быстрее доступ к атрибутам на ~20% |

```python
# slots + наследование — осторожно
class Base:
    __slots__ = ("x",)
class Child(Base):
    __slots__ = ("y",)     # добавляет свои, наследует Base.__slots__
    # НЕ повторяй "x" в Child.__slots__ — будет дубликат дескриптора

# slots + dataclass
from dataclasses import dataclass
@dataclass(slots=True)     # Python 3.10+ — генерирует __slots__ автоматически
class Config:
    env: str
    replicas: int = 3
```

**Когда использовать:** тысячи объектов одного типа (мониторинг metrics, event stream, ORM rows). Не для обычных классов.

---

## 🏭 `classmethod` и `staticmethod`

```python
from pathlib import Path
import yaml

class AppConfig:
    def __init__(self, env: str, replicas: int, image: str):
        self.env = env
        self.replicas = replicas
        self.image = image

    @classmethod
    def from_yaml(cls, path: str) -> "AppConfig":
        """Фабричный метод — альтернативный конструктор"""
        data = yaml.safe_load(Path(path).read_text())
        return cls(                     # cls, не AppConfig — работает с наследниками
            env=data["env"],
            replicas=data.get("replicas", 3),
            image=data["image"],
        )

    @classmethod
    def from_env(cls) -> "AppConfig":
        """Из переменных окружения"""
        import os
        return cls(
            env=os.environ.get("ENV", "dev"),
            replicas=int(os.environ.get("REPLICAS", "3")),
            image=os.environ.get("IMAGE", "nginx:latest"),
        )

    @staticmethod
    def validate_image(image: str) -> bool:
        """Не зависит от cls/self — чистая функция"""
        return ":" in image and not image.startswith(":")

# Использование
cfg = AppConfig.from_yaml("config.yaml")      # classmethod
cfg2 = AppConfig.from_env()                     # classmethod
print(AppConfig.validate_image("nginx:1.25"))   # staticmethod → True
```

| Тип | Первый аргумент | Зачем |
|---|---|---|
| method | `self` | работа с экземпляром |
| `@classmethod` | `cls` | фабрики, альтернативные конструкторы |
| `@staticmethod` | ничего | утилиты, валидация, не зависит от класса |

**Правило:** если метод не использует `self` → `@staticmethod` или свободная функция. Если использует `cls` (для наследования) → `@classmethod`.

---

## 🔒 Encapsulation: public / _private / __mangled / property

```python
class Account:
    def __init__(self, key: str):
        self._level = 1                 # _private — не трогай вне класса
        self.__key = key                # __key → _Account__key (mangling, не приватность!)
    @property
    def key(self) -> str:
        return "***" + self.__key[-4:]  # чтение через вычисление
    @key.setter
    def key(self, v: str):
        if len(v) < 8: raise ValueError("too short")
        self.__key = v
    @key.deleter
    def key(self): del self.__key

a = Account("secret123456")
a.key = "newsecret123"   # setter
print(a.key)             # property getter, не a.__key напрямую
# print(a.__key)  # AttributeError: mangling
print(a._Account__key)   # так можно, но не нужно — апи через property
```

**Правило:** `_` — договор, `__` — не безопасность, а защита от коллизий в `MRO` (например, `Base.__value` vs `Child.__value`).

### Инварианты через property

```python
class ServerConfig:
    def __init__(self, port: int):
        self.port = port               # → вызывает setter!

    @property
    def port(self) -> int:
        return self._port

    @port.setter
    def port(self, value: int):
        if not 1 <= value <= 65535:
            raise ValueError(f"invalid port: {value}")
        self._port = value             # хранение в _port, не port!

cfg = ServerConfig(8080)               # setter валидирует
# cfg.port = 99999                     # ValueError
```

---

## 🧬 Inheritance, super(), MRO, C3

```python
class Base:
    def ping(self): print("Base")

class A(Base):
    def ping(self): print("A"); super().ping()

class B(Base):
    def ping(self): print("B"); super().ping()

class C(A, B): pass   # diamond

print(C.mro())
# [<class 'C'>, <class 'A'>, <class 'B'>, <class 'Base'>, <class 'object'>]
C().ping()  # A → B → Base  (C3 линеаризация, не глубина)

# super() ≠ "вызови родителя". Это next в MRO.
# В A super().ping() → B.ping(), не Base!
```

**C3:** `L(C) = [C] + merge(L(A), L(B), [A,B])` — ширинуёт, сохраняет порядок родителей. `super()` cooperative: каждый `__init__` должен делать `super().__init__()` иначе diamond сломается.

### Множественное наследование — Mixins

```python
import logging

class LoggingMixin:
    """Добавляет self.log — не требует __init__"""
    @property
    def log(self):
        return logging.getLogger(self.__class__.__name__)

class RetryMixin:
    """Добавляет retry — не требует __init__"""
    retry_count: int = 3
    def with_retry(self, fn, *a, **k):
        for i in range(self.retry_count):
            try: return fn(*a, **k)
            except Exception as e:
                self.log.warning("retry %d: %s", i, e)
                if i == self.retry_count - 1: raise

class K8sClient(LoggingMixin, RetryMixin):
    def __init__(self, endpoint: str):
        self.endpoint = endpoint
    def get_pods(self):
        return self.with_retry(self._do_get, "/api/v1/pods")
    def _do_get(self, path):
        self.log.info("GET %s%s", self.endpoint, path)
        return {"items": []}

client = K8sClient("https://k8s.local:6443")
client.get_pods()
```

**Правило Mixins:** Mixin не имеет `__init__`, не хранит state, добавляет одну capability. Имя заканчивается на `Mixin`.

---

## 🦆 Polymorphism: duck typing vs Protocol vs ABC

```python
# Duck typing — достаточно метода
def deploy(r):
    r.apply()  # если есть apply — уже ресурс

# Protocol — structural typing, проверяется mypy, без наследования
from typing import Protocol
class Applier(Protocol):
    def apply(self) -> None: ...
    def delete(self) -> None: ...

def rollout(r: Applier):  # примет любой с apply/delete, не только наследника
    r.apply()

# ABC — nominal + нельзя инстанцировать
from abc import ABC, abstractmethod
class CloudProvider(ABC):
    @abstractmethod
    def create_vm(self, spec: dict) -> str: ...
class AWSProvider(CloudProvider):
    def create_vm(self, spec): return "i-123"
# CloudProvider()  # TypeError abstract
```

**Когда что:**
- `Protocol` → плагины/providers в DevOps (AWS/GCP/Azure один интерфейс, без общего base)
- `ABC` → обязательный каркас с общей логикой (`BaseResource` с `retry` + `logging`).

### `runtime_checkable` Protocol

```python
from typing import Protocol, runtime_checkable

@runtime_checkable
class Deployable(Protocol):
    def deploy(self, env: str) -> None: ...

class HelmRelease:
    def deploy(self, env: str) -> None:
        print(f"helm upgrade --namespace {env}")

print(isinstance(HelmRelease(), Deployable))  # True — structural check at runtime
```

---

## 🎭 Composition vs Inheritance — DevOps выбор

```python
# ❌ Плохо: God object наследованием
class AWSResource: ...
class AWSVM(AWSResource): ...
class AWSVMWithLoggingAndRetryAndMetrics(AWSVM): ...  # взрыв

# ✅ Хорошо: composition + Protocol
class Retry:
    def __init__(self, tries=3): self.tries=tries
    def run(self, fn, *a, **k):
        for i in range(self.tries):
            try: return fn(*a, **k)
            except Exception as e:
                if i==self.tries-1: raise
class KubernetesDeployer:
    def __init__(self, client: Applier, retry: Retry):
        self.client, self.retry = client, retry
    def apply(self, manifest):
        return self.retry.run(self.client.apply, manifest)

# Тестируемо: подмени Applier → FakeApplier, Retry → NoRetry
```

**Правило:** `is-a` (VM is-a Resource) → inheritance. `has-a`/`uses-a` (Deployer uses Applier + Retry) → composition.

### Dependency Injection — ключ к тестируемости

```python
from typing import Protocol
from unittest.mock import MagicMock

class StorageBackend(Protocol):
    def upload(self, key: str, data: bytes) -> str: ...
    def download(self, key: str) -> bytes: ...

class S3Backend:
    def __init__(self, bucket: str):
        self.bucket = bucket
    def upload(self, key, data):
        return f"s3://{self.bucket}/{key}"
    def download(self, key):
        return b"data"

class BackupManager:
    """DI: зависимости передаются в __init__, не создаются внутри"""
    def __init__(self, storage: StorageBackend, compress: bool = True):
        self.storage = storage
        self.compress = compress

    def backup(self, name: str, data: bytes) -> str:
        if self.compress:
            import gzip
            data = gzip.compress(data)
        return self.storage.upload(f"backups/{name}", data)

# Production
manager = BackupManager(S3Backend("my-backups"), compress=True)

# Test — без реального S3
def test_backup():
    fake = MagicMock(spec=StorageBackend)
    fake.upload.return_value = "s3://test/backups/db.sql"
    mgr = BackupManager(fake, compress=False)
    result = mgr.backup("db.sql", b"data")
    fake.upload.assert_called_once_with("backups/db.sql", b"data")
    assert result == "s3://test/backups/db.sql"
```

---

## 📐 Data model: magic methods

```python
class Quantity:
    def __init__(self, v, unit): self.v, self.unit = v, unit
    def __repr__(self): return f"Quantity({self.v!r}, {self.unit!r})"  # для разработчика, eval-совместимо
    def __str__(self): return f"{self.v}{self.unit}"                    # для пользователя
    def __eq__(self, o):
        if not isinstance(o, Quantity): return NotImplemented
        return self.v==o.v and self.unit==o.unit
    def __hash__(self): return hash((self.v, self.unit))  # если __eq__, нужен __hash__ или __hash__=None → unhashable!
    def __len__(self): return int(self.v)
    def __iter__(self): yield self.v; yield self.unit
    def __getitem__(self, i): return (self.v, self.unit)[i]
    def __call__(self, scale): return Quantity(self.v*scale, self.unit)
    def __contains__(self, x): return x==self.unit

q = Quantity(3, "Gi")
print(repr(q), str(q), len(q), q(2), "Gi" in q, q[0])
# __hash__ нужен для set/dict ключей; mutable → __hash__=None
```

**Ловушки:**
- Определили `__eq__` без `__hash__` → `TypeError: unhashable`
- `__repr__` должен быть однозначным, `__str__` — красивым.
- `return NotImplemented` (не `raise`) — Python попробует `other.__eq__(self)`.

### Context Managers — `__enter__` / `__exit__`

```python
class DatabaseConnection:
    def __init__(self, dsn: str):
        self.dsn = dsn
        self.conn = None

    def __enter__(self):
        self.conn = self._connect()
        return self.conn

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.conn:
            if exc_type:
                self.conn.rollback()
            else:
                self.conn.commit()
            self.conn.close()
        return False  # не подавляем исключения

    def _connect(self):
        import psycopg2
        return psycopg2.connect(self.dsn)

# Использование
with DatabaseConnection("postgresql://localhost/mydb") as conn:
    cursor = conn.cursor()
    cursor.execute("SELECT 1")
# conn автоматически закрыт, транзакция committed/rolled back
```

```python
# contextlib — проще для простых случаев
from contextlib import contextmanager

@contextmanager
def temp_env(key: str, value: str):
    """Временно устанавливает переменную окружения"""
    import os
    old = os.environ.get(key)
    os.environ[key] = value
    try:
        yield value
    finally:
        if old is None:
            del os.environ[key]
        else:
            os.environ[key] = old

with temp_env("LOG_LEVEL", "DEBUG") as level:
    print(f"Logging at {level}")
# LOG_LEVEL восстановлен
```

---

## 🏷️ dataclasses

```python
from dataclasses import dataclass, field, asdict, replace
from typing import ClassVar

@dataclass(frozen=True, slots=True, order=True)  # frozen=immutable → hashable если поля hashable
class Config:
    env: str
    replicas: int = 3
    tags: dict = field(default_factory=dict)  # never mutable default!
    KIND: ClassVar[str] = "deploy"            # не поле, а класс-константа
    def __post_init__(self):
        if self.replicas < 1: raise ValueError("replicas")

c = Config("prod", 5)
print(asdict(c), replace(c, replicas=6))
# vs NamedTuple — frozen но без __post_init__/default_factory
# vs Pydantic — dataclass без валидации (нужна Pydantic для from_env + regex)
```

**Выбор:** `dataclass` — value objects без валидации, `NamedTuple` — tuple с именами, `Pydantic` — config с `validation` + `env` + `JSON`.

### Pydantic vs dataclass

```python
from pydantic import BaseModel, Field, field_validator
from typing import Literal

class DeployConfig(BaseModel):
    """Pydantic: валидация + сериализация + env"""
    env: Literal["prod", "staging", "dev"]
    replicas: int = Field(ge=1, le=100, default=3)
    image: str = "nginx:latest"

    @field_validator("image")
    @classmethod
    def validate_image(cls, v):
        if ":" not in v:
            raise ValueError("image must include tag")
        return v

# Автоматическая валидация
cfg = DeployConfig(env="prod", replicas=5, image="nginx:1.25")
print(cfg.model_dump_json())
```

---

## 🔮 Descriptors — как работает property

```python
class Clamped:
    def __set_name__(self, owner, name): self.name=f"_{name}"
    def __get__(self, obj, objtype=None):
        if obj is None: return self
        return getattr(obj, self.name)
    def __set__(self, obj, value):
        if not 0 <= value <= 100: raise ValueError()
        setattr(obj, self.name, value)

class Probe:
    cpu = Clamped()          # descriptor в классе, а не в __init__
    def __init__(self, cpu): self.cpu=cpu  # → Clamped.__set__

print(Probe(50).cpu)   # 50
# Probe.cpu — дескриптор, Probe(50).__dict__["_cpu"]=50
# property, method, classmethod, staticmethod — все дескрипторы
```

**Связь:** `ORM` поле `Field()` → дескриптор, `@property` → дескриптор с `__get__/__set__`.

---

## 👑 Metaclasses — когда оправдано

```python
# Type — сам класс: type(obj) == obj.__class__, type(type) == type
# metaclass — класс для класса

class RegistryMeta(type):
    registry = {}
    def __new__(m, n, b, d):
        cls = super().__new__(m, n, b, d)
        m.registry[n] = cls  # авто-регистрация всех наследников
        return cls

class Resource(metaclass=RegistryMeta): pass
class Pod(Resource): pass
class Service(Resource): pass
print(RegistryMeta.registry)  # {'Pod':..., 'Service':...} — без декораторов
# Используется в: Django Model, Pydantic, ABCMeta, dataclasses
```

**Правило:** metaclass — для фреймворков, не для приложений. В App достаточно `__init_subclass__`.

### `__init_subclass__` — лёгкая альтернатива metaclass

```python
class Plugin:
    """Авто-регистрация без metaclass"""
    _plugins: dict[str, type] = {}

    def __init_subclass__(cls, plugin_name: str = "", **kwargs):
        super().__init_subclass__(**kwargs)
        name = plugin_name or cls.__name__.lower()
        Plugin._plugins[name] = cls

    @classmethod
    def get(cls, name: str) -> "Plugin":
        return cls._plugins[name]()

class PrometheusExporter(Plugin, plugin_name="prometheus"):
    def collect(self): return {"up": 1}

class LokiExporter(Plugin, plugin_name="loki"):
    def collect(self): return {"streams": 42}

print(Plugin._plugins)  # {'prometheus': ..., 'loki': ...}
exporter = Plugin.get("prometheus")
print(exporter.collect())  # {'up': 1}
```

---

## 🧬 ABC и Protocols в DevOps

```python
from typing import Protocol
from abc import ABC, abstractmethod

class Notifier(Protocol):  # structural — любой с notify
    def notify(self, msg: str) -> None: ...

class SlackNotifier:
    def notify(self, msg): print(f"slack {msg}")

def alert(n: Notifier, msg): n.notify(msg)
alert(SlackNotifier(), "prod down")  # ok, без наследования

class Provider(ABC):  # nominal — обязан наследоваться
    @abstractmethod
    def apply(self, manifest: dict) -> None: ...
    def apply_with_retry(self, manifest):  # общая логика
        for i in range(3):
            try: return self.apply(manifest)
            except Exception: continue
```

---

## 🧩 `typing.Generic` — типизированные контейнеры

```python
from typing import TypeVar, Generic, Iterator

T = TypeVar("T")

class LRUCache(Generic[T]):
    """Типизированный LRU кеш"""
    def __init__(self, maxsize: int = 128):
        self._data: dict[str, T] = {}
        self._maxsize = maxsize

    def get(self, key: str) -> T | None:
        return self._data.get(key)

    def put(self, key: str, value: T) -> None:
        if len(self._data) >= self._maxsize:
            oldest = next(iter(self._data))
            del self._data[oldest]
        self._data[key] = value

    def __iter__(self) -> Iterator[tuple[str, T]]:
        yield from self._data.items()

# Использование — mypy проверяет типы
cache: LRUCache[dict] = LRUCache(maxsize=100)
cache.put("pod-nginx", {"status": "Running"})
result: dict | None = cache.get("pod-nginx")
```

---

## 💥 Anti-patterns и рефакторинг

| Антипаттерн | Почему плохо | Рефакторинг |
|---|---|---|
| God object 3000 строк | 15 обязанностей, нет тестов | Разбить на `Client, Retry, Logger, Applier` + Protocol |
| Deep inheritance 5 уровней | `super()` хрупок, diamond `MRO` | `composition` + `Protocol` |
| `__init__` делает `requests.get` | Не тестируемо, side-effect в конструкторе | `__init__` хранит config, `connect()` делает IO |
| `BaseCloudProvider` с `if cloud=="aws"` | Нарушение LSP | `Provider` Protocol + 3 класса `AWS/GCP/AzureProvider` |
| `config: dict` везде | Нет валидации, `config["repicas"]` опечатка | `Pydantic Config` с `Literal["prod","staging"]` |
| Mutable class attribute `tags = {}` | Все экземпляры делят один dict | `field(default_factory=dict)` |
| Singleton через `__new__` везде | Скрытое глобальное состояние, невозможно тестировать | Module-level instance или DI |

### SOLID в DevOps Python

| Принцип | Нарушение | Правильно |
|---|---|---|
| **SRP** | `DeployManager` делает deploy + logging + metrics + config | Отдельные классы: `Deployer`, `MetricsCollector`, `ConfigParser` |
| **OCP** | `if provider == "aws": ... elif "gcp": ...` | `Provider(Protocol)` + `AWSProvider`, `GCPProvider` |
| **LSP** | `Square(Rectangle)` где `set_width` ломает `set_height` | Отдельные классы или `Shape(Protocol)` |
| **ISP** | `CloudProvider` с 20 методами | `Compute(Protocol)`, `Storage(Protocol)`, `Notification(Protocol)` |
| **DIP** | `class Manager: def __init__(self): self.db = PostgreSQL()` | `def __init__(self, db: Database)` — зависимость через Protocol |

---

## 🎯 Паттерны проектирования в DevOps

### Strategy — сменяемый алгоритм

```python
from typing import Protocol

class DeployStrategy(Protocol):
    def execute(self, manifest: dict, env: str) -> None: ...

class HelmDeploy:
    def execute(self, manifest, env):
        print(f"helm upgrade -n {env} {manifest['name']}")

class KustomizeDeploy:
    def execute(self, manifest, env):
        print(f"kubectl apply -k overlays/{env}")

class ArgoSyncDeploy:
    def execute(self, manifest, env):
        print(f"argocd app sync {manifest['name']}")

class DeployPipeline:
    def __init__(self, strategy: DeployStrategy):
        self.strategy = strategy
    def run(self, manifest: dict, env: str):
        print(f"Deploying to {env}...")
        self.strategy.execute(manifest, env)

# Runtime selection
pipeline = DeployPipeline(HelmDeploy())
pipeline.run({"name": "api"}, "staging")
# Легко переключить: DeployPipeline(ArgoSyncDeploy())
```

### Factory — создание объектов

```python
class ProviderFactory:
    _providers: dict[str, type] = {}

    @classmethod
    def register(cls, name: str):
        def decorator(provider_cls):
            cls._providers[name] = provider_cls
            return provider_cls
        return decorator

    @classmethod
    def create(cls, name: str, **kwargs):
        if name not in cls._providers:
            raise ValueError(f"Unknown provider: {name}")
        return cls._providers[name](**kwargs)

@ProviderFactory.register("aws")
class AWSProvider:
    def __init__(self, region="us-east-1"): self.region = region

@ProviderFactory.register("gcp")
class GCPProvider:
    def __init__(self, project="default"): self.project = project

# Usage
provider = ProviderFactory.create("aws", region="eu-west-1")
```

### Observer — события и подписки

```python
from typing import Callable

class EventBus:
    def __init__(self):
        self._handlers: dict[str, list[Callable]] = {}

    def on(self, event: str, handler: Callable):
        self._handlers.setdefault(event, []).append(handler)

    def emit(self, event: str, **data):
        for handler in self._handlers.get(event, []):
            handler(**data)

# Использование в pipeline
bus = EventBus()
bus.on("deploy.start", lambda name, env: print(f"Deploying {name} to {env}"))
bus.on("deploy.done", lambda name, env: print(f"{name} deployed to {env}"))
bus.on("deploy.fail", lambda name, error: print(f"{name} failed: {error}"))

bus.emit("deploy.start", name="api", env="prod")
```

---

## 🧪 Тестирование OOP кода

```python
from unittest.mock import MagicMock, patch
from typing import Protocol

class Applier(Protocol):
    def apply(self, manifest: dict) -> None: ...

class ResourceManager:
    def __init__(self, applier: Applier):
        self.applier = applier
    def sync(self, manifests: list[dict]):
        for m in manifests:
            self.applier.apply(m)

# Test 1: MagicMock с spec — проверяет сигнатуру
def test_sync_calls_apply():
    fake = MagicMock(spec=Applier)
    rm = ResourceManager(fake)
    rm.sync([{"name": "pod-1"}, {"name": "pod-2"}])
    assert fake.apply.call_count == 2
    fake.apply.assert_any_call({"name": "pod-1"})

# Test 2: side_effect для ошибок
def test_sync_handles_failure():
    fake = MagicMock(spec=Applier)
    fake.apply.side_effect = [None, ConnectionError("timeout")]
    rm = ResourceManager(fake)
    try:
        rm.sync([{"name": "ok"}, {"name": "fail"}])
    except ConnectionError:
        pass
    assert fake.apply.call_count == 2

# Test 3: patch для замены зависимости
class HardcodedManager:
    def __init__(self):
        from kubernetes import client
        self.api = client.CoreV1Api()

@patch("kubernetes.client.CoreV1Api")
def test_hardcoded(mock_api):
    mgr = HardcodedManager()
    # mock_api подставлен вместо реального
```

**Правила тестирования OOP:**

1. `MagicMock(spec=Protocol)` — mypy-совместимый мок
2. DI → тестируемость: не `self.db = PostgreSQL()`, а `self.db = db`
3. Не мокайте то, что не владеете — оборачивайте в свой Protocol
4. `side_effect` для симуляции ошибок
5. Один тест = одно поведение, не один метод

---

## 🛠️ Проект: DevOps Resource Manager — V1 → V2 → Production

**Задача:** CLI `resman` управляет ресурсами (Pod/Service) через `Provider` интерфейс, с конфигурацией, логами, ретраем.

### V1 — процедурный (антипаттерн)

```python
# main_v1.py — 200 строк if cloud=="aws"
def apply(manifest):
    if manifest["kind"]=="Pod": print("apply pod")
    elif manifest["cloud"]=="aws": print("aws create")
    logging.info("done")  # нет структуры
```

Проблемы: God function, `if cloud` ветвление, нет тестов, `dict` без валидации.

### V2 — классы + composition + Protocol + DI

```python
from typing import Protocol
from dataclasses import dataclass, field
from abc import ABC, abstractmethod
import logging

class Applier(Protocol):
    def apply(self, manifest: dict) -> None: ...
    def delete(self, name: str) -> None: ...

@dataclass(frozen=True, slots=True)
class RetryPolicy:
    tries: int = 3
    def run(self, fn, *a, **k):
        for i in range(self.tries):
            try: return fn(*a, **k)
            except Exception as e:
                if i==self.tries-1: raise
                logging.warning("retry %s %s", i, e)

class AWSProvider:
    def apply(self, m): print(f"AWS {m['name']}")
    def delete(self, n): print(f"AWS del {n}")
class K8sProvider:
    def apply(self, m): print(f"K8s {m['name']}")
    def delete(self, n): print(f"K8s del {n}")

class ResourceManager:
    def __init__(self, applier: Applier, retry: RetryPolicy, logger: logging.Logger):
        self.applier, self.retry, self.log = applier, retry, logger  # DI
    def sync(self, manifests: list[dict]):
        for m in manifests:
            self.log.info("apply %s", m["name"])
            self.retry.run(self.applier.apply, m)

# DI: легко тестировать
fake = AWSProvider()
rm = ResourceManager(fake, RetryPolicy(tries=2), logging.getLogger())
rm.sync([{"name":"pod-1"}])
```

### Production — конфигурация + валидация + CLI

```python
from pydantic import BaseModel, Field
from typing import Literal
class Config(BaseModel):
    env: Literal["prod","staging"]
    provider: Literal["aws","k8s"]
    retries: int = Field(ge=1, le=5, default=3)

# CLI Typer
import typer
app = typer.Typer()
@app.command()
def sync(env: str = "prod"):
    cfg = Config(env=env, provider="k8s")  # валидация
    manager = ResourceManager(K8sProvider(), RetryPolicy(cfg.retries), logging.getLogger())
    manager.sync([{"name":"svc"}])
```

**Эволюция:** V1 (процедура, 0 тестов) → V2 (классы+Protocol+DI, 3 теста `MagicMock`) → Production (Pydantic Config + `slog JSON` + `/health` + `pytest` 90% + `mypy`).

---

## ⚠️ Когда НЕ использовать OOP

| Ситуация | Что лучше | Почему |
|---|---|---|
| Bash-обёртка в 50 строк | Функции | Класс = оверинжиниринг для скрипта |
| ETL pipeline (extract-transform-load) | Функции + pipe | Данные текут, состояния нет |
| One-shot CLI | `click`/`typer` + функции | Класс вокруг одной функции — бессмысленно |
| Stateless валидация | `@validator` или чистая функция | Не нужен `self` |
| Kubernetes manifest generation | Функция → dict | YAML template проще класса |

```python
# ❌ Бессмысленный класс
class Validator:
    def __init__(self): pass
    def validate(self, data): return len(data) > 0

# ✅ Просто функция
def validate(data: dict) -> bool:
    return len(data) > 0
```

**Правило:** класс нужен когда есть **состояние** + **поведение** + **несколько экземпляров**. Одна функция — не класс.

---

## ✅ Чек-лист зрелости OOP

- [ ] `dataclass/frozen/slots` где value object, `ClassVar` для констант
- [ ] `MRO` проверен `Cls.mro()`, `super()` cooperative
- [ ] `__eq__` → `__hash__` или `__hash__=None`, `__repr__` однозначен
- [ ] `Protocol` для плагинов, `ABC` для каркаса, composition над inheritance
- [ ] Descriptors/property не рекурсят (`self.x` vs `self._x`)
- [ ] `classmethod` фабрики vs `__init__` с if-logic
- [ ] `__slots__` для массовых объектов, не для обычных классов
- [ ] Context managers для ресурсов (DB, файлы, locks)
- [ ] DI через `__init__` — не создавать зависимости внутри
- [ ] Тесты через `MagicMock(spec=Protocol)` — не `patch` везде
- [ ] SOLID: SRP, OCP, LSP, ISP, DIP

---

## 🎤 Вопросы для повторения

**В1. Почему `super()` не «вызови родителя», а next в MRO?**

<details><summary>Ответ</summary>

`super()` возвращает proxy к следующему классу в `C.mro()` после текущего. В `C(A,B)` `A.super().ping()` пойдёт в `B`, не `Base`. Без cooperative `super()` diamond дублирует вызовы.

</details>

**В2. Почему `__eq__` без `__hash__` делает объект unhashable?**

<details><summary>Ответ</summary>

Хеш инвариант: `a==b ⇒ hash(a)==hash(b)`. Python после определения `__eq__` обнуляет `__hash__` чтобы не нарушить `set/dict`. Восстановление: `__hash__ = object.__hash__` если immutable или явно посчитай `hash((self.v,))`.

</details>

**В3. Когда `Protocol` лучше `ABC`?**

<details><summary>Ответ</summary>

`Protocol` — structural, не требует наследования, mypy проверяет, подходит для `Applier/Notifier` плагинов (AWS/GCP). `ABC` — nominal + общая логика `apply_with_retry`. Protocol — для границ, ABC — для каркаса.

</details>

**В4. Почему `tags: dict = {}` в dataclass — баг?**

<details><summary>Ответ</summary>

Мутабельный default делится между экземплярами: `Config("prod").tags["a"]=1` портит `Config("staging")`. Фикс `field(default_factory=dict)` — новый dict на экземпляр. `frozen` требует `default_factory`.

</details>

**В5. `__new__` vs `__init__` — когда нужен `__new__`?**

<details><summary>Ответ</summary>

`__new__` создаёт объект (до `__init__`), `__init__` инициализирует. `__new__` нужен для: 1) singleton, 2) immutable types (`int`, `str`, `tuple` subclass), 3) metaclass, 4) `__init_subclass__` альтернатива. В 99% хватает `__init__`.

</details>

**В6. Зачем `__slots__` и какие ограничения?**

<details><summary>Ответ</summary>

`__slots__` убирает `__dict__` — экономия ~3x памяти, +20% скорость доступа. Ограничения: нельзя добавить атрибуты динамически, нет `__dict__`, нужно повторять в наследниках (но не дублировать родительские). Используйте для массовых объектов (metrics, events).

</details>

**В7. Composition vs Inheritance — как выбрать?**

<details><summary>Ответ</summary>

`is-a` (VM is-a Resource) → inheritance. `has-a`/`uses-a` (Deployer uses Client + Retry) → composition. В DevOps почти всегда composition: поведения комбинируются (logging + retry + metrics), а не вкладываются (`AWSVMWithLoggingAndRetry`).

</details>

<!-- enriched:v2 -->
