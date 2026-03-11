import React from 'react';

export function LobbyScreen({ active, state, actions }) {
  const { game, playersReadyCount, canStart, COLORS, CVARS, NAMES, EMOJI } = state;

  return (
    <div className={`screen ${active ? 'active' : ''}`}>
      <div className="gap-m" />
      <div className="logo" style={{ fontSize: 20 }}>
        AGUARDANDO JOGADORES
      </div>
      <div className="gap-m" />
      <div className="section-title">CODIGO DA SALA</div>
      <div className="room-code">{game.roomCode || '------'}</div>
      <div className="gap-s" />
      <div className="muted" style={{ fontSize: 10 }}>
        Compartilhe este codigo com os outros jogadores
      </div>
      <div className="gap-m" />
      <div className="section-title">JOGADORES</div>
      <div className="players-list">
        {COLORS.map((c) => {
          const filled = game.players[c]?.active;
          return (
            <div
              key={c}
              className={`player-slot ${filled ? 'filled' : ''}`}
              style={{ borderLeft: `4px solid ${filled ? CVARS[c] : 'transparent'}` }}
            >
              <div className="dot" style={filled ? { background: CVARS[c] } : undefined} />
              <span>
                {EMOJI[c]} {NAMES[c]}
              </span>
              <span className="slot-status">{filled ? (c === game.myColor ? 'VOCE' : 'CONECTADO') : 'AGUARDANDO'}</span>
            </div>
          );
        })}
      </div>

      {canStart && (
        <>
          <div className="gap-m" />
          <button type="button" className="btn" onClick={actions.startGame}>
            <span>▶ INICIAR PARTIDA</span>
          </button>
        </>
      )}

      <div className="muted" style={{ marginTop: 10 }}>
        {game.isHost
          ? `${playersReadyCount}/4 • Aguardando mais jogadores`
          : `${playersReadyCount}/4 • Aguardando host iniciar`}
      </div>
      <div className="gap-m" />
      <button type="button" className="btn btn-ghost" onClick={actions.leaveRoom}>
        <span>SAIR DA SALA</span>
      </button>
    </div>
  );
}
