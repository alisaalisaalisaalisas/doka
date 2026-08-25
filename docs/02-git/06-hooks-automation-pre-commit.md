# 🪝 06. Git Hooks, pre-commit и Автоматизация Коммитов

## 🧷 Анатомия hooks: где живут и какие бывают

Hooks — скрипты в `.git/hooks/`, срабатывающие на события. Не версионируются (каталог не под git) → для команды их распространяют через фреймворки или `core.hooksPath`.

| Hook | Когда | Можно отменить действие? |
|---|---|---|
| `pre-commit` | перед созданием коммита | ✅ (exit ≠ 0) |
| `commit-msg` | после ввода сообщения | ✅ (валидация Conventional Commits) |
| `pre-push` | перед push | ✅ (последний рубеж: тесты) |
| `pre-rebase` | перед rebase | ✅ (защита публичных веток) |
| `post-merge` / `post-checkout` | после merge/checkout | ❌ (уведомления, пересборка) |
| `prepare-commit-msg` | при генерации сообщения | ❌ (авто-подстановка issue-номера) |

Серверная сторона (`pre-receive`, `update`, `post-receive`) живёт на bare-сервере — там ставят запрет force-push, проверку размера файлов, деплой.

```bash
git config core.hooksPath .githooks   # хуки из репо (закоммичены в .githooks/)
chmod +x .githooks/pre-commit         # не забыть executable bit!
```

## 🧹 pre-commit framework: стандарт индустрии

Один YAML описывает линтеры; `pre-commit` сам качает окружения и гоняет их только по изменённым файлам.

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
        args: [--allow-multiple-documents]
      - id: check-added-large-files
        args: ['--maxkb=1024']
      - id: detect-private-key          # секреты не уйдут в коммит
  - repo: https://github.com/psf/black
    rev: 24.4.2
    hooks:
      - id: black
  - repo: https://github.com/pycqa/flake8
    rev: 7.0.0
    hooks:
      - id: flake8
  - repo: https://github.com/antonbabenko/pre-commit-terraform
    rev: v1.89.1
    hooks:
      - id: terraform_fmt
      - id: terraform_validate
```

```bash
pipx install pre-commit
pre-commit install                   # поставить хук
pre-commit run --all-files           # прогнать по всему репо (первый онбординг)
pre-commit autoupdate                # обновить ревизии хуков
pre-commit run terraform_fmt --file main.tf   # точечно
```

В CI то же самое одной строкой — **та же конфигурация локально и в пайплайне**:

```yaml
lint:
  stage: test
  image: python:3.12-slim
  script: pipx run pre-commit run --all-files
```

## 📏 Commitlint + Conventional Commits

```bash
npm i -D @commitlint/cli @commitlint/config-conventional husky
echo "export default { extends: ['@commitlint/config-conventional'] }" > commitlint.config.mjs
npx husky init && echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
```

Теперь `git commit -m "поправил чё-то"` отклоняется, а `fix(api): handle 409` проходит. Плюс changelog и SemVer автоматом (см. [04](04-branching-strategies-and-release-engineering.md)).

## 🕸️ Серверные хуки: что нельзя сделать клиентом

Клиентские проверки обходятся (`--no-verify`). Жёсткие гарантии — только сервер:

```bash
# pre-receive на bare-сервере: защита веток и запрет больших файлов
#!/bin/bash
while read old new ref; do
  # 1) запрет non-ff push в main
  if [[ "$ref" == "refs/heads/main" ]]; then
    if ! git merge-base --is-ancestor "$old" "$new"; then
      echo "DENY: force-push в main запрещён"; exit 1
    fi
  fi
  # 2) лимит размера объектов
  if git rev-list --objects "$old..$new" | git cat-file --batch-check='%(objecttype) %(objectsize) %(rest)' \
     | awk '$1=="blob" && $2 > 52428800 {print $3}' | grep -q .; then
    echo "DENY: blob > 50MB"; exit 1
  fi
done
```

На GitLab/GitHub это делается без скриптов: Protected Branches, push rules, size limits — но понимать механику хуков нужно для self-hosted Gitea/bare.

## ⚡ Практики, экономящие часы

```bash
# Пропустить хуки ОСОЗНАННО (WIP-коммит, который перепишется):
git commit --no-verify -m "wip"

# Кэш линтеров: ruff/mypy/eslint умеют кэшировать — ускорение в разы
ruff check --cache-dir .cache/ruff .
mypy --cache-dir .cache/mypy .

# Локальный «репетиционный» прогон полного CI до push:
git stash list | head                 # убедиться, что ничего не потеряете
pre-commit run --all-files && pytest -x -q
```

## ❓ Пять вопросов для самопроверки

---


## ✅ Проверь себя

> Отвечай вслух до раскрытия ответа. Если «не помню» — вернись к разделу.


**В1. Почему хуки не попадают в репозиторий автоматически?**
<details><summary>Ответ</summary>
`.git/hooks` лежит внутри служебного каталога `.git`, который не версионируется. Решения: `core.hooksPath` на закоммиченный каталог, pre-commit framework, husky — они «ставят» хуки командой install после clone.
</details>

**В2. Какой хук отклонит коммит с сообщением вне Conventional Commits?**
<details><summary>Ответ</summary>
`commit-msg`: ему передаётся путь к файлу с текстом сообщения; exit ≠ 0 отменяет коммит. Commitlint как раз оборачивает этот хук.
</details>

**В3. Чем серверный pre-receive лучше клиентского pre-commit?**
<details><summary>Ответ</summary>
Его нельзя обойти флагом `--no-verify`: он выполняется до принятия push на сервере. Всё критичное (защита веток, размер, подписи, секретные паттерны) дублируется на сервере; клиентские проверки — про удобство и скорость обратной связи.
</details>

**В4. Зачем запускать pre-commit в CI, если он уже стоит у разработчиков?**
<details><summary>Ответ</summary>
Локально его можно отключить/обойти, версия конфига может отличаться, часть разработчиков может не установить. CI-прогон той же конфигурации делает проверки обязательными и одинаковыми для всех.
</details>

**В5. Как быстро закоммитить WIP, игнорируя медленные линтеры?**
<details><summary>Ответ</summary>
`git commit --no-verify` (или переменная `PRE_COMMIT_ALLOW_NO_CONFIG=1` для особых случаев). Такой коммит должен быть временным: fixup/squash при следующем rebase — иначе «грязь» уйдёт дальше по пайплайну.
</details>

---

*Что дальше:* [07. Submodules, subtrees и монорепо](07-submodules-subtrees-monorepo.md) · шаблоны CI: [18-templates](../18-templates/02-iac-and-cicd.md)
