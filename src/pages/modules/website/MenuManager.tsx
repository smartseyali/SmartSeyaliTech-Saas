import DashboardTemplate from "@/components/modules/DashboardTemplate";
export default function MenuManager() {
  return (
    <DashboardTemplate title="Navigation Menu" subtitle="Website" accentColor="border-sky-500" dotColor="bg-sky-500">
      <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm text-center">
        <p className="text-sm text-slate-500">Drag-and-drop menu builder coming soon.</p>
        <p className="text-xs text-slate-400 mt-1">Configure your website's header and footer navigation.</p>
      </div>
    </DashboardTemplate>
  );
}
