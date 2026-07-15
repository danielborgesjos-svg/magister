import paramiko

host = '187.127.11.172'
port = 22
username = 'root'
password = 'Magister25@@'

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, port, username, password, timeout=10)
    
    print("--- ECOSYSTEM CONFIG MAGISTER ---")
    stdin, stdout, stderr = ssh.exec_command("cat /var/www/magister/ecosystem.config.js")
    print(stdout.read().decode('utf-8', 'ignore'))
    
    print("--- PM2 DESCR ---")
    stdin, stdout, stderr = ssh.exec_command("pm2 desc magister-erp")
    print(stdout.read().decode('utf-8', 'ignore'))
    
    ssh.close()
except Exception as e:
    print(f"Erro: {e}")
