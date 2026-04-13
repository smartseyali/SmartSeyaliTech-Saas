import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  CreditCard,
  Save,
  Eye,
  EyeOff,
  Shield,
  Zap,
  IndianRupee,
  ToggleLeft,
  ToggleRight,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformSettings {
  razorpay_key_id: string;
  razorpay_key_secret: string;
  razorpay_test_mode: boolean;
  billing_mode: "monthly" | "yearly" | "both";
  currency: string;
  currency_symbol: string;
}

const DEFAULTS: PlatformSettings = {
  razorpay_key_id: "",
  razorpay_key_secret: "",
  razorpay_test_mode: true,
  billing_mode: "both",
  currency: "INR",
  currency_symbol: "₹",
};

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedSettings, setSavedSettings] = useState<PlatformSettings>(DEFAULTS);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const loaded: PlatformSettings = {
          razorpay_key_id: data.razorpay_key_id || "",
          razorpay_key_secret: data.razorpay_key_secret || "",
          razorpay_test_mode: data.razorpay_test_mode ?? true,
          billing_mode: data.billing_mode || "both",
          currency: data.currency || "INR",
          currency_symbol: data.currency_symbol || "₹",
        };
        setSettings(loaded);
        setSavedSettings(loaded);
      }
    } catch (err: any) {
      console.error("Failed to load platform settings:", err);
      toast.error("Failed to load settings. Make sure the platform_settings table exists.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      setHasChanges(JSON.stringify(next) !== JSON.stringify(savedSettings));
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("platform_settings")
        .upsert({
          id: 1,
          ...settings,
          updated_at: new Date().toISOString(),
          updated_by: user?.id || null,
        });

      if (error) throw error;

      setSavedSettings({ ...settings });
      setHasChanges(false);
      toast.success("Platform settings saved successfully!");
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  const isRazorpayConfigured = settings.razorpay_key_id && settings.razorpay_key_secret;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Platform Settings</h1>
              <p className="text-sm text-gray-500 mt-1">Configure payment gateway and billing for module purchases</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                hasChanges
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* ── Razorpay Configuration ──────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Razorpay Configuration</h2>
                <p className="text-xs text-gray-500">Payment gateway for module purchases</p>
              </div>
            </div>
            {isRazorpayConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                <CheckCircle className="w-3.5 h-3.5" /> Configured
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5" /> Not Configured
              </span>
            )}
          </div>

          <div className="p-6 space-y-5">
            {/* Test Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Test Mode</p>
                  <p className="text-xs text-gray-500">
                    {settings.razorpay_test_mode
                      ? "Using test keys — no real charges"
                      : "Live mode — real payments will be processed"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateField("razorpay_test_mode", !settings.razorpay_test_mode)}
                className="shrink-0"
              >
                {settings.razorpay_test_mode ? (
                  <ToggleRight className="w-10 h-10 text-blue-600" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-300" />
                )}
              </button>
            </div>

            {/* Key ID */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">
                Razorpay Key ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={settings.razorpay_key_id}
                onChange={(e) => updateField("razorpay_key_id", e.target.value)}
                placeholder={settings.razorpay_test_mode ? "rzp_test_..." : "rzp_live_..."}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-mono"
              />
            </div>

            {/* Key Secret */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">
                Razorpay Key Secret <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={settings.razorpay_key_secret}
                  onChange={(e) => updateField("razorpay_key_secret", e.target.value)}
                  placeholder="Enter your Razorpay key secret"
                  className="w-full h-11 px-4 pr-12 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Billing Configuration ───────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Billing & Pricing</h2>
                <p className="text-xs text-gray-500">Configure how module pricing is displayed to users</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Billing Mode */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">Billing Period Display</label>
              <p className="text-xs text-gray-500 mb-3">Choose which pricing options users see in the Marketplace</p>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: "monthly", label: "Monthly Only", desc: "Show /month pricing" },
                  { value: "yearly", label: "Yearly Only", desc: "Show /year pricing" },
                  { value: "both", label: "Both (Toggle)", desc: "Users can switch" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateField("billing_mode", opt.value)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all",
                      settings.billing_mode === opt.value
                        ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-200"
                        : "border-gray-100 hover:border-gray-200 bg-white"
                    )}
                  >
                    <p className={cn(
                      "text-sm font-semibold",
                      settings.billing_mode === opt.value ? "text-blue-700" : "text-gray-900"
                    )}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Currency Code</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={settings.currency}
                    onChange={(e) => updateField("currency", e.target.value.toUpperCase())}
                    placeholder="INR"
                    maxLength={5}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Currency Symbol</label>
                <input
                  type="text"
                  value={settings.currency_symbol}
                  onChange={(e) => updateField("currency_symbol", e.target.value)}
                  placeholder="₹"
                  maxLength={3}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info footer */}
        <div className="text-center pb-8">
          <p className="text-xs text-gray-400">
            Module pricing is managed in{" "}
            <a href="/super-admin/modules" className="text-blue-500 hover:underline font-medium">
              Marketplace Modules
            </a>
            {" "}(price_monthly & price_yearly per module).
          </p>
        </div>
      </div>
    </div>
  );
}
