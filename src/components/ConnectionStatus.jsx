import React from 'react';

export function ConnectionStatus({ online }) {
  return (
    <div id="conn-status">
      <div className={`conn-dot ${online ? 'online' : ''}`} />
      <span>{online ? 'ONLINE' : 'OFFLINE'}</span>
    </div>
  );
}
