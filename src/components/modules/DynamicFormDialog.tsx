import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, Save, Loader2 } from "lucide-react";

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
            <DialogContent className="sm:max-w-[720px] p-0 overflow-hidden border border-slate-200 shadow-2xl rounded-2xl">
                {/* Header */}
                <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Form</p>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Body */}
                    <div className="p-7 max-h-[62vh] overflow-y-auto space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {fields.map(field => {
                                const isFullWidth = field.type === "textarea" || field.type === "image" || field.type === "video";

                                return (
                                    <div key={field.key} className={cn(isFullWidth ? "sm:col-span-2" : "", "space-y-2")}>
                                        {field.type !== "image" && field.type !== "video" && field.type !== "checkbox" && (
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-0.5">
                                                {field.label} {field.required && <span className="text-rose-500">*</span>}
                                            </label>
                                        )}

                                        {field.type === "image" || field.type === "video" ? (
                                            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2">
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
                                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-blue-500/8 focus:border-blue-500 outline-none transition-all resize-none min-h-[110px]"
                                                value={formData[field.key] || ""}
                                                onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                                required={field.required}
                                                placeholder={field.ph || "Enter details..."}
                                            />
                                        ) : field.type === "select" ? (
                                            <div className="relative">
                                                <select
                                                    className={inputCls + " appearance-none pr-8 cursor-pointer"}
                                                    value={formData[field.key] || ""}
                                                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                                    required={field.required}
                                                >
                                                    <option value="" disabled>Select an option...</option>
                                                    {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                </div>
                                            </div>
                                        ) : field.type === "checkbox" ? (
                                            <div
                                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-white hover:border-blue-300 transition-all"
                                                onClick={() => setFormData({ ...formData, [field.key]: !formData[field.key] })}
                                            >
                                                <button
                                                    type="button"
                                                    className={cn("relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0", formData[field.key] ? "bg-blue-600" : "bg-slate-200")}
                                                >
                                                    <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200", formData[field.key] ? "translate-x-4" : "")} />
                                                </button>
                                                <span className="text-sm font-semibold text-slate-700">{field.label}</span>
                                            </div>
                                        ) : (
                                            <input
                                                className={inputCls}
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

                    {/* Footer */}
                    <div className="px-7 py-5 border-t border-slate-100 bg-slate-50/60 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="h-10 px-5 rounded-xl font-semibold text-slate-500 hover:text-slate-800 hover:bg-white transition-all"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 transition-all gap-2 active:scale-95"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
