import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { Plus, Trash2, Printer, Upload, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

/* ═════════════════════════════════════════════════════════════════════════
   Types & helpers
   ═════════════════════════════════════════════════════════════════════════ */

interface LineItem {
    id: string;
    product: string;
    description: string;
    price: number;
}

type WatermarkMode = "text" | "image" | "none";

const uid = () => Math.random().toString(36).slice(2, 9);

const formatINR = (n: number) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n || 0);

const todayDDMMYYYY = () => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}-${mm}-${d.getFullYear()}`;
};

const readFileAsDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(file);
    });

/* ═════════════════════════════════════════════════════════════════════════
   Defaults
   ═════════════════════════════════════════════════════════════════════════ */

const DEFAULTS = {
    platformName: "SmartSeyali",
    title: "Quotation",
    brandColor: "#0F9AAE",
    brandDark: "#0B6F7F",
    headerColor: "#1FA7B9",
    rowColor: "#D6EDF1",
    logoDataUrl: "" as string,
    watermarkMode: "text" as WatermarkMode,
    watermarkText: "S",
    watermarkImage: "" as string,
    watermarkOpacity: 0.08,
    address1: "2/98B Nethaji Street,",
    address2: "Tiruppur - 641604",
    phone: "+91 90477 36612",
    email: "smartseyali@gmail.com",
    website: "www.smartseyali.com",
    recipientName: "Prayanam",
    recipientCity: "Coimbatore",
    recipientState: "Tamil Nadu",
    notes:
        "Important Update on Recurring Costs:\nDomain Renewal: ₹1000-2000 (approximate cost increases yearly) / year",
};

/* ═════════════════════════════════════════════════════════════════════════
   Page
   ═════════════════════════════════════════════════════════════════════════ */

export default function SuperAdminQuotations() {
    /* Branding */
    const [platformName, setPlatformName] = useState(DEFAULTS.platformName);
    const [title, setTitle] = useState(DEFAULTS.title);
    const [brandColor, setBrandColor] = useState(DEFAULTS.brandColor);
    const [brandDark, setBrandDark] = useState(DEFAULTS.brandDark);
    const [headerColor, setHeaderColor] = useState(DEFAULTS.headerColor);
    const [rowColor, setRowColor] = useState(DEFAULTS.rowColor);
    const [logo, setLogo] = useState<string>(DEFAULTS.logoDataUrl);

    /* Watermark */
    const [watermarkMode, setWatermarkMode] = useState<WatermarkMode>(DEFAULTS.watermarkMode);
    const [watermarkText, setWatermarkText] = useState(DEFAULTS.watermarkText);
    const [watermarkImage, setWatermarkImage] = useState(DEFAULTS.watermarkImage);
    const [watermarkOpacity, setWatermarkOpacity] = useState(DEFAULTS.watermarkOpacity);

    /* Company footer */
    const [address1, setAddress1] = useState(DEFAULTS.address1);
    const [address2, setAddress2] = useState(DEFAULTS.address2);
    const [phone, setPhone] = useState(DEFAULTS.phone);
    const [email, setEmail] = useState(DEFAULTS.email);
    const [website, setWebsite] = useState(DEFAULTS.website);

    /* Recipient */
    const [recipientName, setRecipientName] = useState(DEFAULTS.recipientName);
    const [recipientCity, setRecipientCity] = useState(DEFAULTS.recipientCity);
    const [recipientState, setRecipientState] = useState(DEFAULTS.recipientState);
    const [date, setDate] = useState(todayDDMMYYYY());
    const [notes, setNotes] = useState(DEFAULTS.notes);

    const [items, setItems] = useState<LineItem[]>([
        { id: uid(), product: "Development", description: "Web site with required feature", price: 5000 },
        { id: uid(), product: "Server Hosting and Maintenance", description: "Hostinger Server management", price: 5000 },
    ]);

    const total = useMemo(
        () => items.reduce((s, i) => s + (Number(i.price) || 0), 0),
        [items],
    );

    const logoInputRef = useRef<HTMLInputElement>(null);
    const watermarkInputRef = useRef<HTMLInputElement>(null);

    const handleUpload =
        (setter: (v: string) => void) =>
        async (e: ChangeEvent<HTMLInputElement>) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const url = await readFileAsDataURL(f);
            setter(url);
            e.target.value = "";
        };

    const updateItem = (id: string, patch: Partial<LineItem>) =>
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

    const addItem = () =>
        setItems((prev) => [...prev, { id: uid(), product: "", description: "", price: 0 }]);

    const removeItem = (id: string) =>
        setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));

    const handleReset = () => {
        setPlatformName(DEFAULTS.platformName);
        setTitle(DEFAULTS.title);
        setBrandColor(DEFAULTS.brandColor);
        setBrandDark(DEFAULTS.brandDark);
        setHeaderColor(DEFAULTS.headerColor);
        setRowColor(DEFAULTS.rowColor);
        setLogo(DEFAULTS.logoDataUrl);
        setWatermarkMode(DEFAULTS.watermarkMode);
        setWatermarkText(DEFAULTS.watermarkText);
        setWatermarkImage(DEFAULTS.watermarkImage);
        setWatermarkOpacity(DEFAULTS.watermarkOpacity);
        setAddress1(DEFAULTS.address1);
        setAddress2(DEFAULTS.address2);
        setPhone(DEFAULTS.phone);
        setEmail(DEFAULTS.email);
        setWebsite(DEFAULTS.website);
        setRecipientName(DEFAULTS.recipientName);
        setRecipientCity(DEFAULTS.recipientCity);
        setRecipientState(DEFAULTS.recipientState);
        setDate(todayDDMMYYYY());
        setNotes(DEFAULTS.notes);
    };

    const handlePrint = () => window.print();

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Print-only CSS */}
            <style>{`
                @media print {
                    @page { size: A4; margin: 0; }
                    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
                    body * { visibility: hidden !important; }
                    .quote-print-root, .quote-print-root * { visibility: visible !important; }
                    .quote-print-root {
                        position: absolute !important;
                        left: 0; top: 0;
                        width: 210mm; height: 297mm;
                        margin: 0 !important; padding: 0 !important;
                        box-shadow: none !important;
                    }
                    .quote-no-print { display: none !important; }
                }
            `}</style>

            <div className="quote-no-print p-4 md:p-6 max-w-[1400px] mx-auto space-y-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Quotation Generator</h1>
                        <p className="text-sm text-muted-foreground">
                            Every field, logo, watermark and color is editable — changes apply instantly to the preview below.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleReset} className="gap-2">
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </Button>
                        <Button onClick={handlePrint} className="gap-2">
                            <Printer className="h-4 w-4" />
                            Print / Save as PDF
                        </Button>
                    </div>
                </div>

                {/* Branding Card */}
                <Card className="p-4 md:p-5 space-y-5">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Branding</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Platform identity shown on the quote header.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Field label="Platform Name">
                            <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
                        </Field>
                        <Field label="Document Title">
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                        </Field>
                        <Field label="Logo">
                            <div className="flex items-center gap-2">
                                {logo ? (
                                    <div className="flex items-center gap-2">
                                        <img src={logo} alt="logo" className="h-10 w-10 rounded object-contain border bg-white" />
                                        <Button type="button" size="sm" variant="ghost" className="h-8 px-2" onClick={() => setLogo("")}>
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                        Default
                                    </div>
                                )}
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleUpload(setLogo)}
                                />
                                <Button type="button" size="sm" variant="outline" className="gap-1.5 h-9" onClick={() => logoInputRef.current?.click()}>
                                    <Upload className="h-3.5 w-3.5" />
                                    Upload
                                </Button>
                            </div>
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Field label="Brand Color (Primary)">
                            <ColorInput value={brandColor} onChange={setBrandColor} />
                        </Field>
                        <Field label="Brand Dark (Ribbon / Footer)">
                            <ColorInput value={brandDark} onChange={setBrandDark} />
                        </Field>
                        <Field label="Table Header">
                            <ColorInput value={headerColor} onChange={setHeaderColor} />
                        </Field>
                        <Field label="Row Background">
                            <ColorInput value={rowColor} onChange={setRowColor} />
                        </Field>
                    </div>
                </Card>

                {/* Watermark Card */}
                <Card className="p-4 md:p-5 space-y-5">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Watermark</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Background mark behind the quotation content.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Field label="Mode">
                            <Select value={watermarkMode} onValueChange={(v) => setWatermarkMode(v as WatermarkMode)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="image">Image</SelectItem>
                                    <SelectItem value="none">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        {watermarkMode === "text" && (
                            <Field label="Watermark Text">
                                <Input value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} maxLength={6} />
                            </Field>
                        )}

                        {watermarkMode === "image" && (
                            <Field label="Watermark Image">
                                <div className="flex items-center gap-2">
                                    {watermarkImage ? (
                                        <div className="flex items-center gap-2">
                                            <img src={watermarkImage} alt="watermark" className="h-10 w-10 rounded object-contain border bg-white" />
                                            <Button type="button" size="sm" variant="ghost" className="h-8 px-2" onClick={() => setWatermarkImage("")}>
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                            None
                                        </div>
                                    )}
                                    <input
                                        ref={watermarkInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleUpload(setWatermarkImage)}
                                    />
                                    <Button type="button" size="sm" variant="outline" className="gap-1.5 h-9" onClick={() => watermarkInputRef.current?.click()}>
                                        <Upload className="h-3.5 w-3.5" />
                                        Upload
                                    </Button>
                                </div>
                            </Field>
                        )}

                        <Field label={`Opacity (${Math.round(watermarkOpacity * 100)}%)`}>
                            <input
                                type="range"
                                min={0}
                                max={0.4}
                                step={0.01}
                                value={watermarkOpacity}
                                onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                                className="w-full"
                            />
                        </Field>
                    </div>
                </Card>

                {/* Company Footer Card */}
                <Card className="p-4 md:p-5 space-y-5">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Company Contact (Footer)</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Appears on the teal wave at the bottom of the quote.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Address Line 1">
                            <Input value={address1} onChange={(e) => setAddress1(e.target.value)} />
                        </Field>
                        <Field label="Address Line 2">
                            <Input value={address2} onChange={(e) => setAddress2(e.target.value)} />
                        </Field>
                        <Field label="Phone">
                            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </Field>
                        <Field label="Email">
                            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                        </Field>
                        <Field label="Website">
                            <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
                        </Field>
                    </div>
                </Card>

                {/* Recipient + Items + Notes */}
                <Card className="p-4 md:p-5 space-y-5">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Quotation Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Field label="Recipient Name">
                            <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
                        </Field>
                        <Field label="City">
                            <Input value={recipientCity} onChange={(e) => setRecipientCity(e.target.value)} />
                        </Field>
                        <Field label="State">
                            <Input value={recipientState} onChange={(e) => setRecipientState(e.target.value)} />
                        </Field>
                        <Field label="Date">
                            <Input value={date} onChange={(e) => setDate(e.target.value)} placeholder="DD-MM-YYYY" />
                        </Field>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm">Line Items</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1.5 h-8">
                                <Plus className="h-3.5 w-3.5" />
                                Add Row
                            </Button>
                        </div>
                        <div className="overflow-x-auto border rounded-md">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="text-left font-medium px-3 py-2 w-[22%]">Product / Service</th>
                                        <th className="text-left font-medium px-3 py-2">Description</th>
                                        <th className="text-right font-medium px-3 py-2 w-[140px]">Price (₹)</th>
                                        <th className="text-right font-medium px-3 py-2 w-[140px]">Total (₹)</th>
                                        <th className="w-[44px]"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((it) => (
                                        <tr key={it.id} className="border-t">
                                            <td className="px-2 py-1.5">
                                                <Input
                                                    value={it.product}
                                                    onChange={(e) => updateItem(it.id, { product: e.target.value })}
                                                    className="h-9"
                                                />
                                            </td>
                                            <td className="px-2 py-1.5">
                                                <Input
                                                    value={it.description}
                                                    onChange={(e) => updateItem(it.id, { description: e.target.value })}
                                                    className="h-9"
                                                />
                                            </td>
                                            <td className="px-2 py-1.5">
                                                <Input
                                                    type="number"
                                                    inputMode="numeric"
                                                    value={it.price}
                                                    onChange={(e) => updateItem(it.id, { price: Number(e.target.value) || 0 })}
                                                    className="h-9 text-right"
                                                />
                                            </td>
                                            <td className="px-3 py-1.5 text-right tabular-nums">
                                                ₹{formatINR(it.price)}
                                            </td>
                                            <td className="px-2 py-1.5 text-center">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => removeItem(it.id)}
                                                    disabled={items.length <= 1}
                                                    aria-label="Remove row"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t bg-muted/30">
                                        <td colSpan={3} className="px-3 py-2 text-right font-medium">TOTAL</td>
                                        <td className="px-3 py-2 text-right font-semibold tabular-nums">₹ {formatINR(total)}</td>
                                        <td />
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <Field label="Remarks / Notes">
                        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
                    </Field>
                </Card>

                <div className="flex items-center justify-between pt-2">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Preview</h2>
                    <p className="text-xs text-muted-foreground">A4 · 210 × 297 mm</p>
                </div>
            </div>

            {/* Printable Quotation */}
            <div className="flex justify-center pb-8 px-4">
                <QuotationSheet
                    platformName={platformName}
                    title={title}
                    brandColor={brandColor}
                    brandDark={brandDark}
                    headerColor={headerColor}
                    rowColor={rowColor}
                    logo={logo}
                    watermarkMode={watermarkMode}
                    watermarkText={watermarkText}
                    watermarkImage={watermarkImage}
                    watermarkOpacity={watermarkOpacity}
                    address1={address1}
                    address2={address2}
                    phone={phone}
                    email={email}
                    website={website}
                    recipientName={recipientName}
                    recipientCity={recipientCity}
                    recipientState={recipientState}
                    date={date}
                    items={items}
                    total={total}
                    notes={notes}
                />
            </div>
        </div>
    );
}

/* ═════════════════════════════════════════════════════════════════════════
   Field (label + child) helper
   ═════════════════════════════════════════════════════════════════════════ */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-medium">{label}</Label>
            {children}
        </div>
    );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex items-center gap-2">
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-9 w-12 rounded border cursor-pointer bg-transparent"
            />
            <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-9 font-mono text-xs uppercase" />
        </div>
    );
}

/* ═════════════════════════════════════════════════════════════════════════
   Quotation Sheet — visual match to Prayanam reference, fully parameterised.
   ═════════════════════════════════════════════════════════════════════════ */

interface SheetProps {
    platformName: string;
    title: string;
    brandColor: string;
    brandDark: string;
    headerColor: string;
    rowColor: string;
    logo: string;
    watermarkMode: WatermarkMode;
    watermarkText: string;
    watermarkImage: string;
    watermarkOpacity: number;
    address1: string;
    address2: string;
    phone: string;
    email: string;
    website: string;
    recipientName: string;
    recipientCity: string;
    recipientState: string;
    date: string;
    items: LineItem[];
    total: number;
    notes: string;
}

function QuotationSheet(p: SheetProps) {
    return (
        <div
            className="quote-print-root relative bg-white shadow-lg overflow-hidden"
            style={{
                width: "210mm",
                height: "297mm",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                color: "#1a1a1a",
            }}
        >
            {/* Watermark */}
            {p.watermarkMode === "text" && p.watermarkText && (
                <div
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                    style={{
                        fontFamily: "Georgia, serif",
                        fontWeight: 700,
                        fontSize: "560px",
                        color: p.brandColor,
                        opacity: p.watermarkOpacity,
                        lineHeight: 1,
                        marginTop: "-20mm",
                    }}
                >
                    {p.watermarkText}
                </div>
            )}
            {p.watermarkMode === "image" && p.watermarkImage && (
                <div
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                    style={{ opacity: p.watermarkOpacity }}
                >
                    <img src={p.watermarkImage} alt="" style={{ maxWidth: "80%", maxHeight: "70%", objectFit: "contain" }} />
                </div>
            )}

            {/* Top-left ribbon */}
            <svg
                aria-hidden
                className="absolute"
                style={{ top: 0, left: "10mm" }}
                width="70"
                height="130"
                viewBox="0 0 70 130"
            >
                <polygon points="0,0 70,0 70,110 35,82 0,110" fill={p.brandDark} />
            </svg>

            {/* Logo top-right */}
            <div
                className="absolute flex items-center gap-3"
                style={{ top: "12mm", right: "15mm" }}
            >
                {p.logo ? (
                    <img src={p.logo} alt={p.platformName} style={{ height: "48px", width: "auto", maxWidth: "80px", objectFit: "contain" }} />
                ) : (
                    <svg width="48" height="48" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="22" fill="#fff" stroke={p.brandColor} strokeWidth="2" />
                        <text
                            x="24" y="33"
                            textAnchor="middle"
                            fontFamily="Georgia, serif"
                            fontWeight="700"
                            fontSize="30"
                            fill={p.brandDark}
                        >
                            {(p.platformName[0] || "S").toUpperCase()}
                        </text>
                    </svg>
                )}
                <div style={{ color: p.brandDark, fontWeight: 700, fontSize: "20px", letterSpacing: "0.5px" }}>
                    {p.platformName}
                </div>
            </div>

            {/* Title + dashed divider */}
            <div className="absolute" style={{ top: "32mm", left: "20mm", right: "20mm" }}>
                <div
                    className="text-center"
                    style={{
                        color: "#4a5560",
                        fontSize: "22px",
                        fontWeight: 700,
                        letterSpacing: "2px",
                    }}
                >
                    {p.title}
                </div>
                <div style={{ marginTop: "6mm", borderTop: "1.5px dashed #7a8590" }} />
            </div>

            {/* TO + Date */}
            <div
                className="absolute flex justify-between"
                style={{ top: "50mm", left: "20mm", right: "20mm", fontSize: "11px", lineHeight: 1.5 }}
            >
                <div style={{ fontWeight: 700 }}>
                    <div style={{ marginBottom: "3mm" }}>TO</div>
                    <div>{p.recipientName}</div>
                    <div>{p.recipientCity}</div>
                    <div>{p.recipientState}</div>
                </div>
                <div style={{ fontWeight: 700 }}>Date: {p.date}</div>
            </div>

            {/* Items table */}
            <div className="absolute" style={{ top: "78mm", left: "20mm", right: "20mm" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "10.5px" }}>
                    <thead>
                        <tr>
                            <th style={thHeader(p.headerColor, "22%")}>PRODUCT / SERVICE</th>
                            <th style={thHeader(p.headerColor, "auto")}>DESCRIPTION</th>
                            <th style={thHeader(p.headerColor, "18%")}>PRICE</th>
                            <th style={thHeader(p.headerColor, "18%")}>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {p.items.map((it) => (
                            <tr key={it.id}>
                                <td style={tdCell(p.rowColor, "left", 700)}>{it.product}</td>
                                <td style={tdCell(p.rowColor, "left", 500)}>{it.description}</td>
                                <td style={tdCell(p.rowColor, "right", 600)}>₹{formatINR(it.price)}</td>
                                <td style={tdCell(p.rowColor, "right", 600)}>₹{formatINR(it.price)}</td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan={3} style={{ ...tdCell("#fff", "right", 700), borderTop: `1px solid ${p.brandDark}` }}>TOTAL</td>
                            <td style={{ ...tdCell("#fff", "right", 700), borderTop: `1px solid ${p.brandDark}` }}>₹ {formatINR(p.total)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Notes */}
            <div
                className="absolute"
                style={{
                    top: "150mm",
                    left: "20mm",
                    right: "20mm",
                    fontSize: "11px",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                }}
            >
                <div style={{ fontWeight: 700, marginBottom: "2mm" }}>Notes:</div>
                <div style={{ fontWeight: 600 }}>{p.notes}</div>
            </div>

            {/* Bottom wave + contact */}
            <svg
                aria-hidden
                className="absolute"
                style={{ bottom: 0, right: 0 }}
                width="210mm"
                height="70mm"
                viewBox="0 0 800 260"
                preserveAspectRatio="none"
            >
                <path
                    d="M 800 0 L 800 260 L 0 260 L 0 200 Q 180 90 420 150 Q 620 200 800 60 Z"
                    fill={p.brandColor}
                    opacity="0.95"
                />
                <path
                    d="M 800 40 L 800 260 L 80 260 Q 260 160 480 200 Q 660 230 800 140 Z"
                    fill={p.brandDark}
                />
            </svg>

            <div
                className="absolute text-right"
                style={{
                    bottom: "14mm",
                    right: "20mm",
                    color: "#fff",
                    fontSize: "10.5px",
                    lineHeight: 1.7,
                    fontWeight: 600,
                }}
            >
                <div>{p.address1}</div>
                <div>{p.address2}</div>
                <div style={{ marginTop: "2mm" }}>{p.phone}</div>
                <div>{p.email}</div>
                <div>{p.website}</div>
            </div>
        </div>
    );
}

/* ── Cell styles ────────────────────────────────────────────────────────── */

function thHeader(bg: string, width: string): React.CSSProperties {
    return {
        background: bg,
        color: "#fff",
        fontWeight: 700,
        fontSize: "12px",
        letterSpacing: "0.5px",
        padding: "10px 10px",
        textAlign: "center",
        border: "1px solid #fff",
        width,
    };
}

function tdCell(bg: string, align: "left" | "right" | "center", weight: number): React.CSSProperties {
    return {
        background: bg,
        padding: "10px 10px",
        textAlign: align,
        fontWeight: weight,
        border: "1px solid #fff",
        verticalAlign: "top",
    };
}
