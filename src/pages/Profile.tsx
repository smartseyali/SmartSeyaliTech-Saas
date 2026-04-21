import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useTenant } from "@/contexts/TenantContext";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  User, Mail, Phone, Shield, Lock, Palette, Languages,
  Save, Loader2, Eye, EyeOff, Check, LogOut,
  Monitor, Moon, Sun, Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * ERPNext v16-style user profile — identity card + tabs for
 * About / Security / Preferences.
 */
export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isSuperAdmin, isAdmin } = usePermissions();
  const { activeCompany } = useTenant();
  const { theme, setTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Profile fields (from public.users + auth metadata)
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [joinedAt, setJoinedAt] = useState<string | null>(null);

  // Password change fields
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Preferences
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("users")
          .select("username, full_name, avatar_url, created_at")
          .eq("id", user.id)
          .maybeSingle();

        setFullName(data?.full_name || user.user_metadata?.full_name || "");
        setUsername(data?.username || user.email || "");
        setAvatarUrl(data?.avatar_url || user.user_metadata?.avatar_url || "");
        setJoinedAt(data?.created_at || user.created_at || null);
        setPhone(user.user_metadata?.phone || user.phone || "");
        setLanguage(user.user_metadata?.language || "en");
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  if (loading || !user) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  const userEmail = user.email || "";
  const userInitial = (fullName || userEmail).charAt(0).toUpperCase();
  const roleLabel = isSuperAdmin ? "Super Admin" : isAdmin ? "Admin" : "Member";
  const roleTone = isSuperAdmin
    ? "bg-destructive-100 text-destructive-700"
    : isAdmin
    ? "bg-primary-100 text-primary-700"
    : "bg-gray-100 text-gray-600";

  // ── Save profile ────────────────────────────────────────────
  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: fullName.trim() || null,
          avatar_url: avatarUrl.trim() || null,
        })
        .eq("id", user.id);
      if (error) throw error;

      await supabase.auth.updateUser({
        data: { full_name: fullName.trim(), phone: phone.trim(), avatar_url: avatarUrl.trim() },
      });

      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Change password ────────────────────────────────────────
  const changePassword = async () => {
    if (newPw.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      const { error: reauthErr } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPw,
      });
      if (reauthErr) throw new Error("Current password is incorrect");

      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;

      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      toast.success("Password changed successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  // ── Save preferences ───────────────────────────────────────
  const savePreferences = async () => {
    try {
      await supabase.auth.updateUser({ data: { language } });
      toast.success("Preferences saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save preferences");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-full bg-background">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-30 bg-card border-b border-gray-200 dark:border-border">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-semibold text-gray-900 dark:text-foreground">My Profile</h1>
            <p className="text-xs text-gray-500">Manage your account, security, and preferences</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:bg-destructive-100 hover:text-destructive">
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5 space-y-4">
        {/* Identity card */}
        <div className="bg-card rounded-lg border border-gray-200 p-5 dark:border-border">
          <div className="flex flex-wrap items-start gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-md bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-semibold overflow-hidden border border-primary-200">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName || userEmail} className="w-full h-full object-cover" />
                ) : (
                  userInitial
                )}
              </div>
              <label
                htmlFor="avatar-url-input"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:border-border dark:hover:bg-accent"
                title="Change avatar"
              >
                <Camera className="w-3 h-3 text-gray-600" />
              </label>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground">
                  {fullName || userEmail.split("@")[0]}
                </h2>
                <span className={cn("erp-pill", roleTone)}>{roleLabel}</span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {userEmail}
              </p>
              {activeCompany && !isSuperAdmin && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                  <Shield className="w-3 h-3" /> {activeCompany.name}
                </p>
              )}
              {joinedAt && (
                <p className="text-[11px] text-gray-400 mt-1">
                  Joined {new Date(joinedAt).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tabbed content */}
        <div className="bg-card rounded-lg border border-gray-200 overflow-hidden dark:border-border">
          <Tabs defaultValue="about" className="w-full">
            <div className="px-4 pt-2">
              <TabsList>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>
            </div>

            {/* ── About ── */}
            <TabsContent value="about" className="mt-0 p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Field label="Full Name" icon={<User className="w-3 h-3" />}>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
                </Field>

                <Field label="Username / Login Email" icon={<Mail className="w-3 h-3" />}>
                  <Input value={username} disabled placeholder="email@company.com" />
                </Field>

                <Field label="Phone" icon={<Phone className="w-3 h-3" />}>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" type="tel" />
                </Field>

                <Field label="Avatar URL" icon={<Camera className="w-3 h-3" />}>
                  <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…/avatar.jpg" />
                </Field>
              </div>

              <div className="flex justify-end pt-1 border-t border-gray-100 dark:border-border">
                <Button onClick={saveProfile} disabled={savingProfile} size="sm">
                  {savingProfile ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
                </Button>
              </div>
            </TabsContent>

            {/* ── Security ── */}
            <TabsContent value="security" className="mt-0 p-5 space-y-4">
              <div className="bg-primary-50 border border-primary-100 rounded-md px-3 py-2 flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-primary-700 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-primary-700">Password change</p>
                  <p className="text-[11px] text-primary-700/80">
                    You'll be asked to re-enter your current password to confirm this action.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 max-w-2xl">
                <Field label="Current Password">
                  <div className="relative">
                    <Input
                      type={showPw ? "text" : "password"}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      placeholder="••••••••"
                      className="pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                      title="Toggle password visibility"
                    >
                      {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </Field>

                <div /> {/* spacer */}

                <Field label="New Password">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="At least 6 characters"
                  />
                </Field>

                <Field label="Confirm New Password">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Retype password"
                  />
                  {confirmPw && newPw && confirmPw === newPw && (
                    <p className="text-[11px] text-success-700 mt-1 inline-flex items-center gap-1">
                      <Check className="w-3 h-3" /> Passwords match
                    </p>
                  )}
                </Field>
              </div>

              <div className="flex justify-end pt-1 border-t border-gray-100 dark:border-border">
                <Button onClick={changePassword} disabled={changingPassword || !currentPw || !newPw} size="sm">
                  {changingPassword
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Changing…</>
                    : <><Lock className="w-3.5 h-3.5" /> Change Password</>}
                </Button>
              </div>
            </TabsContent>

            {/* ── Preferences ── */}
            <TabsContent value="preferences" className="mt-0 p-5 space-y-4">
              <div className="space-y-4">
                {/* Theme */}
                <Field label="Theme" icon={<Palette className="w-3 h-3" />}>
                  <div className="flex items-center gap-2">
                    {(
                      [
                        { value: "light", label: "Light", icon: Sun },
                        { value: "dark",  label: "Dark",  icon: Moon },
                        { value: "system", label: "System", icon: Monitor },
                      ] as const
                    ).map((opt) => {
                      const Icon = opt.icon;
                      const active = theme === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setTheme(opt.value)}
                          className={cn(
                            "h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1.5 border transition-colors",
                            active
                              ? "border-primary bg-primary-50 text-primary-700"
                              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:bg-card dark:border-border dark:text-foreground dark:hover:bg-accent",
                          )}
                        >
                          <Icon className="w-3 h-3" />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* Language */}
                <Field label="Language" icon={<Languages className="w-3 h-3" />}>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="h-9 w-full max-w-xs rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 hover:border-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-card dark:text-foreground dark:border-border"
                  >
                    <option value="en">English</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="ar">العربية (Arabic)</option>
                  </select>
                </Field>
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-border">
                <Button onClick={savePreferences} size="sm">
                  <Save className="w-3.5 h-3.5" /> Save Preferences
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

/* ── Field helper ─────────────────────────────────────────── */
function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="inline-flex items-center gap-1.5">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  );
}
