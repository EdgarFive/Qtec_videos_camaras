# QTEC · Archivo público de grabaciones

Sitio estático en español para consultar videos de una carpeta pública de Google Drive, buscar por nombre, filtrar por fecha y reproducir una grabación mediante la vista previa de Drive. HTML, CSS y JavaScript nativos, sin dependencias ni servidor de producción.

**Estado (4 de noviembre de 2026):** interfaz simplificada, sin barra lateral ni tarjetas de estadísticas. La carpeta proporcionada ya está configurada. Como falta la clave de API, se muestra la carpeta mediante la vista de Drive, sin registros ficticios. No se ha publicado el sitio.

### Vista de carpeta sin clave

`useFolderViewWithoutKey: true` muestra `drive.google.com/embeddedfolderview` cuando existe un ID de carpeta válido y la clave está vacía. Los archivos se abren en Google Drive; en esta vista no se ofrecen el reproductor propio, la búsqueda ni los filtros del sitio. La vista se recarga con el botón Actualizar y cada cinco minutos si la pestaña está visible, lo cual reinicia la navegación de la carpeta. No puede inspeccionarse su contenido desde JavaScript por ser de otro origen. El enlace **Abrir en Drive** permanece disponible si la incrustación no carga o requiere permisos.

Al añadir una clave pública restringida en `js/config.js`, el sitio pasa automáticamente al catálogo integrado con reproductor y filtros descrito a continuación. Los errores de la API no cambian a la vista de carpeta ni a la demo. No se ha verificado reproducción real con API.

## 1. Funcionamiento

Al abrir el sitio se consulta `GET https://www.googleapis.com/drive/v3/files` (`files.list`). La consulta busca los hijos directos de la carpeta con MIME `video/*` que no estén en la papelera y pide solo los metadatos necesarios. Se recorren todas las páginas, incluso páginas vacías que tengan continuación, y se eliminan duplicados por ID. Las subcarpetas y los accesos directos no se recorren.

El catálogo completo se organiza y filtra localmente; la interfaz presenta seis videos por página. Solo se crea un iframe al seleccionar un video real. La sincronización conserva el reproductor activo, salvo que su archivo desaparezca del catálogo. No se guardan copias de los videos en GitHub ni se descarga el archivo completo antes de iniciar la vista previa.

Una pestaña visible vuelve a consultar cada cinco minutos. Las pestañas ocultas suspenden las consultas; al regresar se actualiza si corresponde. El botón permite una consulta manual con al menos 30 segundos entre consultas exitosas. No se ejecuta nada cuando la página está cerrada: el siguiente visitante obtiene el catálogo al abrirla. Las nuevas subidas no necesitan commits, archivos de índices ni despliegues adicionales.

Las solicitudes simultáneas se agrupan en una promesa. Los fallos temporales de red, servidor y cuota tienen como máximo dos reintentos con espera exponencial y variación aleatoria. Después de un fallo hay una pausa creciente de 1 a 30 minutos; se respeta `Retry-After` incluso si exige esperar más. Un 403 de permisos no se reintenta dentro de la misma consulta. El catálogo anterior se conserva si una sincronización falla. Las pausas y el control de concurrencia son por pestaña; varios visitantes comparten la cuota de la clave.

## 2. Mantener el costo Q0

Utiliza un repositorio **público en GitHub Free**, GitHub Pages y un proyecto de Google Cloud **sin cuenta de facturación vinculada**. No actives pruebas con créditos, no registres métodos de pago para este proyecto, no solicites ampliaciones de cuota, no uses proxies, funciones cloud, bases de datos ni servicios adicionales.

La documentación de Google consultada el **23 de octubre de 2026** describe cuotas nuevas desde mayo de 2026 y anuncia cobros por encima de umbrales diarios para más adelante en 2026. Por eso **no debe asumirse que cualquier volumen de Drive API es gratuito**. Consulta los valores aplicables a tu proyecto en **APIs y servicios → Google Drive API → Cuotas y límites del sistema** y la [documentación oficial de límites](https://developers.google.com/workspace/drive/api/guides/limits). La aplicación acepta una interrupción al llegar al límite; no compra capacidad ni modifica cuotas. Los límites y condiciones del proveedor pueden cambiar.

Para evitar cobros, mantén el proyecto desvinculado de facturación. Un presupuesto o alerta de gasto **no equivale a un bloqueo de cobros**. Si Google exige habilitar facturación para una operación, detente: no la habilites para este proyecto. Una alternativa gratuita es enlazar o incrustar la carpeta pública directamente desde Drive, perdiendo el catálogo personalizado. La demostración local también funciona sin Google Cloud.

Cada sincronización normal usa `ceil(cantidad de videos / 1000)` solicitudes, como mínimo una; los reintentos consumen cuota adicional. Una pestaña abierta y visible hace unas 12 sincronizaciones por hora más la inicial y las manuales. El consumo aumenta con el número de visitantes y pestañas. Este control en el navegador reduce tráfico, pero no puede imponer una cuota global ni evitar que alguien copie una clave pública. Restringe la clave y revisa el consumo en la consola. La reproducción tiene además límites propios de Drive y no ofrece disponibilidad ilimitada.

El almacenamiento de Drive se gestiona aparte. Esta aplicación no contrata ni amplía ese almacenamiento.

## 3. Preparar la carpeta pública de Drive

1. Crea una carpeta destinada a las grabaciones.
2. En **Compartir → Acceso general**, elige **Cualquier persona con el enlace → Lector**.
3. Sube los videos directamente a esa carpeta. Verifica que hereden el acceso público y que no tengan restricciones particulares de visualización.
4. Abre la carpeta y uno de sus videos en una ventana privada, sin iniciar sesión. Deben ser visibles y reproducibles. Si tu organización bloquea enlaces públicos, esta arquitectura no funcionará con esa carpeta.
5. Permite que Drive procese las nuevas subidas para la reproducción compartida.

Con un enlace como `https://drive.google.com/drive/folders/ID_DE_TU_CARPETA`, copia únicamente `ID_DE_TU_CARPETA`. Si incluye `?resourcekey=...`, copia también ese valor en `folderResourceKey`. El código admite claves de recurso para enlaces sujetos a la actualización de seguridad de Drive.

## 4. Crear Google Cloud sin facturación y habilitar la API

1. Entra a [Google Cloud Console](https://console.cloud.google.com/) con tu cuenta.
2. En el selector de proyectos elige **Nuevo proyecto**, asígnale un nombre y créalo sin vincular una cuenta de facturación. Si tu organización vincula facturación automáticamente, utiliza un proyecto independiente sin esa vinculación antes de continuar.
3. Selecciona el proyecto correcto y abre **Facturación**. Comprueba que no tiene una cuenta vinculada y que la facturación no está habilitada. No pulses **Vincular cuenta**, **Activar** ni **Iniciar prueba gratuita**.
4. En **APIs y servicios → Biblioteca**, busca **Google Drive API** y pulsa **Habilitar**. No habilites APIs adicionales.
5. Consulta las cuotas y límites disponibles; conserva los límites gratuitos. Si se exige facturación, detente y utiliza la alternativa del apartado anterior.

La interfaz de Google puede cambiar. Sigue la [guía oficial para verificar el estado de facturación](https://docs.cloud.google.com/billing/docs/how-to/verify-billing-enabled), seleccionando siempre el proyecto de esta aplicación. La página web no tiene acceso para comprobar ni modificar ese estado.

## 5. Obtener y restringir una clave pública

En **APIs y servicios → Credenciales → Crear credenciales → Clave de API**:

1. En **Restricciones de aplicaciones**, selecciona **Sitios web / referentes HTTP**.
2. Autoriza únicamente tu origen de GitHub Pages, por ejemplo `https://TU_USUARIO.github.io/*`. Si tienes un dominio propio, añade su origen específico.
3. Para desarrollo puedes usar otra clave igualmente restringida y autorizar `http://127.0.0.1:4173/*` y/o `http://localhost:4173/*`. Retira esos orígenes de la clave de producción cuando no sean necesarios.
4. En **Restricciones de API**, elige **Restringir clave → Google Drive API**. Guarda los cambios y permite unos minutos de propagación.

Los navegadores suelen enviar solo el origen como referente en solicitudes entre sitios. Por eso una restricción limitada a la ruta `https://TU_USUARIO.github.io/REPOSITORIO/*` puede fallar; usa el origen de tu usuario y no un comodín para todo `github.io`. El sitio envía la política `strict-origin-when-cross-origin` para conservar ese origen.

La clave en `js/config.js` será visible para cualquier visitante. No es una contraseña ni restringe el acceso a una única carpeta: identifica el proyecto para la cuota. No incluyas OAuth, tokens, secretos de clientes, claves de cuentas de servicio ni archivos JSON privados. Esta aplicación solo envía GET de metadatos; no tiene operaciones de escritura. Las restricciones son esenciales y no convierten la clave en un secreto. Consulta la [guía oficial de restricciones](https://docs.cloud.google.com/api-keys/docs/add-restrictions-api-keys).

## 6. Configurar el proyecto

Edita `js/config.js`:

```js
folderId: 'ID_DE_TU_CARPETA',
apiKey: 'TU_CLAVE_PUBLICA_RESTRINGIDA',
folderResourceKey: '',
cameraName: 'Cámara 01 · QTEC',
cameraDescription: 'Archivo de grabaciones',
timeZone: 'America/Guatemala',
demoWhenUnconfigured: false,
```

Esos textos son marcadores de ejemplo, no credenciales válidas. Con ambos campos vacíos y `demoWhenUnconfigured: true`, el sitio muestra demo. Con configuración parcial o un error de Drive, **no sustituye los datos reales por datos ficticios**. Para una publicación de producción, desactiva explícitamente la demo.

`refreshIntervalMs` tiene un mínimo efectivo de cinco minutos. `manualCooldownMs` tiene un mínimo de 30 segundos. `apiPageSize` permite hasta 1000 archivos por respuesta. `maxApiPages: 30` limita una sincronización a 30 páginas: si se supera, se informa el error sin mostrar un catálogo parcial. Revisa el consumo antes de aumentar ese valor.

### Fechas

Se usa exclusivamente la fecha del nombre; las fechas de subida o modificación no participan en los filtros ni en el orden final. Se admiten nombres como `CAM01_2026-10-23_08-30-00.mp4`, `CAM01_20261023_083000.mp4`, `23 septiembre 2026.mp4`, y los nombres históricos de QTEC: `01 oct (1).mp4`, `02 octu (1).mp4`, `23 sept (1).mp4`. La hora se considera local de la cámara, sin conversión.

El filtro de fecha utiliza el calendario nativo del navegador y se combina con la búsqueda por nombre. Elegir el 23 de septiembre de 2026 incluye tanto `2026-09-23...` como `23 sept...`. Los archivos que incluyan otro año, como `2025-09-23...`, se excluyen. Los nombres sin año coinciden solo por día y mes y siguen etiquetados **año no indicado**: nunca se les asigna el año del calendario o de subida. Las fechas completas se ordenan primero, de más reciente a más antigua; después, las fechas sin año por mes y día descendentes. No es posible conocer la cronología entre años distintos si el nombre omite el año. Los nombres sin una fecha reconocible quedan al final. Dentro del mismo día y hora, las partes siguen el orden natural `(1), (2), … (10)`. También puede elegirse Nombre A–Z o Z–A; Limpiar restablece los filtros y el orden por fecha.

Para futuras subidas se recomienda `2026-09-23_08-30-00_CAM01.mp4`: año, mes, día y hora. Los nombres existentes no requieren cambios; agregar el año elimina ambigüedades cuando haya grabaciones de varios años.

## 7. Ejecutar y probar localmente

Necesitas Node.js 20.11 o posterior **solo para desarrollo y pruebas**. No se instala ninguna dependencia y no se necesita `npm install`.

```powershell
npm.cmd run dev
```

Abre [la vista local](http://127.0.0.1:4173). No abras `index.html` con `file://`: los módulos JavaScript y las restricciones de referente necesitan HTTP. Para cambiar de puerto, define `PORT` en tu terminal. Alternativamente, cualquier servidor HTTP estático que sirva JavaScript con su MIME correcto puede alojar estos archivos.

```powershell
npm.cmd test
npm.cmd run build
```

`test` usa el ejecutor nativo de Node con respuestas HTTP simuladas para verificar consulta, paginación, nuevos archivos, concurrencia, pausas, errores, filtros, fechas y enlaces. **No demuestra una conexión real a Google.** `build` verifica sintaxis y referencias locales; no genera una carpeta de salida porque el código fuente ya es publicable.

### Comprobación manual con Drive real

1. Configura la carpeta y clave válidas. Comprueba que ya no aparece el aviso de demo.
2. Abre Herramientas del desarrollador → Red. Debe aparecer `files` con respuesta 200 y método GET; no debe haber escrituras ni descargas `alt=media` iniciadas por esta aplicación.
3. Comprueba que se muestran tus videos; selecciona uno compatible, prueba reproducir, pausar, desplazarte y pantalla completa en los controles de Drive.
4. Prueba búsqueda, filtro, limpiar filtros, páginas y ancho de 360 px, tablet y escritorio. Revisa también teclado y foco visible.
5. Sube un video nuevo a la carpeta. Espera a que termine de subir y herede permisos. Pulsa **Actualizar catálogo** cuando se habilite: debe aparecer sin cambiar el repositorio.
6. Sube otro archivo y deja la pestaña visible durante cinco minutos para comprobar la actualización automática. La indexación o procesamiento de Drive puede añadir demora; detectar un archivo no garantiza que ya sea reproducible.
7. Durante una grabación, actualiza: el iframe se mantiene. Si retiras ese video de la carpeta, desaparece del catálogo en la próxima sincronización y se limpia el reproductor.
8. Prueba con una clave o carpeta inválida y luego sin conexión. Debe informarse el error y conservarse el último catálogo si existe. Las pausas tras un error son intencionales.

## 8. Publicar gratis en GitHub Pages

No se ha publicado nada automáticamente. Cuando decidas publicar:

1. Crea un repositorio **público** en tu cuenta GitHub Free.
2. Sube `index.html`, `.nojekyll`, `css/`, `js/` y `assets/` a la raíz de la rama principal. Puedes subir también README, scripts y pruebas; no son necesarios en producción. No subas videos ni credenciales privadas.
3. En **Settings → Pages → Build and deployment**, selecciona **Deploy from a branch**, la rama principal y **/(root)**. Guarda.
4. Espera el despliegue de Pages y abre `https://TU_USUARIO.github.io/NOMBRE_DEL_REPOSITORIO/`.
5. Confirma que la clave autoriza ese origen y que HTTPS está habilitado. Las rutas de CSS, scripts e icono son relativas, por lo que funcionan bajo la ruta del repositorio.
6. Repite las comprobaciones con la carpeta real y en una ventana privada.

Solo necesitas volver a publicar si cambias configuración o código. **Subir nuevos videos a Drive no requiere modificar GitHub.** No se requiere un dominio comprado, backend ni plan de GitHub de pago. [Documentación oficial de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## 9. Reproducción y solución de problemas

Drive controla el streaming, los controles, la calidad y el procesamiento. No se utiliza un enlace directo de descarga como fuente de un `<video>` porque la vista previa oficial gestiona la reproducción desde Drive. Un MP4 con H.264 y audio AAC es una opción compatible habitual; la extensión por sí sola no asegura que el códec sea compatible. Consulta los [formatos y requisitos oficiales](https://support.google.com/drive/answer/2423694).

El enlace junto al título abre el video seleccionado en Drive. El aviso **¿El video no se reproduce?** explica procesamiento, formatos, cuotas de reproducción y cookies. El navegador impide inspeccionar los errores internos de un iframe de otro origen: cargar el iframe no prueba que el video se reproduzca. No se declara una reproducción exitosa ni se inventa un diagnóstico interno. El evento `error` solo cubre algunos fallos de carga del iframe.

| Situación | Revisión |
| --- | --- |
| 400 / configuración inválida | Copia solo el ID; comprueba clave y API habilitada. |
| 403 de acceso | Revisa permisos públicos, restricción por API y referente HTTP. |
| 403 de cuota / 429 | Espera la pausa; consulta las cuotas gratuitas. No habilites facturación. |
| 404 o catálogo vacío | Verifica carpeta y acceso en incógnito; una carpeta inaccesible también puede devolver un listado vacío. Los videos deben ser hijos directos con MIME de video. |
| Video nuevo ausente | Comprueba subida terminada, carpeta correcta, MIME, permisos heredados e indexación; espera o actualiza cuando se habilite. |
| Video no reproducible | Espera procesamiento; prueba abrirlo en Drive, revisa códecs, cookies y límites del proveedor. |
| CSS o scripts no cargan en Pages | Revisa que publicaste todos los archivos en la raíz seleccionada, sin alterar mayúsculas o rutas. |

## 10. Estructura

```text
index.html             Interfaz y política de contenido
css/styles.css         Diseño responsive, estados y foco accesible
js/config.js           Configuración pública
js/drive.js            Consultas GET, paginación y control de cuota
js/recordings.js       Fechas, filtros, orden y enlaces de Drive
js/demo.js             Registros ficticios sin solicitudes externas
js/app.js              Estado de la interfaz y reproductor único
assets/qtec-logo.png   Logo original de QTEC, encabezado e icono de pestaña
scripts/serve.mjs      Servidor local, fuera de producción
scripts/check.mjs      Verificación de sintaxis y archivos
tests/drive.test.js    Pruebas con API simulada
.nojekyll              Publicación directa de archivos estáticos
```

Los nombres recibidos de Drive se insertan con `textContent`, sin interpretarlos como HTML. Los iframes y enlaces se construyen sobre el dominio fijo de Drive. La política CSP permite scripts y estilos locales, consultas a la API oficial e iframes de Drive; no se incluyen analítica, fuentes remotas, bibliotecas CDN ni credenciales privadas.
