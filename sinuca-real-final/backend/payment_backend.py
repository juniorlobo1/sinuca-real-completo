from flask import Flask, jsonify, request
from flask_cors import CORS
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Dados simulados
users_db = [
    {
        'id': 1,
        'email': 'joao@exemplo.com',
        'username': 'joao_pro',
        'name': 'João Silva',
        'balance': 250.00,
        'level': 15
    }
]

transactions_db = []

@app.route('/api/health')
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'Sinuca Real Payment API',
        'version': '2.0.0',
        'mercadopago': 'integrated'
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

@app.route('/api/payments/payment-methods')
def get_payment_methods():
    return jsonify({
        'pix': {
            'available': True,
            'min_amount': 10.00,
            'max_amount': 5000.00,
            'processing_time': 'Instantâneo'
        },
        'credit_card': {
            'available': True,
            'min_amount': 10.00,
            'max_amount': 5000.00,
            'max_installments': 12,
            'processing_time': 'Instantâneo'
        }
    })

@app.route('/api/payments/deposit/pix', methods=['POST'])
def create_pix_deposit():
    data = request.get_json()
    amount = data.get('amount', 0)
    
    if amount < 10:
        return jsonify({'error': 'Valor mínimo é R$ 10,00'}), 400
    
    # Simular criação de pagamento PIX
    transaction_id = len(transactions_db) + 1
    payment_id = f"MP_{uuid.uuid4().hex[:8]}"
    
    transaction = {
        'id': transaction_id,
        'payment_id': payment_id,
        'type': 'deposit',
        'amount': amount,
        'status': 'pending',
        'payment_method': 'pix',
        'created_at': datetime.now().isoformat()
    }
    
    transactions_db.append(transaction)
    
    return jsonify({
        'message': 'Pagamento PIX criado com sucesso',
        'transaction_id': transaction_id,
        'payment_id': payment_id,
        'qr_code': f'00020126580014br.gov.bcb.pix0136{uuid.uuid4()}5204000053039865802BR5925SINUCA REAL LTDA6009SAO PAULO62070503***6304',
        'qr_code_base64': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'ticket_url': f'https://mercadopago.com/mlb/checkout/pix/{payment_id}',
        'amount': amount,
        'expires_at': '2025-06-28T01:30:00.000Z',
        'status': 'pending'
    }), 201

@app.route('/api/payments/payment/<payment_id>/status')
def get_payment_status(payment_id):
    transaction = next((t for t in transactions_db if t['payment_id'] == payment_id), None)
    
    if not transaction:
        return jsonify({'error': 'Pagamento não encontrado'}), 404
    
    return jsonify({
        'payment_id': payment_id,
        'status': transaction['status'],
        'status_detail': 'pending_waiting_payment',
        'amount': transaction['amount'],
        'date_created': transaction['created_at'],
        'date_approved': None
    })

@app.route('/api/payments/transactions')
def get_transactions():
    return jsonify({
        'transactions': [
            {
                **t,
                'icon': '💰' if t['type'] == 'deposit' else '💸',
                'color': 'green' if t['type'] == 'deposit' else 'orange',
                'description': f"Depósito via PIX - R$ {t['amount']:.2f}"
            }
            for t in transactions_db
        ]
    })

@app.route('/api/payments/withdraw', methods=['POST'])
def create_withdrawal():
    data = request.get_json()
    amount = data.get('amount', 0)
    pix_key = data.get('pix_key')
    
    if amount < 20:
        return jsonify({'error': 'Valor mínimo para saque é R$ 20,00'}), 400
    
    if not pix_key:
        return jsonify({'error': 'Chave PIX é obrigatória'}), 400
    
    # Simular saque
    transaction_id = len(transactions_db) + 1
    
    transaction = {
        'id': transaction_id,
        'type': 'withdrawal',
        'amount': amount,
        'status': 'pending',
        'payment_method': 'pix',
        'created_at': datetime.now().isoformat(),
        'pix_key': pix_key
    }
    
    transactions_db.append(transaction)
    
    # Debitar do usuário
    users_db[0]['balance'] -= amount
    
    return jsonify({
        'message': 'Solicitação de saque criada com sucesso',
        'transaction_id': transaction_id,
        'amount': amount,
        'pix_key': pix_key,
        'status': 'pending',
        'estimated_time': '1-2 dias úteis'
    }), 201

if __name__ == '__main__':
    print('✅ Backend de Pagamentos Sinuca Real iniciado na porta 5001!')
    app.run(host='0.0.0.0', port=5001, debug=True)
