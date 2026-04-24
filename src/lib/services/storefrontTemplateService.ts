import { supabase } from "@/lib/supabase";
import type { StorefrontTemplate, TemplateConfigOverrides, TemplatePage } from "@/types/storefront";

export async function listTemplates(filter?: {
    category?: string;
    moduleId?: string;
    activeOnly?: boolean;
}): Promise<StorefrontTemplate[]> {
    let query = supabase.from("storefront_templates").select("*").order("sort_order", { ascending: true });
    if (filter?.activeOnly !== false) query = query.eq("is_active", true);
    if (filter?.category) query = query.eq("category", filter.category);
    if (filter?.moduleId) query = query.eq("module_id", filter.moduleId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as StorefrontTemplate[];
}

export async function getTemplateBySlug(slug: string): Promise<StorefrontTemplate | null> {
    const { data, error } = await supabase
        .from("storefront_templates")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
    if (error) throw error;
    return (data as StorefrontTemplate) ?? null;
}

export async function getTemplateById(id: number): Promise<StorefrontTemplate | null> {
    const { data, error } = await supabase
        .from("storefront_templates")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    if (error) throw error;
    return (data as StorefrontTemplate) ?? null;
}

export async function setActiveTemplateForCompany(
    companyId: number | string,
    templateId: number,
    overrides?: TemplateConfigOverrides,
): Promise<void> {
    const patch: Record<string, unknown> = { active_template_id: templateId };
    if (overrides) patch.template_config = overrides;
    const { error } = await supabase.from("companies").update(patch).eq("id", companyId);
    if (error) throw error;

    // Fire-and-forget seed of web_pages rows based on the template's pages
    // manifest. Failure here shouldn't block activation; the admin can still
    // add pages manually. We seed only missing slugs to preserve any content
    // the tenant has already edited.
    try {
        const template = await getTemplateById(templateId);
        if (template?.pages?.length) await seedWebPagesForTenant(companyId, template);
    } catch (err) {
        console.warn("seedWebPagesForTenant failed (non-blocking):", err);
    }
}

/**
 * For each page in the template's manifest, insert a web_pages row for the
 * tenant if one doesn't already exist (keyed by company_id + slug). Seeded
 * rows get default content pulled from each field's `default` (if any) plus
 * the field label as a placeholder.
 */
export async function seedWebPagesForTenant(
    companyId: number | string,
    template: StorefrontTemplate,
): Promise<void> {
    if (!template.pages?.length) return;

    const { data: existing } = await supabase
        .from("web_pages")
        .select("slug")
        .eq("company_id", companyId);
    const existingSet = new Set((existing ?? []).map((r: any) => r.slug));

    const toInsert = template.pages
        .filter((p) => !existingSet.has(p.slug))
        .map((p: TemplatePage) => {
            const customFields: Record<string, unknown> = { template_file: p.file };
            for (const field of p.fields ?? []) {
                customFields[field.key] = "";
            }
            return {
                company_id: companyId,
                title: p.title,
                slug: p.slug,
                template: template.slug,
                template_id: template.id,
                content: "",
                status: "published",
                is_published: true,
                published_at: new Date().toISOString(),
                sort_order: 0,
                custom_fields: customFields,
            };
        });

    if (toInsert.length === 0) return;

    const { error } = await supabase.from("web_pages").insert(toInsert);
    if (error) throw error;
}

export async function updateCompanyTemplateConfig(
    companyId: number | string,
    overrides: TemplateConfigOverrides,
): Promise<void> {
    const { error } = await supabase
        .from("companies")
        .update({ template_config: overrides })
        .eq("id", companyId);
    if (error) throw error;
}

// Super-admin CRUD
export async function createTemplate(
    template: Omit<StorefrontTemplate, "id" | "created_at" | "updated_at">,
): Promise<StorefrontTemplate> {
    const { data, error } = await supabase.from("storefront_templates").insert(template).select().single();
    if (error) throw error;
    return data as StorefrontTemplate;
}

export async function updateTemplate(
    id: number,
    patch: Partial<StorefrontTemplate>,
): Promise<StorefrontTemplate> {
    const { data, error } = await supabase
        .from("storefront_templates")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
    if (error) throw error;
    return data as StorefrontTemplate;
}

export async function deleteTemplate(id: number): Promise<void> {
    const { error } = await supabase.from("storefront_templates").delete().eq("id", id);
    if (error) throw error;
}
