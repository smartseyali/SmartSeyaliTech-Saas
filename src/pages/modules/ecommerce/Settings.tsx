import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { Settings as SettingsIcon, Save, Palette, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const inputCls = "w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 outline-none transition-all";

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            </div>
            {children}
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-0.5">{label}</label>
            {children}
        </div>
    );
}

export default function Settings() {
    const { activeCompany } = useTenant();
    const { settings, loading, refreshSettings } = useStoreSettings();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (settings) setFormData(settings);
    }, [settings]);

    const handleSave = async () => {
        if (!activeCompany) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from("ecom_settings")
                .upsert({ ...formData, company_id: activeCompany.id, updated_at: new Date().toISOString() });
            if (error) throw error;
            toast.success("Settings updated successfully");
            refreshSettings();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const set = (k: string, v: any) => setFormData((f: any) => ({ ...f, [k]: v }));

    if (loading) return (
        <div className="p-8 flex items-center justify-center h-[400px] gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 opacity-40" />
            <span className="text-sm text-slate-400">Loading settings...</span>
        </div>
    );

    return (
        <div className="p-8 pb-20 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">System Configuration</p>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store Settings</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your storefront configuration and preferences.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 gap-2 active:scale-95">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Section icon={Palette} title="Visual Identity">
                    <Field label="Primary Brand Color">
                        <div className="flex gap-3">
                            <input type="color" value={formData.primary_color || "#2563eb"}
                                onChange={e => set("primary_color", e.target.value)}
                                className="h-11 w-16 p-1 rounded-xl border border-slate-200 cursor-pointer" />
                            <input value={formData.primary_color || "#2563eb"}
                                onChange={e => set("primary_color", e.target.value)}
                                className={inputCls} placeholder="#2563eb" />
                        </div>
                    </Field>
                    <Field label="Store Name">
                        <input value={formData.store_name || ""} onChange={e => set("store_name", e.target.value)}
                            className={inputCls} placeholder="Your Store Name" />
                    </Field>
                    <Field label="Store Tagline">
                        <input value={formData.tagline || ""} onChange={e => set("tagline", e.target.value)}
                            className={inputCls} placeholder="Quality you can trust" />
                    </Field>
                </Section>

                <Section icon={MessageCircle} title="Contact & Support">
                    <Field label="WhatsApp Number">
                        <input value={formData.whatsapp_number || ""} onChange={e => set("whatsapp_number", e.target.value)}
                            className={inputCls} placeholder="91 9000000000" />
                    </Field>
                    <Field label="Support Email">
                        <input value={formData.contact_email || ""} onChange={e => set("contact_email", e.target.value)}
                            className={inputCls} placeholder="hello@your-store.com" />
                    </Field>
                    <Field label="Support Phone">
                        <input value={formData.support_phone || ""} onChange={e => set("support_phone", e.target.value)}
                            className={inputCls} placeholder="+91 98765 43210" />
                    </Field>
                </Section>

                <Section icon={SettingsIcon} title="General Preferences">
                    <Field label="Currency">
                        <select value={formData.currency || "INR"} onChange={e => set("currency", e.target.value)}
                            className={inputCls}>
                            <option value="INR">INR — Indian Rupee (₹)</option>
                            <option value="USD">USD — US Dollar ($)</option>
                            <option value="EUR">EUR — Euro (€)</option>
                        </select>
                    </Field>
                    <Field label="GST Number">
                        <input value={formData.gst_number || ""} onChange={e => set("gst_number", e.target.value)}
                            className={inputCls} placeholder="22AAAAA0000A1Z5" />
                    </Field>
                </Section>

                <Section icon={Save} title="SEO & Meta">
                    <Field label="Meta Title">
                        <input value={formData.meta_title || ""} onChange={e => set("meta_title", e.target.value)}
                            className={inputCls} placeholder="Store Meta Title" />
                    </Field>
                    <Field label="Meta Description">
                        <textarea value={formData.meta_description || ""} onChange={e => set("meta_description", e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 outline-none transition-all resize-none h-24"
                            placeholder="Brief description for search engines..." />
                    </Field>
                </Section>
            </div>
        </div>
    );
}
