import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, FileImage, Film, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MediaUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    folder?: string;
    bucket?: string;
    type?: "image" | "video";
    accept?: string;
    className?: string;
}

export function MediaUpload({
    value,
    onChange,
    label,
    folder = "general",
    bucket = "ecommerce",
    type = "image",
    accept,
    className
}: MediaUploadProps) {
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;

            setUploading(true);

            // Create a unique file name
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = folder ? `${folder}/${fileName}` : fileName;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (error) throw error;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            onChange(publicUrl);
            toast({ title: "Media uploaded successfully" });
        } catch (error: any) {
            console.error("Upload error:", error);
            toast({
                variant: "destructive",
                title: "Upload failed",
                description: error.message || "Failed to upload media"
            });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeMedia = () => {
        onChange("");
    };

    const isVideo = type === "video" || value.toLowerCase().match(/\.(mp4|webm|ogg)$/);

    return (
        <div className={cn("space-y-3", className)}>
            {label && (
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">
                    {label}
                </Label>
            )}

            <div className="relative group/media">
                {value ? (
                    <div className="relative rounded-[32px] overflow-hidden border border-slate-200 bg-slate-50 aspect-video sm:aspect-square flex items-center justify-center group/preview">
                        {isVideo ? (
                            <video src={value} className="w-full h-full object-cover" controls />
                        ) : (
                            <img src={value} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-110" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="h-10 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 tracking-tight"
                            >
                                Replace
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={removeMedia}
                                className="h-10 rounded-xl bg-rose-500 hover:bg-rose-600 font-bold"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "flex flex-col items-center justify-center gap-6 p-12 border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50/50 cursor-pointer hover:bg-white hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-500 group/upload",
                            uploading && "opacity-50 pointer-events-none"
                        )}
                    >
                        <div className="w-20 h-20 rounded-[28px] bg-white shadow-sm flex items-center justify-center group-hover/upload:scale-110 group-hover/upload:rotate-3 transition-all duration-500 border border-slate-100">
                            {uploading ? (
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            ) : type === "video" ? (
                                <Film className="w-8 h-8 text-slate-300 group-hover:text-blue-500 transition-colors" />
                            ) : (
                                <Upload className="w-8 h-8 text-slate-300 group-hover:text-blue-500 transition-colors" />
                            )}
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                                {uploading ? "Transferring Data..." : `Register ${type}`}
                            </p>
                            <p className="text-[10px] font-medium text-slate-400 italic">
                                Select from local repository or drag/drop
                            </p>
                        </div>
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUpload}
                    accept={accept || (type === "image" ? "image/*" : "video/*")}
                    className="hidden"
                />
            </div>
        </div>
    );
}
