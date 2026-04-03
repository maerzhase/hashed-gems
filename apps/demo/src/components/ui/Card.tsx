"use client";

import clsx from "clsx";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
}

interface CardSectionProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={clsx(
        "overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
  ...props
}: CardSectionProps) {
  return (
    <div
      {...props}
      className={clsx(
        "border-b border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: CardSectionProps) {
  return (
    <div {...props} className={clsx("relative overflow-hidden p-4", className)}>
      {children}
    </div>
  );
}
