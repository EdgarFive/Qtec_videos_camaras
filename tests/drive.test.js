import test from 'node:test';
import assert from 'node:assert/strict';
import { configurationMode, createDriveClient } from '../js/drive.js';
import { filenameDate, normalizeRecordings, filterRecordings, sortRecordings, durationLabel, driveUrls } from '../js/recordings.js';

const config = { folderId: 'folder-example', apiKey: 'test-public-key', demoWhenUnconfigured: true, apiPageSize: 1000, maxApiPages: 30, manualCooldownMs: 30000 };
const video = (id, name = 'CAM01_2026-10-23_08-00-00.mp4') => ({ id, name, mimeType: 'video/mp4', createdTime: '2026-10-24T01:00:00Z' });
const response = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers });
const noWait = async () => {};

test('demo solo con ambos campos vacíos; configuración parcial y IDs malformados fallan', () => {
  assert.equal(configurationMode({ folderId: '', apiKey: '', demoWhenUnconfigured: true }), 'demo');
  assert.equal(configurationMode(config), 'live');
  assert.throws(() => configurationMode({ ...config, apiKey: '' }), /incompleta/);
  assert.throws(() => configurationMode({ ...config, folderId: "foo' or trashed = true" }), /no son válidos/);
});
test('vista de carpeta explícita sin clave; con clave se usa API y nunca oculta un error de acceso', () => {
  assert.equal(configurationMode({ ...config, apiKey: '', useFolderViewWithoutKey: true }), 'folder');
  assert.equal(configurationMode({ ...config, useFolderViewWithoutKey: true }), 'live');
  assert.throws(() => configurationMode({ ...config, apiKey: '', folderId: 'https://drive.google.com/folder', useFolderViewWithoutKey: true }), /incompleta|válidos/);
});
test('paginación incluso si una página está vacía; deduplica y filtra archivos no video', async () => {
  const requests = [];
  const pages = [{ files: [], nextPageToken: 'page2' }, { files: [video('one'), video('one'), { ...video('doc'), mimeType: 'text/plain' }], nextPageToken: 'page3' }, { files: [video('two')] }];
  const client = createDriveClient(config, { fetchFn: async (url, options) => { requests.push({ url, options }); return response(pages.shift()); } });
  assert.deepEqual((await client.listVideos()).map(file => file.id), ['one', 'two']);
  assert.equal(requests.length, 3);
  assert.equal(requests[0].url.searchParams.get('pageSize'), '1000');
  assert.equal(requests[1].url.searchParams.get('pageToken'), 'page2');
  assert.equal(requests[0].url.searchParams.get('q'), "'folder-example' in parents and trashed = false and mimeType contains 'video/'");
  assert.ok(requests.every(request => request.options.method === 'GET' && request.options.credentials === 'omit'));
});
test('solicitudes simultáneas comparten una sola consulta; espera manual tras éxito', async () => {
  let calls = 0;
  let finish;
  let time = 0;
  const client = createDriveClient(config, { now: () => time, fetchFn: () => { calls++; return new Promise(resolve => { finish = resolve; }); } });
  const a = client.listVideos();
  const b = client.listVideos();
  assert.equal(a, b);
  finish(response({ files: [video('first')] }));
  await a;
  assert.equal(calls, 1);
  await assert.rejects(client.listVideos(), /pausa/);
  time = 30000;
  const next = client.listVideos();
  finish(response({ files: [video('first'), video('new')] }));
  assert.equal((await next).length, 2);
});
test('403 de permisos no se reintenta ni se sustituye por demo', async () => {
  let calls = 0;
  const client = createDriveClient(config, { now: () => 0, fetchFn: async () => { calls++; return response({ error: { errors: [{ reason: 'forbidden' }] } }, 403); } });
  await assert.rejects(client.listVideos(), /rechazó/);
  assert.equal(calls, 1);
  assert.equal(client.nextAllowedAt, 60000);
});
for (const status of [403, 429, 503]) test(`${status} temporal usa reintentos limitados y espera exponencial`, async () => {
  const waits = [];
  let calls = 0;
  const client = createDriveClient(config, { now: () => 0, random: () => 0, wait: async ms => { waits.push(ms); }, fetchFn: async () => { calls++; return response({ error: { errors: [{ reason: 'rateLimitExceeded' }] } }, status); } });
  await assert.rejects(client.listVideos());
  assert.equal(calls, 3);
  assert.deepEqual(waits, [1000, 2000]);
  await assert.rejects(client.listVideos(), /pausa/);
});
test('Retry-After largo no reintenta prematuramente', async () => {
  let calls = 0;
  const client = createDriveClient(config, { now: () => 0, fetchFn: async () => { calls++; return response({}, 429, { 'Retry-After': '600' }); } });
  await assert.rejects(client.listVideos());
  assert.equal(calls, 1);
  assert.equal(client.nextAllowedAt, 600000);
});
test('fallo de red tiene reintentos acotados y mensaje sin exponer la clave', async () => {
  const client = createDriveClient(config, { wait: noWait, fetchFn: async () => { throw new TypeError('secret-test-key'); } });
  await assert.rejects(client.listVideos(), error => /conexión/.test(error.message) && !error.message.includes('secret-test-key'));
});
test('paginación excesiva, repetida o incompleta se rechaza sin resultados parciales', async () => {
  const options = { wait: noWait, fetchFn: async () => response({ files: [video('one')], nextPageToken: 'again' }) };
  await assert.rejects(createDriveClient({ ...config, maxApiPages: 1 }, options).listVideos(), /límite de páginas/);
  await assert.rejects(createDriveClient(config, options).listVideos(), /repetida/);
  await assert.rejects(createDriveClient(config, { fetchFn: async () => response({ files: [], incompleteSearch: true }) }).listVideos(), /incompleta/);
});
test('reintento posterior descubre videos nuevos y elimina archivos retirados', async () => {
  let time = 0;
  let files = [video('old')];
  const client = createDriveClient(config, { now: () => time, fetchFn: async () => response({ files }) });
  assert.equal((await client.listVideos())[0].id, 'old');
  files = [video('new')];
  time = 300000;
  assert.equal((await client.listVideos())[0].id, 'new');
});
test('clave de recurso opcional se envía a Drive', async () => {
  let headers;
  const client = createDriveClient({ ...config, folderResourceKey: 'public-resource' }, { fetchFn: async (_url, options) => { headers = options.headers; return response({ files: [] }); } });
  await client.listVideos();
  assert.equal(headers['X-Goog-Drive-Resource-Keys'], 'folder-example/public-resource');
});
test('fecha del nombre con hora, compacta y fechas imposibles', () => {
  assert.equal(filenameDate('CAM01_2026-10-23_08-30-59.mp4').hour, '08:30');
  assert.equal(filenameDate('CAM01_20261023_083059.mp4').dayKey, '2026-10-23');
  assert.equal(filenameDate('2026-02-30.mp4'), null);
  assert.equal(filenameDate('2026-10-23_25-00-00.mp4'), null);
  assert.equal(filenameDate('sin_fecha.mp4'), null);
});
test('se usa solo la fecha del nombre sin inferir fechas de subida', () => {
  const files = normalizeRecordings([video('name'), video('upload', 'otro.mp4'), { id: 'unknown', name: 'sin_fecha.mp4' }], 'America/Guatemala');
  assert.equal(files.find(file => file.id === 'name').dateSource, 'Grabación');
  assert.equal(files.find(file => file.id === 'name').hour, '08:00');
  assert.equal(files.find(file => file.id === 'upload').dayKey, '');
  assert.equal(files.find(file => file.id === 'upload').hour, '');
  assert.equal(files.at(-1).dateSource, 'Sin fecha en nombre');
});
test('nombres históricos de QTEC: mes español y año desconocido explícito', () => {
  for (const name of ['01 oct (1).mp4', '01 octu (2).mp4', '01 octubre.mp4']) {
    const date = filenameDate(name);
    assert.equal(date.monthDay, '10-01');
    assert.equal(date.year, null);
    assert.equal(date.dayKey, '');
    assert.match(date.label, /año no indicado/);
  }
  assert.equal(filenameDate('23 sept (1).mp4').monthDay, '09-23');
  assert.equal(filenameDate('31 sept.mp4'), null);
  assert.equal(filenameDate('29 febrero 2025.mp4'), null);
  assert.equal(filenameDate('23 de septiembre de 2026.mp4').dayKey, '2026-09-23');
});
test('fecha del nombre vence metadatos y partes se ordenan naturalmente', () => {
  const files = normalizeRecordings([
    video('sep', '30 sept (1).mp4'), video('oct10', '01 oct (10).mp4'),
    video('oct2', '01 oct (2).mp4'), video('oct1', '01 oct (1).mp4'),
    { ...video('unknown', 'sin_fecha.mp4'), createdTime: '2099-01-01T00:00:00Z' },
  ]);
  assert.deepEqual(files.map(file => file.id), ['oct1', 'oct2', 'oct10', 'sep', 'unknown']);
  assert.equal(filterRecordings(files, '', '1 octubre').length, 3);
  assert.equal(filterRecordings(files, '', '2026-10-01').length, 0);
  assert.equal(filterRecordings(files, '(2)', '1 oct')[0].id, 'oct2');
  assert.equal(filterRecordings(files, '', 'fecha inválida').length, 0);
  assert.equal(sortRecordings(files, 'name-asc')[0].id, 'oct1');
  assert.equal(sortRecordings(files, 'name-desc')[0].id, 'unknown');
});
test('búsqueda y fecha se combinan, orden reciente primero, nombres tratados como datos', () => {
  const files = normalizeRecordings([video('a', '<script>2026-10-22.mp4'), video('b', 'CAM_2026-10-23.mp4')], 'America/Guatemala');
  assert.equal(files[0].id, 'b');
  assert.equal(filterRecordings(files, 'cam', '2026-10-23')[0].id, 'b');
  assert.equal(filterRecordings(files, 'CAM', '2026-10-22').length, 0);
  assert.equal(filterRecordings(files, '<script>', '').length, 1);
});
test('enlaces fijos oficiales con resourcekey; duración no inventada', () => {
  assert.deepEqual(driveUrls({ id: 'file', resourceKey: 'key' }), { preview: 'https://drive.google.com/file/d/file/preview?resourcekey=key', view: 'https://drive.google.com/file/d/file/view?resourcekey=key' });
  assert.equal(durationLabel(3600000), '1:00:00');
  assert.equal(durationLabel(65000), '01:05');
  assert.equal(durationLabel(0), 'Duración no disponible');
});
