'use client';

import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export function MarketingNavActions() {
  const { data: session, isPending } = authClient.useSession();
  const signedIn = Boolean(session?.user);

  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-10 w-14 animate-pulse rounded-lg skeleton lg:h-8 lg:w-12 lg:rounded-md" />
        <div className="h-10 w-22 animate-pulse rounded-lg skeleton lg:h-8 lg:w-24 lg:rounded-md" />
      </div>
    );
  }

  const navCtaClass =
    'btn-primary focus-visible-ring !h-10 min-h-10 px-[18px] text-[14px] rounded-[10px] lg:!h-9 lg:min-h-0 lg:px-4 lg:text-[13.5px] lg:rounded-lg';

  if (signedIn) {
    return (
      <Link href="/dashboard" className={navCtaClass}>
        Dashboard
      </Link>
    );
  }

  return (
    <Link href="/login?next=/dashboard" className={navCtaClass}>
      Get started
    </Link>
  );
}
