import { Outlet } from "react-router-dom";
import { StoreHeader } from "./StoreHeader";
import { StoreFooter } from "./StoreFooter";
import { useStoreSettings } from "@/hooks/useStoreSettings";

export function StoreLayout({ children }: { children?: React.ReactNode }) {
    const { settings } = useStoreSettings();
    const primaryColor = settings?.primary_color || "#000000";

    return (
        <div className="flex flex-col min-h-screen font-sans bg-white">
            <style>{`:root { --primary: ${primaryColor}; }`}</style>
            <StoreHeader />
            <main className="flex-grow">
                {children || <Outlet />}
            </main>
            <StoreFooter />
        </div>
    );
}
