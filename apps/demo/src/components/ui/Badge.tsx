"use client";

import type { Rarity } from "@m3000/hashed-gems";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { RARITY_BADGE } from "@/lib/gemStyles";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs capitalize",
  {
    variants: {
      variant: {
        neutral:
          "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500",
        subtle:
          "bg-neutral-100 font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
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
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize",
        RARITY_BADGE[rarity],
        className,
      )}
    >
      {children ?? rarity}
    </span>
  );
}
