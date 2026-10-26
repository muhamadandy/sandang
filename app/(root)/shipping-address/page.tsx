import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getMyAddress } from "@/lib/actions/user.actions";
import CheckoutSteps from "@/components/shared/checkout-steps";
import ShippingAddressForm from "@/components/shared/shipping-address-form";
import type { ShippingAddress } from "@/types";

export const metadata: Metadata = { title: "Alamat Pengiriman" };
export const dynamic = "force-dynamic";

const ShippingAddressPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  // Tidak ada gunanya mengisi alamat kalau keranjang kosong
  const cart = await getMyCart();
  if (!cart || cart.items.length === 0) redirect("/cart");

  const savedAddress = await getMyAddress();

  // Kalau belum pernah menyimpan, nama penerima diisi dengan nama akun
  const address: ShippingAddress = savedAddress ?? {
    fullName: session.user.name,
    phone: "",
    streetAddress: "",
    city: "",
    province: "",
    postalCode: "",
  };

  return (
    <section>
      <div className="mx-auto max-w-2xl space-y-6">
        <CheckoutSteps current={1} />

        <div className="space-y-2">
          <h1 className="h2-bold">Alamat Pengiriman</h1>
          <p className="text-sm text-muted-foreground">
            Ke mana pesanan Anda akan dikirim?
          </p>
        </div>

        <ShippingAddressForm address={address} redirectTo="/payment-method" />
      </div>
    </section>
  );
};

export default ShippingAddressPage;
