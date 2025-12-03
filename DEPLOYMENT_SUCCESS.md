# DirectConverter 部署成功! 🎉

## 部署資訊

- **主機**: Linode Ubuntu 24.04.3 LTS
- **IP 地址**: 172.238.14.142
- **訪問網址**: http://172.238.14.142
- **API 文檔**: http://172.238.14.142/api/docs

## 服務狀態

✅ **前端**: Vite + React (Port 3000)
✅ **後端**: FastAPI + Uvicorn (Port 8000)  
✅ **反向代理**: Nginx (Port 80)
✅ **容器化**: Docker + Docker Compose

## 系統資源

- **CPU**: 1 vCPU
- **記憶體**: 961 MB (已使用 480 MB)
- **磁碟**: 25 GB (已使用 4.2 GB, 19% 使用率)
- **Swap**: 495 MB (已使用 34 MB)

## 技術棧

### 後端
- Python 3.9
- FastAPI 0.104.1
- Uvicorn 0.24.0
- Pillow 10.4.0 (圖片處理)
- Docker (python:3.9-slim)

### 前端
- Node.js 18 Alpine
- React
- Vite 5.4.21
- Docker (node:18-alpine)

### 基礎設施
- Nginx 1.24.0 (反向代理)
- Docker 29.1.1
- Docker Compose 1.29.2
- UFW 防火牆 (開放 22, 80, 443 端口)

## 管理指令

### 查看日誌
```bash
ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose logs -f'
```

查看特定服務日誌:
```bash
ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose logs -f backend'
ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose logs -f frontend'
```

### 重啟服務
```bash
ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose restart'
```

重啟特定服務:
```bash
ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose restart backend'
ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose restart frontend'
```

### 停止服務
```bash
ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose down'
```

### 啟動服務
```bash
ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose up -d'
```

### 檢查容器狀態
```bash
ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose ps'
```

## 更新代碼流程

### 方法 1: 使用 rsync (推薦)
```bash
# 1. 在本地修改代碼

# 2. 上傳到服務器
rsync -avz --exclude node_modules --exclude __pycache__ --exclude .git ./ root@172.238.14.142:/opt/directconverter/

# 3. 重新建置並啟動
ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose up -d --build'
```

### 方法 2: 使用 Git (推薦用於生產環境)
```bash
# 在服務器上
ssh root@172.238.14.142
cd /opt/directconverter
git pull origin main
docker-compose up -d --build
```

### 只更新後端
```bash
rsync -avz --exclude __pycache__ ./backend/ root@172.238.14.142:/opt/directconverter/backend/
ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose up -d --build backend'
```

### 只更新前端
```bash
rsync -avz --exclude node_modules ./frontend/ root@172.238.14.142:/opt/directconverter/frontend/
ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose up -d --build frontend'
```

## 部署過程修正的問題

### 1. Python 依賴問題
- **問題**: Pillow 12.0.0 需要 Python 3.10+,但容器使用 Python 3.9
- **解決**: 降級 Pillow 到 10.4.0

### 2. Python 模組導入問題
- **問題**: 所有相對導入失敗 (`from config import` 等)
- **解決**: 改用絕對導入 (`from app.config import`)
- **修改檔案**:
  - `backend/app/main.py`
  - `backend/app/image_converter.py`
  - `backend/app/error_log_manager.py`

### 3. Nginx 路由配置
- **問題**: `/api` 路徑轉發不正確
- **解決**: 修改 `nginx.conf` 中的 `proxy_pass` 配置,添加尾部斜線

### 4. Vite 開發服務器網路配置
- **問題**: Vite 只監聽 localhost,無法從 Docker 網絡訪問
- **解決**: 在 `vite.config.js` 中添加 `host: '0.0.0.0'`

### 5. Docker 容器緩存問題
- **問題**: 更新源代碼後容器仍運行舊代碼
- **解決**: 完全重建容器映像 (`docker-compose up -d --build`)

## 測試結果

### 前端測試
```bash
curl -I http://172.238.14.142
# HTTP/1.1 200 OK ✅
```

### 後端 API 測試
```bash
curl http://172.238.14.142/api/formats
# 返回支援的格式列表 ✅
```

### 容器狀態
```
directconverter_backend_1    Up    0.0.0.0:8000->8000/tcp ✅
directconverter_frontend_1   Up    0.0.0.0:3000->3000/tcp ✅
```

## 安全建議

### 1. 修改 Root 密碼
```bash
ssh root@172.238.14.142
passwd
```

### 2. 設置 SSH 密鑰登入
```bash
# 本地生成密鑰(如果還沒有)
ssh-keygen -t ed25519

# 複製公鑰到服務器
ssh-copy-id root@172.238.14.142

# 禁用密碼登入
ssh root@172.238.14.142
vi /etc/ssh/sshd_config
# 設置: PasswordAuthentication no
systemctl restart sshd
```

### 3. 配置防火牆
```bash
# 當前已開放的端口
ufw status
# 22 (SSH), 80 (HTTP), 443 (HTTPS)
```

### 4. 添加 HTTPS (建議)
```bash
# 安裝 Certbot
apt install certbot python3-certbot-nginx

# 獲取 SSL 憑證(需要域名)
certbot --nginx -d your-domain.com

# 自動續訂
certbot renew --dry-run
```

### 5. 設置自動備份
```bash
# 創建備份腳本
cat > /root/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# 備份應用代碼
tar -czf $BACKUP_DIR/directconverter_$DATE.tar.gz /opt/directconverter

# 只保留最近 7 天的備份
find $BACKUP_DIR -name "directconverter_*.tar.gz" -mtime +7 -delete
EOF

chmod +x /root/backup.sh

# 添加到 crontab (每天凌晨 2 點執行)
crontab -e
# 添加: 0 2 * * * /root/backup.sh
```

## 監控建議

### 1. 查看資源使用
```bash
ssh root@172.238.14.142 'htop'
ssh root@172.238.14.142 'docker stats'
```

### 2. 查看磁碟空間
```bash
ssh root@172.238.14.142 'df -h'
```

### 3. 查看記憶體使用
```bash
ssh root@172.238.14.142 'free -h'
```

### 4. 設置日誌輪轉
```bash
# Docker 日誌可能會變大,建議設置日誌大小限制
# 在 docker-compose.yml 中添加:
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 常見問題排查

### 服務無法訪問
```bash
# 檢查容器狀態
ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose ps'

# 檢查 Nginx 狀態
ssh root@172.238.14.142 'systemctl status nginx'

# 檢查防火牆
ssh root@172.238.14.142 'ufw status'
```

### 容器一直重啟
```bash
# 查看容器日誌
ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose logs backend'
ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose logs frontend'
```

### 磁碟空間不足
```bash
# 清理 Docker 未使用的資源
ssh root@172.238.14.142 'docker system prune -a'

# 清理 Docker 日誌
ssh root@172.238.14.142 'truncate -s 0 /var/lib/docker/containers/*/*-json.log'
```

### 記憶體不足
```bash
# 重啟容器釋放記憶體
ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose restart'

# 考慮升級服務器配置
```

## 未來改進建議

1. **域名和 SSL**: 註冊域名並配置 HTTPS
2. **CI/CD**: 使用 GitHub Actions 實現自動部署
3. **監控系統**: 部署 Prometheus + Grafana 進行監控
4. **日誌管理**: 使用 ELK Stack 或 Loki 集中管理日誌
5. **負載均衡**: 如果流量增加,考慮添加負載均衡器
6. **資料庫**: 如果需要持久化數據,添加 PostgreSQL 或 MongoDB
7. **對象存儲**: 使用 S3 或類似服務存儲轉換後的圖片
8. **CDN**: 使用 CloudFlare 等 CDN 加速靜態資源

## 聯絡資訊

- **部署日期**: 2025-12-01
- **部署方式**: 自動化腳本 (expect + rsync)
- **文檔位置**: `/Users/dc/Desktop/code/DirectConverter/DEPLOYMENT_SUCCESS.md`

---

**🎊 恭喜!DirectConverter 已成功部署到 Linode 主機!**
