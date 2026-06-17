import React, { useLayoutEffect, useRef, useState } from 'react';

function EmoteOne({ emote }) {
  const [pos, setPos] = useState(null);
  const jitterRef = useRef((Math.random() - 0.5) * 40); // espalha emotes simultâneos

  useLayoutEffect(() => {
    const el = document.querySelector(`.life-row[data-color="${emote.by}"]`);
    if (el) {
      const r = el.getBoundingClientRect();
      setPos({ x: r.left + r.width - 44 + jitterRef.current, y: r.top + r.height / 2 });
    } else {
      setPos(null);
    }
  }, [emote]);

  const style = pos ? { '--ex': `${pos.x}px`, '--ey': `${pos.y}px` } : { '--ex': '50%', '--ey': '40vh' };

  return (
    <div className="emote-fx" style={style}>
      <div className="emote-bubble">{emote.emote}</div>
    </div>
  );
}

export function EmoteFx({ emotes }) {
  if (!emotes?.length) return null;
  return (
    <>
      {emotes.map((e) => (
        <EmoteOne key={e.key} emote={e} />
      ))}
    </>
  );
}
