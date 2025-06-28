# 🚀 GUIA PASSO A PASSO: DEPLOY RAILWAY

## 📋 **CHECKLIST PRÉ-DEPLOY**

### ✅ **Arquivos Necessários:**
- [ ] `Procfile` - Comando de inicialização
- [ ] `railway.json` - Configuração Railway
- [ ] `requirements.txt` - Dependências Python
- [ ] `.env.example` - Exemplo de variáveis
- [ ] `init.sql` - Script do banco
- [ ] Código fonte completo

### ✅ **Informações Necessárias:**
- [ ] Link do repositório GitHub
- [ ] Tokens Mercado Pago produção
- [ ] Domínio desejado (sinucareal.com)
- [ ] Acesso ao Railway

---

## 🔧 **PASSO 1: CONFIGURAÇÃO INICIAL**

### **1.1 Criar Projeto Railway:**
```bash
1. Acesse railway.app
2. New Project
3. Deploy from GitHub repo
4. Selecione: sinuca-real-production
5. Aguarde build inicial
```

### **1.2 Adicionar PostgreSQL:**
```bash
1. No projeto → Add Service
2. Database → PostgreSQL
3. Aguarde provisioning
4. Copiar DATABASE_URL
```

---

## ⚙️ **PASSO 2: VARIÁVEIS DE AMBIENTE**

### **2.1 Configurar Backend:**
```bash
# No Railway Dashboard → Variables:

DATABASE_URL=postgresql://postgres:senha@host:5432/railway
JWT_SECRET_KEY=[GERAR_CHAVE_FORTE]
MERCADOPAGO_ACCESS_TOKEN=APP_USR-[TOKEN_PRODUCAO]
MERCADOPAGO_PUBLIC_KEY=APP_USR-[CHAVE_PUBLICA]
FLASK_ENV=production
FLASK_DEBUG=False
PORT=5000
FRONTEND_URL=https://sinucareal.com
ALLOWED_ORIGINS=https://sinucareal.com,https://www.sinucareal.com
```

### **2.2 Gerar JWT Secret:**
```python
# Executar para gerar chave:
import secrets
print(secrets.token_urlsafe(32))
# Resultado: algo como "xK8j2mN9pQ7rS5tU3vW1xY4zA6bC8dE0fG2hI4jK6lM"
```

---

## 🗄️ **PASSO 3: CONFIGURAÇÃO DO BANCO**

### **3.1 Conectar ao PostgreSQL:**
```bash
# No Railway → PostgreSQL → Connect:
1. Copiar connection string
2. Usar psql ou pgAdmin
3. Executar script init.sql
```

### **3.2 Executar Script de Inicialização:**
```sql
-- Conectar ao banco e executar:
\i init.sql

-- Verificar criação:
\dt  -- Listar tabelas
SELECT COUNT(*) FROM users;  -- Verificar dados
```

---

## 🌐 **PASSO 4: CONFIGURAÇÃO DE DOMÍNIO**

### **4.1 Configurar DNS:**
```bash
# No provedor do domínio (Registro.br, GoDaddy, etc):
Tipo: CNAME
Nome: @
Valor: [railway-domain].railway.app

Tipo: CNAME  
Nome: www
Valor: [railway-domain].railway.app
```

### **4.2 Configurar no Railway:**
```bash
1. Railway → Settings → Domains
2. Add Domain: sinucareal.com
3. Add Domain: www.sinucareal.com
4. Aguarde SSL provisioning
```

---

## 💳 **PASSO 5: CONFIGURAÇÃO MERCADO PAGO**

### **5.1 Webhook Configuration:**
```bash
# No Mercado Pago Dashboard:
1. Integrações → Webhooks
2. URL: https://api-sinucareal.railway.app/api/payments/webhook
3. Eventos: payment, merchant_order
4. Salvar configuração
```

### **5.2 Testar Integração:**
```bash
# Endpoints para testar:
GET /api/health
POST /api/auth/login
GET /api/payments/payment-methods
```

---

## 🧪 **PASSO 6: TESTES COMPLETOS**

### **6.1 Health Checks:**
```bash
# Verificar endpoints:
✅ https://api-sinucareal.railway.app/api/health
✅ https://sinucareal.com (frontend)
✅ SSL Grade A (ssllabs.com)
✅ Performance > 90 (PageSpeed)
```

### **6.2 Funcionalidades:**
```bash
# Testar fluxo completo:
✅ Cadastro de usuário
✅ Login funcionando
✅ Dashboard carregando
✅ Criação de apostas
✅ Sistema de pagamentos
✅ Jogo de sinuca
```

### **6.3 Pagamentos:**
```bash
# Testar com valores baixos:
✅ PIX R$ 1,00
✅ Cartão R$ 1,00
✅ Webhook recebido
✅ Saldo atualizado
```

---

## 📊 **PASSO 7: MONITORAMENTO**

### **7.1 Configurar Alertas:**
```bash
# No Railway:
1. Settings → Notifications
2. Email alerts para downtime
3. Slack/Discord webhook (opcional)
```

### **7.2 Métricas Importantes:**
```bash
📈 Uptime: > 99.9%
⚡ Response Time: < 2s
💾 Memory Usage: < 80%
🔄 CPU Usage: < 70%
🗄️ DB Connections: < 80%
```

---

## 🔒 **PASSO 8: SEGURANÇA**

### **8.1 Verificações de Segurança:**
```bash
✅ HTTPS obrigatório
✅ JWT tokens seguros
✅ CORS configurado
✅ Rate limiting ativo
✅ Senhas criptografadas
✅ Variáveis protegidas
```

### **8.2 Backup e Recovery:**
```bash
# Configurar backup automático:
1. Railway → PostgreSQL → Backups
2. Frequência: Diária
3. Retenção: 30 dias
4. Testar restore
```

---

## 📚 **PASSO 9: DOCUMENTAÇÃO**

### **9.1 Credenciais de Acesso:**
```bash
🌐 URLs Produção:
- Frontend: https://sinucareal.com
- Backend: https://api-sinucareal.railway.app
- Admin: https://railway.app/project/[id]

🔐 Acessos:
- Railway: [email/senha]
- PostgreSQL: [connection string]
- Mercado Pago: [dashboard login]

📊 Monitoramento:
- Health: /api/health
- Logs: Railway Dashboard
- Métricas: Railway Analytics
```

### **9.2 Contatos de Suporte:**
```bash
🆘 Suporte Técnico:
- Railway: help@railway.app
- Mercado Pago: developers@mercadopago.com
- DNS: suporte@registro.br

📞 Emergência:
- Status Railway: status.railway.app
- Status MP: status.mercadopago.com
- Documentação: docs.railway.app
```

---

## 🎯 **CHECKLIST FINAL**

### ✅ **Antes de Ir ao Ar:**
- [ ] Todos os testes passando
- [ ] SSL configurado e funcionando
- [ ] Domínio apontando corretamente
- [ ] Webhooks Mercado Pago ativos
- [ ] Backup configurado
- [ ] Monitoramento ativo
- [ ] Documentação entregue
- [ ] Credenciais compartilhadas

### ✅ **Pós-Deploy:**
- [ ] Monitorar logs por 24h
- [ ] Testar transações reais
- [ ] Verificar performance
- [ ] Confirmar uptime
- [ ] Validar métricas
- [ ] Suporte ativo

---

## 🚨 **TROUBLESHOOTING COMUM**

### **❌ Build Falha:**
```bash
# Verificar:
1. requirements.txt correto
2. Python version compatível
3. Variáveis de ambiente
4. Logs de build
```

### **❌ Banco Não Conecta:**
```bash
# Verificar:
1. DATABASE_URL correto
2. PostgreSQL ativo
3. Firewall/network
4. Credenciais válidas
```

### **❌ Pagamentos Falham:**
```bash
# Verificar:
1. Tokens MP corretos
2. Webhook URL acessível
3. SSL funcionando
4. Logs de erro
```

### **❌ Domínio Não Resolve:**
```bash
# Verificar:
1. DNS propagation (24-48h)
2. CNAME correto
3. SSL provisioning
4. Cache DNS local
```

---

## 🎉 **SUCESSO!**

**Sistema Sinuca Real 100% operacional em produção! 🚀**

**Próximos passos:**
1. 📈 Monitorar métricas
2. 🎮 Receber primeiros usuários
3. 💰 Processar primeiros pagamentos
4. 📊 Analisar performance
5. 🔧 Otimizar conforme necessário

**Parabéns pelo lançamento! 🎱💰**

