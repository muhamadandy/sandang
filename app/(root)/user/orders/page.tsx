import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMyOrders } from "@/lib/actions/order-list.actions";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Pesanan Saya" };
export const dynamic = "force-dynamic";

const OrdersPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { page } = await searchParams;
  const currentPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);

  const { orders, totalPages } = await getMyOrders(currentPage);

  return (
    <section className="wrapper">
      <h1 className="h2-bold mb-6">Pesanan Saya</h1>

      {orders.length === 0 ? (
        <div className="space-y-4 rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">
            {currentPage > 1
              ? "Tidak ada pesanan di halaman ini."
              : "Anda belum punya pesanan."}
          </p>
          <Link href="/" className={buttonVariants()}>
            Mulai belanja
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/order/${order.id}`}
                  className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">
                      Pesanan #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(order.createdAt)} · {order.itemCount}{" "}
                      jenis barang
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {order.isPaid ? (
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        Lunas
                      </span>
                    ) : (
                      <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                        Belum dibayar
                      </span>
                    )}
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      {order.isDelivered ? "Sudah dikirim" : "Belum dikirim"}
                    </span>
                    <span className="min-w-28 text-right text-sm font-semibold">
                      {formatRupiah(order.totalPrice)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              {currentPage > 1 ? (
                <Link
                  href={`/user/orders?page=${currentPage - 1}`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Sebelumnya
                </Link>
              ) : (
                <span />
              )}

              <span className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={`/user/orders?page=${currentPage + 1}`}
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
    </section>
  );
};

export default OrdersPage;
