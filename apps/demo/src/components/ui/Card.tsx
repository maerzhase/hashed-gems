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
        "overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.08),0_1px_2px_-1px_rgb(0_0_0/0.06)] dark:border-neutral-700/60 dark:bg-neutral-900 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_4px_20px_0_rgb(0_0_0/0.6)]",
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
        "border-b border-neutral-200 bg-neutral-50/80 px-4 py-3.5 dark:border-neutral-700/50 dark:bg-neutral-800/60",
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
    <div
      {...props}
      className={clsx("relative overflow-hidden p-4.5", className)}
    >
      {children}
    </div>
  );
}
