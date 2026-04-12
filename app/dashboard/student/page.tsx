import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BellRing,
  BookMarked,
  Compass,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { EthicsCaseCard } from "@/components/ethics-case-card";
import { ModuleCard } from "@/components/module-card";
import { NoticeBanner } from "@/components/notice-banner";
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
import { requireViewer } from "@/lib/auth";
import { getHomepageStats, listPublishedModules, listRecentEthicsCases } from "@/lib/content";

export const metadata: Metadata = {
  title: "Dashboard Siswa",
};

type StudentDashboardPageProps = {
  searchParams: Promise<{ message?: string; error?: string }>;
};

export default async function StudentDashboardPage({
  searchParams,
}: StudentDashboardPageProps) {
  const viewer = await requireViewer();
  if (viewer.role === "admin") {
    redirect("/dashboard/admin");
  }

  const query = await searchParams;
  const [stats, modules, ethicsCases] = await Promise.all([
    getHomepageStats(),
    listPublishedModules(6),
    listRecentEthicsCases(4),
  ]);

  const featuredModule = modules.find((module) => module.is_featured) ?? modules[0] ?? null;
  const remainingModules = featuredModule
    ? modules.filter((module) => module.id !== featuredModule.id)
    : modules;

  const quickStartSteps = [
    {
      icon: Compass,
      title: "Mulai dari modul yang paling dasar",
      description:
        featuredModule?.title ??
        "Pilih modul dengan level pemula dan baca narasi pembukanya terlebih dulu.",
    },
    {
      icon: ShieldAlert,
      title: "Cek satu kasus etika sebelum diskusi",
      description:
        ethicsCases[0]?.title ??
        "Kasus etika sekarang selalu punya detail kasus agar kamu tidak hanya membaca judulnya.",
    },
    {
      icon: Sparkles,
      title: "Belajar ulang tanpa takut kehilangan progres",
      description:
        "Platform ini tidak memakai streak atau checklist. Ulangi materi kapan saja sesuai ritme belajar.",
    },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader ctaHref="/modules" ctaLabel="Lihat Semua Modul" />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <NoticeBanner message={query.message} />
        <NoticeBanner message={query.error} tone="error" />

        <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <Card className="border-border/70 bg-linear-to-br from-card via-card to-secondary/65">
            <CardHeader className="space-y-5">
              <Badge variant="outline" className="w-fit">
                Dashboard siswa
              </Badge>
              <div className="space-y-3">
                <CardTitle className="font-heading text-4xl">
                  Halo, {viewer.name}. Kamu bisa mulai tanpa harus menebak langkah pertama.
                </CardTitle>
                <CardDescription className="max-w-3xl leading-7">
                  Dashboard ini sekarang dirapikan untuk pemula: ada rekomendasi
                  modul pertama, langkah belajar singkat, dan kasus etika yang
                  menampilkan detail konteks sebelum kamu membuka sumber tambahan.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={featuredModule ? `/modules/${featuredModule.slug}` : "/modules"}>
                    {featuredModule ? "Mulai dari modul rekomendasi" : "Buka daftar modul"}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/ethics">Lihat semua kasus etika</Link>
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {quickStartSteps.map((step) => {
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.title}
                      className="rounded-3xl border border-border/70 bg-background/80 p-5"
                    >
                      <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                        <Icon className="size-5" />
                      </span>
                      <p className="mt-4 font-medium text-foreground">{step.title}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/92">
            <CardHeader className="space-y-3">
              <Badge variant="secondary" className="w-fit">
                Mulai dari sini
              </Badge>
              <CardTitle className="text-2xl">
                Urutan paling aman untuk pengguna baru
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  icon: BookMarked,
                  title: "1. Buka modul utama dulu",
                  description:
                    "Mulai dari modul rekomendasi supaya istilah dan konteks biologinya tidak terasa loncat.",
                },
                {
                  icon: BellRing,
                  title: "2. Lanjut ke kasus etika",
                  description:
                    "Setelah paham konteks ilmiah, baca detail kasus etika untuk melihat dampaknya pada manusia dan masyarakat.",
                },
                {
                  icon: Sparkles,
                  title: "3. Ulangi sesuai kebutuhan",
                  description:
                    "Tidak ada progress bar. Kamu bebas kembali ke materi atau kasus tertentu saat butuh penguatan.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-3xl border border-border/70 bg-background/85 p-5"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm leading-7 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Modul siap dipelajari",
              value: stats.moduleCount,
              description:
                "Semua modul di sini sudah terbit, jadi kamu bisa langsung membaca tanpa setup tambahan.",
            },
            {
              label: "Kasus etika dengan detail",
              value: stats.ethicsCaseCount,
              description:
                "Setiap kasus sekarang punya halaman detail supaya kamu tidak berhenti di ringkasan singkat saja.",
            },
            {
              label: "Format belajar",
              value: stats.formatCount,
              description:
                "Materi bisa berupa teks, gambar, video, tautan, dan PDF dalam satu alur yang tetap mudah diikuti.",
            },
          ].map((stat) => (
            <Card key={stat.label} className="border-border/70 bg-card/92">
              <CardHeader className="space-y-2">
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="font-heading text-4xl">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {stat.description}
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="space-y-2">
              <Badge variant="outline">Rekomendasi belajar</Badge>
              <h2 className="font-heading text-3xl">
                Mulai dari modul yang paling ramah untuk pemula
              </h2>
            </div>

            {featuredModule ? (
              <Card className="border-border/70 bg-card/92">
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">Direkomendasikan</Badge>
                    <Badge variant="outline">{featuredModule.track}</Badge>
                    <Badge variant="outline">{featuredModule.level}</Badge>
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="font-heading text-3xl">
                      {featuredModule.title}
                    </CardTitle>
                    <CardDescription className="leading-7">
                      {featuredModule.short_description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-3xl border border-border/70 bg-background/85 p-5">
                    <p className="text-sm font-medium text-foreground">
                      Kenapa modul ini cocok jadi titik awal
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Mulai dari narasi pembuka, pahami tujuan belajar pertama,
                      lalu lanjut ke blok materi secara berurutan. Ini jalur yang
                      paling aman kalau kamu baru pertama masuk ke topik genetika.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link href={`/modules/${featuredModule.slug}`}>
                        Baca modul ini
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/modules">Bandingkan dengan modul lain</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/70 bg-card/90">
                <CardContent className="p-8 text-sm leading-7 text-muted-foreground">
                  Belum ada modul yang diterbitkan guru.
                </CardContent>
              </Card>
            )}

            {remainingModules.length > 0 ? (
              <div className="grid gap-6 xl:grid-cols-2">
                {remainingModules.map((module) => (
                  <ModuleCard key={module.id} module={module} />
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <Card className="border-border/70 bg-card/92">
              <CardHeader className="space-y-3">
                <Badge variant="outline" className="w-fit">
                  Kasus etika
                </Badge>
                <CardTitle className="font-heading text-3xl">
                  Baca konteks lengkap sebelum membuka sumber
                </CardTitle>
                <CardDescription className="leading-7">
                  Semua kasus etika sekarang menampilkan detail kasus, sehingga
                  siswa baru bisa memahami isu utamanya tanpa harus langsung
                  meloncat ke tautan luar atau PDF.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {ethicsCases.length > 0 ? (
                  ethicsCases.map((item) => <EthicsCaseCard key={item.id} item={item} />)
                ) : (
                  <div className="rounded-3xl border border-border/70 bg-background/85 p-5 text-sm leading-7 text-muted-foreground">
                    Belum ada update etika yang dipublikasikan.
                  </div>
                )}
                {ethicsCases.length > 0 ? (
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/ethics">Lihat semua kasus etika</Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-secondary/45">
              <CardHeader className="space-y-3">
                <Badge variant="secondary" className="w-fit">
                  Tips belajar
                </Badge>
                <CardTitle className="text-2xl">Kalau kamu masih bingung, pakai pola ini</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "Baca tujuan belajar pertama sebelum masuk ke blok konten agar istilah yang muncul terasa lebih masuk akal.",
                  "Gunakan kasus etika setelah membaca modul untuk menguji apakah kamu sudah paham dampak nyata dari teknologi yang dipelajari.",
                  "Kalau satu modul terasa berat, berhenti di satu tujuan belajar dulu lalu lanjut lagi nanti tanpa khawatir kehilangan posisi.",
                ].map((tip, index) => (
                  <div
                    key={tip}
                    className="rounded-3xl border border-border/70 bg-background/80 p-5"
                  >
                    <p className="text-sm font-medium text-foreground">Tip 0{index + 1}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
