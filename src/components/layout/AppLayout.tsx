import { useState } from "react";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import { AppSidebar, getRequiredResource, getCurrentModule } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/contexts/PermissionsContext";
import { ShieldAlert, Lock, Home, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { can, hasModule, loading: pLoading } = usePermissions();
  const isAuthPage = ["/login", "/reset-password"].includes(location.pathname);

  const content = children || <Outlet />;

  if (isAuthPage) {
    return <div className="min-h-screen bg-background">{content}</div>;
  }

  // 1. Identify current module and check module-level access
  const activeModule = getCurrentModule(location.pathname);
  const hasModuleAccess = hasModule(activeModule);

  // 2. Identify required resource for the specific page and check granular access
  const requiredResource = getRequiredResource(location.pathname);
  const hasResourceAccess = !requiredResource || can('manage', requiredResource);

  // Determine if we should show the restricted UI
  // Note: We only show this if NOT loading. If loading, we wait.
  const showRestricted = !pLoading && (!hasModuleAccess || !hasResourceAccess);

  if (pLoading) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div className={cn("shrink-0 h-full transition-all duration-300", collapsed ? "w-[50px]" : "w-[180px]")} />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden items-center justify-center bg-[#f8fafc]">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (showRestricted) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div className={cn("shrink-0 h-full transition-all duration-300", collapsed ? "w-[50px]" : "w-[180px]")} />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden items-center justify-center bg-[#f8fafc]">
          <div className="max-w-md w-full p-12 bg-white rounded-[40px] shadow-3xl text-center space-y-8 animate-in zoom-in-95 duration-500 border border-slate-100 relative overflow-hidden">
            {/* Background design element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16" />

            <div className="relative mx-auto w-24 h-24 flex items-center justify-center bg-red-50 rounded-3xl">
              <ShieldAlert className="w-12 h-12 text-red-500 animate-pulse" />
              <Lock className="absolute -bottom-2 -right-2 w-8 h-8 text-slate-800 bg-white p-1.5 rounded-xl shadow-lg border border-slate-100" />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-tight">
                {!hasModuleAccess ? "Module Not" : "Access"} <br />
                <span className={cn(!hasModuleAccess ? "text-blue-600" : "text-red-500")}>
                  {!hasModuleAccess ? "Subscribed" : "Restricted"}
                </span>
              </h2>
              <p className="text-sm font-medium text-slate-500 leading-relaxed px-4 italic">
                {!hasModuleAccess
                  ? `Your enterprise ecosystem does not currently include the ${activeModule.toUpperCase()} infrastructure.`
                  : `Your current operational tier does not have authorization to access the ${requiredResource?.toUpperCase()} module resources.`}
              </p>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              {!hasModuleAccess ? (
                <Button
                  onClick={() => navigate(`/apps/ecommerce/billing?module=${activeModule}`)}
                  className="h-14 px-8 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 font-bold uppercase tracking-widest text-[10px] gap-3 active:scale-95 transition-all shadow-xl shadow-blue-100"
                >
                  <Sparkles className="w-4 h-4" /> Activate {activeModule}
                </Button>
              ) : null}
              <Button
                onClick={() => navigate('/apps')}
                variant="outline"
                className="h-14 px-8 rounded-2xl border-slate-200 text-slate-900 font-bold uppercase tracking-widest text-[10px] gap-3 active:scale-95 transition-all"
              >
                <Home className="w-4 h-4" /> Go to App Launcher
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
          collapsed ? "w-[50px]" : "w-[180px]"
        )}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto scrollbar-hide bg-[#f8fafc]/50">
          <div className="content-zoom w-full h-full">
            {content}
          </div>
        </main>
      </div>
    </div>
  );
}
