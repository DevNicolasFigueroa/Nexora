import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

/** Content container over the surface token. */
export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-xl border border-line bg-surface p-6 ${className}`}>
      {children}
    </div>
  );
}
