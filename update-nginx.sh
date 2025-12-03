#!/usr/bin/expect -f

set timeout 60

puts "========================================="
puts "更新 Nginx 配置"
puts "========================================="

spawn ssh root@172.238.14.142
expect "password:"
send "@Joendle396\r"
expect "root@*"

# 上傳 nginx.conf
puts "\n上傳 nginx.conf..."
spawn scp /Users/dc/Desktop/code/DirectConverter/nginx.conf root@172.238.14.142:/etc/nginx/sites-available/directconverter
expect "password:"
send "@Joendle396\r"
expect eof

# 重啟 Nginx
spawn ssh root@172.238.14.142
expect "password:"
send "@Joendle396\r"
expect "root@*"
send "nginx -t\r"
expect "root@*"
send "systemctl reload nginx\r"
expect "root@*"
send "echo '測試 API...'\r"
expect "root@*"
send "curl http://localhost/api/formats 2>&1 | head -20\r"
expect "root@*"
send "exit\r"
expect eof

puts "\n========================================="
puts "✅ Nginx 配置已更新!"
puts "=========================================\n"
