import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../lib/utils";

type ContentMotionProps = {
  children: ReactNode;
  className?: string;
};

export function ContentMotion({ children, className }: ContentMotionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("min-w-0", className)}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
