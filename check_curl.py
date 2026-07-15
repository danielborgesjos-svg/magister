import paramiko

host = '187.127.11.172'
port = 22
username = 'root'
password = 'Magister25@@'

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, port, username, password, timeout=10)
    
    print("--- CURL ROOT ---")
    stdin, stdout, stderr = ssh.exec_command("curl -s -I http://127.0.0.1:3002/")
    print(stdout.read().decode('utf-8', 'ignore'))
    
    ssh.close()
except Exception as e:
    print(f"Erro: {e}")
