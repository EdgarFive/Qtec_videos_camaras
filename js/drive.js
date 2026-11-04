const DRIVE_ENDPOINT = 'https://www.googleapis.com/drive/v3/files';
const SAFE_ID = /^[a-zA-Z0-9_-]+$/;

export class DriveError extends Error {
  constructor(message, { status = 0, retryable = false, retryAfterMs = 0 } = {}) {
    super(message);
    this.name = 'DriveError';
    this.status = status;
    this.retryable = retryable;
    this.retryAfterMs = retryAfterMs;
  }
}

export function configurationMode(config) {
  if (!config.folderId && !config.apiKey && config.demoWhenUnconfigured) return 'demo';
  if (config.folderId && SAFE_ID.test(config.folderId) && !config.apiKey && config.useFolderViewWithoutKey && (!config.folderResourceKey || SAFE_ID.test(config.folderResourceKey))) return 'folder';
  if (!config.folderId || !config.apiKey) throw new DriveError('Configuración incompleta. Define folderId y apiKey en js/config.js.');
  if (!SAFE_ID.test(config.folderId) || (config.folderResourceKey && !SAFE_ID.test(config.folderResourceKey))) {
    throw new DriveError('El ID o la clave de recurso de la carpeta no son válidos. Usa solo sus valores, no el enlace completo.');
  }
  return 'live';
}

function retryDelay(response, now) {
  const header = response.headers.get('Retry-After');
  if (!header) return 0;
  const seconds = Number(header);
  return Number.isFinite(seconds) ? Math.max(0, seconds * 1000) : Math.max(0, Date.parse(header) - now) || 0;
}

function responseError(response, data, now) {
  const reasons = data?.error?.errors?.map(item => item.reason) ?? [];
  const quota = response.status === 429 || reasons.some(reason => /rateLimitExceeded|userRateLimitExceeded|dailyLimitExceeded|quotaExceeded/i.test(reason));
  const retryable = quota || response.status >= 500;
  let message = 'No fue posible consultar Google Drive. Intenta nuevamente más tarde.';
  if (response.status === 400) message = 'La configuración de Google Drive no es válida. Revisa el ID de carpeta y la clave de API.';
  if (response.status === 401 || response.status === 403) message = 'Google Drive rechazó la consulta. Revisa la API habilitada, la clave y sus restricciones de sitio, y los permisos públicos de la carpeta.';
  if (response.status === 404) message = 'No se encontró la carpeta. Revisa su ID y sus permisos públicos.';
  if (quota) message = 'Se alcanzó un límite de Google Drive. Las consultas se pausaron; espera antes de volver a intentar. No habilites facturación ni amplíes cuotas.';
  return new DriveError(message, { status: response.status, retryable, retryAfterMs: retryDelay(response, now) });
}

// Solo GET de metadatos. No usa OAuth ni descarga contenido de los videos.
export function createDriveClient(config, dependencies = {}) {
  const fetchFn = dependencies.fetchFn ?? globalThis.fetch.bind(globalThis);
  const now = dependencies.now ?? Date.now;
  const wait = dependencies.wait ?? (ms => new Promise(resolve => setTimeout(resolve, ms)));
  const random = dependencies.random ?? Math.random;
  let inFlight = null;
  let nextAllowedAt = 0;
  let consecutiveFailures = 0;

  async function getPage(pageToken) {
    const url = new URL(DRIVE_ENDPOINT);
    url.search = new URLSearchParams({
      key: config.apiKey,
      q: `'${config.folderId}' in parents and trashed = false and mimeType contains 'video/'`,
      fields: 'nextPageToken,incompleteSearch,files(id,name,mimeType,createdTime,modifiedTime,size,resourceKey,videoMediaMetadata)',
      pageSize: String(Math.min(1000, Math.max(1, config.apiPageSize || 1000))),
      orderBy: 'createdTime desc',
      ...(pageToken ? { pageToken } : {}),
    }).toString();
    for (let attempt = 0; attempt < 3; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      let failure;
      try {
        const headers = config.folderResourceKey ? { 'X-Goog-Drive-Resource-Keys': `${config.folderId}/${config.folderResourceKey}` } : {};
        const response = await fetchFn(url, { method: 'GET', credentials: 'omit', signal: controller.signal, headers, cache: 'no-store', referrerPolicy: 'strict-origin-when-cross-origin' });
        let data;
        try { data = await response.json(); } catch { throw new DriveError('Google Drive devolvió una respuesta no válida.', { retryable: response.status >= 500 }); }
        if (!response.ok) throw responseError(response, data, now());
        if (!Array.isArray(data.files)) throw new DriveError('Google Drive devolvió un catálogo no válido.');
        return data;
      } catch (error) {
        failure = error instanceof DriveError ? error : new DriveError('Error de conexión. Revisa tu conexión a Internet y vuelve a intentar.', { retryable: true });
      } finally { clearTimeout(timeout); }
      // Retry-After largo se respeta sin mantener una petición esperando.
      if (!failure.retryable || attempt === 2 || failure.retryAfterMs > 15000) throw failure;
      await wait(Math.max(failure.retryAfterMs, 1000 * 2 ** attempt + Math.floor(random() * 1000)));
    }
  }

  async function listAll() {
    const files = new Map();
    const tokens = new Set();
    let token;
    for (let page = 0; page < (config.maxApiPages || 30); page++) {
      const result = await getPage(token);
      if (result.incompleteSearch) throw new DriveError('Drive devolvió una búsqueda incompleta. Se conserva el catálogo anterior; intenta nuevamente.');
      for (const file of result.files) {
        if (typeof file.id === 'string' && SAFE_ID.test(file.id) && file.mimeType?.startsWith('video/') && typeof file.name === 'string') files.set(file.id, file);
      }
      if (!result.nextPageToken) return [...files.values()];
      if (tokens.has(result.nextPageToken)) throw new DriveError('Drive devolvió una paginación repetida. Intenta nuevamente.');
      tokens.add(result.nextPageToken);
      token = result.nextPageToken;
    }
    throw new DriveError('El catálogo supera el límite de páginas configurado. No se muestran resultados parciales. Revisa maxApiPages en js/config.js.');
  }

  return {
    get nextAllowedAt() { return nextAllowedAt; },
    listVideos() {
      if (inFlight) return inFlight;
      if (now() < nextAllowedAt) return Promise.reject(new DriveError('Las consultas están en pausa. Espera a que se habilite Actualizar catálogo.'));
      try { if (configurationMode(config) !== 'live') throw new DriveError('Configura Google Drive antes de consultar la API.'); } catch (error) { return Promise.reject(error); }
      inFlight = listAll().then(files => {
        consecutiveFailures = 0;
        nextAllowedAt = now() + Math.max(30000, config.manualCooldownMs || 30000);
        return files;
      }).catch(error => {
        consecutiveFailures++;
        nextAllowedAt = now() + Math.max(error.retryAfterMs || 0, Math.min(30 * 60 * 1000, 60000 * 2 ** Math.min(consecutiveFailures - 1, 5)));
        throw error;
      }).finally(() => { inFlight = null; });
      return inFlight;
    },
  };
}
