"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createBookingStoryAction } from "@/server/admin/actions-booking-stories";

export function CreateBookingStoryButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <Button
      type="button"
      disabled={pending}
      className="min-h-11"
      onClick={async () => {
        const title = window.prompt("Public story title");
        if (!title?.trim()) return;
        setPending(true);
        const form = new FormData();
        form.set("bookingId", bookingId);
        form.set("title", title.trim());
        const result = await createBookingStoryAction(form);
        setPending(false);
        if (!result.ok) {
          toast.error(result.message);
          return;
        }
        router.push(`/admin/booking-stories/${result.data.id}`);
      }}
    >
      {pending ? "Creating…" : "Create Story"}
    </Button>
  );
}
