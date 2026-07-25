"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  initialSearch: string;
};

export function AdminCustomersFilters({ initialSearch }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    const search = String(formData.get("search") ?? "").trim();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    startTransition(() => {
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <form
      action={onSubmit}
      className="border-border flex flex-col gap-3 rounded-[var(--radius)] border bg-white p-4 sm:flex-row sm:items-end"
    >
      <div className="min-w-0 flex-1">
        <Label htmlFor="admin-customer-search">Search</Label>
        <Input
          id="admin-customer-search"
          name="search"
          defaultValue={initialSearch}
          className="mt-1.5 min-h-11"
          placeholder="Email, name, phone"
        />
      </div>
      <Button type="submit" disabled={pending} className="min-h-11">
        Search
      </Button>
      <Button
        type="button"
        variant="outline"
        className="min-h-11"
        disabled={pending}
        onClick={() => startTransition(() => router.push(pathname))}
      >
        Clear
      </Button>
    </form>
  );
}
