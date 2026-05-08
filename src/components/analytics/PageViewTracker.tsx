"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/gtm";

function Inner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    const qs = searchParams.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    if (url !== lastUrl.current) {
      lastUrl.current = url;
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  return null;
}

export function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
