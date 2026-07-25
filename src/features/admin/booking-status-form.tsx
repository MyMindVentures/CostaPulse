"use client";

import { useState, useTransition } from "react";
import { updateBookingStatusAction } from "@/server/admin/actions";
import { bookingStatusSchema } from "@/server/admin/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { z } from "zod";

type BookingStatus = z.infer<typeof bookingStatusSchema>;

const STATUSES = bookingStatusSchema.options;

type Props = {
  bookingId: string;
  currentStatus: BookingStatus;
};

export function AdminBookingStatusForm({ bookingId, currentStatus }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    const status = String(formData.get("status") ?? "");
    const reason = String(formData.get("reason") ?? "").trim();
    const parsedStatus = bookingStatusSchema.safeParse(status);
    if (!parsedStatus.success) {
      setError("Invalid status");
      return;
    }

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await updateBookingStatusAction({
        bookingId,
        status: parsedStatus.data,
        reason: reason || undefined
      });
      if (result.ok) {
        setMessage("Status updated");
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <form
      action={onSubmit}
      className="border-border grid gap-4 rounded-[var(--radius)] border bg-white p-5 md:grid-cols-[1fr_1fr_auto]"
    >
      <div>
        <Label htmlFor="booking-status">New status</Label>
        <select
          id="booking-status"
          name="status"
          defaultValue={currentStatus}
          className="border-input bg-card mt-1.5 flex h-11 w-full rounded-md border px-3 text-sm"
          disabled={pending}
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="booking-reason">Reason (optional)</Label>
        <Input
          id="booking-reason"
          name="reason"
          className="mt-1.5 min-h-11"
          disabled={pending}
        />
      </div>
      <div className="flex items-end">
        <Button
          type="submit"
          disabled={pending}
          className="min-h-11 w-full md:w-auto"
        >
          Update status
        </Button>
      </div>
      {message ? (
        <Alert className="md:col-span-3">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive" className="md:col-span-3">
          <AlertTitle>Update failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}
