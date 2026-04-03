import { FileText } from "lucide-react";
import DocPage from "@/components/modules/DocPage";

export default function Orders() {
  return (
    <DocPage
      doctype="salesOrder"
      customFormActions={(record, navigate) =>
        record?.id && record?.status === "confirmed" ? (
          <button
            onClick={() =>
              navigate("/apps/sales/invoices", {
                state: { conversionType: "so_to_invoice", sourceRecord: record },
              })
            }
            className="flex items-center h-8 px-3 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Create Invoice
          </button>
        ) : null
      }
    />
  );
}
