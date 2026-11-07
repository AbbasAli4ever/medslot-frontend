"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import { PAGE_SIZES, type PageSize } from "@/lib/types";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import { Dropdown } from "./ui/Dropdown";
import { Spinner } from "./ui/Spinner";

interface PaginationProps {
  page: number;
  totalPages: number;
  count: number;
  /** Rows on the page being shown. */
  shown: number;
  pageSize: PageSize;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
}

/** Desktop footer under the table, and a compact bar on phones. */
export function Pagination(props: PaginationProps) {
  if (props.count === 0) return null;
  return (
    <>
      <DesktopPagination {...props} />
      <MobilePagination {...props} />
    </>
  );
}

/** 1 … 4 5 6 … 12, always showing the first, last and the pages around the current one. */
export function pageItems(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const start = Math.max(2, Math.min(page - 1, totalPages - 4));
  const end = Math.min(totalPages - 1, Math.max(page + 1, 5));
  const items: (number | "gap")[] = [1];
  if (start > 2) items.push("gap");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < totalPages - 1) items.push("gap");
  items.push(totalPages);
  return items;
}

function range({ page, pageSize, shown, count }: PaginationProps) {
  const from = shown === 0 ? 0 : (page - 1) * pageSize + 1;
  return { from, to: Math.min(count, from + Math.max(shown, 1) - 1) };
}

function DesktopPagination(props: PaginationProps) {
  const { page, totalPages, count, pageSize, isLoading, onPageChange, onPageSizeChange } = props;
  const { from, to } = range(props);

  return (
    <nav
      aria-label="Pagination"
      className="hidden items-center justify-between gap-4 rounded-2xl border border-line bg-white px-4 py-2.5 text-sm md:flex"
    >
      <p className="flex items-center gap-2 text-muted tabular-nums" aria-live="polite">
        Showing <span className="font-medium text-ink">{from === to ? from : `${from}–${to}`}</span> of{" "}
        <span className="font-medium text-ink">{count}</span>
        {isLoading && <Spinner className="text-zinc-400" />}
      </p>

      <div className="flex items-center gap-1">
        <PageArrow label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeftIcon />
        </PageArrow>
        {pageItems(page, totalPages).map((item, i) =>
          item === "gap" ? (
            <span key={`gap-${i}`} className="w-6 text-center text-zinc-400" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Page ${item}`}
              aria-current={item === page ? "page" : undefined}
              onClick={() => onPageChange(item)}
              className={clsx(
                "relative grid h-8 min-w-8 place-items-center rounded-full px-2 text-[13px] font-medium tabular-nums transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600",
                item === page ? "text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-ink",
              )}
            >
              {item === page && (
                <motion.span
                  layoutId="page-indicator"
                  className="absolute inset-0 rounded-full bg-emerald-600"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <span className="relative">{item}</span>
            </button>
          ),
        )}
        <PageArrow label="Next page" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRightIcon />
        </PageArrow>
      </div>

      <div className="flex items-center gap-2 text-muted">
        <span id="page-size-label">Rows per page</span>
        <Dropdown
          id="page-size"
          label="Rows per page"
          value={pageSize}
          options={PAGE_SIZES.map((size) => ({ value: size, label: String(size) }))}
          onChange={onPageSizeChange}
          align="end"
          placement="top"
        />
      </div>
    </nav>
  );
}

/** Phones: Prev / "Page 2 of 4" / Next, with full 44px tap targets. Sits above the Book pill. */
function MobilePagination(props: PaginationProps) {
  const { page, totalPages, count, isLoading, onPageChange } = props;
  const { from, to } = range(props);
  if (totalPages <= 1) return null;

  function go(next: number) {
    onPageChange(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-2 md:hidden">
      <button type="button" disabled={page <= 1} onClick={() => go(page - 1)} className={mobileButton}>
        <ChevronLeftIcon />
        Prev
      </button>
      <p className="flex flex-col items-center text-center leading-tight tabular-nums" aria-live="polite">
        <span className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
          Page {page} of {totalPages}
          {isLoading && <Spinner className="text-zinc-400" />}
        </span>
        <span className="text-xs text-muted">
          {from === to ? from : `${from}–${to}`} of {count}
        </span>
      </p>
      <button type="button" disabled={page >= totalPages} onClick={() => go(page + 1)} className={mobileButton}>
        Next
        <ChevronRightIcon />
      </button>
    </nav>
  );
}

const mobileButton =
  "inline-flex h-11 items-center gap-1 rounded-full border border-line bg-white px-4 text-sm font-medium text-ink transition-colors active:bg-zinc-50 disabled:text-zinc-300";

function PageArrow({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-ink disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
