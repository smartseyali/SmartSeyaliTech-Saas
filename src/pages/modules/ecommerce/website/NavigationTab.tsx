import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Pencil, Trash2,
    RefreshCw, ChevronRight, X,
    ArrowRight, ExternalLink, Menu,
    ShieldCheck, Zap, Globe, Lock, Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDataConnector } from "@/hooks/useDataConnector";
import { useTenant } from "@/contexts/TenantContext";
import { cn } from "@/lib/utils";
import ERPEntryForm from "@/components/modules/ERPEntryForm";
import { toast } from "sonner";

export function NavigationTab({ companyId }: { companyId: any }) {
    const { activeCompany } = useTenant();
    const { fetchData, saveData, removeData, loading, config } = useDataConnector("SITE_NAVIGATION", "nav_menus");
    const [menus, setMenus] = useState<any[]>([]);
    const [activeMenuSet, setActiveMenuSet] = useState("Main Navigation");
    const [view, setView] = useState<"list" | "form">("list");
    const [editingLink, setEditingLink] = useState<any>(null);

    useEffect(() => {
        loadMenus();
    }, [activeMenuSet]);

    const loadMenus = async () => {
        const data = await fetchData();
        setMenus(data.filter((m: any) => m.menu_set === activeMenuSet));
    };

    const handleNew = () => {
        setEditingLink(null);
        setView("form");
    };

    const handleEdit = (li: any) => {
        setEditingLink(li);
        setView("form");
    };

    const handleDelete = async (id: any) => {
        if (!confirm("Remove this link from navigation?")) return;
        const success = await removeData(id);
        if (success) {
            toast.success("Link removed");
            loadMenus();
        }
    };

    const handleSubmit = async (formData: any) => {
        const payload = {
            ...formData,
            menu_set: activeMenuSet,
            id: editingLink?.id
        };
        const success = await saveData(payload);
        if (success) {
            setView("list");
            loadMenus();
        }
    };

    const fields = config?.fields.map(f => ({
        key: f.id,
        label: f.label,
        type: (f.type === 'url' ? 'text' : f.type === 'boolean' ? 'checkbox' : f.type === 'json' ? 'textarea' : f.type) as any,
        required: true
    })) || [];

    if (view === "form") {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingLink ? "Refine Navigation Node" : "Initialize Link Registry"}
                    subtitle={`Active Set: ${activeMenuSet}`}
                    headerFields={fields}
                    onAbort={() => { setView("list"); setEditingLink(null); }}
                    onSave={handleSubmit}
                    initialData={editingLink}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500 font-sans">
            <div className="lg:col-span-4 space-y-8">
                <section className="bg-white border rounded-[32px] p-8 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-10 border-b border-border pb-6">
                        <div className="w-10 h-10 bg-[#14532d] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#14532d]/20 transition-all group-hover:rotate-12">
                            <Menu className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#14532d]">Menu Sets</h2>
                            <p className="text-xs font-bold text-slate-500 tracking-widest mt-0.5">Define Your Links</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            "Main Navigation",
                            "Footer Links",
                            "Quick Links",
                            "Legal / Compliance"
                        ].map((m, i) => (
                            <button
                                key={m}
                                onClick={() => setActiveMenuSet(m)}
                                className={cn(
                                    "w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all group/btn relative overflow-hidden",
                                    activeMenuSet === m
                                        ? "border-[#14532d] bg-[#f8fafc] shadow-sm shadow-[#14532d]/5"
                                        : "border-transparent bg-slate-50 hover:bg-white hover:border-[#14532d]/20"
                                )}
                            >
                                <div className="space-y-1 text-left">
                                    <span className={cn(
                                        "text-sm font-bold transition-all",
                                        activeMenuSet === m ? "text-[#14532d]" : "text-slate-500 group-hover/btn:text-[#14532d]"
                                    )}>
                                        {m}
                                    </span>
                                    <p className="text-[13px] font-bold text-slate-300 tracking-widest leading-none">Global Scope</p>
                                </div>
                                <ChevronRight className={cn("w-4 h-4 transition-all", activeMenuSet === m ? "translate-x-0 opacity-100 text-[#f97316]" : "-translate-x-2 opacity-0 group-hover/btn:translate-x-0 group-hover/btn:opacity-100")} />
                            </button>
                        ))}
                    </div>
                </section>

                <div className="p-6 bg-[#14532d] rounded-[24px] text-white flex items-center gap-4 shadow-xl">
                    <ShieldCheck className="w-6 h-6 text-[#f97316]" />
                    <p className="text-xs font-bold tracking-widest text-white/60">Hierarchy Guard Active</p>
                </div>
            </div>

            <div className="lg:col-span-8">
                <section className="bg-white border rounded-[32px] p-8 md:p-12 shadow-sm relative overflow-hidden group min-h-[500px]">
                    <div className="flex flex-col md:flex-row md:items-start justify-between mb-12 gap-8 border-b border-border pb-8">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Leaf className="w-4 h-4 text-[#f97316]" />
                                <span className="text-[#14532d]/40 font-bold tracking-widest text-xs">Active Node Registry</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-[#14532d] leading-none">{activeMenuSet}</h2>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={handleNew}
                                className="h-10 px-6 rounded-xl bg-[#14532d] hover:bg-[#14532d]/90 text-white font-bold text-xs transition-all shadow-lg shadow-[#14532d]/10 flex items-center gap-2 group/btn"
                            >
                                <Plus className="w-4 h-4" /> Add Link
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading && (
                            <div className="p-20 text-center"><RefreshCw className="w-10 h-10 animate-spin mx-auto text-[#14532d]/10" /></div>
                        )}
                        {!loading && menus.length === 0 && (
                            <div className="p-20 text-center border-2 border-dashed border-slate-50 rounded-3xl">
                                <Menu className="w-10 h-10 text-slate-100 mx-auto mb-4" />
                                <p className="text-sm font-bold text-slate-200 tracking-widest">No links in this set</p>
                            </div>
                        )}
                        {menus.map((li, idx) => (
                            <motion.div
                                key={li.id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-center justify-between p-6 bg-[#f8fafc] rounded-2xl border border-transparent hover:border-[#14532d]/10 transition-all hover:bg-white hover:shadow-lg hover:shadow-[#14532d]/5 group/node"
                                onClick={() => handleEdit(li)}
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-[#14532d]/20 font-bold text-xs group-hover/node:text-[#14532d] shadow-sm">
                                        0{idx + 1}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-lg text-[#14532d] leading-none mb-1">{li.label}</p>
                                        <div className="flex items-center gap-3">
                                            <code className="text-xs font-bold text-[#14532d]/40 tracking-tight">{li.link_url}</code>
                                            <span className="w-1 h-1 rounded-full bg-[#f97316]" />
                                            <span className="text-[13px] font-bold text-slate-500 tracking-widest">Sort: {li.display_order}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 opacity-0 group-hover/node:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(li); }}
                                        className="w-9 h-9 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-[#14532d] transition-all flex items-center justify-center shadow-sm"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(li.id); }}
                                        className="w-9 h-9 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between opacity-30 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-4">
                            <Lock className="w-5 h-5 text-[#14532d]" />
                            <p className="text-xs font-bold tracking-widest text-[#14532d]">Link Masking Active</p>
                        </div>
                        <Zap className="w-5 h-5 text-[#f97316] animate-pulse" />
                    </div>
                </section>
            </div>
        </div>
    );
}

