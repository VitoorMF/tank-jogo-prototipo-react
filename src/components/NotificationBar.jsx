import React from 'react';

export function NotificationBar({ notif }) {
  return <div className={`notif ${notif.type} ${notif.show ? 'show' : ''}`}>{notif.msg}</div>;
}
