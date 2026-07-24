import Image from "next/image";
import { SITE_LOGO_FALLBACK_SRC } from "@/lib/media/experience-media";

type BrandLinkProps = {
  href?: string;
  className?: string;
  logoSrc?: string | null;
  logoAlt?: string;
};

export function BrandLink({
  href = "/",
  className,
  logoSrc,
  logoAlt = "CostaPulse"
}: BrandLinkProps) {
  const src = logoSrc?.trim() || SITE_LOGO_FALLBACK_SRC;

  return (
    <a
      href={href}
      className={className ? `brand ${className}` : "brand"}
      aria-label="CostaPulse home"
    >
      <Image
        src={src}
        alt={logoAlt}
        width={256}
        height={256}
        priority
        className="brand-logo"
      />
    </a>
  );
}
