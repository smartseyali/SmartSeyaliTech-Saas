import { useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { useCrud } from "@/hooks/useCrud";
import { startCampaign, pauseCampaign } from "@/lib/services/whatsappQueueService";
import { Play, Pause, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import DocPage from "@/components/modules/DocPage";
import { useToast } from "@/hooks/use-toast";

export default function WhatsAppCampaigns() {
  const { activeCompany } = useTenant();
  const { toast } = useToast();
  const [runningId, setRunningId] = useState<number | null>(null);

  const handleStart = async (record: any) => {
    if (!activeCompany) return;
    if (record.status !== "draft" && record.status !== "scheduled") {
      toast({ title: "Cannot start", description: "Campaign must be in Draft or Scheduled status", variant: "destructive" });
      return;
    }

    setRunningId(record.id);
    toast({ title: "Campaign starting", description: `Sending to ${record.segment_tags?.length ? `contacts tagged: ${record.segment_tags.join(", ")}` : "all opted-in contacts"}` });

    startCampaign({
      campaignId: record.id,
      companyId: activeCompany.id,
      onProgress: (sent, total) => {
        toast({ title: "Sending...", description: `${sent} / ${total} messages sent` });
      },
      onComplete: (stats) => {
        setRunningId(null);
        toast({ title: "Campaign complete", description: `Sent: ${stats.sent}, Failed: ${stats.failed}, Duration: ${Math.round(stats.duration_ms / 1000)}s` });
      },
      onError: (error) => {
        setRunningId(null);
        toast({ title: "Campaign failed", description: error, variant: "destructive" });
      },
    });
  };

  const handlePause = (record: any) => {
    pauseCampaign(record.id);
    setRunningId(null);
    toast({ title: "Campaign paused" });
  };

  return (
    <DocPage
      doctype="whatsappCampaign"
      customFormActions={(record) => (
        <div className="flex items-center gap-2">
          {record?.status === "running" || runningId === record?.id ? (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-[10px] font-bold uppercase tracking-widest gap-1.5 border-amber-300 text-amber-600 hover:bg-amber-50"
              onClick={() => handlePause(record)}
            >
              <Pause className="w-3.5 h-3.5" /> Pause
            </Button>
          ) : (record?.status === "draft" || record?.status === "scheduled") ? (
            <Button
              size="sm"
              className="h-8 text-[10px] font-bold uppercase tracking-widest gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => handleStart(record)}
            >
              <Play className="w-3.5 h-3.5" /> Start Campaign
            </Button>
          ) : null}
        </div>
      )}
    />
  );
}
