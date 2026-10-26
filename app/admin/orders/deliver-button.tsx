"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { markOrderDelivered } from "@/lib/actions/admin.actions";

const DeliverButton = ({ orderId }: { orderId: string }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    // Tidak ada tombol "batalkan", jadi minta konfirmasi dulu
    if (!window.confirm("Tandai pesanan ini sudah dikirim?")) return;

    startTransition(async () => {
      const res = await markOrderDelivered(orderId);

      toast.add({
        title: res.message,
        type: res.success ? "success" : "error",
      });

      router.refresh();
    });
  }

  return (
    <Button type="button" size="sm" disabled={isPending} onClick={handleClick}>
      {isPending ? (
        <Loader className="size-4 animate-spin" />
      ) : (
        <Truck className="size-4" />
      )}
      Tandai terkirim
    </Button>
  );
};

export default DeliverButton;
