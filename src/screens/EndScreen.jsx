import React from 'react';
import { Screen } from '../components/Shell';
import { CHEX, NAMES } from '../constants/game';

function nameOf(players, color) {
  return players[color]?.name?.trim() ? players[color].name.toUpperCase() : NAMES[color];
}

export function EndScreen({ active, state, actions }) {
  if (!active) return null;
  const { game, endStats } = state;
  const winnerIsMe = game.winner && game.winner === game.myColor;
  const accentHex = game.winner ? CHEX[game.winner] : undefined;

  return (
    <Screen accentHex={accentHex} footer={null}>
      <div className="section-label">Fim de partida</div>

      <div className="winner-banner">
        {game.winner ? (
          <>
            <div className="wb-title">{nameOf(game.players, game.winner)}</div>
            <div style={{ color: 'var(--accent-2)', letterSpacing: '.14em', fontSize: 15, marginTop: 6, textTransform: 'uppercase' }}>
              {winnerIsMe ? 'Você venceu! 🏆' : 'Venceu! 🏆'}
            </div>
          </>
        ) : (
          <div className="wb-title">Empate</div>
        )}
      </div>

      <div className="section-label">Ranking</div>
      <div className="stack stack-10">
        {endStats.ranking.map(({ color, position }) => (
          <div className="rank-row" key={color} style={{ '--cc': CHEX[color] }}>
            <span className="rank-pos">{position === null ? '🏆' : `${position}º`}</span>
            <span className="rank-name">{nameOf(game.players, color)}</span>
            <span style={{ color: 'var(--ink-3)', fontSize: 11, letterSpacing: '.08em', textAlign: 'right' }}>
              {game.players[color]?.killedBy
                ? `abatido por ${nameOf(game.players, game.players[color].killedBy)}`
                : position === null
                  ? 'sobreviveu'
                  : '—'}
            </span>
          </div>
        ))}
      </div>

      <div className="section-label">Suas estatísticas</div>
      <div className="stat-grid">
        <div className="stat-box">
          <div className="sv">{endStats.rounds}</div>
          <div className="sl">Rodadas</div>
        </div>
        <div className="stat-box">
          <div className="sv">{endStats.shots}</div>
          <div className="sl">Tiros</div>
        </div>
        <div className="stat-box">
          <div className="sv">{endStats.hits}</div>
          <div className="sl">Acertos</div>
        </div>
        <div className="stat-box">
          <div className="sv">{endStats.misses}</div>
          <div className="sl">Erros</div>
        </div>
        <div className="stat-box">
          <div className="sv">{endStats.accuracy}%</div>
          <div className="sl">Precisão</div>
        </div>
        <div className="stat-box">
          <div className="sv">{endStats.lives}</div>
          <div className="sl">Vidas restantes</div>
        </div>
      </div>

      <button
        type="button"
        className="btn btn--primary"
        style={{ marginTop: 6 }}
        onClick={() => {
          actions.clearSession();
          window.location.reload();
        }}
      >
        Nova partida
      </button>
    </Screen>
  );
}
