"use client";
import { SelectHTMLAttributes } from "react";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="border px-3 py-2 rounded w-full" />;
}
