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
        <div className={cn("space-y-2", className)}>
            {label && (
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    {label}
                </Label>
            )}

            <div className="relative group/media">
                {value ? (
                    <div className="relative rounded-2xl overflow-hidden border border-border bg-secondary/20 aspect-video sm:aspect-square flex items-center justify-center">
                        {isVideo ? (
                            <video src={value} className="w-full h-full object-cover" controls />
                        ) : (
                            <img src={value} alt="Preview" className="w-full h-full object-cover" />
                        )}
                        <button
                            type="button"
                            onClick={removeMedia}
                            className="absolute top-2 right-2 p-1.5 rounded-xl bg-black/60 text-white opacity-0 group-hover/media:opacity-100 transition-opacity hover:bg-red-500"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-border/60 rounded-2xl bg-secondary/5 cursor-pointer hover:bg-secondary/10 hover:border-primary/30 transition-all",
                            uploading && "opacity-50 pointer-events-none"
                        )}
                    >
                        {uploading ? (
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        ) : type === "video" ? (
                            <Film className="w-8 h-8 text-muted-foreground/30" />
                        ) : (
                            <FileImage className="w-8 h-8 text-muted-foreground/30" />
                        )}
                        <div className="text-center">
                            <p className="text-xs font-bold text-muted-foreground">
                                {uploading ? "Uploading..." : `Upload ${type}`}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">
                                Click to select file
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
