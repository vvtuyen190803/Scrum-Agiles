import type { ChangeEvent } from "react";
import { Input } from "antd";

type SearchFieldProps = {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
};

export default function SearchField({
  value,
  onChange,
  placeholder,
}: SearchFieldProps) {
  return (
    <div className="rounded-[10px] border border-[var(--border)] bg-[#f8fafc] px-2.5 py-1.5 focus-within:border-[#a5b4fc] focus-within:outline focus-within:outline-2 focus-within:outline-[rgba(79,70,229,0.2)] [[data-theme=dark]_&]:bg-[#0b1120]">
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="border-none bg-transparent text-[var(--text)] shadow-none"
        prefix={
          <svg
            viewBox="0 0 24 24"
            className="h-[18px] w-[18px] text-[#64748b]"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
        }
      />
    </div>
  );
}
