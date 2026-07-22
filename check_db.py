import paramiko
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.127.11.172', 22, 'root', 'Magister25@@', timeout=10)

stdin, stdout, stderr = ssh.exec_command('sqlite3 /var/www/magister/prod.db "SELECT * FROM ConversaWA;"')
print('--- CONVERSAS ---')
for line in stdout:
    print(line.strip().encode('ascii', 'ignore').decode())

stdin, stdout, stderr = ssh.exec_command('sqlite3 /var/www/magister/prod.db "SELECT * FROM MensagemWA;"')
print('--- MENSAGENS ---')
for line in stdout:
    print(line.strip().encode('ascii', 'ignore').decode())

stdin, stdout, stderr = ssh.exec_command('pm2 logs magister-erp --lines 20 --nostream')
print('--- LOGS ---')
for line in stdout:
    print(line.strip().encode('ascii', 'ignore').decode())
