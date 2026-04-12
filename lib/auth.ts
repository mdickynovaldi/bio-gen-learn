import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type Viewer = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "student";
  avatarUrl: string | null;
};

export async function getOptionalViewer(): Promise<Viewer | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, name, role, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? "",
    name:
      profile?.name ??
      ((user.user_metadata?.name as string | undefined) ?? user.email?.split("@")[0] ?? "Pengguna"),
    role: profile?.role ?? "student",
    avatarUrl: profile?.avatar_url ?? null,
  };
}

export async function requireViewer() {
  const viewer = await getOptionalViewer();

  if (!viewer) {
    redirect("/login?message=Silakan login untuk melanjutkan.");
  }

  return viewer;
}

export async function requireAdminViewer() {
  const viewer = await requireViewer();

  if (viewer.role !== "admin") {
    redirect("/dashboard/student?error=Akses guru hanya untuk akun admin.");
  }

  return viewer;
}
