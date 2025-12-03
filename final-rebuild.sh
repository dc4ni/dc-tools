#!/usr/bin/expect -f

# 最終部署 - 重新 build 後端容器

set timeout 600
set server_ip "172.238.14.142"
set password "@Joendle396"
set app_dir "/opt/directconverter"

puts "\n========================================="
puts "最終部署 - 重新建置後端容器"
puts "=========================================\n"

spawn ssh root@$server_ip
expect "password:" { send "$password\r" }

expect "#"
send "cd $app_dir\r"
expect "#"

send "docker-compose stop backend\r"
expect "#"

send "docker rm directconverter_backend_1\r"
expect "#"

send "docker rmi directconverter_backend\r"
expect "#"

send "docker-compose up -d --build backend\r"
expect "#" { sleep 60 }

puts "\n等待後端啟動..."
sleep 20

send "docker-compose ps\r"
expect "#"

send "docker-compose logs --tail=40 backend\r"
expect "#" { sleep 3 }

send "curl http://localhost:8000/api 2>&1 | head -20\r"
expect "#"

send "curl -I http://localhost 2>&1 | head -10\r"
expect "#"

send "exit\r"
expect eof

puts "\n========================================="
puts "🎉 部署完成!"
puts "=========================================\n"
puts "訪問網址: http://172.238.14.142\n"
