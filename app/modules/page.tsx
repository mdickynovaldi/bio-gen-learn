import type { Metadata } from "next";

import { ModuleCard } from "@/components/module-card";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireViewer } from "@/lib/auth";
import { listPublishedModules } from "@/lib/content";

export const metadata: Metadata = {
  title: "Modul",
};

export default async function ModulesPage() {
  await requireViewer();
  const modules = await listPublishedModules(24);

  return (
    <div className="min-h-screen">
      <SiteHeader ctaHref="/dashboard" ctaLabel="Kembali ke Dashboard" />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <section className="space-y-4">
          <Badge variant="outline" className="w-fit">
            Modul pembelajaran
          </Badge>
          <div className="space-y-3">
            <h1 className="font-heading text-5xl leading-tight text-foreground">
              Semua modul yang sudah dipublikasikan
            </h1>
            <p className="max-w-3xl text-base leading-8 text-muted-foreground">
              Halaman ini mengambil daftar modul langsung dari Supabase dan cocok
              untuk siswa yang ingin melompat ke topik tertentu tanpa harus mencari dari dashboard.
            </p>
          </div>
        </section>

        {modules.length > 0 ? (
          <div className="grid gap-6 xl:grid-cols-3">
            {modules.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        ) : (
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Belum ada modul terbit</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-muted-foreground">
              Admin dapat menerbitkan modul pertama dari dashboard guru.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
