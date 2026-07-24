import { describe, expect, it } from "vitest";
import { getBookingUpdateForStripeEvent } from "./stripe-webhooks";

describe("getBookingUpdateForStripeEvent", () => {
  it("marks successful checkout sessions as payment complete", () => {
    expect(
      getBookingUpdateForStripeEvent("checkout.session.completed")
    ).toEqual({
      paymentStatus: "paid",
      bookingStatus: "pending_manual_confirmation",
      markBookedAt: true
    });
  });

  it("marks expired checkout sessions as cancelled drafts", () => {
    expect(getBookingUpdateForStripeEvent("checkout.session.expired")).toEqual({
      paymentStatus: "failed",
      bookingStatus: "cancelled",
      markCancelledAt: true
    });
  });

  it("marks failed payment intents without confirming the booking", () => {
    expect(
      getBookingUpdateForStripeEvent("payment_intent.payment_failed")
    ).toEqual({
      paymentStatus: "failed",
      bookingStatus: "pending_payment"
    });
  });

  it("ignores unsupported events", () => {
    expect(getBookingUpdateForStripeEvent("customer.created")).toBeNull();
  });
});
