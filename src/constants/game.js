export const NAMES = {
  yellow: 'AMARELO',
  red: 'VERMELHO',
  blue: 'AZUL',
  verde: 'VERDE',
};

export const CVARS = {
  yellow: 'var(--yellow)',
  red: 'var(--red)',
  blue: 'var(--blue)',
  verde: 'var(--verde)',
};

export const CHEX = {
  yellow: '#f5c842',
  red: '#ff4455',
  blue: '#44aaff',
  verde: '#44ff88',
};

export const EMOJI = {
  yellow: '🟡',
  red: '🔴',
  blue: '🔵',
  verde: '🟢',
};

export const COLORS = ['yellow', 'red', 'blue', 'verde'];
export const BOARD_SIZE = 8;
export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export const COLS = ['', ...LETTERS];

export const COLOR_ZONES = {
  yellow: { minX: 1, maxX: 4, minY: 1, maxY: 4 },
  red: { minX: 1, maxX: 4, minY: 5, maxY: 8 },
  blue: { minX: 5, maxX: 8, minY: 1, maxY: 4 },
  verde: { minX: 5, maxX: 8, minY: 5, maxY: 8 },
};

export const ZONE_LABELS = {
  yellow: 'A1-D4',
  red: 'A5-D8',
  blue: 'E1-H4',
  verde: 'E5-H8',
};

const randInZone = (zone) => ({
  x: zone.minX + Math.floor(Math.random() * (zone.maxX - zone.minX + 1)),
  y: zone.minY + Math.floor(Math.random() * (zone.maxY - zone.minY + 1)),
});

export const SKILLS = {
  repair:      { id: 'repair',      name: 'REPARO',          emoji: '🔧', desc: '+1 vida (máx 3)',                        instant: true  },
  viewLives:   { id: 'viewLives',   name: 'ESPIONAGEM',      emoji: '👁️', desc: 'Ver vidas de todos agora',               instant: true  },
  rebuild:     { id: 'rebuild',     name: 'RECONSTRUIR',     emoji: '🔩', desc: 'Remove último alvo da sua zona',         instant: true  },
  shield:      { id: 'shield',      name: 'ESCUDO',          emoji: '🛡️', desc: 'Absorve próximo tiro recebido',          instant: false },
  jump:        { id: 'jump',        name: 'SALTO',           emoji: '⚡', desc: 'Move para qualquer célula da zona',      instant: false },
  silenceShot: { id: 'silenceShot', name: 'TIRO SILENCIOSO', emoji: '🤫', desc: 'Oculta seu tanque no passo 2',           instant: false },
  doubleShot:  { id: 'doubleShot',  name: 'TIRO DUPLO',      emoji: '🎯', desc: 'Dispara duas coordenadas no seu turno',  instant: false },
};

export const mkPlayers = () => ({
  yellow: { lives: 3, pos: randInZone(COLOR_ZONES.yellow), active: false, eliminated: false, killedBy: null, name: '', activeEffects: {} },
  red:    { lives: 3, pos: randInZone(COLOR_ZONES.red),    active: false, eliminated: false, killedBy: null, name: '', activeEffects: {} },
  blue:   { lives: 3, pos: randInZone(COLOR_ZONES.blue),   active: false, eliminated: false, killedBy: null, name: '', activeEffects: {} },
  verde:  { lives: 3, pos: randInZone(COLOR_ZONES.verde),  active: false, eliminated: false, killedBy: null, name: '', activeEffects: {} },
});

export const mkBoardShots = () => [];

export const hearts = (n) => '❤️'.repeat(Math.max(0, n)) + '🖤'.repeat(Math.max(0, 3 - n));

export const coordLabel = (x, y) => `${COLS[x]}${y}`;

export const coordKey = (x, y) => `${x}-${y}`;

export function parseCoordInput(input) {
  const cleaned = (input || '').toUpperCase().replace(/\s+/g, '');
  const match = cleaned.match(/^([A-H])([1-8])$/);
  if (!match) return null;
  const letter = match[1];
  const y = Number(match[2]);
  const x = LETTERS.indexOf(letter) + 1;
  return { x, y, letter };
}

export function isInsideZone(color, x, y) {
  const zone = COLOR_ZONES[color];
  if (!zone) return false;
  return x >= zone.minX && x <= zone.maxX && y >= zone.minY && y <= zone.maxY;
}

export function mapLegacyZoneCoordToGlobal(color, x, y) {
  const zone = COLOR_ZONES[color];
  if (!zone) return null;
  if (!Number.isInteger(x) || !Number.isInteger(y)) return null;
  if (x < 1 || x > 4 || y < 1 || y > 4) return null;
  return {
    x: zone.minX + (x - 1),
    y: zone.minY + (y - 1),
  };
}

export function migrateLegacyDestroyed(legacyDestroyed) {
  if (!legacyDestroyed || typeof legacyDestroyed !== 'object') return [];

  const all = [];
  COLORS.forEach((color) => {
    const cells = Array.isArray(legacyDestroyed[color]) ? legacyDestroyed[color] : [];
    cells.forEach((cell) => {
      const mapped = mapLegacyZoneCoordToGlobal(color, Number(cell?.x), Number(cell?.y));
      if (mapped) all.push({ x: mapped.x, y: mapped.y, targetColor: color, by: null, round: 0 });
    });
  });

  const seen = new Set();
  return all.filter((shot) => {
    const key = coordKey(shot.x, shot.y);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function clonePlayers(players) {
  return Object.fromEntries(
    Object.entries(players).map(([k, v]) => [k, { ...v, pos: { ...v.pos }, activeEffects: { ...(v.activeEffects || {}) } }]),
  );
}

export function cloneBoardShots(shots) {
  return (Array.isArray(shots) ? shots : []).map((s) => ({ ...s }));
}
