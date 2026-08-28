#!/usr/bin/env python3
import re, pathlib

# Patch 6 scenarios missing solutionFiles
base_path = pathlib.Path("docs/21-playground/scenarios-base.js")
mlops_path = pathlib.Path("docs/21-playground/scenarios-mlops.js")

# Define solutionFiles for each id
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

def js_escape(s):
    return s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n").replace("`","\\`").replace("${","\\${")

def patch_file(path, ids):
    text = path.read_text(encoding="utf-8")
    patched=0
    for sid, files in ids.items():
        # find the S call for this id
        # pattern: S("...","sid", ... {file:"...", files:{...}, checks:[...]},{hints:[...]});
        # we need to inject solutionFiles into the editor object (which is the 9th arg after solution)
        # locate the editor object: {file:"...", files:{...}, checks:[...]}
        # More robust: find the substring S("...","sid" and then find the next "},checks" and insert before "},{hints"
        # Use regex to find editor block without solutionFiles
        pattern = re.compile(r'(S\(".*?","'+re.escape(sid)+r'".*?\{file:"[^"]*",\s*files:\{.*?\},checks:\[.*?\]\})(\s*\},\{hints)', re.DOTALL)
        # But files contain quotes and newlines, need to handle
        # Alternative: find the exact S call block and inject solutionFiles after checks
        # Simpler: search for sid and then next occurrence of "checks:["
        m = re.search(r'S\(".*?","'+re.escape(sid)+r'"', text)
        if not m:
            print(f"not found {sid} in {path.name}")
            continue
        # from m.start, find editor object start: look for '{file:'
        start = text.find('{file:', m.start())
        # find closing of files object: we need to find matching braces for files:{...}
        # Instead, find ",checks:" after start
        checks_idx = text.find(",checks:", start)
        if checks_idx==-1:
            checks_idx = text.find("checks:", start)
        # find end of checks array: next "]" then "}"
        # Find the position of "},{hints"
        hints_idx = text.find("},{hints", checks_idx)
        before_hints = text[hints_idx-10:hints_idx+20]
        # Check if already has solutionFiles
        snippet = text[start:hints_idx+200]
        if "solutionFiles" in snippet:
            print(f"{sid} already has solutionFiles, skipping")
            continue
        # Build solutionFiles JS representation
        sol_js = ",solutionFiles:{" + ",".join(f'"{k}":`{js_escape(v)}`' for k,v in files.items()) + "}"
        # Insert before "},{hints"
        # Actually editor object ends with "}", then ",{hints" is the extra arg? Wait structure: S(..., {file:..., files:..., checks:...}, {hints:...})
        # So editor object ends at "}", then comma then "{hints..."
        # We need to insert solutionFiles inside editor object, before closing "}"
        # So find the closing "}" of editor object: it's at hints_idx (which points to "},")
        # Let's find the editor object closing brace: it's just before ",{hints"
        # So we insert sol_js before that "}"
        insert_pos = hints_idx+1  # position of "}" before ","
        # Actually hints_idx points to "},"
        # We need to insert before "}"
        # Let's construct: text[:hints_idx] + sol_js + text[hints_idx:]
        # but text[hints_idx] is "}", so we need to insert before it
        # So sol_js should be inserted at hints_idx
        new_text = text[:hints_idx] + sol_js + text[hints_idx:]
        text = new_text
        patched+=1
        print(f"patched {sid} with solutionFiles in {path.name}")
    if patched:
        path.write_text(text, encoding="utf-8")
        print(f"Wrote {path.name} with {patched} patches")
    else:
        print(f"No patches for {path.name}")

patch_file(base_path, {k:v for k,v in solutions.items() if k!="ml1b"})
patch_file(mlops_path, {"ml1b": solutions["ml1b"]})
