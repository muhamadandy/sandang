"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { paymentMethodSchema, shippingAddressSchema } from "@/lib/validator";
import type { PaymentMethod, ShippingAddress } from "@/types";

export async function getMyAddress(): Promise<ShippingAddress | undefined> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return undefined;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { address: true },
  });

  // Kolom address bertipe Json, jadi bentuknya dipastikan lewat zod
  const parsed = shippingAddressSchema.safeParse(user?.address);
  return parsed.success ? parsed.data : undefined;
}

export async function updateUserAddress(
  data: ShippingAddress,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return { success: false, message: "Silakan masuk terlebih dahulu." };
    }

    // Validasi ulang di server, formulir di browser bisa dilewati
    const parsed = shippingAddressSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: "Alamat tidak valid. Periksa lagi isian Anda.",
      };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { address: parsed.data },
    });

    return { success: true, message: "Alamat pengiriman disimpan." };
  } catch (error) {
    console.error("updateUserAddress gagal:", error);
    return { success: false, message: "Terjadi kesalahan. Coba lagi." };
  }
}

export async function getMyPaymentMethod(): Promise<string | undefined> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return undefined;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { paymentMethod: true },
  });

  return user?.paymentMethod ?? undefined;
}

export async function updateUserPaymentMethod(
  data: PaymentMethod,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return { success: false, message: "Silakan masuk terlebih dahulu." };
    }

    const parsed = paymentMethodSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, message: "Metode pembayaran tidak valid." };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { paymentMethod: parsed.data.type },
    });

    return { success: true, message: "Metode pembayaran disimpan." };
  } catch (error) {
    console.error("updateUserPaymentMethod gagal:", error);
    return { success: false, message: "Terjadi kesalahan. Coba lagi." };
  }
}
