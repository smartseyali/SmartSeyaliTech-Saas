import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Sparkles, X } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { getCurrentModule } from "@/config/navigation";
import { getModule } from "@/config/modules";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "ss_template_banner_dismissed";

/**
 * Shows a soft callout inside any module whose `needsTemplate` flag is true
 * but the tenant hasn't picked a storefront template yet. One-click path
 * to /apps/:module/setup/template. Dismissible per-session.
 */
export function TemplateMissingBanner() {
    const location = useLocation();
    const { activeCompany } = useTenant();
    const [needsTemplate, setNeedsTemplate] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    const module = getCurrentModule(location.pathname);
    const cfg = getModule(module);

    useEffect(() => {
        const sessionDismissed = sessionStorage.getItem(`${DISMISS_KEY}_${activeCompany?.id}`);
        if (sessionDismissed === "1") {
            setDismissed(true);
            return;
        }
        setDismissed(false);
    }, [activeCompany?.id, module]);

    useEffect(() => {
        let cancelled = false;
        const check = async () => {
            if (!cfg?.needsTemplate || !activeCompany?.id) {
                setNeedsTemplate(false);
                return;
            }
            try {
                const { data } = await supabase
                    .from("companies")
                    .select("active_template_id")
                    .eq("id", activeCompany.id)
                    .maybeSingle();
                if (cancelled) return;
                setNeedsTemplate(!data?.active_template_id);
            } catch {
                if (!cancelled) setNeedsTemplate(false);
            }
        };
        check();
        return () => { cancelled = true; };
    }, [activeCompany?.id, cfg?.needsTemplate]);

    // Suppress inside the picker itself and on the dashboard root if we can help it
    const isInPicker = location.pathname.includes("/setup/template");

    if (!needsTemplate || dismissed || isInPicker || !cfg) return null;

    const handleDismiss = () => {
        sessionStorage.setItem(`${DISMISS_KEY}_${activeCompany?.id}`, "1");
        setDismissed(true);
    };

    return (
        <div className={cn(
            "mx-4 mt-4 rounded-xl border border-primary/25 bg-primary/5 p-4",
            "flex flex-wrap items-center gap-3 justify-between",
        )}>
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-md bg-primary/15 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                        Pick a storefront template for {cfg.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Choose a design, fill in your store details, and we'll bundle a ZIP you can upload to Hostinger.
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Link
                    to={`/apps/${module}/setup/template`}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-600 transition-colors"
                >
                    Choose template <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                    onClick={handleDismiss}
                    className="w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors inline-flex items-center justify-center"
                    title="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
