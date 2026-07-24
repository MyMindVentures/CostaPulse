import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
  children?: ReactNode;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  className,
  children
}: EmptyStateProps) {
  return (
    <div className={cn("cp-empty-state", className)} role="status">
      <h2 className="cp-empty-state-title">{title}</h2>
      {description ? (
        <p className="cp-empty-state-copy">{description}</p>
      ) : null}
      {actionLabel && actionHref ? (
        <a href={actionHref} className="button button-coral">
          {actionLabel}
        </a>
      ) : null}
      {children}
    </div>
  );
}
