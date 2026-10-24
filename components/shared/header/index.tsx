import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import Menu from "./menu";

const Header = () => {
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

        <Menu />
      </div>
    </header>
  );
};

export default Header;
