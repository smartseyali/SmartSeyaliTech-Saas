/**
 * Site Integration Schema
 * This file acts as the "Source of Truth" for mapping Website Screens to Backend Tables.
 * It ensures that design variability doesn't break the backend integration.
 */

export interface FieldDefinition {
    id: string;
    label: string;
    type: "text" | "number" | "image" | "url" | "select" | "boolean" | "json";
}

export interface ScreenMapping {
    id: string;
    section: string;
    table: string;
    requirement: "mandatory" | "optional";
    description: string;
    fields: FieldDefinition[];
}

export const SITE_REGISTRY: Record<string, ScreenMapping[]> = {
    "HOME_PAGE": [
        {
            id: "hero_banners",
            section: "Main Banner Slider",
            table: "ecom_banners",
            requirement: "mandatory",
            description: "Hero banner/carousel at the top of the home page",
            fields: [
                { id: "title", label: "Title", type: "text" },
                { id: "subtitle", label: "Subtitle", type: "text" },
                { id: "image_url", label: "Banner Image", type: "image" },
                { id: "badge_text", label: "Badge", type: "text" },
                { id: "button_text", label: "Button Label", type: "text" },
                { id: "button_link", label: "Button URL", type: "url" }
            ]
        },
        {
            id: "site_highlights",
            section: "Highlights / Info Section",
            table: "ecom_settings",
            requirement: "optional",
            description: "Information cards displayed below the banner",
            fields: [
                { id: "title", label: "Title", type: "text" },
                { id: "description", label: "Description", type: "text" },
                { id: "image_url", label: "Icon/Image", type: "image" }
            ]
        },
        {
            id: "top_categories",
            section: "Top Categories",
            table: "ecom_categories",
            requirement: "optional",
            description: "Scrollable circular category list",
            fields: [
                { id: "name", label: "Category Name", type: "text" },
                { id: "image_url", label: "Category Image", type: "image" }
            ]
        },
        {
            id: "offer_zone",
            section: "Offer Zone Cards",
            table: "offers",
            requirement: "optional",
            description: "Discount offers shown on home page — manage via Offers & Promotions admin",
            fields: [
                { id: "title", label: "Offer Title", type: "text" },
                { id: "description", label: "Offer Description", type: "text" },
                { id: "badge_label", label: "Badge (e.g. 50% OFF)", type: "text" },
                { id: "image_url", label: "Background Image", type: "image" }
            ]
        },
        {
            id: "top_selling",
            section: "Top Selling Products",
            table: "products",
            requirement: "optional",
            description: "Grid of best selling products",
            fields: [
                { id: "name", label: "Product Name", type: "text" },
                { id: "price", label: "Sale Price", type: "number" },
                { id: "image_url", label: "Main Image", type: "image" }
            ]
        },
        {
            id: "bottom_banners",
            section: "Scrollable Bottom Banners",
            table: "ecom_banners",
            requirement: "optional",
            description: "A scrollable list of banners at the home page bottom",
            fields: [
                { id: "image_url", label: "Banner Image", type: "image" },
                { id: "button_link", label: "Link URL", type: "text" }
            ]
        },
        // ---- Per-page banners ----
        {
            id: "shop_header",
            section: "Shop / Categories Page Banner",
            table: "ecom_banners",
            requirement: "optional",
            description: "Banner at top of the shop/categories listing page",
            fields: [
                { id: "title", label: "Title", type: "text" },
                { id: "image_url", label: "Banner Image", type: "image" },
                { id: "badge_text", label: "Badge", type: "text" }
            ]
        },
        {
            id: "shop_mid",
            section: "Shop Mid-Page Banner",
            table: "ecom_banners",
            requirement: "optional",
            description: "Small promo banner in the middle of the shop page sidebar",
            fields: [
                { id: "title", label: "Title", type: "text" },
                { id: "image_url", label: "Banner Image", type: "image" }
            ]
        },
        {
            id: "product_top",
            section: "Product Detail Page — Top Banner",
            table: "ecom_banners",
            requirement: "optional",
            description: "Banner above product details",
            fields: [
                { id: "title", label: "Title", type: "text" },
                { id: "image_url", label: "Banner Image", type: "image" }
            ]
        },
        {
            id: "product_bottom",
            section: "Product Detail Page — Bottom Banner",
            table: "ecom_banners",
            requirement: "optional",
            description: "Banner below product description (above related items)",
            fields: [
                { id: "title", label: "Title", type: "text" },
                { id: "image_url", label: "Banner Image", type: "image" }
            ]
        },
        {
            id: "cart_top",
            section: "Cart Page — Top Banner",
            table: "ecom_banners",
            requirement: "optional",
            description: "Promotional banner at the top of the cart page",
            fields: [
                { id: "title", label: "Title", type: "text" },
                { id: "image_url", label: "Banner Image", type: "image" },
                { id: "badge_text", label: "Offer Badge", type: "text" }
            ]
        },
        {
            id: "checkout_top",
            section: "Checkout Page — Top Banner",
            table: "ecom_banners",
            requirement: "optional",
            description: "Trust/offer banner at the top of checkout",
            fields: [
                { id: "title", label: "Title", type: "text" },
                { id: "image_url", label: "Banner Image", type: "image" }
            ]
        },
        {
            id: "payment_top",
            section: "Payment / Order Success Banner",
            table: "ecom_banners",
            requirement: "optional",
            description: "Upsell or thank-you banner shown after payment",
            fields: [
                { id: "title", label: "Title", type: "text" },
                { id: "image_url", label: "Banner Image", type: "image" },
                { id: "button_text", label: "CTA Label", type: "text" },
                { id: "button_link", label: "CTA URL", type: "url" }
            ]
        }
    ],
    "WEBSITE_PAGES": [
        {
            id: "static_pages",
            section: "Content Pages",
            table: "ecom_pages",
            requirement: "mandatory",
            description: "Informational pages like About, Contact, Privacy",
            fields: [
                { id: "title", label: "Page Title", type: "text" },
                { id: "slug", label: "URL Path", type: "url" },
                { id: "content", label: "Rich Content", type: "json" },
                { id: "is_published", label: "Published Status", type: "boolean" }
            ]
        }
    ],
    "WEBSITE_BLOG": [
        {
            id: "blog_posts",
            section: "Journal Entries",
            table: "ecom_blog",
            requirement: "optional",
            description: "Blog articles and news updates",
            fields: [
                { id: "title", label: "Article Title", type: "text" },
                { id: "category", label: "Category", type: "text" },
                { id: "image_url", label: "Cover Image", type: "image" },
                { id: "content", label: "Article Body", type: "json" },
                { id: "is_published", label: "Published", type: "boolean" }
            ]
        }
    ],
    "SITE_NAVIGATION": [
        {
            id: "nav_menus",
            section: "Navigation Menus",
            table: "ecom_menus",
            requirement: "mandatory",
            description: "Global navigation links and footer menus",
            fields: [
                { id: "label", label: "Link Text", type: "text" },
                { id: "link_url", label: "Destination URL", type: "url" },
                { id: "display_order", label: "Order", type: "number" }
            ]
        }
    ],
    "BRAND_IDENTITY": [
        {
            id: "core_settings",
            section: "Global Settings",
            table: "ecom_settings",
            requirement: "mandatory",
            description: "Logo, Theme Colors, and SEO Metadata",
            fields: [
                { id: "store_name", label: "Store Name", type: "text" },
                { id: "store_tagline", label: "Slogan", type: "text" },
                { id: "logo_url", label: "Brand Logo", type: "image" },
                { id: "primary_color", label: "Brand Primary Hex", type: "text" }
            ]
        }
    ],
    "CHECKOUT": [
        {
            id: "payment_gateways",
            section: "Payment Methods",
            table: "payment_gateways",
            requirement: "mandatory",
            description: "Active gateways like Razorpay, Stripe, or COD",
            fields: [
                { id: "display_name", label: "Public Name", type: "text" },
                { id: "gateway", label: "Provider", type: "text" },
                { id: "is_active", label: "Enabled", type: "boolean" }
            ]
        }
    ]
};

/**
 * Utility to get table name for a specific site section
 * This prevents hardcoding table names in UI components.
 */
export const getMappedTable = (screen: string, sectionId: string) => {
    return SITE_REGISTRY[screen]?.find(m => m.id === sectionId)?.table || null;
};
