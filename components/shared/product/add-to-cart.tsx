"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import type { Cart, CartItem } from "@/types";

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const existItem = cart?.items.find((x) => x.productId === item.productId);

  const showAddedToast = (message: string) => {
    const toastId: ReturnType<typeof toast.add> = toast.add({
      title: message,
      type: "success",
      actionProps: {
        children: "Lihat Keranjang",
        onClick: () => {
          toast.close(toastId);
          router.push("/cart");
        },
      },
    });
  };

  const handleAdd = () => {
    startTransition(async () => {
      const res = await addItemToCart(item);

      if (!res.success) {
        toast.add({ title: res.message, type: "error" });
        if (res.requireSignIn) router.push("/sign-in");
        return;
      }

      showAddedToast(res.message);
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);

      if (!res.success) {
        toast.add({ title: res.message, type: "error" });
        return;
      }

      toast.add({ title: res.message, type: "success" });
    });
  };

  if (existItem) {
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">Di keranjang Anda</span>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRemove}
            disabled={isPending}
            aria-label="Kurangi jumlah"
          >
            <Minus className="size-4" />
          </Button>
          <span className="min-w-8 text-center font-semibold">
            {existItem.qty}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleAdd}
            disabled={isPending}
            aria-label="Tambah jumlah"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={handleAdd}
      disabled={isPending}
    >
      <ShoppingCart className="size-4" />
      {isPending ? "Memproses..." : "Tambah ke Keranjang"}
    </Button>
  );
};

export default AddToCart;
