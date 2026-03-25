import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Loader2, ShieldCheck, Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function PlatformUsers() {
    const { toast } = useToast();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [systemModules, setSystemModules] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        // Load All System Modules for reference
        const { data: modResp } = await supabase.from('system_modules').select('id, name');
        if (modResp) setSystemModules(modResp);

        // Fetch all platform users and their company mappings & permissions
        const { data: usersData, error } = await supabase
            .from('users')
            .select(`
                *,
                company_users (
                    id,
                    role,
                    company_id,
                    companies ( name ),
                    user_permissions ( resource, action )
                )
            `)
            .order('created_at', { ascending: false });

        if (!error && usersData) {
            setUsers(usersData);
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
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
                <p className="text-sm font-medium text-slate-500 mt-2">Global view of all user authentications, their linked merchant companies, and module permissions.</p>
            </div>

            <div className="bg-white border text-left rounded-2xl shadow-sm overflow-hidden auto-cols-auto">
                <table className="w-full text-sm table-fixed">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="font-bold text-slate-500  tracking-widest text-[10px] p-4 text-left w-1/4">User Info</th>
                            <th className="font-bold text-slate-500  tracking-widest text-[10px] p-4 text-left w-[20%]">Platform Role</th>
                            <th className="font-bold text-slate-500  tracking-widest text-[10px] p-4 text-left w-1/4">Linked Companies</th>
                            <th className="font-bold text-slate-500  tracking-widest text-[10px] p-4 text-left w-auto">Permissions / Modules</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 items-start">
                        {users.map((u) => {
                            const mappings = u.company_users || [];

                            return (
                                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors align-top">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                {u.avatar_url ? (
                                                    <img src={u.avatar_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Users className="w-5 h-5 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="font-bold text-slate-900 truncate">{u.full_name || 'Unnamed User'}</span>
                                                <span className="text-xs font-semibold text-slate-400 truncate">{u.username}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        {u.is_super_admin ? (
                                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none font-bold text-[9px]  tracking-widest px-2 py-1">Super Admin</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-slate-500 font-bold text-[9px]  tracking-widest px-2 py-1">Merchant User</Badge>
                                        )}
                                    </td>

                                    <td className="p-4">
                                        {mappings.length > 0 ? (
                                            <div className="flex flex-col gap-2">
                                                {mappings.map((m: any) => (
                                                    <div key={m.id} className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-green-500" />
                                                        <span className="text-[11px] font-bold text-slate-700">{m.companies?.name || 'Unknown'}</span>
                                                        <span className="text-[9px]  tracking-wider font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-100">
                                                            {m.role}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 font-semibold ">Unlinked Guest</span>
                                        )}
                                    </td>

                                    <td className="p-4">
                                        {u.is_super_admin ? (
                                            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg w-fit">
                                                <ShieldCheck className="w-4 h-4" />
                                                <span className="text-[10px] font-bold  tracking-widest">Global Master Access</span>
                                            </div>
                                        ) : mappings.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {mappings.some((m: any) => ['admin', 'owner'].includes(m.role)) ? (
                                                    <span className="text-[10px] font-bold text-green-600  tracking-widest border border-green-200 bg-green-50 px-2 py-1 rounded w-fit">
                                                        ALL TENANT MODULES (Admin)
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-500  tracking-widest bg-slate-100 px-2 py-1 rounded w-fit">
                                                        Restricted Staff Access
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400">-</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-sm font-semibold text-slate-400">
                                    No users found... which means you aren't here.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
