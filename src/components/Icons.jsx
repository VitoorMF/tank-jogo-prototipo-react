/* Icons.jsx — original line/stencil SVG icon set (no emoji) */
import React from 'react';

function Svg({ size = 24, vb = '0 0 24 24', children, style, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={vb}
      fill="none"
      className={className}
      style={{ display: 'block', ...style }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const GAP = '#0c0f15';

export function IconTank({ size = 24, color = 'currentColor', style, className }) {
  return (
    <Svg size={size} vb="0 0 28 22" style={{ color, ...style }} className={className}>
      <rect x="15.5" y="6.4" width="11.5" height="2.1" rx="1.05" fill="currentColor" />
      <path d="M8 8.4 V6.6 Q8 4.6 10 4.6 H13.2 Q15.2 4.6 15.2 6.6 V8.4 Z" fill="currentColor" />
      <path d="M2.6 8.4 H18 L16.2 12 H4.4 Z" fill="currentColor" />
      <rect x="1" y="11.6" width="18.4" height="5.4" rx="2.7" fill="currentColor" />
      <circle cx="4.3" cy="14.3" r="1.15" fill={GAP} />
      <circle cx="8.1" cy="14.3" r="1.15" fill={GAP} />
      <circle cx="11.9" cy="14.3" r="1.15" fill={GAP} />
      <circle cx="15.7" cy="14.3" r="1.15" fill={GAP} />
    </Svg>
  );
}

export function IconTarget({ size = 24, color = 'currentColor', style, className }) {
  return (
    <Svg size={size} style={{ color, ...style }} className={className}>
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="7.6" />
        <line x1="12" y1="1.4" x2="12" y2="4.6" />
        <line x1="12" y1="19.4" x2="12" y2="22.6" />
        <line x1="1.4" y1="12" x2="4.6" y2="12" />
        <line x1="19.4" y1="12" x2="22.6" y2="12" />
      </g>
      <circle cx="12" cy="12" r="2.8" fill="currentColor" />
    </Svg>
  );
}

export function IconSwords({ size = 24, color = 'currentColor', style, className }) {
  return (
    <Svg size={size} style={{ color, ...style }} className={className}>
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.5 3.5 L10 14" />
        <path d="M3.5 18.5 L7.8 14.2" />
        <path d="M6.6 12.4 L11.6 17.4" />
        <path d="M3.5 3.5 L14 14" />
        <path d="M20.5 18.5 L16.2 14.2" />
        <path d="M17.4 12.4 L12.4 17.4" />
      </g>
    </Svg>
  );
}

export function IconHourglass({ size = 24, color = 'currentColor', style, className }) {
  return (
    <Svg size={size} style={{ color, ...style }} className={className}>
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5.5" y1="3" x2="18.5" y2="3" />
        <line x1="5.5" y1="21" x2="18.5" y2="21" />
        <path d="M7 3 V6.2 L12 12 L7 17.8 V21" />
        <path d="M17 3 V6.2 L12 12 L17 17.8 V21" />
      </g>
      <path d="M9 5.6 H15 L12 9.4 Z" fill="currentColor" />
      <path d="M12 13.6 L15.2 18.6 H8.8 Z" fill="currentColor" />
    </Svg>
  );
}

export function IconScan({ size = 24, color = 'currentColor', style, className }) {
  return (
    <Svg size={size} style={{ color, ...style }} className={className}>
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M3 8.5 V5.5 Q3 3 5.5 3 H8.5" />
        <path d="M15.5 3 H18.5 Q21 3 21 5.5 V8.5" />
        <path d="M21 15.5 V18.5 Q21 21 18.5 21 H15.5" />
        <path d="M8.5 21 H5.5 Q3 21 3 18.5 V15.5" />
        <line x1="3" y1="12" x2="21" y2="12" strokeWidth="1.7" />
      </g>
    </Svg>
  );
}

const HEART_D =
  'M12 20.6 C12 20.6 3.4 14.4 3.4 8.7 C3.4 5.9 5.6 3.8 8.1 3.8 C9.8 3.8 11.2 4.7 12 6.1 C12.8 4.7 14.2 3.8 15.9 3.8 C18.4 3.8 20.6 5.9 20.6 8.7 C20.6 14.4 12 20.6 12 20.6 Z';
export function IconHeart({ size = 20, filled = true, color = 'currentColor', style, className }) {
  return (
    <Svg size={size} style={{ color, ...style }} className={className}>
      {filled ? (
        <path d={HEART_D} fill="currentColor" />
      ) : (
        <path d={HEART_D} fill="none" stroke="currentColor" strokeWidth="1.8" opacity="0.45" />
      )}
    </Svg>
  );
}

export function IconPlay({ size = 20, color = 'currentColor', style, className }) {
  return (
    <Svg size={size} style={{ color, ...style }} className={className}>
      <path d="M6.5 4.2 L19.5 12 L6.5 19.8 Z" fill="currentColor" />
    </Svg>
  );
}

export function IconChevronLeft({ size = 18, color = 'currentColor', style, className }) {
  return (
    <Svg size={size} style={{ color, ...style }} className={className}>
      <path d="M14.5 5 L8 12 L14.5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconArrowRight({ size = 22, color = 'currentColor', style, className }) {
  return (
    <Svg size={size} style={{ color, ...style }} className={className}>
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3.5" y1="12" x2="20" y2="12" />
        <path d="M13.5 5.5 L20 12 L13.5 18.5" />
      </g>
    </Svg>
  );
}

export function IconBluff({ size = 22, color = 'currentColor', style, className }) {
  return (
    <Svg size={size} style={{ color, ...style }} className={className}>
      <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeDasharray="2.6 2.8" />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" />
    </Svg>
  );
}
