import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Highlight({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("bg-brand text-black px-2 py-0.5 inline-block leading-none", className)}>
      {children}
    </span>
  );
}
