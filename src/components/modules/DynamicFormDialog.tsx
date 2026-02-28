import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
            <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                <div className="bg-primary/5 p-6 border-b border-primary/10">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold tracking-tight">{title}</DialogTitle>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                            {fields.map(field => {
                                const isFullWidth = field.type === "textarea" || field.type === "image" || field.type === "video";

                                return (
                                    <div
                                        key={field.key}
                                        className={`${isFullWidth ? "sm:col-span-2" : ""} space-y-1.5`}
                                    >
                                        {field.type !== "image" && field.type !== "video" && (
                                            <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-0.5">
                                                {field.label} {field.required && <span className="text-destructive">*</span>}
                                            </Label>
                                        )}

                                        {field.type === "image" || field.type === "video" ? (
                                            <MediaUpload
                                                type={field.type}
                                                value={formData[field.key] || ""}
                                                onChange={val => setFormData({ ...formData, [field.key]: val })}
                                                label={field.label}
                                                bucket={field.bucket}
                                                folder={field.folder}
                                                accept={field.type === "image" ? "image/*" : "video/*"}
                                            />
                                        ) : field.type === "textarea" ? (
                                            <textarea
                                                className="flex min-h-[120px] w-full rounded-2xl border border-input bg-secondary/20 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-primary/30"
                                                value={formData[field.key] || ""}
                                                onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                                required={field.required}
                                                placeholder={field.ph}
                                            />
                                        ) : field.type === "select" ? (
                                            <div className="relative group">
                                                <select
                                                    className="flex h-11 w-full items-center justify-between rounded-2xl border border-input bg-secondary/20 px-4 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-primary/30 appearance-none pointer-events-auto"
                                                    value={formData[field.key] || ""}
                                                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                                    required={field.required}
                                                >
                                                    <option value="">Select...</option>
                                                    {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground opacity-40">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6" /></svg>
                                                </div>
                                            </div>
                                        ) : field.type === "checkbox" ? (
                                            <div className="flex items-center space-x-2 pt-2">
                                                <input
                                                    type="checkbox"
                                                    id={field.key}
                                                    className="w-5 h-5 rounded-lg border-primary accent-primary"
                                                    checked={!!formData[field.key]}
                                                    onChange={e => setFormData({ ...formData, [field.key]: e.target.checked })}
                                                />
                                                <label htmlFor={field.key} className="text-sm font-medium leading-none cursor-pointer">
                                                    {field.label}
                                                </label>
                                            </div>
                                        ) : (
                                            <Input
                                                className="rounded-2xl h-11 bg-secondary/20 border-input focus-visible:ring-primary/20 focus-visible:ring-offset-0 transition-all hover:border-primary/30"
                                                type={field.type || "text"}
                                                value={formData[field.key] || ""}
                                                onChange={e => setFormData({ ...formData, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value })}
                                                required={field.required}
                                                placeholder={field.ph}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-secondary/30 p-4 border-t border-border flex justify-end gap-3 mt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl px-6 hover:bg-secondary/50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl px-8 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Saving...
                                </span>
                            ) : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

