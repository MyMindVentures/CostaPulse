import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  label: string;
  className?: string;
  rows?: number;
};

export function LoadingState({
  label,
  className,
  rows = 3
}: LoadingStateProps) {
  return (
    <div
      className={cn("cp-loading-state", className)}
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }, (_, index) => (
          <Skeleton
            key={index}
            className={index === 0 ? "h-8 w-2/3" : "h-4 w-full"}
          />
        ))}
      </div>
    </div>
  );
}
