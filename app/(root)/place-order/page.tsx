import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getMyAddress, getMyPaymentMethod } from "@/lib/actions/user.actions";
import { buttonVariants } from "@/components/ui/button";
import CheckoutSteps from "@/components/shared/checkout-steps";
import PlaceOrderForm from "./place-order-form";
import { formatRupiah } from "@/lib/format";

export const metadata: Metadata = { title: "Ringkasan Pesanan" };
export const dynamic = "force-dynamic";

const PlaceOrderPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const cart = await getMyCart();
  if (!cart || cart.items.length === 0) redirect("/cart");

  const address = await getMyAddress();
  if (!address) redirect("/shipping-address");

  const paymentMethod = await getMyPaymentMethod();
  if (!paymentMethod) redirect("/payment-method");

  return (
    <section className="wrapper">
      <CheckoutSteps current={3} />

      <h1 className="h2-bold mb-6">Ringkasan Pesanan</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          {/* Alamat pengiriman */}
          <div className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Alamat Pengiriman</h2>
                <p className="text-sm font-medium">
                  {address.fullName} · {address.phone}
                </p>
                <p className="text-sm text-muted-foreground">
                  {address.streetAddress}, {address.city}, {address.province}{" "}
                  {address.postalCode}
                </p>
              </div>
              <Link
                href="/shipping-address"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Ubah
              </Link>
            </div>
          </div>

          {/* Metode pembayaran */}
          <div className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Metode Pembayaran</h2>
                <p className="text-sm text-muted-foreground">{paymentMethod}</p>
              </div>
              <Link
                href="/payment-method"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Ubah
              </Link>
            </div>
          </div>

          {/* Barang */}
          <div className="rounded-lg border p-4">
            <h2 className="mb-4 text-lg font-semibold">Barang Pesanan</h2>
            <ul className="divide-y">
              {cart.items.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <Link href={`/product/${item.slug}`} className="shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={56}
                      height={56}
                      className="size-14 rounded-md object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.slug}`}
                      className="line-clamp-1 text-sm font-medium"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {item.qty} × {formatRupiah(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatRupiah(item.price * item.qty)}
                  </p>
                </li>
              ))}
            </ul>
            <Link
              href="/cart"
              className={`${buttonVariants({ variant: "outline", size: "sm" })} mt-4`}
            >
              Ubah keranjang
            </Link>
          </div>
        </div>

        {/* Ringkasan harga */}
        <div className="h-fit space-y-3 rounded-lg border p-4">
          <h2 className="text-lg font-semibold">Rincian Harga</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Barang</span>
            <span>{formatRupiah(cart.itemsPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ongkos kirim</span>
            <span>
              {cart.shippingPrice === 0
                ? "Gratis"
                : formatRupiah(cart.shippingPrice)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">PPN (11%)</span>
            <span>{formatRupiah(cart.taxPrice)}</span>
          </div>
          <div className="flex justify-between border-t pt-3 font-semibold">
            <span>Total</span>
            <span>{formatRupiah(cart.totalPrice)}</span>
          </div>
          <PlaceOrderForm />
        </div>
      </div>
    </section>
  );
};

export default PlaceOrderPage;
