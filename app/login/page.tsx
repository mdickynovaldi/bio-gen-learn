import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, ShieldCheck } from "lucide-react";

import { loginAction } from "@/app/auth/actions";
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
  title: "Login",
};

type LoginPageProps = {
  searchParams: Promise<{ message?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const viewer = await getOptionalViewer();
  if (viewer) {
    redirect(viewer.role === "admin" ? "/dashboard/admin" : "/dashboard/student");
  }

  const query = await searchParams;

  return (
    <div className="min-h-screen">
      <SiteHeader ctaHref="/register" ctaLabel="Daftar Siswa" />

      <main className="mx-auto grid min-h-[calc(100vh-81px)] w-full max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
        <Card className="border-border/70 bg-linear-to-br from-card via-card to-secondary/70">
          <CardHeader className="space-y-4">
            <Badge variant="outline" className="w-fit">
              Autentikasi Supabase
            </Badge>
            <div className="space-y-3">
              <CardTitle className="font-heading text-4xl">
                Satu login untuk siswa dan guru.
              </CardTitle>
              <CardDescription className="max-w-xl leading-7">
                Frontend dan backend sekarang benar-benar tersambung. Setelah login,
                user akan diarahkan otomatis ke dashboard berdasarkan role di tabel `users`.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            {[
              {
                icon: ShieldCheck,
                title: "Siswa",
                description:
                  "Mendapatkan dashboard belajar, akses modul terbit, dan pembaruan kasus etika terbaru.",
              },
              {
                icon: KeyRound,
                title: "Guru/Admin",
                description:
                  "Masuk ke CMS untuk membuat modul, mengatur blok materi, dan menerbitkan update etika.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-3xl border border-border/70 bg-background/80 p-5"
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

        <Card className="border-border/70 bg-card/92">
          <CardHeader className="space-y-3">
            <Badge variant="secondary" className="w-fit">
              Email & password
            </Badge>
            <div className="space-y-2">
              <CardTitle className="font-heading text-3xl">
                Masuk ke Bio-Gen Learn
              </CardTitle>
              <CardDescription className="leading-7">
                Akun guru tetap dibuat oleh super admin. Siswa baru bisa mendaftar
                sendiri dari halaman register.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <NoticeBanner message={query.message} />
            <NoticeBanner message={query.error} tone="error" />

            <form action={loginAction} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input id="email" name="email" type="email" placeholder="nama@sekolah.sch.id" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Input id="password" name="password" type="password" placeholder="••••••••" required />
              </div>
              <SubmitButton size="lg" pendingLabel="Memverifikasi...">
                Login
              </SubmitButton>
            </form>

            <p className="text-sm text-muted-foreground">
              Belum punya akun siswa?{" "}
              <Link
                href="/register"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Daftar di sini
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
