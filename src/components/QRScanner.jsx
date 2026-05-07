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
  const stripped = text.replace(/^skill:/i, '').trim().toLowerCase();
  if (SKILLS[stripped]) return stripped;
  return null;
}

export function QRScanner({ onScan, onClose }) {
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('starting');
  const qrInstanceRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let localQr = null;

    const start = async () => {
      await new Promise((r) => setTimeout(r, 100));
      if (cancelled) return;
      const el = document.getElementById(SCANNER_ID);
      if (!el) return;

      try {
        localQr = new Html5Qrcode(SCANNER_ID, false);
        qrInstanceRef.current = localQr;

        // Tenta primeiro a câmera traseira; se falhar, usa qualquer uma disponível
        let started = false;
        const tryStart = async (cameraId) => {
          await localQr.start(
            cameraId,
            {
              fps: 10,
              qrbox: (vw, vh) => {
                const min = Math.min(vw, vh);
                const size = Math.max(150, Math.floor(min * 0.75));
                return { width: size, height: size };
              },
              aspectRatio: 1.0,
            },
            (text) => {
              if (cancelled) return;
              const skillId = parseSkillFromQR(text);
              if (skillId) {
                cancelled = true;
                localQr.stop().catch(() => {}).finally(() => {
                  localQr.clear().catch(() => {});
                  onScan(skillId);
                });
              } else {
                setError(`QR inválido: "${text.slice(0, 40)}"`);
              }
            },
            () => {},
          );
        };

        try {
          await tryStart({ facingMode: 'environment' });
          started = true;
        } catch (e1) {
          if (cancelled) return;
          console.log('[QR] environment falhou, tentando enumerar:', e1?.message);
          try {
            const cameras = await Html5Qrcode.getCameras();
            if (!cameras || cameras.length === 0) throw new Error('Nenhuma câmera disponível');
            const back = cameras.find((c) => /back|rear|environment|traseira/i.test(c.label));
            const cam = back || cameras[cameras.length - 1];
            await tryStart(cam.id);
            started = true;
          } catch (e2) {
            throw e2;
          }
        }

        if (!started || cancelled) {
          await localQr.stop().catch(() => {});
          await localQr.clear().catch(() => {});
          return;
        }

        setStatus('scanning');
      } catch (err) {
        if (cancelled) return;
        console.log('[QR] erro final:', err?.name, err?.message);
        const n = err?.name || '';
        const msg = (err?.message || String(err)).toLowerCase();
        if (n === 'NotAllowedError' || msg.includes('permission') || msg.includes('notallowed')) {
          setError('Permissão de câmera negada. Habilite no navegador.');
        } else if (n === 'NotFoundError' || msg.includes('notfound') || msg.includes('no camera')) {
          setError('Nenhuma câmera encontrada neste dispositivo.');
        } else if (n === 'NotReadableError') {
          setError('Câmera está em uso por outro aplicativo.');
        } else if (msg.includes('secure context') || msg.includes('https')) {
          setError('Câmera só funciona em HTTPS ou localhost.');
        } else {
          setError(`Erro: ${err?.message || err}`);
        }
        setStatus('error');
      }
    };

    start();

    return () => {
      cancelled = true;
      if (localQr) {
        try {
          if (localQr.isScanning) {
            localQr.stop().catch(() => {}).finally(() => {
              localQr.clear().catch(() => {});
            });
          } else {
            localQr.clear().catch(() => {});
          }
        } catch {
          // ignore
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    const q = qrInstanceRef.current;
    if (q && q.isScanning) {
      q.stop().catch(() => {}).finally(() => {
        q.clear().catch(() => {});
        onClose();
      });
    } else {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 16, padding: 24,
      }}
    >
      <style>{`
        #${SCANNER_ID} video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          display: block !important;
        }
      `}</style>

      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 13, color: 'var(--accent)', letterSpacing: 2 }}>
        🎴 ESCANEAR CARTA DE SKILL
      </div>

      <div
        id={SCANNER_ID}
        style={{
          width: 'min(280px, 80vw)',
          height: 'min(280px, 80vw)',
          border: '2px solid var(--accent)',
          borderRadius: 8,
          overflow: 'hidden',
          background: '#000',
          position: 'relative',
        }}
      >
        {status === 'starting' && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)', fontSize: 12, letterSpacing: 1, pointerEvents: 'none',
          }}>
            INICIANDO CÂMERA...
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: 'var(--accent2)', fontSize: 12, textAlign: 'center', maxWidth: 280, lineHeight: 1.5 }}>
          {error}
        </div>
      )}

      {status === 'scanning' && !error && (
        <div className="muted" style={{ fontSize: 11, textAlign: 'center' }}>
          Aponte para o QR code da carta
        </div>
      )}

      <button type="button" className="btn btn-ghost" onClick={handleClose}>
        <span>{status === 'error' ? 'FECHAR' : 'CANCELAR'}</span>
      </button>
    </div>
  );
}
