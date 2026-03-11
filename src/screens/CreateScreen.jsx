import React from 'react';
import { ColorSelector } from '../components/ColorSelector';

export function CreateScreen({ active, myColor, players, onSelectColor, onCreateRoom, onBack }) {
  return (
    <div className={`screen ${active ? 'active' : ''}`}>
      <div className="gap-l" />
      <div className="logo logo-small">CRIAR SALA</div>
      <div className="gap-l" />
      <div className="section-title">ESCOLHA SUA COR</div>
      <ColorSelector selected={myColor} players={players} onSelect={onSelectColor} />
      <div className="gap-m" />
      <button type="button" className="btn" onClick={onCreateRoom}>
        <span>CRIAR SALA</span>
      </button>
      <div className="gap-s" />
      <button type="button" className="btn btn-ghost" onClick={onBack}>
        <span>VOLTAR</span>
      </button>
    </div>
  );
}
