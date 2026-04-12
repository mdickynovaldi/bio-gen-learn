import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  FolderKanban,
  Newspaper,
  PenSquare,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  createEthicsCaseAction,
  createModuleAction,
  deleteEthicsCaseAction,
  deleteModuleAction,
} from "@/app/dashboard/admin/actions";
import { AdminModuleContentForm } from "@/components/admin-module-content-form";
import { AdminModuleBlockManager } from "@/components/admin-module-block-manager";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { NoticeBanner } from "@/components/notice-banner";
import { SiteHeader } from "@/components/site-header";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { requireAdminViewer } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/content";
import { formatDateLabel, formatMinutes } from "@/lib/format";

export const metadata: Metadata = {
  title: "Dashboard Guru",
};

type AdminDashboardPageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
    module?: string;
    tab?: string;
  }>;
};

function getPreview(value: string, length = 170) {
  const compact = value.replace(/\s+/g, " ").trim();

  if (compact.length <= length) {
    return compact;
  }

  return `${compact.slice(0, length - 3)}...`;
}

function getDefaultTab(tab?: string, moduleId?: string) {
  if (tab === "modules" || tab === "ethics") {
    return tab;
  }

  return moduleId ? "modules" : "overview";
}

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  const viewer = await requireAdminViewer();
  const query = await searchParams;
  const data = await getAdminDashboardData();
  const defaultTab = getDefaultTab(query.tab, query.module);
  const moduleEditorKey = [
    query.module ?? "auto",
    ...data.modules.map(
      (module) =>
        `${module.id}:${module.contents
          .map((content) => `${content.id}:${content.sequence}`)
          .join(",")}`,
    ),
  ].join("|");

  const workflow = [
    {
      icon: PenSquare,
      label: "Langkah 1",
      title: "Buat kerangka modul",
      description:
        "Mulai dari judul, ringkasan, narasi pembuka, dan tujuan belajar agar siswa paham konteks sebelum masuk blok materi.",
      href: "/dashboard/admin?tab=modules",
    },
    {
      icon: FolderKanban,
      label: "Langkah 2",
      title: "Susun blok materi",
      description:
        "Tambah teks, gambar, video, tautan, atau PDF dalam urutan yang mudah diikuti siswa baru.",
      href: "/dashboard/admin?tab=modules#block-manager",
    },
    {
      icon: Newspaper,
      label: "Langkah 3",
      title: "Posting kasus etika",
      description:
        "Tulis ringkasan singkat dan detail kasus etika agar siswa tidak hanya melihat tautan atau PDF.",
      href: "/dashboard/admin?tab=ethics",
    },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader ctaHref="/modules" ctaLabel="Lihat Modul Live" />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <NoticeBanner message={query.message} />
        <NoticeBanner message={query.error} tone="error" />

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-border/70 bg-linear-to-br from-card via-card to-secondary/65">
            <CardHeader className="space-y-5">
              <Badge variant="outline" className="w-fit">
                Teacher workspace
              </Badge>
              <div className="space-y-3">
                <CardTitle className="font-heading text-4xl">
                  Halo, {viewer.name}. Dashboard guru sekarang dibuat seperti
                  alur kerja, bukan tumpukan form.
                </CardTitle>
                <CardDescription className="max-w-3xl leading-7">
                  Untuk guru baru, mulai dari tab Mulai Cepat. Setelah itu masuk
                  ke tab Modul untuk membuat materi dan tab Kasus Etika untuk
                  menerbitkan bahan diskusi lengkap dengan detail kasus.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/dashboard/admin?tab=modules">
                  Kelola modul
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/admin?tab=ethics">
                  Tulis kasus etika
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/92">
            <CardHeader className="space-y-3">
              <Badge variant="secondary" className="w-fit">
                Ringkasan publishing
              </Badge>
              <CardTitle className="text-2xl">
                Apa yang perlu dicek hari ini?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
              <div className="rounded-3xl border border-border/70 bg-background/85 p-5">
                <p className="font-medium text-foreground">
                  {data.draftModuleCount} draft modul butuh keputusan publikasi.
                </p>
                <p className="mt-1">
                  Jika modul sudah punya tujuan belajar dan minimal satu blok,
                  cek ulang lalu publikasikan.
                </p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background/85 p-5">
                <p className="font-medium text-foreground">
                  {data.publishedEthicsCount} kasus etika sudah terlihat oleh
                  siswa.
                </p>
                <p className="mt-1">
                  Kasus baru wajib punya ringkasan dan detail agar siswa pemula
                  bisa mengikuti konteksnya.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Draft modul",
              value: data.draftModuleCount,
              description: "Konten yang belum dipublikasikan untuk siswa.",
            },
            {
              label: "Kasus etika tayang",
              value: data.publishedEthicsCount,
              description:
                "Update publik yang sudah terlihat di dashboard siswa.",
            },
            {
              label: "Total modul",
              value: data.modules.length,
              description: "Seluruh modul yang saat ini dikelola oleh guru.",
            },
          ].map((stat) => (
            <Card key={stat.label} className="border-border/70 bg-card/92">
              <CardHeader className="space-y-2">
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="font-heading text-4xl">
                  {stat.value}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {stat.description}
              </CardContent>
            </Card>
          ))}
        </section>

        <Tabs defaultValue={defaultTab} className="gap-6">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-border/70 bg-card/80 p-4 lg:flex-row lg:items-center lg:justify-between">
            <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent lg:w-fit">
              {/* <TabsTrigger value="overview" className="px-4 py-2">
                Mulai Cepat
              </TabsTrigger> */}
              <TabsTrigger value="modules" className="px-4 py-2">
                Modul
              </TabsTrigger>
              <TabsTrigger value="ethics" className="px-4 py-2">
                Kasus Etika
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="size-4 text-primary" />
              Pilih tab sesuai tugas. Setelah submit, dashboard akan kembali ke
              tab yang relevan.
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <section className="grid gap-6 lg:grid-cols-3">
              {workflow.map((item) => {
                const Icon = item.icon;

                return (
                  <Card
                    key={item.title}
                    className="border-border/70 bg-card/92"
                  >
                    <CardHeader className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <Badge variant="outline">{item.label}</Badge>
                        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                          <Icon className="size-5" />
                        </span>
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-2xl">{item.title}</CardTitle>
                        <CardDescription className="leading-7">
                          {item.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={item.href}>
                          Buka langkah ini
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <Card className="border-border/70 bg-card/92">
                <CardHeader className="space-y-3">
                  <Badge variant="secondary" className="w-fit">
                    Modul terbaru
                  </Badge>
                  <CardTitle className="text-2xl">
                    Cek kualitas materi sebelum publish
                  </CardTitle>
                  <CardDescription className="leading-7">
                    Prioritas untuk guru baru: pastikan modul punya tujuan
                    belajar jelas dan blok materi tidak kosong.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.modules.length > 0 ? (
                    data.modules.slice(0, 5).map((module) => (
                      <div
                        key={module.id}
                        className="rounded-3xl border border-border/70 bg-background/80 p-5"
                      >
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">
                              {module.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {module.track}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant={
                                module.is_published ? "secondary" : "outline"
                              }
                            >
                              {module.is_published ? "Published" : "Draft"}
                            </Badge>
                            <Badge variant="outline">
                              {module.contents.length} blok
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm leading-7 text-muted-foreground">
                          {module.short_description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-border/70 bg-background/80 p-5 text-sm leading-7 text-muted-foreground">
                      Belum ada modul di database.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card/92">
                <CardHeader className="space-y-3">
                  <Badge variant="outline" className="w-fit">
                    Kasus etika terbaru
                  </Badge>
                  <CardTitle className="text-2xl">
                    Pastikan setiap kasus punya detail
                  </CardTitle>
                  <CardDescription className="leading-7">
                    Ringkasan muncul di kartu. Detail kasus muncul di dashboard
                    siswa dan halaman detail, sehingga perlu ditulis sebagai
                    narasi lengkap.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.ethicsCases.length > 0 ? (
                    data.ethicsCases.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-3xl border border-border/70 bg-background/80 p-5"
                      >
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                          <p className="font-medium text-foreground">
                            {item.title}
                          </p>
                          <Badge
                            variant={
                              item.is_published ? "secondary" : "outline"
                            }
                          >
                            {item.is_published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <p className="text-sm leading-7 text-muted-foreground">
                          {getPreview(item.detail)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-border/70 bg-background/80 p-5 text-sm leading-7 text-muted-foreground">
                      Belum ada kasus etika yang disimpan.
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            <section
              id="teacher-modules"
              className="grid gap-6 xl:grid-cols-[1fr_1fr]"
            >
              <Card className="border-border/70 bg-card/92">
                <CardHeader className="space-y-3">
                  <Badge variant="outline" className="w-fit">
                    Langkah 1: buat modul
                  </Badge>
                  <CardTitle className="text-2xl">
                    Tulis kerangka modul sebelum mengisi blok
                  </CardTitle>
                  <CardDescription className="leading-7">
                    Untuk guru baru, isi bagian wajib dulu: judul, deskripsi,
                    narasi pembuka, dan tujuan belajar. Detail media bisa
                    ditambahkan setelah modul tersimpan.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={createModuleAction} className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label
                          htmlFor="module-title"
                          className="text-sm font-medium text-foreground"
                        >
                          Judul modul
                        </label>
                        <Input
                          id="module-title"
                          name="title"
                          placeholder="Contoh: Dasar CRISPR"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="module-slug"
                          className="text-sm font-medium text-foreground"
                        >
                          Slug opsional
                        </label>
                        <Input
                          id="module-slug"
                          name="slug"
                          placeholder="dasar-crispr"
                        />
                        <p className="text-xs leading-5 text-muted-foreground">
                          Kosongkan jika ingin dibuat otomatis dari judul.
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <label
                          htmlFor="track"
                          className="text-sm font-medium text-foreground"
                        >
                          Track
                        </label>
                        <Input
                          id="track"
                          name="track"
                          placeholder="Bioteknologi Modern"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="level"
                          className="text-sm font-medium text-foreground"
                        >
                          Level
                        </label>
                        <Input id="level" name="level" placeholder="Pemula" />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="duration"
                          className="text-sm font-medium text-foreground"
                        >
                          Durasi (menit)
                        </label>
                        <Input
                          id="duration"
                          name="estimated_duration_minutes"
                          type="number"
                          defaultValue={60}
                          min={1}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="short-description"
                        className="text-sm font-medium text-foreground"
                      >
                        Deskripsi singkat
                      </label>
                      <Textarea
                        id="short-description"
                        name="short_description"
                        placeholder="Ringkas tujuan dan cakupan modul dalam 1-2 kalimat."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="opening-narrative"
                        className="text-sm font-medium text-foreground"
                      >
                        Narasi pembuka
                      </label>
                      <Textarea
                        id="opening-narrative"
                        name="opening_narrative"
                        placeholder="Tulis konteks awal agar siswa paham mengapa modul ini penting."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="objectives"
                        className="text-sm font-medium text-foreground"
                      >
                        Tujuan belajar
                      </label>
                      <Textarea
                        id="objectives"
                        name="learning_objectives"
                        placeholder={`Satu tujuan per baris\nContoh: Menjelaskan prinsip dasar CRISPR`}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="thumbnail"
                        className="text-sm font-medium text-foreground"
                      >
                        Thumbnail modul
                      </label>
                      <Input
                        id="thumbnail"
                        name="thumbnail"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                      />
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="is_featured"
                          className="size-4 rounded border-border"
                        />
                        Tampilkan sebagai modul unggulan
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="is_published"
                          className="size-4 rounded border-border"
                        />
                        Publikasikan sekarang
                      </label>
                    </div>
                    <SubmitButton pendingLabel="Menyimpan modul...">
                      <PenSquare className="size-4" />
                      Simpan modul
                    </SubmitButton>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card/92">
                <CardHeader className="space-y-3">
                  <Badge variant="outline" className="w-fit">
                    Langkah 2: tambah blok
                  </Badge>
                  <CardTitle className="text-2xl">
                    Susun blok teks, gambar, video, tautan, atau PDF
                  </CardTitle>
                  <CardDescription className="leading-7">
                    Blok adalah isi utama modul. Gunakan urutan kecil dan jelas
                    agar siswa pemula tidak kehilangan arah.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdminModuleContentForm
                    key={`content-form-${moduleEditorKey}`}
                    modules={data.modules}
                    initialModuleId={query.module}
                  />
                </CardContent>
              </Card>
            </section>

            <AdminModuleBlockManager
              key={`block-manager-${moduleEditorKey}`}
              modules={data.modules}
              initialModuleId={query.module}
            />
          </TabsContent>

          <TabsContent
            value="ethics"
            className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]"
          >
            <Card className="border-border/70 bg-card/92">
              <CardHeader className="space-y-3">
                <Badge variant="outline" className="w-fit">
                  Langkah 3: posting kasus etika
                </Badge>
                <CardTitle className="text-2xl">
                  Tulis ringkasan dan detail kasus etika
                </CardTitle>
                <CardDescription className="leading-7">
                  Ringkasan dipakai untuk kartu singkat. Detail kasus wajib
                  diisi untuk semua tipe sumber, termasuk PDF dan tautan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={createEthicsCaseAction} className="grid gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="ethics-title"
                      className="text-sm font-medium text-foreground"
                    >
                      Judul kasus
                    </label>
                    <Input
                      id="ethics-title"
                      name="title"
                      placeholder="Privasi data genom"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="ethics-summary"
                      className="text-sm font-medium text-foreground"
                    >
                      Ringkasan singkat
                    </label>
                    <Textarea
                      id="ethics-summary"
                      name="summary"
                      placeholder="Tulis 1-2 kalimat yang menjelaskan mengapa kasus ini relevan."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="ethics-detail"
                      className="text-sm font-medium text-foreground"
                    >
                      Detail kasus etika
                    </label>
                    <Textarea
                      id="ethics-detail"
                      name="detail"
                      placeholder={`Jelaskan latar belakang kasus, pihak yang terdampak, dilema etik, dan pertanyaan diskusi.\nDetail ini akan tampil di dashboard siswa dan halaman detail kasus.`}
                      required
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="ethics-type"
                        className="text-sm font-medium text-foreground"
                      >
                        Tipe sumber pendukung
                      </label>
                      <select
                        id="ethics-type"
                        name="content_type"
                        className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                        required
                        defaultValue="text"
                      >
                        <option value="text">Detail teks saja</option>
                        <option value="pdf">PDF</option>
                        <option value="link">Tautan</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="ethics-url"
                        className="text-sm font-medium text-foreground"
                      >
                        URL sumber / PDF
                      </label>
                      <Input
                        id="ethics-url"
                        name="external_url"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="attachment"
                      className="text-sm font-medium text-foreground"
                    >
                      PDF sumber atau cover image
                    </label>
                    <Input
                      id="attachment"
                      name="attachment"
                      type="file"
                      accept="application/pdf,image/png,image/jpeg,image/webp"
                    />
                    <p className="text-xs leading-5 text-muted-foreground">
                      Untuk tipe PDF, unggah file PDF. Untuk tipe teks atau
                      tautan, gunakan gambar sebagai cover opsional.
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      name="is_published"
                      className="size-4 rounded border-border"
                    />
                    Publikasikan sekarang
                  </label>
                  <SubmitButton pendingLabel="Menyimpan kasus etika...">
                    <Newspaper className="size-4" />
                    Simpan kasus etika
                  </SubmitButton>
                </form>
              </CardContent>
            </Card>

            <div className="grid gap-6">
              <Card className="border-border/70 bg-secondary/45">
                <CardHeader className="space-y-3">
                  <Badge variant="secondary" className="w-fit">
                    Checklist pemula
                  </Badge>
                  <CardTitle className="text-2xl">
                    Sebelum publish kasus etika
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    "Ringkasan cukup pendek untuk kartu dashboard.",
                    "Detail menjelaskan latar belakang, dilema etik, pihak terdampak, dan pertanyaan diskusi.",
                    "Sumber PDF atau tautan dipakai sebagai pendukung, bukan pengganti detail kasus.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex gap-3 rounded-3xl border border-border/70 bg-background/80 p-5"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                        <ShieldCheck className="size-4" />
                      </span>
                      <p className="text-sm leading-7 text-muted-foreground">
                        {item}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card/92">
                <CardHeader className="space-y-3">
                  <Badge variant="outline" className="w-fit">
                    Kasus etika terbaru
                  </Badge>
                  <CardTitle className="text-2xl">
                    Antrian update yang sudah disimpan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.ethicsCases.length > 0 ? (
                    data.ethicsCases.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-3xl border border-border/70 bg-background/80 p-5"
                      >
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                          <p className="font-medium text-foreground">
                            {item.title}
                          </p>
                          <Badge
                            variant={
                              item.is_published ? "secondary" : "outline"
                            }
                          >
                            {item.is_published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <p className="text-sm leading-7 text-muted-foreground">
                          {getPreview(item.detail)}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {formatDateLabel(
                              item.published_at ?? item.created_at,
                            )}
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {item.is_published ? (
                              <Link
                                href={`/ethics/${item.slug}`}
                                className="inline-flex items-center gap-2 text-sm font-medium text-primary"
                              >
                                Lihat detail
                                <Send className="size-4" />
                              </Link>
                            ) : null}
                            <form action={deleteEthicsCaseAction}>
                              <input
                                type="hidden"
                                name="ethics_case_id"
                                value={item.id}
                              />
                              <ConfirmSubmitButton
                                confirmMessage={`Hapus kasus etika "${item.title}"?`}
                                variant="destructive"
                                size="sm"
                              >
                                <Trash2 className="size-4" />
                                Hapus
                              </ConfirmSubmitButton>
                            </form>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-border/70 bg-background/80 p-5 text-sm leading-7 text-muted-foreground">
                      Belum ada kasus etika yang disimpan.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card className="border-border/70 bg-card/92">
            <CardHeader className="space-y-3">
              <Badge variant="secondary" className="w-fit">
                Modul live
              </Badge>
              <CardTitle className="text-2xl">
                Konten modul di database
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.modules.length > 0 ? (
                data.modules.slice(0, 6).map((module) => (
                  <div
                    key={module.id}
                    className="rounded-3xl border border-border/70 bg-background/80 p-5"
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {module.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {module.track}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            module.is_published ? "secondary" : "outline"
                          }
                        >
                          {module.is_published ? "Published" : "Draft"}
                        </Badge>
                        <Badge variant="outline">
                          {formatMinutes(module.estimated_duration_minutes)}
                        </Badge>
                        <Badge variant="outline">
                          {module.contents.length} blok
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {module.short_description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href={`/modules/${module.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary"
                      >
                        Buka modul live
                        <Send className="size-4" />
                      </Link>
                      <form action={deleteModuleAction}>
                        <input
                          type="hidden"
                          name="module_id"
                          value={module.id}
                        />
                        <ConfirmSubmitButton
                          confirmMessage={`Hapus modul "${module.title}" beserta semua blok materinya?`}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="size-4" />
                          Hapus modul
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-border/70 bg-background/80 p-5 text-sm leading-7 text-muted-foreground">
                  Belum ada modul di database.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/92">
            <CardHeader className="space-y-3">
              <Badge variant="outline" className="w-fit">
                Bantuan orientasi
              </Badge>
              <CardTitle className="text-2xl">
                Cara membaca status dashboard ini
              </CardTitle>
              <CardDescription className="leading-7">
                Bagian ini sengaja dibuat eksplisit agar guru baru tahu status
                publikasi tanpa harus memahami struktur database terlebih dulu.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {[
                {
                  icon: BookOpenText,
                  title: "Published",
                  description:
                    "Sudah bisa dilihat siswa di dashboard dan halaman publik yang relevan.",
                },
                {
                  icon: PenSquare,
                  title: "Draft",
                  description:
                    "Masih aman untuk diedit dan belum muncul sebagai materi belajar siswa.",
                },
                {
                  icon: Newspaper,
                  title: "Detail kasus",
                  description:
                    "Narasi wajib untuk kasus etika. Sumber PDF atau tautan hanya menjadi bahan pendukung.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-3xl border border-border/70 bg-background/80 p-5"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">
                        {item.title}
                      </p>
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
      </main>
    </div>
  );
}
