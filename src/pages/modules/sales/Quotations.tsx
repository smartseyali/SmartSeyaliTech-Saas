import { ArrowRight } from "lucide-react";
import DocPage from "@/components/modules/DocPage";

export default function Quotations() {
  return (
    <DocPage
      doctype="salesQuotation"
      customFormActions={(record, navigate) =>
        record?.id && record?.status === "sent" ? (
          <button
            onClick={() =>
              navigate("/apps/sales/orders", {
                state: { conversionType: "quotation_to_so", sourceRecord: record },
              })
            }
            className="flex items-center h-8 px-3 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
            Convert to Sales Order
          </button>
        ) : null
      }
    />
  );
}
