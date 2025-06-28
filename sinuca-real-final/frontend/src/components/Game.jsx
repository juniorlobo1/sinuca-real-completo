import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Target, Clock } from 'lucide-react'

export default function Game({ user, token }) {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('waiting') // waiting, playing, finished
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [gameData, setGameData] = useState({
    player1: user,
    player2: null,
    bet_amount: 0,
    total_prize: 0
  })

  useEffect(() => {
    // Inicializar jogo de sinuca
    initializeGame()
  }, [])

  const initializeGame = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    
    // Configurar canvas
    canvas.width = 800
    canvas.height = 400
    
    // Desenhar mesa
    drawTable(ctx)
    drawBalls(ctx)
  }

  const drawTable = (ctx) => {
    // Mesa de sinuca
    ctx.fillStyle = '#0f5132'
    ctx.fillRect(50, 50, 700, 300)
    
    // Bordas
    ctx.strokeStyle = '#8b4513'
    ctx.lineWidth = 10
    ctx.strokeRect(45, 45, 710, 310)
    
    // Caçapas
    const pockets = [
      [50, 50], [400, 50], [750, 50],
      [50, 350], [400, 350], [750, 350]
    ]
    
    ctx.fillStyle = '#000'
    pockets.forEach(([x, y]) => {
      ctx.beginPath()
      ctx.arc(x, y, 15, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  const drawBalls = (ctx) => {
    // Bola branca (cue ball)
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(200, 200, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 1
    ctx.stroke()
    
    // Bolas coloridas em formação triangular
    const ballPositions = [
      [600, 200], // Bola 8 (preta) no centro
      [580, 190], [580, 210], // Segunda fileira
      [560, 180], [560, 200], [560, 220], // Terceira fileira
      [540, 170], [540, 190], [540, 210], [540, 230], // Quarta fileira
      [520, 160], [520, 180], [520, 200], [520, 220], [520, 240] // Quinta fileira
    ]
    
    const ballColors = [
      '#000', // 8-ball
      '#ffff00', '#0000ff', '#ff0000', '#800080', // Sólidas
      '#ff8c00', '#008000', '#8b0000', '#000080',
      '#ffff00', '#0000ff', '#ff0000', '#800080', // Listradas (simuladas)
      '#ff8c00', '#008000'
    ]
    
    ballPositions.forEach(([x, y], index) => {
      ctx.fillStyle = ballColors[index] || '#ccc'
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 1
      ctx.stroke()
      
      // Número da bola
      if (index === 0) {
        ctx.fillStyle = '#fff'
        ctx.font = '10px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('8', x, y + 3)
      }
    })
  }

  const handleCanvasClick = (e) => {
    if (gameState !== 'playing') return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Simular tacada
    console.log(`Tacada em: ${x}, ${y}`)
    
    // Alternar jogador
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
  }

  const startGame = () => {
    setGameState('playing')
    setGameData({
      ...gameData,
      player2: {
        id: 2,
        name: 'Oponente',
        level: 12,
        rank: 'Prata'
      },
      bet_amount: 25.00,
      total_prize: 47.50 // 50 - 5% taxa
    })
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
              <h1 className="text-2xl font-bold text-white">Sinuca Real</h1>
              <p className="text-green-200">8-Ball Pool com apostas</p>
            </div>
          </div>
          
          {gameState === 'playing' && (
            <div className="text-right">
              <div className="text-xl font-bold text-white">
                R$ {gameData.total_prize?.toFixed(2)}
              </div>
              <div className="text-green-200">Prêmio total</div>
            </div>
          )}
        </div>
      </motion.header>

      {/* Game Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
      >
        {gameState === 'waiting' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-6">🎱</div>
            <h2 className="text-2xl font-bold text-white mb-4">Pronto para jogar?</h2>
            <p className="text-green-200 mb-8">
              Encontre um oponente e comece a partida
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <Users className="mx-auto text-blue-400 mb-2" size={32} />
                <div className="text-white font-medium">Matchmaking</div>
                <div className="text-white/60 text-sm">Oponente automático</div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <Target className="mx-auto text-green-400 mb-2" size={32} />
                <div className="text-white font-medium">Aposta</div>
                <div className="text-white/60 text-sm">R$ 25,00</div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <Clock className="mx-auto text-purple-400 mb-2" size={32} />
                <div className="text-white font-medium">Duração</div>
                <div className="text-white/60 text-sm">~10 minutos</div>
              </div>
            </div>
            
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all text-lg"
            >
              Iniciar Partida
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div>
            {/* Players Info */}
            <div className="flex justify-between items-center mb-6">
              <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                currentPlayer === 1 ? 'bg-green-500/20 border border-green-500/50' : 'bg-white/5'
              }`}>
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                  {gameData.player1?.name?.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-medium">{gameData.player1?.name}</div>
                  <div className="text-green-200 text-sm">Nível {gameData.player1?.level}</div>
                </div>
                {currentPlayer === 1 && (
                  <div className="text-green-400 text-sm font-medium">Sua vez</div>
                )}
              </div>
              
              <div className="text-center">
                <div className="text-white/60 text-sm">VS</div>
                <div className="text-xl font-bold text-white">
                  R$ {gameData.total_prize?.toFixed(2)}
                </div>
              </div>
              
              <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                currentPlayer === 2 ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-white/5'
              }`}>
                <div>
                  <div className="text-white font-medium text-right">{gameData.player2?.name}</div>
                  <div className="text-blue-200 text-sm text-right">Nível {gameData.player2?.level}</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {gameData.player2?.name?.charAt(0)}
                </div>
                {currentPlayer === 2 && (
                  <div className="text-blue-400 text-sm font-medium">Vez do oponente</div>
                )}
              </div>
            </div>

            {/* Game Canvas */}
            <div className="bg-green-900 rounded-lg p-4 mb-6">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="w-full max-w-4xl mx-auto border border-green-700 rounded cursor-crosshair"
                style={{ aspectRatio: '2/1' }}
              />
            </div>

            {/* Game Controls */}
            <div className="flex justify-center space-x-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-white/60 text-sm mb-1">Força</div>
                <div className="w-32 h-2 bg-white/20 rounded-full">
                  <div className="w-1/2 h-full bg-green-400 rounded-full"></div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-white/60 text-sm mb-1">Controles</div>
                <div className="text-white text-sm">
                  🖱️ Mira | ⌨️ Espaço = Força
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
              <div className="text-blue-200 text-sm">
                💡 <strong>Como jogar:</strong> Use o mouse para mirar e pressione espaço para ajustar a força. 
                Encape todas as suas bolas (lisas ou listradas) e depois a bola 8 para vencer!
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

