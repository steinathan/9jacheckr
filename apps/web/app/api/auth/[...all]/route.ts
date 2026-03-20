import { getAuth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

let handlerPromise: ReturnType<typeof toNextJsHandler> | null = null;

async function getHandler() {
  if (!handlerPromise) {
    const auth = await getAuth();
    handlerPromise = toNextJsHandler(auth);
  }
  return handlerPromise;
}

export async function GET(req: Request) {
  const h = await getHandler();
  return h.GET(req);
}

export async function POST(req: Request) {
  const h = await getHandler();
  return h.POST(req);
}
