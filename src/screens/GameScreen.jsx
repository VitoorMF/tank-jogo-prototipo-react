import React, { useState } from 'react';
import { ArenaGrid } from '../components/ArenaGrid';

function StepContent({ state, actions }) {
  const { game, CVARS, coordLabel, turnDone, myPlayer } = state;

  if (game.currentStep === 1) {
    return (
      <>
        <div className="target-grid-wrap" style={{ borderColor: 'var(--accent)', background: 'rgba(0,0,0,0.15)' }}>
          <div className="target-grid-label" style={{ color: 'var(--accent)' }}>
            PASSO 1 · COORDENADA DE BOMBARDEIO
          </div>

          <div className="coord-inputs">
            <input
              className="coord-input"
              placeholder="A"
              maxLength={1}
              value={game.shotCol}
              onChange={(e) => actions.setShotCol(e.target.value)}
            />
            <span className="coord-sep">·</span>
            <input
              className="coord-input"
              placeholder="1"
              maxLength={1}
              value={game.shotRow}
              onChange={(e) => actions.setShotRow(e.target.value)}
            />
          </div>

          <div className="muted" style={{ marginTop: 10 }}>
            Use qualquer casa de A1 até H8
          </div>
        </div>

        <div className="gap-s" />
        <button type="button" className="btn" onClick={actions.stageShotFromInput}>
          <span>ATIRAR</span>
        </button>
      </>
    );
  }

  if (game.currentStep === 2 && game.pendingShot && myPlayer?.pos && game.myColor) {
    const { x, y } = game.pendingShot;
    const tankColor = game.myColor;
    const { x: tankX, y: tankY } = myPlayer.pos;

    return (
      <div style={{ background: 'var(--bg3)', border: '1px solid var(--accent)', padding: 14, marginBottom: 8 }}>
        <div className="step-help" style={{ marginBottom: 16 }}>PASSO 2 · POSICIONE NO TABULEIRO FÍSICO</div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div className="muted" style={{ fontSize: 10, letterSpacing: 2, marginBottom: 4 }}>SEU TANQUE</div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 22, color: CVARS[tankColor], letterSpacing: 4 }}>
              {coordLabel(tankX, tankY)}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div className="muted" style={{ fontSize: 10, letterSpacing: 2, marginBottom: 4 }}>ALVO DO TIRO</div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 22, color: 'var(--accent)', letterSpacing: 4 }}>
              {coordLabel(x, y)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (game.currentStep === 3) {
    return (
      <>
        <div className="muted" style={{ marginBottom: 8 }}>PASSO 3 · TOQUE PARA ONDE MOVER SEU TANQUE</div>
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
  const { game, timerValue, myPlayer, CVARS, NAMES, turnBadge, turnDone, turnDuration } = state;
  const timerUrgent = timerValue <= 10;
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

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
            <div
              className={`timer-bar ${timerUrgent ? 'urgent' : ''}`}
              style={{ width: `${(timerValue / turnDuration) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="turn-badge" style={{ borderLeftColor: turnBadge.color, color: turnBadge.color }}>{turnBadge.text}</div>

      <div className="steps">
        {[1, 2, 3].map((step) => (
          <div key={step} className={`step ${game.currentStep === step ? 'active' : ''} ${game.currentStep > step ? 'done' : ''}`}>
            <span className="step-num">{step}</span>
            {step === 1 ? 'COORD.' : step === 2 ? 'POSIC.' : 'MOVER'}
          </div>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 380 }}>
        <StepContent state={state} actions={actions} />
      </div>

      <div className="section-title" style={{ marginTop: 10 }}>SUA ZONA</div>
      <ArenaGrid
        myColor={game.myColor}
        myPos={myPlayer?.pos}
        shotCells={game.boardShots}
        mode={game.currentStep === 3 && !turnDone ? 'move' : 'view'}
        onMove={actions.moveMyTank}
        colorVar={CVARS[game.myColor]}
      />

      <div className="gap-s" />
      {game.currentStep === 2 && (
        <button type="button" className="btn btn-ghost" onClick={actions.proceedToMove}>
          <span>POSICIONEI - MOVER</span>
        </button>
      )}
      {game.currentStep === 3 && !turnDone && (
        <button type="button" className="btn btn-ghost" onClick={actions.advanceTurn}>
          <span>FICAR AQUI</span>
        </button>
      )}
      {game.currentStep === 3 && turnDone && (
        <button type="button" className="btn btn-ghost" onClick={actions.advanceTurn}>
          <span>FINALIZAR TURNO</span>
        </button>
      )}

      <div className="leave-bottom">
        <button type="button" className="btn-leave" onClick={() => setShowLeaveConfirm(true)}>
          SAIR DA PARTIDA
        </button>
      </div>

      <div className={`overlay ${showLeaveConfirm ? 'show' : ''}`}>
        <div className="overlay-box" style={{ borderColor: 'var(--accent2)' }}>
          <div className="overlay-title" style={{ color: 'var(--accent2)' }}>
            CONFIRMAR SAÍDA
          </div>
          <div className="muted" style={{ textAlign: 'center', lineHeight: 1.7 }}>
            Você vai abandonar a partida atual.
          </div>
          <button type="button" className="btn btn-danger" onClick={actions.leaveRoom}>
            <span>SIM, SAIR AGORA</span>
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setShowLeaveConfirm(false)}>
            <span>CONTINUAR NA PARTIDA</span>
          </button>
        </div>
      </div>
    </div>
  );
}
