import type { Enums } from "@/types/database";

type BookingStatus = Enums<"booking_status">;
type PaymentStatus = Enums<"payment_status">;

type BookingUpdate = {
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  markBookedAt?: true;
  markCancelledAt?: true;
};

const bookingUpdates: Record<string, BookingUpdate> = {
  "checkout.session.completed": {
    paymentStatus: "paid",
    bookingStatus: "pending_manual_confirmation",
    markBookedAt: true
  },
  "checkout.session.expired": {
    paymentStatus: "failed",
    bookingStatus: "cancelled",
    markCancelledAt: true
  },
  "payment_intent.payment_failed": {
    paymentStatus: "failed",
    bookingStatus: "pending_payment"
  }
};

export function getBookingUpdateForStripeEvent(
  eventType: string
): BookingUpdate | null {
  return bookingUpdates[eventType] ?? null;
}
