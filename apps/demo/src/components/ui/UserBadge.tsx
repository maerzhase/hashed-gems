"use client";

import clsx from "clsx";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { HashedGem } from "@m3000/hashed-gems";

interface UserBadgeProps
  extends Omit<ComponentPropsWithoutRef<typeof Link>, "href"> {
  user: string;
}

export function UserBadge({ user, className, ...props }: UserBadgeProps) {
  return (
    <Link
      {...props}
      href={`/gem/${encodeURIComponent(user)}`}
      className={clsx(
        "group flex items-center gap-2 rounded-full border border-neutral-200/80 bg-neutral-50 px-3 py-1.5 transition-all duration-200 hover:border-neutral-300 hover:shadow-[0_2px_8px_0_rgb(0_0_0/0.08)] dark:border-neutral-700/60 dark:bg-neutral-900/80 dark:hover:border-neutral-600 dark:hover:bg-neutral-800/80 dark:hover:shadow-[0_2px_12px_0_rgb(0_0_0/0.4)]",
        className,
      )}
    >
      <Avatar>
        <AvatarFallback>
          <HashedGem seed={user} size={24} aria-hidden={true} />
        </AvatarFallback>
      </Avatar>
      <span className="text-xs text-neutral-600 transition-colors group-hover:text-neutral-800 dark:text-neutral-400 dark:group-hover:text-neutral-200">
        @{user}
      </span>
    </Link>
  );
}
