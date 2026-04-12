import { AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

type NoticeBannerProps = {
  message?: string | null;
  tone?: "success" | "error";
};

export function NoticeBanner({
  message,
  tone = "success",
}: NoticeBannerProps) {
  if (!message) return null;

  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-3xl border px-4 py-4 text-sm leading-7",
        tone === "success"
          ? "border-primary/25 bg-primary/8 text-foreground"
          : "border-destructive/25 bg-destructive/10 text-foreground"
      )}
    >
      <Icon
        className={cn(
          "mt-1 size-4 shrink-0",
          tone === "success" ? "text-primary" : "text-destructive"
        )}
      />
      <p>{message}</p>
    </div>
  );
}
