import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        "container mx-auto w-[min(100%-1.25rem,76rem)] min-w-0 sm:w-[min(100%-2rem,76rem)]",
        className
      )}
    >
      {children}
    </div>
  );
}
