# 🐹 02. Go Fundamentals Deep: Типы, Интерфейсы, Ошибки, Generics

## 🧩 Система типов: value vs reference семантика

Всё в Go копируется по значению. Структура присваивается **копией**, слайс/мапа/канал — копией заголовка (указатель на данные внутри):

```go
type DeployConfig struct {
    Name     string
    Replicas int32
    Tags     []string          // слайс = {ptr, len, cap} — 24 байта заголовка
    Labels   map[string]string // мапа = указатель на hmap — 8 байт
}

func mutate(c DeployConfig) {
    c.Replicas = 99            // НЕ видно снаружи (копия)
    c.Tags[0] = "hacked"       // ВИДНО снаружи! общий backing array
}

// Правило проектирования API:
// маленькие иммутабельные структуры → по значению;
// большие/мутабельные → *DeployConfig + комментарий о мутации.
```

## 🎭 Интерфейсы изнутри: itable и неявная реализация

Интерфейс = пара указателей `(type descriptor, data)`:

```go
var n Notifier = SlackNotifier{}   // (itab: *SlackNotifier→Notifier, data: &{})
var e Notifier                      // nil интерфейс: оба nil

// ЛОВУШКА №1: typed nil
func find() Notifier {
    var p *SlackNotifier            // вернёт nil-указатель
    return p                        // интерфейс НЕ nil: (type=*SlackNotifier, data=nil)!
}
if find() != nil { find().Send() }  // Send на nil-получателе → паника или «работает»

// Ловушка №2: реализация через pointer receiver доступна только у *T
type S struct{}
func (s *S) Hello() {}
var i interface{ Hello() } = S{}    // ❌ compile error: S не реализует (метод у *S)
var j interface{ Hello() } = &S{}   // ✅
```

**Неявная реализация** — главная фишка: тип реализует интерфейс без деклараций. Пишете маленькие интерфейсы там, где *потребляют*:

```go
// Потребитель объявляет ровно то, что использует (Go proverb):
type HealthChecker interface {
    Healthy(ctx context.Context) (bool, error)
}
// Любой сервис с таким методом подходит — тестируется подстановкой мока.
```

## 📦 Ошибки: wrapping и errors.Is/As

`error` — просто интерфейс `Error() string`. Идиоматика с Go 1.13:

```go
import (
    "errors"
    "fmt"
)

var ErrNotFound = errors.New("resource not found")   // sentinel-ошибка

type RateLimitError struct {                          // структурная ошибка
    RetryAfter time.Duration
}
func (e *RateLimitError) Error() string { return "rate limited" }

func getDeployment(name string) (*Deployment, error) {
    resp, err := api.Get(name)
    if err != nil {
        if resp.StatusCode == 404 {
            return nil, fmt.Errorf("get deployment %q: %w", name, ErrNotFound) // %w = wrap!
        }
        return nil, fmt.Errorf("get deployment %q: %w", name, err)
    }
    return decode(resp), nil
}

// Вызывающий код различает сценарии:
if errors.Is(err, ErrNotFound) { create() }           // проверка цепочки wrap'ов
var rl *RateLimitError
if errors.As(err, &rl) { sleep(rl.RetryAfter) }       // извлечение типа из цепочки
```

Правила:
- `fmt.Errorf(...: %w)` при переносе наверх; `%v` — если нижняя ошибка приватная деталь.
- Sentinel-ошибки (`ErrXxx`) для ожидаемых сценариев; структуры — когда нужны поля.
- `panic` — только для программных ошибок программиста (nil map write, index bug); всё остальное — `error`.

## 🧬 Generics без перегибов

```go
// Утилита для любого типа:
func Contains[T comparable](xs []T, x T) bool {
    for _, v := range xs {
        if v == x { return true }
    }
    return false
}

// Ограничения (constraints):
type Number interface{ ~int | ~int64 | ~float64 }      // ~ включает именованные типы
func Sum[T Number](xs []T) T {
    var s T
    for _, v := range xs { s += v }
    return s
}

// Реальный кейс DevOps: generic GetOrCreate для кэшей конфигураций.
func GetOrLoad[K comparable, V any](m *sync.Map, key K, load func(K) (V, error)) (V, error) { ... }
```

⚠️ Генерики — не замена интерфейсам: интерфейсы полиморфны в рантайме, генерики — специализация на компиляции. Не пишите `GenericFactoryAbstractBuilder` — в Go это антипаттерн.

## 🗺️ Нулевые значения как фича

```go
var mu sync.Mutex        // готов к работе, zero value = разблокирован
var buf bytes.Buffer     // готов к записи
var wg sync.WaitGroup    // готов
cfg := &Config{}         // все поля нулевые — часто валидное состояние!

// Функциональные опции поверх zero-value:
type Server struct{ addr string; timeout time.Duration }
type Option func(*Server)
func WithTimeout(d time.Duration) Option { return func(s *Server) { s.timeout = d } }
func NewServer(opts ...Option) *Server {
    s := &Server{addr: ":8080", timeout: 30 * time.Second}   // разумные дефолты
    for _, o := range opts { o(s) }
    return s
}
```

## ❓ Пять вопросов для самопроверки

---


## ✅ Проверь себя

> Отвечай вслух до раскрытия ответа. Если «не помню» — вернись к разделу.


**В1. Почему мутация `c.Tags[0]` видна вызывающему, а `c.Replicas = 99` нет?**
<details><summary>Ответ</summary>
Структура передана копией: поле Replicas скопировано, изменение локально. Поле Tags — копия заголовка слайса, но он ссылается на тот же backing array в куче; запись через него видна всем держателям этого массива.
</details>

**В2. Что такое «typed nil» и почему `err != nil` может быть true при nil-указателе?**
<details><summary>Ответ</summary>
Интерфейс хранит (тип, значение). Возврат nil-указателя конкретного типа даёт пару (T, nil) — интерфейс не равен nil (нужна пара nil,nil). Классический баг обёрток, возвращающих *ConcreteType вместо error напрямую. Лечится возвратом явного nil.
</details>

**В3. Чем %w отличается от %v в fmt.Errorf?**
<details><summary>Ответ</summary>
%w оборачивает ошибку, сохраняя её в цепочке Unwrap(): ошибки.Is/As смогут найти sentinel/тип наверху. %v только форматирует текст — информация о типе теряется, errors.Is всегда false.
</details>

**В4. Когда выбрать интерфейс, а когда генерики?**
<details><summary>Ответ</summary>
Разные реализации с разным поведением (Notifier: slack/telegram) — интерфейс, полиморфизм рантайма. Одинаковая логика над разными ТИПАМИ данных (Sum по числам, Contains) — генерики, без боксинга и рефлексии. Генерики не заменяют поведение, только типы.
</details>

**В5. Что даёт паттерн functional options поверх zero-value структур?**
<details><summary>Ответ</summary>
Конструктор с разумными дефолтами + расширяемый список опций без breaking changes (новая опция = новая функция, старые вызовы не меняются), читаемые вызовы NewServer(WithTimeout(5*time.Second)) вместо позиционных аргументов с нулями.
</details>

---

*Что дальше:* [03. Конкурентность](03-go-concurrency-patterns.md) · [01. Go для DevOps](02-go-for-devops.md)
