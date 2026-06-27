import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-zinc-100 text-zinc-800",
        available: "bg-emerald-100 text-emerald-800",
        rented: "bg-amber-100 text-amber-800",
        maintenance: "bg-zinc-200 text-zinc-700",
        requested: "bg-violet-100 text-violet-800",
        scheduled: "bg-blue-100 text-blue-800",
        active: "bg-amber-100 text-amber-800",
        returned: "bg-emerald-100 text-emerald-800",
        overdue: "bg-red-100 text-red-800",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <div className={cn(badgeVariants({ variant }), className)} {...props} />
);
