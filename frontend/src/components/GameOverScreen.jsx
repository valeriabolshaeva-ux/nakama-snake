import { useEffect, useState } from 'react'
import { saveScore } from '../utils/api'
import './GameOverScreen.css'

/**
 * Экран окончания игры.
 * 
 * Показывает:
 * - Финальный счёт
 * - Статистику игры
 * - Кнопки: играть снова, таблица лидеров, меню
 */
function GameOverScreen({ gameData, playerName, onPlayAgain, onShowLeaderboard, onBackToStart }) {
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  // Сохраняем результат при монтировании
  useEffect(() => {
    if (!gameData || saved) return

    const saveResult = async () => {
      setIsSaving(true)
      try {
        await saveScore({
          player_name: playerName,
          score: gameData.score,
          snake_length: gameData.snakeLength,
          duration_seconds: gameData.duration,
        })
        setSaved(true)
      } catch (err) {
        console.error('Failed to save score:', err)
        setError('Не удалось сохранить результат')
      } finally {
        setIsSaving(false)
      }
    }

    saveResult()
  }, [gameData, playerName, saved])

  if (!gameData) return null

  const { score, snakeLength, duration } = gameData

  /**
   * Форматирование времени
   */
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return `${mins} мин ${secs} сек`
    }
    return `${secs} сек`
  }

  /**
   * Определение ранга/титула по очкам
   */
  const getRank = (score) => {
    if (score >= 500) return { title: 'Легенда', emoji: '👑', color: 'gold' }
    if (score >= 300) return { title: 'Мастер', emoji: '🏆', color: 'accent' }
    if (score >= 200) return { title: 'Эксперт', emoji: '⭐', color: 'snake' }
    if (score >= 100) return { title: 'Продвинутый', emoji: '🎯', color: 'snake' }
    if (score >= 50) return { title: 'Новичок', emoji: '🌱', color: 'muted' }
    return { title: 'Начинающий', emoji: '🐣', color: 'muted' }
  }

  const rank = getRank(score)

  return (
    <div className="gameover-screen animate-fadeIn">
      {/* Game Over Title */}
      <div className="gameover-header">
        <h1 className="gameover-title">Game Over</h1>
        <div className={`rank-badge rank-${rank.color}`}>
          <span className="rank-emoji">{rank.emoji}</span>
          <span className="rank-title">{rank.title}</span>
        </div>
      </div>

      {/* Score Display */}
      <div className="score-display">
        <div className="score-label">Твой счёт</div>
        <div className="score-value">{score}</div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-card-icon">🐍</span>
          <span className="stat-card-value">{snakeLength}</span>
          <span className="stat-card-label">Длина змейки</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-icon">⏱️</span>
          <span className="stat-card-value">{formatDuration(duration)}</span>
          <span className="stat-card-label">Время игры</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-icon">🍎</span>
          <span className="stat-card-value">{Math.floor(score / 10)}</span>
          <span className="stat-card-label">Съедено еды</span>
        </div>
      </div>

      {/* Save Status */}
      <div className="save-status">
        {isSaving && <span className="saving">💾 Сохранение...</span>}
        {saved && <span className="saved">✅ Результат сохранён!</span>}
        {error && <span className="error">❌ {error}</span>}
      </div>

      {/* Action Buttons */}
      <div className="gameover-actions">
        <button className="btn btn-primary" onClick={onPlayAgain}>
          🔄 Играть снова
        </button>
        <button className="btn btn-secondary" onClick={onShowLeaderboard}>
          🏆 Таблица лидеров
        </button>
        <button className="btn btn-ghost" onClick={onBackToStart}>
          🏠 В меню
        </button>
      </div>
    </div>
  )
}

export default GameOverScreen
