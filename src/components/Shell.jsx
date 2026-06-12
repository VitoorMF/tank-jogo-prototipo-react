/* Shell.jsx — shared presentational primitives for the redesigned UI */
import React from 'react';
import { accentVars } from '../constants/game';
import { IconHeart, IconSwords } from './Icons';

export function Dot({ color, size = 24 }) {
  return <span className="color-dot" style={{ '--cc': color, width: size, height: size }} />;
}

export function OnlineTag({ online = true }) {
  return (
    <div className={`online-tag ${online ? '' : 'off'}`}>
      <i />
      {online ? 'Online' : 'Offline'}
    </div>
  );
}

// screen shell: tinted by accent hex, scrollable body + optional footer
export function Screen({ accentHex, children, footer, className = '', center = false }) {
  return (
    <div className={`scr ${className}`} style={accentVars(accentHex)}>
      <div className={`scr-body ${center ? 'center' : ''}`}>{children}</div>
      {footer !== null && footer !== undefined && <div className="scr-foot">{footer}</div>}
    </div>
  );
}

export function Hud({ name, round, time, timePct, urgent, lives }) {
  return (
    <div className="hud">
      <div>
        <div className="hud-name">{name}</div>
        <div className="hud-round">Rodada {round}</div>
        {typeof lives === 'number' && (
          <div className="hud-lives">
            <Hearts n={lives} />
          </div>
        )}
      </div>
      <div className="hud-timer">
        <span className="hud-clock">tempo</span>
        <b className={urgent ? 'urgent' : ''}>{String(time).padStart(2, '0')}</b>
        <div className="hud-timerbar">
          <i className={urgent ? 'urgent' : ''} style={{ width: `${timePct}%` }} />
        </div>
      </div>
    </div>
  );
}

export function TurnBanner({ label = 'Sua vez' }) {
  return (
    <div className="banner">
      <span className="ico">
        <IconSwords size={24} style={{ color: 'var(--ink-2)' }} />
      </span>
      <b>{label}</b>
    </div>
  );
}

const STEP_DEFS = [
  { n: 1, lbl: 'Mirar' },
  { n: 2, lbl: 'Marcar' },
  { n: 3, lbl: 'Mover' },
];
export function Stepper({ current }) {
  return (
    <div className="stepper">
      {STEP_DEFS.map((s) => {
        const state = s.n < current ? 'done' : s.n === current ? 'active' : 'todo';
        return (
          <div className="step" data-state={state} key={s.n}>
            <div className="num">{state === 'done' ? <span className="check">✓</span> : s.n}</div>
            <div className="lbl">{s.lbl}</div>
          </div>
        );
      })}
    </div>
  );
}

export function Prompt({ kicker, children }) {
  return (
    <div className="prompt">
      {kicker && <div className="k">{kicker}</div>}
      <div className="q">{children}</div>
    </div>
  );
}

export function Hearts({ n = 3, max = 3 }) {
  return (
    <span className="hearts">
      {Array.from({ length: max }).map((_, i) => (
        <IconHeart key={i} size={20} filled={i < n} color={i < n ? 'var(--red)' : 'var(--ink-3)'} />
      ))}
    </span>
  );
}
