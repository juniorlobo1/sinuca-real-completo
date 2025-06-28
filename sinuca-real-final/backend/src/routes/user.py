from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User
from src.models.game import Transaction

user_bp = Blueprint('user', __name__)

@user_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """Obter ranking de usuários"""
    try:
        limit = request.args.get('limit', 10, type=int)
        limit = min(limit, 50)  # Máximo 50 usuários
        
        users = User.get_leaderboard(limit)
        
        leaderboard = []
        for i, user in enumerate(users, 1):
            user_data = user.to_dict()
            user_data['position'] = i
            leaderboard.append(user_data)
        
        return jsonify({
            'leaderboard': leaderboard
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@user_bp.route('/search', methods=['GET'])
def search_users():
    """Buscar usuários"""
    try:
        query = request.args.get('q', '').strip()
        limit = request.args.get('limit', 10, type=int)
        limit = min(limit, 20)  # Máximo 20 usuários
        
        if len(query) < 2:
            return jsonify({'error': 'Query deve ter pelo menos 2 caracteres'}), 400
        
        # Buscar por username ou nome
        users = User.query.filter(
            db.or_(
                User.username.ilike(f'%{query}%'),
                User.name.ilike(f'%{query}%')
            )
        ).filter_by(is_active=True).limit(limit).all()
        
        results = []
        for user in users:
            user_data = {
                'id': user.id,
                'username': user.username,
                'name': user.name,
                'level': user.level,
                'skill_rating': user.skill_rating,
                'rank': user.rank,
                'avatar_url': user.avatar_url
            }
            results.append(user_data)
        
        return jsonify({
            'users': results
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@user_bp.route('/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    """Obter perfil público de usuário"""
    try:
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        # Perfil público (sem dados sensíveis)
        profile = {
            'id': user.id,
            'username': user.username,
            'name': user.name,
            'bio': user.bio,
            'level': user.level,
            'skill_rating': user.skill_rating,
            'rank': user.rank,
            'games_played': user.games_played,
            'games_won': user.games_won,
            'win_rate': user.win_rate,
            'achievements_list': user.achievements_list,
            'avatar_url': user.avatar_url,
            'created_at': user.created_at.isoformat() if user.created_at else None
        }
        
        return jsonify({
            'user': profile
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@user_bp.route('/wallet', methods=['GET'])
@jwt_required()
def get_wallet():
    """Obter informações da carteira"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        # Obter transações recentes
        transactions = Transaction.get_user_transactions(user_id, 20)
        
        wallet_data = {
            'balance': float(user.balance),
            'total_winnings': float(user.total_winnings),
            'total_deposits': float(user.total_deposits),
            'total_withdrawals': float(user.total_withdrawals),
            'transactions': [t.to_dict() for t in transactions]
        }
        
        return jsonify(wallet_data), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@user_bp.route('/wallet/deposit', methods=['POST'])
@jwt_required()
def deposit():
    """Fazer depósito (simulado)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        data = request.get_json()
        amount = data.get('amount', 0)
        
        # Validações
        if amount <= 0:
            return jsonify({'error': 'Valor deve ser maior que zero'}), 400
        
        if amount > 1000:
            return jsonify({'error': 'Valor máximo de depósito é R$ 1.000,00'}), 400
        
        # Simular depósito
        old_balance = float(user.balance)
        user.balance = float(user.balance) + amount
        user.total_deposits = float(user.total_deposits) + amount
        
        # Criar transação
        transaction = Transaction(
            user_id=user_id,
            amount=amount,
            type='deposit',
            description=f'Depósito via PIX - R$ {amount:.2f}',
            balance_before=old_balance,
            balance_after=float(user.balance)
        )
        transaction.save()
        user.save()
        
        return jsonify({
            'message': 'Depósito realizado com sucesso',
            'new_balance': float(user.balance),
            'transaction': transaction.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@user_bp.route('/wallet/withdraw', methods=['POST'])
@jwt_required()
def withdraw():
    """Fazer saque (simulado)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        data = request.get_json()
        amount = data.get('amount', 0)
        
        # Validações
        if amount <= 0:
            return jsonify({'error': 'Valor deve ser maior que zero'}), 400
        
        if amount > float(user.balance):
            return jsonify({'error': 'Saldo insuficiente'}), 400
        
        if amount < 10:
            return jsonify({'error': 'Valor mínimo de saque é R$ 10,00'}), 400
        
        # Simular saque
        old_balance = float(user.balance)
        user.balance = float(user.balance) - amount
        user.total_withdrawals = float(user.total_withdrawals) + amount
        
        # Criar transação
        transaction = Transaction(
            user_id=user_id,
            amount=-amount,
            type='withdrawal',
            description=f'Saque via PIX - R$ {amount:.2f}',
            balance_before=old_balance,
            balance_after=float(user.balance)
        )
        transaction.save()
        user.save()
        
        return jsonify({
            'message': 'Saque solicitado com sucesso',
            'new_balance': float(user.balance),
            'transaction': transaction.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@user_bp.route('/stats', methods=['GET'])
def get_platform_stats():
    """Obter estatísticas da plataforma"""
    try:
        from src.models.game import Bet, Game
        
        # Estatísticas gerais
        total_users = User.query.filter_by(is_active=True).count()
        total_games = Game.query.filter_by(status='finished').count()
        total_bets = Bet.query.filter_by(status='completed').count()
        
        # Volume total apostado
        total_volume = db.session.query(db.func.sum(Bet.amount * 2))\
                                .filter_by(status='completed').scalar() or 0
        
        # Receita da plataforma
        platform_revenue = db.session.query(db.func.sum(Bet.platform_fee))\
                                    .filter_by(status='completed').scalar() or 0
        
        stats = {
            'total_users': total_users,
            'total_games': total_games,
            'total_bets': total_bets,
            'total_volume': float(total_volume),
            'platform_revenue': float(platform_revenue)
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

