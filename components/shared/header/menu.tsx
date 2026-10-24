"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon, ShoppingCart, UserIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ModeToggle from "./mode-toggle";

const Menu = () => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      {/* Desktop */}
      <nav className="hidden items-center gap-1 md:flex">
        <ModeToggle />
        <Link href="/cart" className={buttonVariants({ variant: "ghost" })}>
          <ShoppingCart className="size-4" />
          Keranjang
        </Link>
        <Link href="/sign-in" className={buttonVariants()}>
          <UserIcon className="size-4" />
          Masuk
        </Link>
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
              <Link
                href="/sign-in"
                onClick={close}
                className={buttonVariants({ className: "justify-start" })}
              >
                <UserIcon className="size-4" />
                Masuk
              </Link>

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
