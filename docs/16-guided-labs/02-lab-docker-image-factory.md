# 🐳 Lab 02: Фабрика образов — build, scan, sign, registry

> **Время:** 75 минут | **Уровень:** Junior→Middle | **Нужно:** Docker Desktop или docker engine
> **Результат:** production-grade образ <25MB, отсканированный, с SBOM, в локальном registry.

!!! tip "Интерактивная версия"
    Эту лабу можно прогнать в симуляторе прямо на сайте — с автопроверкой шагов: [Песочница → сценарий «Lab 02»](../21-playground/playground.html?scenario=lab02). Реальные руки — по шагам ниже.

## 📦 Подготовка

```bash
docker version && docker buildx version   # убедимся, что всё стоит
mkdir -p ~/labs/lab02 && cd ~/labs/lab02
```
---

## 🧪 Часть 1: Приложение и «наивный» образ (15 мин)

```bash
mkdir src && cat > src/main.go <<'EOF'
package main

import (
	"fmt"
	"net/http"
	"os"
	"time"
)

var started = time.Now()

func health(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "OK uptime=%v version=%s\n", time.Since(started).Round(time.Second), os.Getenv("APP_VERSION"))
}

func main() {
	http.HandleFunc("/healthz", health)
	fmt.Println("listening on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		panic(err)
	}
}
EOF

cat > go.mod <<'EOF'
module demoapp

go 1.23
EOF

cat > Dockerfile.bad <<'EOF'
FROM golang:1.23
WORKDIR /app
COPY . .
RUN go build -o server ./src
CMD ["./server"]
EOF

docker build -f Dockerfile.bad -t demo:bad .
docker images demo:bad --format '{{.Size}}'
# => ~800MB+ 😱 Компилятор и весь тулчейн уехали в прод
```

---

## 🧪 Часть 2: Правильный multi-stage (20 мин)

```bash
cat > Dockerfile <<'EOF'
# syntax=docker/dockerfile:1.9
########## Stage 1: build ##########
FROM golang:1.23-alpine AS builder
WORKDIR /src
COPY go.mod ./
COPY src/ ./src/
# Кэш модулей между сборками (не создаёт слой!)
RUN --mount=type=cache,target=/go/pkg/mod \
    CGO_ENABLED=0 GOOS=linux \
    go build -trimpath -ldflags="-s -w" -o /out/server ./src

########## Stage 2: runtime ##########
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /out/server /server
USER nonroot:nonroot
EXPOSE 8080
ENV APP_VERSION=1.0.0
ENTRYPOINT ["/server"]
EOF

cat > .dockerignore <<'EOF'
*
!go.mod
!src/
EOF

docker build -t demo:good .
docker images demo:good --format '{{.Size}}'    # ~10MB 🎉
```

**Разбираем каждый приём:**

| Приём | Что даёт |
| :--- | :--- |
| `CGO_ENABLED=0` + distroless static | бинарнику нужна только память, libc не нужен |
| `-ldflags "-s -w"` | strip debug-информации, −30% размера |
| `--mount=type=cache` | кэш Go-модулей вне слоёв, пересборка за секунды |
| `.dockerignore *` + whitelist | в билд-контекст не попадает мусор (и секреты!) |
| `USER nonroot` | CVE-эксплуатация из root-процесса сильно сложнее |

```bash
docker run -d --rm --name demo -p 8080:8080 demo:good
sleep 1 && curl localhost:8080/healthz
docker exec demo /bin/sh 2>&1 | head -1   # failed... шелла НЕТ = меньше поверхности атаки
docker stop demo
```

---

## 🧪 Часть 3: Линтер и рентген образа (15 мин)

```bash
# Hadolint — линт Dockerfile (есть под все ОС)
docker run --rm -i hadolint/hadolint < Dockerfile
# Ожидаемо чисто. Попробуйте прогнать Dockerfile.bad — увидите DL3006 и др.

# Dive — послойный рентген: где потрачены байты
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  quay.io/wagoodman/dive:latest demo:good
# Ctrl+C для выхода. Смотрим "Wasted Space" и Score
```

---

## 🧪 Часть 4: Сканирование уязвимостей + SBOM (15 мин)

```bash
# Trivy: CVE-сканер (используется в 90% CI)
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image --severity HIGH,CRITICAL demo:good
# Distroless почти пуст => минимум находок vs ubuntu-based образы

# SBOM — "рецепт" содержимого (требование многих комплаенсов)
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  anchore/syft:latest demo:good -o cyclonedx-json > sbom.json
wc -c sbom.json   # пакетов мало, но они есть даже в distroless
```

---

## 🧪 Часть 5: Свой registry и полный цикл (10 мин)

```bash
# Локальный registry как в проде
docker run -d -p 5000:5000 --name registry --restart always registry:2

# Тегируем и пушим (insecure localhost разрешён по умолчанию)
docker tag demo:good localhost:5000/demo:1.0.0
docker push localhost:5000/demo:1.0.0

# Проверяем со стороны registry API
curl -s localhost:5000/v2/_catalog
curl -s localhost:5000/v2/demo/tags/list

# Чистим локальный образ и тянем обратно — цикл замкнулся
docker rmi demo:good localhost:5000/demo:1.0.0
docker pull localhost:5000/demo:1.0.0
```

---

## 🎯 Домашнее задание

1. Добавьте в приложение флаг `-version` через ldflags при сборке (`-X main.version=`).
2. Соберите образ для двух платформ: `docker buildx build --platform linux/amd64,linux/arm64`.
3. Прогоните тот же пайплайн для Python-приложения с FastAPI (подсказка: `python:3.12-slim` + venv, размер цель <120MB).

## ✅ Чек-лист

- [ ] Мой образ < 25MB и работает от nonroot
- [ ] Объясню, почему `.dockerignore *` — хорошая идея
- [ ] Trivy и Syft запускаются мной без гугла
- [ ] Понимаю, зачем нужен приватный registry

**Что дальше:** [Lab 03 — Kubernetes kind](03-lab-kubernetes-kind-app.md)
