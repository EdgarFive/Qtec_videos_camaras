import { CONFIG } from './config.js';
import { configurationMode, createDriveClient } from './drive.js';
import { normalizeRecordings, filterRecordings, sortRecordings, durationLabel, driveUrls } from './recordings.js';
import { demoFiles } from './demo.js';

const $ = id => document.getElementById(id);
const elements = Object.fromEntries(['refresh', 'mode-banner', 'camera-name', 'folder-link', 'sync-detail', 'result-count', 'catalog-status', 'recordings', 'player', 'video-name', 'video-meta', 'drive-link', 'search', 'date', 'order', 'clear-filters', 'page-info', 'prev-page', 'next-page'].map(id => [id, $(id)]));
let videos = [];
let selectedId = null;
let selectedFile = null;
let currentPage = 1;
let loading = false;
let configurationError = null;
let mode;
let lastAttempt = 0;
const interval = Math.max(300000, Number(CONFIG.refreshIntervalMs) || 300000);
const pageSize = Math.max(1, Number(CONFIG.catalogPageSize) || 6);
const client = createDriveClient(CONFIG);
let clockFormat;
try {
  mode = configurationMode(CONFIG);
  clockFormat = new Intl.DateTimeFormat('es-GT', { timeZone: CONFIG.timeZone, hour: '2-digit', minute: '2-digit', hour12: false });
} catch (error) { configurationError = error; }

function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(svg.namespaceURI, 'use');
  use.setAttribute('href', `#i-${name}`);
  svg.append(use);
  return svg;
}
function textElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}
function dateLabel(file) {
  if (!file.dateLabel) return 'Sin fecha en el nombre';
  return `${file.dateLabel}${file.hour ? ` · ${file.hour}` : ''}`;
}
function status(message, error = false) {
  elements['catalog-status'].textContent = message;
  elements['catalog-status'].classList.toggle('error', error);
  elements['catalog-status'].setAttribute('role', error ? 'alert' : 'status');
}
function renderCatalog() {
  const focusedId = elements.recordings.contains(document.activeElement) ? document.activeElement.dataset.fileId : null;
  const filtered = sortRecordings(filterRecordings(videos, elements.search.value, elements.date.value), elements.order.value);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  currentPage = Math.min(currentPage, pages);
  const start = (currentPage - 1) * pageSize;
  const fragment = document.createDocumentFragment();
  for (const file of filtered.slice(start, start + pageSize)) {
    const button = textElement('button', `recording${file.id === selectedId ? ' selected' : ''}`, '');
    button.type = 'button';
    button.dataset.fileId = file.id;
    button.setAttribute('aria-pressed', String(file.id === selectedId));
    button.title = file.name;
    const badge = textElement('span', 'recording-icon', '');
    badge.append(icon(file.id === selectedId ? 'play' : 'camera'));
    const info = textElement('span', 'recording-text', '');
    info.append(textElement('span', 'recording-name', file.name), textElement('span', 'recording-detail', dateLabel(file)));
    button.append(badge, info, textElement('span', 'recording-tail', durationLabel(file.duration)));
    button.addEventListener('click', () => selectVideo(file));
    fragment.append(button);
  }
  if (!filtered.length) fragment.append(textElement('div', 'empty-state', loading ? 'Cargando grabaciones…' : videos.length ? 'No hay coincidencias. Prueba con otro nombre o fecha.' : 'No hay videos disponibles. Las grabaciones aparecerán aquí cuando estén en la carpeta pública.'));
  elements.recordings.replaceChildren(fragment);
  if (focusedId) {
    const focusTarget = [...elements.recordings.querySelectorAll('button')].find(button => button.dataset.fileId === focusedId);
    focusTarget?.focus({ preventScroll: true });
  }
  elements['result-count'].textContent = String(filtered.length);
  elements['page-info'].textContent = filtered.length ? `${start + 1}–${Math.min(start + pageSize, filtered.length)} de ${filtered.length} · Página ${currentPage}/${pages}` : 'Sin grabaciones';
  elements['prev-page'].disabled = currentPage <= 1;
  elements['next-page'].disabled = currentPage >= pages;
}
function placeholder(title, description, demo = false) {
  const content = textElement('div', 'player-placeholder', '');
  const badge = textElement('span', 'camera-outline', '');
  badge.append(icon('camera'));
  content.append(badge, textElement('h3', '', title), textElement('p', '', description));
  if (demo) content.append(textElement('span', 'demo-chip', 'DEMOSTRACIÓN · SIN VIDEO REAL'));
  elements.player.replaceChildren(content);
}
function selectVideo(file) {
  const previous = selectedFile;
  selectedId = file.id;
  selectedFile = file;
  elements['video-name'].textContent = file.name;
  const resolution = file.videoMediaMetadata?.width && file.videoMediaMetadata?.height ? ` · ${file.videoMediaMetadata.width} × ${file.videoMediaMetadata.height}` : '';
  elements['video-meta'].textContent = `${dateLabel(file)} · ${durationLabel(file.duration)}${resolution}`;
  elements['drive-link'].hidden = Boolean(file.demo);
  if (file.demo) {
    placeholder('Grabación de ejemplo', 'La demostración no contiene videos reales.', true);
  } else {
    const urls = driveUrls(file);
    elements['drive-link'].href = urls.view;
    // Mantener el iframe durante sincronizaciones y cambios de filtros.
    if (previous?.id !== file.id || previous?.resourceKey !== file.resourceKey || !elements.player.querySelector('iframe')) {
      const frame = document.createElement('iframe');
      frame.title = `Reproductor de Google Drive: ${file.name}`;
      frame.src = urls.preview;
      frame.allow = 'autoplay; fullscreen; encrypted-media';
      frame.allowFullscreen = true;
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.addEventListener('error', () => placeholder('No se pudo cargar el reproductor', 'Abre la grabación en Google Drive usando el enlace de abajo.'));
      elements.player.replaceChildren(frame);
    }
  }
  renderCatalog();
}
function clearPlayer() {
  selectedId = null;
  selectedFile = null;
  placeholder('Selecciona una grabación', 'El video se mostrará en este espacio.');
  elements['video-name'].textContent = 'Selecciona una grabación';
  elements['video-meta'].textContent = 'La grabación anterior ya no está disponible en el catálogo.';
  elements['drive-link'].hidden = true;
  elements['drive-link'].removeAttribute('href');
}
function updateRefreshButton() {
  const seconds = Math.ceil(Math.max(0, client.nextAllowedAt - Date.now()) / 1000);
  elements.refresh.disabled = loading || Boolean(configurationError) || seconds > 0;
  elements.refresh.title = loading ? 'Consultando el catálogo' : seconds ? `Disponible en ${seconds} s` : 'Consultar nuevas grabaciones';
  elements.refresh.setAttribute('aria-busy', String(loading));
}
async function refresh() {
  if (loading || configurationError || Date.now() < client.nextAllowedAt) return;
  if (mode === 'folder') { showFolder(); return; }
  loading = true;
  lastAttempt = Date.now();
  updateRefreshButton();
  elements.recordings.setAttribute('aria-busy', 'true');
  status('Cargando grabaciones…');
  try {
    const files = mode === 'demo' ? demoFiles() : await client.listVideos();
    const normalized = normalizeRecordings(files, CONFIG.timeZone);
    videos = normalized;
    elements['sync-detail'].textContent = mode === 'demo' ? 'Demostración' : `Actualizado ${clockFormat.format(new Date())} · cada ${Math.round(interval / 60000)} min`;
    if (selectedId) {
      const selected = videos.find(file => file.id === selectedId);
      if (selected) selectVideo(selected); else clearPlayer();
    }
    status(mode === 'demo' ? 'Datos de ejemplo' : 'Catálogo actualizado');
  } catch (error) {
    status(`${error.message}${videos.length ? ' Se conserva el último catálogo disponible.' : ''}`, true);
  } finally {
    loading = false;
    elements.recordings.setAttribute('aria-busy', 'false');
    renderCatalog();
    updateRefreshButton();
  }
}

function showFolder() {
  lastAttempt = Date.now();
  const frame = document.createElement('iframe');
  frame.title = 'Grabaciones de la carpeta de Google Drive';
  const url = new URL('https://drive.google.com/embeddedfolderview');
  url.searchParams.set('id', CONFIG.folderId);
  if (CONFIG.folderResourceKey) url.searchParams.set('resourcekey', CONFIG.folderResourceKey);
  url.hash = 'list';
  frame.src = url.href;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  elements.player.replaceChildren(frame);
  elements['sync-detail'].textContent = 'Vista de Google Drive';
}

elements['camera-name'].textContent = CONFIG.cameraName;
if (CONFIG.folderId && /^[\w-]+$/.test(CONFIG.folderId)) {
  const folderUrl = new URL(`https://drive.google.com/drive/folders/${CONFIG.folderId}`);
  if (CONFIG.folderResourceKey) folderUrl.searchParams.set('resourcekey', CONFIG.folderResourceKey);
  elements['folder-link'].href = folderUrl.href;
  elements['folder-link'].hidden = false;
}
if (mode === 'folder') {
  document.body.classList.add('folder-mode');
  $('playback-troubleshooting').replaceChildren();
  $('playback-troubleshooting').append(
    textElement('summary', '', 'Acerca de esta vista'),
    textElement('p', '', 'Vista directa de tu carpeta. Selecciona un archivo para abrirlo en Google Drive. Si no carga, usa «Abrir en Drive» y comprueba que la carpeta sea pública.'),
    textElement('p', '', 'Para usar el reproductor, la búsqueda y los filtros propios del sitio, falta configurar la clave pública restringida de Google Drive API en js/config.js. Esta vista no usa la API ni datos ficticios. Al actualizar la carpeta se reinicia su navegación.')
  );
}
if (mode === 'demo') {
  elements['mode-banner'].hidden = false;
  elements['mode-banner'].textContent = 'Demostración · Datos ficticios';
  placeholder('Selecciona una grabación', '', true);
}
elements.refresh.addEventListener('click', refresh);
for (const input of [elements.search, elements.date]) input.addEventListener('input', () => { currentPage = 1; renderCatalog(); });
elements.order.addEventListener('change', () => { currentPage = 1; renderCatalog(); });
elements['clear-filters'].addEventListener('click', () => { elements.search.value = ''; elements.date.value = ''; elements.order.value = 'date-desc'; currentPage = 1; renderCatalog(); });
elements['prev-page'].addEventListener('click', () => { currentPage--; renderCatalog(); });
elements['next-page'].addEventListener('click', () => { currentPage++; renderCatalog(); });
if (configurationError) {
  elements['mode-banner'].hidden = false;
  elements['mode-banner'].textContent = 'No se pudo conectar con el archivo.';
  status(configurationError.message, true);
  elements.recordings.setAttribute('aria-busy', 'false');
  renderCatalog();
  updateRefreshButton();
} else {
  refresh();
  // Una sola comprobación local por segundo, sin tráfico de red. No consulta en pestañas ocultas.
  setInterval(() => {
    updateRefreshButton();
    if (!document.hidden && Date.now() - lastAttempt >= interval && Date.now() >= client.nextAllowedAt) refresh();
  }, 1000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && Date.now() - lastAttempt >= interval) refresh();
  });
  window.addEventListener('online', () => {
    if (!document.hidden && Date.now() - lastAttempt >= interval) refresh();
  });
}
