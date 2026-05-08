import { supabase } from "@/lib/supabase-client";
import { getTenant } from "@/lib/tenant";
import type { CartItem } from "@/components/storefront/CartContent";

export type CheckoutAddress = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export type PaymentMethod = "cod" | "razorpay";

export type CreateOrderInput = {
  address: CheckoutAddress;
  items: CartItem[];
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingAmount: number;
  total: number;
  taxAmount?: number;
  couponCode?: string;
  couponDiscount?: number;
  giftCardCode?: string;
  giftCardDiscount?: number;
  giftCardId?: string;
};

export type OrderResult = {
  id: string;
  order_number: string;
};

function generateOrderNumber(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

export async function createOrder(input: CreateOrderInput): Promise<OrderResult> {
  if (!supabase) {
    throw new Error(
      "Checkout requires Supabase. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment."
    );
  }

  const tenant = getTenant();
  const orderNumber = generateOrderNumber(tenant.orderPrefix ?? "ORDER");

  // Upsert customer record
  const customerRow: Record<string, unknown> = {
    name: `${input.address.firstName} ${input.address.lastName}`,
    email: input.address.email,
    phone: input.address.phone,
  };
  if (tenant.companyId) customerRow.company_id = tenant.companyId;

  await supabase
    .from("ecom_customers")
    .upsert(customerRow, { onConflict: tenant.companyId ? "email,company_id" : "email" });

  // Create order
  const orderRow: Record<string, unknown> = {
    order_number: orderNumber,
    customer_name: `${input.address.firstName} ${input.address.lastName}`,
    customer_email: input.address.email,
    customer_phone: input.address.phone,
    shipping_address: {
      line1: input.address.address,
      city: input.address.city,
      state: input.address.state,
      pincode: input.address.pincode,
    },
    subtotal: input.subtotal,
    shipping_amount: input.shippingAmount,
    tax_amount: input.taxAmount ?? 0,
    grand_total: input.total,
    coupon_code: input.couponCode ?? null,
    coupon_discount: input.couponDiscount ?? 0,
    gift_card_code: input.giftCardCode ?? null,
    gift_card_discount: input.giftCardDiscount ?? 0,
    payment_method: input.paymentMethod,
    payment_status: "pending",
    status: "pending",
    source: "storefront",
  };
  if (tenant.companyId) orderRow.company_id = tenant.companyId;

  const { data: order, error } = await supabase
    .from("ecom_orders")
    .insert(orderRow)
    .select("id, order_number")
    .single();

  if (error) throw new Error(error.message);
  if (!order) throw new Error("Order creation returned no data");

  // Create order items
  const itemsRows = input.items.map((item) => {
    const row: Record<string, unknown> = {
      order_id: order.id,
      product_id: item.productId ?? item.id,
      product_name: item.name,
      image_url: item.image,
      quantity: item.quantity,
      unit_price: item.price,
      amount: item.price * item.quantity,
      variant_id: item.variantId ?? null,
      variant_label: item.variantLabel ?? null,
      sku: item.sku ?? null,
    };
    if (tenant.companyId) row.company_id = tenant.companyId;
    return row;
  });
  await supabase.from("ecom_order_items").insert(itemsRows);

  // Timeline
  const timelineRow: Record<string, unknown> = {
    order_id: order.id,
    status: "pending",
    note: `Order placed via storefront (${input.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay"})`,
  };
  if (tenant.companyId) timelineRow.company_id = tenant.companyId;
  await supabase.from("ecom_order_timeline").insert(timelineRow);

  // Redeem gift card if applied
  if (input.giftCardId && input.giftCardDiscount) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && anonKey) {
      fetch(`${supabaseUrl}/functions/v1/gift-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${anonKey}` },
        body: JSON.stringify({ action: "redeem", gift_card_id: input.giftCardId, order_id: order.id, amount: input.giftCardDiscount }),
      }).catch(() => {});
    }
  }

  // Send order confirmation email (fire-and-forget)
  if (input.address.email && tenant.companyId) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && anonKey) {
      const itemsHtml = input.items
        .map((i) => `<tr><td>${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ""}</td><td>${i.quantity}</td><td>₹${(i.price * i.quantity).toLocaleString("en-IN")}</td></tr>`)
        .join("");
      fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${anonKey}` },
        body: JSON.stringify({
          company_id: tenant.companyId,
          to: input.address.email,
          template_key: "order_confirmation",
          merge_tags: {
            order_number: order.order_number,
            customer_name: `${input.address.firstName} ${input.address.lastName}`,
            items_rows: itemsHtml,
            subtotal: `₹${input.subtotal.toLocaleString("en-IN")}`,
            shipping: `₹${input.shippingAmount.toLocaleString("en-IN")}`,
            total: `₹${input.total.toLocaleString("en-IN")}`,
            payment_method: input.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment",
            shipping_address: `${input.address.address}, ${input.address.city} - ${input.address.pincode}`,
          },
        }),
      }).catch(() => { /* ignore email failures */ });
    }
  }

  return order as OrderResult;
}

export async function confirmOrderPayment(orderId: string, paymentId: string): Promise<void> {
  if (!supabase) return;
  const tenant = getTenant();

  await supabase
    .from("ecom_orders")
    .update({ payment_status: "paid", payment_id: paymentId, status: "confirmed" })
    .eq("id", orderId);

  const row: Record<string, unknown> = {
    order_id: orderId,
    status: "confirmed",
    note: `Payment confirmed via Razorpay — ${paymentId}`,
  };
  if (tenant.companyId) row.company_id = tenant.companyId;
  await supabase.from("ecom_order_timeline").insert(row);
}

export async function cancelPendingOrder(orderId: string): Promise<void> {
  if (!supabase) return;
  await supabase
    .from("ecom_orders")
    .delete()
    .eq("id", orderId)
    .eq("status", "pending")
    .eq("payment_status", "pending");
}
