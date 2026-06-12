"use client";

import { ThemeContextProvider } from "@/components/theme-config";
import { ReactNode } from "react";

export function ThemeWrapper({ children }: { children: ReactNode }) {
  return <ThemeContextProvider>{children}</ThemeContextProvider>;
}