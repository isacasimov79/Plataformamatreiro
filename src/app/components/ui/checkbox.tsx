"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import { cn } from "./utils";

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border rounded-[4px] shadow-xs transition-shadow outline-none focus-visible:ring-[3px]",
        "size-4 shrink-0",
        "bg-white dark:bg-[#1a1a2e]",
        "border-[#e5e7eb] dark:border-[#3a3a5e]",
        "focus-visible:border-[#834a8b] focus-visible:ring-[#834a8b]/50",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "data-[state=checked]:bg-[#834a8b] data-[state=checked]:border-[#834a8b] data-[state=checked]:text-white",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="flex items-center justify-center text-current transition-none">
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
