# 🚀 Guia de Instalação - Sinuca Real

## 📋 Pré-requisitos

### Sistema Operacional
- **Linux:** Ubuntu 20.04+ (recomendado)
- **Windows:** Windows 10+ com WSL2
- **macOS:** macOS 11+

### Dependências Obrigatórias
- **Node.js:** 18.0+ ([Download](https://nodejs.org/))
- **Python:** 3.9+ ([Download](https://python.org/))
- **Git:** Para clonagem do repositório
- **PostgreSQL:** 13+ (para produção)

### Ferramentas Recomendadas
- **VS Code:** Editor de código
- **Postman:** Testes de API
- **pgAdmin:** Gerenciamento PostgreSQL

## 🔧 Instalação Local

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/sinuca-real.git
cd sinuca-real
```

### 2. Configurar Backend

#### 2.1 Criar Ambiente Virtual
```bash
cd backend
python -m venv venv

# Linux/macOS
source venv/bin/activate

# Windows
venv\Scripts\activate
```

#### 2.2 Instalar Dependências
```bash
pip install -r requirements.txt
```

#### 2.3 Configurar Variáveis de Ambiente
```bash
cp .env.example .env
```

Editar `.env`:
```env
# Banco de Dados
DATABASE_URL=sqlite:///sinuca_real.db
# Para PostgreSQL: postgresql://user:pass@localhost/sinuca_real

# JWT
JWT_SECRET_KEY=sua_chave_secreta_super_forte_aqui

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890-123456-abcdef123456789-123456789
MERCADOPAGO_PUBLIC_KEY=TEST-abcdef12-3456-7890-abcd-ef1234567890

# Flask
FLASK_ENV=development
FLASK_DEBUG=True
```

#### 2.4 Inicializar Banco de Dados
```bash
python src/main.py
# O banco será criado automaticamente na primeira execução
```

### 3. Configurar Frontend

#### 3.1 Instalar Dependências
```bash
cd ../frontend
npm install
# ou
pnpm install
```

#### 3.2 Configurar Variáveis de Ambiente
```bash
cp .env.example .env.local
```

Editar `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:5001
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-abcdef12-3456-7890-abcd-ef1234567890
```

### 4. Executar o Sistema

#### 4.1 Iniciar Backend
```bash
cd backend
source venv/bin/activate  # Linux/macOS
python src/main.py
```
Backend rodará em: `http://localhost:5001`

#### 4.2 Iniciar Frontend
```bash
cd frontend
npm run dev
# ou
pnpm run dev
```
Frontend rodará em: `http://localhost:5173`

## 🌐 Deploy em Produção

### 1. Railway (Recomendado)

#### 1.1 Preparar Backend
```bash
# Criar Procfile
echo "web: python src/main.py" > Procfile

# Criar railway.json
cat > railway.json << EOF
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python src/main.py",
    "healthcheckPath": "/api/health"
  }
}
EOF
```

#### 1.2 Deploy Backend
1. Acesse [railway.app](https://railway.app)
2. Conecte seu repositório GitHub
3. Configure variáveis de ambiente:
   - `DATABASE_URL`: PostgreSQL fornecido pelo Railway
   - `JWT_SECRET_KEY`: Chave forte para produção
   - `MERCADOPAGO_ACCESS_TOKEN`: Token de produção
   - `FLASK_ENV`: production

#### 1.3 Deploy Frontend (Vercel)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### 2. Docker (Alternativo)

#### 2.1 Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5001

CMD ["python", "src/main.py"]
```

#### 2.2 Frontend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
```

#### 2.3 Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5001:5001"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/sinuca_real
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  db:
    image: postgres:13
    environment:
      POSTGRES_DB: sinuca_real
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🔒 Configuração de Segurança

### 1. Certificado SSL
```bash
# Certbot (Let's Encrypt)
sudo apt install certbot
sudo certbot --nginx -d seudominio.com
```

### 2. Firewall
```bash
# UFW (Ubuntu)
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 3. Nginx (Proxy Reverso)
```nginx
server {
    listen 80;
    server_name seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name seudominio.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🧪 Testes

### 1. Testes Backend
```bash
cd backend
python -m pytest tests/
```

### 2. Testes Frontend
```bash
cd frontend
npm run test
```

### 3. Testes E2E
```bash
npm run test:e2e
```

## 📊 Monitoramento

### 1. Logs
```bash
# Backend logs
tail -f backend/logs/app.log

# Nginx logs
tail -f /var/log/nginx/access.log
```

### 2. Métricas
- **Uptime:** [UptimeRobot](https://uptimerobot.com)
- **Performance:** [New Relic](https://newrelic.com)
- **Erros:** [Sentry](https://sentry.io)

## 🔧 Troubleshooting

### Problemas Comuns

#### Backend não inicia
```bash
# Verificar logs
python src/main.py

# Verificar dependências
pip list

# Recriar ambiente
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Frontend não conecta com Backend
```bash
# Verificar CORS
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:5001/api/health

# Verificar variáveis de ambiente
cat .env.local
```

#### Erro de Banco de Dados
```bash
# Recriar banco SQLite
rm backend/sinuca_real.db
python backend/src/main.py

# PostgreSQL - verificar conexão
psql $DATABASE_URL -c "SELECT version();"
```

## 📞 Suporte

### Contatos
- **Email:** suporte@sinuca-real.com
- **Discord:** discord.gg/sinuca-real
- **GitHub Issues:** github.com/seu-usuario/sinuca-real/issues

### Documentação Adicional
- [API Reference](./API_REFERENCE.md)
- [Guia do Usuário](./GUIA_USUARIO.md)
- [FAQ](./FAQ.md)

---

**Desenvolvido com ❤️ pela equipe Sinuca Real**

