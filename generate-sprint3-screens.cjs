const fs = require('fs');
const path = require('path');

const components = [
    {
        filepath: 'src/pages/modules/books/FinancialReports.tsx',
        name: 'FinancialReports',
        title: 'Financial Reports',
        table: 'books_reports'
    },
    {
        filepath: 'src/pages/modules/books/BankReconciliation.tsx',
        name: 'BankReconciliation',
        title: 'Bank Reconciliation',
        table: 'books_reconciliation'
    },
    {
        filepath: 'src/pages/modules/books/TaxConfigurations.tsx',
        name: 'TaxConfigurations',
        title: 'Tax Configurations',
        table: 'books_tax_slabs'
    },
    {
        filepath: 'src/pages/modules/settings/FiscalYears.tsx',
        name: 'FiscalYears',
        title: 'Fiscal Years',
        table: 'fiscal_years'
    },
    {
        filepath: 'src/pages/modules/inventory/StockAudits.tsx',
        name: 'StockAudits',
        title: 'Stock Audits',
        table: 'inventory_audits'
    },
    {
        filepath: 'src/pages/modules/inventory/BatchTracking.tsx',
        name: 'BatchTracking',
        title: 'Batch & Expiry',
        table: 'inventory_batches'
    },
    {
        filepath: 'src/pages/modules/hrms/Claims.tsx',
        name: 'EmployeeClaims',
        title: 'Reimbursements',
        table: 'hrms_claims'
    },
    {
        filepath: 'src/pages/modules/hrms/Appraisals.tsx',
        name: 'EmployeeAppraisals',
        title: 'Appraisals',
        table: 'hrms_appraisals'
    }
];

const generateTemplate = (comp) => {
    return `import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function ${comp.name}() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingItem, setEditingItem] = useState<any>(null);
    
    const { data: items, loading, fetchItems, createItem, updateItem } = useCrud("${comp.table}");

    const fields = [
        { key: "name", label: "Identifier", required: true, ph: "Enter details..." }
    ];

    const handleSave = async (header: any) => {
        if (editingItem) {
            await updateItem(editingItem.id, header);
        } else {
            await createItem(header);
        }
        setView("list");
        setEditingItem(null);
    };

    const columns = [
        { 
            key: "name", 
            label: "Record Identifier",
            render: (i: any) => <span className="font-bold text-gray-900">{i.name || "N/A"}</span>
        },
        { 
            key: "created_at", 
            label: "Created",
            render: (i: any) => <span className="text-gray-500 text-sm">{i.created_at ? new Date(i.created_at).toLocaleDateString() : '-'}</span>
        }
    ];

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingItem ? "Edit ${comp.title}" : "New ${comp.title}"}
                    subtitle="Enterprise Core Logic Ops"
                    headerFields={fields}
                    onAbort={() => { setView("list"); setEditingItem(null); }}
                    onSave={handleSave}
                    initialData={editingItem}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="${comp.title}"
            data={items || []}
            columns={columns}
            onNew={() => { setEditingItem(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(i) => { setEditingItem(i); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
        />
    );
}
`;
};

components.forEach(comp => {
    const fullPath = path.join(__dirname, comp.filepath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, generateTemplate(comp));
    console.log("Created:", comp.filepath);
});
