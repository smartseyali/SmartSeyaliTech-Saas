import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Upload, Link2, Loader2, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  bucket?: string;
  folder?: string;
  /** "circle" for avatars, "rounded" for logos, "square" for favicons */
  shape?: "square" | "rounded" | "circle";
  previewSize?: "sm" | "md" | "lg";
  className?: string;
}

export function ImageUploadField({
  value,
  onChange,
  label,
  hint,
  bucket = "ecommerce",
  folder = "logos",
  shape = "rounded",
  previewSize = "md",
  className,
}: ImageUploadFieldProps) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const applyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setUrlInput("");
  };

  const previewCls = { sm: "w-12 h-12", md: "w-16 h-16", lg: "w-20 h-20" }[previewSize];
  const shapeCls = { square: "rounded", rounded: "rounded-xl", circle: "rounded-full" }[shape];

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-xs font-semibold text-slate-500 tracking-widest block">{label}</label>
      )}
      <div className="flex items-start gap-4">
        {/* Image preview */}
        <div className={cn(
          "border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0",
          previewCls, shapeCls
        )}>
          {value ? (
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-5 h-5 text-slate-300" />
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Mode toggle */}
          <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5 w-fit">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors",
                mode === "upload"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Upload className="w-3 h-3" />
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors",
                mode === "url"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Link2 className="w-3 h-3" />
              Enter URL
            </button>
          </div>

          {/* Upload mode */}
          {mode === "upload" && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                {uploading ? "Uploading…" : value ? "Replace Image" : "Choose Image"}
              </button>
              {value && !uploading && (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 text-xs font-medium transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>
          )}

          {/* URL mode */}
          {mode === "url" && (
            <div className="flex items-center gap-2">
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyUrl()}
                placeholder="https://example.com/logo.png"
                className="flex-1 min-w-0 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
              />
              <button
                type="button"
                onClick={applyUrl}
                disabled={!urlInput.trim()}
                className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-40 whitespace-nowrap"
              >
                Apply
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="h-9 w-9 flex items-center justify-center rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
          {value && (
            <p className="text-[11px] text-slate-400 truncate">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}
