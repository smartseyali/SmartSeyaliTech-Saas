import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { listFactors, unenroll, type MfaFactor } from "@/lib/auth/mfa";
import { MFASetupDialog } from "./MFASetupDialog";

export function MFASection() {
    const [factors, setFactors] = useState<MfaFactor[]>([]);
    const [loading, setLoading] = useState(true);
    const [setupOpen, setSetupOpen] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const all = await listFactors();
            setFactors(all);
        } catch (err: any) {
            toast.error(err?.message || "Failed to load MFA status");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const verifiedTotp = factors.find((f) => f.factorType === "totp" && f.status === "verified");

    const handleRemove = async (factorId: string) => {
        if (!confirm("Disable two-factor authentication? Your account will be less secure.")) return;
        setRemovingId(factorId);
        try {
            await unenroll(factorId);
            toast.success("Two-factor authentication disabled");
            await refresh();
        } catch (err: any) {
            toast.error(err?.message || "Failed to disable MFA");
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div className="space-y-3 max-w-2xl">
            <div className="flex items-start justify-between gap-3 p-3 rounded-md border border-gray-200 dark:border-border bg-gray-50/50 dark:bg-accent/20">
                <div className="flex items-start gap-2">
                    {verifiedTotp ? (
                        <ShieldCheck className="w-4 h-4 text-success-700 mt-0.5" />
                    ) : (
                        <ShieldOff className="w-4 h-4 text-gray-400 mt-0.5" />
                    )}
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-foreground">
                            Authenticator app (TOTP)
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                            {verifiedTotp
                                ? `Enabled · added ${new Date(verifiedTotp.createdAt).toLocaleDateString()}`
                                : "Use Google Authenticator, Authy, or 1Password for one-time codes."}
                        </p>
                    </div>
                </div>

                <div className="shrink-0">
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : verifiedTotp ? (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemove(verifiedTotp.id)}
                            disabled={removingId === verifiedTotp.id}
                            className="text-destructive hover:bg-destructive-100 hover:text-destructive"
                        >
                            {removingId === verifiedTotp.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <>
                                    <Trash2 className="w-3.5 h-3.5" /> Disable
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button size="sm" onClick={() => setSetupOpen(true)}>
                            <ShieldCheck className="w-3.5 h-3.5" /> Enable
                        </Button>
                    )}
                </div>
            </div>

            <MFASetupDialog
                open={setupOpen}
                onOpenChange={setSetupOpen}
                onVerified={refresh}
            />
        </div>
    );
}
