import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  BookOpen,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Boxes,
  FileText,
  Receipt,
  CreditCard,
  BarChart3,
  UserCheck,
  CalendarDays,
  Wallet,
  Building2,
  Shield,
  UserCog,
  ShoppingBag,
  Check,
  Globe2,
  Tag,
  Zap,
  RotateCcw,
  Star,
  CreditCard as GatewayIcon,
  ShoppingCart as EcomCart,
  ImageIcon,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useTenant } from "@/contexts/TenantContext";
import { useState as useLocalState } from "react";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Sales",
    icon: ShoppingCart,
    items: [
      { title: "Quotations", url: "/sales/quotations", icon: FileText },
      { title: "Sales Orders", url: "/sales/orders", icon: ShoppingCart },
      { title: "Invoices", url: "/sales/invoices", icon: Receipt },
      { title: "Payments", url: "/sales/payments", icon: CreditCard },
    ],
  },
  {
    label: "Purchase",
    icon: Package,
    items: [
      { title: "Purchase Orders", url: "/purchase/orders", icon: FileText },
      { title: "Purchase Invoices", url: "/purchase/invoices", icon: Receipt },
      { title: "Vendor Ledger", url: "/purchase/vendor-ledger", icon: BookOpen },
    ],
  },
  {
    label: "Inventory",
    icon: Warehouse,
    items: [
      { title: "Stock Entry", url: "/inventory/stock-entry", icon: Boxes },
      { title: "Stock Ledger", url: "/inventory/stock-ledger", icon: BookOpen },
      { title: "Warehouses", url: "/inventory/warehouses", icon: Warehouse },
    ],
  },
  {
    label: "Accounting",
    icon: BookOpen,
    items: [
      { title: "Chart of Accounts", url: "/accounting/chart", icon: BarChart3 },
      { title: "Journal Entry", url: "/accounting/journal", icon: FileText },
      { title: "General Ledger", url: "/accounting/ledger", icon: BookOpen },
      { title: "Reports", url: "/accounting/reports", icon: BarChart3 },
    ],
  },
  {
    label: "HR",
    icon: Users,
    items: [
      { title: "Employees", url: "/hr/employees", icon: UserCheck },
      { title: "Attendance", url: "/hr/attendance", icon: CalendarDays },
      { title: "Payroll", url: "/hr/payroll", icon: Wallet },
    ],
  },
  {
    label: "Masters",
    icon: Building2,
    items: [
      { title: "Customers", url: "/masters/customers", icon: Users },
      { title: "Vendors", url: "/masters/vendors", icon: Users },
      { title: "Products", url: "/masters/products", icon: Boxes },
      { title: "Categories", url: "/masters/categories", icon: Package },
    ],
  },
  {
    label: "Ecommerce",
    icon: Globe2,
    items: [
      { title: "Dashboard", url: "/ecommerce", icon: BarChart3 },
      { title: "Orders", url: "/ecommerce/orders", icon: EcomCart },
      { title: "Coupons", url: "/ecommerce/coupons", icon: Tag },
      { title: "Offers", url: "/ecommerce/offers", icon: Zap },
      { title: "Refunds", url: "/ecommerce/refunds", icon: RotateCcw },
      { title: "Payment Gateways", url: "/ecommerce/payment-gateways", icon: GatewayIcon },
      { title: "Reviews", url: "/ecommerce/reviews", icon: Star },
      { title: "Abandoned Carts", url: "/ecommerce/abandoned-carts", icon: ShoppingBag },
      { title: "Gallery", url: "/ecommerce/gallery", icon: ImageIcon },
    ],
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const { hasModule, availableModules, isAdmin } = usePermissions();
  const { activeCompany, companies, setCompany } = useTenant();
  const [openGroups, setOpenGroups] = useState<string[]>(["Sales"]);
  const [showCompanySwitcher, setShowCompanySwitcher] = useLocalState(false);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const isGroupActive = (group: NavGroup) =>
    group.items.some((item) => location.pathname.startsWith(item.url));

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col z-50 transition-all duration-300 border-r border-sidebar-border",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo + Company Switcher */}
      <div className="flex flex-col h-auto border-b border-sidebar-border shrink-0">
        <div className="flex items-center h-16 px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0">
              <span className="text-sidebar-primary-foreground font-bold text-sm">S</span>
            </div>
            {!collapsed && (
              <span className="font-semibold text-lg tracking-tight text-sidebar-foreground whitespace-nowrap">
                SmartSuite
              </span>
            )}
          </div>
        </div>

        {/* Company Switcher — visible to all users with multiple companies or super-admins */}
        {!collapsed && activeCompany && (
          <div className="px-4 pb-3">
            <button
              onClick={() => setShowCompanySwitcher(!showCompanySwitcher)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-sidebar-accent/50 hover:bg-sidebar-accent text-xs transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 shrink-0 text-sidebar-primary" />
              <span className="font-medium truncate flex-1 text-left">{activeCompany.name}</span>
              {(companies.length > 1) && <ChevronDown className="w-3 h-3 text-muted-foreground" />}
            </button>

            {showCompanySwitcher && companies.length > 1 && (
              <div className="mt-1 bg-card border border-border/50 rounded-xl shadow-lg overflow-hidden z-50">
                {companies.map((c: any) => (
                  <button
                    key={c.id}
                    onClick={() => { setCompany(c.id); setShowCompanySwitcher(false); }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left hover:bg-secondary transition-colors",
                      activeCompany.id === c.id && "bg-primary/10 text-primary font-semibold"
                    )}
                  >
                    <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-primary">{c.name.charAt(0)}</span>
                    </div>
                    {c.name}
                    {activeCompany.id === c.id && <Check className="w-3 h-3 ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dashboard link */}
      <div className="px-3 pt-4 pb-2">
        <NavLink
          to="/"
          end
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-sidebar-accent",
            collapsed && "justify-center px-0"
          )}
          activeClassName="sidebar-item-active"
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {navGroups
          .filter((group) => hasModule(group.label))
          .map((group) => {
            const isOpen = openGroups.includes(group.label) || isGroupActive(group);
            return (
              <div key={group.label}>
                <button
                  onClick={() => !collapsed && toggleGroup(group.label)}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-sidebar-accent",
                    collapsed && "justify-center px-0",
                    isGroupActive(group) && "text-sidebar-primary"
                  )}
                >
                  <group.icon className="w-5 h-5 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{group.label}</span>
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-sidebar-muted" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-sidebar-muted" />
                      )}
                    </>
                  )}
                </button>
                {!collapsed && isOpen && (
                  <div className="ml-4 pl-4 border-l border-sidebar-border space-y-0.5 mt-1 mb-2">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.url}
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-muted transition-colors hover:text-sidebar-foreground hover:bg-sidebar-accent"
                        activeClassName="sidebar-item-active"
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span>{item.title}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </nav>

      {/* Settings + Collapse */}
      <div className="px-3 pb-4 space-y-1 border-t border-sidebar-border pt-3">
        <NavLink
          to="/app-store"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-sidebar-accent",
            collapsed && "justify-center px-0"
          )}
          activeClassName="sidebar-item-active"
        >
          <ShoppingBag className="w-5 h-5 shrink-0" />
          {!collapsed && <span>App Store</span>}
        </NavLink>
        <NavLink
          to="/settings/users"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-sidebar-accent",
            collapsed && "justify-center px-0"
          )}
          activeClassName="sidebar-item-active"
        >
          <Users className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Users</span>}
        </NavLink>
        <NavLink
          to="/settings/roles"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-sidebar-accent",
            collapsed && "justify-center px-0"
          )}
          activeClassName="sidebar-item-active"
        >
          <UserCog className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Roles & Perms</span>}
        </NavLink>
        <NavLink
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-sidebar-accent",
            collapsed && "justify-center px-0"
          )}
          activeClassName="sidebar-item-active"
          end
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-sidebar-muted transition-colors hover:bg-sidebar-accent",
            collapsed && "justify-center px-0"
          )}
        >
          <ChevronLeft className={cn("w-5 h-5 shrink-0 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
