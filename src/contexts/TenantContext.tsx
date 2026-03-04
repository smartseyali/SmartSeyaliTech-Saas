import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Rocket } from "lucide-react";

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
        const reserved = ['ecommerce', 'login', 'ecommerce-login', 'onboarding', 'super-admin', 'reset-password', 'cart', 'checkout'];
        const potentialSlug = pathParts[0];

        if (potentialSlug && !reserved.includes(potentialSlug)) {
            const { data: companyBySlug } = await supabase
                .from('companies')
                .select('id, name, subdomain, industry_type, user_id')
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
                    .select('id, name, subdomain, industry_type, user_id')
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
            setLoading(true);
            // 1. Look up the user in public.users table
            let { data: localUser } = await supabase
                .from('users')
                .select('id, is_super_admin')
                .eq('username', user.email)
                .maybeSingle();

            // AUTO-SYNC: If user exists in Auth but not in public profiles, create it
            if (!localUser) {
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
            if (localUser?.is_super_admin) {
                const { data: allCompanies } = await supabase
                    .from('companies')
                    .select('id, name, subdomain, industry_type, user_id')
                    .order('name');

                const companiesData = (allCompanies || []) as Company[];
                setCompanies(companiesData);

                // Persistence: Check localStorage for previously selected company
                const savedId = localStorage.getItem('last_company_id');
                const savedCompany = companiesData.find(c => String(c.id) === savedId);

                setActiveCompany(savedCompany || companiesData[0] || null);
                setNeedsOnboarding(companiesData.length === 0);
                return;
            }

            // 3. Regular user: load only companies they belong to via company_users
            const { data: mappings } = await supabase
                .from('company_users')
                .select('company_id, companies(id, name, subdomain, industry_type, user_id)')
                .eq('user_id', user.id);

            // FALLBACK: Also check if they are the direct owner of any company
            const { data: ownedCompanies } = await supabase
                .from('companies')
                .select('id, name, subdomain, industry_type, user_id')
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
                    const { data: defaultComp } = await supabase.from('companies').select('id, name, subdomain, industry_type, user_id').limit(1).maybeSingle();
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

    return (
        <TenantContext.Provider value={{
            activeCompany,
            companies,
            setCompany,
            refreshTenant: initializeTenant,
            needsOnboarding,
            loading
        }}>
            {loading ? (
                <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F8F9FA]">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white animate-bounce shadow-2xl mb-4">
                        <Rocket className="w-8 h-8" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Architecting Workspace...</span>
                </div>
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

