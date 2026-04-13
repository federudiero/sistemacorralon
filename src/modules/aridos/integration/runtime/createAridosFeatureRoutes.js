import React from "react";
import AridosGate from "../../security/AridosGate";
import AridosDashboardPage from "../../pages/AridosDashboardPage";
import ProductosPage from "../../pages/ProductosPage";
import BateasPage from "../../pages/BateasPage";
import ClientesPage from "../../pages/ClientesPage";
import ProveedoresPage from "../../pages/ProveedoresPage";
import IngresosCamionPage from "../../pages/IngresosCamionPage";
import VentasPage from "../../pages/VentasPage";
import MovimientosStockPage from "../../pages/MovimientosStockPage";
import AjustesStockPage from "../../pages/AjustesStockPage";
import RemitosPage from "../../pages/RemitosPage";
import ReportesPage from "../../pages/ReportesPage";

function wrap(section, element) {
  return <AridosGate sectionKey={section}>{element}</AridosGate>;
}

export function createAridosFeatureRoutes(basePath = "/aridos") {
  return [
    { path: basePath, element: wrap("dashboard", <AridosDashboardPage />) },
    { path: `${basePath}/productos`, element: wrap("productos", <ProductosPage />) },
    { path: `${basePath}/bateas`, element: wrap("bateas", <BateasPage />) },
    { path: `${basePath}/clientes`, element: wrap("clientes", <ClientesPage />) },
    { path: `${basePath}/proveedores`, element: wrap("proveedores", <ProveedoresPage />) },
    { path: `${basePath}/ingresos`, element: wrap("ingresos", <IngresosCamionPage />) },
    { path: `${basePath}/ventas`, element: wrap("ventas", <VentasPage />) },
    { path: `${basePath}/movimientos`, element: wrap("movimientos", <MovimientosStockPage />) },
    { path: `${basePath}/ajustes`, element: wrap("ajustes", <AjustesStockPage />) },
    { path: `${basePath}/remitos`, element: wrap("remitos", <RemitosPage />) },
    { path: `${basePath}/reportes`, element: wrap("reportes", <ReportesPage />) },
  ];
}
