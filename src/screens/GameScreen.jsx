import React, { useState } from 'react';
import { ArenaGrid } from '../components/ArenaGrid';
import { QRScanner } from '../components/QRScanner';
import { Screen, Hud, Stepper, Prompt } from '../components/Shell';
import { IconScan, IconTank, IconTarget, IconBluff } from '../components/Icons';
import { SKILLS, CHEX, LETTERS, isInsideZone } from '../constants/game';

const COLS = LETTERS;
const ROWS = [1, 2, 3, 4, 5, 6, 7, 8];

function ActiveEffects({ myPlayer }) {
  const effects = myPlayer?.activeEffects || {};
  const active = Object.entries(effects).filter(([, v]) => v);
  if (!active.length) return null;
  return (
    <div className="fx-badges">
      {active.map(([id]) => {
        const skill = SKILLS[id];
        if (!skill) return null;
        return (
          <span key={id} className="fx-badge">
            {skill.emoji} {skill.name}
          </span>
        );
      })}
    </div>
  );
}

function SkillLink({ onScan }) {
  return (
    <button type="button" className="btn btn--success btn--sm" onClick={onScan} style={{ marginTop: 4 }}>
      <IconScan size={18} /> Ler carta de skill
    </button>
  );
}

// STEP 1 — choose coordinate
function StepCoord({ state, actions, onScan, skillUsedThisRound }) {
  const { game } = state;
  const ready = game.shotCol && game.shotRow;
  const readout = ready ? `${game.shotCol}${game.shotRow}` : '—';

  // Helpers para conversão e bloqueio de zona (não atirar em si mesmo)
  const colToX = (c) => COLS.indexOf(c) + 1;
  const colDisabled = (c) => !!game.shotRow && isInsideZone(game.myColor, colToX(c), Number(game.shotRow));
  const rowDisabled = (n) => !!game.shotCol && isInsideZone(game.myColor, colToX(game.shotCol), n);

  // Lógica para descobrir o HEX da zona almejada
  let targetColorHex = undefined;
  if (ready) {
    const targetX = colToX(game.shotCol);
    const targetY = Number(game.shotRow);

    // Varre todas as cores registradas em CHEX e descobre a dona dessa célula
    for (const colorKey of Object.keys(CHEX)) {
      if (isInsideZone(colorKey, targetX, targetY)) {
        targetColorHex = CHEX[colorKey];
        break;
      }
    }
  }

  // Estilo dinâmico para o texto do alvo
  const readoutStyle = targetColorHex
    ? { color: targetColorHex, textShadow: `0 0 30px ${targetColorHex}66` }
    : {};

  // Estilo dinâmico para os botões selecionados (linha e coluna)
  const getSegStyle = (isSelected) => {
    if (isSelected && targetColorHex) {
      return {
        borderColor: targetColorHex,
        backgroundColor: targetColorHex,
        color: '#0a0a0a', // Cor escura para dar contraste com o fundo colorido
        boxShadow: `0 0 14px ${targetColorHex}40`
      };
    }
    return {};
  };

  return (
    <div className="stack stack-14 fade-in">
      <Prompt kicker={game.doubleshotFired ? 'Passo 1 · 2ª coordenada' : 'Passo 1 de 3 · Disparo'}>
        {game.doubleshotFired ? (
          <>
            Dispare o <span className="hl">2º tiro</span>
          </>
        ) : (
          <>
            Onde você vai <span className="hl">atirar</span>?
          </>
        )}
      </Prompt>

      <div className="coord-readout">
        <span className="cap">Alvo</span>
        <span
          className={`coord-big ${ready ? '' : 'empty'}`}
          style={readoutStyle}
        >
          {readout}
        </span>
      </div>

      <div className="picker">
        <div className="picker-block">
          <div className="picker-label">
            <span>Coluna</span>
            <span>A – H</span>
          </div>
          <div className="strip cols8">
            {COLS.map((c) => {
              const isSelected = game.shotCol === c;
              return (
                <button
                  type="button"
                  className="seg"
                  key={c}
                  data-on={isSelected ? 1 : undefined}
                  disabled={colDisabled(c)}
                  onClick={() => actions.setShotCol(c)}
                  style={getSegStyle(isSelected)}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
        <div className="picker-block">
          <div className="picker-label">
            <span>Linha</span>
            <span>1 – 8</span>
          </div>
          <div className="strip cols8">
            {ROWS.map((n) => {
              const isSelected = game.shotRow === String(n);
              return (
                <button
                  type="button"
                  className="seg"
                  key={n}
                  data-on={isSelected ? 1 : undefined}
                  disabled={rowDisabled(n)}
                  onClick={() => actions.setShotRow(String(n))}
                  style={getSegStyle(isSelected)}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p style={{ margin: '2px 0 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 12.5, letterSpacing: '.06em', lineHeight: 1.5 }}>
        Escolha a casa que quer bombardear e <b style={{ color: 'var(--ink-2)', fontWeight: 400 }}>anuncie em voz alta</b> para a mesa.
      </p>

      <button type="button" className="btn btn--solid" disabled={!ready} onClick={actions.stageShotFromInput}>
        {ready ? `Atirar em ${readout}` : 'Atirar'}
      </button>
      {!skillUsedThisRound && <SkillLink onScan={onScan} />}
    </div>
  );
}

// STEP 2 — mark on physical board
function StepPlace({ state, actions }) {
  const { game, myPlayer, coordLabel } = state;
  const myEffects = myPlayer?.activeEffects || {};
  const silenced = !!myEffects.silenceShot;
  const tank = myPlayer?.pos ? coordLabel(myPlayer.pos.x, myPlayer.pos.y) : '—';

  return (
    <div className="stack stack-14 fade-in">
      <Prompt kicker="Passo 2 de 3 · Tabuleiro real">
        Marque no <span className="hl">tabuleiro físico</span>
      </Prompt>

      <div className="place-cards">
        <div className="place-card tank">
          <div className="pc-lbl">Seu tanque</div>
          <span className="pc-ico">
            <IconTank size={46} style={{ color: silenced ? 'var(--ink-3)' : 'var(--accent)' }} />
          </span>
          <div className={`pc-coord ${silenced ? 'muted' : ''}`}>{silenced ? '🤫 OCULTO' : tank}</div>
        </div>
        <div className="place-card shot">
          <div className="pc-lbl">Alvo do tiro</div>
          <span className="pc-ico">
            <IconTarget size={42} style={{ color: 'var(--red-2)' }} />
          </span>
          <div className="pc-coord">
            {game.pendingShot ? coordLabel(game.pendingShot.x, game.pendingShot.y) : '—'}
            {game.pendingShot2 ? ` · ${coordLabel(game.pendingShot2.x, game.pendingShot2.y)}` : ''}
          </div>
        </div>
      </div>

      <div className="place-instr">
        <span className="big">
          <IconTarget size={20} style={{ color: 'var(--accent)' }} />
        </span>
        <span>
          Coloque os <b style={{ color: 'var(--ink)', fontWeight: 400 }}>marcadores</b> no tabuleiro de verdade e confira se o tiro acertou alguém.
        </span>
      </div>

      <button type="button" className="btn btn--solid" onClick={actions.proceedToMove}>
        Marquei — continuar
      </button>
    </div>
  );
}

// STEP 3 — move (4x4 zone grid)
function StepMove({ state, actions }) {
  const { game, myPlayer, turnDone, coordLabel, CHEX: chex } = state;
  const jumpMode = !!myPlayer?.activeEffects?.jump && !turnDone;

  if (turnDone) {
    const pos = myPlayer?.pos;
    return (
      <div className="stack stack-14 fade-in">
        <Prompt kicker="Passo 3 de 3 · Concluído">
          Tanque <span className="hl">escondido</span>
        </Prompt>
        <div className="confirm-bar">
          <span>✓ Turno concluído</span>
          <small>Mexa (ou não) sua peça no tabuleiro físico</small>
        </div>
        <button type="button" className="btn btn--success" onClick={actions.advanceTurn}>
          Finalizar turno
        </button>
      </div>
    );
  }

  return (
    <div className="stack stack-14 fade-in">
      <Prompt kicker="Passo 3 de 3 · Esconder">
        Para onde <span className="hl">mover</span>?
      </Prompt>
      <p style={{ margin: '-4px 0 0', textAlign: 'center', color: 'var(--ink-2)', fontSize: 13, lineHeight: 1.45 }}>
        Mova <b style={{ color: 'var(--ink)', fontWeight: 400 }}>1 casa</b> em qualquer direção dentro da sua zona — ou fique parado pra blefar.
        {jumpMode && <b style={{ color: 'var(--accent-2)' }}> ⚡ Salto: qualquer casa da zona.</b>}
      </p>

      <ArenaGrid myColor={game.myColor} myPos={myPlayer?.pos} shotCells={game.boardShots} mode="move" onMove={actions.moveMyTank} jumpMode={jumpMode} />

      <div className="legend">
        <span className="lg-move">
          <i />
          Mover
        </span>
        <span className="lg-stay">
          <i />
          Ficar (blefe)
        </span>
      </div>

      <button type="button" className="btn btn--ghost" onClick={actions.advanceTurn}>
        <IconBluff size={16} /> Ficar aqui (blefe)
      </button>
    </div>
  );
}

export function GameScreen({ active, state, actions }) {
  const { game, timerValue, myPlayer, NAMES, turnDuration, skillUsedThisRound } = state;
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  if (!active) return null;

  const accentHex = CHEX[game.myColor];
  const urgent = timerValue <= 10;
  const playerName = myPlayer?.name?.trim() || NAMES[game.myColor] || '—';
  const timePct = Math.max(0, Math.round((timerValue / turnDuration) * 100));

  return (
    <Screen
      accentHex={accentHex}
      footer={
        <button type="button" className="link-danger" onClick={() => setShowLeaveConfirm(true)}>
          Sair da partida
        </button>
      }
    >
      <Hud name={playerName} round={game.round} time={timerValue} timePct={timePct} urgent={urgent} lives={myPlayer?.lives} />
      <Stepper current={game.currentStep} />

      <ActiveEffects myPlayer={myPlayer} />

      {game.currentStep === 1 && <StepCoord state={state} actions={actions} onScan={() => setShowScanner(true)} skillUsedThisRound={skillUsedThisRound} />}
      {game.currentStep === 2 && <StepPlace state={state} actions={actions} />}
      {game.currentStep === 3 && <StepMove state={state} actions={actions} />}

      {showScanner && (
        <QRScanner
          onScan={(skillId) => {
            setShowScanner(false);
            actions.activateSkill(skillId);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}

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
