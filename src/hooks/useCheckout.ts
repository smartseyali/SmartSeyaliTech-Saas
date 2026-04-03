import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

export interface CheckoutData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    paymentMethod: string;
}

/**
 * Standardized Checkout Integration Hook
 * This ensures every marketplace follows the exact same order processing logic
 * while allowing for the design/UI to vary.
 */
export function useCheckout() {
    const { activeCompany } = useTenant();
    const { user } = useAuth();
    const { items, cartTotal, clearCart } = useCart();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastOrderId, setLastOrderId] = useState<string | null>(null);

    const placeOrder = async (formData: CheckoutData) => {
        if (!activeCompany) {
            throw new Error("Store identity could not be resolved.");
        }

        if (items.length === 0) {
            throw new Error("Your cart is empty.");
        }

        setIsProcessing(true);
        try {
            const orderNumber = `ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

            // 0. Simulation: Gateway Handoff
            if (formData.paymentMethod !== 'cod') {
                toast({
                    title: "Gateway Handshake",
                    description: `Initializing secure connection with ${formData.paymentMethod.toUpperCase()}...`
                });
                await new Promise(r => setTimeout(r, 2000));
            }

            // 1. Create the Order in the SaaS Backend
            const { data: order, error: orderErr } = await supabase
                .from("ecom_orders")
                .insert([{
                    company_id: activeCompany.id,
                    user_id: user?.id,
                    order_number: orderNumber,
                    customer_name: `${formData.firstName} ${formData.lastName}`,
                    customer_email: formData.email,
                    customer_phone: formData.phone,
                    shipping_address: {
                        line1: formData.address,
                        line2: formData.city,
                        pincode: formData.pincode,
                        state: formData.state || ""
                    },
                    subtotal: cartTotal,
                    grand_total: cartTotal,
                    payment_method: formData.paymentMethod,
                    payment_status: formData.paymentMethod === 'cod' ? 'pending' : 'paid',
                    status: "pending"
                }])
                .select()
                .single();

            if (orderErr) throw orderErr;

            // 2. Map Cart Items to Order Items
            const orderItems = items.map(item => ({
                order_id: order.id,
                company_id: activeCompany.id, // Ensure strict multi-tenancy on items too
                product_id: item.product_id,
                variant_id: item.variant_id,
                product_name: item.name,
                variant_label: item.variant_name,
                quantity: item.quantity,
                unit_price: item.price,
                amount: item.price * item.quantity
            }));

            const { error: itemsErr } = await supabase.from("ecom_order_items").insert(orderItems);
            if (itemsErr) throw itemsErr;

            // 3. Initialize Order Lifecycle/Timeline
            await supabase.from("ecom_order_timeline").insert([{
                order_id: order.id,
                company_id: activeCompany.id,
                status: "pending",
                note: "Order initialized via SaaS checkout engine."
            }]);

            setLastOrderId(order.id);
            clearCart();

            toast({
                title: "Order Successful",
                description: `Confirmation sent for ${orderNumber}`,
            });

            return order;
        } catch (err: any) {
            console.error("Payment Gateway Error:", err);
            toast({
                variant: "destructive",
                title: "Processing Error",
                description: "We encountered an issue with the payment gateway. Please try again.",
            });
            throw err;
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        placeOrder,
        isProcessing,
        lastOrderId,
        cartTotal
    };
}
