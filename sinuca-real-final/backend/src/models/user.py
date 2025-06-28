from src.models.database import db, BaseModel
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
import json

class User(BaseModel):
    __tablename__ = 'users'
    
    # Informações básicas
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Avatar e perfil
    avatar_url = db.Column(db.String(255), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    
    # Sistema de níveis
    level = db.Column(db.Integer, default=1)
    experience = db.Column(db.Integer, default=0)
    
    # Carteira virtual
    balance = db.Column(db.Numeric(10, 2), default=50.00)  # Bônus de boas-vindas
    total_winnings = db.Column(db.Numeric(10, 2), default=0.00)
    total_deposits = db.Column(db.Numeric(10, 2), default=0.00)
    total_withdrawals = db.Column(db.Numeric(10, 2), default=0.00)
    
    # Estatísticas de jogo
    games_played = db.Column(db.Integer, default=0)
    games_won = db.Column(db.Integer, default=0)
    skill_rating = db.Column(db.Integer, default=1200)
    
    # Conquistas (JSON)
    achievements = db.Column(db.Text, default='[]')
    
    # Status da conta
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relacionamentos
    created_bets = db.relationship('Bet', foreign_keys='Bet.creator_id', backref='creator', lazy='dynamic')
    accepted_bets = db.relationship('Bet', foreign_keys='Bet.opponent_id', backref='opponent', lazy='dynamic')
    won_bets = db.relationship('Bet', foreign_keys='Bet.winner_id', backref='winner', lazy='dynamic')
    transactions = db.relationship('Transaction', backref='user', lazy='dynamic')
    games_as_player1 = db.relationship('Game', foreign_keys='Game.player1_id', backref='player1', lazy='dynamic')
    games_as_player2 = db.relationship('Game', foreign_keys='Game.player2_id', backref='player2', lazy='dynamic')
    
    def set_password(self, password):
        """Definir senha com hash"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verificar senha"""
        return check_password_hash(self.password_hash, password)
    
    def generate_token(self):
        """Gerar token JWT"""
        return create_access_token(identity=self.id)
    
    @property
    def win_rate(self):
        """Calcular taxa de vitória"""
        if self.games_played == 0:
            return 0
        return round((self.games_won / self.games_played) * 100, 1)
    
    @property
    def rank(self):
        """Determinar rank baseado no skill rating"""
        if self.skill_rating < 1000:
            return 'Bronze'
        elif self.skill_rating < 1300:
            return 'Prata'
        elif self.skill_rating < 1600:
            return 'Ouro'
        elif self.skill_rating < 1900:
            return 'Platina'
        else:
            return 'Diamante'
    
    @property
    def experience_to_next(self):
        """Experiência necessária para próximo nível"""
        return self.level * 200
    
    @property
    def achievements_list(self):
        """Lista de conquistas"""
        try:
            return json.loads(self.achievements)
        except:
            return []
    
    def add_achievement(self, achievement):
        """Adicionar conquista"""
        achievements = self.achievements_list
        if achievement not in achievements:
            achievements.append(achievement)
            self.achievements = json.dumps(achievements)
            return True
        return False
    
    def add_experience(self, points):
        """Adicionar experiência e verificar level up"""
        self.experience += points
        
        # Verificar level up
        while self.experience >= self.experience_to_next:
            self.experience -= self.experience_to_next
            self.level += 1
            
            # Conquistas por nível
            if self.level == 5:
                self.add_achievement('Iniciante')
            elif self.level == 10:
                self.add_achievement('Experiente')
            elif self.level == 20:
                self.add_achievement('Veterano')
            elif self.level == 50:
                self.add_achievement('Mestre')
    
    def update_balance(self, amount, transaction_type='adjustment'):
        """Atualizar saldo e criar transação"""
        old_balance = float(self.balance)
        self.balance = float(self.balance) + amount
        
        # Criar transação
        from src.models.game import Transaction
        transaction = Transaction(
            user_id=self.id,
            amount=amount,
            type=transaction_type,
            description=f'Ajuste de saldo: {amount:+.2f}',
            balance_before=old_balance,
            balance_after=float(self.balance)
        )
        transaction.save()
        
        return self.balance
    
    def can_bet(self, amount):
        """Verificar se pode fazer aposta"""
        return float(self.balance) >= amount
    
    def to_dict(self, include_sensitive=False):
        """Converter para dicionário"""
        data = super().to_dict()
        
        # Remover dados sensíveis
        if not include_sensitive:
            data.pop('password_hash', None)
        
        # Adicionar campos calculados
        data['win_rate'] = self.win_rate
        data['rank'] = self.rank
        data['experience_to_next'] = self.experience_to_next
        data['achievements_list'] = self.achievements_list
        data['balance'] = float(self.balance)
        data['total_winnings'] = float(self.total_winnings)
        data['total_deposits'] = float(self.total_deposits)
        data['total_withdrawals'] = float(self.total_withdrawals)
        
        return data
    
    @staticmethod
    def find_by_email(email):
        """Encontrar usuário por email"""
        return User.query.filter_by(email=email).first()
    
    @staticmethod
    def find_by_username(username):
        """Encontrar usuário por username"""
        return User.query.filter_by(username=username).first()
    
    @staticmethod
    def get_leaderboard(limit=10):
        """Obter ranking de usuários"""
        return User.query.filter_by(is_active=True)\
                        .order_by(User.skill_rating.desc())\
                        .limit(limit).all()
    
    def __repr__(self):
        return f'<User {self.username}>'

