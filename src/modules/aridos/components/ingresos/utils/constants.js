export const UNIDADES_PRODUCTO = [
  { value: 'm3', label: 'Metros cúbicos (m³)' },
  { value: 'm2', label: 'Metros cuadrados (m²)' },
  { value: 'metro', label: 'Metros (m)' },
  { value: 'unidad', label: 'Unidad' },
  { value: 'bolsa', label: 'Bolsa' },
  { value: 'kg', label: 'Kilogramo (kg)' },
  { value: 'tonelada', label: 'Tonelada (tn)' },
  { value: 'litro', label: 'Litro (l)' },
  { value: 'pallet', label: 'Pallet' },
];

export const PRESENTACIONES_REPOSICION = [
  { value: 'batea_20_24', label: 'Batea 20/24 m³' },
  { value: 'bigbag_1m3', label: 'Big bag 1 m³' },
  { value: 'chasis_6m3', label: 'Chasis 6 m³' },
  { value: 'camion_12m3', label: 'Camión 12 m³' },
  { value: 'camion_15m3', label: 'Camión 15 m³' },
  { value: 'pallet_bolsas', label: 'Pallet de bolsas' },
  { value: 'retiro_proveedor', label: 'Retiro proveedor' },
  { value: 'otro', label: 'Otra' },
];

export const VEHICULOS_ENVIO = [
  { value: 'retiro_cliente', label: 'Retira cliente' },
  { value: 'camion_batea', label: 'Camión batea' },
  { value: 'camion_chasis_6m3', label: 'Camión 6 m³' },
  { value: 'camion_chasis_12m3', label: 'Camión 12 m³' },
  { value: 'flete_tercero', label: 'Flete tercero' },
  { value: 'otro', label: 'Otro' },
];

export const MOVIMIENTO_TIPOS = {
  INGRESO_CAMION: 'ingreso_reposicion',
  VENTA: 'venta',
  AJUSTE_POSITIVO: 'ajuste_positivo',
  AJUSTE_NEGATIVO: 'ajuste_negativo',
  MERMA: 'merma',
  DEVOLUCION: 'devolucion',
  CIERRE_CAJA: 'cierre_caja',
};

export const MOVIMIENTO_LABELS = {
  [MOVIMIENTO_TIPOS.INGRESO_CAMION]: 'Ingreso / reposición',
  [MOVIMIENTO_TIPOS.VENTA]: 'Venta',
  [MOVIMIENTO_TIPOS.AJUSTE_POSITIVO]: 'Ajuste positivo',
  [MOVIMIENTO_TIPOS.AJUSTE_NEGATIVO]: 'Ajuste negativo',
  [MOVIMIENTO_TIPOS.MERMA]: 'Merma',
  [MOVIMIENTO_TIPOS.DEVOLUCION]: 'Devolución / reverso',
  [MOVIMIENTO_TIPOS.CIERRE_CAJA]: 'Cierre de caja',
};

export const MOVIMIENTO_CATEGORIAS = [
  { value: 'ingresos', label: 'Solo ingresos', tipos: [MOVIMIENTO_TIPOS.INGRESO_CAMION] },
  { value: 'ventas', label: 'Solo ventas', tipos: [MOVIMIENTO_TIPOS.VENTA, MOVIMIENTO_TIPOS.DEVOLUCION] },
  { value: 'ajustes', label: 'Solo ajustes', tipos: [MOVIMIENTO_TIPOS.AJUSTE_POSITIVO, MOVIMIENTO_TIPOS.AJUSTE_NEGATIVO, MOVIMIENTO_TIPOS.MERMA] },
  { value: 'cierres', label: 'Solo cierres', tipos: [MOVIMIENTO_TIPOS.CIERRE_CAJA] },
];

export const VENTA_ESTADOS = {
  PENDIENTE: 'pendiente',
  CONFIRMADA: 'confirmada',
  ANULADA: 'anulada',
};

export const VENTA_ENTREGA_ESTADOS = {
  PENDIENTE: 'pendiente',
  ENTREGADA: 'entregada',
  NO_ENTREGADA: 'no_entregada',
};

export const REMITO_ESTADOS = {
  PENDIENTE: 'pendiente',
  EN_CAMINO: 'en_camino',
  ENTREGADO: 'entregado',
  CANCELADO: 'cancelado',
};

export const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'debito', label: 'Débito' },
  { value: 'credito', label: 'Crédito' },
  { value: 'cuenta_corriente', label: 'Cuenta corriente' },
  { value: 'mixto', label: 'Mixto' },
];

export const TIPOS_ENTREGA = [
  { value: 'retiro', label: 'Retira cliente' },
  { value: 'envio', label: 'Se lo llevamos' },
];

export const AJUSTE_TIPOS = [
  { value: MOVIMIENTO_TIPOS.AJUSTE_POSITIVO, label: 'Ajuste positivo' },
  { value: MOVIMIENTO_TIPOS.AJUSTE_NEGATIVO, label: 'Ajuste negativo' },
  { value: MOVIMIENTO_TIPOS.MERMA, label: 'Merma' },
];

export const CLIENTE_GENERICO_NOMBRE = 'Consumidor final';
export const CLIENTE_GENERICO_ALIAS = 'Mostrador / ocasional';
