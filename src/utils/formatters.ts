/**
 * Memformat angka menjadi format Rupiah (IDR)
 * Contoh: 1500000 -> "Rp 1.500.000"
 */
export function formatIDR(amount: number, showSymbol: boolean = true): string {
  if (isNaN(amount) || amount === null) return showSymbol ? 'Rp 0' : '0';

  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(amount);

  return showSymbol ? `Rp ${formatted}` : formatted;
}

/**
 * Memformat jumlah koin kripto dengan presisi desimal yang fleksibel
 * Contoh: 0.0054321 -> "0.005432"
 */
export function formatCrypto(amount: number, decimals: number = 6): string {
  if (isNaN(amount) || amount === null) return '0';
  return amount.toFixed(decimals).replace(/\.?0+$/, '');
}

/**
 * Memformat nilai persentase dengan tanda plus/minus
 * Contoh: 2.5 -> "+2.50%", -1.2 -> "-1.20%"
 */
export function formatPercent(value: number, includeSign: boolean = true): string {
  if (isNaN(value) || value === null) return '0.00%';

  const formatted = value.toFixed(2);
  if (includeSign && value > 0) {
    return `+${formatted}%`;
  }
  return `${formatted}%`;
}

/**
 * Memotong string teks yang terlalu panjang (Truncate)
 */
export function truncateString(str: string, maxLength: number = 20): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}
