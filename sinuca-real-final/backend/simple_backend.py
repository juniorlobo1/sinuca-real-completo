from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Dados simulados
users_db = [
    {
        'id': 1,
        'email': 'joao@exemplo.com',
        'username': 'joao_pro',
        'name': 'João Silva',
        'level': 15,
        'experience': 2450,
        'experience_to_next': 3000,
        'balance': 250.00,
        'total_winnings': 1850.00,
        'games_played': 45,
        'games_won': 32,
        'win_rate': 71.1,
        'skill_rating': 1380,
        'rank': 'Ouro',
        'achievements_list': ['Primeira Vitória', 'Sequência de 5', 'Mestre da Quebra'],
        'friends': 12,
        'is_online': True
    }
]

@app.route('/api/health')
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'Sinuca Real API',
        'version': '2.0.0',
        'database': 'connected'
    })

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').lower()
    password = data.get('password', '')
    
    user = next((u for u in users_db if u['email'] == email), None)
    
    if user and password == '123456':
        return jsonify({
            'message': 'Login realizado com sucesso',
            'user': user,
            'token': 'fake_jwt_token_' + str(user['id'])
        })
    else:
        return jsonify({'error': 'Email ou senha incorretos'}), 401

if __name__ == '__main__':
    print('✅ Backend Sinuca Real iniciado na porta 5001!')
    app.run(host='0.0.0.0', port=5001, debug=True)
