import { useTypingGame } from '@/hooks/useTypingGame';
import { ArrowRight, Keyboard, Pause, Play, RotateCcw, Sparkles } from 'lucide-react';

export default function App() {
  const game = useTypingGame();
  const isPlaying = game.status === 'playing';
  const isReady = game.status === 'ready';
  const isPaused = game.status === 'paused';
  const isGameOver = game.status === 'gameover';
  const isComplete = game.status === 'level-complete';
  const passage = game.passage;
  const progress = Math.max(0, Math.min(game.progress, passage.length));
  const wordGoal = game.wordsPerStage;
  const lives = Math.max(0, game.lives);

  return (
    <main className="arcade-shell">
      <header className="topbar">
        <div className="brand-lockup" aria-label="Falling Letters">
          <span className="brand-mark"><span>F</span><i /></span>
          <span className="brand-name">falling<span>letters</span></span>
        </div>
        <div className="topbar-note"><span className="live-dot" /> QUICK RUN. SHARP MIND.</div>
        <div className="best-chip"><Sparkles size={14} /> BEST <b>{game.bestScore}</b></div>
      </header>

      <div className="game-layout">
        <section className="game-main">
          <div className="game-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> THE DAILY DROP <span className="edition">— NO. 001</span></div>
              <h1>See every <span>word.</span><br />Type each letter.</h1>
            </div>
            <div className="heading-side">
              <span className="round-number">{String(game.stage).padStart(2, '0')} <i>/ ∞</i></span>
              <span className="round-label">STAGE IN SESSION</span>
            </div>
          </div>

          <div className={`arena ${isPaused ? 'is-paused' : ''}`}>
            <div className="arena-topline">
              <div className="stage-label"><span className="stage-dot" /> STAGE <b>{game.stage}</b></div>
              <div className="stage-goal"><span>{game.wordsCompleted}/{wordGoal}</span> WORDS</div>
              {isPlaying && (
                <button className="pause-button" onClick={game.pauseGame} aria-label="Pause game">
                  <Pause size={15} /> PAUSE
                </button>
              )}
              {isPaused && (
                <button className="pause-button resume-button" onClick={game.resumeGame} aria-label="Resume game">
                  <Play size={14} fill="currentColor" /> RESUME
                </button>
              )}
            </div>
            <div className="arena-field">
              <div className="runway-glow" aria-hidden="true" />
              <div className="runway-track" aria-hidden="true" />
              <div className="runway-tick runway-tick-one" aria-hidden="true" />
              <div className="runway-tick runway-tick-two" aria-hidden="true" />
              <div className="runway-finish" aria-hidden="true" />
              <span className="runway-start-label" aria-hidden="true">START</span>
              <span className="runway-finish-label" aria-hidden="true">FLOOR</span>
              {isPlaying && (game.tiles).map((tile) => (
                <div
                  className="letter-tile horizontal-tile"
                  key={tile.id}
                  style={{ left: `${tile.x}%` }}
                  aria-label={`Type ${tile.letter}`}
                >
                  <span>{tile.letter}</span>
                </div>
              ))}
              {isReady && (
                <div className="field-idle">
                  <div className="idle-message">
                    <span className="idle-next">a</span>
                    <span className="idle-copy">ONE LETTER AT A TIME</span>
                  </div>
                  <span className="field-caption">THE WHOLE PASSAGE STAYS IN VIEW</span>
                </div>
              )}
              {(isPaused || isGameOver || isComplete) && (
                <div className="game-overlay">
                  <div className={`overlay-mark ${isGameOver ? 'mark-danger' : isComplete ? 'mark-success' : ''}`}>
                    {isPaused ? <Pause size={22} /> : isGameOver ? <span>×</span> : <Sparkles size={22} />}
                  </div>
                  <p className="overlay-kicker">{isPaused ? 'TAKE A BREATH' : isGameOver ? 'RUN ENDED' : 'STAGE CLEARED'}</p>
                  <h2>{isPaused ? 'Paused.' : isGameOver ? 'So close.' : 'Beautifully done.'}</h2>
                  <p className="overlay-copy">{isPaused ? 'The letters will wait right here.' : isGameOver ? 'Every run makes your fingers quicker.' : `You cleared ${wordGoal} words. Ready for a faster drop?`}</p>
                  {isPaused && <button className="primary-button overlay-action" onClick={game.resumeGame}><Play size={16} fill="currentColor" /> PICK IT BACK UP</button>}
                  {isGameOver && <button className="primary-button overlay-action" onClick={game.retryStage}><RotateCcw size={16} /> RUN IT AGAIN</button>}
                  {isComplete && <button className="primary-button overlay-action" onClick={game.continueToNextStage}><ArrowRight size={17} /> NEXT STAGE</button>}
                </div>
              )}
              {isReady && (
                <div className="ready-prompt">
                  <button className="primary-button start-button" onClick={game.startGame}><Play size={15} fill="currentColor" /> START RUN</button>
                  <span>or press <span className="keycap">SPACE</span></span>
                </div>
              )}
            </div>
            <div className="arena-foot">
              <span className="floor-label">FLOOR 01</span>
              <div className="lives" aria-label={`${lives} lives remaining`}>
                <span className="lives-label">LIVES</span>
                {Array.from({ length: Math.max(lives, 3) }, (_, i) => <i key={i} className={i < lives ? 'life-heart' : 'life-heart spent'} />)}
              </div>
              <div className="combo-meter"><span className="combo-label">COMBO</span><b>{game.combo}</b><span className="combo-x">×</span></div>
            </div>
          </div>

          <div className="passage-card">
            <div className="passage-head">
              <div><span className="section-tag">YOUR PASSAGE</span><span className="passage-hint">Follow the highlight. Type the letter on the runway.</span></div>
              <span className="passage-count">{progress}<i> / {passage.length || '—'}</i></span>
            </div>
            <p className={`passage-text ${isReady ? 'passage-ready' : ''}`} aria-label={passage || undefined} aria-live="off">
              {passage ? passage.split('').map((character, index) => (
                <span key={index} aria-hidden="true" className={index < progress ? 'typed-char' : index === progress ? 'current-char' : 'future-char'}>{character}</span>
              )) : <span className="passage-placeholder">Your fresh passage will appear here when the round begins.</span>}
            </p>
            <div className="passage-progress"><span style={{ transform: `scaleX(${passage.length ? progress / passage.length : 0})` }} /></div>
          </div>
          <div className="keyboard-hint"><span className="hint-mark">↳</span> ONE MOVING LETTER AT A TIME. <b>WRONG KEYS COST A LIFE.</b><span className="hint-divider">·</span> NO INPUT BOX NEEDED</div>
        </section>

        <aside className="game-rail">
          <div className="rail-label">RUN METRICS <span>LIVE</span></div>
          <div className="metric-card metric-speed">
            <div className="metric-top"><span>WORDS / MIN</span><span className="metric-symbol">↗</span></div>
            <div className="metric-value">{game.wpm}<small> WPM</small></div>
            <div className="metric-foot">KEEP YOUR RHYTHM</div>
          </div>
          <div className="metric-card metric-accuracy">
            <div className="metric-top"><span>ACCURACY</span><span className="accuracy-dot" /></div>
            <div className="metric-value">{Math.round(game.accuracy)}<small>%</small></div>
            <div className="accuracy-track"><span style={{ transform: `scaleX(${Math.max(0, Math.min(100, game.accuracy)) / 100})` }} /></div>
          </div>
          <div className="score-card">
            <div className="metric-top"><span>YOUR SCORE</span><span className="score-star">✳</span></div>
            <div className="score-value">{(game.score).toLocaleString()}</div>
            <div className="score-note">POINTS THIS RUN</div>
          </div>
          <div className="howto-card">
            <div className="howto-title"><span className="howto-icon"><Keyboard size={15} /></span> THE SHORT VERSION</div>
              <div className="howto-step"><b>01</b><span>Read the full passage as it wraps across the page.</span></div>
              <div className="howto-step"><b>02</b><span>Type the single letter moving across the runway.</span></div>
              <div className="howto-step"><b>03</b><span>Keep your lives. Clear longer passages.</span></div>
          </div>
          <div className="stage-note"><span className="note-star">✳</span><p>Every clear adds <b>50 words</b> and a little more pressure.</p></div>
        </aside>
      </div>

      <footer className="bottom-line">
        <span>FALLING LETTERS <i>—</i> TYPE IN THE MOMENT.</span>
        <span className="footer-keys"><kbd>SPACE</kbd> START <i>·</i> <kbd>ESC</kbd> PAUSE</span>
        <span className="footer-credit">BUILT BY <a href="https://seofg.xyz" target="_blank" rel="noopener noreferrer">REABOT6</a></span>
      </footer>
    </main>
  );
}
