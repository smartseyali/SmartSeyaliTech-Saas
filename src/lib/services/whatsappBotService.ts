/**
 * WhatsApp Bot Automation Engine
 *
 * Evaluates incoming messages against tenant-specific rules
 * and produces automated responses or escalates to human agents.
 *
 * Rule evaluation order: priority ASC (lower = first)
 * Types: welcome, keyword, menu, regex, fallback
 */

import { supabase } from "@/lib/supabase";
import {
  sendTextMessage,
  sendTemplateMessage,
  sendInteractiveMessage,
  getActiveAccount,
  type WAAccount,
} from "./whatsappService";

// ── Types ────────────────────────────────────────────────────────────────────

interface BotRule {
  id: number;
  name: string;
  rule_type: "keyword" | "menu" | "welcome" | "fallback" | "regex";
  priority: number;
  trigger_keywords: string[];
  trigger_pattern: string | null;
  response_type: "text" | "template" | "interactive" | "transfer";
  response_body: string | null;
  response_template_id: number | null;
  response_buttons: Array<{ id: string; title: string }>;
  transfer_to: string | null;
}

interface BotEvalResult {
  matched: boolean;
  rule?: BotRule;
  action: "reply" | "transfer" | "none";
  response?: {
    type: string;
    body?: string;
    templateId?: number;
    buttons?: Array<{ id: string; title: string }>;
    transferTo?: string;
  };
}

// ── Rule Evaluation ──────────────────────────────────────────────────────────

/**
 * Evaluate an incoming message against all active bot rules for the tenant.
 * Returns the first matching rule (by priority), or a fallback if no match.
 */
export async function evaluateIncomingMessage(
  companyId: string,
  messageBody: string,
  isFirstMessage: boolean = false
): Promise<BotEvalResult> {
  // Fetch active rules ordered by priority
  const { data: rules } = await supabase
    .from("whatsapp_bot_rules")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("priority", { ascending: true });

  if (!rules || rules.length === 0) {
    return { matched: false, action: "none" };
  }

  const normalizedMsg = messageBody.trim().toLowerCase();

  // 1. Check welcome rule if first message
  if (isFirstMessage) {
    const welcomeRule = rules.find((r) => r.rule_type === "welcome");
    if (welcomeRule) {
      return buildResult(welcomeRule);
    }
  }

  // 2. Check keyword rules
  for (const rule of rules.filter((r) => r.rule_type === "keyword")) {
    const keywords = (rule.trigger_keywords || []).map((k: string) => k.trim().toLowerCase());
    if (keywords.some((kw) => normalizedMsg.includes(kw))) {
      return buildResult(rule);
    }
  }

  // 3. Check menu rules (exact match on number/option)
  for (const rule of rules.filter((r) => r.rule_type === "menu")) {
    const options = (rule.trigger_keywords || []).map((k: string) => k.trim().toLowerCase());
    if (options.includes(normalizedMsg)) {
      return buildResult(rule);
    }
  }

  // 4. Check regex rules
  for (const rule of rules.filter((r) => r.rule_type === "regex")) {
    if (rule.trigger_pattern) {
      try {
        const regex = new RegExp(rule.trigger_pattern, "i");
        if (regex.test(messageBody)) {
          return buildResult(rule);
        }
      } catch {
        // Invalid regex, skip
      }
    }
  }

  // 5. Fallback rule
  const fallbackRule = rules.find((r) => r.rule_type === "fallback");
  if (fallbackRule) {
    return buildResult(fallbackRule);
  }

  return { matched: false, action: "none" };
}

function buildResult(rule: BotRule): BotEvalResult {
  if (rule.response_type === "transfer") {
    return {
      matched: true,
      rule,
      action: "transfer",
      response: {
        type: "transfer",
        transferTo: rule.transfer_to || undefined,
        body: rule.response_body || "Connecting you to an agent...",
      },
    };
  }

  return {
    matched: true,
    rule,
    action: "reply",
    response: {
      type: rule.response_type,
      body: rule.response_body || undefined,
      templateId: rule.response_template_id || undefined,
      buttons: rule.response_buttons || [],
    },
  };
}

// ── Execute Bot Response ─────────────────────────────────────────────────────

/**
 * Execute the bot's response: send the appropriate message type
 * and update conversation state.
 */
export async function executeBotResponse(
  companyId: string,
  conversationId: number,
  contactPhone: string,
  evalResult: BotEvalResult
): Promise<void> {
  if (!evalResult.matched || !evalResult.response) return;

  const account = await getActiveAccount(companyId);
  if (!account) {
    console.error("[Bot] No verified WhatsApp account for company:", companyId);
    return;
  }

  const { response } = evalResult;

  try {
    let waResult: { success: boolean; wa_message_id?: string } = { success: false };

    switch (response.type) {
      case "text":
        if (response.body) {
          waResult = await sendTextMessage(account, contactPhone, response.body);
        }
        break;

      case "template":
        if (response.templateId) {
          const { data: tpl } = await supabase
            .from("whatsapp_templates")
            .select("name, language")
            .eq("id", response.templateId)
            .single();
          if (tpl) {
            waResult = await sendTemplateMessage(account, contactPhone, tpl.name, tpl.language);
          }
        }
        break;

      case "interactive":
        if (response.body && response.buttons && response.buttons.length > 0) {
          waResult = await sendInteractiveMessage(
            account,
            contactPhone,
            response.body,
            response.buttons
          );
        }
        break;

      case "transfer":
        // Send a message telling the user they're being connected
        if (response.body) {
          waResult = await sendTextMessage(account, contactPhone, response.body);
        }
        // Escalate conversation to human
        await supabase
          .from("whatsapp_conversations")
          .update({
            status: response.transferTo ? "open" : "waiting",
            assigned_to: response.transferTo || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", conversationId);
        break;
    }

    // Save outbound bot message
    if (waResult.success) {
      await supabase.from("whatsapp_messages").insert({
        company_id: companyId,
        conversation_id: conversationId,
        direction: "outbound",
        message_type: response.type === "interactive" ? "interactive" : "text",
        body: response.body || "",
        wa_message_id: waResult.wa_message_id,
        status: "sent",
        sent_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error("[Bot] Failed to execute response:", err);
  }
}

// ── Conversation Router ──────────────────────────────────────────────────────

/**
 * Main entry point: route an incoming message through the bot engine.
 * If the bot can handle it, it replies automatically.
 * If not, it escalates to a human agent.
 */
export async function routeIncomingMessage(
  companyId: string,
  conversationId: number,
  contactPhone: string,
  messageBody: string,
  conversationStatus: string
): Promise<"bot_handled" | "escalated" | "agent_active"> {
  // If conversation is already assigned to an agent, don't interfere
  if (conversationStatus === "open") {
    return "agent_active";
  }

  // Check if this is a new conversation (first message)
  const { count } = await supabase
    .from("whatsapp_messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId);

  const isFirstMessage = (count || 0) <= 1;

  // Evaluate message against bot rules
  const result = await evaluateIncomingMessage(companyId, messageBody, isFirstMessage);

  if (result.matched) {
    await executeBotResponse(companyId, conversationId, contactPhone, result);

    if (result.action === "transfer") {
      return "escalated";
    }
    return "bot_handled";
  }

  // No rule matched — escalate to waiting queue
  await supabase
    .from("whatsapp_conversations")
    .update({
      status: "waiting",
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  return "escalated";
}
