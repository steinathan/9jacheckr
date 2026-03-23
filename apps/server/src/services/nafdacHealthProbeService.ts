import { fetchProductFromNafdacRegistration } from '../utils/nafdacRegistrationClient.js';

const SAMPLE_CERT = '01-5713';
const TIMEOUT_MS = 25_000;

export async function runNafdacHealthProbe(): Promise<
  { ok: true } | { ok: false; reason: string }
> {
  try {
    const result = await Promise.race([
      fetchProductFromNafdacRegistration(SAMPLE_CERT),
      new Promise<never>((_, rej) => {
        setTimeout(() => rej(new Error('timeout')), TIMEOUT_MS);
      }),
    ]);
    if (result && typeof result.name === 'string' && result.name.trim()) {
      return { ok: true };
    }
    return { ok: false, reason: 'empty_or_unparsed' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: msg.slice(0, 200) };
  }
}

export const nafdacHealthSampleNumber = SAMPLE_CERT;
