import { useLocation } from "react-router-dom";
import { 
    AnimatePresence, motion 
} from "framer-motion";

// Import existing master modules
import Items from "./Items";
import Categories from "./Categories";
import Brands from "./Brands";
import UOMs from "./UOMs";
import Contacts from "./Contacts";
import Attributes from "./Attributes";
import Variants from "./Variants";
import { PriceLists, TaxMapping } from "./Pricing";

export default function MasterDashboard() {
    const location = useLocation();
    const pathname = location.pathname;

    // Component mapping based on route
    const renderComponent = () => {
        if (pathname.includes("/items")) return <Items />;
        if (pathname.includes("/categories")) return <Categories />;
        if (pathname.includes("/brands")) return <Brands />;
        if (pathname.includes("/uoms")) return <UOMs />;
        if (pathname.includes("/contacts")) {
            if (pathname.includes("/customer")) return <Contacts defaultType="customer" />;
            if (pathname.includes("/vendor")) return <Contacts defaultType="vendor" />;
            return <Contacts />;
        }
        if (pathname.includes("/attributes")) return <Attributes />;
        if (pathname.includes("/variants")) return <Variants />;
        if (pathname.includes("/pricing")) return <PriceLists />;
        if (pathname.includes("/tax")) return <TaxMapping />;
        
        // Default to Items if just at /apps/masters
        return <Items />;
    };

    return (
        <div className="flex-1 bg-white min-h-screen overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                >
                    {renderComponent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
