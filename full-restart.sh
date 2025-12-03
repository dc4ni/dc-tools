#!/usr/bin/expect -f

set timeout 180

puts "========================================="
puts "完整重啟所有服務"
puts "=========================================\n"

spawn ssh root@172.238.14.142
expect "password:"
send "@Joendle396\r"
expect "root@*"

send "cd /opt/directconverter\r"
expect "root@*"

send "echo '清理所有容器...'\r"
expect "root@*"
send "docker-compose down\r"
expect "root@*"

send "echo '\n完整重新建置...'\r"
expect "root@*"
send "docker-compose up -d --build\r"
expect {
    -re "Creating.*done" { exp_continue }
    -re "Recreating.*done" { exp_continue }
    -re "Building" { exp_continue }
    timeout { puts "\n建置中..."; exp_continue }
    "root@*" { }
}

send "sleep 15\r"
expect "root@*"

send "echo '\n=== 容器狀態 ==='\r"
expect "root@*"
send "docker-compose ps\r"
expect "root@*"

send "echo '\n=== 後端日誌 ==='\r"
expect "root@*"
send "docker-compose logs --tail=10 backend\r"
expect "root@*"

send "echo '\n=== 前端日誌 ==='\r"
expect "root@*"
send "docker-compose logs --tail=10 frontend\r"
expect "root@*"

send "echo '\n=== 測試服務 ==='\r"
expect "root@*"
send "curl -I http://localhost:3000 2>&1 | head -5\r"
expect "root@*"
send "curl -I http://localhost:8000/api/formats 2>&1 | head -5\r"
expect "root@*"
send "curl -I http://localhost 2>&1 | head -5\r"
expect "root@*"

send "exit\r"
expect eof

puts "\n========================================="
puts "✅ 所有服務已重啟!"
puts "🌐 訪問: http://172.238.14.142"
puts "=========================================\n"
