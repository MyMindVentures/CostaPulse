"use client";

import { useTransition } from "react";
import { signOutAction } from "@/server/auth/actions";
import { Button } from "@/components/ui/button";

type Props = {
  label: string;
};

export function SignOutButton({ label }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      className="min-h-11 border-white/30 bg-transparent text-white hover:bg-white/10"
      disabled={pending}
      onClick={() => startTransition(() => signOutAction())}
    >
      {label}
    </Button>
  );
}
