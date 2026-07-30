"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { getDefaultCredentialExpiry } from "@/lib/credentials/access-expiry";
import { createRecipientCredentialShareLinkAction } from "@/server/credentials/actions";

type Props = {
  maximumExpiry?: string | null;
  labels: {
    action: string;
    expiry: string;
    copied: string;
    shared: string;
    error: string;
  };
};

function toDateTimeLocal(value: string): string {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function ApplicationDocumentShare({
  labels,
  maximumExpiry = null
}: Props) {
  const maximumExpiryDate = maximumExpiry ? new Date(maximumExpiry) : null;
  const maximumExpiryTime =
    maximumExpiryDate && !Number.isNaN(maximumExpiryDate.getTime())
      ? maximumExpiryDate.getTime()
      : null;
  const [isPending, startTransition] = useTransition();
  const [expiry, setExpiry] = useState(() => {
    const defaultExpiry = new Date(getDefaultCredentialExpiry());
    const initialExpiry =
      maximumExpiryTime !== null && maximumExpiryTime < defaultExpiry.getTime()
        ? new Date(maximumExpiryTime)
        : defaultExpiry;
    return toDateTimeLocal(initialExpiry.toISOString());
  });
  const [status, setStatus] = useState("");

  function share() {
    startTransition(async () => {
      setStatus("");
      const parsedExpiry = expiry ? new Date(expiry) : null;
      if (!parsedExpiry || Number.isNaN(parsedExpiry.getTime())) {
        setStatus(labels.error);
        return;
      }
      const parsedExpiryTime = parsedExpiry.getTime();
      if (
        parsedExpiryTime <= Date.now() ||
        (maximumExpiryTime !== null && parsedExpiryTime > maximumExpiryTime)
      ) {
        setStatus(labels.error);
        return;
      }
      const result = await createRecipientCredentialShareLinkAction({
        expiresAt: parsedExpiry.toISOString()
      });

      if (!result.ok) {
        setStatus(labels.error);
        return;
      }

      try {
        if (navigator.share) {
          await navigator.share({ url: result.shareUrl });
          setStatus(labels.shared);
          return;
        }
        await navigator.clipboard.writeText(result.shareUrl);
        setStatus(labels.copied);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        try {
          await navigator.clipboard.writeText(result.shareUrl);
          setStatus(labels.copied);
        } catch {
          setStatus(labels.error);
        }
      }
    });
  }

  return (
    <div className="grid gap-2">
      <label className="text-muted grid gap-1 text-xs font-medium">
        {labels.expiry}
        <input
          type="datetime-local"
          value={expiry}
          max={
            maximumExpiryTime === null
              ? undefined
              : toDateTimeLocal(new Date(maximumExpiryTime).toISOString())
          }
          onChange={(event) => setExpiry(event.target.value)}
          className="border-border bg-card min-h-11 rounded-md border px-3 text-sm"
        />
      </label>
      <Button
        type="button"
        variant="outline"
        className="min-h-11"
        disabled={isPending}
        onClick={share}
      >
        {labels.action}
      </Button>
      <p aria-live="polite" className="text-muted min-h-5 text-xs">
        {status}
      </p>
    </div>
  );
}
