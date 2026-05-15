import { ARIDOS_SECTIONS, canReadSection } from './permissions';

export const ARIDOS_NAV_ITEMS = [
  { label: 'Ventas', to: '/aridos/ventas', section: ARIDOS_SECTIONS.VENTAS, isPrimary: true, icon: '💸' },
  { label: 'Reposición', to: '/aridos/ingresos', section: ARIDOS_SECTIONS.INGRESOS, isPrimary: true, icon: '📦' },
  { label: 'Cierre diario', to: '/aridos/cierre-caja', section: ARIDOS_SECTIONS.CIERRE_CAJA, isPrimary: true, icon: '🧾' },
  { label: 'Dashboard', to: '/aridos', section: ARIDOS_SECTIONS.DASHBOARD, icon: '📊' },
  { label: 'Agenda', to: '/aridos/agenda', section: ARIDOS_SECTIONS.VENTAS, icon: '🗓️' },
  { label: 'Clientes', to: '/aridos/clientes', section: ARIDOS_SECTIONS.CLIENTES, icon: '👥' },
  { label: 'Cuentas corrientes', to: '/aridos/cuentas-corrientes', section: ARIDOS_SECTIONS.CLIENTES, icon: '💳' },
  { label: 'Productos', to: '/aridos/productos', section: ARIDOS_SECTIONS.PRODUCTOS, icon: '🪨' },
  { label: 'Movimientos', to: '/aridos/movimientos', section: ARIDOS_SECTIONS.MOVIMIENTOS, icon: '🔁' },
  { label: 'Reportes', to: '/aridos/reportes', section: ARIDOS_SECTIONS.REPORTES, icon: '📈' },
  { label: 'Proveedores', to: '/aridos/proveedores', section: ARIDOS_SECTIONS.PROVEEDORES, icon: '🚚' },
  { label: 'Ajustes', to: '/aridos/ajustes', section: ARIDOS_SECTIONS.AJUSTES, icon: '🛠️' },
  { label: 'Remitos', to: '/aridos/remitos', section: ARIDOS_SECTIONS.REMITOS, icon: '📄' },
  { label: 'Bateas', to: '/aridos/bateas', section: ARIDOS_SECTIONS.BATEAS, icon: '🚛' },
];

export function buildAridosNavItems(permissions) {
  return ARIDOS_NAV_ITEMS.filter((item) => canReadSection(permissions, item.section));
}
