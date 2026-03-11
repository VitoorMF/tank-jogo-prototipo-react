import React, { useState } from 'react';
import { ArenaGrid } from '../components/ArenaGrid';

export function WaitingScreen({ active, state, actions }) {
  const { game, myPlayer, waitingMsg, hearts, CVARS, activeTurnColor } = state;
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  return (
    <div className={`screen ${active ? 'active' : ''}`}>
      <div className="gap-xl" />
      <div className="waiting-pulse">⏳</div>
      <div className="gap-l" />
      <div className="logo" style={{ fontSize: 20, color: CVARS[activeTurnColor] || 'var(--accent)' }}>
        {waitingMsg}
      </div>
      <div className="gap-s" />
      <div className="muted">Rodada {game.round} · Aguarde...</div>
      <div className="gap-l" />
      <div style={{ fontSize: 22, display: 'flex', gap: 5, justifyContent: 'center' }}>{hearts}</div>
      <div className="gap-l" />
      <div className="section-title" style={{ textAlign: 'center' }}>
        TABULEIRO 8x8 · SUA POSIÇÃO
      </div>
      <ArenaGrid
        myColor={game.myColor}
        myPos={myPlayer?.pos}
        shotCells={game.boardShots}
        mode="view"
        colorVar={CVARS[game.myColor]}
      />
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
