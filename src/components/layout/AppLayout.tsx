import { useState } from "react";
import { useLocation, Outlet, Navigate } from "react-router-dom";
import { AppSidebar, getRequiredResource } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/contexts/PermissionsContext";
import { ShieldAlert, Lock, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { can, loading: pLoading } = usePermissions();
  const isAuthPage = ["/login", "/reset-password"].includes(location.pathname);

  const content = children || <Outlet />;

  if (isAuthPage) {
    return <div className="min-h-screen bg-background">{content}</div>;
  }

  // Check Permissions
  const requiredResource = getRequiredResource(location.pathname);
  const hasAccess = !requiredResource || can('manage', requiredResource);

  if (pLoading) return null;

  if (!hasAccess) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div className={cn("shrink-0 h-full transition-all duration-300", collapsed ? "w-[68px]" : "w-[260px]")} />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden items-center justify-center bg-[#f8fafc]">
          <div className="max-w-md w-full p-12 bg-white rounded-[40px] shadow-3xl text-center space-y-8 animate-in zoom-in-95 duration-500 border border-slate-100">
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center bg-red-50 rounded-3xl">
              <ShieldAlert className="w-12 h-12 text-red-500 animate-pulse" />
              <Lock className="absolute -bottom-2 -right-2 w-8 h-8 text-slate-800 bg-white p-1.5 rounded-xl shadow-lg border border-slate-100" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-tight">Access <br /><span className="text-red-500">Restricted</span></h2>
              <p className="text-sm font-medium text-slate-500 leading-relaxed px-4">Your current operational tier does not have authorization to access the <span className="font-bold text-slate-900 uppercase underline decoration-red-500/30 underline-offset-4">{requiredResource}</span> module.</p>
            </div>
            <div className="pt-4">
              <Button
                onClick={() => window.location.href = '/ecommerce'}
                className="h-14 px-8 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-bold uppercase tracking-widest text-[10px] gap-3 active:scale-95 transition-all shadow-xl shadow-slate-200"
              >
                <Home className="w-4 h-4" /> Return to Command Center
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div
        className={cn(
          "shrink-0 h-full transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-[#f8fafc]/50">
          <div className="content-zoom w-full">
            {content}
          </div>
        </main>
      </div>
    </div>
  );
}
