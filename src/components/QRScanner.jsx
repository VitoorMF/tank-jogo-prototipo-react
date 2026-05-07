import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { SKILLS } from '../constants/game';

const SCANNER_ID = 'tb-qr-scanner';

function parseSkillFromQR(text) {
  try {
    const url = new URL(text);
    const skill = url.searchParams.get('skill');
    if (skill) return skill;
  } catch {
    // not a URL
  }
  // bare skill id or "skill:shield"
  const stripped = text.replace(/^skill:/i, '').trim().toLowerCase();
  if (SKILLS[stripped]) return stripped;
  return null;
}

export function QRScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const qr = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = qr;

    qr.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (text) => {
        const skillId = parseSkillFromQR(text);
        if (skillId) {
          qr.stop().catch(() => {});
          setScanning(false);
          onScan(skillId);
        } else {
          setError(`QR inválido. Conteúdo: "${text}"`);
        }
      },
      () => {},
    ).catch((err) => {
      setError(`Câmera indisponível: ${err?.message || err}`);
    });

    return () => {
      qr.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 16, padding: 24,
      }}
    >
      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 13, color: 'var(--accent)', letterSpacing: 2 }}>
        🎴 ESCANEAR CARTA DE SKILL
      </div>

      <div
        id={SCANNER_ID}
        style={{
          width: 280, height: 280,
          border: '2px solid var(--accent)',
          borderRadius: 8,
          overflow: 'hidden',
          background: '#000',
        }}
      />

      {error && (
        <div style={{ color: 'var(--accent2)', fontSize: 12, textAlign: 'center', maxWidth: 260 }}>
          {error}
        </div>
      )}

      {scanning && !error && (
        <div className="muted" style={{ fontSize: 11, textAlign: 'center' }}>
          Aponte para o QR code da carta
        </div>
      )}

      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => {
          scannerRef.current?.stop().catch(() => {});
          onClose();
        }}
      >
        <span>CANCELAR</span>
      </button>
    </div>
  );
}
