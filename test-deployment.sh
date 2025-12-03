#!/usr/bin/expect -f

set timeout 30

puts "========================================="
puts "最終測試 - DirectConverter 應用"
puts "=========================================\n"

spawn ssh root@172.238.14.142
expect "password:"
send "@Joendle396\r"
expect "root@*"

send "echo '=== 容器狀態 ==='\r"
expect "root@*"
send "cd /opt/directconverter && docker-compose ps\r"
expect "root@*"

send "echo '\n=== 測試前端 ==='\r"
expect "root@*"
send "curl -I http://localhost 2>&1 | head -5\r"
expect "root@*"

send "echo '\n=== 測試後端 API ==='\r"
expect "root@*"
send "curl http://localhost/api/formats 2>&1 | python3 -m json.tool 2>/dev/null || curl http://localhost/api/formats 2>&1\r"
expect "root@*"

send "echo '\n=== Nginx 狀態 ==='\r"
expect "root@*"
send "systemctl status nginx --no-pager | head -10\r"
expect "root@*"

send "exit\r"
expect eof

puts "\n========================================="
puts "✅ 測試完成!"
puts "========================================="
puts "\n🌐 應用訪問網址: http://172.238.14.142"
puts "📝 API 文檔: http://172.238.14.142/api/docs"
puts "\n後續管理指令:"
puts "  • 查看日誌: ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose logs -f'"
puts "  • 重啟服務: ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose restart'"
puts "  • 停止服務: ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose down'"
puts "  • 啟動服務: ssh root@172.238.14.142 'cd /opt/directconverter && docker-compose up -d'\n"
