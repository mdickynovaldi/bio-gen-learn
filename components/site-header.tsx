import Link from "next/link";

import { signOutAction } from "@/app/auth/actions";
import { getOptionalViewer } from "@/lib/auth";
import { Button } from "@/components/ui/button";

type SiteHeaderProps = {
  ctaHref?: string;
  ctaLabel?: string;
};

export async function SiteHeader({
  ctaHref = "/register",
  ctaLabel = "Daftar Siswa",
}: SiteHeaderProps) {
  const viewer = await getOptionalViewer();
  const dashboardHref =
    viewer?.role === "admin" ? "/dashboard/admin" : "/dashboard/student";

  const navItems = viewer
    ? viewer.role === "admin"
      ? [
          { href: "/", label: "Beranda" },
          { href: dashboardHref, label: "Dashboard" },
          { href: "/dashboard/admin?tab=modules#block-manager", label: "CMS Guru" },
          { href: "/ethics", label: "Kasus Etika" },
        ]
      : [
          { href: "/", label: "Beranda" },
          { href: dashboardHref, label: "Dashboard" },
          { href: "/modules", label: "Modul" },
          { href: "/ethics", label: "Kasus Etika" },
        ]
    : [
        { href: "/", label: "Beranda" },
        { href: "/login", label: "Login" },
        { href: "/register", label: "Register" },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-lg font-semibold text-primary">
            BG
          </span>
          <span className="flex flex-col">
            <span className="font-heading text-lg leading-none text-foreground">
              Bio-Gen Learn
            </span>
            <span className="text-xs text-muted-foreground">
              LMS genetika dan etika biologi
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Button key={`${item.label}-${item.href}`} asChild variant="ghost" size="sm">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {viewer ? (
            <>
              <div className="hidden rounded-full border border-border/70 px-3 py-1.5 text-sm text-muted-foreground md:block">
                {viewer.name} · {viewer.role === "admin" ? "Guru" : "Siswa"}
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={dashboardHref}>Buka Dashboard</Link>
              </Button>
              <form action={signOutAction}>
                <Button size="sm" type="submit">
                  Keluar
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={ctaHref}>{ctaLabel}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
