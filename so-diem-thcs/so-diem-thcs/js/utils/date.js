export function nowIso() {
  return new Date().toISOString();
}

export function formatDateVi(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateTimeVi(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} ${formatDateVi(isoString)}`;
}

export function daysSince(isoString) {
  if (!isoString) return Infinity;
  const then = new Date(isoString).getTime();
  if (Number.isNaN(then)) return Infinity;
  const diffMs = Date.now() - then;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function relativeTimeVi(isoString) {
  const days = daysSince(isoString);
  if (days === Infinity) return 'chưa có dữ liệu';
  if (days <= 0) return 'hôm nay';
  if (days === 1) return 'hôm qua';
  if (days < 7) return `${days} ngày trước`;
  if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
  return `${Math.floor(days / 30)} tháng trước`;
}
