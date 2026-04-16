import { fetchCollection } from '../modules/aridos/services/base';
import { createCliente } from '../modules/aridos/services/clientes.service';
import { createProducto } from '../modules/aridos/services/productos.service';
import { createProveedor } from '../modules/aridos/services/proveedores.service';
import { CLIENTE_GENERICO_ALIAS, CLIENTE_GENERICO_NOMBRE } from '../modules/aridos/utils/constants';
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
