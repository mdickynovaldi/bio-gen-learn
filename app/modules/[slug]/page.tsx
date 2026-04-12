import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, FileText, PlayCircle } from "lucide-react";
import { notFound } from "next/navigation";

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
import { Separator } from "@/components/ui/separator";
import { requireViewer } from "@/lib/auth";
import { getModuleBySlug, getModuleContents } from "@/lib/content";
import { formatMinutes } from "@/lib/format";

export const metadata: Metadata = {
  title: "Detail Modul",
};

type ModuleDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function toEmbedUrl(value: string | null) {
  if (!value) return null;
  if (value.includes("youtube.com/embed/")) return value;

  try {
    const url = new URL(value);
    const videoId =
      url.searchParams.get("v") ||
      (url.hostname === "youtu.be" ? url.pathname.slice(1) : null);

    return videoId ? `https://www.youtube.com/embed/${videoId}` : value;
  } catch {
    return value;
  }
}

export default async function ModuleDetailPage({ params }: ModuleDetailPageProps) {
  await requireViewer();
  const { slug } = await params;

  const learningModule = await getModuleBySlug(slug);
  if (!learningModule) {
    notFound();
  }

  const contents = await getModuleContents(learningModule.id);

  return (
    <div className="min-h-screen">
      <SiteHeader ctaHref="/dashboard" ctaLabel="Kembali ke Dashboard" />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="overflow-hidden border-border/70 bg-card/92">
            {learningModule.thumbnail_url ? (
              <div className="relative h-56 w-full">
                <Image
                  src={learningModule.thumbnail_url}
                  alt={learningModule.title}
                  fill
                  sizes="(min-width: 1280px) 52rem, 100vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-56 bg-linear-to-br from-primary/20 via-accent/35 to-secondary/80" />
            )}
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{learningModule.track}</Badge>
                <Badge variant="secondary">{learningModule.level}</Badge>
                <Badge variant="secondary">
                  {formatMinutes(learningModule.estimated_duration_minutes)}
                </Badge>
              </div>
              <div className="space-y-3">
                <CardTitle className="font-heading text-4xl">
                  {learningModule.title}
                </CardTitle>
                <CardDescription className="max-w-3xl leading-7">
                  {learningModule.short_description}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-border/70 bg-linear-to-br from-card via-card to-secondary/65">
            <CardHeader className="space-y-3">
              <Badge variant="outline" className="w-fit">
                Narasi pembuka
              </Badge>
              <CardTitle className="text-2xl">Konteks sebelum mulai membaca</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm leading-7 text-muted-foreground">
                {learningModule.opening_narrative}
              </p>
              <Separator />
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/dashboard">
                    Kembali ke dashboard
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/modules">Lihat modul lain</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
          <Card className="border-border/70 bg-card/92 xl:sticky xl:top-28 xl:h-fit">
            <CardHeader className="space-y-3">
              <Badge variant="outline" className="w-fit">
                Tujuan belajar
              </Badge>
              <CardTitle className="font-heading text-3xl">
                Hasil yang diharapkan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {learningModule.learning_objectives.map((objective, index) => (
                <div
                  key={objective}
                  className="rounded-3xl border border-border/70 bg-background/85 p-5"
                >
                  <p className="mb-2 text-sm font-medium text-primary">
                    Tujuan 0{index + 1}
                  </p>
                  <p className="text-sm leading-7 text-muted-foreground">{objective}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            {contents.length > 0 ? (
              contents.map((block) => (
                <div key={block.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {block.sequence}
                    </span>
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
                      Blok materi
                    </p>
                  </div>

                  {block.type === "text" ? (
                    <Card className="border-border/70 bg-card/92">
                      <CardHeader className="space-y-2">
                        <Badge variant="outline" className="w-fit">
                          Teks
                        </Badge>
                        <CardTitle className="text-2xl">{block.title}</CardTitle>
                        <CardDescription className="leading-7">{block.summary}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
                        {block.paragraphs.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </CardContent>
                    </Card>
                  ) : null}

                  {block.type === "image" ? (
                    <Card className="border-border/70 bg-card/92">
                      <CardHeader className="space-y-2">
                        <Badge variant="outline" className="w-fit">
                          Gambar
                        </Badge>
                        <CardTitle className="text-2xl">{block.title}</CardTitle>
                        <CardDescription className="leading-7">{block.summary}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {block.assetUrl ? (
                          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[2rem] border border-border/70">
                            <Image
                              src={block.assetUrl}
                              alt={block.title}
                              fill
                              sizes="(min-width: 1280px) 48rem, 100vw"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-[16/9] rounded-[2rem] border border-border/70 bg-linear-to-br from-primary/20 via-accent/35 to-secondary/80" />
                        )}
                        {block.caption ? (
                          <p className="text-sm leading-7 text-muted-foreground">{block.caption}</p>
                        ) : null}
                      </CardContent>
                    </Card>
                  ) : null}

                  {block.type === "youtube" ? (
                    <Card className="border-border/70 bg-card/92">
                      <CardHeader className="space-y-2">
                        <Badge variant="outline" className="w-fit">
                          YouTube
                        </Badge>
                        <CardTitle className="text-2xl">{block.title}</CardTitle>
                        <CardDescription className="leading-7">{block.summary}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {toEmbedUrl(block.videoUrl) ? (
                          <div className="overflow-hidden rounded-[2rem] border border-border/70">
                            <iframe
                              src={toEmbedUrl(block.videoUrl)!}
                              title={block.title}
                              className="aspect-video w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <div className="aspect-video rounded-[2rem] border border-border/70 bg-linear-to-br from-foreground/95 via-foreground/90 to-primary/60 p-6 text-primary-foreground">
                            <div className="flex h-full flex-col justify-between">
                              <Badge className="w-fit bg-primary-foreground/12 text-primary-foreground">
                                URL video belum tersedia
                              </Badge>
                              <PlayCircle className="size-12" />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : null}

                  {block.type === "link" ? (
                    <Card className="border-border/70 bg-card/92">
                      <CardHeader className="space-y-2">
                        <Badge variant="outline" className="w-fit">
                          Tautan
                        </Badge>
                        <CardTitle className="text-2xl">{block.title}</CardTitle>
                        <CardDescription className="leading-7">{block.summary}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="rounded-[2rem] border border-border/70 bg-secondary/50 p-5 text-sm leading-7 text-muted-foreground">
                          Gunakan referensi luar ini untuk memperluas bacaan dan diskusi.
                        </div>
                        {block.href ? (
                          <Button asChild variant="outline">
                            <Link href={block.href} target="_blank" rel="noreferrer">
                              {block.label ?? "Buka tautan"}
                              <ExternalLink className="size-4" />
                            </Link>
                          </Button>
                        ) : null}
                      </CardContent>
                    </Card>
                  ) : null}

                  {block.type === "pdf" ? (
                    <Card className="border-border/70 bg-card/92">
                      <CardHeader className="space-y-2">
                        <Badge variant="outline" className="w-fit">
                          PDF
                        </Badge>
                        <CardTitle className="text-2xl">{block.title}</CardTitle>
                        <CardDescription className="leading-7">{block.summary}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="rounded-[2rem] border border-border/70 bg-background/80 p-5">
                          <div className="flex items-center gap-4">
                            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                              <FileText className="size-5" />
                            </span>
                            <div className="space-y-1">
                              <p className="font-medium text-foreground">Lampiran PDF siap dibuka</p>
                              <p className="text-sm leading-6 text-muted-foreground">
                                Cocok untuk worksheet, handout, atau ringkasan istilah.
                              </p>
                            </div>
                          </div>
                        </div>
                        {block.assetUrl ? (
                          <Button asChild variant="outline">
                            <Link href={block.assetUrl} target="_blank" rel="noreferrer">
                              {block.label ?? "Buka PDF"}
                              <ExternalLink className="size-4" />
                            </Link>
                          </Button>
                        ) : null}
                      </CardContent>
                    </Card>
                  ) : null}
                </div>
              ))
            ) : (
              <Card className="border-border/70 bg-card/90">
                <CardContent className="p-8 text-sm leading-7 text-muted-foreground">
                  Modul ini belum memiliki blok materi. Guru dapat menambahkannya dari dashboard admin.
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
