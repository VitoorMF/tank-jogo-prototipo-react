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

function describeError(err) {
  const n = err?.name || '';
  const msg = (err?.message || String(err)).toLowerCase();
  if (n === 'NotAllowedError' || msg.includes('permission') || msg.includes('notallowed')) {
    return 'Permissão de câmera negada. Habilite no navegador.';
  }
  if (n === 'NotFoundError' || msg.includes('notfound') || msg.includes('no camera')) {
    return 'Nenhuma câmera encontrada neste dispositivo.';
  }
  if (n === 'NotReadableError' || msg.includes('notreadable')) {
    return 'Câmera está em uso por outro aplicativo.';
  }
  if (n === 'OverconstrainedError' || msg.includes('overconstrained')) {
    return 'Câmera não suporta a configuração pedida.';
  }
  if (msg.includes('secure context') || msg.includes('https')) {
    return 'Câmera só funciona em HTTPS ou localhost.';
  }
  return `Erro: ${err?.name || ''} ${err?.message || err}`;
}

export function QRScanner({ onScan, onClose }) {
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('starting');
  const [debugInfo, setDebugInfo] = useState('');
  const qrInstanceRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let localQr = null;

    const log = (...args) => {
      console.log('[QR]', ...args);
      setDebugInfo((prev) => prev + '\n' + args.map(String).join(' '));
    };

    const start = async () => {
      await new Promise((r) => setTimeout(r, 100));
      if (cancelled) return;
      const el = document.getElementById(SCANNER_ID);
      if (!el) { log('container missing'); return; }

      // 1. Preflight: solicita permissão e enumera câmeras
      let cameraId = null;
      try {
        log('preflight getUserMedia...');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
        log('permission OK');
      } catch (permErr) {
        if (cancelled) return;
        log('preflight failed:', permErr.name, permErr.message);
        setError(describeError(permErr));
        setStatus('error');
        return;
      }

      try {
        const cameras = await Html5Qrcode.getCameras();
        log('cameras found:', cameras?.length || 0);
        if (!cameras || cameras.length === 0) {
          throw new Error('Nenhuma câmera disponível');
        }
        const back = cameras.find((c) => /back|rear|environment|traseira/i.test(c.label || ''));
        cameraId = back ? back.id : cameras[cameras.length - 1].id;
        log('chose camera:', cameraId, '(label:', back?.label || cameras[cameras.length - 1].label, ')');
      } catch (enumErr) {
        if (cancelled) return;
        log('enum failed:', enumErr.message);
        // Fallback: usa facingMode loose
        cameraId = { facingMode: 'environment' };
      }

      if (cancelled) return;

      try {
        localQr = new Html5Qrcode(SCANNER_ID, false);
        qrInstanceRef.current = localQr;

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

        if (cancelled) {
          await localQr.stop().catch(() => {});
          await localQr.clear().catch(() => {});
          return;
        }

        log('scanner running');
        setStatus('scanning');
      } catch (startErr) {
        if (cancelled) return;
        log('start failed:', startErr.name, startErr.message);
        setError(describeError(startErr));
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
        {/* Container que o html5-qrcode controla — NUNCA renderize children React aqui */}
        <div id={SCANNER_ID} style={{ width: '100%', height: '100%' }} />

        {/* Loading overlay fica em camada separada, fora do controle do html5-qrcode */}
        {status === 'starting' && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)', fontSize: 12, letterSpacing: 1, pointerEvents: 'none',
            background: '#000',
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

      {status === 'error' && debugInfo && (
        <details style={{ maxWidth: 320, color: 'var(--muted)', fontSize: 10, fontFamily: 'monospace' }}>
          <summary style={{ cursor: 'pointer' }}>Detalhes técnicos</summary>
          <pre style={{ whiteSpace: 'pre-wrap', textAlign: 'left', marginTop: 8 }}>{debugInfo.trim()}</pre>
        </details>
      )}

      <button type="button" className="btn btn-ghost" onClick={handleClose}>
        <span>{status === 'error' ? 'FECHAR' : 'CANCELAR'}</span>
      </button>
    </div>
  );
}
