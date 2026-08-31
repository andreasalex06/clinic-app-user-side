import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

type BadgeTone = "default" | "green" | "amber" | "rose" | "slate";

const toneClass: Record<BadgeTone, string> = {
  default: "bg-teal-50 text-teal-700 ring-teal-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200"
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn("inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ring-1", toneClass[tone], className)}
      {...props}
    />
  )
);

Badge.displayName = "Badge";
