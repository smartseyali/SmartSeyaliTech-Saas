/**
 * Phase 3 mock data. Replaced in Phase 6 by Supabase build-time fetch
 * filtered by tenant_id.
 */

export type Category = {
  slug: string;
  name: string;
  image: string;
  productCount: number;
};

export type ProductVariant = {
  id: string;
  name: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  stockQty: number;
  imageUrl?: string;
  sku?: string;
  isDefault: boolean;
  sortOrder?: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  description: string;
  shortDescription: string;
  image: string;
  images?: string[];
  price: number;
  compareAtPrice?: number;
  rating?: number;
  ratingCount?: number;
  badge?: "new" | "bestseller" | "sale" | "out-of-stock";
  inStock?: boolean;
  weight?: string;
  hasVariants?: boolean;
  variants?: ProductVariant[];
};

export const CATEGORIES: Category[] = [
  { slug: "cold-pressed-oils", name: "Cold-Pressed Oils", image: "/placeholders/category-oils.svg", productCount: 12 },
  { slug: "millets-grains", name: "Millets & Grains", image: "/placeholders/category-millets.svg", productCount: 18 },
  { slug: "spices-masalas", name: "Spices & Masalas", image: "/placeholders/category-spices.svg", productCount: 24 },
  { slug: "snacks-sweets", name: "Snacks & Sweets", image: "/placeholders/category-snacks.svg", productCount: 16 },
  { slug: "honey-pickles", name: "Honey & Pickles", image: "/placeholders/category-honey.svg", productCount: 9 },
  { slug: "wellness", name: "Wellness", image: "/placeholders/category-wellness.svg", productCount: 11 },
];

export const PRODUCTS: Product[] = [
  {
    id: "p001",
    slug: "cold-pressed-coconut-oil",
    name: "Cold-Pressed Virgin Coconut Oil",
    category: "Cold-Pressed Oils",
    categorySlug: "cold-pressed-oils",
    shortDescription: "Wood-pressed from sun-dried copra. No chemicals, no heat.",
    description:
      "Our cold-pressed coconut oil is extracted using traditional wood-press (chekku) methods. Sourced from sun-dried copra, this oil retains its natural aroma, flavour, and health properties — perfect for cooking, hair, and skin.",
    image: "/placeholders/product-1.svg",
    price: 449,
    compareAtPrice: 549,
    rating: 4.8,
    ratingCount: 124,
    badge: "bestseller",
    inStock: true,
    weight: "500ml",
  },
  {
    id: "p002",
    slug: "kambu-millet-1kg",
    name: "Pearl Millet (Kambu) — 1kg",
    category: "Millets & Grains",
    categorySlug: "millets-grains",
    shortDescription: "Naturally cultivated, hand-cleaned pearl millet.",
    description:
      "Cultivated by small-holding farmers in Tamil Nadu without chemical fertilisers. Pearl millet (kambu) is rich in iron, fibre, and protein — ideal for porridges, dosas, and rotis.",
    image: "/placeholders/product-2.svg",
    price: 180,
    rating: 4.7,
    ratingCount: 89,
    badge: "new",
    inStock: true,
    weight: "1kg",
  },
  {
    id: "p003",
    slug: "hand-pounded-sambar-powder",
    name: "Hand-Pounded Sambar Powder",
    category: "Spices & Masalas",
    categorySlug: "spices-masalas",
    shortDescription: "Slow-roasted and hand-pounded the traditional way.",
    description:
      "Made in small batches using a stone mill (ammikkal). Premium dals, dried red chillies, and coriander are slow-roasted, sun-cooled, and hand-pounded — preserving the aroma machines can&apos;t replicate.",
    image: "/placeholders/product-3.svg",
    price: 220,
    compareAtPrice: 280,
    rating: 4.9,
    ratingCount: 215,
    inStock: true,
    weight: "200g",
  },
  {
    id: "p004",
    slug: "raw-forest-honey",
    name: "Raw Forest Honey",
    category: "Honey & Pickles",
    categorySlug: "honey-pickles",
    shortDescription: "Unprocessed, unfiltered honey from the Western Ghats.",
    description:
      "Sourced directly from tribal honey collectors in the Western Ghats. Unheated, unprocessed, and unfiltered — the way honey should be.",
    image: "/placeholders/product-4.svg",
    price: 599,
    rating: 4.6,
    ratingCount: 67,
    inStock: true,
    weight: "500g",
  },
  {
    id: "p005",
    slug: "country-rice-payasam-mix",
    name: "Country Rice Payasam Mix",
    category: "Snacks & Sweets",
    categorySlug: "snacks-sweets",
    shortDescription: "Traditional payasam ready in 15 minutes.",
    description:
      "A grandmother&apos;s recipe passed down through generations. Country rice (Mappillai Samba), palm jaggery, cardamom, cashews, and ghee — just add milk.",
    image: "/placeholders/product-5.svg",
    price: 320,
    rating: 4.8,
    ratingCount: 92,
    badge: "bestseller",
    inStock: true,
    weight: "300g",
  },
  {
    id: "p006",
    slug: "groundnut-oil-1l",
    name: "Wood-Pressed Groundnut Oil — 1L",
    category: "Cold-Pressed Oils",
    categorySlug: "cold-pressed-oils",
    shortDescription: "Single-pressed, unrefined, naturally aromatic.",
    description:
      "Pressed from premium Tamil Nadu groundnuts using traditional chekku machines. Single-pressed and unrefined — preserving the natural nutty aroma.",
    image: "/placeholders/product-6.svg",
    price: 549,
    compareAtPrice: 649,
    rating: 4.7,
    ratingCount: 156,
    inStock: true,
    weight: "1L",
  },
  {
    id: "p007",
    slug: "ragi-flour-organic",
    name: "Organic Ragi Flour",
    category: "Millets & Grains",
    categorySlug: "millets-grains",
    shortDescription: "Stone-ground finger millet flour.",
    description:
      "Stone-ground at low temperature to preserve nutrients. Naturally rich in calcium and iron. Perfect for ragi malt, dosa, and porridge.",
    image: "/placeholders/product-7.svg",
    price: 160,
    rating: 4.5,
    ratingCount: 73,
    inStock: true,
    weight: "1kg",
  },
  {
    id: "p008",
    slug: "kashmiri-chilli-powder",
    name: "Kashmiri Chilli Powder",
    category: "Spices & Masalas",
    categorySlug: "spices-masalas",
    shortDescription: "Vibrant red colour, mild heat.",
    description:
      "Sun-dried Kashmiri chillies, hand-stemmed and stone-ground. Adds rich red colour to your curries with gentle heat.",
    image: "/placeholders/product-8.svg",
    price: 180,
    rating: 4.6,
    ratingCount: 51,
    badge: "new",
    inStock: true,
    weight: "200g",
  },
];

export const FEATURED_PRODUCTS = PRODUCTS.slice(0, 8);
