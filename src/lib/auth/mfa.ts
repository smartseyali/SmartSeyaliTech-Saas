import { supabase } from "@/lib/supabase";

export type TotpEnrollment = {
    factorId: string;
    qrCodeSvg: string;
    secret: string;
    uri: string;
};

export type MfaFactor = {
    id: string;
    friendlyName: string | null;
    factorType: "totp" | "phone";
    status: "verified" | "unverified";
    createdAt: string;
};

export type AalState = {
    currentLevel: "aal1" | "aal2" | null;
    nextLevel: "aal1" | "aal2" | null;
    currentAuthenticationMethods: string[];
};

export async function listFactors(): Promise<MfaFactor[]> {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) throw error;
    const all = [...(data?.totp ?? []), ...(data?.phone ?? [])];
    return all.map((f: any) => ({
        id: f.id,
        friendlyName: f.friendly_name ?? null,
        factorType: f.factor_type,
        status: f.status,
        createdAt: f.created_at,
    }));
}

export async function enrollTotp(friendlyName: string): Promise<TotpEnrollment> {
    const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName,
    });
    if (error) throw error;
    return {
        factorId: data.id,
        qrCodeSvg: data.totp.qr_code,
        secret: data.totp.secret,
        uri: data.totp.uri,
    };
}

export async function verifyEnrollment(factorId: string, code: string): Promise<void> {
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) throw challengeError;

    const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
    });
    if (verifyError) throw verifyError;
}

export async function challengeAndVerify(factorId: string, code: string): Promise<void> {
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    if (error) throw error;
}

export async function unenroll(factorId: string): Promise<void> {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) throw error;
}

export async function getAal(): Promise<AalState> {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) throw error;
    return {
        currentLevel: (data?.currentLevel as AalState["currentLevel"]) ?? null,
        nextLevel: (data?.nextLevel as AalState["nextLevel"]) ?? null,
        currentAuthenticationMethods: data?.currentAuthenticationMethods ?? [],
    };
}

export function needsMfaChallenge(aal: AalState): boolean {
    return aal.currentLevel === "aal1" && aal.nextLevel === "aal2";
}
