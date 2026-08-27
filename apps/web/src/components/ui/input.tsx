import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input type={type} data-slot="input" className={cn("h-11 w-full rounded-xl border border-[#d9d1c2] bg-white px-3 outline-none transition-shadow placeholder:text-[#7b8782] focus-visible:ring-4 focus-visible:ring-[#5cc18d]/25", className)} {...props} />;
}
