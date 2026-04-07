import { useState, useEffect } from "react";
import {
    Plus,
    Edit,
    ClipboardList
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import ERPEntryForm from "@/components/modules/ERPEntryForm";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";

export default function PurchaseRequests() {
    const { activeCompany } = useTenant();
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRequest, setEditingRequest] = useState<any>(null);

    useEffect(() => {
        if (activeCompany) loadRequests();
    }, [activeCompany?.id]);

    const loadRequests = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('purchase_requests')
            .select('*')
            .eq('company_id', activeCompany.id)
            .order('created_at', { ascending: false });

        if (!error && data) setRequests(data);
        setLoading(false);
    };

    const requestHeaderFields = [
        { key: "reference_no", label: "Request Identifier", required: true },
        { key: "date", label: "Request Date", type: "date" as const },
        { key: "required_by", label: "Critical Deadline", type: "date" as const },
        {
            key: "status", label: "Approval", type: "select" as const,
            options: [
                { label: "Draft Request", value: "draft" },
                { label: "Pending Engine Approval", value: "pending-approval" },
                { label: "Approved", value: "approved" },
                { label: "Ordered Payload", value: "ordered" }
            ]
        }
    ];

    const handleSaveRequest = async (header: any, items: any[]) => {
        try {
            const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

            const payload = {
                ...header,
                company_id: activeCompany?.id,
                total_qty: totalQty
            };

            const { data: savedHeader, error: hError } = await supabase
                .from('purchase_requests')
                .upsert([payload])
                .select()
                .single();

            if (hError) throw hError;

            if (header.id) {
                await supabase.from('purchase_request_items').delete().eq('request_id', header.id);
            }

            const lineItems = items.map(item => ({
                request_id: savedHeader.id,
                description: item.description,
                quantity: item.quantity
            }));

            const { error: iError } = await supabase.from('purchase_request_items').insert(lineItems);
            if (iError) throw iError;

            toast.success("Purchase Request Blueprint Committed");
            setView("list");
            loadRequests();
        } catch (err: any) {
            toast.error(`Sync Failure: ${err.message}`);
        }
    };

    const filteredRequests = requests.filter(r =>
        r.reference_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <ERPEntryForm
                title={editingRequest ? "Modify Request" : "Initialize Procurement Demand"}
                subtitle="Internal Supply Chain Requirement"
                headerFields={requestHeaderFields}
                onAbort={() => { setView("list"); setEditingRequest(null); }}
                onSave={handleSaveRequest}
                initialData={editingRequest}
                initialItems={editingRequest ? [] : undefined}
            />
        );
    }

    const requestColumns = [
        { 
            key: "reference_no", 
            label: "Request ID",
            render: (r: any) => <span className="font-bold text-gray-900 tracking-tight ">{r.reference_no}</span>
        },
        { 
            key: "date", 
            label: "Timeline",
            render: (r: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{r.date || 'No Date'}</span>
                    <span className="text-xs text-gray-400 font-bold  tracking-widest">Required by: {r.required_by || 'ASAP'}</span>
                </div>
            )
        },
        { 
            key: "total_qty", 
            label: "Volume",
            render: (r: any) => <span className="font-bold text-slate-600 tracking-tight">{r.total_qty || 0} Units</span>
        },
        { 
            key: "status", 
            label: "Approval",
            render: (r: any) => <StatusBadge status={r.status} />
        }
    ];

    return (
        <ERPListView
            title="Purchase Requests"
            data={filteredRequests}
            columns={requestColumns}
            onNew={() => { setEditingRequest(null); setView("form"); }}
            onRefresh={loadRequests}
            onRowClick={(r) => { setEditingRequest(r); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
        />
    );
}
