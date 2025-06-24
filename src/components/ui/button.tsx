"use client";
import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export function Button({ variant = "default", className = "", ...props }: Props) {
  const base = "px-4 py-2 rounded";
  const style =
    variant === "outline"
      ? "border border-gray-400 text-gray-700"
      : "bg-green-600 text-white";

  return <button {...props} className={`${base} ${style} ${className}`} />;
}
