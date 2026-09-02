# 🛡️ 20. Стек TCP/IP, Netfilter и iptables

## 🧠 Архитектура Netfilter в Ядре Linux

**Netfilter** — это фреймворк внутри ядра Linux, позволяющий перехватывать, модифицировать, фильтровать и перенаправлять сетевые пакеты на различных этапах их прохождения по сетевому стеку.

Утилита **`iptables`** (и современная замена **`nftables`**) — это интерфейс управления правилами Netfilter.

---

## 🗺️ Путь прохождения пакета (Packet Flow Lifecycle)

```mermaid
graph TD
    NIC_IN["1. Сетевой интерфейс (Входящий пакет)"] --> PREROUTING["PREROUTING (raw -> conntrack -> mangle -> nat)"]
    
    PREROUTING --> ROUTE1{"Решение маршрутизации: Пакет адресован локальному серверу?"}
    
    ROUTE1 -->|ДА (Local Host)| INPUT["INPUT (mangle -> filter -> nat)"]
    INPUT --> LOCAL_APP["Локальное приложение (Socket / Port)"]
    
    ROUTE1 -->|НЕТ (Forward to other host)| FORWARD["FORWARD (mangle -> filter)"]
    
    LOCAL_APP --> ROUTE2["OUTPUT (raw -> conntrack -> mangle -> nat -> filter)"]
    
    FORWARD --> POSTROUTING["POSTROUTING (mangle -> nat / SNAT)"]
    ROUTE2 --> POSTROUTING
    
    POSTROUTING --> NIC_OUT["2. Сетевой интерфейс (Исходящий пакет)"]
```

---

## 📊 Таблицы и Цепочки Netfilter

### 5 Таблиц (`Tables`):
1. **`filter` (по умолчанию):** Основная фильтрация пакетов (разрешить/запретить). Цепочки: `INPUT`, `FORWARD`, `OUTPUT`.
2. **`nat`:** Трансляция сетевых адресов (Network Address Translation). Подмена IP/портов. Цепочки: `PREROUTING` (DNAT), `OUTPUT`, `POSTROUTING` (SNAT/MASQUERADE).
3. **`mangle`:** Модификация заголовков пакетов (TOS, TTL, маркировка `MARK` для policy routing).
4. **`raw`:** Обработка пакетов **ДО** подсистемы отслеживания соединений (`conntrack`). Флаг `NOTRACK`.
5. **`security`:** Интеграция с модулями безопасности SELinux/AppArmor (SEC言MARK).

---

## 🛠️ CLI Практика: Production Рецепты iptables

### 1. Настройка безопасного файрвола для сервера (Stateless + Stateful)
```bash
# 1. Сброс всех старых правил
sudo iptables -F
sudo iptables -X
sudo iptables -t nat -F

# 2. Политики по умолчанию: ДРОПАТЬ ВСЁ входящее и транзитное
sudo iptables -P INPUT DROP
sudo iptables -P FORWARD DROP
sudo iptables -P OUTPUT ACCEPT

# 3. Разрешить локальный интерфейс (Loopback / 127.0.0.1)
sudo iptables -A INPUT -i lo -j ACCEPT

# 4. Разрешить уже установленные и зависимые соединения (Stateful Inspection!)
sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# 5. Дропать некорректные пакеты (Invalid state)
sudo iptables -A INPUT -m conntrack --ctstate INVALID -j DROP

# 6. Открыть SSH (порт 22) с защитой от брутфорса (не более 4 подключений в минуту)
sudo iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -m recent --set --name SSH
sudo iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -m recent --update --seconds 60 --hitcount 4 --rttl --name SSH -j DROP
sudo iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -j ACCEPT

# 7. Открыть публичные веб-порты (HTTP 80, HTTPS 443)
sudo iptables -A INPUT -p tcp -m multiport --dports 80,443 -m conntrack --ctstate NEW -j ACCEPT

# 8. Разрешить ICMP (ping) для диагностики:
sudo iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT
```

### 2. Настройка NAT: Проброс портов (DNAT) и Маскарадинг (SNAT)
```bash
# Включаем IP Forwarding в ядре:
sudo sysctl -w net.ipv4.ip_forward=1

# Проброс входящего порта 80 на внутренний контейнер/хост (DNAT):
sudo iptables -t nat -A PREROUTING -p tcp -i eth0 --dport 80 -j DNAT --to-destination 192.168.1.100:8080

# Выход внутренней подсети 192.168.1.0/24 в интернет через внешний IP интерфейса eth0 (SNAT / MASQUERADE):
sudo iptables -t nat -A POSTROUTING -s 192.168.1.0/24 -o eth0 -j MASQUERADE
```

### 3. Сохранение и просмотр правил
```bash
# Просмотр всех правил с номерами строк и счетчиками пакетов:
sudo iptables -nvL --line-numbers
sudo iptables -t nat -nvL

# Удаление правила по номеру строки (например, строка 3 в INPUT):
sudo iptables -D INPUT 3

# Сохранение правил между перезагрузками (Ubuntu/Debian):
# sudo apt install iptables-persistent
sudo netfilter-persistent save
```

---

## ⚡ Современный аналог: nftables

В современных дистрибутивах `iptables` заменяется на **`nftables`** (единый движок с понятным синтаксисом):

```bash
# Пример таблицы в nftables (/etc/nftables.conf):
table inet my_firewall {
    chain inbound {
        type filter hook input priority filter; policy drop;
        
        iif "lo" accept
        ct state established,related accept
        tcp dport { 22, 80, 443 } accept
        icmp type echo-request accept
    }
}
```
