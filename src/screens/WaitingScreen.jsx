import React from 'react';
import { ArenaGrid } from '../components/ArenaGrid';

export function WaitingScreen({ active, state }) {
  const { game, myPlayer, waitingMsg, hearts, CVARS, activeTurnColor } = state;

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
        SUA POSICAO
      </div>
      <ArenaGrid
        myColor={game.myColor}
        myPos={myPlayer?.pos}
        destroyedCells={game.destroyed[game.myColor] || []}
        mode="view"
        colorVar={CVARS[game.myColor]}
      />
    </div>
  );
}
