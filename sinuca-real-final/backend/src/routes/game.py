from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User
from src.models.game import Game, Bet
from src.models.database import db

game_bp = Blueprint('game', __name__)

@game_bp.route('/create', methods=['POST'])
@jwt_required()
def create_game():
    """Criar novo jogo"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        data = request.get_json()
        
        # Criar jogo
        game = Game(
            player1_id=user_id,
            game_type=data.get('game_type', '8ball'),
            time_limit=data.get('time_limit', 300)
        )
        game.save()
        
        return jsonify({
            'message': 'Jogo criado com sucesso',
            'game': game.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@game_bp.route('/<int:game_id>/join', methods=['POST'])
@jwt_required()
def join_game(game_id):
    """Entrar em um jogo"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        game = Game.query.get(game_id)
        if not game:
            return jsonify({'error': 'Jogo não encontrado'}), 404
        
        if game.status != 'waiting':
            return jsonify({'error': 'Jogo não está disponível'}), 400
        
        if game.player1_id == user_id:
            return jsonify({'error': 'Você já está neste jogo'}), 400
        
        if game.player2_id:
            return jsonify({'error': 'Jogo já está cheio'}), 400
        
        # Entrar no jogo
        game.player2_id = user_id
        game.save()
        
        return jsonify({
            'message': 'Entrou no jogo com sucesso',
            'game': game.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@game_bp.route('/<int:game_id>/start', methods=['POST'])
@jwt_required()
def start_game(game_id):
    """Iniciar jogo"""
    try:
        user_id = get_jwt_identity()
        
        game = Game.query.get(game_id)
        if not game:
            return jsonify({'error': 'Jogo não encontrado'}), 404
        
        if game.player1_id != user_id and game.player2_id != user_id:
            return jsonify({'error': 'Você não está neste jogo'}), 403
        
        if game.status != 'waiting':
            return jsonify({'error': 'Jogo não pode ser iniciado'}), 400
        
        if not game.player2_id:
            return jsonify({'error': 'Aguardando segundo jogador'}), 400
        
        # Iniciar jogo
        game.start_game()
        
        return jsonify({
            'message': 'Jogo iniciado',
            'game': game.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@game_bp.route('/<int:game_id>/finish', methods=['POST'])
@jwt_required()
def finish_game(game_id):
    """Finalizar jogo"""
    try:
        user_id = get_jwt_identity()
        
        game = Game.query.get(game_id)
        if not game:
            return jsonify({'error': 'Jogo não encontrado'}), 404
        
        if game.player1_id != user_id and game.player2_id != user_id:
            return jsonify({'error': 'Você não está neste jogo'}), 403
        
        if game.status != 'playing':
            return jsonify({'error': 'Jogo não está em andamento'}), 400
        
        data = request.get_json()
        winner_id = data.get('winner_id')
        
        if winner_id not in [game.player1_id, game.player2_id]:
            return jsonify({'error': 'Vencedor inválido'}), 400
        
        # Finalizar jogo
        game.finish_game(winner_id)
        
        return jsonify({
            'message': 'Jogo finalizado',
            'game': game.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@game_bp.route('/<int:game_id>', methods=['GET'])
@jwt_required()
def get_game(game_id):
    """Obter dados do jogo"""
    try:
        user_id = get_jwt_identity()
        
        game = Game.query.get(game_id)
        if not game:
            return jsonify({'error': 'Jogo não encontrado'}), 404
        
        # Verificar se o usuário tem acesso ao jogo
        if game.player1_id != user_id and game.player2_id != user_id:
            return jsonify({'error': 'Acesso negado'}), 403
        
        game_data = game.to_dict()
        
        # Adicionar dados dos jogadores
        if game.player1_id:
            player1 = User.query.get(game.player1_id)
            if player1:
                game_data['player1'] = {
                    'id': player1.id,
                    'username': player1.username,
                    'name': player1.name,
                    'skill_rating': player1.skill_rating,
                    'rank': player1.rank
                }
        
        if game.player2_id:
            player2 = User.query.get(game.player2_id)
            if player2:
                game_data['player2'] = {
                    'id': player2.id,
                    'username': player2.username,
                    'name': player2.name,
                    'skill_rating': player2.skill_rating,
                    'rank': player2.rank
                }
        
        # Adicionar dados da aposta se existir
        if game.bet_id:
            bet = Bet.query.get(game.bet_id)
            if bet:
                game_data['bet'] = bet.to_dict()
        
        return jsonify({
            'game': game_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@game_bp.route('/<int:game_id>/update', methods=['POST'])
@jwt_required()
def update_game_state(game_id):
    """Atualizar estado do jogo"""
    try:
        user_id = get_jwt_identity()
        
        game = Game.query.get(game_id)
        if not game:
            return jsonify({'error': 'Jogo não encontrado'}), 404
        
        if game.player1_id != user_id and game.player2_id != user_id:
            return jsonify({'error': 'Você não está neste jogo'}), 403
        
        if game.status != 'playing':
            return jsonify({'error': 'Jogo não está em andamento'}), 400
        
        data = request.get_json()
        game_state = data.get('game_state', {})
        
        # Atualizar estado do jogo
        game.update_game_data(game_state)
        game.save()
        
        return jsonify({
            'message': 'Estado do jogo atualizado',
            'game_data': game.game_data_dict
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@game_bp.route('/my-games', methods=['GET'])
@jwt_required()
def get_my_games():
    """Obter jogos do usuário"""
    try:
        user_id = get_jwt_identity()
        limit = request.args.get('limit', 20, type=int)
        limit = min(limit, 50)
        
        # Jogos do usuário
        games = Game.query.filter(
            db.or_(
                Game.player1_id == user_id,
                Game.player2_id == user_id
            )
        ).order_by(Game.created_at.desc()).limit(limit).all()
        
        games_data = []
        for game in games:
            game_data = game.to_dict()
            
            # Adicionar dados do oponente
            opponent_id = game.player2_id if game.player1_id == user_id else game.player1_id
            if opponent_id:
                opponent = User.query.get(opponent_id)
                if opponent:
                    game_data['opponent'] = {
                        'id': opponent.id,
                        'username': opponent.username,
                        'name': opponent.name,
                        'skill_rating': opponent.skill_rating,
                        'rank': opponent.rank
                    }
            
            # Resultado para o usuário
            if game.winner_id:
                game_data['result'] = 'won' if game.winner_id == user_id else 'lost'
            
            games_data.append(game_data)
        
        return jsonify({
            'games': games_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@game_bp.route('/active', methods=['GET'])
def get_active_games():
    """Obter jogos ativos (aguardando jogadores)"""
    try:
        limit = request.args.get('limit', 10, type=int)
        limit = min(limit, 20)
        
        # Jogos aguardando jogadores
        games = Game.query.filter_by(status='waiting')\
                         .filter(Game.player2_id.is_(None))\
                         .order_by(Game.created_at.desc())\
                         .limit(limit).all()
        
        games_data = []
        for game in games:
            game_data = game.to_dict()
            
            # Adicionar dados do criador
            creator = User.query.get(game.player1_id)
            if creator:
                game_data['creator'] = {
                    'id': creator.id,
                    'username': creator.username,
                    'name': creator.name,
                    'skill_rating': creator.skill_rating,
                    'rank': creator.rank
                }
            
            games_data.append(game_data)
        
        return jsonify({
            'games': games_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

