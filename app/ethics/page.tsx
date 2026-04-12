import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";

import { EthicsCaseCard } from "@/components/ethics-case-card";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listPublishedEthicsCases } from "@/lib/content";

export const metadata: Metadata = {
  title: "Kasus Etika",
};

export default async function EthicsCasesPage() {
  const ethicsCases = await listPublishedEthicsCases(24);

  return (
    <div className="min-h-screen">
      <SiteHeader ctaHref="/register" ctaLabel="Daftar Siswa" />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <Badge variant="outline" className="w-fit">
              Kasus etika
            </Badge>
            <div className="space-y-3">
              <h1 className="font-heading text-5xl leading-tight text-foreground">
                Semua kasus etika yang sudah dipublikasikan
              </h1>
              <p className="max-w-3xl text-base leading-8 text-muted-foreground">
                Setiap kasus berisi ringkasan, detail kasus, dan sumber pendukung
                jika tersedia. Gunakan halaman ini untuk membaca konteks sebelum
                masuk diskusi kelas.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard">
                Kembali ke dashboard
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <Card className="border-border/70 bg-linear-to-br from-card via-card to-secondary/65">
            <CardHeader className="space-y-3">
              <Badge variant="secondary" className="w-fit">
                Untuk siswa baru
              </Badge>
              <CardTitle className="text-2xl">Cara membaca kasus etika</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
              {[
                "Baca ringkasan untuk memahami isu utama dalam satu pandangan.",
                "Buka detail kasus untuk melihat latar belakang, pihak terdampak, dan dilema etik.",
                "Gunakan tautan atau PDF sebagai sumber pendukung setelah konteks utamanya jelas.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-3xl border border-border/70 bg-background/80 p-5"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <ShieldAlert className="size-4" />
                  </span>
                  <p>{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {ethicsCases.length > 0 ? (
          <section className="grid gap-6 xl:grid-cols-3">
            {ethicsCases.map((item) => (
              <EthicsCaseCard key={item.id} item={item} />
            ))}
          </section>
        ) : (
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Belum ada kasus etika terbit</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-muted-foreground">
              Guru dapat menambahkan kasus etika dari dashboard guru, lalu halaman
              ini akan menampilkannya otomatis setelah dipublikasikan.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
