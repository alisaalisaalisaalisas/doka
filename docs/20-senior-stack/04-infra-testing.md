# 🧪 20.4 Тестирование инфраструктуры: Terratest, Molecule, k6/Locust

> Уровень: Middle→Senior. Цель: доказать работоспособность инфраструктуры кодом — до продакшена, а не после инцидента.

**Оглавление:** [2.1 Теория](#21-теория) · [2.2 Конфигурация](#22-конфигурация-и-синтаксис) · [2.3 Troubleshooting](#23-troubleshooting) · [2.4 Интеграция](#24-интеграция-со-стеком) · [2.5 Проверь себя](#25-проверь-себя--5-вопросов) · [2.6 Практика](#26-практика--3-задания)

---

### 2.1 Теория

#### Пирамида тестирования инфры

```text
        /\   E2E / Chaos (k6 + litmus): вся система под нагрузкой
       /--\
      / /\ \  Интеграционные (Terratest): РЕАЛЬНЫЕ ресурсы в тестовом аккаунте
     / /--\ \
    /  /()\  \  Ролевые (Molecule): роль Ansible в контейнере
   /__/____\__\
   Static: terraform validate, tflint, ansible-lint, conftest, kubeconform
```

Движение вверх = выше достоверность и цена (деньги, время). Senior-принцип: **максимум ловить внизу** — static за секунды на каждый коммит, интеграцию — ночью.

| Инструмент | Что тестирует | Как | Стоимость прогона |
| :--- | :--- | :--- | :--- |
| **Terratest** | Terraform/OpenTofu/Packer/Helm-модули | Go-тест: apply в тестовый аккаунт → ассерты по реальным ресурсам → destroy | деньги + 5-40 мин |
| **Molecule** | Ansible роли | роль в docker/podman/VM → converge → verify (ansible/testinfra) → idempotence | секунды-минуты |
| **k6** | HTTP/gRPC/WS приложения и платформы | JS-сценарии VU (virtual users), thresholds как pass/fail | нагрузка на стенд |
| **Locust** | то же + сложные пользовательские сценарии | Python-код, распределённые worker'ы | нагрузка |

**Ключевые термины:** `idempotence` (второй прогон роли = 0 изменений), `test stages` (Terratest: кэш между фазами apply/validate/destroy), `thresholds` (k6: SLO-условия провала теста), `ramp-up` (плавный рост нагрузки).

---

### 2.2 Конфигурация и синтаксис

#### Terratest: тест модуля S3

```go
// test/s3_test.go
package test

import (
    "testing"

    "github.com/gruntwork-io/terratest/modules/aws"
    "github.com/gruntwork-io/terratest/modules/random"
    "github.com/gruntwork-io/terratest/modules/terraform"
    "github.com/stretchr/testify/assert"
)

func TestS3Module(t *testing.T) {
    t.Parallel()

    expectedName := "terratest-" + strings.ToLower(random.UniqueId())

    opts := &terraform.Options{
        TerraformDir: "../modules/s3-bucket",
        Vars: map[string]interface{}{
            "bucket_name": expectedName,
            "versioning":  true,
        },
        // Не полагаемся на default backend — тестовый стейт отдельно
        BackendConfig: map[string]interface{}{"bucket": "tf-tests-state"},
    }

    // Стейджинг: apply тяжёлый — кэшируем между фазами разработки
    defer terraform.Destroy(t, opts)          // ГАРАНТИЯ очистки!
    terraform.InitAndApply(t, opts)

    bucketID := terraform.Output(t, opts, "bucket_id")
    assert.Equal(t, expectedName, bucketID)

    // Ассерт по РЕАЛЬНОЙ инфраструктуре через AWS API
    actual := aws.GetS3BucketVersioning(t, "eu-central-1", bucketID)
    assert.Equal(t, "Enabled", actual)
}
```

```bash
go mod init tests && go get github.com/gruntwork-io/terratest/modules@latest
go test -timeout 40m -run TestS3Module
SKIP_destroy_stage=true go test ...   # отладка: не уничтожать стенд
```

#### Molecule: сценарий роли nginx

```yaml
# molecule/default/molecule.yml
dependency: { name: galaxy }
driver: { name: docker }
platforms:
  - name: nginx-ubuntu
    image: geerlingguy/docker-ubuntu2204-ansible   # готовые образы с ansible
    privileged: true
    pre_build_image: true
provisioner: { name: ansible }
verifier: { name: ansible }        # без python-зависимостей testinfra
scenario:
  test_sequence:
    - dependency → lint → cleanup → destroy → syntax
    - create → prepare → converge
    - idempotence                   # ВТОРОЙ прогон converge: changed=0 обязателен
    - verify                        # ваши ассерты
    - cleanup → destroy
```

```yaml
# molecule/default/verify.yml
- name: Verify
  hosts: all
  tasks:
    - name: nginx отвечает 200
      ansible.builtin.uri: { url: "http://localhost", status_code: 200 }
    - name: TLS-протоколы ограничены
      ansible.builtin.command: openssl s_client -connect localhost:443 -tls1_1
      register: tls
      failed_when: tls.rc == 0       # tls1_1 должен быть ЗАПРЕЩЁН
```

#### k6: сценарий с SLO-thresholds

```javascript
// smoke.js — гейт в CI: падает, если p95 > 500ms или ошибки > 1%
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],          // 95% быстрее 500ms
    http_req_failed:   ['rate<0.01'],          // < 1% ошибок
    checks:            ['rate>0.99'],
  },
};

export default function () {
  const res = http.get('https://staging.shop.io/api/products');
  check(res, { 'status 200': (r) => r.status === 200, 'has body': (r) => r.body.length > 0 });
  sleep(1);                                     // думающий пользователь
}
```

```bash
k6 run smoke.js                       # локально, exit 1 при нарушении threshold
k6 run --out influxdb=http://grafana:8086/k6 load.js   # метрики в Grafana
```

**Частые ошибки конфигурации:**
1. Terratest: `defer terraform.Destroy` после `t.Fatal` внутри ассертов — работает, но если Destroy сам в тесте до ассертов — утечка ресурсов при падении apply. Паттерн: `defer` сразу после Options.
2. Molecule: `shell`/`command` задачи без `changed_when` → idempotence всегда красная (или всегда зелёная — оба случая бессмысленны).
3. k6: thresholds без тегов на общий `http_req_duration` при смешанном трафике (health-check'и улучшают картину) → вешайте `tags: { name: 'api' }` и threshold на тег.
4. Нагрузочный тест из CI-runner'а на 2 vCPU → упор в генератор, а не в тестируемое: RPS-потолок ложный. Для серьёзных прогонов — k6 cloud или отдельные генераторы.
5. Terratest на каждый PR → счёт за AWS и 40-минутные пайплайны. Правильно: static на PR, Terratest — nightly + на тег.

---

### 2.3 Troubleshooting

```bash
# Terratest: почему apply упал?
go test -run TestS3Module -v 2>&1 | tee terratest.log
#  terraform apply: Error: creating bucket ... BucketAlreadyExists → уникальность имён!
#  Стейджи: SKIP_stage / SKIP_teardown для отладки (см. test_structure)

# Molecule: что именно сломалось на этапе idempotence?
molecule converge && molecule idempotence
#  Вывод покажет задачу с changed=1 — вот неидемпотентная задача

# Molecule: контейнер не стартует / нет docker
molecule --debug create 2>&1 | grep -iE "docker|error"
docker ps -a | grep nginx-ubuntu     # контейнер остался? зайти: molecule login --host nginx-ubuntu

# k6: упор в генератор?
k6 run --verbose load.js 2>&1 | grep -E "iterations|data_received"
ulimit -n                            # < 10000 → упрётесь в сокеты: ulimit -n 65536
#  metric iteration_duration растёт, а на сервере CPU низкий → виноват генератор
```

**Топ проблем:**

| Симптом | Причина | Действие |
| :--- | :--- | :--- |
| Terratest: `BucketAlreadyExists` | имя бакета неуникально | `random.UniqueId()` в имени |
| Terratest: ресурсы не уничтожились при красном тесте | Destroy не в defer / panic до него | `defer` сразу, смотреть `SKIP_teardown` |
| Molecule idempotence красный, роль «рабочая» | неидемпотентные задачи (command, uri) | `changed_when`, `creates:`, `register`+`when` |
| Molecule: `docker daemon not accessible` | CI-runner без docker.sock | монтировать socket / rootless-драйвер |
| k6 thresholds «не сработали» | threshold на не тот тег / `abortOnFail` не задан | теги + `thresholds: { …: [{…, abortOnFail: true}] }` |
| Нагрузочный тест «упал» на 5k VU | файловые дескрипторы/порты генератора | `ulimit -n`, `net.ipv4.ip_local_port_range`, несколько генераторов |

---

### 2.4 Интеграция со стеком

- **CI:** GitLab CI stages: `static (lint/conftest) → molecule (роли) → terratest (nightly, scheduled) → deploy staging → k6 smoke (гейт)`.
- **IaC:** Terratest тестирует **тот же модуль**, что едет в прод — регрессия модуля ловится до использования.
- **Observability:** k6 шлёт метрики в Prometheus (remote write) → нагрузочный тест виден на тех же дашбордах, что и прод; сравнение latency staging vs prod.
- **Chaos (след. уровень):** k6 + LitmusChaos — нагрузка при одновременном убийстве подов.

---

### 2.5 Проверь себя — 5 вопросов

**В1. Сценарий: Terratest-тест упал на ассерте после apply, но `defer terraform.Destroy` объявлен ПОСЛЕ строки с ассертом. Что произойдёт?**

<details><summary>Ответ</summary>
t.Fatal прервёт тест до выполнения defer → ресурсы останутся в облаке (утечка денег). Destroy должен объявляться defer'ом сразу после создания Options, до любых ассертов.
</details>

**В2. Найдите ошибку: в Molecule-сценарии `test_sequence` перечислены только `create, converge, verify`. Что потеряно и чем грозит?**

<details><summary>Ответ</summary>
Нет destroy/cleanup (мусорные контейнеры копятся) и нет idempotence — главная проверка качества роли: второй прогон должен давать changed=0. Также нет syntax/lint — ловятся дешёвые ошибки.
</details>

**В3. Почему k6-тест из CI-runner'а показывает максимум 800 RPS, а прод держит 5000?**

<details><summary>Ответ</summary>
Потолок генератора: 2 vCPU runner'а, лимит файловых дескрипторов/ephemeral-портов. Проверяется ростом ресурсов генератора или распределённым запуском; метрики генератора (iteration_duration растёт при плоском сервере) выдают узкое место.
</details>

**В4. Зачем `sleep(1)` в k6-сценарии, если можно гнать без пауз ради «больше RPS»?**

<details><summary>Ответ</summary>
Без пауз это closed-loop стресс открытых соединений, а не модель пользователей: искажаются очереди и латентность. sleep моделирует think-time — нагрузка становится реалистичной, p95 сопоставим с продом.
</details>

**В5. Какая проверка в Molecule ловит класс ошибок, который не ловит ни один unit-тест роли — и почему?**

<details><summary>Ответ</summary>
Idempotence: она выполняет роль повторно на живом контейнере и сравнивает изменения состояния. Unit/static-тесты анализируют код, а не эффект; только второй реальный прогон выявляет задачи, меняющие состояние каждый раз (command, шаблоны с timestamp и т.п.).
</details>

---

### 2.6 Практика — 3 задания

#### Задание 1: Terratest для модуля «S3 с версионированием»

**Условие:** модуль `modules/s3` создаёт приватный бакет с versioning; нужен интеграционный тест.

**Шаг 1** — каркас:
```bash
mkdir -p tests && cd tests
go mod init tests && go get github.com/gruntwork-io/terratest/modules@v0.46.16
```

**Шаг 2** — тест (шаблон из 2.2): ассерты — имя совпадает, `GetS3BucketVersioning == Enabled`, `GetS3BucketPolicy` запрещает не-TLS (`aws:SecureTransport`).

**Шаг 3** — прогон и гигиена:
```bash
export AWS_PROFILE=sandbox
go test -timeout 30m -v
aws s3api list-buckets --query 'Buckets[?starts_with(Name, `terratest-`)]'
# после прогона список ПУСТ — destroy отработал ✅
```

**Проверь себя:** повторный прогон зелёный (идемпотентность теста); `go test -run TestNothing` не создаёт ресурсов.

**Разбор:** ассерт через AWS SDK API (а не парсинг tfstate) проверяет фактическое состояние — именно это отличает интеграционный тест от `terraform plan`. Уникальное имя через `random.UniqueId` — защита от коллизий и чужих бакетов.

#### Задание 2: Molecule-сценарий с честной idempotence

**Условие:** роль `motd` пишет /etc/motd с hostname и датой сборки; сделать так, чтобы idempotence была зелёной.

**Шаг 1** — инициализация:
```bash
molecule init role motd --driver-name docker
cd roles/motd && molecule create
molecule list    # инстанс nginx-ubuntu → started
```

**Шаг 2** — задача с защитой от повторного изменения:
```yaml
# tasks/main.yml
- name: Render motd
  ansible.builtin.template:
    src: motd.j2
    dest: /etc/motd
    mode: "0644"
  register: motd_render
  changed_when: motd_render.diff is defined and motd_render.diff   # честный changed
```

**Шаг 3** — цикл проверки:
```bash
molecule converge && molecule idempotence
# PLAY RECAP ... changed=0 ✅
molecule verify && molecule destroy
```

**Проверь себя:** `molecule idempotence` → `changed=0`; `molecule login` → `cat /etc/motd` содержит hostname.

**Разбор:** `changed_when` по наличию diff — паттерн для template (сам модуль template уже идемпотентен; паттерн критичен для command/shell/uri). Сценарий в CI: `molecule test` целиком в job'е роли.

#### Задание 3: k6 — smoke-гейт в CI и нагрузочный профиль

**Условие:** два скрипта: `smoke.js` (гейт деплоя: 1 VU, 30s, жёсткие thresholds) и `load.js` (ramp 0→100 VU за 5 мин).

**Шаг 1** — smoke (шаблон из 2.2, `vus: 1, duration: 30s`, thresholds `p(95)<300`).

**Шаг 2** — load с профилем и тегами:
```javascript
export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 100 },   // плато
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    'http_req_duration{name:api}': ['p(95)<800'],
  },
};
export default function () {
  http.get('https://staging.shop.io/api/products', { tags: { name: 'api' } });
  sleep(0.5);
}
```

**Шаг 3** — гейт в GitLab CI:
```yaml
k6-smoke:
  stage: verify
  image: grafana/k6:latest
  script: k6 run tests/k6/smoke.js     # exit 1 при нарушении thresholds → деплой стоп
```

**Проверь себя:** `k6 run smoke.js` → `✓ checks 100%`, `http_req_duration p(95)<300 ✓`; сломайте API (404) → exit code 1.

**Разбор:** smoke — дешёвый и быстрый гейт после деплоя (ловит «приложение вообще не живо»); load — по расписанию/перед релизом. Теги + thresholds на тег отделяют API от статики в смешанном трафике.

---

*Следующая подтема: [20.5 Реестры и зависимости](05-registries-dependencies.md)*
