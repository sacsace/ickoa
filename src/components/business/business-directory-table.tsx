"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { MapPin, Phone, Globe, Mail, ExternalLink, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { deleteOwnedBusiness } from "@/actions/business";

export type BusinessListItem = {
  id: string;
  name: string;
  nameEn: string | null;
  category: string;
  products: string | null;
  region: string;
  address: string;
  phone: string | null;
  website: string | null;
  parentCompany: string | null;
  ceoName: string | null;
  ceoTitle: string | null;
  contactName: string | null;
  contactTitle: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  mapsUrl: string | null;
  description: string | null;
  ownerId: string | null;
  hideParentCompany: boolean;
  hideCeo: boolean;
  hideContactPerson: boolean;
  hideContactPhone: boolean;
  hideContactEmail: boolean;
  hideWebsite: boolean;
  hideAddress: boolean;
  hideMapsUrl: boolean;
};

function publicValue(
  value: string | null | undefined,
  hidden: boolean,
  canSeePrivate: boolean,
  empty = "—",
) {
  if (!value?.trim()) return empty;
  if (hidden && !canSeePrivate) return "비공개";
  return value;
}

function websiteHref(website: string) {
  return `https://${website.replace(/^https?:\/\//, "")}`;
}

function websiteLabel(website: string) {
  return website.replace(/^https?:\/\//, "");
}

function BusinessDetailDialog({
  business,
  open,
  isOwner,
  onClose,
  onDelete,
  deleting,
}: {
  business: BusinessListItem | null;
  open: boolean;
  isOwner: boolean;
  onClose: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !business) return null;

  const canSee = isOwner;
  const phoneRaw = business.contactPhone || business.phone;
  const phone = publicValue(phoneRaw, business.hideContactPhone, canSee, "");
  const email = publicValue(business.contactEmail, business.hideContactEmail, canSee, "");
  const website = publicValue(business.website, business.hideWebsite, canSee, "");
  const address = publicValue(business.address, business.hideAddress, canSee);
  const mapsUrl =
    business.hideMapsUrl && !canSee ? null : business.mapsUrl;
  const rows: { label: string; value: string }[] = [
    { label: "영문 법인명", value: business.nameEn?.trim() || "—" },
    { label: "업태", value: business.category },
    { label: "취급 품목", value: business.products?.trim() || "—" },
    {
      label: "본사(모기업)",
      value: publicValue(business.parentCompany, business.hideParentCompany, canSee),
    },
    {
      label: "대표",
      value: publicValue(
        [business.ceoName, business.ceoTitle].filter(Boolean).join(" · ") || null,
        business.hideCeo,
        canSee,
      ),
    },
    {
      label: "실무자",
      value: publicValue(
        [business.contactName, business.contactTitle].filter(Boolean).join(" · ") || null,
        business.hideContactPerson,
        canSee,
      ),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="business-detail-title"
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-border bg-background p-7 shadow-lg md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label="닫기"
        >
          <X className="h-5 w-5" />
        </button>

        <span className="inline-block rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {business.category}
        </span>
        <h2 id="business-detail-title" className="mt-2 pr-8 text-lg font-semibold text-foreground">
          {business.name}
        </h2>
        {business.nameEn ? (
          <p className="mt-1 text-sm text-muted-foreground">{business.nameEn}</p>
        ) : null}

        <dl className="mt-5 grid gap-2 text-sm">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[6.5rem_1fr] gap-2 border-b border-border pb-2"
            >
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="font-medium text-foreground break-words">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 space-y-3 border border-border bg-card p-4 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>{address}</span>
          </div>
          {phone && phone !== "비공개" ? (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
              <a href={`tel:${phone}`} className="hover:underline">
                {phone}
              </a>
            </div>
          ) : phone === "비공개" ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" />
              비공개
            </div>
          ) : null}
          {email && email !== "비공개" ? (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
              <a href={`mailto:${email}`} className="break-all hover:underline">
                {email}
              </a>
            </div>
          ) : email === "비공개" ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              비공개
            </div>
          ) : null}
          {website && website !== "비공개" ? (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
              <a
                href={websiteHref(website)}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all underline-offset-2 hover:underline"
              >
                {websiteLabel(website)}
              </a>
            </div>
          ) : website === "비공개" ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4 shrink-0" />
              비공개
            </div>
          ) : null}
          {mapsUrl ? (
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand underline-offset-2 hover:underline"
              >
                구글맵에서 위치 보기
              </a>
            </div>
          ) : business.hideMapsUrl && !canSee ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <ExternalLink className="h-4 w-4 shrink-0" />
              구글맵 비공개
            </div>
          ) : null}
          {isOwner ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5 shrink-0" />
              본인 등록 기업 · 비공개 항목도 확인할 수 있습니다
            </div>
          ) : null}
        </div>

        {business.description ? (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {business.description}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          {isOwner ? (
            <>
              <Link href={`/business/${business.id}/edit`}>
                <Button type="button" size="sm" variant="outline">
                  수정
                </Button>
              </Link>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                disabled={deleting}
                onClick={onDelete}
              >
                삭제
              </Button>
            </>
          ) : null}
          <Button ref={closeRef} type="button" size="sm" variant="outline" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}

export function BusinessDirectoryTable({
  businesses,
  currentUserId,
  manageAll = false,
}: {
  businesses: BusinessListItem[];
  currentUserId?: string | null;
  manageAll?: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<BusinessListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BusinessListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <table className="w-full table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[10%]" />
          <col className="w-[22%]" />
          <col className="w-[28%]" />
          <col className="w-[12%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
            <th className="px-4 py-2.5 font-medium md:px-5">업태</th>
            <th className="px-3 py-2.5 font-medium">기업명</th>
            <th className="px-3 py-2.5 font-medium">주소</th>
            <th className="px-3 py-2.5 font-medium">지역</th>
            <th className="px-3 py-2.5 font-medium">전화</th>
            <th className="px-3 py-2.5 font-medium md:pr-5">웹사이트</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {businesses.map((biz) => {
            const canSee =
              manageAll ||
              (!!currentUserId && biz.ownerId === currentUserId);
            const phone = publicValue(
              biz.contactPhone || biz.phone,
              biz.hideContactPhone,
              canSee,
            );
            const address = publicValue(biz.address, biz.hideAddress, canSee);
            const website = publicValue(biz.website, biz.hideWebsite, canSee);
            return (
              <tr
                key={biz.id}
                className="cursor-pointer hover:bg-muted/30"
                onClick={() => setSelected(biz)}
              >
                <td className="px-4 py-3 md:px-5">
                  <span className="inline-block max-w-full truncate rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {biz.category}
                  </span>
                </td>
                <td className="truncate px-3 py-3 font-semibold text-foreground" title={biz.name}>
                  {biz.name}
                </td>
                <td className="truncate px-3 py-3 text-muted-foreground" title={address}>
                  {address}
                </td>
                <td className="truncate px-3 py-3 text-muted-foreground" title={biz.region}>
                  {biz.region}
                </td>
                <td className="truncate px-3 py-3 text-muted-foreground">
                  {phone !== "—" && phone !== "비공개" ? (
                    <a
                      href={`tel:${phone}`}
                      className="hover:text-foreground hover:underline"
                      title={phone}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {phone}
                    </a>
                  ) : (
                    phone
                  )}
                </td>
                <td className="truncate px-3 py-3 md:pr-5">
                  {website !== "—" && website !== "비공개" ? (
                    <a
                      href={websiteHref(website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline-offset-2 hover:underline"
                      title={websiteLabel(website)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {websiteLabel(website)}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">{website}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <BusinessDetailDialog
        business={selected}
        open={selected !== null}
        isOwner={
          manageAll ||
          (!!currentUserId && selected?.ownerId === currentUserId)
        }
        onClose={() => setSelected(null)}
        deleting={isPending}
        onDelete={() => {
          if (!selected) return;
          setDeleteTarget(selected);
        }}
      />

      <AdminConfirmDialog
        open={deleteTarget !== null}
        title="기업 삭제"
        description={
          deleteTarget
            ? `「${deleteTarget.name}」을(를) 디렉토리에서 삭제합니다. 삭제 후 복구할 수 없습니다.`
            : ""
        }
        confirmLabel="삭제"
        destructive
        loading={isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          const id = deleteTarget.id;
          startTransition(async () => {
            await deleteOwnedBusiness(id);
            setDeleteTarget(null);
            setSelected(null);
            router.refresh();
          });
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
