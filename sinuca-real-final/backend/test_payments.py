#!/usr/bin/env python3
"""
Teste do Sistema de Pagamentos Mercado Pago
"""

import requests
import json
import time

# Configurações
BASE_URL = "http://localhost:5001"
TEST_USER = {
    "email": "joao@exemplo.com",
    "password": "123456"
}

def test_login():
    """Fazer login e obter token"""
    print("🔐 Testando login...")
    
    response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('token')
        user = data.get('user')
        print(f"✅ Login realizado com sucesso!")
        print(f"   Usuário: {user['name']}")
        print(f"   Saldo atual: R$ {user['balance']:.2f}")
        return token
    else:
        print(f"❌ Erro no login: {response.text}")
        return None

def test_payment_methods(token):
    """Testar obtenção de métodos de pagamento"""
    print("\n💳 Testando métodos de pagamento...")
    
    response = requests.get(f"{BASE_URL}/api/payments/payment-methods")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Métodos de pagamento obtidos:")
        print(f"   PIX: R$ {data['pix']['min_amount']:.2f} - R$ {data['pix']['max_amount']:.2f}")
        print(f"   Cartão: R$ {data['credit_card']['min_amount']:.2f} - R$ {data['credit_card']['max_amount']:.2f}")
        return True
    else:
        print(f"❌ Erro ao obter métodos: {response.text}")
        return False

def test_pix_deposit(token):
    """Testar criação de depósito PIX"""
    print("\n💰 Testando depósito PIX...")
    
    headers = {"Authorization": f"Bearer {token}"}
    deposit_data = {
        "amount": 50.00
    }
    
    response = requests.post(
        f"{BASE_URL}/api/payments/deposit/pix", 
        json=deposit_data,
        headers=headers
    )
    
    if response.status_code == 201:
        data = response.json()
        print("✅ Depósito PIX criado com sucesso!")
        print(f"   ID da transação: {data['transaction_id']}")
        print(f"   ID do pagamento: {data['payment_id']}")
        print(f"   Valor: R$ {data['amount']:.2f}")
        print(f"   Status: {data['status']}")
        print(f"   QR Code: {data['qr_code'][:50]}...")
        return data['payment_id']
    else:
        print(f"❌ Erro ao criar depósito PIX: {response.text}")
        return None

def test_payment_status(token, payment_id):
    """Testar consulta de status de pagamento"""
    print(f"\n🔍 Testando consulta de status do pagamento {payment_id}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{BASE_URL}/api/payments/payment/{payment_id}/status",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Status do pagamento consultado:")
        print(f"   Status: {data['status']}")
        print(f"   Valor: R$ {data['amount']:.2f}")
        print(f"   Criado em: {data['date_created']}")
        return True
    else:
        print(f"❌ Erro ao consultar status: {response.text}")
        return False

def test_transactions(token):
    """Testar histórico de transações"""
    print("\n📊 Testando histórico de transações...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{BASE_URL}/api/payments/transactions",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        transactions = data['transactions']
        print(f"✅ Histórico obtido: {len(transactions)} transações")
        
        for i, transaction in enumerate(transactions[:3]):  # Mostrar apenas 3
            print(f"   {i+1}. {transaction['type']} - R$ {transaction['amount']:.2f} - {transaction['status']}")
        
        return True
    else:
        print(f"❌ Erro ao obter histórico: {response.text}")
        return False

def test_withdrawal(token):
    """Testar criação de saque"""
    print("\n💸 Testando saque...")
    
    headers = {"Authorization": f"Bearer {token}"}
    withdrawal_data = {
        "amount": 25.00,
        "pix_key": "joao@exemplo.com"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/payments/withdraw",
        json=withdrawal_data,
        headers=headers
    )
    
    if response.status_code == 201:
        data = response.json()
        print("✅ Saque criado com sucesso!")
        print(f"   ID da transação: {data['transaction_id']}")
        print(f"   Valor: R$ {data['amount']:.2f}")
        print(f"   Chave PIX: {data['pix_key']}")
        print(f"   Tempo estimado: {data['estimated_time']}")
        return True
    else:
        print(f"❌ Erro ao criar saque: {response.text}")
        return False

def main():
    """Executar todos os testes"""
    print("🚀 INICIANDO TESTES DO SISTEMA DE PAGAMENTOS MERCADO PAGO")
    print("=" * 60)
    
    # 1. Login
    token = test_login()
    if not token:
        print("❌ Falha no login. Abortando testes.")
        return
    
    # 2. Métodos de pagamento
    test_payment_methods(token)
    
    # 3. Depósito PIX
    payment_id = test_pix_deposit(token)
    
    # 4. Status do pagamento
    if payment_id:
        test_payment_status(token, payment_id)
    
    # 5. Histórico de transações
    test_transactions(token)
    
    # 6. Saque
    test_withdrawal(token)
    
    print("\n" + "=" * 60)
    print("🎉 TESTES CONCLUÍDOS!")
    print("\n💡 Observações:")
    print("   - Os pagamentos estão em modo de teste")
    print("   - PIX e cartões usam credenciais de sandbox")
    print("   - Em produção, configurar webhooks reais")
    print("   - Implementar KYC para valores altos")

if __name__ == "__main__":
    main()

