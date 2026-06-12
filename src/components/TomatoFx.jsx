import React, { useLayoutEffect, useState } from 'react';
import { NAMES } from '../constants/game';

export function TomatoFx({ tomato, players }) {
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    if (!tomato) {
      setPos(null);
      return;
    }
    // se o card do alvo estiver na tela (espera), faz o tomate cair em cima dele
    const el = document.querySelector(`.life-row[data-color="${tomato.target}"]`);
    if (el) {
      const r = el.getBoundingClientRect();
      setPos({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    } else {
      setPos(null);
    }
  }, [tomato]);

  if (!tomato) return null;
  const targetName = players?.[tomato.target]?.name?.trim() || NAMES[tomato.target] || '';
  const style = pos
    ? { '--tx': `${pos.x}px`, '--ty': `${pos.y - 30}px`, '--sy': `${pos.y}px` }
    : { '--tx': '50%', '--ty': '44vh', '--sy': '47vh' };

  return (
    <div className="tomato-fx" key={tomato.key} style={style}>
      <div className="tomato">🍅</div>

      <svg className="tomato-splat" viewBox="0 0 100 100" aria-hidden="true">
        {/* respingos externos */}
        <g fill="#c0271a">
          <circle cx="19" cy="32" r="4.5" />
          <circle cx="83" cy="27" r="3.6" />
          <circle cx="89" cy="59" r="5" />
          <circle cx="61" cy="90" r="3.6" />
          <circle cx="14" cy="69" r="4" />
          <circle cx="40" cy="15" r="2.8" />
          <circle cx="92" cy="42" r="2.4" />
        </g>
        {/* mancha principal irregular */}
        <path
          fill="#d6301f"
          d="M50 27 Q67 23 71 40 Q85 44 74 58 Q81 75 61 72 Q54 87 42 74 Q26 79 28 60 Q16 53 29 43 Q31 27 50 27 Z"
        />
        {/* miolo mais claro */}
        <path fill="#ff5a43" d="M50 39 Q60 39 59 50 Q59 61 47 59 Q39 58 41 47 Q42 39 50 39 Z" />
        {/* sementes */}
        <g fill="#ffd23f">
          <circle cx="46" cy="48" r="1.7" />
          <circle cx="54" cy="52" r="1.5" />
          <circle cx="50" cy="44" r="1.4" />
          <circle cx="53" cy="46" r="1.2" />
        </g>
      </svg>

      <div className="tomato-label">🍅 {targetName.toUpperCase()} levou um tomate!</div>
    </div>
  );
}
