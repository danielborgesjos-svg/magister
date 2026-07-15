import paramiko
import sys
import time

host = '187.127.11.172'
port = 22
username = 'root'
password = 'Magister25@@'
command = 'cd /var/www/magister && bash deploy.sh'

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"[{time.strftime('%H:%M:%S')}] Conectando na VPS {host}...")
    ssh.connect(host, port, username, password, timeout=10)
    
    print(f"[{time.strftime('%H:%M:%S')}] Conectado com sucesso. Executando deploy.sh...")
    stdin, stdout, stderr = ssh.exec_command(command, get_pty=True)
    
    while True:
        try:
            line = stdout.readline()
            if not line:
                break
            print(line.encode('utf-8', 'ignore').decode('utf-8', 'ignore'), end="")
        except Exception:
            pass
        
    exit_status = stdout.channel.recv_exit_status()
    print(f"\n[{time.strftime('%H:%M:%S')}] Deploy finalizado com status: {exit_status}")
    
    ssh.close()
    
except Exception as e:
    print(f"Falha ao executar deploy na VPS: {e}")
    sys.exit(1)
