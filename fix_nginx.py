import paramiko

host = '187.127.11.172'
port = 22
username = 'root'
password = 'Magister25@@'

# Atualiza porta e remove redirecionamento legado
fix_cmds = [
    "sed -i 's/proxy_pass http:\\/\\/127.0.0.1:3000;/proxy_pass http:\\/\\/127.0.0.1:3002;/g' /etc/nginx/sites-available/erp.magistertech.com.br",
    "sed -i '/location = \\/ {/,/}/d' /etc/nginx/sites-available/erp.magistertech.com.br",
    "nginx -t && systemctl reload nginx"
]

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, port, username, password, timeout=10)
    
    for cmd in fix_cmds:
        print(f"Executando: {cmd}")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        print(stdout.read().decode('utf-8', 'ignore'))
        print(stderr.read().decode('utf-8', 'ignore'))
        
    ssh.close()
    print("NGINX configurado e recarregado com sucesso!")
except Exception as e:
    print(f"Erro: {e}")
