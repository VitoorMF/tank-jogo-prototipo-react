import React, { useState } from 'react';
import { ConnectionStatus } from './components/ConnectionStatus';
import { NotificationBar } from './components/NotificationBar';
import { useTankBattle } from './hooks/useTankBattle';
import { CreateScreen } from './screens/CreateScreen';
import { EndScreen } from './screens/EndScreen';
import { GameScreen } from './screens/GameScreen';
import { HomeScreen } from './screens/HomeScreen';
import { HowTo } from './screens/HowTo';
import { JoinScreen } from './screens/JoinScreen';
import { JoinColorScreen } from './screens/JoinColorScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { Overlays } from './screens/Overlays';
import { TomatoFx } from './components/TomatoFx';
import { EmoteFx } from './components/EmoteFx';
import { WaitingScreen } from './screens/WaitingScreen';

export default function App() {
  const { state, actions } = useTankBattle();
  const { screen, notif, online, game, joinCode, myName, pendingSession } = state;
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <NotificationBar notif={notif} />
      <ConnectionStatus online={online} />

      <HomeScreen
        active={screen === 'home'}
        myName={myName}
        onSetMyName={actions.setMyName}
        onCreate={() => actions.setScreen('create')}
        onJoin={() => actions.setScreen('join')}
        onHelp={() => setShowHelp(true)}
        pendingSession={pendingSession}
        onResume={actions.resumeSession}
      />

      <CreateScreen
        active={screen === 'create'}
        myColor={game.myColor}
        players={game.players}
        onSelectColor={actions.selectColor}
        onCreateRoom={actions.createRoom}
        onBack={() => actions.setScreen('home')}
      />

      <JoinScreen
        active={screen === 'join'}
        joinCode={joinCode}
        onSetJoinCode={actions.setJoinCode}
        onContinue={actions.enterCode}
        onBack={actions.abortJoin}
      />

      <JoinColorScreen active={screen === 'joinColor'} state={state} actions={actions} />

      <LobbyScreen active={screen === 'lobby'} state={state} actions={actions} />
      <GameScreen active={screen === 'game'} state={state} actions={actions} />
      <WaitingScreen active={screen === 'waiting'} state={state} actions={actions} />
      <EndScreen active={screen === 'end'} state={state} actions={actions} />
      <Overlays state={state} actions={actions} />
      <TomatoFx tomatoes={state.tomatoes} players={game.players} />
      <EmoteFx emotes={state.emotes} />
      <HowTo open={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}
