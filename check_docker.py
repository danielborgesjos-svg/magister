import paramiko

host = '187.127.11.172'
port = 22
username = 'root'
password = 'Magister25@@'

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, port, username, password, timeout=10)
    
    print("--- DOCKER CHECK ---")
    stdin, stdout, stderr = ssh.exec_command("docker --version && docker compose version || docker-compose --version")
    print(stdout.read().decode('utf-8', 'ignore'))
    err = stderr.read().decode('utf-8', 'ignore')
    if err:
        print("Error:", err)
        
    # Check if dir exists
    stdin, stdout, stderr = ssh.exec_command("mkdir -p /var/www/evolution-api")
    
    ssh.close()
except Exception as e:
    print(f"Erro: {e}")
