"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createBookingStoryAction } from "@/server/admin/actions-booking-stories";

export function CreateBookingStoryButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  return (
    <>
      <Button
        type="button"
        disabled={pending}
        className="min-h-11"
        onClick={() => {
          dialogRef.current?.showModal();
          window.setTimeout(() => titleRef.current?.focus(), 0);
        }}
      >
        Create Story
      </Button>
      <dialog
        ref={dialogRef}
        className="border-border text-ink backdrop:bg-navy/70 m-auto w-[min(32rem,calc(100%-2rem))] rounded-[var(--radius)] border bg-white p-0 shadow-[var(--shadow)]"
        aria-labelledby={`create-story-title-${bookingId}`}
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
      >
        <form
          className="grid gap-5 p-5 sm:p-6"
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const title = String(data.get("title") ?? "").trim();
            if (!title) {
              titleRef.current?.focus();
              return;
            }
            setPending(true);
            const form = new FormData();
            form.set("bookingId", bookingId);
            form.set("title", title);
            const result = await createBookingStoryAction(form);
            setPending(false);
            if (!result.ok) {
              toast.error(result.message);
              return;
            }
            dialogRef.current?.close();
            router.push(`/admin/booking-stories/${result.data.id}`);
          }}
        >
          <div>
            <h2
              id={`create-story-title-${bookingId}`}
              className="text-xl font-semibold"
            >
              Create booking story
            </h2>
            <p className="text-muted mt-1 text-sm">
              Choose a public editorial title. Private booking contact details
              are not suggested or copied.
            </p>
          </div>
          <label className="text-sm">
            Public story title
            <input
              ref={titleRef}
              name="title"
              required
              maxLength={160}
              className="border-input mt-1 min-h-11 w-full rounded-md border px-3"
            />
          </label>
          <div className="flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => dialogRef.current?.close()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create Story"}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
