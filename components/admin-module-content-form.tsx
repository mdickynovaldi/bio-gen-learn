"use client";

import { useState } from "react";
import { FolderKanban } from "lucide-react";

import { createModuleContentAction } from "@/app/dashboard/admin/actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AdminModuleWithContents, ParsedModuleContent } from "@/lib/content";

type AdminModuleContentFormProps = {
  modules: AdminModuleWithContents[];
};

type ModuleContentType = ParsedModuleContent["type"];

const blockTypeHelp = {
  text: "Untuk materi naratif. Field yang tampil hanya paragraf teks.",
  image: "Untuk gambar atau diagram. Gunakan upload gambar atau URL gambar, lalu tambahkan caption.",
  youtube: "Untuk video pembelajaran. Cukup isi URL YouTube.",
  link: "Untuk referensi luar. Isi URL dan label tombol yang akan dilihat siswa.",
  pdf: "Untuk lampiran PDF. Gunakan upload PDF atau URL PDF, lalu isi label tombol.",
} as const;

export function AdminModuleContentForm({ modules }: AdminModuleContentFormProps) {
  const [selectedType, setSelectedType] = useState<ModuleContentType>("text");

  return (
    <form action={createModuleContentAction} className="grid gap-4">
      <div className="space-y-2">
        <label htmlFor="module-id" className="text-sm font-medium text-foreground">
          Target modul
        </label>
        <select
          id="module-id"
          name="module_id"
          className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
          required
          defaultValue=""
        >
          <option value="" disabled>
            Pilih modul
          </option>
          {modules.map((module) => (
            <option key={module.id} value={module.id}>
              {module.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="content-type" className="text-sm font-medium text-foreground">
            Tipe blok
          </label>
          <select
            id="content-type"
            name="type"
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value as ModuleContentType)}
            className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
            required
          >
            <option value="text">Teks</option>
            <option value="image">Gambar</option>
            <option value="youtube">YouTube</option>
            <option value="link">Tautan</option>
            <option value="pdf">PDF</option>
          </select>
          <p className="text-xs leading-5 text-muted-foreground">
            {blockTypeHelp[selectedType]}
          </p>
        </div>
        <div className="space-y-2">
          <label htmlFor="sequence" className="text-sm font-medium text-foreground">
            Urutan blok
          </label>
          <Input id="sequence" name="sequence" type="number" min={1} defaultValue={1} required />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="content-title" className="text-sm font-medium text-foreground">
          Judul blok
        </label>
        <Input id="content-title" name="title" placeholder="Contoh: Video penjelasan CRISPR" required />
      </div>

      <div className="space-y-2">
        <label htmlFor="summary" className="text-sm font-medium text-foreground">
          Ringkasan singkat
        </label>
        <Textarea id="summary" name="summary" placeholder="Apa fungsi blok ini untuk siswa?" />
      </div>

      {selectedType === "text" ? (
        <div className="space-y-2">
          <label htmlFor="long-text" className="text-sm font-medium text-foreground">
            Isi teks / paragraf
          </label>
          <Textarea
            id="long-text"
            name="long_text"
            placeholder={`Satu paragraf per baris\nTulis materi yang akan tampil langsung di halaman modul.`}
            required
          />
        </div>
      ) : null}

      {selectedType === "image" ? (
        <>
          <div className="space-y-2">
            <label htmlFor="image-asset" className="text-sm font-medium text-foreground">
              Upload gambar
            </label>
            <Input
              id="image-asset"
              name="asset"
              type="file"
              accept="image/png,image/jpeg,image/webp"
            />
            <p className="text-xs leading-5 text-muted-foreground">
              Bisa dikosongkan jika memakai URL gambar.
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="image-url" className="text-sm font-medium text-foreground">
              URL gambar
            </label>
            <Input id="image-url" name="external_url" placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <label htmlFor="image-caption" className="text-sm font-medium text-foreground">
              Caption gambar
            </label>
            <Input id="image-caption" name="secondary_label" placeholder="Contoh: Diagram alur CRISPR" />
          </div>
        </>
      ) : null}

      {selectedType === "youtube" ? (
        <div className="space-y-2">
          <label htmlFor="youtube-url" className="text-sm font-medium text-foreground">
            URL YouTube
          </label>
          <Input id="youtube-url" name="external_url" placeholder="https://youtube.com/watch?v=..." required />
        </div>
      ) : null}

      {selectedType === "link" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="link-url" className="text-sm font-medium text-foreground">
              URL tautan
            </label>
            <Input id="link-url" name="external_url" placeholder="https://..." required />
          </div>
          <div className="space-y-2">
            <label htmlFor="link-label" className="text-sm font-medium text-foreground">
              Label tombol
            </label>
            <Input id="link-label" name="secondary_label" placeholder="Contoh: Buka referensi" />
          </div>
        </div>
      ) : null}

      {selectedType === "pdf" ? (
        <>
          <div className="space-y-2">
            <label htmlFor="pdf-asset" className="text-sm font-medium text-foreground">
              Upload PDF
            </label>
            <Input id="pdf-asset" name="asset" type="file" accept="application/pdf" />
            <p className="text-xs leading-5 text-muted-foreground">
              Bisa dikosongkan jika memakai URL PDF.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="pdf-url" className="text-sm font-medium text-foreground">
                URL PDF
              </label>
              <Input id="pdf-url" name="external_url" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <label htmlFor="pdf-label" className="text-sm font-medium text-foreground">
                Label tombol
              </label>
              <Input id="pdf-label" name="secondary_label" placeholder="Contoh: Buka PDF" />
            </div>
          </div>
        </>
      ) : null}

      <SubmitButton pendingLabel="Menyimpan blok...">
        <FolderKanban className="size-4" />
        Tambahkan blok materi
      </SubmitButton>
    </form>
  );
}
