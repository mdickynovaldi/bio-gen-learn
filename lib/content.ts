import "server-only";

import { createClient } from "@/lib/supabase/server";
import { asObject } from "@/lib/format";
import type { Database, Json } from "@/lib/supabase/database.types";

type ModuleRow = Database["public"]["Tables"]["modules"]["Row"];
type ModuleContentRow = Database["public"]["Tables"]["module_contents"]["Row"];
type EthicsCaseRow = Database["public"]["Tables"]["ethics_cases"]["Row"];

export type ModuleSummary = ModuleRow;
export type EthicsCaseSummary = EthicsCaseRow;
export type AdminModuleContent = ParsedModuleContent & {
  moduleId: string;
  createdAt: string;
  updatedAt: string;
};
export type AdminModuleWithContents = ModuleRow & {
  contents: AdminModuleContent[];
};

export type ParsedModuleContent =
  | {
      id: string;
      sequence: number;
      type: "text";
      title: string;
      summary: string | null;
      paragraphs: string[];
    }
  | {
      id: string;
      sequence: number;
      type: "image";
      title: string;
      summary: string | null;
      assetUrl: string | null;
      caption: string | null;
    }
  | {
      id: string;
      sequence: number;
      type: "youtube";
      title: string;
      summary: string | null;
      videoUrl: string | null;
    }
  | {
      id: string;
      sequence: number;
      type: "link";
      title: string;
      summary: string | null;
      href: string | null;
      label: string | null;
    }
  | {
      id: string;
      sequence: number;
      type: "pdf";
      title: string;
      summary: string | null;
      assetUrl: string | null;
      label: string | null;
    };

function readString(value: Json | undefined) {
  return typeof value === "string" ? value : null;
}

function readStringArray(value: Json | undefined) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function parseModuleContent(row: ModuleContentRow): ParsedModuleContent {
  const data = asObject(row.content_data);

  if (row.type === "text") {
    return {
      id: row.id,
      sequence: row.sequence,
      type: "text",
      title: row.title,
      summary: row.summary,
      paragraphs: readStringArray(data.paragraphs),
    };
  }

  if (row.type === "image") {
    return {
      id: row.id,
      sequence: row.sequence,
      type: "image",
      title: row.title,
      summary: row.summary,
      assetUrl: readString(data.assetUrl),
      caption: readString(data.caption),
    };
  }

  if (row.type === "youtube") {
    return {
      id: row.id,
      sequence: row.sequence,
      type: "youtube",
      title: row.title,
      summary: row.summary,
      videoUrl: readString(data.videoUrl),
    };
  }

  if (row.type === "link") {
    return {
      id: row.id,
      sequence: row.sequence,
      type: "link",
      title: row.title,
      summary: row.summary,
      href: readString(data.href),
      label: readString(data.label),
    };
  }

  return {
    id: row.id,
    sequence: row.sequence,
    type: "pdf",
    title: row.title,
    summary: row.summary,
    assetUrl: readString(data.assetUrl),
    label: readString(data.label),
  };
}

export async function listPublishedModules(limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listRecentEthicsCases(limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ethics_cases")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listPublishedEthicsCases(limit = 24) {
  return listRecentEthicsCases(limit);
}

export async function getHomepageStats() {
  const supabase = await createClient();

  const [modulesResult, casesResult] = await Promise.all([
    supabase
      .from("modules")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase
      .from("ethics_cases")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
  ]);

  if (modulesResult.error) throw modulesResult.error;
  if (casesResult.error) throw casesResult.error;

  return {
    moduleCount: modulesResult.count ?? 0,
    ethicsCaseCount: casesResult.count ?? 0,
    formatCount: 5,
  };
}

export async function getModuleBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getPublishedEthicsCaseBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ethics_cases")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getModuleContents(moduleId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("module_contents")
    .select("*")
    .eq("module_id", moduleId)
    .order("sequence", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(parseModuleContent);
}

export async function getAdminDashboardData() {
  const supabase = await createClient();

  const [modulesResult, casesResult, draftCountResult, publishedCountResult] =
    await Promise.all([
      supabase.from("modules").select("*").order("created_at", { ascending: false }),
      supabase
        .from("ethics_cases")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("modules")
        .select("id", { count: "exact", head: true })
        .eq("is_published", false),
      supabase
        .from("ethics_cases")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true),
    ]);

  if (modulesResult.error) throw modulesResult.error;
  if (casesResult.error) throw casesResult.error;
  if (draftCountResult.error) throw draftCountResult.error;
  if (publishedCountResult.error) throw publishedCountResult.error;

  const modules = modulesResult.data ?? [];
  const moduleIds = modules.map((module) => module.id);

  let contentsByModuleId: Record<string, AdminModuleContent[]> = {};

  if (moduleIds.length > 0) {
    const { data: moduleContents, error: moduleContentsError } = await supabase
      .from("module_contents")
      .select("*")
      .in("module_id", moduleIds)
      .order("sequence", { ascending: true });

    if (moduleContentsError) throw moduleContentsError;

    contentsByModuleId = (moduleContents ?? []).reduce<Record<string, AdminModuleContent[]>>(
      (accumulator, row) => {
        const parsedContent = parseModuleContent(row);
        const item: AdminModuleContent = {
          ...parsedContent,
          moduleId: row.module_id,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };

        accumulator[row.module_id] = [...(accumulator[row.module_id] ?? []), item];
        return accumulator;
      },
      {}
    );
  }

  return {
    modules: modules.map((module) => ({
      ...module,
      contents: contentsByModuleId[module.id] ?? [],
    })),
    ethicsCases: casesResult.data ?? [],
    draftModuleCount: draftCountResult.count ?? 0,
    publishedEthicsCount: publishedCountResult.count ?? 0,
  };
}
