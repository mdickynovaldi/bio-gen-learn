import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenText, Clock3 } from "lucide-react";

import type { ModuleSummary } from "@/lib/content";
import { formatMinutes } from "@/lib/format";
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

type ModuleCardProps = {
  module: ModuleSummary;
};

export function ModuleCard({ module }: ModuleCardProps) {
  return (
    <Card className="overflow-hidden border-border/70 bg-card/92 shadow-sm">
      {module.thumbnail_url ? (
        <div className="relative h-40 w-full">
          <Image
            src={module.thumbnail_url}
            alt={module.title}
            fill
            sizes="(min-width: 1280px) 24rem, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className="h-40 w-full bg-linear-to-br from-primary/20 via-accent/35 to-secondary/80"
          aria-hidden="true"
        />
      )}
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{module.track}</Badge>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3.5" />
            {formatMinutes(module.estimated_duration_minutes)}
          </span>
          <span>{module.level}</span>
          {module.is_featured ? <Badge>Unggulan</Badge> : null}
        </div>
        <div className="space-y-2">
          <CardTitle className="text-xl">{module.title}</CardTitle>
          <CardDescription className="leading-6">
            {module.short_description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl bg-muted/70 p-4 text-sm text-muted-foreground">
          <span className="mb-2 inline-flex items-center gap-2 font-medium text-foreground">
            <BookOpenText className="size-4 text-primary" />
            Tujuan pembelajaran
          </span>
          <p className="leading-6">
            {module.learning_objectives[0] ?? "Modul siap ditelaah berulang kali oleh siswa."}
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <p className="text-xs leading-5 text-muted-foreground">
          {module.is_published ? "Siap dipelajari siswa." : "Masih tersimpan sebagai draft."}
        </p>
        <Button asChild size="sm">
          <Link href={`/modules/${module.slug}`}>
            Buka Modul
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
