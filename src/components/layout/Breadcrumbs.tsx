import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { MODULE_NAV, CORE_NAV, getCurrentModule } from "@/config/navigation";
import { PLATFORM_MODULES } from "@/config/modules";

/**
 * ERPNext v16 Desk breadcrumb trail — always shows Home › Module › Page.
 * Consumes navigation config so it auto-updates with routes.
 */
interface Crumb {
  label: string;
  href?: string;
}

function findNavTitle(pathname: string): string | null {
  const mod = getCurrentModule(pathname);
  const groups = [...(MODULE_NAV[mod] || []), ...CORE_NAV];
  for (const g of groups) {
    for (const item of g.items) {
      if (pathname === item.url) return item.title;
      if (pathname.startsWith(item.url + "/")) return item.title;
      if (item.subItems) {
        for (const sub of item.subItems) {
          if (pathname === sub.url || pathname.startsWith(sub.url + "/")) return sub.title;
        }
      }
    }
  }
  return null;
}

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export function Breadcrumbs({ className }: { className?: string }) {
  const location = useLocation();
  const pathname = location.pathname;

  const crumbs: Crumb[] = [];
  const isSuper = pathname.startsWith("/super-admin");
  const isApps = pathname.startsWith("/apps/");

  if (isSuper) {
    crumbs.push({ label: "Platform", href: "/super-admin" });
    const rest = pathname.replace(/^\/super-admin\/?/, "").split("/").filter(Boolean);
    if (rest.length) crumbs.push({ label: titleCase(rest[0]) });
  } else if (isApps) {
    const parts = pathname.split("/").filter(Boolean); // ["apps","ecommerce","orders","123"]
    const moduleSlug = parts[1];
    const mod = PLATFORM_MODULES.find((m) => m.id === moduleSlug);
    crumbs.push({
      label: mod?.name || titleCase(moduleSlug || ""),
      href: mod?.dashboardRoute || `/apps/${moduleSlug}`,
    });
    const page = findNavTitle(pathname);
    if (page) {
      crumbs.push({ label: page });
    } else if (parts[2]) {
      crumbs.push({ label: titleCase(parts[2]) });
    }
    if (parts[3] && parts[3] !== "new" && page) {
      crumbs.push({ label: "#" + parts[3].slice(0, 8) });
    } else if (parts[3] === "new") {
      crumbs.push({ label: "New" });
    }
  } else {
    const parts = pathname.split("/").filter(Boolean);
    parts.forEach((p, i) => {
      crumbs.push({
        label: titleCase(p),
        href: i < parts.length - 1 ? "/" + parts.slice(0, i + 1).join("/") : undefined,
      });
    });
  }

  const homeHref = isSuper ? "/super-admin" : "/apps";

  return (
    <nav className={cn("flex items-center text-xs text-gray-500", className)} aria-label="Breadcrumb">
      <Link
        to={homeHref}
        className="inline-flex items-center justify-center w-5 h-5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors dark:hover:bg-accent"
        title="Home"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center">
          <ChevronRight className="w-3 h-3 mx-1 text-gray-300" />
          {c.href ? (
            <Link
              to={c.href}
              className="hover:text-gray-900 transition-colors truncate max-w-[180px] dark:hover:text-foreground"
            >
              {c.label}
            </Link>
          ) : (
            <span className="text-gray-800 font-medium truncate max-w-[240px] dark:text-foreground">
              {c.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
