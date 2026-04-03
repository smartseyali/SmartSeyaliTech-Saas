/**
 * DocList — Professional ERP List View Component
 *
 * Unified list component replacing both ERPListView and ModuleListPage.
 * Uses centralized StatusBadge from constants.
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

/* ── Props ─────────────────────────────────────────────────────────────────── */

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

/* ── Component ─────────────────────────────────────────────────────────────── */

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
  newLabel = "New Entry",
}: DocListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<any>>(new Set());
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Derive unique statuses from data
  const statusOptions = useMemo(() => {
    if (!statusField) return [];
    const statuses = new Set<string>();
    data.forEach((item) => {
      if (item[statusField]) statuses.add(item[statusField]);
    });
    return Array.from(statuses).sort();
  }, [data, statusField]);

  // Filter by status
  const filteredData = useMemo(() => {
    if (!statusFilter) return data;
    return data.filter((item) => item[statusField] === statusFilter);
  }, [data, statusFilter, statusField]);

  // Sort
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

  // Paginate
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/30 font-sans">
      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
        {/* Primary toolbar */}
        <div className="flex items-center justify-between h-12 px-4">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-slate-900 border-l-2 border-blue-600 pl-3">
              {title}
            </h1>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {data.length} records
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Bulk actions */}
            {selectedIds.size > 0 && onDeleteIds && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-2 pr-3 mr-2 border-r border-slate-200"
              >
                <span className="text-[10px] font-semibold text-red-500">
                  {selectedIds.size} selected
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="h-7 text-xs font-semibold px-3"
                >
                  <Trash2 className="w-3 h-3 mr-1.5" /> Delete
                </Button>
              </motion.div>
            )}

            {headerActions && (
              <div className="flex items-center gap-1.5 mr-1 pr-2 border-r border-slate-200">
                {headerActions}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs font-semibold text-slate-500"
              onClick={() => {
                if (data.length === 0) return;
                const keys = columns.map(c => c.key);
                const headers = columns.map(c => c.label);
                const rows = data.map(row =>
                  keys.map(k => {
                    const val = row[k];
                    if (val === null || val === undefined) return "";
                    if (typeof val === "object") return JSON.stringify(val);
                    return String(val).replace(/"/g, '""');
                  })
                );
                const csv = [
                  headers.join(","),
                  ...rows.map(r => r.map(v => `"${v}"`).join(","))
                ].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${title.replace(/\s+/g, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <FileDown className="w-3.5 h-3.5 mr-1.5" /> Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-8 w-8 p-0 text-slate-400"
            >
              <RefreshCw
                className={cn("w-3.5 h-3.5", isLoading && "animate-spin")}
              />
            </Button>
            <Button
              size="sm"
              onClick={onNew}
              className="h-8 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> {newLabel}
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="w-full px-4 py-1.5 flex items-center gap-3 bg-slate-50/50 border-t border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className="w-full h-8 pl-9 pr-4 bg-white border border-slate-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all outline-none"
            />
          </div>
          {tabs}
          {/* Status filter pills */}
          {statusOptions.length > 1 && (
            <div className="flex items-center gap-1.5 ml-auto">
              <Filter className="w-3 h-3 text-slate-400" />
              <button
                onClick={() => { setStatusFilter(null); setCurrentPage(1); }}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors",
                  !statusFilter ? "bg-slate-900 text-white" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
                )}
              >
                All
              </button>
              {statusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(statusFilter === s ? null : s); setCurrentPage(1); }}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-colors",
                    statusFilter === s ? "bg-slate-900 text-white" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="w-full p-4">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="h-10 bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                <TableHead className="w-10 pl-4">
                  <Checkbox
                    checked={
                      selectedIds.size === data.length && data.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                    className="rounded-sm border-slate-300"
                  />
                </TableHead>
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={cn(
                      "text-[10px] font-semibold text-slate-500 uppercase tracking-wide",
                      col.sortable !== false && "cursor-pointer select-none hover:text-slate-700",
                      col.className
                    )}
                    onClick={() => col.sortable !== false && col.label && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable !== false && col.label && (
                        sortKey === col.key
                          ? sortDir === "asc"
                            ? <ArrowUp className="w-2.5 h-2.5 text-blue-600" />
                            : <ArrowDown className="w-2.5 h-2.5 text-blue-600" />
                          : <ArrowUpDown className="w-2.5 h-2.5 opacity-30" />
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 2}
                      className="h-48 text-center"
                    >
                      <RefreshCw className="w-5 h-5 text-blue-500 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 2}
                      className="h-48 text-center"
                    >
                      <div className="space-y-2">
                        <FileText className="w-8 h-8 text-slate-200 mx-auto" />
                        <p className="text-sm font-medium text-slate-400">
                          No records found
                        </p>
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
                        "h-11 border-b border-slate-100 transition-colors cursor-pointer group",
                        "hover:bg-blue-50/30",
                        selectedIds.has(item[primaryKey]) && "bg-blue-50/50"
                      )}
                    >
                      <TableCell
                        className="pl-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedIds.has(item[primaryKey])}
                          onCheckedChange={() =>
                            toggleSelect(item[primaryKey])
                          }
                          className="rounded-sm border-slate-300"
                        />
                      </TableCell>
                      {columns.map((col) => (
                        <TableCell
                          key={col.key}
                          className={cn(
                            "text-sm font-medium text-slate-700",
                            col.className
                          )}
                        >
                          {col.render
                            ? col.render(item)
                            : col.key === statusField
                              ? <StatusBadge status={item[col.key]} />
                              : item[col.key] || "—"}
                        </TableCell>
                      ))}
                      <TableCell
                        className="pr-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 shadow-none"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-44 rounded-lg shadow-lg"
                          >
                            <DropdownMenuItem
                              onClick={() => onRowClick?.(item)}
                              className="text-sm cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 mr-2 text-slate-400" />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {onDeleteItem && (
                              <DropdownMenuItem
                                onClick={() => onDeleteItem(item[primaryKey])}
                                className="text-sm text-red-600 cursor-pointer focus:text-red-700 focus:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                Delete
                              </DropdownMenuItem>
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
          <p className="text-xs font-medium text-slate-400">
            Showing {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)}–{Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} record{sortedData.length !== 1 ? "s" : ""}
            {statusFilter && <span className="ml-1 text-blue-500">({statusFilter})</span>}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="h-7 w-7 p-0 text-slate-400"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) { page = i + 1; }
                else if (currentPage <= 3) { page = i + 1; }
                else if (currentPage >= totalPages - 2) { page = totalPages - 4 + i; }
                else { page = currentPage - 2 + i; }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={cn("h-7 w-7 p-0 text-xs font-semibold", currentPage === page && "bg-slate-900 text-white")}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-7 w-7 p-0 text-slate-400"
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
