# 🕰️ 10. Археология Кода: bisect, worktree, blame и filter-repo

## 🔪 git bisect: бинарный поиск бага по истории

Классика: «на v3.2 работало, на main сломалось, коммитов 400». Bisect находит виновника за `log2(400) ≈ 9` шагов.

```bash
git bisect start
git bisect bad main                 # текущее состояние сломано
git bisect good v3.2                # эта версия работала
# Git переключается на середину. Проверяем:
make test                           # падает → git bisect bad
                                    # работает → git bisect good
# ... повторяем ...
git bisect log                      # сохранить протокол сессии
git bisect reset                    # вернуться в исходную ветку

# Автоматизация: скрипт сам решает good/bad (exit 0 = good)
git bisect start HEAD v3.2
git bisect run ./ci/smoke-test.sh   # всё происходит без участия человека
git bisect reset
```

```bash
# Пример smoke-теста для веб-API:
#!/bin/bash
curl -sf http://localhost:8080/health || exit 125   # 125 = skip (сборка сломана)
./run-api.sh & sleep 3
curl -sf -X POST localhost:8080/api/v1/orders -d '{"x":1}' | grep -q '"status":"created"'
```

**Продвинутые фишки:** `git bisect run` + Docker (`docker run --rm -v $PWD:/src ci-image /src/test.sh`) — воспроизводимая среда на каждом шаге; `bisect new/old` вместо good/bad для «когда появился этот лог?».

## 🌳 git worktree: несколько веток одновременно

Worktree создаёт вторую рабочую копию **того же репозитория** (общая БД объектов). Идеально: hotfix не требует прятать незаконченную работу.

```bash
git worktree add ../hotfix-dir hotfix/2.4.1     # новая папка = ветка hotfix
cd ../hotfix-dir && vim fix.c && git commit -am "fix"
git worktree list                                # все копии
git worktree remove ../hotfix-dir                # убрать
```

Паттерны использования:

```bash
# Долгие тесты на одной ветке — работа продолжается в другой:
git worktree add ../feature-b feature-b

# Сборка релиза из тега, не трогая рабочую копию:
git worktree add --detach ../build v1.4.0 && cd ../build && make release

# Одна и та же ветка НЕ может быть checkout'нута дважды — это защита от конфликтов index.
```

## 🏺 Поиск происхождения кода

```bash
git blame -L 120,140 src/auth.go            # кто менял строки 120–140
git blame -w -C src/auth.go                  # игнорировать пробелы, следовать переездам кода
git blame --since=3.months src/auth.go       # только свежие правки

git log -p --follow path/to/file.py          # история файла даже после переименования
git log -S "RateLimiter" --oneline           # pickaxe: когда строка ПОЯВИЛАСЬ/ИСЧЕЗЛА
git log -G "func.*[Rr]equeue.*time" --oneline # то же, но по regex диффа
git log --diff-filter=D --summary | grep -B2 delete   # когда файл удалили

git log --all --grep="OOM" --oneline         # поиск по сообщениям коммитов во всех ветках
git log main..feature --oneline              # что есть только в feature
git cherry -v main feature                   # какие коммиты уже эквивалентно есть в main
```

!!! tip "Pickaxe против rebase"
    После squash/rebase коммит-«виновник» может иметь другой SHA, но `-S/-G` ищут по содержимому диффов — находят независимо от переписываний истории.

## 🧨 filter-repo как инструмент архитектуры

Помимо чистки секретов (см. [08](08-large-repos-performance-lfs.md)), filter-repo решает задачи переструктурирования:

```bash
# Переименовать каталог во ВСЕЙ истории (перенос проекта в подкаталог):
git filter-repo --path-rename old-src/:services/core/src/

# Оставить только нужные пути (выделение сервиса):
git filter-repo --subdirectory-filter services/payments/

# Заменить текст везде (ротация утёкших кредов):
echo 'old-token ==> ***REMOVED***' > r.txt && git filter-repo --replace-text r.txt

# Вырезать большие blob'ы:
git filter-repo --strip-blobs-bigger-than 50M
```

Правила безопасности: только fresh clone, предупредить команду (SHA меняются), теги пересоздаются автоматически, открытые MR придётся обновить вручную.

## 🧰 Комбинированные кейсы

| Задача | Набор команд |
|---|---|
| «Баг в проде, у меня незакоммиченная работа» | `worktree add` → bisect в новой копии |
| «Кто и когда изменил этот конфиг?» | `log -p --follow` → `blame -w -C` на найденный диапазон |
| «Когда пропала эта функция?» | `log -S 'funcName' --all` → показать diff |
| «Найти коммит, добавивший утечку памяти» | `bisect run perf-test.sh` |
| «Вынести микросервис в отдельное репо» | `filter-repo --subdirectory-filter` |

## ❓ Пять вопросов для самопроверки

---


## ✅ Проверь себя

> Отвечай вслух до раскрытия ответа. Если «не помню» — вернись к разделу.


**В1. Почему bisect эффективнее линейного просмотра?**
<details><summary>Ответ</summary>
История линейна между good/bad — бинарный поиск делит диапазон пополам: 1000 коммитов ≈ 10 проверок вместо 1000. С `bisect run` проверки автоматизированы, человек только читает итог.
</details>

**В2. Чем worktree лучше stash+switch?**
<details><summary>Ответ</summary>
Stash прячет работу и требует потом восстановить (риск потерять/перепутать). Worktree держит обе ветки одновременно в разных каталогах одной БД объектов: можно гонять тесты в одной и писать код в другой без переключения контекста.
</details>

**В3. Как найти коммит, если искомая строка появилась и исчезала несколько раз?**
<details><summary>Ответ</summary>
`git log -S"строка" --all --oneline` покажет ВСЕ коммиты, где количество вхождений строки менялось (появление/удаление), а `-G"regex"` — где дифф матчится регэкспом. Читаете diffs и восстанавливаете хронологию.
</details>

**В4. Что означает exit-код 125 у скрипта для `bisect run`?**
<details><summary>Ответ</summary>
«Пропустить этот коммит» (например, сборка сломана по независящей причине). 0 = good, 1–127 (кроме 125) = bad, 125 = skip. Это позволяет бисектить даже через исторически нерабочие коммиты.
</details>

**В5. Какие два обязательных условия применения git filter-repo?**
<details><summary>Ответ</summary>
Fresh clone (инструмент отказывается работать на замусоренной копии и это правильно — старые objects остались бы в packs) и согласованное переклонирование/force-push всей командой, поскольку SHA всех коммитов после точки изменения переписываются.
</details>

---

## ✅ Три практики раздела Git (итоговые)

**Практика 1. Восстановление после катастрофы:** создайте репо-песочницу, сделайте 5 коммитов, выполните `reset --hard HEAD~2`, затем восстановите через reflog; повторите с `rebase -i` и удалением коммита.

**Практика 2. Автоматический bisect:** соберите мини-проект с тестом, сломайте его одним из 16 коммитов, найдите виновника `git bisect run pytest -q` и засеките время (<1 мин).

**Практика 3. Подписанный конвейер:** настройте SSH-подпись коммитов, включите gitleaks pre-commit hook, попробуйте закоммитить fake-AWS-ключ и убедитесь, что хук блокирует; проверьте `Verified` в UI.

---

*Дальше по программе:* [Python 02. Окружения и упаковка](../08-programming-python-go/02-python-environments-packaging.md) · [Go 02. Fundamentals deep](../08-programming-python-go/02-go-fundamentals-deep.md)
