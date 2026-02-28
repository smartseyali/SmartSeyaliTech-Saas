import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Pencil, Trash2,
    ExternalLink, PenTool, Zap,
    ArrowRight, Globe, ShieldCheck,
    Eye, Search, MessageCircle, Leaf,
    Sparkles, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDataConnector } from "@/hooks/useDataConnector";
import { DynamicFormDialog, FieldConfig } from "@/components/modules/DynamicFormDialog";
import { toast } from "sonner";

export function BlogTab({ companyId }: { companyId: any }) {
    const { fetchData, saveData, removeData, loading, config } = useDataConnector("WEBSITE_BLOG", "blog_posts");
    const [posts, setPosts] = useState<any[]>([]);
    const [formOpen, setFormOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        const data = await fetchData();
        setPosts(data);
    };

    const handleNew = () => {
        setEditingPost(null);
        setFormOpen(true);
    };

    const handleEdit = (p: any) => {
        setEditingPost(p);
        setFormOpen(true);
    };

    const handleDelete = async (id: any) => {
        if (!confirm("Are you sure you want to delete this article?")) return;
        const success = await removeData(id);
        if (success) {
            toast.success("Article deleted successfully");
            loadPosts();
        }
    };

    const handleSubmit = async (formData: any) => {
        const payload = editingPost ? { ...formData, id: editingPost.id } : formData;
        const success = await saveData(payload);
        if (success) {
            setFormOpen(false);
            loadPosts();
        }
    };

    const fields: FieldConfig[] = config?.fields.map(f => ({
        key: f.id,
        label: f.label,
        type: f.type === 'url' ? 'text' : f.type === 'json' ? 'textarea' : f.type === 'boolean' ? 'checkbox' : f.type,
        required: true
    })) || [];

    return (
        <div className="bg-white border rounded-[32px] p-8 md:p-12 shadow-sm animate-in slide-in-from-bottom-4 duration-500 font-sans relative overflow-hidden group">

            <div className="flex flex-col md:flex-row md:items-start justify-between mb-16 gap-10 border-b border-slate-50 pb-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-[#f97316]" />
                        <span className="text-[#14532d]/40 font-bold uppercase tracking-widest text-[10px]">Merchant Journal</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#14532d] leading-none">The <span className="text-[#14532d]/20 italic">Blog</span></h2>
                    <p className="text-sm text-slate-400 font-medium max-w-xl">
                        Share stories, recipes, and organic farming tips with your community. Your blog is a powerful tool for customer engagement.
                    </p>
                </div>
                <div className="flex flex-col md:items-end gap-6">
                    <Button
                        onClick={handleNew}
                        className="h-12 px-8 rounded-xl bg-[#14532d] hover:bg-[#14532d]/90 text-white font-bold text-sm shadow-lg shadow-[#14532d]/20 transition-all flex items-center gap-2 group/btn"
                    >
                        Create New Article <PenTool className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Post Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading && (
                    <div className="col-span-full py-20 text-center">
                        <RefreshCw className="w-10 h-10 animate-spin mx-auto text-[#14532d]/10" />
                        <p className="mt-4 text-xs font-bold text-slate-300 uppercase tracking-widest">Retrieving Journal Entries...</p>
                    </div>
                )}

                {!loading && posts.length === 0 && (
                    <div className="col-span-full py-32 text-center bg-[#f8fafc] rounded-[48px] border-2 border-dashed border-slate-100">
                        <MessageCircle className="w-16 h-16 mx-auto mb-6 text-slate-200" />
                        <p className="text-xl font-bold text-[#14532d] uppercase tracking-tight">The Archive is Silent</p>
                        <p className="text-slate-400 font-medium italic mt-2">Begin your brand's narrative by publishing your first article.</p>
                        <Button onClick={handleNew} variant="outline" className="mt-10 rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px]">Start Writing</Button>
                    </div>
                )}

                {posts.map((b, i) => (
                    <motion.div
                        key={b.id || i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.3 }}
                        className="group/card flex flex-col h-full bg-[#f8fafc] rounded-3xl border border-transparent hover:bg-white hover:shadow-xl hover:shadow-[#14532d]/5 transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="h-48 overflow-hidden relative">
                            <img
                                src={b.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"}
                                alt={b.title}
                                className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-[2s]"
                            />
                            <span className="absolute top-4 left-4 px-3 py-1 bg-[#14532d] rounded-full text-[9px] font-bold uppercase text-white tracking-widest z-10 shadow-lg shadow-[#14532d]/20">
                                {b.category || "General"}
                            </span>
                        </div>

                        <div className="p-8 flex flex-col flex-1">
                            <div className="flex items-center gap-2 mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                <Sparkles className="w-3.5 h-3.5 text-[#f97316]" /> {b.is_published ? "Published" : "Draft"}
                            </div>
                            <h3 className="font-bold text-xl text-[#14532d] mb-6 line-clamp-2">
                                {b.title}
                            </h3>

                            <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(b)}
                                        className="w-9 h-9 rounded-xl bg-white border border-slate-100 text-slate-300 hover:text-[#14532d] flex items-center justify-center transition-all shadow-sm"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(b.id)}
                                        className="w-9 h-9 rounded-xl bg-white border border-slate-100 text-slate-300 hover:text-red-500 flex items-center justify-center transition-all shadow-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <Button
                                    onClick={() => handleEdit(b)}
                                    variant="link" className="p-0 h-auto text-[10px] font-bold uppercase tracking-widest text-[#14532d]/60 hover:text-[#14532d] flex items-center gap-2 group/link transition-all"
                                >
                                    Edit Post <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <DynamicFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                title={editingPost ? "Refine Article" : "Compose Journal Entry"}
                fields={fields}
                initialData={editingPost}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
