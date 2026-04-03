"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center transition-colors disabled:cursor-wait disabled:opacity-60",
  {
    variants: {
      variant: {
        default:
          "rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-800 shadow-sm hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800",
        icon:
          "h-10 w-10 rounded-full border border-neutral-200 bg-white p-0 text-neutral-600 shadow-sm hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800",
        subtle:
          "rounded bg-neutral-200 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600",
        ghost:
          "gap-3 px-4 py-3.5 text-left hover:bg-neutral-200 dark:hover:bg-neutral-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BaseButtonProps = ComponentPropsWithoutRef<typeof BaseButton>;

interface ButtonProps
  extends Omit<BaseButtonProps, "className">,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  className?: string;
}

export function Button({
  children,
  className,
  variant,
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      {...props}
      className={clsx(buttonVariants({ variant }), className)}
    >
      {children}
    </BaseButton>
  );
}
