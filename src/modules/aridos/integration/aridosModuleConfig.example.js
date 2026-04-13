// Configuracion sugerida para registrar el modulo sin acoplarlo fuerte a tu app.

export const ARIDOS_MODULE_CONFIG = {
  basePath: '/aridos',
  requiredCollections: [
    'productos',
    'bateas',
    'clientes',
    'proveedores',
    'ingresosCamion',
    'ventas',
    'movimientosStock',
    'ajustesStock',
    'remitos',
  ],
  requiredConfigDocs: [
    'config/usuarios',
    'config/permisosAridos',
  ],
};
