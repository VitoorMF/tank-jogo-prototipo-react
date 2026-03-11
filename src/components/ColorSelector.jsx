import React from 'react';

export function ColorSelector({ selected, players, onSelect }) {
  return (
    <div className="color-grid">
      {[
        { key: 'yellow', emoji: '🟡', label: 'AMARELO' },
        { key: 'red', emoji: '🔴', label: 'VERMELHO' },
        { key: 'blue', emoji: '🔵', label: 'AZUL' },
        { key: 'verde', emoji: '🟢', label: 'VERDE' },
      ].map((c) => {
        const taken = players?.[c.key]?.active && selected !== c.key;
        return (
          <button
            key={c.key}
            type="button"
            className={`color-btn ${selected === c.key ? 'selected' : ''} ${taken ? 'taken' : ''}`}
            data-color={c.key}
            onClick={() => onSelect(c.key)}
            disabled={taken}
          >
            <span>{c.emoji}</span>
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
