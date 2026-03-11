import React from 'react';
import { ColorSelector } from '../components/ColorSelector';

export function JoinScreen({ active, myColor, players, joinCode, onSelectColor, onSetJoinCode, onJoin, onBack }) {
  return (
    <div className={`screen ${active ? 'active' : ''}`}>
      <div className="gap-l" />
      <div className="logo logo-small">ENTRAR NA SALA</div>
      <div className="gap-l" />
      <div className="section-title">ESCOLHA SUA COR</div>
      <ColorSelector selected={myColor} players={players} onSelect={onSelectColor} />
      <div className="gap-m" />
      <div className="input-group">
        <span className="input-label">CODIGO DA SALA</span>
        <input
          className="input-field"
          maxLength={6}
          placeholder="ABC123"
          value={joinCode}
          onChange={(e) => onSetJoinCode(e.target.value.toUpperCase())}
        />
      </div>
      <div className="gap-m" />
      <button type="button" className="btn" onClick={onJoin}>
        <span>ENTRAR</span>
      </button>
      <div className="gap-s" />
      <button type="button" className="btn btn-ghost" onClick={onBack}>
        <span>VOLTAR</span>
      </button>
    </div>
  );
}
