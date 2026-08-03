import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

// Generado 100% en el navegador (librería `qrcode`, sin llamar a ningún
// servicio externo): el enlace que codifica ya lleva el token de
// consentimiento, así que no tiene sentido hacerlo pasar por un tercero.
//
// A propósito usa "scale" (píxeles por módulo, siempre un entero) y NO
// "width" (ancho total forzado en píxeles): con un token largo (el JWT del
// enlace de consentimiento/ARCO+ ronda los 300 caracteres) la librería
// necesita una versión de QR con muchos módulos, y forzar un "width" que no
// es múltiplo exacto de esa cantidad de módulos hace que el navegador
// reescale con antialiasing — los bordes de los módulos quedan borrosos y el
// código deja de ser legible (se verificó: forzar 150px de ancho para este
// tamaño de token produce un QR que ni siquiera decodifica leyendo el propio
// canvas en píxeles, sin cámara de por medio). Con "scale", el canvas crece
// según haga falta para el contenido, pero cada módulo siempre es un bloque
// de píxeles nítido.
export function CodigoQR({ valor, escala = 6 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && valor) {
      QRCode.toCanvas(canvasRef.current, valor, { scale: escala, margin: 2 }).catch(() => {});
    }
  }, [valor, escala]);

  return <canvas ref={canvasRef} />;
}
