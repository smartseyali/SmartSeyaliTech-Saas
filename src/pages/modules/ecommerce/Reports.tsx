import { ModuleListPage } from "@/components/modules/ModuleListPage";
import { FileText, Download, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const reports = [
    { name: "Sales Manifest (Monthly)", type: "Financial", status: "Ready", last_run: "2024-05-30" },
    { name: "Inventory Reconciliation", type: "Stock", status: "Ready", last_run: "2024-05-29" },
    { name: "Tax Extract - GST Q1", type: "Compliance", status: "Generated", last_run: "2024-05-15" },
    { name: "Customer Acquisition Source", type: "Marketing", status: "Ready", last_run: "2024-05-31" },
    { name: "Abandoned Cart Retargeting", type: "Growth", status: "Processing", last_run: "2024-05-31" },
];

const columns = [
    { key: "name", label: "Report Name" },
    { key: "type", label: "Category" },
    { key: "status", label: "Status" },
    { key: "last_run", label: "Last Extraction" },
];

export default function Reports() {
    return (
        <div className="space-y-8">
            <ModuleListPage
                title="System Reports"
                subtitle="Downloadable data extracts for audit and reconciliation."
                columns={columns}
                data={reports}
                loading={false}
                headerActions={
                    <div className="flex gap-4">
                        <Button variant="outline" className="rounded-xl font-bold gap-2">
                            <Calendar className="w-4 h-4" />
                            Date Range
                        </Button>
                        <Button variant="outline" className="rounded-xl font-bold gap-2">
                            <Filter className="w-4 h-4" />
                            Filter Category
                        </Button>
                    </div>
                }
                actions={(row) => (
                    <Button variant="outline" size="sm" className="h-8 rounded-lg font-bold gap-2 border-primary/20">
                        <Download className="w-3.5 h-3.5 text-primary" />
                        Download
                    </Button>
                )}
            />
        </div>
    );
}
