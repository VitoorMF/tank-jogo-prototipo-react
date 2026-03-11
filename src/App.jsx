import React from 'react';
import { ConnectionStatus } from './components/ConnectionStatus';
import { NotificationBar } from './components/NotificationBar';
import { useTankBattle } from './hooks/useTankBattle';
import { CreateScreen } from './screens/CreateScreen';
import { EndScreen } from './screens/EndScreen';
import { GameScreen } from './screens/GameScreen';
import { HomeScreen } from './screens/HomeScreen';
import { JoinScreen } from './screens/JoinScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { Overlays } from './screens/Overlays';
import { WaitingScreen } from './screens/WaitingScreen';

export default function App() {
  const { state, actions } = useTankBattle();
  const { screen, notif, online, game, joinCode } = state;

  return (
    <>
      <NotificationBar notif={notif} />
      <ConnectionStatus online={online} />

      <HomeScreen active={screen === 'home'} onCreate={() => actions.setScreen('create')} onJoin={() => actions.setScreen('join')} />

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
        myColor={game.myColor}
        players={game.players}
        joinCode={joinCode}
        onSelectColor={actions.selectColor}
        onSetJoinCode={actions.setJoinCode}
        onJoin={actions.joinRoom}
        onBack={() => actions.setScreen('home')}
      />

      <LobbyScreen active={screen === 'lobby'} state={state} actions={actions} />
      <GameScreen active={screen === 'game'} state={state} actions={actions} />
      <WaitingScreen active={screen === 'waiting'} state={state} />
      <EndScreen active={screen === 'end'} state={state} actions={actions} />
      <Overlays state={state} actions={actions} />
    </>
  );
}
