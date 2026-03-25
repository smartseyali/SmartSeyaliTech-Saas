// ═══════════════════════════════════════════════════════════════
//  Unified SaaS Platform — Module Registry
// ═══════════════════════════════════════════════════════════════

export interface PlatformModule {
    id: string;               // Unique slug e.g. 'ecommerce'
    name: string;             // Display name e.g. 'E-Commerce'
    tagline: string;          // Short description
    description: string;      // Full description
    icon: string;             // Emoji icon
    color: string;            // Brand color (hex)
    colorFrom: string;        // Tailwind gradient from
    colorTo: string;          // Tailwind gradient to
    route: string;            // Base route e.g. '/apps/ecommerce'
    dashboardRoute: string;   // Default dashboard route
    category: ModuleCategory;
    status: 'live' | 'beta' | 'coming-soon' | 'planned';
    includedInPlans: string[]; // Plan slugs that include this module
    features: string[];       // Key feature bullet points
    isCore: boolean;          // Core modules always shown
    needsTemplate: boolean;   // Whether the onboarding needs a theme/template selection
}

export type ModuleCategory =
    | 'commerce'
    | 'finance'
    | 'operations'
    | 'people'
    | 'customer'
    | 'analytics'
    | 'collaboration';

export const PLATFORM_MODULES: PlatformModule[] = [
    {
        id: 'ecommerce',
        name: 'E-Commerce',
        tagline: 'Sell online with a full-featured store',
        description: 'Launch and manage your online store with products, orders, payments, shipping zones, coupons, and customer management.',
        icon: '🛒',
        color: '#2563EB',
        colorFrom: 'from-blue-500',
        colorTo: 'to-blue-700',
        route: '/apps/ecommerce',
        dashboardRoute: '/apps/ecommerce',
        category: 'commerce',
        status: 'live',
        includedInPlans: ['standard', 'professional', 'enterprise', 'custom'],
        isCore: false,
        features: [
            'Product catalog & variants',
            'Order management',
            'Payment gateway integration',
            'Shipping zones & delivery',
            'Website builder (templates)',
        ],
        needsTemplate: true,
    },
    {
        id: 'pos',
        name: 'Point of Sale',
        tagline: 'In-store billing at your fingertips',
        description: 'A fast, touch-friendly POS system for retail counters. Sync inventory in real time across online and offline channels.',
        icon: '🖥️',
        color: '#7C3AED',
        colorFrom: 'from-violet-500',
        colorTo: 'to-violet-700',
        route: '/apps/pos',
        dashboardRoute: '/apps/pos',
        category: 'commerce',
        status: 'beta',
        includedInPlans: ['professional', 'enterprise', 'custom'],
        isCore: false,
        features: [
            'Touch-optimized billing',
            'Barcode scanner support',
            'Multiple payment modes',
            'Day-end reports',
        ],
        needsTemplate: false,
    },
    {
        id: 'crm',
        name: 'CRM',
        tagline: 'Convert leads into loyal customers',
        description: 'Track leads, deals, and customer interactions across the full sales pipeline. Automate follow-ups and forecast revenue.',
        icon: '🎯',
        color: '#DC2626',
        colorFrom: 'from-red-500',
        colorTo: 'to-orange-600',
        route: '/apps/crm',
        dashboardRoute: '/apps/crm',
        category: 'customer',
        status: 'beta',
        includedInPlans: ['standard', 'professional', 'enterprise', 'custom'],
        isCore: false,
        features: [
            'Lead & contact management',
            'Sales pipeline (Kanban)',
            'Deal tracking & forecasting',
            'Activity reminders',
        ],
        needsTemplate: false,
    },
    {
        id: 'sales',
        name: 'Sales Management',
        tagline: 'Quotations and order processing',
        description: 'Manage quotations, sales orders, and customer payments. Seamlessly convert CRM deals into billable orders.',
        icon: '💼',
        color: '#4F46E5',
        colorFrom: 'from-indigo-500',
        colorTo: 'to-indigo-700',
        route: '/apps/sales',
        dashboardRoute: '/apps/sales',
        category: 'commerce',
        status: 'live',
        includedInPlans: ['standard', 'professional', 'enterprise', 'custom'],
        isCore: false,
        features: [
            'Quotation & Order Lifecycle',
            'Delivery Challans & Logistics',
            'Integrated Sales Invoicing',
            'Payment Receipts (Vouchers)',
            'Customer Statement Matrix',
        ],
        needsTemplate: false,
    },
    {
        id: 'inventory',
        name: 'Inventory',
        tagline: 'Stock control across locations',
        description: 'Manage stock levels, warehouses, batch/serial tracking, and multi-location transfers.',
        icon: '📦',
        color: '#F59E0B',
        colorFrom: 'from-yellow-500',
        colorTo: 'to-orange-600',
        route: '/apps/inventory',
        dashboardRoute: '/apps/inventory',
        category: 'operations',
        status: 'live',
        includedInPlans: ['professional', 'enterprise', 'custom'],
        isCore: false,
        features: [
            'Multi-warehouse control',
            'Batch & serial tracking',
            'Reorder point alerts',
            'Stock transfers',
        ],
        needsTemplate: false,
    },
    {
        id: 'purchase',
        name: 'Purchase',
        tagline: 'Streamline procurement end-to-end',
        description: 'Manage purchase requests, vendor quotes, purchase orders, and vendor invoices.',
        icon: '🛍️',
        color: '#EC4899',
        colorFrom: 'from-pink-500',
        colorTo: 'to-rose-600',
        route: '/apps/purchase',
        dashboardRoute: '/apps/purchase',
        category: 'operations',
        status: 'beta',
        includedInPlans: ['professional', 'enterprise', 'custom'],
        isCore: false,
        features: [
            'Purchase Requests (Internal)',
            'Vendor Management & RFQs',
            'Purchase Orders (Header-Line)',
            'Integrated Vendor Billing',
        ],
        needsTemplate: false,
    },
    {
        id: 'hrms',
        name: 'HRMS',
        tagline: 'Employee operations hub',
        description: 'Human resource management — employee records, leave management, attendance, and appraisals.',
        icon: '👥',
        color: '#10B981',
        colorFrom: 'from-green-500',
        colorTo: 'to-teal-600',
        route: '/apps/hrms',
        dashboardRoute: '/apps/hrms',
        category: 'people',
        status: 'beta',
        includedInPlans: ['professional', 'enterprise', 'custom'],
        isCore: false,
        features: [
            'Employee profiles',
            'Leave & Attendance',
            'Performance tracking',
            'Org hierarchy',
        ],
        needsTemplate: false,
    },
    {
        id: 'whatsapp',
        name: 'WhatsApp Integration',
        tagline: 'Connect customers on WhatsApp',
        description: 'Automate messages, send notifications, and provide customer support via the WhatsApp Business API.',
        icon: '💬',
        color: '#22C55E',
        colorFrom: 'from-green-400',
        colorTo: 'to-green-600',
        route: '/apps/whatsapp',
        dashboardRoute: '/apps/whatsapp',
        category: 'customer',
        status: 'live',
        includedInPlans: ['standard', 'professional', 'enterprise', 'custom'],
        isCore: false,
        features: [
            'Automated notifications',
            'Shared inbox',
            'Bulk messaging',
            'Chatbot integration',
        ],
        needsTemplate: false,
    },
];

// ── Helpers ─────────────────────────────────────────────────────

export function getModule(id: string): PlatformModule | undefined {
    return PLATFORM_MODULES.find(m => m.id === id);
}

export function getModuleByRoute(pathname: string): PlatformModule | undefined {
    return PLATFORM_MODULES.find(m => pathname.startsWith(m.route));
}

export function getModulesByCategory(category: ModuleCategory): PlatformModule[] {
    return PLATFORM_MODULES.filter(m => m.category === category);
}

export function getLiveModules(): PlatformModule[] {
    return PLATFORM_MODULES.filter(m => m.status === 'live' || m.status === 'beta');
}

export const CATEGORY_LABELS: Record<ModuleCategory, string> = {
    commerce: 'Commerce',
    finance: 'Finance & Accounting',
    operations: 'Operations',
    people: 'People & HR',
    customer: 'Customer Experience',
    analytics: 'Analytics & BI',
    collaboration: 'Collaboration',
};

export const STATUS_LABELS = {
    'live': 'Live',
    'beta': 'Beta',
    'coming-soon': 'Coming Soon',
    'planned': 'Planned',
};
