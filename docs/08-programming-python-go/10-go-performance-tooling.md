# 🚀 10. Go Профилирование: pprof, GC, Race Detector

## 🔬 pprof: встроенный профилировщик

Любой сервис добавляет endpoint и получает полный арсенал:

```go
import _ "net/http/pprof"

go func() {
    log.Println(http.ListenAndServe("localhost:6060", nil))   // НЕ наружу!
}()
```

```bash
go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30   # CPU-профиль
go tool pprof http://localhost:6060/debug/pprof/heap                  # память сейчас
curl -s localhost:6060/debug/pprof/goroutine?debug=1 | head -50       # стеки горутин текстом

# В pprof-консоли:
(pprof) top10            # топ по flat (собственное время)
(pprof) list ParseLog    # построчная раскраска функции!
(pprof) web              # graph в браузере
(pprof) peek slowFunc    # кто зовёт/что зовёт
```

```bash
# Бенчмарк с профилем:
go test -bench=. -cpuprofile cpu.out -memprofile mem.out ./...
go tool pprof -http=:8080 cpu.out        # flamegraph + callgraph UI
```

| Профиль | Что ищем |
|---|---|
| cpu | горячие функции, сериализация, лишние regex |
| heap | утечки (растущий inuse), аллокации в цикле |
| goroutine | утечки горутин (сотни одинаковых стеков на `<-ch`) |
| block/mutex | конкуренция за локи |
| allocs | давление на GC |

## 🧠 GC: как он работает и что настраивать

Трёхцветный конкурентный mark-sweep. Ключевая метрика — **живое множество** (live heap):

```bash
GOGC=100 go run main.go     # default: GC при heap = live ×2 (100% прирост)
GOMEMLIMIT=4GiB             # софт-лимит памяти (Go 1.19+): GC ускорится рядом с лимитом
```

```go
import "runtime/debug"
debug.SetGCPercent(200)         // реже GC → меньше CPU, больше RAM (batch-обработчики)
debug.SetMemoryLimit(512 << 20) // контейнер с memory limit 512Mi
```

**Правило для K8s:** `GOMEMLIMIT` ≈ 75–85% от `resources.limits.memory`, иначе OOMKiller убьёт процесс до того, как GC успеет.

Сокращение давления на GC (лучше любых флагов):

```go
// Pre-allocation вместо роста слайса:
buf := make([]byte, 0, expectedSize)
results := make([]Result, 0, len(inputs))

// sync.Pool для переиспользования буферов:
var bufPool = sync.Pool{New: func() any { return new(bytes.Buffer) }}
b := bufPool.Get().(*bytes.Buffer); defer func() { b.Reset(); bufPool.Put(b) }()

// Строки ↔ байты без копий там, где можно (strings.Builder, unsafe в hot path).
```

## ⚡ Race detector: гонки данных

```bash
go test -race ./...          # инструментированная сборка: ловит concurrent access без синхронизации
go build -race               # бинарник с детектором (для staging, ×5–10 медленнее)
```

```go
// Типовая найденная гонка:
counter++                     // из двух горутин без мьютекса → lost updates
// Фиксы: atomic.AddInt64 / mutex / пересылка через канал одному владельцу.
```

Race detector находит **гонки данных**, но не дедлоки и не логические race conditions (порядок сообщений). `-race` обязателен в CI на каждом PR.

## 📉 Реальный кейс разбора

Симптом: контроллер потребляет 900 МБ RAM и периодически тормозит.

```bash
1. curl :6060/debug/pprof/heap?debug=1
   → 700 МБ в [][]byte из parseManifests — манифесты копятся в глобальном кэше без лимита.
2. GOGC дефолт при live=700МБ → GC триггерится только на 1.4ГБ → пики.
Фиксы:
   - кэш с ограничением (lru.Cache maxsize 1000);
   - GOMEMLIMIT=768MiB;
   - pre-allocation слайсов по len(manifests).
Результат: RSS стабилен 180 МБ, p99 reconcile −40%.
```

## 🧰 Диагностика живого процесса

```bash
# Без endpoint'а — attach к работающему процессу:
go tool pprof -pid $(pgrep dtk)          # снапшот CPU
dlv attach $PID                          # delve: отладчик прод-процесса (осторожно)

# Execution tracer: что делали горутины во времени
go test -trace trace.out ./... && go tool trace trace.out
# видно: блокировки каналов, GC паузы, параллелизм по ядрам

expvar                                   # простой JSON-статус из stdlib для мелких утилит
```

## ❓ Пять вопросов для самопроверки

---


## ✅ Проверь себя

> Отвечай вслух до раскрытия ответа. Если «не помню» — вернись к разделу.


**В1. Чем flat (self) время отличается от cumulative в pprof top?**
<details><summary>Ответ</summary>
Flat — время исполнения самой функции без вызовов; cumulative — включая все вложенные. Оптимизируют по flat листьев; большой cumulative при малом flat значит «функция — оркестратор», смотреть надо её детей через list/web.
</details>

**В2. Что делает GOMEMLIMIT и почему он важнее GOGC в Kubernetes?**
<details><summary>Ответ</summary>
GOMEMLIMIT — мягкий потолок heap: GC начинает работать агрессивнее при приближении, предотвращая рост до OOMKill. В контейнерах лимит памяти жёсткий (cgroup), а GOGC считает проценты от live heap и ничего не знает про потолок — комбинация GOMEMLIMIT≈80% limit спасает от убийства пода.
</details>

**В3. Как найти утечку горутин через pprof?**
<details><summary>Ответ</summary>
/debug/pprof/goroutine?debug=1 выводит стеки всех горутин, сгруппированные по счётчику. Утечка видна как сотни идентичных стеков, заблокированных на одном месте (чтение канала, которого никто не закроет). Сравнение снапшотов во времени подтверждает рост.
</details>

**В4. Почему sync.Pool помогает GC, но опасен для короткоживущих программ?**
<details><summary>Ответ</summary>
Pool переиспользует объекты между GC-циклами, сокращая аллокации. Но его содержимое может быть очищено любым GC — в короткой программе пул почти никогда не даёт повторных использований, только overhead и риск держать большие буферы в памяти между редкими использованием.
</details>

**В5. Тесты зелёные локально, но падают с -race на CI. Что это значит?**
<details><summary>Ответ</summary>
В коде есть гонка данных (несинхронизированный доступ из разных горутин), которую локальный прогон просто «повезло» не поймал: race detector требует фактического одновременного доступа, порядок планирования недетерминирован. Это реальный баг: фиксируется мьютексом/атомиками/каналом, а не отключением -race.
</details>

---

## ✅ Итоги раздела Go (02–10)

Покрыто: типы/интерфейсы/ошибки/generics, конкурентность (channels/context/errgroup), тестирование (table-driven/fuzz/bench), modules/supply chain, CLI (cobra/goreleaser/distroless), client-go (informers/workqueue), kubebuilder-операторы, HTTP/gRPC, pprof/GC/race.

*Связанные разделы:* [Python](01-python-for-devops.md) · [Git](../02-git/03-git-internals-deep-dive.md) · [Мини-проекты портфолио](03-practice-projects.md)
