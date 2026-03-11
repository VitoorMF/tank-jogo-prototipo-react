import React from 'react';
import { ArenaGrid } from '../components/ArenaGrid';

function StepContent({ state, actions }) {
  const { game, NAMES, EMOJI, CVARS, CHEX, coordLabel, turnDone, COLORS } = state;

  if (game.currentStep === 1) {
    return (
      <div className="target-picker">
        <div className="target-header">ESCOLHA O ALVO</div>
        <div className="enemy-btns">
          {COLORS.map((c) => {
            const isMe = c === game.myColor;
            const isElim = game.players[c]?.eliminated;
            const isInactive = !game.players[c]?.active;
            const hidden = isMe || isElim || isInactive;
            if (hidden) return null;

            return (
              <button
                key={c}
                type="button"
                className={`enemy-btn ${game.shotTarget === c ? 'sel' : ''}`}
                data-t={c}
                onClick={() => actions.selectTarget(c)}
              >
                <span>{EMOJI[c]}</span>
                {NAMES[c]}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (game.currentStep === 2 && game.shotTarget) {
    const target = game.shotTarget;
    const hex = CHEX[target];
    const destroyed = game.destroyed[target] || [];

    return (
      <>
        <div className="target-grid-wrap" style={{ borderColor: hex, background: `${hex}08` }}>
          <div className="target-grid-label" style={{ color: hex }}>
            {EMOJI[target]} ZONA {NAMES[target]}
          </div>
          <div className="tg-col-labels">
            <div />
            <div className="tg-col-lbl" style={{ color: hex }}>A</div>
            <div className="tg-col-lbl" style={{ color: hex }}>B</div>
            <div className="tg-col-lbl" style={{ color: hex }}>C</div>
            <div className="tg-col-lbl" style={{ color: hex }}>D</div>
          </div>
          <div className="tg-inner">
            {[1, 2, 3, 4].map((row) => (
              <React.Fragment key={`r-${row}`}>
                <div className="tg-row-lbl">{row}</div>
                {[1, 2, 3, 4].map((col) => {
                  const isDest = destroyed.some((d) => d.x === col && d.y === row);
                  return (
                    <button
                      key={`${row}-${col}`}
                      type="button"
                      className={`tcell ${isDest ? 'dest' : ''}`}
                      style={{ borderColor: `${hex}22`, background: isDest ? 'rgba(0,0,0,.5)' : `${hex}0d` }}
                      disabled={isDest}
                      onClick={() => actions.selectShotCell(col, row)}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="gap-s" />
        <button type="button" className="btn btn-ghost" style={{ fontSize: 13 }} onClick={actions.backToStep1}>
          <span>← TROCAR ALVO</span>
        </button>
      </>
    );
  }

  if (game.currentStep === 3 && game.pendingShot) {
    const { color, x, y } = game.pendingShot;
    const { tankX, tankY } = game.myPlayer.pos;
    return (
      <div style={{ background: 'var(--bg3)', border: `1px solid ${CVARS[color]}`, padding: 14, marginBottom: 8 }}>
        <div className="step-help">PASSO 3 - POSICIONE AS PEÇAS NO TABULEIRO</div>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: 2 }}>POSICIONE SEU TANQUE FISICO EM:</div>
        <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 18, color: CVARS[color], letterSpacing: 4 }}>
          {NAMES[color]} · {coordLabel(tankX, tankY)}
        </span>
        <div className="step-help-lg">
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: 2 }}>POSICIONE SEU TARGET EM:</div>
          <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 18, color: CVARS[color], letterSpacing: 4 }}>
            {NAMES[color]} · {coordLabel(x, y)}
          </span>
          <br />
          <span style={{ fontSize: 10 }}>(onde você acabou de atirar)</span>
        </div>
      </div>
    );
  }

  if (game.currentStep === 4) {
    return (
      <>
        <div className="muted" style={{ marginBottom: 8 }}>TOQUE PARA ONDE MOVER SEU TANQUE</div>
        {turnDone && (
          <div className="turn-done">
            <div className="turn-done-title">TURNO CONCLUIDO</div>
          </div>
        )}
      </>
    );
  }

  return null;
}

export function GameScreen({ active, state, actions }) {
  const { game, timerValue, myPlayer, hearts, CVARS, NAMES, turnBadge, turnDone } = state;
  const timerUrgent = timerValue <= 10;

  return (
    <div className={`screen ${active ? 'active' : ''}`}>
      <div className="hud">
        <div>
          <div className="hud-player" style={{ color: CVARS[game.myColor] || 'var(--text)' }}>
            {NAMES[game.myColor] || '—'}
          </div>
          <div className="muted" style={{ fontSize: 10, marginTop: 2 }}>RODADA {game.round}</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div className={`timer ${timerUrgent ? 'urgent' : ''}`}>{timerValue}</div>
          <div className="timer-bar-bg">
            <div className={`timer-bar ${timerUrgent ? 'urgent' : ''}`} style={{ width: `${(timerValue / 30) * 100}%` }} />
          </div>
        </div>

        {/* <div style={{ textAlign: 'right' }}>
          <div className="hud-lives">{hearts}</div>
          <div className={`shield-badge ${myPlayer?.hasShield ? 'active' : ''}`}>
            {myPlayer?.hasShield ? '🛡 ESCUDO ATIVO' : '🛡 SEM CARTA'}
          </div>
        </div> */}
      </div>

      <div className="turn-badge" style={{ borderLeftColor: turnBadge.color, color: turnBadge.color }}>{turnBadge.text}</div>

      <div className="steps">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className={`step ${game.currentStep === step ? 'active' : ''} ${game.currentStep > step ? 'done' : ''}`}>
            <span className="step-num">{step}</span>
            {step === 1 ? 'ALVO' : step === 2 ? 'ATIRAR' : step === 3 ? 'POSIC.' : 'MOVER'}
          </div>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 320 }}>
        <StepContent state={state} actions={actions} />
      </div>

      <div className="section-title" style={{ marginTop: 10 }}>SUA ARENA</div>
      <ArenaGrid
        myColor={game.myColor}
        myPos={myPlayer?.pos}
        destroyedCells={game.destroyed[game.myColor] || []}
        mode={game.currentStep === 4 ? 'move' : 'view'}
        onMove={actions.moveMyTank}
        colorVar={CVARS[game.myColor]}
      />

      <div className="gap-s" />
      {game.currentStep === 3 && (
        <button type="button" className="btn btn-ghost" onClick={actions.proceedToStep4}>
          <span>POSICIONEI - MOVER</span>
        </button>
      )}
      {game.currentStep === 4 && turnDone && (
        <button type="button" className="btn btn-ghost" onClick={actions.advanceTurn}>
          <span>FINALIZAR TURNO</span>
        </button>
      )}
    </div>
  );
}
