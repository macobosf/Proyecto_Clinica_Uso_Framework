// Envuelve controladores async para que sus rechazos lleguen al middleware
// de manejo de errores de Express en vez de colgar la petición.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
