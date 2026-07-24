import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PageBackgroundVariant = "default" | "ocean" | "warm" | "minimal";

type PageBackgroundProps = {
  variant?: PageBackgroundVariant;
  className?: string;
  children?: ReactNode;
};

/**
 * Shared page atmosphere. Stays behind content, avoids horizontal overflow,
 * and simplifies on small screens via CSS.
 */
export function PageBackground({
  variant = "default",
  className,
  children
}: PageBackgroundProps) {
  return (
    <div
      className={cn(
        "page-background",
        `page-background--${variant}`,
        className
      )}
      aria-hidden={children ? undefined : true}
    >
      <div className="page-background__glow page-background__glow--a" />
      <div className="page-background__glow page-background__glow--b" />
      {children}
    </div>
  );
}
