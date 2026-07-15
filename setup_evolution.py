import paramiko

host = '187.127.11.172'
port = 22
username = 'root'
password = 'Magister25@@'

docker_compose_content = """version: '3.3'
services:
  evolution-api:
    image: evoapicloud/evolution-api:latest
    container_name: evolution-api
    restart: always
    ports:
      - "8080:8080"
    environment:
      - SERVER_URL=https://api-wa.magistertech.com.br
      - CORS_ORIGIN=*
      - CORS_METHODS=GET,POST,PUT,DELETE
      - CORS_CREDENTIALS=true
      - LOG_LEVEL=ERROR
      - DATABASE_PROVIDER=postgresql
      - DATABASE_CONNECTION_URI=postgresql://postgres:magisterWA25%40%40@evolution-db:5432/evolution?schema=public
      - DATABASE_CONNECTION_CLIENT_NAME=evolution-api
      - REDIS_URI=redis://evolution-redis:6379/1
      - REDIS_PREFIX_KEY=evolution
      - RABBITMQ_ENABLED=false
      - WEBSOCKET_ENABLED=false
      - AUTHENTICATION_API_KEY=B4B0B7A6-5B8B-48F8-953D-E4562DBF0E7C
      - AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true
    depends_on:
      - evolution-db
      - evolution-redis
    networks:
      - evolution-net

  evolution-db:
    image: postgres:15
    container_name: evolution-db
    restart: always
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=magisterWA25@@
      - POSTGRES_DB=evolution
    volumes:
      - evolution-pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - evolution-net

  evolution-redis:
    image: redis:7
    container_name: evolution-redis
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - evolution-redisdata:/data
    ports:
      - "6379:6379"
    networks:
      - evolution-net

volumes:
  evolution-pgdata:
  evolution-redisdata:

networks:
  evolution-net:
    driver: bridge
"""

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, port, username, password, timeout=10)
    
    # Escreve arquivo docker-compose
    sftp = ssh.open_sftp()
    
    try:
        sftp.mkdir('/var/www/evolution-api')
    except:
        pass
        
    with sftp.open('/var/www/evolution-api/docker-compose.yml', 'w') as f:
        f.write(docker_compose_content)
        
    sftp.close()
    
    print("--- DOCKER COMPOSE UP ---")
    stdin, stdout, stderr = ssh.exec_command("cd /var/www/evolution-api && docker compose up -d")
    print(stdout.read().decode('utf-8', 'ignore'))
    print(stderr.read().decode('utf-8', 'ignore'))
    
    ssh.close()
except Exception as e:
    print(f"Erro: {e}")
