import { useState } from "react";
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
    FileUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
    isLoading?: boolean;
    searchTerm: string;
    onSearchChange: (val: string) => void;
    primaryKey?: string;
    statusField?: string;
    headerActions?: React.ReactNode;
    tabs?: React.ReactNode;
}

export function StatusBadge({ status }: { status: string }) {
    const s = status?.toLowerCase() || "";
    
    const colors: Record<string, string> = {
        // Success / Positive
        'paid': 'bg-green-100 text-green-700 border-green-200',
        'confirmed': 'bg-green-100 text-green-700 border-green-200',
        'completed': 'bg-green-100 text-green-700 border-green-200',
        'delivered': 'bg-green-100 text-green-700 border-green-200',
        
        // Neutral / Draft
        'draft': 'bg-gray-100 text-gray-700 border-gray-200',
        'open': 'bg-blue-100 text-blue-700 border-blue-200',
        'pending': 'bg-blue-100 text-blue-700 border-blue-200',
        
        // Warning / Action Needed
        'unpaid': 'bg-orange-100 text-orange-700 border-orange-200',
        'on-hold': 'bg-orange-100 text-orange-700 border-orange-200',
        
        // Danger / Critical
        'overdue': 'bg-red-100 text-red-700 border-red-200',
        'cancelled': 'bg-red-100 text-red-700 border-red-200',
    };

    const colorClass = colors[s] || colors['draft'];

    return (
        <span className={cn(
            "px-2 py-0.5 rounded text-[13px] font-bold uppercase tracking-wider border",
            colorClass
        )}>
            {status}
        </span>
    );
}

export default function ERPListView({
    title,
    data,
    columns,
    onNew,
    onRefresh,
    onRowClick,
    isLoading,
    searchTerm,
    onSearchChange,
    primaryKey = "id",
    statusField = "status",
    headerActions,
    tabs
}: ERPListViewProps) {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* ERPNext Sticky Toolbar */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
                <header className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between h-14 px-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-[13px] font-bold tracking-tight text-gray-950 uppercase  leading-none">{title}</h1>
                            <div className="h-4 w-px bg-gray-200" />
                            <span className="text-[13px] font-bold text-gray-400">{data.length} Total</span>
                        </div>

                        <div className="flex items-center gap-1.5 font-sans">
                            {headerActions && (
                                <div className="flex items-center gap-1.5 mr-1.5 font-sans border-r border-gray-200 pr-1.5">
                                    {headerActions}
                                </div>
                            )}
                            <div className="flex items-center gap-1 mr-1.5 font-sans">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 px-2.5 text-slate-600 hover:bg-slate-100 font-bold text-xs tracking-widest uppercase gap-2 border border-slate-100"
                                >
                                    <FileDown className="w-3.5 h-3.5" />
                                    Export
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 px-2.5 text-slate-600 hover:bg-slate-100 font-bold text-xs tracking-widest uppercase gap-2 border border-slate-100"
                                >
                                    <FileUp className="w-3.5 h-3.5" />
                                    Bulk Import
                                </Button>
                                <div className="h-4 w-px bg-gray-200 mx-1" />
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={onRefresh}
                                title="Refresh"
                                className="h-8 px-2.5 text-gray-500 hover:bg-gray-100 border border-slate-100"
                            >
                                <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
                            </Button>
                            <Button 
                                onClick={onNew}
                                className="h-8 px-4 bg-slate-900 hover:bg-black text-white text-[12px] font-bold shadow-sm uppercase tracking-widest"
                            >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                New
                            </Button>
                        </div>
                    </div>
                    {tabs && (
                        <div className="px-4 pb-2 -mt-1 overflow-x-auto no-scrollbar scroll-smooth">
                            <div className="flex items-center gap-1">
                                {tabs}
                            </div>
                        </div>
                    )}
                </header>

                {/* Filters Bar */}
                <div className="w-full px-4 py-1.5 flex items-center gap-3 bg-gray-50/50">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={`Search for ${title.toLowerCase()}...`}
                            className="w-full h-8 pl-9 pr-4 bg-white border border-gray-200 rounded text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                        />
                    </div>
                    
                    <Button variant="outline" size="sm" className="h-9 text-gray-600 border-gray-200 text-[13px] font-medium bg-white">
                        <Filter className="w-3.5 h-3.5 mr-2" />
                        Add Filter
                    </Button>
                </div>
            </div>

            {/* List Content */}
            <div className="w-full px-3 py-3 overflow-x-auto">
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-gray-50/80">
                            <TableRow className="h-10 hover:bg-transparent">
                                {columns.map((col) => (
                                    <TableHead 
                                        key={col.key} 
                                        className={cn(
                                            "text-[13px] font-bold text-gray-500 uppercase tracking-wider",
                                            col.className
                                        )}
                                    >
                                        <div className="flex items-center gap-1 cursor-pointer group">
                                            {col.label}
                                            {col.sortable !== false && <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                        </div>
                                    </TableHead>
                                ))}
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length + 1} className="h-32 text-center">
                                            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length + 1} className="h-32 text-center text-gray-400 font-medium">
                                            No {title.toLowerCase()} found
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
                                            className="h-10 border-b border-gray-100 hover:bg-blue-50/30 transition-colors cursor-pointer group"
                                        >
                                            {columns.map((col) => (
                                                <TableCell 
                                                    key={col.key} 
                                                    className={cn("text-[13px] text-gray-700 py-2", col.className)}
                                                >
                                                    {col.render ? (
                                                        col.render(item)
                                                    ) : col.key === statusField ? (
                                                        <StatusBadge status={item[col.key]} />
                                                    ) : (
                                                        item[col.key] || "-"
                                                    )}
                                                </TableCell>
                                            ))}
                                            <TableCell className="pr-4">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-all">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </div>
                
                {/* Pagination Placeholder */}
                <div className="mt-4 flex items-center justify-between text-[13px] text-gray-500 font-medium">
                    <div>Showing {data.length} of {data.length} items</div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 px-4 text-[13px] bg-white border-gray-200" disabled>Previous</Button>
                        <Button variant="outline" size="sm" className="h-8 px-4 text-[13px] bg-white border-gray-200" disabled>Next</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
