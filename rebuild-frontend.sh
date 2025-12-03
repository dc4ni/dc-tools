#!/usr/bin/expect -f

set timeout 120

puts "========================================="
puts "重新建置前端容器"
puts "=========================================\n"

spawn ssh root@172.238.14.142
expect "password:"
send "@Joendle396\r"
expect "root@*"

send "cd /opt/directconverter\r"
expect "root@*"

send "echo '停止並移除前端容器...'\r"
expect "root@*"
send "docker-compose stop frontend\r"
expect "root@*"
send "docker rm directconverter_frontend_1\r"
expect "root@*"
send "docker rmi directconverter_frontend\r"
expect "root@*"

send "echo '\n重新建置前端容器...'\r"
expect "root@*"
send "docker-compose up -d --build frontend\r"
expect "root@*"
send "sleep 10\r"
expect "root@*"

send "echo '\n=== 檢查容器狀態 ==='\r"
expect "root@*"
send "docker-compose ps\r"
expect "root@*"

send "echo '\n=== 檢查前端日誌 ==='\r"
expect "root@*"
send "docker-compose logs --tail=15 frontend\r"
expect "root@*"

send "echo '\n=== 測試前端 ==='\r"
expect "root@*"
send "curl -I http://localhost:3000 2>&1 | head -10\r"
expect "root@*"

send "echo '\n=== 測試 Nginx ==='\r"
expect "root@*"
send "curl -I http://localhost 2>&1 | head -10\r"
expect "root@*"

send "exit\r"
expect eof

puts "\n========================================="
puts "✅ 前端容器重建完成!"
puts "🌐 訪問: http://172.238.14.142"
puts "=========================================\n"
