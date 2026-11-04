const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MONTH_NAMES = { ene: 1, enero: 1, feb: 2, febrero: 2, mar: 3, marzo: 3, abr: 4, abril: 4, may: 5, mayo: 5, jun: 6, junio: 6, jul: 7, julio: 7, ago: 8, agosto: 8, sep: 9, sept: 9, set: 9, septiembre: 9, setiembre: 9, oct: 10, octu: 10, octubre: 10, nov: 11, noviembre: 11, dic: 12, diciembre: 12 };
const naturalName = new Intl.Collator('es', { numeric: true, sensitivity: 'base' });

// Acepta fechas completas y los nombres históricos de QTEC ("01 oct (1)").
// Nunca infiere un año a partir de la fecha de subida.
export function filenameDate(name) {
  const numeric = name.match(/(?:^|\D)(20\d{2})[-_]?([01]\d)[-_]?([0-3]\d)(?!\d)(?:[T _-]([0-2]\d)[-_:]?([0-5]\d)(?:[-_:]?([0-5]\d))?)?/);
  const words = name.toLocaleLowerCase('es').match(/(?:^|[^\p{L}\d])(\d{1,2})[\s_-]+(?:de[\s_-]+)?([a-z]+)\.?(?:[\s_-]+(?:de[\s_-]+)?(20\d{2})(?!\d))?(?=$|[^\p{L}\d])/u);
  if (!numeric && (!words || !MONTH_NAMES[words[2]])) return null;
  const year = numeric ? +numeric[1] : words[3] ? +words[3] : null;
  const month = numeric ? +numeric[2] : MONTH_NAMES[words[2]];
  const day = numeric ? +numeric[3] : +words[1];
  const hour = numeric?.[4] ?? '00';
  const minute = numeric?.[5] ?? '00';
  const second = numeric?.[6] ?? '00';
  const value = new Date(Date.UTC(year ?? 2000, month - 1, day, +hour, +minute, +second));
  if (value.getUTCFullYear() !== (year ?? 2000) || value.getUTCMonth() !== month - 1 || value.getUTCDate() !== day || +hour > 23) return null;
  const monthDay = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return { year, month, day, monthDay, dayKey: year ? `${year}-${monthDay}` : '', timestamp: year ? +value : null, hasTime: numeric?.[4] !== undefined, hour: `${hour}:${minute}`, second, label: `${day} ${MONTHS[month - 1]}${year ? ` ${year}` : ' · año no indicado'}` };
}

export function normalizeRecordings(files) {
  return sortRecordings(files.map(file => {
    const fromName = filenameDate(file.name);
    const hour = fromName?.hasTime ? fromName.hour : '';
    return { ...file, dayKey: fromName?.dayKey ?? '', monthDay: fromName?.monthDay ?? '', dateLabel: fromName?.label ?? '', hour, dateSource: fromName ? 'Grabación' : 'Sin fecha en nombre', sortKey: fromName ? `${fromName.year ?? '0000'}-${fromName.monthDay}T${hour || '00:00'}:${fromName.second}` : '', duration: Number(file.videoMediaMetadata?.durationMillis) || 0 };
  }));
}

export function sortRecordings(recordings, order = 'date-desc') {
  return [...recordings].sort((a, b) => {
    if (order === 'name-asc') return naturalName.compare(a.name, b.name) || a.id.localeCompare(b.id);
    if (order === 'name-desc') return naturalName.compare(b.name, a.name) || a.id.localeCompare(b.id);
    return b.sortKey.localeCompare(a.sortKey) || naturalName.compare(a.name, b.name) || a.id.localeCompare(b.id);
  });
}

export function filterRecordings(recordings, search, day) {
  const query = search.trim().toLocaleLowerCase('es');
  const dateQuery = day.trim();
  const date = dateQuery ? filenameDate(dateQuery) : null;
  return recordings.filter(file => (!query || file.name.toLocaleLowerCase('es').includes(query)) && (!dateQuery || (date && (date.year ? file.dayKey === date.dayKey : file.monthDay === date.monthDay))));
}

export function durationLabel(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return 'Duración no disponible';
  const total = Math.floor(ms / 1000);
  const seconds = String(total % 60).padStart(2, '0');
  const minutes = String(Math.floor(total / 60) % 60).padStart(2, '0');
  const hours = Math.floor(total / 3600);
  return hours ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
}

export function driveUrls(file) {
  const suffix = file.resourceKey ? `?resourcekey=${encodeURIComponent(file.resourceKey)}` : '';
  const root = `https://drive.google.com/file/d/${encodeURIComponent(file.id)}`;
  return { preview: `${root}/preview${suffix}`, view: `${root}/view${suffix}` };
}
