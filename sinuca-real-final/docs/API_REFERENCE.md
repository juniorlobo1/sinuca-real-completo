# 📚 API Reference - Sinuca Real

## 🔗 Base URL
```
Desenvolvimento: http://localhost:5001
Produção: https://api.sinuca-real.com
```

## 🔐 Autenticação

### Headers Obrigatórios
```http
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

### Obter Token
```http
POST /api/auth/login
```

## 📋 Endpoints

### 🔐 Autenticação

#### POST /api/auth/login
Fazer login no sistema.

**Request:**
```json
{
  "email": "joao@exemplo.com",
  "password": "123456"
}
```

**Response (200):**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "username": "joao_pro",
    "level": 15,
    "rank": "Ouro",
    "skill_rating": 1380,
    "balance": 250.00,
    "experience": 2450,
    "games_played": 45,
    "games_won": 32,
    "win_rate": 71.1,
    "total_winnings": 1850.00
  }
}
```

**Response (401):**
```json
{
  "error": "Email ou senha incorretos"
}
```

#### POST /api/auth/register
Criar nova conta.

**Request:**
```json
{
  "name": "Maria Silva",
  "username": "maria_pro",
  "email": "maria@exemplo.com",
  "password": "123456"
}
```

**Response (201):**
```json
{
  "message": "Usuário criado com sucesso",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 2,
    "name": "Maria Silva",
    "email": "maria@exemplo.com",
    "username": "maria_pro",
    "level": 1,
    "rank": "Bronze",
    "skill_rating": 1000,
    "balance": 50.00,
    "experience": 0
  }
}
```

#### GET /api/auth/profile
Obter perfil do usuário logado.

**Headers:**
```http
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "username": "joao_pro",
    "level": 15,
    "rank": "Ouro",
    "skill_rating": 1380,
    "balance": 250.00
  }
}
```

### 👤 Usuários

#### GET /api/users/leaderboard
Obter ranking de jogadores.

**Query Parameters:**
- `limit` (optional): Número de usuários (padrão: 10, máximo: 50)

**Response (200):**
```json
{
  "leaderboard": [
    {
      "id": 1,
      "name": "João Silva",
      "username": "joao_pro",
      "rank": "Ouro",
      "skill_rating": 1380,
      "games_won": 32,
      "win_rate": 71.1
    }
  ]
}
```

#### GET /api/users/search
Buscar usuários.

**Query Parameters:**
- `q`: Termo de busca (nome ou username)
- `limit` (optional): Número de resultados (padrão: 10)

**Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "name": "João Silva",
      "username": "joao_pro",
      "rank": "Ouro",
      "level": 15,
      "skill_rating": 1380
    }
  ]
}
```

### 🎮 Jogos

#### POST /api/games/create
Criar nova partida.

**Request:**
```json
{
  "bet_amount": 25.00,
  "game_type": "8ball"
}
```

**Response (201):**
```json
{
  "message": "Partida criada com sucesso",
  "game": {
    "id": 1,
    "creator_id": 1,
    "bet_amount": 25.00,
    "total_prize": 47.50,
    "platform_fee": 2.50,
    "status": "waiting",
    "game_type": "8ball",
    "created_at": "2025-06-28T01:00:00Z"
  }
}
```

#### POST /api/games/{game_id}/join
Entrar em uma partida.

**Response (200):**
```json
{
  "message": "Entrou na partida com sucesso",
  "game": {
    "id": 1,
    "player1_id": 1,
    "player2_id": 2,
    "status": "in_progress",
    "bet_amount": 25.00,
    "total_prize": 47.50
  }
}
```

#### POST /api/games/{game_id}/finish
Finalizar partida.

**Request:**
```json
{
  "winner_id": 1,
  "score": {
    "player1": 8,
    "player2": 3
  }
}
```

**Response (200):**
```json
{
  "message": "Partida finalizada",
  "game": {
    "id": 1,
    "winner_id": 1,
    "status": "finished",
    "prize_distributed": 47.50
  }
}
```

### 💰 Apostas

#### GET /api/betting/bets
Listar apostas disponíveis.

**Query Parameters:**
- `limit` (optional): Número de apostas (padrão: 10)
- `min_amount` (optional): Valor mínimo
- `max_amount` (optional): Valor máximo

**Response (200):**
```json
{
  "bets": [
    {
      "id": 1,
      "creator": {
        "id": 1,
        "name": "Carlos Silva",
        "rank": "Ouro",
        "level": 18,
        "skill_rating": 1380
      },
      "amount": 25.00,
      "total_prize": 47.50,
      "platform_fee": 2.50,
      "status": "open",
      "created_at": "2025-06-28T01:00:00Z"
    }
  ]
}
```

#### POST /api/betting/create
Criar nova aposta.

**Request:**
```json
{
  "amount": 25.00,
  "game_type": "8ball",
  "description": "Partida rápida - Nível Ouro"
}
```

#### POST /api/betting/{bet_id}/accept
Aceitar uma aposta.

**Response (200):**
```json
{
  "message": "Aposta aceita com sucesso",
  "bet": {
    "id": 1,
    "status": "matched",
    "game_id": 1
  }
}
```

#### GET /api/betting/my-bets
Listar minhas apostas.

**Response (200):**
```json
{
  "bets": [
    {
      "id": 1,
      "amount": 25.00,
      "status": "won",
      "prize": 47.50,
      "opponent": "Maria Costa",
      "created_at": "2025-06-28T01:00:00Z"
    }
  ]
}
```

### 💳 Pagamentos

#### GET /api/payments/payment-methods
Obter métodos de pagamento disponíveis.

**Response (200):**
```json
{
  "pix": {
    "available": true,
    "min_amount": 10.00,
    "max_amount": 5000.00,
    "processing_time": "Instantâneo"
  },
  "credit_card": {
    "available": true,
    "min_amount": 10.00,
    "max_amount": 5000.00,
    "max_installments": 12,
    "processing_time": "Instantâneo"
  }
}
```

#### POST /api/payments/deposit/pix
Criar depósito via PIX.

**Request:**
```json
{
  "amount": 50.00
}
```

**Response (201):**
```json
{
  "message": "Pagamento PIX criado com sucesso",
  "transaction_id": 1,
  "payment_id": "MP_12345678",
  "qr_code": "00020126580014br.gov.bcb.pix...",
  "qr_code_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...",
  "ticket_url": "https://mercadopago.com/mlb/checkout/pix/MP_12345678",
  "amount": 50.00,
  "expires_at": "2025-06-28T01:30:00Z",
  "status": "pending"
}
```

#### POST /api/payments/withdraw
Solicitar saque.

**Request:**
```json
{
  "amount": 100.00,
  "pix_key": "joao@exemplo.com"
}
```

**Response (201):**
```json
{
  "message": "Solicitação de saque criada com sucesso",
  "transaction_id": 2,
  "amount": 100.00,
  "pix_key": "joao@exemplo.com",
  "status": "pending",
  "estimated_time": "1-2 dias úteis"
}
```

#### GET /api/payments/transactions
Obter histórico de transações.

**Query Parameters:**
- `limit` (optional): Número de transações (padrão: 20, máximo: 50)

**Response (200):**
```json
{
  "transactions": [
    {
      "id": 1,
      "type": "deposit",
      "amount": 50.00,
      "status": "approved",
      "payment_method": "pix",
      "description": "Depósito via PIX - R$ 50,00",
      "created_at": "2025-06-28T01:00:00Z",
      "icon": "💰",
      "color": "green"
    }
  ]
}
```

#### GET /api/payments/payment/{payment_id}/status
Consultar status de pagamento.

**Response (200):**
```json
{
  "payment_id": "MP_12345678",
  "status": "approved",
  "status_detail": "accredited",
  "amount": 50.00,
  "date_created": "2025-06-28T01:00:00Z",
  "date_approved": "2025-06-28T01:01:00Z"
}
```

#### POST /api/payments/webhook
Webhook do Mercado Pago (interno).

**Request:**
```json
{
  "type": "payment",
  "data": {
    "id": "12345678"
  }
}
```

### 🏥 Sistema

#### GET /api/health
Verificar saúde da API.

**Response (200):**
```json
{
  "status": "healthy",
  "service": "Sinuca Real API",
  "version": "1.0.0",
  "timestamp": "2025-06-28T01:00:00Z",
  "database": "connected",
  "mercadopago": "integrated"
}
```

## 📊 Códigos de Status

### Sucesso
- `200` - OK
- `201` - Created
- `204` - No Content

### Erro do Cliente
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity

### Erro do Servidor
- `500` - Internal Server Error
- `502` - Bad Gateway
- `503` - Service Unavailable

## 🔒 Rate Limiting

### Limites por Endpoint
- **Login:** 5 tentativas/minuto por IP
- **Registro:** 3 tentativas/minuto por IP
- **Pagamentos:** 10 requests/minuto por usuário
- **Geral:** 100 requests/minuto por usuário

### Headers de Rate Limit
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🧪 Exemplos de Uso

### JavaScript (Fetch)
```javascript
// Login
const response = await fetch('http://localhost:5001/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'joao@exemplo.com',
    password: '123456'
  })
});

const data = await response.json();
const token = data.token;

// Usar token em requests subsequentes
const profileResponse = await fetch('http://localhost:5001/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Python (Requests)
```python
import requests

# Login
response = requests.post('http://localhost:5001/api/auth/login', json={
    'email': 'joao@exemplo.com',
    'password': '123456'
})

data = response.json()
token = data['token']

# Usar token
headers = {'Authorization': f'Bearer {token}'}
profile = requests.get('http://localhost:5001/api/auth/profile', headers=headers)
```

### cURL
```bash
# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@exemplo.com","password":"123456"}'

# Usar token
curl -X GET http://localhost:5001/api/auth/profile \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

## 📞 Suporte

Para dúvidas sobre a API:
- **Email:** dev@sinuca-real.com
- **Discord:** discord.gg/sinuca-real-dev
- **GitHub:** github.com/sinuca-real/api/issues

---

**API Version: 1.0.0**  
**Last Updated: 28/06/2025**

