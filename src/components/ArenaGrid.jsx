import React, { useMemo } from 'react';
import { BOARD_SIZE, COLOR_ZONES, LETTERS } from '../constants/game';

export function ArenaGrid({ myColor, myPos, shotCells, mode = 'view', onMove, colorVar }) {
  const zone = COLOR_ZONES[myColor];
  const useZoneOnly = !!zone;
  const visibleCols = useMemo(() => {
    if (useZoneOnly) {
      return Array.from({ length: zone.maxX - zone.minX + 1 }, (_, i) => zone.minX + i);
    }
    return Array.from({ length: BOARD_SIZE }, (_, i) => i + 1);
  }, [useZoneOnly, zone]);

  const visibleRows = useMemo(() => {
    if (useZoneOnly) {
      return Array.from({ length: zone.maxY - zone.minY + 1 }, (_, i) => zone.minY + i);
    }
    return Array.from({ length: BOARD_SIZE }, (_, i) => i + 1);
  }, [useZoneOnly, zone]);

  const rows = [];

  visibleRows.forEach((row) => {
    rows.push(
      <div key={`row-${row}`} className="grid-label-row">
        {row}
      </div>,
    );

    visibleCols.forEach((col) => {
      const isShot = shotCells.some((d) => d.x === col && d.y === row);
      const isMe = myPos?.x === col && myPos?.y === row;
      const dx = Math.abs(col - (myPos?.x || 0));
      const dy = Math.abs(row - (myPos?.y || 0));
      const insideMyZone =
        zone && col >= zone.minX && col <= zone.maxX && row >= zone.minY && row <= zone.maxY;
      const movable =
        mode === 'move' &&
        !isShot &&
        dx <= 1 &&
        dy <= 1 &&
        !(dx === 0 && dy === 0) &&
        insideMyZone &&
        typeof onMove === 'function';

      rows.push(
        <button
          key={`cell-${row}-${col}`}
          className={`cell ${isShot ? 'shot' : ''} ${isMe ? 'tank' : ''} ${movable ? 'movable' : ''}`}
          style={isMe ? { borderColor: colorVar } : undefined}
          onClick={movable ? () => onMove(col, row) : undefined}
          type="button"
          disabled={!movable}
        />,
      );
    });
  });

  const gridTemplate = `24px repeat(${visibleCols.length}, 1fr)`;

  return (
    <div className={`grid-wrap board-8x8 ${useZoneOnly ? 'mobile-zone' : 'full-board'}`}>
      <div className="grid-labels-top" style={{ gridTemplateColumns: gridTemplate }}>
        <div />
        {visibleCols.map((col) => (
          <div key={`col-${col}`} className="grid-labels-col">
            {LETTERS[col - 1]}
          </div>
        ))}
      </div>
      <div className="grid-main" data-owner={myColor} style={{ gridTemplateColumns: gridTemplate }}>
        {rows}
      </div>
    </div>
  );
}
