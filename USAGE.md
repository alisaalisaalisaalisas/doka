# 📖 КАК ЗАПУСТИТЬ И ПОЛЬЗОВАТЬСЯ (USAGE)

> Полная инструкция по работе с базой знаний DevOps Handbook.

## 🚀 Быстрый старт (30 секунд)

```bash
cd C:\Users\User\Desktop\papka\doka   # каталог проекта
mkdocs serve                           # запуск сайта
```

Откройте в браузере: **http://127.0.0.1:8000**

Сервер следит за файлами: сохранили `.md` — страница обновилась сама (F5 не нужен).

### Если mkdocs не установлен

```bash
# Вариант 1: через pip (нужен Python 3.9+)
pip install mkdocs-material

# Вариант 2: без установки Python — через Docker
docker run --rm -it -p 8000:8000 -v "${PWD}:/docs" squidfunk/mkdocs-material
# затем откройте http://localhost:8000
```

---

## 🛠️ Все режимы запуска

| Команда | Что делает | Когда использовать |
| :--- | :--- | :--- |
| `mkdocs serve` | Дев-сервер с автообновлением на :8000 | Чтение и редактирование каждый день |
| `mkdocs serve -a 0.0.0.0:8000` | То же, но доступ с других устройств сети | Читать с планшета/телефона по Wi-Fi |
| `mkdocs build` | Собрать статический сайт в `site\` | Для выкладки на хостинг |
| `mkdocs build --strict` | Сборка с проверкой: любая ошибка = fail | Перед коммитом/публикацией |
| `mkdocs gh-deploy` | Собрать и опубликовать на GitHub Pages | Публичная версия документации |

### Остановка сервера

```powershell
Get-Process mkdocs | Stop-Process        # PowerShell / Windows
pkill -f "mkdocs serve"                  # Linux/macOS
```

Если порт 8000 занят: `mkdocs serve -a 127.0.0.1:8080` (или любой свободный порт).

---

## 🧭 Как устроен сайт

### Навигация (UX v1: Phase 3)

- **Верхние табы** — 00 Roadmap, 01-09 ключевые, таб **Ещё** (Security/Data/Mesh/DR/Templates/Career), Senior Stack, Песочница/Тренажёр/MLOps
- **Левая колонка** — страницы внутри раздела, раскрываются стрелочками; `navigation.prune` прячет пустые группы
- **Правая колонка** — **возвращён ToC** (`toc.integrate` убран), `toc.follow` — подсветка активного заголовка
- **🔍 Поиск** (иконка или клавиша `/`) — мгновенный оффлайн-поиск (RU стоп-слова: и, в, на, по, что, как, для…), подсветка `search.highlight`

### Горячие клавиши

| Клавиша | Действие |
| :--- | :--- |
| `/` или `s` | Открыть поиск |
| `,` / `.` | Предыдущая / следующая страница |
| `Esc` | Закрыть поиск |

### Специальные элементы страниц

- **⚠️ Жёлтые блоки (admonition)** — важные предостережения; **💡 tip** — советы
- **▶️ Раскрывающиеся спойлеры** в Break-Fix сценариях — решения спрятаны намеренно!
- **Диаграммы Mermaid** рендерятся автоматически
- **Кнопка копирования** на каждом блоке кода
- **Переключатель тёмной темы** — иконка луны/солнца в шапке

---

## 📂 Структура репозитория

```text
doka/
├── USAGE.md                 ← этот файл
├── README.md                ← короткая карточка
├── mkdocs.yml               ← навигация + тема (UX v1: hero, extra.css, nav-stats, admonition icons)
├── docs/
│   ├── index.md             ← главная (hero + 6 карточек + stats: 299 стр/1033 сцена/831 карт)
│   ├── stylesheets/extra.css + answer-check.css
│   ├── javascripts/answer-check.js + nav-stats.js
│   ├── 00-roadmap/          ← план обучения
│   ├── 01..14-*/            ← теория (Linux→Interview)
│   ├── 15-hands-on-practice/← 100 задач (answer-check fix instant-nav)
│   ├── 16-guided-labs/      ← 12 лаб
│   ├── 17-break-fix/        ← 4 блока инцидентов
│   ├── 18-templates/        ← шаблоны (в табе Ещё)
│   ├── 19-career/           ← карьера (в табе Ещё)
│   ├── 21-playground/       ← песочница 1033 сценария + playground.html (прогресс, 🔗, focus)
│   ├── 22-trainer/          ← тренажёр 831 карта + quiz.html (Space/1-2-3/undo, streak)
│   └── 23-mlops/            ← MLOps 9 стр
├── overrides/stylesheets/   ← зеркало extra.css + кастом home (опц.)
├── includes/                ← сниппеты
├── tools/build_home.py      ← генерация статистики главной
├── tools/build_trainer.py   ← SRS генератор (831)
├── tools/check_nav_drift.py ← CI-чек дрейфа цифр
└── site/                    ← СОБРАННЫЙ сайт (генерируется, не коммитить)
```

---

## ✍️ Как добавить свою страницу

1. Создайте файл `docs/<раздел>/99-my-note.md`.
2. Добавьте путь в `mkdocs.yml` → секция `nav:` (без префикса `docs/`).
3. Используйте шаблон:

```markdown
# 🔧 Название страницы

> Краткое описание: что здесь и зачем.

## Раздел

Текст, списки, **жирный**, `код`.

| Таблица | Работает |
| :------ | :------- |

```bash
echo "блоки кода с подсветкой"
```
```

4. Проверьте сборку: `mkdocs build --strict` — должно быть без ошибок.

### Полезные элементы разметки

```markdown
!!! note "Заголовок блока"
    Цветная плашка (tip/warning/danger/note/success/example).

<details><summary>Спойлер</summary>
Скрытый текст до клика.
</details>

```mermaid
graph LR
    A --> B     /* диаграмма */
```
```

---

## 🧪 Песочница и Тренажёр (интерактив, UX v1)

- **[Песочница](docs/21-playground/index.md)** — терминал + Monaco: **1033 сценария** по всем темам. Фишки UX v1: прогресс в `localStorage` (`playground-solved-v1`, ✓ в select, счётчик `✓ 12/1033`), `🔗 Копировать ссылку` → `?scenario=id` + тост, группировка `<optgroup>` по категориям, light/dark (`prefers-color-scheme`), a11y (`aria-live`, `aria-label`, focus-ring), `⛶ Фокус`-режим, `@media print` (только задание), стабилизирован Monaco fallback, back-link `← Назад к справочнику`. Deep-link: `playground.html?scenario=lab07`.
- **[Тренажёр](docs/22-trainer/index.md)** — SRS **831 карточка**, Anki-интервалы 1→70 дней, `localStorage` (`devops-handbook-srs-v2`). Фишки UX v1: шорткаты `Space` (ответ), `1/2/3` (Снова/Хорошо/Легко), `←/→` (undo/skip), `Z/Ctrl+Z` undo, кнопка `↩ Undo` (history 20), `📊 Streak` (дни подряд, новых/повторов за неделю, ключ `devops-handbook-srs-stats-v1`), light-тема, динамический `<h1>Тренажёр: ${topic}`, `<kbd>` подсказки, back-link.
- Пересборка: `py tools/build_trainer.py` → обновляет `quiz.html` + `index.md` (навигационную метку `831`) + `py tools/build_home.py` для главной.
- Проверка дрейфа: `py tools/check_nav_drift.py` — сравнивает цифры в `docs/index.md` (299 стр/12 лаб/4 блока/1033 сцена/831 карт) с реальностью; падает в CI если расхождение.

### Тренажёр = Anki прямо на сайте

Внешний Anki не нужен: [quiz.html](docs/22-trainer/quiz.html) реализует тот же алгоритм интервальных повторений — режимы «Снова / Хорошо / Легко» с интервалами 1→3→7→16→35→70 дней, очередь повторений (due), режим экзамена, прогресс в localStorage браузера. Карточки собираются автоматически из блоков «Проверь себя» всех разделов.

### Стандарт «Проверь себя» (для авторов)

Каждая теоретическая страница заканчивается блоком самопроверки: 4–5 вопросов в формате тренажёра (`**В1. вопрос**` + `<details><summary>Ответ</summary>`). Такие вопросы попадают и на страницу, и в SRS-тренажёр. Хелпер для страниц с готовыми Q/A: `py tools/add_selfcheck.py`. Полный стандарт лаб: [18.6](docs/18-templates/06-hands-on-lab-standard.md).

---

## 🌐 Публикация в интернет (по желанию)

### GitHub Pages (бесплатно)

```bash
mkdocs gh-deploy --force
# Сайт будет доступен на https://<user>.github.io/<repo>
```

⚠️ `repo_url` скрыт до появления настоящего репо (Phase 1.1 — `content.action.edit/view` выключены). Перед `gh-deploy` раскомментируйте `repo_url`/`edit_uri` в `mkdocs.yml`.

### Свой VPS + Nginx

```bash
mkdocs build --strict
rsync -avz site/ user@server:/var/www/devops-handbook/
# nginx server { root /var/www/devops-handbook; } — статика, ничего больше не нужно
```

### PDF-экспорт (опционально)

Вариант 1 — печать из браузера (без зависимостей): соберите сайт и в Chrome откройте каждую страницу → Ctrl+P → «Сохранить как PDF». Для одной книги целиком удобнее плагин:

```bash
pip install mkdocs-print-site-page
# в mkdocs.yml добавить в plugins:  - print-site-page
mkdocs build
# site/print_page.html — вся документация одной страницей → печать в PDF
```

После экспорта плагин можно убрать из конфига, чтобы не замедлять обычную сборку.

---

## 🆘 Типовые проблемы

| Проблема | Решение |
| :--- | :--- |
| `mkdocs: command not found` | `pip install mkdocs-material` или перезапустите терминал после установки |
| `Port 8000 is already in use` | Другой экземпляр serve уже запущен: убейте процесс или смените порт `-a :8080` |
| Ошибка `mapping values are not allowed` при build | YAML: ключи с двоеточием внутри нужно брать в кавычки в `mkdocs.yml` |
| Мерmaid-диаграмма не отображается | Проверьте синтаксис диаграммы; ошибки видны в консоли браузера F12 |
| Поиск не находит новое слово | Пересоберите сайт (`mkdocs build`) — индекс строится при сборке |
| Windows: кракозябры в консоли | `[Console]::OutputEncoding=[Text.Encoding]::UTF8` или используйте pwsh 7+ |
| Сайт медленно перезагружается | Используйте `mkdocs serve --dirtyreload` — обновляет только изменённую страницу |

---

## ✅ Рекомендуемый ежедневный workflow (UX v1)

1. Запустить `mkdocs serve` (фоном).
2. Открыть [Roadmap](docs/00-roadmap/01-devops-roadmap-2026.md) → текущий этап.
3. Теория → сразу `🧪 Песочница` (кнопка `🔗 Копировать ссылку` для шаринга) или `🎯 Тренажёр` (`Space/1-2-3` только клавиатурой).
4. Отмечайте чек-боксы в roadmap'е; прогресс песочницы/тренажёра — в `localStorage` (streak, `✓` в списке).
5. Перед PR: `mkdocs build --strict && py tools/check_nav_drift.py` — оба должны быть зелёными (CI `.github/workflows/ci.yml` + `.pre-commit-config.yaml` делают то же).
6. При изменении Q/A: `py tools/build_trainer.py && py tools/build_home.py` — обновите тренажёр и цифры на главной.

> 💡 **Совет:** держите сайт открытым вторым окном во время практики в терминале — поиск (`/`) находит нужную команду быстрее гугла.
