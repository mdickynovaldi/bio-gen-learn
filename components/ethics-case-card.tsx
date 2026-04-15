import Link from "next/link";
import { ArrowRight, ExternalLink, FileText, ShieldAlert } from "lucide-react";

import type { EthicsCaseSummary } from "@/lib/content";
import { formatDateLabel, normalizeExternalHref } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type EthicsCaseCardProps = {
  item: EthicsCaseSummary;
};

const typeLabel = {
  text: "Ringkasan",
  pdf: "PDF Brief",
  link: "Tautan",
} as const;

const typeIcon = {
  text: ShieldAlert,
  pdf: FileText,
  link: ExternalLink,
} as const;

function getDetailPreview(detail: string) {
  const compact = detail.replace(/\s+/g, " ").trim();

  if (compact.length <= 180) {
    return compact;
  }

  return `${compact.slice(0, 177)}...`;
}

export function EthicsCaseCard({ item }: EthicsCaseCardProps) {
  const Icon = typeIcon[item.content_type];
  const resourceHref =
    item.content_type === "text"
      ? null
      : normalizeExternalHref(item.content_value);

  return (
    <Card size="sm" className="border-border/70 bg-card/92">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="outline">{typeLabel[item.content_type]}</Badge>
          <span className="text-xs text-muted-foreground">
            {formatDateLabel(item.published_at ?? item.created_at)}
          </span>
        </div>
        <div className="space-y-2">
          <CardTitle className="flex items-start gap-3 text-base">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <Icon className="size-4" />
            </span>
            <span>{item.title}</span>
          </CardTitle>
          <CardDescription className="leading-6">
            {item.summary}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
        <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Detail kasus
          </p>
          <p className="mt-2">{getDetailPreview(item.detail)}</p>
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <Button asChild size="sm">
          <Link href={`/ethics/${item.slug}`}>
            Lihat Detail
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        {resourceHref ? (
          <Button asChild size="sm" variant="outline">
            <Link href={resourceHref} target="_blank" rel="noreferrer">
              Buka Sumber
              <ExternalLink className="size-4" />
            </Link>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
