import "dotenv/config";
import { prisma } from "../lib/prisma";

// Penanda pada id ulasan demo. Hanya ulasan dengan penanda ini yang dihapus ulang.
const DEMO_ID_MARKER = "-demo-4000-8000-";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// Sebagian pembeli tidak mengulas, jadi tidak semua pasangan dibuat ulasannya
const REVIEW_CHANCE = 0.75;

// Nilai tidak dibuat rata: dominan 4-5 bintang seperti toko pada umumnya
const RATING_POOL = [5, 5, 5, 5, 4, 4, 4, 3, 3, 2];

const COMMENTS: Record<number, string[]> = {
  5: [
    "Kualitas bahannya bagus sekali, jahitannya rapi. Sangat puas dengan pembelian ini.",
    "Sesuai deskripsi dan fotonya. Pengiriman cepat, barang sampai dengan aman.",
    "Nyaman dipakai seharian dan modelnya bagus. Pasti beli lagi.",
    "Lebih bagus dari yang saya bayangkan untuk harga segini. Recommended!",
  ],
  4: [
    "Barangnya bagus dan sesuai harga. Hanya warnanya sedikit berbeda dari foto.",
    "Kualitas oke, ukuran pas. Pengemasan bisa lebih rapi lagi.",
    "Secara keseluruhan puas. Bahannya nyaman, jahitan sudah rapi.",
  ],
  3: [
    "Lumayan untuk harganya. Bahannya cukup, tapi ada sedikit benang yang keluar.",
    "Biasa saja, sesuai ekspektasi. Cocok untuk pemakaian santai.",
  ],
  2: [
    "Ukurannya agak kecil dari perkiraan saya, sebaiknya ambil satu ukuran lebih besar.",
    "Kurang sesuai harapan, bahannya lebih tipis dari yang saya kira.",
  ],
};

// Pengacak yang hasilnya selalu sama untuk seed yang sama (mulberry32)
function createRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Id berbentuk UUID (36 karakter) dengan penanda demo
function demoId(serial: number) {
  return `d3r${String(serial).padStart(5, "0")}-demo-4000-8000-${String(serial).padStart(12, "0")}`;
}

// Hitung ulang rating & jumlah ulasan semua produk dari tabel Review
async function recalculateRatings() {
  const stats = await prisma.review.groupBy({
    by: ["productId"],
    _avg: { rating: true },
    _count: { _all: true },
  });

  await prisma.product.updateMany({ data: { rating: 0, numReviews: 0 } });

  for (const stat of stats) {
    await prisma.product.update({
      where: { id: stat.productId },
      data: {
        rating: Math.round((stat._avg.rating ?? 0) * 10) / 10,
        numReviews: stat._count._all,
      },
    });
  }
}

async function main() {
  const removed = await prisma.review.deleteMany({
    where: { id: { contains: DEMO_ID_MARKER } },
  });
  console.log(`${removed.count} ulasan demo lama dihapus.`);

  // Mode hanya menghapus: npm run seed:reviews -- --clear
  if (process.argv.includes("--clear")) {
    await recalculateRatings();
    console.log("Rating produk dihitung ulang.");
    return;
  }

  // Pasangan pengguna-produk dari pesanan demo yang sudah LUNAS
  const items = await prisma.orderItem.findMany({
    where: { order: { id: { contains: DEMO_ID_MARKER }, isPaid: true } },
    select: {
      productId: true,
      order: {
        select: { userId: true, paidAt: true, deliveredAt: true },
      },
    },
  });

  if (items.length === 0) {
    throw new Error(
      "Belum ada pesanan demo yang lunas. Jalankan dulu: npm run seed:orders",
    );
  }

  // Satu pasangan hanya sekali (aturan: satu ulasan per pengguna per produk)
  const pairs = new Map<
    string,
    { userId: string; productId: string; boughtAt: number }
  >();
  for (const item of items) {
    const key = `${item.order.userId}:${item.productId}`;
    const boughtAt =
      (item.order.deliveredAt ?? item.order.paidAt)?.getTime() ?? 0;
    const existing = pairs.get(key);
    if (!existing || boughtAt < existing.boughtAt) {
      pairs.set(key, {
        userId: item.order.userId,
        productId: item.productId,
        boughtAt,
      });
    }
  }

  // Diurutkan supaya hasil acak selalu sama untuk data yang sama
  const sorted = [...pairs.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);

  const random = createRandom(2027);
  const now = Date.now();

  const data = [];
  let serial = 0;

  for (const pair of sorted) {
    if (random() > REVIEW_CHANCE) continue;

    serial += 1;
    const rating = RATING_POOL[Math.floor(random() * RATING_POOL.length)];
    const pool = COMMENTS[rating];
    const comment = pool[Math.floor(random() * pool.length)];

    // Ulasan ditulis 1-5 hari setelah pembelian, tidak pernah di masa depan
    let createdAt = new Date(
      pair.boughtAt + (1 + Math.floor(random() * 5)) * DAY_MS,
    );
    if (createdAt.getTime() > now - HOUR_MS) {
      createdAt = new Date(now - HOUR_MS);
    }

    data.push({
      id: demoId(serial),
      productId: pair.productId,
      userId: pair.userId,
      rating,
      comment,
      createdAt,
    });
  }

  // skipDuplicates: jika pengguna sudah punya ulasan asli di produk itu, dilewati
  const result = await prisma.review.createMany({
    data,
    skipDuplicates: true,
  });

  await recalculateRatings();

  console.log(
    `${result.count} ulasan demo ditambahkan, rating produk dihitung ulang.`,
  );
}

main()
  .catch((error) => {
    console.error("Seed ulasan demo gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
