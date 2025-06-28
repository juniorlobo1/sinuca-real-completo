import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  User, 
  Trophy, 
  Target, 
  Star,
  Award,
  TrendingUp,
  Calendar,
  Edit
} from 'lucide-react'

export default function Profile({ user, token, onUserUpdate }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('stats')

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

  const achievements = [
    { id: 1, name: 'Primeira Vitória', description: 'Ganhe sua primeira partida', icon: '🏆', unlocked: true },
    { id: 2, name: 'Sequência de 5', description: 'Vença 5 partidas seguidas', icon: '🔥', unlocked: true },
    { id: 3, name: 'Milionário', description: 'Acumule R$ 1.000 em ganhos', icon: '💰', unlocked: true },
    { id: 4, name: 'Atirador Certeiro', description: 'Acerte 10 bolas seguidas', icon: '🎯', unlocked: false },
    { id: 5, name: 'Veterano', description: 'Jogue 100 partidas', icon: '⭐', unlocked: false },
    { id: 6, name: 'Lenda', description: 'Alcance o rank Diamante', icon: '💠', unlocked: false }
  ]

  const recentGames = [
    { id: 1, opponent: 'Carlos Silva', result: 'win', amount: 47.50, date: '2025-06-27' },
    { id: 2, opponent: 'Ana Costa', result: 'win', amount: 23.75, date: '2025-06-27' },
    { id: 3, opponent: 'Roberto Lima', result: 'loss', amount: -25.00, date: '2025-06-26' },
    { id: 4, opponent: 'Maria Santos', result: 'win', amount: 38.00, date: '2025-06-26' },
    { id: 5, opponent: 'Pedro Oliveira', result: 'win', amount: 19.00, date: '2025-06-25' }
  ]

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
              <h1 className="text-2xl font-bold text-white">Perfil</h1>
              <p className="text-green-200">Suas estatísticas e conquistas</p>
            </div>
          </div>
          
          <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <Edit size={20} />
          </button>
        </div>
      </motion.header>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20"
      >
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
            {user.name?.charAt(0) || 'U'}
          </div>
          
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-2">{user.name}</h2>
            <div className="flex items-center space-x-4 text-green-200 mb-4">
              <span className={getRankColor(user.rank)}>
                {getRankIcon(user.rank)} {user.rank}
              </span>
              <span>•</span>
              <span>Nível {user.level}</span>
              <span>•</span>
              <span>Rating {user.skill_rating}</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{user.games_played || 45}</div>
                <div className="text-green-200 text-sm">Partidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{user.games_won || 32}</div>
                <div className="text-green-200 text-sm">Vitórias</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{user.win_rate || 71.1}%</div>
                <div className="text-green-200 text-sm">Taxa de Vitória</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">R$ {user.total_winnings?.toFixed(2) || '1850.00'}</div>
                <div className="text-green-200 text-sm">Total Ganho</div>
              </div>
            </div>
          </div>
        </div>

        {/* Experience Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>Nível {user.level}</span>
            <span>{user.experience || 2450}/3000 XP</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-emerald-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((user.experience || 2450) / 3000) * 100}%` }}
            ></div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
      >
        <div className="flex space-x-1 bg-white/10 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'stats'
                ? 'bg-white text-green-800 shadow-lg'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <TrendingUp size={16} />
            <span>Estatísticas</span>
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'achievements'
                ? 'bg-white text-green-800 shadow-lg'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Award size={16} />
            <span>Conquistas</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'history'
                ? 'bg-white text-green-800 shadow-lg'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Calendar size={16} />
            <span>Histórico</span>
          </button>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Trophy className="text-yellow-400" size={20} />
                  <span>Performance</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Melhor sequência:</span>
                    <span className="text-white font-medium">8 vitórias</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Sequência atual:</span>
                    <span className="text-white font-medium">5 vitórias</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Maior ganho:</span>
                    <span className="text-white font-medium">R$ 95,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Tempo médio/partida:</span>
                    <span className="text-white font-medium">8m 32s</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Target className="text-green-400" size={20} />
                  <span>Precisão</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Taxa de acerto:</span>
                    <span className="text-white font-medium">78.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Bolas encaçapadas:</span>
                    <span className="text-white font-medium">342</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Tacadas perfeitas:</span>
                    <span className="text-white font-medium">89</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Quebras certeiras:</span>
                    <span className="text-white font-medium">23</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Progresso Mensal</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">+12</div>
                  <div className="text-white/60 text-sm">Vitórias este mês</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-400">+450</div>
                  <div className="text-white/60 text-sm">XP ganho</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-yellow-400">+2</div>
                  <div className="text-white/60 text-sm">Níveis subidos</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-400">R$ 285</div>
                  <div className="text-white/60 text-sm">Ganhos do mês</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Conquistas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`rounded-lg p-4 border transition-all ${
                    achievement.unlocked
                      ? 'bg-green-500/20 border-green-500/50'
                      : 'bg-white/5 border-white/10 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{achievement.name}</div>
                      <div className="text-white/60 text-sm">{achievement.description}</div>
                    </div>
                    {achievement.unlocked && (
                      <div className="text-green-400">
                        <Star size={20} fill="currentColor" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Partidas Recentes</h3>
            <div className="space-y-3">
              {recentGames.map((game) => (
                <div
                  key={game.id}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        game.result === 'win' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      <div>
                        <div className="text-white font-medium">
                          vs {game.opponent}
                        </div>
                        <div className="text-white/60 text-sm">
                          {new Date(game.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-bold ${
                        game.result === 'win' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {game.result === 'win' ? 'VITÓRIA' : 'DERROTA'}
                      </div>
                      <div className={`text-sm ${
                        game.amount > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {game.amount > 0 ? '+' : ''}R$ {Math.abs(game.amount).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

