import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Microscope, ShieldCheck, Sparkles, Users } from "lucide-react";

import { EthicsCaseCard } from "@/components/ethics-case-card";
import { ModuleCard } from "@/components/module-card";
import { SectionHeading } from "@/components/section-heading";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getOptionalViewer } from "@/lib/auth";
import { getHomepageStats, listPublishedModules, listRecentEthicsCases } from "@/lib/content";

export const metadata: Metadata = {
  title: "Beranda",
};

const features = [
  {
    icon: Microscope,
    title: "Konten belajar multi-format",
    description:
      "Guru menyusun narasi, gambar, video, tautan, dan PDF dalam urutan yang mudah diikuti siswa.",
  },
  {
    icon: Users,
    title: "Role siswa dan guru terpisah",
    description:
      "Autentikasi dan dashboard dibedakan jelas agar alur belajar dan alur kelola konten tidak bercampur.",
  },
  {
    icon: ShieldCheck,
    title: "Kasus etika selalu kontekstual",
    description:
      "Pembaruan etika genetika dapat langsung tayang di dashboard siswa tanpa menunggu rilis materi baru.",
  },
];

export default async function HomePage() {
  const [viewer, stats, modules, ethicsCases] = await Promise.all([
    getOptionalViewer(),
    getHomepageStats(),
    listPublishedModules(3),
    listRecentEthicsCases(3),
  ]);

  const dashboardHref =
    viewer?.role === "admin" ? "/dashboard/admin" : "/dashboard/student";

  return (
    <div className="min-h-screen">
      <SiteHeader ctaHref={viewer ? dashboardHref : "/register"} ctaLabel={viewer ? "Buka Dashboard" : "Daftar Siswa"} />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-24 px-6 py-10 lg:px-10">
        <section className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-8">
            <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-sm">
              Backend aktif untuk login, CMS modul, dan update kasus etika
            </Badge>

            <div className="space-y-6">
              <h1 className="max-w-4xl font-heading text-5xl leading-[1.02] text-foreground md:text-7xl">
                Platform belajar biologi-genetika yang siap dipakai, bukan lagi mockup.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                Bio-Gen Learn sekarang membaca modul dan kasus etika langsung dari
                database, lengkap dengan alur login siswa, dashboard guru, dan
                manajemen konten berbasis role.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={viewer ? dashboardHref : "/register"}>
                  {viewer ? "Lanjut ke dashboard" : "Mulai sebagai siswa"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/modules">Jelajahi modul</Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-border/70 bg-card/92">
                <CardHeader>
                  <CardDescription>Modul terbit</CardDescription>
                  <CardTitle className="font-heading text-4xl">{stats.moduleCount}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-border/70 bg-card/92">
                <CardHeader>
                  <CardDescription>Format konten</CardDescription>
                  <CardTitle className="font-heading text-4xl">{stats.formatCount}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-border/70 bg-card/92">
                <CardHeader>
                  <CardDescription>Kasus etika tayang</CardDescription>
                  <CardTitle className="font-heading text-4xl">{stats.ethicsCaseCount}</CardTitle>
                </CardHeader>
              </Card>
            </div>
          </div>

          <Card className="overflow-hidden border-border/70 bg-card/95 shadow-[0_32px_80px_-36px_rgba(16,62,77,0.45)]">
            <CardHeader className="space-y-5 border-b border-border/70 bg-linear-to-br from-card via-card to-secondary/65">
              <Badge variant="outline" className="w-fit">
                Live production shell
              </Badge>
              <div className="space-y-3">
                <CardTitle className="font-heading text-3xl">
                  Login, konten, dan CMS berbagi satu sumber data.
                </CardTitle>
                <CardDescription className="leading-7">
                  Halaman publik menampilkan modul dan kasus terbit. Begitu login,
                  siswa dan guru diarahkan ke pengalaman yang berbeda sesuai role.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 p-6">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="rounded-3xl border border-border/70 bg-background/80 p-5"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                        <Icon className="size-5" />
                      </span>
                      <h2 className="font-medium text-foreground">{feature.title}</h2>
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-8">
          <SectionHeading
            eyebrow="Modul unggulan"
            title="Modul yang sudah terbit dan siap dipelajari"
            description="Kartu-kartu berikut sekarang dibaca dari tabel `modules` di Supabase. Admin dapat menambah modul baru dari dashboard guru dan hasilnya langsung muncul di sini setelah dipublikasikan."
          />

          {modules.length > 0 ? (
            <div className="grid gap-6 xl:grid-cols-3">
              {modules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          ) : (
            <Card className="border-border/70 bg-card/90">
              <CardContent className="p-8 text-sm leading-7 text-muted-foreground">
                Belum ada modul yang dipublikasikan. Admin dapat menambah modul
                dari dashboard guru, lalu halaman ini akan menampilkannya otomatis.
              </CardContent>
            </Card>
          )}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card className="border-border/70 bg-card/92">
            <CardHeader className="space-y-3">
              <Badge variant="outline" className="w-fit">
                Dashboard siap produksi
              </Badge>
              <CardTitle className="font-heading text-3xl">
                Pengalaman siswa dan guru kini benar-benar role-aware
              </CardTitle>
              <CardDescription className="leading-7">
                Rute dashboard diamankan lewat session server dan Next.js Proxy.
                Server actions memvalidasi role lagi sebelum menulis data.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Link
                href="/dashboard/student"
                className="rounded-3xl border border-border/70 bg-background/85 px-5 py-4 transition-colors hover:bg-background"
              >
                <p className="font-medium text-foreground">Dashboard siswa</p>
                <p className="mt-1 text-sm leading-7 text-muted-foreground">
                  Menyapa siswa, menampilkan modul terbit, dan membaca update kasus etika terbaru.
                </p>
              </Link>
              <Link
                href="/dashboard/admin"
                className="rounded-3xl border border-border/70 bg-background/85 px-5 py-4 transition-colors hover:bg-background"
              >
                <p className="font-medium text-foreground">Dashboard guru</p>
                <p className="mt-1 text-sm leading-7 text-muted-foreground">
                  Membuat modul, menambah blok materi, mengunggah file, dan mempublikasikan kasus etika.
                </p>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/92">
            <CardHeader className="space-y-3">
              <Badge variant="outline" className="w-fit">
                Update kasus etika
              </Badge>
              <CardTitle className="font-heading text-3xl">
                Materi refleksi terbaru yang sudah tayang
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ethicsCases.length > 0 ? (
                ethicsCases.map((item) => (
                  <EthicsCaseCard key={item.id} item={item} />
                ))
              ) : (
                <div className="rounded-3xl border border-border/70 bg-background/85 p-5 text-sm leading-7 text-muted-foreground">
                  Belum ada kasus etika yang dipublikasikan.
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <footer className="flex flex-col gap-4 rounded-[2rem] border border-border/70 bg-card/85 px-6 py-6 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="font-medium text-foreground">Bio-Gen Learn</p>
            <p>
              Next.js 16, Tailwind v4, shadcn/ui, Database, dan Storage.
            </p>
          </div>
          <Badge variant="secondary">
            <Sparkles className="mr-1 size-3.5" />
            Production-ready frontend + backend
          </Badge>
        </footer>
      </main>
    </div>
  );
}
