import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMyAddress } from "@/lib/actions/user.actions";
import ShippingAddressForm from "@/components/shared/shipping-address-form";
import type { ShippingAddress } from "@/types";
import ProfileForm from "./profile-form";

export const metadata: Metadata = { title: "Profil" };
export const dynamic = "force-dynamic";

const ProfilePage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const savedAddress = await getMyAddress();

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
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="h2-bold">Profil</h1>

        <div className="space-y-4 rounded-lg border p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Informasi Akun</h2>
          <ProfileForm name={session.user.name} email={session.user.email} />
        </div>

        <div className="space-y-4 rounded-lg border p-4 sm:p-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Alamat Tersimpan</h2>
            <p className="text-sm text-muted-foreground">
              Alamat ini terisi otomatis saat Anda checkout.
            </p>
          </div>
          <ShippingAddressForm address={address} submitLabel="Simpan Alamat" />
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
