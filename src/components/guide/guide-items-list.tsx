"use client";

import { useCallback } from "react";
import { GuideGrid, type GuideListItem } from "@/components/guide/guide-grid";
import {
  GuideListControls,
  GuideListPaginationFooter,
  guideListRowNumber,
  useGuideList,
} from "@/components/guide/guide-list-controls";
import { AuthWriteLink } from "@/components/ui/auth-write-link";
import { isInterpreterCategory, parseInterpreterProfile } from "@/lib/interpreter-guide";
import { plainTextFromHtml } from "@/lib/sanitize-html";

export function GuideItemsList({
  guides,
  currentUserId,
  manageAll = false,
  writeHref,
  writeLabel,
  interpreterCategory = false,
}: {
  guides: GuideListItem[];
  currentUserId?: string | null;
  manageAll?: boolean;
  writeHref: string;
  writeLabel: string;
  interpreterCategory?: boolean;
}) {
  const getSearchText = useCallback(
    (item: GuideListItem) => {
      if (interpreterCategory || isInterpreterCategory(item.category)) {
        const profile = parseInterpreterProfile({
          title: item.title,
          content: item.content ?? "",
          region: item.region,
        });
        return [
          profile.name,
          profile.age,
          profile.gender,
          profile.region,
          profile.languages,
          profile.email,
          profile.phone,
          profile.notes,
          item.title,
          item.region,
        ].join(" ");
      }

      return [
        item.title,
        item.region,
        item.category,
        plainTextFromHtml(item.content ?? ""),
      ].join(" ");
    },
    [interpreterCategory],
  );

  const list = useGuideList(guides, getSearchText);

  return (
    <div className="w-full">
      <GuideListControls
        query={list.query}
        onQueryChange={list.setQuery}
        viewMode={list.viewMode}
        onViewModeChange={list.setViewMode}
        page={list.page}
        totalPages={list.totalPages}
        onPageChange={list.setPage}
        filteredCount={list.filteredCount}
        totalCount={list.totalCount}
        searchPlaceholder={
          interpreterCategory
            ? "이름, 지역, 언어, 메일, 전화번호 검색..."
            : "제목, 내용, 지역 검색..."
        }
        actions={
          <AuthWriteLink href={writeHref} label={`${writeLabel} 등록`} />
        }
      />

      <GuideGrid
        guides={list.visible}
        currentUserId={currentUserId}
        manageAll={manageAll}
        forceInterpreterLayout={interpreterCategory}
        emptyMessage={
          guides.length === 0
            ? "등록된 가이드가 없습니다."
            : "검색 결과가 없습니다."
        }
        getRowNumber={(index) =>
          guideListRowNumber(
            list.filteredCount,
            index,
            list.viewMode,
            list.page,
            list.pageSize,
          )
        }
      />

      <GuideListPaginationFooter
        viewMode={list.viewMode}
        page={list.page}
        totalPages={list.totalPages}
        onPageChange={list.setPage}
      />
    </div>
  );
}
