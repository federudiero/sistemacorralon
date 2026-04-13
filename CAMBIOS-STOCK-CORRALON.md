# Cambios aplicados al modelo operativo del corralón

## Qué cambió

### 1. Stock por producto
El stock ya no depende de una batea obligatoria.
Ahora el stock vive en cada producto y se actualiza con:
- reposición
- venta
- ajuste
- anulación de venta

### 2. Productos con distintas unidades
Cada producto puede trabajar con:
- m3
- unidad
- bolsa

Si el producto es tipo bolsa, se puede definir peso entre 1 y 25 kg.

### 3. Reposición operativa
La pantalla de ingresos quedó pensada para registrar reposición por:
- batea de 20 a 24 m3
- big bag 1 m3
- camión chasis 6 m3
- otro ingreso

La reposición suma stock directo al producto.

### 4. Ventas operativas
La venta ya no pide batea.
Ahora permite:
- retiro en corralón
- envío
- vehículo/logística de entrega

### 5. Bateas como módulo opcional
La sección de bateas quedó fuera del flujo principal y de la navegación.
No es obligatoria para operar.

## Colecciones que usa el flujo principal
- /cuentas/{cuentaId}/productos
- /cuentas/{cuentaId}/proveedores
- /cuentas/{cuentaId}/clientes
- /cuentas/{cuentaId}/ingresosCamion
- /cuentas/{cuentaId}/ventas
- /cuentas/{cuentaId}/movimientosStock
- /cuentas/{cuentaId}/ajustesStock
- /cuentas/{cuentaId}/remitos
- /cuentas/{cuentaId}/config/app
- /cuentas/{cuentaId}/config/usuarios
- /cuentas/{cuentaId}/config/permisosAridos
