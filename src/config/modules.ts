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

    // ── COMMERCE ────────────────────────────────────────────────
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
        isCore: true,
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

    // ── FINANCE ─────────────────────────────────────────────────
    {
        id: 'books',
        name: 'Books (Accounting)',
        tagline: 'Ledgers and financial intelligence',
        description: 'Full double-entry accounting with chart of accounts, journals, trial balance, P&L, balance sheet, and compliance reporting.',
        icon: '📊',
        color: '#059669',
        colorFrom: 'from-emerald-500',
        colorTo: 'to-emerald-700',
        route: '/apps/books',
        dashboardRoute: '/apps/books',
        category: 'finance',
        status: 'beta',
        includedInPlans: ['professional', 'enterprise', 'custom'],
        isCore: false,
        features: [
            'Double-entry bookkeeping',
            'Chart of accounts',
            'Trial Balance & P&L',
            'Bank reconciliation',
            'GST/VAT compliance',
        ],
        needsTemplate: false,
    },
    {
        id: 'invoicing',
        name: 'Invoices',
        tagline: 'Professional invoices & payment tracking',
        description: 'Create and send branded invoices, track payments, set up recurring billing, and send automated reminders.',
        icon: '🧾',
        color: '#D97706',
        colorFrom: 'from-amber-500',
        colorTo: 'to-amber-700',
        route: '/apps/invoicing',
        dashboardRoute: '/apps/invoicing',
        category: 'finance',
        status: 'beta',
        includedInPlans: ['standard', 'professional', 'enterprise', 'custom'],
        isCore: false,
        features: [
            'Branded templates',
            'Recurring invoices',
            'Payment reminders',
            'Online collection',
        ],
        needsTemplate: false, // Invoice templates are internal, not website themes
    },
    {
        id: 'payroll',
        name: 'Payroll',
        tagline: 'Automate salary & compliance',
        description: 'Process monthly payroll with automated salary calculations, deductions, PF/ESI/TDS compliance, and payslip generation.',
        icon: '💰',
        color: '#0EA5E9',
        colorFrom: 'from-sky-500',
        colorTo: 'to-sky-700',
        route: '/apps/payroll',
        dashboardRoute: '/apps/payroll',
        category: 'finance',
        status: 'beta',
        includedInPlans: ['professional', 'enterprise', 'custom'],
        isCore: false,
        features: [
            'Salary configuration',
            'PF / ESI / TDS compliance',
            'Payslip generation',
            'Leave integration',
        ],
        needsTemplate: false,
    },

    // ── SALES & CUSTOMERS ───────────────────────────────────────
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
        name: 'Sales',
        tagline: 'Quotations and order processing',
        description: 'Manage quotations, sales orders, and customer payments. Seamlessly convert CRM deals into billable orders.',
        icon: '💼',
        color: '#4F46E5',
        colorFrom: 'from-indigo-500',
        colorTo: 'to-indigo-700',
        route: '/apps/sales',
        dashboardRoute: '/apps/sales',
        category: 'commerce',
        status: 'beta',
        includedInPlans: ['standard', 'professional', 'enterprise', 'custom'],
        isCore: false,
        features: [
            'Quotation Management (Header-Line)',
            'Sales Orders & Confirmation',
            'Delivery Notes & Logistics',
            'Automated Sales Invoicing',
            'Customer Ledger Tracking',
        ],
        needsTemplate: false,
    },
    {
        id: 'helpdesk',
        name: 'Ticket Booking',
        tagline: 'Support & ticket management',
        description: 'Multi-channel customer support with ticket management, SLA tracking, and expert helpdesk features.',
        icon: '🎧',
        color: '#0891B2',
        colorFrom: 'from-cyan-500',
        colorTo: 'to-cyan-700',
        route: '/apps/helpdesk',
        dashboardRoute: '/apps/helpdesk',
        category: 'customer',
        status: 'beta',
        includedInPlans: ['professional', 'enterprise', 'custom'],
        isCore: false,
        features: [
            'Ticket management',
            'SLA tracking',
            'Canned responses',
            'CSAT feedback',
        ],
        needsTemplate: false,
    },

    // ── OPERATIONS ──────────────────────────────────────────────
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
        status: 'beta',
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
            'Purchase Requests (Internal Demand)',
            'Vendor Management & RFQs',
            'Purchase Orders (Header-Line)',
            'Goods Receipt (GRN)',
            'Vendor Bills (Accounts Payable)',
        ],
        needsTemplate: false,
    },
    {
        id: 'landing-page',
        name: 'Landing Page Builder',
        tagline: 'Create high-converting pages',
        description: 'Drag-and-drop builder for marketing landing pages, linked directly to your products and CRM.',
        icon: '🌐',
        color: '#14B8A6',
        colorFrom: 'from-teal-500',
        colorTo: 'to-teal-700',
        route: '/apps/landing-page',
        dashboardRoute: '/apps/landing-page',
        category: 'commerce',
        status: 'beta',
        includedInPlans: ['standard', 'professional', 'enterprise', 'custom'],
        isCore: false,
        features: [
            'Drag-and-drop editor',
            'A/B testing',
            'Lead capture forms',
            'Analytics integration',
        ],
        needsTemplate: true,
    },

    // ── SPECIALIZED ─────────────────────────────────────────────
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
        id: 'hospital',
        name: 'Hospital Management',
        tagline: 'Healthcare service operations',
        description: 'Manage patient records, appointments, doctor schedules, lab reports, and medical billing.',
        icon: '🏥',
        color: '#BE185D',
        colorFrom: 'from-rose-500',
        colorTo: 'to-pink-700',
        route: '/apps/hospital',
        dashboardRoute: '/apps/hospital',
        category: 'operations',
        status: 'beta',
        includedInPlans: ['enterprise', 'custom'],
        isCore: false,
        features: [
            'Patient management',
            'Appointment scheduling',
            'Doctor schedules',
            'Billing & EMR',
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
        status: 'beta',
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
    {
        id: 'analytics',
        name: 'Analytics',
        tagline: 'Unified business intelligence',
        description: 'Cross-module dashboards with real-time KPIs and AI-powered business insights drawn from all apps.',
        icon: '📈',
        color: '#6366F1',
        colorFrom: 'from-indigo-500',
        colorTo: 'to-indigo-700',
        route: '/apps/analytics',
        dashboardRoute: '/apps/analytics',
        category: 'analytics',
        status: 'coming-soon',
        includedInPlans: ['enterprise', 'custom'],
        isCore: false,
        features: [
            'Unified dashboards',
            'Custom report builder',
            'AI insights',
            'Data exports',
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
