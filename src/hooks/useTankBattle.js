import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CHEX,
  COLORS,
  CVARS,
  EMOJI,
  NAMES,
  SKILLS,
  cloneBoardShots,
  clonePlayers,
  coordKey,
  coordLabel,
  hearts,
  isInsideZone,
  migrateLegacyDestroyed,
  mkBoardShots,
  mkPlayers,
  parseCoordInput,
} from '../constants/game';
import { db } from '../services/supabase';

const SESSION_KEY = 'tb_session';
const NAME_KEY = 'tb_player_name';
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
  pendingShot2: null,
  doubleshotFired: false,
  shotCol: '',
  shotRow: '',
  myShots: 0,
  roundSnapshot: null,
  eliminationOrder: [],
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
    roundSnapshot: state?.roundSnapshot || null,
    eliminationOrder: state?.eliminationOrder || [],
  };
}

export function useTankBattle() {
  const [game, setGame] = useState(initialGame);
  const [screen, setScreen] = useState('home');
  const [joinCode, setJoinCode] = useState('');
  const [myName, setMyNameState] = useState(() => localStorage.getItem(NAME_KEY) || '');
  const [timerValue, setTimerValue] = useState(TURN_DURATION_SECONDS);
  const [notif, setNotif] = useState({ show: false, msg: '', type: 'info' });
  const [online, setOnline] = useState(false);
  const [overlays, setOverlays] = useState({ hit: false, elim: false, elimAnnounce: null, viewLives: false, skillActivated: null });
  const [skillUsedThisRound, setSkillUsedThisRound] = useState(false);
  const [turnDone, setTurnDone] = useState(false);

  const gameRef = useRef(game);
  const timerRef = useRef(null);
  const channelRef = useRef(null);
  const prevLivesRef = useRef(3);
  const wasElimRef = useRef(false);
  const prevEliminatedRef = useRef(new Set());
  const intentionalLeaveRef = useRef(false);
  const pendingSkillRef = useRef(new URLSearchParams(window.location.search).get('skill') || null);

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
      roundSnapshot: g.roundSnapshot,
      eliminationOrder: g.eliminationOrder,
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
      roundSnapshot: nextRound > g.round ? clonePlayers(nextPlayers) : g.roundSnapshot,
      currentStep: 0,
      pendingShot: null,
      pendingShot2: null,
      doubleshotFired: false,
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

    setSkillUsedThisRound(false);
    setTurnDone(false);
    setGame((prev) => ({
      ...prev,
      currentStep: 1,
      pendingShot: null,
      pendingShot2: null,
      doubleshotFired: false,
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

    COLORS.forEach((color) => {
      if (color === g.myColor) return;
      if (g.players[color]?.eliminated && !prevEliminatedRef.current.has(color)) {
        prevEliminatedRef.current.add(color);
        setOverlays((o) => ({ ...o, elimAnnounce: color }));
      }
    });

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
    } else if (g.currentStep === 0) {
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

  const setMyName = useCallback((value) => {
    const trimmed = value.slice(0, 16);
    setMyNameState(trimmed);
    localStorage.setItem(NAME_KEY, trimmed);
  }, []);

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
    players[g.myColor].name = myName.trim();

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
    players[g.myColor].name = myName.trim();

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
    setOverlays({ hit: false, elim: false, elimAnnounce: null, viewLives: false, skillActivated: null });
    setSkillUsedThisRound(false);
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
      roundSnapshot: clonePlayers(players),
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

  const stageShotFromInput = useCallback(async () => {
    const g = gameRef.current;

    const parsed = parseCoordInput(`${g.shotCol}${g.shotRow}`);
    if (!parsed) {
      showNotif('Coordenada inválida. Use A-H e 1-8.', 'miss');
      return;
    }

    const { x, y } = parsed;
    const key = coordKey(x, y);
    const myEffects = g.players[g.myColor]?.activeEffects || {};
    const isDoubleShot = !!myEffects.doubleShot;
    const isSecondShot = isDoubleShot && g.doubleshotFired;

    const alreadyShot =
      g.boardShots.some((s) => coordKey(s.x, s.y) === key) ||
      (g.pendingShot && coordKey(g.pendingShot.x, g.pendingShot.y) === key);
    if (alreadyShot) {
      showNotif('Essa coordenada já recebeu alvo.', 'miss');
      return;
    }

    const players = clonePlayers(g.players);
    const boardShots = cloneBoardShots(g.boardShots);
    let turnOrder = [...g.turnOrder];
    let eliminationOrder = [...g.eliminationOrder];

    const hitColor = turnOrder.find((c) => {
      if (c === g.myColor) return false;
      const p = players[c];
      return p && !p.eliminated && p.pos?.x === x && p.pos?.y === y;
    });

    if (hitColor) {
      if (players[hitColor].activeEffects?.shield) {
        players[hitColor].activeEffects = { ...players[hitColor].activeEffects, shield: false };
        showNotif(`🛡️ ESCUDO de ${NAMES[hitColor]} absorveu!`, 'info');
      } else {
        const result = applyHit(hitColor, players, turnOrder);
        turnOrder = result.turnOrder;
        if (players[hitColor].eliminated) {
          players[hitColor].killedBy = g.myColor;
          eliminationOrder = [...eliminationOrder, hitColor];
        }
      }
    }

    boardShots.push({ x, y, by: g.myColor, targetColor: hitColor || null, round: g.round });

    if (isDoubleShot && !isSecondShot) {
      const nextGame = {
        ...g,
        players,
        boardShots,
        turnOrder,
        eliminationOrder,
        myShots: g.myShots + 1,
        pendingShot: { x, y },
        doubleshotFired: true,
        shotCol: '',
        shotRow: '',
        currentStep: 1,
      };
      setGame(nextGame);
      await push(nextGame);
      showNotif('🎯 1º TIRO! Dispare o 2º.', 'info');
      return;
    }

    if (isSecondShot) {
      players[g.myColor].activeEffects = { ...players[g.myColor].activeEffects, doubleShot: false };
    }

    const nextGame = {
      ...g,
      players,
      boardShots,
      turnOrder,
      eliminationOrder,
      myShots: g.myShots + 1,
      pendingShot: isSecondShot ? g.pendingShot : { x, y },
      pendingShot2: isSecondShot ? { x, y } : null,
      doubleshotFired: false,
      shotCol: '',
      shotRow: '',
      currentStep: 2,
    };
    setGame(nextGame);
    await push(nextGame);
  }, [applyHit, push, showNotif]);

  const proceedToMove = useCallback(() => {
    const g = gameRef.current;
    const players = clonePlayers(g.players);
    if (players[g.myColor]?.activeEffects?.silenceShot) {
      players[g.myColor].activeEffects = { ...players[g.myColor].activeEffects, silenceShot: false };
      const nextGame = { ...g, players, currentStep: 3 };
      setGame(nextGame);
      push(nextGame);
      return;
    }
    setGame((prev) => ({ ...prev, currentStep: 3 }));
  }, [push]);

  const moveMyTank = useCallback(
    (x, y) => {
      if (turnDone) return;
      const g = gameRef.current;
      if (!isInsideZone(g.myColor, x, y)) {
        showNotif('Mova dentro da sua zona!', 'miss');
        return;
      }
      const myEffects = g.players[g.myColor]?.activeEffects || {};
      setGame((prev) => {
        const players = clonePlayers(prev.players);
        players[prev.myColor].pos = { x, y };
        if (myEffects.jump) {
          players[prev.myColor].activeEffects = { ...players[prev.myColor].activeEffects, jump: false };
        }
        return { ...prev, players };
      });
      stopTimer();
      setTurnDone(true);
    },
    [showNotif, stopTimer, turnDone],
  );

  const dismissEliminationAnnounce = useCallback(() => {
    setOverlays((o) => ({ ...o, elimAnnounce: null }));
  }, []);

  const dismissHit = useCallback(() => {
    setOverlays((o) => ({ ...o, hit: false }));
  }, []);

  const dismissViewLives = useCallback(() => {
    setOverlays((o) => ({ ...o, viewLives: false }));
  }, []);

  const dismissSkillActivated = useCallback(() => {
    setOverlays((o) => ({ ...o, skillActivated: null }));
  }, []);

  const activateSkill = useCallback(
    async (skillId) => {
      const g = gameRef.current;
      if (!g.roomCode || !g.myColor || !g.gameStarted) {
        showNotif('Entre em uma partida ativa!', 'miss');
        return;
      }
      if (skillUsedThisRound) {
        showNotif('Já usou 1 skill nessa rodada!', 'miss');
        return;
      }
      if (!SKILLS[skillId]) {
        showNotif('Skill desconhecida!', 'miss');
        return;
      }

      const players = clonePlayers(g.players);
      const me = players[g.myColor];

      switch (skillId) {
        case 'repair': {
          if (me.lives >= 3) { showNotif('Vida já está cheia!', 'miss'); return; }
          me.lives = Math.min(3, me.lives + 1);
          setSkillUsedThisRound(true);
          const ng1 = { ...g, players };
          setGame(ng1);
          await push(ng1);
          setOverlays((o) => ({ ...o, skillActivated: skillId }));
          break;
        }
        case 'viewLives': {
          setSkillUsedThisRound(true);
          setOverlays((o) => ({ ...o, viewLives: true }));
          break;
        }
        case 'rebuild': {
          const myZoneShots = g.boardShots.filter((s) => isInsideZone(g.myColor, s.x, s.y));
          if (!myZoneShots.length) { showNotif('Nenhum alvo na sua zona!', 'miss'); return; }
          const last = myZoneShots[myZoneShots.length - 1];
          const boardShots = g.boardShots.filter((s) => !(s.x === last.x && s.y === last.y));
          setSkillUsedThisRound(true);
          const ng2 = { ...g, boardShots };
          setGame(ng2);
          await push(ng2);
          setOverlays((o) => ({ ...o, skillActivated: skillId }));
          break;
        }
        case 'shield':
        case 'jump':
        case 'silenceShot':
        case 'doubleShot': {
          me.activeEffects = { ...(me.activeEffects || {}), [skillId]: true };
          setSkillUsedThisRound(true);
          const ng3 = { ...g, players };
          setGame(ng3);
          await push(ng3);
          setOverlays((o) => ({ ...o, skillActivated: skillId }));
          break;
        }
        default:
          showNotif('Skill desconhecida!', 'miss');
      }
    },
    [push, showNotif, skillUsedThisRound],
  );

  const confirmElimination = useCallback(() => {
    setOverlays((o) => ({ ...o, elim: false }));

    const g = gameRef.current;
    const players = clonePlayers(g.players);
    players[g.myColor].eliminated = true;
    players[g.myColor].lives = 0;

    const turnOrder = g.turnOrder.filter((c) => c !== g.myColor);
    const alive = turnOrder.filter((c) => !players[c].eliminated);

    setGame({
      ...g,
      players,
      turnOrder,
      gameOver: alive.length <= 1,
      winner: alive.length <= 1 ? alive[0] || null : null,
    });
  }, []);

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
      COLORS.forEach((c) => { if (nextGame.players[c]?.eliminated) prevEliminatedRef.current.add(c); });
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

  useEffect(() => {
    if (pendingSkillRef.current && game.roomCode && game.myColor && game.gameStarted) {
      const skill = pendingSkillRef.current;
      pendingSkillRef.current = null;
      activateSkill(skill);
    }
  }, [game.roomCode, game.myColor, game.gameStarted, activateSkill]);

  const playersReadyCount = useMemo(() => COLORS.filter((c) => game.players[c]?.active).length, [game.players]);

  const canStart = playersReadyCount >= 2 && game.isHost;
  const myPlayer = game.myColor ? game.players[game.myColor] : null;
  const activeTurnColor = currentPlayer(game);

  const waitingMsg = activeTurnColor ? `VEZ DO ${NAMES[activeTurnColor]}` : 'AGUARDANDO...';

  const endStats = useMemo(() => {
    const myHits = game.boardShots.filter((s) => s.by === game.myColor && s.targetColor !== null).length;
    const accuracy = game.myShots > 0 ? Math.round((myHits / game.myShots) * 100) : 0;
    const killedBy = myPlayer?.killedBy || null;
    const ranking = [
      ...game.eliminationOrder.map((color, i) => ({ color, position: i + 1 })),
      ...(game.winner ? [{ color: game.winner, position: null }] : []),
    ];
    return {
      rounds: game.round,
      shots: game.myShots,
      hits: myHits,
      misses: game.myShots - myHits,
      accuracy,
      lives: myPlayer?.lives || 0,
      killedBy,
      ranking,
    };
  }, [game.boardShots, game.eliminationOrder, game.myColor, game.myShots, game.winner, myPlayer?.killedBy, myPlayer?.lives]);

  const turnBadge =
    activeTurnColor === game.myColor
      ? { text: '⚔️ SUA VEZ', color: CVARS[game.myColor] }
      : { text: `VEZ: ${NAMES[activeTurnColor] || '—'}`, color: CVARS[activeTurnColor] || 'var(--text)' };

  return {
    state: {
      game,
      screen,
      joinCode,
      myName,
      timerValue,
      notif,
      online,
      overlays,
      turnDone,
      skillUsedThisRound,
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
      SKILLS,
    },
    actions: {
      setScreen: setScreenSafely,
      setJoinCode,
      setMyName,
      selectColor,
      createRoom,
      joinRoom,
      leaveRoom,
      startGame,
      setShotCol,
      setShotRow,
      stageShotFromInput,
      proceedToMove,
      moveMyTank,
      dismissHit,
      dismissViewLives,
      dismissSkillActivated,
      activateSkill,
      confirmElimination,
      dismissEliminationAnnounce,
      advanceTurn,
      clearSession,
    },
  };
}
