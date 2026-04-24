import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { challengeAndVerify, listFactors, type MfaFactor } from "@/lib/auth/mfa";
import { useAuth } from "@/contexts/AuthContext";
import PLATFORM_CONFIG from "@/config/platform";

type Props = {
    onVerified: () => void;
};

export function MFAChallenge({ onVerified }: Props) {
    const { signOut, refreshAal } = useAuth();
    const [factors, setFactors] = useState<MfaFactor[]>([]);
    const [activeFactorId, setActiveFactorId] = useState<string | null>(null);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        let cancelled = false;
        listFactors()
            .then((all) => {
                if (cancelled) return;
                const verified = all.filter((f) => f.status === "verified");
                setFactors(verified);
                setActiveFactorId(verified[0]?.id ?? null);
            })
            .catch((err) => {
                toast.error(err?.message || "Failed to load MFA factors");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const handleVerify = async () => {
        if (!activeFactorId || code.length !== 6) return;
        setVerifying(true);
        try {
            await challengeAndVerify(activeFactorId, code);
            await refreshAal();
            onVerified();
        } catch (err: any) {
            toast.error(err?.message || "Invalid code. Please try again.");
            setCode("");
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-[400px]">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-3">
                        <ShieldCheck className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-foreground">
                        Two-factor authentication
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Enter the 6-digit code from your authenticator app
                    </p>
                </div>

                <div className="bg-card border border-gray-200 rounded-lg p-5 dark:border-border space-y-4">
                    {loading ? (
                        <div className="py-8 flex justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                    ) : factors.length === 0 ? (
                        <div className="text-xs text-center text-destructive py-4">
                            No verified authentication methods found. Contact your administrator.
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-center">
                                <InputOTP
                                    maxLength={6}
                                    value={code}
                                    onChange={setCode}
                                    autoFocus
                                    disabled={verifying}
                                    onComplete={handleVerify}
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

                            <Button
                                onClick={handleVerify}
                                disabled={code.length !== 6 || verifying}
                                className="w-full"
                                size="lg"
                            >
                                {verifying ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying…
                                    </>
                                ) : (
                                    "Verify"
                                )}
                            </Button>
                        </>
                    )}
                </div>

                <div className="mt-4 text-center">
                    <button
                        type="button"
                        onClick={() => signOut()}
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-foreground"
                    >
                        <LogOut className="w-3 h-3" /> Sign out instead
                    </button>
                </div>

                <p className="text-[11px] text-gray-400 text-center mt-8">
                    &copy; {new Date().getFullYear()} {PLATFORM_CONFIG.name}. All rights reserved.
                </p>
            </div>
        </div>
    );
}
