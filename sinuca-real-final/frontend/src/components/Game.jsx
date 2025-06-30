import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Target, Clock } from 'lucide-react'

const Game = ({ user, token }) => {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  
  // Estado do jogo
  const [gamePhase, setGamePhase] = useState('waiting')
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [power, setPower] = useState(0)
  const [gameData, setGameData] = useState({
    player1: user || { name: 'João Silva', level: 15, rank: 'Ouro' },
    player2: null,
    bet_amount: 0,
    total_prize: 0
  })

  // Classe Vector2 (do Classic Pool Game)
  class Vector2 {
    constructor(x = 0, y = 0) {
      this.x = x
      this.y = y
    }
    
    copy() {
      return new Vector2(this.x, this.y)
    }
    
    static get zero() {
      return new Vector2(0, 0)
    }
    
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y)
    }
    
    normalize() {
      const len = this.length()
      if (len > 0) {
        this.x /= len
        this.y /= len
      }
      return this
    }
    
    multiply(scalar) {
      return new Vector2(this.x * scalar, this.y * scalar)
    }
    
    add(vector) {
      return new Vector2(this.x + vector.x, this.y + vector.y)
    }
    
    subtract(vector) {
      return new Vector2(this.x - vector.x, this.y - vector.y)
    }
  }

  // Classe Ball (adaptada do Classic Pool Game)
  class Ball {
    constructor(initPos, color, number) {
      this.initPos = initPos
      this.position = initPos.copy()
      this.velocity = Vector2.zero
      this.color = color
      this.number = number
      this.radius = 10
      this.moving = false
      this.visible = true
      this.inHole = false
      this.friction = 0.98
    }
    
    update() {
      if (this.inHole || !this.moving) return
      
      // Aplicar movimento
      this.position = this.position.add(this.velocity)
      
      // Aplicar atrito
      this.velocity.x *= this.friction
      this.velocity.y *= this.friction
      
      // Parar se velocidade muito baixa
      if (this.velocity.length() < 0.5) {
        this.velocity = Vector2.zero
        this.moving = false
      }
      
      // Colisão com bordas
      if (this.position.x - this.radius <= 20) {
        this.position.x = 20 + this.radius
        this.velocity.x = -this.velocity.x * 0.8
      }
      if (this.position.x + this.radius >= 780) {
        this.position.x = 780 - this.radius
        this.velocity.x = -this.velocity.x * 0.8
      }
      if (this.position.y - this.radius <= 20) {
        this.position.y = 20 + this.radius
        this.velocity.y = -this.velocity.y * 0.8
      }
      if (this.position.y + this.radius >= 380) {
        this.position.y = 380 - this.radius
        this.velocity.y = -this.velocity.y * 0.8
      }
    }
    
    draw(ctx) {
      if (this.inHole || !this.visible) return
      
      // Sombra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.beginPath()
      ctx.arc(this.position.x + 2, this.position.y + 2, this.radius, 0, Math.PI * 2)
      ctx.fill()
      
      // Bola
      ctx.fillStyle = this.color
      ctx.beginPath()
      ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
      ctx.fill()
      
      // Borda
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 1
      ctx.stroke()
      
      // Brilho
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.beginPath()
      ctx.arc(this.position.x - 3, this.position.y - 3, 4, 0, Math.PI * 2)
      ctx.fill()
      
      // Número
      if (this.number) {
        ctx.fillStyle = this.number === '8' ? '#FFFFFF' : '#000000'
        ctx.font = 'bold 12px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(this.number, this.position.x, this.position.y)
      }
    }
    
    shoot(power, angle) {
      if (power <= 0) return
      
      this.velocity = new Vector2(
        Math.cos(angle) * power,
        Math.sin(angle) * power
      )
      this.moving = true
    }
  }

  // Classe PoolGame (adaptada)
  class PoolGame {
    constructor(canvas) {
      console.log('🎮 CONSTRUTOR POOLGAME INICIADO')
      this.canvas = canvas
      this.ctx = canvas.getContext('2d')
      this.balls = []
      this.cueBall = null
      this.aimAngle = 0
      this.power = 0
      this.isAiming = true
      this.ballsMoving = false
      this.mousePos = new Vector2(0, 0)
      this.animationId = null
      
      console.log('🎮 Canvas:', canvas, 'Contexto:', this.ctx)
      
      this.initializeBalls()
      this.setupEventListeners()
      
      console.log('🎮 POOLGAME CONSTRUÍDO COM SUCESSO')
    }
    
    initializeBalls() {
      // Bola branca
      this.cueBall = new Ball(new Vector2(200, 200), '#FFFFFF', '')
      
      // Bolas coloridas
      const ballData = [
        { color: '#000000', number: '8' },
        { color: '#FFD700', number: '1' },
        { color: '#0000FF', number: '2' },
        { color: '#FF0000', number: '3' },
        { color: '#800080', number: '4' },
        { color: '#FFA500', number: '5' },
        { color: '#008000', number: '6' },
        { color: '#8B0000', number: '7' },
        { color: '#FFD700', number: '9' },
        { color: '#0000FF', number: '10' },
        { color: '#FF0000', number: '11' },
        { color: '#800080', number: '12' },
        { color: '#FFA500', number: '13' },
        { color: '#008000', number: '14' },
        { color: '#8B0000', number: '15' }
      ]
      
      // Posicionar em formação triangular
      let ballIndex = 0
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col <= row; col++) {
          if (ballIndex < ballData.length) {
            const x = 600 + row * 22
            const y = 200 + (col - row/2) * 22
            const ball = new Ball(
              new Vector2(x, y), 
              ballData[ballIndex].color, 
              ballData[ballIndex].number
            )
            this.balls.push(ball)
            ballIndex++
          }
        }
      }
    }
    
    setupEventListeners() {
      this.canvas.addEventListener('mousemove', (e) => {
        if (!this.isAiming) return
        
        const rect = this.canvas.getBoundingClientRect()
        this.mousePos.x = e.clientX - rect.left
        this.mousePos.y = e.clientY - rect.top
        
        // Calcular ângulo de mira
        const dx = this.mousePos.x - this.cueBall.position.x
        const dy = this.mousePos.y - this.cueBall.position.y
        this.aimAngle = Math.atan2(dy, dx)
      })
      
      this.canvas.addEventListener('click', () => {
        if (!this.isAiming || this.ballsMoving) return
        
        // Executar tacada
        this.cueBall.shoot(this.power * 0.3, this.aimAngle)
        this.ballsMoving = true
        this.isAiming = false
        
        console.log(`🎱 TACADA! Força: ${this.power}%`)
      })
    }
    
    update() {
      // Atualizar todas as bolas
      this.cueBall.update()
      this.balls.forEach(ball => ball.update())
      
      // Verificar colisões entre bolas
      this.checkCollisions()
      
      // Verificar se as bolas pararam
      const allBalls = [this.cueBall, ...this.balls]
      const anyMoving = allBalls.some(ball => ball.moving)
      
      if (this.ballsMoving && !anyMoving) {
        this.ballsMoving = false
        this.isAiming = true
        console.log('🎯 Pode fazer nova tacada')
      }
    }
    
    checkCollisions() {
      const allBalls = [this.cueBall, ...this.balls]
      
      for (let i = 0; i < allBalls.length; i++) {
        for (let j = i + 1; j < allBalls.length; j++) {
          const ball1 = allBalls[i]
          const ball2 = allBalls[j]
          
          if (ball1.inHole || ball2.inHole) continue
          
          const distance = ball1.position.subtract(ball2.position).length()
          
          if (distance < ball1.radius + ball2.radius) {
            // Colisão detectada
            const normal = ball2.position.subtract(ball1.position).normalize()
            
            // Velocidades relativas
            const relativeVelocity = ball1.velocity.subtract(ball2.velocity)
            const speed = relativeVelocity.x * normal.x + relativeVelocity.y * normal.y
            
            if (speed > 0) continue // Bolas se afastando
            
            // Aplicar colisão elástica
            ball1.velocity = ball1.velocity.subtract(normal.multiply(speed))
            ball2.velocity = ball2.velocity.add(normal.multiply(speed))
            
            // Separar bolas
            const overlap = (ball1.radius + ball2.radius) - distance
            const separation = normal.multiply(overlap * 0.5)
            
            ball1.position = ball1.position.subtract(separation)
            ball2.position = ball2.position.add(separation)
            
            console.log(`Colisão: Bola ${ball1.number || 'branca'} com Bola ${ball2.number}`)
          }
        }
      }
    }
    
    render() {
      console.log('🎨 RENDER CHAMADO')
      // Limpar canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      
      // Mesa verde
      this.ctx.fillStyle = '#0B7B3E'
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
      
      // Bordas marrons
      this.ctx.strokeStyle = '#8B4513'
      this.ctx.lineWidth = 8
      this.ctx.strokeRect(10, 10, this.canvas.width - 20, this.canvas.height - 20)
      
      // Caçapas
      const pockets = [
        [25, 25], [400, 15], [775, 25],
        [25, 375], [400, 385], [775, 375]
      ]
      
      this.ctx.fillStyle = '#000000'
      pockets.forEach(([x, y]) => {
        this.ctx.beginPath()
        this.ctx.arc(x, y, 15, 0, Math.PI * 2)
        this.ctx.fill()
      })
      
      // Desenhar bolas
      this.cueBall.draw(this.ctx)
      this.balls.forEach(ball => ball.draw(this.ctx))
      
      // Linha de mira
      if (this.isAiming && !this.ballsMoving) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
        this.ctx.lineWidth = 2
        this.ctx.setLineDash([10, 5])
        
        const aimLength = 100 + this.power
        const endX = this.cueBall.position.x + Math.cos(this.aimAngle) * aimLength
        const endY = this.cueBall.position.y + Math.sin(this.aimAngle) * aimLength
        
        this.ctx.beginPath()
        this.ctx.moveTo(this.cueBall.position.x, this.cueBall.position.y)
        this.ctx.lineTo(endX, endY)
        this.ctx.stroke()
        this.ctx.setLineDash([])
        
        // Taco
        const cueDistance = 40 + this.power * 0.5
        const cueX = this.cueBall.position.x - Math.cos(this.aimAngle) * cueDistance
        const cueY = this.cueBall.position.y - Math.sin(this.aimAngle) * cueDistance
        const cueEndX = cueX - Math.cos(this.aimAngle) * 80
        const cueEndY = cueY - Math.sin(this.aimAngle) * 80
        
        this.ctx.strokeStyle = '#8B4513'
        this.ctx.lineWidth = 6
        this.ctx.beginPath()
        this.ctx.moveTo(cueX, cueY)
        this.ctx.lineTo(cueEndX, cueEndY)
        this.ctx.stroke()
      }
      
      // Status
      this.ctx.fillStyle = '#FFFFFF'
      this.ctx.font = '16px Arial'
      this.ctx.textAlign = 'left'
      this.ctx.fillText(`Força: ${Math.round(this.power)}%`, 20, 30)
      
      const ballsInPlay = this.balls.filter(b => !b.inHole).length
      this.ctx.fillText(`Bolas: ${ballsInPlay}/15`, 20, 50)
    }
    
    gameLoop() {
      this.update()
      this.render()
      this.animationId = requestAnimationFrame(this.gameLoop.bind(this))
    }
    
    stopGameLoop() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
      }
    }
  }

  // Inicializar jogo quando gamePhase muda para 'playing'
  useEffect(() => {
    if (gamePhase === 'playing' && canvasRef.current && !gameRef.current) {
      const canvas = canvasRef.current
      canvas.width = 800
      canvas.height = 400
      
      console.log('🎱 INICIALIZANDO JOGO...')
      gameRef.current = new PoolGame(canvas)
      gameRef.current.gameLoop()
      
      console.log('🎱 JOGO CLASSIC POOL INICIADO!')
    }
    
    // Cleanup quando componente desmonta ou gamePhase muda
    return () => {
      if (gameRef.current && gameRef.current.stopGameLoop) {
        console.log('🛑 PARANDO GAME LOOP...')
        gameRef.current.stopGameLoop()
      }
    }
  }, [gamePhase]) // Manter dependência para reagir a mudanças de fase

  // Atualizar força do jogo
  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.power = power
    }
  }, [power])

  const startGame = () => {
    setGamePhase('playing')
    setGameData({
      ...gameData,
      player2: {
        id: 2,
        name: 'Oponente',
        level: 12,
        rank: 'Prata'
      },
      bet_amount: 25.00,
      total_prize: 47.50
    })
  }

  const adjustPower = (delta) => {
    setPower(prev => Math.max(0, Math.min(100, prev + delta)))
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
              <p className="text-green-200">Classic Pool Game</p>
            </div>
          </div>
          
          {gamePhase === 'playing' && (
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
        {gamePhase === 'waiting' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-6">🎱</div>
            <h2 className="text-2xl font-bold text-white mb-4">Classic Pool Game</h2>
            <p className="text-green-200 mb-8">
              Jogo de sinuca profissional com física realista
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

        {gamePhase === 'playing' && (
          <div>
            {/* Players Info */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-500/20 border border-green-500/50">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                  {gameData.player1?.name?.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-medium">{gameData.player1?.name}</div>
                  <div className="text-green-200 text-sm">Nível {gameData.player1?.level}</div>
                </div>
                <div className="text-green-400 text-sm font-medium">Sua vez</div>
              </div>
              
              <div className="text-center">
                <div className="text-white/60 text-sm">VS</div>
                <div className="text-xl font-bold text-white">
                  R$ {gameData.total_prize?.toFixed(2)}
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                <div>
                  <div className="text-white font-medium text-right">{gameData.player2?.name}</div>
                  <div className="text-blue-200 text-sm text-right">Nível {gameData.player2?.level}</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {gameData.player2?.name?.charAt(0)}
                </div>
              </div>
            </div>

            {/* Game Canvas */}
            <div className="bg-green-900 rounded-lg p-4 mb-6">
              <canvas
                ref={canvasRef}
                className="w-full max-w-4xl mx-auto border border-green-700 rounded cursor-crosshair bg-green-800"
                style={{ aspectRatio: '2/1' }}
                width={800}
                height={400}
              />
            </div>

            {/* Game Controls */}
            <div className="flex justify-center space-x-4 mb-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-white/60 text-sm mb-2">Força: {power}%</div>
                <div className="w-32 h-2 bg-white/20 rounded-full mb-2">
                  <div 
                    className="h-full bg-green-400 rounded-full transition-all"
                    style={{ width: `${power}%` }}
                  ></div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => adjustPower(-10)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                  >
                    -10
                  </button>
                  <button 
                    onClick={() => adjustPower(10)}
                    className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                  >
                    +10
                  </button>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-white/60 text-sm mb-1">Controles</div>
                <div className="text-white text-sm">
                  🖱️ Mouse: Mirar<br/>
                  🖱️ Clique: Tacada
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-white/60 text-sm mb-1">Status</div>
                <div className="text-white text-sm">
                  ✅ Classic Pool Game<br/>
                  🎱 Física Realista
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
              <div className="text-blue-200 text-sm">
                🎱 <strong>CLASSIC POOL GAME INTEGRADO:</strong> Jogo completo com física realista, 
                colisões precisas, controles profissionais e 16 bolas. Mire com o mouse e clique para jogar!
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Game

