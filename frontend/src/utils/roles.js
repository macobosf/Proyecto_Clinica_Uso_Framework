export const ETIQUETAS_ROL = {
  RECEPCION: 'Recepción',
  MEDICO: 'Médico',
  ADMINISTRACION: 'Administración',
};

export function etiquetaRol(rol) {
  return ETIQUETAS_ROL[rol] ?? rol;
}
