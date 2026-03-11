import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CHEX,
  COLORS,
  CVARS,
  EMOJI,
  NAMES,
  cloneBoardShots,
  clonePlayers,
  coordKey,
  coordLabel,
  hearts,
  migrateLegacyDestroyed,
  mkBoardShots,
  mkPlayers,
  parseCoordInput,
} from '../constants/game';
import { db } from '../services/supabase';

const SESSION_KEY = 'tb_session';
const TURN_DURATION_SECONDS = 90;

const initialGame = {
  myColor: null,
  roomCode: null,
  isHost: false,
  players: mkPlayers(),
  boardShots: mkBoardShots(),
  round: 1,
  turnOrder: [],
  currentTurnIdx: 0,
  gameStarted: false,
  gameOver: false,
  winner: null,
  currentStep: 0,
  pendingShot: null,
  shotCol: '',
  shotRow: '',
  myShots: 0,
};

function normalizeSharedState(state) {
  const players = state?.players || mkPlayers();
  const boardShots = Array.isArray(state?.boardShots)
    ? cloneBoardShots(state.boardShots)
    : migrateLegacyDestroyed(state?.destroyed);

  return {
    players,
    boardShots,
    round: state?.round || 1,
    turnOrder: state?.turnOrder || [],
    currentTurnIdx: state?.currentTurnIdx || 0,
    gameStarted: state?.gameStarted || false,
    gameOver: state?.gameOver || false,
    winner: state?.winner || null,
  };
}

export function useTankBattle() {
  const [game, setGame] = useState(initialGame);
  const [screen, setScreen] = useState('home');
  const [joinCode, setJoinCode] = useState('');
  const [timerValue, setTimerValue] = useState(TURN_DURATION_SECONDS);
  const [notif, setNotif] = useState({ show: false, msg: '', type: 'info' });
  const [online, setOnline] = useState(false);
  const [overlays, setOverlays] = useState({ shot: false, hit: false, elim: false });
  const [turnDone, setTurnDone] = useState(false);

  const gameRef = useRef(game);
  const timerRef = useRef(null);
  const channelRef = useRef(null);
  const prevLivesRef = useRef(3);
  const wasElimRef = useRef(false);
  const intentionalLeaveRef = useRef(false);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  const showNotif = useCallback((msg, type = 'info') => {
    setNotif({ show: true, msg, type });
    window.clearTimeout(showNotif._timer);
    showNotif._timer = window.setTimeout(() => {
      setNotif((n) => ({ ...n, show: false }));
    }, 2600);
  }, []);

  const setScreenSafely = useCallback((next) => {
    setScreen(next);
    window.scrollTo(0, 0);
  }, []);

  const saveSession = useCallback(() => {
    const g = gameRef.current;
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        myColor: g.myColor,
        roomCode: g.roomCode,
        isHost: g.isHost,
      }),
    );
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const loadSession = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch {
      return null;
    }
  }, []);

  const shared = useCallback((g = gameRef.current) => {
    return {
      players: g.players,
      boardShots: g.boardShots,
      round: g.round,
      turnOrder: g.turnOrder,
      currentTurnIdx: g.currentTurnIdx,
      gameStarted: g.gameStarted,
      gameOver: g.gameOver,
      winner: g.winner,
    };
  }, []);

  const applyShared = useCallback((state) => {
    const parsed = normalizeSharedState(state);
    setGame((prev) => ({ ...prev, ...parsed }));
  }, []);

  const push = useCallback(
    async (nextGame = null) => {
      const g = nextGame || gameRef.current;
      if (!g.roomCode) return;
      const { error } = await db.from('rooms').update({ state: shared(g) }).eq('code', g.roomCode);
      if (error) console.error('push error', error);
    },
    [shared],
  );

  const renderLobby = useCallback(() => {
    setScreenSafely('lobby');
  }, [setScreenSafely]);

  const currentPlayer = useCallback((g = gameRef.current) => {
    if (!g.turnOrder.length) return null;
    return g.turnOrder[g.currentTurnIdx % g.turnOrder.length] || null;
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const advanceTurn = useCallback(async () => {
    stopTimer();
    setTurnDone(false);

    const g = gameRef.current;
    const nextPlayers = clonePlayers(g.players);
    const nextTurnOrder = [...g.turnOrder];
    const nextIdx = g.currentTurnIdx + 1;
    const nextRound = nextTurnOrder.length && nextIdx % nextTurnOrder.length === 0 ? g.round + 1 : g.round;

    const alive = nextTurnOrder.filter((c) => !nextPlayers[c].eliminated);
    const nextGame = {
      ...g,
      players: nextPlayers,
      turnOrder: nextTurnOrder,
      currentTurnIdx: nextIdx,
      round: nextRound,
      currentStep: 0,
      pendingShot: null,
      shotCol: '',
      shotRow: '',
      gameOver: alive.length <= 1,
      winner: alive.length <= 1 ? alive[0] || null : null,
    };

    setGame(nextGame);
    await push(nextGame);
  }, [push, stopTimer]);

  const tickTimer = useCallback((nextValue) => {
    setTimerValue(nextValue);
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    let value = TURN_DURATION_SECONDS;
    tickTimer(value);

    timerRef.current = window.setInterval(() => {
      value -= 1;
      tickTimer(value);

      if (value <= 0) {
        stopTimer();
        showNotif('⏰ TEMPO ESGOTADO!', 'miss');
        advanceTurn();
      }
    }, 1000);
  }, [advanceTurn, showNotif, stopTimer, tickTimer]);

  const startMyTurn = useCallback(() => {
    const g = gameRef.current;
    prevLivesRef.current = g.players[g.myColor]?.lives || 3;

    setTurnDone(false);
    setGame((prev) => ({
      ...prev,
      currentStep: 1,
      pendingShot: null,
      shotCol: '',
      shotRow: '',
    }));

    setScreenSafely('game');
    startTimer();
  }, [setScreenSafely, startTimer]);

  const showWaiting = useCallback(() => {
    stopTimer();
    setScreenSafely('waiting');
  }, [setScreenSafely, stopTimer]);

  const reactToState = useCallback(() => {
    const g = gameRef.current;

    if (g.gameOver) {
      stopTimer();
      setScreenSafely('end');
      return;
    }

    if (!g.gameStarted) return;

    const myPlayer = g.players[g.myColor];
    if (!myPlayer) return;

    if (myPlayer.eliminated && !wasElimRef.current) {
      wasElimRef.current = true;
      setOverlays((o) => ({ ...o, elim: true }));
      return;
    }

    if (myPlayer.lives < prevLivesRef.current && !myPlayer.eliminated) {
      setOverlays((o) => ({ ...o, hit: true }));
    }
    prevLivesRef.current = myPlayer.lives;

    if (currentPlayer() === g.myColor) {
      if (g.currentStep === 0) startMyTurn();
      else setScreenSafely('game');
    } else {
      showWaiting();
    }
  }, [currentPlayer, setScreenSafely, showWaiting, startMyTurn, stopTimer]);

  const subscribe = useCallback(
    (roomCode) => {
      if (channelRef.current) db.removeChannel(channelRef.current);

      channelRef.current = db
        .channel(`room:${roomCode}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `code=eq.${roomCode}` },
          (payload) => {
            applyShared(payload.new.state);
          },
        )
        .subscribe((status) => {
          setOnline(status === 'SUBSCRIBED');
        });
    },
    [applyShared],
  );

  useEffect(() => {
    reactToState();
  }, [
    game.players,
    game.boardShots,
    game.round,
    game.currentTurnIdx,
    game.gameStarted,
    game.gameOver,
    game.winner,
    game.currentStep,
    reactToState,
  ]);

  const selectColor = useCallback((color) => {
    setGame((prev) => ({ ...prev, myColor: color }));
  }, []);

  const createRoom = useCallback(async () => {
    const g = gameRef.current;
    if (!g.myColor) {
      showNotif('Escolha uma cor!', 'miss');
      return;
    }

    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const players = mkPlayers();
    players[g.myColor].active = true;

    const nextGame = {
      ...g,
      roomCode,
      isHost: true,
      players,
      boardShots: mkBoardShots(),
      gameStarted: false,
      gameOver: false,
      winner: null,
      round: 1,
      turnOrder: [],
      currentTurnIdx: 0,
      currentStep: 0,
      pendingShot: null,
      shotCol: '',
      shotRow: '',
      myShots: 0,
    };

    const { error } = await db.from('rooms').insert({ code: roomCode, state: shared(nextGame) });
    if (error) {
      showNotif('Erro ao criar sala!', 'miss');
      console.error(error);
      return;
    }

    setGame(nextGame);
    prevLivesRef.current = 3;
    saveSession();
    subscribe(roomCode);
    renderLobby();
    showNotif('SALA CRIADA! 🎮', 'info');
  }, [renderLobby, saveSession, shared, showNotif, subscribe]);

  const joinRoom = useCallback(async () => {
    const g = gameRef.current;
    if (!g.myColor) {
      showNotif('Escolha uma cor!', 'miss');
      return;
    }

    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) {
      showNotif('Código inválido!', 'miss');
      return;
    }

    const { data, error } = await db.from('rooms').select('*').eq('code', code).single();
    if (error || !data) {
      showNotif('SALA NÃO ENCONTRADA!', 'miss');
      return;
    }

    const st = data.state;
    if (st.players[g.myColor].active) {
      showNotif('COR JÁ OCUPADA!', 'miss');
      setGame((prev) => ({ ...prev, myColor: null }));
      return;
    }

    const parsed = normalizeSharedState(st);
    const players = clonePlayers(parsed.players);
    players[g.myColor].active = true;

    const nextGame = {
      ...g,
      ...parsed,
      roomCode: code,
      isHost: false,
      players,
      currentStep: 0,
      pendingShot: null,
      shotCol: '',
      shotRow: '',
      myShots: 0,
    };

    setGame(nextGame);
    await push(nextGame);
    prevLivesRef.current = nextGame.players[nextGame.myColor].lives;
    saveSession();
    subscribe(code);
    renderLobby();
    showNotif('ENTROU NA SALA! ✅', 'info');
  }, [joinCode, push, renderLobby, saveSession, showNotif, subscribe]);

  const leaveRoom = useCallback(async () => {
    intentionalLeaveRef.current = true;
    clearSession();
    stopTimer();

    const g = gameRef.current;

    if (channelRef.current) {
      db.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (g.roomCode && g.myColor) {
      const nextPlayers = clonePlayers(g.players);
      if (nextPlayers[g.myColor]) nextPlayers[g.myColor].active = false;
      const nextGame = { ...g, players: nextPlayers };
      await push(nextGame);
    }

    setGame(initialGame);
    setScreen('home');
    setJoinCode('');
    setTimerValue(TURN_DURATION_SECONDS);
    setOverlays({ shot: false, hit: false, elim: false });
    setTurnDone(false);
  }, [clearSession, push, stopTimer]);

  const startGame = useCallback(async () => {
    const g = gameRef.current;
    const turnOrder = COLORS.filter((c) => g.players[c].active);
    const players = clonePlayers(g.players);

    const nextGame = {
      ...g,
      players,
      turnOrder,
      currentTurnIdx: 0,
      gameStarted: true,
      gameOver: false,
      winner: null,
      round: 1,
      currentStep: 0,
      pendingShot: null,
      shotCol: '',
      shotRow: '',
    };

    setGame(nextGame);
    await push(nextGame);
  }, [push]);

  const setShotCol = useCallback((value) => {
    const next = (value || '').toUpperCase().replace(/[^A-H]/g, '').slice(0, 1);
    setGame((prev) => ({ ...prev, shotCol: next }));
  }, []);

  const setShotRow = useCallback((value) => {
    const next = (value || '').replace(/[^1-8]/g, '').slice(0, 1);
    setGame((prev) => ({ ...prev, shotRow: next }));
  }, []);

  const stageShotFromInput = useCallback(() => {
    const g = gameRef.current;

    const parsed = parseCoordInput(`${g.shotCol}${g.shotRow}`);
    if (!parsed) {
      showNotif('Coordenada inválida. Use A-H e 1-8.', 'miss');
      return;
    }

    const key = coordKey(parsed.x, parsed.y);
    const alreadyShot = g.boardShots.some((shot) => coordKey(shot.x, shot.y) === key);
    if (alreadyShot) {
      showNotif('Essa coordenada já recebeu alvo.', 'miss');
      return;
    }

    setGame((prev) => ({
      ...prev,
      pendingShot: { x: parsed.x, y: parsed.y },
      currentStep: 2,
    }));
    setOverlays((o) => ({ ...o, shot: true }));
  }, [showNotif]);

  const applyHit = useCallback(
    (color, players, turnOrder) => {
      const p = players[color];
      if (!p) return { players, turnOrder };

      p.lives -= 1;
      if (p.lives <= 0) {
        p.lives = 0;
        p.eliminated = true;
        showNotif(`💀 ${NAMES[color]} ELIMINADO!`, 'info');
        return { players, turnOrder: turnOrder.filter((x) => x !== color) };
      }

      return { players, turnOrder };
    },
    [showNotif],
  );

  const confirmShot = useCallback(async () => {
    setOverlays((o) => ({ ...o, shot: false }));

    const g = gameRef.current;
    if (!g.pendingShot) return;

    const { x, y } = g.pendingShot;
    const players = clonePlayers(g.players);
    const boardShots = cloneBoardShots(g.boardShots);
    let turnOrder = [...g.turnOrder];

    const alreadyShot = boardShots.some((shot) => shot.x === x && shot.y === y);
    if (alreadyShot) {
      showNotif('Essa coordenada já recebeu alvo.', 'miss');
      setGame((prev) => ({ ...prev, currentStep: 1, pendingShot: null }));
      return;
    }

    const hitColor = turnOrder.find((playerColor) => {
      if (playerColor === g.myColor) return false;
      const p = players[playerColor];
      return p && !p.eliminated && p.pos?.x === x && p.pos?.y === y;
    });

    if (hitColor) {
      const hitResult = applyHit(hitColor, players, turnOrder);
      turnOrder = hitResult.turnOrder;
    }

    boardShots.push({
      x,
      y,
      by: g.myColor,
      targetColor: hitColor || null,
      round: g.round,
    });

    const nextGame = {
      ...g,
      players,
      boardShots,
      turnOrder,
      myShots: g.myShots + 1,
      pendingShot: { x, y },
      currentStep: 3,
    };

    setGame(nextGame);
    await push(nextGame);
  }, [applyHit, push, showNotif]);

  const cancelShot = useCallback(() => {
    setOverlays((o) => ({ ...o, shot: false }));
    setGame((prev) => ({ ...prev, pendingShot: null, currentStep: 1 }));
  }, []);

  const proceedToStep4 = useCallback(() => {
    setGame((prev) => ({ ...prev, currentStep: 4 }));
  }, []);

  const moveMyTank = useCallback(
    (x, y) => {
      if (turnDone) return;
      setGame((prev) => {
        const players = clonePlayers(prev.players);
        players[prev.myColor].pos = { x, y };
        return { ...prev, players };
      });
      stopTimer();
      setTurnDone(true);
    },
    [stopTimer, turnDone],
  );

  const dismissHit = useCallback(() => {
    setOverlays((o) => ({ ...o, hit: false }));
  }, []);

  const confirmElimination = useCallback(async () => {
    setOverlays((o) => ({ ...o, elim: false }));

    const g = gameRef.current;
    const players = clonePlayers(g.players);
    players[g.myColor].eliminated = true;
    players[g.myColor].lives = 0;

    const turnOrder = g.turnOrder.filter((c) => c !== g.myColor);
    const alive = turnOrder.filter((c) => !players[c].eliminated);

    const nextGame = {
      ...g,
      players,
      turnOrder,
      gameOver: alive.length <= 1,
      winner: alive.length <= 1 ? alive[0] || null : null,
    };

    setGame(nextGame);
    await push(nextGame);
  }, [push]);

  useEffect(() => {
    const init = async () => {
      const { error } = await db.from('rooms').select('id').limit(1);
      setOnline(!error);
      if (error) {
        showNotif('⚠ Rode o SQL no Supabase primeiro', 'miss');
        return;
      }

      const sess = loadSession();
      if (!sess) return;

      const { data, error: err2 } = await db.from('rooms').select('*').eq('code', sess.roomCode).single();
      if (err2 || !data) {
        clearSession();
        return;
      }

      const st = data.state;
      if (st.gameOver) {
        clearSession();
        return;
      }

      const wasEverActive = st.players[sess.myColor]?.active || (st.turnOrder || []).includes(sess.myColor);
      if (!wasEverActive) {
        clearSession();
        return;
      }

      const parsed = normalizeSharedState(st);
      const players = clonePlayers(parsed.players);
      players[sess.myColor].active = true;

      await db
        .from('rooms')
        .update({
          state: {
            ...st,
            players,
            boardShots: parsed.boardShots,
          },
        })
        .eq('code', sess.roomCode);

      const nextGame = {
        ...initialGame,
        ...parsed,
        myColor: sess.myColor,
        roomCode: sess.roomCode,
        isHost: sess.isHost,
        players,
      };

      prevLivesRef.current = nextGame.players[sess.myColor].lives;
      setGame(nextGame);
      subscribe(sess.roomCode);
      showNotif('RECONECTADO! ✅', 'info');

      if (!nextGame.gameStarted) {
        setScreen('lobby');
      }
    };

    init();

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && gameRef.current.roomCode && !intentionalLeaveRef.current) {
        if (channelRef.current && channelRef.current.state !== 'joined') {
          subscribe(gameRef.current.roomCode);
        }
      }
    };

    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', onVisibility);
      if (channelRef.current) db.removeChannel(channelRef.current);
    };
  }, [clearSession, loadSession, showNotif, stopTimer, subscribe]);

  const playersReadyCount = useMemo(() => COLORS.filter((c) => game.players[c]?.active).length, [game.players]);

  const canStart = playersReadyCount >= 2 && game.isHost;
  const myPlayer = game.myColor ? game.players[game.myColor] : null;
  const activeTurnColor = currentPlayer(game);

  const waitingMsg = activeTurnColor ? `VEZ DO ${NAMES[activeTurnColor]}` : 'AGUARDANDO...';

  const endStats = useMemo(() => {
    return {
      rounds: game.round,
      shots: game.myShots,
      destroyed: game.boardShots.length,
      lives: myPlayer?.lives || 0,
    };
  }, [game.boardShots.length, game.myShots, game.round, myPlayer?.lives]);

  const turnBadge =
    activeTurnColor === game.myColor
      ? { text: '⚔️ SUA VEZ', color: CVARS[game.myColor] }
      : { text: `VEZ: ${NAMES[activeTurnColor] || '—'}`, color: CVARS[activeTurnColor] || 'var(--text)' };

  return {
    state: {
      game,
      screen,
      joinCode,
      timerValue,
      notif,
      online,
      overlays,
      turnDone,
      canStart,
      playersReadyCount,
      myPlayer,
      activeTurnColor,
      waitingMsg,
      endStats,
      turnBadge,
      hearts: myPlayer ? hearts(myPlayer.lives) : '❤️❤️❤️',
      coordLabel,
      turnDuration: TURN_DURATION_SECONDS,
      NAMES,
      CVARS,
      CHEX,
      EMOJI,
      COLORS,
    },
    actions: {
      setScreen: setScreenSafely,
      setJoinCode,
      selectColor,
      createRoom,
      joinRoom,
      leaveRoom,
      startGame,
      setShotCol,
      setShotRow,
      stageShotFromInput,
      confirmShot,
      cancelShot,
      proceedToStep4,
      moveMyTank,
      dismissHit,
      confirmElimination,
      advanceTurn,
      clearSession,
    },
  };
}
