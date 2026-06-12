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
const TURN_DURATION_SECONDS = 120;
const SABOTAGE_DURATION_SECONDS = 45;

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
  sabotagedColor: null,
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
    sabotagedColor: state?.sabotagedColor || null,
  };
}

export function useTankBattle() {
  const [game, setGame] = useState(initialGame);
  const [screen, setScreen] = useState('home');
  const [joinCode, setJoinCode] = useState('');
  const [myName, setMyNameState] = useState(() => localStorage.getItem(NAME_KEY) || '');
  const [timerValue, setTimerValue] = useState(TURN_DURATION_SECONDS);
  const [effectiveTurnDuration, setEffectiveTurnDuration] = useState(TURN_DURATION_SECONDS);
  const [notif, setNotif] = useState({ show: false, msg: '', type: 'info' });
  const [online, setOnline] = useState(false);
  const [overlays, setOverlays] = useState({ hit: false, elim: false, elimAnnounce: null, viewLives: false, skillActivated: null, missileTarget: false, shieldAbsorbed: false });
  const [skillUsedThisRound, setSkillUsedThisRound] = useState(false);
  const [turnDone, setTurnDone] = useState(false);
  const [pendingSession, setPendingSession] = useState(null);
  const [tomato, setTomato] = useState(null);
  const tomatoTimerRef = useRef(null);

  const gameRef = useRef(game);
  const timerRef = useRef(null);
  const channelRef = useRef(null);
  const prevLivesRef = useRef(3);
  const prevShieldRef = useRef(false);
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
      sabotagedColor: g.sabotagedColor,
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
      // O snapshot não é mais resetado por rodada: cada jogador publica a
      // própria vida no começo do turno dele (ver startMyTurn).
      roundSnapshot: g.roundSnapshot,
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

  const startTimer = useCallback((duration = TURN_DURATION_SECONDS) => {
    stopTimer();
    let value = duration;
    setEffectiveTurnDuration(duration);
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

    const sabotaged = g.sabotagedColor === g.myColor;
    const duration = sabotaged ? SABOTAGE_DURATION_SECONDS : TURN_DURATION_SECONDS;

    setSkillUsedThisRound(false);
    setTurnDone(false);

    // Publica a vida real do jogador no snapshot ao começar o turno dele.
    // Assim os outros passam a ver a vida atualizada dele a partir da vez dele
    // (em vez de só no fim da rodada). A posição continua oculta.
    const snapshot = clonePlayers(g.roundSnapshot || g.players);
    snapshot[g.myColor] = clonePlayers(g.players)[g.myColor];

    const nextGame = {
      ...g,
      currentStep: 1,
      pendingShot: null,
      pendingShot2: null,
      doubleshotFired: false,
      shotCol: '',
      shotRow: '',
      sabotagedColor: sabotaged ? null : g.sabotagedColor,
      roundSnapshot: snapshot,
    };
    setGame(nextGame);
    push(nextGame);

    if (sabotaged) {
      showNotif('⏱️ TURNO SABOTADO! Apenas 45s', 'miss');
    }

    setScreenSafely('game');
    startTimer(duration);
  }, [push, setScreenSafely, showNotif, startTimer]);

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

    const hasShield = !!myPlayer.activeEffects?.shield;
    if (myPlayer.lives < prevLivesRef.current && !myPlayer.eliminated) {
      setOverlays((o) => ({ ...o, hit: true }));
    } else if (prevShieldRef.current && !hasShield && myPlayer.lives === prevLivesRef.current && !myPlayer.eliminated) {
      // Tinha escudo e ele sumiu sem perder vida => o escudo absorveu um tiro.
      // Aviso privado: só o jogador escudado vê. O atirante não fica sabendo.
      setOverlays((o) => ({ ...o, shieldAbsorbed: true }));
    }
    prevLivesRef.current = myPlayer.lives;
    prevShieldRef.current = hasShield;

    if (currentPlayer() === g.myColor) {
      if (g.currentStep === 0) startMyTurn();
      else setScreenSafely('game');
    } else if (g.currentStep === 0) {
      showWaiting();
    }
  }, [currentPlayer, setScreenSafely, showWaiting, startMyTurn, stopTimer]);

  const showTomato = useCallback((payload) => {
    if (!payload?.target) return;
    setTomato({ ...payload, key: Date.now() });
    window.clearTimeout(tomatoTimerRef.current);
    tomatoTimerRef.current = window.setTimeout(() => setTomato(null), 1600);
  }, []);

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
        .on('broadcast', { event: 'tomato' }, ({ payload }) => {
          showTomato(payload);
        })
        .subscribe((status) => {
          setOnline(status === 'SUBSCRIBED');
        });
    },
    [applyShared, showTomato],
  );

  // Joga um tomate (cosmético) em outro jogador. Broadcast efêmero — não toca
  // no estado do jogo. Mostra localmente também porque o broadcast não ecoa pro sender.
  const throwTomato = useCallback(
    (targetColor) => {
      const g = gameRef.current;
      if (!targetColor || targetColor === g.myColor) return;
      const payload = { by: g.myColor, target: targetColor };
      channelRef.current?.send({ type: 'broadcast', event: 'tomato', payload });
      showTomato(payload);
    },
    [showTomato],
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

  // Passo 1 do fluxo de entrar: valida o código, carrega o estado da sala
  // e abre a tela de cores já subscrito (cores ocupadas em tempo real).
  const enterCode = useCallback(async () => {
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
    if (data.state?.gameStarted) {
      showNotif('Partida já começou!', 'miss');
      return;
    }

    const parsed = normalizeSharedState(data.state);
    setGame((prev) => ({ ...prev, ...parsed, roomCode: code, myColor: null }));
    subscribe(code);
    setScreenSafely('joinColor');
  }, [joinCode, setScreenSafely, showNotif, subscribe]);

  // Cancela o fluxo de entrar (sai da subscription de preview e volta pra home).
  const abortJoin = useCallback(() => {
    if (channelRef.current) {
      db.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setGame({ ...initialGame, players: mkPlayers() });
    setJoinCode('');
    setScreenSafely('home');
  }, [setScreenSafely]);

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
    setOverlays({ hit: false, elim: false, elimAnnounce: null, viewLives: false, skillActivated: null, missileTarget: false, shieldAbsorbed: false });
    setSkillUsedThisRound(false);
    setTurnDone(false);
    setPendingSession(null);
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

    if (isInsideZone(g.myColor, x, y)) {
      showNotif('Não pode atirar na sua própria zona!', 'miss');
      return;
    }

    const key = coordKey(x, y);
    const myEffects = g.players[g.myColor]?.activeEffects || {};
    const isDoubleShot = !!myEffects.doubleShot;
    const isSecondShot = isDoubleShot && g.doubleshotFired;

    // Atirar numa célula já demolida é permitido. Só evitamos repetir a MESMA
    // coordenada dentro do mesmo turno (ex: 2º tiro do Tiro Duplo na mesma casa).
    const repeatedThisTurn = g.pendingShot && coordKey(g.pendingShot.x, g.pendingShot.y) === key;
    if (repeatedThisTurn) {
      showNotif('Você já mirou aí neste turno.', 'miss');
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
        // Escudo absorve o tiro. NÃO avisamos o atirante — ele não pode
        // saber que acertou (igual a um tiro normal). O jogador escudado
        // recebe o aviso privado via reactToState (overlay shieldAbsorbed).
        players[hitColor].activeEffects = { ...players[hitColor].activeEffects, shield: false };
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

  const cancelMissile = useCallback(() => {
    setOverlays((o) => ({ ...o, missileTarget: false }));
  }, []);

  const fireMissile = useCallback(
    async (targetColor) => {
      const g = gameRef.current;
      const players = clonePlayers(g.players);
      const target = players[targetColor];
      if (!target || target.eliminated) {
        showNotif('Alvo inválido!', 'miss');
        setOverlays((o) => ({ ...o, missileTarget: false }));
        return;
      }

      let turnOrder = [...g.turnOrder];
      let eliminationOrder = [...g.eliminationOrder];

      if (target.activeEffects?.shield) {
        // Escudo absorve o míssil. O alvo recebe o aviso privado
        // (overlay shieldAbsorbed via reactToState); o atacante não sabe.
        target.activeEffects = { ...target.activeEffects, shield: false };
      } else {
        target.lives -= 1;
        if (target.lives <= 0) {
          target.lives = 0;
          target.eliminated = true;
          target.killedBy = g.myColor;
          turnOrder = turnOrder.filter((c) => c !== targetColor);
          eliminationOrder = [...eliminationOrder, targetColor];
          showNotif(`💀 ${NAMES[targetColor]} ELIMINADO pelo míssil!`, 'info');
        } else {
          showNotif(`🚀 Míssil atingiu ${NAMES[targetColor]}!`, 'info');
        }
      }

      const alive = turnOrder.filter((c) => !players[c].eliminated);

      setSkillUsedThisRound(true);
      const ng = {
        ...g,
        players,
        turnOrder,
        eliminationOrder,
        gameOver: alive.length <= 1,
        winner: alive.length <= 1 ? alive[0] || null : null,
      };
      setGame(ng);
      await push(ng);
      setOverlays((o) => ({ ...o, missileTarget: false, skillActivated: 'missile' }));
    },
    [push, showNotif],
  );

  const dismissHit = useCallback(() => {
    setOverlays((o) => ({ ...o, hit: false }));
  }, []);

  const dismissShieldAbsorbed = useCallback(() => {
    setOverlays((o) => ({ ...o, shieldAbsorbed: false }));
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
        case 'missile': {
          const targets = (g.turnOrder || []).filter((c) => c !== g.myColor && !players[c]?.eliminated);
          if (!targets.length) { showNotif('Nenhum alvo disponível!', 'miss'); return; }
          // Não marca como usada aqui: só confirma quando escolher o alvo (fireMissile).
          setOverlays((o) => ({ ...o, missileTarget: true }));
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
        case 'sabotage': {
          const order = g.turnOrder || [];
          if (order.length < 2) { showNotif('Sem alvo para sabotar!', 'miss'); return; }
          const nextColor = order[(g.currentTurnIdx + 1) % order.length];
          if (!nextColor || nextColor === g.myColor) { showNotif('Sem alvo para sabotar!', 'miss'); return; }
          setSkillUsedThisRound(true);
          const ngS = { ...g, sabotagedColor: nextColor };
          setGame(ngS);
          await push(ngS);
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

  // Reconecta a uma sessão salva. Robusto: só apaga a sessão quando o servidor
  // CONFIRMA que a sala não existe mais ou a partida acabou. Erro de rede nunca
  // apaga a sessão — apenas falha e deixa o botão "voltar para a partida" ativo.
  const reconnectToSession = useCallback(
    async (sess) => {
      if (!sess || !sess.roomCode || !sess.myColor) return false;

      let data = null;
      let confirmedMissing = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        const res = await db.from('rooms').select('*').eq('code', sess.roomCode).maybeSingle();
        if (res.error) {
          await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
          continue;
        }
        if (res.data) {
          data = res.data;
          break;
        }
        confirmedMissing = true; // respondeu sem erro e sem linha => sala realmente não existe
        break;
      }

      if (confirmedMissing) {
        clearSession();
        setPendingSession(null);
        return false;
      }
      if (!data) {
        // só houve erro de rede nas tentativas: mantém a sessão para reconexão manual
        setPendingSession(sess);
        return false;
      }

      const st = data.state;
      if (st.gameOver) {
        clearSession();
        setPendingSession(null);
        return false;
      }

      const wasEverActive = st.players[sess.myColor]?.active || (st.turnOrder || []).includes(sess.myColor);
      if (!wasEverActive) {
        clearSession();
        setPendingSession(null);
        return false;
      }

      const parsed = normalizeSharedState(st);
      const players = clonePlayers(parsed.players);
      players[sess.myColor].active = true;

      await db.from('rooms').update({ state: { ...st, players, boardShots: parsed.boardShots } }).eq('code', sess.roomCode);

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
      setPendingSession(null);
      showNotif('RECONECTADO! ✅', 'info');

      if (!nextGame.gameStarted) setScreen('lobby');
      return true;
    },
    [clearSession, showNotif, subscribe],
  );

  const resumeSession = useCallback(async () => {
    const sess = loadSession();
    if (!sess) {
      setPendingSession(null);
      return;
    }
    const ok = await reconnectToSession(sess);
    if (!ok) showNotif('Não deu pra reconectar agora. Tente de novo.', 'miss');
  }, [loadSession, reconnectToSession, showNotif]);

  useEffect(() => {
    const init = async () => {
      const { error } = await db.from('rooms').select('id').limit(1);
      setOnline(!error);

      const sess = loadSession();
      if (!sess) return;
      // já mostra o botão "voltar para a partida" na home enquanto tenta reconectar
      setPendingSession(sess);
      await reconnectToSession(sess);
    };

    init();

    // Ao voltar do background: re-subscreve o realtime se caiu e re-sincroniza o
    // estado (pode ter perdido atualizações enquanto a aba estava oculta).
    const onVisibility = async () => {
      if (document.visibilityState !== 'visible') return;
      if (intentionalLeaveRef.current) return;
      const g = gameRef.current;
      if (!g.roomCode) return;

      if (!channelRef.current || channelRef.current.state !== 'joined') {
        subscribe(g.roomCode);
      }
      const { data } = await db.from('rooms').select('state').eq('code', g.roomCode).maybeSingle();
      if (data?.state) applyShared(data.state);
    };

    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', onVisibility);
      if (channelRef.current) db.removeChannel(channelRef.current);
    };
  }, [applyShared, loadSession, reconnectToSession, stopTimer, subscribe]);

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

  const activeTurnName = activeTurnColor
    ? (game.players[activeTurnColor]?.name?.trim() || NAMES[activeTurnColor])
    : '';
  const waitingMsg = activeTurnColor ? `VEZ DE ${activeTurnName.toUpperCase()}` : 'AGUARDANDO...';

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
      pendingSession,
      tomato,
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
      turnDuration: effectiveTurnDuration,
      NAMES,
      CVARS,
      CHEX,
      EMOJI,
      COLORS,
      SKILLS,
    },
    actions: {
      setScreen: setScreenSafely,
      resumeSession,
      throwTomato,
      setJoinCode,
      setMyName,
      selectColor,
      createRoom,
      enterCode,
      abortJoin,
      joinRoom,
      leaveRoom,
      startGame,
      setShotCol,
      setShotRow,
      stageShotFromInput,
      proceedToMove,
      moveMyTank,
      dismissHit,
      dismissShieldAbsorbed,
      dismissViewLives,
      dismissSkillActivated,
      activateSkill,
      fireMissile,
      cancelMissile,
      confirmElimination,
      dismissEliminationAnnounce,
      advanceTurn,
      clearSession,
    },
  };
}
