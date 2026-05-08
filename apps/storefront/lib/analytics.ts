import { getTenant } from "./tenant";

export const tenantAnalytics = () => getTenant().analytics;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
  }
}

export function pushDataLayer(event: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  pushDataLayer({ event: name, ...params });
}

export function trackViewItem(item: { id: string; name: string; price: number; category?: string }) {
  pushDataLayer({
    event: "view_item",
    ecommerce: {
      currency: "INR",
      value: item.price,
      items: [{ item_id: item.id, item_name: item.name, price: item.price, item_category: item.category }],
    },
  });
}

export function trackAddToCart(item: { id: string; name: string; price: number; quantity: number }) {
  pushDataLayer({
    event: "add_to_cart",
    ecommerce: {
      currency: "INR",
      value: item.price * item.quantity,
      items: [{ item_id: item.id, item_name: item.name, price: item.price, quantity: item.quantity }],
    },
  });
}

export function trackPurchase(order: {
  id: string;
  total: number;
  items: { id: string; name: string; price: number; quantity: number }[];
}) {
  pushDataLayer({
    event: "purchase",
    ecommerce: {
      transaction_id: order.id,
      currency: "INR",
      value: order.total,
      items: order.items.map((i) => ({
        item_id: i.id,
        item_name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
    },
  });
}
