// Reserved route prefixes that should NOT be treated as company slugs
export const RESERVED_ROUTES = [
  "apps",
  "login",
  "onboarding",
  "super-admin",
  "reset-password",
  "about",
  "services",
  "products",
  "contact",
  "policy",
  "ecommerce",
  "ecommerce-login",
  "cart",
  "checkout",
] as const;

export type ReservedRoute = typeof RESERVED_ROUTES[number];

export function isReservedRoute(path: string): boolean {
  return RESERVED_ROUTES.includes(path as ReservedRoute);
}
