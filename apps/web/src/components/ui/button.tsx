import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-[transform,background-color,color,box-shadow] outline-none focus-visible:ring-4 focus-visible:ring-[#5cc18d]/35 disabled:pointer-events-none disabled:opacity-40 active:translate-y-px",
  { variants: { variant: { default: "bg-[#18312f] text-white hover:bg-[#244945]", secondary: "bg-[#e1efe9] text-[#176b65] hover:bg-[#d1e7de]", outline: "border border-[#d9d1c2] bg-white hover:bg-[#fbf7ee]", ghost: "bg-transparent hover:bg-[#e1efe9]" }, size: { default: "h-11 px-5", sm: "h-9 px-4", icon: "size-11" } }, defaultVariants: { variant: "default", size: "default" } },
);

export function Button({ className, variant, size, asChild = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" data-variant={variant ?? "default"} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
