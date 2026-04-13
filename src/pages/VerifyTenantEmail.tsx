import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, XCircle, Loader2, ArrowRight, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyTenantEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error" | "no-token">("loading");
    const [message, setMessage] = useState("");
    const [userName, setUserName] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("no-token");
            return;
        }
        verifyToken(token);
    }, [token]);

    const verifyToken = async (t: string) => {
        setStatus("loading");
        try {
            const { data, error } = await supabase.rpc("tenant_verify_email", { p_token: t });
            if (error) throw new Error(error.message);

            if (data?.already_verified) {
                setStatus("success");
                setMessage("Your email was already verified.");
                setUserName(data.email);
            } else if (data?.verified) {
                setStatus("success");
                setMessage("Your email has been verified successfully!");
                setUserName(data.full_name || data.email);
            }
        } catch (err: any) {
            setStatus("error");
            setMessage(err.message || "Verification failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-4">
            <div className="w-full max-w-md text-center space-y-8">
                {status === "loading" && (
                    <div className="space-y-4">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                        <p className="text-sm font-bold text-slate-500 tracking-widest">Verifying your email...</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="bg-white rounded-3xl border border-emerald-200 p-10 shadow-sm space-y-6">
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Email Verified!</h1>
                            {userName && <p className="text-sm text-slate-500 mt-2">Welcome, {userName}</p>}
                            <p className="text-sm text-emerald-600 font-medium mt-1">{message}</p>
                        </div>
                        <p className="text-sm text-slate-500">You can now access the platform and set up your workspace.</p>
                        <div className="flex flex-col gap-3">
                            <Button
                                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 gap-2"
                                onClick={() => navigate("/apps")}
                            >
                                <LayoutGrid className="w-4 h-4" /> Go to Dashboard
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-xl font-bold gap-2"
                                onClick={() => navigate("/onboarding")}
                            >
                                Continue Setup <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {status === "error" && (
                    <div className="bg-white rounded-3xl border border-rose-200 p-10 shadow-sm space-y-6">
                        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto">
                            <XCircle className="w-8 h-8 text-rose-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verification Failed</h1>
                            <p className="text-sm text-rose-600 font-medium mt-2">{message}</p>
                        </div>
                        <p className="text-sm text-slate-500">The link may have expired. Please log in and request a new verification email.</p>
                        <Button
                            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20"
                            onClick={() => navigate("/login")}
                        >
                            Go to Login
                        </Button>
                    </div>
                )}

                {status === "no-token" && (
                    <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-sm space-y-6">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
                            <LayoutGrid className="w-8 h-8 text-slate-300" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">No Verification Token</h1>
                            <p className="text-sm text-slate-500 mt-2">Please use the link sent to your email.</p>
                        </div>
                        <Button
                            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20"
                            onClick={() => navigate("/login")}
                        >
                            Go to Login
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
