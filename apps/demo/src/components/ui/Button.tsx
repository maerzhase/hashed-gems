"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center transition-colors focus-visible:outline-none disabled:cursor-wait disabled:opacity-60",
  {
    variants: {
      variant: {
        default:
          "rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-800 shadow-[0_1px_3px_0_rgb(0_0_0/0.08)] hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 focus-visible:ring-black/60 dark:border-neutral-700/70 dark:bg-neutral-800/80 dark:text-neutral-200 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.07),0_2px_8px_0_rgb(0_0_0/0.5)] dark:hover:bg-neutral-700/80 dark:focus-visible:ring-offset-neutral-950 dark:focus-visible:ring-white/60",
        icon: "h-10 w-10 rounded-full border border-neutral-200 bg-white p-0 text-neutral-600 shadow-[0_1px_3px_0_rgb(0_0_0/0.08)] hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 focus-visible:ring-black/60 dark:border-neutral-700/70 dark:bg-neutral-800/80 dark:backdrop-blur-sm dark:text-neutral-400 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.07),0_2px_8px_0_rgb(0_0_0/0.5)] dark:hover:bg-neutral-700/80 dark:focus-visible:ring-offset-neutral-950 dark:focus-visible:ring-white/60",
        subtle:
          "rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black/50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:focus-visible:ring-white/40",
        ghost:
          "rounded-b-xl gap-3 px-4 py-3.5 text-left hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black/60 dark:hover:bg-neutral-800/70 dark:focus-visible:ring-white/60",
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
