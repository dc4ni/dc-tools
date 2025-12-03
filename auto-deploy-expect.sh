#!/usr/bin/expect -f

# DirectConverter 完全自動化部署腳本
# 使用 expect 自動處理密碼輸入

set timeout 600
set server_ip "172.238.14.142"
set password "@Joendle396"
set app_dir "/opt/directconverter"

puts "================================================"
puts "DirectConverter 自動部署開始"
puts "================================================\n"

# 步驟 1: 創建遠程目錄
puts "\n步驟 1/5: 創建遠程目錄..."
spawn ssh root@$server_ip "mkdir -p $app_dir"
expect {
    "password:" {
        send "$password\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    eof
}

puts "✅ 目錄創建完成\n"

# 步驟 2: 上傳代碼
puts "\n步驟 2/5: 上傳代碼到伺服器..."
spawn rsync -avz --progress --exclude node_modules --exclude __pycache__ --exclude .git --exclude backend/uploads/* --exclude backend/temp/* --exclude frontend/dist /Users/dc/Desktop/code/DirectConverter/ root@$server_ip:$app_dir/
expect {
    "password:" {
        send "$password\r"
        exp_continue
    }
    eof
}

puts "✅ 代碼上傳完成\n"

# 步驟 3: 安裝環境
puts "\n步驟 3/5: 安裝 Docker 和必要軟體..."
spawn ssh root@$server_ip
expect {
    "password:" {
        send "$password\r"
    }
}

expect "#"
send "apt-get update -y\r"
expect "#"

send "curl -fsSL https://get.docker.com -o get-docker.sh\r"
expect "#"
send "sh get-docker.sh\r"
expect "#" { sleep 2 }

send "curl -L 'https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)' -o /usr/local/bin/docker-compose\r"
expect "#"
send "chmod +x /usr/local/bin/docker-compose\r"
expect "#"

send "apt-get install -y nginx\r"
expect "#" { sleep 2 }

puts "✅ 環境安裝完成\n"

# 步驟 4: 配置應用
puts "\n步驟 4/5: 配置應用和 Nginx..."
send "cd $app_dir\r"
expect "#"
send "cp .env.production .env\r"
expect "#"
send "cp nginx.conf /etc/nginx/sites-available/directconverter\r"
expect "#"
send "ln -sf /etc/nginx/sites-available/directconverter /etc/nginx/sites-enabled/\r"
expect "#"
send "rm -f /etc/nginx/sites-enabled/default\r"
expect "#"
send "nginx -t && systemctl reload nginx\r"
expect "#"

send "ufw allow 22/tcp\r"
expect "#"
send "ufw allow 80/tcp\r"
expect "#"
send "echo y | ufw enable\r"
expect "#" { sleep 1 }

puts "✅ 配置完成\n"

# 步驟 5: 啟動應用
puts "\n步驟 5/5: 建置並啟動應用..."
send "cd $app_dir\r"
expect "#"
send "docker-compose down\r"
expect "#" { sleep 2 }
send "docker-compose up -d --build\r"
expect "#" { sleep 30 }

send "docker-compose ps\r"
expect "#"
send "docker-compose logs --tail=20\r"
expect "#"

send "exit\r"
expect eof

puts "\n================================================"
puts "🎉 部署完成!"
puts "================================================\n"
puts "訪問網址: http://$server_ip"
puts "================================================\n"
