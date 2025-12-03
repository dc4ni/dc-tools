#!/usr/bin/expect -f

# 重新建置後端容器

set timeout 600
set server_ip "172.238.14.142"
set password "@Joendle396"
set app_dir "/opt/directconverter"

puts "\n========================================="
puts "重新建置後端容器"
puts "=========================================\n"

spawn ssh root@$server_ip
expect {
    "password:" {
        send "$password\r"
    }
}

expect "#"
send "cd $app_dir\r"
expect "#"

puts "\n停止並移除舊容器..."
send "docker-compose down\r"
expect "#"

puts "\n移除舊的後端映像..."
send "docker rmi directconverter_backend\r"
expect "#" { sleep 2 }

puts "\n重新建置並啟動..."
send "docker-compose up -d --build\r"
expect "#" { sleep 120 }

puts "\n等待30秒讓容器完全啟動..."
sleep 30

puts "\n查看容器狀態..."
send "docker-compose ps\r"
expect "#"

puts "\n查看後端日誌..."
send "docker-compose logs --tail=50 backend\r"
expect "#" { sleep 3 }

puts "\n查看前端日誌..."
send "docker-compose logs --tail=20 frontend\r"
expect "#"

puts "\n測試後端 API..."
send "curl -v http://localhost:8000/api 2>&1 | head -30\r"
expect "#" { sleep 2 }

puts "\n測試前端..."
send "curl -I http://localhost:3000 2>&1 | head -15\r"
expect "#"

puts "\n測試完整服務(通過 Nginx)..."
send "curl -I http://localhost 2>&1\r"
expect "#"

send "exit\r"
expect eof

puts "\n================================================"
puts "🎉 重新部署完成!"
puts "================================================\n"
puts "訪問網址: http://172.238.14.142"
puts "\n"
puts "如果還有問題,請執行以下命令查看詳細日誌:"
puts "  ssh root@172.238.14.142"
puts "  cd /opt/directconverter"
puts "  docker-compose logs -f"
puts "================================================\n"
