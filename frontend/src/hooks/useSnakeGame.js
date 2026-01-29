import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * Направления движения змейки.
 * Каждое направление = изменение координат [dx, dy].
 */
const DIRECTIONS = {
  UP: [0, -1],
  DOWN: [0, 1],
  LEFT: [-1, 0],
  RIGHT: [1, 0],
}

/**
 * Противоположные направления.
 * Змейка не может развернуться на 180 градусов.
 */
const OPPOSITE = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
}

/**
 * Начальная скорость (миллисекунды между тиками).
 * Чем меньше число — тем быстрее змейка.
 */
const INITIAL_SPEED = 150

/**
 * Минимальная скорость (максимальная сложность).
 */
const MIN_SPEED = 50

/**
 * На сколько ускоряется игра каждые N очков.
 */
const SPEED_INCREMENT = 5
const POINTS_PER_SPEEDUP = 50

/**
 * Размер игрового поля (клеток).
 */
const GRID_SIZE = 20

/**
 * Очки за съеденную еду.
 */
const POINTS_PER_FOOD = 10

/**
 * Генерирует случайную позицию для еды.
 * Учитывает, чтобы еда не появилась на змейке.
 */
function generateFood(snake) {
  let food
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y))
  return food
}

/**
 * Проверяет столкновение со стеной.
 */
function checkWallCollision(head) {
  return head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE
}

/**
 * Проверяет столкновение с собой.
 */
function checkSelfCollision(head, body) {
  return body.some(segment => segment.x === head.x && segment.y === head.y)
}

/**
 * Хук для управления игрой Snake.
 * 
 * Возвращает:
 * - snake: массив сегментов змейки [{x, y}, ...]
 * - food: позиция еды {x, y}
 * - score: текущий счёт
 * - isPaused: на паузе ли игра
 * - isGameOver: закончилась ли игра
 * - direction: текущее направление
 * - gridSize: размер поля
 * - speed: текущая скорость
 * - gameTime: время игры в секундах
 * 
 * @param {Function} onGameOver - колбэк при окончании игры
 */
export function useSnakeGame(onGameOver) {
  // Змейка = массив сегментов, голова первая
  const [snake, setSnake] = useState([
    { x: 10, y: 10 }, // голова
    { x: 9, y: 10 },  // тело
    { x: 8, y: 10 },  // хвост
  ])
  
  // Позиция еды
  const [food, setFood] = useState({ x: 15, y: 10 })
  
  // Очки
  const [score, setScore] = useState(0)
  
  // Направление движения
  const [direction, setDirection] = useState('RIGHT')
  
  // Буфер направления (для быстрых нажатий)
  const nextDirectionRef = useRef('RIGHT')
  
  // Состояние игры
  const [isPaused, setIsPaused] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  
  // Скорость (интервал в мс)
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  
  // Время игры
  const [gameTime, setGameTime] = useState(0)
  const gameStartTime = useRef(Date.now())

  /**
   * Сброс игры для новой партии.
   */
  const resetGame = useCallback(() => {
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ]
    setSnake(initialSnake)
    setFood(generateFood(initialSnake))
    setScore(0)
    setDirection('RIGHT')
    nextDirectionRef.current = 'RIGHT'
    setIsPaused(false)
    setIsGameOver(false)
    setSpeed(INITIAL_SPEED)
    setGameTime(0)
    gameStartTime.current = Date.now()
  }, [])

  /**
   * Обработка нажатий клавиш.
   */
  const handleKeyDown = useCallback((e) => {
    if (isGameOver) return
    
    // Пауза
    if (e.code === 'Space' || e.code === 'KeyP') {
      e.preventDefault()
      setIsPaused(prev => !prev)
      return
    }
    
    if (isPaused) return
    
    // Определяем новое направление
    let newDirection = null
    
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        newDirection = 'UP'
        break
      case 'ArrowDown':
      case 'KeyS':
        newDirection = 'DOWN'
        break
      case 'ArrowLeft':
      case 'KeyA':
        newDirection = 'LEFT'
        break
      case 'ArrowRight':
      case 'KeyD':
        newDirection = 'RIGHT'
        break
      default:
        return
    }
    
    e.preventDefault()
    
    // Нельзя развернуться на 180 градусов
    if (newDirection && OPPOSITE[newDirection] !== direction) {
      nextDirectionRef.current = newDirection
    }
  }, [direction, isPaused, isGameOver])

  /**
   * Один тик игры — движение змейки.
   */
  const gameTick = useCallback(() => {
    if (isPaused || isGameOver) return
    
    setSnake(prevSnake => {
      // Применяем буферизованное направление
      const currentDirection = nextDirectionRef.current
      setDirection(currentDirection)
      
      const [dx, dy] = DIRECTIONS[currentDirection]
      const head = prevSnake[0]
      const newHead = { x: head.x + dx, y: head.y + dy }
      
      // Проверка столкновений
      if (checkWallCollision(newHead) || checkSelfCollision(newHead, prevSnake)) {
        setIsGameOver(true)
        
        // Вызываем колбэк окончания игры
        const finalTime = Math.floor((Date.now() - gameStartTime.current) / 1000)
        onGameOver?.({
          score,
          snakeLength: prevSnake.length,
          duration: finalTime,
        })
        
        return prevSnake
      }
      
      // Проверка съедания еды
      const ateFood = newHead.x === food.x && newHead.y === food.y
      
      if (ateFood) {
        // Добавляем очки
        const newScore = score + POINTS_PER_FOOD
        setScore(newScore)
        
        // Генерируем новую еду
        const newSnake = [newHead, ...prevSnake]
        setFood(generateFood(newSnake))
        
        // Увеличиваем скорость каждые N очков
        if (newScore % POINTS_PER_SPEEDUP === 0) {
          setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_INCREMENT))
        }
        
        return newSnake
      }
      
      // Обычное движение — голова вперёд, хвост убираем
      return [newHead, ...prevSnake.slice(0, -1)]
    })
  }, [isPaused, isGameOver, food, score, onGameOver])

  /**
   * Подписка на клавиатуру.
   */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  /**
   * Игровой цикл.
   */
  useEffect(() => {
    if (isGameOver) return
    
    const gameLoop = setInterval(gameTick, speed)
    return () => clearInterval(gameLoop)
  }, [gameTick, speed, isGameOver])

  /**
   * Таймер времени игры.
   */
  useEffect(() => {
    if (isPaused || isGameOver) return
    
    const timer = setInterval(() => {
      setGameTime(Math.floor((Date.now() - gameStartTime.current) / 1000))
    }, 1000)
    
    return () => clearInterval(timer)
  }, [isPaused, isGameOver])

  /**
   * Переключение паузы.
   */
  const togglePause = useCallback(() => {
    if (!isGameOver) {
      setIsPaused(prev => !prev)
    }
  }, [isGameOver])

  return {
    snake,
    food,
    score,
    direction,
    isPaused,
    isGameOver,
    speed,
    gameTime,
    gridSize: GRID_SIZE,
    resetGame,
    togglePause,
  }
}
