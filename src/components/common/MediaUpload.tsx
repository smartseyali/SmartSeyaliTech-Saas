import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Film, Loader2 } from "lucide-react";
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
        <div className={cn("flex flex-col h-full w-full", className)}>
            {label && (
                <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                    {label}
                </Label>
            )}

            <div className="relative group/media flex-1 flex flex-col min-h-0">
                {value ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 w-full h-full min-h-[5rem] flex items-center justify-center group/preview">
                        {isVideo ? (
                            <video src={value} className="w-full h-full object-cover" controls />
                        ) : (
                            <img src={value} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover/preview:scale-105" />
                        )}
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="h-8 px-3 rounded-lg bg-white text-slate-900 text-xs font-semibold hover:bg-slate-100"
                            >
                                Replace
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={removeMedia}
                                className="h-8 w-8 p-0 rounded-lg bg-red-500 hover:bg-red-600"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 cursor-pointer hover:bg-white hover:border-blue-400 group/upload transition-all whitespace-nowrap overflow-hidden h-full min-h-[5rem]",
                            uploading && "opacity-50 pointer-events-none"
                        )}
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover/upload:bg-blue-50 transition-colors">
                            {uploading ? (
                                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                            ) : type === "video" ? (
                                <Film className="w-5 h-5 text-slate-400 group-hover/upload:text-blue-500 transition-colors" />
                            ) : (
                                <Upload className="w-5 h-5 text-slate-400 group-hover/upload:text-blue-500 transition-colors" />
                            )}
                        </div>
                        <div className="text-center overflow-hidden w-full">
                            <p className="text-xs font-semibold text-slate-700 truncate">
                                {uploading ? "Uploading..." : `Upload ${type}`}
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
