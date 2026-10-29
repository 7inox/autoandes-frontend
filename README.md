# AutoAndes Web

SPA del examen LP2 versión A. Miguel Ángel Tinoco López, UPeU, 29/10/2026.
Angular 22.2.5, TypeScript, componentes standalone, Reactive Forms, FormArray y signals.
Node 24.21.0 y npm 11.19.0 verificados. Toda lista se obtiene de Oracle a través del backend.

## Ejecutar

Backend disponible en http://localhost:8080 y Node compatible con Angular 22.

```powershell
npm ci
npx ng serve
```

Abrir http://localhost:4200. `src/environments/environment.ts` centraliza la URL de la API.
`npm run build` produce el sitio en dist/autoandes-frontend. No se configuran secretos de Oracle ni JWT
en el frontend. La conexión Oracle, YAML y Flyway pertenecen al backend:
https://github.com/7inox/autoandes-backend . Ese README explica las variables DB_PASSWORD y JWT_SECRET,
el baseline del esquema existente y la migración V1 ejecutada en un esquema vacío separado.

## Arquitectura y comportamiento

core: modelos, un servicio HTTP por recurso, auth con signals, guards, interceptores y menú.
shared: directiva siPermiso, páginas 403 y 404. layout: encabezado, navegación y router-outlet.
features: login, servicios, vehículos, órdenes y reportes. Todas las páginas se cargan con loadComponent.
Formulario único para alta/edición en cada CRUD; clientes y filtros desde la API. Carga, vacío y error visibles.
Los 400 se muestran bajo el control mediante campos; 404/409 muestran mensaje del backend.
Dar de baja usa PATCH; eliminar servicio usado muestra 409 del servidor. Anulación requiere motivo y confirmación.

Orden con 1..10 líneas, servicios activos sin repetir, cantidades 1..5 y total visual reactivo.
La SPA envía solo vehículo, kilometraje y servicio/cantidad: el servidor calcula precios y total.
Un 409 conserva las líneas. Consulta envía placa/estado/desde/hasta y presenta el detalle.
Reporte real por periodo; no contiene mocks ni arreglos de datos de negocio escritos a mano.

## Seguridad

Login fuera del layout. AuthService guarda token, permisos y vencimiento en sessionStorage y programa
logout automático. bearerInterceptor agrega el encabezado solo a la API. errorInterceptor redirige
ante 401 con returnUrl, excepto login; 403 conserva sesión. authGuard protege layout,
invitadoGuard evita login estando autenticado y permisoGuard lee data.permiso en cada ruta.
El menú y los botones reaccionan a signals; la API vuelve a validar todos los permisos.
JEFE_TALLER no puede abrir /ordenes/nueva aunque la escriba directamente.

## Pruebas

Con ambos servidores iniciados:

```powershell
npm run test:e2e
```

Playwright usa Chrome instalado en la ruta estándar de Windows. En otro sistema, definir CHROME_PATH.
Tres escenarios pasan: roles y menú sin recarga, 403 con sesión activa, token alterado con 401/returnUrl,
404, guards y cierre automático. El reloj del vencimiento local se acorta a 1,5 s para evitar esperar una hora;
el backend prueba además un JWT firmado que ya venció. No se simulan respuestas HTTP.
Las pruebas verifican también manipulación local de permisos: el backend mantiene el rechazo 403.
Resultados en test-results/resultados.json (salida local excluida de Git).

## Alcance y límites

Se requiere API local y Oracle en ejecución. No hay registro público ni administración de usuarios.
No hay despliegue cloud. Menús no sustituyen autorización del servidor. sessionStorage se borra al cerrar
la pestaña; en estaciones compartidas debe usarse Salir al terminar el turno.
Git: main, develop, examen-a-tinoco; etiqueta v1.0-examen-u2.

## Evaluación y permisos

| Usuario | Contraseña pública de evaluación | Rol | Estado |
|---|---|---|---|
| admin | Auto2026* | ADMIN | Activo |
| asesor | Auto2026* | ASESOR | Activo |
| jefe | Auto2026* | JEFE_TALLER | Activo |
| inactivo | Auto2026* | ASESOR | Inactivo, login rechazado |

ADMIN tiene los ocho permisos. ASESOR: SERVICIO_LEER, VEHICULO_LEER, VEHICULO_ESCRIBIR,
ORDEN_LEER y ORDEN_REGISTRAR. JEFE_TALLER: SERVICIO_LEER, SERVICIO_ESCRIBIR,
VEHICULO_LEER, ORDEN_LEER, ORDEN_ANULAR y REPORTE_VER. Varios roles unen sus permisos.

Contrato y ejemplos: [colección Postman](docs/AutoAndes.postman_collection.json).
La colección no contiene tokens activos ni secretos de infraestructura. Obtener el token mediante login.
Las escrituras manuales de Postman crean registros reales; la prueba JUnit realiza limpieza controlada.
