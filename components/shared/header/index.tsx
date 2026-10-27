import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getMyCart } from "@/lib/actions/cart.actions";
import { APP_NAME } from "@/lib/constants";
import Menu from "./menu";
import SearchForm from "../search-form";

const Header = async () => {
  const [session, cart] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getMyCart(),
  ]);

  const cartCount = cart?.items.reduce((sum, item) => sum + item.qty, 0) ?? 0;

  return (
    <header className="w-full border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          aria-label={`${APP_NAME} - Beranda`}
          className="shrink-0"
        >
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
        </Link>

        <SearchForm className="hidden max-w-sm flex-1 md:block" />

        <Menu
          user={
            session
              ? {
                  name: session.user.name,
                  email: session.user.email,
                  // Peran dicek di server, hanya hasilnya yang dikirim ke klien
                  isAdmin: session.user.role === "admin",
                }
              : null
          }
          cartCount={cartCount}
        />
      </div>
    </header>
  );
};

export default Header;
