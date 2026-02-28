import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import {
    Upload, FileText, CheckCircle2, AlertCircle,
    Download, ArrowLeft, RefreshCw, X
} from "lucide-react";
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
        a.href = url;
        a.download = 'product_upload_template.csv';
        a.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
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
                headers.forEach((header, i) => {
                    obj[header] = values[i]?.trim();
                });
                return obj;
            });

            setPreviewData(data);
            setStatus("preview");
        };
        reader.readAsText(file);
    };

    const startImport = async () => {
        if (!activeCompany || previewData.length === 0) return;

        setIsProcessing(true);
        setErrorLogs([]);

        try {
            const productsToInsert = previewData.map(row => ({
                company_id: activeCompany.id,
                name: row["Name"],
                sku: row["SKU"],
                category: row["Category"],
                rate: parseFloat(row["Sale Price"]) || 0,
                description: row["Description"],
                image_url: row["Image URL"],
                is_featured: row["Is Featured"]?.toLowerCase() === "true",
                is_best_seller: row["Is Best Seller"]?.toLowerCase() === "true",
                meta_title: row["Meta Title"],
                meta_description: row["Meta Description"],
                is_ecommerce: true,
                status: "active"
            }));

            const { error } = await supabase.from("products").insert(productsToInsert);

            if (error) throw error;

            setStatus("success");
            toast({
                title: "Import Successful",
                description: `Successfully imported ${productsToInsert.length} products.`,
            });
        } catch (err: any) {
            console.error("Import error:", err);
            setStatus("error");
            setErrorLogs([err.message || "An unknown error occurred during import."]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="rounded-xl">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Bulk Product Import</h1>
                        <p className="text-sm text-muted-foreground mt-1">Upload CSV or use our template for high-speed catalog expansion</p>
                    </div>
                </div>

                <Button variant="outline" onClick={downloadTemplate} className="rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest border-primary/20 hover:bg-primary/5">
                    <Download className="w-4 h-4 text-primary" />
                    Download Template
                </Button>
            </div>

            {status === "idle" && (
                <div
                    className="border-2 border-dashed border-border rounded-[3rem] p-20 flex flex-col items-center justify-center space-y-6 bg-card transition-all hover:border-primary/50 hover:bg-secondary/20 cursor-pointer relative overflow-hidden group"
                >
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Upload className="w-10 h-10" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold">Drop your CSV here</h3>
                        <p className="text-muted-foreground font-medium">Click to browse or drag and drop your product file</p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest opacity-50">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Max 5MB</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> UTF-8 Only</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> CSV Format</span>
                    </div>
                </div>
            )}

            {status === "preview" && (
                <div className="space-y-6">
                    <div className="glass-card-solid p-6 flex items-center justify-between border-primary/20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black uppercase text-xs tracking-widest opacity-50">File Preview</h3>
                                <p className="font-bold">{file?.name} • {previewData.length} Items Found</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => { setFile(null); setStatus("idle"); }} className="rounded-xl font-bold">Cancel</Button>
                            <Button onClick={startImport} disabled={isProcessing} className="rounded-xl font-black uppercase tracking-widest px-8 shadow-xl shadow-primary/20">
                                {isProcessing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isProcessing ? "Importing..." : "Commit Import"}
                            </Button>
                        </div>
                    </div>

                    <div className="glass-card-solid overflow-hidden border">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        {TEMPLATE_HEADERS.map(h => (
                                            <th key={h} className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.map((row, i) => (
                                        <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                            {TEMPLATE_HEADERS.map(h => (
                                                <td key={h} className="px-5 py-3 text-xs font-semibold truncate max-w-[150px]">{row[h] || "-"}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {status === "success" && (
                <div className="text-center py-20 bg-green-50 rounded-[3rem] border border-green-200 animate-in zoom-in duration-500 space-y-6">
                    <div className="w-20 h-20 bg-green-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-green-200 text-white">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black tracking-tight text-green-950">Mission Accomplished!</h2>
                        <p className="text-green-700/80 font-medium max-w-sm mx-auto">Catalalogue expanded successfully. All products are now live in your ecommerce store.</p>
                    </div>
                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={() => setStatus("idle")} className="rounded-xl font-bold border-green-200 hover:bg-green-100">Import More</Button>
                        <Button onClick={() => navigate("/ecommerce/masters/products")} className="rounded-xl font-black uppercase tracking-widest bg-green-600 hover:bg-green-700">View Catalog</Button>
                    </div>
                </div>
            )}

            {status === "error" && (
                <div className="space-y-6 animate-in slide-in-from-top-10 duration-500">
                    <div className="bg-red-50 border border-red-200 rounded-[2.5rem] p-8 flex items-start gap-6">
                        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-red-950">Import Failed</h3>
                            <p className="text-red-700/80 font-medium">We encountered issues while processing your file. See logs below.</p>
                        </div>
                        <Button variant="ghost" onClick={() => setStatus("preview")} className="ml-auto rounded-xl hover:bg-red-100">Retry</Button>
                    </div>

                    <div className="bg-black/90 rounded-2xl p-6 font-mono text-xs text-red-400 space-y-2 max-h-60 overflow-y-auto shadow-2xl">
                        <p className="opacity-50 border-b border-red-900/50 pb-2 mb-4 uppercase tracking-[0.2em] font-black italic">Critical Error Sequence</p>
                        {errorLogs.map((log, i) => (
                            <p key={i}>&gt; {log}</p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
