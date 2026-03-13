import { useState, useEffect } from "react";
import {
    Plus,
    Trash2,
    Save,
    X,
    Calculator,
    ShoppingCart,
    Image as ImageIcon,
    ChevronDown,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ERPField {
    key: string;
    label: string;
    type?: "text" | "number" | "date" | "select" | "datetime-local";
    required?: boolean;
    options?: { label: string; value: string }[];
    ph?: string; // Standardize ph vs placeholder
    placeholder?: string;
}

interface ERPEntryFormProps {
    title: string;
    subtitle?: string;
    headerFields: ERPField[];
    itemFields?: ERPField[]; // New: Dynamic items support
    onSave: (header: any, items: any[]) => Promise<void>;
    onAbort: () => void;
    initialData?: any;
    initialItems?: any[];
    showItems?: boolean;
    itemTitle?: string;
}

export default function ERPEntryForm({
    title,
    subtitle,
    headerFields,
    itemFields,
    onSave,
    onAbort,
    initialData,
    initialItems,
    showItems = true,
    itemTitle = "Items / Services"
}: ERPEntryFormProps) {
    const [header, setHeader] = useState<any>(initialData || {});
    const [items, setItems] = useState<any[]>(initialItems || [{}]);

    const [totals, setTotals] = useState({
        subtotal: 0,
        tax: 0,
        grandTotal: 0
    });

    // Auto-calculate logic (only applies if using default fields)
    useEffect(() => {
        if (itemFields) return; // Skip auto-calc if custom fields are used

        let sub = 0;
        let t = 0;

        const updatedItems = items.map(item => {
            const quantity = Number(item.quantity || 0);
            const unitPrice = Number(item.unitPrice || 0);
            const taxRate = Number(item.taxRate || 0);

            const rowAmount = quantity * unitPrice;
            const rowTax = (rowAmount * taxRate) / 100;
            const totalRow = rowAmount + rowTax;

            sub += rowAmount;
            t += rowTax;

            return { ...item, amount: totalRow };
        });

        if (JSON.stringify(updatedItems) !== JSON.stringify(items)) {
            setItems(updatedItems);
        }

        setTotals({
            subtotal: sub,
            tax: t,
            grandTotal: sub + t
        });
    }, [items, itemFields]);

    const handleAddItem = () => {
        setItems([...items, { id: Date.now() }]);
    };

    const handleRemoveItem = (idx: number) => {
        if (items.length === 1) return;
        setItems(items.filter((_, i) => i !== idx));
    };

    const updateItem = (idx: number, field: string, value: any) => {
        setItems(items.map((i, index) => index === idx ? { ...i, [field]: value } : i));
    };

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const renderInput = (field: ERPField, value: any, onChange: (val: any) => void) => {
        if (field.type === "select") {
            return (
                <div className="relative">
                    <select
                        className="w-full h-10 px-3 pr-8 rounded-md bg-gray-50 border border-gray-200 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none"
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                    >
                        <option value="">Select...</option>
                        {field.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            );
        }
        return (
            <input
                type={field.type || "text"}
                placeholder={field.ph || field.placeholder || ""}
                value={value || ""}
                onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-gray-50 border border-gray-200 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen bg-gray-50/50 pb-10"
        >
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <div className="w-full px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onAbort} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                        <div className="flex flex-col -space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{subtitle || "Draft Voucher"}</span>
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={onAbort} className="h-9 px-4 text-xs font-bold border-gray-200 hover:bg-gray-50 rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            onClick={() => onSave(header, items)}
                            className="h-9 px-6 text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-sm rounded-xl"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save Entry
                        </Button>
                    </div>
                </div>
            </div>

            <div className="w-full pt-4 px-6 space-y-3">
                <div className="bg-white rounded-[1.5rem] border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none">Main Details</h3>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {headerFields.map(field => (
                            <div key={field.key} className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{field.label}</Label>
                                {renderInput(field, header[field.key], (val) => setHeader({ ...header, [field.key]: val }))}
                            </div>
                        ))}
                    </div>
                </div>

                {showItems ? (
                    <>
                        <div className="bg-white rounded-[1.5rem] border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none">{itemTitle}</h3>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={handleAddItem}
                                    className="h-8 rounded-xl text-[10px] font-black text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-4"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-2" />
                                    Add New Row
                                </Button>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50/50 border-b border-gray-100">
                                        <TableRow className="h-12 hover:bg-transparent">
                                            <TableHead className="pl-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Idx</TableHead>
                                            {itemFields ? (
                                                itemFields.map(f => (
                                                    <TableHead key={f.key} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.label}</TableHead>
                                                ))
                                            ) : (
                                                <>
                                                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[300px]">Item Description</TableHead>
                                                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Qty</TableHead>
                                                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Rate</TableHead>
                                                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">GST %</TableHead>
                                                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-8">Amount</TableHead>
                                                </>
                                            )}
                                            <TableHead className="w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-50">
                                        <AnimatePresence mode="popLayout">
                                            {items.map((item, index) => (
                                                <motion.tr key={index} layout className="group hover:bg-slate-50/50 transition-colors">
                                                    <TableCell className="pl-8 text-[11px] font-black text-slate-300 w-12">{index + 1}</TableCell>
                                                    {itemFields ? (
                                                        itemFields.map(field => (
                                                            <TableCell key={field.key}>
                                                                <input
                                                                    type={field.type === 'number' ? 'number' : 'text'}
                                                                    value={item[field.key] || ""}
                                                                    onChange={(e) => updateItem(index, field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                                                                    className="w-full h-9 px-3 bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg text-sm font-medium transition-all outline-none"
                                                                    placeholder={field.ph || ""}
                                                                />
                                                            </TableCell>
                                                        ))
                                                    ) : (
                                                        <>
                                                            <TableCell>
                                                                <input
                                                                    value={item.description || ""}
                                                                    onChange={(e) => updateItem(index, "description", e.target.value)}
                                                                    className="w-full h-9 px-3 bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg text-sm font-medium transition-all outline-none"
                                                                    placeholder="Resource narrative..."
                                                                />
                                                            </TableCell>
                                                            <TableCell className="w-24">
                                                                <input
                                                                    type="number"
                                                                    value={item.quantity || ""}
                                                                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                                                                    className="w-full h-9 px-3 bg-transparent text-right border border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg text-sm font-medium transition-all outline-none"
                                                                />
                                                            </TableCell>
                                                            <TableCell className="w-32">
                                                                <input
                                                                    type="number"
                                                                    value={item.unitPrice || ""}
                                                                    onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))}
                                                                    className="w-full h-9 px-3 bg-transparent text-right border border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg text-sm font-medium transition-all outline-none"
                                                                />
                                                            </TableCell>
                                                            <TableCell className="w-24">
                                                                <input
                                                                    type="number"
                                                                    value={item.taxRate || ""}
                                                                    onChange={(e) => updateItem(index, "taxRate", Number(e.target.value))}
                                                                    className="w-full h-9 px-3 bg-transparent text-right border border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg text-sm font-medium transition-all outline-none"
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-right pr-8 text-sm font-bold text-slate-900 tracking-tight">
                                                                {((item.amount || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                            </TableCell>
                                                        </>
                                                    )}
                                                    <TableCell className="pr-4">
                                                        <button
                                                            onClick={() => handleRemoveItem(index)}
                                                            className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {!itemFields && (
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="flex-1 space-y-4">
                                    <div className="bg-white p-6 rounded-[1.5rem] border border-gray-200 shadow-sm space-y-3">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Remarks</h4>
                                        <textarea 
                                            className="w-full min-h-[100px] p-4 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-medium outline-none focus:bg-white focus:border-indigo-500 transition-all resize-none"
                                            placeholder="Write remarks or terms..."
                                            value={header.notes || ""}
                                            onChange={(e) => setHeader({ ...header, notes: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="w-full md:w-96 bg-white rounded-[1.5rem] border border-gray-200 shadow-sm p-8 space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Net Total</span>
                                        <span className="font-bold text-slate-900">{fmt(totals.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">GST Account</span>
                                        <span className="font-bold text-slate-900">{fmt(totals.tax)}</span>
                                    </div>
                                    <div className="h-px bg-slate-100" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Grand Total</span>
                                        <span className="text-xl font-black text-indigo-600 tracking-tighter">{fmt(totals.grandTotal)}</span>
                                    </div>
                                    <div className="pt-4">
                                        <Button
                                            onClick={() => onSave(header, items)}
                                            className="w-full h-14 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-slate-900/10"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Entry
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {itemFields && (
                            <div className="flex justify-end pt-6 pb-12">
                                <Button
                                    onClick={() => onSave(header, items)}
                                    className="h-14 px-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-indigo-600/20"
                                >
                                    <Save className="w-4 h-4 mr-3" />
                                    Finalize Node Entry
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="max-w-2xl mx-auto pt-8 pb-20">
                        <Button
                            onClick={() => onSave(header, [])}
                            className="w-full h-14 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-slate-900/10 transition-all"
                        >
                            <Save className="w-4 h-4 mr-3" />
                            Submit Verification Hub
                        </Button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
