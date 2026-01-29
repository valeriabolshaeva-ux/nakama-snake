import { useState } from 'react'
import './StartScreen.css'

/**
 * Начальный экран игры.
 * 
 * Показывает:
 * - Красивый логотип с анимацией
 * - Поле для ввода имени
 * - Кнопку "Играть"
 * - Инструкции по управлению
 */
function StartScreen({ onStartGame, onShowLeaderboard, playerName, setPlayerName }) {
  const [inputName, setInputName] = useState(playerName)

  const handleSubmit = (e) => {
    e.preventDefault()
    onStartGame(inputName.trim() || 'Player')
  }

  return (
    <div className="start-screen">
      {/* Animated Snake Logo */}
      <div className="start-logo">
        <div className="snake-animation">
          <div className="snake-segment head">🐍</div>
          <div className="snake-segment body"></div>
          <div className="snake-segment body"></div>
          <div className="snake-segment tail"></div>
        </div>
        <h1 className="start-title">
          <span className="title-snake">Snake</span>
          <span className="title-game">Game</span>
        </h1>
      </div>

      {/* Start Form */}
      <form className="start-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="playerName" className="input-label">
            Твоё имя
          </label>
          <input
            type="text"
            id="playerName"
            className="input-field"
            value={inputName}
            onChange={(e) => {
              setInputName(e.target.value)
              setPlayerName(e.target.value)
            }}
            placeholder="Player"
            maxLength={20}
            autoComplete="off"
          />
        </div>

        <button type="submit" className="btn btn-primary start-btn">
          <span className="btn-icon">▶</span>
          Играть
        </button>
      </form>

      {/* Leaderboard Button */}
      <button 
        className="btn btn-secondary leaderboard-btn"
        onClick={onShowLeaderboard}
      >
        🏆 Таблица лидеров
      </button>

      {/* Controls Info */}
      <div className="controls-info">
        <h3 className="controls-title">Управление</h3>
        <div className="controls-grid">
          <div className="control-item">
            <div className="keys">
              <span className="key">↑</span>
              <div className="key-row">
                <span className="key">←</span>
                <span className="key">↓</span>
                <span className="key">→</span>
              </div>
            </div>
            <span className="control-label">Стрелки</span>
          </div>
          <div className="control-divider">или</div>
          <div className="control-item">
            <div className="keys">
              <span className="key">W</span>
              <div className="key-row">
                <span className="key">A</span>
                <span className="key">S</span>
                <span className="key">D</span>
              </div>
            </div>
            <span className="control-label">WASD</span>
          </div>
        </div>
        <p className="controls-hint">
          Нажми <span className="key small">Space</span> или <span className="key small">P</span> для паузы
        </p>
      </div>

      {/* Footer */}
      <div className="start-footer">
        <p>Собирай еду 🍎 и не врезайся в стены и себя!</p>
      </div>
    </div>
  )
}

export default StartScreen
