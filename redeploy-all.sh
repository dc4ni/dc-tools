#!/usr/bin/expect -f

set timeout 120

puts "========================================="
puts "重新建置並啟動服務"
puts "=========================================\n"

spawn ssh root@172.238.14.142
expect "password:"
send "@Joendle396\r"
expect "root@*"

send "cd /opt/directconverter\r"
expect "root@*"

send "echo '清理舊容器...'\r"
expect "root@*"
send "docker-compose down\r"
expect "root@*"

send "echo '\n重新建置所有服務...'\r"
expect "root@*"
send "docker-compose up -d --build\r"
expect {
    -re "Creating.*done" { exp_continue }
    -re "Building" { exp_continue }
    timeout { puts "\n建置中..."; exp_continue }
    "root@*" { }
}

send "sleep 10\r"
expect "root@*"

send "echo '\n=== 容器狀態 ==='\r"
expect "root@*"
send "docker-compose ps\r"
expect "root@*"

send "echo '\n=== 後端日誌 ==='\r"
expect "root@*"
send "docker-compose logs --tail=15 backend\r"
expect "root@*"

send "echo '\n=== 測試 API ==='\r"
expect "root@*"
send "curl http://localhost/api/formats 2>&1 | python3 -m json.tool 2>/dev/null || curl http://localhost/api/formats 2>&1 | head -5\r"
expect "root@*"

send "echo '\n=== 測試主頁 ==='\r"
expect "root@*"
send "curl -I http://localhost 2>&1 | head -5\r"
expect "root@*"

send "exit\r"
expect eof

puts "\n========================================="
puts "✅ 服務已重新建置並啟動!"
puts "🌐 訪問: http://172.238.14.142"
puts "=========================================\n"
