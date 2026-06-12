import React from 'react';
import { SKILLS, CHEX, NAMES } from '../constants/game';
import { Hearts } from '../components/Shell';

function nameOf(players, color) {
  return players[color]?.name?.trim() ? players[color].name.toUpperCase() : NAMES[color];
}

export function Overlays({ state, actions }) {
  const { overlays, game, myPlayer, COLORS } = state;

  return (
    <>
      {/* Você foi atingido */}
      <div className={`overlay ${overlays.hit ? 'show' : ''}`}>
        <div className="overlay-box" style={{ borderColor: 'var(--red)' }}>
          <div className="overlay-big">💥</div>
          <div className="overlay-title" style={{ color: 'var(--red)' }}>
            Você foi atingido!
          </div>
          <Hearts n={myPlayer?.lives ?? 0} />
          <div style={{ color: 'var(--ink-2)', fontSize: 12, lineHeight: 1.7 }}>
            Só você viu isso.
            <br />
            Você pode blefar!
          </div>
          <button type="button" className="btn btn--primary" onClick={actions.dismissHit}>
            Entendi
          </button>
        </div>
      </div>

      {/* Escudo absorveu (privado, só o escudado vê) */}
      <div className={`overlay ${overlays.shieldAbsorbed ? 'show' : ''}`}>
        <div className="overlay-box" style={{ borderColor: 'var(--green)' }}>
          <div className="overlay-big">🛡️</div>
          <div className="overlay-title" style={{ color: 'var(--green)' }}>
            Escudo absorveu!
          </div>
          <div style={{ color: 'var(--ink-2)', fontSize: 12, lineHeight: 1.7 }}>
            Você levou um tiro, mas o escudo segurou.
            <br />
            Ninguém mais viu isso.
          </div>
          <button type="button" className="btn btn--primary" onClick={actions.dismissShieldAbsorbed}>
            Entendi
          </button>
        </div>
      </div>

      {/* Inimigo eliminado (anúncio) */}
      <div className={`overlay ${overlays.elimAnnounce ? 'show' : ''}`}>
        <div className="overlay-box" style={{ borderColor: CHEX[overlays.elimAnnounce] }}>
          <div className="overlay-big">💀</div>
          <div className="overlay-title" style={{ color: CHEX[overlays.elimAnnounce] }}>
            {overlays.elimAnnounce && nameOf(game.players, overlays.elimAnnounce)} eliminado!
          </div>
          <button type="button" className="btn btn--primary" onClick={actions.dismissEliminationAnnounce}>
            OK
          </button>
        </div>
      </div>

      {/* Espionagem — vidas inimigas */}
      <div className={`overlay ${overlays.viewLives ? 'show' : ''}`}>
        <div className="overlay-box" style={{ borderColor: 'var(--green)' }}>
          <div className="overlay-title" style={{ color: 'var(--green)' }}>
            👁️ Vidas inimigas
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, margin: '8px 0' }}>
            {COLORS.filter((c) => c !== game.myColor).map((c) => {
              const p = game.players[c];
              if (!p?.active && !p?.eliminated) return null;
              return (
                <div key={c} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-d)', fontWeight: 700, fontSize: 16, color: CHEX[c] }}>{nameOf(game.players, c)}</span>
                  {p.eliminated ? <span style={{ fontSize: 16 }}>💀</span> : <Hearts n={p.lives} />}
                </div>
              );
            })}
          </div>
          <div style={{ color: 'var(--ink-3)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase' }}>Só você viu isso</div>
          <button type="button" className="btn btn--primary" onClick={actions.dismissViewLives}>
            Fechar
          </button>
        </div>
      </div>

      {/* Míssil — escolher alvo */}
      <div className={`overlay ${overlays.missileTarget ? 'show' : ''}`}>
        <div className="overlay-box" style={{ borderColor: 'var(--red)' }}>
          <div className="overlay-big">🚀</div>
          <div className="overlay-title" style={{ color: 'var(--red)' }}>
            Míssil — escolha o alvo
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, margin: '8px 0' }}>
            {COLORS.filter((c) => c !== game.myColor && game.players[c]?.active && !game.players[c]?.eliminated).map((c) => (
              <button key={c} type="button" className="btn btn--primary" style={{ '--accent': CHEX[c], borderColor: CHEX[c], color: CHEX[c] }} onClick={() => actions.fireMissile(c)}>
                {nameOf(game.players, c)}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn--ghost" onClick={actions.cancelMissile}>
            Cancelar
          </button>
        </div>
      </div>

      {/* Skill ativada */}
      <div className={`overlay ${overlays.skillActivated ? 'show' : ''}`}>
        <div className="overlay-box" style={{ borderColor: 'var(--green)' }}>
          {overlays.skillActivated &&
            (() => {
              const skill = SKILLS[overlays.skillActivated];
              return (
                <>
                  <div className="overlay-big">{skill?.emoji || '⚡'}</div>
                  <div className="overlay-title" style={{ color: 'var(--green)' }}>
                    Skill ativada!
                  </div>
                  <div style={{ fontFamily: 'var(--font-d)', fontWeight: 700, fontSize: 16, color: 'var(--green)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                    {skill?.name}
                  </div>
                  <div style={{ color: 'var(--ink-2)', fontSize: 12 }}>{skill?.desc}</div>
                </>
              );
            })()}
          <button type="button" className="btn btn--primary" onClick={actions.dismissSkillActivated}>
            OK
          </button>
        </div>
      </div>

      {/* Tanque destruído */}
      <div className={`overlay ${overlays.elim ? 'show' : ''}`}>
        <div className="overlay-box" style={{ borderColor: 'var(--red)' }}>
          <div className="overlay-big">💀</div>
          <div className="overlay-title" style={{ color: 'var(--red)' }}>
            Tanque destruído!
          </div>
          <div style={{ color: 'var(--ink-2)', fontSize: 13, lineHeight: 1.7 }}>
            Você foi eliminado.
            <br />
            Mostre seu app para todos.
          </div>
          <button type="button" className="btn btn--danger" onClick={actions.confirmElimination}>
            Confirmar eliminação
          </button>
        </div>
      </div>
    </>
  );
}
