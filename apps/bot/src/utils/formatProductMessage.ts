import type { ProductDto } from '../types/apiTypes.js';

function formatDate(value: string | null): string {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toISOString().slice(0, 10);
}

/** How long ago a past date was (aligned with web verify UI). */
function relativeTimePast(past: Date, now: Date): string {
  const dayMs = 86_400_000;
  const totalDays = Math.floor((now.getTime() - past.getTime()) / dayMs);
  if (totalDays < 1) return 'less than a day ago';
  if (totalDays === 1) return '1 day ago';
  if (totalDays < 7) return `${totalDays} days ago`;

  const weeks = Math.floor(totalDays / 7);
  if (totalDays < 30) {
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }

  let months =
    (now.getFullYear() - past.getFullYear()) * 12 +
    (now.getMonth() - past.getMonth());
  if (now.getDate() < past.getDate()) months -= 1;
  if (months < 1) {
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (months < 12) {
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }

  const years = Math.floor(months / 12);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

function formatExpiryWithRelative(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dateStr = d.toISOString().slice(0, 10);
  const now = new Date();
  if (d >= now) return dateStr;
  return `${dateStr} · The registration expired ${relativeTimePast(d, now)}.`;
}

function expiryStatus(expiryDate: string | null): {
  line: string;
  warn: boolean;
} {
  if (!expiryDate) return { line: '', warn: false };
  const d = new Date(expiryDate);
  if (Number.isNaN(d.getTime())) return { line: '', warn: false };
  const now = new Date();
  const ms = d.getTime() - now.getTime();
  const days = Math.ceil(ms / (24 * 60 * 60 * 1000));
  if (days < 0)
    return {
      line: `⚠️ The registration expired ${relativeTimePast(d, now)}. Treat as historical — confirm on packaging. Do not use if in doubt; buy from licensed outlets only.`,
      warn: true,
    };
  if (days <= 90)
    return {
      line: `⚠️ Expires in ${days} day(s). Check packaging.`,
      warn: true,
    };
  return { line: `Expires in ${days} day(s).`, warn: false };
}

export function formatVerifyReply(product: ProductDto): string {
  const exp = expiryStatus(product.expiryDate);
  const lines = [
    '<b>9ja Checkr - NAFDAC lookup</b>',
    '',
    `<b>Status:</b> Listed in registry (verify details on pack & NAFDAC channels).`,
    `<b>NAFDAC:</b> <code>${escapeHtml(product.nafdac)}</code>`,
    `<b>Name:</b> ${escapeHtml(product.name)}`,
    `<b>Category:</b> ${escapeHtml(product.category || '—')}`,
    `<b>Manufacturer:</b> ${escapeHtml(product.manufacturer || '—')}`,
    `<b>Approved:</b> ${formatDate(product.approvedDate)}`,
    `<b>Expiry:</b> ${formatExpiryWithRelative(product.expiryDate)}`,
  ];
  if (product.ingredients.length) {
    lines.push(
      '',
      '<b>Ingredients:</b>',
      escapeHtml(product.ingredients.join(', ')),
    );
  }
  if (exp.line) lines.push('', exp.line);
  lines.push(
    '',
    '<i>Always confirm with your pharmacist. Forwarding helps others stay safe.</i>',
  );
  return lines.join('\n');
}

export function formatNotFoundMessage(nafdac: string): string {
  return [
    '<b>9ja Checkr</b>',
    '',
    `<b>Not approved / not found</b> for <code>${escapeHtml(nafdac)}</code>.`,
    '',
    'We could not match this number. It may be fake, mistyped, or not yet in our data source.',
    '',
    '<i>Do not consume if in doubt. Buy from licensed outlets only.</i>',
  ].join('\n');
}

export function formatErrorMessage(message: string): string {
  return ['<b>9ja Checkr</b>', '', escapeHtml(message)].join('\n');
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
