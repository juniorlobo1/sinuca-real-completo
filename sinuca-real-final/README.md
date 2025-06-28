# 🎱 Sinuca Real - Sistema Completo

## 📋 Visão Geral

O **Sinuca Real** é uma plataforma completa de jogos de sinuca online com apostas em dinheiro real. O sistema permite que jogadores se enfrentem em partidas de 8-ball pool apostando valores reais, com a plataforma ficando com 5% de comissão.

## 🎯 Funcionalidades Principais

### 🎮 Jogo de Sinuca
- **Engine de física realista** com colisões precisas
- **Controles intuitivos** (mouse para mira, espaço para força)
- **Regras completas do 8-ball pool**
- **Sistema de turnos** automático
- **Interface responsiva** para desktop e mobile

### 👤 Sistema de Usuários
- **Cadastro e login** com validação
- **Perfis completos** com avatar, nível, experiência
- **Sistema de rankings** (Bronze, Prata, Ouro, Platina, Diamante)
- **Estatísticas detalhadas** (partidas, vitórias, taxa de sucesso)
- **Sistema de conquistas** e badges

### 💰 Sistema de Apostas
- **Apostas peer-to-peer** entre jogadores
- **Cálculo automático** da taxa de 5% da plataforma
- **Sistema de escrow** para segurança
- **Matchmaking inteligente** por nível
- **Histórico completo** de apostas

### 💳 Pagamentos Reais
- **Integração Mercado Pago** oficial
- **PIX instantâneo** com QR Code
- **Cartão de crédito/débito** até 12x
- **Saques via PIX** em 1-2 dias úteis
- **Carteira virtual** com saldo em tempo real

## 🏗️ Arquitetura

### Frontend (React + Vite)
```
frontend/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/         # Páginas da aplicação
│   ├── services/      # Integração com APIs
│   ├── utils/         # Utilitários
│   └── styles/        # Estilos globais
├── public/            # Arquivos estáticos
└── package.json       # Dependências
```

### Backend (Flask + SQLAlchemy)
```
backend/
├── src/
│   ├── models/        # Modelos de dados
│   ├── routes/        # Endpoints da API
│   ├── services/      # Lógica de negócio
│   └── utils/         # Utilitários
├── requirements.txt   # Dependências Python
└── Procfile          # Configuração Railway
```

### Banco de Dados (PostgreSQL)
```
database/
├── init.sql          # Schema inicial
├── migrations/       # Migrações
└── seeds/           # Dados de exemplo
```

## 🚀 Deploy

### Ambiente de Produção
- **Frontend:** Vercel/Netlify
- **Backend:** Railway
- **Banco:** PostgreSQL (Railway)
- **CDN:** Cloudflare
- **Domínio:** sinuca-real.com

### Configuração
1. **Variáveis de ambiente**
2. **Credenciais Mercado Pago**
3. **Configuração de CORS**
4. **SSL/HTTPS obrigatório**

## 🔒 Segurança

### Autenticação
- **JWT tokens** com expiração
- **Senhas criptografadas** (bcrypt)
- **Rate limiting** nas APIs
- **Validação de entrada** rigorosa

### Pagamentos
- **Ambiente sandbox** para testes
- **Webhooks seguros** do Mercado Pago
- **Validação de transações**
- **Logs de auditoria** completos

## 📊 Modelo de Negócio

### Receita
- **5% de comissão** sobre todas as apostas
- **Volume estimado:** R$ 10.000/mês
- **Receita mensal:** R$ 500
- **Margem líquida:** ~80% após custos

### Custos
- **Hosting:** R$ 50/mês
- **Domínio:** R$ 50/ano
- **Mercado Pago:** 3.99% + R$ 0,40 por transação
- **Manutenção:** R$ 200/mês

## 🎯 Roadmap

### Versão 1.0 (Atual)
- ✅ Jogo básico de sinuca
- ✅ Sistema de usuários
- ✅ Apostas simples
- ✅ Pagamentos PIX/cartão

### Versão 1.1 (Próximos 30 dias)
- 🔄 Torneios automáticos
- 🔄 Chat em tempo real
- 🔄 Sistema de amigos
- 🔄 Notificações push

### Versão 2.0 (Próximos 90 dias)
- 🔄 App mobile nativo
- 🔄 Múltiplos tipos de jogo
- 🔄 Sistema de ligas
- 🔄 Programa de afiliados

## 📱 Tecnologias

### Frontend
- **React 18** - Framework principal
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **React Query** - Gerenciamento de estado

### Backend
- **Flask** - Framework web
- **SQLAlchemy** - ORM
- **JWT** - Autenticação
- **Mercado Pago SDK** - Pagamentos
- **PostgreSQL** - Banco de dados

### DevOps
- **Railway** - Deploy backend
- **Vercel** - Deploy frontend
- **GitHub Actions** - CI/CD
- **Sentry** - Monitoramento de erros

## 📞 Suporte

### Contato
- **Email:** suporte@sinuca-real.com
- **WhatsApp:** (11) 99999-9999
- **Discord:** discord.gg/sinuca-real

### Documentação
- **API Docs:** /docs
- **Guia do Usuário:** /help
- **FAQ:** /faq

---

**Desenvolvido com ❤️ pela equipe Sinuca Real**

