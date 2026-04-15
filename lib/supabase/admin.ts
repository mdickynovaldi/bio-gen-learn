import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY atau SUPABASE_SERVICE_ROLE_KEY wajib diisi untuk register tanpa verifikasi email."
    );
  }

  return createClient<Database>(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
