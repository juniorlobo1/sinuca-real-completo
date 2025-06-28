from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from src.models.user import User
from src.models.database import db
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Registrar novo usuário"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['email', 'username', 'name', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        # Verificar se email já existe
        if User.find_by_email(data['email']):
            return jsonify({'error': 'Email já está em uso'}), 400
        
        # Verificar se username já existe
        if User.find_by_username(data['username']):
            return jsonify({'error': 'Nome de usuário já está em uso'}), 400
        
        # Criar novo usuário
        user = User(
            email=data['email'].lower().strip(),
            username=data['username'].lower().strip(),
            name=data['name'].strip(),
            bio=data.get('bio', ''),
            balance=50.00  # Bônus de boas-vindas
        )
        user.set_password(data['password'])
        
        # Adicionar conquista de boas-vindas
        user.add_achievement('Bem-vindo ao Sinuca Real')
        
        user.save()
        
        # Gerar token
        token = user.generate_token()
        
        return jsonify({
            'message': 'Usuário criado com sucesso',
            'user': user.to_dict(),
            'token': token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Fazer login"""
    try:
        data = request.get_json()
        
        # Validar dados
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email e senha são obrigatórios'}), 400
        
        # Encontrar usuário
        user = User.find_by_email(data['email'].lower().strip())
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Email ou senha incorretos'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Conta desativada'}), 401
        
        # Atualizar último login
        user.last_login = datetime.utcnow()
        user.save()
        
        # Gerar token
        token = user.generate_token()
        
        return jsonify({
            'message': 'Login realizado com sucesso',
            'user': user.to_dict(),
            'token': token
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Obter perfil do usuário logado"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        return jsonify({
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Atualizar perfil do usuário"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        data = request.get_json()
        
        # Campos que podem ser atualizados
        updatable_fields = ['name', 'bio', 'avatar_url']
        
        for field in updatable_fields:
            if field in data:
                setattr(user, field, data[field])
        
        # Verificar se username foi alterado
        if 'username' in data and data['username'] != user.username:
            new_username = data['username'].lower().strip()
            if User.find_by_username(new_username):
                return jsonify({'error': 'Nome de usuário já está em uso'}), 400
            user.username = new_username
        
        user.save()
        
        return jsonify({
            'message': 'Perfil atualizado com sucesso',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Alterar senha"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        data = request.get_json()
        
        # Validar dados
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Senha atual e nova senha são obrigatórias'}), 400
        
        # Verificar senha atual
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Senha atual incorreta'}), 401
        
        # Validar nova senha
        if len(data['new_password']) < 6:
            return jsonify({'error': 'Nova senha deve ter pelo menos 6 caracteres'}), 400
        
        # Atualizar senha
        user.set_password(data['new_password'])
        user.save()
        
        return jsonify({
            'message': 'Senha alterada com sucesso'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@auth_bp.route('/verify-token', methods=['POST'])
@jwt_required()
def verify_token():
    """Verificar se token é válido"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'Token inválido'}), 401
        
        return jsonify({
            'valid': True,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Token inválido'}), 401

