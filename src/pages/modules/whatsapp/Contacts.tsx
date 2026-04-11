import { useState, useRef } from "react";
import { Upload, Download, UserPlus, Tag, Filter } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { useCrud } from "@/hooks/useCrud";
import { supabase } from "@/lib/supabase";
import DocPage from "@/components/modules/DocPage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function WhatsAppContacts() {
  const { activeCompany } = useTenant();
  const { fetchItems } = useCrud("whatsapp_contacts");
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ added: number; skipped: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeCompany) return;

    setImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) {
        setImportResult({ added: 0, skipped: 0, errors: ["CSV must have a header row and at least one data row"] });
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const nameIdx = headers.findIndex((h) => h === "name" || h === "full_name");
      const phoneIdx = headers.findIndex((h) => h === "phone" || h === "mobile" || h === "whatsapp");
      const emailIdx = headers.findIndex((h) => h === "email");
      const tagsIdx = headers.findIndex((h) => h === "tags");

      if (nameIdx === -1 || phoneIdx === -1) {
        setImportResult({ added: 0, skipped: 0, errors: ["CSV must have 'name' and 'phone' columns"] });
        return;
      }

      let added = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        const name = cols[nameIdx];
        const phone = cols[phoneIdx];

        if (!name || !phone) {
          skipped++;
          continue;
        }

        const tags = tagsIdx !== -1 && cols[tagsIdx]
          ? cols[tagsIdx].split(";").map((t) => t.trim()).filter(Boolean)
          : [];

        const { error } = await supabase.from("whatsapp_contacts").upsert(
          {
            company_id: activeCompany.id,
            name,
            phone: phone.replace(/\s+/g, ""),
            email: emailIdx !== -1 ? cols[emailIdx] || null : null,
            tags,
            source: "csv",
            opt_in: true,
            opt_in_at: new Date().toISOString(),
          },
          { onConflict: "company_id,phone" }
        );

        if (error) {
          errors.push(`Row ${i + 1}: ${error.message}`);
          skipped++;
        } else {
          added++;
        }
      }

      setImportResult({ added, skipped, errors });
      fetchItems();
    } catch (err: any) {
      setImportResult({ added: 0, skipped: 0, errors: [err.message] });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <>
      <DocPage
        doctype="whatsappContact"
        headerActions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[10px] font-bold uppercase tracking-widest gap-1.5"
              onClick={() => setShowImport(true)}
            >
              <Upload className="w-3.5 h-3.5" /> Import CSV
            </Button>
          </div>
        }
      />

      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-widest">Import Contacts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-slate-600">CSV Format Requirements:</p>
              <div className="text-[10px] font-mono text-slate-500 bg-white p-3 rounded-lg border">
                name,phone,email,tags<br />
                John Doe,+919876543210,john@mail.com,vip;wholesale<br />
                Jane Smith,+919876543211,,retail
              </div>
              <p className="text-[10px] text-slate-400">Required: <strong>name</strong>, <strong>phone</strong>. Optional: email, tags (semicolon-separated)</p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-emerald-300 transition-colors">
              <Upload className="w-8 h-8 text-slate-300" />
              <label className="cursor-pointer">
                <span className="text-xs font-bold text-emerald-600 hover:underline">Choose CSV file</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleCSVImport}
                  disabled={importing}
                />
              </label>
            </div>

            {importing && (
              <div className="flex items-center gap-2 text-xs text-blue-600 font-bold">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Importing contacts...
              </div>
            )}

            {importResult && (
              <div className={cn(
                "p-4 rounded-xl border text-xs space-y-1",
                importResult.errors.length > 0 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"
              )}>
                <p className="font-bold">{importResult.added} contacts imported, {importResult.skipped} skipped</p>
                {importResult.errors.slice(0, 5).map((err, i) => (
                  <p key={i} className="text-amber-600">{err}</p>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setShowImport(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
