-- =============================================
-- SINUCA REAL - INICIALIZAÇÃO BANCO PRODUÇÃO
-- =============================================

-- 🗄️ Extensões PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 👤 Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    skill_rating INTEGER DEFAULT 1000,
    rank VARCHAR(20) DEFAULT 'Bronze',
    balance DECIMAL(10,2) DEFAULT 0.00,
    total_winnings DECIMAL(10,2) DEFAULT 0.00,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🎮 Tabela de Jogos
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    creator_id INTEGER REFERENCES users(id),
    opponent_id INTEGER REFERENCES users(id),
    winner_id INTEGER REFERENCES users(id),
    bet_amount DECIMAL(10,2) NOT NULL,
    total_prize DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting',
    game_type VARCHAR(20) DEFAULT '8ball',
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 💰 Tabela de Apostas
CREATE TABLE IF NOT EXISTS bets (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id),
    creator_id INTEGER REFERENCES users(id),
    acceptor_id INTEGER REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    resolved_at TIMESTAMP
);

-- 💳 Tabela de Transações
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(20) NOT NULL, -- deposit, withdrawal, bet, prize
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(20),
    external_id VARCHAR(100),
    external_reference VARCHAR(100),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 📊 Índices para Performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_games_creator ON games(creator_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_external ON transactions(external_id);

-- 🔄 Triggers para Updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 👥 Usuários de Teste (Produção)
INSERT INTO users (name, username, email, password_hash, level, experience, skill_rating, rank, balance, total_winnings, games_played, games_won, win_rate) VALUES
('Admin Sistema', 'admin', 'admin@sinucareal.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e', 50, 15000, 2000, 'Diamante', 1000.00, 5000.00, 200, 180, 90.00),
('João Silva', 'joao_pro', 'joao@exemplo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e', 15, 2450, 1380, 'Ouro', 250.00, 1850.00, 45, 32, 71.11),
('Maria Costa', 'maria_costa', 'maria@exemplo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e', 22, 4200, 1520, 'Ouro', 180.00, 2100.00, 60, 45, 75.00),
('Carlos Silva', 'carlos_ouro', 'carlos@exemplo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e', 18, 3100, 1380, 'Ouro', 320.00, 1950.00, 52, 38, 73.08),
('Ana Costa', 'ana_ouro', 'ana@exemplo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e', 20, 3800, 1520, 'Ouro', 275.00, 2250.00, 58, 44, 75.86),
('Roberto Lima', 'roberto_prata', 'roberto@exemplo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e', 12, 1800, 1200, 'Prata', 150.00, 980.00, 35, 22, 62.86);

-- 🎮 Jogos de Exemplo
INSERT INTO games (creator_id, opponent_id, winner_id, bet_amount, total_prize, platform_fee, status, finished_at) VALUES
(2, 3, 2, 25.00, 47.50, 2.50, 'finished', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(4, 5, 5, 50.00, 95.00, 5.00, 'finished', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(3, 6, 3, 20.00, 38.00, 2.00, 'finished', CURRENT_TIMESTAMP - INTERVAL '3 hours');

-- 💰 Apostas Abertas
INSERT INTO bets (creator_id, amount, status) VALUES
(2, 25.00, 'open'),
(4, 50.00, 'open'),
(6, 15.00, 'open');

-- 💳 Transações de Exemplo
INSERT INTO transactions (user_id, type, amount, status, payment_method, description) VALUES
(2, 'deposit', 100.00, 'approved', 'pix', 'Depósito via PIX - R$ 100,00'),
(3, 'deposit', 150.00, 'approved', 'pix', 'Depósito via PIX - R$ 150,00'),
(2, 'prize', 47.50, 'approved', 'internal', 'Prêmio de vitória - Jogo #1'),
(4, 'deposit', 200.00, 'approved', 'credit_card', 'Depósito via Cartão - R$ 200,00'),
(5, 'prize', 95.00, 'approved', 'internal', 'Prêmio de vitória - Jogo #2');

-- ✅ Verificação Final
SELECT 'Banco inicializado com sucesso!' as status,
       (SELECT COUNT(*) FROM users) as total_users,
       (SELECT COUNT(*) FROM games) as total_games,
       (SELECT COUNT(*) FROM transactions) as total_transactions;

