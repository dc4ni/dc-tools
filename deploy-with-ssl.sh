#!/usr/bin/expect -f

set timeout 600
set server_ip "172.238.14.142"
set password "@Joendle396"
set domain "dc-tools.cc"

puts "\n========================================="
puts "部署 DC Tools v2.4.0 + SSL 設定"
puts "Domain: $domain"
puts "=========================================\n"

# Step 1: 上傳剩餘檔案
puts "\n=== Step 1: 上傳剩餘檔案 ===\n"

spawn scp frontend/src/components/Header.css root@$server_ip:/opt/directconverter/frontend/src/components/Header.css
expect "password:"
send "$password\r"
expect eof

spawn scp frontend/src/App.jsx root@$server_ip:/opt/directconverter/frontend/src/App.jsx
expect "password:"
send "$password\r"
expect eof

spawn scp frontend/src/components/Home.jsx root@$server_ip:/opt/directconverter/frontend/src/components/Home.jsx
expect "password:"
send "$password\r"
expect eof

spawn scp frontend/src/components/Home.css root@$server_ip:/opt/directconverter/frontend/src/components/Home.css
expect "password:"
send "$password\r"
expect eof

puts "\n=== Step 2: 上傳 Nginx 配置 ===\n"

spawn scp nginx.conf root@$server_ip:/tmp/nginx.conf
expect "password:"
send "$password\r"
expect eof

# Step 3: 連接到伺服器並執行部署
puts "\n=== Step 3: 連接伺服器執行部署 ===\n"

spawn ssh root@$server_ip
expect "password:"
send "$password\r"
expect "root@*"

# 安裝 Certbot
send "echo '安裝 Certbot...'\r"
expect "root@*"
send "apt-get update && apt-get install -y certbot python3-certbot-nginx\r"
expect {
    "Do you want to continue?" {
        send "y\r"
        exp_continue
    }
    "root@*" {
        # 繼續
    }
    timeout {
        puts "安裝 Certbot 超時"
        exit 1
    }
}

# 先停止 nginx 以釋放 80 port
send "systemctl stop nginx || true\r"
expect "root@*"

# 獲取 SSL 憑證
send "echo '獲取 SSL 憑證...'\r"
expect "root@*"
send "certbot certonly --standalone -d $domain -d www.$domain --non-interactive --agree-tos --email admin@$domain\r"
expect {
    "Successfully received certificate" {
        puts "\n✅ SSL 憑證獲取成功!"
    }
    "Certificate not yet due for renewal" {
        puts "\n✅ SSL 憑證已存在"
    }
    "root@*" {
        # 繼續
    }
    timeout {
        puts "\n⚠️  SSL 憑證獲取超時,可能需要手動處理"
    }
}

# 複製 Nginx 配置
send "echo '更新 Nginx 配置...'\r"
expect "root@*"
send "cp /tmp/nginx.conf /etc/nginx/sites-available/directconverter\r"
expect "root@*"

# 測試 Nginx 配置
send "nginx -t\r"
expect {
    "syntax is ok" {
        puts "\n✅ Nginx 配置驗證成功"
    }
    "test failed" {
        puts "\n❌ Nginx 配置驗證失敗"
        send "exit\r"
        expect eof
        exit 1
    }
}
expect "root@*"

# 啟動 Nginx
send "systemctl start nginx\r"
expect "root@*"
send "systemctl enable nginx\r"
expect "root@*"

# 重建 Frontend Docker 容器
send "echo '重建 Frontend...'\r"
expect "root@*"
send "cd /opt/directconverter\r"
expect "root@*"
send "docker-compose build --no-cache frontend\r"
expect {
    "Successfully built" {
        puts "\n✅ Frontend 建置成功"
    }
    "root@*" {
        # 繼續
    }
    timeout {
        puts "\n⚠️  Frontend 建置超時"
    }
}

send "docker-compose up -d frontend\r"
expect "root@*"

send "sleep 5\r"
expect "root@*"

# 檢查服務狀態
send "echo '\n=== 服務狀態 ==='\r"
expect "root@*"
send "docker-compose ps\r"
expect "root@*"

send "echo '\n=== Nginx 狀態 ==='\r"
expect "root@*"
send "systemctl status nginx --no-pager | head -10\r"
expect "root@*"

send "echo '\n=== SSL 憑證資訊 ==='\r"
expect "root@*"
send "certbot certificates\r"
expect "root@*"

puts "\n========================================="
puts "✅ 部署完成!"
puts "=========================================\n"
puts "網站: https://$domain/"
puts "請在瀏覽器測試所有功能\n"

send "exit\r"
expect eof
