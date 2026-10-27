import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/lib/auth";

const f = createUploadthing();

// Hanya admin yang boleh mengunggah. Kalau melempar galat, unggahan ditolak.
async function requireAdminUpload(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session || session.user.role !== "admin") {
    throw new UploadThingError("Hanya admin yang boleh mengunggah gambar.");
  }

  return { userId: session.user.id };
}

export const ourFileRouter = {
  // Gambar produk: maksimal 5 gambar, masing-masing 4 MB
  productImages: f({ image: { maxFileSize: "4MB", maxFileCount: 5 } })
    .middleware(async ({ req }) => requireAdminUpload(req))
    .onUploadComplete(async ({ metadata }) => {
      return { uploadedBy: metadata.userId };
    }),

  // Banner carousel: 1 gambar, 4 MB
  bannerImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => requireAdminUpload(req))
    .onUploadComplete(async ({ metadata }) => {
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
