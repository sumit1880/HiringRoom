import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
}

export default function Button({
  children,
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "flex w-full items-center justify-center",
        "rounded-2xl",
        "bg-blue-600",
        "px-5 py-3",
        "font-semibold",
        "text-white",
        "shadow-lg",
        "transition-all duration-300",
        "hover:scale-[1.02]",
        "hover:bg-blue-700",
        "active:scale-[0.98]",
        "disabled:cursor-not-allowed",
        "disabled:opacity-60",
        className
      )}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}