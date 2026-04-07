import { useState, useEffect } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { can, hasModule, loading: pLoading } = usePermissions();
  const isAuthPage = ["/login", "/reset-password"].includes(location.pathname);

  const content = children || <Outlet />;

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

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
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden items-center justify-center bg-slate-50/50">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (showRestricted) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden items-center justify-center bg-slate-50/50">
          <div className="max-w-sm w-full p-8 bg-white rounded-2xl shadow-sm text-center space-y-6 border border-slate-200">
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-red-50 rounded-xl">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-800">
                {!hasModuleAccess ? "App Not Installed" : "Access Restricted"}
              </h2>
              <p className="text-sm text-slate-500">
                {!hasModuleAccess
                  ? `The ${activeModule} app is not installed for your workspace. Install it from the App Store.`
                  : `You don't have permission to access this section. Contact your admin.`}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {!hasModuleAccess && (
                <Button
                  onClick={() => navigate(`/apps`)}
                  className="w-full h-10 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Go to App Store
                </Button>
              )}
              <Button
                onClick={() => navigate('/apps')}
                variant="outline"
                className="w-full h-10 rounded-lg text-sm font-medium gap-2"
              >
                <Home className="w-4 h-4" /> Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless mobileOpen, always visible on md+ */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 md:relative md:z-0 transition-transform duration-300 ease-in-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AppHeader onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1 overflow-y-auto scrollbar-hide bg-[#f8fafd]">
          <div className="content-zoom w-full h-full">
            {content}
          </div>
        </main>
      </div>
    </div>
  );
}
