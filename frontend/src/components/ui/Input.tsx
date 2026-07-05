import type { InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className,
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}

      <input
        className={cn(
          "w-full rounded-2xl",
          "border border-slate-700",
          "bg-slate-900",
          "px-4 py-3",
          "text-white",
          "placeholder:text-slate-500",
          "transition-all duration-300",
          "focus:border-blue-500",
          "focus:ring-2 focus:ring-blue-500/30",
          className
        )}
        {...props}
      />

      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}