"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

/**
 * next-themes injects a blocking <script> to prevent theme flash.
 * React 19 warns about script tags inside client components on hydration.
 * SSR still emits an executable script; on the client we use application/json
 * so React skips execution (theme is already applied from the HTML).
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const scriptProps =
    typeof window === "undefined"
      ? undefined
      : ({ type: "application/json" } as const);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      scriptProps={scriptProps}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
