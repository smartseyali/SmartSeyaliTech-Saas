import { getProducts } from "@/lib/build-data";
import { getTenant, getSiteUrl } from "@/lib/tenant";

export const dynamic = "force-static";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const tenant = getTenant();
  const base = getSiteUrl();
  const products = await getProducts();

  const items = products
    .filter((p) => p.inStock !== false && p.badge !== "out-of-stock")
    .map((p) => {
      const price = `${p.price.toFixed(2)} INR`;
      const hasDiscount = p.compareAtPrice && p.compareAtPrice > p.price;
      const origPrice = hasDiscount ? `${p.compareAtPrice!.toFixed(2)} INR` : null;

      return `
    <item>
      <g:id>${escapeXml(p.slug)}</g:id>
      <g:title><![CDATA[${p.name}]]></g:title>
      <g:description><![CDATA[${p.shortDescription}]]></g:description>
      <g:link>${base}/product/${p.slug}/</g:link>
      <g:image_link>${base}${p.image}</g:image_link>
      <g:price>${hasDiscount ? origPrice! : price}</g:price>${hasDiscount ? `\n      <g:sale_price>${price}</g:sale_price>` : ""}
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>${escapeXml(tenant.brandName)}</g:brand>
      <g:product_type>${escapeXml(p.category)}</g:product_type>
      <g:identifier_exists>false</g:identifier_exists>${p.weight ? `\n      <g:shipping_weight>${escapeXml(p.weight)}</g:shipping_weight>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(tenant.brandName)}</title>
    <link>${base}/</link>
    <description>${escapeXml(tenant.description)}</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
