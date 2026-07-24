"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title,
  description,
  retryLabel,
  onRetry,
  className
}: ErrorStateProps) {
  return (
    <Alert variant="destructive" className={cn("cp-error-state", className)}>
      <AlertCircle aria-hidden />
      <AlertTitle>{title}</AlertTitle>
      {description ? <AlertDescription>{description}</AlertDescription> : null}
      {onRetry && retryLabel ? (
        <div className="col-start-2 mt-3">
          <Button type="button" variant="outline" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      ) : null}
    </Alert>
  );
}
