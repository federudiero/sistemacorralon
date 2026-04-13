import { ARIDOS_SECTIONS, canReadSection } from './permissions';

export const ARIDOS_NAV_ITEMS = [
  { label: 'Dashboard', to: '/aridos', section: ARIDOS_SECTIONS.DASHBOARD },
  { label: 'Productos', to: '/aridos/productos', section: ARIDOS_SECTIONS.PRODUCTOS },
  { label: 'Proveedores', to: '/aridos/proveedores', section: ARIDOS_SECTIONS.PROVEEDORES },
  { label: 'Clientes', to: '/aridos/clientes', section: ARIDOS_SECTIONS.CLIENTES },
  { label: 'Reposición', to: '/aridos/ingresos', section: ARIDOS_SECTIONS.INGRESOS },
  { label: 'Ventas', to: '/aridos/ventas', section: ARIDOS_SECTIONS.VENTAS },
  { label: 'Movimientos', to: '/aridos/movimientos', section: ARIDOS_SECTIONS.MOVIMIENTOS },
  { label: 'Ajustes', to: '/aridos/ajustes', section: ARIDOS_SECTIONS.AJUSTES },
  { label: 'Remitos', to: '/aridos/remitos', section: ARIDOS_SECTIONS.REMITOS },
  { label: 'Cierre diario', to: '/aridos/cierre-caja', section: ARIDOS_SECTIONS.CIERRE_CAJA },
  { label: 'Reportes', to: '/aridos/reportes', section: ARIDOS_SECTIONS.REPORTES },
];

export function buildAridosNavItems(permissions) {
  return ARIDOS_NAV_ITEMS.filter((item) => canReadSection(permissions, item.section));
}
