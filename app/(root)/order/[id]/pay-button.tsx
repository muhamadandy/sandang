"use client";

import { useTransition } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { CreditCard, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { createSnapToken } from "@/lib/actions/order.actions";

// Tipe untuk objek window.snap dari skrip Midtrans
declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: () => void;
          onPending?: () => void;
          onError?: () => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

const PayButton = ({ orderId }: { orderId: string }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Menyegarkan halaman beberapa kali sambil menunggu webhook Midtrans masuk
  function refreshAFewTimes() {
    let count = 0;
    const timer = setInterval(() => {
      router.refresh();
      count += 1;
      if (count >= 6) clearInterval(timer);
    }, 3000);
  }

  function handlePay() {
    startTransition(async () => {
      const res = await createSnapToken(orderId);

      if (!res.success || !res.token) {
        toast.add({ title: res.message, type: "error" });
        return;
      }

      if (!window.snap) {
        toast.add({
          title: "Jendela pembayaran belum siap. Coba lagi sebentar lagi.",
          type: "error",
        });
        return;
      }

      window.snap.pay(res.token, {
        onSuccess: () => {
          toast.add({
            title: "Pembayaran diterima. Memperbarui status pesanan…",
            type: "success",
          });
          refreshAFewTimes();
        },
        onPending: () => {
          toast.add({
            title: "Menunggu pembayaran Anda diselesaikan.",
            type: "success",
          });
          refreshAFewTimes();
        },
        onError: () => {
          toast.add({ title: "Pembayaran gagal. Coba lagi.", type: "error" });
        },
        onClose: () => {
          // Pengguna menutup jendela tanpa membayar, tidak perlu apa-apa
        },
      });
    });
  }

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={isPending}
        onClick={handlePay}
      >
        {isPending ? (
          <Loader className="size-4 animate-spin" />
        ) : (
          <CreditCard className="size-4" />
        )}
        Bayar Sekarang
      </Button>
    </>
  );
};

export default PayButton;
