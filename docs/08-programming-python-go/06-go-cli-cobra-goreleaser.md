# ⌨️ 06. Go CLI: Cobra, Кросс-Компиляция, goreleaser

## 🏗️ Каркас инструмента на Cobra

Cobra (используется kubectl, docker, helm) даёт команды/подкоманды, флаги, help и автокомплит из коробки:

```go
// cmd/root.go
var (
    output  string
    verbose bool
)

var rootCmd = &cobra.Command{
    Use:   "dtk",
    Short: "DevOps Toolkit — управление деплоями",
    Version: version,                       // вшита через ldflags
    SilenceUsage: true,                     // не показывать usage при ошибке РАНТАЙМА
}

func init() {
    rootCmd.PersistentFlags().StringVarP(&output, "output", "o", "table", "table|json|yaml")
    rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "debug logging")
    rootCmd.AddCommand(rolloutCmd, statusCmd)
}
```

```go
// cmd/rollout.go
var rolloutCmd = &cobra.Command{
    Use:     "rollout NAME --image IMG",
    Args:    cobra.ExactArgs(1),                 // валидация позиционных аргументов
    Example: `  dtk rollout web --image web:1.42 --dry-run`,
    RunE: func(cmd *cobra.Command, args []string) error {   // RunE = ошибка как error
        image, _ := cmd.Flags().GetString("image")
        dryRun, _ := cmd.Flags().GetBool("dry-run")
        return doRollout(cmd.Context(), args[0], image, dryRun)
    },
}
```

**RunE вместо Run:** возвращайте error, а не log.Fatal внутри — тестируемость и единый exit-code путь. Флаги валидируются `cmd.MarkFlagRequired("image")`.

```bash
go build -o dtk . && ./dtk rollout web --image web:1
./dtk completion bash > /etc/bash_completion.d/dtk       # автокомплит бесплатно
```

## 🎨 UX: вывод, цвета, машиночитаемость

```go
// Таблицы: text/tabwriter из stdlib — без зависимостей
w := tabwriter.NewWriter(os.Stdout, 0, 4, 2, ' ', 0)
fmt.Fprintln(w, "NAME\tREADY\tRESTARTS\tAGE")
for _, d := range deps {
    fmt.Fprintf(w, "%s\t%d/%d\t%d\t%s\n", d.Name, d.Ready, d.Replicas, d.Restarts, age(d))
}
w.Flush()

// Машиночитаемый режим для пайплайнов:
switch output {
case "json": enc := json.NewEncoder(os.Stdout); enc.SetIndent("", "  "); enc.Encode(deps)
case "yaml": yaml.Marshal(deps)
default: renderTable(deps)
}

// Цвет только на TTY:
if term.IsTerminal(int(os.Stdout.Fd())) { /* раскраска */ }
// NO_COLOR env уважать по стандарту no-color.org
```

Сигналы и graceful shutdown CLI (долгие операции):

```go
ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
defer stop()
if err := longRollout(ctx); err != nil {
    if errors.Is(err, context.Canceled) {
        fmt.Fprintln(os.Stderr, "interrupted; состояние сохранено, повторный запуск безопасен")
    }
    os.Exit(130)
}
```

## 🚀 Кросс-компиляция: суперспособность Go

Один исходник → бинарники под все платформы без toolchain'ов:

```bash
CGO_ENABLED=0 GOOS=linux   GOARCH=amd64 go build -ldflags="-s -w" -o dist/dtk-linux-amd64
CGO_ENABLED=0 GOOS=linux   GOARCH=arm64 go build -o dist/dtk-linux-arm64      # Raspberry/M1 runners
CGO_ENABLED=0 GOOS=darwin  GOARCH=amd64 go build -o dist/dtk-darwin-amd64
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o dist/dtk.exe

file dist/*          # ELF/Mach-O/PE — статические бинарники, без зависимостей libc
```

`CGO_ENABLED=0` = чисто статическая сборка → работает в **scratch/distroless** контейнере:

```dockerfile
FROM golang:1.22 AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w -X main.version=$VERSION" -o /out/dtk .

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/dtk /usr/local/bin/dtk
ENTRYPOINT ["dtk"]
# Итог: ~8 МБ, ноль CVE из ОС, non-root.
```

## 📦 goreleaser: релиз одной командой

`.goreleaser.yaml`:

```yaml
version: 2
builds:
  - env: [CGO_ENABLED=0]
    goos: [linux, darwin, windows]
    goarch: [amd64, arm64]
    ldflags: ["-s -w -X main.version={{.Version}}"]
archives:
  - formats: [tar.gz]
checksum:
  name_template: checksums.txt          # SHA256 всех артефактов
signs:
  - artifacts: checksum                 # cosign подпись чексуммы!
changelog:
  use: git                              # из Conventional Commits
brews:
  - repository: { owner: org, name: homebrew-tap }   # Homebrew автоматически
```

```bash
goreleaser check && goreleaser release --snapshot --clean   # локальная репетиция
goreleaser release                                          # по тегу v* в CI
```

Результат релизного пайплайна: бинарники + checksums + подписи + changelog + обновление пакетных менеджеров — ноль ручных шагов.

## ❓ Пять вопросов для самопроверки

---


## ✅ Проверь себя

> Отвечай вслух до раскрытия ответа. Если «не помню» — вернись к разделу.


**В1. Почему RunE предпочтительнее Run с os.Exit внутри?**
<details><summary>Ответ</summary>
Ошибка возвращается наверх в одно место, где принимается решение об exit-code и логировании: тестируемость (вызов RunE в тесте без процесса), единый формат сообщений, возможность defer-очистки. os.Exit пропускает defer и делает функцию нетестируемой.
</details>

**В2. Что даёт CGO_ENABLED=0 для DevOps-инструмента?**
<details><summary>Ответ</summary>
Полностью статический бинарник без зависимости от libc/glibc версии: запускается в scratch/distroless, на любом дистрибутиве и Alpine, в chroot. Минус — потеря cgo-библиотек (например, системного DNS-резолвера частично меняется поведение) — обычно несущественно для CLI.
</details>

**В3. Зачем CLI флаг `-o json`, если есть люди в терминале?**
<details><summary>Ответ</summary>
Инструмент встраивается в автоматизации: CI парсит JSON (jq), человек смотрит таблицу. Один источник правды вместо отдельного API-эндпоинта; контракт вывода стабилен между версиями.
</details>

**В4. Как вшить версию сборки в бинарник?**
<details><summary>Ответ</summary>
Переменная пакета `var version = "dev"` + линковка при сборке: `-ldflags "-X main.version=$(git describe --tags)"`. Команда `--version` через cobra.Version печатает реальный релиз — обязательное условие поддержки (какой бинарь крутится на сервере?).
</details>

**В5. Что goreleaser добавляет к голому кросс-компиляционному скрипту?**
<details><summary>Ответ</summary>
Весь релизный протокол: матрица OS/ARCH, архивация, генерация и ПОДПИСЬ checksums (cosign), changelog из коммитов, публикация GitHub/GitLab release, обновление brew/scoop/choco. Snapshot-режим позволяет репетировать релиз локально.
</details>

---

*Что дальше:* [07. client-go](07-go-k8s-client-go.md) · [05. Modules](05-go-modules-dependencies.md)
