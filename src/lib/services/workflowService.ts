import db from '../db';

export interface WorkflowTransition {
    id: number;
    action_name: string;
    from_step_id: number;
    to_step_id: number;
    requires_approval: boolean;
    permission_required?: string;
}

export class WorkflowService {
    /**
     * Moves a resource to the next step in its workflow.
     */
    static async transition(
        tableName: string,
        resourceId: string,
        actionName: string,
        userId: string,
        tenantId: number
    ) {
        // 1. Get current state of the resource
        const { data: resource, error: resError } = await db
            .from(tableName)
            .select('workflow_id, current_step_id')
            .eq('id', resourceId)
            .single();

        if (resError || !resource) throw new Error(`Resource not found: ${resError?.message}`);

        // 2. Find the transition for this action
        const { data: transition, error: transError } = await db
            .from('workflow_transitions')
            .select('to_step_id, requires_approval, permission_required')
            .eq('workflow_id', resource.workflow_id)
            .eq('from_step_id', resource.current_step_id)
            .eq('action_name', actionName)
            .single();

        if (transError || !transition) {
            throw new Error(`Invalid transition '${actionName}' for current step.`);
        }

        // 3. Check permissions if required
        if (transition.permission_required) {
            const { data: userPerms } = await db
                .from('company_user_permissions')
                .select('action')
                .eq('user_id', userId)
                .eq('resource', transition.permission_required);
            const hasPermission = userPerms && userPerms.some((p: any) => p.action === 'workflow_transition' || p.action === '*');
            if (!hasPermission) {
                throw new Error(`You don't have permission to perform this action. Required: ${transition.permission_required}`);
            }
        }

        // 4. Update the resource status
        const { data: nextStep, error: stepError } = await db
            .from('workflow_steps')
            .select('step_name')
            .eq('id', transition.to_step_id)
            .single();

        const { error: updateError } = await db
            .from(tableName)
            .update({
                current_step_id: transition.to_step_id,
                status: nextStep?.step_name.toLowerCase(),
                updated_at: new Date().toISOString()
            })
            .eq('id', resourceId);

        if (updateError) throw updateError;

        // 5. Log the activity
        await db.from('audit_logs').insert({
            company_id: tenantId,
            user_id: userId,
            entity_type: tableName,
            entity_id: resourceId,
            action: 'workflow_transition',
            new_data: { action: actionName, step: nextStep?.step_name }
        });

        return { success: true, nextStep: nextStep?.step_name };
    }

    /**
     * Gets available actions for a resource's current step.
     */
    static async getAvailableActions(workflowId: number, currentStepId: number) {
        const { data, error } = await db
            .from('workflow_transitions')
            .select('action_name, requires_approval')
            .eq('workflow_id', workflowId)
            .eq('from_step_id', currentStepId);

        if (error) return [];
        return data;
    }
}
