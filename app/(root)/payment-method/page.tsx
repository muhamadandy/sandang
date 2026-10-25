import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getMyAddress, getMyPaymentMethod } from "@/lib/actions/user.actions";
import { DEFAULT_PAYMENT_METHOD } from "@/lib/constants";
import CheckoutSteps from "@/components/shared/checkout-steps";
import PaymentMethodForm from "./payment-method-form";

export const metadata: Metadata = { title: "Metode Pembayaran" };
export const dynamic = "force-dynamic";

const PaymentMethodPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const cart = await getMyCart();
  if (!cart || cart.items.length === 0) redirect("/cart");

  // Alamat harus sudah diisi sebelum memilih pembayaran
  const address = await getMyAddress();
  if (!address) redirect("/shipping-address");

  const savedMethod = await getMyPaymentMethod();

  return (
    <section className="wrapper">
      <div className="mx-auto max-w-2xl space-y-6">
        <CheckoutSteps current={2} />

        <div className="space-y-2">
          <h1 className="h2-bold">Metode Pembayaran</h1>
          <p className="text-sm text-muted-foreground">
            Pilih cara Anda membayar pesanan ini.
          </p>
        </div>

        <PaymentMethodForm
          preferredMethod={savedMethod ?? DEFAULT_PAYMENT_METHOD}
        />
      </div>
    </section>
  );
};

export default PaymentMethodPage;
