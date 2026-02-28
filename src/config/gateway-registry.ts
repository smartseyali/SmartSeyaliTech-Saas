import { CreditCard, Smartphone, Banknote, Zap } from "lucide-react";

export const GATEWAY_META: Record<string, {
    name: string; icon: any; color: string; tagline: string;
    docsUrl?: string;
    fields: { key: string; label: string; type?: string; placeholder: string }[];
}> = {
    razorpay: {
        name: "Razorpay",
        icon: Zap,
        color: "bg-blue-600",
        tagline: "Most popular Indian payment gateway",
        docsUrl: "https://razorpay.com/docs/",
        fields: [
            { key: "key_id", label: "Key ID", placeholder: "rzp_live_..." },
            { key: "key_secret", label: "Key Secret", placeholder: "••••••••••••", type: "password" },
            { key: "webhook_secret", label: "Webhook Secret", placeholder: "whsec_...", type: "password" },
        ],
    },
    phonepe: {
        name: "PhonePe",
        icon: Smartphone,
        color: "bg-violet-700",
        tagline: "India's largest UPI payment platform",
        docsUrl: "https://developer.phonepe.com/",
        fields: [
            { key: "merchant_id", label: "Merchant ID", placeholder: "PGTESTPAYUAT" },
            { key: "salt_key", label: "Salt Key", placeholder: "••••••••••••", type: "password" },
            { key: "salt_index", label: "Salt Index", placeholder: "1" },
            { key: "redirect_url", label: "Redirect URL", placeholder: "https://yourdomain.com/payment/callback" },
        ],
    },
    paytm: {
        name: "Paytm",
        icon: CreditCard,
        color: "bg-sky-500",
        tagline: "India's trusted wallet & payment gateway",
        docsUrl: "https://developer.paytm.com/",
        fields: [
            { key: "mid", label: "Merchant ID (MID)", placeholder: "YourMID12345..." },
            { key: "merchant_key", label: "Merchant Key", placeholder: "••••••••••••", type: "password" },
            { key: "website", label: "Website", placeholder: "WEBSTAGING (test) / DEFAULT (live)" },
            { key: "industry_type", label: "Industry Type", placeholder: "Retail" },
            { key: "channel_id", label: "Channel ID", placeholder: "WEB" },
        ],
    },
    cashfree: {
        name: "Cashfree",
        icon: Banknote,
        color: "bg-emerald-600",
        tagline: "Fast payouts & payment gateway",
        docsUrl: "https://docs.cashfree.com/",
        fields: [
            { key: "app_id", label: "App ID", placeholder: "YOUR_APP_ID" },
            { key: "secret_key", label: "Secret Key", placeholder: "••••••••••••", type: "password" },
            { key: "environment", label: "Environment", placeholder: "TEST or PRODUCTION" },
        ],
    },
    stripe: {
        name: "Stripe",
        icon: CreditCard,
        color: "bg-indigo-600",
        tagline: "Global payments, global reach",
        docsUrl: "https://stripe.com/docs",
        fields: [
            { key: "publishable_key", label: "Publishable Key", placeholder: "pk_live_..." },
            { key: "secret_key", label: "Secret Key", placeholder: "sk_live_...", type: "password" },
            { key: "webhook_secret", label: "Webhook Secret", placeholder: "whsec_...", type: "password" },
        ],
    },
    upi: {
        name: "UPI / QR",
        icon: Smartphone,
        color: "bg-green-600",
        tagline: "Direct bank transfer via UPI ID or QR",
        fields: [
            { key: "upi_id", label: "UPI ID", placeholder: "yourname@bank" },
            { key: "qr_url", label: "QR Code URL", placeholder: "https://..." },
            { key: "vpa_name", label: "Business Name", placeholder: "Display name on UPI" },
        ],
    },
    cod: {
        name: "Cash on Delivery",
        icon: Banknote,
        color: "bg-amber-600",
        tagline: "Collect payment at customer's door",
        fields: [
            { key: "max_cod_amount", label: "Max Order Value for COD (₹)", placeholder: "e.g. 10000" },
            { key: "cod_charge", label: "COD Handling Fee (₹)", placeholder: "e.g. 50" },
        ],
    },
};
