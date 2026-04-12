import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, FileText, ShieldAlert } from "lucide-react";
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
import { getPublishedEthicsCaseBySlug } from "@/lib/content";
import { formatDateLabel, normalizeExternalHref } from "@/lib/format";

export const metadata: Metadata = {
  title: "Detail Kasus Etika",
};

type EthicsCaseDetailPageProps = {
  params: Promise<{ slug: string }>;
};

const sourceLabel = {
  text: "Detail teks",
  pdf: "PDF sumber",
  link: "Tautan sumber",
} as const;

function getParagraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default async function EthicsCaseDetailPage({
  params,
}: EthicsCaseDetailPageProps) {
  const { slug } = await params;
  const ethicsCase = await getPublishedEthicsCaseBySlug(slug);

  if (!ethicsCase) {
    notFound();
  }

  const sourceHref =
    ethicsCase.content_type === "text"
      ? null
      : normalizeExternalHref(ethicsCase.content_value);
  const paragraphs = getParagraphs(ethicsCase.detail);

  return (
    <div className="min-h-screen">
      <SiteHeader ctaHref="/register" ctaLabel="Daftar Siswa" />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <Card className="overflow-hidden border-border/70 bg-card/92">
            {ethicsCase.cover_url ? (
              <div className="relative h-64 w-full">
                <Image
                  src={ethicsCase.cover_url}
                  alt={ethicsCase.title}
                  fill
                  sizes="(min-width: 1280px) 52rem, 100vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                className="h-64 bg-linear-to-br from-primary/20 via-accent/35 to-secondary/80"
                aria-hidden="true"
              />
            )}
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{sourceLabel[ethicsCase.content_type]}</Badge>
                <Badge variant="secondary">
                  {formatDateLabel(ethicsCase.published_at ?? ethicsCase.created_at)}
                </Badge>
              </div>
              <div className="space-y-3">
                <CardTitle className="font-heading text-4xl">
                  {ethicsCase.title}
                </CardTitle>
                <CardDescription className="max-w-3xl leading-7">
                  {ethicsCase.summary}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-border/70 bg-linear-to-br from-card via-card to-secondary/65">
            <CardHeader className="space-y-3">
              <Badge variant="outline" className="w-fit">
                Panduan membaca
              </Badge>
              <CardTitle className="text-2xl">Pahami kasus sebelum membuka sumber</CardTitle>
              <CardDescription className="leading-7">
                Detail di halaman ini dibuat agar siswa baru dapat memahami isu,
                pihak terdampak, dan dilema etik sebelum membaca sumber tambahan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "Apa keputusan atau teknologi yang memicu dilema etik dalam kasus ini?",
                "Siapa pihak yang paling terdampak dan kepentingan apa yang perlu dilindungi?",
                "Data, keselamatan, keadilan, atau privasi mana yang perlu dibahas di kelas?",
              ].map((question, index) => (
                <div
                  key={question}
                  className="rounded-3xl border border-border/70 bg-background/80 p-5"
                >
                  <p className="text-sm font-medium text-primary">
                    Pertanyaan 0{index + 1}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {question}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-border/70 bg-card/92">
            <CardHeader className="space-y-3">
              <Badge variant="outline" className="w-fit">
                Detail kasus
              </Badge>
              <CardTitle className="font-heading text-3xl">
                Konteks lengkap untuk diskusi etika
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/70 bg-card/92">
              <CardHeader className="space-y-3">
                <Badge variant="secondary" className="w-fit">
                  Sumber pendukung
                </Badge>
                <CardTitle className="text-2xl">
                  {sourceHref ? "Buka bahan tambahan" : "Tidak ada sumber eksternal"}
                </CardTitle>
                <CardDescription className="leading-7">
                  Detail kasus tetap menjadi konteks utama. Sumber eksternal
                  dipakai untuk memperdalam bacaan setelah isu pokok dipahami.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 rounded-3xl border border-border/70 bg-background/80 p-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    {sourceHref ? (
                      <ExternalLink className="size-5" />
                    ) : (
                      <FileText className="size-5" />
                    )}
                  </span>
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">
                      {sourceLabel[ethicsCase.content_type]}
                    </p>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {sourceHref
                        ? "Sumber tersedia dan bisa dibuka di tab baru."
                        : "Kasus ini ditulis sebagai detail teks tanpa lampiran luar."}
                    </p>
                  </div>
                </div>
                {sourceHref ? (
                  <Button asChild className="w-full">
                    <Link href={sourceHref} target="_blank" rel="noreferrer">
                      Buka sumber
                      <ExternalLink className="size-4" />
                    </Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-secondary/45">
              <CardHeader className="space-y-3">
                <Badge variant="outline" className="w-fit">
                  Refleksi
                </Badge>
                <CardTitle className="text-2xl">Catatan untuk diskusi kelas</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4 rounded-3xl border border-border/70 bg-background/80 p-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <ShieldAlert className="size-5" />
                </span>
                <p className="text-sm leading-7 text-muted-foreground">
                  Setelah membaca detail kasus, tulis satu keputusan yang kamu
                  anggap paling adil dan satu risiko yang masih perlu diawasi.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
