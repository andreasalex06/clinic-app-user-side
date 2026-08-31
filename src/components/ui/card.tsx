import {
  type HTMLAttributes,
  forwardRef,
} from "react";

import { cn } from "../../lib/utils";

export const Card = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-slate-200 bg-white shadow-sm",
      className
    )}
    {...props}
  />
));

Card.displayName = "Card";

export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "space-y-1.5 p-4 sm:p-5",
      className
    )}
    {...props}
  />
));

CardHeader.displayName = "CardHeader";

export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "p-4 sm:p-5",
      className
    )}
    {...props}
  />
));

CardContent.displayName = "CardContent";
