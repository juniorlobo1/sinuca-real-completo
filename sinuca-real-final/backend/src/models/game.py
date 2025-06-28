from src.models.database import db, BaseModel
from datetime import datetime
import json

class Game(BaseModel):
    __tablename__ = 'games'
    
    # Jogadores
    player1_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    player2_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Estado do jogo
    status = db.Column(db.String(20), default='waiting')  # waiting, playing, finished, cancelled
    winner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Configurações do jogo
    game_type = db.Column(db.String(20), default='8ball')
    time_limit = db.Column(db.Integer, default=300)  # 5 minutos por jogador
    
    # Dados do jogo (JSON)
    game_data = db.Column(db.Text, default='{}')  # Estado das bolas, jogadas, etc.
    
    # Timestamps
    started_at = db.Column(db.DateTime, nullable=True)
    finished_at = db.Column(db.DateTime, nullable=True)
    
    # Relacionamento com apostas
    bet_id = db.Column(db.Integer, db.ForeignKey('bets.id'), nullable=True)
    
    @property
    def duration(self):
        """Duração do jogo em segundos"""
        if self.started_at and self.finished_at:
            return (self.finished_at - self.started_at).total_seconds()
        return None
    
    @property
    def game_data_dict(self):
        """Dados do jogo como dicionário"""
        try:
            return json.loads(self.game_data)
        except:
            return {}
    
    def update_game_data(self, data):
        """Atualizar dados do jogo"""
        self.game_data = json.dumps(data)
    
    def start_game(self):
        """Iniciar jogo"""
        self.status = 'playing'
        self.started_at = datetime.utcnow()
        self.save()
    
    def finish_game(self, winner_id):
        """Finalizar jogo"""
        self.status = 'finished'
        self.winner_id = winner_id
        self.finished_at = datetime.utcnow()
        
        # Atualizar estatísticas dos jogadores
        from src.models.user import User
        
        player1 = User.query.get(self.player1_id)
        player2 = User.query.get(self.player2_id)
        
        if player1:
            player1.games_played += 1
            if winner_id == player1.id:
                player1.games_won += 1
                player1.skill_rating += 25
                player1.add_experience(100)
            else:
                player1.skill_rating = max(800, player1.skill_rating - 15)
                player1.add_experience(25)
        
        if player2:
            player2.games_played += 1
            if winner_id == player2.id:
                player2.games_won += 1
                player2.skill_rating += 25
                player2.add_experience(100)
            else:
                player2.skill_rating = max(800, player2.skill_rating - 15)
                player2.add_experience(25)
        
        # Processar aposta se existir
        if self.bet_id:
            bet = Bet.query.get(self.bet_id)
            if bet:
                bet.complete_bet(winner_id)
        
        self.save()
        db.session.commit()
    
    def to_dict(self):
        """Converter para dicionário"""
        data = super().to_dict()
        data['duration'] = self.duration
        data['game_data_dict'] = self.game_data_dict
        return data

class Bet(BaseModel):
    __tablename__ = 'bets'
    
    # Participantes
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    opponent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Valores
    amount = db.Column(db.Numeric(10, 2), nullable=False)  # Valor apostado por cada jogador
    platform_fee = db.Column(db.Numeric(10, 2), nullable=False)  # Taxa da plataforma (5%)
    total_prize = db.Column(db.Numeric(10, 2), nullable=False)  # Prêmio total para o vencedor
    
    # Estado da aposta
    status = db.Column(db.String(20), default='open')  # open, matched, playing, completed, cancelled
    winner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Timestamps
    matched_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    # Relacionamento com jogo
    game = db.relationship('Game', backref='bet', uselist=False)
    
    @staticmethod
    def calculate_fees(amount):
        """Calcular taxas da aposta"""
        total_pot = amount * 2  # Dois jogadores
        platform_fee = total_pot * 0.05  # 5% de taxa
        total_prize = total_pot - platform_fee
        
        return {
            'amount': float(amount),
            'total_pot': float(total_pot),
            'platform_fee': float(platform_fee),
            'total_prize': float(total_prize)
        }
    
    def accept_bet(self, opponent_id):
        """Aceitar aposta"""
        from src.models.user import User
        
        opponent = User.query.get(opponent_id)
        creator = User.query.get(self.creator_id)
        
        if not opponent or not creator:
            return False, "Usuário não encontrado"
        
        if not opponent.can_bet(float(self.amount)):
            return False, "Saldo insuficiente"
        
        if not creator.can_bet(float(self.amount)):
            return False, "Criador da aposta não tem saldo suficiente"
        
        # Debitar valores dos jogadores
        creator.update_balance(-float(self.amount), 'bet_escrow')
        opponent.update_balance(-float(self.amount), 'bet_escrow')
        
        # Atualizar aposta
        self.opponent_id = opponent_id
        self.status = 'matched'
        self.matched_at = datetime.utcnow()
        
        # Criar jogo
        game = Game(
            player1_id=self.creator_id,
            player2_id=opponent_id,
            bet_id=self.id
        )
        game.save()
        
        self.save()
        return True, "Aposta aceita com sucesso"
    
    def complete_bet(self, winner_id):
        """Completar aposta"""
        from src.models.user import User
        
        if self.status != 'matched':
            return False, "Aposta não está em andamento"
        
        winner = User.query.get(winner_id)
        if not winner:
            return False, "Vencedor não encontrado"
        
        # Transferir prêmio para o vencedor
        winner.update_balance(float(self.total_prize), 'bet_win')
        winner.total_winnings = float(winner.total_winnings) + float(self.total_prize)
        
        # Atualizar aposta
        self.winner_id = winner_id
        self.status = 'completed'
        self.completed_at = datetime.utcnow()
        
        # Adicionar conquistas
        winner.add_achievement('Primeira Vitória')
        if winner.games_won >= 5:
            winner.add_achievement('Sequência de 5')
        if winner.games_won >= 10:
            winner.add_achievement('Sequência de 10')
        
        self.save()
        db.session.commit()
        
        return True, "Aposta completada"
    
    def cancel_bet(self, reason="Cancelada pelo usuário"):
        """Cancelar aposta"""
        from src.models.user import User
        
        if self.status == 'completed':
            return False, "Aposta já foi completada"
        
        # Reembolsar jogadores se a aposta foi aceita
        if self.status == 'matched' and self.opponent_id:
            creator = User.query.get(self.creator_id)
            opponent = User.query.get(self.opponent_id)
            
            if creator:
                creator.update_balance(float(self.amount), 'bet_refund')
            if opponent:
                opponent.update_balance(float(self.amount), 'bet_refund')
        
        self.status = 'cancelled'
        self.save()
        
        return True, "Aposta cancelada"
    
    @staticmethod
    def get_open_bets(limit=20):
        """Obter apostas abertas"""
        return Bet.query.filter_by(status='open')\
                       .order_by(Bet.created_at.desc())\
                       .limit(limit).all()
    
    def to_dict(self):
        """Converter para dicionário"""
        data = super().to_dict()
        data['amount'] = float(self.amount)
        data['platform_fee'] = float(self.platform_fee)
        data['total_prize'] = float(self.total_prize)
        
        # Incluir dados do criador
        if hasattr(self, 'creator'):
            data['creator'] = {
                'id': self.creator.id,
                'username': self.creator.username,
                'name': self.creator.name,
                'skill_rating': self.creator.skill_rating,
                'rank': self.creator.rank
            }
        
        return data

class Transaction(BaseModel):
    __tablename__ = 'transactions'
    
    # Usuário
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Transação
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # deposit, withdrawal, bet_win, bet_loss, etc.
    description = db.Column(db.String(255), nullable=True)
    
    # Saldos
    balance_before = db.Column(db.Numeric(10, 2), nullable=False)
    balance_after = db.Column(db.Numeric(10, 2), nullable=False)
    
    # Referências
    bet_id = db.Column(db.Integer, db.ForeignKey('bets.id'), nullable=True)
    game_id = db.Column(db.Integer, db.ForeignKey('games.id'), nullable=True)
    
    # Status
    status = db.Column(db.String(20), default='completed')  # pending, completed, failed
    
    def to_dict(self):
        """Converter para dicionário"""
        data = super().to_dict()
        data['amount'] = float(self.amount)
        data['balance_before'] = float(self.balance_before)
        data['balance_after'] = float(self.balance_after)
        return data
    
    @staticmethod
    def get_user_transactions(user_id, limit=50):
        """Obter transações do usuário"""
        return Transaction.query.filter_by(user_id=user_id)\
                              .order_by(Transaction.created_at.desc())\
                              .limit(limit).all()

