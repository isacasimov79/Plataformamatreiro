import * as React from "react";
import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none flex min-h-[4rem] w-full rounded-md border px-3 py-2 text-base outline-none transition-[color,box-shadow]",
        "bg-white dark:bg-[#1a1a2e] text-[#242545] dark:text-white",
        "border-[#e5e7eb] dark:border-[#3a3a5e]",
        "placeholder:text-[#9b9ba8] dark:placeholder:text-[#7C7EAA]",
        "focus-visible:ring-[3px] focus-visible:border-[#834a8b] focus-visible:ring-[#834a8b]/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
