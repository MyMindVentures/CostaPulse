import type { ReactNode } from "react";

type SectionKickerProps = {
  children: ReactNode;
  light?: boolean;
};

export function SectionKicker({ children, light = false }: SectionKickerProps) {
  return (
    <p className={light ? "section-kicker light" : "section-kicker"}>
      {children}
    </p>
  );
}
