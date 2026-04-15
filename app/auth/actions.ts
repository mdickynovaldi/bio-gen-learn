"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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
  let adminSupabase: ReturnType<typeof createAdminClient>;

  try {
    adminSupabase = createAdminClient();
  } catch (error) {
    redirectWithError(
      "/register",
      error instanceof Error
        ? error.message
        : "Konfigurasi register tanpa verifikasi email belum lengkap."
    );
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!name || !email || !password) {
    redirectWithError("/register", "Nama, email, dan password wajib diisi.");
  }

  const { error: createUserError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
    },
  });

  if (createUserError) {
    redirectWithError("/register", createUserError.message);
  }

  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError) {
    redirectWithError("/login", loginError.message);
  }

  revalidatePath("/", "layout");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirectWithError("/login", "Akun dibuat, tetapi sesi login tidak berhasil dibuat.");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const dashboardPath =
    profile?.role === "admin" ? "/dashboard/admin" : "/dashboard/student";

  redirect(`${dashboardPath}?message=Pendaftaran berhasil. Akun langsung aktif.`);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?message=Anda telah keluar dari sesi.");
}
