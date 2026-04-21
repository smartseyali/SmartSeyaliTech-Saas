/**
 * DocList — ERPNext v16 List View
 *
 * Dense rows, small header, checkbox column, search bar, filter chips,
 * and footer pagination that match the Frappe Desk list view.
 */
import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  MoreHorizontal,
  Filter,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileDown,
  Trash2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
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
import { StatusBadge } from "@/components/ui/status-badge";
import type { DocColumn } from "@/types/erp";

interface DocListProps {
  title: string;
  data: any[];
  columns: DocColumn[];
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
  newLabel?: string;
}

export default function DocList({
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
  newLabel = "New",
}: DocListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<any>>(new Set());
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const statusOptions = useMemo(() => {
    if (!statusField) return [];
    const statuses = new Set<string>();
    data.forEach((item) => {
      if (item[statusField]) statuses.add(item[statusField]);
    });
    return Array.from(statuses).sort();
  }, [data, statusField]);

  const filteredData = useMemo(() => {
    if (!statusFilter) return data;
    return data.filter((item) => item[statusField] === statusFilter);
  }, [data, statusFilter, statusField]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredData, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

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
    if (onDeleteIds && selectedIds.size > 0) {
      if (window.confirm(`Delete ${selectedIds.size} selected records?`)) {
        onDeleteIds(Array.from(selectedIds));
        setSelectedIds(new Set());
      }
    }
  };

  const handleExport = () => {
    if (data.length === 0) return;
    const keys = columns.map((c) => c.key);
    const headers = columns.map((c) => c.label);
    const rows = data.map((row) =>
      keys.map((k) => {
        const val = row[k];
        if (val === null || val === undefined) return "";
        if (typeof val === "object") return JSON.stringify(val);
        return String(val).replace(/"/g, '""');
      }),
    );
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-card border-b border-gray-200 dark:border-border">
        {/* Primary toolbar */}
        <div className="flex items-center justify-between h-12 px-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <h1 className="text-base font-semibold text-gray-900 dark:text-foreground truncate">
              {title}
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[11px] font-medium text-gray-500 bg-gray-100 dark:bg-accent/40">
              {data.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {selectedIds.size > 0 && onDeleteIds && (
              <motion.div
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-2 pr-2 mr-1 border-r border-gray-200 dark:border-border"
              >
                <span className="text-xs font-medium text-gray-600 dark:text-foreground">
                  {selectedIds.size} selected
                </span>
                <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                  <Trash2 className="w-3 h-3" /> Delete
                </Button>
              </motion.div>
            )}

            {headerActions && (
              <div className="flex items-center gap-1 mr-1 pr-1.5 border-r border-gray-200 dark:border-border">
                {headerActions}
              </div>
            )}

            <Button variant="outline" size="sm" onClick={handleExport}>
              <FileDown className="w-3 h-3" /> <span className="hidden sm:inline">Export</span>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onRefresh} title="Refresh">
              <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            </Button>
            <Button size="sm" onClick={onNew}>
              <Plus className="w-3 h-3" /> {newLabel}
            </Button>
          </div>
        </div>

        {/* Secondary toolbar — search + filters */}
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
            <SlidersHorizontal className="w-3 h-3" />
            <span className="hidden sm:inline">Filter</span>
          </Button>

          {tabs}

          {statusOptions.length > 1 && (
            <div className="flex items-center gap-1 ml-auto">
              <Filter className="w-3 h-3 text-gray-400 hidden sm:inline" />
              <button
                onClick={() => { setStatusFilter(null); setCurrentPage(1); }}
                className={cn(
                  "px-2 h-6 rounded text-[11px] font-medium transition-colors",
                  !statusFilter
                    ? "bg-primary text-primary-foreground"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 dark:bg-card dark:text-foreground dark:border-border",
                )}
              >
                All
              </button>
              {statusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(statusFilter === s ? null : s); setCurrentPage(1); }}
                  className={cn(
                    "px-2 h-6 rounded text-[11px] font-medium capitalize transition-colors",
                    statusFilter === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 dark:bg-card dark:text-foreground dark:border-border",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────── */}
      <div className="flex-1 w-full p-4">
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
                  <TableHead
                    key={col.key}
                    className={cn(
                      col.sortable !== false && "cursor-pointer select-none hover:text-gray-700 dark:hover:text-foreground",
                      col.className,
                    )}
                    onClick={() => col.sortable !== false && col.label && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable !== false && col.label && (
                        sortKey === col.key
                          ? sortDir === "asc"
                            ? <ArrowUp className="w-2.5 h-2.5 text-primary" />
                            : <ArrowDown className="w-2.5 h-2.5 text-primary" />
                          : <ArrowUpDown className="w-2.5 h-2.5 opacity-30" />
                      )}
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
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 2} className="h-48 text-center">
                      <div className="space-y-1">
                        <FileText className="w-8 h-8 text-gray-200 mx-auto" />
                        <p className="text-xs font-medium text-gray-400">No records</p>
                        <Button size="sm" variant="subtle" onClick={onNew} className="mt-2">
                          <Plus className="w-3 h-3" /> Create first
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => (
                    <motion.tr
                      key={item[primaryKey]}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => onRowClick?.(item)}
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
                            <button className="inline-flex items-center justify-center w-7 h-7 rounded opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition dark:hover:bg-accent dark:hover:text-foreground">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => onRowClick?.(item)}>
                              <FileText className="w-3.5 h-3.5" /> Open
                            </DropdownMenuItem>
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

        {/* Footer with pagination */}
        <div className="mt-3 flex items-center justify-between px-1">
          <p className="text-xs text-gray-500">
            {sortedData.length > 0 && (
              <>
                Showing {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)}–{Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
                {statusFilter && <span className="ml-1 text-primary"> · {statusFilter}</span>}
              </>
            )}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) page = i + 1;
                else if (currentPage <= 3) page = i + 1;
                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                else page = currentPage - 2 + i;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon-sm"
                    onClick={() => setCurrentPage(page)}
                    className="text-xs font-medium"
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="icon-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
