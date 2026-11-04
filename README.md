# QTEC · Archivo público de grabaciones

Manual de uso, configuración, publicación y mantenimiento de la página de grabaciones de QTEC. Actualizado el **4 de noviembre de 2026**.

La página muestra los videos de una carpeta pública de Google Drive y permite reproducirlos dentro del sitio. Su diseño es minimalista, negro con acentos rojos y el logo original de QTEC. No requiere registro de visitantes.

> Regla principal: mantener el costo **Q0**. No habilitar facturación de Google Cloud, contratar servicios ni ampliar cuotas con costo. Las cuotas y condiciones de los proveedores deben revisarse si cambian.

## Índice

1. [Datos del proyecto y estado](#1-datos-del-proyecto-y-estado)
2. [Inicio rápido en la computadora de trabajo](#2-inicio-rápido-en-la-computadora-de-trabajo)
3. [Uso diario de la página](#3-uso-diario-de-la-página)
4. [Cómo nombrar videos y cómo funciona el calendario](#4-cómo-nombrar-videos-y-cómo-funciona-el-calendario)
5. [Cómo funciona la aplicación](#5-cómo-funciona-la-aplicación)
6. [Preparar la carpeta de Google Drive](#6-preparar-la-carpeta-de-google-drive)
7. [Google Cloud, clave de API y restricciones](#7-google-cloud-clave-de-api-y-restricciones)
8. [Configuración de la aplicación](#8-configuración-de-la-aplicación)
9. [Costo Q0 y límites](#9-costo-q0-y-límites)
10. [Git y publicación en GitHub Pages](#10-git-y-publicación-en-github-pages)
11. [Trabajar desde otra computadora](#11-trabajar-desde-otra-computadora)
12. [Pruebas y comprobaciones](#12-pruebas-y-comprobaciones)
13. [Solución de problemas](#13-solución-de-problemas)
14. [Diseño, logo y organización de archivos](#14-diseño-logo-y-organización-de-archivos)
15. [Mantenimiento y recuperación](#15-mantenimiento-y-recuperación)

## 1. Datos del proyecto y estado

| Dato | Valor |
| --- | --- |
| Cuenta de GitHub | `EdgarFive` |
| Repositorio | [EdgarFive/Qtec_videos_camaras](https://github.com/EdgarFive/Qtec_videos_camaras) |
| Rama de publicación | `main` |
| Fuente de Pages | `Deploy from a branch` → `main` → `/(root)` |
| Dirección prevista de la web | [https://edgarfive.github.io/Qtec_videos_camaras/](https://edgarfive.github.io/Qtec_videos_camaras/) |
| Despliegues | [GitHub Actions](https://github.com/EdgarFive/Qtec_videos_camaras/actions) |
| Configuración de publicación | [Settings → Pages](https://github.com/EdgarFive/Qtec_videos_camaras/settings/pages) |
| Carpeta de videos | [Abrir carpeta de Google Drive](https://drive.google.com/drive/folders/1XJ8n9eDkvlo35HYT3iswop4-g0ltXBjM) |
| ID de carpeta | `1XJ8n9eDkvlo35HYT3iswop4-g0ltXBjM` |
| Proyecto de Google Cloud creado durante la configuración | `QTEC Videos`, ID `qtec-videos` |
| Dirección local | [http://127.0.0.1:4173/](http://127.0.0.1:4173/) |
| Zona horaria configurada | `America/Guatemala` |
| Configuración pública | `js/config.js` |

La copia local ya tiene carpeta y clave configuradas. En las verificaciones de desarrollo se consultaron **64 grabaciones reales** y se cargó el reproductor de Drive. Ese número es una referencia histórica, no un total fijo. El calendario y la lógica cuentan con 20 pruebas automatizadas.

El repositorio remoto está configurado. **Tener archivos en GitHub no demuestra que Pages haya terminado de publicar**: verifica el resultado en Actions y abre la dirección pública. Este manual no certifica disponibilidad del sitio ni estado de facturación; ambos dependen de la configuración de las cuentas.

## 2. Inicio rápido en la computadora de trabajo

### Requisitos

- Node.js compatible con `import.meta.dirname` (20.11 o posterior) y npm, solo para desarrollo y pruebas.
- Git para subir cambios.
- Navegador moderno y conexión a Internet para consultar Drive y reproducir videos.

No hay dependencias que instalar: **no hace falta `npm install`**. GitHub Pages no necesita Node.js como servidor.

### Iniciar

Abre PowerShell o la terminal de VS Code y ejecuta:

```powershell
cd "C:\Users\Edgar\Desktop\PROGRAMAR(NO_BORRAR)\QTEC\PAGINA_VIDEOS_QTEC\videos_qtec"
npm.cmd run dev
```

Abre [http://127.0.0.1:4173/](http://127.0.0.1:4173/). Mantén la terminal abierta mientras pruebas. Para detener el servidor, presiona **Ctrl + C**.

Si ya estás dentro de la carpeta del proyecto, basta con `npm.cmd run dev`. No abras `index.html` con doble clic o `file://`: los módulos JavaScript y las restricciones de la clave necesitan que se sirva por HTTP.

### Ver cambios locales

1. Guarda el archivo editado con **Ctrl + S**.
2. Recarga el navegador con **Ctrl + F5**.

El servidor no incluye recarga automática. Editar la copia local no cambia el sitio de GitHub hasta hacer commit, push y completar el despliegue.

### Usar otro puerto

```powershell
$env:PORT = '4174'
npm.cmd run dev
```

Abre `http://127.0.0.1:4174/` y añade `http://127.0.0.1:4174/*` a los sitios permitidos de la clave. Para quitar esa selección de puerto en la terminal, detén el servidor y ejecuta:

```powershell
Remove-Item Env:PORT -ErrorAction SilentlyContinue
```

El servidor local escucha en `127.0.0.1`: sirve para esta computadora. No publica la web en Internet ni la expone a otros dispositivos de la red.

## 3. Uso diario de la página

- **Seleccionar una grabación:** pulsa su nombre en Archivo. Se carga un solo reproductor integrado de Drive; sus controles permiten reproducir, pausar, desplazarse y usar pantalla completa cuando esté disponible.
- **Buscar:** escribe parte del nombre. La búsqueda ignora mayúsculas y minúsculas.
- **Fecha:** abre el icono del calendario y elige un día. Su apariencia depende del navegador o teléfono.
- **Combinar filtros:** nombre y calendario se aplican a la vez.
- **Ordenar:** elige fecha del nombre descendente, nombre A–Z o nombre Z–A.
- **Limpiar:** borra búsqueda y fecha, vuelve a la primera página y restablece el orden por fecha.
- **Cambiar de página:** usa las flechas del catálogo. Por defecto se muestran seis videos por página.
- **Actualizar:** consulta nuevamente la carpeta. Después de una consulta exitosa se espera al menos 30 segundos antes de permitir otra.
- **Abrir en Drive:** el enlace del encabezado abre la carpeta; la flecha junto al título de un video seleccionado abre ese archivo.
- **Reintentar aquí:** vuelve a crear solo el reproductor seleccionado. No vuelve a consultar el catálogo; reinicia la reproducción desde el principio.
- **Abrir reproductor:** abre la vista previa del video seleccionado en otra pestaña de Drive. Es una alternativa cuando el navegador móvil bloquea la incrustación; el catálogo permanece en la pestaña original.

### Si falla la reproducción en móviles

Se reportó un caso real con miniatura sin reproducción en Edge móvil y pantalla gris en Chrome móvil; el usuario confirmó que el mismo archivo sí se reproduce al abrirlo directamente en Drive. Esto apunta a la integración incrustada o a su contexto en el navegador, pero no permite atribuir una causa exacta sin inspeccionar el dispositivo.

La vista móvil del iframe ahora tiene al menos 320 px de alto para dejar espacio a los controles de Drive. Se incluyen los botones Reintentar aquí y Abrir reproductor, visibles después de seleccionar un archivo real. Cambiar de filtro o actualizar el catálogo no debe reiniciar un reproductor activo; Reintentar aquí sí lo reinicia por decisión del visitante.

Google indica que su reproducción puede necesitar cookies de terceros ([ayuda oficial](https://support.google.com/drive/answer/2423694)). Que se vea una miniatura no garantiza que se cargue el video. Si la vista sigue gris o no inicia, utiliza Abrir reproductor. El sitio no cambia ajustes de privacidad ni puede eludir las restricciones del navegador o inspeccionar el error interno del iframe. La apertura directa evita el contexto incrustado, pero sigue dependiendo de permisos, procesamiento y límites de Drive.

Estos cambios mejoran el espacio disponible y permiten recuperarse del fallo; **no certifican que la reproducción incrustada haya quedado corregida en Chrome o Edge de Android**. Debe comprobarse en los teléfonos reales después del despliegue. No se sustituyó el reproductor por descargas `alt=media`, proxies ni servicios con costo.

### Agregar nuevas grabaciones

1. Nombra el archivo con la fecha real de grabación, según el siguiente apartado.
2. Súbelo directamente a la carpeta configurada de Drive.
3. Espera a que la subida termine y comprueba que herede acceso público de lectura.
4. Espera la próxima actualización o pulsa Actualizar cuando se habilite.
5. Si aparece pero no se reproduce, espera a que Drive termine de procesarlo.

**No se modifica GitHub cada vez que se sube un video.** Lo mismo aplica a cambios de nombre o retiros de archivos de la carpeta: el siguiente catálogo exitoso refleja lo que Drive devuelva. Si se retira la grabación seleccionada, el sitio limpia su reproductor.

## 4. Cómo nombrar videos y cómo funciona el calendario

### Convención recomendada

Utiliza año, mes, día y hora reales de grabación:

```text
2026-09-23_08-30-00_CAM01.mp4
2026-09-23_09-30-00_CAM01.mp4
```

Esto permite distinguir grabaciones de varios años y ordenar las de un mismo día por hora. La hora del nombre se interpreta tal como está escrita, sin convertirla de zona horaria. La fecha de subida puede ser posterior y no afecta al filtro.

### Nombres admitidos

| Ejemplo | Interpretación |
| --- | --- |
| `2026-09-23_08-30-00_CAM01.mp4` | 23 de septiembre de 2026 a las 08:30 |
| `CAM01_20260923_083000.mp4` | Misma fecha y hora, formato compacto |
| `23 septiembre 2026.mp4` | Fecha completa, sin hora |
| `23 de septiembre de 2026.mp4` | Fecha completa en texto |
| `23 sept (1).mp4` | Día 23, septiembre, año no indicado |
| `01 oct (2).mp4` | Día 1, octubre, año no indicado |
| `02 octu (1).mp4` | Se admite la abreviatura histórica `octu` |
| `sin_fecha.mp4` | Sin fecha reconocible en el nombre |

Se admiten nombres de meses en español y abreviaturas habituales, como `ene`, `feb`, `mar`, `abr`, `may`, `jun`, `jul`, `ago`, `sep`, `sept`, `oct`, `nov` y `dic`. Se validan fechas imposibles como 31 de septiembre. El reconocimiento de años está diseñado para `20xx`. No es necesario renombrar los archivos históricos para que funcionen.

### Qué ocurre al elegir una fecha

Si eliges **23 de septiembre de 2026**:

| Nombre | ¿Se muestra? | Motivo |
| --- | --- | --- |
| `2026-09-23_08-00-00.mp4` | Sí | Coinciden año, mes y día |
| `23 sept (1).mp4` | Sí | No tiene año: coinciden día y mes |
| `2025-09-23.mp4` | No | Indica un año diferente |
| `24 sept.mp4` | No | Día diferente |
| `sin_fecha.mp4` | No | No contiene fecha reconocible |

El calendario siempre selecciona un año, pero **no asigna ese año a los archivos que no lo incluyen**. Esos registros siguen mostrando **año no indicado**. Por eso un archivo `23 sept` puede aparecer al elegir ese día en distintos años. Agregar el año al nombre es la solución para eliminar esa ambigüedad.

### Orden por fecha del nombre

1. Fechas completas, de más reciente a más antigua.
2. Fechas sin año, por mes y día descendentes.
3. Archivos sin fecha reconocible, al final.

Dentro de la misma fecha y hora, las partes siguen orden natural: `(1), (2), … (10)`. No se usa un orden alfabético que coloque `(10)` antes de `(2)`. Sin año no se puede establecer una cronología exacta entre años diferentes.

**Nunca se usan las fechas de creación, subida o modificación de Drive para el filtro ni para el orden final de la interfaz.** La API devuelve páginas ordenadas por creación, pero el cliente reúne todas las páginas y las vuelve a ordenar por el nombre antes de mostrarlas.

## 5. Cómo funciona la aplicación

```text
Visitante → archivos estáticos en GitHub Pages
          → consulta de metadatos a Google Drive API
          → filtro y orden por nombre en el navegador
          → selección de un video → iframe de vista previa de Drive
```

Se utiliza HTML, CSS y JavaScript nativos. No hay backend, base de datos, cuentas de visitantes, OAuth, cuentas de servicio ni escrituras en Drive.

### Catálogo y reproducción

- `files.list` consulta hijos directos de la carpeta, de tipo `video/*`, fuera de la papelera. No recorre subcarpetas ni accesos directos.
- Se piden metadatos: ID, nombre, tipo, tamaño, fechas y metadatos de video disponibles. Se recorren páginas con continuación, incluidas páginas vacías, y se deduplican IDs.
- No se muestra un resultado parcial si falla una página, hay búsqueda incompleta o se alcanza el máximo de páginas configurado.
- Búsqueda, calendario y paginación visual se resuelven en memoria: cambiar filtros no consulta otra vez la API.
- Solo se crea un iframe de video a la vez. Una actualización conserva el reproductor si el archivo sigue disponible y no cambia su clave de recurso.
- No se copian videos en GitHub ni se descarga primero el archivo completo. Google Drive gestiona su vista previa y la transferencia necesaria para reproducirlo.

### Actualización y errores

- Consulta al abrir y cada cinco minutos mientras la pestaña esté visible.
- Se omiten consultas periódicas en pestañas ocultas; al volver se consulta si ya corresponde.
- Una página cerrada no ejecuta tareas: el siguiente visitante consulta al abrir.
- Se agrupan solicitudes simultáneas dentro de la misma pestaña.
- Cada intento tiene un tiempo de espera de 20 segundos.
- Ante fallos temporales de conexión, servidor o cuota: hasta dos reintentos con espera creciente y variación aleatoria.
- Tras un fallo: pausa creciente de 1 a 30 minutos, o más si `Retry-After` lo exige. Un 403 de permisos no se reintenta dentro de esa consulta.
- Si una sincronización falla, se conserva el catálogo previo en memoria. No existe caché persistente que garantice funcionamiento sin conexión después de recargar.

## 6. Preparar la carpeta de Google Drive

1. Abre la carpeta destinada a las grabaciones.
2. En Compartir, configura **Cualquier persona con el enlace → Lector**.
3. Comprueba en una ventana privada, sin sesión iniciada, que se vean carpeta y videos.
4. Sube los archivos directamente a esa carpeta y verifica sus permisos heredados.

Es una plataforma pública: cualquier persona que tenga acceso al enlace puede consultar las grabaciones compartidas. El sitio no modifica permisos. Si una política de la organización impide compartir públicamente, esta arquitectura no podrá acceder a esos archivos sin cambiar su planteamiento.

Para cambiar la carpeta, copia solo el ID de un enlace con formato `https://drive.google.com/drive/folders/ID_DE_CARPETA` y edita `folderId` en `js/config.js`. Si el enlace contiene `resourcekey=...`, copia ese valor en `folderResourceKey`. Después prueba localmente y publica el cambio de configuración.

## 7. Google Cloud, clave de API y restricciones

### Crear o recuperar la configuración

1. Entra a [Google Cloud Console](https://console.cloud.google.com/).
2. Selecciona el proyecto **QTEC Videos**. Si necesitas reconstruirlo, crea un proyecto sin vincular facturación.
3. En **APIs y servicios → Biblioteca**, habilita **Google Drive API**.
4. En **APIs y servicios → Credenciales**, crea o abre una **Clave de API estándar**, sin asociarla a una cuenta de servicio.
5. Selecciona **Restricciones de aplicaciones → Sitios web**.
6. En **Restricciones de API**, autoriza únicamente **Google Drive API**.
7. Guarda y espera a que las restricciones se propaguen antes de probar.

No se requiere configurar una pantalla de consentimiento OAuth. [Documentación de claves y restricciones](https://docs.cloud.google.com/api-keys/docs/add-restrictions-api-keys).

### Sitios web autorizados

Cada dirección debe añadirse como una entrada independiente:

```text
http://127.0.0.1:4173/*
http://localhost:4173/*
https://edgarfive.github.io/*
```

Las dos primeras permiten pruebas locales; la tercera permite el sitio de GitHub Pages. Se pueden conservar las tres o separar las claves de desarrollo y producción. Otro puerto o dominio requiere su propia entrada.

Las solicitudes entre sitios suelen enviar solo el origen como referente. Por eso se autoriza `https://edgarfive.github.io/*`, en lugar de depender de la ruta de un repositorio. No autorices todos los dominios de `github.io`. El proyecto utiliza `strict-origin-when-cross-origin` para conservar el origen de la página.

### Dónde colocar la clave

En `js/config.js`, reemplaza únicamente el valor de `apiKey`:

```js
apiKey: 'TU_CLAVE_PUBLICA_RESTRINGIDA',
```

El texto es un ejemplo, no una clave real. Conserva comillas y coma. Guarda y recarga con **Ctrl + F5**. Para GitHub Pages, publica también el cambio mediante Git.

### Por qué `config.js` no está en `.gitignore`

La clave utilizada por este frontend es visible en el JavaScript que recibe cualquier visitante. Ocultarla del repositorio no la oculta en el sitio publicado. Las restricciones de sitios y API limitan su uso; no la convierten en un secreto ni en una autorización privada sobre una carpeta específica.

`config.js` forma parte de los archivos publicados y no debe omitirse en el despliegue actual. Usar secretos de GitHub para generar ese mismo archivo tampoco haría secreta una clave enviada al navegador. No incluyas contraseñas, tokens personales, secretos OAuth o archivos privados de cuentas de servicio. Evita mostrar el valor de la clave en capturas o mensajes de diagnóstico.

## 8. Configuración de la aplicación

Edita campos individuales de `js/config.js`; no reemplaces una configuración válida con un ejemplo completo que borre la clave.

| Campo | Uso / valor actual de referencia |
| --- | --- |
| `folderId` | ID de la carpeta pública de videos |
| `apiKey` | Clave pública restringida; no se reproduce en este manual |
| `folderResourceKey` | Valor opcional de `resourcekey` del enlace |
| `useFolderViewWithoutKey` | `true`: permite vista directa de carpeta cuando falta la clave |
| `cameraName` | `Cámara 01 · QTEC`, texto debajo de Grabaciones |
| `cameraDescription` | Campo reservado; no se muestra en el diseño minimalista actual |
| `timeZone` | `America/Guatemala`, usado para la hora de sincronización; no convierte horas del nombre |
| `demoWhenUnconfigured` | `true`: permite demo únicamente si carpeta y clave están vacías |
| `refreshIntervalMs` | `300000`, cinco minutos; mínimo efectivo de cinco minutos |
| `manualCooldownMs` | `30000`; mínimo efectivo de 30 segundos |
| `catalogPageSize` | `6` registros visibles por página |
| `apiPageSize` | `1000`, máximo admitido por respuesta |
| `maxApiPages` | `30` páginas por sincronización; revisar consumo antes de aumentarlo |

### Modos de funcionamiento

| Configuración | Resultado |
| --- | --- |
| Carpeta y clave válidas | Catálogo propio, filtros y reproductor integrado |
| Carpeta válida, sin clave, `useFolderViewWithoutKey: true` | Vista de carpeta de Drive |
| Carpeta y clave vacías, `demoWhenUnconfigured: true` | 17 registros ficticios identificados como demostración, sin video real ni consultas a Google |
| Configuración inválida o incompleta que no cumple lo anterior | Mensaje de error |
| Error de API con configuración real | Mensaje y conservación del catálogo anterior, si existe; no se cambia a demo |

La vista de carpeta usa `embeddedfolderview`: muestra los archivos mediante la interfaz de Drive y los abre en Drive. No ofrece el reproductor ni los filtros propios. Su actualización reinicia la navegación de esa carpeta incrustada. El código de la página no puede leer su contenido por ser de otro origen.

En producción puede desactivarse `demoWhenUnconfigured` para que una configuración vacía sea un error explícito. Con la carpeta y clave configuradas, esa opción no activa datos ficticios.

## 9. Costo Q0 y límites

El alojamiento elegido es GitHub Pages desde un repositorio público en GitHub Free. Un repositorio privado puede almacenarse gratuitamente, pero publicar Pages desde él requiere un plan compatible como Pro o Team. [Condiciones oficiales de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

Google indica que el uso estándar de Drive API no tiene costo adicional, y su documentación anuncia cobros por encima de ciertos umbrales. No debe prometerse uso ilimitado gratuito. Consulta las cuotas aplicables al proyecto en Google Cloud y los [límites y precios oficiales de Drive API](https://developers.google.com/workspace/drive/api/guides/limits), revisados para este manual el 4 de noviembre de 2026.

Para conservar Q0, mantén el proyecto sin cuenta de facturación vinculada, sin pruebas con créditos ni ampliaciones de cuota con costo. Si una operación exige activar facturación, detente y usa temporalmente la vista de carpeta. Un presupuesto o alerta de gasto no es un bloqueo de cobros.

### Comprobar facturación

Selecciona el proyecto correcto en Google Cloud y abre Facturación. Comprueba que no tenga una cuenta de facturación vinculada ni facturación habilitada. No basta con no haber recibido una factura. La aplicación no puede comprobar ese estado. [Guía oficial de verificación](https://docs.cloud.google.com/billing/docs/how-to/verify-billing-enabled).

### Consumo de la aplicación

Con hasta 1000 archivos por respuesta, una sincronización pequeña normalmente necesita una solicitud de listado. Puede requerir más si hay más archivos o Drive devuelve páginas menores o vacías con continuación. Los reintentos también consumen cuota.

Una pestaña visible hace aproximadamente 12 sincronizaciones por hora, además de la inicial y las manuales. Cada visitante y pestaña agrega consultas: los controles locales no imponen una cuota global. Filtrar o cambiar de página visual no genera consultas de API. El reproductor tiene límites propios de Drive y no garantiza disponibilidad ilimitada. El almacenamiento de Drive se administra aparte; este sitio no lo amplía ni contrata servicios adicionales.

## 10. Git y publicación en GitHub Pages

### Diferencia entre guardar, commit, push y desplegar

| Acción | Efecto |
| --- | --- |
| Guardar en VS Code | Cambia archivos de esta computadora |
| `git add` y `git commit` | Guarda una versión en el historial local |
| `git push` | Envía los commits a GitHub |
| Despliegue de Pages exitoso | Hace visible esa versión en la dirección pública |
| Subir un video a Drive | Cambia el catálogo en su próxima consulta; no requiere Git |

### Publicar cambios habituales

Ejecuta desde la carpeta del proyecto:

```powershell
npm.cmd test
npm.cmd run build
git status
git add .
git diff --cached --stat
git commit -m "Actualizar página QTEC"
git push
```

Antes del commit, revisa qué archivos aparecen. `.gitignore` excluye `outputs/`, `node_modules/`, archivos de registro y `.DS_Store`; no excluye `config.js`. No agregues videos ni archivos privados. Si no hay cambios nuevos, Git puede indicar que no hay nada para confirmar; eso es normal.

Para subir únicamente cambios de este manual:

```powershell
git add README.md
git commit -m "Documentar uso y mantenimiento de QTEC"
git push
```

Después del push abre [Actions](https://github.com/EdgarFive/Qtec_videos_camaras/actions). Una ejecución amarilla sigue trabajando, verde indica éxito y roja requiere abrir el detalle del error. El código del proyecto no necesita un workflow personalizado: se usa el despliegue de Pages desde rama.

### Configuración de Pages

En [Settings → Pages](https://github.com/EdgarFive/Qtec_videos_camaras/settings/pages), configura **Deploy from a branch → main → /(root)** y guarda. `index.html` debe estar en esa raíz. Mantén HTTPS y deja Custom domain vacío si usas la dirección gratuita de GitHub. La publicación puede tardar unos minutos. [Guía oficial](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

Confirma que la clave autorice `https://edgarfive.github.io/*`. Las rutas de recursos son relativas para funcionar bajo `/Qtec_videos_camaras/`. `.nojekyll` permite servir los archivos estáticos directamente. `npm.cmd run build` solo verifica archivos y sintaxis: no genera `dist/`. Se publica la raíz del proyecto.

La web publicada no depende de que tu computadora o terminal permanezcan encendidas. No se compró un dominio ni se configuró un servidor de producción.

### Primera subida desde una copia sin Git

Solo si necesitas reconstruir la vinculación. No repitas `git init` ni `remote add` como parte del trabajo diario. Crea primero un repositorio público vacío; usa este remoto únicamente si corresponde al repositorio donde quieres publicar:

```powershell
git init
git branch -M main
git add .
git commit -m "Publicar plataforma de grabaciones QTEC"
git remote add origin https://github.com/EdgarFive/Qtec_videos_camaras.git
git push -u origin main
```

Si Git solicita identidad, configúrala para este proyecto con tus datos reales:

```powershell
git config user.name "EdgarFive"
git config user.email "TU_CORREO_VERIFICADO_EN_GITHUB"
```

Después repite el commit y push pendientes. La autenticación HTTPS puede abrir un inicio de sesión en el navegador o usar un gestor de credenciales. No pongas contraseñas o tokens en el remoto, comandos guardados, README o capturas.

### Diagnóstico de Git y despliegue

```powershell
git status
git remote -v
git branch -vv
git log -5 --oneline
```

El remoto esperado es `https://github.com/EdgarFive/Qtec_videos_camaras.git` y la rama de trabajo/publicación es `main`. Si `origin` ya existe, no lo añadas nuevamente. Si está equivocado y confirmaste el destino correcto:

```powershell
git remote set-url origin https://github.com/EdgarFive/Qtec_videos_camaras.git
```

Si el push es rechazado por cambios remotos, primero comprueba `git status`. Con trabajo local ya guardado en commits, ejecuta `git pull --rebase origin main`, resuelve cualquier conflicto que Git indique y vuelve a intentar `git push`. No uses `--force` ni `git reset --hard` para resolver un problema de publicación.

Si Pages está bien configurado pero no aparece ningún despliegue, comprueba que el correo de GitHub esté verificado, revisa permisos/estado de Actions y, solo después, puedes enviar un commit vacío para generar un nuevo evento:

```powershell
git commit --allow-empty -m "Solicitar nuevo despliegue de GitHub Pages"
git push
```

Un commit vacío no arregla un fallo de permisos, cuenta o configuración de Pages. Si sigue sin haber ejecuciones, revisa Settings y el mensaje concreto en GitHub.

## 11. Trabajar desde otra computadora

Instala Git y una versión compatible de Node.js. En la carpeta donde quieras guardar el proyecto:

```powershell
git clone https://github.com/EdgarFive/Qtec_videos_camaras.git
cd Qtec_videos_camaras
npm.cmd run dev
```

Si ya lo tenías clonado, guarda primero tu trabajo pendiente y actualiza con `git pull`. No sobrescribas cambios locales sin revisarlos. Comprueba que `config.js` tenga carpeta y clave válidas y que la clave permita la dirección local usada. No copies ni compartas credenciales privadas de Google Cloud o GitHub.

## 12. Pruebas y comprobaciones

```powershell
npm.cmd test
npm.cmd run build
```

El ejecutor de Node verifica 20 casos: configuración y modos, paginación y duplicados, concurrencia, nuevos archivos, errores y pausas, claves de recurso, fechas, calendario, orden natural y enlaces. Son respuestas de API simuladas; no prueban por sí solas permisos o reproducción real. `build` comprueba sintaxis de JavaScript, recursos requeridos y referencias locales.

Después de cambios de integración o publicación, comprueba manualmente:

1. Apertura de la dirección correcta: local o GitHub Pages.
2. Catálogo real, sin aviso de demostración.
3. Selección y reproducción de un video compatible; pausa, avance y pantalla completa.
4. Calendario: 23 de septiembre debe mostrar `23 sept` y fechas completas del año elegido.
5. Búsqueda combinada, orden, Limpiar y flechas de página.
6. Diseño en teléfono y escritorio, navegación por teclado y foco visible.
7. Nueva subida en Drive: aparece al actualizar, sin cambios en GitHub. Prueba también el intervalo automático con la pestaña visible.
8. Durante una reproducción, actualizar el catálogo mantiene el video seleccionado si sigue disponible.

En Herramientas del desarrollador → Red puedes revisar la petición `files`: debe ser GET de metadatos. La aplicación no envía escrituras ni usa `alt=media` para descargar archivos. No compartas capturas de la URL completa de esa petición porque contiene la clave.

Consulta [VERIFICACION.md](VERIFICACION.md) para el registro histórico de pruebas; no todos los registros describen la misma versión. La prueba de un archivo no garantiza la compatibilidad de todos los videos.

## 13. Solución de problemas

| Problema | Qué revisar |
| --- | --- |
| `npm` o `node` no se reconoce | Instala Node.js y vuelve a abrir la terminal. Comprueba `node --version` y `npm.cmd --version`. |
| PowerShell bloquea `npm.ps1` | Usa `npm.cmd`, como en los comandos de este manual. |
| `127.0.0.1 rechazó la conexión` | El servidor no está activo. Ejecuta `npm.cmd run dev` y mantén la terminal abierta. |
| Puerto ocupado / `EADDRINUSE` | Puede existir otra instancia. Revisa el servidor que dejaste abierto; no detengas procesos desconocidos. También puedes usar otro puerto y autorizarlo en la clave. |
| Veo el diseño anterior | Guarda, recarga con Ctrl + F5 y comprueba si estás en local o en GitHub. Para la web pública necesitas push y despliegue exitoso. |
| Aparece demo | Carpeta y clave están vacías y la demo está permitida. Revisa `config.js`. |
| Se ve una carpeta en lugar del reproductor | Existe carpeta pero falta la clave y está habilitada la vista directa de carpeta. |
| Error 400 | Revisa formato de clave e ID; copia el ID de carpeta, no su URL completa. |
| Error 401/403 de acceso | Revisa Google Drive API habilitada, clave correcta, restricciones por API y referente, y acceso público de los archivos. |
| Funciona localmente pero no en GitHub | Revisa el permiso `https://edgarfive.github.io/*` y que la configuración actual esté subida y desplegada. |
| Error 403 de cuota / 429 | Espera la pausa. Consulta las cuotas; no actives facturación para resolverlo. |
| Error 404 de Drive o catálogo vacío | Revisa ID, permisos en incógnito y ubicación de los videos. Una carpeta inaccesible puede devolver un listado vacío. |
| Un video nuevo no aparece | Confirma subida terminada, carpeta correcta, MIME de video, permisos heredados e indexación; espera o actualiza cuando se habilite. |
| Aparece pero no se reproduce | Drive puede estar procesándolo, el códec puede ser incompatible, puede haber límites de reproducción o cookies bloqueadas. Prueba abrir el archivo directamente en Drive. |
| Miniatura sin reproducción o pantalla gris en móvil, pero sí reproduce en Drive | Pulsa Reintentar aquí; si continúa, usa Abrir reproductor. Confirma que se desplegó la versión con controles nuevos. El funcionamiento del iframe depende del navegador y de Drive; no se considera resuelto solo porque cargue una miniatura. |
| La duración dice no disponible | Drive no devolvió ese metadato; no se inventa una duración. |
| El calendario no muestra un archivo | Revisa la fecha escrita en el nombre, el año si existe y cualquier búsqueda de nombre activa. Pulsa Limpiar para quitar filtros. |
| Archivos del mismo día aparecen en años distintos | Sus nombres no indican año; coinciden solo por día y mes. Renómbralos con el año real si necesitas distinguirlos. |
| Actualizar está deshabilitado | Hay consulta en curso o pausa de cuota/errores. El título del botón indica el tiempo cuando corresponde. |
| Límite de páginas del catálogo | Se alcanzó `maxApiPages` o hay paginación anómala. Se conserva el catálogo anterior; revisar consumo antes de cambiar límites. |
| Página pública 404 | Revisa URL exacta, `index.html` en raíz de `main`, Settings → Pages y resultado de Actions. No es un error de la clave de Drive. |
| Actions rojo | Abre la ejecución y el paso fallido; resuelve ese error antes de revisar el reproductor. |
| Git dice `nothing to commit` | No hay cambios nuevos para confirmar. Si hay commits pendientes, un `git push` aún puede ser necesario. |

Un MP4 con H.264 y audio AAC es una opción compatible habitual, pero la extensión no garantiza el códec. Consulta los [formatos de video admitidos por Drive](https://support.google.com/drive/answer/2423694).

El reproductor es un iframe de otro origen. La página no puede inspeccionar sus errores internos ni afirmar que un evento de carga garantiza reproducción. El evento `error` del iframe solo detecta algunos fallos de carga. La ayuda **¿El video no se reproduce?** y el enlace a Drive permiten continuar el diagnóstico.

## 14. Diseño, logo y organización de archivos

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | Estructura, textos, calendario, reproductor y política de contenido CSP |
| `css/styles.css` | Paleta negra/roja, diseño responsive, controles y estados |
| `js/config.js` | Configuración pública de Drive y parámetros |
| `js/drive.js` | Consultas GET, paginación, errores y control de cuota |
| `js/recordings.js` | Fechas del nombre, orden, filtros, duración y enlaces |
| `js/app.js` | Estado de interfaz, eventos, sincronización y reproductor |
| `js/demo.js` | Registros ficticios para modo demostración |
| `assets/qtec-logo.png` | Logo original utilizado en encabezado y pestaña |
| `assets/favicon.svg` | Icono anterior conservado; no es el favicon activo |
| `scripts/serve.mjs` | Servidor exclusivo de desarrollo |
| `scripts/check.mjs` | Verificador ejecutado por `npm.cmd run build` |
| `tests/drive.test.js` | Pruebas automatizadas |
| `package.json` | Comandos npm y definición de módulos JavaScript |
| `.nojekyll` | Publicación directa de recursos estáticos en Pages |
| `.gitignore` | Exclusiones de Git |
| `VERIFICACION.md` | Registro histórico de verificaciones |
| `outputs/` | Capturas locales, excluidas de Git |

### Cambiar el logo o colores

El logo se copió desde `QTEC/0. LOGOS/Q_tech.png` a `assets/qtec-logo.png`, para que el sitio no dependa de una ruta de tu computadora. El encabezado lo muestra dentro de un área de 38 × 38 px con `object-fit: contain`, conservando su proporción. El mismo PNG se usa como icono de pestaña.

Para sustituirlo, reemplaza el archivo de `assets/` por la versión deseada y comprueba el resultado local. Si cambias nombre o formato, actualiza sus referencias en `index.html` y el archivo requerido en `scripts/check.mjs`. Publica el recurso también; no uses una ruta `C:\...` como imagen de la web. El navegador puede conservar el favicon en caché incluso después de una recarga.

La paleta se define en `css/styles.css`; `--accent` controla el acento principal y hay colores de estados específicos. El nombre de cámara se cambia desde `config.js`. El título del navegador y el texto de marca del encabezado están en `index.html`.

### Seguridad del frontend

Los nombres de Drive se insertan como texto (`textContent`), no como HTML. Los enlaces y reproductores se construyen sobre el dominio fijo de Drive. La CSP permite recursos locales, consultas a la API oficial e iframes de Drive. No se incluyen analítica, fuentes remotas ni bibliotecas CDN. Estas medidas no sustituyen las restricciones de clave y los permisos de Drive.

## 15. Mantenimiento y recuperación

| Tarea | Dónde se hace | ¿Necesita push? |
| --- | --- | --- |
| Subir, renombrar o retirar una grabación | Carpeta de Drive | No |
| Cambiar permisos públicos de archivos | Drive | No; comprobar después |
| Agregar dominio o puerto permitido a la clave | Google Cloud | No, si la clave no cambia |
| Cambiar clave, carpeta o nombre de cámara | `js/config.js` | Sí |
| Cambiar colores o distribución | CSS / HTML | Sí |
| Cambiar logo | `assets/` y referencias si corresponde | Sí |
| Modificar reglas de fecha | `js/recordings.js` y sus pruebas | Sí |
| Actualizar este manual | `README.md` | Sí para guardarlo en GitHub |

Antes de dejar pasar mucho tiempo, conserva el repositorio actualizado, usa nombres completos con año para nuevas grabaciones y verifica que el proyecto de Google Cloud siga sin facturación vinculada. Guarda fuera del repositorio los mecanismos privados de recuperación de tus cuentas.

Si una clave debe reemplazarse, crea otra con las mismas restricciones necesarias, pruébala localmente, actualiza `config.js`, publica y comprueba el sitio antes de retirar la anterior. Un cambio de clave requiere despliegue; un cambio de referente permitido no requiere modificar código.

Si se pierde la copia local, clona el repositorio como se describe arriba. GitHub recupera únicamente lo que se haya enviado mediante push: no conserva los cambios locales sin subir, las capturas ignoradas ni los videos de Drive. El respaldo de videos y la capacidad de almacenamiento se gestionan aparte.

Si debes pedir ayuda, indica si falla local o público, la dirección de la página, el mensaje exacto y, para despliegues, el paso fallido de Actions. No compartas contraseñas, tokens o capturas que muestren credenciales. Esto permite identificar el problema sin rehacer toda la configuración.
