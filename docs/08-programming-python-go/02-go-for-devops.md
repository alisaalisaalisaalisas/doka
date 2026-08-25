# 🐹 02. Go для DevOps: полный языковой курс + практика

> Уровень: Junior→Senior. Go — язык всего cloud-native стека (Docker, K8s, Prometheus). Цель: читать чужой код уверенно, писать CLI-утилиты и простые операторы.

**Оглавление:** [1. Основы](#1-основы-пакеты-переменные-нулевые-значения) · [2. Структуры и интерфейсы](#2-структуры-методы-интерфейсы) · [3. Ошибки](#3-ошибки-errorsisas) · [4. Горутины и каналы](#4-горутины-каналы-select) · [5. context](#5-context-отмена-и-таймауты) · [6. sync и race detector](#6-sync-и-race-detector) · [7. Тесты и бенчмарки](#7-тесты-и-бенчмарки) · [8. Модули и CLI](#8-модули-и-cli-cobra) · [9. Стандартная библиотека](#9-стандартная-библиотека-devops-набор) · [10. pprof](#10-pprof-профилирование) · [11. Грабли](#11-грабли-языка) · [2.5 Вопросы](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

## 1. Основы: пакеты, переменные, нулевые значения

```go
package main

import (
	"fmt"
	"os"
)

var global = "константа верхнего уровня"     // видим в пакете

func main() {
	name := "api"              // короткое объявление (только внутри функций)
	var port int = 8080        // явное
	var timeout float64        // нулевое значение: 0 (не nil!)
	var enabled bool           // false
	var host string            // "" (пустая строка)
	fmt.Println(name, port, timeout, enabled, host == "")

	// Нулевые значения — Go НИКОГДА не даёт «мусор»: int=0, string="", slice=nil, map=nil
	if len(os.Args) > 1 {
		fmt.Println("arg:", os.Args[1])
	}
}
```

**Ключевое отличие от Python:** статическая типизация + компиляция. Ошибки типов ловятся ДО запуска; бинарник — один файл без зависимостей.

```bash
CGO_ENABLED=0 GOOS=linux go build -o server ./src   # статический бинарник для контейнера
```

---

## 2. Структуры, методы, интерфейсы

```go
type Server struct {                    // поля с заглавной буквы = экспортируются
	Name    string
	IP      string
	Tags    map[string]string
	Replicas int
}

// Метод — функция с receiver'ом
func (s Server) IsProd() bool {
	return s.Tags["env"] == "prod"
}

// Указательный receiver — может менять объект
func (s *Server) Scale(delta int) {
	s.Replicas += delta
}
```

### Интерфейсы: неявная реализация (самое важное в Go)

```go
type Prober interface {                 // интерфейс = набор методов
	Check() error
}

// НИКАКИХ "implements" — тип реализует интерфейс автоматически,
// если имеет нужные методы:
type HTTPProbe struct{ URL string }

func (h HTTPProbe) Check() error {
	resp, err := http.Get(h.URL)
	if err != nil { return err }
	defer resp.Body.Close()
	if resp.StatusCode != 200 { return fmt.Errorf("status %d", resp.StatusCode) }
	return nil
}

func WaitFor(p Prober) error {          // функция принимает ЛЮБОЙ тип с Check()
	for i := 0; i < 30; i++ {
		if err := p.Check(); err == nil { return nil }
		time.Sleep(time.Second)
	}
	return fmt.Errorf("timeout")
}
```

**Идиома Go:** «Принимай интерфейсы, возвращай структуры». Интерфейсы объявляет **потребитель**, не автор типа.

---

## 3. Ошибки: errors.Is/As

В Go нет исключений. Ошибка — обычное значение (последний возвращаемый аргумент):

```go
func load(path string) ([]byte, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("load %s: %w", path, err)   // %w = оборачиваем ошибку
	}
	return data, nil
}

func main() {
	data, err := load("config.yaml")
	if err != nil {
		log.Fatal(err)                    // "load config.yaml: open ...: no such file"
	}
	_ = data
}
```

```go
// Проверка типа/значения обёрнутой ошибки:
var ErrNotFound = errors.New("not found")     // sentinel-ошибка

if errors.Is(err, ErrNotFound) { ... }        // по цепочке %w

type ValidationError struct{ Field string }
func (e *ValidationError) Error() string { return "bad field: " + e.Field }

var ve *ValidationError
if errors.As(err, &ve) { fmt.Println(ve.Field) }   // вытащить кастомную ошибку
```

**Идиома:** обрабатывай ошибку ИЛИ передавай наверх — никогда не то и другое (`log` + `return err` — двойной лог запрещён).

---

## 4. Горутины, каналы, select

```go
// Горутина = лёгкий поток (стартует за наносекунды)
go doWork()

// WaitGroup: дождаться всех
var wg sync.WaitGroup
for _, host := range hosts {
	wg.Add(1)
	go func(h string) {
		defer wg.Done()
		checkHost(h)
	}(host)
}
wg.Wait()
```

```go
// Канал: передача данных между горутинами
results := make(chan string, len(hosts))    // буферизованный
for _, h := range hosts {
	go func(h string) { results <- probe(h) }(h)
}
for range hosts {
	fmt.Println(<-results)
}
```

```go
// Современный вариант: errgroup (ограничение конкурентности + ошибки)
g, ctx := errgroup.WithContext(ctx)
g.SetLimit(16)                              // max 16 параллельно!
for _, h := range hosts {
	h := h
	g.Go(func() error { return checkHost(ctx, h) })
}
if err := g.Wait(); err != nil { ... }      // первая ошибка отменяет ctx
```

```go
// select: несколько каналов + таймаут
select {
case res := <-results:
	fmt.Println(res)
case <-time.After(5 * time.Second):
	return fmt.Errorf("timeout")
case <-ctx.Done():
	return ctx.Err()
}
```

---

## 5. context: отмена и таймауты

**Правило:** `ctx` — первый параметр любой функции, которая может блокироваться.

```go
func fetch(ctx context.Context, url string) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()                              // ОБЯЗАТЕЛЬНО: иначе утечка

	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err                              // context deadline exceeded
	}
	defer resp.Body.Close()
	return nil
}
```

При отмене родительского ctx все дочерние операции получают сигнал — так работает graceful shutdown и отмена зависших запросов.

---

## 6. sync и race detector

```go
var mu sync.Mutex
var counter int

mu.Lock()
counter++
mu.Unlock()

// sync.Once — одноразовая инициализация
var once sync.Once
once.Do(func() { config = loadConfig() })
```

```bash
go test -race ./...        # детектор гонок данных — ОБЯЗАТЕЛЕН в CI!
# WARNING: DATA RACE — найдена некорректная работа с общей памятью
```

---

## 7. Тесты и бенчмарки

```go
// server_test.go — файл рядом с кодом, функции Test*
func TestParseReplicas(t *testing.T) {
	tests := []struct{          // table-driven — стандарт Go
		name string
		in   string
		want int
		wantErr bool
	}{
		{"ok", "5", 5, false},
		{"neg", "-1", 0, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := ParseReplicas(tt.in)
			if tt.wantErr && err == nil { t.Fatal("ожидали ошибку") }
			if got != tt.want { t.Fatalf("got %d want %d", got, tt.want) }
		})
	}
}

func BenchmarkProbe(b *testing.B) {
	for b.Loop() { probe("http://x") }   // или for i := 0; i < b.N; i++
}
```

```bash
go test ./... -race -cover
go test -bench=. -benchmem
```

---

## 8. Модули и CLI: Cobra

```bash
go mod init github.com/user/kubeclean
go get github.com/spf13/cobra@latest
go mod tidy
go build -o kubeclean .
```

```go
rootCmd := &cobra.Command{
	Use:   "kubeclean",
	Short: "Чистка завершённых подов",
	SilenceUsage: true,
	RunE: func(cmd *cobra.Command, args []string) error {
		dry, _ := cmd.Flags().GetBool("dry-run")
		return run(dry)
	},
}
rootCmd.Flags().Bool("dry-run", true, "показать без удаления")   // safe by default
```

---

## 9. Стандартная библиотека: DevOps-набор

```go
// HTTP-клиент с таймаутом (дефолтный клиент БЕЗ таймаута — ловушка!)
client := &http.Client{Timeout: 10 * time.Second}
resp, err := client.Get(url)

// JSON
var pods struct {
	Items []struct {
		Metadata struct{ Name string `json:"name"` } `json:"metadata"`
	} `json:"items"`
}
json.NewDecoder(resp.Body).Decode(&pods)

// Запуск внешних команд (без shell — безопасно)
out, err := exec.CommandContext(ctx, "kubectl", "get", "pods", "-n", "prod").Output()

// Флаги/окружение
port := os.Getenv("PORT")
flag.StringVar(&ns, "namespace", "default", "namespace")
```

---

## 10. pprof: профилирование

```go
import _ "net/http/pprof"          // регистрирует /debug/pprof на default mux
go http.ListenAndServe("localhost:6060", nil)   // ТОЛЬКО localhost!
```

```bash
go tool pprof -http=:8080 http://localhost:6060/debug/pprof/heap
curl localhost:6060/debug/pprof/goroutine?debug=1 | head    # утечка горутин
```

---

## 11. Грабли языка

| Грабля | Суть | Решение |
| :--- | :--- | :--- |
| Nil interface != nil struct | интерфейс с nil-указателем внутри ≠ nil | возвращать `nil` явно, не указатель |
| Slice aliasing | `s2 := s1[:2]` делит массив; append может изменить s1 | `copy` или `append(s, ...)` с полным срезом `s1[:2:2]` |
| Loop variable capture (до 1.22) | горутина видит последнее значение `i` | `i := i` в цикле / параметр горутины (в 1.22+ исправлено) |
| Горутина-утечка | горутина ждёт канал, который никто не закроет | context + buffered channels |
| Дефолтный http.Client без таймаута | вечное ожидание | `&http.Client{Timeout: 10*time.Second}` |
| map не потокобезопасен | гонка при записи | sync.Mutex / sync.Map |

---

## 2.5 Проверь себя — 5 вопросов

**В1. Чем Go-интерфейсы отличаются от Java/C#-интерфейсов, и почему это важно для тестирования?**

<details><summary>Ответ</summary>
Реализация неявная: тип удовлетворяет интерфейсу просто наличием методов, без объявления. Это позволяет объявить интерфейс в месте ПОТРЕБЛЕНИЯ и подменить зависимость моком в тестах, не трогая код типа.
</details>

**В2. Найдите ошибку: `resp, err := http.Get(url)` — дальше сразу `resp.Body`. Что не так?**

<details><summary>Ответ</summary>
Не проверен err — при ошибке resp=nil, будет паника. И нет defer resp.Body.Close() — утечка соединений. Порядок: err check → defer Close → работа.
</details>

**В3. Сценарий: горутины пишут в map без мьютекса — тест проходит, в проде паника. Почему тест не поймал?**

<details><summary>Ответ</summary>
Гонка данных недетерминирована: в тесте планировщик мог не столкнуть горутины. Детектор: go test -race (TSan) — ловит на уровне доступа к памяти. Правило: -race в CI всегда.
</details>

**В4. Зачем `defer cancel()` сразу после `context.WithTimeout`, если таймаут «и так сработает»?**

<details><summary>Ответ</summary>
Без cancel таймер контекста живёт до истечения — утечка ресурсов (таймеры/память) для каждого вызова. cancel освобождает их немедленно после завершения функции; vet/vic-линтеры проверяют это.
</details>

**В5. Что выведет программа с `for i := 0; i < 3; i++ { go fmt.Println(i) }` на Go 1.20 и на 1.22+, и почему?**

<details><summary>Ответ</summary>
Go ≤1.21: все горутины захватывают ОДНУ переменную i → обычно «3 3 3» (к моменту печати цикл дошёл до конца). Go 1.22+: переменная цикла создаётся заново на каждой итерации → «0 1 2» в произвольном порядке.
</details>

---

## 2.6 Практика — 3 задания

### Задание 1: Health-checker с errgroup

**Условие:** проверить N URL параллельно (лимит 8), вернуть первый список упавших.

```go
// main.go
package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"golang.org/x/sync/errgroup"
)

func check(ctx context.Context, url string) error {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil { return err }
	resp.Body.Close()
	if resp.StatusCode >= 500 { return fmt.Errorf("%s: %d", url, resp.StatusCode) }
	return nil
}

func main() {
	urls := os.Args[1:]
	g, ctx := errgroup.WithContext(context.Background())
	g.SetLimit(8)
	for _, u := range urls {
		u := u
		g.Go(func() error { return check(ctx, u) })
	}
	if err := g.Wait(); err != nil {
		fmt.Fprintln(os.Stderr, "FAIL:", err)
		os.Exit(1)
	}
	fmt.Println("ALL OK")
}
```

```bash
go mod init checker && go get golang.org/x/sync/errgroup
go run . http://localhost:8000 http://localhost:9999
# Ожидание: FAIL: Get "http://localhost:9999": connection refused (exit 1)
```

**Проверь себя:** `go vet ./...` и `go test -race ./...` чисты; при всех живых URL — «ALL OK», exit 0.

**Разбор:** errgroup.SetLimit — канонический способ ограничить конкурентность; WithContext отменяет остальные проверки при первой ошибке (fail fast).

### Задание 2: Table-driven тесты парсера

**Условие:** функция `ParseDuration("5m30s")` → time.Duration; написать тесты.

```go
func TestParseDuration(t *testing.T) {
	tests := []struct{ in, wantErr string; want time.Duration }{
		{"5m30s", "", 330 * time.Second},
		{"", "empty", 0},
		{"garbage", "invalid", 0},
	}
	for _, tt := range tests {
		t.Run(tt.in, func(t *testing.T) {
			got, err := ParseDuration(tt.in)
			if tt.wantErr != "" && err == nil { t.Fatalf("хотели ошибку %q", tt.wantErr) }
			if got != tt.want { t.Fatalf("got %v want %v", got, tt.want) }
		})
	}
}
```

**Проверь себя:** `go test -v` — все subtests зелёные; добавьте кейс — тест сразу его покрывает.

**Разбор:** table-driven — идиоматичный стиль Go: одна тестовая функция, таблица кейсов, t.Run с именами. Читаемо и расширяемо без дублирования.

### Задание 3: Cobra CLI с dry-run и JSON-выводом

**Условие:** утилита `podinfo`: выводит список подов namespace в JSON; флаги `--namespace`, `--json`.

```go
rootCmd := &cobra.Command{
	Use: "podinfo", SilenceUsage: true,
	RunE: func(cmd *cobra.Command, args []string) error {
		ns, _ := cmd.Flags().GetString("namespace")
		out, err := exec.CommandContext(cmd.Context(), "kubectl",
			"get", "pods", "-n", ns, "-o", "json").Output()
		if err != nil { return err }
		if asJSON, _ := cmd.Flags().GetBool("json"); asJSON {
			fmt.Println(string(out)); return nil
		}
		var pods struct{ Items []struct {
			Metadata struct{ Name string `json:"name"` } `json:"metadata"` } `json:"items"` }
		return json.Unmarshal(out, &pods) == nil && func() bool {
			for _, p := range pods.Items { fmt.Println(p.Metadata.Name) }
			return true
		}() && nil == error(nil)
	},
}
rootCmd.Flags().String("namespace", "default", "")
rootCmd.Flags().Bool("json", false, "")
```

```bash
go run . --namespace prod --json | jq '.items | length'
# Ожидание: число подов; без --json — список имён
```

**Проверь себя:** `go run . --help` показывает флаги; несуществующий namespace → ошибка с exit 1 (RunE возвращает err).

**Разбор:** RunE (вместо Run) возвращает error — cobra сам напечатает и выставит exit 1. Флаги типизированы; exec.CommandContext уважает отмену.

---

*Назад к обзору: [Python для DevOps](01-python-for-devops.md) · [Раздел 08](../08-programming-python-go/01-python-for-devops.md)*

---

## 🧭 Что дальше

| Шаг | Материал |
| :--- | :--- |
| 💪 Практика | [Задачи по Go](../15-hands-on-practice/01-100-devops-practical-tasks-part1.md) |
| 🎤 Проверить себя | [Карточки Go в тренажёре](../22-trainer/index.md) |
