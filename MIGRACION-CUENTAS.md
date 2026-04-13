# Refactor a multi-corralón por cuenta

Esta versión ya no usa `/provincias/{id}`.

Ahora toda la operación cuelga de:

- `/cuentas/{cuentaId}`

## Estructura principal

- `/cuentas/{cuentaId}`
- `/cuentas/{cuentaId}/config/app`
- `/cuentas/{cuentaId}/config/usuarios`
- `/cuentas/{cuentaId}/config/permisosAridos`
- `/cuentas/{cuentaId}/productos/{productoId}`
- `/cuentas/{cuentaId}/bateas/{bateaId}`
- `/cuentas/{cuentaId}/clientes/{clienteId}`
- `/cuentas/{cuentaId}/proveedores/{proveedorId}`
- `/cuentas/{cuentaId}/ingresosCamion/{ingresoId}`
- `/cuentas/{cuentaId}/ventas/{ventaId}`
- `/cuentas/{cuentaId}/movimientosStock/{movimientoId}`
- `/cuentas/{cuentaId}/ajustesStock/{ajusteId}`
- `/cuentas/{cuentaId}/remitos/{remitoId}`

## Flujo inicial

1. Entrar al login
2. Cargar `ID del corralón / cuenta`
3. Cargar `Nombre comercial`
4. Ingresar email
5. Ir a `/setup`
6. Inicializar cuenta
7. Cargar datos iniciales

## Rules de desarrollo compatibles con esta app

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cuentas/{cuentaId}/{document=**} {
      allow read, write: if true;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Nota

Esta versión sigue usando login local por email. Para restringir Firestore por usuario real, el paso siguiente es migrar a Firebase Authentication.
