#!/usr/bin/expect -f

# DirectConverter SSL 配置腳本
# 使用方式: ./setup-ssl.sh YOUR_DOMAIN

set timeout 60

if {$argc != 1} {
    puts "使用方式: ./setup-ssl.sh YOUR_DOMAIN"
    puts "範例: ./setup-ssl.sh converter.example.com"
    exit 1
}

set domain [lindex $argv 0]

puts "========================================="
puts "為 $domain 設置 SSL 憑證"
puts "=========================================\n"

spawn ssh root@172.238.14.142
expect "password:"
send "@Joendle396\r"
expect "root@*"

send "cd /opt/directconverter\r"
expect "root@*"

# 更新 Nginx 配置中的域名
send "sed -i 's/server_name .*/server_name $domain;/' /etc/nginx/sites-available/directconverter\r"
expect "root@*"

send "nginx -t\r"
expect "root@*"
send "systemctl reload nginx\r"
expect "root@*"

# 安裝 SSL 憑證
send "certbot --nginx -d $domain --non-interactive --agree-tos --email admin@$domain\r"
expect {
    "Successfully" {
        puts "\n✅ SSL 憑證安裝成功!"
    }
    timeout {
        puts "\n⚠️  SSL 安裝超時,請檢查域名 DNS 設置"
    }
}
expect "root@*"

send "echo '\n=== SSL 狀態 ==='\r"
expect "root@*"
send "certbot certificates\r"
expect "root@*"

send "exit\r"
expect eof

puts "\n========================================="
puts "✅ SSL 設置完成!"
puts "🌐 訪問: https://$domain"
puts "=========================================\n"
