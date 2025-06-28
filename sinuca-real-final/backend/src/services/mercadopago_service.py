import mercadopago
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import os

class MercadoPagoService:
    """Serviço para integração com Mercado Pago"""
    
    def __init__(self):
        # Credenciais de teste do Mercado Pago
        # Em produção, usar variáveis de ambiente
        self.access_token = os.getenv('MERCADOPAGO_ACCESS_TOKEN', 'TEST-1234567890-123456-abcdef123456789-123456789')
        self.sdk = mercadopago.SDK(self.access_token)
        
    def create_pix_payment(self, amount: float, description: str, payer_email: str, 
                          external_reference: str = None) -> Dict[str, Any]:
        """
        Criar pagamento PIX
        
        Args:
            amount: Valor do pagamento
            description: Descrição do pagamento
            payer_email: Email do pagador
            external_reference: Referência externa (ID da aposta)
            
        Returns:
            Dict com dados do pagamento criado
        """
        try:
            payment_data = {
                "transaction_amount": float(amount),
                "description": description,
                "payment_method_id": "pix",
                "payer": {
                    "email": payer_email
                },
                "external_reference": external_reference or str(uuid.uuid4()),
                "notification_url": "https://sinuca-real.com/webhooks/mercadopago",
                "date_of_expiration": (datetime.now() + timedelta(minutes=30)).isoformat()
            }
            
            # Configurar headers com chave de idempotência
            request_options = mercadopago.config.RequestOptions()
            request_options.custom_headers = {
                'x-idempotency-key': str(uuid.uuid4())
            }
            
            # Criar pagamento
            result = self.sdk.payment().create(payment_data, request_options)
            
            if result["status"] == 201:
                payment = result["response"]
                return {
                    "success": True,
                    "payment_id": payment["id"],
                    "status": payment["status"],
                    "qr_code": payment["point_of_interaction"]["transaction_data"]["qr_code"],
                    "qr_code_base64": payment["point_of_interaction"]["transaction_data"]["qr_code_base64"],
                    "ticket_url": payment["point_of_interaction"]["transaction_data"]["ticket_url"],
                    "amount": payment["transaction_amount"],
                    "currency": payment["currency_id"],
                    "external_reference": payment["external_reference"],
                    "expires_at": payment["date_of_expiration"]
                }
            else:
                return {
                    "success": False,
                    "error": result["response"],
                    "status_code": result["status"]
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Erro ao criar pagamento PIX: {str(e)}"
            }
    
    def create_card_payment(self, amount: float, description: str, token: str,
                           installments: int, payer_email: str, 
                           external_reference: str = None) -> Dict[str, Any]:
        """
        Criar pagamento com cartão
        
        Args:
            amount: Valor do pagamento
            description: Descrição do pagamento
            token: Token do cartão
            installments: Número de parcelas
            payer_email: Email do pagador
            external_reference: Referência externa
            
        Returns:
            Dict com dados do pagamento criado
        """
        try:
            payment_data = {
                "transaction_amount": float(amount),
                "token": token,
                "description": description,
                "installments": installments,
                "payment_method_id": "visa",  # Será determinado automaticamente pelo token
                "payer": {
                    "email": payer_email
                },
                "external_reference": external_reference or str(uuid.uuid4()),
                "notification_url": "https://sinuca-real.com/webhooks/mercadopago"
            }
            
            # Configurar headers
            request_options = mercadopago.config.RequestOptions()
            request_options.custom_headers = {
                'x-idempotency-key': str(uuid.uuid4())
            }
            
            # Criar pagamento
            result = self.sdk.payment().create(payment_data, request_options)
            
            if result["status"] == 201:
                payment = result["response"]
                return {
                    "success": True,
                    "payment_id": payment["id"],
                    "status": payment["status"],
                    "status_detail": payment["status_detail"],
                    "amount": payment["transaction_amount"],
                    "currency": payment["currency_id"],
                    "installments": payment["installments"],
                    "payment_method": payment["payment_method_id"],
                    "external_reference": payment["external_reference"]
                }
            else:
                return {
                    "success": False,
                    "error": result["response"],
                    "status_code": result["status"]
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Erro ao criar pagamento com cartão: {str(e)}"
            }
    
    def get_payment(self, payment_id: str) -> Dict[str, Any]:
        """
        Consultar status de um pagamento
        
        Args:
            payment_id: ID do pagamento no Mercado Pago
            
        Returns:
            Dict com dados do pagamento
        """
        try:
            result = self.sdk.payment().get(payment_id)
            
            if result["status"] == 200:
                payment = result["response"]
                return {
                    "success": True,
                    "payment_id": payment["id"],
                    "status": payment["status"],
                    "status_detail": payment["status_detail"],
                    "amount": payment["transaction_amount"],
                    "currency": payment["currency_id"],
                    "payment_method": payment["payment_method_id"],
                    "external_reference": payment.get("external_reference"),
                    "date_created": payment["date_created"],
                    "date_approved": payment.get("date_approved"),
                    "payer_email": payment["payer"]["email"]
                }
            else:
                return {
                    "success": False,
                    "error": result["response"],
                    "status_code": result["status"]
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Erro ao consultar pagamento: {str(e)}"
            }
    
    def create_refund(self, payment_id: str, amount: float = None) -> Dict[str, Any]:
        """
        Criar reembolso total ou parcial
        
        Args:
            payment_id: ID do pagamento
            amount: Valor do reembolso (None para reembolso total)
            
        Returns:
            Dict com dados do reembolso
        """
        try:
            refund_data = {}
            if amount:
                refund_data["amount"] = float(amount)
            
            result = self.sdk.refund().create(payment_id, refund_data)
            
            if result["status"] == 201:
                refund = result["response"]
                return {
                    "success": True,
                    "refund_id": refund["id"],
                    "payment_id": refund["payment_id"],
                    "amount": refund["amount"],
                    "status": refund["status"],
                    "date_created": refund["date_created"]
                }
            else:
                return {
                    "success": False,
                    "error": result["response"],
                    "status_code": result["status"]
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Erro ao criar reembolso: {str(e)}"
            }
    
    def get_payment_methods(self) -> Dict[str, Any]:
        """
        Obter métodos de pagamento disponíveis
        
        Returns:
            Dict com métodos de pagamento
        """
        try:
            result = self.sdk.payment_methods().list_all()
            
            if result["status"] == 200:
                methods = result["response"]
                
                # Filtrar métodos relevantes
                pix_methods = [m for m in methods if m["id"] == "pix"]
                card_methods = [m for m in methods if m["payment_type_id"] in ["credit_card", "debit_card"]]
                
                return {
                    "success": True,
                    "pix": pix_methods,
                    "cards": card_methods,
                    "all_methods": methods
                }
            else:
                return {
                    "success": False,
                    "error": result["response"],
                    "status_code": result["status"]
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Erro ao obter métodos de pagamento: {str(e)}"
            }
    
    def process_webhook(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processar webhook do Mercado Pago
        
        Args:
            webhook_data: Dados do webhook
            
        Returns:
            Dict com dados processados
        """
        try:
            # Verificar tipo de notificação
            if webhook_data.get("type") == "payment":
                payment_id = webhook_data.get("data", {}).get("id")
                
                if payment_id:
                    # Consultar dados atualizados do pagamento
                    payment_info = self.get_payment(str(payment_id))
                    
                    if payment_info["success"]:
                        return {
                            "success": True,
                            "type": "payment_update",
                            "payment_id": payment_id,
                            "status": payment_info["status"],
                            "external_reference": payment_info.get("external_reference"),
                            "amount": payment_info["amount"]
                        }
            
            return {
                "success": False,
                "error": "Tipo de webhook não suportado"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Erro ao processar webhook: {str(e)}"
            }

# Instância global do serviço
mercadopago_service = MercadoPagoService()

