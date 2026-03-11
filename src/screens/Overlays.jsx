import React from 'react';

export function Overlays({ state, actions }) {
  const { overlays, game, coordLabel, hearts } = state;

  return (
    <>
      <div className={`overlay ${overlays.shot ? 'show' : ''}`}>
        <div className="overlay-box">
          <div className="overlay-title">CONFIRMAR BOMBARDEIO</div>
          <div className="muted" style={{ letterSpacing: 2 }}>COORDENADA</div>
          <div className="overlay-coord">{game.pendingShot ? coordLabel(game.pendingShot.x, game.pendingShot.y) : '--'}</div>
          <div className="muted">Posicione a peça de alvo no tabuleiro físico.</div>
          <button type="button" className="btn btn-danger" onClick={actions.confirmShot}>
            <span>🎯 DISPARAR</span>
          </button>
          <button type="button" className="btn btn-ghost" onClick={actions.cancelShot}>
            <span>CANCELAR</span>
          </button>
        </div>
      </div>

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
