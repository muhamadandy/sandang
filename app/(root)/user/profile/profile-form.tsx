"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { updateUserName } from "@/lib/actions/user.actions";
import { updateProfileSchema } from "@/lib/validator";
import type { UpdateProfile } from "@/types";

const ProfileForm = ({ name, email }: { name: string; email: string }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateProfile>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name },
  });

  function onSubmit(values: UpdateProfile) {
    startTransition(async () => {
      const res = await updateUserName(values);

      toast.add({
        title: res.message,
        type: res.success ? "success" : "error",
      });

      if (res.success) router.refresh();
    });
  }

  return (
    <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="profile-email">Email</FieldLabel>
          <Input
            id="profile-email"
            type="email"
            value={email}
            disabled
            readOnly
          />
        </Field>

        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="profile-name">Nama</FieldLabel>
              <Input
                {...field}
                id="profile-name"
                autoComplete="name"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type="submit"
        size="lg"
        className="mt-6 w-full"
        disabled={isPending}
      >
        {isPending ? (
          <Loader className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        Simpan Nama
      </Button>
    </form>
  );
};

export default ProfileForm;
