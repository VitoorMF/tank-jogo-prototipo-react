import React, { useMemo } from 'react';
import { BOARD_SIZE, COLOR_ZONES, LETTERS } from '../constants/game';
import { IconTank, IconTarget } from './Icons';

export function ArenaGrid({ myColor, myPos, shotCells, mode = 'view', onMove, jumpMode = false }) {
  const zone = COLOR_ZONES[myColor];
  const useZoneOnly = !!zone;

  const cols = useMemo(() => {
    if (useZoneOnly) return Array.from({ length: zone.maxX - zone.minX + 1 }, (_, i) => zone.minX + i);
    return Array.from({ length: BOARD_SIZE }, (_, i) => i + 1);
  }, [useZoneOnly, zone]);

  const rows = useMemo(() => {
    if (useZoneOnly) return Array.from({ length: zone.maxY - zone.minY + 1 }, (_, i) => zone.minY + i);
    return Array.from({ length: BOARD_SIZE }, (_, i) => i + 1);
  }, [useZoneOnly, zone]);

  const tmpl = `26px repeat(${cols.length}, 1fr)`;

  return (
    <div className="zone">
      <div className="zone-axis-x" style={{ gridTemplateColumns: tmpl }}>
        <span />
        {cols.map((c) => (
          <span key={`col-${c}`}>{LETTERS[c - 1]}</span>
        ))}
      </div>
      <div className="zone-grid">
        {rows.map((row) => (
          <div className="zone-row" key={`row-${row}`} style={{ gridTemplateColumns: tmpl }}>
            <span className="zone-rowlabel">{row}</span>
            {cols.map((col) => {
              const isShot = shotCells.some((d) => d.x === col && d.y === row);
              const isMe = myPos?.x === col && myPos?.y === row;
              const dx = Math.abs(col - (myPos?.x || 0));
              const dy = Math.abs(row - (myPos?.y || 0));
              const insideMyZone = zone && col >= zone.minX && col <= zone.maxX && row >= zone.minY && row <= zone.maxY;
              const adjacentOrJump = jumpMode ? true : dx <= 1 && dy <= 1;
              const movable =
                mode === 'move' && !isShot && adjacentOrJump && !(dx === 0 && dy === 0) && insideMyZone && typeof onMove === 'function';

              return (
                <div
                  className="zone-cell"
                  key={`cell-${row}-${col}`}
                  data-here={isMe ? 1 : undefined}
                  data-hit={isShot ? 1 : undefined}
                  data-move={movable ? 1 : undefined}
                  onClick={movable ? () => onMove(col, row) : undefined}
                >
                  {isMe && (
                    <span className="tank">
                      <IconTank size={24} style={{ color: 'var(--accent)' }} />
                    </span>
                  )}
                  {!isMe && isShot && (
                    <span className="shotmark">
                      <IconTarget size={14} />
                    </span>
                  )}
                  {!isMe && !isShot && movable && <span className="plus">＋</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
