"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseModuleContent, type ParsedModuleContent } from "@/lib/content";
import { requireAdminViewer } from "@/lib/auth";
import { asObject, normalizeExternalHref, slugify, splitLines } from "@/lib/format";
import { uploadLearningAsset } from "@/lib/storage";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

type ModuleContentType = Database["public"]["Enums"]["module_content_type"];
type ModuleContentData = Database["public"]["Tables"]["module_contents"]["Insert"]["content_data"];
type ModuleContentPayloadResult =
  | { error: string }
  | { contentData: ModuleContentData };

function redirectToAdmin(params: Record<string, string>): never {
  const search = new URLSearchParams(params);
  redirect(`/dashboard/admin?${search.toString()}`);
}

function getFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File ? value : null;
}

function getModuleRedirectId(formData: FormData, fallback: string) {
  return String(formData.get("redirect_module_id") ?? "").trim() || fallback;
}

function getModuleContentType(value: FormDataEntryValue | null): ModuleContentType | null {
  const type = String(value ?? "").trim();

  if (
    type === "text" ||
    type === "image" ||
    type === "youtube" ||
    type === "link" ||
    type === "pdf"
  ) {
    return type;
  }

  return null;
}

function getExistingBlockUrl(block: ParsedModuleContent) {
  if (block.type === "text") return null;
  if (block.type === "youtube") return block.videoUrl;
  if (block.type === "link") return block.href;
  return block.assetUrl;
}

function getExistingBlockSecondary(block: ParsedModuleContent) {
  if (block.type === "image") return block.caption;
  if (block.type === "link" || block.type === "pdf") return block.label;
  return null;
}

function getExistingBlockAssetUrl(block: ParsedModuleContent) {
  if (block.type === "image" || block.type === "pdf") {
    return block.assetUrl;
  }

  return null;
}

function buildModuleContentData({
  type,
  longText,
  externalUrl,
  secondaryLabel,
  uploadedAssetUrl,
  existingBlock,
}: {
  type: ModuleContentType;
  longText: string;
  externalUrl: string;
  secondaryLabel: string;
  uploadedAssetUrl: string | null;
  existingBlock?: ParsedModuleContent | null;
}): ModuleContentPayloadResult {
  const sameType = existingBlock?.type === type;
  const existingUrl = sameType && existingBlock ? getExistingBlockUrl(existingBlock) : null;
  const existingSecondary =
    sameType && existingBlock ? getExistingBlockSecondary(existingBlock) : null;

  if (type === "text") {
    const paragraphs = splitLines(longText);

    if (paragraphs.length === 0) {
      return { error: "Konten blok teks belum lengkap." };
    }

    return {
      contentData: {
        paragraphs,
      },
    };
  }

  if (type === "youtube") {
    const videoUrl = externalUrl || existingUrl;

    if (!videoUrl) {
      return { error: "URL video YouTube wajib diisi." };
    }

    return {
      contentData: {
        videoUrl,
      },
    };
  }

  if (type === "link") {
    const href = externalUrl || existingUrl;

    if (!href) {
      return { error: "URL tautan wajib diisi." };
    }

    return {
      contentData: {
        href,
        label: secondaryLabel || existingSecondary || "Buka tautan",
      },
    };
  }

  const assetUrl = uploadedAssetUrl || externalUrl || existingUrl;

  if (!assetUrl) {
    return {
      error:
        type === "pdf"
          ? "Lampiran PDF atau URL PDF wajib diisi."
          : "Gambar atau URL gambar wajib diisi.",
    };
  }

  if (type === "pdf") {
    return {
      contentData: {
        assetUrl,
        label: secondaryLabel || existingSecondary || "Buka PDF",
      },
    };
  }

  return {
    contentData: {
      assetUrl,
      caption: secondaryLabel || existingSecondary || null,
    },
  };
}

function extractLearningAssetPath(publicUrl: string | null) {
  if (!publicUrl) return null;

  try {
    const url = new URL(publicUrl);
    const marker = "/storage/v1/object/public/learning-assets/";
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

async function removeLearningAsset(publicUrl: string | null) {
  const path = extractLearningAssetPath(publicUrl);

  if (!path) return;

  const supabase = await createClient();
  await supabase.storage.from("learning-assets").remove([path]);
}

async function revalidateAdminSurfaces() {
  revalidatePath("/", "layout");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/student");
  revalidatePath("/modules");
  revalidatePath("/ethics");
}

async function resequenceModuleContents(moduleId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("module_contents")
    .select("id")
    .eq("module_id", moduleId)
    .order("sequence", { ascending: true });

  if (error) {
    throw error;
  }

  for (const [index, item] of (data ?? []).entries()) {
    const { error: updateError } = await supabase
      .from("module_contents")
      .update({ sequence: index + 1 })
      .eq("id", item.id)
      .eq("module_id", moduleId);

    if (updateError) {
      throw updateError;
    }
  }
}

async function persistModuleContentOrder(moduleId: string, orderedIds: string[]) {
  const supabase = await createClient();
  const offset = orderedIds.length + 1000;

  // First move every row into a collision-free range, then write the final order.
  for (const [index, id] of orderedIds.entries()) {
    const { error } = await supabase
      .from("module_contents")
      .update({ sequence: offset + index + 1 })
      .eq("id", id)
      .eq("module_id", moduleId);

    if (error) {
      throw error;
    }
  }

  for (const [index, id] of orderedIds.entries()) {
    const { error } = await supabase
      .from("module_contents")
      .update({ sequence: index + 1 })
      .eq("id", id)
      .eq("module_id", moduleId);

    if (error) {
      throw error;
    }
  }
}

export async function createModuleAction(formData: FormData) {
  const viewer = await requireAdminViewer();
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const shortDescription = String(formData.get("short_description") ?? "").trim();
  const openingNarrative = String(formData.get("opening_narrative") ?? "").trim();
  const objectives = splitLines(String(formData.get("learning_objectives") ?? ""));
  const track = String(formData.get("track") ?? "").trim() || "Biologi Modern";
  const level = String(formData.get("level") ?? "").trim() || "Pemula";
  const estimatedDurationMinutes = Number(formData.get("estimated_duration_minutes") ?? 60);
  const isFeatured = formData.get("is_featured") === "on";
  const isPublished = formData.get("is_published") === "on";

  if (!title || !shortDescription || !openingNarrative || objectives.length === 0) {
    redirectToAdmin({
      error:
        "Judul, deskripsi singkat, narasi pembuka, dan minimal satu tujuan belajar wajib diisi.",
      tab: "modules",
    });
  }

  if (!Number.isFinite(estimatedDurationMinutes) || estimatedDurationMinutes <= 0) {
    redirectToAdmin({ error: "Durasi modul harus berupa angka positif.", tab: "modules" });
  }

  const thumbnailFile = getFile(formData, "thumbnail");
  const thumbnailAsset = await uploadLearningAsset(
    supabase,
    thumbnailFile,
    "modules/thumbnails",
    title
  );

  const { data: module, error } = await supabase
    .from("modules")
    .insert({
      author_id: viewer.id,
      title,
      slug: slugify(slugInput || title),
      short_description: shortDescription,
      opening_narrative: openingNarrative,
      learning_objectives: objectives,
      track,
      level,
      estimated_duration_minutes: estimatedDurationMinutes,
      is_featured: isFeatured,
      is_published: isPublished,
      thumbnail_path: thumbnailAsset?.path ?? null,
      thumbnail_url: thumbnailAsset?.publicUrl ?? null,
    })
    .select("id")
    .single();

  if (error || !module) {
    redirectToAdmin({
      error: error?.message ?? "Modul gagal dibuat.",
      tab: "modules",
    });
  }

  await revalidateAdminSurfaces();
  redirectToAdmin({
    message: "Modul baru berhasil dibuat. Lanjutkan dengan menambahkan blok materi.",
    module: module.id,
    tab: "modules",
  });
}

export async function createModuleContentAction(formData: FormData) {
  await requireAdminViewer();
  const supabase = await createClient();

  const moduleId = String(formData.get("module_id") ?? "").trim();
  const type = getModuleContentType(formData.get("type"));
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const sequence = Number(formData.get("sequence") ?? 1);

  if (!moduleId || !title || !type || !Number.isFinite(sequence) || sequence <= 0) {
    redirectToAdmin({
      error: "Lengkapi modul target, judul blok, tipe, dan urutan blok.",
      module: moduleId,
      tab: "modules",
    });
  }

  const file = getFile(formData, "asset");
  const externalUrl = normalizeExternalHref(String(formData.get("external_url") ?? "")) ?? "";
  const secondaryLabel = String(formData.get("secondary_label") ?? "").trim();
  const longText = String(formData.get("long_text") ?? "");

  const asset = await uploadLearningAsset(
    supabase,
    file,
    type === "pdf" ? "modules/pdfs" : "modules/assets",
    title
  );

  const payload = buildModuleContentData({
    type,
    longText,
    externalUrl,
    secondaryLabel,
    uploadedAssetUrl: asset?.publicUrl ?? null,
  });

  if ("error" in payload) {
    if (asset?.publicUrl) {
      await removeLearningAsset(asset.publicUrl);
    }

    redirectToAdmin({
      error: payload.error,
      module: getModuleRedirectId(formData, moduleId),
      tab: "modules",
    });
  }

  const { error } = await supabase.from("module_contents").insert({
    module_id: moduleId,
    sequence,
    type,
    title,
    summary,
    content_data: payload.contentData,
  });

  if (error) {
    if (asset?.publicUrl) {
      await removeLearningAsset(asset.publicUrl);
    }

    redirectToAdmin({ error: error.message, module: moduleId, tab: "modules" });
  }

  await revalidateAdminSurfaces();
  redirectToAdmin({
    message: "Blok materi berhasil ditambahkan.",
    module: moduleId,
    tab: "modules",
  });
}

export async function deleteModuleAction(formData: FormData) {
  await requireAdminViewer();
  const supabase = await createClient();

  const moduleId = String(formData.get("module_id") ?? "").trim();

  if (!moduleId) {
    redirectToAdmin({
      error: "Modul yang akan dihapus tidak valid.",
      tab: "modules",
    });
  }

  const [{ data: existingModule, error: moduleError }, { data: existingRows, error: rowsError }] =
    await Promise.all([
      supabase.from("modules").select("*").eq("id", moduleId).maybeSingle(),
      supabase.from("module_contents").select("*").eq("module_id", moduleId),
    ]);

  if (moduleError) {
    redirectToAdmin({ error: moduleError.message, tab: "modules" });
  }

  if (rowsError) {
    redirectToAdmin({ error: rowsError.message, tab: "modules" });
  }

  if (!existingModule) {
    redirectToAdmin({
      error: "Modul tidak ditemukan.",
      tab: "modules",
    });
  }

  const assetUrls = [
    existingModule.thumbnail_url,
    ...(existingRows ?? [])
      .map((row) => getExistingBlockAssetUrl(parseModuleContent(row)))
      .filter((url): url is string => Boolean(url)),
  ];

  const { error } = await supabase.from("modules").delete().eq("id", moduleId);

  if (error) {
    redirectToAdmin({ error: error.message, tab: "modules" });
  }

  for (const assetUrl of assetUrls) {
    await removeLearningAsset(assetUrl);
  }

  await revalidateAdminSurfaces();
  revalidatePath(`/modules/${existingModule.slug}`);
  redirectToAdmin({
    message: "Modul dan seluruh blok materinya berhasil dihapus.",
    tab: "modules",
  });
}

export async function updateModuleContentAction(formData: FormData) {
  await requireAdminViewer();
  const supabase = await createClient();

  const blockId = String(formData.get("block_id") ?? "").trim();
  const moduleId = String(formData.get("module_id") ?? "").trim();
  const redirectModuleId = getModuleRedirectId(formData, moduleId);
  const type = getModuleContentType(formData.get("type"));
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const longText = String(formData.get("long_text") ?? "");
  const externalUrl = normalizeExternalHref(String(formData.get("external_url") ?? "")) ?? "";
  const secondaryLabel = String(formData.get("secondary_label") ?? "").trim();

  if (!blockId || !moduleId || !type || !title) {
    redirectToAdmin({
      error: "Data blok materi yang akan diubah belum lengkap.",
      module: redirectModuleId,
      tab: "modules",
    });
  }

  const { data: existingRow, error: existingError } = await supabase
    .from("module_contents")
    .select("*")
    .eq("id", blockId)
    .eq("module_id", moduleId)
    .maybeSingle();

  if (existingError) {
    redirectToAdmin({ error: existingError.message, module: redirectModuleId, tab: "modules" });
  }

  if (!existingRow) {
    redirectToAdmin({
      error: "Blok materi tidak ditemukan.",
      module: redirectModuleId,
      tab: "modules",
    });
  }

  const existingBlock = parseModuleContent(existingRow);
  const file = getFile(formData, "asset");
  const uploadedAsset = await uploadLearningAsset(
    supabase,
    file,
    type === "pdf" ? "modules/pdfs" : "modules/assets",
    title
  );

  const payload = buildModuleContentData({
    type,
    longText,
    externalUrl,
    secondaryLabel,
    uploadedAssetUrl: uploadedAsset?.publicUrl ?? null,
    existingBlock,
  });

  if ("error" in payload) {
    if (uploadedAsset?.publicUrl) {
      await removeLearningAsset(uploadedAsset.publicUrl);
    }

    redirectToAdmin({
      error: payload.error,
      module: redirectModuleId,
      tab: "modules",
    });
  }

  const previousAssetUrl = getExistingBlockAssetUrl(existingBlock);
  const nextContentData = asObject(payload.contentData);
  const nextAssetUrl =
    type === "image" || type === "pdf"
      ? typeof nextContentData.assetUrl === "string"
        ? nextContentData.assetUrl
        : null
      : null;

  const { error } = await supabase
    .from("module_contents")
    .update({
      type,
      title,
      summary,
      content_data: payload.contentData,
    })
    .eq("id", blockId)
    .eq("module_id", moduleId);

  if (error) {
    if (uploadedAsset?.publicUrl) {
      await removeLearningAsset(uploadedAsset.publicUrl);
    }

    redirectToAdmin({ error: error.message, module: redirectModuleId, tab: "modules" });
  }

  if (previousAssetUrl && previousAssetUrl !== nextAssetUrl) {
    await removeLearningAsset(previousAssetUrl);
  }

  await revalidateAdminSurfaces();
  redirectToAdmin({
    message: "Blok materi berhasil diperbarui.",
    module: redirectModuleId,
    tab: "modules",
  });
}

export async function deleteModuleContentAction(formData: FormData) {
  await requireAdminViewer();
  const supabase = await createClient();

  const blockId = String(formData.get("block_id") ?? "").trim();
  const moduleId = String(formData.get("module_id") ?? "").trim();
  const redirectModuleId = getModuleRedirectId(formData, moduleId);

  if (!blockId || !moduleId) {
    redirectToAdmin({
      error: "Blok materi yang akan dihapus tidak valid.",
      module: redirectModuleId,
      tab: "modules",
    });
  }

  const { data: existingRow, error: existingError } = await supabase
    .from("module_contents")
    .select("*")
    .eq("id", blockId)
    .eq("module_id", moduleId)
    .maybeSingle();

  if (existingError) {
    redirectToAdmin({ error: existingError.message, module: redirectModuleId, tab: "modules" });
  }

  if (!existingRow) {
    redirectToAdmin({
      error: "Blok materi tidak ditemukan.",
      module: redirectModuleId,
      tab: "modules",
    });
  }

  const existingBlock = parseModuleContent(existingRow);
  const existingAssetUrl = getExistingBlockAssetUrl(existingBlock);

  const { error } = await supabase
    .from("module_contents")
    .delete()
    .eq("id", blockId)
    .eq("module_id", moduleId);

  if (error) {
    redirectToAdmin({ error: error.message, module: redirectModuleId, tab: "modules" });
  }

  await resequenceModuleContents(moduleId);

  if (existingAssetUrl) {
    await removeLearningAsset(existingAssetUrl);
  }

  await revalidateAdminSurfaces();
  redirectToAdmin({
    message: "Blok materi berhasil dihapus.",
    module: redirectModuleId,
    tab: "modules",
  });
}

export async function reorderModuleContentsAction(formData: FormData) {
  await requireAdminViewer();
  const supabase = await createClient();

  const moduleId = String(formData.get("module_id") ?? "").trim();
  const redirectModuleId = getModuleRedirectId(formData, moduleId);
  const orderedIdsValue = String(formData.get("ordered_ids") ?? "").trim();

  if (!moduleId || !orderedIdsValue) {
    redirectToAdmin({
      error: "Urutan blok belum dikirimkan.",
      module: redirectModuleId,
      tab: "modules",
    });
  }

  let orderedIds: string[] = [];

  try {
    const parsed = JSON.parse(orderedIdsValue);

    if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
      throw new Error("Invalid block order payload.");
    }

    orderedIds = parsed;
  } catch {
    redirectToAdmin({
      error: "Format urutan blok tidak valid.",
      module: redirectModuleId,
      tab: "modules",
    });
  }

  if (orderedIds.length === 0) {
    redirectToAdmin({
      error: "Modul ini belum memiliki blok untuk diurutkan.",
      module: redirectModuleId,
      tab: "modules",
    });
  }

  const { data: existingRows, error: existingError } = await supabase
    .from("module_contents")
    .select("id")
    .eq("module_id", moduleId);

  if (existingError) {
    redirectToAdmin({ error: existingError.message, module: redirectModuleId, tab: "modules" });
  }

  const existingIds = (existingRows ?? []).map((row) => row.id);

  if (
    existingIds.length !== orderedIds.length ||
    existingIds.some((id) => !orderedIds.includes(id))
  ) {
    redirectToAdmin({
      error: "Daftar blok telah berubah. Muat ulang halaman lalu coba lagi.",
      module: redirectModuleId,
      tab: "modules",
    });
  }

  try {
    await persistModuleContentOrder(moduleId, orderedIds);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Urutan blok gagal diperbarui.";
    redirectToAdmin({ error: message, module: redirectModuleId, tab: "modules" });
  }

  await revalidateAdminSurfaces();
  redirectToAdmin({
    message: "Urutan blok materi berhasil diperbarui.",
    module: redirectModuleId,
    tab: "modules",
  });
}

export async function createEthicsCaseAction(formData: FormData) {
  const viewer = await requireAdminViewer();
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const detail = String(formData.get("detail") ?? "").trim();
  const contentType = String(formData.get("content_type") ?? "").trim() as
    | "text"
    | "pdf"
    | "link";
  const externalUrl = normalizeExternalHref(String(formData.get("external_url") ?? ""));
  const isPublished = formData.get("is_published") === "on";
  const file = getFile(formData, "attachment");

  if (!title || !summary || !detail || !contentType) {
    redirectToAdmin({
      error: "Judul, ringkasan, detail kasus, dan tipe sumber wajib diisi.",
      tab: "ethics",
    });
  }

  const asset = await uploadLearningAsset(
    supabase,
    file,
    contentType === "pdf" ? "ethics/pdfs" : "ethics/covers",
    title
  );

  const contentValue =
    contentType === "text" ? detail : contentType === "pdf" ? asset?.publicUrl ?? externalUrl : externalUrl;

  if (!contentValue) {
    redirectToAdmin({
      error: "Sumber kasus etika belum lengkap. Isi tautan atau unggah PDF.",
      tab: "ethics",
    });
  }

  const { error } = await supabase.from("ethics_cases").insert({
    author_id: viewer.id,
    title,
    slug: slugify(title),
    summary,
    detail,
    content_type: contentType,
    content_value: contentValue,
    cover_path: contentType === "pdf" ? null : asset?.path ?? null,
    cover_url: contentType === "pdf" ? null : asset?.publicUrl ?? null,
    is_published: isPublished,
    published_at: isPublished ? new Date().toISOString() : null,
  });

  if (error) {
    redirectToAdmin({ error: error.message, tab: "ethics" });
  }

  await revalidateAdminSurfaces();
  redirectToAdmin({ message: "Kasus etika berhasil disimpan.", tab: "ethics" });
}

export async function deleteEthicsCaseAction(formData: FormData) {
  await requireAdminViewer();
  const supabase = await createClient();

  const ethicsCaseId = String(formData.get("ethics_case_id") ?? "").trim();

  if (!ethicsCaseId) {
    redirectToAdmin({
      error: "Kasus etika yang akan dihapus tidak valid.",
      tab: "ethics",
    });
  }

  const { data: existingCase, error: existingError } = await supabase
    .from("ethics_cases")
    .select("*")
    .eq("id", ethicsCaseId)
    .maybeSingle();

  if (existingError) {
    redirectToAdmin({ error: existingError.message, tab: "ethics" });
  }

  if (!existingCase) {
    redirectToAdmin({
      error: "Kasus etika tidak ditemukan.",
      tab: "ethics",
    });
  }

  const { error } = await supabase.from("ethics_cases").delete().eq("id", ethicsCaseId);

  if (error) {
    redirectToAdmin({ error: error.message, tab: "ethics" });
  }

  const assetUrls = [
    existingCase.cover_url,
    existingCase.content_type === "pdf" ? existingCase.content_value : null,
  ].filter((url): url is string => Boolean(url));

  for (const assetUrl of assetUrls) {
    await removeLearningAsset(assetUrl);
  }

  await revalidateAdminSurfaces();
  revalidatePath(`/ethics/${existingCase.slug}`);
  redirectToAdmin({
    message: "Kasus etika berhasil dihapus.",
    tab: "ethics",
  });
}
