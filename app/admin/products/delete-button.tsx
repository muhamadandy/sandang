"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { deleteProduct } from "@/lib/actions/admin-product.actions";

const DeleteButton = ({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    // Penghapusan tidak bisa dibatalkan, jadi minta konfirmasi dulu
    if (
      !window.confirm(
        `Hapus produk "${productName}"? Tindakan ini tidak bisa dibatalkan.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await deleteProduct(productId);

      toast.add({
        title: res.message,
        type: res.success ? "success" : "error",
      });

      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={handleClick}
      className="text-destructive"
      aria-label={`Hapus ${productName}`}
    >
      {isPending ? (
        <Loader className="size-4 animate-spin" />
      ) : (
        <Trash2 className="size-4" />
      )}
      Hapus
    </Button>
  );
};

export default DeleteButton;
