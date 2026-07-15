import paramiko

host = '187.127.11.172'
port = 22
username = 'root'
password = 'Magister25@@'

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, port, username, password, timeout=10)
    
    print("--- RUNNING CERTBOT ---")
    stdin, stdout, stderr = ssh.exec_command("certbot --nginx -d erp.magistertech.com.br --non-interactive --agree-tos --register-unsafely-without-email")
    print(stdout.read().decode('utf-8', 'ignore'))
    print(stderr.read().decode('utf-8', 'ignore'))
    
    ssh.close()
except Exception as e:
    print(f"Erro: {e}")
