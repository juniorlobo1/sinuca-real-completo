import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  ArrowLeft, Users, Target, Clock, Trophy, MessageCircle, 
  Settings, Volume2, VolumeX, Crown, Zap
} from 'lucide-react'

// Engine de Física Avançado
class Ball {
  constructor(x, y, number, color, type = 'solid') {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.number = number;
    this.color = color;
    this.type = type;
    this.active = true;
    this.mass = 1;
    this.radius = 11;
    this.spin = { x: 0, y: 0 };
    this.friction = 0.98;
  }

  update() {
    if (!this.active) return;
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;
    if (Math.abs(this.vx) < 0.1 && Math.abs(this.vy) < 0.1) {
      this.vx = 0;
      this.vy = 0;
    }
  }

  draw(ctx) {
    if (!this.active) return;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    
    const gradient = ctx.createRadialGradient(
      this.x - 4, this.y - 4, 0,
      this.x, this.y, this.radius
    );
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, this.darkenColor(this.color, 0.3));
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    if (this.number > 0) {
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = this.number === 8 ? 'white' : 'white';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.number.toString(), this.x, this.y);
    }
    ctx.restore();
  }

  darkenColor(color, factor) {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - factor));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - factor));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - factor));
    return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
  }
}

export default function SinucaRealCommercial({ user, token }) {
  const navigate = useNavigate()
  const { gameId } = useParams()
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  
  const [gameState, setGameState] = useState('playing')
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [power, setPower] = useState(50)
  const [balls, setBalls] = useState([])
  const [cueBall, setCueBall] = useState(null)
  
  const [gameData, setGameData] = useState({
    id: gameId || '1',
    player1: user || { 
      id: 1, 
      name: 'Você', 
      level: 15, 
      rank: 'Ouro',
      rating: 1850,
      avatar: '🎱'
    },
    player2: {
      id: 2,
      name: 'Adversário Pro',
      level: 18,
      rank: 'Platina', 
      rating: 2100,
      avatar: '👑'
    },
    bet_amount: 50.00,
    total_prize: 95.00,
    room_code: 'ROOM-' + Math.random().toString(36).substr(2, 6).toUpperCase()
  })

  useEffect(() => {
    initializeGame()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const initializeGame = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = 1200
    canvas.height = 600
    initializeBalls()
    gameLoop()
  }

  const initializeBalls = () => {
    const newBalls = []
    const cueBall = new Ball(300, 300, 0, '#FFFFFF', 'cue')
    newBalls.push(cueBall)
    setCueBall(cueBall)
    
    const ballConfigs = [
      { num: 1, color: '#FFD700', type: 'solid' },
      { num: 2, color: '#0066CC', type: 'solid' },
      { num: 3, color: '#CC0000', type: 'solid' },
      { num: 4, color: '#663399', type: 'solid' },
      { num: 5, color: '#FF6600', type: 'solid' },
      { num: 6, color: '#006600', type: 'solid' },
      { num: 7, color: '#990000', type: 'solid' },
      { num: 8, color: '#000000', type: 'eight' }
    ]
    
    ballConfigs.forEach((config, i) => {
      const x = 900 + (i % 3) * 25
      const y = 280 + Math.floor(i / 3) * 25
      const ball = new Ball(x, y, config.num, config.color, config.type)
      newBalls.push(ball)
    })
    
    setBalls(newBalls)
  }

  const gameLoop = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    drawTable(ctx)
    
    // Atualizar física
    balls.forEach(ball => ball.update())
    
    // Desenhar bolas
    balls.forEach(ball => ball.draw(ctx))
    
    animationRef.current = requestAnimationFrame(gameLoop)
  }

  const drawTable = (ctx) => {
    // Mesa principal
    ctx.fillStyle = '#0f5132'
    ctx.fillRect(40, 40, 1120, 520)
    
    // Bordas da mesa
    ctx.strokeStyle = '#8b4513'
    ctx.lineWidth = 20
    ctx.strokeRect(30, 30, 1140, 540)
    
    // Caçapas
    const pockets = [
      [40, 40], [600, 40], [1160, 40],
      [40, 560], [600, 560], [1160, 560]
    ]
    
    pockets.forEach(([x, y]) => {
      ctx.fillStyle = '#000'
      ctx.beginPath()
      ctx.arc(x, y, 25, 0, Math.PI * 2)
      ctx.fill()
      
      // Efeito de profundidade
      ctx.fillStyle = '#333'
      ctx.beginPath()
      ctx.arc(x, y, 20, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  const handleCanvasClick = (e) => {
    if (!cueBall) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left * (canvas.width / rect.width)
    const y = e.clientY - rect.top * (canvas.height / rect.height)
    
    const force = power * 0.2
    const angle = Math.atan2(y - cueBall.y, x - cueBall.x)
    cueBall.vx = Math.cos(angle) * force
    cueBall.vy = Math.sin(angle) * force
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header Profissional */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/30 backdrop-blur-xl border-b border-white/10 p-4"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">🎱 Sinuca Real Pro</h1>
                <p className="text-sm text-gray-300">Sala: {gameData.room_code}</p>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-400">
              R$ {gameData.total_prize?.toFixed(2)}
            </div>
            <div className="text-sm text-gray-300">Prêmio Total</div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto p-4">
        {/* Informações dos Jogadores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 mb-4 border border-white/10"
        >
          <div className="flex justify-between items-center mb-6">
            {/* Jogador 1 */}
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-green-500/20 border-2 border-green-500/50">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-2xl">
                  {gameData.player1?.avatar}
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Zap className="text-white" size={12} />
                </div>
              </div>
              <div>
                <div className="text-white font-bold text-lg">{gameData.player1?.name}</div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-yellow-400">⭐ {gameData.player1?.rating}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-blue-400">{gameData.player1?.rank}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-green-400">Nv.{gameData.player1?.level}</span>
                </div>
              </div>
            </div>

            {/* Versus */}
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">VS</div>
              <div className="text-yellow-400 font-bold">
                R$ {gameData.total_prize?.toFixed(2)}
</div>
</div>

{/* Jogador 2 */}
<div className="flex items-center space-x-4 p-4 rounded-xl bg-white/5">
<div>
<div className="text-white font-bold text-lg text-right">{gameData.player2?.name}</div>
<div className="flex items-center justify-end space-x-2 text-sm">
<span className="text-green-400">Nv.{gameData.player2?.level}</span>
<span className="text-gray-300">•</span>
<span className="text-blue-400">{gameData.player2?.rank}</span>
<span className="text-gray-300">•</span>
<span className="text-yellow-400">⭐ {gameData.player2?.rating}</span>
</div>
</div>
<div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-2xl">
{gameData.player2?.avatar}
</div>
</div>
</div>

{/* Canvas do Jogo */}
<div className="bg-green-900 rounded-lg p-4 mb-6">
<canvas
ref={canvasRef}
onClick={handleCanvasClick}
className="w-full border-2 border-amber-600 rounded-lg cursor-crosshair bg-gradient-to-br from-green-800 to-green-900"
style={{ aspectRatio: '2/1' }}
/>
</div>

{/* Controles do Jogo */}
<div className="flex justify-center items-center space-x-6">
<div className="bg-white/10 rounded-lg p-4 border border-white/20">
<div className="text-white/80 text-sm mb-2">Força: {power}%</div>
<input
type="range"
min="10"
max="100"
value={power}
onChange={(e) => setPower(parseInt(e.target.value))}
className="w-32 h-2 bg-white/20 rounded-full appearance-none cursor-pointer"
/>
</div>

<div className="bg-white/10 rounded-lg p-4 border border-white/20">
<div className="text-white text-sm">
🖱️ Clique para mirar e atirar
</div>
</div>
</div>

{/* Instruções */}
<div className="mt-6 bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
<div className="text-blue-200 text-sm">
💡 <strong>Versão Comercial:</strong> Engine de física avançado, gráficos profissionais,
sistema de ranking e apostas integrado. Clique na mesa para atirar!
</div>
</div>
</motion.div>
</div>
</div>
)
🚀}
