import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CaretDown, CaretUp, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return <SelectPrimitive.Trigger data-slot="select-trigger" className={cn("flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-transparent bg-transparent text-left font-bold outline-none transition focus-visible:ring-4 focus-visible:ring-[#5cc18d]/25 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>{children}<SelectPrimitive.Icon asChild><CaretDown className="size-4 shrink-0 opacity-70" weight="bold" /></SelectPrimitive.Icon></SelectPrimitive.Trigger>;
}

export function SelectContent({ className, children, position = "popper", ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return <SelectPrimitive.Portal><SelectPrimitive.Content data-slot="select-content" position={position} className={cn("z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-[#d9d1c2] bg-[#fffdf6] text-[#18312f] shadow-[0_18px_50px_rgba(24,49,47,.18)] data-[state=open]:animate-in data-[state=closed]:animate-out", position === "popper" && "translate-y-1", className)} {...props}>
    <SelectPrimitive.ScrollUpButton className="flex h-7 cursor-pointer items-center justify-center"><CaretUp className="size-4" weight="bold" /></SelectPrimitive.ScrollUpButton>
    <SelectPrimitive.Viewport className="p-1.5">{children}</SelectPrimitive.Viewport>
    <SelectPrimitive.ScrollDownButton className="flex h-7 cursor-pointer items-center justify-center"><CaretDown className="size-4" weight="bold" /></SelectPrimitive.ScrollDownButton>
  </SelectPrimitive.Content></SelectPrimitive.Portal>;
}

export function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return <SelectPrimitive.Item data-slot="select-item" className={cn("relative flex w-full cursor-pointer select-none items-center rounded-lg py-2.5 pr-8 pl-3 text-sm outline-none data-[disabled]:cursor-not-allowed data-[highlighted]:bg-[#e1efe9] data-[highlighted]:text-[#176b65] data-[state=checked]:font-bold", className)} {...props}>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <span className="absolute right-2.5 flex size-4 items-center justify-center"><SelectPrimitive.ItemIndicator><Check className="size-4 text-[#176b65]" weight="bold" /></SelectPrimitive.ItemIndicator></span>
  </SelectPrimitive.Item>;
}
