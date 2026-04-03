"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import clsx from "clsx";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type TabsRootProps = ComponentPropsWithoutRef<typeof BaseTabs.Root>;
type TabsListProps = ComponentPropsWithoutRef<typeof BaseTabs.List>;
type TabsTabProps = ComponentPropsWithoutRef<typeof BaseTabs.Tab>;
type TabsIndicatorProps = ComponentPropsWithoutRef<typeof BaseTabs.Indicator>;

export function Tabs(props: TabsRootProps) {
  return <BaseTabs.Root {...props} />;
}

interface TabsListWithIndicatorProps extends TabsListProps {
  children: ReactNode;
  indicatorClassName?: string;
}

export function TabsList({
  children,
  className,
  indicatorClassName,
  ...props
}: TabsListWithIndicatorProps) {
  return (
    <BaseTabs.List
      {...props}
      className={clsx(
        "relative flex rounded-t-xl border-b border-neutral-200 bg-neutral-50/70 p-1 dark:border-neutral-700/50 dark:bg-neutral-800/50",
        className,
      )}
    >
      <BaseTabs.Indicator
        className={clsx(
          "absolute top-1 bottom-1 z-0 rounded-lg bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.08)] transition-[left,width,top,height] duration-300 ease-out dark:bg-neutral-700 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_1px_4px_0_rgb(0_0_0/0.4)]",
          "left-[var(--active-tab-left)] w-[var(--active-tab-width)]",
          indicatorClassName,
        )}
      />
      {children}
    </BaseTabs.List>
  );
}

export function TabsTab({ className, ...props }: TabsTabProps) {
  return (
    <BaseTabs.Tab
      {...props}
      className={(state) =>
        clsx(
          "relative z-10 flex-1 cursor-pointer rounded-md px-4 py-2.5 font-mono text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black/60 dark:focus-visible:ring-white/60",
          state.active
            ? "text-neutral-900 dark:text-white"
            : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100",
          className,
        )
      }
    />
  );
}

export function TabsIndicator(props: TabsIndicatorProps) {
  return <BaseTabs.Indicator {...props} />;
}
