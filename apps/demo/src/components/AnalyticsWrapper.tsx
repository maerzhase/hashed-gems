"use client";

import { useEffect } from "react";

export function AnalyticsWrapper() {
  useEffect(() => {
    import("@vercel/analytics/next").then(({ Analytics }) => {
      Analytics({ mode: "auto" });
    });
  }, []);

  return null;
}
