/**
 * Memformat ISO Date / Timestamp menjadi waktu lokal relatif (Relative Time)
 * Contoh: "2 menit yang lalu", "Baru saja"
 */
export function formatRelativeTime(isoString: string): string {
  if (!isoString) return '-';

  const now = new Date();
  const past = new Date(isoString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 10) return 'Baru saja';
  if (diffInSeconds < 60) return `${diffInSeconds} detik yang lalu`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam yang lalu`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} hari yang lalu`;
}

/**
 * Memformat timestamp menjadi jam dan menit lokal WIB (HH:mm:ss)
 */
export function formatTimeOnly(isoString: string): string {
  if (!isoString) return '--:--:--';
  const date = new Date(isoString);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Memformat tanggal lengkap dalam bahasa Indonesia
 * Contoh: "24 Juli 2026, 16:30"
 */
export function formatFullDateTime(isoString: string): string {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
