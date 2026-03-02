import type { ReactNode } from "react";

type IconButtonVariant = "default" | "danger" | "success";

type IconButtonProps = {
  ariaLabel: string;
  onClick: () => void;
  children: ReactNode;
  variant?: IconButtonVariant;
  className?: string;
};

const variantClasses: Record<IconButtonVariant, string> = {
  default:
    "text-[#0f172a] hover:bg-[#f1f5ff] hover:text-[#4f46e5] [[data-theme=dark]_&]:text-[var(--text)] [[data-theme=dark]_&]:hover:bg-[var(--ring-track)] [[data-theme=dark]_&]:hover:text-[var(--nav-active-text)]",
  danger:
    "text-[#ef4444] hover:bg-[#fee2e2] hover:text-[#ef4444] [[data-theme=dark]_&]:text-[var(--text)] [[data-theme=dark]_&]:hover:bg-[var(--ring-track)] [[data-theme=dark]_&]:hover:text-[#f87171]",
  success:
    "text-[#22c55e] hover:bg-[#dcfce7] hover:text-[#22c55e] [[data-theme=dark]_&]:text-[var(--text)] [[data-theme=dark]_&]:hover:bg-[var(--ring-track)] [[data-theme=dark]_&]:hover:text-[#86efac]",
};

export default function IconButton({
  ariaLabel,
  onClick,
  children,
  variant = "default",
  className = "",
}: IconButtonProps) {
  return (
    <button
      className={`rounded-[8px] transition-colors ${variantClasses[variant]} ${className}`}
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
