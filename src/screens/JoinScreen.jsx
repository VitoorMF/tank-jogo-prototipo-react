import React from 'react';
import { Screen } from '../components/Shell';

export function JoinScreen({ active, joinCode, onSetJoinCode, onContinue, onBack }) {
  if (!active) return null;
  const ready = joinCode.trim().length >= 4;
  return (
    <Screen footer={null}>
      <div className="grow center-col" style={{ gap: 24 }}>
        <div className="page-title">Entrar na sala</div>
        <div>
          <div className="field-label">Código da sala</div>
          <input
            className="text-field"
            maxLength={6}
            placeholder="ABC123"
            value={joinCode}
            onChange={(e) => onSetJoinCode(e.target.value.toUpperCase())}
          />
          <div style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 12.5, letterSpacing: '.14em', textTransform: 'uppercase', marginTop: 10 }}>
            Peça o código a quem criou a sala
          </div>
        </div>
        <div className="stack stack-14">
          <button type="button" className="btn btn--primary" onClick={onContinue} disabled={!ready}>
            Continuar
          </button>
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            Voltar
          </button>
        </div>
      </div>
    </Screen>
  );
}
