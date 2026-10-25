import { createHash, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Endpoint ini dipanggil oleh server Midtrans, bukan oleh browser pengguna.
// Karena terbuka untuk umum, satu-satunya penjaga adalah tanda tangan (signature_key).
export async function POST(request: Request) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    console.error("MIDTRANS_SERVER_KEY belum diisi");
    return NextResponse.json(
      { message: "Server belum dikonfigurasi" },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Body tidak valid" }, { status: 400 });
  }

  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status,
  } = body;

  if (
    typeof order_id !== "string" ||
    typeof status_code !== "string" ||
    typeof gross_amount !== "string" ||
    typeof signature_key !== "string" ||
    typeof transaction_status !== "string"
  ) {
    return NextResponse.json(
      { message: "Data tidak lengkap" },
      { status: 400 },
    );
  }

  // 1. Verifikasi tanda tangan: SHA512(order_id + status_code + gross_amount + server key)
  const expected = createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");

  const given = Buffer.from(signature_key);
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) {
    return NextResponse.json(
      { message: "Tanda tangan tidak valid" },
      { status: 403 },
    );
  }

  // 2. Pesanan harus ada dan nominalnya harus sama
  const order = await prisma.order.findUnique({
    where: { id: order_id },
    select: { id: true, totalPrice: true },
  });
  if (!order) {
    return NextResponse.json(
      { message: "Pesanan tidak ditemukan" },
      { status: 404 },
    );
  }
  if (Number(gross_amount) !== order.totalPrice) {
    return NextResponse.json(
      { message: "Nominal tidak cocok" },
      { status: 400 },
    );
  }

  // 3. Hanya status berhasil yang menandai lunas
  const isSuccess =
    transaction_status === "settlement" ||
    (transaction_status === "capture" && fraud_status === "accept");

  if (!isSuccess) {
    // pending, expire, cancel, deny, dll. tidak mengubah apa pun
    return NextResponse.json({ message: "Diabaikan" });
  }

  // 4. Idempoten: Midtrans bisa mengirim notifikasi yang sama berkali-kali.
  //    updateMany dengan syarat isPaid=false hanya berhasil satu kali.
  const claimed = await prisma.order.updateMany({
    where: { id: order.id, isPaid: false },
    data: { isPaid: true, paidAt: new Date() },
  });

  if (claimed.count === 0) {
    return NextResponse.json({ message: "Sudah diproses" });
  }

  // 5. Kurangi stok sesuai barang yang dibeli
  const items = await prisma.orderItem.findMany({
    where: { orderId: order.id },
    select: { productId: true, qty: true },
  });

  await prisma.$transaction(
    items.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty } },
      }),
    ),
  );

  return NextResponse.json({ message: "OK" });
}
