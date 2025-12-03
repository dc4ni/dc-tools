#!/usr/bin/expect -f

# 完成 Docker Compose 安裝和啟動應用

set timeout 600
set server_ip "172.238.14.142"
set password "@Joendle396"
set app_dir "/opt/directconverter"

puts "\n========================================="
puts "完成部署 - 安裝 Docker Compose 並啟動應用"
puts "=========================================\n"

spawn ssh root@$server_ip
expect {
    "password:" {
        send "$password\r"
    }
}

expect "#"

# 安裝 Docker Compose
puts "\n安裝 Docker Compose..."
send "apt-get install -y docker-compose\r"
expect "#" { sleep 3 }

puts "\n進入應用目錄..."
send "cd $app_dir\r"
expect "#"

# 啟動應用
puts "\n建置並啟動應用..."
send "docker-compose up -d --build\r"
expect "#" { sleep 60 }

puts "\n查看容器狀態..."
send "docker-compose ps\r"
expect "#"

puts "\n查看日誌..."
send "docker-compose logs --tail=30\r"
expect "#" { sleep 2 }

puts "\n測試服務..."
send "curl -I http://localhost:3000\r"
expect "#"

send "exit\r"
expect eof

puts "\n================================================"
puts "🎉 部署完成!"
puts "================================================\n"
puts "訪問網址: http://172.238.14.142"
puts "\n查看日誌: ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose logs -f'"
puts "================================================\n"
