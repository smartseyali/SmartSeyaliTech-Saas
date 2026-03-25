import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Leaf, Sprout, Sparkles } from "lucide-react";

export default function Seeder() {
    const { user } = useAuth();
    const { activeCompany } = useTenant();
    const [status, setStatus] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const seed = async () => {
        if (!activeCompany) {
            setStatus("Error: No active company found.");
            return;
        }

        setLoading(true);
        setStatus("Initialization procedure active...");

        try {
            const companyId = activeCompany.id;

            // 1. Seed Banners (Organic Theme)
            setStatus("Nurturing Banners...");
            const banners = [
                {
                    company_id: companyId,
                    title: "SUMMER HARVEST 2024",
                    subtitle: "Purely organic delights sourced directly from local partner farms.",
                    image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600",
                    position: "hero",
                    badge_text: "Fresh Arrival",
                    is_active: true,
                    display_order: 1
                },
                {
                    company_id: companyId,
                    title: "PURE COLD PRESSED",
                    subtitle: "Traditional wooden churned oils for maximum nutrient retention.",
                    image_url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=1600",
                    position: "mid_page",
                    badge_text: "Heritage Selection",
                    is_active: true,
                    display_order: 2
                }
            ];
            await supabase.from("ecom_banners").delete().eq("company_id", companyId);
            await supabase.from("ecom_banners").insert(banners);

            // 2. Seed Organic Products
            setStatus("Cultivating Specimens...");
            const products = [
                {
                    company_id: companyId,
                    name: "Organic Sprouted Malt",
                    category: "Health Mix",
                    sku: "MALT-001",
                    rate: 450,
                    description: "A traditional blend of 18 organic grains and nuts, sprouted and slow-roasted to perfection.",
                    image_url: "https://images.unsplash.com/photo-1615486511484-92e172ee4fe0?w=800",
                    is_ecommerce: true,
                    is_featured: true,
                    is_best_seller: true,
                    status: "active"
                },
                {
                    company_id: companyId,
                    name: "Cold Pressed Groundnut Oil",
                    category: "Oils",
                    sku: "OIL-G-1L",
                    rate: 380,
                    description: "Extracted using traditional Vaagai Wood press, preserving all natural antioxidants.",
                    image_url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800",
                    is_ecommerce: true,
                    is_featured: true,
                    status: "active"
                },
                {
                    company_id: companyId,
                    name: "Wild Forest Honey",
                    category: "Sweeteners",
                    sku: "HONY-WF-500",
                    rate: 650,
                    description: "Unprocessed, raw honey collected by tribal communities from the heart of the Western Ghats.",
                    image_url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800",
                    is_ecommerce: true,
                    is_featured: true,
                    status: "active"
                },
                {
                    company_id: companyId,
                    name: "Hand-pounded Brown Rice",
                    category: "Grains",
                    sku: "RICE-BR-5KG",
                    rate: 850,
                    description: "Traditionally processed rice that retains the nutrient-rich bran layer.",
                    image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800",
                    is_ecommerce: true,
                    is_featured: true,
                    status: "active"
                }
            ];

            const { data: insertedProducts, error: pError } = await supabase.from("products").insert(products).select();
            if (pError) throw pError;

            // 3. Seed Sample Order
            setStatus("Recording Extraction Manifest...");
            const malt = insertedProducts?.find(p => p.sku === "MALT-001");
            const { data: sampleOrder } = await supabase.from("ecom_orders").insert([{
                company_id: companyId,
                user_id: user?.id,
                order_number: "HRV-2024-001",
                customer_name: user?.user_metadata?.full_name || "Organic Enthusiast",
                customer_email: user?.email || "guest@example.com",
                customer_phone: "919876543210",
                shipping_address: "Green Valley Farmhouse, Sector 12, Bengaluru, 560001",
                subtotal: 450,
                grand_total: 450,
                payment_method: "cod",
                payment_status: "pending",
                status: "processing"
            }]).select().single();

            if (sampleOrder && malt) {
                await supabase.from("ecom_order_items").insert([{
                    order_id: sampleOrder.id,
                    product_id: malt.id,
                    product_name: malt.name,
                    quantity: 1,
                    price_at_time: 450,
                    total_price: 450
                }]);
            }

            setStatus("Harvest Successful! Database nurtured with organic data.");
        } catch (error: any) {
            console.error("Seeding error:", error);
            setStatus(`Error: ${error.message || "Unknown error occurred"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#fafaf9] min-h-screen pt-28 pb-40 flex items-center justify-center font-sans">
            <div className="container max-w-xl mx-auto px-10">
                <div className="bg-white rounded-[48px] p-16 text-center space-y-10 shadow-2xl border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#14532d]/5 rounded-bl-full" />

                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2">
                            <Leaf className="w-5 h-5 text-[#f97316]" />
                            <span className="text-xs font-bold  tracking-widest text-[#14532d]/40">System Utility</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-[#14532d]  tracking-tighter leading-none">Market <br /> <span className="text-[#f97316]">Nurturer</span></h1>
                        <p className="text-slate-500 font-medium  text-sm">Populate your registry with sample organic specimens for testing.</p>
                    </div>

                    <div className="p-8 bg-[#fafaf9] rounded-3xl border border-dashed border-slate-200 text-xs font-bold  tracking-widest text-[#14532d]/60 leading-relaxed ">
                        {status || "Ready to cultivate data..."}
                    </div>

                    <Button
                        onClick={seed}
                        disabled={loading}
                        className="w-full h-16 rounded-2xl bg-[#14532d] hover:bg-[#14532d]/90 text-white font-bold  tracking-widest text-xs shadow-2xl shadow-[#14532d]/20 transition-all"
                    >
                        {loading ? "Planting Seeds..." : "Initialize Organic Seeder"}
                    </Button>

                    <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-50 opacity-20 group">
                        <Sprout className="w-4 h-4" />
                        <Sparkles className="w-4 h-4" />
                        <Leaf className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}
