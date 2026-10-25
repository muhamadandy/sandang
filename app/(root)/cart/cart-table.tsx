"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Loader, Minus, Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { formatCurrency } from "@/lib/utils";
import type { Cart, CartItem } from "@/types";

const CartTable = ({ cart }: { cart?: Cart }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isCheckingOut, startCheckout] = useTransition();

  const handleChange = (item: CartItem, type: "add" | "remove") => {
    setBusyId(item.productId);

    startTransition(async () => {
      // qty: 1 karena aksi menambah/mengurangi satu per klik
      const res =
        type === "add"
          ? await addItemToCart({ ...item, qty: 1 })
          : await removeItemFromCart(item.productId);

      toast.add({
        title: res.message,
        type: res.success ? "success" : "error",
      });
      setBusyId(null);
    });
  };

  // Keranjang kosong
  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="h2-bold">Keranjang Anda kosong</h1>
        <p className="max-w-sm text-muted-foreground">
          Belum ada barang di keranjang. Yuk, lihat koleksi terbaru kami.
        </p>
        <Link href="/" className={buttonVariants()}>
          Mulai Belanja
        </Link>
      </div>
    );
  }

  const itemCount = cart.items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <>
      <h1 className="h2-bold mb-6">Keranjang Belanja</h1>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Daftar barang */}
        <div className="overflow-x-auto md:col-span-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead className="text-center">Jumlah</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart.items.map((item) => {
                const busy = isPending && busyId === item.productId;

                return (
                  <TableRow key={item.productId}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug}`}
                        className="flex items-center gap-3"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={56}
                          height={56}
                          className="size-14 rounded-md object-cover"
                        />
                        <div>
                          <p className="font-medium hover:text-primary">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                      </Link>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={isPending}
                          onClick={() => handleChange(item, "remove")}
                          aria-label={`Kurangi ${item.name}`}
                        >
                          {busy ? (
                            <Loader className="size-4 animate-spin" />
                          ) : (
                            <Minus className="size-4" />
                          )}
                        </Button>
                        <span className="min-w-6 text-center font-semibold">
                          {item.qty}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={isPending}
                          onClick={() => handleChange(item, "add")}
                          aria-label={`Tambah ${item.name}`}
                        >
                          {busy ? (
                            <Loader className="size-4 animate-spin" />
                          ) : (
                            <Plus className="size-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.price * item.qty)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Ringkasan */}
        <Card className="h-fit">
          <CardContent className="space-y-4 p-4">
            <h2 className="text-lg font-semibold">Ringkasan</h2>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Subtotal ({itemCount} barang)
                </dt>
                <dd>{formatCurrency(cart.itemsPrice)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Ongkos kirim</dt>
                <dd>
                  {cart.shippingPrice === 0
                    ? "Gratis"
                    : formatCurrency(cart.shippingPrice)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">PPN 11%</dt>
                <dd>{formatCurrency(cart.taxPrice)}</dd>
              </div>
              <div className="flex justify-between border-t pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd className="text-primary">
                  {formatCurrency(cart.totalPrice)}
                </dd>
              </div>
            </dl>

            <Button
              className="w-full"
              size="lg"
              disabled={isCheckingOut}
              onClick={() =>
                startCheckout(() => router.push("/shipping-address"))
              }
            >
              {isCheckingOut ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              Lanjut ke Checkout
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CartTable;
