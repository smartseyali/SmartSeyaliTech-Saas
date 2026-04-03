import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
    ArrowRight, 
    FileText, 
    Printer, 
    Send, 
    CheckCircle2, 
    Clock, 
    AlertCircle,
    ChevronLeft
} from "lucide-react";
import { StatusBadge } from "./ERPListView";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TransactionService } from "@/lib/services/transactionService";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";

interface TransactionalViewProps {
    title: string;
    resourceName: string; // sales_quotations, sales_orders, etc.
    data: any;
    onBack: () => void;
    onRefresh: () => void;
}

export function TransactionalView({ title, resourceName, data, onBack, onRefresh }: TransactionalViewProps) {
    const { user } = useAuth();
    const { activeCompany } = useTenant();
    const [actionLoading, setActionLoading] = useState(false);

    const handleAction = async (action: string) => {
        if (!user || !activeCompany) return;
        
        setActionLoading(true);
        try {
            if (resourceName === 'sales_quotations' && action === 'convert_to_order') {
                const { orderId } = await TransactionService.convertQuotationToOrder(data.id, user.id, activeCompany.id);
                toast.success("Quotation successfully converted to Sales Order: " + orderId);
                onRefresh();
            } else if (resourceName === 'sales_orders' && action === 'generate_invoice') {
                const { invoiceId } = await TransactionService.generateInvoiceFromOrder(data.id, user.id, activeCompany.id);
                toast.success("Invoice generated successfully: " + invoiceId);
                onRefresh();
            } else if (resourceName === 'purchase_orders' && action === 'convert_to_grn') {
                const { grnId } = await TransactionService.convertPurchaseOrderToGRN(data.id, user.id, activeCompany.id);
                toast.success("Goods Receipt established: " + grnId);
                onRefresh();
            } else if (resourceName === 'purchase_orders' && action === 'generate_bill') {
                const { billId } = await TransactionService.generateBillFromPurchaseOrder(data.id, user.id, activeCompany.id);
                toast.success("Supplier Bill generated: " + billId);
                onRefresh();
            } else {
                toast.info("Action '" + action + "' is not yet implemented for this resource.");
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f8fafc]/50">
            {/* Contextual Header */}
            <div className="sticky top-0 z-30 bg-white border-b border-slate-200">
                <div className="flex items-center justify-between h-14 px-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 text-slate-500">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h1 className="text-[13px] font-bold tracking-tight text-slate-950 uppercase">{title}</h1>
                                <span className="text-[13px] font-bold text-slate-400">/</span>
                                <span className="text-[13px] font-bold text-slate-600 tracking-wider">#{data.reference_no}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 font-sans">
                        <div className="flex items-center gap-1.5 mr-1.5 border-r border-slate-200 pr-1.5">
                            <Button variant="ghost" size="sm" onClick={() => window.print()} className="h-8 px-2.5 text-slate-600 font-bold text-xs uppercase tracking-widest gap-2">
                                <Printer className="w-3.5 h-3.5" /> Print
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                                const email = data.customer_email || "";
                                const subject = encodeURIComponent(`${title} #${data.reference_no}`);
                                const body = encodeURIComponent(`Dear ${data.customer_name || data.vendor_name || "Customer"},\n\nPlease find the details for ${title} #${data.reference_no}.\n\nGrand Total: ₹${data.grand_total?.toLocaleString()}\n\nThank you.`);
                                window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_self");
                            }} className="h-8 px-2.5 text-slate-600 font-bold text-xs uppercase tracking-widest gap-2">
                                <Send className="w-3.5 h-3.5" /> Email
                            </Button>
                        </div>
                        
                        {/* ── LIFECYCLE ACTIONS ────────────────── */}
                        {resourceName === 'sales_quotations' && data.status !== 'converted' && (
                            <Button 
                                onClick={() => handleAction('convert_to_order')}
                                disabled={actionLoading}
                                className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold shadow-sm uppercase tracking-widest gap-2"
                            >
                                <ArrowRight className="w-3.5 h-3.5" />
                                Convert to Order
                            </Button>
                        )}

                        {resourceName === 'sales_orders' && data.status !== 'invoiced' && (
                            <Button 
                                onClick={() => handleAction('generate_invoice')}
                                disabled={actionLoading}
                                className="h-8 px-4 bg-slate-900 hover:bg-black text-white text-[12px] font-bold shadow-sm uppercase tracking-widest gap-2"
                            >
                                <FileText className="w-3.5 h-3.5" />
                                Generate Invoice
                            </Button>
                        )}

                        {resourceName === 'purchase_orders' && data.status !== 'received' && (
                            <Button 
                                onClick={() => handleAction('convert_to_grn')}
                                disabled={actionLoading}
                                className="h-8 px-4 bg-green-600 hover:bg-green-700 text-white text-[12px] font-bold shadow-sm uppercase tracking-widest gap-2"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Record GRN
                            </Button>
                        )}

                        {resourceName === 'purchase_orders' && data.status !== 'billed' && (
                            <Button 
                                onClick={() => handleAction('generate_bill')}
                                disabled={actionLoading}
                                className="h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-bold shadow-sm uppercase tracking-widest gap-2"
                            >
                                <FileText className="w-3.5 h-3.5" />
                                Generate Bill
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 flex gap-4">
                {/* Main Doc */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-8 min-h-[600px]">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <div className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1">
                                {resourceName.replace('sales_', '').replace('_', ' ')}
                            </div>
                            <div className="text-slate-500 font-bold text-[13px] uppercase tracking-widest">
                                Transaction Summary
                            </div>
                        </div>
                        <StatusBadge status={data.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-12 mb-12">
                        <div className="space-y-4">
                            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Customer Details</p>
                            <div className="space-y-1">
                                <p className="font-bold text-slate-900">{data.customer_name || data.vendor_name || '—'}</p>
                                {data.customer_email && <p className="text-[13px] text-slate-500 font-medium">{data.customer_email}</p>}
                            </div>
                        </div>
                        <div className="space-y-4 text-right">
                            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Date & Reference</p>
                            <div className="space-y-1">
                                <p className="font-bold text-slate-900">{new Date(data.date).toLocaleDateString()}</p>
                                <p className="text-[13px] text-slate-600 font-bold tracking-wider">{data.reference_no}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border border-slate-100 rounded-xl overflow-hidden mb-12">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-3 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Item Description</th>
                                    <th className="px-4 py-3 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-right">Qty</th>
                                    <th className="px-4 py-3 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-right">Price</th>
                                    <th className="px-4 py-3 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data.items || []).map((item: any) => (
                                    <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                                        <td className="px-4 py-4">
                                            <p className="font-bold text-slate-900 text-[13px]">{item.description || item.product_name || 'Service/Product'}</p>
                                            {item.sku && <p className="text-[11px] text-slate-400 font-medium">{item.sku}</p>}
                                        </td>
                                        <td className="px-4 py-4 text-right font-bold text-[13px] text-slate-600">{item.qty || 1}</td>
                                        <td className="px-4 py-4 text-right font-bold text-[13px] text-slate-600">₹{item.unit_price?.toLocaleString() || '0'}</td>
                                        <td className="px-4 py-4 text-right font-bold text-[13px] text-slate-900">₹{item.amount?.toLocaleString() || '0'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end pr-4">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-[13px]">
                                <span className="font-bold text-slate-500 uppercase">Subtotal</span>
                                <span className="font-bold text-slate-900">₹{data.subtotal?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[13px]">
                                <span className="font-bold text-slate-500 uppercase">Tax (GST)</span>
                                <span className="font-bold text-slate-900">₹{data.tax_amount?.toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-slate-100 my-2" />
                            <div className="flex justify-between">
                                <span className="font-extrabold text-slate-900 uppercase tracking-wider">Grand Total</span>
                                <span className="font-black text-blue-600 text-lg">₹{data.grand_total?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Context */}
                <div className="w-80 space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-[11px] font-extrabold text-slate-950 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            Workflow Pipeline
                        </h3>
                        <div className="space-y-6 relative ml-1.5 border-l-2 border-slate-100 pl-4">
                            <div className="relative">
                                <div className="absolute -left-[23px] top-0 w-3.5 h-3.5 bg-green-500 rounded-full border-4 border-white shadow-sm ring-4 ring-green-100" />
                                <p className="text-[13px] font-bold text-slate-900 leading-none">Draft Created</p>
                                <p className="text-[11px] text-slate-400 mt-1">29 Mar 2026, 12:45 PM</p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[23px] top-0 w-3.5 h-3.5 bg-blue-500 rounded-full border-4 border-white shadow-sm ring-4 ring-blue-100 animate-pulse" />
                                <p className="text-[13px] font-bold text-slate-900 leading-none">Pending Approval</p>
                                <p className="text-[11px] text-slate-400 mt-1">In Queue</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-xl shadow-xl p-6 text-white border border-slate-800">
                        <AlertCircle className="w-6 h-6 text-blue-400 mb-4" />
                        <h4 className="text-[13px] font-bold uppercase tracking-wider mb-2">Automation Alert</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            Upon conversion to Sales Order, a stock reservation job will automatically trigger in the Inventory module.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
