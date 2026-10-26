"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type MobileFiltersProps = {
  activeCount: number;
  children: React.ReactNode;
};

const MobileFilters = ({ activeCount, children }: MobileFiltersProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" />}>
        <SlidersHorizontal className="size-4" />
        Filter
        {activeCount > 0 && (
          <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter</SheetTitle>
          <SheetDescription className="sr-only">
            Saring produk berdasarkan kategori, harga, dan rating
          </SheetDescription>
        </SheetHeader>

        {/* Menutup sheet saat salah satu tautan filter diklik */}
        <div
          className="px-4 pb-6"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileFilters;
