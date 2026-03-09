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
    type?: "text" | "number" | "date" | "select";
    required?: boolean;
    options?: { label: string; value: string }[];
    placeholder?: string;
}

interface ERPItem {
    id: string | number;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    amount: number;
}

interface ERPEntryFormProps {
    title: string;
    subtitle?: string;
    headerFields: ERPField[];
    onSave: (header: any, items: ERPItem[]) => Promise<void>;
    onAbort: () => void;
    initialData?: any;
    initialItems?: ERPItem[];
}

export default function ERPEntryForm({
    title,
    subtitle,
    headerFields,
    onSave,
    onAbort,
    initialData,
    initialItems
}: ERPEntryFormProps) {
    const [header, setHeader] = useState<any>(initialData || {});
    const [items, setItems] = useState<ERPItem[]>(initialItems || [{
        id: Date.now(),
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        amount: 0
    }]);

    const [totals, setTotals] = useState({
        subtotal: 0,
        tax: 0,
        grandTotal: 0
    });

    // Auto-calculate individual row amounts and global totals
    useEffect(() => {
        let sub = 0;
        let t = 0;

        const updatedItems = items.map(item => {
            const rowAmount = item.quantity * item.unitPrice;
            const rowTax = (rowAmount * item.taxRate) / 100;
            const totalRow = rowAmount + rowTax;

            sub += rowAmount;
            t += rowTax;

            return { ...item, amount: totalRow };
        });

        // Only update if something changed to avoid infinity loops
        if (JSON.stringify(updatedItems) !== JSON.stringify(items)) {
            setItems(updatedItems);
        }

        setTotals({
            subtotal: sub,
            tax: t,
            grandTotal: sub + t
        });
    }, [items]);

    const handleAddItem = () => {
        setItems([...items, {
            id: Date.now(),
            description: "",
            quantity: 1,
            unitPrice: 0,
            taxRate: 0,
            amount: 0
        }]);
    };

    const handleRemoveItem = (id: string | number) => {
        if (items.length === 1) return; // Keep at least one row
        setItems(items.filter(i => i.id !== id));
    };

    const updateItem = (id: string | number, field: keyof ERPItem, value: any) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[40px] border border-slate-100 shadow-2xl p-10 max-w-7xl mx-auto space-y-12"
        >
            {/* Header / Title */}
            <div className="flex justify-between items-start">
                <div className="space-y-4">
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">{title}</h2>
                    {subtitle && <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>}
                </div>
                <div className="flex gap-4">
                    <Button variant="ghost" onClick={onAbort} className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-rose-500">
                        <X className="w-4 h-4 mr-2" /> Discard Changes
                    </Button>
                    <Button
                        onClick={() => onSave(header, items)}
                        className="h-12 px-10 rounded-2xl bg-indigo-600 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-600/20"
                    >
                        <Save className="w-4 h-4 mr-2" /> Commit Records
                    </Button>
                </div>
            </div>

            {/* Dynamic Header Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8 bg-slate-50/50 rounded-[30px] border border-slate-100/60">
                {headerFields.map(field => (
                    <div key={field.key} className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{field.label}</Label>
                        {field.type === "select" ? (
                            <div className="relative">
                                <select
                                    className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-200 font-bold text-sm focus:ring-4 focus:ring-indigo-600/10 focus:outline-none appearance-none"
                                    value={header[field.key] || ""}
                                    onChange={(e) => setHeader({ ...header, [field.key]: e.target.value })}
                                >
                                    <option value="">Select Option...</option>
                                    {field.options?.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        ) : (
                            <Input
                                type={field.type || "text"}
                                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                                value={header[field.key] || ""}
                                onChange={(e) => setHeader({ ...header, [field.key]: e.target.value })}
                                className="h-14 px-6 rounded-2xl bg-white border border-slate-200 font-bold text-sm focus:ring-4 focus:ring-indigo-600/10"
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Line Items Table (Parent-Child) */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                            <Calculator className="w-4 h-4" />
                        </div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">Line Items Distribution</h3>
                    </div>
                    <Button
                        onClick={handleAddItem}
                        variant="ghost"
                        className="h-10 px-6 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white font-black uppercase tracking-[0.2em] text-[9px] transition-all"
                    >
                        <Plus className="w-3 h-3 mr-2" /> Add Logic Pack
                    </Button>
                </div>

                <div className="border border-slate-100 rounded-[30px] overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                            <TableRow className="h-16 hover:bg-transparent">
                                <TableHead className="pl-8 text-[9px] font-black uppercase tracking-widest text-slate-400 w-[400px]">Description & Specifications</TableHead>
                                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Qty</TableHead>
                                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Unit Price</TableHead>
                                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Tax %</TableHead>
                                <TableHead className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-right pr-8">Subtotal Amount</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-50">
                            <AnimatePresence mode="popLayout">
                                {items.map((item, index) => (
                                    <motion.tr
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="h-24 hover:bg-slate-50/20 group transition-colors"
                                    >
                                        <TableCell className="pl-8">
                                            <Input
                                                value={item.description}
                                                onChange={(e) => updateItem(item.id, "description", e.target.value)}
                                                placeholder="Enter line details..."
                                                className="h-12 border-slate-100 bg-transparent focus:bg-white rounded-xl font-bold italic"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center w-32">
                                            <Input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                                                className="h-12 border-slate-100 bg-transparent text-center focus:bg-white rounded-xl font-bold"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center w-40">
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                                                <Input
                                                    type="number"
                                                    value={item.unitPrice}
                                                    onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                                                    className="h-12 pl-10 border-slate-100 bg-transparent focus:bg-white rounded-xl font-bold"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center w-32">
                                            <Input
                                                type="number"
                                                value={item.taxRate}
                                                onChange={(e) => updateItem(item.id, "taxRate", Number(e.target.value))}
                                                className="h-12 border-slate-100 bg-transparent text-center focus:bg-white rounded-xl font-bold"
                                            />
                                        </TableCell>
                                        <TableCell className="text-right pr-8 font-black text-slate-900">
                                            {fmt(item.amount)}
                                        </TableCell>
                                        <TableCell className="pr-4">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500 transition-all rounded-xl"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Calculations Footer */}
            <div className="flex flex-col md:flex-row justify-between pt-10 border-t border-slate-100 border-dashed gap-12">
                <div className="space-y-6 flex-1">
                    <div className="p-8 bg-slate-50/50 rounded-[30px] border border-slate-100/60 flex items-center gap-6 group">
                        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0">
                            <ImageIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Documentation Attachment</p>
                            <p className="text-xs font-bold italic text-slate-600">Secure digital asset upload feature linked to block records.</p>
                        </div>
                        <Button variant="outline" className="ml-auto h-10 px-6 rounded-xl font-black uppercase text-[9px] tracking-widest border-slate-200">
                            Upload Engine Log
                        </Button>
                    </div>
                </div>

                <div className="w-full md:w-96 space-y-4">
                    <div className="flex justify-between items-center px-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Base Subtotal</span>
                        <span className="font-bold text-slate-600">{fmt(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aggregated Tax</span>
                        <span className="font-bold text-slate-600">{fmt(totals.tax)}</span>
                    </div>
                    <div className="h-px bg-slate-100/60 mx-4" />
                    <div className="flex justify-between items-center p-6 bg-indigo-600 rounded-[2rem] text-white shadow-2xl shadow-indigo-600/30 group">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Total Valuation</span>
                            <p className="text-3xl font-black tracking-tighter uppercase italic leading-none">{fmt(totals.grandTotal)}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ArrowRight className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
