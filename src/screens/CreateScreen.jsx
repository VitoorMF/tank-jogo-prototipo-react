import React from 'react';
import { ColorSelector } from '../components/ColorSelector';
import { Screen } from '../components/Shell';
import { CHEX } from '../constants/game';

export function CreateScreen({ active, myColor, players, onSelectColor, onCreateRoom, onBack }) {
  if (!active) return null;
  return (
    <Screen accentHex={myColor ? CHEX[myColor] : undefined} footer={null}>
      <div className="page-title">Criar sala</div>
      <div className="section-label">Escolha sua cor</div>
      <ColorSelector selected={myColor} players={players} onSelect={onSelectColor} />
      <div className="stack stack-14" style={{ marginTop: 6 }}>
        <button type="button" className="btn btn--primary" onClick={onCreateRoom} disabled={!myColor}>
          Criar sala
        </button>
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          Voltar
        </button>
      </div>
    </Screen>
  );
}
