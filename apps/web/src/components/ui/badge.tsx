import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.ComponentProps<"span"> & { variant?: "default" | "secondary" };

export function Badge({ className, variant = "default", ...props }: BadgeProps) { return <span data-slot="badge" data-variant={variant} className={cn("inline-flex items-center rounded-full bg-[#e1efe9] px-3 py-2 text-xs font-bold text-[#176b65]", className)} {...props} /> }
