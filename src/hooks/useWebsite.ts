/**
 * useWebsite — React hooks for the entire Website module
 *
 * One hook per data type. Each hook:
 *   1. Gets activeCompany from TenantContext
 *   2. Calls the corresponding websiteService function
 *   3. Returns { data, isLoading, error, refetch }
 *
 * Usage:
 *   const { data: items } = useItems();
 *   const { data: item } = useItem("abc-123");
 *   const { data: groups } = useGroups(itemId);
 *   const { data: events } = useEvents();
 *   const { data: testimonials } = useTestimonials({ featured: true });
 */
import { useState, useEffect, useCallback } from "react";
import { useTenant } from "@/contexts/TenantContext";
import * as ws from "@/lib/services/websiteService";

// ── Generic hook factory ─────────────────────────────────────────────────────

function useQuery<T>(
  fetcher: (companyId: number) => Promise<T>,
  deps: any[] = []
) {
  const { activeCompany } = useTenant();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!activeCompany) return;
    setIsLoading(true);
    setError(null);
    fetcher(activeCompany.id)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [activeCompany, ...deps]);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, isLoading, error, refetch };
}

// ════════════════════════════════════════════════════════════════════════════
// ITEMS / OFFERINGS
// ════════════════════════════════════════════════════════════════════════════

export function useItems(filters?: Parameters<typeof ws.fetchItems>[1]) {
  return useQuery(
    (cid) => ws.fetchItems(cid, filters),
    [JSON.stringify(filters)]
  );
}

export function useItem(idOrSlug: string) {
  return useQuery(
    (cid) => ws.fetchItem(cid, idOrSlug),
    [idOrSlug]
  );
}

/** Legacy aliases for sparkle compatibility */
export const usePrograms = useItems;
export const useProgram = useItem;

// ════════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ════════════════════════════════════════════════════════════════════════════

export function useCategories() {
  return useQuery((cid) => ws.fetchCategories(cid));
}

// ════════════════════════════════════════════════════════════════════════════
// GROUPS
// ════════════════════════════════════════════════════════════════════════════

export function useGroups(itemId?: string) {
  return useQuery(
    (cid) => ws.fetchGroups(cid, itemId),
    [itemId]
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCHEDULES
// ════════════════════════════════════════════════════════════════════════════

export function useSchedules(groupId?: string) {
  return useQuery(
    (cid) => ws.fetchSchedules(cid, groupId),
    [groupId]
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PRICING
// ════════════════════════════════════════════════════════════════════════════

export function usePricing(itemId?: string) {
  return useQuery(
    (cid) => ws.fetchPricing(cid, itemId),
    [itemId]
  );
}

// ════════════════════════════════════════════════════════════════════════════
// EVENTS
// ════════════════════════════════════════════════════════════════════════════

export function useEvents() {
  return useQuery((cid) => ws.fetchEvents(cid));
}

// ════════════════════════════════════════════════════════════════════════════
// TESTIMONIALS
// ════════════════════════════════════════════════════════════════════════════

export function useTestimonials(options?: Parameters<typeof ws.fetchTestimonials>[1]) {
  return useQuery(
    (cid) => ws.fetchTestimonials(cid, options),
    [JSON.stringify(options)]
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BLOG
// ════════════════════════════════════════════════════════════════════════════

export function useBlogPosts() {
  return useQuery((cid) => ws.fetchBlogPosts(cid));
}

export function useBlogPost(slug: string) {
  return useQuery(
    (cid) => ws.fetchBlogPost(cid, slug),
    [slug]
  );
}

// ════════════════════════════════════════════════════════════════════════════
// GALLERY
// ════════════════════════════════════════════════════════════════════════════

export function useGallery(category?: string) {
  return useQuery(
    (cid) => ws.fetchGallery(cid, category),
    [category]
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FAQs
// ════════════════════════════════════════════════════════════════════════════

export function useFAQs(category?: string) {
  return useQuery(
    (cid) => ws.fetchFAQs(cid, category),
    [category]
  );
}

// ════════════════════════════════════════════════════════════════════════════
// WEB PAGES
// ════════════════════════════════════════════════════════════════════════════

export function useWebPages() {
  return useQuery((cid) => ws.fetchWebPages(cid));
}

export function useWebPage(slug: string) {
  return useQuery(
    (cid) => ws.fetchWebPage(cid, slug),
    [slug]
  );
}

export function usePageSections(pageId: string) {
  return useQuery(
    (cid) => ws.fetchPageSections(cid, pageId),
    [pageId]
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MENU
// ════════════════════════════════════════════════════════════════════════════

export function useMenu(position = "header") {
  return useQuery(
    (cid) => ws.fetchMenuItems(cid, position),
    [position]
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FORMS
// ════════════════════════════════════════════════════════════════════════════

export function useForm(slug: string) {
  return useQuery(
    (cid) => ws.fetchForm(cid, slug),
    [slug]
  );
}
