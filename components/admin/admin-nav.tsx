"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/overview", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Pesanan", icon: ShoppingBag },
];

const AdminNav = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi admin"
      className="flex items-center gap-1 overflow-x-auto"
    >
      {links.map((link) => {
        const active = pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted",
              active && "bg-primary/10 font-semibold text-primary",
            )}
          >
            <link.icon className="size-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default AdminNav;
