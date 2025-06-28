from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User
from src.models.game import Bet, Game
from src.models.database import db

betting_bp = Blueprint('betting', __name__)

@betting_bp.route('/bets', methods=['GET'])
def get_open_bets():
    """Obter apostas abertas"""
    try:
        limit = request.args.get('limit', 20, type=int)
        limit = min(limit, 50)  # Máximo 50 apostas
        
        # Buscar apostas abertas com dados do criador
        bets = db.session.query(Bet).join(User, Bet.creator_id == User.id)\
                        .filter(Bet.status == 'open')\
                        .order_by(Bet.created_at.desc())\
                        .limit(limit).all()
        
        bets_data = []
        for bet in bets:
            bet_data = bet.to_dict()
            bet_data['creator'] = {
                'id': bet.creator.id,
                'username': bet.creator.username,
                'name': bet.creator.name,
                'skill_rating': bet.creator.skill_rating,
                'rank': bet.creator.rank,
                'level': bet.creator.level
            }
            bets_data.append(bet_data)
        
        return jsonify({
            'bets': bets_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@betting_bp.route('/bets', methods=['POST'])
@jwt_required()
def create_bet():
    """Criar nova aposta"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        data = request.get_json()
        amount = data.get('amount', 0)
        
        # Validações
        if amount <= 0:
            return jsonify({'error': 'Valor da aposta deve ser maior que zero'}), 400
        
        if amount < 5:
            return jsonify({'error': 'Valor mínimo da aposta é R$ 5,00'}), 400
        
        if amount > 500:
            return jsonify({'error': 'Valor máximo da aposta é R$ 500,00'}), 400
        
        if not user.can_bet(amount):
            return jsonify({'error': 'Saldo insuficiente'}), 400
        
        # Calcular taxas
        fees = Bet.calculate_fees(amount)
        
        # Criar aposta
        bet = Bet(
            creator_id=user_id,
            amount=fees['amount'],
            platform_fee=fees['platform_fee'],
            total_prize=fees['total_prize']
        )
        bet.save()
        
        return jsonify({
            'message': 'Aposta criada com sucesso',
            'bet': bet.to_dict(),
            'fees': fees
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@betting_bp.route('/bets/<int:bet_id>/accept', methods=['POST'])
@jwt_required()
def accept_bet(bet_id):
    """Aceitar aposta"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        bet = Bet.query.get(bet_id)
        if not bet:
            return jsonify({'error': 'Aposta não encontrada'}), 404
        
        if bet.status != 'open':
            return jsonify({'error': 'Aposta não está disponível'}), 400
        
        if bet.creator_id == user_id:
            return jsonify({'error': 'Você não pode aceitar sua própria aposta'}), 400
        
        # Aceitar aposta
        success, message = bet.accept_bet(user_id)
        
        if not success:
            return jsonify({'error': message}), 400
        
        return jsonify({
            'message': message,
            'bet': bet.to_dict(),
            'game_id': bet.game.id if bet.game else None
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@betting_bp.route('/bets/<int:bet_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_bet(bet_id):
    """Cancelar aposta"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        bet = Bet.query.get(bet_id)
        if not bet:
            return jsonify({'error': 'Aposta não encontrada'}), 404
        
        if bet.creator_id != user_id:
            return jsonify({'error': 'Você só pode cancelar suas próprias apostas'}), 403
        
        if bet.status not in ['open', 'matched']:
            return jsonify({'error': 'Aposta não pode ser cancelada'}), 400
        
        # Cancelar aposta
        success, message = bet.cancel_bet()
        
        if not success:
            return jsonify({'error': message}), 400
        
        return jsonify({
            'message': message
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@betting_bp.route('/my-bets', methods=['GET'])
@jwt_required()
def get_my_bets():
    """Obter apostas do usuário"""
    try:
        user_id = get_jwt_identity()
        
        # Apostas criadas pelo usuário
        created_bets = Bet.query.filter_by(creator_id=user_id)\
                              .order_by(Bet.created_at.desc()).all()
        
        # Apostas aceitas pelo usuário
        accepted_bets = Bet.query.filter_by(opponent_id=user_id)\
                               .order_by(Bet.created_at.desc()).all()
        
        # Combinar e ordenar
        all_bets = created_bets + accepted_bets
        all_bets.sort(key=lambda x: x.created_at, reverse=True)
        
        bets_data = []
        for bet in all_bets:
            bet_data = bet.to_dict()
            bet_data['user_role'] = 'creator' if bet.creator_id == user_id else 'opponent'
            
            # Adicionar dados do oponente
            if bet.opponent_id:
                opponent = User.query.get(bet.opponent_id)
                if opponent:
                    bet_data['opponent'] = {
                        'id': opponent.id,
                        'username': opponent.username,
                        'name': opponent.name,
                        'skill_rating': opponent.skill_rating,
                        'rank': opponent.rank
                    }
            
            bets_data.append(bet_data)
        
        return jsonify({
            'bets': bets_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@betting_bp.route('/calculate-fees', methods=['POST'])
def calculate_bet_fees():
    """Calcular taxas da aposta"""
    try:
        data = request.get_json()
        amount = data.get('amount', 0)
        
        if amount <= 0:
            return jsonify({'error': 'Valor deve ser maior que zero'}), 400
        
        fees = Bet.calculate_fees(amount)
        
        return jsonify(fees), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@betting_bp.route('/history', methods=['GET'])
@jwt_required()
def get_betting_history():
    """Obter histórico de apostas do usuário"""
    try:
        user_id = get_jwt_identity()
        limit = request.args.get('limit', 20, type=int)
        limit = min(limit, 50)
        
        # Apostas completadas do usuário
        completed_bets = Bet.query.filter(
            db.or_(
                Bet.creator_id == user_id,
                Bet.opponent_id == user_id
            )
        ).filter_by(status='completed')\
         .order_by(Bet.completed_at.desc())\
         .limit(limit).all()
        
        history = []
        total_won = 0
        total_lost = 0
        
        for bet in completed_bets:
            bet_data = bet.to_dict()
            
            # Determinar se ganhou ou perdeu
            if bet.winner_id == user_id:
                bet_data['result'] = 'won'
                bet_data['profit'] = float(bet.total_prize) - float(bet.amount)
                total_won += 1
            else:
                bet_data['result'] = 'lost'
                bet_data['profit'] = -float(bet.amount)
                total_lost += 1
            
            history.append(bet_data)
        
        stats = {
            'total_bets': len(history),
            'total_won': total_won,
            'total_lost': total_lost,
            'win_rate': round((total_won / len(history)) * 100, 1) if history else 0
        }
        
        return jsonify({
            'history': history,
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

