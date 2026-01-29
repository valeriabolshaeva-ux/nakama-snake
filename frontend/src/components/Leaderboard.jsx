import { useEffect, useState } from 'react'
import { getLeaderboard, getGameStats } from '../utils/api'
import './Leaderboard.css'

/**
 * Таблица лидеров.
 * 
 * Показывает:
 * - Топ-10 игроков
 * - Общую статистику
 */
function Leaderboard({ onBackToStart, onPlayAgain }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [leaderboardData, statsData] = await Promise.all([
          getLeaderboard(10),
          getGameStats(),
        ])
        setLeaderboard(leaderboardData.entries || [])
        setStats(statsData)
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err)
        setError('Не удалось загрузить данные')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  /**
   * Получить медаль по рангу
   */
  const getMedal = (rank) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  /**
   * Форматирование даты
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    })
  }

  if (loading) {
    return (
      <div className="leaderboard-screen animate-fadeIn">
        <div className="loading">
          <div className="loading-icon">🐍</div>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="leaderboard-screen animate-fadeIn">
        <div className="error-state">
          <div className="error-icon">😵</div>
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="leaderboard-screen animate-fadeIn">
      {/* Header */}
      <div className="leaderboard-header">
        <h1 className="leaderboard-title">
          <span className="title-icon">🏆</span>
          Таблица лидеров
        </h1>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="stats-summary">
          <div className="summary-item">
            <span className="summary-value">{stats.total_games}</span>
            <span className="summary-label">Игр сыграно</span>
          </div>
          <div className="summary-item">
            <span className="summary-value">{stats.total_players}</span>
            <span className="summary-label">Игроков</span>
          </div>
          <div className="summary-item highlight">
            <span className="summary-value">{stats.highest_score}</span>
            <span className="summary-label">Рекорд</span>
          </div>
          <div className="summary-item">
            <span className="summary-value">{stats.longest_snake}</span>
            <span className="summary-label">Макс. длина</span>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      {leaderboard.length > 0 ? (
        <div className="leaderboard-table">
          <div className="table-header">
            <span className="col-rank">Место</span>
            <span className="col-name">Игрок</span>
            <span className="col-score">Очки</span>
            <span className="col-length">Длина</span>
            <span className="col-date">Дата</span>
          </div>
          <div className="table-body">
            {leaderboard.map((entry, index) => (
              <div 
                key={entry.rank}
                className={`table-row ${entry.rank <= 3 ? `top-${entry.rank}` : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className="col-rank">
                  <span className={`medal ${entry.rank <= 3 ? 'has-medal' : ''}`}>
                    {getMedal(entry.rank)}
                  </span>
                </span>
                <span className="col-name">{entry.player_name}</span>
                <span className="col-score">{entry.score}</span>
                <span className="col-length">{entry.snake_length}</span>
                <span className="col-date">{formatDate(entry.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🎮</div>
          <p>Пока нет результатов</p>
          <p className="empty-hint">Стань первым в таблице лидеров!</p>
        </div>
      )}

      {/* Actions */}
      <div className="leaderboard-actions">
        <button className="btn btn-primary" onClick={onPlayAgain}>
          🎮 Играть
        </button>
        <button className="btn btn-secondary" onClick={onBackToStart}>
          🏠 В меню
        </button>
      </div>
    </div>
  )
}

export default Leaderboard
