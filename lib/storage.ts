import "server-only";

import { randomUUID } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import { slugify } from "@/lib/format";
import type { Database } from "@/lib/supabase/database.types";

type UploadedAsset = {
  path: string;
  publicUrl: string;
};

export async function uploadLearningAsset(
  supabase: SupabaseClient<Database>,
  file: File | null,
  folder: string,
  baseName: string
): Promise<UploadedAsset | null> {
  if (!file || file.size === 0) {
    return null;
  }

  const extension = file.name.includes(".")
    ? file.name.split(".").pop()?.toLowerCase() ?? "bin"
    : "bin";
  const safeName = slugify(baseName) || "asset";
  const path = `${folder}/${safeName}-${randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("learning-assets").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || undefined,
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("learning-assets").getPublicUrl(path);

  return {
    path,
    publicUrl: data.publicUrl,
  };
}
