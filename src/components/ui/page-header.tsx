import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  backHref = "/",
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
}) {
  return (
    <div className="border-b border-border bg-white">
      <div className="mx-auto max-w-[1356px] px-4 py-6 md:py-8">
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {"\ud648"}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight md:text-[28px]">{title}</h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-[14px] text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
