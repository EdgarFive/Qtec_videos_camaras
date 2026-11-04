// Configuración pública: la clave será visible. Restringir por API y referente HTTP.
export const CONFIG = Object.freeze({
  folderId: '1XJ8n9eDkvlo35HYT3iswop4-g0ltXBjM',
  apiKey: 'AIzaSyBtVcwbWkkG8ngeNoEkUdEWICKn2I6n0Mc', // Clave pública restringida a Google Drive API y al sitio autorizado.
  folderResourceKey: '', // Opcional, si el enlace de la carpeta incluye ?resourcekey=...
  useFolderViewWithoutKey: true, // Vista directa de Drive mientras no se configure la API.
  cameraName: 'Cámara 01 · QTEC',
  cameraDescription: 'Archivo de grabaciones',
  timeZone: 'America/Guatemala',
  demoWhenUnconfigured: true, // Solo entra en demo cuando AMBOS campos están vacíos.
  refreshIntervalMs: 5 * 60 * 1000,
  manualCooldownMs: 30 * 1000,
  catalogPageSize: 6,
  apiPageSize: 1000,
  maxApiPages: 30, // Detiene catálogos excesivos; nunca presenta un resultado parcial.
});
