"use client";

import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MAX_DIGITS = 12;

const formatter = new Intl.NumberFormat("id-ID");

type NumberInputProps = Omit<
  ComponentProps<"input">,
  "value" | "onChange" | "type" | "prefix"
> & {
  // Nilai angka murni dari form (0 atau kosong ditampilkan sebagai kolom kosong)
  value: number | null | undefined;
  // Dipanggil dengan angka murni, mis. 150000 (kolom kosong = 0)
  onValueChange: (value: number) => void;
  // Teks awalan di dalam kolom, mis. "Rp"
  prefix?: string;
};

const NumberInput = ({
  value,
  onValueChange,
  prefix,
  className,
  ...props
}: NumberInputProps) => {
  const display =
    typeof value === "number" && Number.isFinite(value) && value > 0
      ? formatter.format(value)
      : "";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Buang semua selain angka (huruf, titik, spasi, "Rp"), lalu batasi panjangnya
    const digits = event.target.value.replace(/\D/g, "").slice(0, MAX_DIGITS);
    onValueChange(digits === "" ? 0 : Number.parseInt(digits, 10));
  };

  return (
    <div className="relative">
      {prefix && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground"
        >
          {prefix}
        </span>
      )}
      <Input
        {...props}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={display}
        onChange={handleChange}
        className={cn(prefix && "pl-10", className)}
      />
    </div>
  );
};

export default NumberInput;
