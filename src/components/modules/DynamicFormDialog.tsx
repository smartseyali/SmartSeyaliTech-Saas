import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, Save, Loader2, Shield } from "lucide-react";

export type FieldConfig = {
    key: string;
    label: string;
    type?: "text" | "number" | "email" | "tel" | "textarea" | "select" | "image" | "video" | "checkbox";
    options?: { label: string; value: string }[];
    required?: boolean;
    ph?: string;
    bucket?: string;
    folder?: string;
};

import { MediaUpload } from "@/components/common/MediaUpload";

const inputCls = "w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 outline-none transition-all";

export function DynamicFormDialog({
    open,
    onOpenChange,
    title,
    fields,
    initialData,
    onSubmit
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    fields: FieldConfig[];
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
}) {
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) setFormData(initialData || {});
    }, [open, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onOpenChange(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent hideClose className="sm:max-w-[800px] p-0 overflow-hidden border-0 shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] rounded-[24px] bg-slate-50/95 backdrop-blur-xl md:translate-y-[-50%] translate-y-[-45%]">
                {/* Header: ERP Glass Header */}
                <div className="px-8 py-6 border-b border-white/40 flex items-center justify-between bg-white/40 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-600/0 via-blue-600/40 to-blue-600/0" />
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/80">Record Information</p>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="w-10 h-10 rounded-2xl hover:bg-white/80 hover:shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-90 border border-transparent hover:border-slate-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row h-full max-h-[75vh]">
                    {/* Optional Side Information Panel (ERP Style Hint) */}
                    <div className="hidden md:flex w-48 shrink-0 bg-slate-900/5 border-r border-white/40 p-6 flex-col gap-8">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Record ID</p>
                                <p className="text-xs font-mono font-bold text-slate-600">#{initialData?.id || 'NEW_RECORD'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-600 text-[9px] font-bold">
                                    <div className="w-1 h-1 rounded-full bg-blue-600" /> Draft
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-200/50">
                            <p className="text-[10px] leading-relaxed text-slate-500 font-medium italic">
                                Please ensure all required fields are filled out.
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Body: High-Density Workspace */}
                        <div className="p-8 overflow-y-auto space-y-8 flex-1 scrollbar-thin">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
                                {fields.map(field => {
                                    const isFullWidth = field.type === "textarea" || field.type === "image" || field.type === "video";

                                    return (
                                        <div key={field.key} className={cn(isFullWidth ? "sm:col-span-2" : "", "space-y-2.5 group")}>
                                            {field.type !== "image" && field.type !== "video" && field.type !== "checkbox" && (
                                                <div className="flex items-center justify-between px-0.5">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] group-focus-within:text-blue-600 transition-colors">
                                                        {field.label} {field.required && <span className="text-rose-500 font-black">*</span>}
                                                    </label>
                                                </div>
                                            )}

                                            {field.type === "image" || field.type === "video" ? (
                                                <div className="rounded-[20px] overflow-hidden border border-slate-200/60 bg-white/50 p-1.5 shadow-inner transition-all hover:border-blue-400/50">
                                                    <MediaUpload
                                                        type={field.type}
                                                        value={formData[field.key] || ""}
                                                        onChange={val => setFormData({ ...formData, [field.key]: val })}
                                                        label={field.label}
                                                        bucket={field.bucket}
                                                        folder={field.folder}
                                                        accept={field.type === "image" ? "image/*" : "video/*"}
                                                        className="rounded-[16px]"
                                                    />
                                                </div>
                                            ) : field.type === "textarea" ? (
                                                <textarea
                                                    className="w-full rounded-[18px] border border-slate-200 bg-white/80 px-4 py-3 text-[13px] font-semibold text-slate-900 placeholder:text-slate-300 focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all resize-none min-h-[120px] shadow-sm shadow-slate-200/20"
                                                    value={formData[field.key] || ""}
                                                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                                    required={field.required}
                                                    placeholder={field.ph || "Enter details..."}
                                                />
                                            ) : field.type === "select" ? (
                                                <div className="relative group/select">
                                                    <select
                                                        className={cn(inputCls, "appearance-none pr-10 cursor-pointer rounded-[14px] font-bold text-[13px] bg-white/80 border-slate-200 shadow-sm shadow-slate-200/10")}
                                                        value={formData[field.key] || ""}
                                                        onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                                        required={field.required}
                                                    >
                                                        <option value="" disabled>Select an option...</option>
                                                        {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                    </select>
                                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-blue-600 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                    </div>
                                                </div>
                                            ) : field.type === "checkbox" ? (
                                                <div
                                                    className="flex items-center gap-4 p-4 rounded-[18px] bg-white/40 border border-white/60 hover:bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-600/5 cursor-pointer transition-all"
                                                    onClick={() => setFormData({ ...formData, [field.key]: !formData[field.key] })}
                                                >
                                                    <button
                                                        type="button"
                                                        className={cn("relative w-12 h-7 rounded-full transition-colors duration-300 focus:outline-none shrink-0", formData[field.key] ? "bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]" : "bg-slate-200")}
                                                    >
                                                        <div className={cn("absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300", formData[field.key] ? "translate-x-5" : "")} />
                                                    </button>
                                                    <span className="text-xs font-bold text-slate-800 tracking-tight">{field.label}</span>
                                                </div>
                                            ) : (
                                                <input
                                                    className={cn(inputCls, "rounded-[14px] font-bold text-[13px] bg-white/80 border-slate-200 shadow-sm shadow-slate-200/10")}
                                                    type={field.type || "text"}
                                                    value={formData[field.key] || ""}
                                                    onChange={e => setFormData({ ...formData, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value })}
                                                    required={field.required}
                                                    placeholder={field.ph || `Enter ${field.label.toLowerCase()}...`}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer: ERP Action Bar */}
                        <div className="px-8 py-5 border-t border-slate-100 bg-white/60 backdrop-blur-md flex items-center justify-between">
                            <div className="hidden sm:flex items-center gap-4">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <Shield className="w-3 h-3" /> Secure Auth
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => onOpenChange(false)}
                                    className="h-11 px-6 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-white transition-all border border-transparent hover:border-slate-100"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="h-11 px-8 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20 transition-all gap-2 active:scale-95"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {loading ? "SAVING..." : "SAVE CHANGES"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
