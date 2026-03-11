import React from 'react';

export function ArenaGrid({ myColor, myPos, destroyedCells, mode = 'view', onMove, colorVar }) {
  const rows = [];

  for (let row = 1; row <= 4; row += 1) {
    rows.push(
      <div key={`row-${row}`} className="grid-label-row">
        {row}
      </div>,
    );

    for (let col = 1; col <= 4; col += 1) {
      const isDestroyed = destroyedCells.some((d) => d.x === col && d.y === row);
      const isMe = myPos?.x === col && myPos?.y === row;
      const dx = Math.abs(col - (myPos?.x || 0));
      const dy = Math.abs(row - (myPos?.y || 0));
      const movable =
        mode === 'move' && !isDestroyed && dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0) && typeof onMove === 'function';

      rows.push(
        <button
          key={`cell-${row}-${col}`}
          className={`cell ${isDestroyed ? 'destroyed' : ''} ${isMe ? 'tank' : ''} ${movable ? 'movable' : ''}`}
          style={isMe ? { borderColor: colorVar } : undefined}
          onClick={movable ? () => onMove(col, row) : undefined}
          type="button"
          disabled={!movable}
        />,
      );
    }
  }

  return (
    <div className="grid-wrap">
      <div className="grid-labels-top">
        <div />
        <div className="grid-labels-col">A</div>
        <div className="grid-labels-col">B</div>
        <div className="grid-labels-col">C</div>
        <div className="grid-labels-col">D</div>
      </div>
      <div className="grid-main" data-owner={myColor}>
        {rows}
      </div>
    </div>
  );
}
