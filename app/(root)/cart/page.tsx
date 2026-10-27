import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMyCartSynced } from "@/lib/actions/cart.actions";
import CartTable from "./cart-table";

export const metadata: Metadata = { title: "Keranjang" };
export const dynamic = "force-dynamic";

const CartPage = async () => {
  // Keranjang hanya untuk pengguna yang sudah masuk
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  // Barang yang produknya sudah dihapus admin dikeluarkan di sini
  const { cart, removed } = await getMyCartSynced();

  return (
    <section>
      <CartTable cart={cart} removedNames={removed} />
    </section>
  );
};

export default CartPage;
