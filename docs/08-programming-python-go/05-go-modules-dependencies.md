# 📦 05. Go Modules: Зависимости, Приватные Репо, Supply Chain

## 🗂️ Как устроены модули

```text
go.mod                      # имя модуля, версия Go, require/exclude/retract
go.sum                      # хэши содержимого ВСЕХ версий зависимостей — integrity
cmd/api/main.go             # бинарники в cmd/<name>/main.go
internal/...                # internal НЕ импортируется извне модуля — инкапсуляция
pkg/...                     # публичные библиотеки (если это библиотека)
```

```bash
go mod init gitlab.local/platform/toolkit        # создать модуль
go get github.com/spf13/cobra@v1.8.0             # добавить конкретную версию
go get -u ./...                                  # обновить всё (осторожно!)
go mod tidy                                      # синхронизировать go.mod/go.sum с импортами
go mod why -m k8s.io/client-go                   # ЗАЧЕМ эта зависимость?
go mod graph | grep client-go                    # кто её тянет
go list -m -u all                                # какие модули устарели
```

## 🔖 Версионирование SemVer + v2+

Модульная система жёстко связана с SemVer:

- `v1.x.x` — стабильное API; breaking change → **новый major путь импорта**: `module/gitlab.local/x/v2` (да, `/v2` в конце пути).
- Псевдоверсии для коммитов: `v0.0.0-20260825091200-abcdef123456`.
- Теги репо управляют версиями: `git tag v1.4.2 && git push origin v1.4.2`.

```bash
# Откат проблемного релиза без удаления тега:
go mod edit -retract=v1.4.2          # пометить отозванной (появится в списке версий)

# Замена на форк/локальную копию при отладке:
go mod edit -replace github.com/lib/foo=./local-foo
```

## 🔐 Приватные репозитории: GOPRIVATE и SSH

```bash
go env -w GOPRIVATE="gitlab.local/*"           # не ходить в proxy.golang.org за приватным
go env -w GONOSUMCHECK="gitlab.local/*"        # (устар. вариант; сейчас достаточно GOPRIVATE)
go env -w GOFLAGS=-mod=readonly                # запрет случайных изменений go.mod

# Авторизация через SSH вместо HTTPS (GitLab):
git config --global url."git@gitlab.local:".insteadOf "https://gitlab.local/"

# Или токен в netrc для CI:
machine gitlab.local login __token__ password glpat-xxx
# GitLab CI: GO_AUTH через CI_JOB_TOKEN:
export GITLAB_TOKEN=$CI_JOB_TOKEN
GOPROXY=https://gitlab.local/api/v4/projects/<id>/packages/go/proxy go mod download
```

**Vendor vs module cache:** `go mod vendor` кладёт зависимости в репо (воспроизводимость offline, diff-ревью апгрейдов) ценой размера. CI без интернета или строгие security-требования — аргументы за vendor; иначе кэш модулей + GOPROXY.

## 🛡️ Supply chain: проверка и воспроизводимость

```bash
# Уязвимости в зависимостях (official):
govulncheck ./...                    # показывает только ДОСТИЖИМЫЙ уязвимый код!

# Подпись и provenance (SLSA): goreleaser генерирует attestation,
# проверка потребителем:
cosign verify-blob --signature pkg.sig --certificate pkg.crt pkg.tar.gz

# Воспроизводимая сборка:
go build -trimpath -ldflags="-s -w -X main.version=$(git describe --tags)" -o bin/tool
#  -trimpath: убрать пути машины (детерминизм)
#  -s -w: без символов/дебага (размер −30%)
#  -X main.version: вшить версию в бинарник
```

| Механизм | Что даёт |
|---|---|
| go.sum + GONOSUMDB/GOSUMDB | целостность: чужой код не подменят незаметно |
| GOPROXY (proxy.golang.org / Artifactory) | неизменяемый кэш версий, survives repo deletion |
| govulncheck call-graph | реальная достижимость CVE, а не шум по имени пакета |
| `-trimpath` + pinned toolchain | одинаковый бинарник из любого checkout'а |

Приватный прокси в enterprise: Artifactory/Nexus как GOPROXY mirror — контроль лицензий, кэш, работа без внешнего интернета.

## 🧹 Гигиена зависимостей

```bash
go mod tidy && go vet ./... && gofmt -l .         # базовый набор перед PR
go run golang.org/x/tools/cmd/deadcode@latest ./...   # мёртвый код
# Минимизируйте зависимости: stdlib покрывает http/json/sql —
# каждый import это supply-chain риск и время сборки.
```

## ❓ Пять вопросов для самопроверки

---


## ✅ Проверь себя

> Отвечай вслух до раскрытия ответа. Если «не помню» — вернись к разделу.


**В1. Зачем нужен go.sum, если есть go.mod с точными версиями?**
<details><summary>Ответ</summary>
go.mod фиксирует версию, но не гарантирует содержимое архива. go.sum хранит криптохэши файлов каждой зависимости: при скачивании Go сверяет их — подмена кода (compromised upstream/tag re-push) обнаружится сборкой.
</details>

**В2. Что меняется при выпуске v2.0.0 ломающей версии?**
<details><summary>Ответ</summary>
Путь модуля получает суффикс /v2, импорты потребителей меняются на .../v2. Старые v1 продолжают работать независимо — обе мажорные версии живут параллельно в одном репо с разными тегами. Это цена breaking changes в экосистеме Go.
</details>

**В3. Почему приватный репозиторий должен попасть в GOPRIVATE?**
<details><summary>Ответ</summary>
Иначе Go пойдёт за кодом в публичный proxy/sumdb и утечёт имя (а с ним может и попытаться скачать) приватного модуля наружу. GOPRIVATE отключает proxy и sumdb для указанных префиксов — авторизация идёт напрямую в ваш Git.
</details>

**В4. Чем govulncheck лучше grep по CVE-базе?**
<details><summary>Ответ</summary>
Он строит call-graph вашего кода и сообщает только о уязвимостях в функциях, которые реально вызываются. Классический сканер завалит отчёт ложными срабатываниями по транзитивным пакетам, где уязвимый путь недостижим.
</details>

**В5. Когда оправдан `go mod vendor` в репо?**
<details><summary>Ответ</summary>
Строгая воспроизводимость/offline-сборки (регулируемые среды, air-gapped), ревью апгрейдов диффом, защита от исчезновения upstream. Цена: раздутый репозиторий и обязательная дисциплина `go mod tidy && go mod vendor` после каждого изменения зависимостей.
</details>

---

*Что дальше:* [06. CLI на Cobra](06-go-cli-cobra-goreleaser.md) · [04. Тестирование](04-go-testing-benchmarks.md)
