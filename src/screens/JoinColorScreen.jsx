import React from 'react';
import { ColorSelector } from '../components/ColorSelector';
import { Screen } from '../components/Shell';
import { CHEX } from '../constants/game';

export function JoinColorScreen({ active, state, actions }) {
  if (!active) return null;
  const { game, playersReadyCount } = state;
  const accentHex = game.myColor ? CHEX[game.myColor] : undefined;

  return (
    <Screen accentHex={accentHex} footer={null}>
      <div className="page-title">Escolha sua cor</div>

      <div className="section-label">Sala {game.roomCode}</div>
      <div style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', marginTop: -8 }}>
        {playersReadyCount}/4 conectados · cores em cinza já foram escolhidas
      </div>

      <ColorSelector selected={game.myColor} players={game.players} onSelect={actions.selectColor} />

      <div className="stack stack-14" style={{ marginTop: 6 }}>
        <button type="button" className="btn btn--primary" onClick={actions.joinRoom} disabled={!game.myColor}>
          Entrar
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => actions.setScreen('join')}>
          Voltar
        </button>
      </div>
    </Screen>
  );
}
