# Áridos App Standalone

Aplicación web base para corralón / áridos construida con React + Vite + Firebase Firestore.

## Qué incluye

- Productos
- Bateas
- Proveedores
- Clientes
- Ingresos de camión
- Ventas con impacto automático en stock
- Anulación de ventas
- Ajustes de stock
- Remitos
- Dashboard y reportes básicos
- Setup inicial para sembrar acceso y datos de ejemplo

## Stack

- React 19
- Vite
- Firebase Firestore
- Tailwind CSS + DaisyUI

## Instalación

1. Copiá `.env.example` a `.env`
2. Completá tus credenciales de Firebase
3. Instalá dependencias:

```bash
npm install
```

4. Ejecutá en desarrollo:

```bash
npm run dev
```

## Flujo recomendado de arranque

1. Entrá con tu email operativo desde `/login`
2. Andá a `/setup`
3. Tocá `Crear acceso para mi email`
4. Tocá `Cargar datos de ejemplo`
5. Entrá al módulo `/aridos`

## Firestore esperado

La app trabaja sobre esta estructura:

```text
/cuentas/{cuentaId}/productos/{productoId}
/cuentas/{cuentaId}/bateas/{bateaId}
/cuentas/{cuentaId}/clientes/{clienteId}
/cuentas/{cuentaId}/proveedores/{proveedorId}
/cuentas/{cuentaId}/ingresosCamion/{ingresoId}
/cuentas/{cuentaId}/ventas/{ventaId}
/cuentas/{cuentaId}/movimientosStock/{movimientoId}
/cuentas/{cuentaId}/ajustesStock/{ajusteId}
/cuentas/{cuentaId}/remitos/{remitoId}
/cuentas/{cuentaId}/config/usuarios
/cuentas/{cuentaId}/config/permisosAridos
```

## Importante

Esta versión es **standalone**. No depende de tu app previa.

La autenticación de usuario se resuelve por formulario local para arrancar rápido, y el email ingresado se usa para resolver permisos del módulo desde Firestore. Si querés endurecer seguridad real por backend/auth, esa sería la siguiente etapa.

## Reglas e índices

En `firebase/` dejé ejemplos base para Firestore:

- `firebase/firestore.rules.example`
- `firebase/firestore.indexes.example.json`

Revisalos antes de subir a producción.
