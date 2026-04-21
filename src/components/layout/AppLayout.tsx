import { useState, useEffect } from "react";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import { AppSidebar, getRequiredResource, getCurrentModule } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/contexts/PermissionsContext";
import { ShieldAlert, Home, Sparkles, Loader2 } from "lucide-react";
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

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  if (isAuthPage) {
    return <div className="min-h-screen bg-background">{content}</div>;
  }

  const activeModule = getCurrentModule(location.pathname);
  const hasModuleAccess = hasModule(activeModule);
  const requiredResource = getRequiredResource(location.pathname);
  const hasResourceAccess = !requiredResource || can("manage", requiredResource);
  const showRestricted = !pLoading && (!hasModuleAccess || !hasResourceAccess);

  if (pLoading) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden items-center justify-center">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (showRestricted) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden items-center justify-center">
          <div className="max-w-sm w-full p-6 bg-card rounded-lg border border-border text-center space-y-4">
            <div className="mx-auto w-10 h-10 flex items-center justify-center bg-destructive-100 rounded-md">
              <ShieldAlert className="w-5 h-5 text-destructive-500" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">
                {!hasModuleAccess ? "App Not Installed" : "Access Restricted"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {!hasModuleAccess
                  ? `The ${activeModule} app is not installed for your workspace. Install it from the App Store.`
                  : `You don't have permission to access this section. Contact your admin.`}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {!hasModuleAccess && (
                <Button onClick={() => navigate(`/apps`)} className="w-full">
                  <Sparkles className="w-3.5 h-3.5" /> Go to App Store
                </Button>
              )}
              <Button onClick={() => navigate("/apps")} variant="outline" className="w-full">
                <Home className="w-3.5 h-3.5" /> Back to Home
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
          className="fixed inset-0 z-40 bg-gray-900/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 md:relative md:z-0 transition-transform duration-200 ease-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      )}>
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AppHeader onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1 overflow-y-auto erp-scrollbar bg-background">
          <div className="w-full h-full">
            {content}
          </div>
        </main>
      </div>
    </div>
  );
}
