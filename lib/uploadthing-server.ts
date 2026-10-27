import { UTApi } from "uploadthing/server";
import { prisma } from "@/lib/prisma";

const utapi = new UTApi();

// "https://abc.ufs.sh/f/KUNCI" atau "https://utfs.io/f/KUNCI" menjadi "KUNCI".
// Alamat lain (misalnya gambar lokal "/images/...") menghasilkan null.
export function getUploadThingKey(url: string): string | null {
  try {
    const { hostname, pathname } = new URL(url);
    const isUploadThing =
      hostname.endsWith(".ufs.sh") || hostname === "utfs.io";

    if (!isUploadThing || !pathname.startsWith("/f/")) return null;

    const key = decodeURIComponent(pathname.slice(3));
    return key.length > 0 ? key : null;
  } catch {
    return null;
  }
}

// Menghapus file UploadThing berdasarkan alamatnya. Tidak pernah melempar galat,
// supaya kegagalan pembersihan tidak menggagalkan operasi utamanya.
export async function deleteUploadedFiles(urls: string[]): Promise<void> {
  const unique = [...new Set(urls.filter(Boolean))];
  if (unique.length === 0) return;

  try {
    // Gambar yang masih dipakai riwayat pesanan tidak dihapus
    const referenced = await prisma.orderItem.findMany({
      where: { image: { in: unique } },
      select: { image: true },
    });
    const keep = new Set(referenced.map((row) => row.image));

    const keys = unique
      .filter((url) => !keep.has(url))
      .map(getUploadThingKey)
      .filter((key): key is string => key !== null);

    if (keys.length === 0) return;

    await utapi.deleteFiles(keys);
  } catch (error) {
    console.error("Gagal menghapus file UploadThing:", error);
  }
}
