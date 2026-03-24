export function normalizeNafdac(raw: string): string {
  const t = raw.trim().toUpperCase().replace(/\s+/g, '').replace(/[–—]/g, '-');
  if (!t) return '';
  if (t.includes('-')) return t;

  if (/^\d+$/.test(t)) {
    if (t.length === 6) return `${t.slice(0, 2)}-${t.slice(2)}`;
    if (t.length === 7) return `${t.slice(0, 3)}-${t.slice(3)}`;
  }

  return t;
}

export function isPlausibleNafdacCertificate(n: string): boolean {
  const t = normalizeNafdac(n);
  if (!t || !t.includes('-')) return false;
  const parts = t.split('-');
  if (parts.length !== 2) return false;
  const [left, right] = parts;
  if (!left || !right) return false;

  if (!/^\d{4,5}$/.test(right)) return false;
  if (/^\d{2}$/.test(left)) return true;
  if (/^[A-Z]\d$/i.test(left)) return true;
  if (/^[A-Z]{2}$/i.test(left)) return true;
  if (/^[A-Z][A-Z0-9]{0,2}$/i.test(left) && left.length <= 3) return true;

  return false;
}
