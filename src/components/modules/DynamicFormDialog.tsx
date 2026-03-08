import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Save, Loader2, Info } from "lucide-react";
import { MediaUpload } from "@/components/common/MediaUpload";

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

const inputStyle = "w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm";
const labelStyle = "text-sm font-semibold text-slate-700 mb-1.5 block";

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
            <DialogContent
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                className="sm:max-w-[700px] p-0 overflow-hidden bg-white border-slate-200 shadow-2xl rounded-2xl"
            >
                <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/80">
                    <DialogTitle className="text-xl font-bold text-slate-800">{title}</DialogTitle>
                    <DialogDescription className="text-slate-500 mt-1">
                        Please fill in the required details below
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col max-h-[75vh]">
                    <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                            {/* Hidden Id hint if editing */}
                            {initialData?.id && (
                                <div className="sm:col-span-2 flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium border border-blue-100">
                                    <Info className="w-4 h-4 text-blue-500" />
                                    Editing existing record (ID: {initialData.id})
                                </div>
                            )}

                            {fields.map(field => {
                                const isFullWidth = field.type === "textarea" || field.type === "image" || field.type === "video";

                                return (
                                    <div key={field.key} className={cn(isFullWidth ? "sm:col-span-2" : "", "space-y-1")}>
                                        {field.type !== "checkbox" && (
                                            <label className={labelStyle}>
                                                {field.label} {field.required && <span className="text-red-500 ml-0.5">*</span>}
                                            </label>
                                        )}

                                        {field.type === "image" || field.type === "video" ? (
                                            <MediaUpload
                                                type={field.type}
                                                value={formData[field.key] || ""}
                                                onChange={val => setFormData({ ...formData, [field.key]: val })}
                                                bucket={field.bucket}
                                                folder={field.folder}
                                                accept={field.type === "image" ? "image/*" : "video/*"}
                                            />
                                        ) : field.type === "textarea" ? (
                                            <textarea
                                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none min-h-[120px] shadow-sm"
                                                value={formData[field.key] || ""}
                                                onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                                required={field.required}
                                                placeholder={field.ph || "Enter details..."}
                                            />
                                        ) : field.type === "select" ? (
                                            <div className="relative">
                                                <select
                                                    className={cn(inputStyle, "appearance-none pr-10 cursor-pointer")}
                                                    value={formData[field.key] || ""}
                                                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                                    required={field.required}
                                                >
                                                    <option value="" disabled>Select an option...</option>
                                                    {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                </select>
                                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                </div>
                                            </div>
                                        ) : field.type === "checkbox" ? (
                                            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded-[6px] border-slate-300 text-blue-600 focus:ring-blue-500/20 transition-all"
                                                    checked={!!formData[field.key]}
                                                    onChange={e => setFormData({ ...formData, [field.key]: e.target.checked })}
                                                />
                                                <span className="text-sm font-semibold text-slate-700">{field.label}</span>
                                            </label>
                                        ) : (
                                            <input
                                                className={inputStyle}
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

                    <DialogFooter className="px-6 py-5 border-t border-slate-100 bg-white gap-3 sm:gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="px-6 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl hidden sm:flex"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all gap-2 w-full sm:w-auto"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
