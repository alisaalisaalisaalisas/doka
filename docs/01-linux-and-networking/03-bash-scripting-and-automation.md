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

<!-- enriched:v1 -->

## 🧨 Типовые грабли Production

| Симптом | Причина | Быстрое решение |
| :--- | :--- | :--- |
| «Работало вчера» после обновления | Дрейф конфигурации вне Git | `git diff` по инфра-репозиторию + `drift detection` |
| Падение под нагрузкой без ошибок в логах | Исчерпание лимитов (`ulimit`, conntrack, fds) | `dmesg -T \| grep -i denied`, `conntrack -S` |
| Медленный деплой | Отсутствие кэша слоев/артефактов | Включить layer cache, артефакт-репозиторий |
| «Плавающие» 502 раз в сутки | Health-check гонки при rolling update | `preStop sleep` + корректный `readinessProbe` |

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
- [ ] Есть мониторинг именно этой подсистемы (не только CPU/RAM)
- [ ] Задокументирован runbook на типовые отказы (кто/что/как)
- [ ] Проведено хотя бы одно учение Chaos/GameDay по теме
- [ ] Лимиты ресурсов и квоты осознаны, а не «дефолт из туториала»
