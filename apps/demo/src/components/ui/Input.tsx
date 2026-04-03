"use client";

import { Input as BaseInput } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import type { ComponentPropsWithoutRef } from "react";

const inputVariants = cva(
  "w-full bg-transparent font-mono text-sm text-neutral-800 placeholder:text-neutral-400 outline-none dark:text-neutral-200 dark:placeholder:text-neutral-600",
  {
    variants: {
      variant: {
        default: "px-4 py-3 focus:bg-neutral-100/60 dark:focus:bg-neutral-800/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BaseInputProps = ComponentPropsWithoutRef<typeof BaseInput>;

interface InputProps
  extends Omit<BaseInputProps, "className">,
    VariantProps<typeof inputVariants> {
  className?: string;
}

export function Input({ className, variant, ...props }: InputProps) {
  return (
    <BaseInput
      {...props}
      className={clsx(inputVariants({ variant }), className)}
    />
  );
}
