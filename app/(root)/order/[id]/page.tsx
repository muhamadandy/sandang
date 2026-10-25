import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOrderById } from "@/lib/actions/order.actions";
import PayButton from "./pay-button";

export const metadata: Metadata = { title: "Detail Pesanan" };
export const dynamic = "force-dynamic";

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(value);

const OrderPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const address = order.shippingAddress;

  return (
    <section className="wrapper">
      <div className="mb-6 space-y-2">
        <h1 className="h2-bold">Detail Pesanan</h1>
        <p className="break-all text-sm text-muted-foreground">
          Nomor pesanan: {order.id}
        </p>
        <p className="text-sm text-muted-foreground">
          Dibuat pada {formatDate(order.createdAt)}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          {/* Status pembayaran */}
          <div className="rounded-lg border p-4">
            <h2 className="mb-2 text-lg font-semibold">Status Pembayaran</h2>
            {order.isPaid ? (
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                Lunas{order.paidAt ? ` · ${formatDate(order.paidAt)}` : ""}
              </span>
            ) : (
              <span className="inline-block rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
                Belum dibayar
              </span>
            )}
            <p className="mt-3 text-sm text-muted-foreground">
              Metode: {order.paymentMethod}
            </p>
          </div>

          {/* Alamat */}
          <div className="rounded-lg border p-4">
            <h2 className="mb-2 text-lg font-semibold">Alamat Pengiriman</h2>
            <p className="text-sm font-medium">
              {address.fullName} · {address.phone}
            </p>
            <p className="text-sm text-muted-foreground">
              {address.streetAddress}, {address.city}, {address.province}{" "}
              {address.postalCode}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Status pengiriman:{" "}
              {order.isDelivered ? "Sudah dikirim" : "Belum dikirim"}
            </p>
          </div>

          {/* Barang */}
          <div className="rounded-lg border p-4">
            <h2 className="mb-4 text-lg font-semibold">Barang Pesanan</h2>
            <ul className="divide-y">
              {order.orderItems.map((item) => (
                <li
                  key={item.id}
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
          </div>
        </div>

        {/* Rincian harga dan tombol bayar */}
        <div className="h-fit space-y-3 rounded-lg border p-4">
          <h2 className="text-lg font-semibold">Rincian Harga</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Barang</span>
            <span>{formatRupiah(order.itemsPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ongkos kirim</span>
            <span>
              {order.shippingPrice === 0
                ? "Gratis"
                : formatRupiah(order.shippingPrice)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">PPN (11%)</span>
            <span>{formatRupiah(order.taxPrice)}</span>
          </div>
          <div className="flex justify-between border-t pt-3 font-semibold">
            <span>Total</span>
            <span>{formatRupiah(order.totalPrice)}</span>
          </div>

          {!order.isPaid && <PayButton orderId={order.id} />}
        </div>
      </div>
    </section>
  );
};

export default OrderPage;
