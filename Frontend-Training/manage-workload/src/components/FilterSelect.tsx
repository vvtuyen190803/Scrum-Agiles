type FilterOption = {
  value: string;
  label: string;
};

type FilterSelectProps = {
  id: string;
  label: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
};

import { Select } from "antd";

export default function FilterSelect({
  id,
  label,
  isOpen,
  onOpenChange,
  options,
  selectedValue,
  onSelect,
}: FilterSelectProps) {
  return (
    <div className="relative flex w-full max-w-[220px] items-center gap-2.5 rounded-[10px] border border-[var(--border)] bg-[#f8fafc] px-3 py-2.5 focus-within:border-[#a5b4fc] focus-within:outline focus-within:outline-2 focus-within:outline-[rgba(79,70,229,0.2)] [[data-theme=dark]_&]:bg-[#0b1120]">
      <span
        className="inline-flex h-[18px] w-[18px] items-center justify-center text-[#64748b]"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-[18px] w-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 5h16l-6 7v6l-4 2v-8z" />
        </svg>
      </span>
      <Select
        id={id}
        value={selectedValue}
        onChange={onSelect}
        open={isOpen}
        onDropdownVisibleChange={onOpenChange}
        options={options}
        className="w-full"
        bordered={false}
        placeholder={label}
      />
    </div>
  );
}
