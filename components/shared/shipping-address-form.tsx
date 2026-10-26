"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { updateUserAddress } from "@/lib/actions/user.actions";
import { PROVINCES } from "@/lib/constants";
import { shippingAddressSchema } from "@/lib/validator";
import type { ShippingAddress } from "@/types";

const topFields = [
  {
    name: "fullName",
    label: "Nama penerima",
    placeholder: "Budi Santoso",
    autoComplete: "name",
    inputMode: "text",
  },
  {
    name: "phone",
    label: "Nomor HP",
    placeholder: "081234567890",
    autoComplete: "tel",
    inputMode: "tel",
  },
  {
    name: "streetAddress",
    label: "Alamat lengkap",
    placeholder: "Jl. Merdeka No. 10, RT 02/RW 03, Kel. Sukamaju",
    autoComplete: "street-address",
    inputMode: "text",
  },
] as const;

type ShippingAddressFormProps = {
  address: ShippingAddress;
  // Tujuan setelah alamat tersimpan. Kosong = tetap di halaman ini.
  redirectTo?: string;
  submitLabel?: string;
};

const ShippingAddressForm = ({
  address,
  redirectTo,
  submitLabel = "Lanjutkan",
}: ShippingAddressFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ShippingAddress>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: address,
  });

  function onSubmit(values: ShippingAddress) {
    startTransition(async () => {
      const res = await updateUserAddress(values);

      if (!res.success) {
        toast.add({ title: res.message, type: "error" });
        return;
      }

      if (redirectTo) {
        router.push(redirectTo);
        return;
      }

      toast.add({ title: res.message, type: "success" });
      router.refresh();
    });
  }

  return (
    <form id="shipping-address-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        {topFields.map((item) => (
          <Controller
            key={item.name}
            name={item.name}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`shipping-${item.name}`}>
                  {item.label}
                </FieldLabel>
                <Input
                  {...field}
                  id={`shipping-${item.name}`}
                  placeholder={item.placeholder}
                  autoComplete={item.autoComplete}
                  inputMode={item.inputMode}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        ))}

        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="city"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="shipping-city">
                  Kota / Kabupaten
                </FieldLabel>
                <Input
                  {...field}
                  id="shipping-city"
                  placeholder="Bandung"
                  autoComplete="address-level2"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="province"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="shipping-province">Provinsi</FieldLabel>
                <select
                  {...field}
                  id="shipping-province"
                  autoComplete="address-level1"
                  aria-invalid={fieldState.invalid}
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"
                >
                  <option value="">Pilih provinsi</option>
                  {PROVINCES.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <Controller
          name="postalCode"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="shipping-postalCode">Kode pos</FieldLabel>
              <Input
                {...field}
                id="shipping-postalCode"
                placeholder="40123"
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={5}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type="submit"
        size="lg"
        className="mt-6 w-full"
        disabled={isPending}
      >
        {isPending ? (
          <Loader className="size-4 animate-spin" />
        ) : redirectTo ? (
          <ArrowRight className="size-4" />
        ) : (
          <Save className="size-4" />
        )}
        {submitLabel}
      </Button>
    </form>
  );
};

export default ShippingAddressForm;
