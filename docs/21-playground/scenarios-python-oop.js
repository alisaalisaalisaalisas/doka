/* Python OOP — 30 сценариев: class, MRO, magic, dataclass, Protocol, composition, DI, anti-patterns, slots, new, classmethod, context manager, patterns */
S("Python — OOP","pyoop-1","class vs instance: mutable class attribute","Middle",
`<h3>Контекст</h3><p><b>Python — OOP.</b> class vs instance: mutable class attribute. Среда сценария симулирует Python — OOP-окружение; основные инструменты терминала здесь: команды терминала.</p><h3>Что происходит</h3><p>SLA по изоляции задач нарушен: <code>w1.tasks is w2.tasks == True</code>.</p><h3>Что нужно сделать</h3><ul><li>[ ] Понять почему <code>tasks</code> общий</li><li>[ ] Сделать его per-instance без ломания API</li><li>[ ] Проверить что <code>Worker("a").tasks</code> не делит список с <code>Worker("b")</code></li></ul><h3>Ограничения</h3><p>Не менять сигнатуру <code>__init__(self, name)</code> — только инициализацию.</p><h3>Проверка</h3><pre>см. подсказки</pre><p>для кода: кнопка «Проверить код»</p>`,
"dev@py:~$",
[["^python -c.*Worker",`assert passed`,"ok"],["^pytest",`2 passed`,"ok"]],
[{re:"^python -c",l:"Запустить проверку изоляции"}],
{files:{"main.py":"class Worker:\n    tasks = []\n    def __init__(self, name):\n        self.name=name\n    def add(self, t): self.tasks.append(t)\n"}, file:"main.py", checks:[{re:"self\\.tasks\\s*=\\s*\\[\\]",l:"tasks в __init__"}, {re:"def __init__",l:"__init__ есть"}],
 hints:["Подумайте где хранится `tasks`: в `Worker.__dict__` или в `w.__dict__`?","Сравните `Worker.__dict__['tasks']` vs `w.__dict__`; что делает `[]` на уровне класса?","Инициализируйте `self.tasks = []` внутри `__init__`, не трогая сигнатуру"],
 solutionFiles:{"main.py":"class Worker:\n    def __init__(self, name):\n        self.name = name\n        self.tasks = []\n    def add(self, t):\n        self.tasks.append(t)\n"},
 solution:{why:"Атрибут класса `tasks = []` — один список на всех экземплярах (разделяемый mutable). `w1.tasks.append` мутирует общий объект.", changes:["Перенести `self.tasks = []` в `__init__`","Оставить `name` как есть","Проверить `w1.tasks is not w2.tasks`"], code:"class Worker:\n    def __init__(self, name):\n        self.name=name\n        self.tasks = []\n    def add(self, t):\n        self.tasks.append(t)"}
});

S("Python — OOP","pyoop-2","property recursion","Middle",
`<h3>Контекст</h3><p>Класс <code>Account</code> с <code>@property key</code> падает в <code>RecursionError</code> при <code>a.key = \"new\"</code>.</p><h3>Что происходит</h3><p>Setter вызывает себя через <code>self.key</code>.</p><h3>Что нужно сделать</h3><ul><li>[ ] Найти рекурсию</li><li>[ ] Починить setter чтобы хранил в <code>__key</code></li><li>[ ] Getter должен маскировать: <code>\"***\"+__key[-4:]</code></li></ul><h3>Проверка</h3><pre>см. подсказки</pre><p>для кода: кнопка «Проверить код»</p>`,
"dev@py:~$",
[["^python -c.*Account",`***0123`,"ok"]],
[{re:"^python -c",l:"Проверить setter без рекурсии"}],
{files:{"main.py":"class Account:\n    def __init__(self, key):\n        self.__key=key\n    @property\n    def key(self): return self.key  # bug\n    @key.setter\n    def key(self, v): self.key=v\n"}, file:"main.py", checks:[{re:"self\\.__key",l:"хранение в __key"}, {re:"@property",l:"property сохранён"}],
 hints:["Где setter пишет? `self.key = v` снова вызовет setter — рекурсия.","Храните в `self.__key`, читайте из `self.__key`; `self.key` — это дескриптор, не поле.","Проверьте `self.__dict__` после присвоения — там должен быть `_Account__key`"],
 solutionFiles:{"main.py":"class Account:\n    def __init__(self, key):\n        self.__key = key\n    @property\n    def key(self):\n        return '***' + self.__key[-4:]\n    @key.setter\n    def key(self, v):\n        if len(v) < 8:\n            raise ValueError('key too short')\n        self.__key = v\n"},
 solution:{why:"`self.key = v` внутри `key.setter` вызывает тот же setter → бесконечная рекурсия. Нужно писать в `self.__key`.", changes:["Setter: `self.__key = v`","Getter: `return '***'+self.__key[-4:]`"], code:"class Account:\n    def __init__(self, key): self.__key=key\n    @property\n    def key(self): return '***'+self.__key[-4:]\n    @key.setter\n    def key(self, v):\n        if len(v)<8: raise ValueError\n        self.__key=v"}
});

S("Python — OOP","pyoop-3","MRO diamond","Intermediate",
`<h3>Контекст</h3><p><b>Python — OOP.</b> MRO diamond. Среда сценария симулирует Python — OOP-окружение; основные инструменты терминала здесь: команды терминала.</p><h3>Задача</h3><p>Добавьте <code>super().ping()</code> в <code>A</code> и <code>B</code> так чтобы кооперативный <code>super()</code> отработал по C3, и выведите <code>C.mro()</code>.</p>`,
"dev@py:~$",
[["^python main.py",`A\nB\nBase`,"ok"]],
[{re:"^python main.py",l:"Запустить и увидеть A B Base"}],
{files:{"main.py":"class Base:\n    def ping(self): print('Base')\nclass A(Base):\n    def ping(self): print('A')\nclass B(Base):\n    def ping(self): print('B')\nclass C(A,B): pass\nprint(C.mro())\nC().ping()\n"}, file:"main.py", checks:[{re:"super\\(\\)\\.ping",l:"super в A и B"}],
 hints:["`super()` — не родитель, а next в `C.mro()`; без `super()` в `A` цепочка оборвётся.","Добавьте `super().ping()` в каждый `ping`, сохранив `print` перед ним.","Проверьте `C.mro() == [C,A,B,Base,object]` и вывод `A B Base`"],
 solutionFiles:{"main.py":"class Base:\n    def ping(self): print('Base')\n\nclass A(Base):\n    def ping(self):\n        print('A')\n        super().ping()\n\nclass B(Base):\n    def ping(self):\n        print('B')\n        super().ping()\n\nclass C(A, B): pass\n\nprint(C.mro())\nC().ping()\n"},
 solution:{why:"Без `super()` в `A` вызов остановится на `A`; C3 требует кооперативных `super()` во всех узлах.", changes:["`A.ping`: `print('A'); super().ping()`","`B.ping`: `print('B'); super().ping()`"], code:"class Base:\n    def ping(self): print('Base')\nclass A(Base):\n    def ping(self): print('A'); super().ping()\nclass B(Base):\n    def ping(self): print('B'); super().ping()\nclass C(A,B): pass"}
});

S("Python — OOP","pyoop-4","dataclass mutable default","Junior",
`<h3>Контекст</h3><p><code>@dataclass class Config: tags: dict = {}</code> — все конфиги делят один dict.</p><h3>Что нужно сделать</h3><ul><li>[ ] Заменить на <code>field(default_factory=dict)</code></li><li>[ ] Сделать <code>frozen=True</code></li><li>[ ] Проверить <code>replace</code></li></ul>`,
"dev@py:~$",
[["^python -c.*Config",`ok`,"ok"]],
[{re:"python -c",l:"Проверить изоляцию dict"}],
{files:{"main.py":"from dataclasses import dataclass\n@dataclass\nclass Config:\n    env: str\n    tags: dict = {}\n"}, file:"main.py", checks:[{re:"field\\(default_factory=dict\\)",l:"factory"}, {re:"frozen\\s*=\\s*True",l:"frozen"}],
 hints:["`{}` создаётся один раз при определении класса — все экземпляры видят один объект.","`dataclass` требует `field(default_factory=dict)` для мутабельных.","`frozen=True` даёт `__hash__` если поля hashable"],
 solutionFiles:{"main.py":"from dataclasses import dataclass, field\n\n@dataclass(frozen=True, slots=True)\nclass Config:\n    env: str\n    tags: dict = field(default_factory=dict)\n"},
 solution:{why:"`tags = {}` — общий объект в `Config.__dict__`; мутация одного портит остальные.", changes:["`tags: dict = field(default_factory=dict)`","`@dataclass(frozen=True, slots=True)`"], code:"from dataclasses import dataclass, field\n@dataclass(frozen=True, slots=True)\nclass Config:\n    env: str\n    tags: dict = field(default_factory=dict)"}
});

S("Python — OOP","pyoop-5","Protocol vs ABC для Provider","Advanced",
`<h3>Контекст</h3><p>Есть <code>AWSProvider</code>, <code>GCPProvider</code> с <code>apply(manifest)</code>. Нужен полиморфизм без наследования.</p><h3>Задача</h3><p>Введите <code>Applier(Protocol)</code> с <code>apply/delete</code> и функцию <code>rollout(r: Applier)</code> без <code>isinstance</code>.</p>`,
"dev@py:~$",
[["^mypy main.py",`Success`,"ok"]],
[{re:"mypy",l:"Проверить structural typing"}],
{files:{"main.py":"from typing import Protocol\nclass Applier(Protocol):\n    def apply(self, m: dict) -> None: ...\n"}, file:"main.py", checks:[{re:"class Applier\\(Protocol\\)",l:"Protocol"}, {re:"def rollout.*Applier",l:"использование"}],
 hints:["`Protocol` — structural: достаточно метода `apply`, наследование не нужно.","Объявите `Applier(Protocol)` с двумя методами, используйте как аннотацию `r: Applier`.","Сравните с `ABC` — там нужен `class AWSProvider(Provider)`; Protocol — без базы"],
 solutionFiles:{"main.py":"from typing import Protocol\n\nclass Applier(Protocol):\n    def apply(self, m: dict) -> None: ...\n    def delete(self, n: str) -> None: ...\n\nclass AWSProvider:\n    def apply(self, m: dict) -> None:\n        print(f'AWS apply {m}')\n    def delete(self, n: str) -> None:\n        print(f'AWS delete {n}')\n\ndef rollout(r: Applier) -> None:\n    r.apply({'name': 'pod-1'})\n    r.delete('pod-old')\n\nrollout(AWSProvider())\n"},
 solution:{why:"Duck typing без Protocol не проверяется mypy; ABC требует наследования.", changes:["`Applier(Protocol)` с `apply/delete`","`def rollout(r: Applier)`"], code:"from typing import Protocol\nclass Applier(Protocol):\n    def apply(self, m: dict) -> None: ...\n    def delete(self, n: str) -> None: ...\ndef rollout(r: Applier): r.apply({})"}
});

S("Python — OOP","pyoop-6","__eq__ и hashability","Middle",
`<h3>Контекст</h3><p><b>Python — OOP.</b> __eq__ и hashability. Среда сценария симулирует Python — OOP-окружение; основные инструменты терминала здесь: команды терминала.</p><h3>Задача</h3><p>Определите <code>__hash__</code> консистентно с <code>__eq__</code> или сделайте <code>__hash__=None</code>.</p>`,
"dev@py:~$",
[["^python -c.*hash",`hash ok`,"ok"]],
[{re:"python -c",l:"Проверить set"}],
{files:{"main.py":"class Quantity:\n    def __init__(self,v,u): self.v=v; self.u=u\n    def __eq__(self,o): return isinstance(o,Quantity) and self.v==o.v and self.u==o.u\n"}, file:"main.py", checks:[{re:"__hash__",l:"hash определён"}],
 hints:["После `__eq__` Python обнуляет `__hash__` — инвариант `a==b ⇒ hash(a)==hash(b)`.","Если объект immutable — `__hash__ = lambda: hash((self.v,self.u))`; если mutable — `__hash__ = None`.","Проверьте `hash(Quantity(3,'Gi'))` не кидает"],
 solutionFiles:{"main.py":"class Quantity:\n    def __init__(self, v, u):\n        self.v = v\n        self.u = u\n    def __eq__(self, o):\n        return isinstance(o, Quantity) and self.v == o.v and self.u == o.u\n    def __hash__(self):\n        return hash((self.v, self.u))\n"},
 solution:{why:"`__eq__` без `__hash__` нарушает контракт хеширования; `set` требует хеш.", changes:["`def __hash__(self): return hash((self.v,self.u))` или `__hash__=None`"], code:"class Quantity:\n    def __init__(self,v,u): self.v=v; self.u=u\n    def __eq__(self,o): return isinstance(o,Quantity) and self.v==o.v and self.u==o.u\n    def __hash__(self): return hash((self.v,self.u))"}
});

S("Python — OOP","pyoop-7","Descriptor Clamped","Advanced",
`<h3>Контекст</h3><p><b>Python — OOP.</b> Descriptor Clamped. Среда сценария симулирует Python — OOP-окружение; основные инструменты терминала здесь: команды терминала.</p><h3>Задача</h3><p>Реализуйте дескриптор <code>Clamped</code> с <code>__set_name__/__get__/__set__</code> и используйте <code>cpu = Clamped()</code>.</p>`,
"dev@py:~$",
[["^python main.py",`50\nerror`,"ok"]],
[{re:"python main.py",l:"Тест 50 ok, 150 error"}],
{files:{"main.py":"class Probe:\n    cpu = None\n    def __init__(self,c): self.cpu=c\n"}, file:"main.py", checks:[{re:"__set_name__",l:"set_name"}, {re:"__get__",l:"get"}, {re:"__set__",l:"set"}],
 hints:["Дескриптор живёт в классе, хранит в `obj.__dict__[self.name]`; `__set_name__` узнает имя.","`__get__(self,obj,owner)` → `getattr(obj,self.name)`; `__set__` валидирует.","Сравните с `property` — property тоже дескриптор"],
 solutionFiles:{"main.py":"class Clamped:\n    def __set_name__(self, owner, name):\n        self.name = '_' + name\n    def __get__(self, obj, objtype=None):\n        if obj is None: return self\n        return getattr(obj, self.name)\n    def __set__(self, obj, value):\n        if not 0 <= value <= 100:\n            raise ValueError(f'{value} not in 0..100')\n        setattr(obj, self.name, value)\n\nclass Probe:\n    cpu = Clamped()\n    def __init__(self, c):\n        self.cpu = c\n\ntry:\n    p = Probe(50)\n    print(p.cpu)       # 50\n    p2 = Probe(150)    # ValueError\nexcept ValueError as e:\n    print('error:', e)\n"},
 solution:{why:"Дескриптор — протокол `__get__/__set__/__delete__`; `property` — частный случай.", changes:["`Clamped` с `__set_name__` + `getattr/setattr`","`cpu = Clamped()` в классе"], code:"class Clamped:\n    def __set_name__(self,o,n): self.name='_'+n\n    def __get__(self,o,ot=None):\n        if o is None: return self\n        return getattr(o,self.name)\n    def __set__(self,o,v):\n        if not 0<=v<=100: raise ValueError\n        setattr(o,self.name,v)\nclass Probe:\n    cpu=Clamped()\n    def __init__(self,c): self.cpu=c"}
});

S("Python — OOP","pyoop-8","composition vs inheritance","Senior",
`<h3>Контекст</h3><p><b>Python — OOP.</b> composition vs inheritance. Среда сценария симулирует Python — OOP-окружение; основные инструменты терминала здесь: команды терминала.</p><h3>Задача</h3><p>Разбейте на <code>Retry</code> + <code>K8sDeployer(applier, retry)</code> через Protocol DI.</p>`,
"dev@py:~$",
[["^pytest",`3 passed`,"ok"]],
[{re:"pytest",l:"Запустить тесты композиции"}],
{files:{"main.py":"class Retry:\n    def run(self,fn,*a,**k): return fn(*a,**k)\nclass K8sDeployer:\n    def __init__(self,applier,retry): self.applier=applier; self.retry=retry\n"}, file:"main.py", checks:[{re:"class Retry",l:"Retry"}, {re:"class K8sDeployer",l:"Deployer"}],
 hints:["Наследование — `is-a`, композиция — `has-a/uses-a`; `has-a` гибче для микса `Logging+Retry`.","`K8sDeployer` должен принимать `applier: Applier` Protocol, не конкретный класс.","Тест: подмени `Applier` на `MagicMock` и проверьте `retry`"],
 solutionFiles:{"main.py":"from typing import Protocol\n\nclass Applier(Protocol):\n    def apply(self, m: dict) -> None: ...\n\nclass Retry:\n    def __init__(self, tries: int = 3):\n        self.tries = tries\n    def run(self, fn, *a, **k):\n        for i in range(self.tries):\n            try: return fn(*a, **k)\n            except Exception:\n                if i == self.tries - 1: raise\n\nclass K8sDeployer:\n    def __init__(self, applier: Applier, retry: Retry):\n        self.applier = applier\n        self.retry = retry\n    def sync(self, manifests: list[dict]):\n        for m in manifests:\n            self.retry.run(self.applier.apply, m)\n"},
 solution:{why:"Глубокая иерархия хрупка к изменениям `MRO`; композиция позволяет комбинировать поведения без наследования.", changes:["`Retry.run` цикл 3 попытки","`ResourceManager(applier, retry)` DI"], code:"class ResourceManager:\n    def __init__(self, applier, retry): self.applier, self.retry = applier, retry\n    def sync(self, ms):\n        for m in ms: self.retry.run(self.applier.apply, m)"}
});

S("Python — OOP","pyoop-9","God object рефакторинг","Senior",
`<h3>Контекст</h3><p><b>Python — OOP.</b> God object рефакторинг. Среда сценария симулирует Python — OOP-окружение; основные инструменты терминала здесь: команды терминала.</p><h3>Задача</h3><p>Разделите на 4 класса: <code>Loader, Client, Retry, ResourceManager</code> и свяжите DI.</p>`,
"dev@py:~$",
[["^pytest -q",`4 passed`,"ok"]],
[{re:"pytest",l:"Проверить разбиение"}],
{files:{"main.py":"class God:\n    def do(self):\n        import yaml, requests\n        data=yaml.safe_load(open('a.yaml'))\n        requests.post('http://api', json=data)\n"}, file:"main.py", checks:[{re:"class Loader",l:"Loader"}, {re:"class Client",l:"Client"}],
 hints:["Выделите `Loader.load(path)` → dict, `Client.apply(dict)` → request, `Manager` оркестрирует.","Каждый класс — одна ответственность; `Manager(Loader(), Client(), Retry())`.","Старый тест `God` → 4 unit теста на каждый класс с `MagicMock`"],
 solutionFiles:{"main.py":"class Loader:\n    def load(self, path: str) -> dict:\n        import yaml\n        with open(path) as f:\n            return yaml.safe_load(f)\n\nclass Client:\n    def __init__(self, base_url: str):\n        self.base_url = base_url\n    def apply(self, data: dict) -> None:\n        import requests\n        requests.post(self.base_url, json=data)\n\nclass Retry:\n    def __init__(self, tries: int = 3):\n        self.tries = tries\n    def run(self, fn, *a, **k):\n        for i in range(self.tries):\n            try: return fn(*a, **k)\n            except Exception:\n                if i == self.tries - 1: raise\n\nclass ResourceManager:\n    def __init__(self, loader: Loader, client: Client, retry: Retry):\n        self.loader = loader\n        self.client = client\n        self.retry = retry\n    def sync(self, path: str):\n        data = self.loader.load(path)\n        self.retry.run(self.client.apply, data)\n"},
 solution:{why:"God object нарушает SRP, не тестируется; разбиение даёт изолированные unit тесты и повторное использование.", changes:["`Loader, Client, Retry, Manager`","`Manager` DI"], code:"class Loader:\n    def load(self,p): return __import__('yaml').safe_load(open(p))\nclass Client:\n    def apply(self,m): __import__('requests').post('http://api', json=m)\nclass Manager:\n    def __init__(self,l,c,r): self.l, self.c, self.r = l,c,r"}
});

S("Python — OOP","pyoop-10","__repr__ vs __str__","Junior",
`<h3>Контекст</h3><p><b>Python — OOP.</b> __repr__ vs __str__. Среда сценария симулирует Python — OOP-окружение; основные инструменты терминала здесь: команды терминала.</p><h3>Задача</h3><p>Сделайте <code>__repr__</code> как <code>Quantity(3, 'Gi')</code> и <code>__str__</code> как <code>3Gi</code>.</p>`,
"dev@py:~$",
[["^python -c.*repr",`Quantity(3, 'Gi') 3Gi`,"ok"]],
[{re:"python -c",l:"Проверить repr/str"}],
{files:{"main.py":"class Quantity:\n    def __init__(self,v,u): self.v=v; self.u=u\n"}, file:"main.py", checks:[{re:"__repr__",l:"repr"}, {re:"__str__",l:"str"}],
 hints:["`__repr__` — для разработчика, однозначен, ideally `eval(repr(o))==o`; `__str__` — для пользователя.","`__repr__` используйте `!r` для строк: `f\"Quantity({self.v!r}, {self.u!r})\"`.","Проверьте `str(q)='3Gi'` и `repr(q)=\"Quantity(3, 'Gi')\"`"],
 solutionFiles:{"main.py":"class Quantity:\n    def __init__(self, v, u):\n        self.v = v\n        self.u = u\n    def __repr__(self):\n        return f'Quantity({self.v!r}, {self.u!r})'\n    def __str__(self):\n        return f'{self.v}{self.u}'\n"},
 solution:{why:"По умолчанию `object.__repr__` — адрес; переопределение даёт читаемые логи.", changes:["`__repr__` → `Quantity(3, 'Gi')`","`__str__` → `3Gi`"], code:"class Quantity:\n    def __init__(self,v,u): self.v=v; self.u=u\n    def __repr__(self): return f'Quantity({self.v!r}, {self.u!r})'\n    def __str__(self): return f'{self.v}{self.u}'"}
});

S("Python — OOP","pyoop-11","ABC Provider каркас","Middle",
`<h3>Контекст</h3><p>Нужен <code>Provider</code> с общим <code>apply_with_retry</code>, но нельзя инстанцировать базу.</p><h3>Задача</h3><p>Сделайте <code>Provider(ABC)</code> с <code>@abstractmethod apply</code> и конкретным методом <code>apply_with_retry</code>.</p>`,
"dev@py:~$",
[["^pytest",`1 passed`,"ok"]],
[{re:"pytest",l:"ABC нельзя инстанцировать"}],
{files:{"main.py":"from abc import ABC, abstractmethod\nclass Provider(ABC):\n    @abstractmethod\n    def apply(self, m): pass\n"}, file:"main.py", checks:[{re:"apply_with_retry",l:"общий метод"}],
 hints:["`ABC` + `@abstractmethod` делает класс абстрактным — `Provider()` кинет `TypeError`.","Добавьте `def apply_with_retry(self,m): for i in range(3): try: return self.apply(m) ...` в базу.","`AWSProvider(Provider)` должен реализовать только `apply`"],
 solutionFiles:{"main.py":"from abc import ABC, abstractmethod\n\nclass Provider(ABC):\n    @abstractmethod\n    def apply(self, manifest: dict) -> None:\n        pass\n\n    def apply_with_retry(self, manifest: dict, tries: int = 3) -> None:\n        for i in range(tries):\n            try:\n                return self.apply(manifest)\n            except Exception:\n                if i == tries - 1:\n                    raise\n\nclass AWSProvider(Provider):\n    def apply(self, manifest: dict) -> None:\n        print(f'AWS: {manifest}')\n"},
 solution:{why:"`ABC` — nominal интерфейс с общей логикой; `Protocol` — без базы. `ABC` запрещает `Provider()` без реализации.", changes:["`apply_with_retry` в `Provider` с циклом retry"], code:"from abc import ABC, abstractmethod\nclass Provider(ABC):\n    @abstractmethod\n    def apply(self,m): pass\n    def apply_with_retry(self,m):\n        for i in range(3):\n            try: return self.apply(m)\n            except Exception: continue"}
});

S("Python — OOP","pyoop-12","metaclass регистрация","Advanced",
`<h3>Контекст</h3><p><b>Python — OOP.</b> metaclass регистрация. Среда сценария симулирует Python — OOP-окружение; основные инструменты терминала здесь: команды терминала.</p><h3>Задача</h3><p>Сделайте <code>RegistryMeta(type)</code> с <code>registry={}</code> и <code>__new__</code> добавлением класса.</p>`,
"dev@py:~$",
[["^python main.py",`{'Pod':`,"ok"]],
[{re:"python main.py",l:"Проверить registry"}],
{files:{"main.py":"class RegistryMeta(type):\n    registry={}\n    def __new__(m,n,b,d):\n        cls=super().__new__(m,n,b,d)\n        return cls\n"}, file:"main.py", checks:[{re:"registry\\[n\\]\\s*=\\s*cls",l:"регистрация"}],
 hints:["Metaclass `type` — класс для класса; `__new__` вызывается при `class X:` .","В `__new__(m,n,b,d)` создайте `cls=super().__new__(m,n,b,d)` затем `m.registry[n]=cls`.","Сравните с `@register` декоратором — metaclass автоматичнее для фреймворка"],
 solutionFiles:{"main.py":"class RegistryMeta(type):\n    registry = {}\n    def __new__(m, n, b, d):\n        cls = super().__new__(m, n, b, d)\n        if n != 'Resource':  # не регистрируем базу\n            m.registry[n] = cls\n        return cls\n\nclass Resource(metaclass=RegistryMeta):\n    pass\n\nclass Pod(Resource):\n    pass\n\nclass Service(Resource):\n    pass\n\nprint(RegistryMeta.registry)\n"},
 solution:{why:"Metaclass перехватывает создание класса; декоратор требует явного `@register`.", changes:["`m.registry[n]=cls` в `__new__`"], code:"class RegistryMeta(type):\n    registry={}\n    def __new__(m,n,b,d):\n        cls=super().__new__(m,n,b,d)\n        m.registry[n]=cls\n        return cls\nclass Pod(metaclass=RegistryMeta): pass"}
});

S("Python — OOP","pyoop-13","frozen dataclass","Junior",
`<h3>Контекст</h3><p><b>Python — OOP.</b> frozen dataclass. Среда сценария симулирует Python — OOP-окружение; основные инструменты терминала здесь: команды терминала.</p><h3>Задача</h3><p><code>@dataclass(frozen=True, slots=True)</code> + <code>ClassVar</code> для константы, <code>replace</code> для клонирования.</p>`,
"dev@py:~$",
[["^python -c.*replace",`ok`,"ok"]],
[{re:"python -c",l:"frozen и replace"}],
{files:{"main.py":"from dataclasses import dataclass\n@dataclass\nclass Config:\n    env: str\n    replicas: int = 3\n"}, file:"main.py", checks:[{re:"frozen.*True",l:"frozen"}, {re:"slots.*True",l:"slots"}],
 hints:["`frozen=True` даёт `__hash__` и запрещает `c.replicas=5`; мутируйте через `replace(c,replicas=5)`.","`slots=True` экономит память, но нельзя добавить динамический атрибут.","`ClassVar[str]` — не поле, а константа класса `KIND`"],
 solutionFiles:{"main.py":"from dataclasses import dataclass, field, replace\nfrom typing import ClassVar\n\n@dataclass(frozen=True, slots=True)\nclass Config:\n    env: str\n    replicas: int = 3\n    KIND: ClassVar[str] = 'deploy'\n\nc = Config('prod', 5)\nc2 = replace(c, replicas=6)\nprint(c, c2, hash(c))\n"},
 solution:{why:"`frozen` + `slots` делает value object immutable и быстрым; `ClassVar` не попадает в `__init__`.", changes:["`@dataclass(frozen=True, slots=True)`","`KIND: ClassVar[str]='deploy'`"], code:"from dataclasses import dataclass, field\nfrom typing import ClassVar\n@dataclass(frozen=True, slots=True)\nclass Config:\n    env: str\n    replicas: int = 3\n    KIND: ClassVar[str]='deploy'"}
});

S("Python — OOP","pyoop-14","__contains__ и __iter__","Junior",
`<h3>Контекст</h3><p><b>Python — OOP.</b> __contains__ и __iter__. Среда сценария симулирует Python — OOP-окружение; основные инструменты терминала здесь: команды терминала.</p><h3>Задача</h3><p>Реализуйте <code>__contains__</code> и <code>__iter__</code>/<code>__next__</code> или генератор.</p>`,
"dev@py:~$",
[["^python main.py",`True`,"ok"]],
[{re:"python main.py",l:"in и for"}],
{files:{"main.py":"class Inventory:\n    def __init__(self, items): self.items=items\n"}, file:"main.py", checks:[{re:"__contains__",l:"contains"}, {re:"__iter__",l:"iter"}],
 hints:["`__contains__(self,x)` → `x in self`; `__iter__(self)` → итератор с `__next__` или `yield`.","Простой `__iter__`: `return iter(self.items)`; генератор: `yield from self.items`.","Проверьте `inv.__iter__()` и `\"gpu\" in inv`"],
 solutionFiles:{"main.py":"class Inventory:\n    def __init__(self, items):\n        self.items = items\n    def __contains__(self, x):\n        return x in self.items\n    def __iter__(self):\n        yield from self.items\n\ninv = Inventory(['cpu', 'gpu', 'ram'])\nprint('gpu' in inv)  # True\nfor item in inv:\n    print(item)\n"},
 solution:{why:"`in` → `__contains__`, `for` → `__iter__`/`__next__`; Python data model.", changes:["`__contains__` возвращает `x in self.items`","`__iter__` yield"], code:"class Inventory:\n    def __init__(self, items): self.items=items\n    def __contains__(self,x): return x in self.items\n    def __iter__(self): yield from self.items"}
});

S("Python — OOP","pyoop-15","dependency injection testability","Senior",
`<h3>Контекст</h3><p><b>Python — OOP.</b> dependency injection testability. Среда сценария симулирует Python — OOP-окружение; основные инструменты терминала здесь: команды терминала.</p><h3>Задача</h3><p>Передайте <code>applier: Applier</code> и <code>retry: RetryPolicy</code> в <code>__init__</code> (DI) и напишите тест с <code>MagicMock</code>.</p>`,
"dev@py:~$",
[["^pytest",`1 passed`,"ok"]],
[{re:"pytest",l:"DI тест"}],
{files:{"main.py":"class ResourceManager:\n    def __init__(self):\n        self.applier=K8sProvider()\n    def sync(self, ms):\n        for m in ms: self.applier.apply(m)\n", "test_main.py":"def test_sync():\n    pass\n"}, file:"main.py", checks:[{re:"def __init__.*applier",l:"DI applier"}, {re:"def sync",l:"sync"}],
 hints:["Конструктор не должен делать `K8sProvider()` — это скрытая зависимость; передайте извне.","`__init__(self, applier: Applier, retry: RetryPolicy)` + `self.applier=applier`.","Тест: `fake=MagicMock(spec=Applier); rm=ResourceManager(fake, RetryPolicy()); rm.sync([{}]); fake.apply.assert_called()`"],
 solutionFiles:{"main.py":"from typing import Protocol\n\nclass Applier(Protocol):\n    def apply(self, m: dict) -> None: ...\n\nclass RetryPolicy:\n    def __init__(self, tries: int = 3):\n        self.tries = tries\n    def run(self, fn, *a, **k):\n        for i in range(self.tries):\n            try: return fn(*a, **k)\n            except Exception:\n                if i == self.tries - 1: raise\n\nclass ResourceManager:\n    def __init__(self, applier: Applier, retry: RetryPolicy):\n        self.applier = applier\n        self.retry = retry\n    def sync(self, manifests: list[dict]):\n        for m in manifests:\n            self.retry.run(self.applier.apply, m)\n", "test_main.py":"from unittest.mock import MagicMock\nfrom main import ResourceManager, RetryPolicy\n\ndef test_sync():\n    fake = MagicMock()\n    retry = RetryPolicy(tries=1)\n    rm = ResourceManager(fake, retry)\n    rm.sync([{'name': 'pod-1'}])\n    fake.apply.assert_called_once_with({'name': 'pod-1'})\n"},
 solution:{why:"DI делает зависимости явными и заменяемыми; конструктор без IO — тестируемость.", changes:["DI через `__init__`","Test с `MagicMock(spec=Applier)`"], code:"class ResourceManager:\n    def __init__(self, applier, retry): self.applier, self.retry = applier, retry\n    def sync(self, ms):\n        for m in ms: self.retry.run(self.applier.apply, m)"}
});

/* ==================== NEW SCENARIOS 16-30 ==================== */

S("Python — OOP","pyoop-16","__slots__ memory optimization","Middle",
`<h3>Контекст</h3><p><b>Python — OOP.</b> __slots__ memory optimization. Среда сценария симулирует Python — OOP-окружение; основные инструменты терминала здесь: команды терминала.</p><h3>Что нужно сделать</h3><ul><li>[ ] Добавить <code>__slots__</code> для экономии памяти</li><li>[ ] Убедиться что динамические атрибуты запрещены</li><li>[ ] Проверить что <code>__dict__</code> отсутствует</li></ul>`,
"dev@py:~$",
[["^python main.py",`slots ok`,"ok"]],
[{re:"python main.py",l:"Проверить slots"}],
{files:{"main.py":"class Metric:\n    def __init__(self, name, value, ts):\n        self.name = name\n        self.value = value\n        self.ts = ts\n\nm = Metric('cpu', 85.5, 1700000000)\nprint(m.__dict__)\n"}, file:"main.py", checks:[{re:"__slots__",l:"slots определён"}, {re:"name.*value.*ts",l:"все поля"}],
 hints:["`__slots__` = tuple строк — имена допустимых атрибутов. Убирает `__dict__`.","Добавьте `__slots__ = ('name', 'value', 'ts')` перед `__init__`.","Проверьте: `hasattr(m, '__dict__')` → False; `m.extra = 1` → AttributeError"],
 solutionFiles:{"main.py":"class Metric:\n    __slots__ = ('name', 'value', 'ts')\n\n    def __init__(self, name: str, value: float, ts: int):\n        self.name = name\n        self.value = value\n        self.ts = ts\n\n    def __repr__(self):\n        return f'Metric({self.name!r}, {self.value}, {self.ts})'\n\nm = Metric('cpu', 85.5, 1700000000)\nprint('slots ok')\ntry:\n    m.extra = 1\nexcept AttributeError:\n    print('dynamic attr blocked')\nprint(f'has __dict__: {hasattr(m, \"__dict__\")}')\n"},
 solution:{why:"`__slots__` убирает per-instance `__dict__` (~200 bytes) — экономия 3x при 100K объектов.", changes:["Добавить `__slots__ = ('name', 'value', 'ts')`","Убрать любые динамические присваивания"], code:"class Metric:\n    __slots__ = ('name', 'value', 'ts')\n    def __init__(self, name, value, ts):\n        self.name=name; self.value=value; self.ts=ts"}
});

S("Python — OOP","pyoop-17","__new__ singleton","Advanced",
`<h3>Контекст</h3><p><b>Python — OOP.</b> __new__ singleton. Среда сценария симулирует Python — OOP-окружение; основные инструменты терминала здесь: команды терминала.</p><h3>Задача</h3><p>Реализуйте singleton через <code>__new__</code>. Убедитесь что <code>ConfigStore() is ConfigStore()</code>.</p>`,
"dev@py:~$",
[["^python main.py",`True`,"ok"]],
[{re:"python main.py",l:"singleton is True"}],
{files:{"main.py":"class ConfigStore:\n    def __init__(self, path='/etc/app.yaml'):\n        self.path = path\n        self.data = {}\n\na = ConfigStore()\nb = ConfigStore()\nprint(a is b)  # should be True\n"}, file:"main.py", checks:[{re:"__new__",l:"__new__ определён"}, {re:"_instance",l:"хранение instance"}],
 hints:["`__new__` вызывается до `__init__` и создаёт объект. Для singleton — храните `_instance` в классе.","`cls._instance = super().__new__(cls)` только если `cls._instance is None`.","Осторожно: `__init__` вызывается при каждом `ConfigStore()` — может перезаписать данные"],
 solutionFiles:{"main.py":"class ConfigStore:\n    _instance = None\n\n    def __new__(cls, *args, **kwargs):\n        if cls._instance is None:\n            cls._instance = super().__new__(cls)\n        return cls._instance\n\n    def __init__(self, path='/etc/app.yaml'):\n        if not hasattr(self, '_initialized'):\n            self.path = path\n            self.data = {}\n            self._initialized = True\n\na = ConfigStore()\nb = ConfigStore('/other.yaml')\nprint(a is b)  # True\nprint(a.path)  # /etc/app.yaml — не перезаписан\n"},
 solution:{why:"`__new__` контролирует создание объекта; singleton возвращает один и тот же `_instance`. Guard `_initialized` предотвращает повторную инициализацию.", changes:["Добавить `_instance = None` и `__new__`","Guard через `_initialized` в `__init__`"], code:"class ConfigStore:\n    _instance = None\n    def __new__(cls, *a, **k):\n        if cls._instance is None:\n            cls._instance = super().__new__(cls)\n        return cls._instance\n    def __init__(self, path='/etc/app.yaml'):\n        if not hasattr(self, '_initialized'):\n            self.path=path; self.data={}; self._initialized=True"}
});

S("Python — OOP","pyoop-18","classmethod factory Config.from_env()","Middle",
`<h3>Контекст</h3><p><code>AppConfig.__init__</code> принимает 5 аргументов — неудобно. Нужны альтернативные конструкторы.</p><h3>Задача</h3><p>Добавьте <code>@classmethod from_env(cls)</code> и <code>from_dict(cls, data)</code>.</p>`,
"dev@py:~$",
[["^python main.py",`from_env ok`,"ok"]],
[{re:"python main.py",l:"factory test"}],
{files:{"main.py":"class AppConfig:\n    def __init__(self, env, replicas, image, port, debug):\n        self.env = env\n        self.replicas = replicas\n        self.image = image\n        self.port = port\n        self.debug = debug\n"}, file:"main.py", checks:[{re:"@classmethod",l:"classmethod"}, {re:"def from_env",l:"from_env"}, {re:"def from_dict",l:"from_dict"}],
 hints:["`@classmethod` получает `cls` первым аргументом — работает с наследниками.","В `from_env` читайте из `os.environ.get(...)` и вызовите `return cls(...)`.","В `from_dict` распакуйте `data` в аргументы: `return cls(**data)` или явно"],
 solutionFiles:{"main.py":"import os\n\nclass AppConfig:\n    def __init__(self, env, replicas, image, port, debug):\n        self.env = env\n        self.replicas = replicas\n        self.image = image\n        self.port = port\n        self.debug = debug\n\n    @classmethod\n    def from_env(cls):\n        return cls(\n            env=os.environ.get('ENV', 'dev'),\n            replicas=int(os.environ.get('REPLICAS', '3')),\n            image=os.environ.get('IMAGE', 'nginx:latest'),\n            port=int(os.environ.get('PORT', '8080')),\n            debug=os.environ.get('DEBUG', '').lower() == 'true',\n        )\n\n    @classmethod\n    def from_dict(cls, data: dict):\n        return cls(\n            env=data.get('env', 'dev'),\n            replicas=data.get('replicas', 3),\n            image=data.get('image', 'nginx:latest'),\n            port=data.get('port', 8080),\n            debug=data.get('debug', False),\n        )\n\ncfg = AppConfig.from_env()\nprint('from_env ok')\n"},
 solution:{why:"`classmethod` фабрики дают альтернативные способы создания объекта без перегрузки `__init__`.", changes:["Добавить `@classmethod from_env(cls)` с `os.environ`","Добавить `@classmethod from_dict(cls, data)`"], code:"@classmethod\ndef from_env(cls):\n    return cls(env=os.environ.get('ENV','dev'), ...)"}
});

S("Python — OOP","pyoop-19","staticmethod валидатор","Junior",
`<h3>Контекст</h3><p><b>Python — OOP.</b> staticmethod валидатор. Среда сценария симулирует Python — OOP-окружение; основные инструменты терминала здесь: команды терминала.</p><h3>Задача</h3><p>Сделайте его <code>@staticmethod</code> и вызовите в <code>__init__</code>.</p>`,
"dev@py:~$",
[["^python main.py",`valid`,"ok"]],
[{re:"python main.py",l:"staticmethod test"}],
{files:{"main.py":"class Config:\n    def __init__(self, image):\n        self.image = image\n    def validate_image(self, image):\n        return ':' in image\n"}, file:"main.py", checks:[{re:"@staticmethod",l:"staticmethod"}, {re:"validate_image",l:"валидатор"}],
 hints:["`@staticmethod` не получает `self` или `cls` — чистая функция в namespace класса.","Используйте `Config.validate_image(image)` без создания экземпляра.","В `__init__` вызовите `if not self.validate_image(image): raise ValueError`"],
 solutionFiles:{"main.py":"class Config:\n    def __init__(self, image: str):\n        if not Config.validate_image(image):\n            raise ValueError(f'invalid image: {image}')\n        self.image = image\n\n    @staticmethod\n    def validate_image(image: str) -> bool:\n        return ':' in image and not image.startswith(':')\n\nc = Config('nginx:1.25')\nprint('valid')\n"},
 solution:{why:"`@staticmethod` — функция без `self`/`cls`; живёт в namespace класса для логической группировки.", changes:["Добавить `@staticmethod`","Убрать `self` из параметров","Вызвать в `__init__`"], code:"@staticmethod\ndef validate_image(image): return ':' in image"}
});

S("Python — OOP","pyoop-20","context manager __enter__/__exit__","Middle",
`<h3>Контекст</h3><p><code>DBConnection</code> не закрывает соединение при ошибке. Нужен context manager.</p><h3>Задача</h3><p>Реализуйте <code>__enter__</code> (connect) и <code>__exit__</code> (close + rollback/commit).</p>`,
"dev@py:~$",
[["^python main.py",`connected.*closed`,"ok"]],
[{re:"python main.py",l:"context manager test"}],
{files:{"main.py":"class DBConnection:\n    def __init__(self, dsn):\n        self.dsn = dsn\n        self.connected = False\n    def connect(self):\n        self.connected = True\n        print('connected')\n    def close(self):\n        self.connected = False\n        print('closed')\n"}, file:"main.py", checks:[{re:"__enter__",l:"__enter__"}, {re:"__exit__",l:"__exit__"}],
 hints:["`__enter__` возвращает `self` или ресурс; `__exit__` закрывает даже при исключении.","`__exit__(self, exc_type, exc_val, exc_tb)` — если `exc_type` не None, была ошибка.","Верните `False` из `__exit__` чтобы не подавлять исключения"],
 solutionFiles:{"main.py":"class DBConnection:\n    def __init__(self, dsn: str):\n        self.dsn = dsn\n        self.connected = False\n\n    def connect(self):\n        self.connected = True\n        print('connected')\n        return self\n\n    def close(self):\n        self.connected = False\n        print('closed')\n\n    def __enter__(self):\n        self.connect()\n        return self\n\n    def __exit__(self, exc_type, exc_val, exc_tb):\n        if exc_type:\n            print(f'error: {exc_val}, rolling back')\n        self.close()\n        return False  # don't suppress exceptions\n\nwith DBConnection('postgresql://localhost/db') as db:\n    print(f'connected: {db.connected}')\nprint(f'after with: connected={db.connected}')\n"},
 solution:{why:"`with` гарантирует `__exit__` даже при исключении — ресурсы всегда освобождаются.", changes:["Добавить `__enter__` с `self.connect(); return self`","Добавить `__exit__` с `self.close()`"], code:"def __enter__(self):\n    self.connect(); return self\ndef __exit__(self, *exc):\n    self.close(); return False"}
});

S("Python — OOP","pyoop-21","__init_subclass__ registration","Advanced",
`<h3>Контекст</h3><p><b>Python — OOP.</b> __init_subclass__ registration. Среда сценария симулирует Python — OOP-окружение; основные инструменты терминала здесь: команды терминала.</p><h3>Задача</h3><p>Используйте <code>__init_subclass__</code> в <code>Plugin</code> для авто-добавления в <code>_plugins</code>.</p>`,
"dev@py:~$",
[["^python main.py",`prometheus.*loki`,"ok"]],
[{re:"python main.py",l:"plugin registration"}],
{files:{"main.py":"class Plugin:\n    _plugins = {}\n\nclass PrometheusExporter(Plugin):\n    def collect(self): return {'up': 1}\n\nprint(Plugin._plugins)\n"}, file:"main.py", checks:[{re:"__init_subclass__",l:"__init_subclass__"}, {re:"_plugins",l:"registry"}],
 hints:["`__init_subclass__` вызывается при создании подкласса — альтернатива metaclass.","`def __init_subclass__(cls, plugin_name='', **kwargs)` — именованные аргументы из `class X(Plugin, plugin_name='...')`","Храните `cls._plugins[name] = cls`"],
 solutionFiles:{"main.py":"class Plugin:\n    _plugins: dict[str, type] = {}\n\n    def __init_subclass__(cls, plugin_name: str = '', **kwargs):\n        super().__init_subclass__(**kwargs)\n        name = plugin_name or cls.__name__.lower()\n        Plugin._plugins[name] = cls\n\n    @classmethod\n    def get(cls, name: str):\n        return cls._plugins[name]()\n\nclass PrometheusExporter(Plugin, plugin_name='prometheus'):\n    def collect(self): return {'up': 1}\n\nclass LokiExporter(Plugin, plugin_name='loki'):\n    def collect(self): return {'streams': 42}\n\nprint(Plugin._plugins)\nprint(Plugin.get('prometheus').collect())\n"},
 solution:{why:"`__init_subclass__` — Python 3.6+, проще metaclass, вызывается при `class Child(Base):`.", changes:["Добавить `__init_subclass__` в `Plugin`","Регистрировать через `Plugin._plugins[name] = cls`"], code:"def __init_subclass__(cls, plugin_name='', **k):\n    super().__init_subclass__(**k)\n    Plugin._plugins[plugin_name or cls.__name__.lower()] = cls"}
});

S("Python — OOP","pyoop-22","SOLID SRP — split God class","Senior",
`<h3>Контекст</h3><p><b>Python — OOP.</b> SOLID SRP — split God class. Среда сценария симулирует Python — OOP-окружение; основные инструменты терминала здесь: команды терминала.</p><h3>Задача</h3><p>Разбейте на <code>ConfigLoader</code>, <code>Deployer</code>, <code>Logger</code>, <code>MetricsCollector</code> + <code>Pipeline</code> DI.</p>`,
"dev@py:~$",
[["^python main.py",`pipeline ok`,"ok"]],
[{re:"python main.py",l:"SRP разбиение"}],
{files:{"main.py":"class GodDeployer:\n    def run(self, path):\n        # load config\n        config = {'env': 'prod'}\n        # deploy\n        print(f'deploying to {config[\"env\"]}')\n        # log\n        print('logged')\n        # metrics\n        print('metrics sent')\n"}, file:"main.py", checks:[{re:"class ConfigLoader",l:"ConfigLoader"}, {re:"class Deployer",l:"Deployer"}, {re:"class Pipeline",l:"Pipeline"}],
 hints:["SRP: каждый класс — одна причина для изменения. `ConfigLoader` меняется если формат конфига меняется.","`Pipeline` связывает все части через DI: `Pipeline(loader, deployer, logger, metrics)`.","Каждый класс тестируется изолированно с `MagicMock`"],
 solutionFiles:{"main.py":"class ConfigLoader:\n    def load(self, path: str) -> dict:\n        return {'env': 'prod', 'replicas': 3}\n\nclass Deployer:\n    def deploy(self, config: dict) -> None:\n        print(f'deploying to {config[\"env\"]}')\n\nclass Logger:\n    def log(self, msg: str) -> None:\n        print(f'LOG: {msg}')\n\nclass MetricsCollector:\n    def send(self, metric: str, value: float) -> None:\n        print(f'METRIC: {metric}={value}')\n\nclass Pipeline:\n    def __init__(self, loader, deployer, logger, metrics):\n        self.loader = loader\n        self.deployer = deployer\n        self.logger = logger\n        self.metrics = metrics\n\n    def run(self, path: str):\n        config = self.loader.load(path)\n        self.logger.log(f'loaded config from {path}')\n        self.deployer.deploy(config)\n        self.metrics.send('deploy_count', 1)\n        self.logger.log('done')\n\np = Pipeline(ConfigLoader(), Deployer(), Logger(), MetricsCollector())\np.run('config.yaml')\nprint('pipeline ok')\n"},
 solution:{why:"God object нарушает SRP — 4 причины для изменения в одном классе. Разбиение даёт тестируемость и переиспользование.", changes:["Выделить `ConfigLoader`, `Deployer`, `Logger`, `MetricsCollector`","Связать через `Pipeline` DI"], code:"class Pipeline:\n    def __init__(self, loader, deployer, logger, metrics): ..."}
});

S("Python — OOP","pyoop-23","SOLID LSP — Square vs Rectangle","Middle",
`<h3>Контекст</h3><p><code>Square(Rectangle)</code> переопределяет <code>set_width</code> так что <code>set_width</code> меняет и <code>height</code> — нарушение LSP.</p><h3>Задача</h3><p>Рефакторинг: используйте <code>Shape(Protocol)</code> с <code>area()</code> вместо наследования.</p>`,
"dev@py:~$",
[["^python main.py",`area ok`,"ok"]],
[{re:"python main.py",l:"LSP fix"}],
{files:{"main.py":"class Rectangle:\n    def __init__(self, w, h): self.w=w; self.h=h\n    def set_width(self, w): self.w=w\n    def area(self): return self.w*self.h\n\nclass Square(Rectangle):\n    def set_width(self, w): self.w=w; self.h=w  # LSP violation\n"}, file:"main.py", checks:[{re:"Protocol",l:"Protocol использован"}, {re:"def area",l:"area метод"}],
 hints:["LSP: если `Square(Rectangle)`, то `set_width(5)` не должен менять `height` — контракт Rectangle нарушен.","Решение: не наследовать Square от Rectangle. Используйте `Shape(Protocol)` с `area()`.","Каждый класс реализует `area()` независимо — нет общего мутабельного состояния"],
 solutionFiles:{"main.py":"from typing import Protocol\n\nclass Shape(Protocol):\n    def area(self) -> float: ...\n\nclass Rectangle:\n    def __init__(self, w: float, h: float):\n        self.w = w\n        self.h = h\n    def area(self) -> float:\n        return self.w * self.h\n\nclass Square:\n    def __init__(self, side: float):\n        self.side = side\n    def area(self) -> float:\n        return self.side ** 2\n\ndef print_area(shape: Shape) -> None:\n    print(f'area: {shape.area()}')\n\nprint_area(Rectangle(3, 4))  # 12\nprint_area(Square(5))         # 25\nprint('area ok')\n"},
 solution:{why:"LSP нарушается когда подкласс меняет контракт базового. Protocol позволяет duck typing без наследования.", changes:["Убрать наследование `Square(Rectangle)`","Добавить `Shape(Protocol)` с `area()`","Каждый класс — отдельная реализация"], code:"class Shape(Protocol):\n    def area(self) -> float: ..."}
});

S("Python — OOP","pyoop-24","Strategy pattern — deploy strategies","Senior",
`<h3>Контекст</h3><p><b>Python — OOP.</b> Strategy pattern — deploy strategies. Среда сценария симулирует Python — OOP-окружение; основные инструменты терминала здесь: команды терминала.</p><h3>Задача</h3><p>Рефакторинг в Strategy pattern: <code>DeployStrategy(Protocol)</code> + 3 реализации + <code>Pipeline(strategy)</code>.</p>`,
"dev@py:~$",
[["^python main.py",`helm.*kustomize.*argocd`,"ok"]],
[{re:"python main.py",l:"strategy test"}],
{files:{"main.py":"def deploy(manifest, method, env):\n    if method == 'helm':\n        print(f'helm upgrade -n {env}')\n    elif method == 'kustomize':\n        print(f'kubectl apply -k {env}')\n    elif method == 'argocd':\n        print(f'argocd sync {manifest}')\n"}, file:"main.py", checks:[{re:"class.*Protocol",l:"Protocol"}, {re:"class HelmDeploy",l:"HelmDeploy"}, {re:"class Pipeline",l:"Pipeline"}],
 hints:["Strategy: интерфейс `DeployStrategy(Protocol)` с `execute(manifest, env)`.","Каждый метод — отдельный класс: `HelmDeploy`, `KustomizeDeploy`, `ArgoSyncDeploy`.","Pipeline принимает strategy в конструкторе: `Pipeline(HelmDeploy())`"],
 solutionFiles:{"main.py":"from typing import Protocol\n\nclass DeployStrategy(Protocol):\n    def execute(self, manifest: str, env: str) -> None: ...\n\nclass HelmDeploy:\n    def execute(self, manifest: str, env: str) -> None:\n        print(f'helm upgrade -n {env} {manifest}')\n\nclass KustomizeDeploy:\n    def execute(self, manifest: str, env: str) -> None:\n        print(f'kubectl apply -k overlays/{env}')\n\nclass ArgoSyncDeploy:\n    def execute(self, manifest: str, env: str) -> None:\n        print(f'argocd app sync {manifest}')\n\nclass Pipeline:\n    def __init__(self, strategy: DeployStrategy):\n        self.strategy = strategy\n    def run(self, manifest: str, env: str) -> None:\n        self.strategy.execute(manifest, env)\n\nfor s in [HelmDeploy(), KustomizeDeploy(), ArgoSyncDeploy()]:\n    Pipeline(s).run('api', 'prod')\n"},
 solution:{why:"if/elif ветвления нарушают OCP; Strategy позволяет добавить новый метод деплоя без изменения Pipeline.", changes:["Интерфейс `DeployStrategy(Protocol)`","3 класса-стратегии","`Pipeline` принимает strategy через DI"], code:"class Pipeline:\n    def __init__(self, strategy: DeployStrategy): ..."}
});

S("Python — OOP","pyoop-25","Factory pattern — provider factory","Middle",
`<h3>Контекст</h3><p>Создание провайдера: <code>if name == 'aws': return AWSProvider() elif 'gcp': ...</code></p><h3>Задача</h3><p>Реализуйте <code>ProviderFactory</code> с <code>@register</code> декоратором и <code>create(name)</code>.</p>`,
"dev@py:~$",
[["^python main.py",`aws created`,"ok"]],
[{re:"python main.py",l:"factory test"}],
{files:{"main.py":"class AWSProvider:\n    def __init__(self, region='us-east-1'):\n        self.region = region\n\nclass GCPProvider:\n    def __init__(self, project='default'):\n        self.project = project\n\ndef create_provider(name):\n    if name == 'aws': return AWSProvider()\n    if name == 'gcp': return GCPProvider()\n"}, file:"main.py", checks:[{re:"class ProviderFactory",l:"Factory class"}, {re:"register",l:"register"}],
 hints:["Factory хранит `_providers: dict[str, type]`; `register(name)` — декоратор, добавляющий класс.","`create(name, **kwargs)` → `cls._providers[name](**kwargs)`.","Декоратор `@ProviderFactory.register('aws')` над классом"],
 solutionFiles:{"main.py":"class ProviderFactory:\n    _providers: dict[str, type] = {}\n\n    @classmethod\n    def register(cls, name: str):\n        def decorator(provider_cls):\n            cls._providers[name] = provider_cls\n            return provider_cls\n        return decorator\n\n    @classmethod\n    def create(cls, name: str, **kwargs):\n        if name not in cls._providers:\n            raise ValueError(f'unknown: {name}')\n        return cls._providers[name](**kwargs)\n\n@ProviderFactory.register('aws')\nclass AWSProvider:\n    def __init__(self, region='us-east-1'):\n        self.region = region\n\n@ProviderFactory.register('gcp')\nclass GCPProvider:\n    def __init__(self, project='default'):\n        self.project = project\n\nprovider = ProviderFactory.create('aws', region='eu-west-1')\nprint(f'aws created, region={provider.region}')\n"},
 solution:{why:"Factory инкапсулирует создание и позволяет добавлять провайдеры без if/elif.", changes:["Класс `ProviderFactory` с `_providers`","`register` как classmethod-декоратор","`create(name, **kwargs)`"], code:"@classmethod\ndef register(cls, name):\n    def dec(c): cls._providers[name]=c; return c\n    return dec"}
});

S("Python — OOP","pyoop-26","Observer — event system","Advanced",
`<h3>Контекст</h3><p><b>Python — OOP.</b> Observer — event system. Среда сценария симулирует Python — OOP-окружение; основные инструменты терминала здесь: команды терминала.</p><h3>Задача</h3><p>Реализуйте <code>EventBus</code> с <code>on(event, handler)</code> и <code>emit(event, **data)</code>.</p>`,
"dev@py:~$",
[["^python main.py",`deploy.start.*deploy.done`,"ok"]],
[{re:"python main.py",l:"observer test"}],
{files:{"main.py":"# hardcoded notifications\ndef deploy(name):\n    print(f'deploying {name}')\n    send_slack(f'{name} started')\n    update_metrics('deploy', 1)\n"}, file:"main.py", checks:[{re:"class EventBus",l:"EventBus"}, {re:"def on",l:"on"}, {re:"def emit",l:"emit"}],
 hints:["EventBus: `_handlers: dict[str, list[Callable]]`; `on` добавляет, `emit` вызывает.","Обработчики получают `**data` — расширяемо без изменения EventBus.","Observer развязывает отправителя от получателей — легко добавить PagerDuty без изменения deploy"],
 solutionFiles:{"main.py":"from typing import Callable\n\nclass EventBus:\n    def __init__(self):\n        self._handlers: dict[str, list[Callable]] = {}\n\n    def on(self, event: str, handler: Callable) -> None:\n        self._handlers.setdefault(event, []).append(handler)\n\n    def emit(self, event: str, **data) -> None:\n        for handler in self._handlers.get(event, []):\n            handler(**data)\n\nbus = EventBus()\nbus.on('deploy.start', lambda name, env: print(f'deploy.start: {name} to {env}'))\nbus.on('deploy.done', lambda name, env: print(f'deploy.done: {name} in {env}'))\nbus.on('deploy.done', lambda name, env: print(f'metrics: deploy_count+1'))\n\nbus.emit('deploy.start', name='api', env='prod')\nbus.emit('deploy.done', name='api', env='prod')\n"},
 solution:{why:"Observer развязывает publisher от subscriber; EventBus — центральный dispatcher.", changes:["Класс `EventBus` с `_handlers`","`on(event, handler)` и `emit(event, **data)`"], code:"class EventBus:\n    def __init__(self): self._handlers={}\n    def on(self,e,h): self._handlers.setdefault(e,[]).append(h)\n    def emit(self,e,**d):\n        for h in self._handlers.get(e,[]): h(**d)"}
});

S("Python — OOP","pyoop-27","typing.Generic — typed cache","Advanced",
`<h3>Контекст</h3><p><code>Cache</code> хранит <code>dict[str, Any]</code> — mypy не проверяет типы значений.</p><h3>Задача</h3><p>Сделайте <code>Cache(Generic[T])</code> для типобезопасного кеша.</p>`,
"dev@py:~$",
[["^python main.py",`cache ok`,"ok"]],
[{re:"python main.py",l:"generic cache test"}],
{files:{"main.py":"class Cache:\n    def __init__(self):\n        self._data = {}\n    def get(self, key):\n        return self._data.get(key)\n    def put(self, key, value):\n        self._data[key] = value\n"}, file:"main.py", checks:[{re:"Generic\\[T\\]",l:"Generic"}, {re:"TypeVar",l:"TypeVar"}],
 hints:["`T = TypeVar('T')` + `class Cache(Generic[T])` — mypy проверяет `Cache[dict]` vs `Cache[str]`.","`get` → `T | None`, `put` → `key: str, value: T`.","Использование: `cache: Cache[dict] = Cache()` — mypy следит за типами"],
 solutionFiles:{"main.py":"from typing import TypeVar, Generic\n\nT = TypeVar('T')\n\nclass Cache(Generic[T]):\n    def __init__(self, maxsize: int = 128):\n        self._data: dict[str, T] = {}\n        self._maxsize = maxsize\n\n    def get(self, key: str) -> T | None:\n        return self._data.get(key)\n\n    def put(self, key: str, value: T) -> None:\n        if len(self._data) >= self._maxsize:\n            oldest = next(iter(self._data))\n            del self._data[oldest]\n        self._data[key] = value\n\n    def __len__(self) -> int:\n        return len(self._data)\n\ncache: Cache[dict] = Cache(maxsize=100)\ncache.put('pod-1', {'status': 'Running'})\nresult = cache.get('pod-1')\nprint(f'cache ok: {result}')\n"},
 solution:{why:"`Generic[T]` позволяет mypy проверять типы значений в коллекции — ошибки ловятся до runtime.", changes:["`T = TypeVar('T')`","`class Cache(Generic[T])`","Аннотации `get -> T | None`, `put(value: T)`"], code:"T = TypeVar('T')\nclass Cache(Generic[T]):\n    def get(self, key: str) -> T | None: ..."}
});

S("Python — OOP","pyoop-28","Pydantic vs dataclass — config validation","Middle",
`<h3>Контекст</h3><p><code>dataclass Config</code> не валидирует поля: <code>replicas=-1</code> принимается.</p><h3>Задача</h3><p>Перепишите на Pydantic <code>BaseModel</code> с <code>Field(ge=1)</code> и <code>Literal</code> для env.</p>`,
"dev@py:~$",
[["^python main.py",`validation ok`,"ok"]],
[{re:"python main.py",l:"pydantic test"}],
{files:{"main.py":"from dataclasses import dataclass\n\n@dataclass\nclass Config:\n    env: str\n    replicas: int = 3\n    image: str = 'nginx:latest'\n\nc = Config(env='prod', replicas=-1)  # should fail!\nprint(c)\n"}, file:"main.py", checks:[{re:"BaseModel",l:"BaseModel"}, {re:"Field",l:"Field с валидацией"}, {re:"Literal",l:"Literal"}],
 hints:["`pydantic.BaseModel` валидирует при создании; `Field(ge=1, le=100)` — ограничения.","`Literal['prod', 'staging', 'dev']` — только допустимые значения.","Pydantic кидает `ValidationError` с подробным описанием — не нужен `__post_init__`"],
 solutionFiles:{"main.py":"from pydantic import BaseModel, Field, field_validator\nfrom typing import Literal\n\nclass Config(BaseModel):\n    env: Literal['prod', 'staging', 'dev']\n    replicas: int = Field(ge=1, le=100, default=3)\n    image: str = 'nginx:latest'\n\n    @field_validator('image')\n    @classmethod\n    def check_image_tag(cls, v):\n        if ':' not in v:\n            raise ValueError('image must include tag')\n        return v\n\nc = Config(env='prod', replicas=5, image='nginx:1.25')\nprint(f'validation ok: {c}')\n\ntry:\n    bad = Config(env='prod', replicas=-1)\nexcept Exception as e:\n    print(f'caught: {e}')\n"},
 solution:{why:"Pydantic валидирует автоматически при создании; dataclass принимает любые значения без `__post_init__`.", changes:["Заменить `@dataclass` на `BaseModel`","Добавить `Field(ge=1)` и `Literal`","Добавить `@field_validator`"], code:"class Config(BaseModel):\n    env: Literal['prod','staging','dev']\n    replicas: int = Field(ge=1, le=100)"}
});

S("Python — OOP","pyoop-29","Testing OOP — MagicMock + spec","Senior",
`<h3>Контекст</h3><p><b>Python — OOP.</b> Testing OOP — MagicMock + spec. Среда сценария симулирует Python — OOP-окружение; основные инструменты терминала здесь: команды терминала.</p><h3>Задача</h3><p>Напишите тест с <code>MagicMock(spec=StorageBackend)</code>, <code>assert_called_once_with</code>, <code>side_effect</code>.</p>`,
"dev@py:~$",
[["^pytest",`2 passed`,"ok"]],
[{re:"pytest",l:"тесты с mock"}],
{files:{"main.py":"from typing import Protocol\n\nclass StorageBackend(Protocol):\n    def upload(self, key: str, data: bytes) -> str: ...\n\nclass BackupManager:\n    def __init__(self, storage: StorageBackend):\n        self.storage = storage\n    def backup(self, name: str, data: bytes) -> str:\n        return self.storage.upload(f'backups/{name}', data)\n", "test_main.py":"# TODO: write tests\ndef test_backup():\n    pass\n"}, file:"test_main.py", checks:[{re:"MagicMock",l:"MagicMock"}, {re:"assert_called",l:"assert_called"}, {re:"spec=",l:"spec=StorageBackend"}],
 hints:["`MagicMock(spec=StorageBackend)` — мок с проверкой сигнатуры; несуществующие методы → `AttributeError`.","`fake.upload.return_value = 's3://...'` — задаёт возвращаемое значение.","`fake.upload.side_effect = ConnectionError(...)` — симулирует ошибку"],
 solutionFiles:{"main.py":"from typing import Protocol\n\nclass StorageBackend(Protocol):\n    def upload(self, key: str, data: bytes) -> str: ...\n\nclass BackupManager:\n    def __init__(self, storage: StorageBackend):\n        self.storage = storage\n    def backup(self, name: str, data: bytes) -> str:\n        return self.storage.upload(f'backups/{name}', data)\n", "test_main.py":"from unittest.mock import MagicMock\nfrom main import BackupManager, StorageBackend\n\ndef test_backup_success():\n    fake = MagicMock(spec=StorageBackend)\n    fake.upload.return_value = 's3://bucket/backups/db.sql'\n    mgr = BackupManager(fake)\n    result = mgr.backup('db.sql', b'data')\n    fake.upload.assert_called_once_with('backups/db.sql', b'data')\n    assert result == 's3://bucket/backups/db.sql'\n\ndef test_backup_failure():\n    fake = MagicMock(spec=StorageBackend)\n    fake.upload.side_effect = ConnectionError('timeout')\n    mgr = BackupManager(fake)\n    try:\n        mgr.backup('db.sql', b'data')\n        assert False, 'should raise'\n    except ConnectionError:\n        pass\n    assert fake.upload.call_count == 1\n"},
 solution:{why:"DI + MagicMock(spec=Protocol) = тесты без реального S3, с проверкой сигнатуры.", changes:["Тест 1: success с `return_value` и `assert_called_once_with`","Тест 2: failure с `side_effect` и `ConnectionError`"], code:"fake = MagicMock(spec=StorageBackend)\nfake.upload.return_value = 's3://...'\nmgr = BackupManager(fake)\nresult = mgr.backup('db.sql', b'data')\nfake.upload.assert_called_once_with(...)"}
});

S("Python — OOP","pyoop-30","Mixin pattern — LoggingMixin + RetryMixin","Advanced",
`<h3>Контекст</h3><p><b>Python — OOP.</b> Mixin pattern — LoggingMixin + RetryMixin. Среда сценария симулирует Python — OOP-окружение; основные инструменты терминала здесь: команды терминала.</p><h3>Задача</h3><p>Создайте <code>LoggingMixin</code> (property <code>log</code>) и <code>RetryMixin</code> (<code>with_retry</code>) и используйте в <code>K8sClient</code>.</p>`,
"dev@py:~$",
[["^python main.py",`pods ok`,"ok"]],
[{re:"python main.py",l:"mixin test"}],
{files:{"main.py":"class K8sClient:\n    def __init__(self, endpoint):\n        self.endpoint = endpoint\n    def get_pods(self):\n        print(f'GET {self.endpoint}/api/v1/pods')\n        return {'items': []}\n"}, file:"main.py", checks:[{re:"class LoggingMixin",l:"LoggingMixin"}, {re:"class RetryMixin",l:"RetryMixin"}, {re:"LoggingMixin.*RetryMixin",l:"множественное наследование"}],
 hints:["Mixin — класс без `__init__`, добавляет одну capability: `LoggingMixin` даёт `self.log`.","RetryMixin: `def with_retry(self, fn, *a): for i in range(3): try: return fn(*a) ...`","`class K8sClient(LoggingMixin, RetryMixin):` — MRO корректен т.к. Mixins без `__init__`"],
 solutionFiles:{"main.py":"import logging\n\nclass LoggingMixin:\n    @property\n    def log(self):\n        return logging.getLogger(self.__class__.__name__)\n\nclass RetryMixin:\n    retry_count: int = 3\n    def with_retry(self, fn, *args, **kwargs):\n        for i in range(self.retry_count):\n            try:\n                return fn(*args, **kwargs)\n            except Exception as e:\n                self.log.warning('retry %d: %s', i, e)\n                if i == self.retry_count - 1:\n                    raise\n\nclass K8sClient(LoggingMixin, RetryMixin):\n    def __init__(self, endpoint: str):\n        self.endpoint = endpoint\n\n    def get_pods(self):\n        return self.with_retry(self._fetch_pods)\n\n    def _fetch_pods(self):\n        self.log.info('GET %s/api/v1/pods', self.endpoint)\n        return {'items': []}\n\nclient = K8sClient('https://k8s.local:6443')\nresult = client.get_pods()\nprint(f'pods ok: {len(result[\"items\"])} items')\n"},
 solution:{why:"Mixins добавляют capabilities без God object; каждый Mixin — одна ответственность, без `__init__`.", changes:["`LoggingMixin` с `@property log`","`RetryMixin` с `with_retry`","`K8sClient(LoggingMixin, RetryMixin)`"], code:"class LoggingMixin:\n    @property\n    def log(self): return logging.getLogger(self.__class__.__name__)\nclass RetryMixin:\n    def with_retry(self, fn, *a): ..."}
});
