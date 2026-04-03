"use client";

import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import clsx from "clsx";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type AvatarRootProps = ComponentPropsWithoutRef<typeof BaseAvatar.Root>;
type AvatarFallbackProps = ComponentPropsWithoutRef<typeof BaseAvatar.Fallback>;

interface AvatarProps extends AvatarRootProps {
  children: ReactNode;
}

interface AvatarFallbackPropsWithChildren extends AvatarFallbackProps {
  children: ReactNode;
}

export function Avatar({ children, className, ...props }: AvatarProps) {
  return (
    <BaseAvatar.Root
      {...props}
      className={clsx("inline-flex shrink-0 overflow-hidden rounded-full", className)}
    >
      {children}
    </BaseAvatar.Root>
  );
}

export function AvatarFallback({
  children,
  className,
  ...props
}: AvatarFallbackPropsWithChildren) {
  return (
    <BaseAvatar.Fallback
      {...props}
      className={clsx("flex h-full w-full items-center justify-center", className)}
    >
      {children}
    </BaseAvatar.Fallback>
  );
}
