import type { ReactNode } from "react";

type FormCardProps = {
  children: ReactNode;
};

export function FormCard({ children }: FormCardProps) {
  return <div className="form-card">{children}</div>;
}
