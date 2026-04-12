import Link from "next/link";
import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Autentikasi Gagal",
};

export default async function AuthErrorPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-4xl px-6 py-16 lg:px-10">
        <Card className="w-full border-border/70 bg-card/92">
          <CardHeader>
            <CardTitle className="font-heading text-4xl">
              Tautan autentikasi tidak valid.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-7 text-muted-foreground">
            <p>
              Token verifikasi atau pemulihan tidak bisa diproses. Coba ulangi
              dari halaman login atau minta email baru dari Supabase Auth.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/login">Kembali ke login</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/register">Daftar siswa</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
