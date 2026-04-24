import { supabase } from "@/lib/supabase";
import { buildBundle } from "@/lib/services/templateDeployService";
import { getTemplateById } from "@/lib/services/storefrontTemplateService";
import type { StorefrontTemplate, TemplateConfigOverrides } from "@/types/storefront";

export type TemplateDeploymentStatus = "requested" | "deployed" | "cancelled";

export interface TemplateDeployment {
    id: number;
    company_id: number;
    module_id: string;
    template_id: number;
    template_slug: string | null;
    template_category: string | null;
    custom_domain: string;
    config_overrides: TemplateConfigOverrides;
    status: TemplateDeploymentStatus;
    deployed_url: string | null;
    notes: string | null;
    requested_by: string | null;
    requested_at: string;
    deployed_by: string | null;
    deployed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface TemplateDeploymentWithJoins extends TemplateDeployment {
    company?: { id: number; name: string | null; subdomain: string | null } | null;
    template?: Pick<StorefrontTemplate, "id" | "slug" | "name" | "category" | "entry_path" | "module_id"> | null;
}

export interface CreateDeploymentRequestInput {
    companyId: number | string;
    moduleId: string;
    templateId: number;
    customDomain: string;
    configOverrides?: TemplateConfigOverrides;
}

export async function createDeploymentRequest(
    input: CreateDeploymentRequestInput,
): Promise<TemplateDeployment> {
    const template = await getTemplateById(input.templateId);
    if (!template) throw new Error("Template not found");

    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes?.user?.id ?? null;

    const payload = {
        company_id: Number(input.companyId),
        module_id: input.moduleId,
        template_id: input.templateId,
        template_slug: template.slug,
        template_category: template.category,
        custom_domain: input.customDomain.trim(),
        config_overrides: input.configOverrides ?? {},
        requested_by: userId,
        status: "requested" as const,
    };

    const { data, error } = await supabase
        .from("template_deployments")
        .upsert(payload, { onConflict: "company_id,module_id" })
        .select("*")
        .single();
    if (error) throw error;
    return data as TemplateDeployment;
}

export async function getActiveDeploymentForCompanyModule(
    companyId: number | string,
    moduleId: string,
): Promise<TemplateDeploymentWithJoins | null> {
    const { data, error } = await supabase
        .from("template_deployments")
        .select("*, template:storefront_templates(id,slug,name,category,entry_path,module_id)")
        .eq("company_id", Number(companyId))
        .eq("module_id", moduleId)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
    if (error) throw error;
    return (data as TemplateDeploymentWithJoins) ?? null;
}

export async function listDeploymentsForCompany(
    companyId: number | string,
): Promise<TemplateDeploymentWithJoins[]> {
    const { data, error } = await supabase
        .from("template_deployments")
        .select("*, template:storefront_templates(id,slug,name,category,entry_path,module_id)")
        .eq("company_id", Number(companyId))
        .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as TemplateDeploymentWithJoins[];
}

export async function listAllDeployments(filter?: {
    status?: TemplateDeploymentStatus;
}): Promise<TemplateDeploymentWithJoins[]> {
    let q = supabase
        .from("template_deployments")
        .select("*, company:companies(id,name,subdomain), template:storefront_templates(id,slug,name,category,entry_path,module_id)")
        .order("created_at", { ascending: false });
    if (filter?.status) q = q.eq("status", filter.status);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as TemplateDeploymentWithJoins[];
}

export async function markDeployed(
    id: number,
    deployedUrl: string,
    notes?: string,
): Promise<TemplateDeployment> {
    const { data, error } = await supabase.rpc("template_deployment_mark_deployed", {
        p_id: id,
        p_deployed_url: deployedUrl,
        p_notes: notes ?? null,
    });
    if (error) throw error;
    return data as TemplateDeployment;
}

export async function cancelDeployment(id: number): Promise<void> {
    const { error } = await supabase
        .from("template_deployments")
        .update({ status: "cancelled" })
        .eq("id", id);
    if (error) throw error;
}

/**
 * Super-admin-side zip generation. Fetches template metadata + company,
 * then uses templateDeployService.buildBundle to produce a zip Blob
 * with the tenant's custom domain and config baked in.
 */
export async function buildDeploymentZip(
    deployment: TemplateDeploymentWithJoins,
): Promise<{ blob: Blob; fileName: string }> {
    const template = deployment.template
        ? await getTemplateById(deployment.template_id)
        : await getTemplateById(deployment.template_id);
    if (!template) throw new Error("Template metadata missing");

    const { data: company, error: cErr } = await supabase
        .from("companies")
        .select("id, name, subdomain")
        .eq("id", deployment.company_id)
        .maybeSingle();
    if (cErr) throw cErr;
    if (!company) throw new Error("Company not found");

    const overrides: TemplateConfigOverrides = {
        ...(deployment.config_overrides ?? {}),
    };
    // Inject the custom domain so config.js reflects the final URL.
    (overrides as any).custom_domain = deployment.custom_domain;
    (overrides as any).site_url = `https://${deployment.custom_domain.replace(/^https?:\/\//, "")}`;

    const blob = await buildBundle({
        template,
        companyId: company.id,
        companyName: company.name ?? `tenant-${company.id}`,
        overrides,
    });

    const safeDomain = deployment.custom_domain
        .replace(/^https?:\/\//, "")
        .replace(/[^a-z0-9.-]/gi, "-");
    const fileName = `${template.slug}-${safeDomain}-${deployment.id}.zip`;
    return { blob, fileName };
}
