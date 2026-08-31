# 🏋️ 08. Большие Репозитории: LFS, Производительность, Диагностика

## 📉 Почему репозиторий «тормозит»: диагностика

Симптомы медленного Git: долгий clone/fetch, тормозящий `git status`, `log` на минутах. Сначала измеряем:

```bash
git count-objects -vH
#  count: 0, size: 0          ← loose (плохо, если тысячи)
#  in-pack: 1254321           ← объектов всего
#  size-pack: 4821376         ← КБ! размер .pack = размер истории

GIT_TRACE_PERFORMANCE=1 git status        # что именно тормозит
git rev-list --objects --all |            # топ самых тяжёлых blob'ов в истории
  git cat-file --batch-check='%(objecttype) %(objectsize) %(rest)' |
  awk '$1=="blob"{print $2, $3}' | sort -rn | head -20

git verify-pack -v .git/objects/pack/pack-*.idx |
  sort -k3 -n -r | head -5                # тяжёлые объекты текущего pack

time git log --oneline --graph -100       # скорость ревизий
```

**Правило:** >1 ГБ pack или blob'ы >10 МБ в истории — уже проблема; видео/датасеты/дампы в Git — всегда ошибка.

## 🗃️ Git LFS: большие бинарники правильно

LFS хранит в репо **указатель** (файл ~130 байт), а контент — на отдельном LFS-сервере (GitLab/GitHub имеют встроенный).

```text
version https://git-lfs.github.com/spec/v1
oid sha256:4d7a214614ab2935c943f9e0ff69d22eadbb8f32bce45938d7daa37e2bd0c6f3
size 12824747
```

```bash
git lfs install                                   # один раз на машине
git lfs track "*.psd" "*.zip" "models/*.onnx"     # паттерны в .gitattributes — ЗАКОММИТИТЬ его первым!
git add model.onnx && git commit -m "feat: model v3"
git lfs ls-files                                  # что под управлением LFS
git lfs migrate import --everything --include="*.zip"   # перенести УЖЕ ЗАКОММИЧЕННЫЕ zip в LFS
git lfs fetch --recent                            # только свежие версии бинарников
GIT_LFS_SKIP_SMUDGE=1 git clone <url>             # клон без скачивания бинарников (CI!)
```

!!! warning "LFS migrate переписывает историю"
    `git lfs migrate import --everything` меняет SHA всех затронутых коммитов → нужен согласованный force-push и переклонирование у команды. Для новых файлов просто начните `track` с первого дня.

Квоты и CI: LFS-трафик тарифицируется отдельно (GitHub), в GitLab лимиты на проект. В пайплайнах используйте `GIT_LFS_SKIP_SMUDGE=1` + `git lfs pull --include=<нужное>`.

## ⚡ Ускорение клонов и операций

| Приём | Команда | Экономия |
|---|---|---|
| Shallow clone | `git clone --depth=1 <url>` | история не качается (CI: −90% времени) |
| Single branch | `--single-branch` | не тянет все ветки |
| Partial clone | `--filter=blob:none` | blobs по требованию, полная история |
| Treeless clone | `--filter=tree:0` | максимум скорости для одноразовой сборки |
| Sparse checkout | `sparse-checkout set dir/` | рабочая копия только нужных каталогов |
| Filesystem monitor | `core.fsmonitor=true` | мгновенный status на огромных деревьях |
| Commit graph | `git commit-graph write --reachable` | log/blame/ревизии ускоряются в разы |

```bash
# Типовой рецепт для CI (GitLab):
variables:
  GIT_DEPTH: "50"                    # shallow, но достаточно для merge-base
  GIT_FETCH_EXTRA_FLAGS: --filter=blob:none
```

### Настройки под большую рабочую копию

```ini
[core]
    fsmonitor = true                 # демон отслеживает изменения ФС
    untrackedCache = true            # кэш списка untracked
    preloadIndex = true
[feature]
    manyFiles = true                 # включает набор оптимизаций сразу
[index]
    version = 4                      # компактный формат index
```

## 🧼 Чистка истории от мусора

Найден 2-ГБ дамп, закоммиченный год назад. Убрать из ВСЕЙ истории:

```bash
pipx install git-filter-repo
git clone --no-local repo.git repo-clean && cd repo-clean     # ОБЯЗАТЕЛЬНО fresh clone!
git filter-repo --invert-paths --path dumps/prod.sql          # удалить путь из всей истории
git filter-repo --strip-blobs-bigger-than 10M                 # или всё >10 МБ
git remote add origin <new-url> && git push --force origin --all --tags
```

Альтернатива BFG Repo-Cleaner (`java -jar bfg.jar --strip-blobs-bigger-than 100M`). После чистки:

```bash
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

⚠️ Все SHA после filter-repo меняются. Открытые секреты, попавшие в историю, удаляются так же (см. [09](09-security-signing-secret-scanning.md)), но ключи считаются скомпрометированными — ротация обязательна.

## 📊 Бенчмарк: до и после

```bash
# Измеряйте ДО оптимизации, чтобы доказать эффект:
hyperfine 'git status' 'git log -200 --oneline' 'git branch' --warmup 3
# типичный результат на монорепо 30k файлов:
#   status:      8.2s → 0.4s   (fsmonitor + untrackedCache)
#   log -200:   12.7s → 1.1s   (commit-graph)
```

## ❓ Пять вопросов для самопроверки

---


## ✅ Проверь себя

> Отвечай вслух до раскрытия ответа. Если «не помню» — вернись к разделу.


**В1. Чем shallow clone отличается от partial clone?**
<details><summary>Ответ</summary>
Shallow (`--depth=N`) обрезает ИСТОРИЮ до N коммитов — merge-base может сломаться, некоторые операции недоступны. Partial (`--filter`) сохраняет полную историю коммитов/деревьев, но откладывает скачивание blobs до первого обращения. Для CI обычно лучше filter.
</details>

**В2. Что обязательно сделать перед `git lfs track "*.zip"`?**
<details><summary>Ответ</summary>
Закоммитить `.gitattributes` (его создаёт track) как можно раньше, идеально первым коммитом репо. Паттерны действуют только с момента попадания в историю; файлы, добавленные раньше, нужно переносить через `lfs migrate`.
</details>

**В3. Как узнать, какие объекты раздувают репозиторий?**
<details><summary>Ответ</summary>
`git rev-list --objects --all | git cat-file --batch-check=...` с сортировкой по размеру покажет топ blob'ов; `verify-pack -v` — тяжёлые объекты текущих packs; `count-objects -vH` — общий объём.
</details>

**В4. Зачем в CI ставить `GIT_LFS_SKIP_SMUDGE=1`?**
<details><summary>Ответ</summary>
Clone перестаёт автоматически скачивать все версии всех бинарников (часто гигабайты). Нужные конкретные файлы затем точечно: `git lfs pull --include="models/*"`. Экономия минут на каждый джоб.
</details>

**В5. Почему нельзя чистить историю в рабочей копии обычным способом?**
<details><summary>Ответ</summary>
Удаление пути через rebase/filter-repo переписывает SHA всех потомков. Работать надо в fresh clone (`--no-local`, чтобы не переиспользовать objects), после — force-push и переклонирование командой; иначе старые копии истории вернут мусор при следующем merge.
</details>

---

*Что дальше:* [09. Подписи, секреты, безопасность](09-security-signing-secret-scanning.md) · [07. Монорепо](07-submodules-subtrees-monorepo.md)
