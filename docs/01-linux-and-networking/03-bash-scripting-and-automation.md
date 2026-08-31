# 📜 03. Bash-скриптинг и утилиты автоматизации (jq, awk, sed)

## 🛡️ Production-Ready шаблон безопасного Bash-скрипта

Большинство багов в скриптах автоматизации происходят из-за проигнорированных ошибок и неопределенных переменных. Используйте строгий режим:

```bash
#!/usr/bin/env bash
# ==============================================================================
# Описание: Эталонный скрипт автоматизации с обработкой ошибок и логами
# ==============================================================================

# Строгий режим:
# -e: Прерывать выполнение при любой ошибке команды
# -u: Ошибка при обращении к необъявленной переменной
# -o pipefail: Если любая команда в пайплайне упала, упадет весь пайплайн
set -euo pipefail

# Цветовое оформление логов
readonly COLOR_RED='\033[0;31m'
readonly COLOR_GREEN='\033[0;32m'
readonly COLOR_YELLOW='\033[1;33m'
readonly COLOR_NC='\033[0m' # No Color

# Функции структурированного логирования
log_info()    { echo -e "[$(date +'%Y-%m-%dT%H:%M:%S%z')] [${COLOR_GREEN}INFO${COLOR_NC}] $*"; }
log_warn()    { echo -e "[$(date +'%Y-%m-%dT%H:%M:%S%z')] [${COLOR_YELLOW}WARN${COLOR_NC}] $*" >&2; }
log_error()   { echo -e "[$(date +'%Y-%m-%dT%H:%M:%S%z')] [${COLOR_RED}ERROR${COLOR_NC}] $*" >&2; }

# Очистка временных файлов при любом выходе из скрипта
cleanup() {
    local exit_code=$?
    log_info "Выполняется очистка ресурсов..."
    rm -rf "${TMP_DIR:-}"
    exit "$exit_code"
}
trap cleanup EXIT INT TERM ERR

# Создание временной директории
readonly TMP_DIR=$(mktemp -d -t devops-script-XXXXXX)
```

---

## 🔒 Блокировка повторного запуска (`flock`)
Защита от запуска второй копии скрипта в cron, если предыдущая еще не завершилась:

```bash
#!/usr/bin/env bash
exec 200>/var/lock/my-backup-job.lock
flock -n 200 || { echo "Скрипт уже выполняется другим процессом. Выход."; exit 1; }

# Основная полезная нагрузка
echo "Выполняем бэкап..."
```

---

## 🧰 Обработка JSON с помощью `jq` (Cheat Sheet)

JSON — основной формат данных в API облаков, Kubernetes и CI/CD.

```bash
# Исходный пример JSON
export JSON_DATA='[
  {"name": "web-01", "role": "frontend", "ip": "10.0.1.10", "status": "active", "cores": 4},
  {"name": "web-02", "role": "frontend", "ip": "10.0.1.11", "status": "down", "cores": 4},
  {"name": "db-01", "role": "database", "ip": "10.0.2.20", "status": "active", "cores": 16}
]'

# 1. Извлечь все IP адреса списком
echo "$JSON_DATA" | jq -r '.[].ip'

# 2. Фильтрация: Выбрать серверы со статусом "active" и ролью "frontend"
echo "$JSON_DATA" | jq '.[] | select(.status == "active" and .role == "frontend")'

# 3. Трансформация: Создать новый маппинг { "имя": "IP" }
echo "$JSON_DATA" | jq 'map({ (.name): .ip }) | add'

# 4. Агрегация: Подсчитать общее количество ядер (cores)
echo "$JSON_DATA" | jq '[.[].cores] | add'

# 5. Модификация JSON на лету
echo '{"env": "staging", "replicas": 2}' | jq '.replicas = 5 | .deployed_at = now'
```

---

## ✂️ Обработка текста: `awk` и `sed`

### 1. `awk` (Обработка столбцов, фильтрация, подсчет)
`awk` воспринимает строки как записи, а пробелы/табуляции — как разделители столбцов (`$1`, `$2`, ...):

```bash
# Вывести только IP-адрес и HTTP статус из access.log Nginx
awk '{print $1, $9}' /var/log/nginx/access.log

# Подсчитать суммарный размер переданных байт (10-й столбец) для HTTP 200
awk '$9 == 200 { sum += $10 } END { print "Всего Мб:", sum / 1024 / 1024 }' /var/log/nginx/access.log

# Топ-10 уникальных IP адресов с наибольшим количеством запросов
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -n 10

# Изменение разделителя (например, CSV или /etc/passwd)
awk -F: '$3 >= 1000 {print "Обычный пользователь:", $1, "Home:", $6}' /etc/passwd
```

### 2. `sed` (Потоковый редактор: замена, удаление, вставка)
```bash
# Замена строки в файле на месте (-i) с созданием бэкапа
sed -i.bak 's/DEBUG = True/DEBUG = False/g' app_config.py

# Удаление всех пустых строк и комментариев (начинающихся с #)
sed -e '/^[[:space:]]*#/d' -e '/^[[:space:]]*$/d' /etc/nginx/nginx.conf

# Замена с использованием разделителя | (удобно для URL и путей к файлам)
sed -i 's|http://old-domain.com|https://new-domain.com|g' environment.env

# Печать диапазона строк (например, с 50 по 75)
sed -n '50,75p' /var/log/syslog
```

---

## 🔬 Deep Dive: подводные камни Bash, которые стоят инцидентов

### 1. `set -e` НЕ работает там, где вы ждете

```bash
set -e
let x=1/0          # НЕ упадет! arithmetic в let/((...)) возвращает nonzero статус, но...
foo || true        # явно подавленные ошибки тоже продолжают скрипт
if ! cmd; then :; fi  # внутри if ошибки игнорируются by design
```

**Вывод:** для критичных шагов используйте явные проверки `cmd || { echo fail >&2; exit 1; }`.

### 2. Подстановка без кавычек = word splitting + globbing

```bash
rm -rf $DIR        # DIR="/tmp/x y" → удалит /tmp/x и ./y в CWD!
rm -rf "$DIR"      # правильно
```

### 3. Пайпы маскируют ошибки

```bash
set -euo pipefail   # pipefail: статус пайпа = статус последней НЕудачной команды
curl -sfL https://example.com | tar xz   # упадет, если curl вернул 404
```

### jq-паттерны, которые экономят часы

```bash
# Извлечь поле со значением по умолчанию и привести типы
jq -r '.replicas // 0 | tonumber' deploy.json

# Превратить JSON в TSV для awk/sort
jq -r '.items[] | [.metadata.name, .status.phase] | @tsv' pods.json

# Обновить значение с сохранением форматирования (in-place)
jq '.spec.replicas = 5' deployment.yaml.hcl.json > tmp && mv tmp deployment.json
```

!!! danger "Никогда"
    Не используйте `eval` на данных из API/Git. Один вредоносный ответ = RCE на вашем CI-runner.

---

## 🧰 Bash arrays, getopts, mapfile и параллель

### Массивы и ассоциативные

```bash
hosts=(web01 web02 db01)
hosts+=("web03")
echo "${hosts[@]}"        # все элементы
echo "${#hosts[@]}"       # длина 4
for h in "${hosts[@]}"; do echo "deploy $h"; done  # кавычки обязательны!

declare -A meta=([web01]=10.0.0.1 [db01]=10.0.0.2)
echo "${meta[web01]}"          # 10.0.0.1
for k in "${!meta[@]}"; do echo "$k -> ${meta[$k]}"; done

# mapfile: строки файла → массив без сабшелла
mapfile -t lines < <(grep -v "^#" hosts.txt)
echo "hosts ${#lines[@]}"
```

### getopts: парсинг аргументов

```bash
#!/usr/bin/env bash
set -euo pipefail
usage(){ echo "Usage: $0 -e env -v version [-d dry-run]" >&2; exit 1; }
DRY=false
while getopts ":e:v:dh" opt; do
  case $opt in
    e) ENV=$OPTARG ;;
    v) VERSION=$OPTARG ;;
    d) DRY=true ;;
    h) usage ;;
    \?) echo "Invalid -$OPTARG" >&2; usage ;;
    :) echo "-$OPTARG requires arg" >&2; usage ;;
  esac
done
[[ -z "${ENV:-}" || -z "${VERSION:-}" ]] && usage
echo "Deploy $VERSION to $ENV dry=$DRY"
```

### Параллель: xargs -P vs GNU parallel

```bash
# Параллельные проверки здоровья (8 потоков)
cat hosts.txt | xargs -P8 -I{} bash -c 'curl -sf http://{}/health || echo "fail {}"'

# Или parallel (если установлен)
parallel -j8 curl -sf http://{}/health ::: "${hosts[@]}"

# Ожидание N фоновых задач
pids=(); for h in "${hosts[@]}"; do (ssh "$h" "uptime" &) ; pids+=($!); done
for pid in "${pids[@]}"; do wait "$pid" || echo "host failed"; done
```

### ShellCheck: линтер как обязательный CI gate

```bash
shellcheck deploy.sh  # найдёт SC2086, SC2143, SC2164
# В CI:
# - name: shellcheck
#   run: shellcheck *.sh
# Исправление SC2086: "$var" в кавычки; SC2164: cd dir || exit
```

---

<!-- enriched:v1 -->

## 🧨 Типовые грабли Production (Bash — только эта тема)

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| `set -e` не ломает `if`/`while` при ошибке | `set -e` игнорируется в условии и `! cmd` | Проверять `$?` явно или `set -o pipefail; cmd || true` с комментарием |
| `for f in $(cat list)` ломается на пробелах | word splitting | `while IFS= read -r f; do ... done < list` или `mapfile -t arr < list` |
| Cron гонка: два `deploy.sh` одновременно | Нет `flock` | `flock -n 200 || exit 0` в начале скрипта + `200>/var/lock/deploy.lock` |
| `pipe` маскирует ошибку первой команды `cat file | grep` | Нет `pipefail` — ошибка `cat` потеряна | `set -euo pipefail`, `shellcheck` в CI |

!!! warning "Правило пяти почему"
    Каждый инцидент заканчивается не фиксом, а **post-mortem** с 5×Why и action items в бэклоге. Иначе грабли возвращаются через квартал — но уже в пятницу вечером.

## 🧪 Hands-on Lab (15 минут)

```bash
# 1. Воспроизведите проблему из таблицы выше на стенде (kind/k3d/VirtualBox)
# 2. Соберите диагностику одной командой:
shellcheck deploy.sh && bash -n deploy.sh && \
bash deploy.sh 2>&1 | tee /tmp/deploy.log; echo "exit=$?"
# 3. Зафиксируйте вывод в post-mortem шаблон:
#    Что случилось / Когда заметили / Root cause / Fix / Prevention
```

## ✅ Чек-лист зрелости темы

- [ ] Конфигурации версионируются в Git, ручные правки на проде запрещены

    ??? tip "Как закрыть пункт"
        Все конфиги подсистемы живут в etc-repo/Ansible-роли и деплоятся пайплайном. Проверка зрелости: после пересоздания машины система настраивается из репозитория без ручных шагов; git log отвечает «кто и когда поменял».

- [ ] Есть мониторинг именно этой подсистемы (не только CPU/RAM)

    ??? tip "Как закрыть пункт"
        Специфичные метрики подсистемы экспортируются и имеют алерты (для systemd — failed units; для БД — connections/locks; для сети — retransmits/drops). CPU/RAM видят симптом, не причину — нужны метрики самой подсистемы.

- [ ] Задокументирован runbook на типовые отказы (кто/что/как)

    ??? tip "Как закрыть пункт"
        Шаблон из [13.2]: симптомы → команды диагностики → фикс → критерий успеха → предотвращение. Топ-3 отказа подсистемы покрыты. Прогонен хотя бы раз — дата в шапке.

- [ ] Проведено хотя бы одно учение Chaos/GameDay по теме

    ??? tip "Как закрыть пункт"
        Дрель из tools/chaos-lab.sh или Break-Fix по этой теме запущена на стенде, runbook прогнан по шагам, измерено время до восстановления. Итоги — в постмортем-журнал команды.

- [ ] Лимиты ресурсов и квоты осознаны, а не «дефолт из туториала»

    ??? tip "Как закрыть пункт"
        Каждый лимит имеет обоснование из данных (ulimit/fd по числу соединений, MemoryMax по месяцу наблюдений). Проверка: systemctl show / cgroup значения сопоставлены с фактическим потреблением за месяц, комментарий «почему» рядом со значением в коде.

---

## 🧭 Что дальше

| Шаг | Материал |
| :--- | :--- |
| 🔬 Закрепить | [Lab 01: автоматизация через systemd](../16-guided-labs/01-lab-linux-systemd-namespaces.md) |
| 💪 Практика | [Задачи по Bash/jq/awk](../15-hands-on-practice/01-100-devops-practical-tasks-part1.md) |
| 🎤 Проверить себя | [Тренажёр SRS](../22-trainer/index.md) |

---

## ✅ Проверь себя

> Отвечай вслух до раскрытия ответа.

**В1. Что делает `set -euo pipefail` и почему это дефолт для CI-скриптов?**
<details><summary>Ответ</summary>
<code>-e</code> — выход при первой ошибке; <code>-u</code> — ошибка при обращении к необъявленной переменной; <code>pipefail</code> — код возврата пайплайна берётся от первой упавшей команды, а не последней. Без pipefail <code>false | true</code> вернул бы 0 и пайплайн «позеленел» на сломанном шаге.
</details>

**В2. Чем awk принципиально отличается от sed?**
<details><summary>Ответ</summary>
sed — потоковый редактор строк (подстановки, удаление), без числовых агрегатов. awk — язык обработки полей: $1..$NF, ассоциативные массивы, арифметика, условия. «Разрезать и заменить» — sed; «посчитать суммы/топ по полям» — awk.
</details>

**В3. Как безопасно обработать пути с пробелами: find -exec против xargs?**
<details><summary>Ответ</summary>
find . -name '*.log' -exec cmd {} \; (или {} +) — подстановка без шелл-сплита. Для xargs — только с -0 в паре с find -print0. Голый xargs ломает пути с пробелами/кавычками.
</details>

**В4. Зачем jq флаги -r и -e?**
<details><summary>Ответ</summary>
-r выводит строки без кавычек (для подстановки в shell); -e ставит exit-code по результату: null/false → код 1 — позволяет использовать jq как условие в if и останавливать скрипты на невалидных данных.
</details>

**В5. Почему [ "$var" = "x" ] надёжнее [ $var = x ]?**
<details><summary>Ответ</summary>
Без кавычек пустая переменная схлопывается в синтаксическую ошибку ([ = x ]), а значение с пробелами разбивается на несколько аргументов. Квотирование сохраняет один аргумент; современная альтернатива — [[ ]] в bash.
</details>
