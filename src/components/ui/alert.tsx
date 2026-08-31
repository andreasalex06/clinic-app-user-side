import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

type AlertTone = "error" | "info";

const toneClass: Record<AlertTone, string> = {
  error: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-slate-200 bg-slate-50 text-slate-700"
};

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  tone?: AlertTone;
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, tone = "info", ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-md border px-3 py-2 text-sm leading-6", toneClass[tone], className)}
      role={tone === "error" ? "alert" : "status"}
      {...props}
    />
  )
);

Alert.displayName = "Alert";
