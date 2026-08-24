# ⌨️ 20.10 CLI-арсенал: k9s, kubectx/kubens, stern, tmux, jq/yq

> Уровень: Middle→Senior. Скорость дежурного = скорость его пальцев. Эти инструменты — разница между «ищу под 5 минут» и «вижу проблему за 30 секунд».

**Оглавление:** [k9s](#k9s-терминальный-ui-для-kubernetes) · [kubectx/kubens](#kubectxkubens-переключение-контекстов) · [stern](#stern-логи-множества-подов) · [tmux](#tmux-сессии-которые-переживают-ssh) · [jq/yq deep](#jqyq-deep--манипуляция-jsonyaml) · [2.5 Проверь себя](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

## k9s: терминальный UI для Kubernetes

### Теория и горячие клавиши

k9s — TUI поверх kubectl: живой список ресурсов, логи, shell, редактирование, port-forward — всё в 2-3 нажатия.

| Комбинация | Действие |
| :--- | :--- |
| `:po` / `:deploy` / `:svc` / `:node` | перейти к ресурсу (двоеточие = команда) |
| `Enter` на поде | контейнеры → `l` логи, `s` shell |
| `d` / `y` / `e` | describe / YAML / edit |
| `Ctrl-d` | delete pod |
| `Shift-f` | port-forward |
| `x` | kill (delete без подтверждения) — осторожно! |
| `:xray deploy` | дерево зависимостей ресурса |
| `:pulses` | здоровье кластера одним экраном |
| `Ctrl-a` | aliases — все доступные ресурсы |

**Конфиг:** `~/.config/k9s/k9s.yaml` (refreshInterval, ui.skin), алиасы и hotkeys в `hotkeys.yaml`. Read-only режим для дежурных: `k9s --readonly`.

---

## kubectx/kubens: переключение контекстов

```bash
kubectx                      # список контекстов (кластеров)
kubectx prod-eu              # переключиться
kubectx -                    # назад к предыдущему (как cd -)
kubectx prod=                # переименовать
kubens shop                  # namespace по умолчанию для контекста
kubens -c                    # вернуться к прошлому namespace
# с fzf — интерактивный выбор: kubectx без аргументов открывает меню
```

**Ловушка:** `kubens` меняет namespace в kubeconfig — если скрипт полагается на явный `-n`, он не сломается; если нет — молча начнёт работать с другим namespace. В CI всегда явные `-n`/`--context`.

---

## stern: логи множества подов

```bash
stern api -n prod                          # все поды с именем api (regex!)
stern -n prod -l app=api --since 15m       # по label, последние 15 минут
stern -n prod "api|worker" -o json         # несколько паттернов, JSON-вывод
stern -n prod -l app=api -c sidecar-name   # конкретный контейнер
stern -n prod . --tail 0 -f                # только новые логи (tail 0)
stern -n kube-system -l k8s-app=kube-dns --timestamps --no-follow | grep -i error
```

**vs kubectl logs:** `kubectl logs -l app=api --prefix --timestamps -f` умеет то же, но stern — regex-выбор, цветные префиксы подов, `--since` без выкачивания всего, устойчивость к рестартам подов (авто-переподключение).

---

## tmux: сессии, которые переживают SSH

```bash
tmux new -s oncall          # создать сессию
Ctrl-b d                    # detach (выйти, сессия живёт)
tmux attach -t oncall       # вернуться после переподключения VPN/SSH

Ctrl-b %                    # split по вертикали
Ctrl-b "                    # split по горизонтали
Ctrl-b стрелки              # переключение панелей
Ctrl-b z                    # zoom панели (фулскрин туда-обратно)
Ctrl-b c / n / ,            # новое окно / следующее / переименовать
Ctrl-b [                    # copy-mode: прокрутка логов (q — выход)
Ctrl-b : resize-pane -U 10  # ресайз панели
```

**Конфиг `~/.tmux.conf` (минимум для дежурного):**

```text
set -g mouse on                 # скролл мышью, ресайз панелями
set -g history-limit 100000     # длинный скроллбек для логов
set -g base-index 1
setw -g mode-keys vi
bind r source-file ~/.tmux.conf \; display "reloaded"
```

**Ловушка:** без `history-limit` скроллбек 2000 строк — вы потеряете начало stacktrace'а.

---

## jq/yq deep — манипуляция JSON/YAML

### jq: продвинутые паттерны

```bash
# Переименовать ключи, посчитать, сгруппировать
kubectl get pods -A -o json | jq -r '
  .items | group_by(.status.phase)
        | map({phase: .[0].status.phase, count: length})
        | sort_by(-.count) | .[] | "\(.count)\t\(.phase)"'

# to_entries: объект → массив пар (для итерации по ключам)
curl -s localhost:9090/api/v1/labels | jq '.data | length'

# select + деструктуризация: только не-Running с причиной
kubectl get pods -A -o json | jq -r '.items[]
  | select(.status.phase != "Running")
  | "\(.metadata.namespace)/\(.metadata.name): \(.status.phase // .status.reason)"'

# paths: найти, ГДЕ в глубоком JSON лежит значение
kubectl get deploy api -o json | jq '[paths | join(".")] | map(select(test("image")))'

# env + @base64 + slurp: собрать payload для API
jq -n --arg name web '{metadata: {name: $name}, spec: {containers: []}}' > pod.json

# Редактирование на месте с бэкапом-в-переменную (jq не пишет файлы — через tmp)
jq '.spec.replicas = 3' deploy.json > tmp && mv tmp deploy.json
```

### yq (mikefarah v4): YAML как jq

```bash
yq '.spec.replicas = 5' -i deploy.yaml              # in-place
yq '.spec.template.spec.containers[0].image' deploy.yaml
yq 'select(.kind == "Service")' manifests/*.yaml    # фильтр multi-doc
yq -i '.items[] |= select(.metadata.name != "old")' list.yaml

# Слияние values (как helm -f base -f override):
yq eval-all '. as $item ireduce ({}; . * $item)' base.yaml override.yaml

# Конвертация: yaml ↔ json ↔ xml
yq -o=json -P deploy.yaml | jq '.spec.replicas'
```

**Частые ошибки jq:** забыть `-r` (raw) у строк — вывод в кавычках ломает shell-циклы; `.field // empty` вместо обработки отсутствия — тихие баги; `map(...)` на объект вместо `to_entries | map(...)`.

---

## 2.5 Проверь себя — 5 вопросов

**В1. В k9s вы случайно нажали `x` на production-поде. Что произошло и как настроить k9s, чтобы такого не случилось?**

<details><summary>Ответ</summary>
`x` = мгновенный delete без подтверждения. Для дежурных/прод-кластеров запускать k9s --readonly или убрать хоткей в конфиге; стандартный путь удаления — Ctrl-d с подтверждением.
</details>

**В2. Найдите ошибку: `for pod in $(kubectl get pods -o name); do kubectl delete $pod; done` — почему это опасно?**

<details><summary>Ответ</summary>
Unquoted command substitution рвёт вывод по пробелам/глоббингу, а отсутствие -n/--context делает операцию зависимой от текущего контекста (kubens!). Правильно: kubectl delete pods -l app=x -n ns (одной командой) или jq -r с явным контекстом.
</details>

**В3. Сценарий: SSH-сессия с tmux-сессией, в которой крутился tcpdump, оборвалась. Вы переподключились. Как увидеть вывод tcpdump?**

<details><summary>Ответ</summary>
tmux attach -t <session> — сессия и все панели живы на сервере; вывод tcpdump на месте (в пределах history-limit). Если сессий много: tmux ls, tmux attach -t имя.
</details>

**В4. Чем stern лучше `kubectl logs -l app=api -f` при отладке rolling update?**

<details><summary>Ответ</summary>
stern автоматически подключается к новым подам при их появлении (и отключается от умирающих), поддерживает regex по именам и несколько контейнеров — при rolling update вы видите непрерывный поток логов старых и новых подов с цветными префиксами.
</details>

**В5. `kubectl get deploy api -o json | jq '.spec.template.spec.containers[].image'` вернул значения в кавычках, и ваш `docker pull $img` сломался. Почему и как чинить?**

<details><summary>Ответ</summary>
Без -r jq выводит строки как JSON-литералы с кавычками. Флаг -r (--raw-output) отдаёт сырые строки: jq -r '...'.
</details>

---

## 2.6 Практика — 3 задания

### Задание 1: k9s — «разбор кластера» без единого kubectl

**Условие:** в kind-кластере есть проблемный под. Найти его, посмотреть логи предыдущей инкарнации, зайти в shell — только через k9s.

```bash
# Шаг 0: подготовка стенда (стартовое состояние)
kind create cluster --name k9s-lab
kubectl create deploy crasher --image=busybox:1.36 -- sh -c 'echo boom; exit 1'
kubectl create deploy healthy --image=nginx:1.27
# Установите k9s (https://github.com/derailed/k9s/releases) и запустите:
k9s --context kind-k9s-lab

# Шаг 1 (в k9s): :ns → выбрать default → Enter
# Шаг 2: найти под crasher-... со статусом CrashLoopBackOff (стрелками)
# Шаг 3: Enter → список контейнеров → l (logs) → увидеть "boom"
# Шаг 4: d (describe) → найти в Events "Back-off restarting failed container"
# Шаг 5: s (shell) в healthy-поде → cat /etc/os-release → exit
# Шаг 6: :pulses → оценить здоровье кластера одним экраном
# Шаг 7: Ctrl-d на crasher → удалить; Deployment пересоздаст — наблюдать новый под
```

**Проверь себя:** вы выполнили все шаги без единого выхода из k9s; `kubectl get pods` после удаления crasher показывает новый под (restart цикл Deployment).

**Разбор:** k9s — это kubectl с нулевой стоимостью набора. В дежурстве связка «:pulses → :po → l/d/s» покрывает 80% первичной диагностики.

### Задание 2: jq — отчёт по кластеру одной пайплайной

**Условие (стартовое состояние):** есть файл `pods.json` = вывод `kubectl get pods -A -o json`. Построить три отчёта.

```bash
# Стартовое состояние:
kubectl get pods -A -o json > pods.json

# Шаг 1: топ namespace по количеству подов
jq -r '.items | group_by(.metadata.namespace)
       | map({ns: .[0].metadata.namespace, n: length})
       | sort_by(-.n) | .[] | "\(.n)\t\(.ns)"' pods.json | head -5
# Ожидание (kind): "11\tkube-system" и т.д.

# Шаг 2: поды с рестартами > 0 и их причины
jq -r '.items[] | . as $p
  | .status.containerStatuses[]?
  | select(.restartCount > 0)
  | "\($p.metadata.namespace)/\($p.metadata.name) restarts=\(.restartCount) reason=\(.lastState.terminated.reason // "?")"' pods.json

# Шаг 3: суммарные requests CPU по namespace (конвертация millicores)
jq -r '[.items[] | .spec.containers[]?.resources.requests.cpu // "0"
       ] | group_by(.) | map({v: .[0], n: length}) | .[] | "\(.n)x\(.v)"' pods.json
# (упрощённо; для суммы нужна нормализация m/целых — см. разбор)
```

**Проверь себя:** каждый jq возвращает непустой вывод без ошибок; вывод Шага 2 содержит ваш crasher-под из Задания 1 (если ещё жив).

**Разбор:** `group_by` требует отсортированный вход — jq сортирует сам внутри group_by; `//` — оператор дефолта для отсутствующих полей; `?` после массива глотает null (поды без containerStatuses). Для честной суммы CPU нужна функция конвертации: `if endswith("m") then (rtrimstr("m")|tonumber) else (tonumber*1000) end`.

### Задание 3: stern + tmux — «окно дежурного»

**Условие:** собрать рабочее место: слева — логи всех подов приложения, справа — k9s; всё переживает обрыв SSH.

```bash
# Шаг 0: конфиг tmux (стартовое состояние)
cat >> ~/.tmux.conf <<'EOF'
set -g mouse on
set -g history-limit 100000
EOF
tmux source-file ~/.tmux.conf

# Шаг 1: сессия дежурного
tmux new -s oncall
# Ctrl-b %  → вертикальный сплит

# Шаг 2: слева — stern по всем подам prod (автопереподключение при rolling update)
stern -n prod "api|worker" --since 5m
# Шаг 3: Ctrl-b стрелка → вправо; запустить k9s -n prod
# Шаг 4: Ctrl-b d (detach), разорвать SSH (exit), переподключиться:
tmux attach -t oncall
#   Ожидание: обе панели на месте, stern продолжил стримить ✅
```

**Проверь себя:** после detach/attach история логов доступна (Ctrl-b [ — прокрутка); при `kubectl -n prod rollout restart deploy/api` stern подхватил новые поды без перезапуска.

**Разбор:** связка «stern (автоподключение к меняющимся подам) + tmux (переживает сеть) + k9s (навигация)» — стандартное рабочее место дежурного; каждый инструмент закрывает свою часть: поток событий, персистентность, навигацию.

---

*Следующая подтема: [20.11 Jsonnet/CUE + Sentry](11-config-languages-and-sentry.md)*
