import type { ReactNode } from "react";
import { PublicAppShell } from "@/features/shell/public-app-shell";

export default async function BookLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  return <PublicAppShell>{children}</PublicAppShell>;
}
