"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  MenuIcon,
  Package,
  ShoppingCart,
  UserIcon,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import ModeToggle from "./mode-toggle";

type MenuProps = {
  user: { name: string; email: string } | null;
  cartCount: number;
};

const userLinks = [
  { href: "/user/profile", label: "Profil", icon: UserIcon },
  { href: "/user/orders", label: "Pesanan Saya", icon: Package },
];

const CartBadge = ({ count }: { count: number }) => {
  if (count === 0) return null;

  return (
    <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
      {count > 99 ? "99+" : count}
    </span>
  );
};

const Menu = ({ user, cartCount }: MenuProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const close = () => setOpen(false);

  async function handleSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    setSigningOut(false);
    close();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* Desktop */}
      <nav className="hidden items-center gap-1 md:flex">
        <ModeToggle />
        <Link href="/cart" className={buttonVariants({ variant: "ghost" })}>
          <ShoppingCart className="size-4" />
          Keranjang
          <CartBadge count={cartCount} />
        </Link>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="max-w-48"
                  aria-label="Menu akun"
                />
              }
            >
              <UserIcon className="size-4 shrink-0" />
              <span className="truncate">{user.name}</span>
              <ChevronDown className="size-4 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="space-y-0.5">
                  <span className="block truncate text-sm font-semibold">
                    {user.name}
                  </span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {userLinks.map((link) => (
                <DropdownMenuItem
                  key={link.href}
                  render={<Link href={link.href} />}
                >
                  <link.icon className="size-4" />
                  {link.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} disabled={signingOut}>
                <LogOut className="size-4" />
                {signingOut ? "Keluar..." : "Keluar"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/sign-in" className={buttonVariants()}>
            <UserIcon className="size-4" />
            Masuk
          </Link>
        )}
      </nav>

      {/* Mobile */}
      <nav className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label={
                  cartCount > 0
                    ? `Buka menu, ${cartCount} barang di keranjang`
                    : "Buka menu"
                }
                className="relative"
              />
            }
          >
            <MenuIcon className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Navigasi utama Sandang
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-2 px-4">
              {user && (
                <div className="mb-2 rounded-lg bg-muted p-3">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              )}

              <Link
                href="/cart"
                onClick={close}
                className={buttonVariants({
                  variant: "ghost",
                  className: "justify-start",
                })}
              >
                <ShoppingCart className="size-4" />
                Keranjang
                <CartBadge count={cartCount} />
              </Link>

              {user && (
                <>
                  {userLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={close}
                      className={buttonVariants({
                        variant: "ghost",
                        className: "justify-start",
                      })}
                    >
                      <link.icon className="size-4" />
                      {link.label}
                    </Link>
                  ))}
                </>
              )}

              {user ? (
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={handleSignOut}
                  disabled={signingOut}
                >
                  <LogOut className="size-4" />
                  {signingOut ? "Keluar..." : "Keluar"}
                </Button>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={close}
                  className={buttonVariants({ className: "justify-start" })}
                >
                  <UserIcon className="size-4" />
                  Masuk
                </Link>
              )}

              <div className="mt-2 flex items-center justify-between border-t pt-4">
                <span className="text-sm text-muted-foreground">Tema</span>
                <ModeToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </>
  );
};

export default Menu;
