import { Globe2, FileText, Image, MessageSquare, HelpCircle, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import DashboardTemplate from "@/components/modules/DashboardTemplate";
import type { KPICard } from "@/components/modules/DashboardTemplate";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TemplatePreviewIframe } from "@/components/templates/TemplatePreviewIframe";

export default function WebsiteDashboard() {
  const { activeCompany } = useTenant();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pages: 0, posts: 0, enquiries: 0, gallery: 0, faqs: 0 });

  useEffect(() => {
    if (!activeCompany) return;
    const load = async () => {
      const [pages, posts, enquiries, gallery, faqs] = await Promise.all([
        supabase.from("web_pages").select("id", { count: "exact" }).eq("company_id", activeCompany.id),
        supabase.from("blog_posts").select("id", { count: "exact" }).eq("company_id", activeCompany.id),
        supabase.from("web_enquiries").select("id", { count: "exact" }).eq("company_id", activeCompany.id),
        supabase.from("gallery_items").select("id", { count: "exact" }).eq("company_id", activeCompany.id),
        supabase.from("web_faqs").select("id", { count: "exact" }).eq("company_id", activeCompany.id),
      ]);
      setStats({
        pages: pages.count || 0,
        posts: posts.count || 0,
        enquiries: enquiries.count || 0,
        gallery: gallery.count || 0,
        faqs: faqs.count || 0,
      });
    };
    load();
  }, [activeCompany]);

  const kpis: KPICard[] = [
    { label: "Web Pages", value: stats.pages, icon: Globe2, color: "text-sky-600", bg: "bg-sky-50" },
    { label: "Blog Posts", value: stats.posts, icon: FileText, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Enquiries", value: stats.enquiries, subtitle: "Total leads", icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Gallery Items", value: stats.gallery, icon: Image, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <DashboardTemplate
      title="Website & CMS"
      subtitle="Content Management"
      accentColor="border-sky-500"
      dotColor="bg-sky-500"
      kpis={kpis}
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate("/apps/website/pages")} className="text-xs">
            <Globe2 className="w-3.5 h-3.5 mr-1.5" /> Manage Pages
          </Button>
          <Button size="sm" onClick={() => navigate("/apps/website/blog")} className="text-xs bg-sky-600 hover:bg-sky-700">
            <FileText className="w-3.5 h-3.5 mr-1.5" /> New Blog Post
          </Button>
        </div>
      }
    >
      <div className="mb-4">
        <TemplatePreviewIframe
          companyId={activeCompany?.id}
          moduleId="website"
          companySubdomain={(activeCompany as any)?.subdomain ?? (activeCompany as any)?.slug}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "New Page", icon: Globe2, path: "/apps/website/pages" },
              { label: "New Blog Post", icon: FileText, path: "/apps/website/blog" },
              { label: "Upload Media", icon: Image, path: "/apps/website/gallery" },
              { label: "View Enquiries", icon: MessageSquare, path: "/apps/website/enquiries" },
              { label: "Manage FAQs", icon: HelpCircle, path: "/apps/website/faqs" },
              { label: "Edit Menu", icon: TrendingUp, path: "/apps/website/menu" },
            ].map(a => (
              <button key={a.label} onClick={() => navigate(a.path)}
                className="flex items-center gap-2 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-colors text-left">
                <a.icon className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-700">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Enquiries placeholder */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Recent Enquiries</h3>
          <p className="text-xs text-slate-400">Enquiries from your website will appear here.</p>
        </div>
      </div>
    </DashboardTemplate>
  );
}
