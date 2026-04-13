# Cierre diario bloqueante

## Qué se corrigió

El cierre diario dejó de ser solo informativo.

Ahora, cuando existe `cierresCaja/{fechaStr}` para una fecha:

- no se pueden registrar ventas nuevas de esa fecha
- no se pueden anular ventas de esa fecha
- no se pueden registrar reposiciones nuevas de esa fecha
- no se pueden registrar ajustes nuevos de esa fecha

## Dónde se bloquea

### En services
- `src/modules/aridos/services/ventas.service.js`
- `src/modules/aridos/services/ingresosCamion.service.js`
- `src/modules/aridos/services/ajustesStock.service.js`

### En UI
- `src/modules/aridos/components/ventas/VentaForm.jsx`
- `src/modules/aridos/components/ingresos/IngresoCamionForm.jsx`
- `src/modules/aridos/components/ajustes/AjusteStockForm.jsx`
- `src/modules/aridos/pages/CierreCajaPage.jsx`

## Comportamiento esperado

1. Generás el cierre diario para una fecha.
2. La app sigue mostrando el historial y el resumen de ese día.
3. Cualquier intento de registrar ventas, reposición o ajustes en esa fecha devuelve error y además queda bloqueado visualmente.
