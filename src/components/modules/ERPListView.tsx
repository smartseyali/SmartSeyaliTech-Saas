import { useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  MoreHorizontal,
  Filter,
  FileText,
  ArrowUpDown,
  FileDown,
  FileUp,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Column {
  key: string;
  label: string;
  render?: (item: any) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface ERPListViewProps {
  title: string;
  data: any[];
  columns: Column[];
  onNew: () => void;
  onRefresh: () => void;
  onRowClick?: (item: any) => void;
  onDeleteItem?: (id: any) => void;
  onDeleteIds?: (ids: any[]) => void;
  isLoading?: boolean;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  primaryKey?: string;
  statusField?: string;
  headerActions?: React.ReactNode;
  tabs?: React.ReactNode;
  /** Extra menu items shown in each row's dropdown, above Delete */
  rowActions?: (row: any) => React.ReactNode;
  /** Extra toolbar buttons shown when rows are selected */
  bulkActions?: (selectedIds: any[], clearSelection: () => void) => React.ReactNode;
}

import { StatusBadge } from "@/components/ui/status-badge";
export { StatusBadge } from "@/components/ui/status-badge";

export default function ERPListView({
  title,
  data,
  columns,
  onNew,
  onRefresh,
  onRowClick,
  onDeleteItem,
  onDeleteIds,
  isLoading,
  searchTerm,
  onSearchChange,
  primaryKey = "id",
  statusField = "status",
  headerActions,
  tabs,
  rowActions,
  bulkActions,
}: ERPListViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<any>>(new Set());

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((i) => i[primaryKey])));
    }
  };

  const toggleSelect = (id: any) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleDeleteSelected = () => {
    if (onDeleteIds) {
      onDeleteIds(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="sticky top-0 z-30 bg-card border-b border-gray-200 dark:border-border">
        <div className="flex items-center justify-between gap-2 h-12 px-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <h1 className="text-base font-semibold text-gray-900 dark:text-foreground truncate">
              {title}
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[11px] font-medium text-gray-500 bg-gray-100 dark:bg-accent/40">
              {data.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {selectedIds.size > 0 && (
              <motion.div
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-2 pr-2 mr-1 border-r border-gray-200 dark:border-border"
              >
                <span className="text-xs font-medium text-gray-600 dark:text-foreground">
                  {selectedIds.size} selected
                </span>
                {bulkActions?.(Array.from(selectedIds), () => setSelectedIds(new Set()))}
                {onDeleteIds && (
                  <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                    <Trash2 className="w-3 h-3" /> Delete
                  </Button>
                )}
              </motion.div>
            )}

            {headerActions && (
              <div className="flex items-center gap-1 mr-1 pr-1.5 border-r border-gray-200 dark:border-border">
                {headerActions}
              </div>
            )}

            <Button variant="outline" size="sm">
              <FileDown className="w-3 h-3" /> <span className="hidden sm:inline">Export</span>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onRefresh} title="Refresh">
              <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            </Button>
            <Button size="sm" onClick={onNew}>
              <Plus className="w-3 h-3" /> New
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 border-t border-gray-100 bg-gray-50/50 dark:border-border dark:bg-accent/20">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search…"
              className="w-full h-7 pl-8 pr-2.5 bg-white border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none dark:bg-card dark:border-border"
            />
          </div>
          <Button variant="ghost" size="sm" className="text-gray-500">
            <Filter className="w-3 h-3" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          {tabs}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 w-full p-4 overflow-x-auto">
        <div className="bg-card rounded-lg border border-gray-200 dark:border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="h-8">
                <TableHead className="w-9 pl-3">
                  <Checkbox
                    checked={selectedIds.size === data.length && data.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                {columns.map((col) => (
                  <TableHead key={col.key} className={col.className}>
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable !== false && <ArrowUpDown className="w-2.5 h-2.5 opacity-30" />}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-9" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 2} className="h-40 text-center">
                      <RefreshCw className="w-4 h-4 text-primary animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 2} className="h-40 text-center">
                      <div className="space-y-1">
                        <FileText className="w-8 h-8 text-gray-200 mx-auto" />
                        <p className="text-xs font-medium text-gray-400">No records</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => (
                    <motion.tr
                      key={item[primaryKey]}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => onRowClick && onRowClick(item)}
                      className={cn(
                        "h-9 border-b border-gray-100 transition-colors cursor-pointer group",
                        "hover:bg-gray-50 dark:hover:bg-accent/40 dark:border-border",
                        selectedIds.has(item[primaryKey]) && "bg-primary-50 dark:bg-accent",
                      )}
                    >
                      <TableCell className="pl-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(item[primaryKey])}
                          onCheckedChange={() => toggleSelect(item[primaryKey])}
                        />
                      </TableCell>
                      {columns.map((col) => (
                        <TableCell key={col.key} className={cn("text-sm", col.className)}>
                          {col.render
                            ? col.render(item)
                            : col.key === statusField
                              ? <StatusBadge status={item[col.key]} />
                              : item[col.key] || <span className="text-gray-300">—</span>}
                        </TableCell>
                      ))}
                      <TableCell className="pr-2 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="inline-flex items-center justify-center w-7 h-7 rounded opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition dark:hover:bg-accent">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => onRowClick && onRowClick(item)}>
                              <FileText className="w-3.5 h-3.5" /> Open
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileUp className="w-3.5 h-3.5" /> Duplicate
                            </DropdownMenuItem>
                            {rowActions && (
                              <>
                                <DropdownMenuSeparator />
                                {rowActions(item)}
                              </>
                            )}
                            {onDeleteItem && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onDeleteItem(item[primaryKey])}
                                  className="text-destructive focus:text-destructive focus:bg-destructive-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 flex items-center justify-between px-1">
          <p className="text-xs text-gray-500">
            {data.length > 0 && <>Showing 1–{data.length} of {data.length}</>}
          </p>
        </div>
      </div>
    </div>
  );
}
