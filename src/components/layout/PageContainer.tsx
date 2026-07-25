import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  size?: "default" | "wide";
  /** Extra vertical rhythm around the content block. */
  spacing?: "none" | "default" | "comfortable";
};

/**
 * Consistent content wrapper: max-width, horizontal padding, vertical spacing.
 * Composes the shared Container primitive so width systems stay aligned.
 */
export function PageContainer({
  children,
  className,
  size = "default",
  spacing = "default"
}: PageContainerProps) {
  return (
    <Container
      className={cn(
        "relative z-1 py-10",
        size === "wide" && "w-[min(100%-2rem,90rem)]",
        spacing === "none" && "py-0",
        spacing === "comfortable" && "py-16",
        className
      )}
    >
      {children}
    </Container>
  );
}
