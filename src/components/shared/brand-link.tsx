type BrandLinkProps = {
  href?: string;
  className?: string;
};

export function BrandLink({ href = "/", className }: BrandLinkProps) {
  return (
    <a href={href} className={className ? `brand ${className}` : "brand"}>
      Costa<span>Pulse</span>
    </a>
  );
}
