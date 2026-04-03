/**
 * ERPEntryForm — Legacy wrapper, now delegates to DocForm
 *
 * Kept for backward compatibility with pages that haven't migrated to DocPage yet.
 * All rendering is handled by DocForm with its ERPNext-style layout.
 */
import DocForm from "./DocForm";

interface ERPField {
    key: string;
    label: string;
    type?: "text" | "number" | "date" | "select" | "datetime-local" | "checkbox" | "textarea" | "currency" | "percentage" | "email" | "phone" | "readonly" | "image";
    required?: boolean;
    options?: { label: string; value: string | number }[];
    lookupTable?: string;
    lookupLabel?: string;
    lookupValue?: string;
    lookupFilter?: Record<string, any>;
    ph?: string;
    placeholder?: string;
    hidden?: boolean;
    readOnly?: boolean;
    width?: "sm" | "md" | "lg" | "full";
    colSpan?: number;
}

interface ERPEntryFormProps {
    title: string;
    subtitle?: string;
    headerFields?: ERPField[];
    tabFields?: {
        basic?: ERPField[];
        config?: ERPField[];
        mapping?: ERPField[];
        audit?: ERPField[];
    };
    itemFields?: ERPField[];
    onSave: (header: any, items: any[]) => Promise<void>;
    onAbort: () => void;
    initialData?: any;
    initialItems?: any[];
    showItems?: boolean;
    itemTitle?: string;
    customActions?: React.ReactNode;
    onDelete?: (id: any) => Promise<void>;
}

export default function ERPEntryForm({
    title, subtitle, headerFields, tabFields, itemFields,
    onSave, onAbort, onDelete, initialData, initialItems,
    showItems = true, itemTitle = "Items / Services", customActions
}: ERPEntryFormProps) {
    // Normalize `ph` → `placeholder` for backward compatibility
    const normalizeFields = (fields?: ERPField[]): ERPField[] | undefined => {
        if (!fields) return undefined;
        return fields.map(f => ({
            ...f,
            placeholder: f.placeholder || f.ph,
        }));
    };

    const normalizedHeader = normalizeFields(headerFields);
    const normalizedTab = tabFields ? {
        basic: normalizeFields(tabFields.basic),
        config: normalizeFields(tabFields.config),
        mapping: normalizeFields(tabFields.mapping),
        audit: normalizeFields(tabFields.audit),
    } : undefined;
    const normalizedItems = normalizeFields(itemFields);

    return (
        <DocForm
            title={title}
            subtitle={subtitle}
            headerFields={normalizedHeader}
            tabFields={normalizedTab}
            itemFields={normalizedItems}
            onSave={onSave}
            onAbort={onAbort}
            onDelete={onDelete}
            initialData={initialData}
            initialItems={initialItems}
            showItems={showItems}
            itemTitle={itemTitle}
            customActions={customActions}
        />
    );
}
