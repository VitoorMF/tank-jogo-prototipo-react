import React from 'react';
import { Screen, Dot, OnlineTag } from '../components/Shell';
import { IconPlay } from '../components/Icons';
import { CHEX } from '../constants/game';

export function LobbyScreen({ active, state, actions }) {
  if (!active) return null;
  const { game, playersReadyCount, canStart, COLORS, CHEX: chex, NAMES, online } = state;
  const accentHex = game.myColor ? (chex || CHEX)[game.myColor] : undefined;

  return (
    <Screen accentHex={accentHex} footer={null}>
      <div className="page-title" style={{ fontSize: 30, lineHeight: 1.05 }}>
        Aguardando
        <br />
        jogadores
      </div>

      <div className="section-label">Código da sala</div>
      <div className="code-hero">
        <b>{game.roomCode || '------'}</b>
      </div>
      <div className="code-caption">Compartilhe este código com os outros jogadores</div>

      <div className="section-label">Jogadores</div>
      <div className="stack stack-10">
        {COLORS.map((c) => {
          const filled = game.players[c]?.active;
          const status = filled ? (c === game.myColor ? 'Você' : 'Conectado') : 'Aguardando';
          return (
            <div className="player-row" key={c} data-dim={filled ? undefined : 1} style={{ '--cc': (chex || CHEX)[c] }}>
              <span className="accent-bar" />
              <span className="ready-dot" data-on={filled ? 1 : undefined} />
              <Dot color={(chex || CHEX)[c]} />
              <span className="player-name">{game.players[c]?.name || NAMES[c]}</span>
              <span className="player-status" data-live={filled ? 1 : undefined}>
                {status}
              </span>
            </div>
          );
        })}
      </div>

      {canStart && (
        <button type="button" className="btn btn--primary" style={{ marginTop: 6 }} onClick={actions.startGame}>
          <IconPlay size={18} /> Iniciar partida
        </button>
      )}

      <div style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 12.5, letterSpacing: '.14em', textTransform: 'uppercase' }}>
        {game.isHost ? `${playersReadyCount}/4 · Aguardando mais jogadores` : `${playersReadyCount}/4 · Aguardando host iniciar`}
      </div>

      <button type="button" className="btn btn--ghost" onClick={actions.leaveRoom}>
        Sair da sala
      </button>
      <OnlineTag online={online} />
    </Screen>
  );
}
