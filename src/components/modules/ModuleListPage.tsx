import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Plus, Filter, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
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
  active: "bg-success/10 text-success",
  inactive: "bg-muted text-muted-foreground",
  paid: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  overdue: "bg-destructive/10 text-destructive",
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-info/10 text-info",
  approved: "bg-success/10 text-success",
  open: "bg-info/10 text-info",
  closed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
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
    <div className="space-y-6">
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {headerActions}
            {canCreate && (
              onNew ? (
                <Button onClick={onNew} className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-4 h-4" />
                  New {title.replace(/s$/, "")}
                </Button>
              ) : detailBaseUrl ? (
                <Button onClick={() => navigate(`${detailBaseUrl}/new`)} className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-4 h-4" />
                  New {title.replace(/s$/, "")}
                </Button>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="glass-card-solid p-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-10 pr-4 rounded-lg bg-secondary border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2 rounded-lg">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Table */}
      <div className="glass-card-solid overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
                    col.align === "right" ? "text-right" : "text-left"
                  )}
                >
                  {col.label}
                </th>
              ))}
              <th className="px-5 py-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-5 py-8 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-5 py-8 text-center text-muted-foreground">
                  No {title.toLowerCase()} found.
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => detailBaseUrl && navigate(`${detailBaseUrl}/${row[idKey]}`)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-5 py-3.5 text-sm",
                        col.align === "right" && "text-right font-medium"
                      )}
                    >
                      {col.key === statusKey ? (
                        <span
                          className={cn(
                            "text-xs px-2.5 py-1 rounded-full font-medium capitalize",
                            statusColors[String(row[col.key]).toLowerCase()] || "bg-muted text-muted-foreground"
                          )}
                        >
                          {row[col.key]}
                        </span>
                      ) : col.render ? (
                        col.render(row[col.key], row)
                      ) : (
                        row[col.key]
                      )}
                    </td>
                  ))}
                  <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                    {(onEdit || onDelete || actions) ? (
                      <div className="flex items-center justify-end gap-2">
                        {actions && actions(row)}
                        {onEdit && (
                          <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
                            Edit
                          </Button>
                        )}
                        {onDelete && (
                          <Button variant="ghost" size="sm" onClick={() => onDelete(row)} className="text-destructive hover:text-destructive">
                            Delete
                          </Button>
                        )}
                      </div>
                    ) : (
                      <button className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                  </td>
                </tr>
              )))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {data.length} results
          </p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
              1
            </button>
            <button className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-xs">
              2
            </button>
            <button className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-xs">
              3
            </button>
            <button className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

