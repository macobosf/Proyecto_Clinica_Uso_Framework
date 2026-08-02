import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

// Generado 100% en el navegador (librería `qrcode`, sin llamar a ningún
// servicio externo): el enlace que codifica ya lleva el token de
// consentimiento, así que no tiene sentido hacerlo pasar por un tercero.
export function CodigoQR({ valor, tamano = 160 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && valor) {
      QRCode.toCanvas(canvasRef.current, valor, { width: tamano, margin: 1 }).catch(() => {});
    }
  }, [valor, tamano]);

  return <canvas ref={canvasRef} />;
}
