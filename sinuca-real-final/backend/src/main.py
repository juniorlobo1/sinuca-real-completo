import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta

# Importar modelos
from src.models.database import db
from src.models.user import User
from src.models.game import Game, Bet
from src.models.transaction import Transaction

from src.routes.auth import auth_bp
from src.routes.user import user_bp
from src.routes.game import game_bp
from src.routes.betting import betting_bp
from src.routes.payments import payments_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Configurações
app.config['SECRET_KEY'] = 'sinuca_real_super_secret_key_2025'
app.config['JWT_SECRET_KEY'] = 'sinuca_real_jwt_secret_key_2025'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Configuração do banco de dados
database_path = os.path.join(os.path.dirname(__file__), 'database', 'sinuca_real.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{database_path}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar extensões - CORS corrigido para usar variável de ambiente
cors_origin = os.getenv('CORS_ORIGIN', 'https://junior-lobo.vercel.app')
CORS(app, origins=[cors_origin])  # Usar variável de ambiente para CORS
jwt = JWTManager(app)
db.init_app(app)

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(game_bp, url_prefix='/api/games')
app.register_blueprint(betting_bp, url_prefix='/api/betting')
app.register_blueprint(payments_bp, url_prefix='/api/payments')

# Criar tabelas e dados iniciais
with app.app_context():
    db.create_all()
    
    # Verificar se já existem usuários
    if User.query.count() == 0:
        # Criar usuários de exemplo
        from werkzeug.security import generate_password_hash
        
        users_data = [
            {
                'email': 'joao@exemplo.com',
                'username': 'joao_pro',
                'name': 'João Silva',
                'password_hash': generate_password_hash('123456'),
                'balance': 250.00,
                'level': 15,
                'experience': 2450,
                'skill_rating': 1380,
                'games_played': 45,
                'games_won': 32,
                'total_winnings': 1850.00
            },
            {
                'email': 'maria@exemplo.com',
                'username': 'maria_queen',
                'name': 'Maria Costa',
                'password_hash': generate_password_hash('123456'),
                'balance': 180.00,
                'level': 22,
                'experience': 4200,
                'skill_rating': 1520,
                'games_played': 78,
                'games_won': 61,
                'total_winnings': 3200.00
            },
            {
                'email': 'carlos@exemplo.com',
                'username': 'carlos_master',
                'name': 'Carlos Lima',
                'password_hash': generate_password_hash('123456'),
                'balance': 75.00,
                'level': 8,
                'experience': 850,
                'skill_rating': 1200,
                'games_played': 23,
                'games_won': 12,
                'total_winnings': 450.00
            }
        ]
        
        for user_data in users_data:
            user = User(**user_data)
            db.session.add(user)
        
        # Criar algumas apostas de exemplo
        bets_data = [
            {
                'creator_id': 3,
                'amount': 25.00,
                'platform_fee': 2.50,
'total_prize': 47.50,
'status': 'open'
},
{
'creator_id': 2,
'amount': 50.00,
'platform_fee': 5.00,
'total_prize': 95.00,
'status': 'open'
},
{
'creator_id': 1,
'amount': 10.00,
'platform_fee': 1.00,
'total_prize': 19.00,
'status': 'open'
}
]

for bet_data in bets_data:
bet = Bet(**bet_data)
db.session.add(bet)

db.session.commit()
print("✅ Dados iniciais criados com sucesso!")

# Rota de health check
@app.route('/api/health')
def health_check():
return {
'status': 'healthy',
'service': 'Sinuca Real API',
'version': '2.0.0',
'database': 'connected'
}

# Rota para servir frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
static_folder_path = app.static_folder
if static_folder_path is None:
return "Static folder not configured", 404

if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
return send_from_directory(static_folder_path, path)
else:
index_path = os.path.join(static_folder_path, 'index.html')
if os.path.exists(index_path):
return send_from_directory(static_folder_path, 'index.html')
else:
return {
'message': 'Sinuca Real API',
'status': 'running',
'endpoints': [
'/api/health',
'/api/auth/login',
'/api/auth/register',
'/api/users/profile',
'/api/betting/bets',
'/api/games/create'
]
}

if __name__ == '__main__':
app.run(host='0.0.0.0', port=5000, debug=Trueção CORS para usar variável de ambiente)
