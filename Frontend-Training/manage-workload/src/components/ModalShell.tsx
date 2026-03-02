import type { HTMLAttributes, ReactNode } from "react";

type ModalShellProps = {
  onClose: () => void;
  children: ReactNode;
  wrapperClassName?: string;
  contentClassName?: string;
  backdropClassName?: string;
  closeOnBackdrop?: boolean;
  contentProps?: HTMLAttributes<HTMLDivElement>;
};

export default function ModalShell({
  onClose,
  children,
  wrapperClassName = "z-50",
  contentClassName = "",
  backdropClassName = "",
  closeOnBackdrop = true,
  contentProps,
}: ModalShellProps) {
  return (
    <div className={`fixed inset-0 grid place-items-center p-6 ${wrapperClassName}`}>
      <div
        className={`absolute inset-0 bg-[rgba(15,23,42,0.55)] ${backdropClassName}`}
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div className={`relative z-[1] ${contentClassName}`} {...contentProps}>
        {children}
      </div>
    </div>
  );
}
