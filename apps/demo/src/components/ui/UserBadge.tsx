"use client";

import clsx from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { HashedGem } from "@m3000/hashed-gems";

interface UserBadgeProps extends ComponentPropsWithoutRef<"div"> {
  user: string;
}

export function UserBadge({ user, className, ...props }: UserBadgeProps) {
  return (
    <div
      {...props}
      className={clsx(
        "flex items-center gap-2 rounded-full border border-neutral-200/80 bg-neutral-50 px-3 py-1.5 dark:border-neutral-800 dark:bg-neutral-900/70",
        className,
      )}
    >
      <Avatar>
        <AvatarFallback>
          <HashedGem seed={user} size={24} />
        </AvatarFallback>
      </Avatar>
      <span className="text-xs text-neutral-600 dark:text-neutral-400">
        @{user}
      </span>
    </div>
  );
}
