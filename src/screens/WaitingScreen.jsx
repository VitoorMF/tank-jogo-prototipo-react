import React, { useState } from 'react';
import { ArenaGrid } from '../components/ArenaGrid';
import { QRScanner } from '../components/QRScanner';
import { hearts } from '../constants/game';

function PlayerStatusRow({ color, player, snapshotPlayer, isActive, NAMES, CVARS }) {
  if (!player?.active && !player?.eliminated) return null;
  const displayLives = snapshotPlayer?.lives ?? player.lives;
  const displayName = player.name || NAMES[color];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px',
      background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
      borderLeft: isActive ? `3px solid ${CVARS[color]}` : '3px solid transparent',
      borderRadius: 4,
    }}>
      <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, color: player.eliminated ? 'var(--muted)' : CVARS[color], minWidth: 70, letterSpacing: 1 }}>
        {displayName}
      </span>
      <span style={{ fontSize: 14, opacity: player.eliminated ? 0.4 : 1 }}>
        {player.eliminated ? '💀' : hearts(displayLives)}
      </span>
      {isActive && <span style={{ fontSize: 10, color: CVARS[color], marginLeft: 'auto', letterSpacing: 1 }}>VEZ</span>}
    </div>
  );
}

export function WaitingScreen({ active, state, actions }) {
  const { game, myPlayer, waitingMsg, CVARS, NAMES, COLORS, activeTurnColor, skillUsedThisRound } = state;
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className={`screen ${active ? 'active' : ''}`}>
      <div className="gap-xl" />
      <div className="waiting-pulse">⏳</div>
      <div className="gap-l" />
      <div className="logo" style={{ fontSize: 20, color: CVARS[activeTurnColor] || 'var(--accent)' }}>
        {waitingMsg}
      </div>
      <div className="gap-s" />
      <div className="muted">Rodada {game.round} · Aguarde...</div>
      <div className="gap-l" />
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {COLORS.map((color) => (
          <PlayerStatusRow
            key={color}
            color={color}
            player={game.players[color]}
            snapshotPlayer={game.roundSnapshot?.[color]}
            isActive={color === activeTurnColor}
            NAMES={NAMES}
            CVARS={CVARS}
          />
        ))}
      </div>
      <div className="gap-l" />
      <div className="section-title" style={{ textAlign: 'center' }}>
        SUA ZONA
      </div>
      <ArenaGrid
        myColor={game.myColor}
        myPos={myPlayer?.pos}
        shotCells={game.boardShots}
        mode="view"
        colorVar={CVARS[game.myColor]}
      />
      {!skillUsedThisRound && (
        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ fontSize: 12, borderColor: 'var(--green)', color: 'var(--green)' }}
            onClick={() => setShowScanner(true)}
          >
            <span>🎴 LER CARTA DE SKILL</span>
          </button>
        </div>
      )}

      {showScanner && (
        <QRScanner
          onScan={(skillId) => {
            setShowScanner(false);
            actions.activateSkill(skillId);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}

      <div className="leave-bottom">
        <button type="button" className="btn-leave" onClick={() => setShowLeaveConfirm(true)}>
          SAIR DA PARTIDA
        </button>
      </div>

      <div className={`overlay ${showLeaveConfirm ? 'show' : ''}`}>
        <div className="overlay-box" style={{ borderColor: 'var(--accent2)' }}>
          <div className="overlay-title" style={{ color: 'var(--accent2)' }}>
            CONFIRMAR SAÍDA
          </div>
          <div className="muted" style={{ textAlign: 'center', lineHeight: 1.7 }}>
            Você vai abandonar a partida atual.
          </div>
          <button type="button" className="btn btn-danger" onClick={actions.leaveRoom}>
            <span>SIM, SAIR AGORA</span>
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setShowLeaveConfirm(false)}>
            <span>CONTINUAR NA PARTIDA</span>
          </button>
        </div>
      </div>
    </div>
  );
}
