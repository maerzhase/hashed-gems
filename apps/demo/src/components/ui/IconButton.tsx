"use client";

import clsx from "clsx";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface IconButtonProps extends Omit<ComponentPropsWithoutRef<typeof Button>, "children"> {
  children: ReactNode;
}

export function IconButton({
  children,
  className,
  ...props
}: IconButtonProps) {
  return (
    <Button
      {...props}
      variant="icon"
      className={clsx(className)}
    >
      {children}
    </Button>
  );
}
