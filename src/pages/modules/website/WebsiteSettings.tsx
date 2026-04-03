import DashboardTemplate from "@/components/modules/DashboardTemplate";
export default function WebsiteSettings() {
  return (
    <DashboardTemplate title="Website Settings" subtitle="Website" accentColor="border-sky-500" dotColor="bg-sky-500">
      <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm text-center">
        <p className="text-sm text-slate-500">Website configuration panel coming soon.</p>
        <p className="text-xs text-slate-400 mt-1">Domain, SEO defaults, analytics, and theme settings.</p>
      </div>
    </DashboardTemplate>
  );
}
