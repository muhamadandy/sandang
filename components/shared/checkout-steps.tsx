import { Fragment } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Urutan langkah checkout. Indeks 0 = langkah pertama.
const STEPS = [
  "Masuk",
  "Alamat Pengiriman",
  "Metode Pembayaran",
  "Pesan",
] as const;

const CheckoutSteps = ({ current = 0 }: { current?: number }) => {
  return (
    <nav aria-label="Langkah checkout" className="mb-8">
      <ol className="flex items-start justify-between">
        {STEPS.map((label, index) => {
          const isDone = index < current;
          const isActive = index === current;

          return (
            <Fragment key={label}>
              <li
                className="flex w-16 flex-col items-center gap-2 text-center sm:w-28"
                aria-current={isActive ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                    isDone &&
                      "border-primary bg-primary text-primary-foreground",
                    isActive && "border-primary bg-background text-primary",
                    !isDone &&
                      !isActive &&
                      "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="size-4" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "text-xs leading-tight sm:text-sm",
                    isActive
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </li>

              {/* Garis penghubung antar langkah (tidak ada setelah langkah terakhir) */}
              {index < STEPS.length - 1 && (
                <li
                  aria-hidden="true"
                  className={cn(
                    "mt-4 h-0.5 flex-1 transition-colors",
                    index < current ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default CheckoutSteps;
