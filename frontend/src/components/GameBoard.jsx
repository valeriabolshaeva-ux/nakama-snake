import { useEffect, useRef } from 'react'
import { useSnakeGame } from '../hooks/useSnakeGame'
import './GameBoard.css'

/**
 * Игровое поле с змейкой.
 * 
 * Компонент рендерит:
 * - Сетку игрового поля
 * - Змейку (голова + тело)
 * - Еду
 * - Счёт и время
 * - Панель паузы
 */
function GameBoard({ playerName, onGameOver }) {
  const boardRef = useRef(null)
  
  const {
    snake,
    food,
    score,
    direction,
    isPaused,
    isGameOver,
    gameTime,
    gridSize,
    togglePause,
  } = useSnakeGame(onGameOver)

  // Фокус на игровом поле
  useEffect(() => {
    boardRef.current?.focus()
  }, [])

  /**
   * Форматирование времени MM:SS
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * Определение направления головы для CSS
   */
  const getHeadDirection = () => {
    switch (direction) {
      case 'UP': return 'head-up'
      case 'DOWN': return 'head-down'
      case 'LEFT': return 'head-left'
      case 'RIGHT': return 'head-right'
      default: return 'head-right'
    }
  }

  return (
    <div className="game-container animate-fadeIn">
      {/* Header with stats */}
      <div className="game-header">
        <div className="stat-box">
          <span className="stat-icon">👤</span>
          <span className="stat-value">{playerName}</span>
        </div>
        <div className="stat-box score">
          <span className="stat-icon">⭐</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-box">
          <span className="stat-icon">🐍</span>
          <span className="stat-value">{snake.length}</span>
        </div>
        <div className="stat-box">
          <span className="stat-icon">⏱️</span>
          <span className="stat-value">{formatTime(gameTime)}</span>
        </div>
      </div>

      {/* Game Board */}
      <div 
        ref={boardRef}
        className={`game-board ${isPaused ? 'paused' : ''} ${isGameOver ? 'game-over' : ''}`}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
        tabIndex={0}
      >
        {/* Grid cells (background) */}
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const x = index % gridSize
          const y = Math.floor(index / gridSize)
          const isEvenCell = (x + y) % 2 === 0
          return (
            <div 
              key={`cell-${x}-${y}`}
              className={`grid-cell ${isEvenCell ? 'even' : 'odd'}`}
            />
          )
        })}

        {/* Snake segments */}
        {snake.map((segment, index) => {
          const isHead = index === 0
          const isTail = index === snake.length - 1
          
          return (
            <div
              key={`snake-${index}`}
              className={`
                snake-segment 
                ${isHead ? `head ${getHeadDirection()}` : ''} 
                ${isTail ? 'tail' : ''}
                ${!isHead && !isTail ? 'body' : ''}
              `}
              style={{
                gridColumn: segment.x + 1,
                gridRow: segment.y + 1,
                '--segment-index': index,
              }}
            >
              {isHead && (
                <div className="snake-eyes">
                  <div className="eye left"></div>
                  <div className="eye right"></div>
                </div>
              )}
            </div>
          )
        })}

        {/* Food */}
        <div 
          className="food"
          style={{
            gridColumn: food.x + 1,
            gridRow: food.y + 1,
          }}
        >
          🍎
        </div>

        {/* Pause overlay */}
        {isPaused && !isGameOver && (
          <div className="pause-overlay" onClick={togglePause}>
            <div className="pause-content">
              <div className="pause-icon">⏸️</div>
              <h2>Пауза</h2>
              <p>Нажми Space или кликни для продолжения</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls hint */}
      <div className="game-controls-hint">
        <span>Стрелки / WASD — движение</span>
        <span className="divider">•</span>
        <span>Space / P — пауза</span>
      </div>
    </div>
  )
}

export default GameBoard
