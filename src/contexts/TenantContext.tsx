import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import PLATFORM_CONFIG from "@/config/platform";
import { PlatformLoader } from "@/components/PlatformLoader";
import { RESERVED_ROUTES } from "@/constants/routes";

interface Company {
    id: number;
    name: string;
    subdomain: string;
    industry_type: 'retail' | 'education' | 'services' | 'hospitality';
    contact_phone?: string;
    contact_email?: string;
    address?: string;
    city?: string;
    state?: string;
    user_id?: string;
}

interface TenantContextType {
    activeCompany: Company | null;
    companies: Company[];
    setCompany: (id: number) => void;
    refreshTenant: () => Promise<void>;
    needsOnboarding: boolean;
    loading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [activeCompany, setActiveCompany] = useState<Company | null>(null);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);
    const [loading, setLoading] = useState(true);

    const initializeTenant = async () => {
        // SaaS Rule: Use path-based detection (e.g., /company-slug/shop)
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        let detectedCompany: Company | null = null;

        // If the first part of the path is likely a company subdomain/slug
        // We exclude known reserved routes like 'ecommerce', 'login', 'super-admin'
        const potentialSlug = pathParts[0];

        if (potentialSlug && !RESERVED_ROUTES.includes(potentialSlug as any)) {
            const { data: companyBySlug } = await supabase
                .from('companies')
                .select('id, name, subdomain, user_id')
                .eq('subdomain', potentialSlug)
                .maybeSingle();

            if (companyBySlug) {
                detectedCompany = companyBySlug as Company;
            }
        }

        if (!user) {
            setLoading(true);
            // For guest users (storefront), use detected company or fallback to first one for demo
            if (detectedCompany) {
                setActiveCompany(detectedCompany);
                setCompanies([detectedCompany]);
            } else {
                const { data: defaultComp } = await supabase
                    .from('companies')
                    .select('id, name, subdomain, user_id')
                    .limit(1)
                    .maybeSingle();

                if (defaultComp) {
                    setActiveCompany(defaultComp as Company);
                    setCompanies([defaultComp as Company]);
                }
            }
            setLoading(false);
            return;
        }

        try {
            if (!activeCompany) setLoading(true);
            // 1. Look up the user in public.users table
            let { data: localUser } = await supabase
                .from('users')
                .select('id, is_super_admin')
                .ilike('username', user.email || '')
                .maybeSingle();

            // HARDCORE BYPASS for the Primary Super Admin
            const isSuperAdminByEmail = user.email?.toLowerCase() === PLATFORM_CONFIG.superAdminEmail.toLowerCase();

            // AUTO-SYNC: If user exists in Auth but not in public profiles, create it
            if (!localUser && !isSuperAdminByEmail) {
                const { data: newUser, error: uErr } = await supabase.from('users').insert({
                    id: user.id,
                    username: user.email,
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                    is_super_admin: false // Default to regular user
                }).select().single();
                if (!uErr && newUser) {
                    localUser = newUser;
                }
            }

            // 2. SUPER ADMIN: load ALL companies so admin can switch between tenants
            if (localUser?.is_super_admin || isSuperAdminByEmail) {
                const { data: allCompanies } = await supabase
                    .from('companies')
                    .select('id, name, subdomain, user_id')
                    .order('name');

                const companiesData = (allCompanies || []) as Company[];
                setCompanies(companiesData);

                // Persistence: Check localStorage for previously selected company
                const savedId = localStorage.getItem('last_company_id');
                const savedCompany = companiesData.find(c => String(c.id) === savedId);

                setActiveCompany(savedCompany || companiesData[0] || null);
                setNeedsOnboarding(false);
                setLoading(false);
                return;
            }

            // 3. Regular user: load only companies they belong to via company_users
            const { data: mappings } = await supabase
                .from('company_users')
                .select('company_id, companies(id, name, subdomain, user_id)')
                .eq('user_id', user.id);

            // FALLBACK: Also check if they are the direct owner of any company
            const { data: ownedCompanies } = await supabase
                .from('companies')
                .select('id, name, subdomain, user_id')
                .eq('user_id', user.id);

            let companiesData = (mappings || [])
                .map(m => m.companies)
                .flat()
                .filter(Boolean) as unknown as Company[];

            // Merge with owned companies (deduplicate by ID)
            (ownedCompanies || []).forEach(oc => {
                if (!companiesData.find(c => c.id === oc.id)) {
                    companiesData.push(oc as Company);
                }
            });

            if (companiesData.length > 0) {
                setCompanies(companiesData);
                setActiveCompany(companiesData[0]);
                setNeedsOnboarding(false);
            } else {
                // No company mapping — they need to onboard as a merchant
                setNeedsOnboarding(true);
                setCompanies([]);

                // For the view layer, we still need a company context if they are on a storefront
                if (detectedCompany) {
                    setActiveCompany(detectedCompany);
                } else {
                    const { data: defaultComp } = await supabase.from('companies').select('id, name, subdomain, user_id').limit(1).maybeSingle();
                    if (defaultComp) setActiveCompany(defaultComp as Company);
                }
            }
        } catch (err) {
            console.error("Tenant Error:", err);
            setNeedsOnboarding(true);
            setCompanies([]);
            setActiveCompany(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initializeTenant();
    }, [user]);

    const setCompany = (id: number) => {
        const company = companies.find(c => c.id === id);
        if (company) {
            setActiveCompany(company);
            localStorage.setItem('last_company_id', String(id));
        }
    };

    // Determine if we're on a public route — never block these with full-page loading spinner
    const isPublicRoute = (() => {
        const p = window.location.pathname;
        const parts = p.split('/').filter(Boolean);
        const first = parts[0] || '';

        // These routes are definitely NOT public apps (they need the splash)
        const appRoutes = ['apps', 'super-admin', 'ecommerce'];
        if (appRoutes.includes(first)) return false;

        // If it's a known non-app reserved route, it's public (Marketing, Auth, etc)
        const publicReserved = ['login', 'onboarding', 'reset-password', 'ecommerce-login', 'about', 'services', 'products', 'contact', 'policy', 'seed'];
        if (publicReserved.includes(first)) return true;

        // Root is public
        if (!first) return true;

        // Default: Storefronts (/:slug/...) are considered public/lightweight
        return true;
    })();

    // Delayed loading UI to prevent flickering on fast connections
    const [showSplash, setShowSplash] = useState(false);
    useEffect(() => {
        let timer: any;
        if (loading && !isPublicRoute && !activeCompany) {
            timer = setTimeout(() => setShowSplash(true), 300);
        } else {
            setShowSplash(false);
        }
        return () => clearTimeout(timer);
    }, [loading, isPublicRoute, activeCompany]);

    return (
        <TenantContext.Provider value={{
            activeCompany,
            companies,
            setCompany,
            refreshTenant: initializeTenant,
            needsOnboarding,
            loading
        }}>
            {showSplash ? (
                <PlatformLoader message="Architecturing Workspace" subtext="Clinical Tenant Identity Induction" />
            ) : children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error("useTenant must be used within a TenantProvider");
    }
    return context;
}
