import paramiko

host = '187.127.11.172'
port = 22
username = 'root'
password = 'Magister25@@'

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, port, username, password, timeout=10)
    
    print("--- PM2 PORTS ---")
    commands = [
        "pm2 env magister-erp | grep -i port",
        "pm2 env orbita180 | grep -i port",
        "cat /var/www/magister/package.json | grep name"
    ]
    
    for cmd in commands:
        print(f"--- {cmd} ---")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        print(stdout.read().decode('utf-8', 'ignore'))
        
    ssh.close()
except Exception as e:
    print(f"Erro: {e}")
