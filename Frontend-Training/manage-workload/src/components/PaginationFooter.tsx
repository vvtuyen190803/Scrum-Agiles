import { Button, Select } from "antd";

type PaginationFooterProps = {
  totalResults: number;
  pageSize: number;
  pageSizeOptions: number[];
  currentPage: number;
  totalPages: number;
  onPageSizeChange: (size: number) => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function PaginationFooter({
  totalResults,
  pageSize,
  pageSizeOptions,
  currentPage,
  totalPages,
  onPageSizeChange,
  onPrev,
  onNext,
}: PaginationFooterProps) {
  const start = totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = totalResults === 0 ? 0 : Math.min(currentPage * pageSize, totalResults);

  return (
    <div className="mt-3.5 flex items-center justify-between text-[0.9rem] text-[#64748b] [[data-theme=dark]_&]:text-[var(--muted)] max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-3">
      <div className="flex items-center gap-2.5">
        <span>Hiển thị</span>
        <Select
          value={pageSize}
          onChange={onPageSizeChange}
          options={pageSizeOptions.map((size) => ({ value: size, label: String(size) }))}
          className="min-w-[80px]"
          size="small"
        />
        <span>/ {totalResults} kết quả</span>
      </div>
      <div className="flex items-center gap-2.5">
        <span>
          {start}-{end} của {totalResults}
        </span>
        <div className="inline-flex gap-1.5">
          <Button
            type="default"
            size="small"
            aria-label="Trang trước"
            disabled={currentPage === 1}
            onClick={onPrev}
            className="grid h-7 w-7 place-items-center rounded-[8px] border border-[#e2e8f0] bg-white text-[#64748b] disabled:cursor-not-allowed disabled:opacity-50 [[data-theme=dark]_&]:bg-[var(--surface)] [[data-theme=dark]_&]:border-[var(--border)] [[data-theme=dark]_&]:text-[var(--muted)]"
          >
            ‹
          </Button>
          <Button
            type="default"
            size="small"
            aria-label="Trang sau"
            disabled={currentPage === totalPages}
            onClick={onNext}
            className="grid h-7 w-7 place-items-center rounded-[8px] border border-[#e2e8f0] bg-white text-[#64748b] disabled:cursor-not-allowed disabled:opacity-50 [[data-theme=dark]_&]:bg-[var(--surface)] [[data-theme=dark]_&]:border-[var(--border)] [[data-theme=dark]_&]:text-[var(--muted)]"
          >
            ›
          </Button>
        </div>
      </div>
    </div>
  );
}
