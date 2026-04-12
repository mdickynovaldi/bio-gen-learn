"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function getBaseUrl(origin: string | null) {
  return (
    origin ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  );
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function loginAction(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirectWithError("/login", "Email dan password wajib diisi.");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirectWithError("/login", error.message);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirectWithError("/login", "Sesi login tidak berhasil dibuat.");
  }

  const userId = user.id;

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  revalidatePath("/", "layout");
  redirect(profile?.role === "admin" ? "/dashboard/admin" : "/dashboard/student");
}

export async function signupStudentAction(formData: FormData) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!name || !email || !password) {
    redirectWithError("/register", "Nama, email, dan password wajib diisi.");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      emailRedirectTo: `${getBaseUrl(origin)}/auth/confirm?next=/dashboard`,
    },
  });

  if (error) {
    redirectWithError("/register", error.message);
  }

  revalidatePath("/", "layout");

  if (data.session) {
    redirect("/dashboard/student?message=Pendaftaran berhasil. Selamat belajar.");
  }

  redirect(
    "/login?message=Akun dibuat. Jika verifikasi email aktif, cek inbox Anda lalu login kembali."
  );
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?message=Anda telah keluar dari sesi.");
}
