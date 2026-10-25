"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { updateUserPaymentMethod } from "@/lib/actions/user.actions";
import { PAYMENT_METHOD_OPTIONS, PAYMENT_METHODS } from "@/lib/constants";
import { paymentMethodSchema } from "@/lib/validator";
import type { PaymentMethod } from "@/types";

const PaymentMethodForm = ({
  preferredMethod,
}: {
  preferredMethod: string;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Pastikan nilai tersimpan masih termasuk metode yang tersedia
  const initialType = (PAYMENT_METHODS as readonly string[]).includes(
    preferredMethod,
  )
    ? (preferredMethod as PaymentMethod["type"])
    : PAYMENT_METHODS[0];

  const form = useForm<PaymentMethod>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: { type: initialType },
  });

  function onSubmit(values: PaymentMethod) {
    startTransition(async () => {
      const res = await updateUserPaymentMethod(values);

      if (!res.success) {
        toast.add({ title: res.message, type: "error" });
        return;
      }

      router.push("/place-order");
    });
  }

  return (
    <form id="payment-method-form" onSubmit={form.handleSubmit(onSubmit)}>
      <Controller
        name="type"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <div
              role="radiogroup"
              aria-label="Metode pembayaran"
              className="space-y-3"
            >
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  htmlFor={`payment-${option.value}`}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="radio"
                    id={`payment-${option.value}`}
                    name={field.name}
                    value={option.value}
                    checked={field.value === option.value}
                    onChange={() => field.onChange(option.value)}
                    onBlur={field.onBlur}
                    className="mt-1 size-4 accent-primary"
                  />
                  <span className="space-y-1">
                    <span className="block text-sm font-semibold">
                      {option.label}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="mt-6 flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={isPending}
          onClick={() => router.push("/shipping-address")}
        >
          <ArrowLeft className="size-4" />
          Kembali
        </Button>
        <Button type="submit" size="lg" className="flex-1" disabled={isPending}>
          {isPending ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4" />
          )}
          Lanjutkan
        </Button>
      </div>
    </form>
  );
};

export default PaymentMethodForm;
