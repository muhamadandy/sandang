import "dotenv/config";
import { prisma } from "../lib/prisma";

// Penanda pada id pesanan demo. Hanya pesanan dengan penanda ini yang dihapus ulang.
const DEMO_ID_MARKER = "-demo-4000-8000-";

const SHIPPING_FEE = 20000;
const FREE_SHIPPING_ABOVE = 500000;
const TAX_RATE = 0.11;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const JAKARTA_OFFSET_MS = 7 * HOUR_MS;

// Jumlah pesanan per bulan, dari 5 bulan lalu sampai bulan ini (tren naik)
const ORDERS_PER_MONTH = [2, 3, 4, 4, 6, 5];
// Beberapa pesanan terbaru di bulan ini dibiarkan belum dibayar
const UNPAID_THIS_MONTH = 2;

const DEMO_CUSTOMERS = [
  {
    email: "budi@example.com",
    address: {
      fullName: "Budi Santoso",
      phone: "081234567801",
      streetAddress: "Jl. Merdeka No. 10, RT 02/RW 03, Kel. Sukamaju",
      city: "Bandung",
      province: "Jawa Barat",
      postalCode: "40123",
    },
  },
  {
    email: "siti@example.com",
    address: {
      fullName: "Siti Rahayu",
      phone: "081234567802",
      streetAddress: "Jl. Pahlawan No. 25, RT 05/RW 01, Kel. Genteng",
      city: "Surabaya",
      province: "Jawa Timur",
      postalCode: "60275",
    },
  },
];

// Pengacak yang hasilnya selalu sama untuk seed yang sama (mulberry32)
function createRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

// Id berbentuk UUID (36 karakter) dengan penanda demo, nomor urut di awal agar tiap pesanan beda
function demoId(serial: number) {
  return `d3m${String(serial).padStart(5, "0")}-demo-4000-8000-${String(serial).padStart(12, "0")}`;
}

async function clearDemoOrders() {
  const result = await prisma.order.deleteMany({
    where: { id: { contains: DEMO_ID_MARKER } },
  });
  return result.count;
}

async function main() {
  const removed = await clearDemoOrders();
  console.log(`${removed} pesanan demo lama dihapus.`);

  // Mode hanya menghapus: npm run seed:orders -- --clear
  if (process.argv.includes("--clear")) return;

  const [products, users] = await Promise.all([
    prisma.product.findMany({ orderBy: { slug: "asc" } }),
    prisma.user.findMany({
      where: { email: { in: DEMO_CUSTOMERS.map((c) => c.email) } },
      select: { id: true, email: true },
    }),
  ]);

  if (products.length === 0) {
    throw new Error("Belum ada produk. Jalankan dulu: npx prisma db seed");
  }

  const customers = DEMO_CUSTOMERS.map((customer) => {
    const user = users.find((u) => u.email === customer.email);
    if (!user) {
      throw new Error(
        `Pengguna ${customer.email} tidak ditemukan. Jalankan dulu: npx prisma db seed`,
      );
    }
    return { userId: user.id, address: customer.address };
  });

  const random = createRandom(2026);
  const now = Date.now();

  // Tanggal hari ini menurut waktu Jakarta
  const nowJakarta = new Date(now + JAKARTA_OFFSET_MS);
  const year = nowJakarta.getUTCFullYear();
  const month = nowJakarta.getUTCMonth();
  const today = nowJakarta.getUTCDate();

  let serial = 0;
  let paidCount = 0;
  let revenue = 0;

  for (let index = 0; index < ORDERS_PER_MONTH.length; index++) {
    const count = ORDERS_PER_MONTH[index];
    const monthsAgo = ORDERS_PER_MONTH.length - 1 - index;
    const isCurrentMonth = monthsAgo === 0;

    for (let i = 0; i < count; i++) {
      serial += 1;

      // Waktu pesanan: jam 08.00-20.59 WIB, diubah ke UTC dengan mengurangi 7 jam
      const maxDay = isCurrentMonth ? Math.max(1, today - 1) : 27;
      const day = 1 + Math.floor(random() * maxDay);
      const hour = 8 + Math.floor(random() * 13);
      const minute = Math.floor(random() * 60);
      let createdAt = new Date(
        Date.UTC(year, month - monthsAgo, day, hour - 7, minute),
      );
      // Jangan sampai berada di masa depan
      if (createdAt.getTime() > now - HOUR_MS) {
        createdAt = new Date(now - HOUR_MS * (1 + (serial % 5)));
      }

      const customer = customers[serial % customers.length];

      // 1-3 produk berbeda, jumlah 1-2 per produk
      const picked = shuffle([...products], random).slice(
        0,
        1 + Math.floor(random() * 3),
      );
      const items = picked.map((product) => ({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0] ?? "",
        price: product.price,
        qty: 1 + Math.floor(random() * 2),
      }));

      // Harga dihitung dengan aturan yang sama seperti keranjang
      const itemsPrice = items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0,
      );
      const shippingPrice = itemsPrice > FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
      const taxPrice = Math.round(itemsPrice * TAX_RATE);
      const totalPrice = itemsPrice + shippingPrice + taxPrice;

      const isPaid = !(isCurrentMonth && i >= count - UNPAID_THIS_MONTH);
      const paidAt = isPaid
        ? new Date(
            createdAt.getTime() + (5 + Math.floor(random() * 25)) * 60 * 1000,
          )
        : null;

      // Pesanan lunas yang sudah lebih dari 4 hari dianggap sudah dikirim
      const isDelivered = isPaid && now - createdAt.getTime() > 4 * DAY_MS;
      const deliveredAt =
        isDelivered && paidAt ? new Date(paidAt.getTime() + 2 * DAY_MS) : null;

      await prisma.order.create({
        data: {
          id: demoId(serial),
          userId: customer.userId,
          shippingAddress: customer.address,
          paymentMethod: "Midtrans",
          itemsPrice,
          shippingPrice,
          taxPrice,
          totalPrice,
          paymentAttempt: 1,
          isPaid,
          paidAt,
          isDelivered,
          deliveredAt,
          createdAt,
          orderItems: { create: items },
        },
      });

      if (isPaid) {
        paidCount += 1;
        revenue += totalPrice;
      }
    }
  }

  console.log(
    `${serial} pesanan demo ditambahkan (${paidCount} lunas, total Rp${revenue.toLocaleString("id-ID")}).`,
  );
}

main()
  .catch((error) => {
    console.error("Seed pesanan demo gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
