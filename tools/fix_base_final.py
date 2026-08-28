import re, pathlib

# Correct editor definitions for base scenarios
editors = {
    "crashloop": {
        "file": "deploy.yaml",
        "files": {
            "deploy.yaml": """apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: shop
spec:
  replicas: 2
  selector:
    matchLabels: { app: api }
  template:
    metadata:
      labels: { app: api }
    spec:
      containers:
        - name: web
          image: registry.corp/api:2.4.0
          env:
            - name: REQUIRED_DB_URL     # <-- значение не задано!
          ports:
            - containerPort: 8080"""
        },
        "checks": [
            {"re": r"REQUIRED_DB_URL[\s\S]{0,200}value:\s*\S+", "l": "REQUIRED_DB_URL задан"}
        ],
        "solutionFiles": {
            "deploy.yaml": """apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: shop
spec:
  replicas: 2
  selector:
    matchLabels: { app: api }
  template:
    metadata:
      labels: { app: api }
    spec:
      containers:
        - name: web
          image: registry.corp/api:2.4.0
          env:
            - name: REQUIRED_DB_URL
              value: postgres://api:secret@pg.prod.svc:5432/shop
          ports:
            - containerPort: 8080
"""
        }
    },
    "registry-push": {
        "file": "Dockerfile",
        "files": {
            "Dockerfile": """FROM golang:1.23-alpine AS b
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /srv ./src
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=b /srv /server
USER nonroot
EXPOSE 8080
ENTRYPOINT ["/server"]"""
        },
        "checks": [
            {"re": r"FROM\s+\S+\s+AS\s+", "l": "multi-stage сборка"},
            {"re": r"distroless", "l": "минимальный runtime-образ"}
        ],
        "solutionFiles": {
            "Dockerfile": """FROM golang:1.23-alpine AS b
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /srv ./src
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=b /srv /server
USER nonroot
EXPOSE 8080
ENTRYPOINT ["/server"]
"""
        }
    },
    "tf-drift": {
        "file": "main.tf",
        "files": {
            "main.tf": """resource "random_pet" "server_name" {
  prefix = "web"
}
resource "local_file" "inventory" {
  filename = "${path.module}/generated/inventory.txt"
  content  = "server: ${random_pet.server_name.id}\\n"
}"""
        },
        "checks": [
            {"re": r"random_pet\.server_name\.id", "l": "inventory генерируется из IaC"}
        ],
        "solutionFiles": {
            "main.tf": """resource "random_pet" "server_name" {
  prefix = "web"
}
resource "local_file" "inventory" {
  filename = "${path.module}/generated/inventory.txt"
  content  = "server: ${random_pet.server_name.id}\\n"
}
"""
        }
    }
}

# ml1b editor
ml_editor = {
    "file": "docker-compose.yml",
    "files": {
        "docker-compose.yml": """services:
  mlflow:
    image: ghcr.io/mlflow/mlflow:v2.14.1
    command: mlflow server --host 0.0.0.0 --port 5000
    environment:
      BACKEND_STORE_URI: sqlite:///mlflow.db   # <-- ошибка: sqlite в контейнере
      ARTIFACT_ROOT: /mlruns                   # <-- ошибка: локальный диск
    ports: ["5000:5000"]"""
    },
    "checks": [
        {"re": r"postgres:\/\/", "l": "BACKEND_STORE_URI на PostgreSQL"},
        {"re": r"s3:\/\/", "l": "ARTIFACT_ROOT на S3"}
    ],
    "solutionFiles": {
        "docker-compose.yml": """services:
  mlflow:
    image: ghcr.io/mlflow/mlflow:v2.14.1
    command: mlflow server --host 0.0.0.0 --port 5000
    environment:
      BACKEND_STORE_URI: postgresql://mlflow:secret@pg:5432/mlflow
      ARTIFACT_ROOT: s3://mlflow-artifacts/
    ports: ["5000:5000"]
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
"""
    }
}

def js_escape(s):
    return s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")

def editor_to_js(editor):
    parts=[]
    parts.append(f'file:"{editor["file"]}"')
    # files
    files_js = ",".join(f'"{k}":`{js_escape(v)}`' for k,v in editor["files"].items())
    parts.append(f'files:{{{files_js}}}')
    # checks
    if "checks" in editor:
        checks_js = ",".join(f'{{re:/{c["re"]}/,l:"{c["l"]}"}}' for c in editor["checks"])
        # need to handle regex escaping? keep as is
        parts.append(f'checks:[{checks_js}]')
    if "solutionFiles" in editor:
        sol_js = ",".join(f'"{k}":`{js_escape(v)}`' for k,v in editor["solutionFiles"].items())
        parts.append(f'solutionFiles:{{{sol_js}}}')
    return "{" + ",".join(parts) + "}"

def patch_file(path, editors_dict):
    text = path.read_text(encoding="utf-8")
    for sid, editor in editors_dict.items():
        # Find S call start
        m = re.search(r'S\(".*?",\s*"'+re.escape(sid)+r'"', text)
        if not m:
            print(f"not found {sid}")
            continue
        start = m.start()
        # Find the editor object: search for "{file:" after start, before next S or hints
        # Find the position of "{file:" after start
        # The editor object is the 5th argument after solution array, before hints object
        # Structure: S(..., "prompt", [commands], [solution], {editor}, {hints})
        # So we can find the editor by locating the nth occurrence of "], {"
        # Simpler: find the substring ",{hints" and then find the matching "{" that starts editor
        hints_pos = text.find(",{hints", start)
        if hints_pos == -1:
            hints_pos = text.find(", {hints", start)
        if hints_pos == -1:
            print(f"hints not found for {sid}")
            continue
        # Find editor start: last occurrence of "{file:" before hints_pos
        editor_start = text.rfind("{file:", start, hints_pos)
        if editor_start == -1:
            # maybe editor has no file but start with {files: or {file?
            editor_start = text.rfind("{", start, hints_pos)
            # find the one that contains "files:"
            # search backwards for "files:"
            files_pos = text.rfind("files:", start, hints_pos)
            if files_pos != -1:
                # find opening brace before it
                editor_start = text.rfind("{", start, files_pos)
        if editor_start == -1:
            print(f"editor start not found for {sid}")
            continue
        # Find matching closing brace for editor object
        # Need to handle nested braces for files:{...} and checks:[...] and solutionFiles:{...}
        depth=0
        in_btick=False
        in_str=False
        str_char=""
        editor_end=-1
        i=editor_start
        while i < len(text):
            c=text[i]
            if in_btick:
                if c=="`" and text[i-1]!="\\":
                    in_btick=False
                i+=1
                continue
            if in_str:
                if c==str_char and text[i-1]!="\\":
                    in_str=False
                i+=1
                continue
            if c=="`":
                in_btick=True
            elif c in ('"', "'"):
                in_str=True
                str_char=c
            elif c=="{":
                depth+=1
            elif c=="}":
                depth-=1
                if depth==0:
                    editor_end=i
                    break
            i+=1
        if editor_end==-1:
            print(f"editor end not found for {sid}")
            continue
        # Replace editor object
        new_editor_js = editor_to_js(editor)
        # Check if already has solutionFiles and checks? we will replace anyway
        old_len = editor_end - editor_start + 1
        new_text = text[:editor_start] + new_editor_js + text[editor_end+1:]
        text = new_text
        print(f"patched {sid} at {editor_start}->{editor_end} old_len {old_len} new_len {len(new_editor_js)}")
    path.write_text(text, encoding="utf-8")
    print(f"wrote {path}")

# Patch base file for 3 missing (crashloop, registry-push, tf-drift) - jq-audit and pg-conflict already have solFiles?
# Actually jq-audit already has solFiles after previous patch, and pg-conflict has too, but we should ensure all have correct
# Let's patch all 5 to be safe, but only those 3 are missing
patch_file(pathlib.Path("docs/21-playground/scenarios-base.js"), {k:editors[k] for k in ["crashloop","registry-push","tf-drift"]})
# Patch mlops for ml1b
patch_file(pathlib.Path("docs/21-playground/scenarios-mlops.js"), {"ml1b": ml_editor})
