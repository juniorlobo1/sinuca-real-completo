from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User
from src.models.game import Transaction
from src.models.database import db
from src.services.mercadopago_service import mercadopago_service
import uuid
from datetime import datetime

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/deposit/pix', methods=['POST'])
@jwt_required()
def create_pix_deposit():
    """Criar depósito via PIX"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        data = request.get_json()
        amount = data.get('amount', 0)
        
        # Validações
        if amount < 10:
            return jsonify({'error': 'Valor mínimo para depósito é R$ 10,00'}), 400
        
        if amount > 5000:
            return jsonify({'error': 'Valor máximo para depósito é R$ 5.000,00'}), 400
        
        # Criar referência única
        external_reference = f"deposit_{user_id}_{uuid.uuid4().hex[:8]}"
        
        # Criar pagamento PIX no Mercado Pago
        payment_result = mercadopago_service.create_pix_payment(
            amount=amount,
            description=f"Depósito Sinuca Real - {user.name}",
            payer_email=user.email,
            external_reference=external_reference
        )
        
        if not payment_result["success"]:
            return jsonify({
                'error': 'Erro ao criar pagamento PIX',
                'details': payment_result.get('error')
            }), 500
        
        # Criar transação pendente no banco
        transaction = Transaction(
            user_id=user_id,
            type='deposit',
            amount=amount,
            status='pending',
            payment_method='pix',
            external_id=str(payment_result["payment_id"]),
            external_reference=external_reference,
            description=f"Depósito via PIX - R$ {amount:.2f}"
        )
        transaction.save()
        
        return jsonify({
            'message': 'Pagamento PIX criado com sucesso',
            'transaction_id': transaction.id,
            'payment_id': payment_result["payment_id"],
            'qr_code': payment_result["qr_code"],
            'qr_code_base64': payment_result["qr_code_base64"],
            'ticket_url': payment_result["ticket_url"],
            'amount': amount,
            'expires_at': payment_result["expires_at"],
            'status': 'pending'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@payments_bp.route('/deposit/card', methods=['POST'])
@jwt_required()
def create_card_deposit():
    """Criar depósito via cartão"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        data = request.get_json()
        amount = data.get('amount', 0)
        token = data.get('token')
        installments = data.get('installments', 1)
        
        # Validações
        if not token:
            return jsonify({'error': 'Token do cartão é obrigatório'}), 400
        
        if amount < 10:
            return jsonify({'error': 'Valor mínimo para depósito é R$ 10,00'}), 400
        
        if amount > 5000:
            return jsonify({'error': 'Valor máximo para depósito é R$ 5.000,00'}), 400
        
        if installments < 1 or installments > 12:
            return jsonify({'error': 'Número de parcelas deve ser entre 1 e 12'}), 400
        
        # Criar referência única
        external_reference = f"deposit_{user_id}_{uuid.uuid4().hex[:8]}"
        
        # Criar pagamento com cartão no Mercado Pago
        payment_result = mercadopago_service.create_card_payment(
            amount=amount,
            description=f"Depósito Sinuca Real - {user.name}",
            token=token,
            installments=installments,
            payer_email=user.email,
            external_reference=external_reference
        )
        
        if not payment_result["success"]:
            return jsonify({
                'error': 'Erro ao processar pagamento com cartão',
                'details': payment_result.get('error')
            }), 500
        
        # Criar transação no banco
        status = 'approved' if payment_result["status"] == 'approved' else 'pending'
        
        transaction = Transaction(
            user_id=user_id,
            type='deposit',
            amount=amount,
            status=status,
            payment_method='credit_card',
            external_id=str(payment_result["payment_id"]),
            external_reference=external_reference,
            description=f"Depósito via cartão - {installments}x R$ {amount/installments:.2f}"
        )
        transaction.save()
        
        # Se aprovado, creditar na carteira
        if status == 'approved':
            user.balance += amount
            user.save()
        
        return jsonify({
            'message': 'Pagamento processado com sucesso',
            'transaction_id': transaction.id,
            'payment_id': payment_result["payment_id"],
            'status': payment_result["status"],
            'status_detail': payment_result.get("status_detail"),
            'amount': amount,
            'installments': installments,
            'payment_method': payment_result.get("payment_method")
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@payments_bp.route('/withdraw', methods=['POST'])
@jwt_required()
def create_withdrawal():
    """Criar saque"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        data = request.get_json()
        amount = data.get('amount', 0)
        pix_key = data.get('pix_key')
        
        # Validações
        if not pix_key:
            return jsonify({'error': 'Chave PIX é obrigatória'}), 400
        
        if amount < 20:
            return jsonify({'error': 'Valor mínimo para saque é R$ 20,00'}), 400
        
        if amount > user.balance:
            return jsonify({'error': 'Saldo insuficiente'}), 400
        
        # Debitar da carteira
        user.balance -= amount
        user.save()
        
        # Criar transação de saque
        transaction = Transaction(
            user_id=user_id,
            type='withdrawal',
            amount=amount,
            status='pending',
            payment_method='pix',
            description=f"Saque via PIX - R$ {amount:.2f}",
            metadata={'pix_key': pix_key}
        )
        transaction.save()
        
        return jsonify({
            'message': 'Solicitação de saque criada com sucesso',
            'transaction_id': transaction.id,
            'amount': amount,
            'pix_key': pix_key,
            'status': 'pending',
            'estimated_time': '1-2 dias úteis'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@payments_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    """Obter histórico de transações"""
    try:
        user_id = get_jwt_identity()
        limit = request.args.get('limit', 20, type=int)
        limit = min(limit, 50)
        
        transactions = Transaction.query.filter_by(user_id=user_id)\
                                      .order_by(Transaction.created_at.desc())\
                                      .limit(limit).all()
        
        transactions_data = []
        for transaction in transactions:
            transaction_data = transaction.to_dict()
            
            # Adicionar informações específicas do tipo
            if transaction.type == 'deposit':
                transaction_data['icon'] = '💰'
                transaction_data['color'] = 'green'
            elif transaction.type == 'withdrawal':
                transaction_data['icon'] = '💸'
                transaction_data['color'] = 'orange'
            elif transaction.type == 'bet_win':
                transaction_data['icon'] = '🏆'
                transaction_data['color'] = 'green'
            elif transaction.type == 'bet_loss':
                transaction_data['icon'] = '😞'
                transaction_data['color'] = 'red'
            elif transaction.type == 'platform_fee':
                transaction_data['icon'] = '🏛️'
                transaction_data['color'] = 'blue'
            
            transactions_data.append(transaction_data)
        
        return jsonify({
            'transactions': transactions_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@payments_bp.route('/payment-methods', methods=['GET'])
def get_payment_methods():
    """Obter métodos de pagamento disponíveis"""
    try:
        methods = mercadopago_service.get_payment_methods()
        
        if not methods["success"]:
            return jsonify({
                'error': 'Erro ao obter métodos de pagamento',
                'details': methods.get('error')
            }), 500
        
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
            },
            'debit_card': {
                'available': True,
                'min_amount': 10.00,
                'max_amount': 5000.00,
                'processing_time': 'Instantâneo'
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@payments_bp.route('/webhook', methods=['POST'])
def mercadopago_webhook():
    """Webhook para notificações do Mercado Pago"""
    try:
        webhook_data = request.get_json()
        
        # Processar webhook
        result = mercadopago_service.process_webhook(webhook_data)
        
        if result["success"] and result["type"] == "payment_update":
            # Buscar transação pelo external_reference
            external_reference = result.get("external_reference")
            
            if external_reference:
                transaction = Transaction.query.filter_by(
                    external_reference=external_reference
                ).first()
                
                if transaction:
                    old_status = transaction.status
                    new_status = result["status"]
                    
                    # Atualizar status da transação
                    transaction.status = new_status
                    transaction.save()
                    
                    # Se pagamento foi aprovado e era depósito
                    if (new_status == 'approved' and 
                        old_status == 'pending' and 
                        transaction.type == 'deposit'):
                        
                        # Creditar na carteira do usuário
                        user = User.query.get(transaction.user_id)
                        if user:
                            user.balance += transaction.amount
                            user.save()
        
        return jsonify({'status': 'ok'}), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro no webhook: {str(e)}'}), 500

@payments_bp.route('/payment/<payment_id>/status', methods=['GET'])
@jwt_required()
def get_payment_status(payment_id):
    """Consultar status de um pagamento"""
    try:
        user_id = get_jwt_identity()
        
        # Buscar transação do usuário
        transaction = Transaction.query.filter_by(
            external_id=payment_id,
            user_id=user_id
        ).first()
        
        if not transaction:
            return jsonify({'error': 'Pagamento não encontrado'}), 404
        
        # Consultar status no Mercado Pago
        payment_info = mercadopago_service.get_payment(payment_id)
        
        if payment_info["success"]:
            # Atualizar status local se necessário
            if transaction.status != payment_info["status"]:
                old_status = transaction.status
                transaction.status = payment_info["status"]
                transaction.save()
                
                # Se foi aprovado e é depósito, creditar
                if (payment_info["status"] == 'approved' and 
                    old_status == 'pending' and 
                    transaction.type == 'deposit'):
                    
                    user = User.query.get(user_id)
                    if user:
                        user.balance += transaction.amount
                        user.save()
            
            return jsonify({
                'payment_id': payment_id,
                'status': payment_info["status"],
                'status_detail': payment_info.get("status_detail"),
                'amount': payment_info["amount"],
                'date_created': payment_info["date_created"],
                'date_approved': payment_info.get("date_approved")
            }), 200
        else:
            return jsonify({
                'error': 'Erro ao consultar pagamento',
                'details': payment_info.get('error')
            }), 500
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

