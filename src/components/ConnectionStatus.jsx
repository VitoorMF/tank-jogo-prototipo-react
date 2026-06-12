import React from 'react';

export function ConnectionStatus({ online }) {
  return (
    <div className={`conn ${online ? '' : 'off'}`}>
      <i />
      <span>{online ? 'Online' : 'Offline'}</span>
    </div>
  );
}
