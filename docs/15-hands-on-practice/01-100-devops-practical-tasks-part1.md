# 🧪 100 Практических задач для DevOps: Часть 1 (Задачи 1–50)

---

## 🐧 Раздел 1: Linux CLI, Bash и Траблшутинг ОС (Задачи 1–15)

### Задача 1: Анализ Nginx логов на Bash
**Условие:** Найти топ-5 IP адресов с наибольшим количеством 5xx ошибок за последний час в `/var/log/nginx/access.log`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>awk</code>, <code>nginx</code>, <code>access.log</code>, <code>sort</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(awk|nginx|access\.log|sort)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
awk '$9 ~ /^5/ {print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -n 5
```


</details>
### Задача 2: Поиск процесса, удерживающего удаленный файл
**Условие:** Диск переполнен на 100%, но `du -sh /*` не находит больших файлов. Найти процессы с удаленными открытыми дескрипторами и обнулить их.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>lsof</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(lsof)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
# 1. Поиск удаленных файлов с открытыми FD
lsof +L1

# 2. Обнуление дескриптора без перезапуска сервиса (где PID=1234, FD=4)
> /proc/1234/fd/4
```


</details>
### Задача 3: Защита скрипта от параллельного запуска через `flock`
**Условие:** Написать заголовок Bash-скрипта для cron, исключающий запуск второй копии.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>set</code>, <code>euo</code>, <code>pipefail</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(set|euo|pipefail)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
#!/usr/bin/env bash
set -euo pipefail
exec 200>/var/lock/backup_task.lock
flock -n 200 || { echo "Скрипт уже работает!"; exit 1; }
```


</details>
### Задача 4: Массовая замена домена во всех конфигах
**Условие:** Заменить во всех файлах `.env` в каталоге `/opt/apps` старый домен `old-api.internal` на `new-api.internal` с созданием бэкапа.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>find</code>, <code>exec</code>, <code>sed</code>, <code>i.bak</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(find|exec|sed|i\.bak)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
find /opt/apps -name "*.env" -type f -exec sed -i.bak 's|old-api\.internal|new-api\.internal|g' {} +
```


</details>
### Задача 5: Перехват HTTP трафика по конкретному URL через `tcpdump`
**Условие:** Перехватить на интерфейсе `eth0` только HTTP POST запросы к `/api/v1/checkout`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>sudo</code>, <code>tcpdump</code>, <code>eth0</code>, <code>tcp</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(sudo|tcpdump|eth0|tcp)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
sudo tcpdump -i eth0 -nn -A -s 0 'tcp port 80 and (((ip[2:2] - ((ip[0]&0xf)<<2)) - ((tcp[12:2]&0xf0)>>2)) != 0)' | grep -E "POST /api/v1/checkout"
```


</details>
### Задача 6: Проверка валидности и срока истечения SSL сертификата
**Условие:** Одной командой через OpenSSL узнать дату окончания сертификата на удаленном сервере.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>echo</code>, <code>openssl</code>, <code>s_client</code>, <code>servername</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(echo|openssl|s_client|servername)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
echo | openssl s_client -servername api.company.com -connect api.company.com:443 2>/dev/null | openssl x509 -noout -dates
```


</details>
### Задача 7: Подсчет суммарного объема RAM, занятого всеми процессами `php-fpm`
**Условие:** Рассчитать точный объем физической памяти (RSS в МБ), потребляемый пулом PHP.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>php-fpm</code>, <code>rss</code>, <code>awk</code>, <code>sum</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(php\-fpm|rss|awk|sum)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
ps -C php-fpm -o rss= | awk '{sum += $1} END {print "Total PHP-FPM RAM:", sum/1024, "MB"}'
```


</details>
### Задача 8: Трассировка системных вызовов зависшего процесса
**Условие:** Процесс с PID 5432 завис в 100% CPU. Посмотреть, какие системные вызовы он выполняет в реальном времени.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>sudo</code>, <code>strace</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(sudo|strace)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
sudo strace -p 5432 -f -tt -T -s 512
```


</details>
### Задача 9: Создание systemd сервиса с авто-перезапуском и лимитами
**Условие:** Написать unit-файл `/etc/systemd/system/node-app.service` для запуска от пользователя `nodeapp` с лимитом файлов 65535.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>Unit</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(Unit)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```ini
[Unit]
Description=NodeJS Backend Service
After=network.target

[Service]
Type=simple
User=nodeapp
WorkingDirectory=/opt/node-app
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5s
LimitNOFILE=65535
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```


</details>
### Задача 10: Парсинг сложного JSON через `jq`
**Условие:** Из вывода JSON извлечь список `ip_address` только тех серверов, у которых `status == "active"` и `tier == "frontend"`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>curl</code>, <code>internal-cmdb</code>, <code>servers</code>, <code>select</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(curl|internal\-cmdb|servers|select)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
curl -s http://internal-cmdb/api/servers | jq -r '.servers[] | select(.status == "active" and .tier == "frontend") | .ip_address'
```


</details>
### Задача 11: Безопасное удаление старых бэкапов старше 30 дней
**Условие:** Удалить архивы `.tar.gz` в `/mnt/backups` старше 30 дней с логированием удаленных файлов.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>find</code>, <code>mnt</code>, <code>backups</code>, <code>tar.gz</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(find|mnt|backups|tar\.gz)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
find /mnt/backups -type f -name "*.tar.gz" -mtime +30 -print -delete >> /var/log/backup_cleanup.log
```


</details>
### Задача 12: Мониторинг входящей скорости сети через CLI
**Условие:** Замерить скорость входящего трафика на интерфейсе `eth0` за 5 секунд.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>cat</code>, <code>class</code>, <code>net</code>, <code>eth0</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(cat|class|net|eth0)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
R1=$(cat /sys/class/net/eth0/statistics/rx_bytes)
sleep 5
R2=$(cat /sys/class/net/eth0/statistics/rx_bytes)
echo "$(( (R2 - R1) / 5 / 1024 )) KB/s"
```


</details>
### Задача 13: Настройка правила iptables для защиты от брутфорса SSH
**Условие:** Блокировать IP адрес на 10 минут, если за 60 секунд было более 4 попыток подключения к порту 22.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>iptables</code>, <code>INPUT</code>, <code>tcp</code>, <code>dport</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(iptables|INPUT|tcp|dport)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set --name SSH_ATTEMPTS
iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 4 --name SSH_ATTEMPTS -j DROP
```


</details>
### Задача 14: Проверка MTU на пути к серверу без фрагментации
**Условие:** Определить точный размер пакета, проходящего без фрагментации до `8.8.8.8`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>ping</code>, <code>ICMP</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(ping|ICMP)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
ping -c 2 -M do -s 1472 8.8.8.8 # 1472 + 28 байт заголовков IP/ICMP = 1500 байт
```


</details>
### Задача 15: Восстановление сетевого доступа при сбое DNS
**Условие:** Сервер не резолвит внешние имена. Быстро восстановить DNS без перезагрузки.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>echo</code>, <code>nameserver</code>, <code>nnameserver</code>, <code>sudo</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(echo|nameserver|nnameserver|sudo)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
echo -e "nameserver 1.1.1.1\nnameserver 8.8.8.8" | sudo tee /etc/resolv.conf
```

---


</details>
## 🐍 Раздел 2: Python и Go для DevOps (Задачи 16–25)

### Задача 16: Python скрипт проверки доступности URL с ретраями
**Условие:** Написать скрипт на Python, который пингует список эндпоинтов и шлет алерт при 3 неудачных попытках.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>import</code>, <code>requests</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(import|requests)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```python
import requests
import time

ENDPOINTS = ["https://api.company.com/healthz", "https://auth.company.com/healthz"]

def check_endpoints():
    for url in ENDPOINTS:
        for attempt in range(3):
            try:
                res = requests.get(url, timeout=3)
                if res.status_code == 200:
                    break
            except Exception as e:
                if attempt == 2:
                    print(f"🚨 ALERT: {url} is DOWN! Error: {e}")
                time.sleep(1)

if __name__ == "__main__":
    check_endpoints()
```


</details>
### Задача 17: Go утилита для параллельного сканирования открытых портов
**Условие:** Написать на Go параллельный сканер TCP портов (от 1 до 1024) на указанном хосте.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>package</code>, <code>main</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(package|main)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```go
package main

import (
	"fmt"
	"net"
	"sync"
	"time"
)

func main() {
	target := "scanme.nmap.org"
	var wg sync.WaitGroup

	for port := 1; port <= 1024; port++ {
		wg.Add(1)
		go func(p int) {
			defer wg.Done()
			address := fmt.Sprintf("%s:%d", target, p)
			conn, err := net.DialTimeout("tcp", address, 1*time.Second)
			if err == nil {
				conn.Close()
				fmt.Printf("✅ Port %d is OPEN\n", p)
			}
		}(port)
	}
	wg.Wait()
}
```


</details>
### Задача 18: Python скрипт поиска нетегированных Docker образов
**Условие:** Использовать `docker` SDK для Python и удалить все dangling-образы.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>import</code>, <code>docker</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(import|docker)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```python
import docker

client = docker.from_env()
dangling_images = client.images.list(filters={"dangling": True})
for img in dangling_images:
    print(f"Removing {img.id}...")
    client.images.remove(image=img.id, force=True)
```


</details>
### Задача 19: Go утилита генерации Kubernetes ConfigMap из локальной директории
**Условие:** Прочитать все `.yaml` файлы в каталоге и сгенерировать единый K8s ConfigMap манифест.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>package</code>, <code>main</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(package|main)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```go
package main

import (
	"fmt"
	"os"
	"path/filepath"
)

func main() {
	files, _ := filepath.Glob("configs/*.conf")
	fmt.Println("apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: app-configs\ndata:")
	for _, f := range files {
		content, _ := os.ReadFile(f)
		fmt.Printf("  %s: |\n", filepath.Base(f))
		fmt.Printf("    %s\n", string(content))
	}
}
```


</details>
### Задача 20: Python скрипт для ротации и сжатия старых логов
**Условие:** Найти все `.log` файлы в `/var/log/custom`, заархивировать их в `gzip` и переименовать с добавлением даты.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>import</code>, <code>gzip</code>, <code>shutil</code>, <code>datetime</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(import|gzip|shutil|datetime)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```python
import os, gzip, shutil, datetime

LOG_DIR = "/var/log/custom"
today = datetime.date.today().strftime("%Y-%m-%d")

for f in os.listdir(LOG_DIR):
    if f.endswith(".log"):
        src = os.path.join(LOG_DIR, f)
        dst = os.path.join(LOG_DIR, f"{f}.{today}.gz")
        with open(src, 'rb') as f_in, gzip.open(dst, 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)
        os.remove(src)
        print(f"Compressed {src} -> {dst}")
```


</details>
### Задача 21: Go HTTP Healthcheck сервер для K8s StartupProbe
**Условие:** Написать легковесный Go-сервер, который возвращает 503 первые 10 секунд после старта, а затем 200 OK.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>package</code>, <code>main</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(package|main)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```go
package main

import (
	"net/http"
	"time"
)

func main() {
	startTime := time.Now()
	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		if time.Since(startTime) < 10*time.Second {
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte("Warming up..."))
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})
	http.ListenAndServe(":8080", nil)
}
```


</details>
### Задача 22: Python скрипт парсинга метрик Prometheus и отправки в Telegram
**Условие:** Запросить Prometheus API, найти средний CPU Load по кластеру и, если он $> 80\%$, отправить алерт в Telegram.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>import</code>, <code>requests</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(import|requests)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```python
import requests

PROM_URL = "http://prometheus.monitoring:9090/api/v1/query"
QUERY = 'avg(100 - (rate(node_cpu_seconds_total{mode="idle"}[5m]) * 100))'
BOT_TOKEN = "123:TOKEN"
CHAT_ID = "-100123"

res = requests.get(PROM_URL, params={'query': QUERY}).json()
cpu_val = float(res['data']['result'][0]['value'][1])

if cpu_val > 80.0:
    msg = f"🚨 High Cluster CPU: {cpu_val:.2f}%"
    requests.post(f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage", data={'chat_id': CHAT_ID, 'text': msg})
```


</details>
### Задача 23: Go CLI с флагами на базе `flag`
**Условие:** Написать CLI утилиту, принимающую флаги `--env` (stage/prod) и `--replicas` (int).  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>package</code>, <code>main</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(package|main)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```go
package main

import (
	"flag"
	"fmt"
)

func main() {
	env := flag.String("env", "staging", "Target deployment environment")
	replicas := flag.Int("replicas", 1, "Number of pod replicas")
	flag.Parse()

	fmt.Printf("Deploying to %s with %d replicas\n", *env, *replicas)
}
```


</details>
### Задача 24: Python скрипт для очистки неиспользуемых дисков в облаке
**Условие:** Найти в AWS все EBS диски в статусе `available` и вывести суммарный объем.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>import</code>, <code>boto3</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(import|boto3)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```python
import boto3

ec2 = boto3.client('ec2', region_name='eu-central-1')
vols = ec2.describe_volumes(Filters=[{'Name': 'status', 'Values': ['available']}])['Volumes']
total_gb = sum(v['Size'] for v in vols)
print(f"Found {len(vols)} unattached volumes totaling {total_gb} GB")
```


</details>
### Задача 25: Go скрипт проверки целостности JSON файлов
**Условие:** Обойти директорию и проверить, что все файлы `.json` синтаксически валидны.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>package</code>, <code>main</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(package|main)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```go
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

func main() {
	filepath.Walk(".", func(path string, info os.FileInfo, err error) error {
		if filepath.Ext(path) == ".json" {
			data, _ := os.ReadFile(path)
			var js map[string]interface{}
			if err := json.Unmarshal(data, &js); err != nil {
				fmt.Printf("❌ Invalid JSON in %s: %v\n", path, err)
			}
		}
		return nil
	})
}
```

---


</details>
## 🐳 Раздел 3: Docker & Контейнеризация (Задачи 26–35)

### Задача 26: Написание hardened Dockerfile для Python FastAPI
**Условие:** Написать Multi-Stage Dockerfile для FastAPI, запускающийся от non-root пользователя UID 10001.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>python</code>, <code>slim</code>, <code>builder</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(python|slim|builder)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
RUN useradd -u 10001 -m appuser
COPY --from=builder /root/.local /home/appuser/.local
COPY --chown=appuser:appuser . .
USER 10001:10001
ENV PATH=/home/appuser/.local/bin:$PATH
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```


</details>
### Задача 27: Ограничение ресурсов контейнера в Docker Compose
**Условие:** Написать сервис в `docker-compose.yml` с жестким лимитом 512M памяти и 1.5 CPU.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>services</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(services)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
services:
  web:
    image: nginx:alpine
    deploy:
      resources:
        limits:
          cpus: '1.5'
          memory: 512M
        reservations:
          memory: 256M
```


</details>
### Задача 28: Настройка Docker Healthcheck с авто-перезапуском
**Условие:** Добавить проверку здоровья в Dockerfile с интервалом 10с и таймаутом 3с.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>HEALTHCHECK</code>, <code>interval</code>, <code>timeout</code>, <code>retries</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(HEALTHCHECK|interval|timeout|retries)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```dockerfile
HEALTHCHECK --interval=10s --timeout=3s --retries=3 --start-period=5s \
  CMD curl -f http://localhost:8080/healthz || exit 1
```


</details>
### Задача 29: Настройка логирования в Docker с ротацией логов (json-file)
**Условие:** Настроить Docker daemon (`/etc/docker/daemon.json`) так, чтобы логи контейнеров не превышали 50 МБ (3 файла).  
<details>
<summary>👁 <b>Показать решение</b></summary>

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "3"
  }
}
```


</details>
### Задача 30: Создание кастомной изолированной bridge-сети
**Условие:** Создать изолированную Docker-сеть с подсетью `172.28.0.0/16` и запретом выхода в интернет.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>docker</code>, <code>create</code>, <code>driver</code>, <code>bridge</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(docker|create|driver|bridge)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
docker network create --driver bridge --subnet 172.28.0.0/16 --internal secure-backend-net
```


</details>
### Задача 31: Экспорт и сохранение Docker образа в `.tar` архив
**Условие:** Сохранить образ `my-app:v1.0.0` в сжатый файл для переноса на закрытый контур без интернета.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>docker</code>, <code>save</code>, <code>my-app</code>, <code>v1.0.0</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(docker|save|my\-app|v1\.0\.0)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
docker save my-app:v1.0.0 | gzip > my-app-v1.0.0.tar.gz
# Загрузка на целевом сервере:
docker load < my-app-v1.0.0.tar.gz
```


</details>
### Задача 32: Запуск контейнера с монтированием Secret через RAM (`tmpfs`)
**Условие:** Смонтировать файл с секретом в `/run/secrets` так, чтобы он не записывался на физический диск.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>docker</code>, <code>run</code>, <code>secure-app</code>, <code>tmpfs</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(docker|run|secure\-app|tmpfs)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
docker run -d --name secure-app --tmpfs /run/secrets:rw,noexec,nosuid,size=10m my-app:latest
```


</details>
### Задача 33: Очистка неиспользуемых Docker ресурсов одной командой
**Условие:** Удалить все остановленные контейнеры, неиспользуемые тома и dangling-образы.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>docker</code>, <code>system</code>, <code>prune</code>, <code>volumes</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(docker|system|prune|volumes)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
docker system prune -a --volumes -f
```


</details>
### Задача 34: Проброс SSH ключа в Dockerfile при сборке через BuildKit
**Условие:** Безопасно клонировать приватный репозиторий в Dockerfile без сохранения SSH ключа в слои образа.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>alpine</code>, <code>git</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(alpine|git)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```dockerfile
# syntax=docker/dockerfile:1.4
FROM alpine/git
RUN --mount=type=ssh git clone git@github.com:company/private-repo.git /src
```
```bash
DOCKER_BUILDKIT=1 docker build --ssh default .
```


</details>
### Задача 35: Исследование слоев Docker образа через Dive
**Условие:** Найти слои, содержащие дубликаты и неэффективные файлы.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>docker</code>, <code>run</code>, <code>docker.sock</code>, <code>wagoodman</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(docker|run|docker\.sock|wagoodman)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock wagoodman/dive:latest my-app:v1.0.0
```

---


</details>
## ☸️ Раздел 4: Kubernetes Манифесты & Траблшутинг (Задачи 36–50)

### Задача 36: Манифест Deployment с PodAntiAffinity
**Условие:** Гарантировать, что реплики одного приложения никогда не запустятся на одном физическом сервере.  
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-api
  template:
    metadata:
      labels:
        app: web-api
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            - labelSelector:
                matchExpressions:
                  - key: app
                    operator: In
                    values: [web-api]
              topologyKey: "kubernetes.io/hostname"
      containers:
        - name: app
          image: nginx:alpine
```


</details>
### Задача 37: NetworkPolicy запрета всего трафика кроме доверенного неймспейса
**Условие:** Заблокировать весь Ingress трафик к подам `app: database`, кроме трафика из неймспейса `monitoring`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>networking.k8s.io</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(networking\.k8s\.io)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-only-monitoring
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: database
  policyTypes: [Ingress]
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: monitoring
```


</details>
### Задача 38: Создание CronJob с политикой `concurrencyPolicy: Forbid`
**Условие:** Запускать бэкап каждые 30 минут с запретом параллельного запуска и лимитом истории в 3 успешных джоба.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>batch</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(batch)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: db-backup
spec:
  schedule: "*/30 * * * *"
  concurrencyPolicy: Forbid
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: backup
              image: postgres:16-alpine
              command: ["/bin/sh", "-c", "pg_dump -h db app > /backup.sql"]
```


</details>
### Задача 39: Временная отладка пода без утилит через `kubectl debug`
**Условие:** В поде `payment-api` на базе `distroless` перехватить трафик утилитой `tcpdump`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>kubectl</code>, <code>debug</code>, <code>payment-api</code>, <code>nicolaka</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(kubectl|debug|payment\-api|nicolaka)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
kubectl debug -it payment-api --image=nicolaka/netshoot --target=payment-container -n prod -- tcpdump -i any -n port 8080
```


</details>
### Задача 40: Создание RBAC роли Read-Only к логам и подам
**Условие:** Создать Role и RoleBinding для разработчика `dev-user`, разрешающие только `get`, `list`, `watch` подов и логов в namespace `dev`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>rbac.authorization.k8s.io</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(rbac\.authorization\.k8s\.io)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: dev
  name: pod-log-reader
rules:
  - apiGroups: [""]
    resources: ["pods", "pods/log"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  namespace: dev
  name: dev-user-binding
subjects:
  - kind: User
    name: dev-user
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-log-reader
  apiGroup: rbac.authorization.k8s.io
```


</details>
### Задача 41: Исправление зависшего в `Terminating` Namespace
**Условие:** Неймспейс `legacy-app` завис при удалении из-за недоступного финализатора.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>kubectl</code>, <code>legacy-app</code>, <code>spec.finalizers</code>, <code>replace</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(kubectl|legacy\-app|spec\.finalizers|replace)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
kubectl get ns legacy-app -o json | jq '.spec.finalizers = []' | kubectl replace --raw "/api/v1/namespaces/legacy-app/finalize" -f -
```


</details>
### Задача 42: Создание StorageClass с динамическим расширением дисков
**Условие:** Создать StorageClass на AWS EBS с поддержкой `allowVolumeExpansion: true`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>storage.k8s.io</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(storage\.k8s\.io)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-gp3-expandable
provisioner: ebs.csi.aws.com
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
parameters:
  type: gp3
```


</details>
### Задача 43: Настройка PodDisruptionBudget с `maxUnavailable: 1`
**Условие:** Защитить критический сервис от падения более чем 1 пода при плановом `kubectl drain`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>policy</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(policy)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: api-pdb
  namespace: production
spec:
  maxUnavailable: 1
  selector:
    matchLabels:
      app: core-api
```


</details>
### Задача 44: Перезапуск всех подов в Deployment без изменения кода
**Условие:** Выполнить плавный перезапуск (Rolling restart) сервиса `auth-service`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>kubectl</code>, <code>rollout</code>, <code>deployment</code>, <code>auth-service</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(kubectl|rollout|deployment|auth\-service)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
kubectl rollout restart deployment/auth-service -n production
```


</details>
### Задача 45: Извлечение всех секретов из K8s Secret в открытом виде
**Условие:** Расшифровать Base64 всех ключей секрета `db-credentials` в консоль.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>kubectl</code>, <code>secret</code>, <code>db-credentials</code>, <code>production</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(kubectl|secret|db\-credentials|production)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
kubectl get secret db-credentials -n production -o json | jq '.data | map_values(@base64d)'
```


</details>
### Задача 46: Настройка Ingress с редиректом на HTTPS и SSL сертификатом
**Условие:** Настроить NGINX Ingress с Let's Encrypt через cert-manager.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>networking.k8s.io</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(networking\.k8s\.io)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
    - hosts: [app.company.com]
      secretName: app-tls-cert
  rules:
    - host: app.company.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-service
                port: { number: 80 }
```


</details>
### Задача 47: Наложение Taint на ноду для выделения под GPU-задачи
**Условие:** Заблокировать ноду `gpu-node-01` для обычных подов.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>kubectl</code>, <code>taint</code>, <code>nodes</code>, <code>gpu-node-01</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(kubectl|taint|nodes|gpu\-node\-01)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
kubectl taint nodes gpu-node-01 dedicated=gpu:NoSchedule
```


</details>
### Задача 48: Очистка Evicted и Failed подов во всем кластере
**Условие:** Одной командой удалить все поды во всех неймспейсах со статусом `Evicted` или `Error`.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>kubectl</code>, <code>pods</code>, <code>field-selector</code>, <code>status.phase</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(kubectl|pods|field\-selector|status\.phase)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
kubectl get pods -A --field-selector=status.phase=Failed -o json | jq -r '.items[] | "\(.metadata.namespace) \(.metadata.name)"' | while read ns name; do kubectl delete pod "$name" -n "$ns"; done
```


</details>
### Задача 49: Настройка `preStop` хука для Graceful Shutdown в Nginx
**Условие:** Предотвратить обрыв соединений в Nginx во время Rolling Update, дав поду 15 секунд на дообслуживание запросов.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>lifecycle</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(lifecycle)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```yaml
lifecycle:
  preStop:
    exec:
      command: ["/bin/sh", "-c", "sleep 15; /usr/sbin/nginx -s quit"]
```


</details>
### Задача 50: Проброс порта Kubernetes сервиса на локальную машину
**Условие:** Пробросить закрытую базу данных `postgres-service:5432` из кластера на локальный порт 5433.  
<details><summary>💡 Подсказка (инструменты)</summary>

<p>Ключевые инструменты: <code>kubectl</code>, <code>port-forward</code>, <code>svc</code>, <code>postgres-service</code>. Начните с них — полное решение ниже под спойлером.</p>

</details>

<div class="answer-check" data-answer="\b(kubectl|port\-forward|svc|postgres\-service)\b"></div>
<details>
<summary>👁 <b>Показать решение</b></summary>

```bash
kubectl port-forward svc/postgres-service 5433:5432 -n database
```


---

<!-- enriched:v1 -->


</details>
## 🧭 Как работать с задачами

- **Порядок:** сначала попробуйте решить сами в песочнице (`kind` / `k3d` / `docker`), только потом читайте решение.
- **Прогресс:** ведите трекер — задача, дата, время до решения, что загуглили. Повторите проваленные через неделю.
- **Уровень сложности:** помечайте для себя [Junior | Middle | Senior] и собирайте «профиль» слабых мест.

!!! tip "Практика > теория"
    Задача считается закрытой, если вы воспроизвели решение с нуля на чистой машине за отведенное время и можете объяснить каждый шаг.


