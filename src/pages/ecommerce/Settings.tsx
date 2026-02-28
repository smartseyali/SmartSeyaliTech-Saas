import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { Settings as SettingsIcon, Save, Globe, Palette, MessageCircle, Mail, Phone, MapPin, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
                .upsert({
                    ...formData,
                    company_id: activeCompany.id,
                    updated_at: new Date().toISOString()
                });
            if (error) throw error;
            toast.success("Settings updated successfully");
            refreshSettings();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 animate-pulse text-slate-300">Synchronizing system parameters...</div>;

    return (
        <div className="p-8 space-y-12 w-full">
            <div className="flex justify-between items-end border-b border-slate-100 pb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <SettingsIcon className="w-6 h-6 text-[#f97316]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#14532d]/40">System Configuration</span>
                    </div>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase text-[#14532d]">Global <br /><span className="text-slate-200">Settings</span></h1>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-16 px-10 rounded-2xl bg-[#14532d] hover:bg-[#14532d]/90 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-[#14532d]/20"
                >
                    <Save className="w-4 h-4 mr-3" /> {saving ? "Saving..." : "Commit Changes"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8 bg-white p-10 rounded-[48px] border border-slate-50 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#14532d] flex items-center gap-3 border-b border-slate-50 pb-6 mb-4">
                        <Palette className="w-4 h-4 text-[#f97316]" /> Visual Identity
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Brand Color</label>
                            <div className="flex gap-4">
                                <Input
                                    type="color"
                                    value={formData.primary_color || "#14532d"}
                                    onChange={e => setFormData({ ...formData, primary_color: e.target.value })}
                                    className="h-14 w-20 p-1 rounded-xl"
                                />
                                <Input
                                    value={formData.primary_color || "#14532d"}
                                    onChange={e => setFormData({ ...formData, primary_color: e.target.value })}
                                    className="h-14 rounded-xl font-mono"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Store Name</label>
                            <Input
                                value={formData.store_name || ""}
                                onChange={e => setFormData({ ...formData, store_name: e.target.value })}
                                className="h-14 rounded-xl"
                                placeholder="Your Organic Brand"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-8 bg-white p-10 rounded-[48px] border border-slate-50 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#14532d] flex items-center gap-3 border-b border-slate-50 pb-6 mb-4">
                        <MessageCircle className="w-4 h-4 text-[#f97316]" /> Comms & Support
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">WhatsApp Number</label>
                            <Input
                                value={formData.whatsapp_number || ""}
                                onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value })}
                                className="h-14 rounded-xl"
                                placeholder="e.g. 919000000000"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Support Email</label>
                            <Input
                                value={formData.contact_email || ""}
                                onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                                className="h-14 rounded-xl"
                                placeholder="hello@organic.com"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
