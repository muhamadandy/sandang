import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Jalur /api/uploadthing yang dipanggil oleh komponen pengunggah
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
