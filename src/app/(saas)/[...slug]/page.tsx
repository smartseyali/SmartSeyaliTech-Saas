"use client";

// The entire SaaS admin is a client-side React Router SPA.
// Next.js acts as the server-side shell; React Router takes over on the client.
// This catch-all page handles every route not claimed by the (marketing) group.

import { use } from "react";
import dynamic from "next/dynamic";

const SaasApp = dynamic(() => import("@/SaasApp"), { ssr: false });

type Props = { params: Promise<{ slug: string[] }> };

export default function SaasPage({ params }: Props) {
  const { slug } = use(params);

  // Guard: [..slug] should never match "/" but if it does (e.g. stale Turbopack
  // cache still using old optional [[...slug]]), render nothing so the marketing
  // home page is not overridden.
  if (!slug?.length) return null;

  return <SaasApp />;
}
