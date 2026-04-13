// FASE 7
// Este archivo sigue siendo válido si querés inyectar cuentaId y currentUserEmail desde afuera.
// Si preferís resolverlos dentro de la app, mirá integration/buildAridosRoutesFromApp.example.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import AridosGate from './security/AridosGate';
import AridosDashboardPage from './pages/AridosDashboardPage';
import ProductosPage from './pages/ProductosPage';
import BateasPage from './pages/BateasPage';
import ProveedoresPage from './pages/ProveedoresPage';
import ClientesPage from './pages/ClientesPage';
import IngresosCamionPage from './pages/IngresosCamionPage';
import VentasPage from './pages/VentasPage';
import MovimientosStockPage from './pages/MovimientosStockPage';
import AjustesStockPage from './pages/AjustesStockPage';
import RemitosPage from './pages/RemitosPage';
import ReportesPage from './pages/ReportesPage';
import { ARIDOS_ACTIONS, ARIDOS_SECTIONS } from './utils/permissions';

function buildGuardedElement(PageComponent, { cuentaId, currentUserEmail, section, action = ARIDOS_ACTIONS.READ }) {
  return (
    <AridosGate cuentaId={cuentaId} currentUserEmail={currentUserEmail} section={section} action={action}>
      {(security) => <PageComponent cuentaId={cuentaId} currentUserEmail={currentUserEmail} security={security} />}
    </AridosGate>
  );
}

export function buildAridosRoutes({ cuentaId, currentUserEmail }) {
  return [
    { path: '/aridos', element: buildGuardedElement(AridosDashboardPage, { cuentaId, currentUserEmail, section: ARIDOS_SECTIONS.DASHBOARD }) },
    { path: '/aridos/productos', element: buildGuardedElement(ProductosPage, { cuentaId, currentUserEmail, section: ARIDOS_SECTIONS.PRODUCTOS }) },
    { path: '/aridos/bateas', element: buildGuardedElement(BateasPage, { cuentaId, currentUserEmail, section: ARIDOS_SECTIONS.BATEAS }) },
    { path: '/aridos/proveedores', element: buildGuardedElement(ProveedoresPage, { cuentaId, currentUserEmail, section: ARIDOS_SECTIONS.PROVEEDORES }) },
    { path: '/aridos/clientes', element: buildGuardedElement(ClientesPage, { cuentaId, currentUserEmail, section: ARIDOS_SECTIONS.CLIENTES }) },
    { path: '/aridos/ingresos', element: buildGuardedElement(IngresosCamionPage, { cuentaId, currentUserEmail, section: ARIDOS_SECTIONS.INGRESOS }) },
    { path: '/aridos/ventas', element: buildGuardedElement(VentasPage, { cuentaId, currentUserEmail, section: ARIDOS_SECTIONS.VENTAS }) },
    { path: '/aridos/movimientos', element: buildGuardedElement(MovimientosStockPage, { cuentaId, currentUserEmail, section: ARIDOS_SECTIONS.MOVIMIENTOS }) },
    { path: '/aridos/ajustes', element: buildGuardedElement(AjustesStockPage, { cuentaId, currentUserEmail, section: ARIDOS_SECTIONS.AJUSTES }) },
    { path: '/aridos/remitos', element: buildGuardedElement(RemitosPage, { cuentaId, currentUserEmail, section: ARIDOS_SECTIONS.REMITOS }) },
    { path: '/aridos/reportes', element: buildGuardedElement(ReportesPage, { cuentaId, currentUserEmail, section: ARIDOS_SECTIONS.REPORTES }) },
    { path: '*', element: <Navigate to='/aridos' replace /> },
  ];
}
