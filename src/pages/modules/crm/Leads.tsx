import { Users, Search, Filter, Plus, Mail, Phone, MoreHorizontal, UserCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DynamicFormDialog, FieldConfig } from "@/components/modules/DynamicFormDialog";
import { toast } from "sonner";

export default function Leads() {
    const [searchTerm, setSearchTerm] = useState("");
    const [leads, setLeads] = useState([
        { id: 1, name: "Sarah Jenkins", company: "Jenkins Solutions", status: "New", score: 85, phone: "+1 234 567 890", email: "sarah@jenkins.com" },
        { id: 2, name: "Michael Chen", company: "Chen Tech", status: "Contacted", score: 72, phone: "+1 234 567 891", email: "michael@chen.com" },
        { id: 3, name: "John Doe", company: "Doe Corp", status: "Qualified", score: 94, phone: "+1 234 567 892", email: "john@doe.com" },
    ]);

    const [isAddOpen, setIsAddOpen] = useState(false);

    const leadFields: FieldConfig[] = [
        { key: "name", label: "Full Name", required: true, ph: "e.g. Robert Fox" },
        { key: "company", label: "Company Name", required: true, ph: "e.g. Fox Industries" },
        { key: "email", label: "Email Address", type: "email", required: true },
        { key: "phone", label: "Phone Number", type: "tel" },
        {
            key: "status", label: "Initial Status", type: "select", options: [
                { label: "New", value: "New" },
                { label: "Contacted", value: "Contacted" },
                { label: "Qualified", value: "Qualified" }
            ], required: true
        },
        { key: "score", label: "Lead Score (0-100)", type: "number" }
    ];

    const handleAddLead = async (data: any) => {
        const newLead = {
            id: leads.length + 1,
            ...data,
            score: Number(data.score) || 0
        };
        setLeads([newLead, ...leads]);
        toast.success("Lead registered successfully");
    };

    const filteredLeads = leads.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-violet-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Sales Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic">Leads Database</h1>
                    <p className="text-sm font-medium text-slate-500">Manage and score your potential customers.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center bg-slate-100 rounded-2xl px-4 h-12 border border-slate-200">
                        <Search className="w-4 h-4 text-slate-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            className="bg-transparent border-0 focus:ring-0 text-sm w-48 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="h-12 px-8 rounded-2xl bg-violet-600 hover:bg-black text-white font-bold shadow-xl shadow-violet-600/20 transition-all gap-3 border-0"
                    >
                        <Plus className="w-5 h-5" /> Import Leads
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div className="p-10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 pl-4">Lead Entity</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Corporate Body</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Score</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Status</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Direct Comms</th>
                                    <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right pr-4">Matrix</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-6 pl-4">
                                            <p className="font-bold text-slate-900 uppercase italic">{lead.name}</p>
                                        </td>
                                        <td className="py-6">
                                            <p className="text-sm font-bold text-slate-500">{lead.company}</p>
                                        </td>
                                        <td className="py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-violet-500" style={{ width: `${lead.score}%` }} />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-900">{lead.score}</span>
                                            </div>
                                        </td>
                                        <td className="py-6">
                                            <span className="inline-flex items-center px-3 py-1 bg-violet-50 text-violet-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-violet-100">
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="py-6">
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:scale-110 transition-all"><Mail className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:scale-110 transition-all"><Phone className="w-4 h-4" /></Button>
                                            </div>
                                        </td>
                                        <td className="py-6 text-right pr-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    onClick={() => toast.success(`Converting ${lead.name} to Deal...`)}
                                                    variant="ghost" className="h-8 px-3 rounded-lg text-violet-600 hover:bg-violet-50 text-[10px] font-black uppercase tracking-widest gap-2"
                                                >
                                                    <TrendingUp className="w-3.5 h-3.5" /> Convert
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400"><MoreHorizontal className="w-4 h-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <DynamicFormDialog
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                title="Register New Lead"
                fields={leadFields}
                onSubmit={handleAddLead}
            />
        </div>
    );
}
