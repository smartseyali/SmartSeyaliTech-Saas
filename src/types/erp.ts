// ============================================================================
// ERP Form System Types — Single Source of Truth
// Used by DocType registry, DocForm, DocList, DocPage
// ============================================================================

import type React from "react";

export type FieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "checkbox"
  | "datetime-local"
  | "textarea"
  | "email"
  | "phone"
  | "currency"
  | "percentage"
  | "readonly"
  | "image";

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface ERPField {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: FieldOption[];
  lookupTable?: string;
  lookupLabel?: string;
  lookupValue?: string;
  lookupFilter?: Record<string, any>;
  hidden?: boolean;
  readOnly?: boolean;
  width?: "sm" | "md" | "lg" | "full";
  group?: string;
  colSpan?: number;
  defaultValue?: any;
}

export interface DocColumn {
  key: string;
  label: string;
  render?: (item: any) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  width?: string;
}

export interface StatusTransition {
  from: string;
  to: string[];
}

export interface StatusFlow {
  field: string;
  options?: FieldOption[];
  transitions?: Record<string, string[]>;
}

export interface DocConversion {
  /** Registry key of the target doctype */
  target: string;
  /** Label shown on the conversion button */
  label: string;
  /** Map source header fields → target header fields */
  headerMap?: Record<string, string>;
  /** Source item table to read from */
  sourceItemTable?: string;
  /** Target item table to write to */
  targetItemTable?: string;
  /** Direct field mapping (legacy support) */
  targetDoctype?: string;
  mapFields?: Record<string, string>;
  mapItemFields?: Record<string, string>;
}

export type TabFields = {
  basic?: ERPField[];
  config?: ERPField[];
  mapping?: ERPField[];
  audit?: ERPField[];
  custom?: ERPField[];
};

export interface DocTypeDef {
  /** Human-readable document name */
  name: string;
  /** Supabase table for the main record */
  tableName: string;
  /** Supabase table for child line items */
  itemTableName?: string;
  /** FK column in item table referencing the header */
  itemForeignKey?: string;
  /** Supabase select query (e.g. "*, master_contacts(full_name)") */
  selectQuery?: string;

  // ── Form config ──
  headerFields?: ERPField[];
  tabFields?: TabFields;
  itemFields?: ERPField[];
  showItems?: boolean;
  itemTitle?: string;

  // ── List config ──
  columns: DocColumn[];
  defaultSort?: { key: string; dir: "asc" | "desc" };
  searchableFields?: string[];
  primaryKey?: string;
  statusField?: string;

  // ── Workflow ──
  statusFlow?: StatusFlow[];
  calculation?: "transaction" | "none";

  // ── Document conversions ──
  conversions?: DocConversion[];

  // ── Formatting ──
  referencePrefix?: string;
  referenceField?: string;

  // ── Metadata ──
  module?: string;
  icon?: string;
  formTitle?: string;
  listTitle?: string;
  defaults?: Record<string, unknown>;

  // ── Multi-tenancy ──
  /** When true, queries skip company_id scoping (e.g. super-admin platform tables) */
  isGlobal?: boolean;
}
