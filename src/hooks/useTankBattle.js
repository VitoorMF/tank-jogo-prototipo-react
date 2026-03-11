import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CHEX,
  COLORS,
  CVARS,
  EMOJI,
  NAMES,
  cloneDestroyed,
  clonePlayers,
  coordLabel,
  hearts,
  mkDestroyed,
  mkPlayers,
} from '../constants/game';
import { db } from '../services/supabase';

const SESSION_KEY = 'tb_session';

const initialGame = {
  myColor: null,
  roomCode: null,
  isHost: false,
  players: mkPlayers(),
  destroyed: mkDestroyed(),
  round: 1,
  turnOrder: [],
  currentTurnIdx: 0,
  gameStarted: false,
  gameOver: false,
  winner: null,
  currentStep: 0,
  shotTarget: null,
  pendingShot: null,
  myShots: 0,
};

export function useTankBattle() {
  const [game, setGame] = useState(initialGame);
  const [screen, setScreen] = useState('home');
  const [joinCode, setJoinCode] = useState('');
  const [timerValue, setTimerValue] = useState(60);
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
      destroyed: g.destroyed,
      round: g.round,
      turnOrder: g.turnOrder,
      currentTurnIdx: g.currentTurnIdx,
      gameStarted: g.gameStarted,
      gameOver: g.gameOver,
      winner: g.winner,
    };
  }, []);

  const applyShared = useCallback((state) => {
    setGame((prev) => ({
      ...prev,
      players: state.players,
      destroyed: state.destroyed || mkDestroyed(),
      round: state.round || 1,
      turnOrder: state.turnOrder || [],
      currentTurnIdx: state.currentTurnIdx || 0,
      gameStarted: state.gameStarted || false,
      gameOver: state.gameOver || false,
      winner: state.winner || null,
    }));
  }, []);

  const push = useCallback(async (nextGame = null) => {
    const g = nextGame || gameRef.current;
    if (!g.roomCode) return;
    const { error } = await db.from('rooms').update({ state: shared(g) }).eq('code', g.roomCode);
    if (error) console.error('push error', error);
  }, [shared]);

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
    let nextTurnOrder = [...g.turnOrder];
    let nextIdx = g.currentTurnIdx + 1;
    let nextRound = g.round;

    if (nextTurnOrder.length && nextIdx % nextTurnOrder.length === 0) {
      nextRound += 1;
      nextTurnOrder.forEach((c) => {
        if (!nextPlayers[c].eliminated) nextPlayers[c].hasShield = true;
      });
    }

    const alive = nextTurnOrder.filter((c) => !nextPlayers[c].eliminated);
    const nextGame = {
      ...g,
      players: nextPlayers,
      turnOrder: nextTurnOrder,
      currentTurnIdx: nextIdx,
      round: nextRound,
      currentStep: 0,
      shotTarget: null,
      pendingShot: null,
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
    let value = 30;
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
      shotTarget: null,
      pendingShot: null,
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

    if (!g.gameStarted) {
      // renderLobby();
      return;
    }



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
  }, [currentPlayer, renderLobby, setScreenSafely, showWaiting, startMyTurn, stopTimer]);

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
    game.destroyed,
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
      destroyed: mkDestroyed(),
      gameStarted: false,
      gameOver: false,
      winner: null,
      round: 1,
      turnOrder: [],
      currentTurnIdx: 0,
      currentStep: 0,
      pendingShot: null,
      shotTarget: null,
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

    const players = clonePlayers(st.players);
    players[g.myColor].active = true;

    const nextGame = {
      ...g,
      roomCode: code,
      isHost: false,
      players,
      destroyed: st.destroyed || mkDestroyed(),
      round: st.round || 1,
      turnOrder: st.turnOrder || [],
      currentTurnIdx: st.currentTurnIdx || 0,
      gameStarted: st.gameStarted || false,
      gameOver: st.gameOver || false,
      winner: st.winner || null,
      currentStep: 0,
      shotTarget: null,
      pendingShot: null,
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
    setTimerValue(30);
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
    };

    setGame(nextGame);
    await push(nextGame);
  }, [push]);

  const selectTarget = useCallback((color) => {
    setGame((prev) => ({ ...prev, shotTarget: color, currentStep: 2 }));
  }, []);

  const backToStep1 = useCallback(() => {
    setGame((prev) => ({ ...prev, shotTarget: null, pendingShot: null, currentStep: 1 }));
  }, []);

  const selectShotCell = useCallback((x, y) => {
    setGame((prev) => ({
      ...prev,
      pendingShot: { color: prev.shotTarget, x, y },
    }));
    setOverlays((o) => ({ ...o, shot: true }));
  }, []);

  const applyHit = useCallback(
    (color, players, turnOrder) => {
      const p = players[color];
      if (!p) return { players, turnOrder };

      // if (p.hasShield) {
      //   p.hasShield = false;
      //   showNotif(`🛡 ESCUDO BLOQUEOU ${NAMES[color]}!`, 'info');
      //   return { players, turnOrder };
      // }

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

    const { color, x, y } = g.pendingShot;
    const players = clonePlayers(g.players);
    const destroyed = cloneDestroyed(g.destroyed);
    let turnOrder = [...g.turnOrder];

    const targetPos = players[color].pos;
    if (targetPos.x === x && targetPos.y === y) {
      const hitResult = applyHit(color, players, turnOrder);
      turnOrder = hitResult.turnOrder;
    }

    if (!destroyed[color]) destroyed[color] = [];
    if (!destroyed[color].some((d) => d.x === x && d.y === y)) {
      destroyed[color].push({ x, y });
    }

    const nextGame = {
      ...g,
      players,
      destroyed,
      turnOrder,
      myShots: g.myShots + 1,
      currentStep: 3,
    };

    setGame(nextGame);
    await push(nextGame);
  }, [applyHit, push]);

  const cancelShot = useCallback(() => {
    setOverlays((o) => ({ ...o, shot: false }));
    setGame((prev) => ({ ...prev, pendingShot: null }));
  }, []);

  const proceedToStep4 = useCallback(() => {
    setGame((prev) => ({ ...prev, currentStep: 4 }));
  }, []);

  const moveMyTank = useCallback((x, y) => {
    setGame((prev) => {
      const players = clonePlayers(prev.players);
      players[prev.myColor].pos = { x, y };
      return { ...prev, players };
    });
    stopTimer();
    setTurnDone(true);
  }, [stopTimer]);

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

      const wasEverActive =
        st.players[sess.myColor]?.active ||
        (st.turnOrder || []).includes(sess.myColor);
      if (!wasEverActive) {
        clearSession();
        return;
      }

      const players = clonePlayers(st.players);
      players[sess.myColor].active = true;

      await db
        .from('rooms')
        .update({
          state: {
            ...st,
            players,
          },
        })
        .eq('code', sess.roomCode);

      const nextGame = {
        ...initialGame,
        ...st,
        myColor: sess.myColor,
        roomCode: sess.roomCode,
        isHost: sess.isHost,
        players,
        destroyed: st.destroyed || mkDestroyed(),
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

  const playersReadyCount = useMemo(
    () => COLORS.filter((c) => game.players[c]?.active).length,
    [game.players],
  );

  const canStart = playersReadyCount >= 2 && game.isHost;
  const myPlayer = game.myColor ? game.players[game.myColor] : null;
  const activeTurnColor = currentPlayer(game);

  const waitingMsg = activeTurnColor ? `VEZ DO ${NAMES[activeTurnColor]}` : 'AGUARDANDO...';

  const endStats = useMemo(() => {
    const totalDestroyed = Object.values(game.destroyed).reduce((acc, arr) => acc + arr.length, 0);
    return {
      rounds: game.round,
      shots: game.myShots,
      destroyed: totalDestroyed,
      lives: myPlayer?.lives || 0,
    };
  }, [game.destroyed, game.myShots, game.round, myPlayer?.lives]);

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
      selectTarget,
      backToStep1,
      selectShotCell,
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
