import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Copy, Check } from "lucide-react";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { enrollTotp, unenroll, verifyEnrollment, type TotpEnrollment } from "@/lib/auth/mfa";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onVerified: () => void;
    friendlyName?: string;
};

export function MFASetupDialog({
    open,
    onOpenChange,
    onVerified,
    friendlyName = "Authenticator App",
}: Props) {
    const [enrollment, setEnrollment] = useState<TotpEnrollment | null>(null);
    const [code, setCode] = useState("");
    const [enrolling, setEnrolling] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [copiedSecret, setCopiedSecret] = useState(false);

    useEffect(() => {
        if (!open) {
            setEnrollment(null);
            setCode("");
            setCopiedSecret(false);
            return;
        }
        let cancelled = false;
        setEnrolling(true);
        enrollTotp(friendlyName)
            .then((result) => {
                if (!cancelled) setEnrollment(result);
            })
            .catch((err) => {
                toast.error(err?.message || "Failed to start MFA enrollment");
                onOpenChange(false);
            })
            .finally(() => {
                if (!cancelled) setEnrolling(false);
            });
        return () => {
            cancelled = true;
        };
    }, [open, friendlyName, onOpenChange]);

    const handleVerify = async () => {
        if (!enrollment || code.length !== 6) return;
        setVerifying(true);
        try {
            await verifyEnrollment(enrollment.factorId, code);
            toast.success("Two-factor authentication enabled");
            onVerified();
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err?.message || "Invalid code. Please try again.");
            setCode("");
        } finally {
            setVerifying(false);
        }
    };

    const handleCancel = async () => {
        if (enrollment) {
            try {
                await unenroll(enrollment.factorId);
            } catch {
                // Best-effort cleanup of unverified factor
            }
        }
        onOpenChange(false);
    };

    const copySecret = async () => {
        if (!enrollment?.secret) return;
        try {
            await navigator.clipboard.writeText(enrollment.secret);
            setCopiedSecret(true);
            setTimeout(() => setCopiedSecret(false), 2000);
        } catch {
            toast.error("Couldn't copy to clipboard");
        }
    };

    return (
        <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleCancel())}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        Enable two-factor authentication
                    </DialogTitle>
                    <DialogDescription>
                        Scan the QR code with Google Authenticator, Authy, or 1Password, then enter the 6-digit code below.
                    </DialogDescription>
                </DialogHeader>

                {enrolling || !enrollment ? (
                    <div className="py-10 flex justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div
                            className="mx-auto w-48 h-48 bg-white p-2 rounded-md border border-gray-200 flex items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: enrollment.qrCodeSvg }}
                        />

                        <div className="text-[11px] text-gray-500 text-center space-y-1">
                            <p>Can't scan? Enter this secret manually:</p>
                            <button
                                type="button"
                                onClick={copySecret}
                                className="inline-flex items-center gap-1.5 font-mono text-xs bg-gray-50 dark:bg-accent px-2 py-1 rounded border border-gray-200 dark:border-border hover:bg-gray-100"
                            >
                                {enrollment.secret}
                                {copiedSecret ? <Check className="w-3 h-3 text-success-700" /> : <Copy className="w-3 h-3" />}
                            </button>
                        </div>

                        <div className="flex justify-center pt-1">
                            <InputOTP
                                maxLength={6}
                                value={code}
                                onChange={setCode}
                                autoFocus
                                disabled={verifying}
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="ghost" onClick={handleCancel} disabled={verifying}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleVerify}
                        disabled={!enrollment || code.length !== 6 || verifying}
                    >
                        {verifying ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying…
                            </>
                        ) : (
                            "Verify & enable"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
