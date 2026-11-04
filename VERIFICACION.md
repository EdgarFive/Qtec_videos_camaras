# Verificación de la primera versión

## Paleta QTEC y fechas por nombre

- Paleta negra con acentos rojos, incluyendo favicon y controles oscuros.
- 19 pruebas aprobadas, incluyendo nombres españoles sin año, fechas imposibles, fechas completas, filtros combinados y orden natural de partes. Verificación estática aprobada.
- Con la configuración real del usuario, el navegador obtuvo 64 grabaciones. El filtro `23 sept` mostró cinco partes, el orden descendente por nombre invirtió correctamente esas partes y Limpiar restauró 64 registros. Seleccionar una parte creó el iframe oficial de vista previa. Esto comprueba carga del reproductor, no reproducción completa de todos los archivos.
- Se retiró el uso de fechas de subida/modificación para ordenar y filtrar. Los nombres sin año se señalan explícitamente y no se les asigna un año inferido.

## Actualización: 4 de noviembre de 2026

- Rediseño minimalista: se retiraron barra lateral, tarjetas de estadísticas, encabezados repetidos y textos promocionales.
- Carpeta `1XJ8n9eDkvlo35HYT3iswop4-g0ltXBjM` configurada. La clave de API sigue vacía.
- Vista directa de carpeta comprobada en el navegador: se muestran archivos reales como `01 oct (1).mp4`. Esta comprobación no demuestra reproducción de todos los videos ni conexión mediante Drive API.
- Se verificaron anchos de 390 y 1366 px, sin desbordamiento horizontal de la página principal. El contenido interno de Drive tiene su propia navegación y desplazamiento.
- 17 pruebas unitarias aprobadas y verificación estática correcta. El modo carpeta es explícito y no sustituye un error de API por datos de ejemplo.
- Captura actual: `outputs/qtec-minimal.jpg`. No se publicó el sitio ni se modificaron permisos de Drive.

Lo siguiente corresponde a la verificación histórica de la primera versión.

Fecha: 23 de octubre de 2026.

## Comprobaciones realizadas

- `npm.cmd test` / `node --test`: **16 pruebas aprobadas**, con Google Drive simulado. Incluyen archivos nuevos y retirados, páginas vacías con continuación, deduplicación, solicitudes simultáneas, errores 403/429/503, pausas, Retry-After, filtros y fechas.
- `npm.cmd run build` / `node scripts/check.mjs`: sintaxis JavaScript, archivos requeridos y referencias estáticas correctos. No requiere compilación ni dependencias instaladas.
- Servidor estático local: `GET /` devuelve **HTTP 200**.
- Navegador, modo demostración: carga de 17 registros, selección de grabación, actualización del título, paginación, búsqueda por nombre, filtro sin resultados, limpieza y actualización manual comprobados.
- Diseño revisado a **360, 390, 768 y 1440 px** de ancho, sin desbordamiento horizontal en esas comprobaciones. Se ajustó la tablet para mostrar el reproductor completo. Captura de escritorio en `outputs/qtec-desktop.jpg` (archivo local excluido de Git).
- Consola del navegador: sin errores ni advertencias en la revisión de la demo.
- Inspección del cliente: consultas de metadatos mediante GET, sin OAuth ni operaciones de escritura; configuración de ejemplo vacía, sin credenciales privadas. La demo no conecta con Google.
- Compatibilidad estructural con GitHub Pages: entrada `index.html`, rutas relativas, recursos locales y `.nojekyll`.

## Pendiente de comprobar con información real

No se proporcionaron un ID de carpeta ni una clave de API. No se ha probado una conexión real, el catálogo real, la reproducción real ni el comportamiento del reproductor con códecs particulares. Tampoco se ha medido el consumo real de cuota.

La temporización de cinco minutos está implementada; la incorporación de nuevos archivos se verificó mediante consultas simuladas. La actualización automática con subidas reales debe comprobarse siguiendo el README.

No se creó ni modificó ningún recurso externo. No se publicó en GitHub Pages. El estado de facturación debe comprobarlo el propietario en Google Cloud antes de utilizar la integración real; el frontend no puede verificarlo.
