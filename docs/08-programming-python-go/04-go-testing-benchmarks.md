# 🧪 04. Go Тестирование: Table-Driven, Моки, Fuzzing, Benchmarks

## 📋 Table-driven tests: канон языка

```go
func TestParseImage(t *testing.T) {
    tests := []struct {
        name    string
        image   string
        want    ImageRef
        wantErr bool
    }{
        {"full", "nginx:1.25.3", ImageRef{"nginx", "1.25.3"}, false},
        {"no tag", "nginx", ImageRef{"nginx", "latest"}, false},
        {"registry+port+digest", "reg.local:5000/app@sha256:abc", ImageRef{"app", "sha256:abc"}, false},
        {"empty", "", ImageRef{}, true},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := ParseImage(tt.image)
            if (err != nil) != tt.wantErr {
                t.Fatalf("err = %v, wantErr %v", err, tt.wantErr)
            }
            if got != tt.want {
                t.Errorf("got %+v, want %+v", got, tt.want)
            }
        })
    }
}
```

```bash
go test ./... -run TestParseImage/no_tag -v    # один кейс
go test ./... -count=1                          # без кэша
go test -failfast ./pkg/...                     # стоп на первой ошибке
gotestsum --format testname ./...               # красивый вывод в CI
```

## 🎭 Моки: интерфейсы вместо фреймворков

Go-идиома: зависимость — маленький интерфейс; тест подставляет реализацию.

```go
// Продакшн-код зависит от интерфейса:
type ClusterClient interface {
    ScaleDeployment(ctx context.Context, ns, name string, n int32) error
}

func Rollout(ctx context.Context, c ClusterClient, cfg Config) error { ... }

// Тест: ручной мок или mockery-generated:
type mockCluster struct {
    scaled  int32
    wantErr error
}
func (m *mockCluster) ScaleDeployment(_ context.Context, _, _ string, n int32) error {
    m.scaled = n
    return m.wantErr
}

func TestRollout(t *testing.T) {
    mc := &mockCluster{wantErr: errors.New("api down")}
    err := Rollout(context.Background(), mc, Config{})
    if !errors.Is(err, mockErr) { t.Fatal("want wrapped error") }
    assert.Equal(t, int32(3), mc.scaled, "не должен скейлить при ошибке конфига")
}
```

```bash
mockery --all --output ./mocks     # генерация моков из интерфейсов (или gomock/mockgen)
testify/assert                     # assert.Equal/T.NoError/Contains — меньше boilerplate
```

## ⚡ Benchmarks: измеряем, а не верим

```go
func BenchmarkParseLog(b *testing.B) {
    data := loadFixture("access-1m.log")
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        _ = ParseLog(data)
    }
}

// С аллокациями:
func BenchmarkJSON(b *testing.B) {
    b.ReportAllocs()
    ...
}
```

```bash
go test -bench=. -benchmem ./parser/
# BenchmarkParseLog-8   500   2341000 ns/op   1204567 B/op   312 allocs/op
go test -bench=. -cpuprofile cpu.out && go tool pprof cpu.out    # сразу профиль!
benchstat old.txt new.txt        # статистически честное сравнение версий
```

**Allocs/op — главный показатель:** каждая аллокация ≈ давление на GC. Ускорение часто = переиспользование буферов (`sync.Pool`), pre-allocation (`make([]T, 0, len(x))`).

## 🎲 Fuzzing: находим краевые случаи за вас

```go
func FuzzParseImage(f *testing.F) {
    f.Add("nginx:1.25")
    f.Add("")
    f.Add("a/b/c:d:e")
    f.Fuzz(func(t *testing.T, image string) {
        ref, err := ParseImage(image)
        if err == nil {
            if ref.Tag == "" {
                t.Errorf("valid parse without tag for %q", image)  // инвариант нарушен
            }
        }
    })
}
```

```bash
go test -fuzz=FuzzParseImage -fuzztime=30s ./...   # минуты в CI nightly
# Найденные краевые входы автоматически сохраняются в testdata/fuzz/ как регресс-кейсы.
```

## 🧱 Golden files и httptest

```go
// Golden files: сравнение вывода с эталоном (-update для обновления эталона)
func TestRenderManifest(t *testing.T) {
    got := Render(cfg)
    golden := "testdata/manifest.golden"
    if *update { os.WriteFile(golden, []byte(got), 0644) }
    want, _ := os.ReadFile(golden)
    assert.Equal(t, string(want), got)
}

// HTTP-тесты без сети:
srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    assert.Equal(t, "/api/v1/deploy", r.URL.Path)
    w.WriteHeader(503)
}))
defer srv.Close()
client := NewClient(srv.URL)
assert.Error(t, client.Deploy(ctx, cfg))       // ретраи на 503?
```

## 🚦 CI-набор Go-проекта

```yaml
test:go:
  stage: test
  image: golang:1.22
  script:
    - go vet ./...
    - go test -race -covermode=atomic -coverprofile=coverage.out ./...
    - go tool cover -func=coverage.out | tail -1      # total: NN%
    - go build ./...                                   # сборка = smoke
  coverage: '/total:\s+\d+\.\d+%/'
  cache: { paths: [ .gopath ] }
```

## ❓ Пять вопросов для самопроверки

---


## ✅ Проверь себя

> Отвечай вслух до раскрытия ответа. Если «не помню» — вернись к разделу.


**В1. Почему table-driven — стандарт именно в Go?**
<details><summary>Ответ</summary>
Нет наследования и параметризованных тестов из других языков; структуры + t.Run дают то же самое нативно: читаемая таблица кейсов, именованные сабтесты (запуск по -run), параллельность через t.Parallel(). Один шаблон покрывает все позитивные/негативные сценарии.
</details>

**В2. Зачем мок через интерфейс, а не monkey-patching как в Python?**
<details><summary>Ответ</summary>
В Go нет патчинга рантайма (статическая компиляция). Инъекция зависимости через интерфейсный параметр/поле структуры — единственный чистый способ; он же заставляет проектировать узкие интерфейсы у потребителя.
</details>

**В3. О чём говорит высокое allocs/op в бенчмарке?**
<details><summary>Ответ</summary>
Каждая аллокация — работа для GC и промахи по кэшу. Высокий счётчик при CPU-bound коде указывает на лишние промежуточные слайсы/строки: лечится pre-allocation (make с capacity), переиспользованием буферов (sync.Pool), bytes.Buffer вместо конкатенации.
</details>

**В4. Что делает fuzz-тест полезнее сотни рукописных кейсов?**
<details><summary>Ответ</summary>
Генератор ищет входы, о которых вы не подумали (юникод, переполнения, вложенность), и проверяет ИНВАРИАНТЫ («валидный разбор всегда даёт нет пустой тег»). Контрпримеры сохраняются как постоянные регрессионные тесты.
</details>

**В5. Зачем в CI обязательно `-race`, если локально тесты зелёные?**
<details><summary>Ответ</summary>
Гонка данных недетерминирована: проявляется под нагрузкой/на многоядерных CI-раннерах. Race detector инструментирует доступы к памяти и ловит конкурирующие обращения даже если «повезло» с порядком исполнения. Пропуск гонки в проде = редкие порчи данных без видимой причины.
</details>

---

*Что дальше:* [05. Modules и зависимости](05-go-modules-dependencies.md) · [10. Профилирование](10-go-performance-tooling.md)
