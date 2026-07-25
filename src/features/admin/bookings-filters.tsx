"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Option = { id: string; label: string };

type Props = {
  experiences: Array<{ id: string; title: string }>;
  locations: Array<{ id: string; name: string; city?: string | null }>;
  initial: {
    search: string;
    status: string;
    paymentStatus: string;
    experienceId: string;
    locationId: string;
  };
  labels?: {
    search: string;
    status: string;
    payment: string;
    experience: string;
    location: string;
    apply: string;
    clear: string;
  };
};

const BOOKING_STATUSES = [
  "",
  "draft",
  "pending_payment",
  "payment_processing",
  "confirmed",
  "pending_manual_confirmation",
  "cancelled",
  "completed",
  "refunded",
  "partially_refunded",
  "no_show"
] as const;

const PAYMENT_STATUSES = [
  "",
  "unpaid",
  "pending",
  "processing",
  "paid",
  "failed",
  "refunded",
  "partially_refunded"
] as const;

export function AdminBookingsFilters({
  experiences,
  locations,
  initial,
  labels = {
    search: "Search",
    status: "Status",
    payment: "Payment",
    experience: "Experience",
    location: "Location",
    apply: "Apply filters",
    clear: "Clear"
  }
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const experienceOptions: Option[] = experiences.map((item) => ({
    id: item.id,
    label: item.title
  }));
  const locationOptions: Option[] = locations.map((item) => ({
    id: item.id,
    label: item.city ? `${item.name} · ${item.city}` : item.name
  }));

  function onSubmit(formData: FormData) {
    const params = new URLSearchParams();
    const search = String(formData.get("search") ?? "").trim();
    const status = String(formData.get("status") ?? "");
    const paymentStatus = String(formData.get("payment_status") ?? "");
    const experienceId = String(formData.get("experience_id") ?? "");
    const locationId = String(formData.get("location_id") ?? "");

    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (paymentStatus) params.set("payment_status", paymentStatus);
    if (experienceId) params.set("experience_id", experienceId);
    if (locationId) params.set("location_id", locationId);

    startTransition(() => {
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <form
      action={onSubmit}
      className="border-border grid gap-4 rounded-[var(--radius)] border bg-white p-4 md:grid-cols-2 xl:grid-cols-6"
    >
      <div className="xl:col-span-2">
        <Label htmlFor="admin-booking-search">{labels.search}</Label>
        <Input
          id="admin-booking-search"
          name="search"
          defaultValue={initial.search}
          className="mt-1.5 min-h-11"
          placeholder="Reference, email, name"
        />
      </div>
      <div>
        <Label htmlFor="admin-booking-status">{labels.status}</Label>
        <select
          id="admin-booking-status"
          name="status"
          defaultValue={initial.status}
          className="border-input bg-card mt-1.5 flex h-11 w-full rounded-md border px-3 text-sm"
        >
          {BOOKING_STATUSES.map((status) => (
            <option key={status || "any"} value={status}>
              {status || "Any"}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="admin-booking-payment">{labels.payment}</Label>
        <select
          id="admin-booking-payment"
          name="payment_status"
          defaultValue={initial.paymentStatus}
          className="border-input bg-card mt-1.5 flex h-11 w-full rounded-md border px-3 text-sm"
        >
          {PAYMENT_STATUSES.map((status) => (
            <option key={status || "any"} value={status}>
              {status || "Any"}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="admin-booking-experience">{labels.experience}</Label>
        <select
          id="admin-booking-experience"
          name="experience_id"
          defaultValue={initial.experienceId}
          className="border-input bg-card mt-1.5 flex h-11 w-full rounded-md border px-3 text-sm"
        >
          <option value="">Any</option>
          {experienceOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="admin-booking-location">{labels.location}</Label>
        <select
          id="admin-booking-location"
          name="location_id"
          defaultValue={initial.locationId}
          className="border-input bg-card mt-1.5 flex h-11 w-full rounded-md border px-3 text-sm"
        >
          <option value="">Any</option>
          {locationOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-end gap-2 xl:col-span-6">
        <Button type="submit" disabled={pending} className="min-h-11">
          {labels.apply}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={pending}
          onClick={() => startTransition(() => router.push(pathname))}
        >
          {labels.clear}
        </Button>
      </div>
    </form>
  );
}
