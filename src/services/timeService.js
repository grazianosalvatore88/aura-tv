export function getDeviceDate() {
  return new Date();
}

export function formatDeviceTime(date = getDeviceDate()) {
  return new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatDeviceDateTime(date = getDeviceDate()) {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function getProgressBetween(start, stop, now = getDeviceDate()) {
  const startMs = start?.getTime?.() || 0;
  const stopMs = stop?.getTime?.() || 0;
  const nowMs = now?.getTime?.() || Date.now();

  if (!startMs || !stopMs || stopMs <= startMs) return 0;

  return Math.max(0, Math.min(100, Math.round(((nowMs - startMs) / (stopMs - startMs)) * 100)));
}
