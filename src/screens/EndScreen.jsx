import React from 'react';

export function EndScreen({ active, state, actions }) {
  const { game, CVARS, EMOJI, NAMES, endStats } = state;
  const winnerIsMe = game.winner && game.winner === game.myColor;

  return (
    <div className={`screen ${active ? 'active' : ''}`}>
      <div className="gap-l" />
      <div className="logo" style={{ fontSize: 20 }}>
        FIM DE PARTIDA
      </div>
      <div className="gap-m" />
      <div className="winner-banner" style={{ borderColor: game.winner ? CVARS[game.winner] : 'var(--border)' }}>
        {game.winner ? `${EMOJI[game.winner]} ${NAMES[game.winner]}\n${winnerIsMe ? 'VOCE VENCEU! 🏆' : 'VENCEU!'}` : 'EMPATE'}
      </div>
      <div className="gap-s" />
      <div className="w-full">
        <div className="stat-row">
          <span>RODADAS</span>
          <span className="stat-val">{endStats.rounds}</span>
        </div>
        <div className="stat-row">
          <span>TIROS DADOS</span>
          <span className="stat-val">{endStats.shots}</span>
        </div>
        <div className="stat-row">
          <span>ALVOS MARCADOS</span>
          <span className="stat-val">{endStats.destroyed}</span>
        </div>
        <div className="stat-row">
          <span>SUAS VIDAS RESTANTES</span>
          <span className="stat-val">{endStats.lives}</span>
        </div>
      </div>
      <div className="gap-l" />
      <button
        type="button"
        className="btn"
        onClick={() => {
          actions.clearSession();
          window.location.reload();
        }}
      >
        <span>NOVA PARTIDA</span>
      </button>
    </div>
  );
}
