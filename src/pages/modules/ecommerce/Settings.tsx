import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import {
  Settings as SettingsIcon, Save, Palette, MessageCircle, Loader2,
  ShoppingBag, RotateCcw, Mail, Building2, Image, Globe, Hash,
  FileText, Truck, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const inputCls = "w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 outline-none transition-all";
const textareaCls = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 outline-none transition-all resize-none";

function Section({ icon: Icon, title, description, children }: { icon: any; title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
      <div className="pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        </div>
        {description && <p className="text-xs text-slate-400 mt-2 ml-12">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-500 tracking-widest ml-0.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-1 ml-0.5">{hint}</p>}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">{children}</div>;
}

export default function Settings() {
  const { activeCompany } = useTenant();
  const { settings, loading, refreshSettings } = useStoreSettings();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [companyData, setCompanyData] = useState<any>({});

  // Load ecom_settings
  useEffect(() => {
    if (settings) setFormData(settings);
  }, [settings]);

  // Load company details
  useEffect(() => {
    if (!activeCompany) return;
    supabase
      .from("companies")
      .select("*")
      .eq("id", activeCompany.id)
      .single()
      .then(({ data }) => {
        if (data) setCompanyData(data);
      });
  }, [activeCompany?.id]);

  const handleSave = async () => {
    if (!activeCompany) return;
    setSaving(true);
    try {
      // Save ecom_settings
      const { error: settingsErr } = await supabase
        .from("ecom_settings")
        .upsert({ ...formData, company_id: activeCompany.id, updated_at: new Date().toISOString() });
      if (settingsErr) throw settingsErr;

      // Save company details
      const { error: companyErr } = await supabase
        .from("companies")
        .update({
          name: companyData.name,
          contact_email: companyData.contact_email,
          contact_phone: companyData.contact_phone,
          address: companyData.address,
          city: companyData.city,
          state: companyData.state,
          country: companyData.country,
          pincode: companyData.pincode,
          gst_no: companyData.gst_no,
          logo_url: companyData.logo_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeCompany.id);
      if (companyErr) throw companyErr;

      toast.success("All settings saved successfully");
      refreshSettings();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (k: string, v: any) => setFormData((f: any) => ({ ...f, [k]: v }));
  const setC = (k: string, v: any) => setCompanyData((f: any) => ({ ...f, [k]: v }));

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-[400px] gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600 opacity-40" />
      <span className="text-sm text-slate-500">Loading settings...</span>
    </div>
  );

  return (
    <div className="p-8 pb-20 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
        <div>
          <p className="text-xs font-bold tracking-widest text-slate-500 mb-1">System Configuration</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store & Company Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your company details, storefront, orders, and print configuration.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 gap-2 active:scale-95">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Company Details ──────────────────────────────── */}
        <Section icon={Building2} title="Company Details" description="Legal business information used on invoices and print formats.">
          <Field label="Company Name">
            <input value={companyData.name || ""} onChange={e => setC("name", e.target.value)}
              className={inputCls} placeholder="Your Company Pvt Ltd" />
          </Field>
          <Row>
            <Field label="Contact Email">
              <input value={companyData.contact_email || ""} onChange={e => setC("contact_email", e.target.value)}
                className={inputCls} placeholder="info@company.com" type="email" />
            </Field>
            <Field label="Contact Phone">
              <input value={companyData.contact_phone || ""} onChange={e => setC("contact_phone", e.target.value)}
                className={inputCls} placeholder="+91 98765 43210" />
            </Field>
          </Row>
          <Field label="Address">
            <textarea value={companyData.address || ""} onChange={e => setC("address", e.target.value)}
              className={`${textareaCls} h-20`} placeholder="Building, Street, Area" />
          </Field>
          <Row>
            <Field label="City">
              <input value={companyData.city || ""} onChange={e => setC("city", e.target.value)}
                className={inputCls} placeholder="Tiruppur" />
            </Field>
            <Field label="State">
              <input value={companyData.state || ""} onChange={e => setC("state", e.target.value)}
                className={inputCls} placeholder="Tamil Nadu" />
            </Field>
          </Row>
          <Row>
            <Field label="Pincode">
              <input value={companyData.pincode || ""} onChange={e => setC("pincode", e.target.value)}
                className={inputCls} placeholder="641601" />
            </Field>
            <Field label="Country">
              <input value={companyData.country || ""} onChange={e => setC("country", e.target.value)}
                className={inputCls} placeholder="India" />
            </Field>
          </Row>
          <Row>
            <Field label="GSTIN" hint="Goods & Services Tax Identification Number">
              <input value={companyData.gst_no || ""} onChange={e => setC("gst_no", e.target.value)}
                className={inputCls} placeholder="22AAAAA0000A1Z5" />
            </Field>
            <Field label="Company Logo URL" hint="Used on invoices and print formats">
              <input value={companyData.logo_url || ""} onChange={e => setC("logo_url", e.target.value)}
                className={inputCls} placeholder="https://..." />
            </Field>
          </Row>
        </Section>

        {/* ── Store Branding ──────────────────────────────── */}
        <Section icon={Palette} title="Store Branding" description="Visual identity for your storefront.">
          <Field label="Store Name">
            <input value={formData.store_name || ""} onChange={e => set("store_name", e.target.value)}
              className={inputCls} placeholder="Your Store Name" />
          </Field>
          <Field label="Store Tagline">
            <input value={formData.store_tagline || ""} onChange={e => set("store_tagline", e.target.value)}
              className={inputCls} placeholder="Quality you can trust" />
          </Field>
          <Row>
            <Field label="Primary Color">
              <div className="flex gap-3">
                <input type="color" value={formData.primary_color || "#2563eb"}
                  onChange={e => set("primary_color", e.target.value)}
                  className="h-11 w-16 p-1 rounded-xl border border-slate-200 cursor-pointer" />
                <input value={formData.primary_color || "#2563eb"}
                  onChange={e => set("primary_color", e.target.value)}
                  className={inputCls} placeholder="#2563eb" />
              </div>
            </Field>
            <Field label="Secondary Color">
              <div className="flex gap-3">
                <input type="color" value={formData.secondary_color || "#1e293b"}
                  onChange={e => set("secondary_color", e.target.value)}
                  className="h-11 w-16 p-1 rounded-xl border border-slate-200 cursor-pointer" />
                <input value={formData.secondary_color || "#1e293b"}
                  onChange={e => set("secondary_color", e.target.value)}
                  className={inputCls} placeholder="#1e293b" />
              </div>
            </Field>
          </Row>
          <Row>
            <Field label="Store Logo URL">
              <input value={formData.logo_url || ""} onChange={e => set("logo_url", e.target.value)}
                className={inputCls} placeholder="https://your-logo.png" />
            </Field>
            <Field label="Favicon URL">
              <input value={formData.favicon_url || ""} onChange={e => set("favicon_url", e.target.value)}
                className={inputCls} placeholder="https://your-favicon.ico" />
            </Field>
          </Row>
          <Field label="Footer Text">
            <input value={formData.footer_text || ""} onChange={e => set("footer_text", e.target.value)}
              className={inputCls} placeholder="© 2025 Your Store. All rights reserved." />
          </Field>
        </Section>

        {/* ── Contact & Support ────────────────────────────── */}
        <Section icon={MessageCircle} title="Contact & Support">
          <Row>
            <Field label="Support Email">
              <input value={formData.contact_email || ""} onChange={e => set("contact_email", e.target.value)}
                className={inputCls} placeholder="support@store.com" type="email" />
            </Field>
            <Field label="Support Phone">
              <input value={formData.support_phone || ""} onChange={e => set("support_phone", e.target.value)}
                className={inputCls} placeholder="+91 98765 43210" />
            </Field>
          </Row>
          <Field label="WhatsApp Number">
            <input value={formData.whatsapp_number || ""} onChange={e => set("whatsapp_number", e.target.value)}
              className={inputCls} placeholder="91 9000000000" />
          </Field>
          <Field label="Store Address">
            <textarea value={formData.address || ""} onChange={e => set("address", e.target.value)}
              className={`${textareaCls} h-20`} placeholder="Storefront physical address" />
          </Field>
        </Section>

        {/* ── Social Media ─────────────────────────────────── */}
        <Section icon={Globe} title="Social Media Links">
          <Field label="Facebook URL">
            <input value={formData.facebook_url || ""} onChange={e => set("facebook_url", e.target.value)}
              className={inputCls} placeholder="https://facebook.com/yourstore" />
          </Field>
          <Field label="Instagram URL">
            <input value={formData.instagram_url || ""} onChange={e => set("instagram_url", e.target.value)}
              className={inputCls} placeholder="https://instagram.com/yourstore" />
          </Field>
          <Field label="Twitter / X URL">
            <input value={formData.twitter_url || ""} onChange={e => set("twitter_url", e.target.value)}
              className={inputCls} placeholder="https://x.com/yourstore" />
          </Field>
          <Field label="Storefront URL" hint="Your live storefront domain">
            <input value={formData.storefront_url || ""} onChange={e => set("storefront_url", e.target.value)}
              className={inputCls} placeholder="https://yourstore.com" />
          </Field>
        </Section>

        {/* ── Order Configuration ──────────────────────────── */}
        <Section icon={ShoppingBag} title="Order Configuration">
          <Row>
            <Field label="Order Prefix" hint={`Orders: ${formData.order_prefix || "ORD"}-${formData.next_order_number || 1001}`}>
              <input value={formData.order_prefix || "ORD"} onChange={e => set("order_prefix", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                className={inputCls} placeholder="ORD" maxLength={10} />
            </Field>
            <Field label="Next Order Number">
              <input type="number" value={formData.next_order_number || 1001} onChange={e => set("next_order_number", parseInt(e.target.value) || 1001)}
                className={inputCls} min={1} />
            </Field>
          </Row>
          <Row>
            <Field label="Currency">
              <select value={formData.currency || "INR"} onChange={e => set("currency", e.target.value)} className={inputCls}>
                <option value="INR">INR — Indian Rupee (₹)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="EUR">EUR — Euro (€)</option>
              </select>
            </Field>
            <Field label="Tax Rate (%)" hint="Default GST rate applied to orders">
              <input type="number" value={formData.tax_rate || 0} onChange={e => set("tax_rate", parseFloat(e.target.value) || 0)}
                className={inputCls} placeholder="18" step="0.01" min={0} max={100} />
            </Field>
          </Row>
          <Row>
            <Field label="GST Number (Store)">
              <input value={formData.gst_number || ""} onChange={e => set("gst_number", e.target.value)}
                className={inputCls} placeholder="22AAAAA0000A1Z5" />
            </Field>
            <Field label="Auto-confirm Paid Orders">
              <label className="flex items-center gap-3 cursor-pointer h-11 px-4 rounded-xl border border-slate-200 bg-white">
                <input type="checkbox" checked={formData.auto_confirm_paid_orders !== false}
                  onChange={e => set("auto_confirm_paid_orders", e.target.checked)}
                  className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-slate-600">Auto-confirm when paid</span>
              </label>
            </Field>
          </Row>
        </Section>

        {/* ── Return Policy ────────────────────────────────── */}
        <Section icon={RotateCcw} title="Return & Refund Policy">
          <Field label="Return Policy" hint="Displayed to customers on the storefront">
            <textarea value={formData.return_policy || ""} onChange={e => set("return_policy", e.target.value)}
              className={`${textareaCls} h-32`} placeholder="Describe your return and refund policy..." />
          </Field>
        </Section>

        {/* ── Email / SMTP ─────────────────────────────────── */}
        <Section icon={Mail} title="Email / SMTP" description="SMTP config for customer verification & order emails. Use a Google App Password.">
          <Row>
            <Field label="SMTP Host">
              <input value={formData.smtp_host || "smtp.gmail.com"} onChange={e => set("smtp_host", e.target.value)}
                className={inputCls} placeholder="smtp.gmail.com" />
            </Field>
            <Field label="SMTP Port">
              <input type="number" value={formData.smtp_port || 587} onChange={e => set("smtp_port", parseInt(e.target.value) || 587)}
                className={inputCls} placeholder="587" />
            </Field>
          </Row>
          <Row>
            <Field label="Gmail Address">
              <input value={formData.smtp_user || ""} onChange={e => set("smtp_user", e.target.value)}
                className={inputCls} placeholder="yourstore@gmail.com" type="email" />
            </Field>
            <Field label="App Password">
              <input value={formData.smtp_pass || ""} onChange={e => set("smtp_pass", e.target.value)}
                className={inputCls} placeholder="xxxx xxxx xxxx xxxx" type="password" />
            </Field>
          </Row>
          <Row>
            <Field label="Sender Name">
              <input value={formData.smtp_from_name || ""} onChange={e => set("smtp_from_name", e.target.value)}
                className={inputCls} placeholder="Your Store Name" />
            </Field>
            <Field label="Sender Email">
              <input value={formData.smtp_from_email || ""} onChange={e => set("smtp_from_email", e.target.value)}
                className={inputCls} placeholder="noreply@yourstore.com" type="email" />
            </Field>
          </Row>
        </Section>

        {/* ── SEO & Meta ───────────────────────────────────── */}
        <Section icon={Search} title="SEO & Meta Tags" description="Optimize your storefront for search engines.">
          <Field label="Meta Title">
            <input value={formData.meta_title || ""} onChange={e => set("meta_title", e.target.value)}
              className={inputCls} placeholder="Store Meta Title" />
          </Field>
          <Field label="Meta Description">
            <textarea value={formData.meta_description || ""} onChange={e => set("meta_description", e.target.value)}
              className={`${textareaCls} h-24`} placeholder="Brief description for search engines..." />
          </Field>
        </Section>
      </div>
    </div>
  );
}
