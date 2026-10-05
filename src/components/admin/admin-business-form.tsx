"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink } from "@/components/admin/admin-board-ui";
import { Button } from "@/components/ui/button";
import { createBusiness, updateBusiness } from "@/actions/admin";
import { businessCategories } from "@/data/mock";

type Initial = {
  id: string;
  name: string;
  category: string;
  region: string;
  address: string;
  phone: string | null;
  website: string | null;
  lat: number | null;
  lng: number | null;
  description: string | null;
};

export function AdminBusinessForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    category: initial?.category ?? businessCategories[0],
    region: initial?.region ?? "Chennai",
    address: initial?.address ?? "",
    phone: initial?.phone ?? "",
    website: initial?.website ?? "",
    lat: initial?.lat != null ? String(initial.lat) : "",
    lng: initial?.lng != null ? String(initial.lng) : "",
    description: initial?.description ?? "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      category: form.category,
      region: form.region,
      address: form.address,
      phone: form.phone,
      website: form.website,
      lat: form.lat,
      lng: form.lng,
      description: form.description,
    };
    startTransition(async () => {
      try {
        if (initial) {
          await updateBusiness(initial.id, payload);
          router.push("/admin/businesses");
        } else {
          await createBusiness(payload);
          router.push("/admin/businesses");
        }
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
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">기업명 *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="h-11 w-full border border-border bg-background px-4 text-sm"
            required
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">업종 *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="h-11 w-full border border-border bg-background px-3 text-sm"
            >
              {businessCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              {form.category &&
              !businessCategories.includes(form.category as (typeof businessCategories)[number]) ? (
                <option value={form.category}>{form.category}</option>
              ) : null}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">지역 *</label>
            <input
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
              placeholder="Chennai"
              required
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
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">전화</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">웹사이트</label>
            <input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="h-11 w-full border border-border bg-background px-4 text-sm"
              placeholder="example.com"
            />
          </div>
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
            rows={5}
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
