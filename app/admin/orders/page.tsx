import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAdminOrders } from "@/lib/actions/admin.actions";
import {
  buildAdminOrdersUrl,
  ORDER_STATUS_TABS,
  parseAdminOrderParams,
} from "@/lib/admin-orders";
import { formatDateTime, formatRupiah } from "@/lib/format";
import DeliverButton from "./deliver-button";

export const metadata: Metadata = { title: "Pesanan" };
export const dynamic = "force-dynamic";

const AdminOrdersPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const filters = parseAdminOrderParams(await searchParams);
  const { orders, total, totalPages, counts } = await getAdminOrders(filters);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="h2-bold">Pesanan</h1>
        <p className="text-sm text-muted-foreground">
          {total} pesanan ditemukan
        </p>
      </div>

      {/* Tab status */}
      <div className="flex flex-wrap gap-2">
        {ORDER_STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={buildAdminOrdersUrl(filters, { status: tab.value })}
            aria-current={filters.status === tab.value ? "true" : undefined}
            className={buttonVariants({
              variant: filters.status === tab.value ? "default" : "outline",
              size: "sm",
            })}
          >
            {tab.label} ({counts[tab.value]})
          </Link>
        ))}
      </div>

      {/* Pencarian. Formulir biasa, status yang sedang dipilih ikut terkirim. */}
      <form action="/admin/orders" role="search" className="relative max-w-sm">
        {filters.status !== "all" && (
          <input type="hidden" name="status" value={filters.status} />
        )}
        <Input
          name="q"
          type="search"
          defaultValue={filters.q}
          placeholder="Cari nama, email, atau nomor pesanan…"
          aria-label="Cari pesanan"
          maxLength={100}
          className="pr-10 [&::-webkit-search-cancel-button]:appearance-none"
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          aria-label="Cari"
          className="absolute inset-y-0 right-0.5 my-auto size-8"
        >
          <Search className="size-4" />
        </Button>
      </form>

      {orders.length === 0 ? (
        <div className="space-y-4 rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">Tidak ada pesanan yang cocok.</p>
          <Link
            href="/admin/orders"
            className={buttonVariants({ variant: "outline" })}
          >
            Tampilkan semua
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {orders.map((order) => (
              <li
                key={order.id}
                className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-semibold">
                    #{order.id.slice(0, 8).toUpperCase()}
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      · {order.itemCount} jenis barang
                    </span>
                  </p>
                  <p className="truncate text-sm">
                    {order.customerName}{" "}
                    <span className="text-muted-foreground">
                      ({order.customerEmail})
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
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

                  <span className="min-w-28 text-sm font-semibold md:text-right">
                    {formatRupiah(order.totalPrice)}
                  </span>

                  {order.isPaid && !order.isDelivered && (
                    <DeliverButton orderId={order.id} />
                  )}

                  <Link
                    href={`/admin/orders/${order.id}`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                  >
                    Detail
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              {filters.page > 1 ? (
                <Link
                  href={buildAdminOrdersUrl(filters, {
                    page: filters.page - 1,
                  })}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Sebelumnya
                </Link>
              ) : (
                <span />
              )}

              <span className="text-sm text-muted-foreground">
                Halaman {filters.page} dari {totalPages}
              </span>

              {filters.page < totalPages ? (
                <Link
                  href={buildAdminOrdersUrl(filters, {
                    page: filters.page + 1,
                  })}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Berikutnya
                </Link>
              ) : (
                <span />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminOrdersPage;
