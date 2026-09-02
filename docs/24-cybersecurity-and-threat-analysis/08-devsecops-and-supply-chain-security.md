# 🔄 08. DevSecOps и Безопасность Цепочки Поставок (Supply Chain)

> Уровень: Senior DevSecOps / Lead Infrastructure / Security Architect  
> Цель: Выстроить сквозной конвейер безопасной разработки (Shift-Left Security: SAST, DAST, SCA, Secrets Detection), нейтрализовать атаки на цепочку поставок (Dependency Confusion, Typosquatting, SolarWinds-style компрометации), внедрить стандарты SLSA Framework, генерацию SBOM (CycloneDX/SPDX) и цифровую подпись артефактов Sigstore Cosign.

---

### 1. Shift-Left Security: Пайплайн Безопасности CI/CD

Концепция **Shift-Left** переносит практики безопасности с поздних этапов эксплуатации на самые ранние стадии написания кода и сборки.

```mermaid
flowchart LR
    subgraph CI["CI/CD Pipeline с встроенной безопасностью (DevSecOps)"]
        direction TB
        Code["1. Код (IDE / Commit)<br/>(Pre-commit: Gitleaks, Checkov)"] --> SAST["2. SAST & SCA<br/>(Semgrep, SonarQube, Trivy)"]
        SAST --> Build["3. Hermetic Build (SLSA L3)<br/>(Изолированный Runner)"]
        Build --> Sign["4. Sign & Attest<br/>(Sigstore Cosign + in-toto)"]
        Sign --> DAST["5. DAST & IAST (Staging)<br/>(OWASP ZAP Dynamic Scan)"]
        DAST --> Deploy["6. Deploy to K8s<br/>(Kyverno Admission Verification)"]
    end
    style CI fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
```

#### Матрица инструментов тестирования безопасности

| Категория | Инструменты | Фаза внедрения | Что обнаруживает |
| :--- | :--- | :--- | :--- |
| **Secrets Scanning** | Gitleaks, TruffleHog | Pre-commit / PR Hook | Захардкоженные токены, API-ключи, приватные SSH/TLS ключи |
| **SAST** (Static Analysis) | Semgrep, SonarQube | CI Pull Request | SQLi, XSS, небезопасные десериализации, Buffer Overflow в коде |
| **SCA** (Software Composition) | Trivy, Snyk, Grype | CI Build Phase | Известные CVE в зависимостях (`package.json`, `go.mod`, `pom.xml`) |
| **Container Scanning** | Trivy, Clair, Docker Scout | CI Image Registry | Уязвимости базовых OS-пакетов (glibc, openssl) и конфигурации |
| **DAST** (Dynamic Analysis) | OWASP ZAP, Nuclei | QA / Staging Environment | Уязвимости развернутого сервиса (Header checks, Auth bypass, SSRF) |

---

### 2. Угрозы цепочке поставок ПО (Software Supply Chain Attacks)

```mermaid
flowchart TD
    subgraph SupplyChainThreats["Векторы атак на цепочку поставок"]
        DepConf["1. Dependency Confusion<br/>(Публикация пакета с внутренним именем в public npm/PyPI)"]
        Typo["2. Typosquatting<br/>(Создание пакета с опечаткой: cross-env vs crossenv)"]
        AccHijack["3. Maintainer Account Takeover<br/>(Кража 2FA/токена мейнтейнера популярной библиотеки)"]
        RunnerComp["4. CI/CD Runner Poisoning<br/>(Модификация артефакта в памяти билдера: кейс SolarWinds)"]
    end

    subgraph DefenseMitigations["Защитные Слои"]
        ScopedReg["Scoped Packages (@corp/pkg) & Private Proxy (Nexus/Artifactory)"]
        Lockfiles["Хэширование lock-файлов (npm-shrinkwrap, poetry.lock)"]
        MFAEnforce["2FA/FIDO2 для репозиториев пакетов + Код-ревью в 4 глаза"]
        SLSA["SLSA Level 3/4 + Cosign Keyless Signing + Kyverno Policy"]
    end

    DepConf --> ScopedReg
    Typo --> Lockfiles
    AccHijack --> MFAEnforce
    RunnerComp --> SLSA

    style SupplyChainThreats fill:#2d1b2e,stroke:#f38ba8,stroke-width:2px,color:#fff
    style DefenseMitigations fill:#1e293b,stroke:#a6e3a1,stroke-width:2px,color:#fff
```

#### Анатомия атаки SolarWinds (Sunburst):
Злоумышленники получили доступ к билд-системе Orion и внедрили вредоносный процесс, который на лету подменял исходные файлы C# во время компиляции перед подписанием легитимным сертификатом разработчика.
- **Урок для индустрии:** Сборка должна быть воспроизводимой (Reproducible Builds), выполняться в эфемерных герметичных контейнерах без доступа к интернету, а артефакты должны иметь криптографическую аттестацию происхождения (Provenance).

---

### 3. Фреймворк SLSA (Supply-chain Levels for Software Artifacts)

SLSA определяет уровни зрелости безопасности цепочки поставок:

| Уровень SLSA | Требования к сборке | Предотвращаемые риски |
| :--- | :--- | :--- |
| **SLSA 1** | Автоматизированный скрипт сборки в VCS, генерация базового Provenance | Ошибки ручной сборки "с ноутбука" |
| **SLSA 2** | Использование доверенного хостинга CI/CD (GitHub Actions, GitLab CI), цифровая подпись Provenance | Подделка метаданных сборки |
| **SLSA 3** | Изолированная среда сборки (Ephemeral Runners), защита истории Git, Provenance генерируется доверенным сервисом | Модификация кода во время сборки сторонними процессами |
| **SLSA 4** | Двухфакторное ревью кода (Two-party review), герметичные и воспроизводимые сборки (Hermetic & Reproducible) | Саботаж со стороны одного разработчика, инъекции в билдере |

---

### 4. Генерация SBOM (Software Bill of Materials) и VEX

**SBOM** — это полный машиночитаемый паспорт всех компонентов, лицензий и транзитивных зависимостей в приложении.

```bash
# Генерация SBOM контейнера в формате CycloneDX JSON с помощью Syft
syft packages app-backend:v1.2.0 -o cyclonedx-json=sbom.cdx.json

# Генерация SBOM в формате SPDX JSON
syft packages app-backend:v1.2.0 -o spdx-json=sbom.spdx.json

# Сканирование сгенерированного SBOM на уязвимости с помощью Trivy
trivy sbom sbom.cdx.json --severity HIGH,CRITICAL
```

---

### 5. Криптографическая подпись артефактов: Sigstore Cosign

**Cosign** позволяет подписывать контейнерные образы, SBOM и аттестации Provenance без необходимости долгосрочного хранения приватных ключей (Keyless Signing) с использованием протокола OIDC и прозрачного журнала **Rekor**.

```mermaid
sequenceDiagram
    autonumber
    actor CI as CI/CD Runner (GitHub Actions)
    participant Fulcio as Fulcio (CA Сертификатов)
    participant OIDC as OIDC Provider (GitHub/GitLab)
    participant Rekor as Rekor (Immutable Transparency Log)
    participant Registry as OCI Container Registry

    CI->>OIDC: 1. Запрос эфемерного OIDC JWT токена
    OIDC-->>CI: 2. JWT с идентификатором репозитория
    CI->>Fulcio: 3. Запрос краткосрочного x509 сертификата (10 минут)
    Fulcio-->>CI: 4. Выпуск сертификата, привязанного к Identity
    CI->>Rekor: 5. Запись хэша и подписи в публичный журнал
    CI->>Registry: 6. Пуш подписи (image.sig) рядом с образом
```

#### Команды генерации и верификации подписи:

```bash
# 1. Keyless подпись образа контейнера в GitHub Actions
cosign sign --yes ghcr.io/org/app-backend:v1.2.0

# 2. Прикрепление SBOM как подписанного аттестата к образу
cosign attest --yes --predicate sbom.cdx.json --type cyclonedx ghcr.io/org/app-backend:v1.2.0

# 3. Верификация подписи образа перед развертыванием
cosign verify ghcr.io/org/app-backend:v1.2.0 \
  --certificate-identity-regexp "https://github.com/org/app-backend/.*" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com"
```

---

### 6. Контроль целостности в Kubernetes: Политика Kyverno

Политика Admission Controller блокирует запуск любых подов, чьи образы не подписаны официальным ключом компании:

```yaml
# /k8s/kyverno-verify-images.yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: check-image-signatures
spec:
  validationFailureAction: Enforce
  background: false
  rules:
  - name: verify-signature-rule
    match:
      any:
      - resources:
          kinds:
          - Pod
    verifyImages:
    - imageReferences:
      - "ghcr.io/org/*"
      attestors:
      - entries:
        - keyless:
            issuer: "https://token.actions.githubusercontent.com"
            subject: "https://github.com/org/*"
            rekor:
              url: "https://rekor.sigstore.dev"
```

---

### 7. Практический пайплайн: GitLab CI DevSecOps Stage

```yaml
# .gitlab-ci.yml
stages:
  - test
  - security
  - build
  - sign

semgrep-sast:
  stage: security
  image: returntocorp/semgrep
  script:
    - semgrep scan --config auto --json -o semgrep-results.json --error
  artifacts:
    reports:
      sast: semgrep-results.json

trivy-sca:
  stage: security
  image: aquasec/trivy:latest
  script:
    - trivy fs --exit-code 1 --severity HIGH,CRITICAL --ignore-unfixed .

gitleaks-secrets:
  stage: security
  image: zricethezav/gitleaks:latest
  script:
    - gitleaks detect --verbose --redact
```
