import Link from "next/link";
import { cn } from "@/lib/utils";

export function PortalBox({
  title,
  href,
  moreLabel = "더보기",
  children,
  className,
  bodyClassName,
}: {
  title: string;
  href?: string;
  moreLabel?: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("portal-box flex flex-col overflow-hidden", className)}>
      <div className="portal-box-title shrink-0">
        <h2>{title}</h2>
        {href ? (
          <Link href={href} className="portal-more">
            {moreLabel}
          </Link>
        ) : null}
      </div>
      <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </section>
  );
}
