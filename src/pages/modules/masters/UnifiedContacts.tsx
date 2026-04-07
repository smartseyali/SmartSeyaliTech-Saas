import { useState, useEffect } from "react";
import db from "@/lib/db";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function UnifiedContacts() {
    const { activeCompany } = useTenant();
    const { user } = useAuth();
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const fetchContacts = async () => {
        if (!activeCompany) return;
        setLoading(true);
        try {
            let query = db.from('contacts').select('*')
                .eq('company_id', activeCompany.id)
                .order('created_at', { ascending: false });

            if (activeTab !== "all") {
                query = query.eq('type', activeTab);
            }

            const { data, error } = await query;
            if (error) throw error;
            setContacts(data || []);
        } catch (error: any) {
            toast.error("Failed to fetch contacts: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [activeTab]);

    const columns = [
        { key: 'name', label: 'Name', className: 'font-bold text-slate-900' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { 
            key: 'type', 
            label: 'Type',
            render: (item: any) => (
                <Badge variant="outline" className="capitalize bg-slate-50 text-slate-600 border-slate-200">
                    {item.type}
                </Badge>
            )
        },
        { key: 'company_name', label: 'Organization' },
        { key: 'status', label: 'Status' }
    ];

    const tabs = (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-2">
            {['all', 'customer', 'vendor', 'lead', 'employee'].map((tab) => (
                <Button
                    key={tab}
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab(tab)}
                    className={`h-8 px-4 rounded-full text-[13px] font-bold uppercase tracking-wider transition-all border ${
                        activeTab === tab 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    {tab}
                </Button>
            ))}
        </div>
    );

    return (
        <ERPListView
            title="Unified Contacts"
            data={contacts.filter(c => 
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                c.email?.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            columns={columns}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRefresh={fetchContacts}
            onNew={() => toast.info("Contact creation form coming soon")}
            tabs={tabs}
        />
    );
}
