"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { submitBusiness, updateOwnedBusiness } from "@/actions/business";
import { Button } from "@/components/ui/button";
import { FieldPrivacyLabel } from "@/components/business/field-privacy-label";

const fieldClass =
  "h-11 w-full border border-border bg-background px-4 text-sm outline-none focus:border-foreground/30";

export type BusinessFormInitial = {
  id: string;
  name: string;
  nameEn: string | null;
  category: string;
  products: string | null;
  region: string;
  address: string;
  parentCompany: string | null;
  ceoName: string | null;
  ceoTitle: string | null;
  contactName: string | null;
  contactTitle: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  website: string | null;
  mapsUrl: string | null;
  hideParentCompany?: boolean;
  hideCeo?: boolean;
  hideContactPerson?: boolean;
  hideContactPhone?: boolean;
  hideContactEmail?: boolean;
  hideWebsite?: boolean;
  hideAddress?: boolean;
  hideMapsUrl?: boolean;
};

export function BusinessRegisterForm({
  categories,
  initial,
}: {
  categories: string[];
  initial?: BusinessFormInitial;
}) {
  const router = useRouter();
  const isEdit = !!initial;
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(isEdit);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    nameEn: initial?.nameEn ?? "",
    category: initial?.category ?? categories[0] ?? "",
    products: initial?.products ?? "",
    region: initial?.region ?? "Chennai",
    address: initial?.address ?? "",
    parentCompany: initial?.parentCompany ?? "",
    ceoName: initial?.ceoName ?? "",
    ceoTitle: initial?.ceoTitle ?? "",
    contactName: initial?.contactName ?? "",
    contactTitle: initial?.contactTitle ?? "",
    contactPhone: initial?.contactPhone ?? "",
    contactEmail: initial?.contactEmail ?? "",
    website: initial?.website ?? "",
    mapsUrl: initial?.mapsUrl ?? "",
    hideParentCompany: initial?.hideParentCompany ?? false,
    hideCeo: initial?.hideCeo ?? false,
    hideContactPerson: initial?.hideContactPerson ?? false,
    hideContactPhone: initial?.hideContactPhone ?? false,
    hideContactEmail: initial?.hideContactEmail ?? false,
    hideWebsite: initial?.hideWebsite ?? false,
    hideAddress: initial?.hideAddress ?? false,
    hideMapsUrl: initial?.hideMapsUrl ?? false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-4 border border-border bg-card p-5 md:p-6" aria-hidden>
        <div className="h-20 animate-pulse bg-muted" />
        <div className="h-11 animate-pulse bg-muted" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-11 animate-pulse bg-muted" />
          <div className="h-11 animate-pulse bg-muted" />
        </div>
        <div className="h-11 animate-pulse bg-muted" />
        <div className="h-11 animate-pulse bg-muted" />
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agreed) {
      setError("공개 안내를 확인하고 동의해 주세요.");
      return;
    }
    startTransition(async () => {
      try {
        if (isEdit && initial) {
          await updateOwnedBusiness(initial.id, form);
        } else {
          await submitBusiness(form);
        }
        router.push("/business");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-border bg-card p-5 md:p-6">
      <div className="space-y-2 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p className="font-medium">공개 안내</p>
        <p>
          {isEdit
            ? "수정한 내용도 한인 기업 디렉토리에 공개됩니다. 비공개로 표시한 항목은 다른 회원에게 보이지 않습니다."
            : "고객이 직접 등록하는 정보입니다. 등록하시면 한인 기업 디렉토리에"}
          {!isEdit ? (
            <>
              <span className="font-semibold"> 누구나 볼 수 있도록 공개</span>
              됩니다. 비공개로 표시한 항목은 공개되지 않습니다.
            </>
          ) : null}
        </p>
        <label className="mt-1 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1"
            suppressHydrationWarning
          />
          <span>
            {isEdit
              ? "공개 게시를 확인했으며, 수정 내용을 저장합니다."
              : "위 공개 안내를 확인했으며, 디렉토리 게시에 동의합니다."}
          </span>
        </label>
      </div>

      <p className="text-sm text-muted-foreground">
        * 필수 · 항목 옆 <span className="font-medium text-foreground">비공개</span> 체크 시
        해당 정보는 디렉토리·상세에 표시되지 않습니다.
      </p>
      {error ? (
        <p className="text-sm text-red-600">
          {error}{" "}
          <Link href="/business" className="underline hover:text-foreground">
            목록 보기
          </Link>
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldPrivacyLabel label="한글 법인명" required />
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={fieldClass}
            required
            autoComplete="off"
            suppressHydrationWarning
          />
        </div>
        <div>
          <FieldPrivacyLabel label="영문 법인명" />
          <input
            value={form.nameEn}
            onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
            className={fieldClass}
            autoComplete="off"
            suppressHydrationWarning
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldPrivacyLabel label="업태" required />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="h-11 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30"
            required
            suppressHydrationWarning
          >
            {categories.length === 0 ? (
              <option value="">등록된 업태가 없습니다</option>
            ) : null}
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            {form.category && !categories.includes(form.category) ? (
              <option value={form.category}>{form.category}</option>
            ) : null}
          </select>
        </div>
        <div>
          <FieldPrivacyLabel label="취급 품목" />
          <input
            value={form.products}
            onChange={(e) => setForm({ ...form, products: e.target.value })}
            className={fieldClass}
            autoComplete="off"
            suppressHydrationWarning
          />
        </div>
      </div>

      <div>
        <FieldPrivacyLabel
          label="한국 본사명(모기업명)"
          hide={form.hideParentCompany}
          onHideChange={(hideParentCompany) => setForm({ ...form, hideParentCompany })}
        />
        <input
          value={form.parentCompany}
          onChange={(e) => setForm({ ...form, parentCompany: e.target.value })}
          className={fieldClass}
          autoComplete="off"
          suppressHydrationWarning
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldPrivacyLabel
            label="대표 성함"
            hide={form.hideCeo}
            onHideChange={(hideCeo) => setForm({ ...form, hideCeo })}
          />
          <input
            value={form.ceoName}
            onChange={(e) => setForm({ ...form, ceoName: e.target.value })}
            className={fieldClass}
            autoComplete="off"
            suppressHydrationWarning
          />
        </div>
        <div>
          <FieldPrivacyLabel
            label="대표 직급"
            hide={form.hideCeo}
            onHideChange={(hideCeo) => setForm({ ...form, hideCeo })}
          />
          <input
            value={form.ceoTitle}
            onChange={(e) => setForm({ ...form, ceoTitle: e.target.value })}
            className={fieldClass}
            autoComplete="off"
            suppressHydrationWarning
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldPrivacyLabel
            label="실무자 성함"
            hide={form.hideContactPerson}
            onHideChange={(hideContactPerson) => setForm({ ...form, hideContactPerson })}
          />
          <input
            value={form.contactName}
            onChange={(e) => setForm({ ...form, contactName: e.target.value })}
            className={fieldClass}
            autoComplete="off"
            suppressHydrationWarning
          />
        </div>
        <div>
          <FieldPrivacyLabel
            label="실무자 직급"
            hide={form.hideContactPerson}
            onHideChange={(hideContactPerson) => setForm({ ...form, hideContactPerson })}
          />
          <input
            value={form.contactTitle}
            onChange={(e) => setForm({ ...form, contactTitle: e.target.value })}
            className={fieldClass}
            autoComplete="off"
            suppressHydrationWarning
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldPrivacyLabel
            label="실무자 연락처(휴대전화)"
            hide={form.hideContactPhone}
            onHideChange={(hideContactPhone) => setForm({ ...form, hideContactPhone })}
          />
          <input
            value={form.contactPhone}
            onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
            className={fieldClass}
            autoComplete="off"
            suppressHydrationWarning
          />
        </div>
        <div>
          <FieldPrivacyLabel
            label="실무자 Email"
            hide={form.hideContactEmail}
            onHideChange={(hideContactEmail) => setForm({ ...form, hideContactEmail })}
          />
          <input
            type="email"
            value={form.contactEmail}
            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            className={fieldClass}
            autoComplete="off"
            suppressHydrationWarning
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">연락처와 이메일 중 하나 이상 필수입니다.</p>

      <div>
        <FieldPrivacyLabel
          label="Website"
          hide={form.hideWebsite}
          onHideChange={(hideWebsite) => setForm({ ...form, hideWebsite })}
        />
        <input
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          className={fieldClass}
          placeholder="example.com"
          autoComplete="off"
          suppressHydrationWarning
        />
      </div>

      <div>
        <FieldPrivacyLabel
          label="주소"
          required
          hide={form.hideAddress}
          onHideChange={(hideAddress) => setForm({ ...form, hideAddress })}
        />
        <input
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className={fieldClass}
          required
          autoComplete="off"
          suppressHydrationWarning
        />
      </div>

      <div>
        <FieldPrivacyLabel
          label="구글 맵 링크"
          required
          hide={form.hideMapsUrl}
          onHideChange={(hideMapsUrl) => setForm({ ...form, hideMapsUrl })}
        />
        <input
          value={form.mapsUrl}
          onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })}
          className={fieldClass}
          placeholder="https://maps.google.com/..."
          required
          autoComplete="off"
          suppressHydrationWarning
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Google Maps에서 위치를 공유한 링크를 붙여 넣어 주세요.
        </p>
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={isPending || !agreed}>
          {isPending ? "저장 중..." : isEdit ? "수정 저장" : "기업 등록"}
        </Button>
        <Link
          href="/business"
          className="inline-flex h-10 items-center px-4 text-sm text-muted-foreground hover:text-foreground"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
