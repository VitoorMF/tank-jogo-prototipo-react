import React, { useState } from 'react';
import { ArenaGrid } from '../components/ArenaGrid';

function StepContent({ state, actions }) {
  const { game, NAMES, CVARS, coordLabel, turnDone, myPlayer } = state;

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
          <span>CONFIRMAR COORDENADA</span>
        </button>
      </>
    );
  }

  if (game.currentStep === 3 && game.pendingShot && myPlayer?.pos && game.myColor) {
    const { x, y } = game.pendingShot;
    const tankColor = game.myColor;
    const { x: tankX, y: tankY } = myPlayer.pos;

    return (
      <div style={{ background: 'var(--bg3)', border: '1px solid var(--accent)', padding: 14, marginBottom: 8 }}>
        <div className="step-help">PASSO 3 - POSICIONE AS PEÇAS NO TABULEIRO FÍSICO</div>
        <br />
        <div style={{ fontSize: 12, letterSpacing: 2 }}>POSIÇÃO DO SEU TANQUE (ÚLTIMA CONHECIDA):</div>
        <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 18, color: CVARS[tankColor], letterSpacing: 4 }}>
          {NAMES[tankColor]} · {coordLabel(tankX, tankY)}
        </span>

        <div className="step-help-lg">
          <div style={{ fontSize: 12, letterSpacing: 2 }}>POSICIONE A PEÇA DE ALVO EM:</div>
          <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 18, color: 'var(--accent)', letterSpacing: 4 }}>
            {coordLabel(x, y)}
          </span>
          <br />
          <span style={{ fontSize: 10 }}>(coordenada do tiro desta rodada)</span>
        </div>
      </div>
    );
  }

  if (game.currentStep === 4) {
    return (
      <>
        <div className="muted" style={{ marginBottom: 8 }}>PASSO 4 · TOQUE PARA ONDE MOVER SEU TANQUE</div>
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
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className={`step ${game.currentStep === step ? 'active' : ''} ${game.currentStep > step ? 'done' : ''}`}>
            <span className="step-num">{step}</span>
            {step === 1 ? 'COORD.' : step === 2 ? 'ATIRAR' : step === 3 ? 'POSIC.' : 'MOVER'}
          </div>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 380 }}>
        <StepContent state={state} actions={actions} />
      </div>

      <div className="section-title" style={{ marginTop: 10 }}>TABULEIRO 4x4 · SUA ZONA</div>
      <ArenaGrid
        myColor={game.myColor}
        myPos={myPlayer?.pos}
        shotCells={game.boardShots}
        mode={game.currentStep === 4 && !turnDone ? 'move' : 'view'}
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
