import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Building2, Shield, Users, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Tenants() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        setLoading(true);
        // Fetch all companies along with their users
        const { data, error } = await supabase
            .from('companies')
            .select(`
                *,
                company_users (
                    role,
                    users (
                        full_name,
                        username
                    )
                )
            `)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setCompanies(data);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tenant Management</h1>
                <p className="text-sm font-medium text-slate-500 mt-2">Manage all registered merchant companies and their plans on the platform.</p>
            </div>

            <div className="bg-white border text-left rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="font-bold text-slate-500  tracking-widest text-[10px] p-4 text-left">Company</th>
                            <th className="font-bold text-slate-500  tracking-widest text-[10px] p-4 text-left">Plan / Type</th>
                            <th className="font-bold text-slate-500  tracking-widest text-[10px] p-4 text-left">Primary Admins</th>
                            <th className="font-bold text-slate-500  tracking-widest text-[10px] p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {companies.map((c) => {
                            const admins = c.company_users?.filter((cu: any) => cu.role === 'owner' || cu.role === 'admin') || [];

                            return (
                                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                                <Building2 className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{c.name}</p>
                                                <p className="text-xs font-semibold text-slate-400">{c.subdomain}.domain.com</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 inline-flex">
                                            <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]  tracking-wider w-fit">
                                                {c.plan || 'Starter'}
                                            </span>
                                            {c.industry_type && (
                                                <span className="text-[10px] font-bold text-slate-400 ">{c.industry_type}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {admins.length > 0 ? (
                                            <div className="flex flex-col gap-2">
                                                {admins.slice(0, 2).map((adm: any, i: number) => (
                                                    <div key={i} className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-900">{adm.users?.full_name || 'Admin'}</span>
                                                        <span className="text-[10px] font-semibold text-slate-500">{adm.users?.username}</span>
                                                    </div>
                                                ))}
                                                {admins.length > 2 && (
                                                    <span className="text-[10px] font-bold text-slate-400">+{admins.length - 2} more</span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 font-semibold ">No admins linked</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button variant="outline" size="sm" className="hidden border-slate-200">
                                            Manage
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                        {companies.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-sm font-semibold text-slate-400">
                                    No tenant companies found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
