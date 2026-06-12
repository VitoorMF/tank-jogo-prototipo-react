import React from 'react';
import { IconTarget, IconHeart } from '../components/Icons';

const STEPS = [
  {
    n: '1',
    h: 'Mire e atire',
    p: (
      <>
        No seu turno, escolha uma casa de <b>A1 a H8</b> e anuncie em voz alta. É o tiro que pode acertar o tanque escondido de um adversário.
      </>
    ),
  },
  {
    n: '2',
    h: 'Marque no tabuleiro',
    p: (
      <>
        O app mostra <b>onde está seu tanque</b> e <b>onde caiu o tiro</b>. Coloque os dois marcadores no tabuleiro físico para todos verem.
      </>
    ),
  },
  {
    n: '3',
    h: 'Mova e esconda',
    p: (
      <>
        Mova seu tanque <b>1 casa</b> dentro da sua zona (igual ao rei do xadrez) — ou <b>fique no lugar</b> para blefar. Sua posição real só você vê.
      </>
    ),
  },
];

export function HowTo({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="howto fade-in">
      <div className="howto-head">
        <span className="ht">Como jogar</span>
        <button type="button" className="howto-x" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="howto-body">
        <p className="ht-intro">
          Cada jogador tem um tanque escondido. No seu turno você faz <b style={{ color: 'var(--amber-2)' }}>3 passos</b> — sempre nesta ordem:
        </p>
        {STEPS.map((s) => (
          <div className="ht-card" key={s.n}>
            <div className="n">{s.n}</div>
            <div>
              <h4>{s.h}</h4>
              <p>{s.p}</p>
            </div>
          </div>
        ))}
        <div className="ht-card" style={{ borderLeftColor: 'var(--green)' }}>
          <div className="n" style={{ borderColor: 'var(--green)', color: 'var(--green)', background: 'rgba(62,224,122,.08)' }}>
            <IconTarget size={22} />
          </div>
          <div>
            <h4>Objetivo</h4>
            <p>
              Descubra onde estão os tanques inimigos e acerte os tiros. Quem perde todas as{' '}
              <b style={{ color: 'var(--red-2)' }}>
                vidas <IconHeart size={14} color="var(--red)" style={{ display: 'inline-block', verticalAlign: '-2px' }} />
              </b>{' '}
              sai. O último tanque de pé vence.
            </p>
          </div>
        </div>
        <div className="ht-card" style={{ borderLeftColor: 'var(--accent)' }}>
          <div className="n">🎴</div>
          <div>
            <h4>Habilidades</h4>
            <p>
              No <b>passo 1</b>, escaneie uma carta de skill para usar poderes — escudo, reparo, tiro duplo, míssil e mais. <b>1 por rodada</b>.
            </p>
          </div>
        </div>
        <button type="button" className="btn btn--primary" style={{ marginTop: 6, marginBottom: 6 }} onClick={onClose}>
          Entendi, bora jogar
        </button>
      </div>
    </div>
  );
}
