const KEY = 'salon_appointments';

export function loadAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function saveAll(appts) {
  localStorage.setItem(KEY, JSON.stringify(appts));
}
