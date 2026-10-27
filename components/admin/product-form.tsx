"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Save } from "lucide-react";
import ImageUploader from "@/components/admin/image-uploader";
import NumberInput from "@/components/shared/number-input";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import {
  createProduct,
  updateProduct,
} from "@/lib/actions/admin-product.actions";
import { MAX_FEATURED_PRODUCTS } from "@/lib/admin-products";
import { slugify } from "@/lib/slug";
import { productFormSchema } from "@/lib/validator";
import type { ProductFormValues } from "@/types";

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  defaultValues: ProductFormValues;
  categories: string[];
  brands: string[];
};

const ProductForm = ({
  mode,
  productId,
  defaultValues,
  categories,
  brands,
}: ProductFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Saat menambah, slug mengikuti nama sampai admin mengeditnya sendiri.
  // Saat mengubah, slug tidak berubah sendiri supaya tautan lama tidak rusak.
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  const isFeatured = form.watch("isFeatured");

  function onSubmit(values: ProductFormValues) {
    startTransition(async () => {
      const res =
        mode === "edit" && productId
          ? await updateProduct(productId, values)
          : await createProduct(values);

      if (!res.success) {
        if (res.field) {
          form.setError(res.field, { message: res.message });
        }
        toast.add({ title: res.message, type: "error" });
        return;
      }

      toast.add({ title: res.message, type: "success" });
      router.push("/admin/products");
      router.refresh();
    });
  }

  const textareaClass =
    "min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

  return (
    <form id="product-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        {/* Nama */}
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="product-name">Nama produk</FieldLabel>
              <Input
                {...field}
                id="product-name"
                placeholder="Tas Tote Kanvas"
                aria-invalid={fieldState.invalid}
                onChange={(event) => {
                  field.onChange(event);
                  if (!slugTouched) {
                    form.setValue("slug", slugify(event.target.value), {
                      shouldValidate: form.formState.isSubmitted,
                    });
                  }
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Slug */}
        <Controller
          name="slug"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="product-slug">
                Slug (alamat halaman)
              </FieldLabel>
              <Input
                {...field}
                id="product-slug"
                placeholder="tas-tote-kanvas"
                aria-invalid={fieldState.invalid}
                onChange={(event) => {
                  setSlugTouched(true);
                  field.onChange(event);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Muncul di alamat produk: /product/
                {form.watch("slug") || "slug-produk"}
              </p>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Kategori dan merek */}
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="category"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="product-category">Kategori</FieldLabel>
                <Input
                  {...field}
                  id="product-category"
                  list="category-options"
                  placeholder="Kemeja Pria"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                />
                <datalist id="category-options">
                  {categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="brand"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="product-brand">Merek</FieldLabel>
                <Input
                  {...field}
                  id="product-brand"
                  list="brand-options"
                  placeholder="Sandang Original"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                />
                <datalist id="brand-options">
                  {brands.map((brand) => (
                    <option key={brand} value={brand} />
                  ))}
                </datalist>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {/* Deskripsi */}
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="product-description">Deskripsi</FieldLabel>
              <textarea
                {...field}
                id="product-description"
                placeholder="Ceritakan bahan, ukuran, dan keunggulan produk."
                aria-invalid={fieldState.invalid}
                className={textareaClass}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Harga dan stok */}
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="price"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="product-price">Harga (Rupiah)</FieldLabel>
                <NumberInput
                  id="product-price"
                  prefix="Rp"
                  placeholder="249.000"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="stock"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="product-stock">Stok</FieldLabel>
                <NumberInput
                  id="product-stock"
                  placeholder="0"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {/* Gambar produk */}
        <Controller
          name="images"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Gambar produk</FieldLabel>
              <ImageUploader
                endpoint="productImages"
                value={field.value}
                onChange={field.onChange}
                max={5}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Unggulan */}
        <Controller
          name="isFeatured"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <label
                htmlFor="product-featured"
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <input
                  id="product-featured"
                  type="checkbox"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                  onBlur={field.onBlur}
                  className="mt-1 size-4 accent-primary"
                />
                <span className="space-y-1">
                  <span className="block text-sm font-semibold">
                    Produk unggulan
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    Tampil di carousel beranda. Maksimal {MAX_FEATURED_PRODUCTS}{" "}
                    produk, dan wajib punya gambar banner.
                  </span>
                </span>
              </label>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Banner, hanya untuk produk unggulan */}
        {isFeatured && (
          <Controller
            name="banner"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Gambar banner</FieldLabel>
                <ImageUploader
                  endpoint="bannerImage"
                  value={field.value ? [field.value] : []}
                  onChange={(urls) => field.onChange(urls[0] ?? null)}
                  max={1}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )}
      </FieldGroup>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/products"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Batal
        </Link>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {mode === "edit" ? "Simpan Perubahan" : "Tambah Produk"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
