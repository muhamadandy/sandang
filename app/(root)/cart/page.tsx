import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMyCart } from "@/lib/actions/cart.actions";
import CartTable from "./cart-table";

export const metadata: Metadata = { title: "Keranjang" };
export const dynamic = "force-dynamic";

const CartPage = async () => {
  // Keranjang hanya untuk pengguna yang sudah masuk
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const cart = await getMyCart();

  return (
    <section>
      <CartTable cart={cart} />
    </section>
  );
};

export default CartPage;
