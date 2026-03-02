import type { ReactNode } from "react";
import { Button } from "antd";

type PageHeaderProps = {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
};

export default function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon = "+",
}: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-6 max-[640px]:flex-col max-[640px]:items-start">
      <div>
        <h2 className="mb-1 text-[1.8rem] font-semibold">{title}</h2>
        <p className="m-0 text-[1rem] text-[var(--muted)]">{subtitle}</p>
      </div>
      {actionLabel && onAction && (
        <Button
          className="inline-flex items-center gap-2 rounded-[10px] bg-[var(--primary)] px-4 py-2.5 font-semibold text-white shadow-[0_10px_20px_rgba(79,70,229,0.25)]"
          type="primary"
          onClick={onAction}
        >
          <span className="text-[1.1rem] leading-none">{actionIcon}</span>
          {actionLabel}
        </Button>
      )}
    </header>
  );
}
