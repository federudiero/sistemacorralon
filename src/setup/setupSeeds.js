import { fetchCollection } from '../modules/aridos/services/base';
import { createAjusteStock } from '../modules/aridos/services/ajustesStock.service';
import { createBatea } from '../modules/aridos/services/bateas.service';
import { createCliente } from '../modules/aridos/services/clientes.service';
import { createIngresoCamion } from '../modules/aridos/services/ingresosCamion.service';
import { createProducto } from '../modules/aridos/services/productos.service';
import { createProveedor } from '../modules/aridos/services/proveedores.service';
import { createRemitoDesdeVenta } from '../modules/aridos/services/remitos.service';
import { createVenta } from '../modules/aridos/services/ventas.service';
import { CLIENTE_GENERICO_ALIAS, CLIENTE_GENERICO_NOMBRE, MOVIMIENTO_TIPOS } from '../modules/aridos/utils/constants';
import { syncOwnerAccount } from '../services/authBootstrap.service';

const SAMPLE_PRODUCTOS = [
  { nombre: 'Arena Gruesa', categoria: 'Áridos', unidadStock: 'm3', precioVenta: 25000, costoActual: 18000, costoPromedio: 18000, stockMinimo: 8, stockActual: 0 },
  { nombre: 'Arena Fina', categoria: 'Áridos', unidadStock: 'm3', precioVenta: 24500, costoActual: 17500, costoPromedio: 17500, stockMinimo: 8, stockActual: 0 },
  { nombre: 'Piedra 6/20', categoria: 'Piedras', unidadStock: 'm3', precioVenta: 32000, costoActual: 24000, costoPromedio: 24000, stockMinimo: 6, stockActual: 0 },
  { nombre: 'Piedra partida 10/30', categoria: 'Piedras', unidadStock: 'm3', precioVenta: 33500, costoActual: 25000, costoPromedio: 25000, stockMinimo: 6, stockActual: 0 },
  { nombre: 'Big bag arena', categoria: 'Big bag', unidadStock: 'unidad', precioVenta: 28000, costoActual: 22000, costoPromedio: 22000, stockMinimo: 2, stockActual: 0 },
  { nombre: 'Bolsa de piedra decorativa', categoria: 'Bolsas', unidadStock: 'bolsa', pesoBolsaKg: 20, precioVenta: 8500, costoActual: 6200, costoPromedio: 6200, stockMinimo: 10, stockActual: 0 },
];

const SAMPLE_CLIENTES = [
  { nombre: CLIENTE_GENERICO_NOMBRE, alias: CLIENTE_GENERICO_ALIAS, telefono: '', direccion: '', cuitDni: '', saldoCuentaCorriente: 0, limiteCuentaCorriente: 0, activo: true, esGenerico: true },
  { nombre: 'Cliente Mostrador', telefono: '', direccion: '', cuitDni: '', saldoCuentaCorriente: 0, limiteCuentaCorriente: 0, activo: true },
];

const SAMPLE_PROVEEDORES = [
  { nombre: 'Cantera Norte', telefono: '', direccion: '', cuit: '', activo: true },
];

export async function seedAccessConfig(cuentaId, email, cuentaNombre = '', name = '') {
  if (!cuentaId) throw new Error('Falta el ID de la cuenta/corralón.');
  if (!email) throw new Error('Falta el email del usuario owner.');

  await syncOwnerAccount({
    cuentaId,
    cuentaNombre,
    name,
  });
}

export async function seedFullCircuit(cuentaId, email) {
  // ── 1. Proveedores ──────────────────────────────────────────────────────────
  await createProveedor(cuentaId, { nombre: 'Cantera del Sur', telefono: '341-555-0001', activo: true });
  await createProveedor(cuentaId, { nombre: 'Distribuidora Norte', telefono: '341-555-0002', activo: true });

  // ── 2. Clientes ─────────────────────────────────────────────────────────────
  await createCliente(cuentaId, {
    nombre: 'Roberto Silva',
    telefono: '341-444-1122',
    direccion: 'Av. San Martín 456, Rosario',
    saldoCuentaCorriente: 0,
    limiteCuentaCorriente: 50000,
    activo: true,
  });
  await createCliente(cuentaId, {
    nombre: 'Construcciones López S.R.L.',
    telefono: '341-444-3344',
    direccion: 'Calle Rivadavia 123, Rosario',
    cuitDni: '30-71234567-9',
    saldoCuentaCorriente: 0,
    limiteCuentaCorriente: 200000,
    activo: true,
  });

  // ── 3. Productos ─────────────────────────────────────────────────────────────
  const toscaId = await createProducto(cuentaId, {
    nombre: 'Tosca',
    categoria: 'Áridos',
    unidadStock: 'm3',
    precioVenta: 18000,
    costoActual: 12000,
    costoPromedio: 12000,
    stockMinimo: 10,
  }, email);

  const bolsonId = await createProducto(cuentaId, {
    nombre: 'Bolsón de arena 30kg',
    categoria: 'Bolsas',
    unidadStock: 'bolsa',
    pesoBolsaKg: 30,
    precioVenta: 9500,
    costoActual: 6500,
    costoPromedio: 6500,
    stockMinimo: 20,
  }, email);

  const piedraId = await createProducto(cuentaId, {
    nombre: 'Canto rodado',
    categoria: 'Piedras',
    unidadStock: 'm3',
    precioVenta: 28000,
    costoActual: 19000,
    costoPromedio: 19000,
    stockMinimo: 5,
  }, email);

  // ── 4. Bateas ────────────────────────────────────────────────────────────────
  await createBatea(cuentaId, {
    nombre: 'Batea A',
    codigo: 'BT-01',
    capacidadM3: 50,
    productoId: toscaId,
    productoNombre: 'Tosca',
    observaciones: 'Frente al galpón principal',
  }, email);

  await createBatea(cuentaId, {
    nombre: 'Batea B',
    codigo: 'BT-02',
    capacidadM3: 30,
    productoId: piedraId,
    productoNombre: 'Canto rodado',
  }, email);

  // ── 5. Ingresos de camión ────────────────────────────────────────────────────
  await createIngresoCamion(cuentaId, {
    proveedorNombre: 'Cantera del Sur',
    productoId: toscaId,
    productoNombre: 'Tosca',
    unidadStock: 'm3',
    cantidad: 120,
    costoUnitario: 12000,
    patente: 'AB 123 CD',
    chofer: 'Juan Pérez',
    remitoNumero: 'REM-0042',
    observaciones: 'Carga completa, buen estado',
  }, email);

  await createIngresoCamion(cuentaId, {
    proveedorNombre: 'Distribuidora Norte',
    productoId: bolsonId,
    productoNombre: 'Bolsón de arena 30kg',
    unidadStock: 'bolsa',
    cantidad: 60,
    costoUnitario: 6500,
    patente: 'XY 456 ZW',
    chofer: 'Pedro García',
    remitoNumero: 'REM-0107',
  }, email);

  await createIngresoCamion(cuentaId, {
    proveedorNombre: 'Cantera del Sur',
    productoId: piedraId,
    productoNombre: 'Canto rodado',
    unidadStock: 'm3',
    cantidad: 40,
    costoUnitario: 19000,
    patente: 'AB 123 CD',
    chofer: 'Juan Pérez',
  }, email);

  // ── 6. Ajustes de stock ──────────────────────────────────────────────────────
  await createAjusteStock(cuentaId, {
    productoId: toscaId,
    productoNombre: 'Tosca',
    unidadStock: 'm3',
    tipo: MOVIMIENTO_TIPOS.AJUSTE_POSITIVO,
    cantidad: 5,
    motivo: 'Corrección de inventario — carga extra del proveedor',
  }, email);

  await createAjusteStock(cuentaId, {
    productoId: toscaId,
    productoNombre: 'Tosca',
    unidadStock: 'm3',
    tipo: MOVIMIENTO_TIPOS.MERMA,
    cantidad: 2,
    motivo: 'Merma por lluvia durante el fin de semana',
  }, email);

  await createAjusteStock(cuentaId, {
    productoId: piedraId,
    productoNombre: 'Canto rodado',
    unidadStock: 'm3',
    tipo: MOVIMIENTO_TIPOS.AJUSTE_NEGATIVO,
    cantidad: 1,
    motivo: 'Diferencia de medición en batea',
  }, email);

  // ── 7. Ventas ────────────────────────────────────────────────────────────────
  const venta1Id = await createVenta(cuentaId, {
    clienteNombre: 'Cliente Mostrador',
    productoId: toscaId,
    productoNombre: 'Tosca',
    unidadStock: 'm3',
    cantidad: 8,
    precioUnitario: 18000,
    tipoEntrega: 'retiro',
    metodoPago: 'efectivo',
    observaciones: 'Pago en mano',
  }, email);

  const venta2Id = await createVenta(cuentaId, {
    clienteNombre: 'Roberto Silva',
    productoId: bolsonId,
    productoNombre: 'Bolsón de arena 30kg',
    unidadStock: 'bolsa',
    cantidad: 10,
    precioUnitario: 9500,
    tipoEntrega: 'envio',
    envioMonto: 3000,
    metodoPago: 'transferencia',
    vehiculoEntrega: 'camioneta Ford Transit',
    direccion: 'Av. San Martín 456, Rosario',
    telefono: '341-444-1122',
    observaciones: 'Entregar por la mañana',
  }, email);

  const venta3Id = await createVenta(cuentaId, {
    clienteNombre: 'Construcciones López S.R.L.',
    productoId: toscaId,
    productoNombre: 'Tosca',
    unidadStock: 'm3',
    cantidad: 30,
    precioUnitario: 18000,
    tipoEntrega: 'envio',
    envioMonto: 6000,
    metodoPago: 'cheque',
    vehiculoEntrega: 'camión Volvo ABC 456',
    direccion: 'Calle Rivadavia 123, Rosario',
    telefono: '341-444-3344',
    observaciones: 'Obra en curso — confirmar horario',
  }, email);

  await createVenta(cuentaId, {
    clienteNombre: 'Cliente Mostrador',
    productoId: piedraId,
    productoNombre: 'Canto rodado',
    unidadStock: 'm3',
    cantidad: 5,
    precioUnitario: 28000,
    tipoEntrega: 'retiro',
    metodoPago: 'transferencia',
  }, email);

  // ── 8. Remitos ───────────────────────────────────────────────────────────────
  if (venta2Id) {
    await createRemitoDesdeVenta(cuentaId, venta2Id, {
      camion: 'camioneta Ford Transit',
      chofer: 'Carlos Gómez',
      observaciones: 'Entregar por la mañana',
    }, email);
  }

  if (venta3Id) {
    await createRemitoDesdeVenta(cuentaId, venta3Id, {
      camion: 'camión Volvo ABC 456',
      chofer: 'Luis Martínez',
      observaciones: 'Confirmar horario con el cliente antes de salir',
    }, email);
  }
}

export async function seedSampleData(cuentaId, email) {
  const [productos, clientes, proveedores] = await Promise.all([
    fetchCollection(cuentaId, 'productos', { limit: 1 }),
    fetchCollection(cuentaId, 'clientes', { limit: 1 }),
    fetchCollection(cuentaId, 'proveedores', { limit: 1 }),
  ]);

  if (!productos.length) {
    for (const producto of SAMPLE_PRODUCTOS) {
      await createProducto(cuentaId, producto, email);
    }
  }

  if (!clientes.length) {
    for (const cliente of SAMPLE_CLIENTES) {
      await createCliente(cuentaId, cliente);
    }
  }

  if (!proveedores.length) {
    for (const proveedor of SAMPLE_PROVEEDORES) {
      await createProveedor(cuentaId, proveedor);
    }
  }
}
