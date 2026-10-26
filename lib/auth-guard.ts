import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");
  if (session.user.role !== "admin") notFound();

  return session;
}
