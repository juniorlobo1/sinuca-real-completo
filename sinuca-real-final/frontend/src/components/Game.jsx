import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const EightBallPoolGame = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const navigate = useNavigate();
  
  // Estados do jogo
  const [gameState, setGameState] = useState({
    currentPlayer: 1,
    player1Group: null, // 'solids' ou 'stripes'
    player2Group: null,
    gamePhase: 'break', // 'break', 'open', 'playing', 'gameOver'
    winner: null,
    power: 0,
    aiming: false,
    ballsMoving: false
  });

  // Configurações da mesa
  const TABLE_WIDTH = 800;
  const TABLE_HEIGHT = 400;
  const BALL_RADIUS = 8;
  const POCKET_RADIUS = 20;
  
  // Posições das caçapas
  const POCKETS = [
    { x: 0, y: 0 }, // canto superior esquerdo
    { x: TABLE_WIDTH / 2, y: 0 }, // meio superior
    { x: TABLE_WIDTH, y: 0 }, // canto superior direito
    { x: 0, y: TABLE_HEIGHT }, // canto inferior esquerdo
    { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT }, // meio inferior
    { x: TABLE_WIDTH, y: TABLE_HEIGHT } // canto inferior direito
  ];

  // Inicializar bolas
  const initializeBalls = () => {
    const balls = [];
    
    // Bola branca (cue ball)
    balls.push({
      id: 0,
      x: TABLE_WIDTH * 0.25,
      y: TABLE_HEIGHT / 2,
      vx: 0,
      vy: 0,
      color: '#FFFFFF',
      type: 'cue',
      pocketed: false,
      number: 0
    });

    // Posição inicial do triângulo
    const rackX = TABLE_WIDTH * 0.75;
    const rackY = TABLE_HEIGHT / 2;
    
    // Configuração das bolas numeradas
    const ballConfigs = [
      { num: 1, color: '#FFD700', type: 'solid' }, // amarelo
      { num: 2, color: '#0000FF', type: 'solid' }, // azul
      { num: 3, color: '#FF0000', type: 'solid' }, // vermelho
      { num: 4, color: '#800080', type: 'solid' }, // roxo
      { num: 5, color: '#FFA500', type: 'solid' }, // laranja
      { num: 6, color: '#008000', type: 'solid' }, // verde
      { num: 7, color: '#8B0000', type: 'solid' }, // marrom
      { num: 8, color: '#000000', type: 'eight' }, // preta
      { num: 9, color: '#FFD700', type: 'stripe' }, // amarelo listrado
      { num: 10, color: '#0000FF', type: 'stripe' }, // azul listrado
      { num: 11, color: '#FF0000', type: 'stripe' }, // vermelho listrado
      { num: 12, color: '#800080', type: 'stripe' }, // roxo listrado
      { num: 13, color: '#FFA500', type: 'stripe' }, // laranja listrado
      { num: 14, color: '#008000', type: 'stripe' }, // verde listrado
      { num: 15, color: '#8B0000', type: 'stripe' } // marrom listrado
    ];

    // Posições no triângulo (formação 8-ball)
    const trianglePositions = [
      { row: 0, col: 0 }, // ponta - bola 1
      { row: 1, col: 0 }, { row: 1, col: 1 }, // segunda fileira
      { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }, // terceira fileira
      { row: 3, col: 0 }, { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 }, // quarta fileira
      { row: 4, col: 0 }, { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 } // quinta fileira
    ];

    // Arranjo especial para 8-ball
    const arrangement = [1, 9, 2, 10, 8, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15];
    
    arrangement.forEach((ballNum, index) => {
      const pos = trianglePositions[index];
      const config = ballConfigs.find(c => c.num === ballNum);
      
      const x = rackX + pos.row * (BALL_RADIUS * 1.8);
      const y = rackY + (pos.col - pos.row / 2) * (BALL_RADIUS * 1.8);
      
      balls.push({
        id: ballNum,
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        color: config.color,
        type: config.type,
        pocketed: false,
        number: ballNum
      });
    });

    return balls;
  };

  const [balls, setBalls] = useState(initializeBalls());
  const [aimAngle, setAimAngle] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Física das bolas
  const updatePhysics = useCallback(() => {
    setBalls(prevBalls => {
      const newBalls = [...prevBalls];
      let anyMoving = false;

      // Atualizar posições
      newBalls.forEach(ball => {
        if (ball.pocketed) return;
        
        ball.x += ball.vx;
        ball.y += ball.vy;
        
        // Atrito
        ball.vx *= 0.98;
        ball.vy *= 0.98;
        
        // Parar bolas muito lentas
        if (Math.abs(ball.vx) < 0.1 && Math.abs(ball.vy) < 0.1) {
          ball.vx = 0;
          ball.vy = 0;
        }
        
        if (ball.vx !== 0 || ball.vy !== 0) {
          anyMoving = true;
        }
        
        // Colisão com bordas
        if (ball.x - BALL_RADIUS < 0 || ball.x + BALL_RADIUS > TABLE_WIDTH) {
          ball.vx = -ball.vx * 0.8;
          ball.x = Math.max(BALL_RADIUS, Math.min(TABLE_WIDTH - BALL_RADIUS, ball.x));
        }
        if (ball.y - BALL_RADIUS < 0 || ball.y + BALL_RADIUS > TABLE_HEIGHT) {
          ball.vy = -ball.vy * 0.8;
          ball.y = Math.max(BALL_RADIUS, Math.min(TABLE_HEIGHT - BALL_RADIUS, ball.y));
        }
      });

      // Colisões entre bolas
      for (let i = 0; i < newBalls.length; i++) {
        for (let j = i + 1; j < newBalls.length; j++) {
          const ball1 = newBalls[i];
          const ball2 = newBalls[j];
          
          if (ball1.pocketed || ball2.pocketed) continue;
          
          const dx = ball2.x - ball1.x;
          const dy = ball2.y - ball1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < BALL_RADIUS * 2) {
            // Colisão detectada
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            
            // Velocidades rotacionadas
            const vx1 = ball1.vx * cos + ball1.vy * sin;
            const vy1 = ball1.vy * cos - ball1.vx * sin;
            const vx2 = ball2.vx * cos + ball2.vy * sin;
            const vy2 = ball2.vy * cos - ball2.vx * sin;
            
            // Troca de velocidades (colisão elástica)
            const finalVx1 = vx2;
            const finalVx2 = vx1;
            
            // Rotacionar de volta
            ball1.vx = finalVx1 * cos - vy1 * sin;
            ball1.vy = vy1 * cos + finalVx1 * sin;
            ball2.vx = finalVx2 * cos - vy2 * sin;
            ball2.vy = vy2 * cos + finalVx2 * sin;
            
            // Separar bolas
            const overlap = BALL_RADIUS * 2 - distance;
            const separateX = (dx / distance) * overlap * 0.5;
            const separateY = (dy / distance) * overlap * 0.5;
            
            ball1.x -= separateX;
            ball1.y -= separateY;
            ball2.x += separateX;
            ball2.y += separateY;
          }
        }
      }

      // Verificar caçapas
      newBalls.forEach(ball => {
        if (ball.pocketed) return;
        
        POCKETS.forEach(pocket => {
          const dx = ball.x - pocket.x;
          const dy = ball.y - pocket.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < POCKET_RADIUS) {
            ball.pocketed = true;
            ball.vx = 0;
            ball.vy = 0;
            
            // Lógica do jogo quando bola é encaçapada
            if (ball.type === 'cue') {
              // Bola branca encaçapada - falta
              console.log('Falta: Bola branca encaçapada');
            } else if (ball.type === 'eight') {
              // Bola 8 encaçapada
              console.log('Bola 8 encaçapada');
            } else {
              // Bola normal encaçapada
              console.log(`Bola ${ball.number} encaçapada`);
            }
          }
        });
      });

      // Atualizar estado do jogo
      setGameState(prev => ({
        ...prev,
        ballsMoving: anyMoving
      }));

      return newBalls;
    });
  }, []);

  // Loop de animação
  useEffect(() => {
    const animate = () => {
      updatePhysics();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updatePhysics]);

  // Renderização
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Limpar canvas
    ctx.fillStyle = '#0F4C3A'; // Verde da mesa
    ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);
    
    // Desenhar bordas
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);
    
    // Desenhar caçapas
    ctx.fillStyle = '#000000';
    POCKETS.forEach(pocket => {
      ctx.beginPath();
      ctx.arc(pocket.x, pocket.y, POCKET_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Desenhar bolas
    balls.forEach(ball => {
      if (ball.pocketed) return;
      
      ctx.save();
      
      // Sombra
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // Bola
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = ball.color;
      ctx.fill();
      
      // Borda da bola
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Número da bola
      if (ball.type !== 'cue') {
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = ball.type === 'stripe' ? '#FFFFFF' : '#000000';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ball.number.toString(), ball.x, ball.y);
      }
      
      // Listras para bolas listradas
      if (ball.type === 'stripe') {
        ctx.strokeStyle = ball.color;
        ctx.lineWidth = 2;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(ball.x - BALL_RADIUS, ball.y + i * 3);
          ctx.lineTo(ball.x + BALL_RADIUS, ball.y + i * 3);
          ctx.stroke();
        }
      }
      
      ctx.restore();
    });
    
    // Desenhar linha de mira
    const cueBall = balls.find(b => b.type === 'cue' && !b.pocketed);
    if (cueBall && !gameState.ballsMoving && gameState.aiming) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      const lineLength = 100;
      const endX = cueBall.x + Math.cos(aimAngle) * lineLength;
      const endY = cueBall.y + Math.sin(aimAngle) * lineLength;
      
      ctx.beginPath();
      ctx.moveTo(cueBall.x, cueBall.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
  }, [balls, aimAngle, gameState.aiming, gameState.ballsMoving]);

  // Controles do mouse
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
    
    const cueBall = balls.find(b => b.type === 'cue' && !b.pocketed);
    if (cueBall && !gameState.ballsMoving) {
      const angle = Math.atan2(y - cueBall.y, x - cueBall.x);
      setAimAngle(angle);
    }
  };

  const handleMouseDown = () => {
    if (!gameState.ballsMoving) {
      setGameState(prev => ({ ...prev, aiming: true }));
    }
  };

  const handleMouseUp = () => {
    if (gameState.aiming && !gameState.ballsMoving) {
      shoot();
      setGameState(prev => ({ ...prev, aiming: false }));
    }
  };

  // Função de tiro
  const shoot = () => {
    const cueBall = balls.find(b => b.type === 'cue' && !b.pocketed);
    if (!cueBall) return;
    
    const power = gameState.power / 100;
    const maxPower = 15;
    
    setBalls(prevBalls => {
      const newBalls = [...prevBalls];
      const cueBallIndex = newBalls.findIndex(b => b.type === 'cue' && !b.pocketed);
      
      if (cueBallIndex !== -1) {
        newBalls[cueBallIndex].vx = Math.cos(aimAngle) * power * maxPower;
        newBalls[cueBallIndex].vy = Math.sin(aimAngle) * power * maxPower;
      }
      
      return newBalls;
    });
    
    setGameState(prev => ({ 
      ...prev, 
      ballsMoving: true,
      currentPlayer: prev.currentPlayer === 1 ? 2 : 1
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 text-white">
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
        >
          ← Voltar
        </button>
        <h1 className="text-2xl font-bold">8 Ball Pool</h1>
        <div className="text-right">
          <div>Jogador {gameState.currentPlayer}</div>
          <div className="text-sm opacity-75">
            {gameState.gamePhase === 'break' ? 'Quebra' : 'Jogando'}
          </div>
        </div>
      </div>

      {/* Mesa de jogo */}
      <div className="flex justify-center">
        <div className="relative">
<canvas
ref={canvasRef}
width={TABLE_WIDTH}
height={TABLE_HEIGHT}
className="border-4 border-amber-800 rounded-lg shadow-2xl cursor-crosshair"
onMouseMove={handleMouseMove}
onMouseDown={handleMouseDown}
onMouseUp={handleMouseUp}
/>
</div>
</div>

{/* Controles */}
<div className="flex justify-center mt-6">
<div className="bg-black bg-opacity-50 rounded-lg p-4 text-white">
<div className="flex items-center space-x-4">
<label className="text-sm">Força:</label>
<input
type="range"
min="0"
max="100"
value={gameState.power}
onChange={(e) => setGameState(prev => ({ ...prev, power: parseInt(e.target.value) }))}
className="w-32"
disabled={gameState.ballsMoving}
/>
<span className="text-sm w-12">{gameState.power}%</span>
</div>

<div className="mt-2 text-xs text-center opacity-75">
{gameState.ballsMoving ?
'Aguarde as bolas pararem...' :
'Mire com o mouse e clique para atirar'
}
</div>
</div>
</div>

{/* Informações do jogo */}
<div className="flex justify-center mt-4">
<div className="bg-black bg-opacity-50 rounded-lg p-4 text-white text-sm">
<div className="grid grid-cols-2 gap-4">
<div>
<h3 className="font-bold mb-2">Jogador 1</h3>
<div>Grupo: {gameState.player1Group || 'Não definido'}</div>
</div>
<div>
<h3 className="font-bold mb-2">Jogador 2</h3>
<div>Grupo: {gameState.player2Group || 'Não definido'}</div>
</div>
</div>

<div className="mt-4 text-center">
<div className="text-xs opacity-75">
Bolas restantes: {balls.filter(b => !b.pocketed && b.type !== 'cue').length}
</div>
</div>
</div>
</div>
</div>
);
};

🎱✨export default EightBallPoolGame;
