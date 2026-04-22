import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import AridosPageGuard from '../components/common/AridosPageGuard';
import HomeRedirect from '../pages/HomeRedirect';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import SetupPage from '../pages/SetupPage';
import HelpPage from '../pages/HelpPage';
import NotFoundPage from '../pages/NotFoundPage';
import SetupRouteGuard from '../components/layout/SetupRouteGuard';

import AridosDashboardPage from '../modules/aridos/pages/AridosDashboardPage';
import ProductosPage from '../modules/aridos/pages/ProductosPage';
import BateasPage from '../modules/aridos/pages/BateasPage';
import ProveedoresPage from '../modules/aridos/pages/ProveedoresPage';
import ClientesPage from '../modules/aridos/pages/ClientesPage';
import IngresosCamionPage from '../modules/aridos/pages/IngresosCamionPage';
import VentasPage from '../modules/aridos/pages/VentasPage';
import MovimientosStockPage from '../modules/aridos/pages/MovimientosStockPage';
import AjustesStockPage from '../modules/aridos/pages/AjustesStockPage';
import RemitosPage from '../modules/aridos/pages/RemitosPage';
import ReportesPage from '../modules/aridos/pages/ReportesPage';
import CierreCajaPage from '../modules/aridos/pages/CierreCajaPage';
import AgendaVentasPage from '../modules/aridos/pages/AgendaVentasPage';
import { ARIDOS_SECTIONS } from '../modules/aridos/utils/permissions';

function guard(PageComponent, section) {
  return <AridosPageGuard PageComponent={PageComponent} section={section} />;
}

export const router = createBrowserRouter([
  { path: '/', element: <HomeRedirect /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/registro', element: <RegisterPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'setup', element: <SetupRouteGuard><SetupPage /></SetupRouteGuard> },
      { path: 'ayuda', element: <HelpPage /> },
      { path: 'aridos', element: guard(AridosDashboardPage, ARIDOS_SECTIONS.DASHBOARD) },
      { path: 'aridos/agenda', element: guard(AgendaVentasPage, ARIDOS_SECTIONS.VENTAS) },
      { path: 'aridos/productos', element: guard(ProductosPage, ARIDOS_SECTIONS.PRODUCTOS) },
      { path: 'aridos/bateas', element: guard(BateasPage, ARIDOS_SECTIONS.BATEAS) },
      { path: 'aridos/proveedores', element: guard(ProveedoresPage, ARIDOS_SECTIONS.PROVEEDORES) },
      { path: 'aridos/clientes', element: guard(ClientesPage, ARIDOS_SECTIONS.CLIENTES) },
      { path: 'aridos/ingresos', element: guard(IngresosCamionPage, ARIDOS_SECTIONS.INGRESOS) },
      { path: 'aridos/ventas', element: guard(VentasPage, ARIDOS_SECTIONS.VENTAS) },
      { path: 'aridos/movimientos', element: guard(MovimientosStockPage, ARIDOS_SECTIONS.MOVIMIENTOS) },
      { path: 'aridos/ajustes', element: guard(AjustesStockPage, ARIDOS_SECTIONS.AJUSTES) },
      { path: 'aridos/remitos', element: guard(RemitosPage, ARIDOS_SECTIONS.REMITOS) },
      { path: 'aridos/cierre-caja', element: guard(CierreCajaPage, ARIDOS_SECTIONS.CIERRE_CAJA) },
      { path: 'aridos/reportes', element: guard(ReportesPage, ARIDOS_SECTIONS.REPORTES) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
