"use client";

import { useRef } from "react";
import Image from "next/image";
import { ImagePlus, Loader, X } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { useUploadThing } from "@/lib/uploadthing";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // sama dengan batas di server (4 MB)

type ImageUploaderProps = {
  endpoint: "productImages" | "bannerImage";
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
};

const isValidImage = (file: File) =>
  file.type.startsWith("image/") && file.size <= MAX_FILE_SIZE;

const ImageUploader = ({
  endpoint,
  value,
  onChange,
  max = 5,
}: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Menyimpan nilai terbaru agar callback tidak memakai nilai lama
  const valueRef = useRef(value);
  valueRef.current = value;

  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (files) => {
      const urls = files.map((file) => file.ufsUrl);
      onChange([...valueRef.current, ...urls].slice(0, max));
      toast.add({
        title:
          urls.length > 1
            ? `${urls.length} gambar berhasil diunggah.`
            : "Gambar berhasil diunggah.",
        type: "success",
      });
    },
    onUploadError: (error) => {
      toast.add({ title: error.message, type: "error" });
    },
  });

  function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    // Dikosongkan agar file yang sama bisa dipilih lagi nanti
    event.target.value = "";

    if (selected.length === 0) return;

    const remaining = max - value.length;
    if (remaining <= 0) {
      toast.add({ title: `Maksimal ${max} gambar.`, type: "error" });
      return;
    }

    // 1. Buang file yang bukan gambar atau lebih dari 4 MB
    const valid = selected.filter(isValidImage);
    const skipped = selected.length - valid.length;

    // 2. Batasi sesuai sisa tempat
    const files = valid.slice(0, remaining);
    const overflow = valid.length - files.length;

    if (skipped > 0) {
      toast.add({
        title: `${skipped} berkas dilewati karena bukan gambar atau lebih dari 4 MB.`,
        type: "error",
      });
    }
    if (overflow > 0) {
      toast.add({
        title: `${overflow} gambar tidak diunggah karena melebihi batas ${max} gambar.`,
        type: "error",
      });
    }

    if (files.length === 0) return;

    startUpload(files);
  }

  function handleRemove(url: string) {
    onChange(value.filter((item) => item !== url));
  }

  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {value.map((url) => (
          <li
            key={url}
            className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
          >
            <Image
              src={url}
              alt="Pratinjau gambar"
              fill
              sizes="(min-width: 768px) 120px, 30vw"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              aria-label="Hapus gambar"
              className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow transition-colors hover:bg-destructive hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </li>
        ))}

        {value.length < max && (
          <li>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-xs text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? (
                <Loader className="size-5 animate-spin" />
              ) : (
                <ImagePlus className="size-5" />
              )}
              {isUploading ? "Mengunggah…" : "Tambah gambar"}
            </button>
          </li>
        )}
      </ul>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={max > 1}
        onChange={handleSelect}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      <p className="text-xs text-muted-foreground">
        {value.length} dari {max} gambar. Maksimal 4 MB per gambar.
      </p>
    </div>
  );
};

export default ImageUploader;
