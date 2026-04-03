import { useState, useMemo } from "react";
import { 
    Search, 
    Plus, 
    RefreshCw, 
    MoreHorizontal,
    ChevronDown,
    Filter,
    FileText,
    ArrowUpDown,
    FileDown,
    FileUp,
    Trash2,
    CheckSquare,
    Square
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    DropdownMenuLabel,
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
}

// Re-export from centralized StatusBadge for backward compatibility
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
    tabs
}: ERPListViewProps) {
    const [selectedIds, setSelectedIds] = useState<Set<any>>(new Set());

    const toggleSelectAll = () => {
        if (selectedIds.size === data.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(data.map(i => i[primaryKey])));
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
        <div className="flex flex-col min-h-screen bg-slate-50/20 font-sans">
            {/* Toolbar Area */}
            <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
                <header className="bg-white flex flex-col">
                    <div className="flex items-center justify-between h-12 px-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-[11px] font-black tracking-tight text-slate-950 uppercase leading-none border-l-2 border-blue-600 pl-3">{title}</h1>
                            <div className="h-3 w-px bg-slate-200" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{data.length} RECORDS</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {selectedIds.size > 0 && onDeleteIds && (
                                <motion.div 
                                    initial={{ x: 20, opacity: 0 }} 
                                    animate={{ x: 0, opacity: 1 }}
                                    className="flex items-center gap-2 pr-2 mr-2 border-r border-slate-100"
                                >
                                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{selectedIds.size} SELECTED</span>
                                    <Button 
                                        variant="destructive" 
                                        size="sm" 
                                        onClick={handleDeleteSelected}
                                        className="h-7 rounded-md text-[9px] font-black uppercase tracking-widest px-3 bg-rose-600 hover:bg-rose-700"
                                    >
                                        <Trash2 className="w-3 h-3 mr-1.5" />
                                        Batch Delete
                                    </Button>
                                </motion.div>
                            )}

                            {headerActions && (
                                <div className="flex items-center gap-1.5 mr-1 pr-1 border-r border-slate-100">
                                    {headerActions}
                                </div>
                            )}

                            <div className="flex items-center gap-1.5">
                                <Button variant="ghost" size="sm" className="h-7.5 px-3 text-slate-500 font-bold text-[9px] tracking-widest uppercase border border-slate-200 hover:bg-slate-50">
                                    <FileDown className="w-3.5 h-3.5 mr-1" /> EXPORT
                                </Button>
                                <Button variant="ghost" size="sm" onClick={onRefresh} className="h-7.5 w-7.5 text-slate-400 border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-all">
                                    <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
                                </Button>
                                <Button onClick={onNew} className="h-7.5 px-4 bg-slate-900 hover:bg-black text-white text-[10px] font-black shadow-md shadow-slate-900/10 uppercase tracking-[0.15em] transition-all rounded-md">
                                    <Plus className="w-3.5 h-3.5 mr-1" /> NEW ENTRY
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="w-full px-4 py-1.5 flex items-center gap-3 bg-slate-50/80 border-t border-slate-100">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={`Quick find...`}
                            className="w-full h-8 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-[11px] font-medium focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none"
                        />
                    </div>
                    <Button variant="ghost" className="h-8 px-4 rounded-lg border border-slate-200 bg-white text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50">
                        <Filter className="w-3 h-3 mr-2" /> SMART FILTERS
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="w-full p-3 overflow-x-auto">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="h-10 hover:bg-transparent border-slate-200">
                                <TableHead className="w-10 pl-5">
                                    <Checkbox 
                                        checked={selectedIds.size === data.length && data.length > 0} 
                                        onCheckedChange={toggleSelectAll}
                                        className="rounded-sm border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                    />
                                </TableHead>
                                {columns.map((col) => (
                                    <TableHead key={col.key} className={cn("text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]", col.className)}>
                                        <div className="flex items-center gap-1">
                                            {col.label}
                                            {col.sortable !== false && <ArrowUpDown className="w-2.5 h-2.5 opacity-30" />}
                                        </div>
                                    </TableHead>
                                ))}
                                <TableHead className="w-10"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={columns.length + 2} className="h-48 text-center"><RefreshCw className="w-6 h-6 text-blue-500 animate-spin mx-auto opacity-30" /></TableCell></TableRow>
                                ) : data.length === 0 ? (
                                    <TableRow><TableCell colSpan={columns.length + 2} className="h-48 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Zero Records Found</TableCell></TableRow>
                                ) : (
                                    data.map((item) => (
                                        <motion.tr
                                            key={item[primaryKey]}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            onClick={() => onRowClick && onRowClick(item)}
                                            className={cn(
                                                "h-11 border-b border-slate-100 transition-all cursor-pointer group hover:bg-blue-50/30",
                                                selectedIds.has(item[primaryKey]) ? "bg-blue-50/50" : ""
                                            )}
                                        >
                                            <TableCell className="pl-5" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox 
                                                    checked={selectedIds.has(item[primaryKey])}
                                                    onCheckedChange={() => toggleSelect(item[primaryKey])}
                                                    className="rounded-sm border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 shadow-none"
                                                />
                                            </TableCell>
                                            {columns.map((col) => (
                                                <TableCell key={col.key} className={cn("text-[12px] font-semibold text-slate-700 leading-none", col.className)}>
                                                    {col.render ? col.render(item) : col.key === statusField ? <StatusBadge status={item[col.key]} /> : item[col.key] || "—"}
                                                </TableCell>
                                            ))}
                                            <TableCell className="pr-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-900 hover:bg-white border border-transparent shadow-none transition-all">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5 shadow-2xl border-slate-200 font-sans">
                                                        <DropdownMenuLabel className="text-[9px] font-black text-slate-400 uppercase px-2 pt-2 pb-1 tracking-widest border-b border-slate-50 mb-1">Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => onRowClick && onRowClick(item)} className="rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-700 focus:bg-slate-50 cursor-pointer flex items-center gap-2">
                                                            <FileText className="w-3.5 h-3.5 text-slate-400" /> Open Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-700 focus:bg-slate-50 cursor-pointer flex items-center gap-2">
                                                            <FileUp className="w-3.5 h-3.5 text-slate-400" /> Duplicate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-50 my-1" />
                                                        <DropdownMenuItem 
                                                            onClick={() => onDeleteItem && onDeleteItem(item[primaryKey])}
                                                            className="rounded-lg px-2 py-1.5 text-[11px] font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-700 cursor-pointer flex items-center gap-2"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" /> Purge Record
                                                        </DropdownMenuItem>
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
                
                {/* Status Bar */}
                <div className="mt-4 flex items-center justify-between px-2">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">
                        INDEX {data.length > 0 ? '1' : '0'} TO {data.length} OF {data.length} ENTRIES
                    </div>
                </div>
            </div>
        </div>
    );
}
