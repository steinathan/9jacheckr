const MAX_LEN = 24;

export function parseBotTelegramId(raw: unknown): string | null {
  if (raw == null) return null;
  const s = typeof raw === 'string' ? raw.trim() : String(raw).trim();
  if (!s || s.length > MAX_LEN || !/^\d+$/.test(s)) return null;
  return s;
}
