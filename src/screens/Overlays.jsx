import React from 'react';
import { SKILLS, hearts as heartsOf } from '../constants/game';

export function Overlays({ state, actions }) {
  const { overlays, game, coordLabel, hearts, NAMES, CVARS, COLORS } = state;

  return (
    <>
      <div className={`overlay ${overlays.hit ? 'show' : ''}`}>
        <div className="overlay-box" style={{ borderColor: 'var(--accent2)' }}>
          <div style={{ fontSize: 52 }}>💥</div>
          <div className="overlay-title" style={{ color: 'var(--accent2)', fontSize: 20 }}>VOCE FOI ATINGIDO!</div>
          <div style={{ fontSize: 28, letterSpacing: 4, margin: '4px 0' }}>{hearts}</div>
          <div className="muted" style={{ fontSize: 12, lineHeight: 1.7, textAlign: 'center' }}>
            SO VOCE VIU ISSO.
            <br />
            VOCE PODE BLEFAR!
          </div>
          <button type="button" className="btn" onClick={actions.dismissHit}>
            <span>ENTENDI</span>
          </button>
        </div>
      </div>

      <div className={`overlay ${overlays.elimAnnounce ? 'show' : ''}`}>
        <div className="overlay-box" style={{ borderColor: CVARS[overlays.elimAnnounce] }}>
          <div style={{ fontSize: 52 }}>💀</div>
          <div className="overlay-title" style={{ color: CVARS[overlays.elimAnnounce] }}>
            {NAMES[overlays.elimAnnounce]} ELIMINADO!
          </div>
          <button type="button" className="btn" onClick={actions.dismissEliminationAnnounce}>
            <span>OK</span>
          </button>
        </div>
      </div>

      <div className={`overlay ${overlays.viewLives ? 'show' : ''}`}>
        <div className="overlay-box">
          <div className="overlay-title" style={{ color: 'var(--green)' }}>👁️ VIDAS INIMIGAS</div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, margin: '8px 0' }}>
            {COLORS.filter((c) => c !== game.myColor).map((c) => {
              const p = game.players[c];
              if (!p?.active && !p?.eliminated) return null;
              return (
                <div key={c} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, color: CVARS[c] }}>{NAMES[c]}</span>
                  <span style={{ fontSize: 16 }}>{p.eliminated ? '💀' : heartsOf(p.lives)}</span>
                </div>
              );
            })}
          </div>
          <div className="muted" style={{ fontSize: 10, textAlign: 'center', marginBottom: 8 }}>
            SÓ VOCÊ VIU ISSO
          </div>
          <button type="button" className="btn" onClick={actions.dismissViewLives}>
            <span>FECHAR</span>
          </button>
        </div>
      </div>

      <div className={`overlay ${overlays.skillActivated ? 'show' : ''}`}>
        <div className="overlay-box" style={{ borderColor: 'var(--green)' }}>
          {overlays.skillActivated && (() => {
            const skill = SKILLS[overlays.skillActivated];
            return (
              <>
                <div style={{ fontSize: 48 }}>{skill?.emoji || '⚡'}</div>
                <div className="overlay-title" style={{ color: 'var(--green)' }}>SKILL ATIVADA!</div>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 14, color: 'var(--green)', letterSpacing: 2 }}>
                  {skill?.name}
                </div>
                <div className="muted" style={{ textAlign: 'center', marginTop: 4, fontSize: 12 }}>
                  {skill?.desc}
                </div>
              </>
            );
          })()}
          <div style={{ marginTop: 12 }} />
          <button type="button" className="btn" onClick={actions.dismissSkillActivated}>
            <span>OK</span>
          </button>
        </div>
      </div>

      <div className={`overlay ${overlays.elim ? 'show' : ''}`}>
        <div className="overlay-box" style={{ borderColor: 'var(--accent2)' }}>
          <div style={{ fontSize: 52 }}>💀</div>
          <div className="overlay-title" style={{ color: 'var(--accent2)', fontSize: 18 }}>TANQUE DESTRUIDO!</div>
          <div className="muted" style={{ textAlign: 'center', lineHeight: 1.8 }}>
            Você foi eliminado.
            <br />
            Mostre seu app para todos.
          </div>
          <button type="button" className="btn btn-danger" onClick={actions.confirmElimination}>
            <span>CONFIRMAR ELIMINACAO</span>
          </button>
        </div>
      </div>
    </>
  );
}
