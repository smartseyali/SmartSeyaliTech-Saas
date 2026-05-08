"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User, Package, Search, LogIn, UserPlus, AlertCircle,
  ExternalLink, LogOut, Loader2, CheckCircle2, Settings, Lock, Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-client";
import { getTenant } from "@/lib/tenant";
import { formatINR, cn } from "@/lib/utils";

type Tab = "login" | "register" | "track";
type DashTab = "orders" | "profile" | "security";

type Customer = {
  id: string;
  email: string;
  name: string;
  phone?: string;
};

type Order = {
  id: string;
  order_number: string;
  created_at: string;
  grand_total: number;
  status: string;
  payment_status: string;
  tracking_number?: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  packed: "bg-indigo-50 text-indigo-700",
  shipped: "bg-purple-50 text-purple-700",
  out_for_delivery: "bg-orange-50 text-orange-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const AUTH_TOKEN_KEY = "ss_auth_token";
const inputCls = "w-full h-11 px-4 text-sm border border-border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-brand/30";

export function AccountContent() {
  const tenant = getTenant();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [myOrders, setMyOrders] = useState<Order[] | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Dashboard section tabs
  const [dashTab, setDashTab] = useState<DashTab>("orders");

  // Profile edit state
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  // Order tracking
  const [trackEmail, setTrackEmail] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [tracking, setTracking] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  async function callAuth(body: Record<string, unknown>) {
    if (!supabaseUrl || !anonKey) throw new Error("Auth not configured");
    const res = await fetch(`${supabaseUrl}/functions/v1/customer-auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${anonKey}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Auth failed");
    return data;
  }

  // Check session on mount
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
    if (!token) { setSessionLoading(false); return; }
    callAuth({ action: "me", token })
      .then((data) => {
        if (data.success && data.customer) {
          setCustomer(data.customer);
          setEditName(data.customer.name || data.customer.full_name || "");
          setEditPhone(data.customer.phone || "");
        }
      })
      .catch(() => { localStorage.removeItem(AUTH_TOKEN_KEY); })
      .finally(() => setSessionLoading(false));
  }, []);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    if (!editName.trim()) { setProfileError("Name is required"); return; }
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return;
    setProfileSaving(true);
    try {
      await callAuth({ action: "update-profile", token, name: editName.trim(), phone: editPhone.trim() || null });
      setCustomer((c) => c ? { ...c, name: editName.trim(), phone: editPhone.trim() } : c);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);
    if (newPassword.length < 8) { setPwError("Password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { setPwError("Passwords do not match"); return; }
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return;
    setPwSaving(true);
    try {
      await callAuth({ action: "change-password", token, new_password: newPassword });
      setNewPassword(""); setConfirmPassword("");
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 4000);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Password change failed");
    } finally {
      setPwSaving(false);
    }
  }

  // Load orders when logged in
  useEffect(() => {
    if (!customer || !supabase) return;
    setOrdersLoading(true);
    const query = supabase
      .from("ecom_orders")
      .select("id, order_number, created_at, grand_total, status, payment_status, tracking_number")
      .eq("customer_email", customer.email)
      .order("created_at", { ascending: false })
      .limit(20);
    if (tenant.companyId) query.eq("company_id", tenant.companyId);
    query.then(({ data }) => {
      setMyOrders(data ?? []);
      setOrdersLoading(false);
    });
  }, [customer]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    if (!email.trim() || !password) { setAuthError("Email and password are required"); return; }
    setAuthLoading(true);
    try {
      const data = await callAuth({ action: "login", company_id: tenant.companyId, email, password });
      if (!data.success) throw new Error(data.error || "Login failed");
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      setCustomer({ id: data.customer_id, email: data.email, name: data.name });
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    if (!name.trim() || !email.trim() || !password) { setAuthError("Name, email, and password are required"); return; }
    if (password.length < 8) { setAuthError("Password must be at least 8 characters"); return; }
    setAuthLoading(true);
    try {
      const data = await callAuth({ action: "register", company_id: tenant.companyId, email, password, name, phone: phone || undefined });
      if (!data.success) throw new Error(data.error || "Registration failed");
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      setCustomer({ id: data.customer_id, email: data.email, name: data.name });
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) { callAuth({ action: "logout", token }).catch(() => {}); }
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setCustomer(null);
    setMyOrders(null);
  }

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) { setTrackError("Order tracking is not available yet."); return; }
    if (!trackEmail.trim()) return;
    setTracking(true);
    setTrackError(null);
    setOrders(null);

    const query = supabase
      .from("ecom_orders")
      .select("id, order_number, created_at, grand_total, status, payment_status, tracking_number")
      .eq("customer_email", trackEmail.trim().toLowerCase())
      .order("created_at", { ascending: false })
      .limit(10);
    if (tenant.companyId) query.eq("company_id", tenant.companyId);

    const { data, error } = await query;
    setTracking(false);
    if (error) { setTrackError("Could not fetch orders. Please try again."); return; }
    setOrders(data ?? []);
  }

  if (sessionLoading) {
    return (
      <div className="container-tight py-20 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand" />
      </div>
    );
  }

  // ── Logged in dashboard ──────────────────────────────────────────────────
  if (customer) {
    return (
      <div className="container-tight py-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-white font-bold text-lg">
              {(customer.name || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-brand-900">{customer.name}</p>
              <p className="text-xs text-muted-foreground">{customer.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>

        {/* Dashboard nav tabs */}
        <div className="flex gap-1 mb-6 bg-brand-50/60 p-1 rounded-xl">
          {([
            { id: "orders" as DashTab, icon: Package, label: "My Orders" },
            { id: "profile" as DashTab, icon: Edit2, label: "Profile" },
            { id: "security" as DashTab, icon: Lock, label: "Security" },
          ]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setDashTab(id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
                dashTab === id ? "bg-white shadow-sm text-brand-900" : "text-muted-foreground hover:text-brand-900"
              )}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {dashTab === "orders" && (
          <>
            {ordersLoading && <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-brand" /></div>}
            {!ordersLoading && myOrders?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No orders yet. <Link href="/shop/" className="text-brand underline">Start shopping</Link>
              </div>
            )}
            {!ordersLoading && myOrders && myOrders.length > 0 && (
              <div className="space-y-3">
                {myOrders.map((order) => (
                  <div key={order.id} className="bg-white border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-brand-900">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        {order.tracking_number && (
                          <p className="text-xs text-brand mt-0.5">AWB: {order.tracking_number}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brand">{formatINR(order.grand_total)}</p>
                        <span className={cn("inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mt-1", STATUS_COLORS[order.status] ?? "bg-gray-50 text-gray-600")}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    {order.status === "shipped" && order.tracking_number && (
                      <a
                        href={`https://shiprocket.co/tracking/${order.tracking_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-brand hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> Track shipment
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Profile tab */}
        {dashTab === "profile" && (
          <div className="bg-white border border-border rounded-2xl p-6">
            <h2 className="font-bold text-brand-900 mb-5">Edit Profile</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-brand-900 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-brand-900 block mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-brand-900 block mb-1.5">Email Address</label>
                <input type="email" value={customer.email} disabled className={cn(inputCls, "opacity-60 cursor-not-allowed")} />
                <p className="text-xs text-muted-foreground mt-1">Email address cannot be changed.</p>
              </div>
              {profileError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />{profileError}
                </div>
              )}
              {profileSuccess && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> Profile updated successfully.
                </div>
              )}
              <Button type="submit" className="w-full" disabled={profileSaving}>
                {profileSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {profileSaving ? "Saving…" : "Save Changes"}
              </Button>
            </form>
          </div>
        )}

        {/* Security tab */}
        {dashTab === "security" && (
          <div className="bg-white border border-border rounded-2xl p-6">
            <h2 className="font-bold text-brand-900 mb-5">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-brand-900 block mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-brand-900 block mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  className={inputCls}
                />
              </div>
              {pwError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />{pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> Password changed successfully.
                </div>
              )}
              <Button type="submit" className="w-full" disabled={pwSaving}>
                {pwSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {pwSaving ? "Updating…" : "Update Password"}
              </Button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // ── Guest view (auth / track) ────────────────────────────────────────────
  return (
    <div className="container-tight py-16 max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-brand" />
        </div>
        <h1 className="text-2xl font-bold text-brand-900">My Account</h1>
        <p className="text-muted-foreground mt-1 text-sm">Sign in or track your orders</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-full border border-border bg-white p-1 mb-8">
        {[
          { id: "login" as Tab, icon: LogIn, label: "Sign In" },
          { id: "register" as Tab, icon: UserPlus, label: "Register" },
          { id: "track" as Tab, icon: Package, label: "Track Order" },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => { setTab(id); setAuthError(null); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-semibold transition-all",
              tab === id ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:text-brand"
            )}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Login */}
      {tab === "login" && (
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="text-sm font-medium text-brand-900 block mb-1.5">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
          </div>
          <div>
            <label className="text-sm font-medium text-brand-900 block mb-1.5">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
          </div>
          <div className="text-right">
            <Link href="/account/forgot-password/" className="text-xs text-brand hover:underline">Forgot password?</Link>
          </div>
          {authError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />{authError}
            </div>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={authLoading}>
            {authLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogIn className="w-4 h-4 mr-2" />}
            {authLoading ? "Signing in…" : "Sign In"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            New here?{" "}
            <button type="button" onClick={() => setTab("register")} className="text-brand hover:underline font-semibold">Create an account</button>
          </p>
        </form>
      )}

      {/* Register */}
      {tab === "register" && (
        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="text-sm font-medium text-brand-900 block mb-1.5">Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputCls} />
          </div>
          <div>
            <label className="text-sm font-medium text-brand-900 block mb-1.5">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
          </div>
          <div>
            <label className="text-sm font-medium text-brand-900 block mb-1.5">Phone (optional)</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className={inputCls} />
          </div>
          <div>
            <label className="text-sm font-medium text-brand-900 block mb-1.5">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" className={inputCls} />
          </div>
          {authError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />{authError}
            </div>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={authLoading}>
            {authLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            {authLoading ? "Creating account…" : "Create Account"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <button type="button" onClick={() => setTab("login")} className="text-brand hover:underline font-semibold">Sign in</button>
          </p>
        </form>
      )}

      {/* Track Order */}
      {tab === "track" && (
        <div>
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-brand-900 block mb-1.5">Email used while ordering</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={trackEmail}
                  onChange={(e) => setTrackEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 h-11 px-4 text-sm border border-border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
                <Button type="submit" disabled={tracking} className="shrink-0">
                  {tracking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </form>

          {trackError && (
            <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />{trackError}
            </div>
          )}

          {orders !== null && (
            <div className="mt-6 space-y-3">
              {orders.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">No orders found for this email address.</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-brand-900">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brand">{formatINR(order.grand_total)}</p>
                        <span className={cn("inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mt-1", STATUS_COLORS[order.status] ?? "bg-gray-50 text-gray-600")}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    {order.status === "shipped" && order.tracking_number && (
                      <a
                        href={`https://shiprocket.co/tracking/${order.tracking_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-brand hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> Track shipment
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
