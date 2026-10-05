import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { AuthProvider } from "@/components/providers/session-provider";
import { rootMetadata } from "@/lib/seo";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${notoSansKr.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider>
          <AuthProvider>
            <LocaleProvider>{children}</LocaleProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
