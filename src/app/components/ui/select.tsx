"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "./utils";

const filterFigmaProps = (props: Record<string, any>) => {
  return Object.fromEntries(Object.entries(props).filter(([key]) => !key.startsWith('_fg')));
};

const CleanChevronDownIcon = React.forwardRef<SVGSVGElement, React.ComponentProps<typeof ChevronDownIcon>>((props, ref) => {
  return <ChevronDownIcon ref={ref} {...filterFigmaProps(props)} />;
});
CleanChevronDownIcon.displayName = "CleanChevronDownIcon";

const CleanChevronUpIcon = React.forwardRef<SVGSVGElement, React.ComponentProps<typeof ChevronUpIcon>>((props, ref) => {
  return <ChevronUpIcon ref={ref} {...filterFigmaProps(props)} />;
});
CleanChevronUpIcon.displayName = "CleanChevronUpIcon";

const CleanCheckIcon = React.forwardRef<SVGSVGElement, React.ComponentProps<typeof CheckIcon>>((props, ref) => {
  return <CheckIcon ref={ref} {...filterFigmaProps(props)} />;
});
CleanCheckIcon.displayName = "CleanCheckIcon";

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...filterFigmaProps(props)} />;
}
function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}
function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({ className, size = "default", children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger> & { size?: "sm" | "default" }) {
  const cleanProps = filterFigmaProps(props);
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap outline-none transition-[color,box-shadow]",
        "bg-white dark:bg-[#1a1a2e] text-[#242545] dark:text-white",
        "border-[#e5e7eb] dark:border-[#3a3a5e]",
        "focus-visible:ring-[3px] focus-visible:border-[#834a8b] focus-visible:ring-[#834a8b]/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[placeholder]:text-[#9b9ba8] dark:data-[placeholder]:text-[#7C7EAA]",
        "data-[size=default]:h-9 data-[size=sm]:h-8",
        "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg]:text-[#9b9ba8] dark:[&_svg]:text-[#7C7EAA]",
        className,
      )}
      {...cleanProps}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <CleanChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({ className, children, position = "popper", ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          "bg-white dark:bg-[#1a1a2e] text-[#242545] dark:text-white",
          "border-[#e5e7eb] dark:border-[#3a3a5e]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport className={cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1")}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return <SelectPrimitive.Label data-slot="select-label" className={cn("px-2 py-1.5 text-xs font-medium text-[#6b6b7b] dark:text-[#9b9ba8]", className)} {...props} />;
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none",
        "focus:bg-[#f5f5f7] dark:focus:bg-[#2d2d51] focus:text-[#242545] dark:focus:text-white",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CleanCheckIcon className="size-4 text-[#834a8b] dark:text-[#9D4B97]" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator data-slot="select-separator" className={cn("-mx-1 my-1 h-px bg-[#e5e7eb] dark:bg-[#3a3a5e] pointer-events-none", className)} {...props} />;
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return <SelectPrimitive.ScrollUpButton data-slot="select-scroll-up-button" className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}><CleanChevronUpIcon className="size-4" /></SelectPrimitive.ScrollUpButton>;
}

function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return <SelectPrimitive.ScrollDownButton data-slot="select-scroll-down-button" className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}><CleanChevronDownIcon className="size-4" /></SelectPrimitive.ScrollDownButton>;
}

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue };
