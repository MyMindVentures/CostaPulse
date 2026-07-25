import { Badge } from "@/components/ui/badge";

export function BookingStoryStatusBadge({
  status
}: {
  status: "eligible" | "draft" | "published" | "archived";
}) {
  const variant =
    status === "published"
      ? "default"
      : status === "archived"
        ? "outline"
        : "secondary";
  return <Badge variant={variant}>{status.replaceAll("_", " ")}</Badge>;
}
