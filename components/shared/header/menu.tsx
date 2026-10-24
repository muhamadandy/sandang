"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, MenuIcon, ShoppingCart, UserIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
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
};

const Menu = ({ user }: MenuProps) => {
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
        </Link>

        {user ? (
          <>
            <span
              className="flex max-w-40 items-center gap-2 px-3 text-sm"
              title={user.email}
            >
              <UserIcon className="size-4 shrink-0" />
              <span className="truncate">{user.name}</span>
            </span>
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              <LogOut className="size-4" />
              {signingOut ? "Keluar..." : "Keluar"}
            </Button>
          </>
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
              <Button variant="ghost" size="icon" aria-label="Buka menu" />
            }
          >
            <MenuIcon className="size-5" />
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
              </Link>

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
