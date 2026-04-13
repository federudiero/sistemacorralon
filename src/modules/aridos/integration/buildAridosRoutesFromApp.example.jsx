import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAridosAppBindings } from './useAridosAppBindings.example';
import AridosGate from '../security/AridosGate';
import AridosDashboardPage from '../pages/AridosDashboardPage';
import ProductosPage from '../pages/ProductosPage';
import BateasPage from '../pages/BateasPage';
import ProveedoresPage from '../pages/ProveedoresPage';
import ClientesPage from '../pages/ClientesPage';
import IngresosCamionPage from '../pages/IngresosCamionPage';
import VentasPage from '../pages/VentasPage';
import MovimientosStockPage from '../pages/MovimientosStockPage';
import AjustesStockPage from '../pages/AjustesStockPage';
import RemitosPage from '../pages/RemitosPage';
import ReportesPage from '../pages/ReportesPage';
import { ARIDOS_ACTIONS, ARIDOS_SECTIONS } from '../utils/permissions';

function Guarded({ section, action = ARIDOS_ACTIONS.READ, PageComponent }) {
  const { cuentaId, currentUserEmail, loading, ready } = useAridosAppBindings();

  if (loading) {
    return (
      <div className="min-h-[280px] grid place-items-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!ready) {
    return null;
  }

  return (
    <AridosGate
      cuentaId={cuentaId}
      currentUserEmail={currentUserEmail}
      section={section}
      action={action}
    >
      {(security) => (
        <PageComponent
          cuentaId={cuentaId}
          currentUserEmail={currentUserEmail}
          security={security}
        />
      )}
    </AridosGate>
  );
}

export function buildAridosRoutesFromApp() {
  return [
    { path: '/aridos', element: <Guarded section={ARIDOS_SECTIONS.DASHBOARD} PageComponent={AridosDashboardPage} /> },
    { path: '/aridos/productos', element: <Guarded section={ARIDOS_SECTIONS.PRODUCTOS} PageComponent={ProductosPage} /> },
    { path: '/aridos/bateas', element: <Guarded section={ARIDOS_SECTIONS.BATEAS} PageComponent={BateasPage} /> },
    { path: '/aridos/proveedores', element: <Guarded section={ARIDOS_SECTIONS.PROVEEDORES} PageComponent={ProveedoresPage} /> },
    { path: '/aridos/clientes', element: <Guarded section={ARIDOS_SECTIONS.CLIENTES} PageComponent={ClientesPage} /> },
    { path: '/aridos/ingresos', element: <Guarded section={ARIDOS_SECTIONS.INGRESOS} PageComponent={IngresosCamionPage} /> },
    { path: '/aridos/ventas', element: <Guarded section={ARIDOS_SECTIONS.VENTAS} PageComponent={VentasPage} /> },
    { path: '/aridos/movimientos', element: <Guarded section={ARIDOS_SECTIONS.MOVIMIENTOS} PageComponent={MovimientosStockPage} /> },
    { path: '/aridos/ajustes', element: <Guarded section={ARIDOS_SECTIONS.AJUSTES} PageComponent={AjustesStockPage} /> },
    { path: '/aridos/remitos', element: <Guarded section={ARIDOS_SECTIONS.REMITOS} PageComponent={RemitosPage} /> },
    { path: '/aridos/reportes', element: <Guarded section={ARIDOS_SECTIONS.REPORTES} PageComponent={ReportesPage} /> },
    { path: '*', element: <Navigate to='/aridos' replace /> },
  ];
}
