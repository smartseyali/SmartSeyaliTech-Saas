import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Eye, Pencil, Trash2,
    RefreshCw, X, ArrowRight, Search,
    Zap, FileText, Globe, ShieldCheck,
    Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDataConnector } from "@/hooks/useDataConnector";
import { cn } from "@/lib/utils";
import ERPEntryForm from "@/components/modules/ERPEntryForm";
import { toast } from "sonner";

export function PagesTab({ companyId }: { companyId: any }) {
    const { fetchData, saveData, removeData, loading, config } = useDataConnector("WEBSITE_PAGES", "static_pages");
    const [pages, setPages] = useState<any[]>([]);
    const [view, setView] = useState<"list" | "form">("list");
    const [editingPage, setEditingPage] = useState<any>(null);

    useEffect(() => {
        loadPages();
    }, []);

    const loadPages = async () => {
        const data = await fetchData();
        setPages(data);
    };

    const handleNew = () => {
        setEditingPage(null);
        setView("form");
    };

    const handleEdit = (p: any) => {
        setEditingPage(p);
        setView("form");
    };

    const handleDelete = async (id: any) => {
        if (!confirm("Are you sure you want to delete this page?")) return;
        const success = await removeData(id);
        if (success) {
            toast.success("Page deleted successfully");
            loadPages();
        }
    };

    const handleSubmit = async (formData: any) => {
        const payload = editingPage ? { ...formData, id: editingPage.id } : formData;
        const success = await saveData(payload);
        if (success) {
            setView("list");
            loadPages();
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
                    title={editingPage ? "Refine Page Matrix" : "Initialize Page Registry"}
                    subtitle="Universal Content Catalog"
                    headerFields={fields}
                    onAbort={() => { setView("list"); setEditingPage(null); }}
                    onSave={handleSubmit}
                    initialData={editingPage}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <div className="bg-white border rounded-[32px] p-8 md:p-12 shadow-sm animate-in slide-in-from-bottom-4 duration-500 font-sans relative overflow-hidden group">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-16 gap-10 border-b border-slate-50 pb-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-[#f97316]" />
                        <span className="text-[#14532d]/40 font-bold tracking-widest text-[10px]">Content Management</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#14532d] leading-none">Storefront <span className="text-slate-100">Pages</span></h2>
                    <p className="text-sm text-slate-400 font-medium max-w-xl">
                        Manage your custom informational pages, terms of service, and about us content from one central dashboard.
                    </p>
                </div>
                <div className="flex flex-col md:items-end gap-6">
                    <Button
                        onClick={handleNew}
                        className="h-12 px-8 rounded-xl bg-[#14532d] hover:bg-[#14532d]/90 text-white font-bold text-sm shadow-lg shadow-[#14532d]/20 transition-all flex items-center gap-2 group/btn"
                    >
                        Create New Page <Plus className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#f8fafc] rounded-full border border-border shadow-inner">
                        <Globe className="w-4 h-4 text-[#14532d]/40" />
                        <span className="text-[10px] font-bold text-[#14532d]/60 tracking-widest">Global CDN Active</span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-separate border-spacing-y-3">
                    <thead>
                        <tr className="text-[10px] font-bold tracking-widest text-slate-300">
                            <th className="px-6 py-4">Page Title</th>
                            <th className="px-6 py-4">URL Slug</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages.length === 0 && !loading && (
                            <tr>
                                <td colSpan={4} className="px-6 py-20 bg-[#f8fafc] rounded-3xl text-center border border-dashed border-border">
                                    <FileText className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-slate-300 tracking-widest">No pages created yet</p>
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td colSpan={4} className="px-6 py-20 text-center">
                                    <RefreshCw className="w-10 h-10 animate-spin mx-auto text-[#14532d]/20" />
                                </td>
                            </tr>
                        )}
                        {pages.map((p, i) => (
                            <motion.tr
                                key={p.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05, duration: 0.3 }}
                                className="group/tr bg-[#f8fafc] hover:bg-white hover:shadow-lg hover:shadow-[#14532d]/5 transition-all duration-300 cursor-pointer"
                                onClick={() => handleEdit(p)}
                            >
                                <td className="px-6 py-5 rounded-l-2xl border-l border-y border-transparent group-hover/tr:border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm group-hover/tr:text-[#14532d] transition-all">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="font-bold text-base text-[#14532d]">{p.title}</span>
                                            <p className="text-[10px] font-bold text-slate-400 tracking-widest">INDEX: {i + 1}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 border-y border-transparent group-hover/tr:border-slate-100">
                                    <code className="px-3 py-1 bg-white rounded-lg border border-slate-100 text-[11px] font-bold text-[#14532d]/60 tracking-tight">/{p.slug}</code>
                                </td>
                                <td className="px-6 py-5 text-center border-y border-transparent group-hover/tr:border-slate-100">
                                    <span className={cn(
                                        "px-4 py-1.5 rounded-full font-bold text-[9px] tracking-widest shadow-sm border",
                                        p.is_published ? "bg-[#14532d]/10 text-[#14532d] border-[#14532d]/20" : "bg-slate-100 text-slate-400 border-slate-200"
                                    )}>
                                        {p.is_published ? "Published" : "Draft"}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right rounded-r-2xl border-r border-y border-transparent group-hover/tr:border-slate-100">
                                    <div className="flex items-center justify-end gap-3 px-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEdit(p); }}
                                            className="w-8 h-8 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-[#14532d] transition-all flex items-center justify-center shadow-sm"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                                            className="w-8 h-8 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-12 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4">
                    <ShieldCheck className="w-5 h-5 text-[#14532d]" />
                    <p className="text-[10px] font-bold tracking-widest text-[#14532d]">Content Integrity Active</p>
                </div>
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#f97316] animate-pulse" />
                    <span className="text-[10px] font-bold tracking-widest text-slate-400">Synced to cloud storage</span>
                </div>
            </div>
        </div>
    );
}

