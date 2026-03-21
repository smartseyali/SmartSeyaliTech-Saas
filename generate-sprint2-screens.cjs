const fs = require('fs');
const path = require('path');

const components = [
    {
        filepath: 'src/pages/modules/crm/Forecast.tsx',
        name: 'Forecast',
        title: 'Sales Forecast',
        table: 'crm_forecasts'
    },
    {
        filepath: 'src/pages/modules/crm/Accounts.tsx',
        name: 'Accounts',
        title: 'B2B Accounts',
        table: 'crm_accounts'
    },
    {
        filepath: 'src/pages/modules/crm/Segments.tsx',
        name: 'Segments',
        title: 'Marketing Segments',
        table: 'crm_segments'
    },
    {
        filepath: 'src/pages/modules/pos/Register.tsx',
        name: 'POSRegister',
        title: 'Cash Register Shifts',
        table: 'pos_registers'
    },
    {
        filepath: 'src/pages/modules/pos/POSOrders.tsx',
        name: 'POSOrders',
        title: 'Point of Sale Ledger',
        table: 'pos_orders'
    },
    {
        filepath: 'src/pages/modules/inventory/StockLevels.tsx',
        name: 'StockLevels',
        title: 'Inventory Stock Levels',
        table: 'inventory_levels'
    },
    {
        filepath: 'src/pages/modules/inventory/StockTransfers.tsx',
        name: 'StockTransfers',
        title: 'Warehouse Transfers',
        table: 'inventory_transfers'
    },
    {
        filepath: 'src/pages/modules/hrms/Departments.tsx',
        name: 'Departments',
        title: 'Org Departments',
        table: 'hrms_departments'
    },
    {
        filepath: 'src/pages/modules/purchase/GoodsReceipts.tsx',
        name: 'GoodsReceipts',
        title: 'Goods Receipts (GRN)',
        table: 'purchase_receipts'
    },
    {
        filepath: 'src/pages/modules/invoicing/ReceiptVouchers.tsx',
        name: 'ReceiptVouchers',
        title: 'Payment Vouchers',
        table: 'payment_vouchers'
    },
    {
        filepath: 'src/pages/modules/payroll/SalaryStructures.tsx',
        name: 'SalaryStructures',
        title: 'Compensation Structures',
        table: 'payroll_structures'
    },
    {
        filepath: 'src/pages/modules/payroll/RunPayroll.tsx',
        name: 'RunPayroll',
        title: 'Payroll Batch Engine',
        table: 'payroll_runs'
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
