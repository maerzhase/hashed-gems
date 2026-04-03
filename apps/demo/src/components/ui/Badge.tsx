"use client";

import type { Rarity } from "@m3000/hashed-gems";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { RARITY_BADGE } from "@/lib/gemStyles";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs capitalize",
  {
    variants: {
      variant: {
        neutral:
          "border-neutral-200/80 bg-neutral-50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-500",
        subtle:
          "border-neutral-200/80 bg-neutral-50 font-medium text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-400",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

interface BadgeProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children">,
    VariantProps<typeof badgeVariants> {
  children: ReactNode;
}

interface RarityBadgeProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  rarity: Rarity;
  children?: ReactNode;
}

export function Badge({
  children,
  className,
  variant,
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={clsx(badgeVariants({ variant }), className)}
    >
      {children}
    </span>
  );
}

export function RarityBadge({
  rarity,
  children,
  className,
  ...props
}: RarityBadgeProps) {
  return (
    <span
      {...props}
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize",
        RARITY_BADGE[rarity],
        className,
      )}
    >
      {children ?? rarity}
    </span>
  );
}
