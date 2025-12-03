#!/usr/bin/expect -f

# 上傳所有修復後的文件並重啟

set timeout 600
set server_ip "172.238.14.142"
set password "@Joendle396"
set app_dir "/opt/directconverter"

puts "\n========================================="
puts "上傳修復後的所有文件並重新部署"
puts "=========================================\n"

puts "上傳 main.py..."
spawn scp /Users/dc/Desktop/code/DirectConverter/backend/app/main.py root@$server_ip:$app_dir/backend/app/
expect "password:" { send "$password\r" }
expect eof
sleep 1

puts "上傳 image_converter.py..."
spawn scp /Users/dc/Desktop/code/DirectConverter/backend/app/image_converter.py root@$server_ip:$app_dir/backend/app/
expect "password:" { send "$password\r" }
expect eof
sleep 1

puts "上傳 error_log_manager.py..."
spawn scp /Users/dc/Desktop/code/DirectConverter/backend/app/error_log_manager.py root@$server_ip:$app_dir/backend/app/
expect "password:" { send "$password\r" }
expect eof
sleep 1

puts "\n連線到伺服器並重啟..."
spawn ssh root@$server_ip
expect "password:" { send "$password\r" }

expect "#"
send "cd $app_dir\r"
expect "#"

send "docker-compose restart backend\r"
expect "#" { sleep 15 }

send "docker-compose ps\r"
expect "#"

send "docker-compose logs --tail=30 backend\r"
expect "#" { sleep 3 }

send "curl -I http://localhost:8000/api 2>&1 | head -15\r"
expect "#"

send "curl -I http://localhost 2>&1 | head -10\r"
expect "#"

send "exit\r"
expect eof

puts "\n========================================="
puts "🎉 部署完成!"
puts "=========================================\n"
puts "訪問網址: http://172.238.14.142\n"
