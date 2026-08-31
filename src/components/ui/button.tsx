import { type ButtonHTMLAttributes, forwardRef } from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex min-w-0 items-center justify-center gap-2 rounded-md text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-slate-950 text-white shadow-sm hover:bg-slate-800",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        outline: "border border-slate-200 bg-white text-slate-950 hover:bg-slate-100",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
        destructive: "bg-rose-600 text-white hover:bg-rose-700"
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3",
        icon: "size-10 p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);

Button.displayName = "Button";
