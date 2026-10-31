import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GuideDeleteButton } from "@/components/guide/guide-delete-button";
import { guideWriteLabel } from "@/data/guide";
import {
  isInterpreterCategory,
  parseInterpreterProfile,
} from "@/lib/interpreter-guide";
import { plainTextFromHtml } from "@/lib/sanitize-html";

export type GuideListItem = {
  id: string;
  category: string;
  region: string;
  title: string;
  content?: string | null;
  createdById?: string | null;
};

function truncateText(value: string, max = 48) {
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return "—";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function ManageCell({
  guide,
  canManage,
}: {
  guide: GuideListItem;
  canManage: boolean;
}) {
  if (!canManage) {
    return <span className="block text-center text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      <Link href={`/guide/${guide.id}/edit`}>
        <Button type="button" variant="outline" size="sm">
          수정
        </Button>
      </Link>
      <GuideDeleteButton
        guideId={guide.id}
        title={guide.title}
        category={guide.category}
      />
    </div>
  );
}

function InterpreterList({
  guides,
  currentUserId,
  manageAll = false,
  getRowNumber,
}: {
  guides: GuideListItem[];
  currentUserId?: string | null;
  manageAll?: boolean;
  getRowNumber: (index: number) => number;
}) {
  return (
    <div className="w-full min-w-0 overflow-x-auto border border-border bg-card">
      <table className="w-full min-w-[1100px] table-fixed border-collapse text-[13px] leading-snug">
        <colgroup>
          <col className="w-14" />
          <col className="w-[9%]" />
          <col className="w-14" />
          <col className="w-14" />
          <col className="w-[11%]" />
          <col className="w-[12%]" />
          <col className="w-[14%]" />
          <col className="w-[11%]" />
          <col />
          <col className="w-[120px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-3 py-3 text-center font-medium text-muted-foreground">
              번호
            </th>
            <th className="px-3 py-3 text-left font-medium text-muted-foreground">
              이름
            </th>
            <th className="px-3 py-3 text-center font-medium text-muted-foreground">
              나이
            </th>
            <th className="px-3 py-3 text-center font-medium text-muted-foreground">
              성별
            </th>
            <th className="px-3 py-3 text-left font-medium text-muted-foreground">
              통역 가능 지역
            </th>
            <th className="px-3 py-3 text-left font-medium text-muted-foreground">
              구사 언어
            </th>
            <th className="px-3 py-3 text-left font-medium text-muted-foreground">
              메일 주소
            </th>
            <th className="px-3 py-3 text-left font-medium text-muted-foreground">
              전화번호
            </th>
            <th className="px-3 py-3 text-left font-medium text-muted-foreground">
              특이사항
            </th>
            <th className="px-3 py-3 text-center font-medium text-muted-foreground">
              관리
            </th>
          </tr>
        </thead>
        <tbody>
          {guides.map((guide, index) => {
            const profile = parseInterpreterProfile({
              title: guide.title,
              content: guide.content ?? "",
              region: guide.region,
            });
            const canManage =
              manageAll ||
              (!!currentUserId &&
                !!guide.createdById &&
                guide.createdById === currentUserId);

            return (
              <tr
                key={guide.id}
                className="border-b border-border last:border-b-0 hover:bg-muted/30"
              >
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {getRowNumber(index)}
                </td>
                <td className="truncate px-3 py-3">
                  <Link
                    href={`/guide/${guide.id}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {profile.name || guide.title}
                  </Link>
                </td>
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {profile.age || "—"}
                </td>
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {profile.gender || "—"}
                </td>
                <td className="truncate px-3 py-3 text-muted-foreground">
                  {profile.region || guide.region || "—"}
                </td>
                <td className="truncate px-3 py-3 text-muted-foreground">
                  {profile.languages || "—"}
                </td>
                <td className="truncate px-3 py-3 text-muted-foreground">
                  {profile.email || "—"}
                </td>
                <td className="truncate px-3 py-3 text-muted-foreground">
                  {profile.phone || "—"}
                </td>
                <td className="truncate px-3 py-3 text-muted-foreground">
                  {truncateText(profile.notes, 80)}
                </td>
                <td className="px-3 py-3">
                  <ManageCell guide={guide} canManage={canManage} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GuideItemList({
  guides,
  currentUserId,
  manageAll = false,
  getRowNumber,
}: {
  guides: GuideListItem[];
  currentUserId?: string | null;
  manageAll?: boolean;
  getRowNumber: (index: number) => number;
}) {
  return (
    <div className="w-full min-w-0 overflow-x-auto border border-border bg-card">
      <table className="w-full min-w-[900px] table-fixed border-collapse text-[13px] leading-snug">
        <colgroup>
          <col className="w-14" />
          <col className="w-[22%]" />
          <col />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[120px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-3 py-3 text-center font-medium text-muted-foreground">
              번호
            </th>
            <th className="px-3 py-3 text-left font-medium text-muted-foreground">
              제목
            </th>
            <th className="px-3 py-3 text-left font-medium text-muted-foreground">
              내용 요약
            </th>
            <th className="px-3 py-3 text-left font-medium text-muted-foreground">
              지역
            </th>
            <th className="px-3 py-3 text-center font-medium text-muted-foreground">
              분류
            </th>
            <th className="px-3 py-3 text-center font-medium text-muted-foreground">
              관리
            </th>
          </tr>
        </thead>
        <tbody>
          {guides.map((guide, index) => {
            const canManage =
              manageAll ||
              (!!currentUserId &&
                !!guide.createdById &&
                guide.createdById === currentUserId);
            const preview = truncateText(
              plainTextFromHtml(guide.content ?? ""),
              72,
            );

            return (
              <tr
                key={guide.id}
                className="border-b border-border last:border-b-0 hover:bg-muted/30"
              >
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {getRowNumber(index)}
                </td>
                <td className="truncate px-3 py-3">
                  <Link
                    href={`/guide/${guide.id}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {guide.title}
                  </Link>
                </td>
                <td className="truncate px-3 py-3 text-muted-foreground">
                  {preview}
                </td>
                <td className="truncate px-3 py-3 text-muted-foreground">
                  {guide.region}
                </td>
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {guideWriteLabel(guide.category)}
                </td>
                <td className="px-3 py-3">
                  <ManageCell guide={guide} canManage={canManage} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function GuideGrid({
  guides,
  currentUserId,
  manageAll = false,
  getRowNumber,
  emptyMessage = "등록된 가이드가 없습니다.",
  forceInterpreterLayout = false,
}: {
  guides: GuideListItem[];
  currentUserId?: string | null;
  manageAll?: boolean;
  getRowNumber?: (index: number) => number;
  emptyMessage?: string;
  forceInterpreterLayout?: boolean;
}) {
  if (guides.length === 0) {
    return (
      <p className="w-full rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  const resolveRowNumber =
    getRowNumber ?? ((index: number) => guides.length - index);

  const useInterpreter =
    forceInterpreterLayout ||
    guides.every((guide) => isInterpreterCategory(guide.category));

  if (useInterpreter) {
    return (
      <InterpreterList
        guides={guides}
        currentUserId={currentUserId}
        manageAll={manageAll}
        getRowNumber={resolveRowNumber}
      />
    );
  }

  return (
    <GuideItemList
      guides={guides}
      currentUserId={currentUserId}
      manageAll={manageAll}
      getRowNumber={resolveRowNumber}
    />
  );
}
