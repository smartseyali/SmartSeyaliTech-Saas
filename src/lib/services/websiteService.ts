/**
 * Website Service — Complete API layer for the Website Module
 *
 * Every function is tenant-scoped via company_id.
 * Used by public storefront pages, sparkle pages, and any frontend.
 *
 * Data sources:
 *   Items/Offerings → master_items (is_live=true, is_published=true)
 *   Groups/Batches  → web_groups
 *   Schedules       → web_schedules
 *   Registrations   → web_registrations
 *   Pricing         → web_pricing + web_pricing_items
 *   Payments        → web_payments
 *   Credentials     → web_credentials
 *   Events          → web_events
 *   Testimonials    → web_testimonials
 *   Blog            → blog_posts
 *   Gallery         → gallery_items
 *   FAQs            → web_faqs
 *   Pages           → web_pages + web_page_sections
 *   Menu            → web_menu_items
 *   Enquiries       → web_enquiries
 *   Forms           → web_forms + web_form_submissions
 */
import db from "@/lib/db";

// ════════════════════════════════════════════════════════════════════════════
// ITEMS / OFFERINGS (master_items)
// ════════════════════════════════════════════════════════════════════════════

export async function fetchItems(companyId: number, filters?: {
  type?: string;
  category?: string;
  featured?: boolean;
  search?: string;
}) {
  let query = db
    .from("master_items")
    .select("*, master_categories(name)")
    .eq("company_id", companyId)
    .eq("is_live", true);

  if (filters?.type) query = query.eq("item_type", filters.type);
  if (filters?.category) query = query.eq("category_id", filters.category);
  if (filters?.featured) query = query.eq("featured", true);
  if (filters?.search) query = query.ilike("item_name", `%${filters.search}%`);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapItem);
}

export async function fetchItem(companyId: number, idOrSlug: string) {
  // Try by ID first
  const { data } = await db
    .from("master_items")
    .select("*, master_categories(name)")
    .eq("company_id", companyId)
    .eq("id", idOrSlug)
    .maybeSingle();

  if (data) return mapItem(data);

  // Fallback: match by item_code (slug)
  const { data: byCode } = await db
    .from("master_items")
    .select("*, master_categories(name)")
    .eq("company_id", companyId)
    .ilike("item_code", idOrSlug)
    .maybeSingle();

  return byCode ? mapItem(byCode) : null;
}

function mapItem(item: any) {
  return {
    id: item.id,
    name: item.item_name,
    code: item.item_code,
    slug: item.item_code?.toLowerCase().replace(/\s+/g, "-") || item.id,
    type: item.item_type,
    description: item.description || "",
    longDescription: item.long_description || "",
    category: item.master_categories?.name || "",
    categoryId: item.category_id,
    image: item.image_url || "",
    price: item.selling_price || 0,
    mrp: item.mrp || 0,
    gstRate: item.gst_rate || 0,
    featured: item.featured || false,
    published: item.is_published || false,
    deliveryMode: item.delivery_mode,
    duration: item.duration_value ? `${item.duration_value} ${item.duration_unit || ""}`.trim() : null,
    durationValue: item.duration_value,
    durationUnit: item.duration_unit,
    level: item.level,
    maxCapacity: item.max_capacity,
    eligibility: item.eligibility,
    highlights: item.highlights || [],
    brochureUrl: item.brochure_url,
    outline: item.outline || [],
    tags: item.tags || [],
    seoTitle: item.web_title || item.item_name,
    seoDescription: item.seo_description || "",
    status: item.status,
    customFields: item.custom_fields || {},
  };
}

/** Legacy alias — keeps existing sparkle code working */
export const fetchPrograms = fetchItems;
export const fetchProgram = fetchItem;

// ════════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ════════════════════════════════════════════════════════════════════════════

export async function fetchCategories(companyId: number) {
  const { data, error } = await db
    .from("master_categories")
    .select("id, name, description, image_url, sort_order")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data || [];
}

// ════════════════════════════════════════════════════════════════════════════
// GROUPS (batches, slots, cohorts)
// ════════════════════════════════════════════════════════════════════════════

export async function fetchGroups(companyId: number, itemId?: string) {
  let query = db
    .from("web_groups")
    .select("*, master_items(item_name)")
    .eq("company_id", companyId)
    .eq("is_registration_open", true)
    .order("start_date", { ascending: true });

  if (itemId) query = query.eq("item_id", itemId);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(g => ({
    id: g.id,
    name: g.name,
    code: g.code,
    itemName: g.master_items?.item_name || "",
    startDate: g.start_date,
    endDate: g.end_date,
    schedule: g.schedule,
    maxCapacity: g.max_capacity,
    registeredCount: g.registered_count || 0,
    instructor: g.facilitator_name,
    venue: g.venue,
    mode: g.delivery_mode,
    meetingLink: g.meeting_link,
    status: g.status,
    isOpen: g.is_registration_open,
  }));
}

// ════════════════════════════════════════════════════════════════════════════
// SCHEDULES (sessions, appointments, classes)
// ════════════════════════════════════════════════════════════════════════════

export async function fetchSchedules(companyId: number, groupId?: string) {
  let query = db
    .from("web_schedules")
    .select("*, web_groups(name)")
    .eq("company_id", companyId)
    .order("schedule_date", { ascending: true });

  if (groupId) query = query.eq("group_id", groupId);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(s => ({
    id: s.id,
    title: s.title,
    description: s.description,
    groupName: s.web_groups?.name || "",
    date: s.schedule_date,
    startTime: s.start_time,
    endTime: s.end_time,
    duration: s.duration_minutes,
    type: s.schedule_type,
    instructor: s.facilitator_name,
    venue: s.venue,
    meetingLink: s.meeting_link,
    recordingUrl: s.recording_url,
    status: s.status,
  }));
}

// ════════════════════════════════════════════════════════════════════════════
// PRICING
// ════════════════════════════════════════════════════════════════════════════

export async function fetchPricing(companyId: number, itemId?: string) {
  let query = db
    .from("web_pricing")
    .select("*, web_pricing_items(*)")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("total_amount", { ascending: true });

  if (itemId) query = query.eq("item_id", itemId);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(p => ({
    id: p.id,
    name: p.name,
    type: p.pricing_type,
    totalAmount: p.total_amount,
    currency: p.currency,
    installmentsAllowed: p.installments_allowed,
    installmentCount: p.installment_count,
    taxInclusive: p.tax_inclusive,
    taxRate: p.tax_rate,
    validFrom: p.valid_from,
    validTo: p.valid_to,
    items: (p.web_pricing_items || []).map((i: any) => ({
      label: i.item_label,
      amount: i.amount,
      optional: i.is_optional,
    })),
  }));
}

// ════════════════════════════════════════════════════════════════════════════
// EVENTS
// ════════════════════════════════════════════════════════════════════════════

export async function fetchEvents(companyId: number) {
  const { data, error } = await db
    .from("web_events")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_published", true)
    .order("start_date", { ascending: true });

  if (error) throw error;
  return (data || []).map(e => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    description: e.description,
    type: e.event_type,
    startDate: e.start_date,
    endDate: e.end_date,
    venue: e.venue,
    address: e.address,
    meetingLink: e.meeting_link,
    mode: e.mode,
    image: e.image_url,
    maxAttendees: e.max_attendees,
    registrationCount: e.registration_count || 0,
    isFree: e.is_free,
    ticketPrice: e.ticket_price,
    organizer: e.organizer_name,
    contactEmail: e.contact_email,
    tags: e.tags || [],
    status: e.status,
    featured: e.is_featured,
  }));
}

export async function registerForEvent(
  companyId: number,
  eventId: string,
  attendee: { name: string; email: string; phone?: string }
) {
  const { data, error } = await db
    .from("web_event_registrations")
    .insert([{
      company_id: companyId,
      event_id: eventId,
      attendee_name: attendee.name,
      attendee_email: attendee.email,
      attendee_phone: attendee.phone,
      status: "registered",
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ════════════════════════════════════════════════════════════════════════════
// TESTIMONIALS
// ════════════════════════════════════════════════════════════════════════════

export async function fetchTestimonials(companyId: number, options?: {
  featured?: boolean;
  itemId?: string;
}) {
  let query = db
    .from("web_testimonials")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (options?.featured) query = query.eq("is_featured", true);
  if (options?.itemId) query = query.eq("item_id", options.itemId);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(t => ({
    id: t.id,
    author: t.author_name,
    title: t.author_title,
    avatar: t.author_avatar,
    content: t.content,
    rating: t.rating,
    videoUrl: t.video_url,
    featured: t.is_featured,
  }));
}

// ════════════════════════════════════════════════════════════════════════════
// BLOG POSTS
// ════════════════════════════════════════════════════════════════════════════

export async function fetchBlogPosts(companyId: number) {
  const { data, error } = await db
    .from("blog_posts")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchBlogPost(companyId: number, slug: string) {
  const { data, error } = await db
    .from("blog_posts")
    .select("*")
    .eq("company_id", companyId)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ════════════════════════════════════════════════════════════════════════════
// GALLERY
// ════════════════════════════════════════════════════════════════════════════

export async function fetchGallery(companyId: number, category?: string) {
  let query = db
    .from("gallery_items")
    .select("*")
    .eq("company_id", companyId)
    .order("display_order", { ascending: true });

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// ════════════════════════════════════════════════════════════════════════════
// ENQUIRIES
// ════════════════════════════════════════════════════════════════════════════

export async function createEnquiry(
  companyId: number,
  enquiry: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message?: string;
    program_id?: string;
    program_name?: string;
    source?: string;
  }
) {
  const { data, error } = await db
    .from("web_enquiries")
    .insert([{ ...enquiry, company_id: companyId, status: "new" }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ════════════════════════════════════════════════════════════════════════════
// FAQs
// ════════════════════════════════════════════════════════════════════════════

export async function fetchFAQs(companyId: number, category?: string) {
  let query = db
    .from("web_faqs")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// ════════════════════════════════════════════════════════════════════════════
// WEB PAGES + SECTIONS
// ════════════════════════════════════════════════════════════════════════════

export async function fetchWebPages(companyId: number) {
  const { data, error } = await db
    .from("web_pages")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchWebPage(companyId: number, slug: string) {
  const { data, error } = await db
    .from("web_pages")
    .select("*")
    .eq("company_id", companyId)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function fetchPageSections(companyId: number, pageId: string) {
  const { data, error } = await db
    .from("web_page_sections")
    .select("*")
    .eq("company_id", companyId)
    .eq("page_id", pageId)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data || [];
}

// ════════════════════════════════════════════════════════════════════════════
// NAVIGATION MENU
// ════════════════════════════════════════════════════════════════════════════

export async function fetchMenuItems(companyId: number, position = "header") {
  const { data, error } = await db
    .from("web_menu_items")
    .select("*")
    .eq("company_id", companyId)
    .eq("position", position)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data || [];
}

// ════════════════════════════════════════════════════════════════════════════
// FORMS + SUBMISSIONS
// ════════════════════════════════════════════════════════════════════════════

export async function fetchForm(companyId: number, slug: string) {
  const { data, error } = await db
    .from("web_forms")
    .select("*")
    .eq("company_id", companyId)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function submitForm(
  companyId: number,
  formId: string,
  submission: { data: Record<string, any>; name?: string; email?: string }
) {
  const { data, error } = await db
    .from("web_form_submissions")
    .insert([{
      company_id: companyId,
      form_id: formId,
      data: submission.data,
      submitter_name: submission.name,
      submitter_email: submission.email,
      status: "new",
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ════════════════════════════════════════════════════════════════════════════
// CREDENTIALS (public verification)
// ════════════════════════════════════════════════════════════════════════════

export async function verifyCredential(verificationCode: string) {
  const { data, error } = await db
    .from("web_credentials")
    .select("*")
    .eq("verification_code", verificationCode)
    .eq("status", "issued")
    .maybeSingle();

  if (error) throw error;
  return data ? {
    credentialNo: data.credential_no,
    type: data.credential_type,
    recipient: data.recipient_name,
    itemName: data.item_name,
    issueDate: data.issue_date,
    expiryDate: data.expiry_date,
    grade: data.grade,
    score: data.score,
    verified: true,
  } : null;
}

// ════════════════════════════════════════════════════════════════════════════
// REGISTRATIONS (public self-registration)
// ════════════════════════════════════════════════════════════════════════════

export async function createRegistration(
  companyId: number,
  registration: {
    item_id: string;
    group_id?: string;
    registrant_name: string;
    registrant_email: string;
    registrant_phone?: string;
    source?: string;
  }
) {
  const { data, error } = await db
    .from("web_registrations")
    .insert([{
      ...registration,
      company_id: companyId,
      registration_date: new Date().toISOString().split("T")[0],
      status: "pending",
      payment_status: "unpaid",
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}
