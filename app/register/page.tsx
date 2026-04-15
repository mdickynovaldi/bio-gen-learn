import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpenCheck, GraduationCap, ShieldAlert } from "lucide-react";

import { signupStudentAction } from "@/app/auth/actions";
import { NoticeBanner } from "@/components/notice-banner";
import { SiteHeader } from "@/components/site-header";
import { SubmitButton } from "@/components/submit-button";
import { getOptionalViewer } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Register Siswa",
};

type RegisterPageProps = {
  searchParams: Promise<{ message?: string; error?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const viewer = await getOptionalViewer();
  if (viewer) {
    redirect(viewer.role === "admin" ? "/dashboard/admin" : "/dashboard/student");
  }

  const query = await searchParams;

  return (
    <div className="min-h-screen">
      <SiteHeader ctaHref="/login" ctaLabel="Sudah Punya Akun" />

      <main className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_1fr] lg:px-10">
        <Card className="border-border/70 bg-card/92">
          <CardHeader className="space-y-4">
            <Badge variant="outline" className="w-fit">
              Register siswa
            </Badge>
            <div className="space-y-3">
              <CardTitle className="font-heading text-4xl">
                Buat akun untuk mulai belajar genetika secara mandiri.
              </CardTitle>
              <CardDescription className="leading-7">
                Akun siswa langsung aktif setelah email dan password dikirim,
                tanpa menunggu email konfirmasi.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            {[
              {
                icon: GraduationCap,
                title: "Sapaan personal di dashboard",
                description:
                  "Nama tampilan dibuat otomatis dari email supaya pendaftaran tetap cepat.",
              },
              {
                icon: BookOpenCheck,
                title: "Akses bebas tanpa tracking progres",
                description:
                  "Semua modul bisa dibuka berulang kali tanpa status terkunci atau streak.",
              },
              {
                icon: ShieldAlert,
                title: "Kasus etika tampil kontekstual",
                description:
                  "Update baru dari guru langsung terbaca pada dashboard siswa.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-3xl border border-border/70 bg-secondary/45 p-5"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <h2 className="font-medium text-foreground">{item.title}</h2>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-linear-to-br from-card via-card to-secondary/70">
          <CardHeader className="space-y-3">
            <Badge variant="secondary" className="w-fit">
              Register langsung aktif
            </Badge>
            <div className="space-y-2">
              <CardTitle className="font-heading text-3xl">
                Pendaftaran akun siswa
              </CardTitle>
              <CardDescription className="leading-7">
                Isi nama, email, dan password. Setelah berhasil, kamu langsung
                masuk ke dashboard siswa.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <NoticeBanner message={query.message} />
            <NoticeBanner message={query.error} tone="error" />

            <form action={signupStudentAction} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="register-name" className="text-sm font-medium text-foreground">
                  Nama lengkap
                </label>
                <Input
                  id="register-name"
                  name="name"
                  placeholder="Alya Nadhira"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="register-email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="alya@sekolah.sch.id"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="register-password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  required
                />
              </div>
              <SubmitButton size="lg" pendingLabel="Membuat akun...">
                Buat akun siswa
              </SubmitButton>
            </form>

            <p className="text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Login di sini
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
