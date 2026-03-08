
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import { Outlet } from "react-router-dom";

export const MarketingLayout = () => {
    return (
        <div className="min-h-screen flex flex-col relative">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
            <WhatsAppButton />
        </div>
    );
};
