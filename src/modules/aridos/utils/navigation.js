import { ARIDOS_SECTIONS, canReadSection } from './permissions';

export const ARIDOS_NAV_ITEMS = [
  { label: 'Ventas', to: '/aridos/ventas', section: ARIDOS_SECTIONS.VENTAS, isPrimary: true },
  { label: 'Reposición', to: '/aridos/ingresos', section: ARIDOS_SECTIONS.INGRESOS, isPrimary: true },
  { label: 'Cierre diario', to: '/aridos/cierre-caja', section: ARIDOS_SECTIONS.CIERRE_CAJA, isPrimary: true },
  { label: 'Dashboard', to: '/aridos', section: ARIDOS_SECTIONS.DASHBOARD },
  { label: 'Agenda', to: '/aridos/agenda', section: ARIDOS_SECTIONS.DASHBOARD },
  { label: 'Clientes', to: '/aridos/clientes', section: ARIDOS_SECTIONS.CLIENTES },
  { label: 'Productos', to: '/aridos/productos', section: ARIDOS_SECTIONS.PRODUCTOS },
  { label: 'Movimientos', to: '/aridos/movimientos', section: ARIDOS_SECTIONS.MOVIMIENTOS },
  { label: 'Reportes', to: '/aridos/reportes', section: ARIDOS_SECTIONS.REPORTES },
  { label: 'Proveedores', to: '/aridos/proveedores', section: ARIDOS_SECTIONS.PROVEEDORES },
  { label: 'Ajustes', to: '/aridos/ajustes', section: ARIDOS_SECTIONS.AJUSTES },
  { label: 'Remitos', to: '/aridos/remitos', section: ARIDOS_SECTIONS.REMITOS },
  { label: 'Bateas', to: '/aridos/bateas', section: ARIDOS_SECTIONS.BATEAS },
];

export function buildAridosNavItems(permissions) {
  return ARIDOS_NAV_ITEMS.filter((item) => canReadSection(permissions, item.section));
}
