# DirectConverter 部署指南

## 部署到 Linode 主機

### 前置準備

1. **Linode 主機資訊**
   - IP 地址: `YOUR_SERVER_IP`
   - SSH 使用者: `root` 或其他使用者
   - 作業系統: Ubuntu 20.04+ / Debian 11+ (推薦)

2. **域名設定 (可選)**
   - 將您的域名 A 記錄指向 Linode 主機 IP

---

## 方法一: 使用 Docker Compose 部署 (推薦)

### 步驟 1: 連線到 Linode 主機

```bash
ssh root@YOUR_SERVER_IP
```

### 步驟 2: 安裝必要軟體

```bash
# 更新系統
apt-get update && apt-get upgrade -y

# 安裝 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 安裝 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 安裝 Nginx
apt-get install -y nginx

# 安裝 Certbot (用於 SSL 憑證)
apt-get install -y certbot python3-certbot-nginx
```

### 步驟 3: 上傳代碼到伺服器

在**本機**執行:

```bash
# 從您的本機上傳代碼
scp -r /Users/dc/Desktop/code/DirectConverter root@YOUR_SERVER_IP:/opt/directconverter
```

或使用 Git:

```bash
# 在伺服器上執行
cd /opt
git clone YOUR_GIT_REPO_URL directconverter
```

### 步驟 4: 配置環境變數

```bash
cd /opt/directconverter

# 編輯生產環境配置
nano .env.production

# 修改以下內容:
# VITE_API_URL=http://your-domain.com/api  (替換為您的域名)
# CORS_ORIGINS=http://your-domain.com,https://your-domain.com
```

### 步驟 5: 配置 Nginx

```bash
# 複製 Nginx 配置
cp nginx.conf /etc/nginx/sites-available/directconverter

# 編輯配置檔,修改域名
nano /etc/nginx/sites-available/directconverter
# 將 your-domain.com 替換為您的實際域名或 IP

# 啟用站點
ln -s /etc/nginx/sites-available/directconverter /etc/nginx/sites-enabled/

# 移除預設站點 (可選)
rm /etc/nginx/sites-enabled/default

# 測試配置
nginx -t

# 重新載入 Nginx
systemctl reload nginx
```

### 步驟 6: 啟動應用

```bash
cd /opt/directconverter

# 使用 Docker Compose 啟動
docker-compose up -d

# 查看日誌
docker-compose logs -f
```

### 步驟 7: 設定 SSL 憑證 (HTTPS)

```bash
# 使用 Certbot 自動配置 SSL
certbot --nginx -d your-domain.com

# 自動續期測試
certbot renew --dry-run
```

### 步驟 8: 設定防火牆

```bash
# 允許 HTTP 和 HTTPS
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp  # SSH
ufw enable
```

---

## 方法二: 不使用 Docker 部署

### 步驟 1-3: 同上

### 步驟 4: 安裝 Python 和 Node.js

```bash
# 安裝 Python 3.10+
apt-get install -y python3 python3-pip python3-venv

# 安裝 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
```

### 步驟 5: 安裝後端依賴

```bash
cd /opt/directconverter/backend

# 創建虛擬環境
python3 -m venv venv
source venv/bin/activate

# 安裝依賴
pip install -r requirements.txt
```

### 步驟 6: 建置前端

```bash
cd /opt/directconverter/frontend

# 安裝依賴
npm install

# 建置生產版本
npm run build
```

### 步驟 7: 配置 Systemd 服務

創建後端服務:

```bash
cat > /etc/systemd/system/directconverter-backend.service << 'EOF'
[Unit]
Description=DirectConverter Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/directconverter/backend
Environment="PATH=/opt/directconverter/backend/venv/bin"
ExecStart=/opt/directconverter/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 啟用並啟動服務
systemctl daemon-reload
systemctl enable directconverter-backend
systemctl start directconverter-backend
```

### 步驟 8: 配置 Nginx 服務前端

修改 Nginx 配置以服務建置後的前端檔案:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /opt/directconverter/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        # ... 其他 proxy 設定
    }
}
```

---

## 維護指令

```bash
# 查看服務狀態
docker-compose ps  # Docker 方式
systemctl status directconverter-backend  # Systemd 方式

# 查看日誌
docker-compose logs -f  # Docker 方式
journalctl -u directconverter-backend -f  # Systemd 方式

# 重啟服務
docker-compose restart  # Docker 方式
systemctl restart directconverter-backend  # Systemd 方式

# 更新代碼
cd /opt/directconverter
git pull  # 如果使用 Git
docker-compose down
docker-compose up -d --build
```

---

## 故障排除

### 1. 無法訪問服務
- 檢查防火牆: `ufw status`
- 檢查 Nginx: `nginx -t` 和 `systemctl status nginx`
- 檢查應用: `docker-compose ps` 或 `systemctl status directconverter-backend`

### 2. 上傳檔案失敗
- 檢查 Nginx 的 `client_max_body_size` 設定
- 檢查後端日誌

### 3. CORS 錯誤
- 確認 `.env.production` 中的 `CORS_ORIGINS` 設定正確

---

## 安全建議

1. 定期更新系統和依賴套件
2. 使用 HTTPS (Let's Encrypt)
3. 設定適當的防火牆規則
4. 定期備份應用資料
5. 監控系統資源使用狀況

---

## 需要的資訊清單

請提供以下資訊以完成部署:

- [ ] Linode 主機 IP 地址
- [ ] SSH 登入帳號
- [ ] 域名 (如果有)
- [ ] 是否需要 SSL 憑證
- [ ] 偏好的部署方式 (Docker / 傳統方式)
