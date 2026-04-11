/**
 * WhatsApp Business Platform API Service
 *
 * Handles all communication with the Meta Cloud API (v21.0)
 * for sending messages, managing templates, and processing webhooks.
 */

import { supabase } from "@/lib/supabase";

const META_API_VERSION = "v21.0";
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

// ── Types ────────────────────────────────────────────────────────────────────

export interface WAAccount {
  id: number;
  phone_number_id: string;
  waba_id: string;
  access_token: string;
  company_id: string;
}

export interface SendMessagePayload {
  to: string;
  type: "text" | "template" | "image" | "document" | "interactive";
  text?: { body: string };
  template?: {
    name: string;
    language: { code: string };
    components?: TemplateComponent[];
  };
  image?: { link: string; caption?: string };
  document?: { link: string; filename?: string; caption?: string };
  interactive?: InteractiveMessage;
}

interface TemplateComponent {
  type: "header" | "body" | "button";
  parameters: TemplateParameter[];
  sub_type?: string;
  index?: number;
}

interface TemplateParameter {
  type: "text" | "image" | "video" | "document";
  text?: string;
  image?: { link: string };
}

interface InteractiveMessage {
  type: "button" | "list";
  header?: { type: string; text?: string };
  body: { text: string };
  footer?: { text: string };
  action: {
    buttons?: Array<{ type: "reply"; reply: { id: string; title: string } }>;
    button?: string;
    sections?: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }>;
  };
}

export interface WebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: { display_phone_number: string; phone_number_id: string };
      contacts?: Array<{ profile: { name: string }; wa_id: string }>;
      messages?: Array<WebhookMessage>;
      statuses?: Array<WebhookStatus>;
    };
    field: string;
  }>;
}

interface WebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string; caption?: string };
  interactive?: { type: string; button_reply?: { id: string; title: string }; list_reply?: { id: string; title: string } };
  context?: { from: string; id: string };
}

interface WebhookStatus {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
  errors?: Array<{ code: number; title: string }>;
}

// ── Account Helpers ──────────────────────────────────────────────────────────

export async function getActiveAccount(companyId: string): Promise<WAAccount | null> {
  const { data } = await supabase
    .from("whatsapp_accounts")
    .select("*")
    .eq("company_id", companyId)
    .eq("status", "verified")
    .limit(1)
    .single();
  return data;
}

// ── Send Message ─────────────────────────────────────────────────────────────

export async function sendWhatsAppMessage(
  account: WAAccount,
  payload: SendMessagePayload
): Promise<{ success: boolean; wa_message_id?: string; error?: string }> {
  try {
    const response = await fetch(
      `${META_BASE_URL}/${account.phone_number_id}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${account.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          ...payload,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error?.message || "Unknown Meta API error";
      console.error("[WA] Send failed:", errorMsg);
      return { success: false, error: errorMsg };
    }

    return {
      success: true,
      wa_message_id: data.messages?.[0]?.id,
    };
  } catch (err: any) {
    console.error("[WA] Network error:", err);
    return { success: false, error: err.message };
  }
}

// ── Send Text ────────────────────────────────────────────────────────────────

export async function sendTextMessage(
  account: WAAccount,
  to: string,
  body: string
) {
  return sendWhatsAppMessage(account, {
    to,
    type: "text",
    text: { body },
  });
}

// ── Send Template ────────────────────────────────────────────────────────────

export async function sendTemplateMessage(
  account: WAAccount,
  to: string,
  templateName: string,
  languageCode: string,
  variables?: Record<string, string>
) {
  const components: TemplateComponent[] = [];

  if (variables && Object.keys(variables).length > 0) {
    components.push({
      type: "body",
      parameters: Object.values(variables).map((val) => ({
        type: "text" as const,
        text: val,
      })),
    });
  }

  return sendWhatsAppMessage(account, {
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components: components.length > 0 ? components : undefined,
    },
  });
}

// ── Send Interactive ─────────────────────────────────────────────────────────

export async function sendInteractiveMessage(
  account: WAAccount,
  to: string,
  bodyText: string,
  buttons: Array<{ id: string; title: string }>
) {
  return sendWhatsAppMessage(account, {
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: bodyText },
      action: {
        buttons: buttons.map((b) => ({
          type: "reply" as const,
          reply: { id: b.id, title: b.title },
        })),
      },
    },
  });
}

// ── Template Management (Meta API) ───────────────────────────────────────────

export async function submitTemplateToMeta(
  account: WAAccount,
  template: {
    name: string;
    category: string;
    language: string;
    body: string;
    header_type?: string;
    header_content?: string;
    footer_text?: string;
    buttons?: any[];
  }
): Promise<{ success: boolean; meta_template_id?: string; error?: string }> {
  const components: any[] = [];

  // Header component
  if (template.header_type && template.header_type !== "none") {
    const headerComp: any = { type: "HEADER" };
    if (template.header_type === "text") {
      headerComp.format = "TEXT";
      headerComp.text = template.header_content || "";
    } else {
      headerComp.format = template.header_type.toUpperCase();
      headerComp.example = { header_handle: [template.header_content] };
    }
    components.push(headerComp);
  }

  // Body component
  components.push({
    type: "BODY",
    text: template.body,
  });

  // Footer component
  if (template.footer_text) {
    components.push({
      type: "FOOTER",
      text: template.footer_text,
    });
  }

  // Button components
  if (template.buttons && template.buttons.length > 0) {
    components.push({
      type: "BUTTONS",
      buttons: template.buttons,
    });
  }

  try {
    const response = await fetch(
      `${META_BASE_URL}/${account.waba_id}/message_templates`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${account.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: template.name,
          category: template.category,
          language: template.language,
          components,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data?.error?.message || "Template submission failed" };
    }

    return { success: true, meta_template_id: data.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function syncTemplateStatuses(
  account: WAAccount,
  companyId: string
): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  let synced = 0;

  try {
    const response = await fetch(
      `${META_BASE_URL}/${account.waba_id}/message_templates?limit=100`,
      {
        headers: { Authorization: `Bearer ${account.access_token}` },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return { synced: 0, errors: [data?.error?.message || "Fetch failed"] };
    }

    for (const tpl of data.data || []) {
      const status =
        tpl.status === "APPROVED" ? "approved" :
        tpl.status === "REJECTED" ? "rejected" : "pending";

      const { error } = await supabase
        .from("whatsapp_templates")
        .update({ status, meta_template_id: tpl.id })
        .eq("company_id", companyId)
        .eq("name", tpl.name);

      if (error) errors.push(`${tpl.name}: ${error.message}`);
      else synced++;
    }
  } catch (err: any) {
    errors.push(err.message);
  }

  return { synced, errors };
}

// ── Webhook Processing ───────────────────────────────────────────────────────

export async function processWebhookEntry(
  entry: WebhookEntry,
  companyId: string
) {
  for (const change of entry.changes) {
    const value = change.value;
    const phoneNumberId = value.metadata.phone_number_id;

    // Process incoming messages
    if (value.messages) {
      for (const msg of value.messages) {
        await handleIncomingMessage(companyId, phoneNumberId, msg, value.contacts?.[0]);
      }
    }

    // Process status updates
    if (value.statuses) {
      for (const status of value.statuses) {
        await handleStatusUpdate(companyId, status);
      }
    }
  }
}

async function handleIncomingMessage(
  companyId: string,
  phoneNumberId: string,
  msg: WebhookMessage,
  contact?: { profile: { name: string }; wa_id: string }
) {
  const phone = msg.from;
  const contactName = contact?.profile?.name || phone;

  // Upsert contact
  const { data: existingContact } = await supabase
    .from("whatsapp_contacts")
    .select("id")
    .eq("company_id", companyId)
    .eq("phone", phone)
    .single();

  let contactId: number;
  if (existingContact) {
    contactId = existingContact.id;
    await supabase
      .from("whatsapp_contacts")
      .update({ last_message_at: new Date().toISOString(), name: contactName })
      .eq("id", contactId);
  } else {
    const { data: newContact } = await supabase
      .from("whatsapp_contacts")
      .insert({
        company_id: companyId,
        name: contactName,
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

  // Find or create conversation
  let { data: conversation } = await supabase
    .from("whatsapp_conversations")
    .select("id, status")
    .eq("company_id", companyId)
    .eq("contact_id", contactId)
    .in("status", ["bot", "waiting", "open"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!conversation) {
    const { data: newConv } = await supabase
      .from("whatsapp_conversations")
      .insert({
        company_id: companyId,
        contact_id: contactId,
        status: "bot",
        session_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("id, status")
      .single();
    conversation = newConv;
  }

  // Determine message body
  let body = "";
  let messageType = msg.type || "text";
  let mediaUrl: string | undefined;

  if (msg.text) body = msg.text.body;
  else if (msg.image) { body = msg.image.caption || ""; mediaUrl = msg.image.id; messageType = "image"; }
  else if (msg.interactive) {
    const reply = msg.interactive.button_reply || msg.interactive.list_reply;
    body = reply?.title || "";
    messageType = "interactive";
  }

  // Save message
  await supabase.from("whatsapp_messages").insert({
    company_id: companyId,
    conversation_id: conversation!.id,
    contact_id: contactId,
    wa_message_id: msg.id,
    direction: "inbound",
    message_type: messageType,
    body,
    media_url: mediaUrl,
    status: "delivered",
    delivered_at: new Date(parseInt(msg.timestamp) * 1000).toISOString(),
  });

  // Update conversation
  await supabase
    .from("whatsapp_conversations")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: body.substring(0, 100),
      unread_count: (conversation as any).unread_count ? (conversation as any).unread_count + 1 : 1,
      session_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq("id", conversation!.id);

  // Log
  await supabase.from("whatsapp_logs").insert({
    company_id: companyId,
    contact: contactName,
    direction: "inbound",
    message: body.substring(0, 200),
    status: "received",
    event_type: "message",
    wa_message_id: msg.id,
  });

  return { contactId, conversationId: conversation!.id, body, messageType };
}

async function handleStatusUpdate(companyId: string, status: WebhookStatus) {
  const updateFields: Record<string, any> = { status: status.status };
  if (status.status === "sent") updateFields.sent_at = new Date(parseInt(status.timestamp) * 1000).toISOString();
  if (status.status === "delivered") updateFields.delivered_at = new Date(parseInt(status.timestamp) * 1000).toISOString();
  if (status.status === "read") updateFields.read_at = new Date(parseInt(status.timestamp) * 1000).toISOString();
  if (status.status === "failed" && status.errors?.[0]) {
    updateFields.error_code = String(status.errors[0].code);
    updateFields.error_message = status.errors[0].title;
  }

  // Update in messages table
  await supabase
    .from("whatsapp_messages")
    .update(updateFields)
    .eq("wa_message_id", status.id);

  // Update in campaign_messages table
  await supabase
    .from("whatsapp_campaign_messages")
    .update({ status: status.status, ...updateFields })
    .eq("wa_message_id", status.id);

  // Log status
  await supabase.from("whatsapp_logs").insert({
    company_id: companyId,
    contact: status.recipient_id,
    direction: "status",
    message: `Message ${status.id} → ${status.status}`,
    status: status.status,
    event_type: "status",
    wa_message_id: status.id,
  });
}

// ── Utility ──────────────────────────────────────────────────────────────────

export function interpolateTemplate(
  body: string,
  variables: Record<string, string>
): string {
  let result = body;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  });
  return result;
}

export function isWithinSessionWindow(sessionExpiresAt: string | null): boolean {
  if (!sessionExpiresAt) return false;
  return new Date(sessionExpiresAt) > new Date();
}
