/**
 * WhatsApp Bulk Messaging Queue Service
 *
 * Implements a client-side queue system for bulk campaign message delivery.
 * Flow: Campaign → Batch → Rate-limited sends → Status tracking
 *
 * In production, this would be backed by Redis/BullMQ on a Node.js backend.
 * This frontend service coordinates with Supabase for state and the Meta API for delivery.
 */

import { supabase } from "@/lib/supabase";
import {
  sendTemplateMessage,
  getActiveAccount,
  type WAAccount,
} from "./whatsappService";

// ── Configuration ────────────────────────────────────────────────────────────

const BATCH_SIZE = 50;
const RATE_LIMIT_DELAY_MS = 1000; // 1 second between batches
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

// ── Types ────────────────────────────────────────────────────────────────────

interface QueueJob {
  campaignId: number;
  companyId: string;
  onProgress?: (sent: number, total: number) => void;
  onComplete?: (stats: CampaignStats) => void;
  onError?: (error: string) => void;
}

interface CampaignStats {
  total: number;
  sent: number;
  failed: number;
  duration_ms: number;
}

interface QueuedMessage {
  id: number;
  phone: string;
  variables: Record<string, string>;
  contact_id?: number;
}

// ── Queue State ──────────────────────────────────────────────────────────────

const activeJobs = new Map<number, { abort: boolean }>();

// ── Campaign Execution ───────────────────────────────────────────────────────

/**
 * Start a campaign: resolve audience, queue messages, and begin batch sending.
 */
export async function startCampaign(job: QueueJob): Promise<void> {
  const { campaignId, companyId } = job;

  // Prevent duplicate execution
  if (activeJobs.has(campaignId)) {
    job.onError?.("Campaign is already running");
    return;
  }

  const jobState = { abort: false };
  activeJobs.set(campaignId, jobState);

  try {
    // 1. Load campaign
    const { data: campaign, error: campError } = await supabase
      .from("whatsapp_campaigns")
      .select("*, whatsapp_templates(name, language, body, variables)")
      .eq("id", campaignId)
      .single();

    if (campError || !campaign) {
      throw new Error(campError?.message || "Campaign not found");
    }

    if (!campaign.template_id) {
      throw new Error("Campaign has no template assigned");
    }

    // 2. Get WhatsApp account
    const account = await getActiveAccount(companyId);
    if (!account) {
      throw new Error("No verified WhatsApp account found");
    }

    // 3. Resolve audience (contacts matching segment tags)
    let query = supabase
      .from("whatsapp_contacts")
      .select("id, phone, name, attributes")
      .eq("company_id", companyId)
      .eq("opt_in", true);

    const segmentTags = campaign.segment_tags;
    if (segmentTags && segmentTags.length > 0) {
      query = query.overlaps("tags", segmentTags);
    }

    const { data: contacts, error: contactError } = await query;
    if (contactError) throw new Error(contactError.message);
    if (!contacts || contacts.length === 0) {
      throw new Error("No opted-in contacts match the segment criteria");
    }

    // 4. Update campaign status to running
    await supabase
      .from("whatsapp_campaigns")
      .update({
        status: "running",
        started_at: new Date().toISOString(),
        total_recipients: contacts.length,
      })
      .eq("id", campaignId);

    // 5. Create campaign_messages records
    const messages: QueuedMessage[] = contacts.map((contact) => {
      const variables = resolveVariables(
        campaign.variable_map || {},
        contact
      );
      return {
        id: 0, // Will be set after insert
        phone: contact.phone,
        variables,
        contact_id: contact.id,
      };
    });

    const insertRows = messages.map((m) => ({
      company_id: companyId,
      campaign_id: campaignId,
      contact_id: m.contact_id,
      phone: m.phone,
      variables: m.variables,
      status: "queued",
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("whatsapp_campaign_messages")
      .insert(insertRows)
      .select("id, phone, variables, contact_id");

    if (insertError) throw new Error(insertError.message);

    const queuedMessages: QueuedMessage[] = (inserted || []).map((row) => ({
      id: row.id,
      phone: row.phone,
      variables: row.variables as Record<string, string>,
      contact_id: row.contact_id,
    }));

    // 6. Process in batches
    const templateName = campaign.whatsapp_templates?.name;
    const templateLang = campaign.whatsapp_templates?.language || "en_US";
    const startTime = Date.now();
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < queuedMessages.length; i += BATCH_SIZE) {
      if (jobState.abort) {
        await supabase
          .from("whatsapp_campaigns")
          .update({ status: "paused", updated_at: new Date().toISOString() })
          .eq("id", campaignId);
        break;
      }

      const batch = queuedMessages.slice(i, i + BATCH_SIZE);
      const results = await processBatch(account, batch, templateName, templateLang);

      sentCount += results.sent;
      failedCount += results.failed;

      // Update campaign counters
      await supabase
        .from("whatsapp_campaigns")
        .update({
          sent_count: sentCount,
          failed_count: failedCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", campaignId);

      job.onProgress?.(sentCount, queuedMessages.length);

      // Rate limiting: wait between batches
      if (i + BATCH_SIZE < queuedMessages.length) {
        await delay(RATE_LIMIT_DELAY_MS);
      }
    }

    // 7. Mark campaign complete
    if (!jobState.abort) {
      await supabase
        .from("whatsapp_campaigns")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          sent_count: sentCount,
          failed_count: failedCount,
        })
        .eq("id", campaignId);
    }

    const stats: CampaignStats = {
      total: queuedMessages.length,
      sent: sentCount,
      failed: failedCount,
      duration_ms: Date.now() - startTime,
    };

    job.onComplete?.(stats);
  } catch (err: any) {
    console.error("[WA Queue] Campaign failed:", err);
    await supabase
      .from("whatsapp_campaigns")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", campaignId);
    job.onError?.(err.message);
  } finally {
    activeJobs.delete(campaignId);
  }
}

/**
 * Pause a running campaign
 */
export function pauseCampaign(campaignId: number): void {
  const job = activeJobs.get(campaignId);
  if (job) job.abort = true;
}

/**
 * Schedule a campaign to start at a specific time
 */
export async function scheduleCampaign(
  campaignId: number,
  scheduledAt: string
): Promise<void> {
  await supabase
    .from("whatsapp_campaigns")
    .update({
      status: "scheduled",
      scheduled_at: scheduledAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaignId);
}

// ── Batch Processing ─────────────────────────────────────────────────────────

async function processBatch(
  account: WAAccount,
  batch: QueuedMessage[],
  templateName: string,
  languageCode: string
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  const sendPromises = batch.map(async (msg) => {
    let lastError = "";
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const result = await sendTemplateMessage(
        account,
        msg.phone,
        templateName,
        languageCode,
        msg.variables
      );

      if (result.success) {
        await supabase
          .from("whatsapp_campaign_messages")
          .update({
            status: "sent",
            wa_message_id: result.wa_message_id,
            sent_at: new Date().toISOString(),
          })
          .eq("id", msg.id);
        sent++;
        return;
      }

      lastError = result.error || "Unknown error";

      // Don't retry on permanent failures (invalid number, etc.)
      if (isPermanentFailure(lastError)) break;

      if (attempt < MAX_RETRIES - 1) {
        await delay(RETRY_DELAY_MS * (attempt + 1));
      }
    }

    // Mark as failed after all retries
    await supabase
      .from("whatsapp_campaign_messages")
      .update({
        status: "failed",
        error_message: lastError,
      })
      .eq("id", msg.id);
    failed++;
  });

  await Promise.all(sendPromises);
  return { sent, failed };
}

// ── Variable Resolution ──────────────────────────────────────────────────────

function resolveVariables(
  variableMap: Record<string, string>,
  contact: { name: string; phone: string; attributes?: Record<string, any> }
): Record<string, string> {
  const resolved: Record<string, string> = {};

  for (const [key, source] of Object.entries(variableMap)) {
    if (source === "contact.name") resolved[key] = contact.name;
    else if (source === "contact.phone") resolved[key] = contact.phone;
    else if (source.startsWith("contact.attributes.")) {
      const attrKey = source.replace("contact.attributes.", "");
      resolved[key] = String(contact.attributes?.[attrKey] || "");
    } else {
      resolved[key] = source; // Static value
    }
  }

  return resolved;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPermanentFailure(error: string): boolean {
  const permanent = [
    "Invalid WhatsApp",
    "not a valid WhatsApp",
    "number not registered",
    "recipient not found",
    "blocked",
  ];
  return permanent.some((p) => error.toLowerCase().includes(p.toLowerCase()));
}

// ── Campaign Analytics ───────────────────────────────────────────────────────

export async function getCampaignAnalytics(
  campaignId: number
): Promise<{
  total: number;
  queued: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  deliveryRate: number;
  readRate: number;
}> {
  const { data: messages } = await supabase
    .from("whatsapp_campaign_messages")
    .select("status")
    .eq("campaign_id", campaignId);

  const all = messages || [];
  const total = all.length;
  const queued = all.filter((m) => m.status === "queued").length;
  const sent = all.filter((m) => ["sent", "delivered", "read"].includes(m.status)).length;
  const delivered = all.filter((m) => ["delivered", "read"].includes(m.status)).length;
  const read = all.filter((m) => m.status === "read").length;
  const failed = all.filter((m) => m.status === "failed").length;

  return {
    total,
    queued,
    sent,
    delivered,
    read,
    failed,
    deliveryRate: sent > 0 ? (delivered / sent) * 100 : 0,
    readRate: delivered > 0 ? (read / delivered) * 100 : 0,
  };
}
