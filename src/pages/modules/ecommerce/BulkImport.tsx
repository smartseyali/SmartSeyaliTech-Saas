import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle2, AlertCircle, Download, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function BulkImport() {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [status, setStatus] = useState<"idle" | "preview" | "success" | "error">("idle");
    const [errorLogs, setErrorLogs] = useState<string[]>([]);

    const TEMPLATE_HEADERS = [
        "Name", "SKU", "Category", "Sale Price", "Description",
        "Image URL", "Is Featured", "Is Best Seller", "Meta Title", "Meta Description"
    ];

    const downloadTemplate = () => {
        const csvContent = [
            TEMPLATE_HEADERS.join(","),
            "Sample Product,SAMPLE-SKU-001,Electronics,19999,Great product description,https://example.com/image.jpg,true,false,SEO Title,SEO Description"
        ].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'product_upload_template.csv'; a.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) { setFile(selectedFile); parseCSV(selectedFile); }
    };

    const parseCSV = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split("\n").filter(l => l.trim());
            const headers = lines[0].split(",").map(h => h.trim());
            const data = lines.slice(1).map(line => {
                const values = line.split(",");
                const obj: any = {};
                headers.forEach((header, i) => { obj[header] = values[i]?.trim(); });
                return obj;
            });
            setPreviewData(data); setStatus("preview");
        };
        reader.readAsText(file);
    };

    const startImport = async () => {
        if (!activeCompany || previewData.length === 0) return;
        setIsProcessing(true); setErrorLogs([]);
        try {
            const productsToInsert = previewData.map(row => ({
                company_id: activeCompany.id,
                name: row["Name"], sku: row["SKU"], category: row["Category"],
                rate: parseFloat(row["Sale Price"]) || 0, description: row["Description"],
                image_url: row["Image URL"],
                is_featured: row["Is Featured"]?.toLowerCase() === "true",
                is_best_seller: row["Is Best Seller"]?.toLowerCase() === "true",
                meta_title: row["Meta Title"], meta_description: row["Meta Description"],
                is_ecommerce: true, status: "active"
            }));
            const { error } = await supabase.from("products").insert(productsToInsert);
            if (error) throw error;
            setStatus("success");
            toast({ title: "Import Successful", description: `Successfully imported ${productsToInsert.length} products.` });
        } catch (err: any) {
            setStatus("error"); setErrorLogs([err.message || "An unknown error occurred."]);
        } finally { setIsProcessing(false); }
    };

    return (
        <div className="p-8 pb-20 space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="rounded-xl text-slate-500 hover:text-slate-700">
                        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                    </Button>
                    <div>
                        <p className="text-xs font-bold  tracking-widest text-slate-400 mb-0.5">Catalog Operations</p>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bulk Product Import</h1>
                    </div>
                </div>
                <Button variant="outline" onClick={downloadTemplate} className="h-10 px-5 rounded-xl font-semibold gap-2 border-slate-200 hover:bg-slate-50">
                    <Download className="w-4 h-4 text-blue-600" /> Download Template
                </Button>
            </div>

            {/* Upload Zone */}
            {status === "idle" && (
                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center gap-5 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/20 transition-all cursor-pointer group">
                    <input type="file" accept=".csv" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                        <Upload className="w-8 h-8" />
                    </div>
                    <div className="text-center space-y-1.5">
                        <h3 className="text-base font-bold text-slate-800">Drop your CSV here</h3>
                        <p className="text-sm text-slate-400 font-medium">Click to browse or drag and drop your product CSV</p>
                    </div>
                    <div className="flex items-center gap-5 text-xs font-semibold text-slate-400">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Max 5MB</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> UTF-8 Only</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> CSV Format</span>
                    </div>
                </div>
            )}

            {/* Preview */}
            {status === "preview" && (
                <div className="space-y-5">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400  tracking-widest">File Preview</p>
                                <p className="text-sm font-bold text-slate-900">{file?.name} · {previewData.length} products found</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => { setFile(null); setStatus("idle"); }} className="h-10 px-5 rounded-xl font-semibold border-slate-200">Cancel</Button>
                            <Button onClick={startImport} disabled={isProcessing} className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-md shadow-blue-600/20">
                                {isProcessing && <RefreshCw className="w-4 h-4 animate-spin" />}
                                {isProcessing ? "Importing..." : "Confirm Import"}
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        {TEMPLATE_HEADERS.map(h => (
                                            <th key={h} className="px-4 py-3 text-[10px] font-bold  tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {previewData.slice(0, 10).map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            {TEMPLATE_HEADERS.map(h => (
                                                <td key={h} className="px-4 py-3 text-xs font-medium text-slate-600 truncate max-w-[150px]">{row[h] || "—"}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {previewData.length > 10 && (
                                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 font-medium">
                                    Showing 10 of {previewData.length} rows
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Success */}
            {status === "success" && (
                <div className="text-center py-20 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-5">
                    <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-200 text-white">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-emerald-900 mb-1">Import Successful!</h2>
                        <p className="text-sm text-emerald-700 font-medium max-w-sm mx-auto">All products are now live in your ecommerce catalog.</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => setStatus("idle")} className="h-10 px-5 rounded-xl font-semibold border-emerald-200 hover:bg-emerald-100 text-emerald-700">Import More</Button>
                        <Button onClick={() => navigate("/apps/ecommerce/masters/products")} className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold">View Catalog</Button>
                    </div>
                </div>
            )}

            {/* Error */}
            {status === "error" && (
                <div className="space-y-4">
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-start gap-4">
                        <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-rose-900 mb-0.5">Import Failed</h3>
                            <p className="text-xs text-rose-700 font-medium">We encountered issues processing your file. See error details below.</p>
                        </div>
                        <Button variant="ghost" onClick={() => setStatus("preview")} className="rounded-xl text-rose-600 hover:bg-rose-100 shrink-0">Retry</Button>
                    </div>
                    <div className="bg-slate-900 rounded-2xl p-5 font-mono text-xs text-rose-400 space-y-2 max-h-52 overflow-y-auto">
                        <p className="text-slate-500 border-b border-slate-700 pb-2 mb-3 font-sans text-[10px]  tracking-widest">Error Log</p>
                        {errorLogs.map((log, i) => <p key={i}>&gt; {log}</p>)}
                    </div>
                </div>
            )}
        </div>
    );
}
