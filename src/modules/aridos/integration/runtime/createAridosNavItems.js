export function createAridosNavItems({ hasSectionAccess, basePath = "/aridos" }) {
  const items = [
    { key: "dashboard", label: "Áridos", to: basePath },
    { key: "productos", label: "Productos", to: `${basePath}/productos` },
    { key: "bateas", label: "Bateas", to: `${basePath}/bateas` },
    { key: "clientes", label: "Clientes", to: `${basePath}/clientes` },
    { key: "proveedores", label: "Proveedores", to: `${basePath}/proveedores` },
    { key: "ingresos", label: "Ingresos", to: `${basePath}/ingresos` },
    { key: "ventas", label: "Ventas", to: `${basePath}/ventas` },
    { key: "movimientos", label: "Movimientos", to: `${basePath}/movimientos` },
    { key: "ajustes", label: "Ajustes", to: `${basePath}/ajustes` },
    { key: "remitos", label: "Remitos", to: `${basePath}/remitos` },
    { key: "reportes", label: "Reportes", to: `${basePath}/reportes` },
  ];

  return items.filter((item) => hasSectionAccess(item.key));
}
