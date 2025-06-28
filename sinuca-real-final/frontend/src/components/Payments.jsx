import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  DollarSign,
  History,
  Download,
  Upload,
  QrCode,
  Copy,
  Check
} from 'lucide-react'

const API_BASE = import.meta.env.URL_API_VITE;

export default function Payments({ user, token, onUserUpdate }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('deposit')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [pixData, setPixData] = useState(null)
  const [copied, setCopied] = useState(false)
  
  const [depositForm, setDepositForm] = useState({
    amount: '',
    method: 'pix'
  })
  
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    pixKey: ''
  })

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/payments/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
    }
  }

  const handlePixDeposit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE}/api/payments/deposit/pix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(depositForm.amount)
        })
      })

      const data = await response.json()

      if (response.ok) {
        setPixData(data)
        setDepositForm({ amount: '', method: 'pix' })
        loadTransactions()
      } else {
        alert(data.error || 'Erro ao criar depósito')
      }
    } catch (error) {
      alert('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE}/api/payments/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawForm.amount),
          pix_key: withdrawForm.pixKey
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Saque solicitado com sucesso!')
        setWithdrawForm({ amount: '', pixKey: '' })
        loadTransactions()
        
        // Atualizar saldo do usuário
        const updatedUser = { ...user, balance: user.balance - parseFloat(withdrawForm.amount) }
        onUserUpdate(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      } else {
        alert(data.error || 'Erro ao solicitar saque')
      }
    } catch (error) {
      alert('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const copyPixCode = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getTransactionIcon = (transaction) => {
    const icons = {
      deposit: <Upload className="text-green-400" size={20} />,
      withdrawal: <Download className="text-orange-400" size={20} />,
      bet_win: <DollarSign className="text-green-400" size={20} />,
      bet_loss: <DollarSign className="text-red-400" size={20} />
    }
    return icons[transaction.type] || <DollarSign size={20} />
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-400',
      approved: 'text-green-400',
      rejected: 'text-red-400'
    }
    return colors[status] || 'text-gray-400'
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Carteira</h1>
              <p className="text-green-200">Gerencie seus depósitos e saques</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              R$ {user.balance?.toFixed(2) || '0.00'}
            </div>
            <div className="text-green-200">Saldo disponível</div>
          </div>
        </div>
      </motion.header>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20"
      >
        <div className="flex space-x-1 bg-white/10 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'deposit'
                ? 'bg-white text-green-800 shadow-lg'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Upload size={16} />
            <span>Depositar</span>
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'withdraw'
                ? 'bg-white text-green-800 shadow-lg'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Download size={16} />
            <span>Sacar</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'history'
                ? 'bg-white text-green-800 shadow-lg'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <History size={16} />
            <span>Histórico</span>
          </button>
        </div>

        {/* Deposit Tab */}
        {activeTab === 'deposit' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Fazer Depósito</h3>
              
              {!pixData ? (
                <form onSubmit={handlePixDeposit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Valor do Depósito
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">
                        R$
                      </span>
                      <input
                        type="number"
                        min="10"
                        max="5000"
                        step="0.01"
                        value={depositForm.amount}
                        onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400"
                        placeholder="0,00"
                        required
                      />
                    </div>
                    <p className="text-white/60 text-sm mt-1">Mínimo: R$ 10,00 | Máximo: R$ 5.000,00</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-green-400 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <Smartphone className="text-green-400" size={24} />
                        <div>
                          <div className="text-white font-medium">PIX</div>
                          <div className="text-green-200 text-sm">Instantâneo</div>
                        </div>
                      </div>
                      <div className="text-white/60 text-sm">
                        Transferência instantânea via PIX
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/20 rounded-lg p-4 opacity-50">
                      <div className="flex items-center space-x-3 mb-2">
                        <CreditCard className="text-white/40" size={24} />
                        <div>
                          <div className="text-white/60 font-medium">Cartão</div>
                          <div className="text-white/40 text-sm">Em breve</div>
                        </div>
                      </div>
                      <div className="text-white/40 text-sm">
                        Cartão de crédito/débito
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !depositForm.amount}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Gerando PIX...' : 'Gerar PIX'}
                  </button>
                </form>
              ) : (
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="text-center mb-6">
                    <div className="text-2xl font-bold text-white mb-2">
                      PIX Gerado com Sucesso! 🎉
                    </div>
                    <div className="text-green-200">
                      Valor: R$ {pixData.amount?.toFixed(2)}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg mb-4">
                    <div className="w-48 h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                      <QrCode size={120} className="text-gray-600" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Código PIX Copia e Cola
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={pixData.qr_code || ''}
                          readOnly
                          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-l-lg text-white text-sm"
                        />
                        <button
                          onClick={copyPixCode}
                          className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-r-lg transition-all flex items-center space-x-2"
                        >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                          <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                      <div className="text-yellow-200 text-sm">
                        ⏰ <strong>Importante:</strong> Este PIX expira em 30 minutos. 
                        Após o pagamento, o valor será creditado automaticamente em sua conta.
                      </div>
                    </div>

                    <button
                      onClick={() => setPixData(null)}
                      className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg transition-all"
                    >
                      Gerar Novo PIX
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === 'withdraw' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Solicitar Saque</h3>
              
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Valor do Saque
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">
                      R$
                    </span>
                    <input
                      type="number"
                      min="20"
                      max={user.balance}
                      step="0.01"
                      value={withdrawForm.amount}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400"
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <p className="text-white/60 text-sm mt-1">
                    Mínimo: R$ 20,00 | Disponível: R$ {user.balance?.toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Chave PIX
                  </label>
                  <input
                    type="text"
                    value={withdrawForm.pixKey}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, pixKey: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="CPF, email, telefone ou chave aleatória"
                    required
                  />
                </div>

                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                  <div className="text-blue-200 text-sm">
                    ℹ️ <strong>Tempo de processamento:</strong> 1-2 dias úteis. 
                    O valor será transferido para a chave PIX informada.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !withdrawForm.amount || !withdrawForm.pixKey}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processando...' : 'Solicitar Saque'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Histórico de Transações</h3>
            
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction)}
                        <div>
                          <div className="text-white font-medium">
                            {transaction.description}
                          </div>
                          <div className="text-white/60 text-sm">
                            {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-white font-bold">
                          {transaction.type === 'withdrawal' ? '-' : '+'}R$ {transaction.amount?.toFixed(2)}
                        </div>
                        <div className={`text-sm ${getStatusColor(transaction.status)}`}>
                          {transaction.status === 'pending' ? 'Pendente' : 
                           transaction.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="mx-auto text-white/40 mb-4" size={48} />
                <div className="text-white/60 text-lg mb-2">Nenhuma transação encontrada</div>
                <div className="text-white/40 text-sm">Suas transações aparecerão aqui</div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

