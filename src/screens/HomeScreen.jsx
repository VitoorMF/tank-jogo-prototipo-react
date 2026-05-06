import React from 'react';

export function HomeScreen({ active, myName, onSetMyName, onCreate, onJoin }) {
  const canPlay = myName.trim().length > 0;

  return (
    <div className={`screen ${active ? 'active' : ''}`}>
      <div className="gap-xl" />
      <div className="logo">
        TANK
        <br />
        BATTLE
      </div>
      <div className="logo-sub">HYBRID BOARD GAME</div>
      <div className="gap-xl" />
      <div className="input-group">
        <span className="input-label">SEU NOME</span>
        <input
          className="input-field"
          maxLength={16}
          placeholder="COMANDANTE"
          value={myName}
          onChange={(e) => onSetMyName(e.target.value.toUpperCase())}
        />
      </div>
      <div className="gap-m" />
      <button type="button" className="btn" onClick={onCreate} disabled={!canPlay}>
        <span>CRIAR SALA</span>
      </button>
      <div className="gap-s" />
      <button type="button" className="btn btn-ghost" onClick={onJoin} disabled={!canPlay}>
        <span>ENTRAR NA SALA</span>
      </button>
      <div className="gap-l" />
      <div className="muted">v1.1 - REACT</div>
    </div>
  );
}
