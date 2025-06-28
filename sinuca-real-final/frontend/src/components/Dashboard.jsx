import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  User, 
  Wallet, 
  Trophy, 
  Play, 
  Settings, 
  LogOut,
  Plus,
  Users,
  Target,
  Star
} from 'lucide-react'

const API_BASE = import.meta.env.URL_API_VITE;

export default function Dashboard({ user, token, onLogout, onUserUpdate }) {
  const navigate = useNavigate()
  const [bets, setBets] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalGames: 0,
    winRate: 0,
    totalWinnings: 0,
    currentStreak: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Carregar apostas disponíveis
      const betsResponse = await fetch(`${API_BASE}/api/betting/bets`)
      if (betsResponse.ok) {
        const betsData = await betsResponse.json()
        setBets(betsData.bets || [])
      }

      // Simular estatísticas
      setStats({
        totalGames: user.games_played || 45,
        winRate: user.win_rate || 71.1,
        totalWinnings: user.total_winnings || 1850.00,
        currentStreak: 5
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankColor = (rank) => {
    const colors = {
      'Bronze': 'text-orange-400',
      'Prata': 'text-gray-400',
      'Ouro': 'text-yellow-400',
      'Platina': 'text-blue-400',
      'Diamante': 'text-purple-400'
    }
    return colors[rank] || 'text-gray-400'
  }

  const getRankIcon = (rank) => {
    const icons = {
      'Bronze': '🥉',
      'Prata': '🥈',
      'Ouro': '🥇',
      'Platina': '💎',
      'Diamante': '💠'
    }
    return icons[rank] || '🏆'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Carregando dashboard...</div>
      </div>
    )
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
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Olá, {user.name}! 👋
              </h1>
              <div className="flex items-center space-x-2 text-green-200">
                <span className={getRankColor(user.rank)}>
                  {getRankIcon(user.rank)} {user.rank}
                </span>
                <span>•</span>
                <span>Nível {user.level}</span>
                <span>•</span>
                <span>Rating {user.skill_rating}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                R$ {user.balance?.toFixed(2) || '0.00'}
              </div>
              <div className="text-green-200 text-sm">Saldo disponível</div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalGames}</div>
              <div className="text-green-200 text-sm">Partidas Jogadas</div>
            </div>
            <Target className="text-green-400" size={24} />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{stats.winRate}%</div>
              <div className="text-green-200 text-sm">Taxa de Vitória</div>
            </div>
            <Trophy className="text-yellow-400" size={24} />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">R$ {stats.totalWinnings.toFixed(2)}</div>
              <div className="text-green-200 text-sm">Total Ganho</div>
            </div>
            <Wallet className="text-green-400" size={24} />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{stats.currentStreak}</div>
              <div className="text-green-200 text-sm">Sequência Atual</div>
            </div>
            <Star className="text-purple-400" size={24} />
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <button
          onClick={() => navigate('/game')}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white hover:from-green-600 hover:to-emerald-700 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <div className="text-xl font-bold mb-1">Jogar Agora</div>
              <div className="text-green-100 text-sm">Encontrar partida</div>
            </div>
            <Play className="group-hover:scale-110 transition-transform" size={32} />
          </div>
        </button>

        <button
          onClick={() => navigate('/payments')}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-white hover:bg-white/20 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <div className="text-xl font-bold mb-1">Carteira</div>
              <div className="text-green-200 text-sm">Depósitos e saques</div>
            </div>
            <Wallet className="group-hover:scale-110 transition-transform" size={32} />
          </div>
        </button>

        <button
          onClick={() => navigate('/profile')}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-white hover:bg-white/20 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <div className="text-xl font-bold mb-1">Perfil</div>
              <div className="text-green-200 text-sm">Estatísticas e config</div>
            </div>
            <User className="group-hover:scale-110 transition-transform" size={32} />
          </div>
        </button>
      </motion.div>

      {/* Available Bets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Apostas Disponíveis</h2>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all">
            <Plus size={16} />
            <span>Nova Aposta</span>
          </button>
        </div>

        {bets.length > 0 ? (
          <div className="space-y-4">
            {bets.map((bet) => (
              <div
                key={bet.id}
                className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {bet.creator?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="text-white font-medium">{bet.creator?.name}</div>
                      <div className="text-green-200 text-sm flex items-center space-x-2">
                        <span>{getRankIcon(bet.creator?.rank)} {bet.creator?.rank}</span>
                        <span>•</span>
                        <span>Nível {bet.creator?.level}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      R$ {bet.total_prize?.toFixed(2)}
                    </div>
                    <div className="text-green-200 text-sm">
                      Aposta: R$ {bet.amount?.toFixed(2)}
                    </div>
                  </div>
                  
                  <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-all">
                    Aceitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="mx-auto text-white/40 mb-4" size={48} />
            <div className="text-white/60 text-lg mb-2">Nenhuma aposta disponível</div>
            <div className="text-white/40 text-sm">Seja o primeiro a criar uma aposta!</div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

