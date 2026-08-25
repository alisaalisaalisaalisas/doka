# ⌨️ 06. Python: CLI-Приложения Инженерного Уровня

## 🏗️ Выбор фреймворка

| Библиотека | Стиль | Когда брать |
|---|---|---|
| **argparse** | stdlib, многословный | скрипт без зависимостей |
| **click** | декораторы | зрелый стандарт, много плагинов |
| **typer** | type-hints (на click) ⚡ | новый код: меньше boilerplate, типы из подписи |

```python
# typer: сигнатура функции = интерфейс CLI
import typer, httpx
from pathlib import Path
from typing_extensions import Annotated

app = typer.Typer(help="DevOps Toolkit — управление деплоями")

@app.command()
def rollout(
    name: Annotated[str, typer.Argument(help="Имя сервиса")],
    image: Annotated[str, typer.Option("--image", "-i", help="Новый образ")],
    replicas: Annotated[int, typer.Option("--replicas", "-r", min=1, max=50)] = 3,
    env: Annotated[str, typer.Option(case_sensitive=False)] = "prod",
    dry_run: Annotated[bool, typer.Option("--dry-run")] = False,
    config: Annotated[Path, typer.Option(exists=True, dir_okay=False)] = Path("dtk.yaml"),
):
    """Прокатить новый образ на окружение."""
    cfg = load_config(config)
    if dry_run:
        typer.secho(f"DRY-RUN {name}: {image} → {env}", fg=typer.colors.YELLOW)
        raise typer.Exit(code=0)
    result = do_rollout(name, image, replicas, env)
    typer.echo(f"✓ {result}")

@app.command()
def status(name: str):
    """Статус деплойментов."""
    for line in fetch_status(name):
        typer.echo(line)

if __name__ == "__main__":
    app()
```

```bash
dtk rollout web --image web:1.42 --replicas 5
dtk rollout --help          # автогенерация справки из docstring/типов
```

## 🚦 Коды выхода и обработка ошибок

CLI вызывается из пайплайнов — **код выхода это API**:

| Код | Смысл |
|---|---|
| 0 | успех |
| 1 | общая ошибка приложения |
| 2 | ошибка использования (argparse/click сами) |
| свой диапазон | договоритесь: 10 = timeout, 20 = partial failure |

```python
class ToolkitError(Exception):
    exit_code = 1

def main() -> None:
    try:
        app()
    except ToolkitError as e:
        typer.secho(f"error: {e}", fg="red", err=True)
        raise SystemExit(e.exit_code)
    except httpx.HTTPStatusError as e:
        typer.secho(f"API error {e.response.status_code}: {e.response.text[:200]}", fg="red", err=True)
        raise SystemExit(1)

# Частичный успех массовой операции:
if failures and successes:
    raise SystemExit(20)      # CI увидит «не всё гладко»
```

## 📋 Logging vs stdout: разделение потоков

**Правило:** данные — в stdout (их пайпят в jq), диагностика — в stderr.

```python
import logging, sys

def setup_logging(verbose: int) -> None:
    level = logging.WARNING - verbose * 10        # -v=INFO, -vv=DEBUG
    logging.basicConfig(
        stream=sys.stderr,                        # логи НЕ ломают stdout!
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        level=max(logging.DEBUG, level),
    )
    logging.getLogger("httpx").setLevel(logging.WARNING)   # шумные библиотеки

log = logging.getLogger("dtk.rollout")
log.info("scaling %s to %d", name, replicas)      # lazy-форматирование

# Машиночитаемый вывод для автоматизаций:
dtk status web --output json | jq '.[].ready'
```

## 🧪 Тестирование CLI

```python
from typer.testing import CliRunner
runner = CliRunner()

def test_rollout_dry_run(tmp_path, mocker):
    do = mocker.patch("devops_toolkit.cli.do_rollout")
    cfg = tmp_path / "dtk.yaml"; cfg.write_text("api: https://x\n")
    result = runner.invoke(app, ["rollout", "web", "--image", "web:1", "--dry-run", "--config", str(cfg)])
    assert result.exit_code == 0
    assert "DRY-RUN" in result.output
    do.assert_not_called()

# E2E как реальный бинарник (после pip install .):
subprocess.run(["dtk", "status", "web"], capture_output=True, check=True).stdout
```

## 🎨 UX-детали, отличающие инструмент от скрипта

```bash
--version            # importlib.metadata.version("devops-toolkit")
--dry-run / --yes    # безопасный просмотр И явное подтверждение деструктивных действий
NO_COLOR / --no-color # уважение терминала без поддержки цвета; TTY-детект через sys.stdout.isatty()
progress             # rich.Progress для длинных операций
completion           # dtk --install-completion bash/zsh/fish — из коробки у typer
config               # каскад: defaults < файл (~/.config/dtk/config.toml) < ENV < CLI-флаги
```

Пагинация больших выводов, идемпотентность повторного запуска, `--timeout` с осмысленным дефолтом — то, что вспоминают после первого инцидента.

## ❓ Пять вопросов для самопроверки

---


## ✅ Проверь себя

> Отвечай вслух до раскрытия ответа. Если «не помню» — вернись к разделу.


**В1. Почему логи пишутся в stderr, а не stdout?**
<details><summary>Ответ</summary>
stdout предназначен для данных результата, которые пайплятся (`dtk status | jq`). Логи в stdout сломают парсер потребителя. stderr идёт отдельно: виден человеку в терминале, не попадает в pipe.
</details>

**В2. Зачем CLI собственные коды выходов сверх 0/1?**
<details><summary>Ответ</summary>
Пайплайн принимает решения по коду: 20 (partial success) может означать «продолжить с алертом», а 10 (timeout) — ретрай. Один код «ошибка» лишает автоматизацию различения сценариев.
</details>

**В3. Как тестировать команду, не выполняя реальные действия?**
<details><summary>Ответ</summary>
Двухслойно: unit — CliRunner + мок бизнес-функций (проверяем разбор аргументов и коды выхода); e2e — subprocess против установленного бинарника с `--dry-run` или локальным fake-API. Деструктивные пути всегда сначала под `--dry-run`.
</details>

**В4. Что даёт каскад конфигурации defaults→файл→ENV→CLI?**
<details><summary>Ответ</summary>
Одинаковое поведение локально и в CI: секреты/URL через ENV (не светятся в истории shell), командные дефолты в файле, точечная правка флагом. Приоритет CLI сверху делает переопределение предсказуемым.
</details>

**В5. Почему `--dry-run` должен быть у любой мутации, даже если есть `--yes`?**
<details><summary>Ответ</summary>
`--yes` отвечает на вопрос «не спросить ли пользователя», но не «что именно произойдёт». Dry-run показывает план изменений (diff манифестов, список затронутых ресурсов) — единственный способ проверить автоматизацию до боевого прогона.
</details>

---

*Что дальше:* [07. Kubernetes-операторы на Python](07-python-kubernetes-kopf-operators.md) · [05. Типизация](05-python-typing-mypy-ruff.md)
