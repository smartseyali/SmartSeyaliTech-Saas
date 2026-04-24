import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getAal, type AalState } from "@/lib/auth/mfa";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    aal: AalState;
    refreshAal: () => Promise<void>;
    signOut: () => Promise<void>;
}

const DEFAULT_AAL: AalState = {
    currentLevel: null,
    nextLevel: null,
    currentAuthenticationMethods: [],
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    aal: DEFAULT_AAL,
    refreshAal: async () => { },
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [aal, setAal] = useState<AalState>(DEFAULT_AAL);
    const userIdRef = useRef<string | null>(null);

    const refreshAal = useCallback(async () => {
        try {
            const next = await getAal();
            setAal(next);
        } catch (err) {
            console.error("Failed to read AAL:", err);
            setAal(DEFAULT_AAL);
        }
    }, []);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data, error }) => {
            if (error) {
                console.error("Error fetching session:", error.message);
            }
            const s = data?.session ?? null;
            const u = s?.user ?? null;
            setSession(s);
            setUser(u);
            userIdRef.current = u?.id ?? null;
            if (u) refreshAal();
        })
        .catch((err) => {
            console.error("Auth configuration or network error:", err);
            setSession(null);
            setUser(null);
            userIdRef.current = null;
        })
        .finally(() => {
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, newSession) => {
                const newUser = newSession?.user ?? null;
                const newUserId = newUser?.id ?? null;

                // Always update the session (keeps tokens fresh)
                setSession(newSession);

                if (event === 'SIGNED_OUT') {
                    setUser(null);
                    userIdRef.current = null;
                    setAal(DEFAULT_AAL);
                } else if (event === 'TOKEN_REFRESHED') {
                    // Token refresh: same user, just new tokens.
                    // Only update session (already done above), NOT the user object.
                    // This prevents unnecessary re-renders in TenantContext/PermissionsContext.
                    if (newUserId !== userIdRef.current) {
                        // Edge case: user actually changed during refresh
                        setUser(newUser);
                        userIdRef.current = newUserId;
                    }
                    // AAL can change on refresh after MFA verification
                    refreshAal();
                } else if (event === 'MFA_CHALLENGE_VERIFIED') {
                    refreshAal();
                } else {
                    // SIGNED_IN, INITIAL_SESSION, USER_UPDATED
                    // Only set user if it actually changed
                    if (newUserId !== userIdRef.current) {
                        setUser(newUser);
                        userIdRef.current = newUserId;
                    } else if (event === 'USER_UPDATED' && newUser) {
                        // User metadata may have changed (name, avatar, etc)
                        setUser(newUser);
                    }
                    if (newUser) refreshAal();
                }

                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [refreshAal]);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
    }, []);

    return (
        <AuthContext.Provider value={{ user, session, loading, aal, refreshAal, signOut }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
