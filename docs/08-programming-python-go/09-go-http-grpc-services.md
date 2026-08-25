# 🌐 09. Go HTTP и gRPC Сервисы для Платформы

## 🧱 net/http из stdlib: базовый продакшн-сервис

С Go 1.22 роутинг с методами и path-параметрами есть в stdlib — chi/gin нужны не всегда:

```go
package main

import (
    "context"
    "encoding/json"
    "log/slog"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"
)

type Server struct {
    log *slog.Logger
    db  Store
}

func main() {
    logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))   // структурированные логи

    mux := http.NewServeMux()
    s := &Server{log: logger}
    mux.HandleFunc("GET /api/v1/deployments/{name}", s.getDeployment)
    mux.HandleFunc("POST /api/v1/deployments", s.createDeployment)
    mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
        w.WriteHeader(http.StatusOK)
    })

    srv := &http.Server{
        Addr:              ":8080",
        Handler:           withLogging(withTimeout(10*time.Second)(mux)),
        ReadHeaderTimeout: 5 * time.Second,       // anti-slowloris!
        ReadTimeout:       10 * time.Second,
        WriteTimeout:      30 * time.Second,
    }

    // Graceful shutdown
    go func() { srv.ListenAndServe() }()
    stop := make(chan os.Signal, 1)
    signal.Notify(stop, syscall.SIGTERM, os.Interrupt)
    <-stop
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    srv.Shutdown(ctx)                             // дождаться in-flight запросов
}
```

Handler с контекстом и ошибками:

```go
func (s *Server) getDeployment(w http.ResponseWriter, r *http.Request) {
    name := r.PathValue("name")
    dep, err := s.db.Get(r.Context(), name)
    switch {
    case errors.Is(err, ErrNotFound):
        writeErr(w, http.StatusNotFound, "not found")
    case err != nil:
        s.log.Error("db fail", "err", err)
        writeErr(w, http.StatusInternalServerError, "internal")   // детали НЕ наружу!
    default:
        writeJSON(w, http.StatusOK, dep)
    }
}
```

## 🔌 Middleware: сквозная функциональность

```go
type middleware func(http.Handler) http.Handler

func chain(h http.Handler, mws ...middleware) http.Handler {
    for i := len(mws) - 1; i >= 0; i-- { h = mws[i](h) }
    return h
}

func withLogging(l *slog.Logger) middleware {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            start := time.Now()
            rw := &statusWriter{ResponseWriter: w, code: 200}
            next.ServeHTTP(rw, r)
            l.Info("http",
                "method", r.Method, "path", r.URL.Path,
                "status", rw.code, "dur_ms", time.Since(start).Milliseconds(),
                "trace_id", r.Header.Get("X-Trace-ID"),
                "remote", r.RemoteAddr)
        })
    }
}
```

Метрики Prometheus middleware — аналогично (Counter по method/path/code, Histogram latency).

## ⚡ gRPC для внутренних интеграций

Когда сервисов много и типы важны — gRPC поверх HTTP/2 + protobuf:

```protobuf
// proto/deploy.proto
syntax = "proto3";
option go_package = "gitlab.local/platform/pb";

service Deployer {
  rpc Create(CreateRequest) returns (CreateResponse);
  rpc StreamStatus(StatusRequest) returns (stream StatusEvent);   // серверный стрим!
}

message CreateRequest {
  string image = 1;
  int32 replicas = 2;
  map<string, string> labels = 3;
}
```

```bash
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
protoc --go_out=. --go-grpc_out=. proto/deploy.proto
```

```go
srv := grpc.NewServer(
    grpc.ChainUnaryInterceptor(recoveryInterceptor(), authInterceptor(token)),
    grpc.MaxConcurrentStreams(100),
)
pb.RegisterDeployerServer(srv, &deployService{})
lis, _ := net.Listen("tcp", ":9090")
srv.Serve(lis)

// Клиент с таймаутом и retry:
conn, err := grpc.NewClient("deployer.svc:9090",
    grpc.WithTransportCredentials(insecure.NewCredentials()))   // mTLS в проде!
client := pb.NewDeployerClient(conn)
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
resp, err := client.Create(ctx, &pb.CreateRequest{Image: "web:1.42", Replicas: 3})
```

**REST vs gRPC:** наружу — REST/JSON (совместимость, curl-отладка); между своими сервисами — gRPC (строгие контракты, стриминг, ×5 компактнее, HTTP/2 multiplexing).

## 🛡️ Чек-лист production HTTP-сервера

- [ ] Таймауты все: `ReadHeaderTimeout` (slowloris!), Read/Write, handler-level `http.TimeoutHandler`.
- [ ] Graceful shutdown + readiness/liveness раздельно.
- [ ] Body limit: `http.MaxBytesReader(w, r.Body, 1<<20)` — иначе OOM от большого payload.
- [ ] Структурированные логи с request-id/trace-id.
- [ ] Метрики RED (rate/errors/duration) на каждом маршруте.
- [ ] Panic-recovery middleware (одна паника не убивает весь процесс).
- [ ] TLS или mTLS за ingress/service mesh; секреты из ENV/Vault, не в коде.

## ❓ Пять вопросов для самопроверки

---


## ✅ Проверь себя

> Отвечай вслух до раскрытия ответа. Если «не помню» — вернись к разделу.


**В1. Почему отсутствие ReadHeaderTimeout — уязвимость?**
<details><summary>Ответ</summary>
Slowloris-атака: клиент открывает соединения и тянет заголовки по байту — сервер держит горутины и сокеты бесконечно, исчерпывая файловые дескрипторы. ReadHeaderTimeout рвёт такие соединения; это самый важный из всех таймаутов.
</details>

**В2. Что делает srv.Shutdown и почему ему дают 30 секунд?**
<details><summary>Ответ</summary>
Останавливает приём новых соединений и ждёт завершения активных запросов. Kubernetes шлёт SIGTERM и через terminationGracePeriodSeconds убьёт pod — окно 25–30 сек позволяет доработать in-flight запросы (долгие деплои/стримы) без обрывов клиентов.
</details>

**В3. Когда выбрать gRPC вместо REST между своими сервисами?**
<details><summary>Ответ</summary>
Много межсервисных вызовов, важна строгая эволюция контрактов (.proto — источник правды), нужен двунаправленный/серверный стриминг, латентность критична (бинарный протокол + HTTP/2 multiplexing). Наружные API всё равно REST/JSON ради совместимости инструментов.
</details>

**В4. Зачем panic-recovery middleware, если панику ловит сам net/http?**
<details><summary>Ответ</summary>
net/http действительно изолирует панику хендлера (соединение закрывается), но молча и без метрик. Recovery-мидлварь логирует стек, увеличивает счётчик panics и отвечает клиенту корректным 500 JSON — иначе клиенты получают connection reset и алерты на их стороне.
</details>

**В5. Почему нельзя отдавать внутреннюю ошибку клиенту как есть (`err.Error()`)?**
<details><summary>Ответ</summary>
Текст ошибки раскрывает внутренности: пути файлов, SQL, адреса зависимостей, версии библиотек — карта для атакующего. Правильно: залогировать полную ошибку серверно с trace_id, вернуть generic-сообщение и id, чтобы поддержка могла найти детали по логам.
</details>

---

*Что дальше:* [10. Профилирование](10-go-performance-tooling.md) · [06. CLI на Cobra](06-go-cli-cobra-goreleaser.md)
