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
      <div className="section-title">RANKING</div>
      <div className="w-full">
        {endStats.ranking.map(({ color, position }) => (
          <div key={color} className="stat-row" style={{ borderLeft: `3px solid ${CVARS[color]}`, paddingLeft: 10 }}>
            <span style={{ color: CVARS[color], fontFamily: 'Orbitron, monospace', fontSize: 12 }}>
              {position === null ? '🏆' : `${position}º`} {EMOJI[color]} {game.players[color]?.name || NAMES[color]}
            </span>
            <span className="stat-val" style={{ fontSize: 11 }}>
              {game.players[color]?.killedBy
                ? `abatido por ${game.players[game.players[color].killedBy]?.name || NAMES[game.players[color].killedBy]}`
                : position === null ? 'sobreviveu' : 'tempo/desistência'}
            </span>
          </div>
        ))}
      </div>

      <div className="gap-s" />
      <div className="section-title">SUAS ESTATÍSTICAS</div>
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
          <span>ACERTOS</span>
          <span className="stat-val">{endStats.hits}</span>
        </div>
        <div className="stat-row">
          <span>ERROS</span>
          <span className="stat-val">{endStats.misses}</span>
        </div>
        <div className="stat-row">
          <span>PRECISÃO</span>
          <span className="stat-val">{endStats.accuracy}%</span>
        </div>
        <div className="stat-row">
          <span>VIDAS RESTANTES</span>
          <span className="stat-val">{endStats.lives}</span>
        </div>
        {endStats.killedBy && (
          <div className="stat-row">
            <span>ABATIDO POR</span>
            <span className="stat-val" style={{ color: CVARS[endStats.killedBy] }}>
              {EMOJI[endStats.killedBy]} {game.players[endStats.killedBy]?.name || NAMES[endStats.killedBy]}
            </span>
          </div>
        )}
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
