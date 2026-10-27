import { CreditCard, MapPin, PackageCheck, Search } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Pilih produk",
    description:
      "Telusuri koleksi, pakai pencarian dan filter, lalu tambahkan ke keranjang.",
  },
  {
    icon: MapPin,
    title: "Masuk & isi alamat",
    description:
      "Masuk dengan akun demo di bawah, lalu isi alamat pengiriman Anda.",
  },
  {
    icon: CreditCard,
    title: "Bayar",
    description:
      "Periksa ringkasan, buat pesanan, lalu bayar lewat jendela Midtrans.",
  },
  {
    icon: PackageCheck,
    title: "Pantau pesanan",
    description:
      "Status lunas dan pengiriman bisa dilihat di halaman Pesanan Saya.",
  },
];

const HowToOrder = () => {
  return (
    <section className="mt-12 rounded-xl border bg-muted/40 p-5 md:p-8">
      <h2 className="h2-bold">Cara Mencoba</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Empat langkah untuk menjelajahi alur belanja dari awal sampai akhir.
      </p>

      <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <step.icon className="size-5" />
            </span>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">
                {i + 1}. {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-3 text-sm md:grid-cols-2">
        <div className="rounded-lg border bg-background p-4">
          <p className="font-semibold">Pembayaran uji coba</p>
          <p className="mt-1 text-muted-foreground">
            Pembayaran memakai Midtrans Sandbox. Pilih metode apa saja di
            jendela pembayaran dan ikuti simulatornya. Tidak ada uang sungguhan
            yang dipakai.
          </p>
        </div>
        <div className="rounded-lg border bg-background p-4">
          <p className="font-semibold">Akun demo</p>
          <p className="mt-1 text-muted-foreground">
            Email{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">
              budi@example.com
            </code>
            , kata sandi{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">
              demo12345
            </code>
            . Atau daftar dengan akun sendiri.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowToOrder;
