import Image from "next/image";

type BrandLinkProps = {
  href?: string;
  className?: string;
};

export function BrandLink({ href = "/", className }: BrandLinkProps) {
  return (
    <a
      href={href}
      className={className ? `brand ${className}` : "brand"}
      aria-label="CostaPulse home"
    >
      <Image
        src="/brand/costapulse-mark.svg"
        alt=""
        width={48}
        height={48}
        priority
        className="brand-mark"
      />
      <span className="brand-copy">
        <span className="brand-name">
          Costa<span>Pulse</span>
        </span>
        <span className="brand-tagline">Experiences on the Costa Blanca</span>
      </span>
    </a>
  );
}
