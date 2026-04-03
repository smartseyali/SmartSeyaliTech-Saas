import db from '../db';
import { toast } from "sonner";

export interface AutomationTrigger {
    event: string;
    tenantId: number;
    resourceData: any;
}

export class AutomationService {
    /**
     * Triggers automations based on a system event.
     */
    static async trigger(event: string, tenantId: number, resourceData: any) {
        console.log(`[AUTOMATION] Event triggered: ${event} for tenant ${tenantId}`);

        // 1. Fetch active automations for this event and tenant
        const { data: automations, error } = await db
            .from('automations')
            .select('*')
            .eq('trigger_event', event)
            .eq('tenant_id', tenantId)
            .eq('is_active', true);

        if (error || !automations) return;

        // 2. Process each automation
        for (const automation of automations) {
            try {
                await this.executeAction(automation, resourceData);
            } catch (err) {
                console.error(`[AUTOMATION] Failed to execute action:`, err);
            }
        }
    }

    private static async executeAction(automation: any, data: any) {
        const { action_type, config_json } = automation;

        switch (action_type) {
            case 'send_notification':
                await this.sendNotification(automation.tenant_id, config_json, data);
                break;
            case 'send_whatsapp':
                // Placeholder for WhatsApp API integration
                console.log(`[WA] Sending automated message for ${data.reference_no}`);
                break;
            case 'create_audit':
                await db.from('audit_logs').insert({
                    tenant_id: automation.tenant_id,
                    entity_type: 'automation',
                    entity_id: data.id,
                    action: 'triggered',
                    new_data: { automation_id: automation.id, event: automation.trigger_event }
                });
                break;
            default:
                console.warn(`[AUTOMATION] Unknown action type: ${action_type}`);
        }
    }

    private static async sendNotification(tenantId: number, config: any, data: any) {
        // Simple internal notification
        await db.from('notifications').insert({
            tenant_id: tenantId,
            user_id: data.user_id, // If resource has a user_id
            title: config.title || "Platform Automation",
            message: config.message || `An event '${data.reference_no}' was processed.`,
            type: 'info'
        });
    }

    /**
     * Schedules a background job.
     */
    static async scheduleJob(automationId: number, tenantId: number, runAt: Date) {
        const { error } = await db.from('jobs').insert({
            tenant_id: tenantId,
            automation_id: automationId,
            run_at: runAt.toISOString(),
            status: 'pending'
        });
        return !error;
    }
}
