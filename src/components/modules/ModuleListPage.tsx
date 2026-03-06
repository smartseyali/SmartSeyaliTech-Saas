import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Plus, Filter, MoreHorizontal, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Column {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  render?: (value: any, row: any) => React.ReactNode;
}

interface ModuleListPageProps {
  title: string;
  subtitle: string;
  columns: Column[];
  data: Record<string, any>[];
  statusKey?: string;
  idKey?: string;
  detailBaseUrl?: string;
  onNew?: () => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  loading?: boolean;
  canCreate?: boolean;
  actions?: (row: any) => React.ReactNode;
  headerActions?: React.ReactNode;
  hideHeader?: boolean;
}
const statusColors: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  inactive: "bg-slate-50 text-slate-500 border-slate-100",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  overdue: "bg-rose-50 text-rose-700 border-rose-100",
  draft: "bg-slate-50 text-slate-500 border-slate-100",
  submitted: "bg-blue-50 text-blue-700 border-blue-100",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  open: "bg-blue-50 text-blue-700 border-blue-100",
  closed: "bg-slate-50 text-slate-500 border-slate-100",
  cancelled: "bg-rose-50 text-rose-700 border-rose-100",
};

export function ModuleListPage({
  title,
  subtitle,
  columns,
  data,
  statusKey = "status",
  idKey = "id",
  detailBaseUrl,
  onNew,
  onEdit,
  onDelete,
  loading = false,
  canCreate = true,
  actions,
  headerActions,
  hideHeader = false
}: ModuleListPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filtered = data.filter((row) =>
    Object.values(row).some((v) =>
      String(v).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500 pb-20 w-full">
      {/* Header */}
      {!hideHeader && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Management</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {headerActions}
            {canCreate && (
              onNew ? (
                <button onClick={onNew} className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 transition-all gap-2 active:scale-95 flex items-center">
                  <Plus className="w-4 h-4" />
                  Add {title.replace(/s$/, "")}
                </button>
              ) : detailBaseUrl ? (
                <button onClick={() => navigate(`${detailBaseUrl}/new`)} className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 transition-all gap-2 active:scale-95 flex items-center">
                  <Plus className="w-4 h-4" />
                  Add {title.replace(/s$/, "")}
                </button>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 transition-all outline-none placeholder:text-slate-300"
          />
        </div>
        <Button variant="outline" className="h-11 px-5 rounded-xl bg-white border-slate-200 text-slate-500 font-semibold hover:bg-slate-50 transition-all gap-2 text-sm shadow-sm">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-400",
                      col.align === "right" ? "text-right" : "text-left"
                    )}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-5 py-3.5 w-28" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-5 py-16">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-6 h-6 text-blue-500 animate-spin opacity-30" />
                      <p className="text-xs font-medium text-slate-400">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-5 py-16 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
                        <Search className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">No {title.toLowerCase()} found</p>
                      <p className="text-xs font-medium text-slate-400">Try adjusting your search or add a new entry.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/60 transition-colors duration-150 group/row cursor-pointer"
                    onClick={() => detailBaseUrl && navigate(`${detailBaseUrl}/${row[idKey]}`)}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-5 py-4 text-sm",
                          col.align === "right" ? "text-right font-bold text-slate-800 font-mono" : "text-slate-700 font-medium"
                        )}
                      >
                        {col.key === statusKey ? (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                              statusColors[String(row[col.key]).toLowerCase()] || "bg-slate-50 text-slate-400 border-slate-100"
                            )}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                            {row[col.key]}
                          </span>
                        ) : col.render ? (
                          col.render(row[col.key], row)
                        ) : (
                          row[col.key]
                        )}
                      </td>
                    ))}
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {(onEdit || onDelete || actions) ? (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-all duration-200">
                          {actions && actions(row)}
                          {onEdit && (
                            <Button variant="ghost" size="sm" onClick={() => onEdit(row)} className="h-8 px-3 rounded-lg text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-all">
                              Edit
                            </Button>
                          )}
                          {onDelete && (
                            <Button variant="ghost" size="sm" onClick={() => onDelete(row)} className="h-8 px-3 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all">
                              Delete
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover/row:bg-white group-hover/row:text-slate-600 group-hover/row:shadow-sm border border-transparent group-hover/row:border-slate-100 transition-all mx-auto">
                          <MoreHorizontal className="w-4 h-4" />
                        </div>
                      )}
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-50/40 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium text-slate-500">
            Showing <span className="font-bold text-slate-800">{filtered.length}</span> of {data.length} {title.toLowerCase()}
          </p>
          <div className="flex items-center gap-1.5">
            <button className="h-9 w-9 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-blue-600/20">
              1
            </button>
            <button className="h-9 w-9 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

