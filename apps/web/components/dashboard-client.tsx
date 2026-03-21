'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost } from '@/lib/api';

type KeyResponse = {
  ok: boolean;
  key: null | {
    id: string;
    keyPrefix: string;
    maskedKey: string;
    lastUsedAt: string | null;
  };
};

type CreateKeyResponse = {
  ok: boolean;
  key: {
    id: string;
    rawKey: string;
    keyPrefix: string;
    maskedKey: string;
    lastUsedAt: string | null;
  };
};

type MetricResponse = {
  ok: boolean;
  period: string;
  metrics: null | {
    total: number;
    success: number;
    notFound: number;
    errors: number;
  };
};

type TopSearchesResponse = {
  ok: boolean;
  items: Array<{ nafdac: string; count: number }>;
};

export function DashboardClient() {
  const queryClient = useQueryClient();

  const keyQuery = useQuery({
    queryKey: ['key'],
    queryFn: () => apiGet<KeyResponse>('/api/keys/me'),
  });

  const metricsQuery = useQuery({
    queryKey: ['metrics'],
    queryFn: () => apiGet<MetricResponse>('/api/metrics/me?period=month'),
  });

  const topQuery = useQuery({
    queryKey: ['top-searches'],
    queryFn: () =>
      apiGet<TopSearchesResponse>('/api/metrics/top-searches?limit=10'),
  });

  const createMutation = useMutation({
    mutationFn: () => apiPost<CreateKeyResponse>('/api/keys/create'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['key'] }),
  });

  const revokeMutation = useMutation({
    mutationFn: () => apiDelete<{ ok: true }>('/api/keys/me'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['key'] }),
  });

  const key = keyQuery.data?.key;
  const metric = metricsQuery.data?.metrics;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border p-6 bg-white">
        <h2 className="text-xl font-semibold">API Key</h2>
        <p className="text-sm text-zinc-600 mt-2">
          Use this key in <code>x-api-key</code> for `/api/verify/:nafdac`.
        </p>

        <div className="mt-4 space-y-2">
          <div className="text-sm">
            Current key: {key ? key.maskedKey : 'No key created'}
          </div>
          <div className="text-sm">
            Last used:{' '}
            {key?.lastUsedAt
              ? new Date(key.lastUsedAt).toLocaleString()
              : 'Never'}
          </div>
        </div>

        {createMutation.data?.key?.rawKey ? (
          <div className="mt-4 rounded-md bg-emerald-50 text-emerald-800 p-3 text-sm">
            New key (copy now): {createMutation.data.key.rawKey}
          </div>
        ) : null}

        <div className="mt-4 flex gap-3">
          <button
            className="rounded-md bg-black text-white px-4 py-2 text-sm"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
          >
            {key ? 'Rotate key' : 'Create key'}
          </button>
          <button
            className="rounded-md border px-4 py-2 text-sm"
            onClick={() => revokeMutation.mutate()}
            disabled={revokeMutation.isPending}
          >
            Revoke
          </button>
        </div>
      </section>

      <section className="rounded-xl border p-6 bg-white">
        <h2 className="text-xl font-semibold">Usage Metrics</h2>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="rounded-md bg-zinc-50 p-3">
            Total: {metric?.total ?? 0}
          </div>
          <div className="rounded-md bg-zinc-50 p-3">
            Success: {metric?.success ?? 0}
          </div>
          <div className="rounded-md bg-zinc-50 p-3">
            Not found: {metric?.notFound ?? 0}
          </div>
          <div className="rounded-md bg-zinc-50 p-3">
            Errors: {metric?.errors ?? 0}
          </div>
        </div>
      </section>

      <section className="rounded-xl border p-6 bg-white">
        <h2 className="text-xl font-semibold">Top Searched NAFDAC Numbers</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {(topQuery.data?.items ?? []).map((item) => (
            <li
              key={item.nafdac}
              className="flex justify-between rounded-md bg-zinc-50 p-2"
            >
              <span>{item.nafdac}</span>
              <span>{item.count}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
