import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteNav } from '@/components/site-nav';

export const metadata: Metadata = {
  title: 'Disclaimer · 9ja Checkr',
  description:
    'How 9ja Checkr relates to NAFDAC, what our data is for, and important limitations.',
};

export default function DisclaimerPage() {
  return (
    <div className="page-bg min-h-dvh w-full min-w-0 overflow-x-hidden text-foreground">
      <SiteNav />

      <main className="relative mx-auto max-w-[720px] min-w-0 px-5 pb-24 pt-14 sm:px-6 sm:pb-28 sm:pt-20">
        <h1 className="font-display text-[2rem] font-semibold tracking-tight sm:text-[2.25rem]">
          Disclaimer &amp; Data Source
        </h1>
        <div
          className="mt-4 space-y-4 text-[14px] leading-relaxed"
          style={{ color: 'var(--text-2)' }}
        >
          <p>
            This document provides general information about 9ja Checkr and
            how to interpret its outputs. It does not constitute legal,
            regulatory, or professional advice. For any regulated,
            safety-critical, or high-stakes decisions, users should consult
            qualified professionals and refer directly to official channels
            provided by the National Agency for Food and Drug Administration and
            Control (NAFDAC).
          </p>
        </div>

        <section className="mt-10 space-y-4 text-[14px] leading-relaxed text-(--text-2)">
          <h2 className="text-[15px] font-semibold text-foreground">
            Independence and Non-Affiliation
          </h2>
          <p>
            9ja Checkr is an independent service. It is not affiliated with,
            endorsed by, sponsored by, or operated by the National Agency for
            Food and Drug Administration and Control (NAFDAC) or any
            governmental authority, except where explicitly stated in writing.
          </p>

          <h2 className="pt-4 text-[15px] font-semibold text-foreground">
            Nature of the Service
          </h2>
          <p>
            9ja Checkr provides a data lookup and automation layer designed to
            assist users in retrieving and interacting with product registration
            information that is publicly accessible through NAFDAC&apos;s official
            channels.
          </p>
          <p>
            The service processes and presents this information in a structured
            and developer-friendly format (e.g., via API, web interface, or
            messaging platforms).
          </p>
          <p>
            9ja Checkr does not represent or claim to provide an official NAFDAC
            verification service, nor does it issue government-certified
            results.
          </p>

          <h2 className="pt-4 text-[15px] font-semibold text-foreground">
            Accuracy and Data Limitations
          </h2>
          <p>
            The accuracy, completeness, and timeliness of information provided
            by 9ja Checkr depend on multiple factors, including:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              The availability and consistency of publicly accessible NAFDAC
              data
            </li>
            <li>Network and system conditions</li>
            <li>Data extraction, parsing, and caching processes</li>
          </ul>
          <p>
            As a result, information may be incomplete, outdated, or inaccurate.
            9ja Checkr may cache certain responses to improve performance and
            reliability. Users should refer to the platform&apos;s technical
            documentation for further details on data handling and caching
            mechanisms.
          </p>

          <h2 className="pt-4 text-[15px] font-semibold text-foreground">
            Appropriate Use
          </h2>
          <p>
            9ja Checkr is intended as a convenience and integration tool. It
            should not be relied upon as the sole source of truth for legal,
            regulatory, medical, safety, or compliance-related decisions.
          </p>
          <p>
            Users are strongly advised to independently verify all critical
            information directly with NAFDAC or other relevant official sources
            and to comply with all applicable laws and regulations.
          </p>

          <h2 className="pt-4 text-[15px] font-semibold text-foreground">
            API and Downstream Usage
          </h2>
          <p>
            Users integrating 9ja Checkr into their own applications or
            services are responsible for clearly communicating to their end
            users that:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>The data is sourced from an independent lookup service</li>
            <li>
              It does not constitute an official statement or certification from
              NAFDAC
            </li>
          </ul>
          <p>
            API users should ensure their own terms of service appropriately
            address data reliance, limitations, and liability, and are encouraged
            to seek independent legal advice where necessary.
          </p>
        </section>

        <p className="mt-12 border-t border-(--border-subtle) pt-8 text-[13px] text-(--text-3)">
          <Link
            href="/"
            className="font-medium text-(--accent) underline underline-offset-2 hover:text-(--accent-hover)"
          >
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
