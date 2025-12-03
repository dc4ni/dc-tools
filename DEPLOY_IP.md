# DirectConverter - IP 部署完整指南

部署主機: **172.238.14.142**  
訪問方式: **http://172.238.14.142**

---

## 📋 部署步驟總覽

1. **在本機上傳代碼到伺服器**
2. **連線到伺服器並安裝環境**
3. **配置應用**
4. **啟動服務**
5. **測試訪問**

預計時間: **10-15 分鐘**

---

## 🚀 開始部署

### 步驟 1: 上傳代碼到伺服器

**在您的本機 Mac 終端執行:**

```bash
cd /Users/dc/Desktop/code/DirectConverter

# 上傳代碼到伺服器
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '__pycache__' \
  --exclude '.git' \
  --exclude 'backend/uploads/*' \
  --exclude 'backend/temp/*' \
  --exclude 'frontend/dist' \
  ./ root@172.238.14.142:/opt/directconverter/
```

> 💡 首次連線會詢問是否信任主機,輸入 `yes` 即可  
> 💡 需要輸入您的 root 密碼

---

### 步驟 2: 連線到伺服器

```bash
ssh root@172.238.14.142
```

---

### 步驟 3: 安裝必要軟體

**在伺服器上執行以下命令:**

#### 3.1 更新系統並安裝基本工具

```bash
apt-get update && apt-get upgrade -y
apt-get install -y curl wget git vim ufw
```

#### 3.2 安裝 Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker
systemctl start docker
```

#### 3.3 安裝 Docker Compose

```bash
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

#### 3.4 安裝 Nginx

```bash
apt-get install -y nginx
```

#### 3.5 驗證安裝

```bash
docker --version
docker-compose --version
nginx -v
```

---

### 步驟 4: 配置應用

#### 4.1 進入應用目錄

```bash
cd /opt/directconverter
```

#### 4.2 創建環境變數檔案

```bash
cat > .env << 'EOF'
VITE_API_URL=http://172.238.14.142/api
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
CORS_ORIGINS=http://172.238.14.142
MAX_UPLOAD_SIZE=52428800
LOG_LEVEL=INFO
EOF
```

#### 4.3 配置 Nginx

```bash
cat > /etc/nginx/sites-available/directconverter << 'EOF'
server {
    listen 80;
    server_name 172.238.14.142;
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /download {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# 啟用站點配置
ln -sf /etc/nginx/sites-available/directconverter /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 測試 Nginx 配置
nginx -t

# 重新載入 Nginx
systemctl reload nginx
```

---

### 步驟 5: 啟動應用

#### 5.1 建置並啟動 Docker 容器

```bash
cd /opt/directconverter
docker-compose up -d --build
```

#### 5.2 查看容器狀態

```bash
docker-compose ps
```

應該看到兩個容器都在運行:
- `directconverter-frontend-1`
- `directconverter-backend-1`

#### 5.3 查看日誌 (確認沒有錯誤)

```bash
docker-compose logs -f
```

> 按 `Ctrl+C` 退出日誌查看

---

### 步驟 6: 配置防火牆

```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS (未來使用)
ufw enable
```

輸入 `y` 確認啟用防火牆

---

### 步驟 7: 測試訪問

**在您的瀏覽器中打開:**

```
http://172.238.14.142
```

您應該能看到圖片轉換工具的首頁! 🎉

---

## 🔧 常用維護命令

### 查看服務狀態

```bash
cd /opt/directconverter
docker-compose ps
```

### 查看日誌

```bash
# 查看所有日誌
docker-compose logs -f

# 只查看後端日誌
docker-compose logs -f backend

# 只查看前端日誌
docker-compose logs -f frontend
```

### 重啟服務

```bash
cd /opt/directconverter
docker-compose restart
```

### 停止服務

```bash
docker-compose down
```

### 啟動服務

```bash
docker-compose up -d
```

### 更新代碼

**在本機執行上傳命令,然後在伺服器上:**

```bash
cd /opt/directconverter
docker-compose down
docker-compose up -d --build
```

---

## 🐛 故障排除

### 問題 1: 無法訪問網站

**檢查防火牆:**
```bash
ufw status
```

**檢查 Nginx:**
```bash
systemctl status nginx
nginx -t
```

**檢查容器:**
```bash
docker-compose ps
docker-compose logs
```

### 問題 2: 上傳檔案失敗

**檢查 Nginx 配置中的 `client_max_body_size`:**
```bash
grep client_max_body_size /etc/nginx/sites-available/directconverter
```

應該顯示 `client_max_body_size 50M;`

### 問題 3: CORS 錯誤

**檢查環境變數:**
```bash
cat /opt/directconverter/.env
```

確認 `CORS_ORIGINS` 包含 `http://172.238.14.142`

### 問題 4: 容器無法啟動

**查看詳細錯誤:**
```bash
docker-compose logs backend
docker-compose logs frontend
```

**重新建置:**
```bash
docker-compose down
docker-compose up -d --build
```

---

## 📊 系統資源監控

### 查看 CPU 和記憶體使用

```bash
docker stats
```

### 查看磁碟使用

```bash
df -h
```

### 清理 Docker 未使用的資源

```bash
docker system prune -a
```

---

## 🔐 安全建議

1. ✅ **修改 SSH 端口** (可選)
2. ✅ **禁用 root 密碼登入,改用 SSH key**
3. ✅ **定期更新系統**: `apt-get update && apt-get upgrade`
4. ✅ **監控日誌檔**: `tail -f /var/log/nginx/error.log`
5. ⚠️ **未來建議**: 取得域名後設定 HTTPS

---

## 📞 需要幫助?

如果遇到任何問題,請提供以下資訊:

```bash
# 收集診斷資訊
echo "=== Docker 狀態 ==="
docker-compose ps

echo -e "\n=== Nginx 狀態 ==="
systemctl status nginx

echo -e "\n=== 防火牆狀態 ==="
ufw status

echo -e "\n=== 最近的錯誤日誌 ==="
docker-compose logs --tail=50
```

---

**部署完成後,您的應用將在 `http://172.238.14.142` 上運行!** 🚀
