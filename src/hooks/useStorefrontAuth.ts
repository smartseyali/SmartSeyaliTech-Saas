import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { sendVerificationEmail } from "@/lib/services/emailService";

export interface StorefrontCustomer {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    company_id: number;
    status: string;
    email_verified: boolean;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    total_orders?: number;
    total_spent?: number;
}

const STORAGE_KEY = "ecom_customer_session";

function getStoredSession(): StorefrontCustomer | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch { return null; }
}

function setStoredSession(customer: StorefrontCustomer | null) {
    if (customer) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customer));
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
}

/**
 * Storefront Customer Auth Hook
 * Direct auth using ecom_customers table — no Supabase auth.users involved.
 * Passwords hashed with pgcrypto (bcrypt) in the database.
 * Session persisted in localStorage.
 */
export function useStorefrontAuth() {
    const [customer, setCustomer] = useState<StorefrontCustomer | null>(null);
    const [loading, setLoading] = useState(true);

    // Restore session from localStorage on mount
    useEffect(() => {
        const stored = getStoredSession();
        if (stored) {
            // Verify the customer still exists and is active
            supabase.from("ecom_customers")
                .select("id, status")
                .eq("id", stored.id)
                .eq("status", "active")
                .maybeSingle()
                .then(({ data }) => {
                    if (data) {
                        setCustomer(stored);
                    } else {
                        setStoredSession(null);
                    }
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const signUp = useCallback(async (data: {
        email: string;
        password: string;
        fullName: string;
        phone: string;
        companyId: number;
    }) => {
        const { data: result, error } = await supabase.rpc("customer_signup", {
            p_company_id: data.companyId,
            p_email: data.email,
            p_password: data.password,
            p_full_name: data.fullName,
            p_phone: data.phone,
        });

        if (error) throw new Error(error.message);

        const cust: StorefrontCustomer = {
            id: result.id,
            email: result.email,
            full_name: result.full_name,
            phone: result.phone,
            company_id: result.company_id,
            status: result.status,
            email_verified: false,
        };

        // Send verification email via merchant's SMTP
        if (result.verification_token) {
            sendVerificationEmail(
                data.companyId,
                data.email,
                data.fullName,
                result.verification_token
            ).catch(err => console.error("Failed to send verification email:", err));
        }

        // Log in the customer (they can browse, but checkout requires verified email)
        setCustomer(cust);
        setStoredSession(cust);
        return cust;
    }, []);

    const signIn = useCallback(async (email: string, password: string, companyId: number) => {
        const { data: result, error } = await supabase.rpc("customer_login", {
            p_company_id: companyId,
            p_email: email,
            p_password: password,
        });

        if (error) throw new Error(error.message);

        const cust: StorefrontCustomer = {
            id: result.id,
            email: result.email,
            full_name: result.full_name,
            phone: result.phone,
            company_id: result.company_id,
            status: result.status,
            email_verified: result.email_verified ?? false,
            address: result.address,
            city: result.city,
            state: result.state,
            pincode: result.pincode,
            total_orders: result.total_orders,
            total_spent: result.total_spent,
        };

        setCustomer(cust);
        setStoredSession(cust);
        return cust;
    }, []);

    const signOut = useCallback(() => {
        setCustomer(null);
        setStoredSession(null);
    }, []);

    const refreshCustomer = useCallback(async () => {
        if (!customer) return;
        const { data } = await supabase
            .from("ecom_customers")
            .select("*")
            .eq("id", customer.id)
            .maybeSingle();
        if (data) {
            const updated: StorefrontCustomer = {
                id: data.id,
                email: data.email,
                full_name: data.full_name,
                phone: data.phone,
                company_id: data.company_id,
                status: data.status,
                email_verified: data.email_verified ?? false,
                address: data.address,
                city: data.city,
                state: data.state,
                pincode: data.pincode,
                total_orders: data.total_orders,
                total_spent: data.total_spent,
            };
            setCustomer(updated);
            setStoredSession(updated);
            return updated;
        }
    }, [customer]);

    const resendVerification = useCallback(async () => {
        if (!customer) throw new Error("Not logged in");
        const { data: result, error } = await supabase.rpc("customer_resend_verification", {
            p_company_id: customer.company_id,
            p_email: customer.email,
        });
        if (error) throw new Error(error.message);
        if (result?.already_verified) throw new Error("Email is already verified");

        // Send the new verification email
        if (result?.token) {
            await sendVerificationEmail(
                customer.company_id,
                customer.email,
                customer.full_name,
                result.token
            );
        }
    }, [customer]);

    return {
        customer,
        loading,
        isAuthenticated: !!customer,
        isVerified: customer?.email_verified ?? false,
        signUp,
        signIn,
        signOut,
        refreshCustomer,
        resendVerification,
    };
}
