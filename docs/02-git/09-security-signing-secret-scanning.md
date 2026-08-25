# 🔐 09. Git Security: Подписи Коммитов, Сканирование Секретов

## ✍️ Подпись коммитов и тегов: GPG, SSH, X.509

Подпись доказывает, что коммит сделал владелец ключа. Без неё любой может закоммитить чужим `user.name/email`.

```bash
# --- SSH-ключ (самый простой путь, без GPG-зоопарка) ---
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true          # подписывать всё автоматически
git commit -S -m "feat: signed"                   # разово
git tag -s v1.2.0 -m "release"                    # подписанный аннотированный тег
git tag -v v1.2.0                                 # проверить тег
ssh-add ~/.ssh/id_ed25519                         # агент нужен при каждом коммите

# --- GPG ---
gpg --full-generate-key                           # RSA 4096 / ed25519, имя+email как в git config
gpg --list-secret-keys --keyid-format=long        # взять KEYID
git config --global user.signingkey KEYID
gpg --armor --export KEYID                        # публичный ключ → GitHub/GitLab → Settings → Keys

git log --show-signature -3                       # проверка подписей в истории
```

Проверка подписи на сервере: GitHub показывает `Verified`; GitLab — badge в MR; можно запретить неп подписанные push серверными правилами (GitLab Push Rules / pre-receive).

## 🕵️ Секреты в истории: обнаружение

```bash
# gitleaks — стандарт де-факто (быстрый, есть в Docker)
gitleaks detect --source . --report-path leaks.json --redact
gitleaks protect --staged                  # режим хука: только staged-изменения
gitleaks git --pre-commit -r -             # как pre-commit hook

# trufflehog — плюс проверка живости кредов (подтверждает валидность найденного!)
trufflehog git file://. --only-verified

# встроенный сканер GitLab: Security → Secret Detection (offline-режим для self-hosted)
```

Хук на каждый коммит (pre-commit framework):

```yaml
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.4
    hooks:
      - id: gitleaks
```

## 🚨 Секрет всё-таки утёк: протокол реагирования

```mermaid
flowchart TD
    A["Обнаружен секрет в истории"] --> R{"РОТАЦИЯ КЛЮЧА<br/>немедленно!"}
    R --> B["Revoke/rotate: пароль, токен, ключ"]
    B --> C["Чистка истории: filter-repo/BFG"]
    C --> D["Force-push + переклонирование команды"]
    D --> E["Разбор причин: почему пропустили хуки/CI?"]
```

**Главное правило: чистка истории НЕ отменяет компрометацию.** Репо мог быть склонирован форками/CI-кэшами. Ротация — всегда шаг №1.

```bash
pipx install git-filter-repo
echo 'AKIAIOSFODNN7EXAMPLE ==> REMOVED' > replacements.txt
git filter-repo --replace-text replacements.txt --force
# либо удалить целые пути: --invert-paths --path .env
git push --force --all && git push --force --tags
```

## 🛡️ Профилактика: многослойная защита

| Слой | Инструмент | Ловает когда |
|---|---|---|
| IDE/локально | gitleaks pre-commit hook | до коммита |
| CI | gitleaks/trufflehog job в pipeline | до мержа |
| Сервер | GitLab Secret Detection push rules | до принятия push |
| Постоянно | scheduled-скан всего репо + GitHub/GitLab secret scanning | уже в истории |
| Архитектурно | секреты вообще не в коде: Vault/ESO/SOPS, `.env*` в `.gitignore` | не появляются |

```bash
# .gitignore как первая линия обороны:
.env
.env.*
*.pem
*.p12
id_rsa*
credentials.json
```

## 👤 Подмена автора и защита веток

```bash
# Атака: подделать авторство (без подписи это тривиально)
git -c user.name="Linus Torvalds" -c user.email="linus@kernel.org" \
    commit -m "malicious"
git shortlog -sne | head          # кто «писал» код на самом деле

# Защита: обязательные signed commits + protected branches +
# CODEOWNERS на критичные пути (см. 07) — авторство подтверждается криптографически.
```

Дополнительные серверные барьеры: запрет force-push в main/release/*, требование линейной истории или merge-only, лимит размера push, блокировка push новых файлов-артефактов.

## ❓ Пять вопросов для самопроверки

---


## ✅ Проверь себя

> Отвечай вслух до раскрытия ответа. Если «не помню» — вернись к разделу.


**В1. Почему подпись коммита важнее поля author?**
<details><summary>Ответ</summary>
author/committer — произвольные строки, их подделывает любая `-c user.name=` команда. Подпись (GPG/SSH/X.509) связывает коммит с приватным ключом; проверяется криптографически и отображается как Verified.
</details>

**В2. Что делает trufflehog такого, чего нет у gitleaks?**
<details><summary>Ответ</summary>
Проверяет найденные креды на живость (`--only-verified`): делает тестовый запрос к API провайдера. Это отделяет реально работающие токены от старых отозванных — приоритезация реагирования.
</details>

**В3. Порядок действий при утечке секрета в git-истории?**
<details><summary>Ответ</summary>
1) Немедленная ревокация/ротация секрета; 2) только потом чистка истории (filter-repo/BFG) и force-push; 3) переклонирование команды; 4) постмортем: почему прошли локальный хук и CI. Чистка без ротации бесполезна — история могла разойтись по форкам.
</details>

**В4. Как перевести команду на подписанные коммиты минимальной кровью?**
<details><summary>Ответ</summary>
Формат SSH (`gpg.format=ssh`) — использует существующие ssh-ключи, без GPG-инфраструктуры. Автовключение: `commit.gpgsign true` в глобальном конфиге + инструкция; контроль — серверная политика required signatures на защищённых ветках.
</details>

**В5. Где должен стоять последний рубеж против утечки секретов и почему не только в pre-commit?**
<details><summary>Ответ</summary>
На сервере (push rules / server-side scanning) и по расписанию на всём репо: клиентские хуки отключаемы (`--no-verify`, просто не установлены). Многослойность нужна потому, что каждый слой обходится разными способами.
</details>

---

*Что дальше:* [10. Археология кода: bisect, worktree, filter-repo](10-git-archaeology-bisect-worktree-filter-repo.md) · [10-security-and-cloud](../10-security-and-cloud/01-devsecops-and-secrets.md)
