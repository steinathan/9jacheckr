import { ApiKeySection } from '@/components/dashboard/api-key-section';

export default function KeysPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[1.5rem] font-semibold tracking-[-0.03em] text-[var(--text)]">
          API Keys
        </h1>
        <p className="mt-1 text-[14px] text-[var(--text-2)]">
          Manage keys for{' '}
          <code className="font-mono text-[13px] text-[var(--text-3)]">
            /api/verify
          </code>
          . Usage counts update when you call verify with your key.
        </p>
      </div>
      <ApiKeySection apiBaseUrl={apiBaseUrl} />
    </div>
  );
}
