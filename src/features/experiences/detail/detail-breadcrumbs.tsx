import Link from "next/link";

type DetailBreadcrumbsProps = {
  title: string;
};

export function DetailBreadcrumbs({ title }: DetailBreadcrumbsProps) {
  return (
    <nav className="xp-breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/experiences">Experiences</Link>
        </li>
        <li aria-current="page">{title}</li>
      </ol>
    </nav>
  );
}
