import { buttonVariants } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Halaman Tidak Ditemukan",
};

const NotFoundPage = () => {
  return (
    <div className="wrapper flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
      <Image
        src="/images/logo.svg"
        alt={APP_NAME}
        width={160}
        height={37}
        priority
        className="h-9 w-auto dark:hidden"
      />
      <Image
        src="/images/logo-dark.svg"
        alt={APP_NAME}
        width={160}
        height={37}
        priority
        className="hidden h-9 w-auto dark:block"
      />

      <div className="space-y-2">
        <p className="font-serif text-7xl font-bold text-primary">404</p>
        <h1 className="h2-bold">Halaman tidak ditemukan</h1>
        <p className="mx-auto max-w-md text-muted-foreground">
          Maaf, halaman yang Anda cari tidak ada atau sudah dipindahkan.
        </p>
      </div>

      <Link href="/" className={buttonVariants({ size: "lg" })}>
        Kembali ke Beranda
      </Link>
    </div>
  );
};

export default NotFoundPage;
