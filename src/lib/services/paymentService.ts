import { supabase } from "@/lib/supabase";

// ─── Types ──────────────────────────────────────────────────────────────────

interface RazorpayOptions {
    keyId: string;
    amount: number;
    currency: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    businessName?: string;
    description?: string;
}

interface RazorpayResult {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

// ─── Razorpay Script Loader ─────────────────────────────────────────────────

let razorpayScriptLoaded = false;

function loadRazorpayScript(): Promise<void> {
    if (razorpayScriptLoaded && window.Razorpay) return Promise.resolve();

    return new Promise((resolve, reject) => {
        if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
            razorpayScriptLoaded = true;
            resolve();
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => { razorpayScriptLoaded = true; resolve(); };
        script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
        document.head.appendChild(script);
    });
}

// ─── Razorpay Payment ───────────────────────────────────────────────────────

export async function initiateRazorpayPayment(options: RazorpayOptions): Promise<RazorpayResult> {
    await loadRazorpayScript();

    return new Promise((resolve, reject) => {
        const rzpOptions = {
            key: options.keyId,
            amount: Math.round(options.amount * 100), // Convert to paise
            currency: options.currency || "INR",
            name: options.businessName || "Smartseyali",
            description: options.description || `Order ${options.orderNumber}`,
            prefill: {
                name: options.customerName,
                email: options.customerEmail,
                contact: options.customerPhone,
            },
            theme: { color: "#2563eb" },
            handler: function (response: RazorpayResult) {
                if (!response?.razorpay_payment_id) {
                    reject(new Error("Invalid payment response: missing payment ID"));
                    return;
                }
                resolve(response);
            },
            modal: {
                ondismiss: function () {
                    reject(new Error("Payment cancelled by customer"));
                },
            },
        };

        const rzp = new window.Razorpay(rzpOptions);
        rzp.on("payment.failed", function (response: any) {
            reject(new Error(response.error?.description || "Payment failed"));
        });
        rzp.open();
    });
}

// ─── Payment Transaction Logger ─────────────────────────────────────────────

export async function logPaymentTransaction(
    companyId: number,
    orderId: string,
    gateway: string,
    amount: number,
    status: "initiated" | "success" | "failed" | "pending" | "refunded",
    transactionId?: string,
    gatewayResponse?: Record<string, any>
) {
    const { error } = await supabase.from("payment_transactions").insert([{
        company_id: companyId,
        order_id: orderId,
        gateway,
        amount,
        status,
        transaction_id: transactionId || null,
        gateway_response: gatewayResponse || {},
    }]);
    if (error) throw new Error(`Failed to log payment transaction: ${error.message}`);
}

// ─── Refund via Gateway ─────────────────────────────────────────────────────

export async function processGatewayRefund(
    companyId: number,
    orderId: string,
    paymentId: string,
    amount: number,
    gateway: string
): Promise<boolean> {
    // Log the refund attempt
    await logPaymentTransaction(companyId, orderId, gateway, amount, "refunded", paymentId, {
        type: "refund",
        original_payment_id: paymentId,
        refund_amount: amount,
    });

    // Note: Actual gateway refund API calls (Razorpay refund API, etc.) would require
    // a backend/edge function with the secret key. For now, this logs the refund
    // and the merchant processes it from their gateway dashboard.
    return true;
}
