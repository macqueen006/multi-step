"use client";
import { cn } from "@/utils/utility";
import { useId } from "react";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  type?: string;
  error?: string;
  id?: string;
  placeholder?: string;
}

export const Input = ({
  label,
  type = "text",
  error,
  id,
  className,
  placeholder,
  ...props
}: InputProps) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div>
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-xs font-medium mb-2 dark:text-white"
        >
          {label}
        </label>
        <input
          type={type}
          id={inputId}
          className={cn(
            // Base styles
            "py-2.5 sm:py-3 px-4 block w-full rounded-lg sm:text-sm border focus:ring-1 placeholder:text-sm",
            "disabled:opacity-50 disabled:pointer-events-none",
            "dark:bg-neutral-900 dark:text-neutral-400 dark:placeholder-neutral-500",
            // Conditional styles
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:focus:ring-neutral-600",
            // Custom className (will override conflicting classes thanks to twMerge)
            className
          )}
          placeholder={placeholder}
          {...props}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
};
