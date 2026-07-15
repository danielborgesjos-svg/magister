import paramiko
import sys

host = '187.127.11.172'
port = 22
username = 'root'
password = 'Magister25@@'

fix_command = "sed -i 's/npx prisma migrate dev --name init/npx prisma db push --accept-data-loss/g' /var/www/magister/deploy.sh"
fix_command2 = "sed -i 's/npx prisma migrate deploy/npx prisma db push --accept-data-loss/g' /var/www/magister/deploy.sh"
run_command = 'cd /var/www/magister && bash deploy.sh'

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, port, username, password, timeout=10)
    
    # Fix the deploy.sh script
    ssh.exec_command(fix_command)
    ssh.exec_command(fix_command2)
    
    print("Executando deploy.sh corrigido...")
    stdin, stdout, stderr = ssh.exec_command(run_command, get_pty=True)
    
    while True:
        try:
            line = stdout.readline()
            if not line:
                break
            print(line.encode('utf-8', 'ignore').decode('utf-8', 'ignore'), end="")
        except Exception:
            pass
            
    ssh.close()
    
except Exception as e:
    print(f"Erro: {e}")
