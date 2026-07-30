import * as Sentry from "@sentry/nextjs";
import { getSentryDsn } from "@/lib/sentry/config";
import { shouldDropCredentialTelemetry } from "@/lib/security/credential-route-privacy";

const dsn = getSentryDsn();

if (dsn) {
  Sentry.init({
    dsn,
    beforeSend(event) {
      return shouldDropCredentialTelemetry({
        url: event.request?.url,
        transaction: event.transaction
      })
        ? null
        : event;
    },
    beforeSendTransaction(event) {
      return shouldDropCredentialTelemetry({
        url: event.request?.url,
        transaction: event.transaction
      })
        ? null
        : event;
    },
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1
  });
}
