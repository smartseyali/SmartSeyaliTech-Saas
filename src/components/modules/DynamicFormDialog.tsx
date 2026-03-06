import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
        if (open) {
            setFormData(initialData || {});
        }
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
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden border-slate-100 shadow-[0_32px_128px_-10px_rgba(0,0,0,0.1)] rounded-[48px] animate-in zoom-in-95 duration-500 scale-110">
                <div className="bg-white p-12 pb-8 border-b border-slate-50 relative">
                    <div className="absolute top-0 left-0 w-32 h-2 bg-blue-600 rounded-full ml-12" />
                    <DialogHeader>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Core Data Structure Protocol</span>
                        </div>
                        <DialogTitle className="text-4xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">{title}</DialogTitle>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-12 max-h-[60vh] overflow-y-auto custom-scrollbar bg-white">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                            {fields.map(field => {
                                const isFullWidth = field.type === "textarea" || field.type === "image" || field.type === "video";

                                return (
                                    <div
                                        key={field.key}
                                        className={`${isFullWidth ? "sm:col-span-2" : ""} space-y-4 group/field`}
                                    >
                                        {field.type !== "image" && field.type !== "video" && (
                                            <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 group-focus-within/field:text-blue-600 transition-colors italic">
                                                {field.label} {field.required && <span className="text-rose-500">*</span>}
                                            </Label>
                                        )}

                                        {field.type === "image" || field.type === "video" ? (
                                            <div className="rounded-[32px] overflow-hidden border border-slate-100 bg-slate-50/30 p-2">
                                                <MediaUpload
                                                    type={field.type}
                                                    value={formData[field.key] || ""}
                                                    onChange={val => setFormData({ ...formData, [field.key]: val })}
                                                    label={field.label}
                                                    bucket={field.bucket}
                                                    folder={field.folder}
                                                    accept={field.type === "image" ? "image/*" : "video/*"}
                                                />
                                            </div>
                                        ) : field.type === "textarea" ? (
                                            <textarea
                                                className="flex min-h-[160px] w-full rounded-[28px] border border-slate-100 bg-slate-50/50 px-8 py-6 text-base font-black text-slate-950 placeholder:text-slate-200 focus:ring-[16px] focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all resize-none shadow-inner tracking-tight"
                                                value={formData[field.key] || ""}
                                                onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                                required={field.required}
                                                placeholder={field.ph || "Enter comprehensive details..."}
                                            />
                                        ) : field.type === "select" ? (
                                            <div className="relative group/select">
                                                <select
                                                    className="flex h-16 w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 px-8 py-2 text-sm font-black text-slate-950 focus:outline-none focus:ring-[16px] focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50 transition-all appearance-none shadow-inner uppercase tracking-tight"
                                                    value={formData[field.key] || ""}
                                                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                                    required={field.required}
                                                >
                                                    <option value="" disabled className="text-slate-300">SELECT_PROTOCOL_STATE</option>
                                                    {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                </select>
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover/select:text-blue-600 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
                                                </div>
                                            </div>
                                        ) : field.type === "checkbox" ? (
                                            <div className="flex items-center gap-6 p-6 rounded-[28px] bg-slate-50/50 border border-slate-100 transition-all hover:bg-white hover:shadow-2xl hover:border-blue-100 cursor-pointer group/check" onClick={() => setFormData({ ...formData, [field.key]: !formData[field.key] })}>
                                                <div className={cn("w-14 h-8 rounded-full transition-all duration-500 relative ring-4 ring-transparent group-hover/check:ring-blue-500/10", formData[field.key] ? "bg-blue-600" : "bg-slate-200")}>
                                                    <div className={cn("absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-xl", formData[field.key] ? "translate-x-6" : "")} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover/check:text-blue-600 transition-colors italic">
                                                    {field.label}
                                                </span>
                                            </div>
                                        ) : (
                                            <input
                                                className="flex h-16 w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-8 py-2 text-base font-black text-slate-950 placeholder:text-slate-200 focus:ring-[16px] focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner tracking-tight"
                                                type={field.type || "text"}
                                                value={formData[field.key] || ""}
                                                onChange={e => setFormData({ ...formData, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value })}
                                                required={field.required}
                                                placeholder={field.ph || "REQUIRED_DATA_INPUT"}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-slate-50/30 p-12 border-t border-slate-100 flex justify-end gap-6 relative">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="h-16 px-12 rounded-2xl font-black text-slate-400 hover:text-rose-600 tracking-[0.3em] uppercase text-[10px] italic transition-all active:scale-90"
                        >
                            DISCARD_MANIFESTO
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-16 px-16 rounded-[24px] bg-blue-600 hover:bg-black text-white font-black shadow-2xl shadow-blue-600/30 transition-all gap-4 uppercase text-[11px] tracking-[0.4em] italic active:scale-95"
                        >
                            {loading ? "INITIALIZING_SYNC..." : "COMMIT_CHANGES"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

