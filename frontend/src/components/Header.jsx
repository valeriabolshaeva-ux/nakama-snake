import './Header.css'

/**
 * Шапка приложения с логотипом и навигацией.
 */
function Header({ gameState, onShowLeaderboard, onBackToStart }) {
  return (
    <header className="header">
      <div className="header-content">
        {/* Логотип */}
        <div className="header-logo" onClick={onBackToStart}>
          <span className="logo-icon">🐍</span>
          <span className="logo-text">Snake</span>
        </div>
        
        {/* Навигация */}
        <nav className="header-nav">
          {gameState !== 'playing' && (
            <>
              {gameState !== 'leaderboard' && (
                <button 
                  className="nav-btn"
                  onClick={onShowLeaderboard}
                >
                  🏆 Лидеры
                </button>
              )}
              {gameState !== 'start' && (
                <button 
                  className="nav-btn"
                  onClick={onBackToStart}
                >
                  🏠 Меню
                </button>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
