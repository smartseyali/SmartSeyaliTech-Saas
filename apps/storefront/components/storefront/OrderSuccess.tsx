"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTenant } from "@/lib/tenant";

export function OrderSuccess() {
  const params = useSearchParams();
  const orderNumber = params.get("order") ?? "—";
  const tenant = getTenant();

  return (
    <div className="container-tight py-20 max-w-lg mx-auto text-center">
      <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-brand" />
      </div>
      <h1 className="text-2xl font-bold text-brand-900 mb-2">Order Placed!</h1>
      <p className="text-muted-foreground mb-1">Thank you for shopping with {tenant.brandName}.</p>
      <p className="text-sm text-muted-foreground mb-8">
        A confirmation has been sent to your email. We&apos;ll update you when your order ships.
      </p>

      <div className="bg-brand-50 rounded-2xl p-6 mb-8 text-left space-y-3">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-brand shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Order Number</p>
            <p className="font-bold text-brand-900 text-lg">{orderNumber}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground border-t border-border pt-3">
          Keep this number handy. You can use it to track your order or reach us for any queries.
        </p>
      </div>

      {tenant.contact.whatsapp && (
        <a
          href={`https://wa.me/${tenant.contact.whatsapp}?text=Hi%2C%20I%20placed%20order%20${encodeURIComponent(orderNumber)}%20and%20have%20a%20query`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white text-sm font-semibold hover:opacity-90 transition-opacity mb-4"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Track on WhatsApp
        </a>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild size="lg">
          <Link href="/shop/">Continue Shopping <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/"><Home className="mr-1.5 h-4 w-4" /> Home</Link>
        </Button>
      </div>
    </div>
  );
}
