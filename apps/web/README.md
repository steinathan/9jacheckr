# Web

Next.js site, `/login` (Google), `/dashboard` (API keys + verify example).

**Env:** `apps/web/.env.local`

| Variable                     | Notes                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`   | API origin for auth & dashboard (no trailing slash).                                                                                            |
| `WEB_VERIFY_INTERNAL_SECRET` | **Server-only.** Same long random value as on the API server; used by `/api/verify-lookup` to call `/api/public/verify`. Never `NEXT_PUBLIC_*`. |
| `WEB_APP_URL`                | **Production:** canonical site URL (e.g. `https://yourdomain.com`). Used to validate browser requests to `/api/verify-lookup`. Optional in dev. |
| `API_BASE_URL`               | Optional. If set, `/api/verify-lookup` uses this to reach the API (server-side). Falls back to `NEXT_PUBLIC_API_BASE_URL`.                      |

Server `WEB_APP_URL` (Express CORS) should match this app’s public URL (e.g. `http://localhost:3000`).

```bash
npm run dev -w web
```
