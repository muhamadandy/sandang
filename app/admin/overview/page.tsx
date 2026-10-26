import type { Metadata } from "next";
import { Banknote, Package, ShoppingBag, Users } from "lucide-react";
import { getOverviewData } from "@/lib/actions/admin.actions";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { CategoryChart, RevenueChart } from "./charts";

export const metadata: Metadata = { title: "Ringkasan" };
export const dynamic = "force-dynamic";

const StatCard = ({
  title,
  value,
  note,
  icon: Icon,
}: {
  title: string;
  value: string;
  note?: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div className="rounded-lg border p-4">
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">{title}</p>
      <Icon className="size-4 text-muted-foreground" />
    </div>
    <p className="mt-2 text-2xl font-semibold">{value}</p>
    {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
  </div>
);

const OverviewPage = async () => {
  const data = await getOverviewData();

  return (
    <div className="space-y-6">
      <h1 className="h2-bold">Ringkasan</h1>

      {/* Angka utama */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total pendapatan"
          value={formatRupiah(data.totalRevenue)}
          note="Dari pesanan yang sudah lunas"
          icon={Banknote}
        />
        <StatCard
          title="Pesanan"
          value={String(data.totalOrders)}
          note={`${data.paidOrders} sudah lunas`}
          icon={ShoppingBag}
        />
        <StatCard
          title="Pelanggan"
          value={String(data.customers)}
          icon={Users}
        />
        <StatCard title="Produk" value={String(data.products)} icon={Package} />
      </div>

      {/* Grafik */}
      <div className="grid gap-4 lg:grid-cols-7">
        <div className="min-w-0 rounded-lg border p-4 lg:col-span-4">
          <h2 className="mb-4 text-lg font-semibold">
            Pendapatan 6 bulan terakhir
          </h2>
          <RevenueChart data={data.monthlyRevenue} />
        </div>

        <div className="min-w-0 rounded-lg border p-4 lg:col-span-3">
          <h2 className="mb-4 text-lg font-semibold">Penjualan per kategori</h2>
          <CategoryChart data={data.categorySales} />
        </div>
      </div>

      {/* Pesanan terbaru */}
      <div className="rounded-lg border p-4">
        <h2 className="mb-4 text-lg font-semibold">Pesanan terbaru</h2>

        {data.latestOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada pesanan.</p>
        ) : (
          <ul className="divide-y">
            {data.latestOrders.map((order) => (
              <li
                key={order.id}
                className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {order.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    #{order.id.slice(0, 8).toUpperCase()} ·{" "}
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {order.isPaid ? (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      Lunas
                    </span>
                  ) : (
                    <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                      Belum dibayar
                    </span>
                  )}
                  <span className="text-sm font-semibold">
                    {formatRupiah(order.totalPrice)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OverviewPage;
