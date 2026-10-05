import Link from "next/link";
import { Button } from "@/components/ui/button";

export function formatKoDate(date: Date | string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

export function formatKoDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function AdminWriteLink({
  href,
  label = "글쓰기",
}: {
  href: string;
  label?: string;
}) {
  return (
    <div className="mb-4 flex justify-end">
      <Link href={href}>
        <Button size="sm">{label}</Button>
      </Link>
    </div>
  );
}

export function AdminBackLink({ href }: { href: string }) {
  return (
    <div className="mb-4">
      <Link
        href={href}
        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
      >
        ← 목록으로
      </Link>
    </div>
  );
}

export function AdminEmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-12 text-center text-sm text-muted-foreground">
        {message}
      </td>
    </tr>
  );
}
