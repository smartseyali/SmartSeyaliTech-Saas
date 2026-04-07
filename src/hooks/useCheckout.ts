import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { initiateRazorpayPayment, logPaymentTransaction } from "@/lib/services/paymentService";
import { sendOrderConfirmationEmail } from "@/lib/services/emailService";

export interface CheckoutData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state?: string;
    pincode: string;
    paymentMethod: string;
}

/**
 * Standardized Checkout Integration Hook
 * Uses merchant-configured order prefix, real payment gateway flow,
 * and auto-confirm for paid orders.
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

        // Check if customer email is verified (read from ecom_customers)
        const { data: custCheck } = await supabase
            .from("ecom_customers")
            .select("email_verified")
            .eq("company_id", activeCompany.id)
            .eq("email", formData.email.toLowerCase())
            .maybeSingle();

        if (custCheck && custCheck.email_verified === false) {
            throw new Error("Please verify your email address before placing an order. Check your inbox for the verification link.");
        }

        setIsProcessing(true);
        try {
            // 1. Generate order number using merchant prefix (atomic DB function)
            const { data: orderNumber, error: rpcErr } = await supabase
                .rpc("generate_order_number", { p_company_id: activeCompany.id });

            if (rpcErr || !orderNumber) {
                // Fallback: generate client-side with prefix from settings
                const { data: settings } = await supabase
                    .from("ecom_settings")
                    .select("order_prefix, next_order_number, auto_confirm_paid_orders, tax_rate")
                    .eq("company_id", activeCompany.id)
                    .maybeSingle();

                var finalOrderNumber = `${settings?.order_prefix || "ORD"}-${Date.now().toString(36).toUpperCase()}`;
                var autoConfirm = settings?.auto_confirm_paid_orders !== false;
                var taxRate = Number(settings?.tax_rate) || 0;
            } else {
                // Fetch settings for auto-confirm and tax
                const { data: settings } = await supabase
                    .from("ecom_settings")
                    .select("auto_confirm_paid_orders, tax_rate")
                    .eq("company_id", activeCompany.id)
                    .maybeSingle();

                var finalOrderNumber = orderNumber;
                var autoConfirm = settings?.auto_confirm_paid_orders !== false;
                var taxRate = Number(settings?.tax_rate) || 0;
            }

            // 2. Calculate totals
            const subtotal = cartTotal;
            const taxAmount = taxRate > 0 ? Math.round((subtotal * taxRate / 100) * 100) / 100 : 0;
            const grandTotal = subtotal + taxAmount;

            const isPaid = formData.paymentMethod !== "cod";
            const initialStatus = isPaid && autoConfirm ? "confirmed" : "pending";

            // 3. Create the Order
            const { data: order, error: orderErr } = await supabase
                .from("ecom_orders")
                .insert([{
                    company_id: activeCompany.id,
                    user_id: user?.id,
                    order_number: finalOrderNumber,
                    customer_name: `${formData.firstName} ${formData.lastName}`,
                    customer_email: formData.email,
                    customer_phone: formData.phone,
                    shipping_address: {
                        line1: formData.address,
                        city: formData.city,
                        state: formData.state || "",
                        pincode: formData.pincode,
                    },
                    subtotal,
                    tax_amount: taxAmount,
                    grand_total: grandTotal,
                    payment_method: formData.paymentMethod,
                    payment_status: "pending",
                    status: "pending",
                }])
                .select()
                .single();

            if (orderErr) throw orderErr;

            // 4. Insert Order Items
            const orderItems = items.map(item => ({
                order_id: order.id,
                company_id: activeCompany.id,
                product_id: item.product_id,
                variant_id: item.variant_id,
                product_name: item.name,
                variant_label: item.variant_name,
                quantity: item.quantity,
                unit_price: item.price,
                amount: item.price * item.quantity,
            }));

            const { error: itemsErr } = await supabase.from("ecom_order_items").insert(orderItems);
            if (itemsErr) throw itemsErr;

            // 5. Initialize Timeline
            await supabase.from("ecom_order_timeline").insert([{
                order_id: order.id,
                company_id: activeCompany.id,
                status: "pending",
                note: "Order placed successfully.",
            }]);

            // 6. Process Payment
            if (formData.paymentMethod === "razorpay") {
                try {
                    // Fetch gateway config
                    const { data: gw } = await supabase
                        .from("payment_gateways")
                        .select("config, is_test_mode")
                        .eq("company_id", activeCompany.id)
                        .eq("gateway", "razorpay")
                        .eq("is_active", true)
                        .maybeSingle();

                    if (!gw?.config?.key_id) {
                        throw new Error("Razorpay is not configured. Please contact the store.");
                    }

                    // Log payment initiation
                    await logPaymentTransaction(activeCompany.id, order.id, "razorpay", grandTotal, "initiated");

                    // Open Razorpay checkout
                    const paymentResult = await initiateRazorpayPayment({
                        keyId: gw.config.key_id,
                        amount: grandTotal,
                        currency: "INR",
                        orderNumber: finalOrderNumber,
                        customerName: `${formData.firstName} ${formData.lastName}`,
                        customerEmail: formData.email,
                        customerPhone: formData.phone,
                    });

                    // Payment successful — update order
                    await supabase.from("ecom_orders").update({
                        payment_status: "paid",
                        payment_id: paymentResult.razorpay_payment_id,
                        payment_gateway_ref: paymentResult.razorpay_payment_id,
                        status: autoConfirm ? "confirmed" : "pending",
                    }).eq("id", order.id);

                    // Log success
                    await logPaymentTransaction(
                        activeCompany.id, order.id, "razorpay", grandTotal, "success",
                        paymentResult.razorpay_payment_id,
                        { payment_id: paymentResult.razorpay_payment_id, order_id: paymentResult.razorpay_order_id }
                    );

                    if (autoConfirm) {
                        await supabase.from("ecom_order_timeline").insert([{
                            order_id: order.id, company_id: activeCompany.id,
                            status: "confirmed", note: "Auto-confirmed after payment received.",
                        }]);
                    }
                } catch (payErr: any) {
                    // Payment failed — log failure, order stays pending
                    await logPaymentTransaction(activeCompany.id, order.id, "razorpay", grandTotal, "failed", undefined, { error: payErr.message });
                    toast({
                        variant: "destructive",
                        title: "Payment Failed",
                        description: "Your order has been created. You can retry payment from My Orders.",
                    });
                }
            } else if (formData.paymentMethod === "cod") {
                // COD — no payment processing needed
                await logPaymentTransaction(activeCompany.id, order.id, "cod", grandTotal, "pending");
            } else {
                // Other gateways (UPI, PhonePe etc.) — mark as pending, log
                await logPaymentTransaction(activeCompany.id, order.id, formData.paymentMethod, grandTotal, "pending");
            }

            // 7. Sync ecom_customer
            await supabase.from("ecom_customers").upsert({
                company_id: activeCompany.id,
                email: formData.email,
                full_name: `${formData.firstName} ${formData.lastName}`,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                state: formData.state || "",
                pincode: formData.pincode,
                user_id: user?.id,
            }, { onConflict: "company_id,email" });

            setLastOrderId(order.id);
            clearCart();

            // Send order confirmation email via merchant SMTP
            sendOrderConfirmationEmail(
                activeCompany.id,
                formData.email,
                `${formData.firstName} ${formData.lastName}`,
                finalOrderNumber,
                grandTotal
            ).catch(err => console.error("Failed to send order confirmation:", err));

            toast({
                title: "Order Placed Successfully",
                description: `Your order ${finalOrderNumber} has been confirmed.`,
            });

            return order;
        } catch (err: any) {
            console.error("Checkout Error:", err);
            toast({
                variant: "destructive",
                title: "Order Failed",
                description: err.message || "Something went wrong. Please try again.",
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
        cartTotal,
    };
}
