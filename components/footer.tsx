import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  {
    title: "Belanja",
    links: [
      { label: "Semua Produk", href: "/products" },
      { label: "Terbaru", href: "/products?sort=newest" },
      { label: "Keranjang", href: "/cart" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "Cara Pemesanan", href: "/help/how-to-order" },
      { label: "Pengiriman", href: "/help/shipping" },
      { label: "Pengembalian", href: "/help/returns" },
      { label: "Hubungi Kami", href: "/contact" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang Kami", href: "/about" },
      { label: "Kebijakan Privasi", href: "/privacy" },
      { label: "Syarat & Ketentuan", href: "/terms" },
    ],
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t bg-muted">
      <div className="wrapper">
        <div className="grid gap-10 py-6 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" aria-label={`${APP_NAME} - Beranda`}>
              <Image
                src="/images/logo.svg"
                alt={APP_NAME}
                width={160}
                height={37}
                className="h-9 w-auto"
              />
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              {APP_DESCRIPTION}
            </p>
          </div>

          {/* Kolom tautan */}
          {footerLinks.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="mb-3 text-base font-semibold">{group.title}</h2>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Baris bawah */}
        <div className="border-t py-5 text-center text-sm text-muted-foreground md:text-left">
          &copy; {currentYear} {APP_NAME}. Hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
