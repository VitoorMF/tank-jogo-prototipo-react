import React, { useEffect, useState } from 'react';
import { ArenaGrid } from '../components/ArenaGrid';
import { Screen, Hearts } from '../components/Shell';
import { CHEX, NAMES } from '../constants/game';

function nameOf(player, color) {
  return player?.name?.trim() ? player.name.toUpperCase() : NAMES[color];
}

export function WaitingScreen({ active, state, actions }) {
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [tomatoPop, setTomatoPop] = useState(null);

  // fecha o balão ao clicar em qualquer outro lugar
  useEffect(() => {
    if (!tomatoPop) return undefined;
    const close = () => setTomatoPop(null);
    const t = setTimeout(() => document.addEventListener('click', close), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', close);
    };
  }, [tomatoPop]);

  if (!active) return null;

  const { game, myPlayer, waitingMsg, COLORS, activeTurnColor, tomato } = state;
  const accentHex = CHEX[activeTurnColor] || CHEX[game.myColor];

  return (
    <Screen
      accentHex={accentHex}
      footer={
        <button type="button" className="link-danger" onClick={() => setShowLeaveConfirm(true)}>
          Sair da partida
        </button>
      }
    >
      <div className="grow" style={{ display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'center' }}>
        <div>
          <div className="wait-title">{waitingMsg}</div>
          <div className="wait-sub" style={{ marginTop: 10 }}>
            Rodada {game.round} · Aguarde…
          </div>
        </div>

        <div className="stack stack-10" style={{ marginTop: 6 }}>
          {COLORS.filter((c) => game.players[c]?.active || game.players[c]?.eliminated).map((c) => {
            const p = game.players[c];
            const snap = game.roundSnapshot?.[c];
            const lives = snap?.lives ?? p.lives;
            const isTurn = c === activeTurnColor;
            const canTomato = c !== game.myColor && !p.eliminated;
            return (
              <div
                className="life-row"
                key={c}
                data-color={c}
                data-turn={isTurn ? 1 : undefined}
                data-dead={p.eliminated ? 1 : undefined}
                data-tomatoable={canTomato ? 1 : undefined}
                data-hit={tomato?.target === c ? 1 : undefined}
                style={{ '--cc': CHEX[c] }}
                onClick={canTomato ? (e) => { e.stopPropagation(); setTomatoPop(tomatoPop === c ? null : c); } : undefined}
                title={canTomato ? 'Jogar um tomate 🍅' : undefined}
              >
                {tomatoPop === c && (
                  <div className="tomato-pop" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="tomato-pop-btn"
                      title="Jogar tomate"
                      onClick={() => {
                        actions.throwTomato(c);
                        setTomatoPop(null);
                      }}
                    >
                      🍅
                    </button>
                  </div>
                )}
                <span className="nm">{nameOf(p, c)}</span>
                {p.eliminated ? <span style={{ fontSize: 18 }}>💀</span> : <Hearts n={lives} />}
                {isTurn ? <span className="vez">Vez</span> : canTomato ? <span style={{ fontSize: 14, opacity: 0.45 }}>🍅</span> : null}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 8 }}>
          <div className="section-label">Sua zona</div>
          <ArenaGrid myColor={game.myColor} myPos={myPlayer?.pos} shotCells={game.boardShots} mode="view" />
        </div>
      </div>

      <div className={`overlay ${showLeaveConfirm ? 'show' : ''}`}>
        <div className="overlay-box" style={{ borderColor: 'var(--red)' }}>
          <div className="overlay-title" style={{ color: 'var(--red)' }}>
            Sair da partida?
          </div>
          <div style={{ color: 'var(--ink-2)', fontSize: 13, lineHeight: 1.6 }}>Você vai abandonar a partida atual.</div>
          <button type="button" className="btn btn--danger" onClick={actions.leaveRoom}>
            Sim, sair agora
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => setShowLeaveConfirm(false)}>
            Continuar na partida
          </button>
        </div>
      </div>
    </Screen>
  );
}
