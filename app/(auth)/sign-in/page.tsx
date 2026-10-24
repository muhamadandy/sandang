import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SignInForm from "@/components/shared/auth/sign-in-form";
import { auth } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "Masuk" };

const SignInPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/");

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center space-y-2 text-center">
        <Link href="/" aria-label={`${APP_NAME} - Beranda`}>
          <Image
            src="/images/logo.svg"
            alt={APP_NAME}
            width={160}
            height={37}
            priority
            className="h-9 w-auto dark:hidden"
          />
          <Image
            src="/images/logo-dark.svg"
            alt={APP_NAME}
            width={160}
            height={37}
            priority
            className="hidden h-9 w-auto dark:block"
          />
        </Link>
        <CardTitle className="text-2xl">Masuk</CardTitle>
        <CardDescription>Masuk ke akun {APP_NAME} Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm />
      </CardContent>
    </Card>
  );
};

export default SignInPage;
