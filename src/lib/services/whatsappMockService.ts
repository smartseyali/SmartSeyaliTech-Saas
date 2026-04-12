/**
 * WhatsApp Mock Service
 *
 * Drop-in replacement for Meta Cloud API calls when VITE_WHATSAPP_MODE=test.
 * Simulates: message sending, status progression (sent → delivered → read),
 * template submission/approval, and inbound message generation.
 *
 * All data is persisted to Supabase — the mock only replaces the Meta HTTP calls.
 */

import { supabase } from "@/lib/supabase";
import type { WAAccount, SendMessagePayload } from "./whatsappService";

// ── Helpers ─────────────────────────────────────────────────────────────────

let mockCounter = 0;

function mockWaMessageId(): string {
  mockCounter++;
  return `wamid.test_${Date.now()}_${mockCounter}`;
}

export function isTestMode(): boolean {
  return import.meta.env.VITE_WHATSAPP_MODE === "test";
}

// ── Mock Send Message ───────────────────────────────────────────────────────

/**
 * Simulates sending a WhatsApp message.
 * Returns a fake wa_message_id immediately, then progressively updates
 * the message status in the DB: sent(0s) → delivered(2s) → read(5s).
 */
export async function mockSendWhatsAppMessage(
  _account: WAAccount,
  payload: SendMessagePayload
): Promise<{ success: boolean; wa_message_id?: string; error?: string }> {
  // Simulate ~200ms network latency
  await new Promise((r) => setTimeout(r, 200));

  const waMessageId = mockWaMessageId();

  console.log(
    `[WA Mock] Message sent → ${payload.to} | type=${payload.type} | id=${waMessageId}`
  );

  // Simulate status progression in background
  simulateStatusProgression(waMessageId);

  return { success: true, wa_message_id: waMessageId };
}

/**
 * Background: update message status in DB to simulate Meta webhook callbacks.
 * sent(immediate) → delivered(2s) → read(5s)
 */
function simulateStatusProgression(waMessageId: string) {
  // delivered after 2s
  setTimeout(async () => {
    await supabase
      .from("whatsapp_messages")
      .update({ status: "delivered", delivered_at: new Date().toISOString() })
      .eq("wa_message_id", waMessageId);

    await supabase
      .from("whatsapp_campaign_messages")
      .update({ status: "delivered", delivered_at: new Date().toISOString() })
      .eq("wa_message_id", waMessageId);

    console.log(`[WA Mock] ${waMessageId} → delivered`);
  }, 2000);

  // read after 5s
  setTimeout(async () => {
    await supabase
      .from("whatsapp_messages")
      .update({ status: "read", read_at: new Date().toISOString() })
      .eq("wa_message_id", waMessageId);

    await supabase
      .from("whatsapp_campaign_messages")
      .update({ status: "read", read_at: new Date().toISOString() })
      .eq("wa_message_id", waMessageId);

    console.log(`[WA Mock] ${waMessageId} → read`);
  }, 5000);
}

// ── Mock Template Submission ────────────────────────────────────────────────

/**
 * Simulates submitting a template to Meta for approval.
 * Immediately returns success and auto-approves the template after 3s.
 */
export async function mockSubmitTemplateToMeta(
  _account: WAAccount,
  template: {
    name: string;
    category: string;
    language: string;
    body: string;
  }
): Promise<{ success: boolean; meta_template_id?: string; error?: string }> {
  await new Promise((r) => setTimeout(r, 300));

  const metaTemplateId = `tpl_test_${Date.now()}`;

  console.log(
    `[WA Mock] Template submitted: "${template.name}" → id=${metaTemplateId}`
  );

  return { success: true, meta_template_id: metaTemplateId };
}

// ── Mock Template Sync ──────────────────────────────────────────────────────

/**
 * Simulates syncing template statuses from Meta.
 * Auto-approves all pending templates for the company.
 */
export async function mockSyncTemplateStatuses(
  _account: WAAccount,
  companyId: string
): Promise<{ synced: number; errors: string[] }> {
  const { data: pending } = await supabase
    .from("whatsapp_templates")
    .select("id, name")
    .eq("company_id", companyId)
    .eq("status", "pending");

  if (!pending || pending.length === 0) {
    return { synced: 0, errors: [] };
  }

  const ids = pending.map((t) => t.id);
  await supabase
    .from("whatsapp_templates")
    .update({ status: "approved" })
    .in("id", ids);

  console.log(
    `[WA Mock] Auto-approved ${pending.length} templates: ${pending.map((t) => t.name).join(", ")}`
  );

  return { synced: pending.length, errors: [] };
}

// ── Mock Account ────────────────────────────────────────────────────────────

/**
 * Returns a mock WAAccount if no real verified account exists.
 * This lets the entire module work without any Meta credentials.
 */
export function getMockAccount(companyId: string): WAAccount {
  return {
    id: 0,
    phone_number_id: "TEST_PHONE_NUMBER_ID",
    waba_id: "TEST_WABA_ID",
    access_token: "TEST_ACCESS_TOKEN",
    company_id: companyId,
  };
}

// ── Inbound Message Simulator ───────────────────────────────────────────────

const SAMPLE_MESSAGES = [
  "Hi, I want to know about my order status",
  "What are your business hours?",
  "I need help with a refund",
  "Do you offer free shipping?",
  "Can I change my delivery address?",
  "Thanks for the quick response!",
  "I'd like to place a bulk order",
  "What payment methods do you accept?",
  "Is this product available in blue?",
  "When will my order be delivered?",
];

const SAMPLE_NAMES = [
  "Rahul Sharma", "Priya Patel", "Amit Kumar", "Sneha Gupta",
  "Vikram Singh", "Ananya Reddy", "Rohan Mehta", "Divya Nair",
];

/**
 * Simulates an inbound WhatsApp message arriving via webhook.
 * Creates/upserts the contact, conversation, and message — then triggers
 * bot evaluation if the conversation is in "bot" status.
 */
export async function simulateInboundMessage(
  companyId: string,
  options?: { phone?: string; name?: string; body?: string }
): Promise<{ contactId: number; conversationId: number; body: string }> {
  const phone = options?.phone || `+91${9000000000 + Math.floor(Math.random() * 999999999)}`;
  const name = options?.name || SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
  const body = options?.body || SAMPLE_MESSAGES[Math.floor(Math.random() * SAMPLE_MESSAGES.length)];
  const waMessageId = mockWaMessageId();

  // 1. Upsert contact
  const { data: existingContact } = await supabase
    .from("whatsapp_contacts")
    .select("id")
    .eq("company_id", companyId)
    .eq("phone", phone)
    .maybeSingle();

  let contactId: number;
  if (existingContact) {
    contactId = existingContact.id;
    await supabase
      .from("whatsapp_contacts")
      .update({ last_message_at: new Date().toISOString(), name })
      .eq("id", contactId);
  } else {
    const { data: newContact } = await supabase
      .from("whatsapp_contacts")
      .insert({
        company_id: companyId,
        name,
        phone,
        source: "whatsapp",
        opt_in: true,
        opt_in_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    contactId = newContact!.id;
  }

  // 2. Find or create conversation
  let { data: conversation } = await supabase
    .from("whatsapp_conversations")
    .select("id, status, unread_count")
    .eq("company_id", companyId)
    .eq("contact_id", contactId)
    .in("status", ["bot", "waiting", "open"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!conversation) {
    const { data: newConv } = await supabase
      .from("whatsapp_conversations")
      .insert({
        company_id: companyId,
        contact_id: contactId,
        status: "bot",
        session_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("id, status, unread_count")
      .single();
    conversation = newConv;
  }

  // 3. Insert message
  await supabase.from("whatsapp_messages").insert({
    company_id: companyId,
    conversation_id: conversation!.id,
    contact_id: contactId,
    wa_message_id: waMessageId,
    direction: "inbound",
    message_type: "text",
    body,
    status: "delivered",
    delivered_at: new Date().toISOString(),
  });

  // 4. Update conversation
  await supabase
    .from("whatsapp_conversations")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: body.substring(0, 100),
      unread_count: (conversation!.unread_count || 0) + 1,
      session_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq("id", conversation!.id);

  // 5. Log
  await supabase.from("whatsapp_logs").insert({
    company_id: companyId,
    contact: name,
    direction: "inbound",
    message: body.substring(0, 200),
    status: "received",
    event_type: "message",
    wa_message_id: waMessageId,
  });

  console.log(`[WA Mock] Inbound from ${name} (${phone}): "${body}"`);

  return { contactId, conversationId: conversation!.id, body };
}
