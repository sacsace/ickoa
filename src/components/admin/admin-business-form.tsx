"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { createBusiness, updateBusiness } from "@/actions/admin";

type Initial = {
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
  lat: number | null;
  lng: number | null;
  description: string | null;
};

export function AdminBusinessForm({
  initial,
  categories,
}: {
  initial?: Initial;
  categories: string[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
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
    contactPhone: initial?.contactPhone ?? initial?.phone ?? "",
    contactEmail: initial?.contactEmail ?? "",
    website: initial?.website ?? "",
    mapsUrl: initial?.mapsUrl ?? "",
    lat: initial?.lat != null ? String(initial.lat) : "",
    lng: initial?.lng != null ? String(initial.lng) : "",
    description: initial?.description ?? "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        if (initial) {
          await updateBusiness(initial.id, form);
        } else {
          await createBusiness(form);
        }
        router.push("/admin/businesses");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
      }
    });
  }

  return (
    <>
      <AdminPageHeader
        title={initial ? "기업 수정" : "기업 등록"}
        subtitle={initial ? "디렉토리 정보를 수정합니다" : "한인 기업을 디렉토리에 추가합니다"}
      />
      <AdminBackLink href="/admin/businesses" />

      <form onSubmit={handleSubmit} className="space-y-4 border border-border p-4">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">한글 법인명 *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">영문 법인명</label>
            <input
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">업태 *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="h-11 w-full border border-border bg-background px-3 text-sm"
              required
            >
              {categories.length === 0 ? <option value="">업태를 먼저 등록하세요</option> : null}
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
            <label className="mb-1 block text-xs text-muted-foreground">취급 품목</label>
            <input
              value={form.products}
              onChange={(e) => setForm({ ...form, products: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">한국 본사명(모기업명)</label>
          <input
            value={form.parentCompany}
            onChange={(e) => setForm({ ...form, parentCompany: e.target.value })}
            className="h-11 w-full border border-border bg-background px-4 text-sm"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">대표 성함</label>
            <input
              value={form.ceoName}
              onChange={(e) => setForm({ ...form, ceoName: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">대표 직급</label>
            <input
              value={form.ceoTitle}
              onChange={(e) => setForm({ ...form, ceoTitle: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">실무자 성함</label>
            <input
              value={form.contactName}
              onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">실무자 직급</label>
            <input
              value={form.contactTitle}
              onChange={(e) => setForm({ ...form, contactTitle: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">실무자 연락처</label>
            <input
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">실무자 Email</label>
            <input
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Website</label>
            <input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
              placeholder="example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">지역</label>
            <input
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
              placeholder="Chennai"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">주소 *</label>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="h-11 w-full border border-border bg-background px-4 text-sm"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">구글 맵 링크</label>
          <input
            value={form.mapsUrl}
            onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })}
            className="h-11 w-full border border-border bg-background px-4 text-sm"
            placeholder="https://maps.google.com/..."
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">위도 (지도)</label>
            <input
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
              inputMode="decimal"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">경도 (지도)</label>
            <input
              value={form.lng}
              onChange={(e) => setForm({ ...form, lng: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
              inputMode="decimal"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">소개</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full border border-border bg-background px-4 py-3 text-sm"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => router.push("/admin/businesses")}>
            취소
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "저장 중..." : "저장"}
          </Button>
        </div>
      </form>
    </>
  );
}
