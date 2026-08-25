# 🔀 03. Go Конкурентность: Goroutines, Channels, Context, errgroup

## 🧵 Модель: M:N планировщик за 3 абзаца

Горутина — функция в конкурентном исполнении стоимостью ~2 КБ стека (растёт/сжимается). Планировщик Go мультиплексирует миллионы горутин на потоки ОС (GOMAXPROCS воркеров). Блокирующий syscall отдаёт поток, остальные горутины живут дальше. Отсюда правило: **не создавайте пулы «на всякий случай» — ограничивайте параллелизм семантикой задачи** (лимит соединений API, а не ядер CPU).

## 📮 Channels: правила выживания

```go
ch := make(chan Job)      // небуферизованный: send ждёт receive (синхронизация)
ch := make(chan Job, 100) // буфер: send ждёт только при полном буфере (backpressure)
```

| Операция | nil chan | открытый | закрытый |
|---|---|---|---|
| send `<-` | блок навсегда | блок/буфер | **паника** |
| receive `->` | блок навсегда | блок/буфер | мгновенно zero-value, ok=false |
| close | паника | ok | паника |

```go
// Закрывает ТОЛЬКО отправитель. Получатели читают так:
for job := range ch {              // выход по закрытию канала — идиоматичный цикл
    process(job)
}
val, ok := <-ch                    // ok=false — канал закрыт и пуст
```

### Классические паттерны

```go
// 1. Worker pool: N воркеров, задачи через канал, сбор результатов
jobs := make(chan string, len(urls))
results := make(chan Result, len(urls))
var wg sync.WaitGroup
for i := 0; i < 20; i++ {                       // лимит параллелизма
    wg.Add(1)
    go func() {
        defer wg.Done()
        for url := range jobs {
            results <- check(url)
        }
    }()
}
for _, u := range urls { jobs <- u }
close(jobs)
go func() { wg.Wait(); close(results) }()        // закрыть после ВСЕХ воркеров
for r := range results { collect(r) }

// 2. Pipeline: стадии соединяются каналами
source := readManifests(ctx)      // <-chan Manifest
validated := validateStage(ctx, source)
applied := applyStage(ctx, validated)

// 3. Fan-out / fan-in: N воркеров на один вход, merge выходов

// 4. Done-канал / ctx.Done() для отмены:
select {
case res := <-ch:
    use(res)
case <-ctx.Done():
    return ctx.Err()
case <-time.After(5 * time.Second):
    return fmt.Errorf("timeout")
}
```

## ⛔ Context: контракты, которые надо соблюдать

```go
func deploy(ctx context.Context, cfg Config) error {
    req, _ := http.NewRequestWithContext(ctx, http.MethodPost, url, body)  // ctx в запрос!
    ...
}

// Правила:
// 1. ctx — ПЕРВЫЙ параметр функции.
// 2. Не хранить ctx в структуре — передавать явно.
// 3. Всегда уважать ctx.Done(): долгие циклы проверяют его каждую итерацию.
// 4. context.WithTimeout(parent, 30*time.Second); defer cancel() ОБЯЗАТЕЛЬНО (утечка таймера).
```

```go
ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
defer cancel()

// Цепочка: parent отменился → все дети отменены каскадом.
values := context.WithValue(ctx, traceIDKey, id)   // только request-scoped метаданные!
```

## 🚦 sync-примитивы и когда они лучше каналов

```go
// Mutex: защита общей памяти (короткие критические секции).
// Каналы: передача владения данными между горутинами.
// «Don't communicate by sharing memory; share memory by communicating»,
// но mutex для кэшей/счётчиков — норм.

var mu sync.Mutex
mu.Lock(); defer mu.Unlock()          // defer сразу после Lock!

atomic.AddInt64(&counter, 1)          // простой счётчик без локов

sync.Once{}.Do(initFn)                // одноразовая инициализация
sync.Map                              // для key-once-read-many кэшей, иначе обычный map+RWMutex
errgroup.SetLimit(50)                 // см. ниже — чаще всего нужен именно он
```

## 🧰 errgroup: стандарт продакшн-кода

```go
import "golang.org/x/sync/errgroup"

g, ctx := errgroup.WithContext(ctx)
g.SetLimit(20)                                  // максимум 20 одновременных задач

for _, svc := range services {
    svc := svc
    g.Go(func() error {                         // первая ошибка отменяет ctx всех остальных
        return restartService(ctx, svc)
    })
}
if err := g.Wait(); err != nil {
    return fmt.Errorf("rolling restart failed: %w", err)
}
```

Это заменяет 90% рукописных worker-pool'ов: лимит + отмена + первая ошибка — три строки.

## 💀 Race detector и утечки горутин

```bash
go test -race ./...                  # ОБЯЗАТЕЛЬНО в CI
go run -race main.go                 # гонка найдётся даже в рантайме
go vet ./...                         # copylocks: копирование мьютекса и др.
```

```go
// Детектор утечек в тестах: goleak проверит, что после теста не осталось горутин
import "go.uber.org/goleak"
func TestMain(m *testing.M) { goleak.VerifyTestMain(m) }
```

Типовая утечка: горутина пишет в канал, который больше никто не читает → вечный блок. Лечение: select с ctx.Done(), буферизованный канал, или owner закрывает.

## ❓ Пять вопросов для самопроверки

---


## ✅ Проверь себя

> Отвечай вслух до раскрытия ответа. Если «не помню» — вернись к разделу.


**В1. Кто закрывает канал и почему получение close получателем — баг?**
<details><summary>Ответ</summary>
Отправитель: только он знает, когда данные закончились. close со стороны получателя ломает контракт (отправители запаникуют при следующем send), двойной close паникует. Получатель узнаёт о закрытии по завершению range/ok=false.
</details>

**В2. Зачем defer cancel() сразу после context.WithTimeout, если timeout сам истечёт?**
<details><summary>Ответ</summary>
Без cancel ресурсы контекста (таймер, запись в родителя) живут до срабатывания таймаута — при тысячах быстрых операций это накопление мусора и ложные отмены. Cancel освобождает немедленно; vet/линтеры ловят потерянный cancel.
</details>

**В3. Чем errgroup.WithContext отличается от простого WaitGroup?**
<details><summary>Ответ</summary>
WaitGroup только ждёт завершения всех. errgroup: (1) возвращает первую ошибку, (2) связанный ctx отменяется при первой ошибке — остальные задачи получают сигнал остановиться, (3) SetLimit задаёт параллелизм. Для «запусти N и обработай ошибки» это стандарт.
</details>

**В4. Горутина утекла: как диагностировать?**
<details><summary>Ответ</summary>
Симптом: растёт runtime.NumGoroutine()/RSS. Инструменты: pprof goroutine profile (curl :6060/debug/pprof/goroutine?debug=1) покажет стеки всех горутин сгруппированно — сотня одинаковых стеков на «чтении канала» укажет виновника; в тестах goleak падает при остатке горутин.
</details>

**В5. Когда mutex предпочтительнее канала?**
<details><summary>Ответ</summary>
Защита общего состояния (кэш, счётчик, карта конфигов): короткие критические секции, нет передачи владения. Каналы — когда данные переходят между владельцами (очередь задач, pipeline). Мьютекс вокруг канала — признак смешения моделей.
</details>

---

*Что дальше:* [04. Тестирование](04-go-testing-benchmarks.md) · [07. client-go](07-go-k8s-client-go.md)
