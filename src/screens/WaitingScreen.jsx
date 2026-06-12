import React, { useState } from 'react';
import { ArenaGrid } from '../components/ArenaGrid';
import { Screen, Hearts } from '../components/Shell';
import { IconHourglass } from '../components/Icons';
import { CHEX, NAMES } from '../constants/game';

function nameOf(player, color) {
  return player?.name?.trim() ? player.name.toUpperCase() : NAMES[color];
}

export function WaitingScreen({ active, state, actions }) {
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  if (!active) return null;

  const { game, myPlayer, waitingMsg, COLORS, activeTurnColor } = state;
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
        <div className="wait-ring">
          <IconHourglass size={56} style={{ color: 'var(--accent)' }} />
        </div>
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
            return (
              <div className="life-row" key={c} data-turn={isTurn ? 1 : undefined} data-dead={p.eliminated ? 1 : undefined} style={{ '--cc': CHEX[c] }}>
                <span className="nm">{nameOf(p, c)}</span>
                {p.eliminated ? <span style={{ fontSize: 18 }}>💀</span> : <Hearts n={lives} />}
                {isTurn && <span className="vez">Vez</span>}
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
