import { useState } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const isAuthPage = ["/login", "/reset-password"].includes(location.pathname);

  const content = children || <Outlet />;

  if (isAuthPage) {
    return <div className="min-h-screen bg-background">{content}</div>;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar - fixed but we use a placeholder div to reserve space if needed, 
          though with fixed we can just use ml. Let's make it truly flex-based for stability. */}
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Spacer to preserve sidebar width for the flex container */}
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
