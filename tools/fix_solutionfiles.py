import re, pathlib

def js_escape(s):
    return s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")

solutions = {
    "crashloop": {
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
    },
    "jq-audit": {
        "query.jq": """# jq-запрос: количество подов в фазе Failed
[ .items[] | select(.status.phase=="Failed") ] | length
# также: group_by(.status.phase) для аудита
"""
    },
    "pg-conflict": {
        "fix.sql": """ALTER SYSTEM SET hot_standby_feedback = on;
SELECT pg_reload_conf();
-- проверка:
-- SHOW hot_standby_feedback; -- on
-- SELECT * FROM pg_stat_database_conflicts;
"""
    },
    "registry-push": {
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
    },
    "tf-drift": {
        "main.tf": """resource "random_pet" "server_name" {
  prefix = "web"
}
resource "local_file" "inventory" {
  filename = "${path.module}/generated/inventory.txt"
  content  = "server: ${random_pet.server_name.id}\\n"
}
"""
    },
    "ml1b": {
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

def patch_file(path, ids):
    text = path.read_text(encoding="utf-8")
    # Find all S occurrences
    # Use pattern to locate S("cat","id"
    modified = False
    for sid, files in ids.items():
        # locate S with this id
        pattern = re.compile(r'S\(".*?",\s*"'+re.escape(sid)+r'"')
        m = pattern.search(text)
        if not m:
            print(f"not found {sid} in {path.name}")
            continue
        start_search = m.start()
        # Find the editor object: look for {file: or {files: after the solution array
        # The structure is: S(..., "prompt", [commands], [solution], {editor}, {hints})
        # Find the position of ", {file" or ", {files" after start_search
        # Search for the editor object start: sequence "], {" then file/files
        # Find the last "], {" before the hints object
        # More robust: find all ", {" after m.start and pick the one that contains "files:" or "file:"
        # We can search for ", {hints" to find end
        hints_pos = text.find(",{hints", start_search)
        if hints_pos == -1:
            hints_pos = text.find(", {hints", start_search)
        if hints_pos == -1:
            print(f"hints not found for {sid}")
            continue
        # Editor object is before that: find the previous "{" that starts editor
        # Editor object starts at last occurrence of "{file:" or "{files:" before hints_pos
        # Find last "{file:" before hints_pos
        candidates = []
        for key in ["{file:", "{files:", "files:{", "file:"]:
            pos = text.rfind("{file:", start_search, hints_pos)
            if pos != -1:
                candidates.append(pos)
            pos2 = text.rfind("files:", start_search, hints_pos)
            if pos2 != -1:
                candidates.append(pos2)
        # Simpler: find the string ",checks:" which is inside editor
        checks_pos = text.rfind(",checks:", start_search, hints_pos)
        if checks_pos == -1:
            checks_pos = text.rfind("checks:", start_search, hints_pos)
        if checks_pos == -1:
            print(f"checks not found for {sid}")
            continue
        # Find the closing bracket of checks: next "]"
        bracket_end = text.find("]", checks_pos)
        # Then find the closing "}" of editor object: should be at hints_pos (which is "},")
        # The editor object ends at hints_pos, which is position of "," before "{hints"
        # Actually text at hints_pos is ",{hints" -> the preceding chars are "}"
        # So editor closing brace is at hints_pos (the "}")? Let's check: text[hints_pos] is "," then "{"...
        # The editor ends with "}", so the "}," is at hints_pos-1? Wait pattern ",{hints" means text[hints_pos]=',' , text[hints_pos+1]='{'
        # But we need to find the editor's closing "}"
        # It should be at hints_pos - 1 if the pattern is "},{hints" without space, or hints_pos-1 if ",{hints"
        # Let's locate the editor's closing brace: find "},"
        # Search backwards from hints_pos for "}"
        editor_close = text.rfind("}", start_search, hints_pos+1)
        if editor_close == -1:
            print(f"editor close not found for {sid}")
            continue
        snippet = text[editor_close-200:editor_close+200]
        if "solutionFiles" in text[start_search:hints_pos+10]:
            print(f"{sid} already has solutionFiles")
            continue
        # Build solutionFiles JS
        sol_js = ",solutionFiles:{" + ",".join(f'"{k}":`{js_escape(v)}`' for k,v in files.items()) + "}"
        # Insert before editor_close (which is the "}")
        # But we need to insert before that "}"
        new_text = text[:editor_close] + sol_js + text[editor_close:]
        text = new_text
        modified = True
        print(f"patched {sid}")
    if modified:
        path.write_text(text, encoding="utf-8")
        print(f"wrote {path.name}")

base_path = pathlib.Path("docs/21-playground/scenarios-base.js")
mlops_path = pathlib.Path("docs/21-playground/scenarios-mlops.js")
patch_file(base_path, {k:v for k,v in solutions.items() if k != "ml1b"})
patch_file(mlops_path, {"ml1b": solutions["ml1b"]})
