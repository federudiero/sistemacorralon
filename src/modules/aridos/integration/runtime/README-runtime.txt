Estos archivos son la base runtime para enchufar el módulo a tu app.

Uso esperado:
1) Implementar useAridosAppBindings() leyendo tu AuthContext y tu CuentaContext reales.
2) Montar AridosAppRuntime como wrapper de las rutas del módulo.
3) Generar ítems de navegación con createAridosNavItems().
4) Usar createAridosFeatureRoutes() para construir las rutas del módulo.

La idea es que el módulo no lea directamente contextos de tu app, sino un binding único.
