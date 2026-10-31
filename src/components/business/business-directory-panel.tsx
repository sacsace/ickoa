"use client";

import Link from "next/link";
import { useCallback } from "react";
import {
  BusinessDirectoryTable,
  type BusinessListItem,
} from "@/components/business/business-directory-table";
import {
  GuideListControls,
  GuideListPaginationFooter,
  useGuideList,
} from "@/components/guide/guide-list-controls";

const BUSINESS_PAGE_SIZE = 20;

export function BusinessDirectoryPanel({
  businesses,
  currentUserId,
  manageAll = false,
  loggedIn,
  mineOnly = false,
}: {
  businesses: BusinessListItem[];
  currentUserId?: string | null;
  manageAll?: boolean;
  loggedIn: boolean;
  mineOnly?: boolean;
}) {
  const getSearchText = useCallback((item: BusinessListItem) => item.id, []);
  const list = useGuideList(businesses, getSearchText, BUSINESS_PAGE_SIZE);

  return (
    <div className="mt-8 w-full border border-border bg-card">
      <div className="border-b border-border px-4 py-3 md:px-5">
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
          showSearch={false}
          countLabel="곳"
        />
        {mineOnly ? (
          <p className="mt-2 text-xs text-muted-foreground">내 등록 기업만 표시 중</p>
        ) : null}
      </div>

      {list.visible.length === 0 ? (
        <div className="px-4 py-16 text-center md:px-5">
          <p className="text-sm text-muted-foreground">검색 결과가 없습니다.</p>
          {loggedIn ? (
            <Link
              href="/business/new"
              className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
            >
              이 기업을 직접 등록하기
            </Link>
          ) : (
            <Link
              href={`/login?callbackUrl=${encodeURIComponent("/business/new")}`}
              className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
            >
              로그인 후 등록하기
            </Link>
          )}
        </div>
      ) : (
        <>
          <BusinessDirectoryTable
            businesses={list.visible}
            currentUserId={currentUserId}
            manageAll={manageAll}
          />
          <div className="border-t border-border px-4 py-3 md:px-5">
            <GuideListPaginationFooter
              viewMode={list.viewMode}
              page={list.page}
              totalPages={list.totalPages}
              onPageChange={list.setPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
