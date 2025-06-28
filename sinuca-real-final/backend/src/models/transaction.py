from src.models.database import db
from datetime import datetime
import json

class Transaction(db.Model):
    """Modelo para transações financeiras"""
    
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # deposit, withdrawal, bet_win, bet_loss, platform_fee
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='pending')  # pending, approved, rejected, cancelled
    payment_method = db.Column(db.String(50))  # pix, credit_card, debit_card
    external_id = db.Column(db.String(100))  # ID no gateway de pagamento
    external_reference = db.Column(db.String(100))  # Referência externa única
    description = db.Column(db.Text)
    metadata = db.Column(db.Text)  # JSON com dados extras
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    user = db.relationship('User', backref='transactions')
    
    def save(self):
        """Salvar transação no banco"""
        db.session.add(self)
        db.session.commit()
    
    def to_dict(self):
        """Converter para dicionário"""
        metadata_dict = {}
        if self.metadata:
            try:
                metadata_dict = json.loads(self.metadata)
            except:
                pass
        
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'amount': self.amount,
            'status': self.status,
            'payment_method': self.payment_method,
            'external_id': self.external_id,
            'external_reference': self.external_reference,
            'description': self.description,
            'metadata': metadata_dict,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @property
    def metadata_dict(self):
        """Obter metadata como dicionário"""
        if self.metadata:
            try:
                return json.loads(self.metadata)
            except:
                return {}
        return {}
    
    @metadata_dict.setter
    def metadata_dict(self, value):
        """Definir metadata como dicionário"""
        if value:
            self.metadata = json.dumps(value)
        else:
            self.metadata = None

