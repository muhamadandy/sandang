import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getAdminOrderById } from "@/lib/actions/admin.actions";
import { formatDateTime, formatRupiah } from "@/lib/format";
import DeliverButton from "../deliver-button";

export const metadata: Metadata = { title: "Detail Pesanan" };
export const dynamic = "force-dynamic";

const Row = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex justify-between gap-4 text-sm">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="text-right">{children}</dd>
  </div>
);

const AdminOrderDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  const address = order.shippingAddress;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        <ArrowLeft className="size-4" />
        Semua pesanan
      </Link>

      <div className="space-y-2">
        <h1 className="h2-bold">
          Pesanan #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <p className="break-all text-sm text-muted-foreground">
          Nomor lengkap: {order.id}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="min-w-0 space-y-4 md:col-span-2">
          {/* Pelanggan */}
          <div className="rounded-lg border p-4">
            <h2 className="mb-2 text-lg font-semibold">Pelanggan</h2>
            <p className="text-sm font-medium">{order.user.name}</p>
            <p className="break-all text-sm text-muted-foreground">
              {order.user.email}
            </p>
          </div>

          {/* Alamat penerima */}
          <div className="rounded-lg border p-4">
            <h2 className="mb-2 text-lg font-semibold">Alamat Pengiriman</h2>
            <p className="text-sm font-medium">{address.fullName}</p>
            <p className="text-sm">
              <a
                href={`tel:${address.phone}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {address.phone}
              </a>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {address.streetAddress}, {address.city}, {address.province}{" "}
              {address.postalCode}
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
                      className="line-clamp-2 text-sm font-medium"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {item.qty} × {formatRupiah(item.price)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold">
                    {formatRupiah(item.price * item.qty)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          {/* Status */}
          <div className="space-y-3 rounded-lg border p-4">
            <h2 className="text-lg font-semibold">Status</h2>

            <div className="flex flex-wrap gap-2">
              {order.isPaid ? (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Lunas
                </span>
              ) : (
                <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                  Belum dibayar
                </span>
              )}
              {order.isPaid && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {order.isDelivered ? "Terkirim" : "Perlu dikirim"}
                </span>
              )}
            </div>

            <dl className="space-y-3">
              <Row label="Dibuat">{formatDateTime(order.createdAt)}</Row>
              <Row label="Dibayar">
                {order.paidAt ? formatDateTime(order.paidAt) : "Belum dibayar"}
              </Row>
              <Row label="Dikirim">
                {order.deliveredAt
                  ? formatDateTime(order.deliveredAt)
                  : "Belum dikirim"}
              </Row>
              <Row label="Metode bayar">{order.paymentMethod}</Row>
            </dl>

            {order.isPaid && !order.isDelivered && (
              <DeliverButton orderId={order.id} />
            )}
          </div>

          {/* Rincian harga */}
          <div className="space-y-3 rounded-lg border p-4">
            <h2 className="text-lg font-semibold">Rincian Harga</h2>
            <dl className="space-y-3">
              <Row label="Barang">{formatRupiah(order.itemsPrice)}</Row>
              <Row label="Ongkos kirim">
                {order.shippingPrice === 0
                  ? "Gratis"
                  : formatRupiah(order.shippingPrice)}
              </Row>
              <Row label="PPN (11%)">{formatRupiah(order.taxPrice)}</Row>
            </dl>
            <div className="flex justify-between border-t pt-3 font-semibold">
              <span>Total</span>
              <span>{formatRupiah(order.totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
