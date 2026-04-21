import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Search,
  ShoppingCart,
  Users,
  Package,
  FileText,
  Settings,
  Plus,
} from "lucide-react";

/**
 * ERPNext v16 "Awesome Bar" — global command/search trigger in header.
 * Ctrl/Cmd+G or Ctrl/Cmd+K opens the palette.
 */
export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "g") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center gap-2 w-full max-w-[420px] h-8 px-2.5 rounded-md border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 transition-colors text-left dark:bg-card dark:border-border"
        title="Search — Ctrl+G"
      >
        <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="flex-1 text-xs text-gray-400 truncate">
          Search or type a command…
        </span>
        <span className="hidden sm:inline-flex items-center gap-0.5 shrink-0">
          <kbd className="kbd">Ctrl</kbd>
          <kbd className="kbd">G</kbd>
        </span>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Jump to">
            <CommandItem onSelect={() => runCommand(() => navigate("/apps/ecommerce/orders"))}>
              <ShoppingCart className="mr-2 h-3.5 w-3.5" />
              <span>Orders</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/apps/masters/items"))}>
              <Package className="mr-2 h-3.5 w-3.5" />
              <span>Products</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/apps/crm/contacts"))}>
              <Users className="mr-2 h-3.5 w-3.5" />
              <span>Contacts</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Create">
            <CommandItem onSelect={() => runCommand(() => navigate("/apps/masters/items"))}>
              <Plus className="mr-2 h-3.5 w-3.5" />
              <span>New Product</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/apps/sales/invoices/new"))}>
              <FileText className="mr-2 h-3.5 w-3.5" />
              <span>New Invoice</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => runCommand(() => navigate("/apps/ecommerce/settings"))}>
              <Settings className="mr-2 h-3.5 w-3.5" />
              <span>System Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
