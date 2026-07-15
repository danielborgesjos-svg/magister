import paramiko
import sys

host = '187.127.11.172'
port = 22
username = 'root'
password = 'Magister25@@'

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, port, username, password, timeout=10)
    
    print("--- PM2 STATUS ---")
    stdin, stdout, stderr = ssh.exec_command("pm2 status")
    print(stdout.read().decode('utf-8', 'ignore').encode('utf-8', 'ignore').decode('utf-8', 'ignore'))
    
    print("--- PM2 LOGS (magister-erp) ---")
    stdin, stdout, stderr = ssh.exec_command("pm2 logs magister-erp --lines 30 --nostream")
    print(stdout.read().decode('utf-8', 'ignore').encode('utf-8', 'ignore').decode('utf-8', 'ignore'))
    print(stderr.read().decode('utf-8', 'ignore').encode('utf-8', 'ignore').decode('utf-8', 'ignore'))
    
    print("--- NETSTAT (Portas em uso) ---")
    stdin, stdout, stderr = ssh.exec_command("netstat -tulnp | grep node")
    print(stdout.read().decode('utf-8'))
    
    ssh.close()
    
except Exception as e:
    print(f"Erro: {e}")
