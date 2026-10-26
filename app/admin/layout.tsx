import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Store } from "lucide-react";
import AdminNav from "@/components/admin/admin-nav";
import ModeToggle from "@/components/shared/header/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth-guard";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "Panel Admin" };

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
          <Link
            href="/admin/overview"
            aria-label={`${APP_NAME} - Panel Admin`}
            className="order-1 flex shrink-0 items-center gap-2"
          >
            <Image
              src="/images/logo.svg"
              alt={APP_NAME}
              width={160}
              height={37}
              priority
              className="h-8 w-auto dark:hidden"
            />
            <Image
              src="/images/logo-dark.svg"
              alt={APP_NAME}
              width={160}
              height={37}
              priority
              className="hidden h-8 w-auto dark:block"
            />
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              Admin
            </span>
          </Link>

          {/* Di HP menu turun ke baris sendiri, di desktop satu baris dengan logo */}
          <div className="order-3 w-full min-w-0 md:order-2 md:w-auto md:flex-1">
            <AdminNav />
          </div>

          <div className="order-2 flex shrink-0 items-center gap-1 md:order-3">
            <ModeToggle />
            <Link
              href="/"
              aria-label="Kembali ke toko"
              className={buttonVariants({ variant: "ghost" })}
            >
              <Store className="size-4" />
              <span className="hidden sm:inline">Kembali ke toko</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
