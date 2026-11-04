// Datos ficticios. No contienen IDs de Drive ni referencias a videos reales.
export function demoFiles() {
  return Array.from({ length: 17 }, (_, index) => {
    const date = new Date(Date.UTC(2026, 9, 23, 16 - index, 0));
    const day = date.toISOString().slice(0, 10);
    const hour = String(date.getUTCHours()).padStart(2, '0');
    return { id: `demo-${index + 1}`, name: `CAM01_${day}_${hour}-00-00.mp4`, mimeType: 'video/mp4', createdTime: date.toISOString(), videoMediaMetadata: { durationMillis: '3600000', width: 1920, height: 1080 }, demo: true };
  });
}
