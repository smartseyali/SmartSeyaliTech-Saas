export const GTM_ID =
  process.env.NEXT_PUBLIC_GTM_ID || "GTM-58XDZQF4";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function pushDataLayer(event: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

export function trackPageView(url: string) {
  pushDataLayer({ event: "page_view", page_path: url });
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  pushDataLayer({ event: name, ...params });
}
