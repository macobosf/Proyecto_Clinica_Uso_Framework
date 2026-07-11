// Los controladores reales llegan en los pasos 3-4; por ahora cada ruta solo
// confirma que el guard de rol correspondiente ya está aplicado.
function placeholder(mensaje) {
  return (req, res) => res.status(200).json({ mensaje });
}

module.exports = placeholder;
