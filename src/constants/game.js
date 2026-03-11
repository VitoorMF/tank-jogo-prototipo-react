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
export const COLS = ['', 'A', 'B', 'C', 'D'];

export const mkPlayers = () => ({
  yellow: { lives: 3, pos: { x: 1, y: 1 }, active: false, eliminated: false },
  red: { lives: 3, pos: { x: 4, y: 1 }, active: false, eliminated: false },
  blue: { lives: 3, pos: { x: 4, y: 4 }, active: false, eliminated: false },
  verde: { lives: 3, pos: { x: 1, y: 4 }, active: false, eliminated: false },
});

export const mkDestroyed = () => ({ yellow: [], red: [], blue: [], verde: [] });

export const hearts = (n) => '❤️'.repeat(Math.max(0, n)) + '🖤'.repeat(Math.max(0, 3 - n));

export const coordLabel = (x, y) => `${COLS[x]}${y}`;

export function clonePlayers(players) {
  return Object.fromEntries(
    Object.entries(players).map(([k, v]) => [k, { ...v, pos: { ...v.pos } }]),
  );
}

export function cloneDestroyed(destroyed) {
  return Object.fromEntries(
    Object.entries(destroyed).map(([k, arr]) => [k, arr.map((cell) => ({ ...cell }))]),
  );
}
