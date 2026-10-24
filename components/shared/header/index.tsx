import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";
import Menu from "./menu";

const Header = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <header className="w-full border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" aria-label={`${APP_NAME} - Beranda`}>
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

        <Menu
          user={
            session
              ? { name: session.user.name, email: session.user.email }
              : null
          }
        />
      </div>
    </header>
  );
};

export default Header;
