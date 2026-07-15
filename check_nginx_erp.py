import paramiko

host = '187.127.11.172'
port = 22
username = 'root'
password = 'Magister25@@'

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, port, username, password, timeout=10)
    
    print("--- NGINX ERP MAGISTER CONF ---")
    stdin, stdout, stderr = ssh.exec_command("cat /etc/nginx/sites-enabled/erp.magistertech.com.br")
    print(stdout.read().decode('utf-8', 'ignore'))
    
    ssh.close()
except Exception as e:
    print(f"Erro: {e}")
