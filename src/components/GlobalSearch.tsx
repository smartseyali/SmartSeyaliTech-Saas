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
  CreditCard, 
  Settings,
  Plus
} from "lucide-react";

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
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
        className="flex-1 max-w-md relative group hidden sm:flex items-center text-left"
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500">
          <Search className="w-4 h-4" />
        </div>
        <div className="pl-10 bg-slate-100 hover:bg-slate-200 transition-all h-9 rounded-md w-full text-sm text-slate-500 flex items-center">
          Search resources... (Ctrl+K)
        </div>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => runCommand(() => navigate("/apps/ecommerce/orders"))}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              <span>Orders</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/apps/masters/items"))}>
              <Package className="mr-2 h-4 w-4" />
              <span>Products</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/apps/crm/contacts"))}>
              <Users className="mr-2 h-4 w-4" />
              <span>Contacts</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => runCommand(() => navigate("/apps/masters/items"))}>
              <Plus className="mr-2 h-4 w-4" />
              <span>New Product</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/apps/sales/invoices/new"))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>New Invoice</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => runCommand(() => navigate("/apps/ecommerce/settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>System Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
