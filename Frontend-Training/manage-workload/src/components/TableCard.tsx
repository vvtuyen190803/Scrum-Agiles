import type { ReactNode } from "react";

type TableCardProps = {
  children: ReactNode;
  className?: string;
};

export default function TableCard({ children, className = "" }: TableCardProps) {
  return (
    <section
      className={`overflow-hidden rounded-[12px] border border-[var(--border)] bg-white [[data-theme=dark]_&]:bg-[var(--card)] ${className}`}
    >
      {children}
    </section>
  );
}
