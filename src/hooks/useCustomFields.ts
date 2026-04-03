/**
 * useCustomFields — Loads custom field definitions for a table
 *
 * Fetches from web_custom_field_defs where target_table matches,
 * and converts them into ERPField[] that DocForm can render.
 *
 * Custom field values are stored in the record's `custom_fields` JSONB column.
 * This hook wraps them so DocForm treats them like regular fields, but
 * on save, DocPage extracts them back into the `custom_fields` object.
 */
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import type { ERPField } from "@/types/erp";

export interface CustomFieldDef {
  id: string;
  field_key: string;
  field_label: string;
  field_type: string;
  options: any[];
  placeholder: string;
  default_value: string;
  is_required: boolean;
  is_visible: boolean;
  section: string;
  sort_order: number;
}

/**
 * Returns custom field definitions as ERPField[] ready to merge into a form,
 * plus helper functions to pack/unpack custom field values from a record.
 */
export function useCustomFields(tableName: string) {
  const [customFieldDefs, setCustomFieldDefs] = useState<CustomFieldDef[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeCompany } = useTenant();

  useEffect(() => {
    if (!activeCompany?.id || !tableName) {
      setCustomFieldDefs([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("web_custom_field_defs")
        .select("*")
        .eq("company_id", activeCompany.id)
        .eq("target_table", tableName)
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      setCustomFieldDefs(data || []);
      setLoading(false);
    };

    load();
  }, [activeCompany?.id, tableName]);

  /** Convert custom field defs to ERPField[] for DocForm */
  const customFields: ERPField[] = customFieldDefs.map((def) => ({
    key: `__cf__${def.field_key}`, // prefix to distinguish from regular fields
    label: def.field_label,
    type: def.field_type as any,
    required: def.is_required,
    placeholder: def.placeholder || undefined,
    options: Array.isArray(def.options) && def.options.length > 0 ? def.options : undefined,
    defaultValue: def.default_value || undefined,
    group: "custom",
  }));

  /**
   * Unpack: Merge custom_fields JSONB values into the flat record
   * so DocForm can render them as regular fields.
   *
   * { name: "Foo", custom_fields: { blood_group: "A+" } }
   * → { name: "Foo", __cf__blood_group: "A+", custom_fields: {...} }
   */
  const unpackCustomFields = (record: any): any => {
    if (!record) return record;
    const cf = record.custom_fields || {};
    const unpacked = { ...record };
    for (const def of customFieldDefs) {
      unpacked[`__cf__${def.field_key}`] = cf[def.field_key] ?? def.default_value ?? "";
    }
    return unpacked;
  };

  /**
   * Pack: Extract __cf__ prefixed fields back into the custom_fields JSONB,
   * and remove them from the main payload before saving.
   *
   * { name: "Foo", __cf__blood_group: "A+" }
   * → { name: "Foo", custom_fields: { blood_group: "A+" } }
   */
  const packCustomFields = (payload: any): any => {
    const result = { ...payload };
    const cf: Record<string, any> = { ...(result.custom_fields || {}) };

    for (const key of Object.keys(result)) {
      if (key.startsWith("__cf__")) {
        const realKey = key.replace("__cf__", "");
        cf[realKey] = result[key];
        delete result[key];
      }
    }

    result.custom_fields = cf;
    return result;
  };

  return {
    customFields,
    customFieldDefs,
    loading,
    unpackCustomFields,
    packCustomFields,
    hasCustomFields: customFieldDefs.length > 0,
  };
}
