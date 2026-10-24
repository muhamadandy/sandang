"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { signUpSchema } from "@/lib/validator";

const SignUpForm = () => {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[] | undefined>
  >({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    const form = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      confirmPassword: form.get("confirmPassword"),
    });

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      return;
    }
    setFieldErrors({});

    setPending(true);
    const { error } = await authClient.signUp.email({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setPending(false);

    if (error) {
      setMessage("Pendaftaran gagal. Email mungkin sudah terdaftar.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  const fields = [
    { name: "name", label: "Nama lengkap", type: "text", auto: "name" },
    { name: "email", label: "Email", type: "email", auto: "email" },
    {
      name: "password",
      label: "Kata sandi",
      type: "password",
      auto: "new-password",
    },
    {
      name: "confirmPassword",
      label: "Ulangi kata sandi",
      type: "password",
      auto: "new-password",
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input
            id={field.name}
            name={field.name}
            type={field.type}
            autoComplete={field.auto}
          />
          {fieldErrors[field.name] && (
            <p className="text-sm text-destructive">
              {fieldErrors[field.name]?.[0]}
            </p>
          )}
        </div>
      ))}

      {message && <p className="text-sm text-destructive">{message}</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Memproses..." : "Daftar"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-primary hover:underline"
        >
          Masuk
        </Link>
      </p>
    </form>
  );
};

export default SignUpForm;
