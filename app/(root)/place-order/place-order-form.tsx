"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { createOrder } from "@/lib/actions/order.actions";

const PlaceOrderForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const res = await createOrder();

      if (!res.success) {
        toast.add({ title: res.message, type: "error" });
      }

      // Pada kegagalan, redirectTo mengarah ke langkah yang perlu diperbaiki
      if (res.redirectTo) router.push(res.redirectTo);
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? (
          <Loader className="size-4 animate-spin" />
        ) : (
          <Check className="size-4" />
        )}
        Buat Pesanan
      </Button>
    </form>
  );
};

export default PlaceOrderForm;
