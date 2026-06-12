import React from 'react';
import { CHEX, NAMES } from '../constants/game';
import { Dot } from './Shell';

const ORDER = ['yellow', 'red', 'blue', 'verde'];

export function ColorSelector({ selected, players, onSelect }) {
  return (
    <div className="color-grid">
      {ORDER.map((key) => {
        const taken = players?.[key]?.active && selected !== key;
        return (
          <button
            key={key}
            type="button"
            className="color-card"
            data-on={selected === key ? 1 : undefined}
            style={{ '--cc': CHEX[key] }}
            onClick={() => onSelect(key)}
            disabled={taken}
          >
            <Dot color={CHEX[key]} /> {NAMES[key]}
          </button>
        );
      })}
    </div>
  );
}
