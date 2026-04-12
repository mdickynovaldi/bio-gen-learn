"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  FileImage,
  FileText,
  GripVertical,
  Link2,
  PencilLine,
  PlayCircle,
  RotateCcw,
  Save,
  Trash2,
  Type,
  X,
} from "lucide-react";

import {
  deleteModuleContentAction,
  reorderModuleContentsAction,
  updateModuleContentAction,
} from "@/app/dashboard/admin/actions";
import type { AdminModuleWithContents, ParsedModuleContent } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";

type AdminModuleBlockManagerProps = {
  modules: AdminModuleWithContents[];
  initialModuleId?: string | null;
};

type ModuleContentType = ParsedModuleContent["type"];

function getResolvedModuleId(
  modules: AdminModuleWithContents[],
  initialModuleId?: string | null
) {
  if (initialModuleId && modules.some((module) => module.id === initialModuleId)) {
    return initialModuleId;
  }

  return modules.find((module) => module.contents.length > 0)?.id ?? modules[0]?.id ?? "";
}

function getBlockIcon(type: ModuleContentType) {
  if (type === "text") return <Type className="size-3.5" />;
  if (type === "image") return <FileImage className="size-3.5" />;
  if (type === "youtube") return <PlayCircle className="size-3.5" />;
  if (type === "link") return <Link2 className="size-3.5" />;
  return <FileText className="size-3.5" />;
}

function getBlockTypeLabel(type: ModuleContentType) {
  if (type === "text") return "Teks";
  if (type === "image") return "Gambar";
  if (type === "youtube") return "YouTube";
  if (type === "link") return "Tautan";
  return "PDF";
}

function getBlockPrimaryValue(block: ParsedModuleContent) {
  if (block.type === "text") return block.paragraphs.join("\n");
  if (block.type === "youtube") return block.videoUrl ?? "";
  if (block.type === "link") return block.href ?? "";
  if (block.type === "image" || block.type === "pdf") return block.assetUrl ?? "";
  return "";
}

function getBlockSecondaryValue(block: ParsedModuleContent) {
  if (block.type === "image") return block.caption ?? "";
  if (block.type === "link" || block.type === "pdf") return block.label ?? "";
  return "";
}

function getBlockPreview(block: ParsedModuleContent) {
  if (block.type === "text") {
    return block.paragraphs[0] ?? "Belum ada paragraf yang ditampilkan.";
  }

  if (block.type === "image") {
    return block.caption || block.assetUrl || "Gambar belum memiliki caption.";
  }

  if (block.type === "youtube") {
    return block.videoUrl || "URL video belum tersedia.";
  }

  if (block.type === "link") {
    return block.href || "URL tautan belum tersedia.";
  }

  return block.label || block.assetUrl || "Lampiran PDF belum tersedia.";
}

function BlockEditorCard({
  block,
  displaySequence,
  moduleId,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragOverCard,
  onDropOnCard,
}: {
  block: ParsedModuleContent;
  displaySequence: number;
  moduleId: string;
  isDragging: boolean;
  isDropTarget: boolean;
  onDragStart: (blockId: string) => void;
  onDragEnd: () => void;
  onDragOverCard: (blockId: string) => void;
  onDropOnCard: (blockId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftType, setDraftType] = useState<ModuleContentType>(block.type);
  const primaryValue = getBlockPrimaryValue(block);
  const secondaryValue = getBlockSecondaryValue(block);

  return (
    <article
      onDragOver={(event) => {
        event.preventDefault();
        onDragOverCard(block.id);
      }}
      onDrop={() => onDropOnCard(block.id)}
      className={cn(
        "rounded-[1.75rem] border border-border/70 bg-background/85 p-5 transition-all",
        isDragging && "opacity-55",
        isDropTarget && "border-primary/50 bg-primary/5 shadow-[0_0_0_1px_rgba(15,118,110,0.14)]"
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <button
            type="button"
            draggable={!isEditing}
            onDragStart={() => onDragStart(block.id)}
            onDragEnd={onDragEnd}
            className={cn(
              "mt-1 flex size-10 shrink-0 cursor-grab items-center justify-center rounded-2xl border border-dashed border-border bg-muted/70 text-muted-foreground",
              isEditing && "cursor-default opacity-50"
            )}
            aria-label={`Geser blok ${block.title}`}
          >
            <GripVertical className="size-4" />
          </button>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Urutan {displaySequence}</Badge>
              <Badge variant="outline" className="gap-1">
                {getBlockIcon(block.type)}
                {getBlockTypeLabel(block.type)}
              </Badge>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">{block.title}</h3>
              <p className="text-sm leading-7 text-muted-foreground">
                {block.summary || "Belum ada ringkasan untuk blok ini."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={isEditing ? "secondary" : "outline"}
            size="sm"
            onClick={() => {
              if (isEditing) {
                setDraftType(block.type);
              }
              setIsEditing((value) => !value);
            }}
          >
            {isEditing ? <X className="size-4" /> : <PencilLine className="size-4" />}
            {isEditing ? "Tutup Editor" : "Edit"}
          </Button>

          <form
            action={deleteModuleContentAction}
            onSubmit={(event) => {
              if (!window.confirm(`Hapus blok "${block.title}" dari modul ini?`)) {
                event.preventDefault();
              }
            }}
          >
            <input type="hidden" name="block_id" value={block.id} />
            <input type="hidden" name="module_id" value={moduleId} />
            <input type="hidden" name="redirect_module_id" value={moduleId} />
            <Button type="submit" variant="destructive" size="sm">
              <Trash2 className="size-4" />
              Hapus
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-4 rounded-[1.5rem] border border-border/70 bg-card/90 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Preview cepat
        </p>
        <p className="text-sm leading-7 text-foreground">{getBlockPreview(block)}</p>

        {block.type !== "text" && getBlockPrimaryValue(block) ? (
          <Link
            href={getBlockPrimaryValue(block)}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary"
          >
            Buka sumber saat ini
            <ExternalLink className="size-4" />
          </Link>
        ) : null}
      </div>

      {isEditing ? (
        <Card className="mt-4 border-border/70 bg-card/95">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">Edit blok materi</CardTitle>
            <CardDescription>
              Simpan perubahan per blok. Jika ingin mengganti urutan, tarik kartunya lalu simpan urutan di atas daftar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateModuleContentAction} className="grid gap-4">
              <input type="hidden" name="block_id" value={block.id} />
              <input type="hidden" name="module_id" value={moduleId} />
              <input type="hidden" name="redirect_module_id" value={moduleId} />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor={`title-${block.id}`}>
                    Judul blok
                  </label>
                  <Input
                    id={`title-${block.id}`}
                    name="title"
                    defaultValue={block.title}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor={`type-${block.id}`}>
                    Tipe blok
                  </label>
                  <select
                    id={`type-${block.id}`}
                    name="type"
                    value={draftType}
                    onChange={(event) => setDraftType(event.target.value as ModuleContentType)}
                    className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                    required
                  >
                    <option value="text">Teks</option>
                    <option value="image">Gambar</option>
                    <option value="youtube">YouTube</option>
                    <option value="link">Tautan</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor={`summary-${block.id}`}>
                  Ringkasan
                </label>
                <Textarea
                  id={`summary-${block.id}`}
                  name="summary"
                  defaultValue={block.summary ?? ""}
                  placeholder="Jelaskan fungsi blok ini untuk siswa."
                />
              </div>

              {draftType === "text" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor={`text-${block.id}`}>
                    Isi teks
                  </label>
                  <Textarea
                    id={`text-${block.id}`}
                    name="long_text"
                    defaultValue={primaryValue}
                    placeholder={`Satu paragraf per baris\nGunakan teks ini untuk blok naratif.`}
                  />
                </div>
              ) : null}

              {draftType !== "text" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor={`url-${block.id}`}>
                    URL utama
                  </label>
                  <Input
                    id={`url-${block.id}`}
                    name="external_url"
                    defaultValue={primaryValue}
                    placeholder="https://..."
                  />
                </div>
              ) : null}

              {draftType === "image" || draftType === "link" || draftType === "pdf" ? (
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-foreground"
                    htmlFor={`secondary-${block.id}`}
                  >
                    {draftType === "image" ? "Caption" : "Label tombol"}
                  </label>
                  <Input
                    id={`secondary-${block.id}`}
                    name="secondary_label"
                    defaultValue={secondaryValue}
                    placeholder={
                      draftType === "image" ? "Caption gambar" : "Contoh: Buka referensi"
                    }
                  />
                </div>
              ) : null}

              {draftType === "image" || draftType === "pdf" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor={`asset-${block.id}`}>
                    Upload file pengganti
                  </label>
                  <Input
                    id={`asset-${block.id}`}
                    name="asset"
                    type="file"
                    accept={
                      draftType === "pdf"
                        ? "application/pdf"
                        : "image/png,image/jpeg,image/webp"
                    }
                  />
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <SubmitButton pendingLabel="Menyimpan perubahan..." size="sm">
                  <Save className="size-4" />
                  Simpan Perubahan
                </SubmitButton>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDraftType(block.type);
                    setIsEditing(false);
                  }}
                >
                  <X className="size-4" />
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </article>
  );
}

export function AdminModuleBlockManager({
  modules,
  initialModuleId,
}: AdminModuleBlockManagerProps) {
  const resolvedModuleId = getResolvedModuleId(modules, initialModuleId);
  const [selectedModuleId, setSelectedModuleId] = useState(resolvedModuleId);
  const initialOrderedIds =
    modules.find((module) => module.id === resolvedModuleId)?.contents.map((content) => content.id) ??
    [];
  const [orderedIds, setOrderedIds] = useState<string[]>(initialOrderedIds);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const selectedModule =
    modules.find((module) => module.id === selectedModuleId) ?? modules[0] ?? null;

  const orderedBlocks = orderedIds
    .map((id) => selectedModule?.contents.find((content) => content.id === id) ?? null)
    .filter((content): content is NonNullable<typeof content> => content !== null);

  const originalOrder = selectedModule?.contents.map((content) => content.id).join("|") ?? "";
  const currentOrder = orderedIds.join("|");
  const isOrderDirty = Boolean(selectedModule) && originalOrder !== currentOrder;

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDropTargetId(null);
      return;
    }

    setOrderedIds((current) => {
      const sourceIndex = current.indexOf(draggedId);
      const targetIndex = current.indexOf(targetId);

      if (sourceIndex === -1 || targetIndex === -1) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDraggedId(null);
    setDropTargetId(null);
  }

  if (modules.length === 0) {
    return (
      <Card className="border-border/70 bg-card/92">
        <CardHeader className="space-y-2">
          <Badge variant="outline" className="w-fit">
            Preview blok materi
          </Badge>
          <CardTitle className="text-2xl">Belum ada modul untuk dikelola</CardTitle>
          <CardDescription>
            Buat modul terlebih dahulu, lalu tambahkan blok materi agar editor urutan dan preview ini aktif.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card id="block-manager" className="border-border/70 bg-card/92">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="w-fit">
              Preview blok materi
            </Badge>
            <CardTitle className="text-3xl">Edit, hapus, dan atur ulang blok per modul</CardTitle>
            <CardDescription className="max-w-3xl leading-7">
              Pilih modul, lihat preview setiap blok, lalu lakukan edit atau drag and drop untuk mengubah urutan tampil di halaman modul.
            </CardDescription>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-border/70 bg-background/80 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Modul dipilih
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {selectedModule?.title ?? "-"}
              </p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/80 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Jumlah blok
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {selectedModule?.contents.length ?? 0} blok
              </p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/80 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Status urutan
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {isOrderDirty ? "Belum disimpan" : "Sinkron"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-end">
          <div className="space-y-2">
            <label htmlFor="block-module-switcher" className="text-sm font-medium text-foreground">
              Pilih modul
            </label>
            <select
              id="block-module-switcher"
              value={selectedModuleId}
              onChange={(event) => {
                const nextModuleId = event.target.value;
                const nextModule = modules.find((module) => module.id === nextModuleId);

                setSelectedModuleId(nextModuleId);
                setOrderedIds(nextModule?.contents.map((content) => content.id) ?? []);
                setDraggedId(null);
                setDropTargetId(null);
              }}
              className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
            >
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title} ({module.contents.length} blok)
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={selectedModule?.is_published ? "secondary" : "outline"}>
              {selectedModule?.is_published ? "Modul published" : "Modul draft"}
            </Badge>
            <Badge variant={selectedModule?.is_featured ? "default" : "outline"}>
              {selectedModule?.is_featured ? "Modul unggulan" : "Modul reguler"}
            </Badge>

            {selectedModule ? (
              <form action={reorderModuleContentsAction} className="flex flex-wrap gap-3">
                <input type="hidden" name="module_id" value={selectedModule.id} />
                <input type="hidden" name="redirect_module_id" value={selectedModule.id} />
                <input type="hidden" name="ordered_ids" value={JSON.stringify(orderedIds)} />
                <SubmitButton
                  pendingLabel="Menyimpan urutan..."
                  size="sm"
                  disabled={!isOrderDirty}
                >
                  <Save className="size-4" />
                  Simpan Urutan
                </SubmitButton>
              </form>
            ) : null}

            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={!isOrderDirty}
              onClick={() => {
                setOrderedIds(selectedModule?.contents.map((content) => content.id) ?? []);
                setDraggedId(null);
                setDropTargetId(null);
              }}
            >
              <RotateCcw className="size-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {selectedModule && orderedBlocks.length > 0 ? (
          <ScrollArea className="h-[70vh] max-h-[52rem] min-h-[28rem] pr-3">
            <div className="space-y-4">
              {orderedBlocks.map((block, index) => (
                <BlockEditorCard
                  key={block.id}
                  block={block}
                  displaySequence={index + 1}
                  moduleId={selectedModule.id}
                  isDragging={draggedId === block.id}
                  isDropTarget={dropTargetId === block.id}
                  onDragStart={(blockId) => {
                    setDraggedId(blockId);
                    setDropTargetId(blockId);
                  }}
                  onDragEnd={() => {
                    setDraggedId(null);
                    setDropTargetId(null);
                  }}
                  onDragOverCard={(blockId) => setDropTargetId(blockId)}
                  onDropOnCard={(blockId) => handleDrop(blockId)}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-border/70 bg-background/80 px-6 py-8 text-sm leading-7 text-muted-foreground">
            Modul ini belum memiliki blok materi. Tambahkan blok baru dari form di atas, lalu editor drag and drop akan muncul di sini.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
