import React from 'react';

export function HomeScreen({ active, onCreate, onJoin }) {
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
      <button type="button" className="btn" onClick={onCreate}>
        <span>CRIAR SALA</span>
      </button>
      <div className="gap-s" />
      <button type="button" className="btn btn-ghost" onClick={onJoin}>
        <span>ENTRAR NA SALA</span>
      </button>
      <div className="gap-l" />
      <div className="muted">v1.1 - REACT</div>
    </div>
  );
}
