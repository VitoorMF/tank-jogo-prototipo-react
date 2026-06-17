import React from 'react';
import { Screen } from '../components/Shell';

export function HomeScreen({ active, myName, onSetMyName, onCreate, onJoin, onHelp, pendingSession, onResume }) {
  if (!active) return null;
  const canPlay = myName.trim().length > 0;

  return (
    <Screen footer={<span style={{ color: 'var(--ink-3)', fontSize: 12, letterSpacing: '.24em' }}>v1.1 · React</span>}>
      <div className="grow center-col" style={{ gap: 30, paddingTop: 20 }}>
        <div>
          <div className="logo">
            TANK
            <br />
            WAR
          </div>
          <div className="logo-sub">Hybrid Board Game</div>
        </div>
        <div>
          <div className="field-label">Seu nome</div>
          <input
            className="text-field"
            maxLength={16}
            placeholder="COMANDANTE"
            value={myName}
            onChange={(e) => onSetMyName(e.target.value.toUpperCase())}
          />
        </div>
        <div className="stack stack-14">
          {pendingSession?.roomCode && (
            <button type="button" className="btn btn--success" onClick={onResume}>
              ▶ Voltar para a partida {pendingSession.roomCode}
            </button>
          )}
          <button type="button" className="btn btn--primary" onClick={onCreate} disabled={!canPlay}>
            Criar sala
          </button>
          <button type="button" className="btn btn--ghost" onClick={onJoin} disabled={!canPlay}>
            Entrar na sala
          </button>
          {onHelp && (
            <button type="button" className="link-danger" style={{ color: 'var(--ink-2)' }} onClick={onHelp}>
              Como jogar?
            </button>
          )}
        </div>
      </div>
    </Screen>
  );
}
